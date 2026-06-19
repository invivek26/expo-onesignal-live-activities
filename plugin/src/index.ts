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

    const bundleIdentifier = config.ios?.bundleIdentifier ?? '';
    const extensionBundleId = `${bundleIdentifier}.${widgetTarget.name}`;

    const existingExtensions: any[] =
      config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? [];

    const alreadyRegistered = existingExtensions.some(
      (ext: any) => ext.targetName === widgetTarget.name
    );

    if (!alreadyRegistered) {
      const entitlements: Record<string, any> = {};
      if (appGroupIdentifier) {
        entitlements['com.apple.security.application-groups'] = [appGroupIdentifier];
      }

      config.extra = {
        ...config.extra,
        eas: {
          ...config.extra?.eas,
          build: {
            ...config.extra?.eas?.build,
            experimental: {
              ...config.extra?.eas?.build?.experimental,
              ios: {
                ...config.extra?.eas?.build?.experimental?.ios,
                appExtensions: [
                  ...existingExtensions,
                  {
                    targetName: widgetTarget.name,
                    bundleIdentifier: extensionBundleId,
                    entitlements,
                  },
                ],
              },
            },
          },
        },
      };
    }
  }

  return config;
};

const pkg = require('../../package.json');
export default createRunOncePlugin(withLiveActivities, pkg.name, pkg.version);
