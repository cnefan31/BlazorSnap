_Submission to the browser extension stores is still in review._

# BlazorSnap 🔥

Convert any HTML element into a reusable Blazor component with **exact visual reproduction** or clean/simplified code!

## 🚀 Features

- **Right-click to convert**: Simply right-click any HTML element and select "Convert Element to Blazor Component"
- **Automatic popup**: The extension automatically opens with the captured HTML ready to convert
- **Exact Visual Copy**: NEW! Captures computed styles for pixel-perfect reproduction
- **Clean/Simplified Mode**: Converts utility classes to semantic CSS for maintainable code
- **Dual conversion modes**: Choose between exact visual copy or clean/simplified output
- **Smart CSS generation**: Creates companion CSS files with all necessary styles
- **Blazor best practices**: Generates properly formatted .razor components

## Demo

![BlazorSnap](https://github.com/user-attachments/assets/dc2275db-4797-407e-ab47-bce770dd88f5)

## 📦 Installation

### From Source (Development)
1. Clone this repository
3. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `src` folder
6. The BlazorSnap extension should now appear in your extensions

## 🎯 How to Use

1. **Navigate to any website** with HTML elements you want to convert
2. **Right-click** on the element you want to capture
3. **Select "Convert Element to Blazor Component"** from the context menu
4. **The popup opens automatically** with the HTML loaded and computed styles captured
5. **Choose your conversion mode**:
   - **Exact Visual Copy**: Preserves all computed styles for identical appearance
   - **Clean/Simplified**: Converts utility classes to semantic CSS
6. **Click "Generate .razor"** to convert to a Blazor component
7. **Click "Copy to Clipboard"** to copy both the .razor component and CSS file

## 🔧 What It Generates

### Exact Visual Copy Mode

Input (HTML Element with computed styles):
```html
<div class="flex items-center p-4 bg-blue-500 text-white rounded-lg shadow-md">
  <span class="font-semibold">Hello World</span>
</div>
```

Output (Blazor Component):
```razor
@* Generated Blazor Component - Exact Visual Copy *@
<div class="mycomponent-div-1">
    <span class="mycomponent-span-2">Hello World</span>
</div>

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    
    private void HandleClick()
    {
        // TODO: Implement click handler
    }
}
```

CSS File (MyComponent.razor.css):
```css
.mycomponent-div-1 {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: rgb(59, 130, 246);
    color: rgb(255, 255, 255);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mycomponent-span-2 {
    font-weight: 600;
}
```

### Clean/Simplified Mode

Same input produces:
```razor
@* Generated Blazor Component - Clean/Simplified *@
<div class="mycomponent-div-1">
    <span>Hello World</span>
</div>

@code {
    [Parameter] public RenderFragment? ChildContent { get; set; }
    
    private void HandleClick()
    {
        // TODO: Implement click handler
    }
}
```

CSS File (MyComponent.razor.css):
```css
.mycomponent-div-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background-color: var(--background-color);
    color: var(--text-color);
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* CSS Variables for theming */
:root {
    --background-color: #ffffff;
    --text-color: #333333;
}
```

## 🎨 Features in Detail

### Exact Visual Copy Mode
- **Captures computed styles**: Gets the actual rendered CSS properties from the browser
- **Preserves all visual aspects**: Colors, fonts, spacing, shadows, transforms, etc.
- **Pixel-perfect reproduction**: The Blazor component will look identical to the original
- **Handles complex styling**: Works with CSS frameworks, custom CSS, and inline styles
- **Best for**: Prototyping, copying existing designs, maintaining exact branding

### Clean/Simplified Mode  
- **Smart class conversion**: Converts utility classes (like Tailwind, Bootstrap) to semantic CSS
- **Framework mapping**: Maps framework-specific classes to standard CSS properties
- **CSS variables**: Uses CSS custom properties for easy theming
- **Simplified structure**: Removes unnecessary attributes and complexity
- **Best for**: Creating maintainable components, starting fresh designs

### Advanced Capabilities
- **Computed style capture**: Gets styles as they actually appear in the browser
- **Multi-framework support**: Works with Tailwind, Bootstrap, custom CSS, and any framework
- **Intelligent cleanup**: Removes test attributes and analytics code while preserving important styling
- **Event handler generation**: Creates Blazor event handler stubs
- **Error handling**: Graceful fallbacks when styles can't be captured

## 🔧 Technical Details

### Browser Extension Architecture
- **Manifest V3 compliant**: Uses modern Chrome extension APIs
- **Content script**: Captures element coordinates and computed styles
- **Background service worker**: Handles context menu and data storage
- **Popup interface**: Provides conversion options and real-time preview

### Style Capture Technology
- **getComputedStyle API**: Captures all rendered CSS properties
- **Property filtering**: Focuses on visual properties that affect appearance
- **Fallback mechanisms**: Works even when computed styles aren't available
- **Cross-browser compatibility**: Works in Chrome, Edge, and other Chromium browsers

## 🚧 Known Limitations

- **Icon files missing**: You need to add icon files for proper extension display
- **Complex animations**: CSS animations and transitions may not be fully captured
- **Pseudo-elements**: ::before and ::after styles are not captured
- **Media queries**: Responsive styles are captured for current viewport only
- **CSS custom properties**: May not resolve correctly in all cases



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
