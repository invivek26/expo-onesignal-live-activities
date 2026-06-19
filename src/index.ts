export {
  startObserving,
  stopObserving,
  updateLiveActivity,
  endLiveActivity,
  listActiveActivities,
  isLiveActivitiesSupported,
} from './api';

export { useLiveActivityToken } from './hooks/useLiveActivityToken';
export { useLiveActivities } from './hooks/useLiveActivities';

export type {
  LiveActivityInfo,
  LiveActivityTokenEvent,
  ContentStateUpdate,
} from './ExpoOnesignalLiveActivities.types';
