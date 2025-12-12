# Chrome Web Store Launch Checklist

Your extension is technically ready, but the Chrome Web Store has specific requirements for the listing and assets.

## 1. Extension Package (Technical)
- [x] **Manifest V3**: ✅ Compliant.
- [x] **Permissions**: ✅ Optimized and explained below.
- [x] **Code Quality**: ✅ Clean, readable code (required for review).
- [ ] **Zip File**: You need to create a *new* zip file after the latest manifest change.

### Permissions Justifications
You will need to copy/paste these when submitting:

**activeTab**
> "The activeTab permission is required to access the URL and content of the current tab only when the user explicitly invokes the extension. This allows the extension to parse the recipe on the current page without requiring broad host permissions for all websites."

**sidePanel**
> "The sidePanel permission is used to display the extension's main interface alongside the web content. This allows users to view extracted ingredients and select their preferred store while still viewing the original recipe page."

**scripting**
> "The scripting permission is required to inject a content script that retrieves the HTML content of the current recipe page. This is necessary to parse recipe ingredients locally within the browser, avoiding Cross-Origin Resource Sharing (CORS) restrictions that would prevent fetching the page content directly."

**storage**
> "The storage permission is used to locally save the user's preferred storefront (Whole Foods or Amazon Fresh). This allows the extension to remember their selection when they reopen the extension, improving the user experience by not forcing them to re-select their store every time."

## 2. Visual Assets (Required)
You must provide these exact image sizes. They cannot be placeholders.

| Asset Type | Size | Quantity | details |
|------------|------|----------|---------|
| **Store Icon** | 128x128px | 1 | PNG. Used on the store listing. |
| **Screenshots** | 1280x800px | 1-5 | JPEG/PNG. Show the extension in action (e.g., on a recipe page with the panel open). |
| **Promo Tile (Small)** | 440x280px | 1 | JPEG/PNG. Brand image for search results. |
| **Promo Tile (Large)** | 920x680px | 1 | JPEG/PNG. Hero image for your listing page. |

> **Tip**: Use tools like Canva or Figma templates for "Chrome Web Store Screenshots" to make these look professional.

## 3. Store Listing Info
- **Name**: Recipe to Shopping List (Defined in manifest, can be customized in store)
- **Short Description**: Instantly add recipe ingredients to your Whole Foods cart using Amazon's AFX API. (Max 132 chars)
- **Detailed Description**: Use the text from the README "Features" and "How it Works" sections.
- **Category**: Shopping / Productivity

## 4. Privacy & Legal
- **Privacy Policy URL**: Since you don't collect data (it's properly client-side), you still need a basic policy.
    1. Open the `PRIVACY_POLICY.md` file I created for you.
    2. Go to **[gist.github.com](https://gist.github.com)**.
    3. Paste the content of the file there.
    4. Create a "Public Gist".
    5. Click the "Raw" button on your new gist.
    6. **Copy that URL** - that is your Privacy Policy URL for the store!
- **Developer Account**: $5 one-time fee to register a Google Developer account.

## 5. Submission Steps
1. Register at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/dev/dashboard).
2. Click **"New Item"**.
3. Upload the final `Recipe_Shopper_Extension_v2.zip`.
4. Fill in the "Store Listing" tab with description and images.
5. Fill in the "Privacy" tab (Select "No" for data collection if true).
6. Click **"Submit for Review"**.

Reviews usually take **24-48 hours** for simple extensions like this.
