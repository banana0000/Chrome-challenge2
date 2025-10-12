# AI Summarizer & Translator Chrome Extension

A Chrome browser extension that provides AI-powered text summarization and translation capabilities. Select text on any webpage and get instant summaries in your preferred language.

## Features

- **Text Selection**: Select any text on a webpage and get it summarized
- **Multi-language Support**: Translate and summarize content in multiple languages including:
  - English
  - Hungarian
  - German
  - French
  - Spanish
- **Copy to Clipboard**: Easy copy functionality for the summarized text
- **Modern UI**: Clean, responsive interface with gradient styling

## Installation

### For Development

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your Chrome toolbar

### For Production

This extension is currently in development and not yet available on the Chrome Web Store.

## Usage

1. **Select Text**: Highlight any text on a webpage that you want to summarize
2. **Open Extension**: Click the extension icon in your Chrome toolbar
3. **Choose Language**: Select your target language from the dropdown menu
4. **Summarize**: Click "Translate & Summarize Selected Text"
5. **Copy Result**: Use the "Copy" button to copy the summary to your clipboard

## Project Structure

```
Chrome challenge/
├── manifest.json      # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js          # Main functionality logic
├── style.css         # Styling and UI design
└── README.md         # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: 
  - `scripting`: Required to inject scripts into web pages
  - `activeTab`: Access to the current active tab
  - `summarize`: AI summarization capability
  - `translate`: Translation functionality

## API Integration

The extension uses the following experimental APIs:
- `navigator.translator`: For text translation
- `navigator.summary`: For AI-powered summarization

*Note: These APIs are currently experimental and may not be available in all Chrome versions. The extension includes fallback functionality for demonstration purposes.*

## Development

### Prerequisites

- Chrome browser (version 88+ recommended)
- Basic understanding of Chrome extension development

### Building

No build process required - this is a simple extension using vanilla HTML, CSS, and JavaScript.

### Testing

1. Load the extension in developer mode
2. Test on various websites with different text content
3. Verify translation and summarization functionality
4. Test the copy-to-clipboard feature

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Extension Not Working
- Ensure you have the latest version of Chrome
- Check that the extension is enabled in `chrome://extensions/`
- Verify that you have selected text before clicking the summarize button

### Translation/Summarization Not Available
- The extension uses experimental APIs that may not be available in all Chrome versions
- Check the browser console for any error messages
- The extension will show a demo mode if the APIs are unavailable

## Version History

- **v1.0**: Initial release with basic summarization and translation functionality

## Support

For issues, feature requests, or questions, please create an issue in the repository or contact the development team.
