# Changelog

## [0.1.0] - 2025-08-08 

### Major Features Added
- **Exact Visual Copy Mode**: Captures computed styles for pixel-perfect reproduction
- **Dual conversion modes**: Choose between exact visual copy or clean/simplified output
- **Enhanced style capture**: Uses getComputedStyle API to capture all rendered CSS properties
- **Improved UI**: Added mode selection and better visual feedback

### Enhanced
- **Style preservation**: Now preserves all visual aspects including colors, fonts, spacing, shadows
- **CSS generation**: Comprehensive CSS file generation with semantic class names
- **Error handling**: Better error handling and fallback mechanisms
- **User feedback**: Visual feedback for copy operations and mode selection

### Technical Improvements
- **Background script**: Enhanced element capture with computed style extraction
- **Content script**: Improved coordinate tracking and style data collection
- **Popup interface**: Complete rewrite with mode selection and better UX
- **Cross-browser compatibility**: Better support for different Chromium-based browsers

### Bug Fixes
- Fixed truncated conversion function in popup.js
- Improved HTML parsing and element processing
- Better handling of malformed HTML input
- Enhanced attribute cleanup and preservation

## [0.0.1] - 2025-08-07

### Added
- Initial release of BlazorSnap browser extension
- Right-click context menu to capture HTML elements
- Automatic popup opening after element selection
- HTML to Blazor component conversion
- Utility class to semantic CSS conversion
- Support for Facebook and Google utility classes
- Inline style extraction and conversion
- Clean, formatted Razor component output
- Companion CSS file generation
- Smart HTML simplification and cleanup
- Event handler stub generation
- Parameter property generation for meaningful attributes

### Features
- Context menu integration for easy element selection
- Automatic coordinate tracking for precise element capture
- Real-time conversion with live preview
- Copy to clipboard functionality
- Support for nested HTML structures
- Framework-agnostic utility class mapping
- Semantic class name generation

### Technical
- Manifest V3 compliance
- Content script for coordinate tracking
- Service worker for background processing
- Modern JavaScript with proper error handling
- Clean separation of concerns

### Known Issues
- Icon files missing (requires manual creation)
- Limited computed style capture in initial version
- Basic utility class mapping only
