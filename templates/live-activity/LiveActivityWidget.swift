import ActivityKit
import OneSignalLiveActivities
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct LiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            let data = context.state.data
            let attrs = context.attributes.data

            VStack(alignment: .leading, spacing: 8) {
                if let title = attrs["title"]?.asString() {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.white)
                }

                if let status = data["status"]?.asString() {
                    Text(status)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                if let value = data["value"]?.asString() {
                    Text(value)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
            }
            .padding()
            .activityBackgroundTint(.black)

        } dynamicIsland: { context in
            let data = context.state.data

            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    if let title = context.attributes.data["title"]?.asString() {
                        Text(title)
                            .font(.caption)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if let value = data["value"]?.asString() {
                        Text(value)
                            .font(.caption)
                            .fontWeight(.bold)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if let status = data["status"]?.asString() {
                        Text(status)
                            .font(.caption2)
                    }
                }
            } compactLeading: {
                EmptyView()
            } compactTrailing: {
                if let value = data["value"]?.asString() {
                    Text(value)
                        .font(.caption2)
                }
            } minimal: {
                EmptyView()
            }
        }
    }
}
