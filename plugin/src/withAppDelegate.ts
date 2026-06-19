import { withAppDelegate as withAppDelegateMod, type ConfigPlugin } from '@expo/config-plugins';
import { insertContentsInsideSwiftFunctionBlock } from '@expo/config-plugins/build/ios/codeMod';

const IMPORT_LINE = 'internal import ExpoOnesignalLiveActivities';

export const withAppDelegate: ConfigPlugin = (config) => {
  return withAppDelegateMod(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error('expo-onesignal-live-activities requires a Swift AppDelegate');
    }

    let contents = config.modResults.contents;

    if (!contents.includes(IMPORT_LINE)) {
      const firstImportIndex = contents.search(/^import /m);
      if (firstImportIndex !== -1) {
        contents =
          contents.slice(0, firstImportIndex) +
          IMPORT_LINE +
          '\n' +
          contents.slice(firstImportIndex);
      }
    }

    if (!contents.includes('LiveActivityCoordinator.shared.start()')) {
      contents = insertContentsInsideSwiftFunctionBlock(
        contents,
        'application(_:didFinishLaunchingWithOptions:)',
        '\n    if #available(iOS 16.2, *) {\n      Task { await LiveActivityCoordinator.shared.start() }\n    }',
        { position: 'tailBeforeLastReturn' }
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
