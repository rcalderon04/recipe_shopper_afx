# Recipe to Whole Foods (AFX)

A Chrome extension that instantly adds recipe ingredients to your Whole Foods cart using Amazon's AFX (Amazon Fresh Experience) API.

## Features

- 🚀 **Lightning Fast** - Uses Amazon's official AFX API (10-20x faster than browser automation)
- 🛒 **One-Click Shopping** - Parse any recipe and add all ingredients to your Whole Foods cart instantly
- 🎯 **Smart Parsing** - Extracts ingredients from any recipe website using Schema.org JSON-LD or HTML fallback
- 📊 **Quantity Detection** - Automatically detects amounts and units (cups, tablespoons, pounds, etc.)
- 🎨 **Modern UI** - Clean, intuitive interface with real-time status updates

## Architecture

This extension uses a hybrid architecture:

1. **Chrome Extension** (Frontend)
   - Popup UI for entering recipe URLs
   - AFX form submission logic
   - Ingredient preview

2. **Flask Backend** (Lightweight API)
   - Recipe URL scraping
   - Ingredient extraction and parsing
   - Quantity normalization to AFX format

3. **Amazon AFX API** (Amazon's Service)
   - Receives ingredient list
   - Matches products in Whole Foods inventory
   - Creates shopping list for user

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the Flask server:
   ```bash
   python api/index.py
   ```

   The API will run on `http://localhost:5000`

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable "Developer mode" (toggle in top right)

3. Click "Load unpacked"

4. Select the `extension` folder from this project

5. The extension icon should appear in your Chrome toolbar

## Usage

1. **Start the backend server** (see Backend Setup above)

2. **Navigate to any recipe page** (e.g., AllRecipes, NYT Cooking, Food Network)

3. **Click the extension icon** in your Chrome toolbar

4. The current page URL will auto-fill, or you can paste any recipe URL

5. **Click "Add to Whole Foods Cart"**

6. A new tab will open with your ingredients in a Whole Foods shopping list

7. Review the matched products and add them to your cart!

## How It Works

### Step 1: Recipe Parsing
The extension sends the recipe URL to the backend API, which:
- Fetches the HTML content
- Extracts ingredients using Schema.org JSON-LD (structured data)
- Falls back to HTML parsing if needed
- Parses quantities and units from each ingredient

### Step 2: AFX Formatting
The backend converts ingredients to Amazon's AFX format:
```json
{
  "ingredients": [
    {
      "name": "butter",
      "quantityList": [{"unit": "COUNT", "amount": 1}]
    },
    {
      "name": "chicken breasts",
      "quantityList": [{"unit": "POUND", "amount": 2}]
    }
  ]
}
```

### Step 3: AFX Submission
The extension creates a hidden HTML form and POSTs to:
```
https://www.amazon.com/afx/ingredients/landing
```

Amazon receives the ingredients, matches them to Whole Foods products, and displays a shopping list.

## API Endpoints

### `POST /parse-recipe`
Parse a recipe URL and return AFX-formatted ingredients.

**Request:**
```json
{
  "url": "https://example.com/recipe"
}
```

**Response:**
```json
{
  "ingredients": [
    {
      "name": "butter",
      "quantityList": [{"unit": "COUNT", "amount": 1}]
    }
  ],
  "recipe_title": "Delicious Recipe"
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Supported Units

The extension supports automatic conversion to AFX-compatible units:

- **Volume**: CUP, TABLESPOON, TEASPOON, FLUID_OUNCE, PINT, QUART, GALLON, MILLILITER, LITER
- **Weight**: POUND, OUNCE, GRAM, KILOGRAM
- **Count**: COUNT (default for items, pieces, cans, jars, etc.)

## Troubleshooting

### Backend not connecting
- Make sure the Flask server is running on `http://localhost:5000`
- Check the browser console for CORS errors
- Verify `flask-cors` is installed

### No ingredients found
- Some recipe sites may not use standard formats
- Try a different recipe website
- Check the browser console for parsing errors

### AFX page shows no items
- Amazon may not have matched all ingredients
- Try more specific ingredient names
- Some specialty items may not be available

## Development

### Project Structure
```
recipe_shopper_afx/
├── backend/
│   ├── api/
│   │   └── index.py          # Flask API
│   ├── recipe_parser.py      # Recipe scraping
│   ├── quantity_parser.py    # Quantity parsing
│   └── requirements.txt
├── extension/
│   ├── manifest.json         # Extension config
│   ├── popup.html           # UI
│   ├── popup.js             # Main logic
│   ├── afx_submitter.js     # AFX submission
│   ├── background.js        # Service worker
│   └── styles.css           # Styling
└── README.md
```

### Testing

Test the quantity parser:
```bash
cd backend
python quantity_parser.py
```

Test the recipe parser:
```bash
cd backend
python recipe_parser.py
# Enter a recipe URL when prompted
```

## Comparison to Playwright Version

| Feature | AFX Version | Playwright Version |
|---------|-------------|-------------------|
| Speed | 2-3 seconds | 30-60 seconds |
| Backend Complexity | Simple Flask API | Complex browser automation |
| Cloud Costs | Minimal | High (browser instances) |
| Reliability | High (official API) | Medium (UI changes break it) |
| Authentication | Uses user's session | Must manage separately |

## Credits

- Built with Amazon's AFX (Amazon Fresh Experience) API
- Recipe parsing powered by [extruct](https://github.com/scrapinghub/extruct)
- UI inspired by modern web design principles

## License

MIT License - feel free to use and modify!

## Future Enhancements

- [ ] Support for other grocery stores (Kroger, Walmart)
- [ ] Ingredient substitution suggestions
- [ ] Price comparison across stores
- [ ] Recipe saving and favorites
- [ ] Meal planning features
