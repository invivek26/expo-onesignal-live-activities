@preconcurrency import ActivityKit
import Foundation
import OneSignalLiveActivities

@available(iOS 16.2, *)
public class LiveActivityCoordinator {
    public static let shared: LiveActivityCoordinator = {
        let activityIdKey = Bundle.main.object(forInfoDictionaryKey: "OneSignalLiveActivityIdKey") as? String
            ?? "onesignal_activity_id"
        return LiveActivityCoordinator(activityIdKey: activityIdKey)
    }()

    private let relay: LiveActivityRelaying
    private let activityIdKey: String
    private var observationTasks: [String: Task<Void, Never>] = [:]

    public init(
        relay: LiveActivityRelaying = OneSignalLiveActivityRelay(),
        activityIdKey: String = "onesignal_activity_id"
    ) {
        self.relay = relay
        self.activityIdKey = activityIdKey
    }

    // MARK: - Public lifecycle

    public func start() {
        Task { [weak self] in
            for await activity in Activity<DefaultLiveActivityAttributes>.activityUpdates {
                guard let self else { return }
                self.observeActivity(activity)
            }
        }
    }

    public func stop() {
        for (_, task) in observationTasks {
            task.cancel()
        }
        observationTasks.removeAll()
        LiveActivityLogger.info("Stopped observing all live activities")
    }

    // MARK: - Internal observation

    func observeActivity(_ activity: Activity<DefaultLiveActivityAttributes>) {
        let id = activity.id

        let task = Task { [weak self] in
            guard let self else { return }

            // Synchronous pushToStartToken fallback (iOS 17.2+) — MUST be before the
            // for-await loop because the loop is infinite and code after it never runs.
            if #available(iOS 17.2, *) {
                if let tokenData = activity.pushToken {
                    self.handleTokenUpdate(activity: activity, tokenData: tokenData)
                }
            }

            // Run token updates and state updates concurrently — both are infinite
            // async sequences so they must be in separate child tasks.
            await withTaskGroup(of: Void.self) { group in
                group.addTask { [weak self] in
                    for await tokenData in activity.pushTokenUpdates {
                        guard let self else { return }
                        self.handleTokenUpdate(activity: activity, tokenData: tokenData)
                    }
                }

                group.addTask { [weak self] in
                    for await activityState in activity.activityStateUpdates {
                        guard let self else { return }
                        if activityState == .ended || activityState == .dismissed {
                            self.handleActivityEnded(activity: activity)
                            return
                        }
                    }
                }
            }
        }

        observationTasks[id] = task
        LiveActivityLogger.debug("Started observing activity id=\(id)")
    }

    // MARK: - Token handling

    func handleTokenUpdate(activity: Activity<DefaultLiveActivityAttributes>, tokenData: Data) {
        let tokenHex = tokenData.map { String(format: "%02x", $0) }.joined()

        guard let activityId = resolveActivityId(from: activity) else {
            LiveActivityLogger.error("Could not resolve OneSignal activity id for Activity id=\(activity.id) — token update ignored")
            return
        }

        relay.enterLiveActivity(activityId, withToken: tokenHex)
        LiveActivityLogger.info("Entered live activity onesignalId=\(activityId) token=\(tokenHex)")
    }

    // MARK: - Activity ended

    func handleActivityEnded(activity: Activity<DefaultLiveActivityAttributes>) {
        let id = activity.id

        if let activityId = resolveActivityId(from: activity) {
            relay.exitLiveActivity(activityId)
            LiveActivityLogger.info("Exited live activity onesignalId=\(activityId)")
        } else {
            LiveActivityLogger.error("Could not resolve OneSignal activity id for ended Activity id=\(id)")
        }

        observationTasks[id]?.cancel()
        observationTasks.removeValue(forKey: id)
    }

    // MARK: - Helpers

    private func resolveActivityId(from activity: Activity<DefaultLiveActivityAttributes>) -> String? {
        return activity.attributes.data[activityIdKey]?.asString()
    }

    // MARK: - Public query methods (called by Module)

    public func listActiveActivities() -> [[String: Any]] {
        return Activity<DefaultLiveActivityAttributes>.activities.map { activity in
            var entry: [String: Any] = [
                "id": activity.id,
                "attributes": activity.attributes.data.mapValues { $0.value ?? NSNull() },
                "contentState": activity.contentState.data.mapValues { $0.value ?? NSNull() }
            ]
            if let resolvedId = resolveActivityId(from: activity) {
                entry["resolvedActivityId"] = resolvedId
            }
            if let tokenData = activity.pushToken {
                entry["pushToken"] = tokenData.map { String(format: "%02x", $0) }.joined()
            }
            return entry
        }
    }

    public func isSupported() -> Bool {
        return ActivityAuthorizationInfo().areActivitiesEnabled
    }
}
