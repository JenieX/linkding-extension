import { BrowserMetadata, TabInfo } from './types';

export async function getCurrentTabInfo(): Promise<TabInfo> {
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

export async function getBrowserMetadata(): Promise<BrowserMetadata> {
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
      target: { tabId: tab!.id! },
      func: getMetadata,
    })
    .then((result) => result[0]!.result!)
    .catch(errorHandler);
}

export function getStorage() {
  if (typeof chrome.storage !== 'undefined') {
    return chrome.storage.local;
  } else {
    throw new Error('Storage API not found.');
  }
}

export async function getStorageItem(key) {
  const storage = getStorage();
  const results = await storage.get([key]);
  let data = results[key];

  return data;
}

export function setStorageItem(key, value) {
  const storage = getStorage();
  return storage.set({ [key]: value });
}

export function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

export function showBadge(tabId) {
  chrome.action.setBadgeText({ text: '★', tabId: tabId });
  chrome.action.setBadgeTextColor({ color: '#FFE234', tabId: tabId });
  chrome.action.setBadgeBackgroundColor({
    color: 'rgba(100,100,100,1)',
    tabId: tabId,
  });
}

export function removeBadge(tabId) {
  chrome.action.setBadgeText({ text: '', tabId: tabId });
}

export function runSinglefile() {
  const extensionId = 'mpiodijhokgodhhofbcjdecpffjipkle';
  chrome.runtime.sendMessage(extensionId, 'save-page');
}

export function createTab(url) {
  chrome.tabs.create({ url });
}
