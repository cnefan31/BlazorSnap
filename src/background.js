chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "to-blazor",
    title: "Convert Element to Blazor Component",
    contexts: ["all"]
  });
});

// Listen for messages from injected scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "BLAZOR_SNAP_HTML") {
    console.log('BlazorSnap: Received HTML message, storing...', message.html.substring(0, 100) + '...');
    chrome.storage.local.set({ blazorSnapHtml: message.html }, () => {
      console.log('BlazorSnap: HTML stored in background script');
      // Automatically open the popup after storing the HTML
      chrome.action.openPopup().catch(err => {
        console.log('BlazorSnap: Could not open popup automatically:', err);
      });
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "to-blazor") {
    console.log('BlazorSnap: Context menu clicked');
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const coords = window.blazorSnapCoords || { x: 0, y: 0 };
        const el = document.elementFromPoint(coords.x, coords.y);
        const html = el?.outerHTML ?? "";
        console.log('BlazorSnap: Found element', el, 'HTML length:', html.length);
        chrome.runtime.sendMessage({ type: "BLAZOR_SNAP_HTML", html });
      }
    });
  }
});