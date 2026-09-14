import { LinkdingApi } from './linkding';
import { getConfiguration, isConfigurationComplete } from './configuration';

async function loadServerMetadata(url, precacheRequest = false) {
  // console.log(new Error().stack);

  // the function should be called with precacheRequest = true
  // anytime before the user has consciously decided to bookmark it.
  // see https://github.com/sissbruecker/linkding-extension/issues/36
  const configuration = await getConfiguration();
  const hasCompleteConfiguration = isConfigurationComplete(configuration);

  // Skip if extension is not configured or URL is invalid
  if (!hasCompleteConfiguration || !url || !url.match(/^http(s)?:\/\//)) {
    return null;
  }

  if (!precacheRequest) {
    const api = new LinkdingApi(configuration);
    try {
      const tabMetadata = await api.check(url);

      // Linkding <v1.17 does not return full bookmark data from check API
      // In that case fetch the bookmark with a separate request
      if (tabMetadata.bookmark && !tabMetadata.bookmark.date_added) {
        tabMetadata.bookmark = await api.getBookmark(tabMetadata.bookmark.id);
      }

      return tabMetadata;
    } catch (e) {
      console.error(e);
      return null;
    }
  } else {
    return null;
  }
}

export { loadServerMetadata };
