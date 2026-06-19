import { useCallback, useEffect, useRef, useState } from 'react';

import type { LiveActivityInfo } from '../ExpoOnesignalLiveActivities.types';
import { listActiveActivities } from '../api';

export function useLiveActivities(pollIntervalMs?: number): {
  activities: LiveActivityInfo[];
  refresh: () => Promise<void>;
} {
  const [activities, setActivities] = useState<LiveActivityInfo[]>([]);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    const result = await listActiveActivities();
    setActivities(result);
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      refresh();
    }

    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(refresh, pollIntervalMs);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [pollIntervalMs, refresh]);

  return { activities, refresh };
}
