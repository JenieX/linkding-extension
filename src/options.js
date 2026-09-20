import { LitElement, html } from '../libs/lit-core.min.js';
import { asserted } from '../node_modules/@jeniex/utils/browser/index.js';
import { LinkdingApi } from './linkding.js';
import { getConfiguration, saveConfiguration } from './configuration.js';
import { icons } from './icons.js';

class Options extends LitElement {
  static properties = {
    baseUrl: { type: String, state: true },
    token: { type: String, state: true },
    default_tags: { type: String, state: true },
    unreadSelected: { type: Boolean, state: true },
    shareSelected: { type: Boolean, state: true },
    useBrowserMetadata: { type: Boolean, state: true },
    runSinglefile: { type: Boolean, state: true },
    precacheEnabled: { type: Boolean, state: true },
    closeAddBookmarkWindowOnSave: { type: Boolean, state: true },
    closeAddBookmarkWindowOnSaveMs: { type: Number, state: true },
    isSuccess: { type: Boolean, state: true },
    isError: { type: Boolean, state: true },
  };

  constructor() {
    super();

    this.baseUrl = '';
    this.token = '';
    this.unreadSelected = false;
    this.shareSelected = false;
    this.useBrowserMetadata = false;
    this.runSinglefile = false;
    this.closeAddBookmarkWindowOnSave = false;
    this.closeAddBookmarkWindowOnSaveMs = 500;
    this.isSuccess = false;
    this.isError = false;
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated(props) {
    super.firstUpdated(props);

    this.classList.add('options');
    this.init();
  }

  async init() {
    const config = await getConfiguration();
    this.baseUrl = config.baseUrl;
    this.token = config.token;

    if (config.unreadSelected !== undefined) {
      this.unreadSelected = config.unreadSelected;
    }

    if (config.shareSelected !== undefined) {
      this.shareSelected = config.shareSelected;
    }

    this.useBrowserMetadata = asserted(config.useBrowserMetadata);
    this.runSinglefile = asserted(config.runSinglefile);
    this.closeAddBookmarkWindowOnSave = asserted(
      config.closeAddBookmarkWindowOnSave,
    );
    this.closeAddBookmarkWindowOnSaveMs = asserted(
      config.closeAddBookmarkWindowOnSaveMs,
    );
  }

  async handleSubmit(e) {
    e.preventDefault();
    const config = {
      baseUrl: this.baseUrl,
      token: this.token,
      unreadSelected: this.unreadSelected,
      shareSelected: this.shareSelected,
      useBrowserMetadata: this.useBrowserMetadata,
      runSinglefile: this.runSinglefile,
      closeAddBookmarkWindowOnSave: this.closeAddBookmarkWindowOnSave,
      closeAddBookmarkWindowOnSaveMs: this.closeAddBookmarkWindowOnSaveMs,
    };

    const testResult = await new LinkdingApi(config).testConnection();

    if (testResult) {
      await saveConfiguration(config);
      this.isError = false;
      this.isSuccess = true;
    } else {
      this.isSuccess = false;
      this.isError = true;
    }
  }

  handleInputChange(e, property) {
    this[property] =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  }

  render() {
    return html`
      <h1 class="h6">Configuration</h1>
      <p>
        This is a companion extension for the
        <a href="https://github.com/sissbruecker/linkding">linkding</a> bookmark
        service. Before you can start using it you have to configure some basic
        settings, so that the extension can communicate with your linkding
        installation.
      </p>
      <form class="form" @submit="${this.handleSubmit}">
        <div class="form-group">
          <label class="form-label" for="input-base-url"
            >Base URL <span class="text-error">*</span></label
          >
          <input
            class="form-input"
            type="text"
            id="input-base-url"
            placeholder="https://linkding.mydomain.com"
            .value="${this.baseUrl}"
            @input="${(e) => this.handleInputChange(e, 'baseUrl')}"
          />
          <div class="form-input-hint">
            The base URL of your linkding installation, <b>without</b> the
            <samp>/bookmark</samp>
            path or a trailing slash
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-token"
            >API Authentication Token <span class="text-error">*</span></label
          >
          <input
            class="form-input"
            type="password"
            id="input-token"
            placeholder="Token"
            .value="${this.token}"
            @input="${(e) => this.handleInputChange(e, 'token')}"
          />
          <div class="form-input-hint">
            Used to authenticate against the linkding API. You can find this on
            your linkding settings page.
          </div>
        </div>

        <div class="form-group">
          <label class="form-checkbox">
            <input
              type="checkbox"
              .checked="${this.unreadSelected}"
              @change="${(e) => this.handleInputChange(e, 'unreadSelected')}"
            />
            <i class="form-icon"></i>
            <span>Pre-select unread when adding bookmark</span>
          </label>
          <div class="form-input-hint">
            Marks new bookmarks as unread by default.
          </div>
        </div>

        <div class="form-group">
          <label class="form-checkbox">
            <input
              type="checkbox"
              .checked="${this.shareSelected}"
              @change="${(e) => this.handleInputChange(e, 'shareSelected')}"
            />
            <i class="form-icon"></i>
            <span>Pre-select share when saving bookmark</span>
          </label>
          <div class="form-input-hint">
            Marks new bookmarks as shared by default. Only useful if you have
            enabled bookmark sharing in linkding.
          </div>
        </div>

        <div class="form-group">
          <label class="form-checkbox">
            <input
              type="checkbox"
              .checked="${this.useBrowserMetadata}"
              @change="${(e) =>
                this.handleInputChange(e, 'useBrowserMetadata')}"
            />
            <i class="form-icon"></i>
            <span>Use browser metadata</span>
          </label>
          <div class="form-input-hint">
            By default, the extension will fetch the page title and description
            from the linkding server when adding a new bookmark. Enabling this
            will use the metadata from the current browser tab instead. This
            gives better results for websites that use bot detection or require
            login, but can give worse results for websites that don't properly
            update the page title or description while browsing.
          </div>
        </div>

        <div class="form-group">
          <label class="form-checkbox">
            <input
              type="checkbox"
              .checked="${this.runSinglefile}"
              @change="${(e) => this.handleInputChange(e, 'runSinglefile')}"
            />
            <i class="form-icon"></i>
            <span>Run Singlefile after adding new bookmark</span>
          </label>
          <div class="form-input-hint">
            Run the Singlefile extension on the current tab after adding a new
            bookmark. This will save the current page as a single HTML file and
            attach it as snapshot to the bookmark.
            <br />
            <br />
            <strong>Note:</strong> This requires having the Singlefile extension
            installed in your browser, and the extension must be configured to
            upload HTML files to the respective linkding REST API endpoint. You
            also need at least version 1.39.0 of the linkding server. See the
            <a href="https://linkding.link/archiving/" target="_blank"
              >documentation</a
            >
            for more information.
          </div>
        </div>

        <div class="form-group">
          <label class="form-checkbox">
            <input
              type="checkbox"
              .checked="${this.closeAddBookmarkWindowOnSave}"
              @change="${(e) =>
                this.handleInputChange(e, 'closeAddBookmarkWindowOnSave')}"
            />
            <i class="form-icon"></i>
            <span
              >Automatically close the popup window after saving a
              bookmark</span
            >
          </label>
          <div class="form-input-hint">
            The popup window will automatically close once you've saved a
            bookmark, otherwise by default it will remain open until you close
            it.
          </div>
        </div>

        ${
          this.closeAddBookmarkWindowOnSave
            ? html`
                <div class="form-group">
                  <label
                    class="form-label"
                    for="input-close-window-on-save-time"
                    >Popup window close time delay after saving a bookmark<span
                      class="text-error"
                      >*</span
                    ></label
                  >
                  <input
                    class="form-input"
                    type="number"
                    id="input-close-window-on-save-time"
                    .value="${this.closeAddBookmarkWindowOnSaveMs.toString()}"
                    @input="${(e) =>
                      this.handleInputChange(
                        e,
                        'closeAddBookmarkWindowOnSaveMs',
                      )}"
                  />
                  <div class="form-input-hint">
                    The time in milliseconds to wait before closing the bookmark
                    popup window after saving a bookmark.
                  </div>
                </div>
              `
            : ''
        }

        <div class="button-row">
          ${
            this.isSuccess
              ? html`
                  <div class="status text-success mr-2">
                    ${icons.success()}
                    <span>Connection successful</span>
                  </div>
                `
              : ''
          }
          ${
            this.isError
              ? html`
                  <div class="status text-error mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M12 9v4" />
                      <path d="M12 16v.01" />
                    </svg>
                    <span>Connection failed</span>
                  </div>
                `
              : ''
          }
          <button
            type="submit"
            class="btn btn-primary btn-wide ml-2"
            ?disabled="${!(this.baseUrl && this.token)}"
          >
            Save
          </button>
        </div>
      </form>
    `;
  }
}

customElements.define('ld-options', Options);

export { Options };
