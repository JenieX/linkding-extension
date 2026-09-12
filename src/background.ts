import { loadServerMetadata } from './cache';
import { getConfiguration, isConfigurationComplete } from './configuration';
import {
  getCurrentTabInfo,
  removeBadge,
  showBadge,
  showSuccessBadge,
} from './browser';
import { LinkdingApi } from './linkding';
import { Configuration, ServerMetadata } from './types';
import { isNumber, assertedType } from '@jeniex/utils/browser';

let api: LinkdingApi;
let configuration: Configuration;
let hasCompleteConfiguration = false;

async function initApi() {
  if (api) {
    return true;
  }

  configuration = await getConfiguration();
  hasCompleteConfiguration = isConfigurationComplete(configuration);

  console.log(configuration);

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
    .search(text, { limit: 5 })
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

/* Context Menu */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-linkding',
    title: 'Save to linkding',
    contexts: ['link'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === 'save-to-linkding') {
    await saveToLinkding(info.linkUrl);
  }
});

async function saveToLinkding(url?: string) {
  const isReady = await initApi();
  if (!isReady) {
    return;
  }

  try {
    const serverMetadata = await loadServerMetadata(url, false);
    const title = serverMetadata!.metadata.title ?? '';
    const description = serverMetadata!.metadata.description ?? '';
    const tagNames = configuration.default_tags
      ? configuration.default_tags
          .split(' ')
          .map((tag) => tag.trim())
          .filter((tag) => !!tag)
      : [];
    const unread = configuration.unreadSelected ?? false;
    const shared = configuration.shareSelected ?? false;

    const bookmark = {
      url,
      title,
      description,
      tag_names: tagNames,
      unread,
      shared,
    };

    await api.saveBookmark(bookmark);

    // Show success badge temporarily
    const currentTab = await getCurrentTabInfo();
    showSuccessBadge(currentTab.id);
    setTimeout(async () => {
      const tabMetadata = await loadServerMetadata(currentTab.url, true);
      setDynamicBadge(assertedType(currentTab.id, isNumber), tabMetadata);
    }, 1000);
  } catch (error) {
    console.error('Error saving link to linkding:', error);
  }
}
