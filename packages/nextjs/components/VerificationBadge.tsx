"use client";
import React from "react";
import { useVerificationStatus } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
type VerificationBadgeProps = {
  showDetails?: boolean;
  className?: string;
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ showDetails = false, className = "" }) => {
  const { address } = useAccount();
  const { count, isVerified, trustScore, isLoading } = useVerificationStatus();

  if (!address || isLoading) {
    return null;
  }

  const badgeColor = count === 0 ? "badge-ghost" : count < 2 ? "badge-warning" : count < 3 ? "badge-info" : "badge-success";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`badge ${badgeColor}`}>
        {isVerified ? "✓ Verified" : "Not Verified"}
      </div>
      <div className="font-mono text-sm font-bold">
        {count}/4
      </div>
      {showDetails && trustScore > 0 && (
        <div className="text-xs opacity-60">
          Score: {trustScore}
        </div>
      )}
    </div>
  );
};

