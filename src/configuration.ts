import { getStorageItem, setStorageItem } from './browser';
import { Configuration } from './types';

const CONFIG_KEY = 'ld_ext_config';
const DEFAULTS: Configuration = {
  baseUrl: '',
  token: '',
  default_tags: '',
  useBrowserMetadata: false,
  runSinglefile: false,
  precacheEnabled: false,
  closeAddBookmarkWindowOnSave: false,
  closeAddBookmarkWindowOnSaveMs: 500,
};

export async function getConfiguration(): Promise<Configuration> {
  const configJson = await getStorageItem(CONFIG_KEY);
  const config = configJson
    ? (JSON.parse(configJson as string) as Configuration)
    : {};

  return {
    ...DEFAULTS,
    ...config,
  };
}

export async function saveConfiguration(config) {
  const configJson = JSON.stringify(config);
  await setStorageItem(CONFIG_KEY, configJson);
}

export function isConfigurationComplete(config) {
  return config.baseUrl && config.token;
}
