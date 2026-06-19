import { withEntitlementsPlist, type ConfigPlugin } from '@expo/config-plugins';

export const withEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults['aps-environment'] = config.modResults['aps-environment'] ?? 'development';
    return config;
  });
};
