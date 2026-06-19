import { type ConfigPlugin, withDangerousMod } from '@expo/config-plugins';
import fs from 'fs';
import path from 'path';

import type { WidgetTargetProps } from '../withWidgetTarget';

export const withWidgetFiles: ConfigPlugin<WidgetTargetProps> = (config, props) =>
  withDangerousMod(config, [
    'ios',
    async (config) => {
      const { name, widgetDir, fonts, appGroupIdentifier } = props;
      const projectRoot = config.modRequest.projectRoot;
      const iosDir = path.join(projectRoot, 'ios');
      const targetDir = path.join(iosDir, name);
      const sourceDir = path.resolve(projectRoot, widgetDir);

      fs.mkdirSync(targetDir, { recursive: true });

      if (fs.existsSync(sourceDir)) {
        copyDirectorySync(sourceDir, targetDir);
      } else {
        throw new Error(
          `expo-onesignal-live-activities: widgetDir "${widgetDir}" does not exist. ` +
            'Run "npx expo-onesignal-live-activities init" to create template files.'
        );
      }

      const fontFileNames = (fonts ?? [])
        .map((f) => path.basename(f))
        .filter((f) => f.endsWith('.ttf') || f.endsWith('.otf'));
      const infoPlist = generateInfoPlist(name, fontFileNames);
      fs.writeFileSync(path.join(targetDir, `${name}-Info.plist`), infoPlist);

      const entitlements = generateEntitlements(appGroupIdentifier);
      fs.writeFileSync(path.join(targetDir, `${name}.entitlements`), entitlements);

      if (fonts?.length) {
        for (const fontPath of fonts) {
          const absPath = path.resolve(projectRoot, fontPath);
          if (fs.existsSync(absPath)) {
            const fontName = path.basename(absPath);
            fs.copyFileSync(absPath, path.join(targetDir, fontName));
          }
        }
      }

      return config;
    },
  ]);

function copyDirectorySync(src: string, dest: string): void {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirectorySync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateInfoPlist(targetName: string, fontFileNames: string[]): string {
  let fontsXml = '';
  if (fontFileNames.length > 0) {
    const items = fontFileNames.map((f) => `    <string>${f}</string>`).join('\n');
    fontsXml = `
  <key>UIAppFonts</key>
  <array>
${items}
  </array>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>${targetName}</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleVersion</key>
  <string>$(CURRENT_PROJECT_VERSION)</string>
  <key>CFBundleShortVersionString</key>
  <string>$(MARKETING_VERSION)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>${fontsXml}
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>`;
}

function generateEntitlements(appGroupIdentifier?: string): string {
  let groupsXml = '';
  if (appGroupIdentifier) {
    groupsXml = `
  <key>com.apple.security.application-groups</key>
  <array>
    <string>${appGroupIdentifier}</string>
  </array>`;
  }

  // Widget extensions do NOT need aps-environment — they don't receive push
  // notifications directly. Only the main app needs it (for push-to-start).
  // The extension only needs the App Group to share data with the main app.
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>${groupsXml}
</dict>
</plist>`;
}
