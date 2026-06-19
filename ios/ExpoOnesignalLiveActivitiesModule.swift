@preconcurrency import ActivityKit
import ExpoModulesCore
import OneSignalLiveActivities

public class ExpoOnesignalLiveActivitiesModule: Module {
    private var coordinator: LiveActivityCoordinator? {
        guard #available(iOS 16.2, *) else { return nil }
        return LiveActivityCoordinator.shared
    }

    public func definition() -> ModuleDefinition {
        Name("ExpoOnesignalLiveActivities")

        AsyncFunction("startObserving") { [weak self] in
            self?.coordinator?.start()
        }

        AsyncFunction("stopObserving") { [weak self] in
            self?.coordinator?.stop()
        }

        AsyncFunction("updateLiveActivity") { [weak self] (matchKey: String, matchValue: String, contentState: [String: Any]) in
            guard #available(iOS 16.2, *) else { return }
            for activity in Activity<DefaultLiveActivityAttributes>.activities {
                if let val = activity.attributes.data[matchKey]?.asString(), val == matchValue {
                    let state = DefaultLiveActivityAttributes.ContentState(
                        data: contentState.mapValues { AnyCodable($0) }
                    )
                    await activity.update(ActivityContent(state: state, staleDate: nil))
                    LiveActivityLogger.info("Updated activity matching \(matchKey)=\(matchValue)")
                    return
                }
            }
            LiveActivityLogger.error("No activity found matching \(matchKey)=\(matchValue)")
        }

        AsyncFunction("endLiveActivity") { [weak self] (matchKey: String, matchValue: String) in
            guard #available(iOS 16.2, *) else { return }
            for activity in Activity<DefaultLiveActivityAttributes>.activities {
                if let val = activity.attributes.data[matchKey]?.asString(), val == matchValue {
                    await activity.end(nil, dismissalPolicy: .immediate)
                    LiveActivityLogger.info("Ended activity matching \(matchKey)=\(matchValue)")
                    return
                }
            }
            LiveActivityLogger.error("No activity found to end matching \(matchKey)=\(matchValue)")
        }

        AsyncFunction("listActiveActivities") { [weak self] () -> [[String: Any]] in
            return self?.coordinator?.listActiveActivities() ?? []
        }

        AsyncFunction("isLiveActivitiesSupported") { () -> Bool in
            guard #available(iOS 16.2, *) else { return false }
            return ActivityAuthorizationInfo().areActivitiesEnabled
        }

        Events("onLiveActivityToken")
    }
}
