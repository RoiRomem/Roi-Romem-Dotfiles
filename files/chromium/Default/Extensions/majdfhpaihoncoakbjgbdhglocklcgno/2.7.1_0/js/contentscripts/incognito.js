chrome.runtime.sendMessage({
  request: 'incognito',
  state: chrome.extension.inIncognitoContext,
});
