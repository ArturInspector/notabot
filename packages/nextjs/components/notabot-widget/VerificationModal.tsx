"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useVerificationStatus } from "~~/hooks/scaffold-eth";
import styles from "./widget.module.css";

type VerificationModalProps = {
  onClose: () => void;
  onVerified?: () => void;
};

const SOURCES = [
  { id: "worldcoin", name: "World ID", desc: "Zero-knowledge biometric proof", color: "#000" },
  { id: "gitcoin", name: "Gitcoin Passport", desc: "Web2 + Web3 credentials", color: "#00E6A0" },
  { id: "poh", name: "Proof of Humanity", desc: "Video verification", color: "#FF6B9D" },
  { id: "brightid", name: "BrightID", desc: "Social graph verification", color: "#FDB32A" },
];

export const VerificationModal = ({ onClose, onVerified }: VerificationModalProps) => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { count, isVerified } = useVerificationStatus();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (count > 0 && onVerified) {
      onVerified();
    }
  }, [count, onVerified]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Proof of Humanity</h2>
          <p className={styles.modalDesc}>
            Select verification providers to prove you're human
          </p>
        </div>

        {!isConnected ? (
          <div className={styles.connectSection}>
            <div className={styles.connectIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M1 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 14H7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className={styles.connectTitle}>Connect Your Wallet</h3>
            <p className={styles.connectDesc}>Connect to verify your humanity status</p>
            <button 
              className={`${styles.verifyButton} ${styles.btnPrimary}`}
              onClick={openConnectModal}
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {isVerified && (
              <div className={styles.statusBanner}>
                <span className={styles.checkIcon}>✓</span>
                You have {count} verification{count !== 1 ? 's' : ''}
              </div>
            )}

            <div className={styles.sourceGrid}>
              {SOURCES.map((source) => (
                <div key={source.id} className={styles.sourceCard}>
                  <div 
                    className={styles.sourceIcon} 
                    style={{ backgroundColor: source.color }}
                  />
                  <div className={styles.sourceInfo}>
                    <h4 className={styles.sourceName}>{source.name}</h4>
                    <p className={styles.sourceDesc}>{source.desc}</p>
                  </div>
                  <button 
                    className={`${styles.verifyButton} ${styles.btnOutline} ${styles.btnSmall}`}
                    onClick={() => window.location.href = "/#verify"}
                  >
                    Verify
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <p className={styles.footerText}>
                Privacy-first. Zero-knowledge proofs. No personal data stored.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

