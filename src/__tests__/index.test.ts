import * as ExpoOnesignalLiveActivities from '../index';

jest.mock('../ExpoOnesignalLiveActivitiesModule', () => ({
  __esModule: true,
  default: null,
}));

describe('barrel exports', () => {
  it('exports all API functions', () => {
    expect(ExpoOnesignalLiveActivities.startObserving).toBeDefined();
    expect(ExpoOnesignalLiveActivities.stopObserving).toBeDefined();
    expect(ExpoOnesignalLiveActivities.updateLiveActivity).toBeDefined();
    expect(ExpoOnesignalLiveActivities.endLiveActivity).toBeDefined();
    expect(ExpoOnesignalLiveActivities.listActiveActivities).toBeDefined();
    expect(ExpoOnesignalLiveActivities.isLiveActivitiesSupported).toBeDefined();
  });

  it('exports hooks', () => {
    expect(ExpoOnesignalLiveActivities.useLiveActivityToken).toBeDefined();
    expect(ExpoOnesignalLiveActivities.useLiveActivities).toBeDefined();
  });
});
