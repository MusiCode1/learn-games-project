/**
 * ריכוז ואימות משתני סביבה VITE_* באמצעות ArkType.
 * כל צריכה של import.meta.env.VITE_* צריכה לעבור דרך קובץ זה.
 * import.meta.env.DEV ו-import.meta.url נשארים ישירות — Vite built-ins.
 */

import { type } from "arktype";

const ViteEnvSchema = type({
  "VITE_GOOGLE_DRIVE_API_TOKEN?": "string",
  "VITE_GOOGLE_DRIVE_DEFAULT_FOLDER?": "string",
  "VITE_SITE_DEFAULT_UTL?": "string",
  "VITE_PASS_KEY?": "string",
  "VITE_DEMO_APP_LIST_ORIGIN?": "string",
  "VITE_PRJ_DOMAIN?": "string",
  "VITE_DEFAULT_APP_PACKAGE?": "string",
});

export type ViteEnv = typeof ViteEnvSchema.infer;

const LOG_PREFIX = "[env]";

const result = ViteEnvSchema(import.meta.env);
if (result instanceof type.errors) {
  console.error(`${LOG_PREFIX} Validation failed:`, result.summary);
}
const validated: ViteEnv = result instanceof type.errors ? {} : result;

// אזהרות על משתנים קריטיים חסרים
const warnings: string[] = [];
if (!validated.VITE_GOOGLE_DRIVE_API_TOKEN)
  warnings.push("VITE_GOOGLE_DRIVE_API_TOKEN חסר — קריאות Google Drive API ייכשלו");
if (!validated.VITE_GOOGLE_DRIVE_DEFAULT_FOLDER)
  warnings.push("VITE_GOOGLE_DRIVE_DEFAULT_FOLDER חסר — תיקיית סרטונים ברירת מחדל לא תוגדר");

if (warnings.length > 0) {
  console.warn(`${LOG_PREFIX} Missing env vars:\n  - ${warnings.join("\n  - ")}`);
}

export const env = validated;
