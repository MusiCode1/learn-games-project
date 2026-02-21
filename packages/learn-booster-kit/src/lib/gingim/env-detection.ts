export interface GingimEnvVals {
  isGingim: boolean;
  isGamePage: boolean;
  isGamesListPage: boolean;
  isGingimHomepage: boolean;
  isBoosterIframe: boolean;
  isDirectToGamePage: boolean;
}

const GAME_PAGE_URL = '/wp-content/uploads/new_games/';

export function getGingimEnvVals(): GingimEnvVals {
  const thisUrl = new URL(window.location.href),
    hostname = window.location.hostname,
    fullPath = window.location.href,
    isIframe = window.self !== window.top,
    isGingim = (hostname === 'gingim.net'),
    isGamesListPage = (thisUrl.pathname.startsWith('/games')),
    isGamePage = (fullPath.includes(GAME_PAGE_URL)),
    isGingimHomepage = (isGingim && thisUrl.pathname === '/'),
    isBoosterIframe = isIframe && (window.name === "booster-iframe" || (window.frameElement as HTMLElement)?.dataset?.owner === "booster-iframe"),
    isDirectToGamePage = (thisUrl.pathname.startsWith('/direct-to-game'));

  return {
    isGingim, isGamePage, isGamesListPage, isGingimHomepage,
    isBoosterIframe, isDirectToGamePage,
  };
}
