"use client";

import React from "react";
import { Card, Table } from "antd";
import { motion } from "framer-motion";
import { TopAddress } from "~~/hooks/useVerificationHistory";
import { Address } from "~~/components/scaffold-eth";
import { SOURCE_NAMES, SOURCE_COLORS } from "~~/utils/liveUtils";
import { formatTimestamp } from "~~/utils/liveUtils";
import styles from "../page.module.css";

interface TopAddressesProps {
  addresses: TopAddress[];
}

export const TopAddresses: React.FC<TopAddressesProps> = ({ addresses }) => {
  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span style={{ fontFamily: "monospace", color: "var(--muted)", fontSize: "14px" }}>
          #{index + 1}
        </span>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (address: string) => <Address address={address as `0x${string}`} size="sm" />,
    },
    {
      title: "Verifications",
      dataIndex: "verifications",
      key: "verifications",
      render: (count: number) => (
        <span style={{ fontFamily: "monospace", color: "var(--text)", fontWeight: 600 }}>
          {count}
        </span>
      ),
    },
    {
      title: "Sources",
      dataIndex: "sources",
      key: "sources",
      render: (sources: number[]) => (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {sources.map((source) => (
            <span
              key={source}
              style={{
                fontSize: "11px",
                padding: "4px 8px",
                borderRadius: "6px",
                background: `${SOURCE_COLORS[source]}20`,
                color: SOURCE_COLORS[source],
                border: `1px solid ${SOURCE_COLORS[source]}40`,
                fontWeight: 600,
              }}
            >
              {SOURCE_NAMES[source]}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Last Activity",
      dataIndex: "lastVerification",
      key: "lastVerification",
      render: (timestamp: number) => (
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
          {formatTimestamp(timestamp)}
        </span>
      ),
    },
  ];

  if (addresses.length === 0) {
    return (
      <Card className={styles.glassCard}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "var(--text)" }}>
          Top Addresses
        </h3>
        <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>
          No verification data available yet
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={styles.glassCard}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "var(--text)" }}>
          Top Addresses by Verifications
        </h3>
        <div className={styles.tableWrapper}>
          <Table
            columns={columns}
            dataSource={addresses}
            rowKey="address"
            pagination={false}
            className={styles.table}
            style={{ background: "transparent" }}
          />
        </div>
      </Card>
    </motion.div>
  );
};

