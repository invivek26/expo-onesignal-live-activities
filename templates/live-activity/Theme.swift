import SwiftUI

enum Theme {
    static let primary = Color(hex: "#007AFF")
    static let success = Color(hex: "#34C759")
    static let error = Color(hex: "#FF3B30")
    static let text = Color.white
    static let textSecondary = Color(hex: "#8E8E93")
    static let background = Color.black
    static let surface = Color(hex: "#1C1C1E")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var rgbValue: UInt64 = 0
        scanner.scanHexInt64(&rgbValue)
        self.init(
            red: Double((rgbValue & 0xFF0000) >> 16) / 255.0,
            green: Double((rgbValue & 0x00FF00) >> 8) / 255.0,
            blue: Double(rgbValue & 0x0000FF) / 255.0
        )
    }
}
