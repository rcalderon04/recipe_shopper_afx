# Recipe to Whole Foods (AFX)

A Chrome extension that instantly adds recipe ingredients to your Whole Foods or Amazon Fresh cart using Amazon's AFX (Amazon Fresh Experience) API.

## Features

- 🚀 **Lightning Fast** - Uses Amazon's official AFX API (10-20x faster than browser automation)
- 🛒 **One-Click Shopping** - Parse any recipe and add all ingredients to your cart instantly
- 🏪 **Dual Store Support** - Seamlessly switch between Whole Foods and Amazon Fresh
- 🎯 **Smart Parsing** - Extracts ingredients from any recipe website using Schema.org JSON-LD or HTML fallback
- 📊 **Quantity Detection** - Automatically detects amounts and units (cups, tablespoons, pounds, etc.)
- 💻 **100% Client-Side** - No backend server required! Runs entirely in your browser.
- 🎨 **Modern UI** - Clean, intuitive side panel interface with real-time status updates

## Installation

### Load Unpacked Extension

1. **Download and Unzip** the project folder.
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right corner)
4. Click **"Load unpacked"**
5. Select the `extension` folder from this project
6. The extension icon should appear in your Chrome toolbar

## Usage

1. **Navigate to any recipe page** (e.g., AllRecipes, NYT Cooking, Food Network)
2. **Click the extension icon** in your Chrome toolbar to open the side panel
3. The extension will **automatically parse** the recipe on the current page
4. Review the extracted ingredients list
5. (Optional) Click "Change" to switch between Whole Foods and Amazon Fresh
6. **Click "Add to Cart"**
7. A new tab will open with your ingredients in an Amazon shopping list (AFX)
8. Review the matched products and add them to your cart!

## Architecture

This extension uses a **Serverless Architecture**:

1. **Side Panel** (`panel.html`/`panel.js`):
   - Hosts the main UI
   - Manages state and user interactions

2. **JavaScript Parser** (`recipe_parser.js`):
   - Injects script to retrieve page HTML (bypassing CORS)
   - Extracts ingredients using JSON-LD or DOM traversal
   - Fully client-side parsing logic

3. **Quantity Normalizer** (`quantity_parser.js`):
   - Normalizes text (e.g., "1/2 cup") to structured data
   - Handles unit conversion for Amazon AFX

4. **AFX Submitter** (`afx_submitter.js`):
   - POSTs structured data to `https://www.amazon.com/afx/ingredients/landing`
   - Handles store selection (Whole Foods vs. Amazon Fresh)

## Supported Stores

- **Whole Foods Market** (Premium organic groceries)
- **Amazon Fresh** (Fast grocery delivery)

## Supported Units

The extension supports automatic conversion to AFX-compatible units:

- **Volume**: CUP, TABLESPOON, TEASPOON, FLUID_OUNCE, PINT, QUART, GALLON, MILLILITER, LITER
- **Weight**: POUND, OUNCE, GRAM, KILOGRAM
- **Count**: COUNT (default for items, pieces, cans, jars, etc.)

## Development

### Project Structure
```
recipe_shopper_afx/
├── extension/
│   ├── manifest.json         # Extension config
│   ├── panel.html            # Main Side Panel UI
│   ├── panel.js              # UI Logic & Controller
│   ├── recipe_parser.js      # Parsing Logic
│   ├── quantity_parser.js    # Unit Conversion Logic
│   ├── afx_submitter.js      # API Submission
│   ├── background.js         # Service worker
│   ├── styles.css            # Styling
│   └── assets/               # Icons and Logos
└── README.md
```

## Credits

- Built with Amazon's AFX (Amazon Fresh Experience) API
- UI inspired by modern web design principles

## License

MIT License - feel free to use and modify!
