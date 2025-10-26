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
import { writeContract, getPublicClient } from "wagmi/actions";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { Rocket } from "~~/src/assets/images";
import { IDKitWidget, ISuccessResult } from "@worldcoin/idkit";
import { decodeAbiParameters, encodeAbiParameters, parseAbiParameters } from "viem";

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
  const [loadingWorld, setLoadingWorld] = React.useState(false);
  const [loadingAgg, setLoadingAgg] = React.useState(false);
  const [aggVerified, setAggVerified] = React.useState(false);
  const worldcoinOpenRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    getJson(`${BACKEND_URL}/health`).catch(() => {});
  }, []);

  React.useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem("agg_verified") : null;
    setAggVerified(v === "true");
  }, []);

  const markAggVerified = React.useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("agg_verified", "true");
    setAggVerified(true);
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
    const res = await postJson<DemoResponse>("/api/demo/verify", { userAddress: addr, source });
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

  const submitAggregatorsOnChain = async (
    user: `0x${string}`, 
    gitcoin: DemoData, 
    poh: DemoData, 
    brightid: DemoData,
    onProgress?: (step: string) => void
  ) => {
    const gitcoinProof = encodeGitcoinProof({
      userId: (gitcoin.userId || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
      score: gitcoin.score ?? 0,
      timestamp: gitcoin.timestamp,
      signature: gitcoin.signature,
    });
    const pohProof = encodePohProof({
      pohId: ((poh.pohId || poh.userId) || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
      timestamp: poh.timestamp,
      signature: poh.signature,
    });
    const brightIdProof = encodeBrightIdProof({
      contextId: ((brightid.contextId || brightid.userId) || "0x0000000000000000000000000000000000000000000000000000000000000000") as `0x${string}`,
      timestamp: brightid.timestamp,
      signature: brightid.signature,
    });
    
    // CRITICAL: Wait for each tx confirmation before sending next to avoid nonce collision
    const publicClient = getPublicClient(wagmiConfig);
    
    onProgress?.("Sending Gitcoin verification (1/3)…");
    const tx1 = await writeContract(wagmiConfig, {
      abi: VERIFY_AND_REGISTER_ABI,
      address: GITCOIN_ADAPTER_ADDRESS,
      functionName: "verifyAndRegister",
      args: [user, gitcoinProof],
      chainId: TARGET_CHAIN_ID,
    });
    
    // Wait for tx1 to be confirmed before sending tx2
    onProgress?.("Waiting for Gitcoin confirmation…");
    await publicClient.waitForTransactionReceipt({ hash: tx1 });
    
    onProgress?.("Sending PoH verification (2/3)…");
    const tx2 = await writeContract(wagmiConfig, {
      abi: VERIFY_AND_REGISTER_ABI,
      address: POH_ADAPTER_ADDRESS,
      functionName: "verifyAndRegister",
      args: [user, pohProof],
      chainId: TARGET_CHAIN_ID,
    });
    
    // Wait for tx2 to be confirmed before sending tx3
    onProgress?.("Waiting for PoH confirmation…");
    await publicClient.waitForTransactionReceipt({ hash: tx2 });
    
    onProgress?.("Sending BrightID verification (3/3)…");
    const tx3 = await writeContract(wagmiConfig, {
      abi: VERIFY_AND_REGISTER_ABI,
      address: BRIGHTID_ADAPTER_ADDRESS,
      functionName: "verifyAndRegister",
      args: [user, brightIdProof],
      chainId: TARGET_CHAIN_ID,
    });
    
    onProgress?.("Waiting for BrightID confirmation…");
    await publicClient.waitForTransactionReceipt({ hash: tx3 });
    
    return [tx1, tx2, tx3] as const;
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
      toast.success(`World ID verified`);
      toast.success(`Tx: ${hash.slice(0, 10)}…`, { icon: "🔗" });
      if (EXPLORER_TX) window.open(`${EXPLORER_TX}${hash}`, "_blank");
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || "World ID verification failed";
      toast.error(msg);
    } finally {
      toast.dismiss(t);
      setLoadingWorld(false);
    }
  };

  const handleVerifyAggregators = async () => {
    if (aggVerified) return;
    setLoadingAgg(true);
    let t = toast.loading("Fetching verification proofs…");
    try {
      const user = await ensureReady();
      const [gitcoin, poh, brightid] = await Promise.all([verifySource("gitcoin"), verifySource("poh"), verifySource("brightid")]);
      
      toast.dismiss(t);
      const hashes = await submitAggregatorsOnChain(user, gitcoin, poh, brightid, (step) => {
        toast.dismiss(t);
        t = toast.loading(step);
      });
      
      markAggVerified();
      toast.dismiss(t);
      toast.success("✅ All verifications complete! Tokens minted.");
      hashes.forEach(h => {
        toast.success(`Tx: ${h.slice(0, 10)}…`, { icon: "🔗" });
        if (EXPLORER_TX) window.open(`${EXPLORER_TX}${h}`, "_blank");
      });
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || "Verification failed";
      toast.error(msg);
    } finally {
      toast.dismiss(t);
      setLoadingAgg(false);
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
          <motion.h1 variants={fadeUp} className={styles.title}>NotABot</motion.h1>
          <motion.p variants={fadeUp} className={styles.subtitle}>One API. Every proof-of-humanity source.</motion.p>
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
          <h2 className={styles.h2Center}>Verify</h2>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={18} md={10}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>🌍 World ID</h3>
                <p className={styles.text} style={{ fontSize: '13px', marginBottom: '14px', opacity: 0.8 }}>
                  Biometric verification via iris scan
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
            <Col xs={24} sm={18} md={10}>
              <Card className={styles.valueCard}>
                <h3 className={styles.h3}>🎯 Multi-Source Verification</h3>
                <p className={styles.text} style={{ fontSize: '13px', marginBottom: '14px', opacity: 0.8 }}>
                  Gitcoin Passport • PoH • BrightID
                </p>
                <Button
                  block
                  size="large"
                  type="primary"
                  loading={loadingAgg}
                  disabled={aggVerified}
                  onClick={handleVerifyAggregators}
                  className={`${styles.btnVerify} ${styles.btnAggregator}`}
                >
                  {aggVerified ? 'Verified Successfully' : loadingAgg ? 'Verifying...' : 'Verify All Sources'}
                </Button>
              </Card>
            </Col>
          </Row>
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
