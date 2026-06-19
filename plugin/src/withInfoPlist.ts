import { withInfoPlist as withInfoPlistMod, type ConfigPlugin } from '@expo/config-plugins';

type InfoPlistOptions = {
  activityIdKey: string;
  frequentUpdates: boolean;
};

export const withInfoPlist: ConfigPlugin<InfoPlistOptions> = (config, { activityIdKey, frequentUpdates }) => {
  return withInfoPlistMod(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true;
    if (frequentUpdates) {
      config.modResults.NSSupportsLiveActivitiesFrequentUpdates = true;
    }
    config.modResults.OneSignalLiveActivityIdKey = activityIdKey;
    return config;
  });
};
