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
  // הגדרות כלליות
  /**
   * סוג התגמול שיוצג למשתמש (סרטון או אפליקציה)
   */
  rewardType: 'video' | 'app';
  
  /**
   * משך הזמן (במילישניות) להצגת התגמול
   */
  rewardDisplayDurationMs: number;
  
  /**
   * מספר המשימות שיש לבצע לפני הצגת תגמול
   */
  turnsPerReward: number;
  
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
  
  // הגדרות מערכת - לא מיועדות לשינוי ע"י המשתמש
  system: {
    /**
     * האם לאפשר כפתור להסתרת המודל
     */
    enableHideModalButton: boolean;
    
    /**
     * האם לבטל הזרקת קוד למשחק
     */
    disableGameCodeInjection: boolean;
  };
};

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

/**
 * פריט וידאו בודד
 */
export interface VideoItem {
  url: string;
  mimeType: string;
}

/**
 * רשימת פריטי וידאו
 */
export type VideoList = VideoItem[];
