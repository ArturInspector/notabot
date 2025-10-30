"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaVerification } from '../hooks/useSolanaVerification';
import { motion, Variants } from 'framer-motion';
import styles from './SolanaVerify.module.css';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as any } 
  }
};

export function SolanaVerify() {
  const { connected, publicKey } = useWallet();
  const { loading, verify, checkVerification } = useSolanaVerification();
  const [verificationData, setVerificationData] = useState<any>(null);

  useEffect(() => {
    if (connected && publicKey) {
      checkVerification().then(data => {
        if (data) {
          setVerificationData(data);
        }
      });
    }
  }, [connected, publicKey, checkVerification]);

  const handleVerifyGitcoin = async () => {
    const result = await verify('gitcoin', `demo:${publicKey?.toBase58()}`);
    if (result) {
      setVerificationData(result);
    }
  };

  return (
    <section className={styles.solanaSection}>
      <div className={styles.gridOverlay} />
      <motion.div 
        className={styles.orb1}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div 
        className={styles.orb2}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div 
        className={styles.content}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className={styles.glassCard}>
          <div className={styles.header}>
            <div className={styles.badges}>
              <span className={styles.badge + ' ' + styles.badgeSolana}>SOLANA</span>
              <span className={styles.badge + ' ' + styles.badgeBeta}>BETA</span>
            </div>
            
            <h2 className={styles.title}>
              Lightning-Fast Verification
            </h2>
            
            <p className={styles.description}>
              Verify your humanity on Solana with ultra-low fees and instant confirmation. 
              Experience the speed of blockchain at its finest.
            </p>
          </div>

          <div className={styles.walletSection}>
            {!connected ? (
              <>
                <WalletMultiButton className={styles.walletButton} />
                <div className={styles.costInfo}>
                  <span>Transaction cost:</span>
                  <span className={styles.costBadge}>~$0.0001</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.connectedBox}>
                  <div className={styles.connectedLabel}>Connected Wallet</div>
                  <div className={styles.connectedAddress}>
                    {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
                  </div>
                </div>

                {verificationData ? (
                  <div className={styles.verifiedBox}>
                    <div className={styles.verifiedIcon}>✓</div>
                    <div className={styles.verifiedTitle}>Successfully Verified!</div>
                    
                    <div className={styles.verifiedStats}>
                      <div className={styles.verifiedStat}>
                        <div className={styles.statLabel}>Trust Score</div>
                        <div className={styles.statValue}>
                          {verificationData.trustScore || 100}
                        </div>
                      </div>
                      <div className={styles.verifiedStat}>
                        <div className={styles.statLabel}>Verified</div>
                        <div className={styles.statValue}>
                          {new Date((verificationData.timestamp || 0) * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className={styles.verifyButton}
                      disabled={loading}
                      onClick={handleVerifyGitcoin}
                    >
                      {loading ? 'Verifying on Solana...' : 'Verify Now'}
                    </button>
                    <div className={styles.costInfo}>
                      <span>Network fee:</span>
                      <span className={styles.costBadge}>~$0.0001</span>
                      <span>+ Storage: ~$0.10 one-time</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

