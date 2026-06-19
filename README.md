# expo-onesignal-live-activities

[![npm version](https://img.shields.io/npm/v/expo-onesignal-live-activities.svg)](https://www.npmjs.com/package/expo-onesignal-live-activities)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![iOS](https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2052+-000020.svg)](https://expo.dev)

Client-side Live Activity control for React Native + OneSignal. A drop-in replacement for `setupDefault()` that gives you token observation, activity updates, and lifecycle management from JavaScript.

> [!IMPORTANT]
> **iOS only.** All functions gracefully return no-ops on Android and web. Requires iOS 16.2+ and a physical device for full functionality.

## Features

- **Token observation** — automatically captures push-to-start tokens and registers them with OneSignal
- **Activity updates** — update Live Activity content state from JavaScript
- **Lifecycle management** — end activities and stop/start observation on demand
- **Activity listing** — enumerate all active activities with tokens, attributes, and state
- **React hooks** — `useLiveActivityToken` and `useLiveActivities` for declarative usage
- **Config plugin** — auto-configures Info.plist, entitlements, and AppDelegate
- **Widget scaffolding** — CLI + config plugin to create and manage the Widget Extension target automatically

## Prerequisites

- Expo SDK 52+
- OneSignal React Native SDK 5.x (`react-native-onesignal` or `onesignal-expo-plugin`)
- iOS 16.2+ deployment target

> [!WARNING]
> Do **not** call `OneSignal.LiveActivities.setupDefault()` in your app. This package replaces that functionality. Using both causes duplicate token registrations.
>
> Not compatible with Expo Go — use [EAS Build](https://docs.expo.dev/build/introduction/) or `npx expo prebuild`.

## Installation

```bash
npx expo install expo-onesignal-live-activities
```

### 1. Scaffold the widget UI (recommended)

Run the CLI to generate starter SwiftUI templates for your Live Activity widget:

```bash
npx expo-onesignal-live-activities
```

This creates `widgets/live-activity/` with four customizable SwiftUI files:

- `LiveActivityWidget.swift` — lock screen and Dynamic Island UI
- `LiveActivityWidgetBundle.swift` — widget bundle entry point
- `CachedImageView.swift` — App Group image cache helper
- `Theme.swift` — colors and layout constants

### 2. Configure the plugin

Add to your `app.json` or `app.config.ts`:

```json
{
  "expo": {
    "plugins": [
      ["expo-onesignal-live-activities", {
        "frequentUpdates": true,
        "widgetTarget": {
          "name": "MyAppLiveActivity",
          "widgetDir": "./widgets/live-activity"
        }
      }]
    ]
  }
}
```

The `widgetTarget` option tells the plugin to automatically create the Widget Extension target in your Xcode project during prebuild — no manual Xcode setup required.

### 3. Rebuild

```bash
npx expo prebuild -p ios --clean
```

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `activityIdKey` | `string` | `"onesignal_activity_id"` | Key in `DefaultLiveActivityAttributes.data` used to resolve the OneSignal activity ID |
| `frequentUpdates` | `boolean` | `true` | Enable `NSSupportsLiveActivitiesFrequentUpdates` in Info.plist |
| `mode` | `"development" \| "production"` | `"development"` | Sets the `aps-environment` entitlement |
| `appGroupIdentifier` | `string` | — | App Group ID for sharing data between the app and widget (e.g., `"group.com.myapp.onesignal"`) |
| `widgetTarget` | `object` | — | Configure automatic Widget Extension target creation (see below) |

#### `widgetTarget` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | **(required)** | Widget Extension target name (e.g., `"MyAppLiveActivity"`) |
| `widgetDir` | `string` | **(required)** | Path to your widget Swift files (e.g., `"./widgets/live-activity"`) |
| `deploymentTarget` | `string` | `"17.0"` | Minimum iOS deployment target for the widget |
| `fonts` | `string[]` | — | Font files to bundle with the widget (e.g., `["assets/fonts/Inter-Bold.ttf"]`) |
| `pods` | `Array<{name, version?}>` | — | Additional CocoaPods for the widget target |

## Quick Start

```typescript
import {
  startObserving,
  updateLiveActivity,
  endLiveActivity,
  isLiveActivitiesSupported,
} from 'expo-onesignal-live-activities';

// Start observing Live Activity tokens (call once at app startup)
await startObserving();

// Check if device supports Live Activities
const supported = await isLiveActivitiesSupported();

// Update a Live Activity's content state
await updateLiveActivity('orderId', 'order_123', {
  status: 'Out for delivery',
  eta: '12:30 PM',
  progress: 0.75,
});

// End a Live Activity
await endLiveActivity('orderId', 'order_123');
```

## API Reference

### Functions

#### `startObserving()`

Start observing Live Activity push tokens. Must be called once at app startup, or let the config plugin auto-start via AppDelegate injection.

When a new Live Activity is started via push-to-start, this captures its token and registers it with OneSignal automatically.

```typescript
await startObserving();
```

#### `stopObserving()`

Stop observing all Live Activity tokens. Cancels all observation tasks.

```typescript
await stopObserving();
```

#### `updateLiveActivity(matchKey, matchValue, contentState)`

Update the content state of a running Live Activity. Finds the activity where `attributes.data[matchKey]` equals `matchValue`.

```typescript
await updateLiveActivity('deliveryId', 'del_456', {
  status: 'Arriving soon',
  eta: '2 minutes',
  driverName: 'Alex',
});
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `matchKey` | `string` | Key in the activity's attributes data to match on |
| `matchValue` | `string` | Value to match |
| `contentState` | `Record<string, unknown>` | New content state fields |

#### `endLiveActivity(matchKey, matchValue)`

End a running Live Activity immediately.

```typescript
await endLiveActivity('deliveryId', 'del_456');
```

#### `listActiveActivities()`

Returns all currently active Live Activities with their attributes, content state, resolved OneSignal ID, and push token.

```typescript
const activities = await listActiveActivities();
// [
//   {
//     id: "AB12CD34-...",
//     resolvedActivityId: "order_123",
//     pushToken: "a1b2c3d4...",
//     attributes: { orderId: "order_123", storeName: "Pizza Place" },
//     contentState: { status: "Preparing", eta: "20 min" }
//   }
// ]
```

#### `isLiveActivitiesSupported()`

Check if the device supports Live Activities (iOS 16.2+, activities enabled in Settings).

```typescript
const supported = await isLiveActivitiesSupported();
```

### Hooks

#### `useLiveActivityToken()`

Subscribe to Live Activity token events. Returns the latest token event or `null`.

```typescript
import { useLiveActivityToken } from 'expo-onesignal-live-activities';

function MyComponent() {
  const tokenEvent = useLiveActivityToken();

  useEffect(() => {
    if (tokenEvent) {
      console.log(`Activity ${tokenEvent.activityId} token: ${tokenEvent.token}`);
    }
  }, [tokenEvent]);
}
```

#### `useLiveActivities(pollIntervalMs?)`

Poll active Live Activities. Returns the list and a manual refresh function.

```typescript
import { useLiveActivities } from 'expo-onesignal-live-activities';

function ActiveActivities() {
  const { activities, refresh } = useLiveActivities(5000); // poll every 5s

  return (
    <View>
      {activities.map((a) => (
        <Text key={a.id}>{a.resolvedActivityId}: {a.contentState.status}</Text>
      ))}
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

### Types

```typescript
type LiveActivityInfo = {
  id: string;
  resolvedActivityId: string | null;
  pushToken: string | null;
  attributes: Record<string, unknown>;
  contentState: Record<string, unknown>;
};

type LiveActivityTokenEvent = {
  activityId: string;
  token: string;
};

type ContentStateUpdate = Record<string, unknown>;
```

## Widget UI

This package handles both the **bridge** (token observation, updates, lifecycle) and the **widget extension setup** (Xcode target, build phases, pods).

### Scaffolded templates (recommended)

Run `npx expo-onesignal-live-activities` to generate starter templates, then customize the SwiftUI in `widgets/live-activity/`. The generated `LiveActivityWidget.swift` reads from `context.attributes.data` and `context.state.data` — the same dictionaries you populate from your OneSignal push-to-start payload.

Data flows through the `DefaultLiveActivityAttributes` type from OneSignal:

```swift
// In your widget — read attributes (static) and state (dynamic)
let title = context.attributes.data["title"]?.asString() ?? "My Activity"
let status = context.state.data["status"]?.asString() ?? "Loading..."
let value = context.state.data["value"]?.asString() ?? ""
```

Update from JavaScript:

```typescript
await updateLiveActivity('orderId', 'order_123', {
  status: 'Out for delivery',
  value: '$42.50',
});
```

### Manual widget setup

If you prefer to manage the Widget Extension target yourself (e.g., in Xcode), omit `widgetTarget` from the plugin config. You'll need to:

1. Create a Widget Extension target in Xcode manually
2. Use `DefaultLiveActivityAttributes` from `OneSignalLiveActivities`
3. Add `OneSignalXCFramework` pod to the widget target's Podfile
4. Configure entitlements and Info.plist for the widget target

## Server-Side: Starting a Live Activity

Use OneSignal's push-to-start API to create Live Activities. The `activityIdKey` you configured in the plugin must match a key in your payload's `attributes.data`:

```json
{
  "app_id": "YOUR_ONESIGNAL_APP_ID",
  "include_player_ids": ["PLAYER_ID"],
  "name": "LIVE_ACTIVITY_NOTIFICATION",
  "content_available": true,
  "data": {
    "activity_type": "default",
    "activity_attributes": {
      "data": {
        "onesignal_activity_id": "order_123",
        "storeName": "Pizza Place",
        "orderId": "order_123"
      }
    },
    "content_state": {
      "data": {
        "status": "Order confirmed",
        "eta": "25 min"
      }
    },
    "push_to_start_token": "TOKEN_FROM_CLIENT"
  }
}
```

## Troubleshooting

### Token not arriving

1. Ensure `startObserving()` is called before the Live Activity starts, or use the config plugin for auto-start
2. Verify `NSSupportsLiveActivities` is `true` in your Info.plist
3. Check that the Widget Extension target uses `DefaultLiveActivityAttributes` (from OneSignal)
4. Run on a physical device — Simulator has limited Live Activity support

### Conflict with `setupDefault()`

This package **replaces** `OneSignal.LiveActivities.setupDefault()`. If both are active, you'll get duplicate token registrations. Remove the `setupDefault()` call from your app.

### iOS 18 throttling

iOS 18 may throttle Live Activity updates. Set `frequentUpdates: true` in the plugin config and use `NSSupportsLiveActivitiesFrequentUpdates`. Even so, iOS may batch updates during periods of heavy system load.

### Activities not ending

If activities persist after calling `endLiveActivity()`, verify:
- The `matchKey`/`matchValue` combination matches an active activity
- Check `await listActiveActivities()` to see what's currently running

### Build errors

- **"No such module 'OneSignalLiveActivities'"**: Add `OneSignalXCFramework` pod to your Widget Extension target's Podfile
- **"Unsupported deployment target"**: Ensure your Widget Extension targets iOS 16.2+

## Known Limitations

- **iOS only** — all functions no-op on Android and web
- **Requires OneSignal SDK 5.x** — not compatible with OneSignal SDK 3.x or 4.x
- **No client-side activity creation** — activities must be started via OneSignal's push-to-start API (server-initiated)
- **`updateLiveActivity` matches by attribute key/value** — if multiple activities share the same value for the match key, only the first is updated
- **Requires physical device** for full functionality (Simulator support is limited)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT
