import type { Component as ComponentImport, SvelteComponent } from "svelte";
import type { Writable, Readable } from "svelte/store";
export type { FullyKiosk, FullyItem as FullyKioskItem } from 'fully-kiosk-js';

/**
 * מייצג פריט (קובץ או תיקייה) במערכת הקבצים של Fully Kiosk
 * @deprecated השתמש ב-FullyKioskItem מ-fully-kiosk-js
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
 * Game Configuration passing to triggerReward
 */
export interface GameConfig {
  delay?: number;
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
export interface TimerController {
  start: () => void;
  pause: () => void;
  stop: () => void;
  configure: (durationMs: number) => void;
  onDone: () => Promise<void>;
  time: Readable<number>;
  getTime: () => string;
  subscribe: (run: (value: string) => void, invalidate?: (value?: string) => void) => () => void;
}

export interface PlayerControls {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  video?: VideoController;
  modalHasHidden: Writable<boolean>;
}

export interface SiteBoosterControls {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  setUrl: (url: string) => void;
  modalHasHidden: Writable<boolean>;
  getIframe: () => HTMLIFrameElement | null;
}

export type OldConfig = {
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

/**
 * טיפוס המייצג את מבנה ההגדרות של המערכת
 */
export type Config = {

  appVersion: string;
  // הגדרות כלליות
  /**
   * סוג התגמול שיוצג למשתמש (סרטון או אפליקציה)
   */
  rewardType: 'video' | 'app' | 'site';

  /**
   * משך הזמן (במילישניות) להצגת התגמול
   */
  rewardDisplayDurationMs: number;

  /**
   * מספר המשימות שיש לבצע לפני הצגת תגמול
   */
  turnsPerReward: number;

  environmentMode: 'production' | 'development' | 'preview';

  // הגדרות הודעות ותזכורות
  notifications: {
    // הודעה לפני סיום זמן התגמול
    endingNotification: {
      /**
       * טקסט ההודעה שתוצג לפני סיום זמן התגמול
       */
      text: string;

      /**
       * כמה זמן (במילישניות) לפני סיום להציג את ההודעה
       */
      displayBeforeEndMs: number;

      /**
       * מתי להציג את ההודעה (במצב וידאו, אפליקציה, שניהם, או אף פעם)
       */
      enabledFor: 'video' | 'app' | 'both' | 'none';
    };
  };

  // הגדרות וידאו - רלוונטיות רק כאשר rewardType === 'video'
  video: {
    /**
     * רשימת סרטונים להצגה, כל אחד עם ה-URL וה-MIME Type שלו
     */
    videos: Array<{
      /**
       * כתובת URL של הסרטון
       */
      url: string;

      /**
       * סוג/פורמט הסרטון (למשל 'video/mp4')
       */
      mimeType: string;
    }>;

    /**
     * מקור הסרטונים (מקומי, גוגל דרייב, או יוטיוב)
     */
    source: 'local' | 'google-drive' | 'youtube';

    /**
     * כתובת URL של תיקיית Google Drive שמכילה סרטונים
     */
    googleDriveFolderUrl?: string;

    /**
     * האם להסתיר את פס ההתקדמות של הסרטון
     */
    hideProgressBar?: boolean;
  };

  // הגדרות אפליקציה - רלוונטיות רק כאשר rewardType === 'app'
  app: {
    /**
     * שם החבילה (Package Name) של האפליקציה להפעלה
     */
    packageName?: string;
  };

  // הגדרות מחזק אתר
  booster: {
    /**
     * כתובת האתר של מחזק האתר
     */
    siteUrl: string;
  };

  // הגדרות מערכת - לא מיועדות לשינוי ע"י המשתמש
  system: {
    /**
     * האם לאפשר כפתור להסתרת המודל
     */
    enableHideModalButton: boolean;

    /**
     * האם לבטל הזרקת קוד למשחק
     * @deprecated gingim-specific, no longer used
     */
    disableGameCodeInjection: boolean;
  };

  // ערכי סביבה ואינפורמציה על האפליקציה
  envVals: {
    hostname: string;
    fullPath: string;
    isIframe: boolean;
    selfUrl: string;
    isDevServer: boolean;
    devMode: boolean;
    deployServer: string;
    isDeployServer: boolean;
    /** @deprecated gingim-specific, always false */
    isGingim: boolean;
    /** @deprecated gingim-specific, always false */
    isGamePage: boolean;
    /** @deprecated gingim-specific, always false */
    isGamesListPage: boolean;
    /** @deprecated gingim-specific, always false */
    isGingimHomepage: boolean;
    /** @deprecated gingim-specific, always false */
    isBoosterIframe: boolean;
    /** @deprecated gingim-specific, always false */
    isDirectToGamePage: boolean;
  };
};

export type VideoConfig = Config & { rewardType: 'video' };
export type AppConfig = Config & { rewardType: 'app' }

type DeepPartial<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [P in keyof T]?: T[P] extends (infer U)[]
  ? T[P]  // שמירה על טיפוס המערך המקורי
  : T[P] extends object
  ? DeepPartial<T[P]>
  : T[P];
};

export type ConfigOverrides = DeepPartial<Config>;

export interface Profile {
  id: string;
  name: string;
  color?: string;
  tags?: string[];
  config: Config;
  meta: {
    createdAt: number;
    updatedAt: number;
  };
}

export interface ProfilesState {
  schemaVersion: number;
  profiles: Record<string, Profile>;
  order: string[];
  activeProfileId: string | null;
  uiEnabled: boolean;
  dirtyConfig: Config | null;
}

export interface ProfilesExportPayload {
  schemaVersion: number;
  profiles: Profile[];
  activeProfileId: string | null;
  uiEnabled: boolean;
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

/**
 * פריט וידאו בודד
 */
export interface VideoItem {
  url: string;
  mimeType: string;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * רשימת פריטי וידאו
 */
export type VideoList = VideoItem[];

export type Exports = Record<string, any> | Record<string, Record<string, any>>;
export type Props = Record<string, any>;
export type Component = SvelteComponent<Props, Exports> | ComponentImport<Props, Exports, string>;

export interface AppListItem {
  icon: string;      // Base64 מקודד של האייקון
  label: string;     // שם האפליקציה
  package: string;   // שם החבילה (Package Name)
  version: string;   // גרסת האפליקציה
  versionCode: number; // קוד גרסה מספרי
}
