#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WIDGET_DIR = 'widgets/live-activity';
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'live-activity');

function init() {
  const targetDir = path.join(process.cwd(), WIDGET_DIR);

  if (fs.existsSync(targetDir)) {
    console.log(`Warning: ${WIDGET_DIR}/ already exists. Skipping scaffold.`);
    process.exit(0);
  }

  if (!fs.existsSync(TEMPLATE_DIR)) {
    console.error(
      `Error: Template directory not found at ${TEMPLATE_DIR}. ` +
        'This is a bug in expo-onesignal-live-activities — please report it.'
    );
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const templates = fs.readdirSync(TEMPLATE_DIR);
  for (const file of templates) {
    const srcPath = path.join(TEMPLATE_DIR, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, path.join(targetDir, file));
    }
  }

  console.log(`Created ${WIDGET_DIR}/ with Live Activity widget templates.`);
  console.log('');
  console.log('Next steps:');
  console.log('');
  console.log('1. Add to your app.json or app.config.ts plugins array:');
  console.log('');
  console.log('   ["expo-onesignal-live-activities", {');
  console.log('     "widgetTarget": {');
  console.log('       "name": "MyAppLiveActivity",');
  console.log('       "widgetDir": "./widgets/live-activity"');
  console.log('     }');
  console.log('   }]');
  console.log('');
  console.log('2. Run: npx expo prebuild -p ios --clean');
  console.log('');
  console.log('3. Customize the SwiftUI in widgets/live-activity/');
  console.log('');
}

init();
