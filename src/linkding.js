/** @typedef {import('./types').Configuration} Configuration */
/** @typedef {import('./types').Profile} Profile */
/** @typedef {import('./types').SaveBookmarkOptions} SaveBookmarkOptions */
/** @typedef {import('./types').SearchOptions} SearchOptions */
/** @typedef {import('./types').ServerBookmark} ServerBookmark */
/** @typedef {import('./types').ServerMetadata} ServerMetadata */
/** @typedef {import('./types').Tag} Tag */

class LinkdingApi {
  /** @param {Configuration} configuration */
  constructor(configuration) {
    this.configuration = configuration;
  }

  /** @param {number} bookmarkId */
  async getBookmark(bookmarkId) {
    const configuration = this.configuration;

    return fetch(`${configuration.baseUrl}/api/bookmarks/${bookmarkId}/`, {
      headers: {
        Authorization: `Token ${configuration.token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        return /** @type {Promise<ServerBookmark>} */ (response.json());
      }
      return Promise.reject(
        `Error retrieving bookmark: ${response.statusText}`,
      );
    });
  }

  async saveBookmark(
    bookmark,
    /** @type {SaveBookmarkOptions} */ options = {},
  ) {
    const configuration = this.configuration;
    const query = ['disable_scraping'];
    if (options.disable_html_snapshot) {
      query.push('disable_html_snapshot');
    }
    const queryString = query.join('&');

    return fetch(`${configuration.baseUrl}/api/bookmarks/?${queryString}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${configuration.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmark),
    }).then((response) => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 400) {
        return response
          .json()
          .then((body) =>
            Promise.reject(`Validation error: ${JSON.stringify(body)}`),
          );
      } else {
        return Promise.reject(`Request error: ${response.statusText}`);
      }
    });
  }

  async deleteBookmark(bookmarkId) {
    const configuration = this.configuration;

    return fetch(`${configuration.baseUrl}/api/bookmarks/${bookmarkId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Token ${configuration.token}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      if (response.status !== 204) {
        return Promise.reject(`Request error: ${response.statusText}`);
      }
    });
  }

  async getTags() {
    const configuration = this.configuration;

    const response = await fetch(
      `${configuration.baseUrl}/api/tags/?limit=5000`,
      {
        headers: {
          Authorization: `Token ${configuration.token}`,
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`Error loading tags: ${response.statusText}`);
    }

    const body = /** @type {{ results: Tag[] }} */ (await response.json());

    return body.results;
  }

  /**
   * @param {string} text
   * @param {SearchOptions} options
   */
  async search(text, options) {
    const configuration = this.configuration;
    const q = encodeURIComponent(text);
    const limit = options.limit || 100;

    const response = await fetch(
      `${configuration.baseUrl}/api/bookmarks/?q=${q}&limit=${limit}`,
      {
        headers: {
          Authorization: `Token ${configuration.token}`,
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`Error searching bookmarks: ${response.statusText}`);
    }

    const body = /** @type {{ results: ServerBookmark[] }} */ (
      await response.json()
    );

    return body.results;
  }

  async check(url) {
    const configuration = this.configuration;
    url = encodeURIComponent(url);

    return fetch(`${configuration.baseUrl}/api/bookmarks/check/?url=${url}`, {
      headers: {
        Authorization: `Token ${configuration.token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        return /** @type {Promise<ServerMetadata>} */ (response.json());
      }
      return Promise.reject(
        `Error checking bookmark URL: ${response.statusText}`,
      );
    });
  }

  async getUserProfile() {
    const configuration = this.configuration;

    return fetch(`${configuration.baseUrl}/api/user/profile/`, {
      headers: {
        Authorization: `Token ${configuration.token}`,
      },
    }).then((response) => {
      if (response.status === 200) {
        return /** @type {Promise<Profile>} */ (response.json());
      }
      return Promise.reject(
        `Error retrieving user profile: ${response.statusText}`,
      );
    });
  }

  async testConnection() {
    const configuration = this.configuration;
    return fetch(`${configuration.baseUrl}/api/bookmarks/?limit=1`, {
      headers: {
        Authorization: `Token ${configuration.token}`,
      },
    })
      .then((response) =>
        response.status === 200 ? response.json() : Promise.reject(response),
      )
      .then((body) => !!body.results)
      .catch(() => false);
  }
}

export { LinkdingApi };
