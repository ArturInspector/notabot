"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  ShieldCheckIcon, 
  BoltIcon, 
  CodeBracketIcon, 
  CpuChipIcon, 
  UserGroupIcon, 
  EyeSlashIcon,
  ServerIcon,
  FingerPrintIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

const cssStyles = `
  .pageRoot {
    position: relative;
    min-height: 100vh;
    background-color: #020408;
    color: #ffffff;
    overflow-x: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* --- GLOBAL EFFECTS --- */
  .noiseOverlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.07'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 50;
    opacity: 0.4;
  }

  .progressBar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #7b61ff, #00f0ff, #10b981);
    transform-origin: 0%;
    z-index: 100;
    box-shadow: 0 0 20px rgba(123, 97, 255, 0.5);
  }

  /* --- BACKGROUNDS --- */
  .backgroundLayer {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .gridPattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
  }

  .auroraOrb1 {
    position: absolute;
    top: -20%; left: 20%;
    width: 60vw; height: 60vw;
    background: radial-gradient(circle, rgba(88, 28, 255, 0.12), transparent 70%);
    filter: blur(100px);
    animation: float 10s ease-in-out infinite;
  }

  .auroraOrb2 {
    position: absolute;
    bottom: -10%; right: -10%;
    width: 50vw; height: 50vw;
    background: radial-gradient(circle, rgba(0, 240, 255, 0.08), transparent 70%);
    filter: blur(100px);
    animation: float 14s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(30px, -30px); }
  }

  /* --- TYPOGRAPHY --- */
  .heroTitle {
    font-size: 3.5rem;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin-bottom: 1.5rem;
  }
  @media (min-width: 768px) {
    .heroTitle { font-size: 5.5rem; }
  }

  .gradientText {
    background: linear-gradient(135deg, #fff 30%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* --- 3D TESSERACT (CSS 3D) --- */
  .scene3d {
    perspective: 1000px;
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cubeWrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    animation: rotateCube 20s linear infinite;
    will-change: transform;
  }

  .cubeFace {
    position: absolute;
    width: 200px;
    height: 200px;
    border: 1px solid rgba(123, 97, 255, 0.3);
    background: rgba(123, 97, 255, 0.02);
    box-shadow: 0 0 15px rgba(123, 97, 255, 0.1) inset;
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    left: 50px; top: 50px; /* Center in wrapper */
  }

  /* Inner Cube */
  .innerCubeFace {
    position: absolute;
    width: 100px;
    height: 100px;
    border: 1px solid rgba(0, 240, 255, 0.6);
    background: rgba(0, 240, 255, 0.05);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
    left: 100px; top: 100px;
  }

 /* Outer cube */
 .faceFront  { transform: rotateY(0deg) translateZ(102px); }
 .faceBack   { transform: rotateY(180deg) translateZ(102px); }
 .faceRight  { transform: rotateY(90deg) translateZ(102px); }
 .faceLeft   { transform: rotateY(-90deg) translateZ(102px); }
 .faceTop    { transform: rotateX(90deg) translateZ(102px); }
 .faceBottom { transform: rotateX(-90deg) translateZ(102px); }

 /* Inner cube */
 .innerFront  { transform: rotateY(0deg) translateZ(48px); }
 .innerBack   { transform: rotateY(180deg) translateZ(48px); }
 /* и так далее для остальных */
  .innerRight  { transform: rotateY(90deg) translateZ(50px); }
  .innerLeft   { transform: rotateY(-90deg) translateZ(50px); }
  .innerTop    { transform: rotateX(90deg) translateZ(50px); }
  .innerBottom { transform: rotateX(-90deg) translateZ(50px); }

  @keyframes rotateCube {
    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
  }

  /* --- COMPONENTS --- */
  .glassCard {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .glassCard:hover {
    border-color: rgba(123, 97, 255, 0.3);
    box-shadow: 0 0 30px rgba(123, 97, 255, 0.15);
  }

  .codeBlock {
    font-family: 'Fira Code', monospace;
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.5rem;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #a5b4fc;
    position: relative;
  }
  .codeBlock::before {
    content: '● ● ●';
    position: absolute;
    top: 12px; left: 16px;
    font-size: 8px;
    letter-spacing: 4px;
    color: rgba(255,255,255,0.3);
  }

  .glowButton {
    position: relative;
    background: #ffffff;
    color: black;
    font-weight: 700;
    padding: 12px 32px;
    border-radius: 99px;
    overflow: hidden;
    transition: all 0.3s ease;
    z-index: 1;
  }
  .glowButton::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, #7b61ff, #00f0ff);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
  }
  .glowButton:hover {
    color: white;
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(123, 97, 255, 0.6);
  }
  .glowButton:hover::after {
    opacity: 1;
  }

  /* --- SCANNER ANIMATION --- */
  .scannerLine {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: #10b981;
    box-shadow: 0 0 10px #10b981;
    animation: scan 2s linear infinite;
    opacity: 0;
  }
  
  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
`;

const StarBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{x: number, y: number, z: number, size: number, speed: number}> = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2, // Depth factor
        size: Math.random() * 1.5,
        speed: Math.random() * 0.2 + 0.05
      }));
    };

    const draw = () => {
      ctx.fillStyle = "rgba(2, 4, 8, 0.3)"; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.y -= star.speed * (star.z + 0.5);
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
        
        const alpha = Math.min(1, star.z * 0.5 + 0.2);
        ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * star.z, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    init();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />;
};

// 2. 3D HYPERCUBE (CSS 3D Transform)
const HyperCube = () => {
  return (
    <div className="scene3d">
      <div className="cubeWrapper">
        {/* Outer Cube */}
        <div className="cubeFace faceFront" />
        <div className="cubeFace faceBack" />
        <div className="cubeFace faceRight" />
        <div className="cubeFace faceLeft" />
        <div className="cubeFace faceTop" />
        <div className="cubeFace faceBottom" />
        
        {/* Inner Core Cube */}
        <div className="innerCubeFace innerFront" />
        <div className="innerCubeFace innerBack" />
        <div className="innerCubeFace innerRight" />
        <div className="innerCubeFace innerLeft" />
        <div className="innerCubeFace innerTop" />
        <div className="innerCubeFace innerBottom" />
        
        {/* Glowing Core */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-white rounded-full blur-xl -translate-x-1/2 -translate-y-1/2 animate-pulse z-10 shadow-[0_0_50px_rgba(123,97,255,0.8)]" />
      </div>
    </div>
  );
};

// 3. INTERACTIVE VERIFICATION DEMO
const VerificationDemo = () => {
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "fail">("idle");

  const startScan = () => {
    setStatus("scanning");
    setTimeout(() => {
      setStatus("success"); // Mock success
    }, 2500);
  };

  return (
    <div className="glassCard p-6 max-w-sm mx-auto relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xs font-mono text-slate-400">SIMULATION v2.0</div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
          <div className="w-2 h-2 rounded-full bg-green-500/20" />
        </div>
      </div>

      <div className="relative h-48 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center mb-6 overflow-hidden">
        {/* Scan Line */}
        {status === "scanning" && <div className="scannerLine" />}
        
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center"
            >
              <FingerPrintIcon className="w-16 h-16 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Ready to verify transaction</p>
            </motion.div>
          )}
          {status === "scanning" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-primary-400 font-mono">GENERATING ZK PROOF...</p>
              <p className="text-[10px] text-slate-500 mt-1">0x7f...3a9c</p>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/50">
                <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-400 font-bold">HUMAN VERIFIED</p>
              <p className="text-[10px] text-slate-400 mt-1">Gas: $0.01 | Time: 430ms</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button 
        onClick={startScan}
        disabled={status === "scanning"}
        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all text-white flex items-center justify-center gap-2"
      >
        {status === "idle" ? "Connect & Verify" : status === "scanning" ? "Processing..." : "Verify Again"}
        {status === "idle" && <ArrowRightIcon className="w-4 h-4" />}
      </button>
    </div>
  );
};

// --- MAIN PAGE ---

export default function NotABotV2() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Parallax transform for sections
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div className="pageRoot">
      <style>{cssStyles}</style>
      <div className="noiseOverlay" />
      <motion.div className="progressBar" style={{ scaleX }} />
      
      {/* Backgrounds */}
      <div className="backgroundLayer">
        <div className="auroraOrb1" />
        <div className="auroraOrb2" />
        <div className="gridPattern" />
        <StarBackground />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20">
        
        {/* --- HERO SECTION --- */}
        <motion.section 
          className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]"
          style={{ y: yHero, opacity: opacityHero }}
        >
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-900/20 text-emerald-400 text-xs font-bold tracking-wider mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              V2.0 LIVE ON BASE
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="heroTitle"
            >
              No Face <br />
              <span className="text-slate-500 text-4xl block my-2">=</span>
              <span className="gradientText">No Money.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-lg text-slate-400 max-w-lg leading-relaxed mb-8"
            >
              One-time KYC is dead. Accounts are sold for $500 in 2 minutes. 
              NotABot verifies <span className="text-white font-semibold">every single transaction</span> using ZK proofs. 
              <br /><br />
              Stop feeding the bot farms. Start rewarding humans.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button className="glowButton">Launch App</button>
              <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium transition-colors">
                Read Documentation
              </button>
            </motion.div>
            
            <div className="mt-12 flex items-center gap-8 text-xs font-mono text-slate-500">
              <div>
                <strong className="block text-white text-xl">{'<'}500ms</strong>
                LATENCY
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <strong className="block text-white text-xl">$0.01</strong>
                COST PER TX
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <strong className="block text-white text-xl">100%</strong>
                ZK PRIVACY
              </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center perspective-1000">
            {/* 3D Interactive Element */}
            <div className="relative z-10">
              <HyperCube />
            </div>
            
            {/* Floating Labels */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 bg-black/60 backdrop-blur-md border border-emerald-500/30 p-3 rounded-xl text-xs"
            >
              <div className="text-emerald-400 font-bold mb-1">✓ PROOF VALID</div>
              <div className="text-slate-500">0x8a...2b9d</div>
            </motion.div>

             <motion.div 
              animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-0 bg-black/60 backdrop-blur-md border border-red-500/30 p-3 rounded-xl text-xs"
            >
              <div className="text-red-400 font-bold mb-1">⚠ SYBIL BLOCKED</div>
              <div className="text-slate-500">IP Duplication</div>
            </motion.div>
          </div>
        </motion.section>

        {/* --- THE PROBLEM --- */}
        <section className="py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              The <span className="text-red-500 line-through decoration-4 decoration-white/20">System</span> is Broken.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Gitcoin Passport. Worldcoin. Human.tech. They all verify you <strong>once</strong>.
              Then the wallet is sold.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {/* Card 1 */}
            <div className="glassCard p-8 bg-gradient-to-b from-red-900/10 to-transparent border-red-500/10">
              <BoltIcon className="w-10 h-10 text-red-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">The Selling Loop</h3>
              <p className="text-slate-400 leading-relaxed">
                One biometric check can back hundreds of wallets over time. 
                Fraudsters verify, sell the key for $500, and repeat.
                <span className="block mt-4 text-white font-medium">Result: Industrialized Fraud.</span>
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="glassCard p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <EyeSlashIcon className="w-32 h-32" />
              </div>
              <div className="text-6xl font-bold text-white mb-2">$20B+</div>
              <div className="text-xs font-mono text-red-400 uppercase tracking-widest mb-6">Stolen in 2024</div>
              <p className="text-slate-400">
                That's value drained from your community into bot farms. Real users are diluted to dust.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glassCard p-8">
              <UserGroupIcon className="w-10 h-10 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Humanity is a Flow</h3>
              <p className="text-slate-400 leading-relaxed">
                Being human isn't a stamp. It's a continuous state. 
                We check biometric proof at the <span className="text-blue-400">moment of transaction</span>.
                <span className="block mt-4 text-white font-medium">1 Face = 1 Transaction.</span>
              </p>
            </div>
          </div>
        </section>

        {/* --- THE SOLUTION / DEMO --- */}
        <section className="py-20 grid lg:grid-cols-2 gap-16 items-center">
           <div className="order-2 lg:order-1">
              <VerificationDemo />
           </div>
           <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CodeBracketIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-emerald-400 font-mono text-sm">DEV INTEGRATION</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                5 Lines of Code.<br/>Zero Friction.
              </h2>
              <p className="text-slate-400 text-lg mb-8">
                Our oracle requests a ZK proof from regulated KYC providers (KYC Labs) without exposing user data. 
                The proof is generated, verified on-chain, and the transaction executes.
              </p>
              
              <div className="codeBlock">
                <div className="flex gap-2 mb-4 border-b border-white/10 pb-2 text-xs text-slate-500">
                  <span>usage.sol</span>
                </div>
                <pre className="overflow-x-auto">
{`function claimAirdrop(uint256 amount) external {
  // 1. Verify NotABot proof
  notabot.verifyTransaction(msg.sender);
  
  // 2. Execute Logic
  token.transfer(msg.sender, amount);
}`}
                </pre>
              </div>
           </div>
        </section>

        {/* --- MARKET / WHY NOW --- */}
        <section className="py-20 border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why This Works Now</h2>
              <p className="mt-4 text-slate-400">Leveraging existing infrastructure for a new problem.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "KYC Providers are Hungry",
                  desc: "TradFi KYC giants want Web3 revenue but fear regulatory risks. We give them a privacy-preserving, B2B SaaS model.",
                  icon: ServerIcon
                },
                {
                  title: "Base L2 Economics",
                  desc: "Per-transaction verification costs $0.01 on Base. This model was impossible on Ethereum Mainnet.",
                  icon: CpuChipIcon
                },
                {
                  title: "The Market is Desperate",
                  desc: "Arbitrum, Optimism, Polygon—all farmed. Projects are begging for a solution that actually stops the bleeding.",
                  icon: BoltIcon
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start p-6 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="p-3 bg-slate-800 rounded-lg shrink-0">
                    <item.icon className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <p className="text-slate-400 mt-2 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FUNDING / TRACTION --- */}
        <section className="py-32 relative">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent pointer-events-none" />
           
           <div className="grid lg:grid-cols-2 gap-16">
              <div>
                 <h2 className="text-4xl font-bold mb-6">Let's fix Airdrops.</h2>
                 <p className="text-slate-400 mb-8 text-lg">
                   We won ETH Bishkek. We have the tech. We have the partners (KYC Labs).
                   Now we need the fuel.
                 </p>
                 
                 <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
                    <div className="flex items-end justify-between mb-2">
                       <div className="text-sm text-slate-400 uppercase tracking-wider">Funding Goal</div>
                       <div className="text-2xl font-bold text-white">$50,000 <span className="text-sm font-normal text-slate-500">/ 12% Equity</span></div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
                       <motion.div 
                          initial={{ width: 0 }} whileInView={{ width: "25%" }} transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                       />
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-300">ZK & Oracle Scaling</span>
                          <span className="text-white font-mono">$20k</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-300">KYC Integration & Legal</span>
                          <span className="text-white font-mono">$15k</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Launch Ops & Marketing</span>
                          <span className="text-white font-mono">$15k</span>
                       </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                       <p className="text-xs text-slate-500 leading-relaxed">
                         <strong>Runway:</strong> 6 months to revenue.<br/>
                         <strong>Milestone:</strong> Launch on Base Mainnet Q1 2025.<br/>
                         <strong>Status:</strong> Active discussions with KYC Labs.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col justify-center">
                 <div className="space-y-8">
                    <div className="group cursor-pointer">
                       <h3 className="text-2xl font-bold text-slate-500 group-hover:text-white transition-colors flex items-center gap-4">
                          <span className="text-sm font-mono border border-slate-700 rounded px-2 py-1">01</span>
                          Proof of Concept
                       </h3>
                       <p className="pl-12 mt-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                          Winner of ETH Bishkek. Functional smart contracts deployed on testnet.
                       </p>
                    </div>

                    <div className="group cursor-pointer">
                       <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                          <span className="text-sm font-mono bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded px-2 py-1">02</span>
                          Integration
                       </h3>
                       <p className="pl-12 mt-2 text-slate-300">
                          Current Phase. Connecting KYC Labs API to our ZK Oracle. 
                          Removing PII, keeping the "Human" signal.
                       </p>
                    </div>

                    <div className="group cursor-pointer">
                       <h3 className="text-2xl font-bold text-slate-500 group-hover:text-white transition-colors flex items-center gap-4">
                          <span className="text-sm font-mono border border-slate-700 rounded px-2 py-1">03</span>
                          Base Mainnet
                       </h3>
                       <p className="pl-12 mt-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                          Q1 2025. Launching with 3 pilot airdrop partners.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer className="border-t border-white/10 bg-black py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-2xl font-bold tracking-tighter">NotABot.</div>
           <div className="text-xs text-slate-500">
              &copy; 2025 NotABot Inc. Built for the real ones.
           </div>
        </div>
      </footer>
    </div>
  );
}