import {
  startObserving,
  stopObserving,
  updateLiveActivity,
  endLiveActivity,
  listActiveActivities,
  isLiveActivitiesSupported,
} from '../api';

jest.mock('../ExpoOnesignalLiveActivitiesModule', () => ({
  __esModule: true,
  default: null,
}));

describe('API null-guard behavior', () => {
  it('startObserving resolves without error', async () => {
    await expect(startObserving()).resolves.toBeUndefined();
  });

  it('stopObserving resolves without error', async () => {
    await expect(stopObserving()).resolves.toBeUndefined();
  });

  it('updateLiveActivity resolves without error', async () => {
    await expect(
      updateLiveActivity('orderId', '123', { status: 'delivered' })
    ).resolves.toBeUndefined();
  });

  it('endLiveActivity resolves without error', async () => {
    await expect(endLiveActivity('orderId', '123')).resolves.toBeUndefined();
  });

  it('listActiveActivities returns empty array', async () => {
    const result = await listActiveActivities();
    expect(result).toEqual([]);
  });

  it('isLiveActivitiesSupported returns false', async () => {
    const result = await isLiveActivitiesSupported();
    expect(result).toBe(false);
  });
});
