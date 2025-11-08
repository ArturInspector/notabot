"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "../page.module.css";

interface SimpleChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className={styles.glassCard}>
      <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "var(--text)" }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "var(--text)", fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: "14px", color: "var(--muted)", fontFamily: "monospace" }}>
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className={styles.confidenceBar}>
              <motion.div
                className={styles.confidenceFill}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                style={{
                  background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}cc 100%)`,
                  boxShadow: `0 0 12px ${item.color}60`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

