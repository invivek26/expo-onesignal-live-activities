import { type ConfigPlugin, withDangerousMod } from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';

import type { WidgetTargetProps } from '../withWidgetTarget';

const PODFILE_SENTINEL = '# expo-onesignal-live-activities widget target';

export const withWidgetPodfile: ConfigPlugin<WidgetTargetProps> = (config, props) =>
  withDangerousMod(config, [
    'ios',
    async (config) => {
      const { name, pods } = props;
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');

      if (!fs.existsSync(podfilePath)) return config;
      let podfile = fs.readFileSync(podfilePath, 'utf-8');
      if (podfile.includes(PODFILE_SENTINEL)) return config;

      const podLines = [`  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'`];
      if (pods?.length) {
        for (const p of pods) {
          const version = p.version ? `, '${p.version}'` : '';
          podLines.push(`  pod '${p.name}'${version}`);
        }
      }

      const targetBlock = `
${PODFILE_SENTINEL}
target '${name}' do
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
${podLines.join('\n')}
end
`;
      podfile += targetBlock;
      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
