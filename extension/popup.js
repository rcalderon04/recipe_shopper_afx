// Configuration
const API_BASE_URL = 'http://localhost:5000';

// DOM elements
let recipeUrlInput;
let addToCartBtn;
let getCurrentUrlBtn;
let statusDiv;
let ingredientPreview;
let ingredientList;
let storeSelect;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    recipeUrlInput = document.getElementById('recipeUrl');
    addToCartBtn = document.getElementById('addToCart');
    getCurrentUrlBtn = document.getElementById('getCurrentUrl');
    statusDiv = document.getElementById('status');
    ingredientPreview = document.getElementById('ingredientPreview');
    ingredientList = document.getElementById('ingredientList');
    storeSelect = document.getElementById('storeSelect');

    // Load saved store preference
    chrome.storage.local.get(['preferredStore'], (result) => {
        if (result.preferredStore) {
            storeSelect.value = result.preferredStore;
        }
    });

    // Save store preference on change
    storeSelect.addEventListener('change', () => {
        chrome.storage.local.set({ preferredStore: storeSelect.value });
        const storeName = storeSelect.value === 'wholefoods' ? 'Whole Foods' : 'Amazon Fresh';
        showStatus(`Switched to ${storeName}`, 'success');
        setTimeout(() => hideStatus(), 2000);
    });

    // Add event listeners
    addToCartBtn.addEventListener('click', handleAddToCart);
    getCurrentUrlBtn.addEventListener('click', handleGetCurrentUrl);

    // Allow Enter key to submit
    recipeUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddToCart();
        }
    });

    // Try to auto-fill current tab URL
    autoFillCurrentUrl();
});

/**
 * Auto-fill the current tab's URL if it looks like a recipe page
 */
async function autoFillCurrentUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && !tab.url.startsWith('chrome://')) {
            recipeUrlInput.value = tab.url;
        }
    } catch (error) {
        console.error('Error getting current tab:', error);
    }
}

/**
 * Handle "Current Page" button click
 */
async function handleGetCurrentUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            recipeUrlInput.value = tab.url;
            showStatus('URL loaded from current page', 'success');
        }
    } catch (error) {
        showStatus('Error getting current page URL', 'error');
    }
}

/**
 * Handle "Add to Cart" button click
 */
async function handleAddToCart() {
    const url = recipeUrlInput.value.trim();

    if (!url) {
        showStatus('Please enter a recipe URL', 'error');
        return;
    }

    // Validate URL
    try {
        new URL(url);
    } catch (error) {
        showStatus('Please enter a valid URL', 'error');
        return;
    }

    // Disable button and show loading
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = 'Parsing Recipe...';
    showStatus('Fetching recipe ingredients...', 'loading');
    hideIngredientPreview();

    try {
        // Call backend API to parse recipe
        const response = await fetch(`${API_BASE_URL}/parse-recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to parse recipe');
        }

        const data = await response.json();
        const ingredients = data.ingredients;
        const recipeTitle = data.recipe_title;

        if (!ingredients || ingredients.length === 0) {
            throw new Error('No ingredients found in recipe');
        }

        // Show ingredient preview
        showIngredientPreview(ingredients, recipeTitle);

        // Get selected store
        const selectedStore = storeSelect.value;
        const storeName = selectedStore === 'wholefoods' ? 'Whole Foods' : 'Amazon Fresh';

        // Submit to AFX with selected store
        showStatus(`Found ${ingredients.length} ingredients. Opening ${storeName}...`, 'success');

        // Use the AFX submitter with selected store
        window.submitToAFX(ingredients, selectedStore, recipeTitle);

        // Update button
        addToCartBtn.textContent = `✓ Sent to ${storeName}!`;

        // Reset after delay
        setTimeout(() => {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'Add to Cart';
        }, 3000);

    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
    }
}

/**
 * Show status message
 */
function showStatus(message, type) {
    statusDiv.className = `status ${type}`;

    if (type === 'loading') {
        statusDiv.innerHTML = `<span class="spinner"></span>${message}`;
    } else {
        statusDiv.textContent = message;
    }

    statusDiv.classList.remove('hidden');
}

/**
 * Hide status message
 */
function hideStatus() {
    statusDiv.classList.add('hidden');
}

/**
 * Show ingredient preview
 */
function showIngredientPreview(ingredients, recipeTitle) {
    ingredientList.innerHTML = '';

    if (recipeTitle) {
        const titleDiv = document.createElement('div');
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '10px';
        titleDiv.textContent = recipeTitle;
        ingredientList.appendChild(titleDiv);
    }

    ingredients.forEach(ing => {
        const item = document.createElement('div');
        item.className = 'ingredient-item';

        const quantity = ing.quantityList[0];
        const quantityText = `${quantity.amount} ${quantity.unit.toLowerCase()}`;

        item.textContent = `${quantityText} - ${ing.name}`;
        ingredientList.appendChild(item);
    });

    ingredientPreview.classList.remove('hidden');
}

/**
 * Hide ingredient preview
 */
function hideIngredientPreview() {
    ingredientPreview.classList.add('hidden');
}
