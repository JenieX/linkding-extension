import { LitElement, html } from '../libs/lit-core.min.js';
import { asserted } from '../node_modules/@jeniex/utils/browser/index.js';
import { getCurrentWord, getCurrentWordBounds } from './util.js';

/**
 * @property {string} value
 * @property {string[]} tags
 */
class TagAutocomplete extends LitElement {
  static properties = {
    inputId: { type: String },
    inputName: { type: String },
    value: { type: String },
    tags: { type: Array },
    isFocus: { type: Boolean, state: true },
    isOpen: { type: Boolean, state: true },
    suggestions: { type: Array, state: true },
    selectedIndex: { type: Number, state: true },
  };

  constructor() {
    super();

    this.inputId = '';
    this.inputName = '';
    this.value = '';
    this.tags = [];
    this.isFocus = false;
    this.isOpen = false;
    this.input = null;
    this.suggestions = [];
    this.selectedIndex = 0;
  }

  createRenderRoot() {
    return this;
  }

  firstUpdated(_props) {
    this.input = this.querySelector('input');
  }

  handleFocus() {
    this.isFocus = true;
  }

  handleBlur() {
    this.isFocus = false;
    this.close();
  }

  /** @param {InputEvent} event */
  handleInput(event) {
    this.value = /** @type {HTMLInputElement} */ (event.target).value;

    this.fireValueChange();

    const word = getCurrentWord(asserted(this.input));

    this.suggestions = word
      ? this.tags.filter(
          (tag) => tag.toLowerCase().indexOf(word.toLowerCase()) === 0,
        )
      : [];

    if (word && this.suggestions.length > 0) {
      this.open();
    } else {
      this.close();
    }
  }

  fireValueChange() {
    this.dispatchEvent(
      new CustomEvent('value-change', { detail: { value: this.value } }),
    );
  }

  /** @param {KeyboardEvent} event */
  handleKeyDown(event) {
    if (this.isOpen && (event.key === 'Enter' || event.key === 'Tab')) {
      const suggestion = this.suggestions[this.selectedIndex];
      this.complete(suggestion);
      event.preventDefault();
    }

    if (event.key === 'Escape') {
      this.close();
      event.preventDefault();
    }

    if (event.key === 'ArrowUp') {
      this.updateSelection(-1);
      event.preventDefault();
    }

    if (event.key === 'ArrowDown') {
      this.updateSelection(1);
      event.preventDefault();
    }
  }

  open() {
    this.isOpen = true;
    this.selectedIndex = 0;
  }

  close() {
    this.isOpen = false;
    this.suggestions = [];
    this.selectedIndex = 0;
  }

  /** @param {string} suggestion */
  complete(suggestion) {
    const bounds = getCurrentWordBounds(asserted(this.input));
    const inputValue = asserted(this.input).value;
    this.value =
      inputValue.substring(0, bounds.start) +
      suggestion +
      ' ' +
      inputValue.substring(bounds.end);

    this.fireValueChange();

    this.close();
  }

  /** @param {number} dir */
  updateSelection(dir) {
    const length = this.suggestions.length;
    let newIndex = this.selectedIndex + dir;

    if (newIndex < 0) newIndex = Math.max(length - 1, 0);
    if (newIndex >= length) newIndex = 0;

    this.selectedIndex = newIndex;
  }

  render() {
    return html`
      <div class="form-autocomplete">
        <div
          class="form-autocomplete-input form-input ${
            this.isFocus ? 'is-focused' : ''
          }"
        >
          <input
            id="${this.inputId}"
            name="${this.inputName}"
            autofocus
            class="form-input"
            type="text"
            autocomplete="off"
            autocapitalize="off"
            .value="${this.value}"
            @input="${this.handleInput}"
            @keydown="${this.handleKeyDown}"
            @focus="${this.handleFocus}"
            @blur="${this.handleBlur}"
          />
        </div>

        <ul
          class="menu ${
            this.isOpen && this.suggestions.length > 0 ? 'open' : ''
          }"
        >
          ${this.suggestions.map(
            (tag, index) => html`
              <li
                class="menu-item ${this.selectedIndex === index ? 'selected' : ''}"
              >
                <a
                  href="#"
                  @mousedown="${(/** @type {MouseEvent} */ event) => {
                    event.preventDefault();
                    this.complete(tag);
                  }}"
                >
                  <div class="tile tile-centered">
                    <div class="tile-content">${tag}</div>
                  </div>
                </a>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }
}

customElements.define('ld-tag-autocomplete', TagAutocomplete);

export { TagAutocomplete };
