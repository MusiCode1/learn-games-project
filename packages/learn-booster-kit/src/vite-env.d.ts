/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_DRIVE_API_TOKEN?: string;
  readonly VITE_GOOGLE_DRIVE_DEFAULT_FOLDER?: string;
  readonly VITE_SITE_DEFAULT_UTL?: string;
  readonly VITE_PASS_KEY?: string;
  readonly VITE_DEMO_APP_LIST_ORIGIN?: string;
  readonly VITE_PRJ_DOMAIN?: string;
  readonly VITE_DEFAULT_APP_PACKAGE?: string;
}
