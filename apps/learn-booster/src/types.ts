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
  type: "file" | "folder";
}

/**
 * Video Controller Interface
 * Manages video playback operations
 */
export interface VideoController {
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

/**
 * Props for the VideoDialog component
 */
export interface VideoDialogProps {
  config: Config;
  visible: boolean;
  videoUrl: string;
  type: string;
  videoController?: VideoController;
  time?: string;
  onVideoEnded: () => void;
  hideProgress?: boolean;
  hideModal: () => void;
}

/**
 * Controls returned from the main API
 */
export interface PlayerControls {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  video?: VideoController;
}

export type Config = {
  videoDisplayTimeInMS: number;
  videoUrls: string[];
  type: string;
  mode: 'video' | 'app';
  videoSource: 'local' | 'google-drive' | 'youtube';
  googleDriveFolderUrl?: string;
  hideVideoProgress?: boolean;
  turnsPerVideo: number;
  appName?: string;

  systemConfig: {
    enableHideModalButton: boolean;
    disableGameCodeInjection: boolean;
  };
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
  ? T[P]  // שמירה על טיפוס המערך המקורי
  : T[P] extends object
  ? DeepPartial<T[P]>
  : T[P];
};

export type ConfigOverrides = DeepPartial<Config>;

export interface FullyKiosk {
  getFileList: (folder: string) => string;
  readFile: (path: string) => string;
  getBooleanSetting: (key: string) => void;
  setBooleanSetting: (key: string, value: boolean) => void;
  bringToForeground: (millis?: number) => void;
  startApplication(packageName: string, action?: string, url?: string): void;
}

/**
 * בקר עבור דף ההגדרות
 */
export interface SettingsController {
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}
