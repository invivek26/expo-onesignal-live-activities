import { createRunOncePlugin, type ConfigPlugin } from '@expo/config-plugins';

import { withInfoPlist } from './withInfoPlist';
import { withEntitlements } from './withEntitlements';
import { withAppDelegate } from './withAppDelegate';

export type LiveActivityPluginProps = {
  activityIdKey?: string;
  frequentUpdates?: boolean;
  widgetTargetName?: string;
};

const withLiveActivities: ConfigPlugin<LiveActivityPluginProps | void> = (config, props) => {
  const {
    activityIdKey = 'onesignal_activity_id',
    frequentUpdates = true,
  } = props ?? {};

  config = withInfoPlist(config, { activityIdKey, frequentUpdates });
  config = withEntitlements(config);
  config = withAppDelegate(config);

  return config;
};

const pkg = require('../../package.json');
export default createRunOncePlugin(withLiveActivities, pkg.name, pkg.version);
