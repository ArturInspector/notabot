"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useVerificationStatus } from "~~/hooks/scaffold-eth";
import { VerificationModal } from "./VerificationModal";
import styles from "./widget.module.css";

type VerificationButtonProps = {
  onVerified?: (count: number) => void;
  variant?: "primary" | "outline";
  showCount?: boolean;
};

export const VerificationButton = ({ 
  onVerified, 
  variant = "primary",
  showCount = true 
}: VerificationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { count, isVerified } = useVerificationStatus();

  const handleVerified = () => {
    onVerified?.(count);
    setIsOpen(false);
  };

  const buttonClass = variant === "primary" ? styles.btnPrimary : styles.btnOutline;

  return (
    <>
      <button 
        className={`${styles.verifyButton} ${buttonClass}`}
        onClick={() => setIsOpen(true)}
      >
        {isVerified ? (
          <>
            <span className={styles.checkIcon}>✓</span>
            Verified Human
            {showCount && <span className={styles.badge}>{count}/4</span>}
          </>
        ) : (
          "Verify as Human"
        )}
      </button>

      {isOpen && (
        <VerificationModal 
          onClose={() => setIsOpen(false)} 
          onVerified={handleVerified}
        />
      )}
    </>
  );
};

