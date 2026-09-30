import { asserted } from '../node_modules/@jeniex/utils/browser/index.js';
import { parse as tldtsParse } from '../libs/tldts.js';
import { getCurrentTabInfo } from './browser.js';

async function createTags() {
  /** @type {string[]} */
  const tags = [];

  const { url } = await getCurrentTabInfo();
  const { domainWithoutSuffix } = tldtsParse(url);

  if (domainWithoutSuffix !== null) {
    tags.push(domainWithoutSuffix);
  }

  if (url.startsWith('https://marketplace.visualstudio.com')) {
    tags.push('vscode');
  }

  if (url.startsWith('https://greasyfork.org')) {
    tags.push('javascript', 'user-script');
  }

  return tags.join(' ');
}

/** @param {HTMLInputElement} input */
function getCurrentWordBounds(input) {
  const text = input.value;
  const end = asserted(input.selectionStart);
  let start = end;

  let currentChar = text.charAt(start - 1);

  while (currentChar && currentChar !== ' ' && start > 0) {
    start--;
    currentChar = text.charAt(start - 1);
  }

  return { start, end };
}

/** @param {HTMLInputElement} input */
function getCurrentWord(input) {
  const bounds = getCurrentWordBounds(input);

  return input.value.substring(bounds.start, bounds.end);
}

export { createTags, getCurrentWordBounds, getCurrentWord };
