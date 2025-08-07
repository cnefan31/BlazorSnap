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
    chrome.storage.local.set({ 
      blazorSnapHtml: message.html,
      blazorSnapStyles: message.styles || []
    }, () => {
      console.log('BlazorSnap: HTML and styles stored in background script');
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
        
        if (!el) {
          chrome.runtime.sendMessage({ type: "BLAZOR_SNAP_HTML", html: "", styles: [] });
          return;
        }

        // Function to capture element with all its computed styles
        function captureElementWithStyles(element) {
          const elementStyles = [];
          
          // Function to get all relevant computed styles
          function getComputedStylesForElement(el, selector = '') {
            const computedStyle = window.getComputedStyle(el);
            const styles = {};
            
            // Get all style properties that affect visual appearance
            const importantProperties = [
              // Layout
              'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
              'float', 'clear', 'overflow', 'overflow-x', 'overflow-y',
              
              // Box model
              'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
              'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
              'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
              'border', 'border-width', 'border-style', 'border-color',
              'border-top', 'border-right', 'border-bottom', 'border-left',
              'border-radius', 'box-sizing',
              
              // Visual
              'background', 'background-color', 'background-image', 'background-repeat',
              'background-position', 'background-size', 'background-attachment',
              'color', 'opacity', 'visibility',
              
              // Text
              'font', 'font-family', 'font-size', 'font-weight', 'font-style',
              'line-height', 'text-align', 'text-decoration', 'text-transform',
              'letter-spacing', 'word-spacing', 'white-space',
              
              // Flexbox
              'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink',
              'flex-basis', 'justify-content', 'align-items', 'align-content',
              'align-self', 'order',
              
              // Grid
              'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
              'grid-gap', 'grid-column', 'grid-row',
              
              // Transform & Animation
              'transform', 'transform-origin', 'transition', 'animation',
              
              // Other visual effects
              'box-shadow', 'text-shadow', 'filter', 'backdrop-filter'
            ];
            
            importantProperties.forEach(prop => {
              const value = computedStyle.getPropertyValue(prop);
              if (value && value !== 'initial' && value !== 'normal' && value !== 'none' && value !== 'auto') {
                styles[prop] = value;
              }
            });
            
            return styles;
          }
          
          // Get styles for the main element
          const mainStyles = getComputedStylesForElement(element);
          elementStyles.push({
            selector: `.component-${element.tagName.toLowerCase()}-1`,
            styles: mainStyles
          });
          
          // Get styles for all child elements
          const allElements = element.querySelectorAll('*');
          allElements.forEach((child, index) => {
            const childStyles = getComputedStylesForElement(child);
            elementStyles.push({
              selector: `.component-${child.tagName.toLowerCase()}-${index + 2}`,
              styles: childStyles,
              originalElement: child
            });
          });
          
          return elementStyles;
        }
        
        // Clone the element to avoid modifying the original
        const clonedElement = el.cloneNode(true);
        
        // Capture styles before getting HTML
        const styles = captureElementWithStyles(el);
        
        // Get the HTML
        const html = el.outerHTML;
        
        console.log('BlazorSnap: Found element', el, 'HTML length:', html.length, 'Styles captured:', styles.length);
        chrome.runtime.sendMessage({ 
          type: "BLAZOR_SNAP_HTML", 
          html: html,
          styles: styles
        });
      }
    });
  }
});