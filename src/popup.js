import { LitElement, html } from '../libs/lit-core.min.js';
import './popup-form.js';
import './popup-intro.js';
import { LinkdingApi } from './linkding.js';
import { getConfiguration, isConfigurationComplete } from './configuration.js';

/** @typedef {import('./types').Configuration} Configuration */

class Popup extends LitElement {
  static properties = {
    hasCompleteConfiguration: { type: Boolean, state: true },
    configuration: { type: Object, state: true },
    api: { type: Object, state: true },
  };

  constructor() {
    super();

    this.hasCompleteConfiguration = true;

    /** @type {Configuration | null} */
    this.configuration = null;

    /** @type {LinkdingApi | null} */
    this.api = null;
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated(props) {
    super.firstUpdated(props);

    this.init();
  }

  async init() {
    this.configuration = await getConfiguration();
    this.hasCompleteConfiguration = isConfigurationComplete(this.configuration);
    if (this.hasCompleteConfiguration) {
      this.api = new LinkdingApi(this.configuration);
    }
  }

  render() {
    return html`
      <ld-popup-form
        .configuration="${this.configuration}"
        .api="${this.api}"
      ></ld-popup-form>

      ${
        !this.hasCompleteConfiguration
          ? html` <ld-popup-intro></ld-popup-intro> `
          : ''
      }
    `;
  }
}

customElements.define('ld-popup', Popup);

export { Popup };
