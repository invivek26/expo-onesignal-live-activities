import type { ContentStateUpdate, LiveActivityInfo } from './ExpoOnesignalLiveActivities.types';
import ExpoOnesignalLiveActivitiesModule from './ExpoOnesignalLiveActivitiesModule';

export async function startObserving(): Promise<void> {
  await ExpoOnesignalLiveActivitiesModule?.startObserving();
}

export async function stopObserving(): Promise<void> {
  await ExpoOnesignalLiveActivitiesModule?.stopObserving();
}

export async function updateLiveActivity(
  matchKey: string,
  matchValue: string,
  contentState: ContentStateUpdate
): Promise<void> {
  await ExpoOnesignalLiveActivitiesModule?.updateLiveActivity(matchKey, matchValue, contentState);
}

export async function endLiveActivity(matchKey: string, matchValue: string): Promise<void> {
  await ExpoOnesignalLiveActivitiesModule?.endLiveActivity(matchKey, matchValue);
}

export async function listActiveActivities(): Promise<LiveActivityInfo[]> {
  return ((await ExpoOnesignalLiveActivitiesModule?.listActiveActivities()) ??
    []) as LiveActivityInfo[];
}

export async function isLiveActivitiesSupported(): Promise<boolean> {
  return (await ExpoOnesignalLiveActivitiesModule?.isLiveActivitiesSupported()) ?? false;
}
