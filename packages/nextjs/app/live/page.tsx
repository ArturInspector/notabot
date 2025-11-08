"use client";

import React, { useState } from "react";
import { Card, Typography, Space, Badge } from "antd";
import { motion } from "framer-motion";
import { useLiveEvents } from "~~/hooks/useLiveEvents";
import { LiveEventFeed } from "./_components/LiveEventFeed";
import { RealTimeStats } from "./_components/RealTimeStats";
import { EventFilters } from "./_components/EventFilters";
import { useBlockNumber } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { RadioIcon } from "@heroicons/react/24/solid";
import styles from "./page.module.css";

const { Title, Text } = Typography;

const LivePage: React.FC = () => {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { events, isLoading, error } = useLiveEvents(undefined, 100);
  const { data: currentBlock } = useBlockNumber({ watch: true });
  const { targetNetwork } = useTargetNetwork();

  return (
    <div className={styles.livePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.heroHeader}>
            <div className={styles.heroIcon}>
              <RadioIcon />
            </div>
            <div>
              <h1 className={styles.heroTitle}>Live Contract Stream</h1>
              <p className={styles.heroSubtitle}>
                Real-time events from MainAggregator contract
              </p>
            </div>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <Badge
                status={isLoading ? "processing" : "success"}
                text={
                  <span>
                    {isLoading ? "Loading..." : "Live"}
                  </span>
                }
              />
            </div>
            {currentBlock && (
              <div className={styles.heroMetaItem}>
                <span>Current Block:</span>
                <span className="font-mono font-semibold">{currentBlock.toString()}</span>
              </div>
            )}
            <div className={styles.heroMetaItem}>
              <span>Network:</span>
              <span className="font-semibold">{targetNetwork.name}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <div className={styles.content}>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.section}
          >
            <Card className="bg-error/10 border-error">
              <Text className="text-error">
                Error loading events: {error.message}
              </Text>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={styles.section}
        >
          <RealTimeStats events={events} />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={styles.section}
        >
          <EventFilters filter={filter} onFilterChange={setFilter} />
        </motion.div>

        {/* Event Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.section}
        >
          <Card className="bg-transparent border-none shadow-none">
            <div className="flex items-center justify-between mb-4">
              <Title level={3} className="!mb-0" style={{ color: "var(--text)" }}>
                Event Feed
              </Title>
              <Text className="text-sm" style={{ color: "var(--muted)" }}>
                {events.length} {events.length === 1 ? "event" : "events"}
              </Text>
            </div>
            <LiveEventFeed events={events} isLoading={isLoading} filter={filter} />
          </Card>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={styles.section}
        >
          <Card 
            className="bg-transparent border-none shadow-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <Title level={4} className="!mb-4" style={{ color: "var(--text)" }}>
              About Live Stream
            </Title>
            <Space direction="vertical" size="middle" className="w-full">
              <Text style={{ color: "var(--text)" }}>
                This page shows real-time events from the MainAggregator contract. 
                Events are automatically updated as new blocks are mined on the blockchain.
              </Text>
              <div>
                <Text strong className="block mb-2" style={{ color: "var(--text)" }}>Event Types:</Text>
                <ul className="list-disc list-inside space-y-1" style={{ color: "var(--text)" }}>
                  <li><Text strong style={{ color: "var(--text)" }}>VerificationRegistered:</Text> <span style={{ color: "var(--muted)" }}>New human verification from a source</span></li>
                  <li><Text strong style={{ color: "var(--text)" }}>AnomalyDetected:</Text> <span style={{ color: "var(--muted)" }}>Suspicious pattern detected in user behavior</span></li>
                  <li><Text strong style={{ color: "var(--text)" }}>AttackConfirmed:</Text> <span style={{ color: "var(--muted)" }}>Confirmed Sybil attack from a source</span></li>
                  <li><Text strong style={{ color: "var(--text)" }}>AdapterAdded/Removed:</Text> <span style={{ color: "var(--muted)" }}>Changes to verification adapters</span></li>
                  <li><Text strong style={{ color: "var(--text)" }}>ConfidenceUpdated:</Text> <span style={{ color: "var(--muted)" }}>Source confidence scores updated</span></li>
                  <li><Text strong style={{ color: "var(--text)" }}>TokensRevoked:</Text> <span style={{ color: "var(--muted)" }}>HMT tokens revoked from a user</span></li>
                </ul>
              </div>
            </Space>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LivePage;

