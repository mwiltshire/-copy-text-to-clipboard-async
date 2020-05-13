interface Options {
  /**
  Specify a DOM element where the temporary, behind-the-scenes `textarea` should be appended, in cases where you need to stay within a focus trap, like in a modal.
  
  **Note:** This option will only have an effect if the browser environment does not support the Clipboard API.

	@default document.body

	@example
	```
	import copy from 'copy-text-to-clipboard';

	const modalWithFocusTrap = document.getElementById('modal');

	button.addEventListener('click', () => {
    copy('🦄🌈', { target: modalWithFocusTrap })
      .then(() => console.log('🎉'))
      .catch(() => console.error('😢'));
	});
	```
	*/
  target?: HTMLElement;
}

/**
	Copy text to the clipboard.

	Must be called in response to a user gesture event, like `click` or `keyup`.

  @param text - The text to copy to clipboard.
  @param options - Copy options.
	@returns Promise that resolves if the text was successfully copied or rejects
	if the operation failed.

	@example
	```
	import copy from 'copy-text-to-clipboard-async';

	button.addEventListener('click', () => {
    copy('🦄🌈')
      .then(() => console.log('🎉'))
      .catch(() => console.error('😢'));
	});
	```
	*/
const copyTextToClipboard = async (
  input: string,
  { target = document.body }: Options = {}
): Promise<void> => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(input);
      return Promise.resolve();
    } catch {}
  }

  const element = document.createElement('textarea');
  const previouslyFocusedElement = document.activeElement as HTMLElement;

  element.value = input;

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '');

  // @ts-ignore
  element.style.contain = 'strict';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt'; // Prevent zooming on iOS

  const selection = document.getSelection() as Selection;
  let originalRange: boolean | Range = false;
  if (selection.rangeCount > 0) {
    originalRange = selection.getRangeAt(0);
  }

  target.append(element);
  element.select();

  // Explicit selection workaround for iOS
  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let isSuccess = false;
  try {
    isSuccess = document.execCommand('copy');
  } catch {}

  element.remove();

  if (originalRange) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
  }

  return isSuccess ? Promise.resolve() : Promise.reject();
};

export default copyTextToClipboard;
module.exports = copyTextToClipboard;
module.exports.default = copyTextToClipboard;
