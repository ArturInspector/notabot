import { useReadContracts } from "wagmi";
import { MAIN_AGGREGATOR_ADDRESS, MAIN_AGGREGATOR_ABI } from "~~/utils/contracts";
import { useMemo } from "react";
import { isAddress } from "viem";

export interface SourceMetric {
  sourceId: number;
  name: string;
  tpr: number; // True Positive Rate (from numerator/denominator calculation)
  fpr: number; // False Positive Rate (calculated)
  confidence: number; // Confidence score (numerator/denominator)
  totalVerifications: number;
  confirmedAttacks: number;
  attackRate: number; // confirmedAttacks / totalVerifications
  lastUpdate: number;
}

const SOURCE_NAMES = ["Worldcoin", "Gitcoin", "PoH", "BrightID"];
const BASE_TPR = [0.95, 0.80, 0.70, 0.75]; // Base TPR for each source

export const useSourceMetrics = () => {
  const contracts = useMemo(() => {
    const confidences = [0, 1, 2, 3].map((sourceId) => ({
      abi: MAIN_AGGREGATOR_ABI,
      address: MAIN_AGGREGATOR_ADDRESS,
      functionName: "sourceConfidences" as const,
      args: [sourceId] as const,
    }));

    const stats = [0, 1, 2, 3].map((sourceId) => ({
      abi: MAIN_AGGREGATOR_ABI,
      address: MAIN_AGGREGATOR_ADDRESS,
      functionName: "sourceStats" as const,
      args: [sourceId] as const,
    }));

    return [...confidences, ...stats];
  }, []);

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: Boolean(MAIN_AGGREGATOR_ADDRESS && isAddress(MAIN_AGGREGATOR_ADDRESS)),
      refetchInterval: 30000,
    },
  });

  const metrics = useMemo<SourceMetric[]>(() => {
    if (!data || data.length !== 8) return [];

    const result: SourceMetric[] = [];

    for (let i = 0; i < 4; i++) {
      const confidenceData = data[i];
      const statsData = data[i + 4];

      if (!confidenceData?.result || !statsData?.result) continue;

      const [numerator, denominator] = confidenceData.result as [bigint, bigint];
      const [totalVerifications, confirmedAttacks, lastUpdate] = statsData.result as [bigint, bigint, bigint];

      const num = Number(numerator);
      const den = Number(denominator);
      const total = Number(totalVerifications);
      const attacks = Number(confirmedAttacks);

      // Calculate TPR and FPR
      // numerator represents TPR * 10000, denominator represents (TPR + FPR) * 10000
      // So: TPR = numerator / 10000, FPR = (denominator - numerator) / 10000
      const tpr = num / 10000; // Convert from basis points
      const fpr = total > 0 ? attacks / total : (den - num) / 10000; // Use calculated FPR or attacks
      const confidence = den > 0 ? num / den : 0;

      result.push({
        sourceId: i,
        name: SOURCE_NAMES[i],
        tpr,
        fpr,
        confidence,
        totalVerifications: total,
        confirmedAttacks: attacks,
        attackRate: total > 0 ? attacks / total : 0,
        lastUpdate: Number(lastUpdate),
      });
    }

    return result;
  }, [data]);

  return {
    metrics,
    isLoading,
    error,
  };
};

