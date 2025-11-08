import { useLiveEvents } from "./useLiveEvents";
import { useMemo } from "react";

export interface TimeSeriesData {
  date: string;
  timestamp: number;
  verifications: number;
  bySource: Record<number, number>;
}

export interface TopAddress {
  address: string;
  verifications: number;
  sources: number[];
  lastVerification: number;
}

export const useVerificationHistory = () => {
  const { events } = useLiveEvents(undefined, 1000); // Больше событий для истории

  const timeSeries = useMemo<TimeSeriesData[]>(() => {
    const verificationEvents = events.filter(
      (e) => e.type === "VerificationRegistered"
    );

    // Группируем по дням
    const grouped: Record<string, { count: number; bySource: Record<number, number> }> = {};

    verificationEvents.forEach((event) => {
      const date = new Date(event.timestamp * 1000);
      const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!grouped[dayKey]) {
        grouped[dayKey] = { count: 0, bySource: {} };
      }

      grouped[dayKey].count++;
      if (event.source !== undefined) {
        grouped[dayKey].bySource[event.source] =
          (grouped[dayKey].bySource[event.source] || 0) + 1;
      }
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        timestamp: new Date(date).getTime() / 1000,
        verifications: data.count,
        bySource: data.bySource,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-30); // Последние 30 дней
  }, [events]);

  const topAddresses = useMemo<TopAddress[]>(() => {
    const verificationEvents = events.filter(
      (e) => e.type === "VerificationRegistered" && e.user
    );

    const addressMap: Record<
      string,
      { count: number; sources: Set<number>; lastTime: number }
    > = {};

    verificationEvents.forEach((event) => {
      if (!event.user) return;

      if (!addressMap[event.user]) {
        addressMap[event.user] = {
          count: 0,
          sources: new Set(),
          lastTime: event.timestamp,
        };
      }

      addressMap[event.user].count++;
      if (event.source !== undefined) {
        addressMap[event.user].sources.add(event.source);
      }
      if (event.timestamp > addressMap[event.user].lastTime) {
        addressMap[event.user].lastTime = event.timestamp;
      }
    });

    return Object.entries(addressMap)
      .map(([address, data]) => ({
        address,
        verifications: data.count,
        sources: Array.from(data.sources),
        lastVerification: data.lastTime,
      }))
      .sort((a, b) => b.verifications - a.verifications)
      .slice(0, 10); // Топ 10
  }, [events]);

  return {
    timeSeries,
    topAddresses,
    isLoading: false,
  };
};

