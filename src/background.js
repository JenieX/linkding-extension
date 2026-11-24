import { asserted } from '../node_modules/@jeniex/utils/browser/index.js';
import { LinkdingApi } from './linkding.js';
import { getConfiguration, isConfigurationComplete } from './configuration.js';
import { getCurrentTabInfo } from './browser.js';

/** @typedef {import('./types').Configuration} Configuration */

/** @type {LinkdingApi} */
let api;

/** @type {Configuration} */
let configuration;

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

chrome.omnibox.onInputStarted.addListener(async () => {
  const isReady = await initApi();
  const description = isReady
    ? 'Search bookmarks in linkding'
    : '⚠️ Please configure the linkding extension first';

  chrome.omnibox.setDefaultSuggestion({ description });
});

/** @param {string} text */
async function getTagsSuggestions(text) {
  const availableTags = await api.getTags();

  const tags = text.split(' ');
  const previousTags = tags.slice(0, -1);
  const lastTag = asserted(tags.at(-1));

  const inputLastTag = lastTag.slice(1);
  console.log({ inputLastTag });

  /** @type {chrome.omnibox.SuggestResult[]} */
  const tagSuggestions = availableTags
    .filter((tag) => tag.name.startsWith(inputLastTag))
    .map((tag) => ({
      content: `${previousTags.join(' ')} #${tag.name}`,
      description: tag.name,
    }))
    .slice(0, 9);

  console.log(tagSuggestions);

  return tagSuggestions;
}

/** @param {string} text */
async function getBookmarkSuggestions(text) {
  const results = await api.search(text, { limit: 9 });

  /** @type {chrome.omnibox.SuggestResult[]} */
  const bookmarkSuggestions = results.map((bookmark) => {
    return {
      content: bookmark.url,

      // https://stackoverflow.com/a/1091953/89484
      description: (bookmark.title || bookmark.website_title || bookmark.url)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;'),
    };
  });
  return bookmarkSuggestions;
}

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!api) {
    return;
  }

  if (!text.includes('#') || text.endsWith(' ')) {
    suggest(await getBookmarkSuggestions(text));
  } else {
    suggest(await getTagsSuggestions(text));
  }
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
