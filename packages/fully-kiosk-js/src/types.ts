/**
 * מייצג פריט (קובץ או תיקייה) במערכת הקבצים של Fully Kiosk
 */
export interface FullyItem {
  canRead: boolean;
  canWrite: boolean;
  isHidden: boolean;
  lastModified: number;
  name: string;
  size: number;
  type: 'file' | 'folder';
}

/**
 * מיקום גיאוגרפי שמוחזר מ-getLocation()
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  bearing: number;
  speed: number;
  time: number;
  provider: string;
}

/**
 * מידע על חיישן סביבתי בודד שמוחזר מ-getSensorInfo()
 */
export interface SensorInfo {
  type: number;
  name: string;
  vendor: string;
  version: number;
  resolution: number;
  maximumRange: number;
  minDelay: number;
  power: number;
}

/**
 * מידע על מכשיר Bluetooth שמוחזר מ-btGetDeviceListJson()
 */
export interface BluetoothDeviceInfo {
  address: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
}

/**
 * סטרים שמע - המספרים הם ה-stream codes של אנדרואיד
 */
export enum AudioStream {
  VoiceCall = 0,
  System = 1,
  Ring = 2,
  Music = 3,
  Alarm = 4,
  Notification = 5,
  Bluetooth = 6,
  DTMF = 8,
  TTS = 9,
  Accessibility = 10,
}

/**
 * מצב התקנת APK שמוחזר מ-getInstallApkState() (דרך REST)
 */
export interface InstallApkState {
  status: 'idle' | 'downloading' | 'installing' | 'success' | 'error';
  progress?: number;
  error?: string;
}

/**
 * פריט ב-Tab List שמוחזר מ-getTabList()
 */
export interface TabInfo {
  index: number;
  url: string;
  title: string;
  active: boolean;
}

// ─────────────────────────────────────────────
// מפתחות הגדרות Fully Kiosk
// רשימה מבוססת על תיעוד רשמי + listSettings REST API
// ─────────────────────────────────────────────

/**
 * מפתחות הגדרות בוליאניות — לשימוש עם getBooleanSetting / setBooleanSetting
 */
export type FullyBooleanSettingKey =
  // Web Content
  | 'enableFullscreenVideos'
  | 'autoplayVideos'
  | 'autoplayAudio'
  | 'enableFileUpload'
  | 'cameraCaptureUploads'
  | 'videoCaptureUploads'
  | 'audioRecordUploads'
  | 'jsAlerts'
  | 'enablePopups'
  | 'webcamAccess'
  | 'microphoneAccess'
  | 'geoLocationAccess'
  | 'viewLocalPdfFiles'
  | 'viewRemotePdfFiles'
  | 'playMedia'
  | 'redirectBlocked'
  | 'loadErrorUrlOnDisconnection'

  // Web Browsing
  | 'enablePullToRefresh'
  | 'enableBackButton'
  | 'loadStartUrlOnHomeButton'
  | 'enableTapSound'
  | 'swipeNavigation'
  | 'pageTransitions'
  | 'swipeToChangeTabs'
  | 'waitInternetOnReload'
  | 'readNfcTag'

  // Web Zoom and Scaling
  | 'enableZoom'
  | 'loadOverview'
  | 'useWideViewport'
  | 'desktopMode'

  // Web Auto Reload
  | 'autoReloadOnIdle'
  | 'reloadPageFailure'
  | 'reloadOnScreenOn'
  | 'reloadOnScreensaverStop'
  | 'reloadOnWifiOn'
  | 'reloadOnInternet'
  | 'deleteCacheOnReload'
  | 'deleteWebstorageOnReload'
  | 'deleteHistoryOnReload'
  | 'deleteCookiesOnReload'
  | 'loadCurrentPageOnAutoReload'
  | 'skipAutoReloadIfShowingStartUrl'

  // Advanced Web Settings
  | 'websiteIntegration'
  | 'detectIBeacons'
  | 'enableQrCodeScanner'
  | 'softKeyboard'
  | 'alwaysHideKeyboard'
  | 'formAutoComplete'
  | 'enableUserInteraction'
  | 'enableLongTap'
  | 'enableDragging'
  | 'enableScrolling'
  | 'enableOverscroll'
  | 'thirdPartyCookies'
  | 'resubmitFormDataOnReload'
  | 'addRefererHeader'
  | 'addXffHeader'
  | 'addDntHeader'
  | 'removeXFrameCspAndCorsProtection'
  | 'enableWebFilter'
  | 'enableSafeBrowsing'
  | 'ignoreSSLerrors'
  | 'pauseWebviewWhileInBackground'
  | 'enableDrmProtectedContent'
  | 'clearCacheEach'
  | 'resumePlaybackWhenGettingToForeground'
  | 'keepScreenOnWhileInFullscreenMode'
  | 'webviewDebugging'
  | 'textSelection'
  | 'restartOnCrash'

  // Toolbars and Appearance
  | 'showNavigationBar'
  | 'showStatusBar'
  | 'showActionBar'
  | 'showBackButton'
  | 'showForwardButton'
  | 'showRefreshButton'
  | 'showHomeButton'
  | 'showPrintButton'
  | 'showShareButton'
  | 'showBarcodeScanButton'
  | 'showTabs'
  | 'showCloseButtonsOnTabs'
  | 'showNewTabButton'
  | 'showAddressBar'
  | 'showProgressBar'
  | 'actionBarInSettings'

  // Universal Launcher
  | 'showAppLauncherOnStart'

  // Screensaver
  | 'screensaverFullscreen'
  | 'cacheImages'
  | 'screensaverDaydream'
  | 'ignoreMotionDetectionWhenScreensaverGoesOnOff'

  // Device Management
  | 'keepScreenOn'
  | 'forceScreenUnlock'
  | 'launchOnBoot'
  | 'forceImmersive'
  | 'removeNavigationBar'
  | 'removeStatusBar'
  | 'turnScreenOffOnProximity'
  | 'redirectAudioToPhoneEarpiece'
  | 'resetWifiOnInternetDisconnection'

  // Power Settings
  | 'scheduleWakeupAndSleep'
  | 'keepSleepingIfUnplugged'
  | 'turnScreenOnOnPowerConnect'
  | 'sleepOnPowerConnect'
  | 'sleepOnPowerDisconnect'
  | 'forceScreenOffIfNotPowered'
  | 'batteryWarning'
  | 'preventFromSleepWhileScreenOff'
  | 'setCpuWakelock'
  | 'setWifiWakelock'

  // Kiosk Mode
  | 'kioskMode'
  | 'disableStatusBar'
  | 'disableVolumeButtons'
  | 'disablePowerButton'
  | 'disableHomeButton'
  | 'disableContextMenus'
  | 'disableOtherApps'
  | 'advancedKioskProtection'
  | 'singleAppMode'
  | 'disableNotifications'
  | 'disableIncomingCalls'
  | 'disableOutgoingCalls'
  | 'disableScreenshots'
  | 'lockSafeMode'
  | 'disableCamera'
  | 'confirmExit'
  | 'ignoreJustOnceLauncher'

  // Motion Detection
  | 'motionDetection'
  | 'detectFaces'
  | 'triggerMotionOnlyWhenFacesDetected'
  | 'pauseMotionInBackground'
  | 'motionDetectionAcoustic'
  | 'enableProximityMotionDetection'
  | 'screenOnOnMotion'
  | 'stopScreensaverOnMotion'
  | 'stopWebReloadOnMotion'
  | 'screenOffInDarkness'
  | 'showCamPreview'

  // Device Movement Detection
  | 'movementDetection'
  | 'screenOnOnMovement'
  | 'stopScreensaverOnMovement'
  | 'playAlarmSoundOnMovement'
  | 'playAlarmSoundUntilPin'
  | 'ignoreMotionWhenMoving'
  | 'triggerMovementWhenDeviceUnplugged'

  // Remote Administration
  | 'remoteAdmin'
  | 'remoteAdminLan'
  | 'enableFileManagementOnRemoteAdmin'
  | 'enableScreenshotOnRemoteAdmin'
  | 'enableCamshotOnRemoteAdmin'
  | 'enableRemoteAdminAdvertisingByMdnsSd'
  | 'cloudService'
  | 'transmitDeviceLocationToFullyCloud'
  | 'usageStatistics'
  | 'enableVersionInfo'

  // KNOX
  | 'knoxEnabled'
  | 'knoxDisableStatusBar'
  | 'knoxDisableCamera'
  | 'knoxDisableScreenCapture'
  | 'knoxDisableSafeMode'
  | 'knoxDisableUsbHostStorage'
  | 'knoxDisableMtp'

  // MDM / Device Owner
  | 'mdmDisableStatusBar'
  | 'mdmDisableScreenCapture'
  | 'mdmDisableUsbStorage'
  | 'mdmDisableADB'

  // Other
  | 'restartAfterUpdate'
  | 'runInForeground'
  | 'showMenuHint'
  | 'setRemoveSystemUI';

/**
 * מפתחות הגדרות מחרוזת — לשימוש עם getStringSetting / setStringSetting
 * (כולל הגדרות מספריות שמועברות כ-string)
 */
export type FullyStringSettingKey =
  // Web Content
  | 'startURL'
  | 'authUsername'
  | 'authPassword'
  | 'urlWhitelist'
  | 'urlBlacklist'
  | 'webOverlayUrl'
  | 'webOverlayVerticalAlignment'
  | 'errorURL'
  | 'enableUrlOtherApps'
  | 'searchProviderUrl'

  // Web Zoom and Scaling
  | 'initialScale'
  | 'fontSize'

  // Web Auto Reload
  | 'reloadEachSeconds'

  // Advanced Web Settings
  | 'injectJavaScript'
  | 'mixedContentMode'
  | 'clientCertificateFile'
  | 'clientCertificatePassword'
  | 'cacheMode'
  | 'userAgent'
  | 'customUserAgentString'
  | 'defaultWebviewBackgroundColor'
  | 'graphicsAccelerationMode'
  | 'selectWebviewImplementation'
  | 'basicWebAutomation'

  // Universal Launcher
  | 'launcherApps'
  | 'appLauncherBackgroundColor'
  | 'launcherTextColor'
  | 'launcherBackgroundImageUrl'
  | 'appLauncherScaling'
  | 'launcherInjectCode'
  | 'applicationToRunOnStartInForeground'
  | 'applicationsToRunOnStartInBackground'

  // Toolbars and Appearance
  | 'navigationBarColor'
  | 'statusBarColor'
  | 'actionBarTitle'
  | 'actionBarBgColor'
  | 'actionBarFgColor'
  | 'actionBarIconUrl'
  | 'actionBarBgUrl'
  | 'customButtonAction'
  | 'actionBarSize'
  | 'newTabUrl'
  | 'activeTabColor'
  | 'inactiveTabColor'
  | 'tabTextColor'
  | 'addressBarBgColor'
  | 'progressBarColor'

  // Screensaver
  | 'timeToScreensaverV2'
  | 'screensaverPlaylist'
  | 'screensaverWallpaperURL'
  | 'screensaverBrightness'
  | 'fadeInOutDuration'

  // Device Management
  | 'screenBrightness'
  | 'forceScreenOrientation'
  | 'timeToScreenOffV2'
  | 'setDeviceName'
  | 'bluetoothMode'
  | 'wifiMode'
  | 'hotspotMode'
  | 'wifiConfiguration'
  | 'wifiSettings'
  | 'wifiSSID'
  | 'wifiKey'
  | 'setVolumeLevels'
  | 'loadContentFromZipFile'

  // Power Settings
  | 'sleepSchedule'

  // Kiosk Mode
  | 'kioskExitGesture'
  | 'kioskPin'
  | 'kioskWifiPin'
  | 'wifiSettingsPinAction'
  | 'wifiSettingsPinCustomIntent'
  | 'limitTheVolumeLevel'
  | 'kioskAppWhitelist'
  | 'appBlacklist'
  | 'singleAppIntent'
  | 'kioskHomeStartURL'
  | 'volumeLicenseKey'

  // Motion Detection
  | 'motionSensitivity'
  | 'motionFps'
  | 'darknessLevel'
  | 'motionCameraId'
  | 'cameraApi'
  | 'faceDetectionConfidence'
  | 'motionSensitivityAcoustic'

  // Device Movement Detection
  | 'accelerometerSensitivity'
  | 'compassSensitivity'
  | 'alarmSoundFileUrl'
  | 'movementBeaconList'
  | 'movementBeaconDistance'

  // Remote Administration
  | 'remoteAdminPassword'

  // Other
  | 'autoImportSettings'
  | 'remotePdfFileMode'
  | 'localPdfFileMode'
  | 'webPopupOptions'
  | 'mdmApkToInstall';

/**
 * כל מפתחות ההגדרות — בוליאניים + מחרוזת
 */
export type FullySettingKey = FullyBooleanSettingKey | FullyStringSettingKey;
