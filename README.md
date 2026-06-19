# expo-onesignal-live-activities

[![npm version](https://img.shields.io/npm/v/expo-onesignal-live-activities.svg)](https://www.npmjs.com/package/expo-onesignal-live-activities)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![iOS](https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2053+-000020.svg)](https://expo.dev)

Client-side Live Activity control for React Native + OneSignal. A drop-in replacement for `setupDefault()` that gives you token observation, activity updates, and lifecycle management from JavaScript.

> [!IMPORTANT]
> **iOS only.** All functions gracefully return no-ops on Android and web. Requires iOS 16.2+ and a physical device for full functionality.

## Why This Exists

OneSignal's `setupDefault()` internally consumes all ActivityKit async sequences (`activityUpdates`, `pushTokenUpdates`, `pushToStartTokenUpdates`). Since Swift `AsyncSequence` is [unicast by design](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0298-asyncsequence.md), two consumers race for values — one gets the token, the other misses it.

This means with `setupDefault()` active, you **cannot** observe activities from your own code, update them client-side, or receive push token events in JavaScript.

This package replaces `setupDefault()` with a coordinator that owns all sequences, relays tokens to OneSignal via manual `enter()`/`exit()`/`setPushToStartToken()` calls, and exposes activity lifecycle to JavaScript.

## Features

- **Push-to-start token registration** — automatically registers push-to-start tokens with OneSignal so your server can start activities remotely
- **Token observation** — captures per-activity push tokens and calls OneSignal `enter()`/`exit()` automatically
- **Activity updates** — update Live Activity content state from JavaScript without a push round-trip
- **Lifecycle management** — end activities and stop/start observation on demand
- **Activity listing** — enumerate all active activities with tokens, attributes, and state
- **React hooks** — `useLiveActivityToken` and `useLiveActivities` for declarative usage
- **Config plugin** — auto-configures Info.plist, entitlements, AppDelegate, and EAS credentials
- **Widget scaffolding** — CLI + config plugin to create and manage the Widget Extension target automatically

## Prerequisites

- Expo SDK 53+ (requires Swift AppDelegate)
- OneSignal React Native SDK 5.x (`react-native-onesignal` or `onesignal-expo-plugin`)
- iOS 16.2+ deployment target

> [!WARNING]
> Do **not** call `OneSignal.LiveActivities.setupDefault()` in your app. This package replaces that functionality. Using both causes duplicate token registrations and sequence races.
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
        "mode": "production",
        "activityIdKey": "onesignal_activity_id",
        "appGroupIdentifier": "group.com.myapp.onesignal",
        "enableFrequentUpdates": true,
        "widgetTarget": {
          "name": "MyAppLiveActivity",
          "widgetDir": "./widgets/live-activity",
          "fonts": ["./assets/fonts/MyFont-Bold.ttf"]
        }
      }]
    ]
  }
}
```

The plugin automatically handles:
- **Info.plist** — sets `NSSupportsLiveActivities` and `NSSupportsLiveActivitiesFrequentUpdates`
- **Entitlements** — configures `aps-environment` and App Group
- **AppDelegate** — injects `LiveActivityCoordinator.shared.start()` before the RN bridge boots
- **Widget Extension** — creates the Xcode target with correct build settings, signing, and versioning
- **EAS Build** — auto-registers the extension in `appExtensions` for credential provisioning (no manual config needed)

### 3. Rebuild

```bash
npx expo prebuild -p ios --clean
```

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `activityIdKey` | `string` | `"onesignal_activity_id"` | Key in `DefaultLiveActivityAttributes.data` used to resolve the OneSignal activity ID |
| `enableFrequentUpdates` | `boolean` | `true` | Enable `NSSupportsLiveActivitiesFrequentUpdates` in Info.plist |
| `mode` | `"development" \| "production"` | `"development"` | Sets the `aps-environment` entitlement. Use `"production"` for TestFlight and App Store builds |
| `appGroupIdentifier` | `string` | — | App Group ID for sharing data between the app and widget (e.g., `"group.com.myapp.onesignal"`) |
| `widgetTarget` | `object` | — | Configure automatic Widget Extension target creation (see below) |

#### `widgetTarget` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | **(required)** | Widget Extension target name (e.g., `"MyAppLiveActivity"`) |
| `widgetDir` | `string` | **(required)** | Path to your widget Swift files (e.g., `"./widgets/live-activity"`) |
| `deploymentTarget` | `string` | `"16.4"` | Minimum iOS deployment target for the widget |
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

## How It Works

The package uses a `LiveActivityCoordinator` singleton that:

1. **Pre-seeds** existing activities from `Activity<DefaultLiveActivityAttributes>.activities` on start
2. **Observes** new activities via `Activity<DefaultLiveActivityAttributes>.activityUpdates`
3. **Registers push-to-start tokens** via `pushToStartTokenUpdates` (iOS 17.2+) with a synchronous fallback for the [known timing race](https://developer.apple.com/forums/thread/799526)
4. **Relays tokens** to OneSignal via `OneSignalLiveActivitiesManagerImpl.enter()`/`.exit()`/`.setPushToStartToken()`
5. **Emits events** to JavaScript for token updates and activity lifecycle changes

The coordinator starts from `AppDelegate.didFinishLaunchingWithOptions` (injected by the config plugin) — before the React Native bridge boots — so it catches push-to-start launches that happen in the background.

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

### "No recipients" on push-to-start

The device hasn't registered a push-to-start token with OneSignal. Check:

1. The coordinator is starting at app launch (verify `LiveActivityCoordinator.shared.start()` in your AppDelegate)
2. Live Activities are enabled in device Settings > Your App > Live Activities
3. The app has been launched at least once after install to register the token
4. You're running on a physical device — Simulator doesn't support push-to-start

### Token not arriving

1. Ensure `startObserving()` is called before the Live Activity starts, or use the config plugin for auto-start
2. Verify `NSSupportsLiveActivities` is `true` in your Info.plist
3. Check that the Widget Extension target uses `DefaultLiveActivityAttributes` (from OneSignal)
4. Run on a physical device — Simulator has limited Live Activity support

### Conflict with `setupDefault()`

This package **replaces** `OneSignal.LiveActivities.setupDefault()`. If both are active, you'll get duplicate token registrations and sequence races. Remove the `setupDefault()` call from your app.

### CFBundleVersion missing on install

If you see "does not have a CFBundleVersion key" during device install, ensure you're on v0.2.3+ which resolves widget extension version build settings from the main target.

### iOS 18 throttling

iOS 18 may throttle Live Activity updates. Set `enableFrequentUpdates: true` in the plugin config. Even so, iOS may batch updates during periods of heavy system load.

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
- **`updateLiveActivity` matches first activity** — if multiple activities share the same value for the match key, only the first is updated
- **Push-to-start token unreliability** — Apple's `pushToStartTokenUpdates` is [unreliable on ~50% of devices](https://developer.apple.com/forums/thread/805324) (all iOS versions). The package includes a synchronous fallback but cannot fully work around this Apple bug.
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
bun install

# Build
bun run build

# Run tests
bun run test

# Lint
bun run lint
```

## License

MIT
