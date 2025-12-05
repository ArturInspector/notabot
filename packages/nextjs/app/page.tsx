"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Button, Card, Col, Row, Tag } from "antd";
import { type Variants, animate, easeOut, motion } from "framer-motion";
import type { NextPage } from "next";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import toast, { Toaster } from "react-hot-toast";
import { BACKEND_URL, getJson, postJson } from "../utils/api";
import { encodeGitcoinProof, encodePohProof, encodeBrightIdProof } from "../utils/encode";
import { BRIGHTID_ADAPTER_ADDRESS, GITCOIN_ADAPTER_ADDRESS, POH_ADAPTER_ADDRESS, VERIFY_AND_REGISTER_ABI } from "../utils/contracts";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { Rocket } from "~~/src/assets/images";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters } from "viem";
import { useVerificationStatus } from "~~/hooks/scaffold-eth";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

type U256x8 = readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

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
  return <span ref={ref} className={styles.counter} />;
}

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
    // Always use demo endpoint for testing
    const res = await postJson<DemoResponse>(`${BACKEND_URL}/api/demo/verify`, { userAddress: addr, source });
    if (!res.success) throw new Error("verification_failed");
    return res.data;
  };

  const writeWorldcoinOnChain = async (user: `0x${string}`, result: ISuccessResult) => {
    if (!WORLDCOIN_ADAPTER_ADDRESS) throw new Error("missing_worldcoin_adapter");
    const [decoded] = decodeAbiParameters([{ type: "uint256[8]" }], result.proof as `0x${string}`) as unknown as [readonly bigint[]];
    if (decoded.length !== 8) throw new Error("invalid_wc_proof");
    const proof8 = decoded as U256x8;
    const proofPacked = encodeAbiParameters(parseAbiParameters("uint256, uint256, uint256[8]"), [BigInt(result.merkle_root), BigInt(result.nullifier_hash), proof8]);
    const hash = await writeContract(wagmiConfig, {
      abi: VERIFY_AND_REGISTER_ABI,
      address: WORLDCOIN_ADAPTER_ADDRESS,
      functionName: "verifyAndRegister",
      args: [user, proofPacked as `0x${string}`],
      chainId: TARGET_CHAIN_ID,
    });
    return hash;
  };

  const handleVerifyGitcoin = async () => {
    if (gitcoinVerified) return;
    setLoadingGitcoin(true);
    const t = toast.loading("Fetching Gitcoin proof…");
    try {
      const user = await ensureReady();
      const data = await verifySource("gitcoin");
      
      toast.dismiss(t);
      const t2 = toast.loading("Submitting transaction…");
      
      const proof = encodeGitcoinProof({
        userId: (data.userId || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
        score: data.score ?? 0,
        timestamp: data.timestamp,
        signature: data.signature,
      });
      
      const hash = await writeContract(wagmiConfig, {
        abi: VERIFY_AND_REGISTER_ABI,
        address: GITCOIN_ADAPTER_ADDRESS,
        functionName: "verifyAndRegister",
        args: [user, proof],
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t2);
      const t3 = toast.loading("Waiting for confirmation…");
  
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t3);
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }
      
      if (typeof window !== "undefined") window.localStorage.setItem("gitcoin_verified", "true");
      setGitcoinVerified(true);
      
      toast.success("✅ Gitcoin verified!");
      toast.success(`Tx: ${hash.slice(0, 10)}…`, { icon: "🔗" });
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      // Убираем все активные тосты при ошибке
      toast.dismiss();
      const msg = e?.shortMessage || e?.message || "Gitcoin verification failed";
      toast.error(msg);
    } finally {
      setLoadingGitcoin(false);
    }
  };

  const handleVerifyPoh = async () => {
    if (pohVerified) return;
    setLoadingPoh(true);
    const t = toast.loading("Fetching PoH proof…");
    try {
      const user = await ensureReady();
      const data = await verifySource("poh");
      
      toast.dismiss(t);
      const t2 = toast.loading("Submitting transaction…");
      
      const proof = encodePohProof({
        pohId: ((data.pohId || data.userId) || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
        timestamp: data.timestamp,
        signature: data.signature,
      });
      
      const hash = await writeContract(wagmiConfig, {
        abi: VERIFY_AND_REGISTER_ABI,
        address: POH_ADAPTER_ADDRESS,
        functionName: "verifyAndRegister",
        args: [user, proof],
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t2);
      const t3 = toast.loading("Waiting for confirmation…");
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t3);
      
      // Проверяем статус транзакции
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }
      
      if (typeof window !== "undefined") window.localStorage.setItem("poh_verified", "true");
      setPohVerified(true);
      
      toast.success("✅PoH verified!");
      toast.success(`Tx: ${hash.slice(0, 10)}…`, { icon: "🔗" });
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      // Убираем все активные тосты при ошибке
      toast.dismiss();
      const msg = e?.shortMessage || e?.message || "PoH verification failed";
      toast.error(msg);
    } finally {
      setLoadingPoh(false);
    }
  };

  const handleVerifyBrightid = async () => {
    if (brightidVerified) return;
    setLoadingBrightid(true);
    const t = toast.loading("Fetching BrightID proof…");
    try {
      const user = await ensureReady();
      const data = await verifySource("brightid");
      
      toast.dismiss(t);
      const t2 = toast.loading("Submitting transaction…");
      
      const proof = encodeBrightIdProof({
        contextId: ((data.contextId || data.userId) || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
        timestamp: data.timestamp,
        signature: data.signature,
      });
      
      const hash = await writeContract(wagmiConfig, {
        abi: VERIFY_AND_REGISTER_ABI,
        address: BRIGHTID_ADAPTER_ADDRESS,
        functionName: "verifyAndRegister",
        args: [user, proof],
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t2);
      const t3 = toast.loading("Waiting for confirmation…");
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t3);
      
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }
      
      if (typeof window !== "undefined") window.localStorage.setItem("brightid_verified", "true");
      setBrightidVerified(true);
      
      toast.success("✅ BrightID verified!");
      toast.success(`Tx: ${hash.slice(0, 10)}…`, { icon: "🔗" });
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      // Убираем все активные тосты при ошибке
      toast.dismiss();
      const msg = e?.shortMessage || e?.message || "BrightID verification failed";
      toast.error(msg);
    } finally {
      setLoadingBrightid(false);
    }
  };

  const handleWorldcoinClick = React.useCallback(() => {
    worldcoinOpenRef.current?.();
  }, []);

  const onWorldcoinSuccess = async (result: ISuccessResult) => {
    setLoadingWorld(true);
    const t = toast.loading("Verifying with World ID…");
    try {
      const user = await ensureReady();
      const hash = await writeWorldcoinOnChain(user, result);
      
      toast.dismiss(t);
      const t2 = toast.loading("Waiting for confirmation…");
      
      // ✅ Ждём подтверждения транзакции
      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: TARGET_CHAIN_ID,
      });
      
      toast.dismiss(t2);
      
      // Проверяем статус транзакции
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted");
      }
      
      toast.success(`✅ World ID verified`);
      toast.success(`Tx: ${hash.slice(0, 10)}…`, { icon: "🔗" });
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      // Убираем все активные тосты при ошибке
      toast.dismiss();
      const msg = e?.shortMessage || e?.message || "World ID verification failed";
      toast.error(msg);
    } finally {
      setLoadingWorld(false);
    }
  };


  return (
    <main className={styles.main}>
      <Toaster />
      <section className={styles.hero}>
        <video className={styles.heroVideo} autoPlay muted playsInline loop>
          <source src="/sparks-bg.mp4" type="video/mp4" />
        </video>
        <motion.div className={styles.orb} aria-hidden animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.8, 0.55] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
        <div className={styles.heroOverlay} />
        <motion.div className={styles.heroContent} initial="hidden" animate="show" variants={stagger}>
          <motion.div variants={fadeUp} className={styles.badge}>Stripe for Web3 Identity</motion.div>
          <motion.h1 variants={fadeUp} className={styles.title}>NeoBot</motion.h1>
          <motion.p variants={fadeUp} className={styles.subtitle}>One source, More blockchain. Every proof-of-humanity source.</motion.p>
          <motion.div variants={fadeUp} className={styles.ctaRow}>
            <Link href="/docs" className={styles.ctaPrimary}>
              <Button size="large" type="primary" className={styles.btnPrimary}>Read the Docs →</Button>
            </Link>
            <Button size="large" className={styles.btnSecondary} onClick={onConnectClick}>{isConnected ? "Connected" : "Connect Wallet"}</Button>
          </motion.div>
          <motion.div variants={fadeUp} className={styles.providers}>
            <Tag className={styles.tag}>Worldcoin</Tag>
            <Tag className={styles.tag}>Gitcoin Passport</Tag>
            <Tag className={styles.tag}>Proof of Humanity</Tag>
            <Tag className={styles.tag}>BrightID</Tag>
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.section} id="verify">
        <div className={styles.container}>
          <h2 className={styles.h2Center}>Verification Sources</h2>
          <p className={styles.leadCenter}>Select one or more providers to verify your humanity. Each verification awards 1 trust score token.</p>
          {address && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <div className="badge badge-lg badge-primary">
                Your Verifications: {verificationCount}/4
              </div>
            </div>
          )}
          <Row gutter={[20, 20]} justify="center" style={{ marginTop: '32px' }}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className={styles.valueCard}>
                <div className={styles.verificationHeader}>
                  <div className={`${styles.verificationLogo} ${styles.logoWorldcoin}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className={styles.verificationInfo}>
                    <div className={styles.verificationLabel}>ZK-PROOF</div>
                    <h3 className={styles.verificationTitle}>Worldcoin</h3>
                  </div>
                </div>
                <p className={styles.verificationDesc}>
                  Biometric iris scan with zero-knowledge proof
                </p>
                <IDKitWidget app_id={WORLDCOIN_APP_ID} action={WORLDCOIN_ACTION} onSuccess={onWorldcoinSuccess}>
                  {({ open }) => {
                    worldcoinOpenRef.current = open;
                    return (
                      <Button 
                        block 
                        size="large" 
                        type="primary" 
                        loading={loadingWorld} 
                        onClick={handleWorldcoinClick}
                        className={`${styles.btnVerify} ${styles.btnWorldcoin}`}
                      >
                        {loadingWorld ? 'Processing...' : 'Verify with World ID'}
                      </Button>
                    );
                  }}
                </IDKitWidget>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className={styles.valueCard}>
                <div className={styles.verificationHeader}>
                  <div className={`${styles.verificationLogo} ${styles.logoGitcoin}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="currentColor" opacity="0.6"/>
                    </svg>
                  </div>
                  <div className={styles.verificationInfo}>
                    <div className={styles.verificationLabel}>PASSPORT</div>
                    <h3 className={styles.verificationTitle}>Gitcoin</h3>
                  </div>
                </div>
                <p className={styles.verificationDesc}>
                  Reputation score based on verified credentials
                </p>
                <Button
                  block
                  size="large"
                  type="primary"
                  loading={loadingGitcoin}
                  disabled={gitcoinVerified}
                  onClick={handleVerifyGitcoin}
                  className={`${styles.btnVerify} ${styles.btnVerifySource}`}
                >
                  {gitcoinVerified ? 'Verified ✓' : loadingGitcoin ? 'Processing...' : 'Verify'}
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className={styles.valueCard}>
                <div className={styles.verificationHeader}>
                  <div className={`${styles.verificationLogo} ${styles.logoPoh}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2Z" fill="currentColor"/>
                      <path d="M16 8H8L6 22H9L10 15L12 17L14 15L15 22H18L16 8Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className={styles.verificationInfo}>
                    <div className={styles.verificationLabel}>VIDEO KYC</div>
                    <h3 className={styles.verificationTitle}>Proof of Humanity</h3>
                  </div>
                </div>
                <p className={styles.verificationDesc}>
                  Video submission with community validation
                </p>
                <Button
                  block
                  size="large"
                  type="primary"
                  loading={loadingPoh}
                  disabled={pohVerified}
                  onClick={handleVerifyPoh}
                  className={`${styles.btnVerify} ${styles.btnVerifySource}`}
                >
                  {pohVerified ? 'Verified ✓' : loadingPoh ? 'Processing...' : 'Verify'}
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className={styles.valueCard}>
                <div className={styles.verificationHeader}>
                  <div className={`${styles.verificationLogo} ${styles.logoBrightid}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="7" r="3" fill="currentColor"/>
                      <circle cx="18" cy="14" r="2.5" fill="currentColor" opacity="0.7"/>
                      <circle cx="6" cy="14" r="2.5" fill="currentColor" opacity="0.7"/>
                      <circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.5"/>
                    </svg>
                  </div>
                  <div className={styles.verificationInfo}>
                    <div className={styles.verificationLabel}>SOCIAL GRAPH</div>
                    <h3 className={styles.verificationTitle}>BrightID</h3>
                  </div>
                </div>
                <p className={styles.verificationDesc}>
                  Social connection verification network
                </p>
                <Button
                  block
                  size="large"
                  type="primary"
                  loading={loadingBrightid}
                  disabled={brightidVerified}
                  onClick={handleVerifyBrightid}
                  className={`${styles.btnVerify} ${styles.btnVerifySource}`}
                >
                  {brightidVerified ? 'Verified ✓' : loadingBrightid ? 'Processing...' : 'Verify'}
                </Button>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Card className={`${styles.valueCard} ${styles.valueCardDisabled}`}>
                <div className={styles.verificationHeader}>
                  <div className={`${styles.verificationLogo} ${styles.logoBinance}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L8 8L12 12L16 8L12 4Z" fill="currentColor"/>
                      <path d="M4 12L8 16L12 12L8 8L4 12Z" fill="currentColor" opacity="0.7"/>
                      <path d="M20 12L16 8L12 12L16 16L20 12Z" fill="currentColor" opacity="0.7"/>
                      <path d="M12 20L16 16L12 12L8 16L12 20Z" fill="currentColor" opacity="0.5"/>
                    </svg>
                  </div>
                  <div className={styles.verificationInfo}>
                    <div className={styles.verificationLabel}>EXCHANGE KYC</div>
                    <h3 className={styles.verificationTitle}>Binance</h3>
                  </div>
                </div>
                <p className={styles.verificationDesc}>
                  Centralized exchange identity verification
                </p>
                <Button
                  block
                  size="large"
                  type="default"
                  disabled
                  className={`${styles.btnVerify} ${styles.btnComingSoon}`}
                >
                  Coming Soon
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.awardsSection}>
        <div className={styles.awardsContainer}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className={styles.awardsLabel}>Recognized By</div>
            <div className={styles.awardsGrid}>
              <Link href="https://ethbishkek.xyz" target="_blank" rel="noopener noreferrer" className={styles.awardLink}>
                <motion.div 
                  className={styles.awardCard}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className={styles.awardLogoWrapper}>
                    <Image 
                      src="/eth-bishkek-logo.png" 
                      alt="ETH Bishkek" 
                      width={120} 
                      height={120}
                      className={styles.awardLogo}
                    />
                  </div>
                  <div className={styles.awardTitle}>Winner</div>
                  <div className={styles.awardEvent}>ETH Bishkek 2025</div>
                  <div className={styles.awardLocation}>Kyrgyzstan · October 2025</div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.section} id="problem">
        <div className={styles.container}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <h2 className={styles.h2}>The Global Problem</h2>
                <p className={styles.lead}>The internet is drowning in bots. Every Web3 game, airdrop, and DAO faces the same issue — Sybil attacks.</p>
                <ul className={styles.bullets}>
                  <li><span>$1B+ </span>in rewards are stolen by bots each year.</li>
                  <li><span>60–90% </span>of airdrop participants aren’t real humans.</li>
                  <li>Developers integrate multiple fragmented verification systems.</li>
                  <li>Users are forced to re-verify in every app.</li>
                  <li>No single, trusted standard for Web3 identity.</li>
                </ul>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <Card className={styles.statCard}>
                  <div className={styles.statGrid}>
                    <div>
                      <div className={styles.statNumber}><AnimatedCounter to={1} prefix="$" suffix="B+" /></div>
                      <div className={styles.statLabel}>Value lost to Sybil attacks annually</div>
                    </div>
                    <div>
                      <div className={styles.statNumber}>60–<AnimatedCounter to={90} suffix="%" /></div>
                      <div className={styles.statLabel}>Non-human airdrop participants</div>
                    </div>
                    <div>
                      <div className={styles.statNumber}><AnimatedCounter to={1} /></div>
                      <div className={styles.statLabel}>API to unify verification</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="mission">
        <div className={styles.container}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <h2 className={styles.h2}>Our Mission</h2>
                <p className={styles.text}>To make proof of humanity as easy to integrate as payments. We unify major verification providers into a single standard API so builders focus on shipping and users stay verified everywhere.</p>
              </motion.div>
            </Col>
            <Col xs={24} md={12}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
                <Card className={styles.cardGradient}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>One Integration → Global Verification</h3>
                  <p className={styles.text}>Connect once. Access Worldcoin, Gitcoin Passport, Proof of Humanity, BrightID and more. HumanityOracle caches verified status on-chain for interoperable checks across protocols.</p>
                </Card>
                <div className={styles.mediaPlaceholder}>
                  <Image className={styles.imageRocket} src={Rocket.src} alt="rocket" width={0} height={0} sizes="100vw" />
                </div>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.section} id="product">
        <div className={styles.container}>
          <h2 className={styles.h2Center}>Our Product</h2>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12} lg={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Unified API</h3>
                  <p className={styles.text}>One endpoint for all major PoH sources with normalized responses.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>On-chain Cache</h3>
                  <p className={styles.text}>Query verified human status on-chain for transparency and composability.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Open SDKs</h3>
                  <p className={styles.text}>Solidity, TypeScript, and Python SDKs for rapid integration.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Privacy-Preserving</h3>
                  <p className={styles.text}>Privacy-first and zero-knowledge ready. No personal data stored.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Scalable</h3>
                  <p className={styles.text}>Built for high-throughput checks with minimal setup.</p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Interoperable</h3>
                  <p className={styles.text}>Works across chains and protocols via a standard interface.</p>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="advanced">
        <div className={styles.container}>
          <h2 className={styles.h2Center}>Advanced Features</h2>
          <p className={styles.leadCenter}>Mathematically sound sybil resistance with adaptive learning</p>
          <Row gutter={[24, 24]} style={{ marginTop: '48px' }}>
            <Col xs={24} md={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Bayesian Aggregation</h3>
                  <p className={styles.text}>
                    Probability of "human" calculated from multiple independent sources using Bayes' theorem:
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '14px' }}>
                    <InlineMath math="P(H|E_1, E_2, ...) = 1 - \prod(1 - P_i)" />
                  </div>
                  <p className={styles.text} style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
                    Each source contributes independently, increasing confidence exponentially.
                  </p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛡️</div>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Attack Detection</h3>
                  <p className={styles.text}>
                    Automatic detection of suspicious patterns:
                  </p>
                  <ul style={{ marginTop: '12px', paddingLeft: '20px', fontSize: '13px', opacity: 0.9 }}>
                    <li>Rapid verification bursts</li>
                    <li>Low quality score patterns</li>
                    <li>Anomalous behavior detection</li>
                  </ul>
                  <p className={styles.text} style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
                    Real-time monitoring with on-chain event emission.
                  </p>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} md={8}>
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
                <Card className={styles.featureCard}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
                  <h3 className={`${styles.h3} ${styles.h3OnDark}`}>Adaptive Updates</h3>
                  <p className={styles.text}>
                    Source confidence scores update automatically when attacks are confirmed:
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '14px' }}>
                    <InlineMath math="FPR_{new} = \frac{attacks}{total}" />
                  </div>
                  <p className={styles.text} style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8 }}>
                    Self-improving system that learns from confirmed attacks.
                  </p>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="how-it-works">
        <div className={styles.container}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={10}>
              <h2 className={styles.h2}>How It Works</h2>
              <p className={styles.text}>Users verify via any supported provider. HumanityOracle aggregates and normalizes proofs. A unified Humanity Score or Verified Human status is stored on-chain. Apps call our API to check humanity instantly.</p>
            </Col>
            <Col xs={24} md={14}>
              <div className={styles.steps}>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>1</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Verify</h4>
                    <p className={styles.text}>User completes verification with Worldcoin, Gitcoin Passport, PoH, BrightID, or others.</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>2</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Aggregate</h4>
                    <p className={styles.text}>We aggregate and normalize proofs into a single, consistent format.</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>3</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Cache on-chain</h4>
                    <p className={styles.text}>We write a verified status or score on-chain for transparent, interoperable checks.</p>
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} viewport={{ once: true }} className={styles.step}>
                  <div className={styles.stepIndex}>4</div>
                  <div className={styles.stepBody}>
                    <h4 className={styles.h4}>Integrate</h4>
                    <p className={styles.text}>Apps call one API or use our SDKs to perform instant humanity checks.</p>
                  </div>
                </motion.div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.section} id="why">
        <div className={styles.container}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>For Developers</h3>
                <p className={styles.text}>Stop integrating five APIs. Integrate once and ship faster.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>For Users</h3>
                <p className={styles.text}>One verification, infinite access. Keep control over your privacy.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>For the Ecosystem</h3>
                <p className={styles.text}>Reduce Sybil attacks, increase trust, and unlock fair incentives.</p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section className={styles.sectionAlt} id="faq">
        <div className={styles.container}>
          <h2 className={styles.h2Center}>Frequently Asked Questions</h2>
          <div className={styles.faqWrap}>
            <Card className={styles.faqCard}>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: "700" }} className={styles.h4}>Is HumanityOracle another verification provider?</h4>
                <p className={styles.text}>No. We’re an aggregator that connects and unifies existing proof systems.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: "700" }} className={styles.h4}>Do users need to verify again?</h4>
                <p className={styles.text}>No. If a user is verified via Worldcoin, Gitcoin, or PoH, they’re already human in our system.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: "700" }} className={styles.h4}>How do developers integrate?</h4>
                <p className={styles.text}>Through a single API and SDKs for Solidity, TypeScript, and Python.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: "700" }} className={styles.h4}>Is the data stored on-chain?</h4>
                <p className={styles.text}>Yes. We cache verification status on-chain for transparency and interoperability.</p>
              </div>
              <div className={styles.faqItem}>
                <h4 style={{ fontWeight: "700" }} className={styles.h4}>What about privacy?</h4>
                <p className={styles.text}>We never store personal data. Privacy-first and zero-knowledge compatible by design.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className={styles.sectionCta} id="contact">
        <div className={styles.containerNarrow}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className={styles.h2Center}>Build with HumanityOracle</h2>
            <p className={styles.leadCenter}>Start building with the API today. Join the future of trusted on-chain identity.</p>
            <div className={styles.ctaRowCenter}>
              <Link href="/docs">
                <Button size="large" type="primary" className={styles.btnPrimary}>Read the Docs →</Button>
              </Link>
              <Link href="/contact">
                <Button size="large" className={styles.btnSecondary}>Talk to Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
