// Background service worker for the extension
console.log('Recipe to Whole Foods extension loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed successfully');
});
