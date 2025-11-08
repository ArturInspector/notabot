import { useEffect, useState, useCallback } from "react";
import { usePublicClient, useBlockNumber } from "wagmi";
import { MAIN_AGGREGATOR_ADDRESS } from "~~/utils/contracts";
import { Address, Log, decodeEventLog, isAddress } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export type EventType = 
  | "VerificationRegistered"
  | "AdapterAdded"
  | "AdapterRemoved"
  | "AnomalyDetected"
  | "ConfidenceUpdated"
  | "AttackConfirmed"
  | "TokensRevoked";

export interface LiveEvent {
  id: string;
  type: EventType;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
  user?: Address;
  source?: number;
  uniqueId?: string;
  qualityScore?: number;
  adapter?: Address;
  sourceId?: number;
  reason?: string;
  numerator?: bigint;
  denominator?: bigint;
  amount?: bigint;
}

const MAIN_AGGREGATOR_EVENTS_ABI = [
  {
    type: "event",
    name: "VerificationRegistered",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "source", type: "uint8" },
      { indexed: false, name: "uniqueId", type: "bytes32" },
      { indexed: false, name: "timestamp", type: "uint256" },
      { indexed: false, name: "qualityScore", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TokensRevoked",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "AdapterAdded",
    inputs: [
      { indexed: true, name: "adapter", type: "address" },
      { indexed: false, name: "sourceId", type: "uint8" },
    ],
  },
  {
    type: "event",
    name: "AdapterRemoved",
    inputs: [
      { indexed: true, name: "adapter", type: "address" },
    ],
  },
  {
    type: "event",
    name: "AnomalyDetected",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "reason", type: "string" },
    ],
  },
  {
    type: "event",
    name: "ConfidenceUpdated",
    inputs: [
      { indexed: true, name: "sourceId", type: "uint8" },
      { indexed: false, name: "numerator", type: "uint256" },
      { indexed: false, name: "denominator", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "AttackConfirmed",
    inputs: [
      { indexed: true, name: "sourceId", type: "uint8" },
      { indexed: true, name: "user", type: "address" },
    ],
  },
] as const;

export const useLiveEvents = (fromBlock?: bigint, limit: number = 100) => {
  const { targetNetwork } = useTargetNetwork();
  const publicClient = usePublicClient({ chainId: targetNetwork.id });
  const { data: currentBlock } = useBlockNumber({ 
    watch: true,
    chainId: targetNetwork.id,
  });
  
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!publicClient || !MAIN_AGGREGATOR_ADDRESS || !isAddress(MAIN_AGGREGATOR_ADDRESS)) {
      setIsLoading(false);
      setError(new Error("MainAggregator address is not configured. Please set NEXT_PUBLIC_MAIN_AGGREGATOR environment variable."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const startBlock = fromBlock || (currentBlock ? currentBlock - BigInt(1000) : BigInt(0));
      const endBlock = currentBlock || BigInt(0);

      if (endBlock < startBlock) {
        setIsLoading(false);
        return;
      }

      const logs = await publicClient.getLogs({
        address: MAIN_AGGREGATOR_ADDRESS,
        fromBlock: startBlock,
        toBlock: endBlock,
      });

      const parsedEvents: LiveEvent[] = [];

      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: MAIN_AGGREGATOR_EVENTS_ABI,
            data: log.data,
            topics: log.topics,
          });

          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          
          let event: LiveEvent = {
            id: `${log.transactionHash}-${log.logIndex}`,
            type: decoded.eventName as EventType,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Number(block.timestamp),
          };

          const args = decoded.args as any;

          switch (decoded.eventName) {
            case "VerificationRegistered":
              event = {
                ...event,
                user: args.user as Address,
                source: Number(args.source),
                uniqueId: typeof args.uniqueId === "string" 
                  ? args.uniqueId 
                  : typeof args.uniqueId === "bigint"
                  ? `0x${args.uniqueId.toString(16).padStart(64, "0")}`
                  : String(args.uniqueId),
                qualityScore: Number(args.qualityScore),
              };
              break;
            case "AdapterAdded":
              event = {
                ...event,
                adapter: args.adapter as Address,
                sourceId: Number(args.sourceId),
              };
              break;
            case "AdapterRemoved":
              event = {
                ...event,
                adapter: args.adapter as Address,
              };
              break;
            case "AnomalyDetected":
              event = {
                ...event,
                user: args.user as Address,
                reason: args.reason as string,
              };
              break;
            case "ConfidenceUpdated":
              event = {
                ...event,
                sourceId: Number(args.sourceId),
                numerator: args.numerator as bigint,
                denominator: args.denominator as bigint,
              };
              break;
            case "AttackConfirmed":
              event = {
                ...event,
                sourceId: Number(args.sourceId),
                user: args.user as Address,
              };
              break;
            case "TokensRevoked":
              event = {
                ...event,
                user: args.user as Address,
                amount: args.amount as bigint,
              };
              break;
          }

          parsedEvents.push(event);
        } catch (err) {
          console.error("Error decoding event:", err);
        }
      }

      // Сортируем по блоку (новые сверху) и ограничиваем
      const sorted = parsedEvents
        .sort((a, b) => {
          if (a.blockNumber !== b.blockNumber) {
            return Number(b.blockNumber - a.blockNumber);
          }
          return 0;
        })
        .slice(0, limit);

      setEvents(sorted);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, fromBlock, currentBlock, limit]);

  // Первоначальная загрузка
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Подписка на новые блоки
  useEffect(() => {
    if (!publicClient || !currentBlock || !MAIN_AGGREGATOR_ADDRESS || !isAddress(MAIN_AGGREGATOR_ADDRESS)) return;

    const unwatch = publicClient.watchBlockNumber({
      onBlockNumber: async (blockNumber) => {
        try {
          const logs = await publicClient.getLogs({
            address: MAIN_AGGREGATOR_ADDRESS,
            fromBlock: currentBlock,
            toBlock: blockNumber,
          });

          if (logs.length === 0) return;

          const newEvents: LiveEvent[] = [];

          for (const log of logs) {
            try {
              const decoded = decodeEventLog({
                abi: MAIN_AGGREGATOR_EVENTS_ABI,
                data: log.data,
                topics: log.topics,
              });

              const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
              
              let event: LiveEvent = {
                id: `${log.transactionHash}-${log.logIndex}`,
                type: decoded.eventName as EventType,
                blockNumber: log.blockNumber,
                transactionHash: log.transactionHash,
                timestamp: Number(block.timestamp),
              };

              const args = decoded.args as any;

              switch (decoded.eventName) {
                case "VerificationRegistered":
                  event = {
                    ...event,
                    user: args.user as Address,
                    source: Number(args.source),
                    uniqueId: args.uniqueId as string,
                    qualityScore: Number(args.qualityScore),
                  };
                  break;
                case "AdapterAdded":
                  event = {
                    ...event,
                    adapter: args.adapter as Address,
                    sourceId: Number(args.sourceId),
                  };
                  break;
                case "AdapterRemoved":
                  event = {
                    ...event,
                    adapter: args.adapter as Address,
                  };
                  break;
                case "AnomalyDetected":
                  event = {
                    ...event,
                    user: args.user as Address,
                    reason: args.reason as string,
                  };
                  break;
                case "ConfidenceUpdated":
                  event = {
                    ...event,
                    sourceId: Number(args.sourceId),
                    numerator: args.numerator as bigint,
                    denominator: args.denominator as bigint,
                  };
                  break;
                case "AttackConfirmed":
                  event = {
                    ...event,
                    sourceId: Number(args.sourceId),
                    user: args.user as Address,
                  };
                  break;
                case "TokensRevoked":
                  event = {
                    ...event,
                    user: args.user as Address,
                    amount: args.amount as bigint,
                  };
                  break;
              }

              newEvents.push(event);
            } catch (err) {
              console.error("Error decoding new event:", err);
            }
          }

          if (newEvents.length > 0) {
            setEvents((prev) => {
              const combined = [...newEvents, ...prev];
              return combined.slice(0, limit);
            });
          }
        } catch (err) {
          console.error("Error watching blocks:", err);
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [publicClient, currentBlock, limit]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
};

