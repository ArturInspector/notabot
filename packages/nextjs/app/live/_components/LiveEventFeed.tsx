"use client";

import React from "react";
import { Card, Tag, Badge, Empty, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { LiveEvent } from "~~/hooks/useLiveEvents";
import { formatAddress, formatUniqueId, formatTimestamp, getExplorerUrl, SOURCE_NAMES, SOURCE_COLORS, EVENT_TYPE_LABELS } from "~~/utils/liveUtils";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import styles from "./LiveEventFeed.module.css";

interface LiveEventFeedProps {
  events: LiveEvent[];
  isLoading: boolean;
  filter?: string;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case "VerificationRegistered":
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case "AnomalyDetected":
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    case "AttackConfirmed":
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case "AdapterAdded":
      return <PlusIcon className="w-5 h-5 text-blue-500" />;
    case "AdapterRemoved":
      return <MinusIcon className="w-5 h-5 text-gray-500" />;
    default:
      return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case "VerificationRegistered":
      return "success";
    case "AnomalyDetected":
      return "warning";
    case "AttackConfirmed":
      return "error";
    case "AdapterAdded":
      return "processing";
    case "AdapterRemoved":
      return "default";
    default:
      return "default";
  }
};

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ events, isLoading, filter }) => {
  const { targetNetwork } = useTargetNetwork();

  const filteredEvents = filter
    ? events.filter((e) => e.type === filter)
    : events;

  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <Card className="bg-base-200 border-base-300">
        <Empty description="No events found" />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={styles.glassCard}
              size="small"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getEventIcon(event.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Tag color={getEventColor(event.type)}>
                        {EVENT_TYPE_LABELS[event.type] || event.type}
                      </Tag>
                      {event.source !== undefined && (
                        <Tag
                          style={{
                            backgroundColor: SOURCE_COLORS[event.source] + "20",
                            color: SOURCE_COLORS[event.source],
                            borderColor: SOURCE_COLORS[event.source],
                          }}
                        >
                          {SOURCE_NAMES[event.source]}
                        </Tag>
                      )}
                      <Badge
                        status="processing"
                        text={
                          <span className="text-xs text-base-content/60">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        }
                      />
                    </div>

                    <div className="space-y-1 text-sm">
                      {event.user && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>User:</span>
                          <Address address={event.user} size="sm" />
                        </div>
                      )}

                      {event.adapter && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>Adapter:</span>
                          <Address address={event.adapter} size="sm" />
                        </div>
                      )}

                      {event.uniqueId && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>Unique ID:</span>
                          <code className={`text-xs px-2 py-1 rounded ${styles.eventCode}`}>
                            {formatUniqueId(event.uniqueId)}
                          </code>
                        </div>
                      )}

                      {event.qualityScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>Quality Score:</span>
                          <span className={`font-semibold ${styles.eventText}`}>{event.qualityScore}</span>
                        </div>
                      )}

                      {event.reason && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>Reason:</span>
                          <span className={`text-warning ${styles.eventText}`}>{event.reason}</span>
                        </div>
                      )}

                      {event.numerator !== undefined && event.denominator !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>Confidence:</span>
                          <span className={`font-semibold ${styles.eventText}`}>
                            {((Number(event.numerator) / Number(event.denominator)) * 100).toFixed(2)}%
                          </span>
                        </div>
                      )}

                      {event.amount !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className={styles.eventTextMuted}>Amount:</span>
                          <span className={`font-semibold ${styles.eventText}`}>
                            {(Number(event.amount) / 1e18).toFixed(2)} HMT
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className={styles.eventTextMuted}>Block:</span>
                        <span className={`font-mono text-xs ${styles.eventText}`}>{event.blockNumber.toString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href={getExplorerUrl(targetNetwork.id, event.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="text-xs">View</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </a>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

