import { type ConfigPlugin, withPlugins } from '@expo/config-plugins';

import { withWidgetFiles } from './widget/withWidgetFiles';
import { withWidgetPodfile } from './widget/withWidgetPodfile';
import { withWidgetXcodeTarget } from './widget/withWidgetXcodeTarget';

export interface WidgetTargetProps {
  name: string;
  widgetDir: string;
  deploymentTarget?: string;
  fonts?: string[];
  pods?: Array<{ name: string; version?: string }>;
  appGroupIdentifier?: string;
  mode?: string;
}

export const withWidgetTarget: ConfigPlugin<WidgetTargetProps> = (config, props) =>
  withPlugins(config, [
    [withWidgetFiles, props],
    [withWidgetPodfile, props],
    [withWidgetXcodeTarget, props],
  ]);
