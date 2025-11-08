"use client";

import React, { useMemo } from "react";
import { Card, Statistic, Row, Col } from "antd";
import { LiveEvent } from "~~/hooks/useLiveEvents";
import { SOURCE_NAMES, SOURCE_COLORS } from "~~/utils/liveUtils";
import { motion } from "framer-motion";
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import styles from "./RealTimeStats.module.css";

interface RealTimeStatsProps {
  events: LiveEvent[];
}

export const RealTimeStats: React.FC<RealTimeStatsProps> = ({ events }) => {
  const stats = useMemo(() => {
    const verifications = events.filter((e) => e.type === "VerificationRegistered").length;
    const anomalies = events.filter((e) => e.type === "AnomalyDetected").length;
    const attacks = events.filter((e) => e.type === "AttackConfirmed").length;
    
    const sourceCounts: Record<number, number> = {};
    events
      .filter((e) => e.type === "VerificationRegistered" && e.source !== undefined)
      .forEach((e) => {
        sourceCounts[e.source!] = (sourceCounts[e.source!] || 0) + 1;
      });

    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentVerifications = events.filter(
      (e) => e.type === "VerificationRegistered" && e.timestamp * 1000 > last24h
    ).length;

    return {
      totalVerifications: verifications,
      recentVerifications,
      anomalies,
      attacks,
      sourceCounts,
    };
  }, [events]);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={styles.glassCard}>
            <Statistic
              title="Total Verifications"
              value={stats.totalVerifications}
              prefix={<CheckCircleIcon className="w-5 h-5 text-green-500" />}
              valueStyle={{ color: "#34eeb6" }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className={styles.glassCard}>
            <Statistic
              title="Last 24h"
              value={stats.recentVerifications}
              valueStyle={{ color: "#7b61ff" }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className={styles.glassCard}>
            <Statistic
              title="Anomalies"
              value={stats.anomalies}
              prefix={<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
              valueStyle={{ color: "#ffcf72" }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className={styles.glassCard}>
            <Statistic
              title="Confirmed Attacks"
              value={stats.attacks}
              prefix={<XCircleIcon className="w-5 h-5 text-red-500" />}
              valueStyle={{ color: "#ff8863" }}
            />
          </Card>
        </motion.div>
      </Col>

      {Object.keys(stats.sourceCounts).length > 0 && (
        <Col xs={24}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className={styles.glassCard}>
              <h3 className={styles.statsTitle}>By Source</h3>
              <Row gutter={[16, 16]}>
                {Object.entries(stats.sourceCounts).map(([source, count]) => (
                  <Col xs={12} sm={6} key={source}>
                    <div className="text-center">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: SOURCE_COLORS[Number(source)] }}
                      >
                        {count}
                      </div>
                      <div className={styles.statsLabel}>
                        {SOURCE_NAMES[Number(source)]}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </motion.div>
        </Col>
      )}
    </Row>
  );
};

