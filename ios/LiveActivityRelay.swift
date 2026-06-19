@preconcurrency import ActivityKit
import Foundation
import OneSignalLiveActivities

public protocol LiveActivityRelaying {
    func enterLiveActivity(_ activityId: String, withToken token: String)
    func exitLiveActivity(_ activityId: String)
    func setPushToStartToken(_ token: String)
}

public class OneSignalLiveActivityRelay: LiveActivityRelaying {
    public init() {}

    public func enterLiveActivity(_ activityId: String, withToken token: String) {
        OneSignalLiveActivitiesManagerImpl.enter(activityId, withToken: token)
    }

    public func exitLiveActivity(_ activityId: String) {
        OneSignalLiveActivitiesManagerImpl.exit(activityId)
    }

    public func setPushToStartToken(_ token: String) {
        if #available(iOS 17.2, *) {
            OneSignalLiveActivitiesManagerImpl.setPushToStartToken(
                DefaultLiveActivityAttributes.self,
                withToken: token
            )
        }
    }
}
