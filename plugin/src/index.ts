import { createRunOncePlugin, type ConfigPlugin } from '@expo/config-plugins';

import { withAppDelegate } from './withAppDelegate';
import { withEntitlements } from './withEntitlements';
import { withInfoPlist } from './withInfoPlist';
import { withWidgetTarget } from './withWidgetTarget';

export type LiveActivityPluginProps = {
  mode?: 'development' | 'production';
  appGroupIdentifier?: string;
  activityIdKey?: string;
  frequentUpdates?: boolean;
  widgetTarget?: {
    name: string;
    widgetDir: string;
    deploymentTarget?: string;
    fonts?: string[];
    pods?: Array<{ name: string; version?: string }>;
  };
};

const withLiveActivities: ConfigPlugin<LiveActivityPluginProps | void> = (config, props) => {
  const {
    mode = 'development',
    appGroupIdentifier,
    activityIdKey = 'onesignal_activity_id',
    frequentUpdates = true,
    widgetTarget,
  } = props ?? {};

  config = withInfoPlist(config, { activityIdKey, frequentUpdates });
  config = withEntitlements(config);
  config = withAppDelegate(config);

  if (widgetTarget) {
    config = withWidgetTarget(config, {
      ...widgetTarget,
      appGroupIdentifier,
      mode,
    });
  }

  return config;
};

const pkg = require('../../package.json');
export default createRunOncePlugin(withLiveActivities, pkg.name, pkg.version);
