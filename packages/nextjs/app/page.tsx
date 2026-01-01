"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type Variants, animate, easeOut, motion } from "framer-motion";
import type { NextPage } from "next";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import toast, { Toaster } from "react-hot-toast";
import "katex/dist/katex.min.css";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters } from "viem";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { BACKEND_URL, getJson, postJson } from "../utils/api";
import { encodeGitcoinProof, encodePohProof, encodeBrightIdProof } from "../utils/encode";
import { BRIGHTID_ADAPTER_ADDRESS, GITCOIN_ADAPTER_ADDRESS, POH_ADAPTER_ADDRESS, VERIFY_AND_REGISTER_ABI } from "../utils/contracts";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { useVerificationStatus } from "~~/hooks/scaffold-eth";

// Types
type U256x8 = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
};

type DemoData = {
  userId?: `0x${string}`;
  pohId?: `0x${string}`;
  contextId?: `0x${string}`;
  score?: number;
  timestamp: number;
  signature: `0x${string}`;
  expiresAt?: number;
  backendAddress?: `0x${string}`;
};

type DemoResponse = {
  success: boolean;
  demo?: boolean;
  data: DemoData;
};

// Animation Variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// Components
function AnimatedCounter({ to, prefix = "", suffix = "", decimals = 0, duration = 1.6 }: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const start = React.useRef<number>(0);
  React.useEffect(() => {
    const controls = animate(start.current, to, {
      duration,
      ease: easeOut,
      onUpdate: v => {
        if (ref.current) ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration]);
  return <span ref={ref} />;
}

// Env constants
const WORLDCOIN_ADAPTER_ADDRESS = (process.env.NEXT_PUBLIC_WC_ADAPTER || "") as `0x${string}`;
const WORLDCOIN_APP_ID = (process.env.NEXT_PUBLIC_WC_APP_ID || "") as any;
const WORLDCOIN_ACTION = process.env.NEXT_PUBLIC_WC_ACTION || "verify-human";
const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532) as any;
const EXPLORER_TX = process.env.NEXT_PUBLIC_EXPLORER_TX || "https://sepolia.basescan.org/tx/";

const Home: NextPage = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { count: verificationCount } = useVerificationStatus();
  
  // States
  const [loadingWorld, setLoadingWorld] = React.useState(false);
  const [loadingGitcoin, setLoadingGitcoin] = React.useState(false);
  const [loadingPoh, setLoadingPoh] = React.useState(false);
  const [loadingBrightid, setLoadingBrightid] = React.useState(false);
  
  const [gitcoinVerified, setGitcoinVerified] = React.useState(false);
  const [pohVerified, setPohVerified] = React.useState(false);
  const [brightidVerified, setBrightidVerified] = React.useState(false);
  
  const worldcoinOpenRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    getJson(`${BACKEND_URL}/health`).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setGitcoinVerified(window.localStorage.getItem("gitcoin_verified") === "true");
      setPohVerified(window.localStorage.getItem("poh_verified") === "true");
      setBrightidVerified(window.localStorage.getItem("brightid_verified") === "true");
    }
  }, []);

  const ensureReady = React.useCallback(async () => {
    if (!isConnected || !address) {
      openConnectModal?.();
      throw new Error("wallet_not_connected");
    }
    if (chainId !== TARGET_CHAIN_ID) {
      await switchChainAsync?.({ chainId: TARGET_CHAIN_ID });
    }
    return address as `0x${string}`;
  }, [isConnected, address, chainId, switchChainAsync, openConnectModal]);

  const onConnectClick = () => {
    if (!isConnected) openConnectModal?.();
  };

  const verifySource = async (source: "gitcoin" | "poh" | "brightid") => {
    const addr = await ensureReady();
    const res = await postJson<DemoResponse>(`${BACKEND_URL}/api/demo/verify`, { userAddress: addr, source });
    if (!res.success) throw new Error("verification_failed");
    return res.data;
  };

  // Worldcoin Logic
  const writeWorldcoinOnChain = async (user: `0x${string}`, result: ISuccessResult) => {
    if (!WORLDCOIN_ADAPTER_ADDRESS) throw new Error("missing_worldcoin_adapter");
    const [decoded] = decodeAbiParameters([{ type: "uint256[8]" }], result.proof as `0x${string}`) as unknown as [readonly bigint[]];
    if (decoded.length !== 8) throw new Error("invalid_wc_proof");
    const proof8 = decoded as U256x8;
    const proofPacked = encodeAbiParameters(parseAbiParameters("uint256, uint256, uint256[8]"), [BigInt(result.merkle_root), BigInt(result.nullifier_hash), proof8]);
    return await writeContract(wagmiConfig, {
      abi: VERIFY_AND_REGISTER_ABI,
      address: WORLDCOIN_ADAPTER_ADDRESS,
      functionName: "verifyAndRegister",
      args: [user, proofPacked as `0x${string}`],
      chainId: TARGET_CHAIN_ID,
    });
  };

  const onWorldcoinSuccess = async (result: ISuccessResult) => {
    setLoadingWorld(true);
    const t = toast.loading("Verifying with World ID…");
    try {
      const user = await ensureReady();
      const hash = await writeWorldcoinOnChain(user, result);
      toast.dismiss(t);
      const t2 = toast.loading("Waiting for confirmation…");
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: TARGET_CHAIN_ID });
      toast.dismiss(t2);
      if (receipt.status === "reverted") throw new Error("Transaction reverted");
      toast.success(`✅ World ID verified`);
      toast.success(`Tx: ${hash.slice(0, 10)}…`, { icon: "🔗" });
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      toast.dismiss();
      toast.error(e?.shortMessage || e?.message || "World ID verification failed");
    } finally {
      setLoadingWorld(false);
    }
  };

  const handleWorldcoinClick = React.useCallback(() => {
    worldcoinOpenRef.current?.();
  }, []);

  // Generic verify handler
  const handleVerify = async (
    source: "gitcoin" | "poh" | "brightid",
    loadingSetter: (v: boolean) => void,
    verifiedSetter: (v: boolean) => void,
    verifiedState: boolean,
    encoder: any,
    adapterAddress: `0x${string}`,
    storageKey: string,
    label: string
  ) => {
    if (verifiedState) return;
    loadingSetter(true);
    const t = toast.loading(`Fetching ${label} proof…`);
    try {
      const user = await ensureReady();
      const data = await verifySource(source);
      toast.dismiss(t);
      const t2 = toast.loading("Submitting transaction…");
      
      const proofArgs = {
        timestamp: data.timestamp,
        signature: data.signature,
        userId: data.userId || "0x0000000000000000000000000000000000000000000000000000000000000000",
        pohId: data.pohId || data.userId || "0x0000000000000000000000000000000000000000000000000000000000000000",
        contextId: data.contextId || data.userId || "0x0000000000000000000000000000000000000000000000000000000000000000",
        score: data.score ?? 0,
      };

      const proof = encoder(proofArgs);
      
      const hash = await writeContract(wagmiConfig, {
        abi: VERIFY_AND_REGISTER_ABI,
        address: adapterAddress,
        functionName: "verifyAndRegister",
        args: [user, proof],
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t2);
      const t3 = toast.loading("Waiting for confirmation…");
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: TARGET_CHAIN_ID });
      toast.dismiss(t3);
      
      if (receipt.status === "reverted") throw new Error("Transaction reverted");
      
      if (typeof window !== "undefined") window.localStorage.setItem(storageKey, "true");
      verifiedSetter(true);
      
      toast.success(`✅ ${label} verified!`);
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      toast.dismiss();
      toast.error(e?.shortMessage || e?.message || `${label} verification failed`);
    } finally {
      loadingSetter(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050816] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30">
      <Toaster position="bottom-right" />
      
      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Background FX */}
        <div className="absolute inset-0 z-0">
          <video className="w-full h-full object-cover opacity-30 mix-blend-screen" autoPlay muted playsInline loop>
            <source src="/sparks-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050816]/30 via-[#050816]/80 to-[#050816]" />
        </div>

        {/* Orb Animation */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
        />

        <div className="container mx-auto px-4 z-10 relative text-center">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl mx-auto flex flex-col items-center">
            
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase">Stripe for Web3 Identity</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-200 to-indigo-400">
                NotABot
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              One API. Every Proof-of-Humanity source. <br/>
              <span className="text-indigo-400">Aggregating Worldcoin, Gitcoin, PoH & BrightID.</span>
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <Link href="/docs" className="w-full sm:w-auto">
                <button className="btn btn-primary btn-lg rounded-2xl w-full sm:w-auto px-8 shadow-indigo-500/20 shadow-lg border-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white">
                  Read the Docs
                </button>
              </Link>
              <button 
                onClick={onConnectClick} 
                className="btn btn-outline btn-lg rounded-2xl w-full sm:w-auto px-8 border-slate-700 hover:bg-slate-800 text-slate-200 hover:border-slate-600 backdrop-blur-sm"
              >
                {isConnected ? "Connected" : "Connect Wallet"}
              </button>
            </motion.div>

            {/* Providers Row */}
            <motion.div variants={fadeUp} className="mt-16 pt-8 border-t border-slate-800/50 w-full max-w-3xl">
              <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-6">Supported Providers</p>
              <div className="flex flex-wrap justify-center gap-3 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {["Worldcoin", "Gitcoin Passport", "Proof of Humanity", "BrightID"].map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* VERIFICATION GRID */}
      <section className="py-24 relative" id="verify">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
              Verification Hub
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Prove your humanity once, use it everywhere. <br/>Each verification increases your trust score.
            </p>
            {address && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
                 <span className="text-slate-400 text-sm">Status:</span>
                 <span className="text-indigo-400 font-bold">{verificationCount}/4 Verified</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Worldcoin Card */}
            <div className="group relative bg-[#0c1022] hover:bg-[#11152a] border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-900/10">
              <div className="absolute top-6 right-6 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">👁️</div>
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 ring-1 ring-slate-800 group-hover:ring-indigo-500/50 transition-all">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white"><circle cx="12" cy="12" r="10" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Worldcoin</h3>
              <p className="text-sm text-slate-400 mb-6 h-10">Biometric iris scan with zero-knowledge proof privacy.</p>
              <IDKitWidget app_id={WORLDCOIN_APP_ID} action={WORLDCOIN_ACTION} onSuccess={onWorldcoinSuccess}>
                {({ open }) => {
                  worldcoinOpenRef.current = open;
                  return (
                    <button 
                      onClick={handleWorldcoinClick}
                      disabled={loadingWorld}
                      className="btn w-full bg-white hover:bg-slate-200 text-black border-0 rounded-xl font-bold"
                    >
                      {loadingWorld ? 'Verifying...' : 'Verify ID'}
                    </button>
                  );
                }}
              </IDKitWidget>
            </div>

            {/* Gitcoin Card */}
            <div className="group relative bg-[#0c1022] hover:bg-[#11152a] border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/10">
              <div className="absolute top-6 right-6 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">🎫</div>
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 ring-1 ring-slate-800 group-hover:ring-emerald-500/50 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-400"><path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/><path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" opacity="0.6"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gitcoin</h3>
              <p className="text-sm text-slate-400 mb-6 h-10">Aggregation of web2/web3 credentials for a trust score.</p>
              <button
                onClick={() => handleVerify("gitcoin", setLoadingGitcoin, setGitcoinVerified, gitcoinVerified, encodeGitcoinProof, GITCOIN_ADAPTER_ADDRESS, "gitcoin_verified", "Gitcoin")}
                disabled={gitcoinVerified || loadingGitcoin}
                className={`btn w-full rounded-xl font-bold border-0 ${gitcoinVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500 hover:bg-emerald-600 text-black"}`}
              >
                {gitcoinVerified ? 'Verified ✓' : loadingGitcoin ? 'Processing...' : 'Verify Passport'}
              </button>
            </div>

            {/* PoH Card */}
            <div className="group relative bg-[#0c1022] hover:bg-[#11152a] border border-slate-800 hover:border-pink-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-900/10">
              <div className="absolute top-6 right-6 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">📹</div>
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 ring-1 ring-slate-800 group-hover:ring-pink-500/50 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-pink-400"><path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2Z" fill="currentColor"/><path d="M16 8H8L6 22H9L10 15L12 17L14 15L15 22H18L16 8Z" fill="currentColor"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Proof of Humanity</h3>
              <p className="text-sm text-slate-400 mb-6 h-10">Video submission with community vouching system.</p>
              <button
                onClick={() => handleVerify("poh", setLoadingPoh, setPohVerified, pohVerified, encodePohProof, POH_ADAPTER_ADDRESS, "poh_verified", "PoH")}
                disabled={pohVerified || loadingPoh}
                className={`btn w-full rounded-xl font-bold border-0 ${pohVerified ? "bg-pink-500/20 text-pink-400" : "bg-pink-500 hover:bg-pink-600 text-white"}`}
              >
                {pohVerified ? 'Verified ✓' : loadingPoh ? 'Processing...' : 'Verify Video'}
              </button>
            </div>

            {/* BrightID Card */}
            <div className="group relative bg-[#0c1022] hover:bg-[#11152a] border border-slate-800 hover:border-orange-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-900/10">
              <div className="absolute top-6 right-6 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">🕸️</div>
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 ring-1 ring-slate-800 group-hover:ring-orange-500/50 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-400"><circle cx="12" cy="7" r="3" fill="currentColor"/><circle cx="18" cy="14" r="2.5" fill="currentColor" opacity="0.7"/><circle cx="6" cy="14" r="2.5" fill="currentColor" opacity="0.7"/><circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.5"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">BrightID</h3>
              <p className="text-sm text-slate-400 mb-6 h-10">Social graph analysis to detect unique humans.</p>
              <button
                onClick={() => handleVerify("brightid", setLoadingBrightid, setBrightidVerified, brightidVerified, encodeBrightIdProof, BRIGHTID_ADAPTER_ADDRESS, "brightid_verified", "BrightID")}
                disabled={brightidVerified || loadingBrightid}
                className={`btn w-full rounded-xl font-bold border-0 ${brightidVerified ? "bg-orange-500/20 text-orange-400" : "bg-orange-500 hover:bg-orange-600 text-white"}`}
              >
                {brightidVerified ? 'Verified ✓' : loadingBrightid ? 'Processing...' : 'Verify Graph'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 border-y border-slate-800/50 bg-[#080b1a]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#0c1022] border border-slate-800/50">
              <h2 className="text-3xl font-bold mb-4">The Bot Problem</h2>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  <span><strong className="text-white">$1B+</strong> stolen by Sybils annually</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  <span><strong className="text-white">60–90%</strong> of airdrop claims are bots</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✕</span>
                  <span>Fragmented verification systems</span>
                </li>
              </ul>
            </div>
            
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0c1022] rounded-3xl p-6 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                <div className="text-4xl md:text-5xl font-black text-indigo-400 mb-2">
                   <AnimatedCounter to={1} prefix="$" suffix="B+" />
                </div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Value Lost</div>
              </div>
              <div className="bg-[#0c1022] rounded-3xl p-6 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                <div className="text-4xl md:text-5xl font-black text-violet-400 mb-2">
                   60<span className="text-2xl">–</span><AnimatedCounter to={90} suffix="%" />
                </div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Bot Activity</div>
              </div>
              <div className="bg-[#0c1022] rounded-3xl p-6 border border-slate-800/50 flex flex-col justify-center items-center text-center">
                <div className="text-4xl md:text-5xl font-black text-cyan-400 mb-2">
                   <AnimatedCounter to={1} suffix="" />
                </div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Unified API</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24" id="how-it-works">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="md:w-1/3 sticky top-24">
              <h2 className="text-4xl font-bold mb-6">How It Works</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                We aggregate proofs from multiple providers into a single on-chain registry. Apps query one simple API to check if a user is human.
              </p>
              <Link href="/docs" className="btn btn-outline rounded-full px-6">Learn more →</Link>
            </div>
            
            <div className="md:w-2/3 space-y-8">
              {[
                { num: "01", title: "Verify", desc: "User connects wallet and verifies with any supported provider (Worldcoin, Gitcoin, etc)." },
                { num: "02", title: "Aggregate", desc: "NotABot normalizes the proof and assigns a confidence score." },
                { num: "03", title: "Cache", desc: "Status is cached on-chain in the HumanityOracle contract." },
                { num: "04", title: "Integrate", desc: "Dapps verify user humanity with a single contract call." }
              ].map((step) => (
                <div key={step.num} className="flex gap-6 p-6 rounded-3xl bg-[#0c1022] border border-slate-800 hover:border-indigo-500/30 transition-colors">
                  <div className="text-4xl font-black text-slate-800">{step.num}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RECOGNITION */}
      <section className="py-16 text-center border-t border-slate-800/30">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">Recognized By</p>
        <Link href="https://ethbishkek.xyz" target="_blank" className="inline-block group">
           <div className="bg-[#1a1528] border border-amber-500/20 rounded-2xl p-6 flex items-center gap-6 hover:border-amber-500/50 transition-all">
              <Image src="/eth-bishkek-logo.png" alt="ETH Bishkek" width={60} height={60} className="rounded-full bg-black/50" />
              <div className="text-left">
                <div className="text-amber-400 font-bold uppercase text-xs tracking-wider mb-1">Winner</div>
                <div className="text-white font-bold text-lg">ETH Bishkek 2025</div>
                <div className="text-slate-500 text-sm">Kyrgyzstan • October 2025</div>
              </div>
           </div>
        </Link>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-8">Ready to build?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Stop fighting bots alone. Integrate NotABot in minutes and secure your protocol.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/docs">
                <button className="btn btn-primary btn-lg rounded-full px-10 shadow-xl shadow-indigo-600/20">Read Docs</button>
             </Link>
             <Link href="https://t.me/notabot" target="_blank">
                <button className="btn btn-ghost btn-lg rounded-full px-10">Contact Sales</button>
             </Link>
          </div>
        </div>
      </section>

    </main>
  );
};

export default Home;
