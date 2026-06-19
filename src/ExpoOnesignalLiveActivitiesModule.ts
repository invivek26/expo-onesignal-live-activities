import { NativeModule, requireOptionalNativeModule } from 'expo';

type ExpoOnesignalLiveActivitiesModuleEvents = {
  onLiveActivityToken: (event: { activityId: string; token: string }) => void;
};

declare class ExpoOnesignalLiveActivitiesModule extends NativeModule<ExpoOnesignalLiveActivitiesModuleEvents> {
  startObserving(): Promise<void>;
  stopObserving(): Promise<void>;
  updateLiveActivity(
    matchKey: string,
    matchValue: string,
    contentState: Record<string, unknown>
  ): Promise<void>;
  endLiveActivity(matchKey: string, matchValue: string): Promise<void>;
  listActiveActivities(): Promise<Record<string, unknown>[]>;
  isLiveActivitiesSupported(): Promise<boolean>;
}

export default requireOptionalNativeModule<ExpoOnesignalLiveActivitiesModule>(
  'ExpoOnesignalLiveActivities'
);
