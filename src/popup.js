// Wait for DOM to be ready before accessing elements
document.addEventListener('DOMContentLoaded', () => {
  // On popup open, load the last selected HTML from chrome.storage.local
  chrome.storage.local.get("blazorSnapHtml", data => {
    console.log('BlazorSnap popup: Loaded data', data);
    if (data.blazorSnapHtml) {
      document.getElementById("source").value = data.blazorSnapHtml;
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.blazorSnapHtml) {
      document.getElementById("source").value = changes.blazorSnapHtml.newValue;
    }
  });
  
  document.getElementById("convert").addEventListener("click", () => {
    const html = document.getElementById("source").value;
    const result = convertToBlazorComponent(html, "MyComponent");
    document.getElementById("result").textContent = result.combined;
  });

  document.getElementById("copy").addEventListener("click", () => {
    const text = document.getElementById("result").textContent;
    navigator.clipboard.writeText(text);
  });
});

// converter logic
function convertToBlazorComponent(html, componentName) {
  if (!html.trim()) return "";
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  // CSS class mapping and extraction
  const cssRules = new Map();
  const classCounter = { value: 1 };
  
  // First, remove style tags and extract their content
  const extractedStyles = [];
  const styleTags = root.querySelectorAll('style');
  styleTags.forEach(styleTag => {
    extractedStyles.push(styleTag.textContent);
    styleTag.remove();
  });
  
  // Convert utility classes to semantic classes
  function convertClasses(element, prefix = 'component') {
    if (element.nodeType !== Node.ELEMENT_NODE) return;
    
    const classList = element.classList;
    if (classList.length > 0) {
      // Create a semantic class name for this element
      const semanticClass = `${prefix}-${element.tagName.toLowerCase()}-${classCounter.value++}`;
      
      // Extract CSS properties from utility classes
      const cssProperties = [];
      
      for (const className of classList) {
        // Map Google/Facebook utility class patterns to CSS
        if (className.includes('flex') || className.includes('x78zum5') || className === 'Ne6nSd') {
          cssProperties.push('display: flex');
        }
        if (className.includes('center') || className.includes('x6s0dn4')) {
          cssProperties.push('align-items: center');
        }
        if (className === 'MV3Tnb') {
          cssProperties.push('display: inline-block', 'padding: 5px', 'margin: 0 5px', 'color: var(--link-color)');
        }
        if (className === 'LX3sZb') {
          cssProperties.push('display: inline-block', 'flex-grow: 1');
        }
        // Add fallback for any class
        if (cssProperties.length === 0 && className.length > 2) {
          cssProperties.push('/* Converted from .' + className + ' */');
        }
      }
      
      // Store the CSS rule if we have meaningful properties
      if (cssProperties.length > 0 && !cssProperties.every(prop => prop.startsWith('/*'))) {
        cssRules.set(semanticClass, cssProperties.join(';\n    '));
        element.className = semanticClass;
      } else {
        element.removeAttribute('class');
      }
    }
    
    // Process children
    for (const child of element.children) {
      convertClasses(child, prefix);
    }
  }

  // Clean up other attributes
  function cleanAttributes(element) {
    const attributesToRemove = [
      'data-visualcompletion', 'data-', 'aria-hidden', 'fill-rule', 
      'transform', 'viewBox', 'tabindex', 'spellcheck', 'autocomplete',
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

  // Simplify the structure - limit depth
  function simplifyStructure(element, maxDepth = 4, currentDepth = 0) {
    if (currentDepth >= maxDepth) {
      element.innerHTML = '<!-- Content simplified -->';
      return;
    }
    
    for (const child of [...element.children]) {
      simplifyStructure(child, maxDepth, currentDepth + 1);
    }
  }

  // Process the HTML
  const componentNameKebab = (componentName || 'MyComponent').toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '');
  convertClasses(root, componentNameKebab);
  cleanAttributes(root);
  simplifyStructure(root);

  // Convert the HTML to formatted Blazor syntax
  function convertElement(element, indent = 0) {
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
    
    // Add important attributes only
    const importantAttrs = ['class', 'id', 'src', 'href', 'alt', 'title', 'type', 'placeholder', 'value'];
    for (const attr of element.attributes) {
      if (importantAttrs.includes(attr.name.toLowerCase())) {
        let attrName = attr.name;
        let attrValue = attr.value;
        
        // Convert events to Blazor syntax
        if (attrName === 'onclick') {
          attrName = '@onclick';
          attrValue = 'HandleClick';
        } else if (attrName === 'onchange') {
          attrName = '@onchange';
          attrValue = 'HandleChange';
        }
        
        result += ` ${attrName}="${attrValue}"`;
      }
    }
    
    // Handle self-closing tags
    const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    if (selfClosingTags.includes(tagName)) {
      result += " />\n";
      return result;
    }
    
    result += ">\n";
    
    // Process children
    const hasTextContent = element.childNodes.length === 1 && 
                          element.firstChild.nodeType === Node.TEXT_NODE;
    
    if (hasTextContent) {
      // Single text content - keep on same line
      const text = element.textContent.trim();
      result = result.slice(0, -1); // Remove newline
      result += `${text}</${tagName}>\n`;
    } else {
      // Multiple children - format with indentation
      for (const child of element.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.trim();
          if (text) {
            result += `${indentStr}    ${text}\n`;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          result += convertElement(child, indent + 1);
        }
      }
      result += `${indentStr}</${tagName}>\n`;
    }
    
    return result;
  }
  
  const convertedHtml = convertElement(root).trim();
  
  // Generate CSS file content
  let cssContent = Array.from(cssRules.entries())
    .map(([className, properties]) => `.${className} {\n    ${properties};\n}`)
    .join('\n\n');
  
  // Add extracted inline styles as comments for reference
  if (extractedStyles.length > 0) {
    cssContent += '\n\n/* Original inline styles (for reference): */\n/*\n' + 
                  extractedStyles.join('\n') + '\n*/';
  }
  
  // Extract meaningful parameters (only common, useful ones)
  const meaningfulAttrs = new Set();
  function extractMeaningfulAttributes(element) {
    if (element.nodeType === Node.ELEMENT_NODE) {
      const importantAttrs = ['id', 'src', 'href', 'alt', 'title', 'placeholder'];
      for (const attr of element.attributes) {
        if (importantAttrs.includes(attr.name.toLowerCase())) {
          meaningfulAttrs.add(attr.name);
        }
      }
      for (const child of element.childNodes) {
        extractMeaningfulAttributes(child);
      }
    }
  }
  extractMeaningfulAttributes(root);
  
  // Generate parameters for meaningful attributes only
  const pascal = s => s
    .split(/[-_:]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
    
  const parameters = Array.from(meaningfulAttrs)
    .slice(0, 5) // Limit to 5 most important parameters
    .map(attr => `[Parameter] public string? ${pascal(attr)} { get; set; }`)
    .join("\n    ");
  
  const componentNamePascal = componentName || 'MyComponent';
  
  const razorContent = `@* Generated Blazor Component *@
${convertedHtml}

@code {
    ${parameters ? parameters + '\n    ' : ''}[Parameter] public RenderFragment? ChildContent { get; set; }
    
    private void HandleClick()
    {
        // TODO: Implement click handler
    }
    
    private void HandleChange(ChangeEventArgs e)
    {
        // TODO: Implement change handler
    }
}`;

  const cssFileContent = `/* Generated CSS for ${componentNamePascal} component */

${cssContent}

/* Additional component styles */
.${componentNameKebab}-container {
    /* Add your custom styles here */
}`;

  return {
    razor: razorContent,
    css: cssFileContent,
    combined: `${razorContent}\n\n/* ===== COMPANION CSS FILE (${componentNamePascal}.razor.css) ===== */\n${cssFileContent}`
  };
}
