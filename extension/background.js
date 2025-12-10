// Background service worker for the extension
console.log('Recipe to Whole Foods extension loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed successfully');
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for tab changes to update panel
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // Notify panel that tab changed
    try {
        await chrome.runtime.sendMessage({
            type: 'TAB_CHANGED',
            tabId: activeInfo.tabId
        });
    } catch (error) {
        // Panel might not be open, ignore error
        console.log('Panel not open or not listening');
    }
});

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        try {
            chrome.runtime.sendMessage({
                type: 'TAB_UPDATED',
                tabId: tabId,
                url: changeInfo.url
            });
        } catch (error) {
            // Panel might not be open, ignore error
            console.log('Panel not open or not listening');
        }
    }
});
