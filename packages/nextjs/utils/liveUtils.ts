import { Address } from "viem";
import { LiveEvent } from "~~/hooks/useLiveEvents";

export const SOURCE_NAMES: Record<number, string> = {
  0: "Worldcoin",
  1: "Gitcoin",
  2: "PoH",
  3: "BrightID",
};

export const SOURCE_COLORS: Record<number, string> = {
  0: "#7b61ff",
  1: "#34eeb6",
  2: "#ffcf72",
  3: "#ff8863",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  VerificationRegistered: "Verification Registered",
  AdapterAdded: "Adapter Added",
  AdapterRemoved: "Adapter Removed",
  AnomalyDetected: "Anomaly Detected",
  ConfidenceUpdated: "Confidence Updated",
  AttackConfirmed: "Attack Confirmed",
  TokensRevoked: "Tokens Revoked",
};

export const formatAddress = (address?: Address): string => {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatUniqueId = (id?: string): string => {
  if (!id) return "—";
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = Date.now();
  const diff = now - date.getTime();
  
  if (diff < 60000) {
    return "just now";
  }
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getExplorerUrl = (chainId: number, txHash: string): string => {
  const explorers: Record<number, string> = {
    84532: `https://sepolia.basescan.org/tx/${txHash}`,
    8453: `https://basescan.org/tx/${txHash}`,
    31337: `http://localhost:3000/blockexplorer/transaction/${txHash}`,
  };
  
  return explorers[chainId] || `#`;
};

