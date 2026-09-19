import { getStorageItem, setStorageItem } from './browser.js';
import { getConfiguration, isConfigurationComplete } from './configuration.js';
import { LinkdingApi } from './linkding.js';

/** @typedef {import('./types').Profile} Profile */

const PROFILE_CACHE_KEY = 'ld_profile_cache';

async function updateProfile() {
  const configuration = await getConfiguration();
  const hasCompleteConfiguration = isConfigurationComplete(configuration);

  if (!hasCompleteConfiguration) {
    return null;
  }

  const api = new LinkdingApi(configuration);

  try {
    const profile = await api.getUserProfile();
    await cacheProfile(profile);
    return profile;
  } catch (e) {
    // Linkding <v1.22 does not support the profile API
    // In that case return null
    return null;
  }
}

async function getProfile() {
  const jsonString = /** @type {string} */ (
    await getStorageItem(PROFILE_CACHE_KEY)
  );

  return jsonString ? /** @type {Profile} */ (JSON.parse(jsonString)) : null;
}

/** @param {Profile} profile */
async function cacheProfile(profile) {
  const json = JSON.stringify(profile);
  await setStorageItem(PROFILE_CACHE_KEY, json);
}

export { cacheProfile, getProfile, updateProfile };
