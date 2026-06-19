Pod::Spec.new do |s|
  s.name           = 'ExpoOnesignalLiveActivities'
  s.version        = '0.1.0'
  s.summary        = 'Client-side Live Activity control for React Native + OneSignal'
  s.description    = 'An Expo module that provides client-side Live Activity token observation, updates, and lifecycle management via OneSignal.'
  s.author         = 'Vivek Narasimha Prasad'
  s.homepage       = 'https://github.com/invivek26/expo-onesignal-live-activities'
  s.license        = { type: 'MIT' }
  s.platforms      = { ios: '16.0' }
  s.source         = { git: 'https://github.com/invivek26/expo-onesignal-live-activities.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_ACTIVE_COMPILATION_CONDITIONS' => '$(inherited)',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
