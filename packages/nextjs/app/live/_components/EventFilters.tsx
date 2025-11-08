"use client";

import React from "react";
import { Card, Segmented } from "antd";
import { EVENT_TYPE_LABELS } from "~~/utils/liveUtils";
import styles from "./EventFilters.module.css";

interface EventFiltersProps {
  filter: string | undefined;
  onFilterChange: (filter: string | undefined) => void;
}

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: EVENT_TYPE_LABELS.VerificationRegistered, value: "VerificationRegistered" },
  { label: EVENT_TYPE_LABELS.AnomalyDetected, value: "AnomalyDetected" },
  { label: EVENT_TYPE_LABELS.AttackConfirmed, value: "AttackConfirmed" },
  { label: EVENT_TYPE_LABELS.AdapterAdded, value: "AdapterAdded" },
  { label: EVENT_TYPE_LABELS.AdapterRemoved, value: "AdapterRemoved" },
  { label: EVENT_TYPE_LABELS.ConfidenceUpdated, value: "ConfidenceUpdated" },
  { label: EVENT_TYPE_LABELS.TokensRevoked, value: "TokensRevoked" },
];

export const EventFilters: React.FC<EventFiltersProps> = ({ filter, onFilterChange }) => {
  return (
    <Card className={styles.glassCard}>
      <div className={styles.filterContainer}>
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>Event Filter</h3>
          <p className={styles.filterDescription}>
            Filter events by type
          </p>
        </div>
        <div className={styles.filterSegmented}>
          <Segmented
            options={FILTER_OPTIONS}
            value={filter || "all"}
            onChange={(value) => {
              onFilterChange(value === "all" ? undefined : (value as string));
            }}
            className={styles.segmented}
            block
          />
        </div>
      </div>
    </Card>
  );
};

