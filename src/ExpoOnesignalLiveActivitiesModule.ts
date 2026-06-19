import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoOnesignalLiveActivitiesModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoOnesignalLiveActivitiesModule>('ExpoOnesignalLiveActivities');
