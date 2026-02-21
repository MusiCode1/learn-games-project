/**
 * כל שמות האירועים הנתמכים ב-fully.bind()
 */
export type FullyKioskEvent =
  // מסך
  | 'screenOn'
  | 'screenOff'
  // מקלדת
  | 'showKeyboard'
  | 'hideKeyboard'
  // רשת
  | 'networkDisconnect'
  | 'networkReconnect'
  | 'internetDisconnect'
  | 'internetReconnect'
  // חשמל
  | 'unplugged'
  | 'pluggedAC'
  | 'pluggedUSB'
  | 'pluggedWireless'
  // שומר מסך ו-Daydream
  | 'onScreensaverStart'
  | 'onScreensaverStop'
  | 'onDaydreamStart'
  | 'onDaydreamStop'
  // סוללה וקול
  | 'onBatteryLevelChanged'
  | 'volumeUp'
  | 'volumeDown'
  // אוזניות
  | 'headphonesPlugged'
  | 'headphonesUnplugged'
  // תנועה וחישה
  | 'onMotion'
  | 'facesDetected'
  | 'onDarkness'
  | 'onMovement'
  | 'onIBeacon'
  // Broadcast
  | 'broadcastReceived'
  // סורק ברקוד / QR
  | 'onQrScanSuccess'
  | 'onQrScanCancelled'
  // Bluetooth
  | 'onBtConnectSuccess'
  | 'onBtConnectFailure'
  | 'onBtDataRead'
  // NFC
  | 'onNdefDiscovered'
  | 'onNfcTagDiscovered'
  | 'onNfcTagRemoved'
  // הורדת קבצים
  | 'onDownloadSuccess'
  | 'onDownloadFailure'
  | 'onUnzipSuccess'
  | 'onUnzipFailure'
  // TTS
  | 'ttsInitSuccess'
  | 'ttsTextQueued'
  | 'ttsSilenceQueued'
  | 'ttsUtteranceStart'
  | 'ttsUtteranceError'
  | 'ttsUtteranceDone';
