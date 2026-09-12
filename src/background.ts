import { loadServerMetadata } from './cache';
import { LinkdingApi } from './linkding';
import { getConfiguration, isConfigurationComplete } from './configuration';
import { getCurrentTabInfo, removeBadge, showBadge } from './browser';
import { Configuration, ServerMetadata } from './types';

let api: LinkdingApi;
let configuration: Configuration;
let hasCompleteConfiguration = false;

async function initApi() {
  if (api) {
    return true;
  }

  configuration = await getConfiguration();
  hasCompleteConfiguration = isConfigurationComplete(configuration);

  if (hasCompleteConfiguration) {
    api = new LinkdingApi(configuration);
  }

  return api !== undefined;
}

/* Dynamic badge */
async function setDynamicBadge(
  tabId: number,
  tabMetadata: ServerMetadata | null,
) {
  // Set badge if tab is bookmarked
  if (tabMetadata?.bookmark) {
    showBadge(tabId);
  } else {
    removeBadge(tabId);
  }
}

/* Omnibox / Search integration */

chrome.omnibox.onInputStarted.addListener(async () => {
  const isReady = await initApi();
  const description = isReady
    ? 'Search bookmarks in linkding'
    : '⚠️ Please configure the linkding extension first';

  chrome.omnibox.setDefaultSuggestion({ description });
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  if (!api) {
    return;
  }

  api
    .search(text, { limit: 9 })
    .then((results) => {
      const bookmarkSuggestions = results.map((bookmark) => ({
        content: bookmark.url,
        description: bookmark.title || bookmark.website_title || bookmark.url,
      }));
      suggest(bookmarkSuggestions);
    })
    .catch((error) => {
      console.error(error);
    });
});

chrome.omnibox.onInputEntered.addListener(async (content, disposition) => {
  if (!hasCompleteConfiguration || !content) {
    return;
  }

  const isUrl = /^http(s)?:\/\//.test(content);
  const url = isUrl
    ? content
    : `${configuration.baseUrl}/bookmarks?q=${encodeURIComponent(content)}`;

  // Edge doesn't allow updating the New Tab Page (tested with version 117).
  // Trying to do so will throw: "Error: Cannot update NTP tab."
  // As a workaround, open a new tab instead.
  if (disposition === 'currentTab') {
    const tabInfo = await getCurrentTabInfo();
    if (tabInfo.url === 'edge://newtab/') {
      disposition = 'newForegroundTab';
    }
  }

  switch (disposition) {
    case 'currentTab':
      chrome.tabs.update({ url });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ url });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ url, active: false });
      break;
  }
});

/* Precache bookmark / website metadata when tab or URL changes */

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabInfo = await getCurrentTabInfo();
  let tabMetadata = await loadServerMetadata(tabInfo.url, true);
  setDynamicBadge(activeInfo.tabId, tabMetadata);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only interested in URL changes
  // Ignore URL changes in non-active tabs
  if (!changeInfo.url || !tab.active) {
    return;
  }

  let tabMetadata = await loadServerMetadata(tab.url, true);
  setDynamicBadge(tabId, tabMetadata);
});
