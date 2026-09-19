import { asserted } from '../node_modules/@jeniex/utils/browser/index.js';

/** @typedef {import('./types').BrowserMetadata} BrowserMetadata */
/** @typedef {import('./types').TabInfo} TabInfo */

/** @returns {Promise<TabInfo>} */
async function getCurrentTabInfo() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const tab = tabs?.[0];

  return {
    id: tab?.id ?? '',
    url: tab?.url ?? '',
    title: tab?.title ?? '',
  };
}

/** @returns {Promise<BrowserMetadata>} */
async function getBrowserMetadata() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const tab = tabs?.[0];

  const errorHandler = (error) => {
    console.error('Failed to load browser metadata', error);
    return { title: '', description: '' };
  };

  const getMetadata = () => {
    const title =
      document.querySelector('title')?.textContent ||
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content') ||
      '';

    const description =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content') ||
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content') ||
      '';

    return { title, description };
  };

  return chrome.scripting
    .executeScript({
      target: { tabId: asserted(tab?.id) },
      func: getMetadata,
    })
    .then((result) => asserted(result[0]?.result))
    .catch(errorHandler);
}

async function getStorageItem(key) {
  const results = await chrome.storage.local.get([key]);
  let data = results[key];

  return data;
}

function setStorageItem(key, value) {
  return chrome.storage.local.set({ [key]: value });
}

function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

function runSinglefile() {
  const extensionId = 'mpiodijhokgodhhofbcjdecpffjipkle';
  chrome.runtime.sendMessage(extensionId, 'save-page');
}

function createTab(url) {
  chrome.tabs.create({ url });
}

export {
  createTab,
  getBrowserMetadata,
  getCurrentTabInfo,
  getStorageItem,
  openOptions,
  runSinglefile,
  setStorageItem,
};
