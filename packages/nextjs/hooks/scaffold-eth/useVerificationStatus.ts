import { useAccount, useReadContract } from "wagmi";
import { MAIN_AGGREGATOR_ADDRESS, MAIN_AGGREGATOR_ABI } from "~~/utils/contracts";

/**
 * Custom hook to read user's verification status from MainAggregator contract
 * Returns:
 * - count: number of verifications (0-4)
 * - isVerified: boolean if user has at least 1 verification
 * - trustScore: number based on ERC-20 balance
 * - isLoading: loading state
 */
export const useVerificationStatus = () => {
  const { address } = useAccount();

  const { data: count, isLoading: isLoadingCount } = useReadContract({
    abi: MAIN_AGGREGATOR_ABI,
    address: MAIN_AGGREGATOR_ADDRESS,
    functionName: "getVerificationCount",
    args: address ? [address] : undefined,
    query: { 
      enabled: Boolean(address && MAIN_AGGREGATOR_ADDRESS),
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });

  const { data: isVerified, isLoading: isLoadingVerified } = useReadContract({
    abi: MAIN_AGGREGATOR_ABI,
    address: MAIN_AGGREGATOR_ADDRESS,
    functionName: "isVerifiedHuman",
    args: address ? [address] : undefined,
    query: { 
      enabled: Boolean(address && MAIN_AGGREGATOR_ADDRESS),
      refetchInterval: 5000,
    },
  });

  const { data: trustScore, isLoading: isLoadingScore } = useReadContract({
    abi: MAIN_AGGREGATOR_ABI,
    address: MAIN_AGGREGATOR_ADDRESS,
    functionName: "getTrustScore",
    args: address ? [address] : undefined,
    query: { 
      enabled: Boolean(address && MAIN_AGGREGATOR_ADDRESS),
      refetchInterval: 5000,
    },
  });

  return {
    count: count ? Number(count) : 0,
    isVerified: Boolean(isVerified),
    trustScore: trustScore ? Number(trustScore) : 0,
    isLoading: isLoadingCount || isLoadingVerified || isLoadingScore,
  };
};

