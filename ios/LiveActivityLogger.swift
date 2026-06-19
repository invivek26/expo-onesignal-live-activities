import os.log

enum LiveActivityLogger {
    private static let logger = Logger(subsystem: "expo-onesignal-live-activities", category: "LiveActivities")

    static func info(_ message: String) { logger.info("\(message, privacy: .public)") }
    static func error(_ message: String) { logger.error("\(message, privacy: .public)") }
    static func debug(_ message: String) { logger.debug("\(message, privacy: .public)") }
}
