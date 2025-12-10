# Recipe to Whole Foods - Quick Reference

## Project Overview

**Location**: `c:\Users\rcald\.gemini\antigravity\scratch\recipe_shopper_afx`

**Type**: Chrome Extension + Flask Backend

**Purpose**: Instantly add recipe ingredients to Whole Foods cart using Amazon's AFX API

---

## Quick Start Commands

### Start Backend Server
```bash
cd c:\Users\rcald\.gemini\antigravity\scratch\recipe_shopper_afx\backend
.\venv\Scripts\activate
python api\index.py
```
Server runs on: `http://localhost:5000`

### Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `c:\Users\rcald\.gemini\antigravity\scratch\recipe_shopper_afx\extension`

---

## Project Structure

```
recipe_shopper_afx/
├── backend/                    # Flask API
│   ├── venv/                  # Python virtual environment
│   ├── api/
│   │   └── index.py          # Main API endpoints
│   ├── recipe_parser.py      # Recipe scraping
│   ├── quantity_parser.py    # Ingredient parsing
│   └── requirements.txt      # Dependencies
│
└── extension/                  # Chrome Extension
    ├── manifest.json          # Extension config
    ├── popup.html            # UI
    ├── popup.js              # Main logic
    ├── afx_submitter.js      # AFX submission
    ├── background.js         # Service worker
    ├── styles.css            # Styling
    └── icon*.png             # Icons
```

---

## Key Files

### Backend

| File | Purpose | Key Functions |
|------|---------|---------------|
| `api/index.py` | Flask REST API | `/parse-recipe`, `/health` |
| `recipe_parser.py` | Recipe scraping | `parse(url)` |
| `quantity_parser.py` | Ingredient parsing | `parse_ingredient_for_afx()` |

### Extension

| File | Purpose | Key Functions |
|------|---------|---------------|
| `popup.js` | Main UI logic | `handleAddToCart()` |
| `afx_submitter.js` | AFX submission | `submitToAFX()` |
| `popup.html` | User interface | Input, buttons, status |

---

## API Endpoints

### `POST /parse-recipe`
Parse recipe URL and return AFX-formatted ingredients.

**Request**:
```json
{
  "url": "https://example.com/recipe"
}
```

**Response**:
```json
{
  "ingredients": [
    {
      "name": "butter",
      "quantityList": [{"unit": "COUNT", "amount": 1}]
    }
  ],
  "recipe_title": "Recipe Name"
}
```

### `GET /health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy"
}
```

---

## AFX Format

Amazon's AFX API expects ingredients in this format:

```json
{
  "ingredients": [
    {
      "name": "ingredient name",
      "quantityList": [
        {
          "unit": "UNIT_TYPE",
          "amount": number
        }
      ]
    }
  ]
}
```

### Supported Units
- **Volume**: CUP, TABLESPOON, TEASPOON, FLUID_OUNCE, PINT, QUART, GALLON
- **Weight**: POUND, OUNCE, GRAM, KILOGRAM
- **Count**: COUNT (default)

---

## Common Tasks

### Add New Dependency
```bash
cd backend
.\venv\Scripts\activate
pip install package-name
pip freeze > requirements.txt
```

### Test Backend Locally
```bash
cd backend
.\venv\Scripts\python recipe_parser.py
# Enter test URL when prompted
```

### Debug Extension
1. Open extension popup
2. Right-click → "Inspect"
3. Check Console for errors

### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Click refresh icon on extension card

---

## Troubleshooting

### Backend won't start
- Check if port 5000 is in use
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Extension not loading
- Check manifest.json syntax
- Verify all files exist
- Check Chrome console for errors

### No ingredients found
- Check recipe URL is valid
- Try different recipe website
- Check backend console for parsing errors

### AFX submission not working
- Verify user is logged into Amazon
- Check browser console for errors
- Test AFX endpoint manually

---

## Development Workflow

### Making Backend Changes
1. Edit Python files
2. Restart Flask server (Ctrl+C, then restart)
3. Test with extension

### Making Extension Changes
1. Edit JavaScript/HTML/CSS files
2. Reload extension in Chrome
3. Test functionality

---

## Testing

### Test Recipe Parsing
```bash
cd backend
.\venv\Scripts\python quantity_parser.py
```

### Test AFX Endpoint
Open: `c:\Users\rcald\.gemini\antigravity\scratch\shopping_list_tool\test_afx_endpoint.html`

### Test Full Flow
1. Start backend
2. Load extension
3. Navigate to recipe page
4. Click extension → "Add to Cart"
5. Verify ingredients appear in Whole Foods

---

## Important Links

- **AFX Endpoint**: `https://www.amazon.com/afx/ingredients/landing`
- **Backend API**: `http://localhost:5000`
- **Extension Path**: `c:\Users\rcald\.gemini\antigravity\scratch\recipe_shopper_afx\extension`

---

## Documentation

- [README.md](file:///c:/Users/rcald/.gemini/antigravity/scratch/recipe_shopper_afx/README.md) - Full documentation
- [Walkthrough](file:///C:/Users/rcald/.gemini/antigravity/brain/8cea5971-2a5f-47e0-9869-c5e209cc9f5d/walkthrough.md) - Project walkthrough
- [Enhancement Roadmap](file:///C:/Users/rcald/.gemini/antigravity/brain/8cea5971-2a5f-47e0-9869-c5e209cc9f5d/enhancement_roadmap.md) - Future features
- [AFX Verification](file:///C:/Users/rcald/.gemini/antigravity/brain/8cea5971-2a5f-47e0-9869-c5e209cc9f5d/afx_api_verification.md) - API research

---

## Version Comparison

| Feature | Old (Playwright) | New (AFX) |
|---------|------------------|-----------|
| Speed | 30-60s | 2-3s |
| Backend | Complex | Simple |
| Dependencies | Many | Few |
| Cost | High | Low |
| Reliability | Medium | High |

**Old Project**: `c:\Users\rcald\.gemini\antigravity\scratch\shopping_list_tool`  
**New Project**: `c:\Users\rcald\.gemini\antigravity\scratch\recipe_shopper_afx`

Both versions are preserved and functional!
