# BlazorSnap 🔥

Convert any HTML element into a reusable Blazor component stub with just a right-click!

## 🚀 Features

- **Right-click to convert**: Simply right-click any HTML element and select "Convert Element to Blazor Component"
- **Automatic popup**: The extension automatically opens with the captured HTML ready to convert
- **Clean Blazor components**: Generates properly formatted .razor components with semantic class names
- **Companion CSS**: Creates matching CSS files with converted utility classes
- **Smart simplification**: Removes unnecessary attributes and limits complexity for maintainable code

## 📦 Installation

### From Source (Development)
1. Clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `src` folder
5. The BlazorSnap extension should now appear in your extensions

## 🎯 How to Use

1. **Navigate to any website** with HTML elements you want to convert
2. **Right-click** on the element you want to capture
3. **Select "Convert Element to Blazor Component"** from the context menu
4. **The popup opens automatically** with the HTML loaded
5. **Click "Generate .razor"** to convert to a Blazor component
6. **Click "Copy to Clipboard"** to copy both the .razor component and CSS file

## 🔧 What It Generates

### Input (HTML Element):
```html
<div class="flex items-center p-4 bg-white rounded-lg">
  <span>Hello World</span>
</div>
```

### Output (Blazor Component):
```razor
@* Generated Blazor Component *@
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

### CSS File (MyComponent.razor.css):
```css
.mycomponent-div-1 {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: white;
    border-radius: 8px;
}
```
## 🎨 Features in Detail

### Smart Class Conversion
- Converts utility classes (like Tailwind, Bootstrap) to semantic CSS
- Maps framework-specific classes (Facebook's `x1`, `x2` classes, Google's utility classes)
- Generates clean, maintainable CSS rules

### HTML Simplification
- Removes unnecessary attributes (`data-*`, `aria-*`, etc.)
- Limits nesting depth to prevent overly complex components
- Strips inline `<style>` tags and converts them to external CSS

### Blazor Best Practices
- Generates proper `[Parameter]` properties for meaningful attributes
- Includes event handler stubs (`HandleClick`, `HandleChange`)
- Supports `ChildContent` for nested content
- Uses proper Blazor syntax (`@onclick`, `@onchange`)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
