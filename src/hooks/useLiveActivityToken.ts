import { useEffect, useState } from 'react';

import type { LiveActivityTokenEvent } from '../ExpoOnesignalLiveActivities.types';
import ExpoOnesignalLiveActivitiesModule from '../ExpoOnesignalLiveActivitiesModule';

export function useLiveActivityToken(): LiveActivityTokenEvent | null {
  const [tokenEvent, setTokenEvent] = useState<LiveActivityTokenEvent | null>(null);

  useEffect(() => {
    if (!ExpoOnesignalLiveActivitiesModule) return;

    const subscription = ExpoOnesignalLiveActivitiesModule.addListener(
      'onLiveActivityToken',
      (event: LiveActivityTokenEvent) => {
        setTokenEvent(event);
      }
    );

    return () => subscription.remove();
  }, []);

  return tokenEvent;
}
