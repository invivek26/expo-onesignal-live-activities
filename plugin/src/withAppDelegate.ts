import { withAppDelegate as withAppDelegateMod, type ConfigPlugin } from '@expo/config-plugins';
import {
  addSwiftImports,
  insertContentsInsideSwiftFunctionBlock,
} from '@expo/config-plugins/build/ios/codeMod';

export const withAppDelegate: ConfigPlugin = (config) => {
  return withAppDelegateMod(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('expo-onesignal-live-activities requires a Swift AppDelegate');
    }

    let contents = config.modResults.contents;

    contents = addSwiftImports(contents, ['ExpoOnesignalLiveActivities']);

    if (!contents.includes('LiveActivityCoordinator.shared.start()')) {
      contents = insertContentsInsideSwiftFunctionBlock(
        contents,
        'application(_:didFinishLaunchingWithOptions:)',
        '    LiveActivityCoordinator.shared.start()',
        { position: 'tail' }
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
