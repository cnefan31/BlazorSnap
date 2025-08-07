// Listen for right-clicks and save coordinates globally
window.blazorSnapCoords = { x: 0, y: 0 };
document.addEventListener('contextmenu', e => {
  window.blazorSnapCoords = { x: e.clientX, y: e.clientY };
  console.log('BlazorSnap: Right-click at', e.clientX, e.clientY);
});

// Listen for HTML from injected script and store in chrome.storage.local
window.addEventListener('message', event => {
  if (event.data && event.data.type === 'BLAZOR_SNAP_HTML') {
    console.log('BlazorSnap: Received HTML', event.data.html.substring(0, 100) + '...');
    chrome.storage.local.set({ blazorSnapHtml: event.data.html }, () => {
      console.log('BlazorSnap: HTML stored in storage');
    });
  }
});
