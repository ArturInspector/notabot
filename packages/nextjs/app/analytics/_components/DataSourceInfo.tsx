"use client";

import React from "react";
import { Card } from "antd";
import { motion } from "framer-motion";
import styles from "../page.module.css";

export const DataSourceInfo: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className={styles.glassCard}
        style={{
          background: "linear-gradient(135deg, rgba(123, 97, 255, 0.08) 0%, rgba(52, 238, 182, 0.04) 100%)",
          border: "1px solid rgba(123, 97, 255, 0.2)",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "var(--text)" }}>
          Data Sources
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--text)" }}>
          <div>
            <strong style={{ color: "var(--text)" }}>Source Metrics:</strong>{" "}
            <span style={{ color: "var(--muted)" }}>
              Read directly from MainAggregator contract via <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>sourceConfidences</code> and <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>sourceStats</code> mappings
            </span>
          </div>
          <div>
            <strong style={{ color: "var(--text)" }}>Time Series:</strong>{" "}
            <span style={{ color: "var(--muted)" }}>
              Aggregated from <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" }}>VerificationRegistered</code> events (last 1000 events)
            </span>
          </div>
          <div>
            <strong style={{ color: "var(--text)" }}>Top Addresses:</strong>{" "}
            <span style={{ color: "var(--muted)" }}>
              Calculated from event history, grouped by user address
            </span>
          </div>
          <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>
            All data is on-chain and verifiable. No backend APIs, no centralized databases.
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

