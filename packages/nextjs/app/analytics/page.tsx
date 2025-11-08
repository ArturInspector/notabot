"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import { motion } from "framer-motion";
import { useSourceMetrics } from "~~/hooks/useSourceMetrics";
import { useVerificationHistory } from "~~/hooks/useVerificationHistory";
import { SourceMetricsTable } from "./_components/SourceMetricsTable";
import { DecentralizedPoHArticle } from "./_components/DecentralizedPoHArticle";
import { SimpleChart } from "./_components/SimpleChart";
import { TimeSeriesChart } from "./_components/TimeSeriesChart";
import { TopAddresses } from "./_components/TopAddresses";
import { DataSourceInfo } from "./_components/DataSourceInfo";
import styles from "./page.module.css";

const SOURCE_COLORS: Record<number, string> = {
  0: "#7b61ff",
  1: "#34eeb6",
  2: "#ffcf72",
  3: "#ff8863",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AnalyticsPage: React.FC = () => {
  const { metrics, isLoading, error } = useSourceMetrics();
  const { timeSeries, topAddresses } = useVerificationHistory();

  const totalVerifications = metrics.reduce((sum, m) => sum + m.totalVerifications, 0);
  const totalAttacks = metrics.reduce((sum, m) => sum + m.confirmedAttacks, 0);
  const avgConfidence = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.confidence, 0) / metrics.length
    : 0;

  return (
    <div className={styles.analyticsPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>Analytics & Insights</h1>
          <p className={styles.heroSubtitle}>
            Real-time metrics, source performance, and the mathematics behind decentralized Proof-of-Humanity
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <div className={styles.content}>
        {/* Overview Stats */}
        <motion.section
          className={styles.section}
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <motion.div
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={styles.perspectiveContainer}
              >
                <Card className={`${styles.glassCard} ${styles.card3D} ${styles.glowEffect}`}>
                  <Statistic
                    title={<span className={styles.metricLabel}>Total Verifications</span>}
                    value={totalVerifications}
                    valueStyle={{ 
                      background: "linear-gradient(135deg, #7b61ff 0%, #34eeb6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: "36px", 
                      fontWeight: 700 
                    }}
                    loading={isLoading}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={8}>
              <motion.div
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className={styles.perspectiveContainer}
              >
                <Card className={`${styles.glassCard} ${styles.card3D} ${styles.glowEffect}`}>
                  <Statistic
                    title={<span className={styles.metricLabel}>Confirmed Attacks</span>}
                    value={totalAttacks}
                    valueStyle={{ 
                      color: totalAttacks > 0 ? "#ff8863" : "#34eeb6", 
                      fontSize: "36px", 
                      fontWeight: 700,
                      textShadow: totalAttacks > 0 ? "0 0 20px rgba(255, 136, 99, 0.5)" : "0 0 20px rgba(52, 238, 182, 0.5)"
                    }}
                    loading={isLoading}
                  />
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={8}>
              <motion.div
                variants={fadeUp}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                className={styles.perspectiveContainer}
              >
                <Card className={`${styles.glassCard} ${styles.card3D} ${styles.glowEffect}`}>
                  <Statistic
                    title={<span className={styles.metricLabel}>Avg Confidence</span>}
                    value={(avgConfidence * 100).toFixed(2)}
                    suffix="%"
                    valueStyle={{ 
                      background: "linear-gradient(135deg, #34eeb6 0%, #7b61ff 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontSize: "36px", 
                      fontWeight: 700 
                    }}
                    loading={isLoading}
                  />
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.section>

        {/* Error State */}
        {error && (
          <motion.section
            className={styles.section}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className={styles.glassCard} style={{ borderColor: "#ff8863" }}>
              <p style={{ color: "#ff8863", margin: 0 }}>
                Error loading metrics: {error.message}
              </p>
            </Card>
          </motion.section>
        )}

        {/* Source Metrics Table */}
        {!error && (
          <SourceMetricsTable metrics={metrics} isLoading={isLoading} />
        )}

        {/* Charts Section */}
        {!error && metrics.length > 0 && (
          <motion.section
            className={styles.section}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <TimeSeriesChart
                  title="Verifications Over Time"
                  data={timeSeries}
                />
              </Col>
              <Col xs={24} lg={8}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <SimpleChart
                    title="Confidence Scores"
                    data={metrics
                      .sort((a, b) => b.confidence - a.confidence)
                      .map(m => ({
                        label: m.name,
                        value: m.confidence * 100,
                        color: SOURCE_COLORS[m.sourceId],
                      }))}
                  />
                  <DataSourceInfo />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <SimpleChart
                  title="Verifications by Source"
                  data={metrics.map(m => ({
                    label: m.name,
                    value: m.totalVerifications,
                    color: SOURCE_COLORS[m.sourceId],
                  }))}
                />
              </Col>
              <Col xs={24} md={12}>
                <TopAddresses addresses={topAddresses} />
              </Col>
            </Row>
          </motion.section>
        )}

        {/* Decentralized PoH Article */}
        <DecentralizedPoHArticle />
      </div>
    </div>
  );
};

export default AnalyticsPage;

