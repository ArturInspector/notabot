"use client";

import React from "react";
import { Card } from "antd";
import { motion } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import styles from "../page.module.css";

export const DecentralizedPoHArticle: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card 
        className={styles.articleCard}
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <div className={styles.articleContent}>
          <h2 className={styles.articleTitle}>
            Decentralized Proof-of-Humanity: Why Independence Matters
          </h2>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            Traditional centralized identity systems create single points of failure. 
            One compromised database, one breached API, one corrupted authority—and the entire 
            verification system collapses. <strong>Decentralized Proof-of-Humanity</strong> solves 
            this by aggregating multiple independent verification sources.
          </p>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            <strong style={{ color: "var(--text)" }}>Independence is key.</strong> When verification sources operate independently— 
            different protocols, different consensus mechanisms, different trust models—they provide 
            uncorrelated evidence. This independence is what makes Bayesian aggregation mathematically sound.
          </p>

          <div className={styles.humorNote}>
            Top source by confidence? Worldcoin. But is Sam Altman human? The math says yes, 
            but we're keeping an eye on it.
          </div>

          <h3 style={{ fontSize: "24px", fontWeight: 600, marginTop: "32px", marginBottom: "16px", color: "var(--text)" }}>
            The Mathematics of Independence
          </h3>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            When sources are independent, the probability that a user is human given multiple 
            verifications follows Bayes' theorem:
          </p>

          <BlockMath math="P(Human | E_1, E_2, ..., E_n) = 1 - \prod_{i=1}^{n}(1 - P_i)" />

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            Each source contributes independently. If Worldcoin says 99.9% human, Gitcoin says 90.9%, 
            and PoH says 79.5%, the combined probability is:
          </p>

          <BlockMath math="P_{final} = 1 - (1-0.999)(1-0.909)(1-0.795) = 99.999\%" />

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            <strong style={{ color: "var(--text)" }}>This exponential improvement only works if sources are truly independent.</strong> 
            If two sources share the same backend or trust the same authority, their verifications 
            become correlated, and the math breaks down.
          </p>

          <h3 style={{ fontSize: "24px", fontWeight: 600, marginTop: "32px", marginBottom: "16px", color: "var(--text)" }}>
            Why This Approach Increases Confidence
          </h3>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            <strong style={{ color: "var(--text)" }}>1. Redundancy:</strong> If one source fails or is compromised, others continue 
            providing verification. No single point of failure.
          </p>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            <strong style={{ color: "var(--text)" }}>2. Cross-validation:</strong> Multiple independent sources agreeing on a user's 
            humanity provides stronger evidence than any single source alone.
          </p>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            <strong style={{ color: "var(--text)" }}>3. Adaptive learning:</strong> When attacks are confirmed, confidence scores 
            update automatically. Sources with higher attack rates receive lower weights, making 
            the system self-improving.
          </p>

          <p className={styles.articleText} style={{ color: "var(--text)" }}>
            <strong style={{ color: "var(--text)" }}>4. Credible neutrality:</strong> No single source controls the system. 
            The aggregation mechanism is transparent and on-chain, verifiable by anyone.
          </p>

          <p className={styles.articleText} style={{ marginTop: "32px", fontStyle: "italic", color: "var(--muted)" }}>
            This is not security through obscurity. The mathematics are public, the code is on-chain, 
            and the metrics are transparent. Real security comes from sound design, not hidden mechanisms.
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

