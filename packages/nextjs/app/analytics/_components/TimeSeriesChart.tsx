"use client";

import React from "react";
import { Card } from "antd";
import { motion } from "framer-motion";
import { TimeSeriesData } from "~~/hooks/useVerificationHistory";
import styles from "../page.module.css";

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title: string;
}

const SOURCE_COLORS: Record<number, string> = {
  0: "#7b61ff",
  1: "#34eeb6",
  2: "#ffcf72",
  3: "#ff8863",
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <Card className={styles.glassCard}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px", color: "var(--text)" }}>
          {title}
        </h3>
        <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>
          No data available yet
        </p>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.verifications), 1);
  const chartHeight = 300;

  return (
    <Card className={styles.glassCard}>
      <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "32px", color: "var(--text)" }}>
        {title}
      </h3>
      <div style={{ position: "relative", height: `${chartHeight}px`, display: "flex", alignItems: "flex-end", gap: "8px", paddingBottom: "40px" }}>
        {data.map((item, index) => {
          const height = (item.verifications / maxValue) * (chartHeight - 40);
          const date = new Date(item.date);
          const dayLabel = date.getDate();
          const monthLabel = date.toLocaleDateString("en-US", { month: "short" });

          return (
            <motion.div
              key={item.date}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${height}px`,
                  background: `linear-gradient(180deg, #7b61ff 0%, #34eeb6 100%)`,
                  borderRadius: "8px 8px 0 0",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(123, 97, 255, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scaleY(1.1)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(123, 97, 255, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scaleY(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(123, 97, 255, 0.3)";
                }}
                title={`${item.verifications} verifications on ${item.date}`}
              />
              <div style={{ fontSize: "11px", color: "var(--muted)", textAlign: "center" }}>
                <div style={{ fontWeight: 600 }}>{dayLabel}</div>
                <div>{monthLabel}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted)" }}>
          <span>Total: {data.reduce((sum, d) => sum + d.verifications, 0)}</span>
          <span>Avg/day: {Math.round(data.reduce((sum, d) => sum + d.verifications, 0) / data.length)}</span>
        </div>
      </div>
    </Card>
  );
};

