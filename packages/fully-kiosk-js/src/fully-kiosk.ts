import type { FullyKioskEvent } from './events';
import type { AudioStream } from './types';

/**
 * ממשק מלא ל-Fully Kiosk JavaScript Interface (window.fully)
 * תיעוד מלא: https://www.fully-kiosk.com/en/#javascript-interface
 */
export interface FullyKiosk {

  // ─────────────────────────────────────────────
  // מידע על המכשיר
  // ─────────────────────────────────────────────

  getCurrentLocale(): string;
  getIp4Address(): string;
  getIp4Addresses(): string;
  getIp6Address(): string;
  getIp6Addresses(): string;
  getHostname(): string;
  getHostname6(): string;
  getMacAddress(): string;
  getMacAddressForInterface(networkInterface: string): string;
  getWifiSsid(): string;
  getWifiBssid(): string;
  getWifiSignalLevel(): string;
  getSerialNumber(): string;
  getSerialNumberDeviceOwner(): string;
  getAndroidId(): string;
  getDeviceId(): string;
  getDeviceName(): string;
  getImei(): string;
  getSimSerialNumber(): string;

  getBatteryLevel(): number;
  getScreenBrightness(): number;
  getScreenOrientation(): number;
  getDisplayWidth(): number;
  getDisplayHeight(): number;
  getIdleTime(): number;
  getLastUserInteractionTime(): number;

  getScreenOn(): boolean;
  isPlugged(): boolean;
  isKeyboardVisible(): boolean;
  isWifiEnabled(): boolean;
  isWifiConnected(): boolean;
  isNetworkConnected(): boolean;
  isBluetoothEnabled(): boolean;
  isScreenRotationLocked(): boolean;

  getFullyVersion(): string;
  getFullyVersionCode(): number;
  getWebviewVersion(): string;
  getAndroidVersion(): string;
  getAndroidSdk(): number;
  getDeviceModel(): string;

  /** מחזיר JSON string של LocationInfo */
  getLocation(): string;

  // אחסון
  getInternalStorageTotalSpace(): number;
  getInternalStorageFreeSpace(): number;
  getExternalStorageTotalSpace(): number;
  getExternalStorageFreeSpace(): number;

  // נתיבי אחסון (ver. 1.59+)
  getInternalSharedStoragePath(): string;
  getInternalAppSpecificStoragePath(): string;
  getInternalAppPrivateStoragePath(): string;
  getExternalSharedStoragePath(): string;
  getExternalAppSpecificStoragePath(): string;

  // חיישנים סביבתיים
  /** מחזיר JSON string של SensorInfo[] */
  getSensorInfo(): string;
  getSensorValue(type: number): number;
  /** מחזיר JSON string של number[] */
  getSensorValues(type: number): string;

  // שימוש בנתונים (Android 6+)
  getAllRxBytesMobile(): number;
  getAllTxBytesMobile(): number;
  getAllRxBytesWifi(): number;
  getAllTxBytesWifi(): number;

  // ─────────────────────────────────────────────
  // שליטה במכשיר
  // ─────────────────────────────────────────────

  turnScreenOn(): void;
  turnScreenOff(keepAlive?: boolean): void;
  forceSleep(): void;

  showToast(text: string): void;
  /** העבר -1 לברירת מחדל */
  setScreenBrightness(level: number): void;

  /** Android 10+ רק עם מכשירים מוגדרים */
  enableWifi(): void;
  /** Android 10+ רק עם מכשירים מוגדרים */
  disableWifi(): void;
  enableBluetooth(): void;
  disableBluetooth(): void;

  showKeyboard(): void;
  hideKeyboard(): void;
  openWifiSettings(): void;
  openBluetoothSettings(): void;

  vibrate(millis: number): void;
  sendHexDataToTcpPort(hexData: string, host: string, port: number): void;
  showNotification(title: string, text: string, url: string, highPriority: boolean): void;
  log(type: number, tag: string, message: string): void;

  // לוח גזירים (Android 10+: רק כשהאפליקציה בפוקוס)
  copyTextToClipboard(text: string): void;
  getClipboardText(): string;
  getClipboardHtmlText(): string;

  // פקודות root (מכשירים מושרשים בלבד)
  runCommand(command: string): void;
  runSuCommand(command: string): void;

  /** מכשירים מוגדרים ומושרשים בלבד */
  reboot(): void;
  /** מכשירים מושרשים בלבד */
  shutdown(): void;

  // ─────────────────────────────────────────────
  // ניהול קבצים
  // ─────────────────────────────────────────────

  deleteFile(path: string): void;
  /** recursive */
  deleteFolder(path: string): void;
  /** recursive */
  emptyFolder(path: string): void;
  createFolder(path: string): void;

  /** מחזיר JSON string של FullyItem[] */
  getFileList(folder: string): string;

  writeFile(path: string, content: string): boolean;
  writeFileBase64(path: string, base64encodedContent: string): boolean;
  /** ver. 1.55+ */
  readFile(path: string): string;

  downloadFile(url: string, dirName: string, showToastMessages?: boolean): void;
  unzipFile(fileName: string): void;
  downloadAndUnzipFile(url: string, dirName: string): void;

  // ─────────────────────────────────────────────
  // TTS, מולטימדיה ו-PDF
  // ─────────────────────────────────────────────

  textToSpeech(text: string, localeOrVoice?: string, engine?: string, queue?: boolean): void;
  stopTextToSpeech(): void;
  /** ver. 1.55 */
  initTts(): void;
  /** ver. 1.60+ */
  shutdownTts(): void;

  playVideo(url: string, loop: boolean, showControls: boolean, exitOnTouch: boolean, exitOnCompletion: boolean): void;
  stopVideo(): void;

  /** level: 0..100 */
  setAudioVolume(level: number, stream: AudioStream): void;
  getAudioVolume(stream: AudioStream): number;

  playSound(url: string, loop: boolean, stream?: AudioStream): void;
  stopSound(): void;

  showPdf(url: string): void;
  isWiredHeadsetOn(): boolean;
  isMusicActive(): boolean;

  // ─────────────────────────────────────────────
  // שליטה בדפדפן
  // ─────────────────────────────────────────────

  getStartUrl(): string;
  setStartUrl(url: string): void;
  loadStartUrl(): void;
  addToHomeScreen(): void;
  shareUrl(): void;
  /** window.print() לא עובד ב-Fully — יש להשתמש בזה */
  print(): void;
  print2Pdf(filename: string): void;
  getScreenshotPngBase64(): string;
  loadStatsCSV(): string;
  /** ver. 1.60+ */
  requestWebAutomation(index: number): void;

  clearCache(): void;
  clearFormData(): void;
  clearHistory(): void;
  clearCookies(): void;
  clearCookiesForUrl(url: string): void;
  clearWebstorage(): void;
  /** ver. 1.55.3+ */
  resetWebview(): void;

  // ניהול טאבים
  focusThisTab(): void;
  focusNextTab(): void;
  focusPrevTab(): void;
  focusTabByIndex(index: number): void;
  getCurrentTabIndex(): number;
  getThisTabIndex(): number;
  closeTabByIndex(index: number): void;
  closeThisTab(): void;
  /** מחזיר JSON string של TabInfo[] */
  getTabList(): string;
  loadUrlInTabByIndex(index: number, url: string): void;
  loadUrlInNewTab(url: string, focus: boolean): void;

  // ─────────────────────────────────────────────
  // סורק ברקוד / QR
  // ─────────────────────────────────────────────

  /**
   * @param cameraId   העבר -1 לברירת מחדל
   * @param timeout    בשניות; העבר -1 לברירת מחדל
   */
  scanQrCode(
    prompt: string,
    resultUrl: string,
    cameraId?: number,
    timeout?: number,
    beepEnabled?: boolean,
    showCancelButton?: boolean,
    useFlashlight?: boolean
  ): void;

  // ─────────────────────────────────────────────
  // Bluetooth
  // ─────────────────────────────────────────────

  /** מחזיר JSON string של BluetoothDeviceInfo[] */
  btGetDeviceListJson(): string;

  btOpenByMac(mac: string): void;
  btOpenByUuid(uuid: string): void;
  btOpenByName(name: string): void;

  btIsConnected(): boolean;
  /** מחזיר JSON string של BluetoothDeviceInfo */
  btGetDeviceInfoJson(): string;
  btClose(): void;

  btSendStringData(stringData: string): boolean;
  btSendHexData(hexData: string): boolean;
  btSendByteData(data: Uint8Array): boolean;

  // ─────────────────────────────────────────────
  // NFC
  // ─────────────────────────────────────────────

  nfcScanStart(flags?: number, debounceMs?: number): boolean;
  nfcScanStop(): boolean;

  // ─────────────────────────────────────────────
  // שומר מסך, אפליקציות אחרות, Intents וקיוסק
  // ─────────────────────────────────────────────

  startScreensaver(): void;
  stopScreensaver(): void;
  startDaydream(): void;
  stopDaydream(): void;

  isInForeground(): boolean;
  bringToForeground(delayMs?: number): void;
  bringToBackground(): void;
  restartApp(): void;
  exit(): void;

  enableMaintenanceMode(): void;
  disableMaintenanceMode(): void;
  setMessageOverlay(text: string): void;

  lockKiosk(): void;
  unlockKiosk(): void;
  checkKioskPin(): void;
  isKioskLocked(): boolean;

  startApplication(packageName: string, action?: string | null, url?: string | null): void;
  startIntent(url: string): void;
  broadcastIntent(url: string): void;

  registerBroadcastReceiver(action: string): void;
  unregisterBroadcastReceiver(action: string): void;

  /** Android 13 ומטה */
  killBackgroundProcesses(packageName: string): void;
  /** לא זמין בגרסת Google Play */
  installApkFile(url: string): void;

  // ─────────────────────────────────────────────
  // זיהוי תנועה
  // ─────────────────────────────────────────────

  startMotionDetection(): void;
  stopMotionDetection(): void;
  isMotionDetectionRunning(): boolean;
  getCamshotJpgBase64(): string;
  getFaceNumber(): number;
  /** ver. 1.60+ */
  getAverageLuma(): number;
  triggerMotion(): void;

  // ─────────────────────────────────────────────
  // הגדרות Fully
  // ─────────────────────────────────────────────

  getBooleanSetting(key: string): 'true' | 'false';
  getStringSetting(key: string): string;
  /** גרסה גולמית של הגדרה — לא מופיעה בתיעוד הרשמי אך קיימת באפליקציה */
  getStringRawSetting(key: string): string;
  setBooleanSetting(key: string, value: boolean): void;
  setStringSetting(key: string, value: string): void;
  importSettingsFile(url: string): void;

  // ─────────────────────────────────────────────
  // הגדרות מערכת Android (ver. 1.55.3+)
  // ─────────────────────────────────────────────

  getSettingsGlobalInt(name: string, defaultValue: number): number;
  getSettingsGlobalLong(name: string, defaultValue: number): number;
  getSettingsGlobalString(name: string): string;
  putSettingsGlobalInt(name: string, value: number): void;
  putSettingsGlobalLong(name: string, value: number): void;
  putSettingsGlobalString(name: string, value: string): void;

  getSettingsSystemInt(name: string, defaultValue: number): number;
  getSettingsSystemLong(name: string, defaultValue: number): number;
  getSettingsSystemString(name: string): string;
  putSettingsSystemInt(name: string, value: number): void;
  putSettingsSystemLong(name: string, value: number): void;
  putSettingsSystemString(name: string, value: string): void;

  getSettingsSecureInt(name: string, defaultValue: number): number;
  getSettingsSecureLong(name: string, defaultValue: number): number;
  getSettingsSecureString(name: string): string;
  putSettingsSecureInt(name: string, value: number): void;
  putSettingsSecureLong(name: string, value: number): void;
  putSettingsSecureString(name: string, value: string): void;

  // ─────────────────────────────────────────────
  // קישור לאירועים
  // ─────────────────────────────────────────────

  /**
   * קישור קוד JS להרצה כאשר אירוע מסוים מתרחש.
   * @param event שם האירוע
   * @param jsCode קוד JavaScript שיורץ בעת האירוע (כ-string)
   * @example fully.bind('screenOn', 'console.log("screen is on")');
   */
  bind(event: FullyKioskEvent, jsCode: string): void;
}

declare global {
  interface Window {
    /** ממשק ה-JS של Fully Kiosk Browser — קיים רק כשהאפליקציה רצה בתוך Fully */
    fully?: FullyKiosk;
  }
}
