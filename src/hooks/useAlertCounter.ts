import { useState, useEffect, useCallback } from "react";
import { useGetAlertsHistoricalCountQuery } from "../features/alerts/services/alertsApi";

export function useAlertCounter() {
  const [unreadCount, setUnreadCount] = useState(0);

  const getCountFilters = useCallback(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const year = oneHourAgo.getFullYear();
    const month = String(oneHourAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneHourAgo.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      _fecha_hora: dateStr,
    };
  }, []);

  const { data, refetch } = useGetAlertsHistoricalCountQuery(
    getCountFilters(),
    {
      pollingInterval: 30000, 
    }
  );

  useEffect(() => {
    if (data?.total_records !== undefined) {
      setUnreadCount(data.total_records);
    }
  }, [data]);

  const refreshCount = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    unreadCount,
    refreshCount,
  };
}