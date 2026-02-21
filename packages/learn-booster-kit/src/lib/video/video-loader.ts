import type { Config, VideoItem, VideoList } from "../../types";
import {
  extractGoogleDriveFolderId,
  getFolderVideosUrls,
} from "./google-drive-video";
import { shuffleArray } from "../utils/shuffle-array";
import { getFileList } from "../fully-kiosk/fully-kiosk";
import { log } from "../logger.svelte";

const devMode = import.meta.env.DEV,
  selfUrl = import.meta.url;

export function urlsToVideoItems(
  urls: string[],
  defaultMimeType: string = "video/mp4"
): VideoList {
  return urls.map((url) => {
    let mimeType = defaultMimeType;
    const extension = url.split(".").pop()?.toLowerCase();

    if (extension) {
      switch (extension) {
        case "mp4":
          mimeType = "video/mp4";
          break;
        case "webm":
          mimeType = "video/webm";
          break;
        case "ogg":
        case "ogv":
          mimeType = "video/ogg";
          break;
        case "mov":
          mimeType = "video/quicktime";
          break;
        case "avi":
          mimeType = "video/x-msvideo";
          break;
        case "wmv":
          mimeType = "video/x-ms-wmv";
          break;
        case "flv":
          mimeType = "video/x-flv";
          break;
        case "m3u8":
          mimeType = "application/x-mpegURL";
          break;
        case "ts":
          mimeType = "video/MP2T";
          break;
        case "3gp":
          mimeType = "video/3gpp";
          break;
        case "mkv":
          mimeType = "video/x-matroska";
          break;
      }
    }

    return { url, mimeType };
  });
}

export function createLocalVideoItem(): VideoItem {
  const baseUrl = new URL(selfUrl).origin.toString();
  const localVideo = new URL("videos/video.webm", baseUrl).toString();
  const fallbackVideo =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const url = fallbackVideo;
  const extension = url.split(".").pop()?.toLowerCase();
  const mimeType = "video/mp4";

  void localVideo; void extension; void devMode;

  return { url, mimeType };
}

export async function loadGoogleDriveVideos(
  folderUrl?: string
): Promise<VideoList> {
  if (!folderUrl) {
    console.warn("לא סופקה כתובת URL של תיקיית גוגל דרייב");
    return [];
  }

  try {
    const googleDriveFolderId = extractGoogleDriveFolderId(folderUrl);
    const driveUrls = await getFolderVideosUrls(googleDriveFolderId);

    if (driveUrls.length > 0) {
      return urlsToVideoItems(driveUrls);
    } else {
      console.warn("לא נמצאו סרטונים בתיקיית גוגל דרייב");
      return [];
    }
  } catch (error) {
    console.error("שגיאה בקבלת סרטונים מגוגל דרייב:", error);
    return [];
  }
}

export async function loadDefaultGoogleDriveVideos(): Promise<VideoList> {
  try {
    const defaultFolderId = extractGoogleDriveFolderId(
      import.meta.env.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER
    );
    const driveUrls = await getFolderVideosUrls(defaultFolderId);

    if (driveUrls.length > 0) {
      return urlsToVideoItems(driveUrls);
    } else {
      console.warn("לא נמצאו סרטונים בתיקיית גוגל דרייב ברירת המחדל");
      return [];
    }
  } catch (error) {
    console.error("שגיאה בקבלת סרטונים מתיקיית ברירת המחדל:", error);
    return [];
  }
}

export async function loadLocalVideos(): Promise<VideoList> {
  try {
    if (window.fully) {
      const fileList = getFileList();
      if (fileList && fileList.length > 0) {
        return urlsToVideoItems(fileList);
      } else {
        console.warn("לא נמצאו סרטונים מקומיים ב-Fully Kiosk");
      }
    }

    return [createLocalVideoItem()];
  } catch (error) {
    console.error("שגיאה בטעינת סרטונים מקומיים:", error);
    return [createLocalVideoItem()];
  }
}

export async function loadVideoUrls(config: Config): Promise<VideoList> {
  if (config.rewardType !== "video") {
    log("מצב אפליקציה, לא נטענים סרטונים");
    return [];
  }

  try {
    let videoList: VideoList = [];

    switch (config.video.source) {
      case "google-drive":
        videoList = await loadGoogleDriveVideos(
          config.video.googleDriveFolderUrl
        );

        if (videoList.length === 0) {
          log("מנסה לטעון סרטונים מתיקיית ברירת המחדל");
          videoList = await loadDefaultGoogleDriveVideos();
        }
        break;

      case "local":
        videoList = await loadLocalVideos();
        break;

      case "youtube":
        console.warn("תמיכה ביוטיוב עדיין לא מומשה");
        break;

      default:
        console.warn(`מקור סרטונים לא ידוע: ${config.video.source}`);
        break;
    }

    if (videoList.length === 0) {
      console.warn("לא נמצאו סרטונים במקור שנבחר, מחזיר רשימה ריקה");
    } else {
      log(`נטענו ${videoList.length} סרטונים`);
    }

    return shuffleArray([...videoList]);
  } catch (error) {
    console.error("שגיאה כללית בטעינת סרטונים:", error);
    return [];
  }
}

export function getRandomVideo(videos: VideoList): VideoItem | undefined {
  if (videos.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * videos.length);
  return videos[randomIndex];
}
