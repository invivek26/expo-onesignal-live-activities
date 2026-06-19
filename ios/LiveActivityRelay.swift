import Foundation
@preconcurrency import OneSignalFramework

public protocol LiveActivityRelaying {
    func enterLiveActivity(_ activityId: String, withToken token: String)
    func exitLiveActivity(_ activityId: String)
}

public class OneSignalLiveActivityRelay: LiveActivityRelaying {
    public init() {}

    public func enterLiveActivity(_ activityId: String, withToken token: String) {
        OneSignal.LiveActivities.enter(activityId, withToken: token)
    }

    public func exitLiveActivity(_ activityId: String) {
        OneSignal.LiveActivities.exit(activityId)
    }
}
