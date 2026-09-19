import { getStorageItem, setStorageItem } from './browser.js';

/** @typedef {import('./types').Configuration} Configuration */

const CONFIG_KEY = 'ld_ext_config';

/** @type {Configuration} */
const DEFAULTS = {
  baseUrl: '',
  token: '',
  default_tags: '',
  useBrowserMetadata: false,
  runSinglefile: false,
  closeAddBookmarkWindowOnSave: false,
  closeAddBookmarkWindowOnSaveMs: 500,
};

/** @returns {Promise<Configuration>} */
async function getConfiguration() {
  const configString = /** @type {string} */ (await getStorageItem(CONFIG_KEY));
  const config = configString
    ? /** @type {Configuration} */
      (JSON.parse(configString))
    : {};

  return {
    ...DEFAULTS,
    ...config,
  };
}

async function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  await setStorageItem(CONFIG_KEY, configJson);
}

function isConfigurationComplete(config) {
  return config.baseUrl && config.token;
}

export { getConfiguration, isConfigurationComplete, saveConfiguration };
