import { useAccount, useReadContracts } from "wagmi";
import { MAIN_AGGREGATOR_ADDRESS, MAIN_AGGREGATOR_ABI } from "~~/utils/contracts";
import { useScaffoldWatchContractEvent } from "./useScaffoldWatchContractEvent";
import { isAddress } from "viem";

export const useVerificationStatus = () => {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        abi: MAIN_AGGREGATOR_ABI,
        address: MAIN_AGGREGATOR_ADDRESS,
        functionName: "getVerificationCount",
        args: address ? [address] : undefined,
      },
      {
        abi: MAIN_AGGREGATOR_ABI,
        address: MAIN_AGGREGATOR_ADDRESS,
        functionName: "isVerifiedHuman",
        args: address ? [address] : undefined,
      },
      {
        abi: MAIN_AGGREGATOR_ABI,
        address: MAIN_AGGREGATOR_ADDRESS,
        functionName: "getTrustScore",
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: Boolean(address && MAIN_AGGREGATOR_ADDRESS && isAddress(MAIN_AGGREGATOR_ADDRESS)),
      refetchInterval: 30000,
    },
  });

  useScaffoldWatchContractEvent({
    contractName: "MainAggregator",
    eventName: "VerificationRegistered",
    onLogs: (logs) => {
      if (logs.some((log) => log.args.user === address)) {
        refetch();
      }
    },
  });

  const count = data?.[0]?.result ? Number(data[0].result) : 0;
  const isVerified = data?.[1]?.result ? Boolean(data[1].result) : false;
  const trustScore = data?.[2]?.result ? Number(data[2].result) : 0;

  return {
    count,
    isVerified,
    trustScore,
    isLoading,
  };
};

