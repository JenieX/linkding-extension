import { asserted } from '../node_modules/@jeniex/utils/browser/index.js';
import { parse as tldtsParse } from '../libs/tldts.js';
import { getCurrentTabInfo } from './browser.js';

async function createTags() {
  const { url } = await getCurrentTabInfo();
  const { domainWithoutSuffix } = tldtsParse(url);

  return domainWithoutSuffix ?? '';
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
