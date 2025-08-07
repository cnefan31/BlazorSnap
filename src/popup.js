document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI state
  updateModeStatus();
  
  chrome.storage.local.get(["blazorSnapHtml", "blazorSnapStyles"], data => {
    console.log('BlazorSnap popup: Loaded data', data);
    if (data.blazorSnapHtml) {
      document.getElementById("source").value = data.blazorSnapHtml;
    }
    window.capturedStyles = data.blazorSnapStyles || [];
    console.log('BlazorSnap: Captured styles count:', window.capturedStyles.length);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.blazorSnapHtml) {
        document.getElementById("source").value = changes.blazorSnapHtml.newValue;
      }
      if (changes.blazorSnapStyles) {
        window.capturedStyles = changes.blazorSnapStyles.newValue || [];
        console.log('BlazorSnap: Updated captured styles count:', window.capturedStyles.length);
      }
    }
  });
  
  document.getElementById("exact-mode").addEventListener("change", updateModeStatus);
  document.getElementById("clean-mode").addEventListener("change", updateModeStatus);
  
  document.getElementById("convert").addEventListener("click", () => {
    const html = document.getElementById("source").value;
    const styles = window.capturedStyles || [];
    const isExactMode = document.getElementById("exact-mode").checked;
    
    let result;
    if (isExactMode) {
      result = convertToBlazorComponentExact(html, "MyComponent", styles);
    } else {
      result = convertToBlazorComponentClean(html, "MyComponent");
    }
    
    document.getElementById("result").textContent = result.combined;
  });

  document.getElementById("copy").addEventListener("click", () => {
    const text = document.getElementById("result").textContent;
    navigator.clipboard.writeText(text).then(() => {
      const button = document.getElementById("copy");
      const originalText = button.textContent;
      button.textContent = "Copied!";
      button.style.background = "#107c10";
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = "#0078d4";
      }, 1500);
    });
  });
});

function updateModeStatus() {
  const statusElement = document.getElementById("mode-status");
  const isExactMode = document.getElementById("exact-mode").checked;
  
  if (isExactMode) {
    statusElement.textContent = "Exact Visual Copy";
    statusElement.className = "status exact-copy";
  } else {
    statusElement.textContent = "Clean/Simplified";
    statusElement.className = "status clean-copy";
  }
}

function convertToBlazorComponentExact(html, componentName, capturedStyles = []) {
  if (!html.trim()) return { razor: "", css: "", combined: "" };
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const root = doc.body.firstElementChild;
    if (!root) return { razor: "", css: "", combined: "" };

    const classCounter = { value: 1 };
    const cssRules = new Map();
    const componentNameKebab = (componentName || 'MyComponent').toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
    
    function assignSemanticClasses(element, elementIndex = 0) {
      if (element.nodeType !== Node.ELEMENT_NODE) return;
      
      const tagName = element.tagName.toLowerCase();
      const semanticClass = `${componentNameKebab}-${tagName}-${classCounter.value++}`;
      
      let matchingStyle = null;
      if (capturedStyles && capturedStyles.length > elementIndex) {
        matchingStyle = capturedStyles[elementIndex];
      }
      
      const cssProperties = [];
      
      if (matchingStyle && matchingStyle.styles) {
        for (const [property, value] of Object.entries(matchingStyle.styles)) {
          cssProperties.push(`${property}: ${value}`);
        }
      }
      
      if (element.style && element.style.cssText) {
        const inlineStyles = element.style.cssText.split(';')
          .filter(style => style.trim())
          .map(style => style.trim());
        cssProperties.push(...inlineStyles);
      }
      
      if (cssProperties.length > 0) {
        cssRules.set(semanticClass, cssProperties.join(';\n    '));
      }
      
      element.className = semanticClass;
      element.removeAttribute('style');
      
      const childElements = Array.from(element.children);
      childElements.forEach((child, index) => {
        assignSemanticClasses(child, elementIndex + index + 1);
      });
    }
    
    if (capturedStyles && capturedStyles.length > 0) {
      assignSemanticClasses(root, 0);
    } else {
      preserveOriginalStyling(root, componentNameKebab, cssRules, classCounter);
    }
    
    function minimalCleanup(element) {
      const attributesToRemove = [
        'data-testid', 'data-qa', 'data-cy', // Test attributes
        'data-gtm', 'data-analytics', // Analytics attributes
        'data-reactid', 'data-reactroot' // React internals
      ];
      
      for (const attr of [...element.attributes]) {
        const name = attr.name.toLowerCase();
        if (attributesToRemove.some(remove => name.includes(remove))) {
          element.removeAttribute(attr.name);
        }
      }
      
      for (const child of element.children) {
        minimalCleanup(child);
      }
    }
    
    minimalCleanup(root);
    
    const convertedHtml = convertElementToBlazor(root).trim();
    
    let cssContent = '';
    if (cssRules.size > 0) {
      cssContent = Array.from(cssRules.entries())
        .map(([className, properties]) => `.${className} {\n    ${properties};\n}`)
        .join('\n\n');
    }
    
    const componentNamePascal = componentName || 'MyComponent';
    
    const razorContent = `@* Generated Blazor Component - Exact Visual Copy *@
${convertedHtml}

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    
    private void HandleClick()
    {
        // TODO: Implement click handler
    }
}`;

    const cssFileContent = `/* Generated CSS for ${componentNamePascal} component - Exact Visual Copy */

${cssContent}`;

    return {
      razor: razorContent,
      css: cssFileContent,
      combined: `${razorContent}\n\n/* ===== COMPANION CSS FILE (${componentNamePascal}.razor.css) ===== */\n${cssFileContent}`
    };
  } catch (error) {
    console.error('Error converting to Blazor component:', error);
    return {
      razor: `@* Error converting component: ${error.message} *@`,
      css: `/* Error: ${error.message} */`,
      combined: `@* Error converting component: ${error.message} *@`
    };
  }
}

function convertToBlazorComponentClean(html, componentName) {
  if (!html.trim()) return { razor: "", css: "", combined: "" };
  
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const root = doc.body.firstElementChild;
    if (!root) return { razor: "", css: "", combined: "" };

    const cssRules = new Map();
    const classCounter = { value: 1 };
    const componentNameKebab = (componentName || 'MyComponent').toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
    
    function convertClasses(element, prefix = 'component') {
      if (element.nodeType !== Node.ELEMENT_NODE) return;
      
      const classList = element.classList;
      if (classList.length > 0) {
        const semanticClass = `${prefix}-${element.tagName.toLowerCase()}-${classCounter.value++}`;
        const cssProperties = [];
        
        for (const className of classList) {
          if (className.includes('flex') || className.includes('d-flex')) {
            cssProperties.push('display: flex');
          }
          if (className.includes('center') || className.includes('justify-center')) {
            cssProperties.push('justify-content: center');
          }
          if (className.includes('items-center')) {
            cssProperties.push('align-items: center');
          }
          if (className.includes('p-') || className.includes('padding')) {
            cssProperties.push('padding: 1rem');
          }
          if (className.includes('m-') || className.includes('margin')) {
            cssProperties.push('margin: 1rem');
          }
          if (className.includes('bg-') || className.includes('background')) {
            cssProperties.push('background-color: var(--background-color)');
          }
          if (className.includes('text-') || className.includes('color')) {
            cssProperties.push('color: var(--text-color)');
          }
          if (className.includes('rounded')) {
            cssProperties.push('border-radius: 0.5rem');
          }
          if (className.includes('shadow')) {
            cssProperties.push('box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)');
          }
        }
        
        if (cssProperties.length > 0) {
          cssRules.set(semanticClass, cssProperties.join(';\n    '));
          element.className = semanticClass;
        } else {
          element.removeAttribute('class');
        }
      }
      
      for (const child of element.children) {
        convertClasses(child, prefix);
      }
    }
    
    convertClasses(root, componentNameKebab);
    
    function cleanAttributes(element) {
      const attributesToRemove = [
        'data-', 'aria-hidden', 'tabindex', 'spellcheck', 'autocomplete',
        'aria-autocomplete', 'aria-expanded', 'aria-invalid', 'dir', 'role'
      ];
      
      for (const attr of [...element.attributes]) {
        const name = attr.name.toLowerCase();
        if (attributesToRemove.some(remove => name.startsWith(remove))) {
          element.removeAttribute(attr.name);
        }
      }
      
      for (const child of element.children) {
        cleanAttributes(child);
      }
    }
    
    cleanAttributes(root);
    
    const convertedHtml = convertElementToBlazor(root).trim();
    
    let cssContent = '';
    if (cssRules.size > 0) {
      cssContent = Array.from(cssRules.entries())
        .map(([className, properties]) => `.${className} {\n    ${properties};\n}`)
        .join('\n\n');
    }
    
    const componentNamePascal = componentName || 'MyComponent';
    
    const razorContent = `@* Generated Blazor Component - Clean/Simplified *@
${convertedHtml}

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    
    private void HandleClick()
    {
        // TODO: Implement click handler
    }
}`;

    const cssFileContent = `/* Generated CSS for ${componentNamePascal} component - Clean/Simplified */

${cssContent}

/* CSS Variables for theming */
:root {
    --background-color: #ffffff;
    --text-color: #333333;
}`;

    return {
      razor: razorContent,
      css: cssFileContent,
      combined: `${razorContent}\n\n/* ===== COMPANION CSS FILE (${componentNamePascal}.razor.css) ===== */\n${cssFileContent}`
    };
  } catch (error) {
    console.error('Error converting to Blazor component:', error);
    return {
      razor: `@* Error converting component: ${error.message} *@`,
      css: `/* Error: ${error.message} */`,
      combined: `@* Error converting component: ${error.message} *@`
    };
  }
}

function convertElementToBlazor(element, indent = 0) {
  const indentStr = '    '.repeat(indent);
  let result = "";
  
  if (element.nodeType === Node.TEXT_NODE) {
    const text = element.textContent.trim();
    return text ? `${indentStr}${text}\n` : "";
  }
  
  if (element.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }
  
  const tagName = element.tagName.toLowerCase();
  result += `${indentStr}<${tagName}`;
  
  for (const attr of element.attributes) {
    let attrName = attr.name;
    let attrValue = attr.value;
    
    if (attrName.startsWith('on') && attrName.length > 2) {
      const eventName = attrName.substring(2);
      attrName = `@on${eventName}`;
      attrValue = `Handle${eventName.charAt(0).toUpperCase() + eventName.slice(1)}`;
    }
    
    result += ` ${attrName}="${attrValue}"`;
  }
  
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  if (selfClosingTags.includes(tagName)) {
    result += " />\n";
    return result;
  }
  
  result += ">\n";
  
  const hasOnlyTextContent = element.childNodes.length === 1 && 
                            element.firstChild.nodeType === Node.TEXT_NODE;
  
  if (hasOnlyTextContent) {
    const text = element.textContent.trim();
    result = result.slice(0, -1); // Remove newline
    result += `${text}</${tagName}>\n`;
  } else {
    for (const child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) {
          result += `${indentStr}    ${text}\n`;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        result += convertElementToBlazor(child, indent + 1);
      }
    }
    result += `${indentStr}</${tagName}>\n`;
  }
  
  return result;
}

function preserveOriginalStyling(element, componentNameKebab, cssRules, classCounter) {
  if (element.nodeType !== Node.ELEMENT_NODE) return;
  
  const tagName = element.tagName.toLowerCase();
  const semanticClass = `${componentNameKebab}-${tagName}-${classCounter.value++}`;
  
  if (element.style && element.style.cssText) {
    const inlineStyles = element.style.cssText.split(';')
      .filter(style => style.trim())
      .map(style => style.trim());
    
    if (inlineStyles.length > 0) {
      cssRules.set(semanticClass, inlineStyles.join(';\n    '));
    }
  }
  
  if (element.className) {
    const originalClasses = element.className;
    const existingRule = cssRules.get(semanticClass) || '';
    const comment = `/* Original classes: ${originalClasses} */`;
    cssRules.set(semanticClass, existingRule ? `${comment}\n    ${existingRule}` : comment);
  }
  
  element.className = semanticClass;
  element.removeAttribute('style');
  
  for (const child of element.children) {
    preserveOriginalStyling(child, componentNameKebab, cssRules, classCounter);
  }
}

function convertToBlazorComponent(html, componentName) {
  return convertToBlazorComponentClean(html, componentName);
}
