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
