"use client";

import React from "react";
import { Card, Table, Tag } from "antd";
import { motion } from "framer-motion";
import { SourceMetric } from "~~/hooks/useSourceMetrics";
import styles from "../page.module.css";

interface SourceMetricsTableProps {
  metrics: SourceMetric[];
  isLoading: boolean;
}

const SOURCE_COLORS: Record<number, string> = {
  0: "#7b61ff",
  1: "#34eeb6",
  2: "#ffcf72",
  3: "#ff8863",
};

export const SourceMetricsTable: React.FC<SourceMetricsTableProps> = ({ metrics, isLoading }) => {
  const columns = [
    {
      title: "Source",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: SourceMetric) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: SOURCE_COLORS[record.sourceId],
              boxShadow: `0 0 12px ${SOURCE_COLORS[record.sourceId]}80`,
            }}
          />
          <span style={{ fontWeight: 600, color: "var(--text)" }}>{name}</span>
          {record.sourceId === 0 && (
            <Tag style={{ 
              background: "rgba(255, 207, 114, 0.15)", 
              borderColor: "rgba(255, 207, 114, 0.4)", 
              color: "#ffcf72",
              fontWeight: 600,
              boxShadow: "0 0 12px rgba(255, 207, 114, 0.2)"
            }}>
              Top performer
            </Tag>
          )}
          {record.name === "Worldcoin" && (
            <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.4)", fontStyle: "italic", marginLeft: "8px" }}>
              (humanity verified, allegedly)
            </span>
          )}
        </div>
      ),
    },
    {
      title: "TPR",
      dataIndex: "tpr",
      key: "tpr",
      render: (tpr: number) => (
        <span style={{ fontFamily: "monospace", color: "var(--text)" }}>
          {(tpr * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      title: "FPR",
      dataIndex: "fpr",
      key: "fpr",
      render: (fpr: number) => (
        <span style={{ fontFamily: "monospace", color: fpr > 0.05 ? "#ff8863" : "var(--text)" }}>
          {(fpr * 100).toFixed(2)}%
        </span>
      ),
    },
    {
      title: "Confidence",
      dataIndex: "confidence",
      key: "confidence",
      render: (confidence: number) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "150px" }}>
          <div className={styles.confidenceBar}>
            <div
              className={styles.confidenceFill}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <span style={{ fontFamily: "monospace", color: "var(--text)", fontSize: "13px" }}>
            {(confidence * 100).toFixed(2)}%
          </span>
        </div>
      ),
    },
    {
      title: "Verifications",
      dataIndex: "totalVerifications",
      key: "totalVerifications",
      render: (count: number) => (
        <span style={{ fontFamily: "monospace", color: "var(--text)" }}>
          {count.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Confirmed Attacks",
      dataIndex: "confirmedAttacks",
      key: "confirmedAttacks",
      render: (attacks: number, record: SourceMetric) => (
        <div>
          <span style={{ fontFamily: "monospace", color: attacks > 0 ? "#ff8863" : "var(--text)" }}>
            {attacks}
          </span>
          {record.totalVerifications > 0 && (
            <span style={{ fontSize: "12px", color: "var(--muted)", marginLeft: "8px" }}>
              ({(record.attackRate * 100).toFixed(2)}%)
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={styles.glassCard}>
        <h2 className={styles.sectionTitle}>Source Performance Metrics</h2>
        <p className={styles.sectionSubtitle}>
          Real-time statistics for each verification source. Confidence scores adapt automatically based on confirmed attacks.
        </p>
        <div className={styles.tableWrapper}>
          <Table
            columns={columns}
            dataSource={metrics}
            loading={isLoading}
            rowKey="sourceId"
            pagination={false}
            className={styles.table}
            style={{ background: "transparent" }}
          />
        </div>
      </Card>
    </motion.div>
  );
};

