// Configuration
const API_BASE_URL = 'http://localhost:5000';

// DOM elements
let recipeUrlInput;
let addToCartBtn;
let getCurrentUrlBtn;
let statusDiv;
let ingredientList;
let recipeTitle;
let noRecipe;
let urlInputGroup;
let storeModal;
let changeStoreBtn;
let closeModalBtn;
let selectedStoreLogo;
let selectedStoreName;
let selectedStore = 'wholefoods'; // Default store

// Store configuration
const STORES = {
    wholefoods: {
        name: 'Whole Foods',
        logo: 'wholefoods_logo.png'
    },
    amazonfresh: {
        name: 'Amazon Fresh',
        logo: 'amazonfresh_logo.png'
    }
};

// State
let currentIngredients = null;
let currentRecipeTitle = '';

// Per-tab recipe cache
const tabRecipeCache = new Map();

// Listen for tab change messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TAB_CHANGED' || message.type === 'TAB_UPDATED') {
        autoParseCurrentPage();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    recipeUrlInput = document.getElementById('recipeUrl');
    addToCartBtn = document.getElementById('addToCart');
    getCurrentUrlBtn = document.getElementById('getCurrentUrl');
    statusDiv = document.getElementById('status');
    ingredientList = document.getElementById('ingredientList');
    recipeTitle = document.getElementById('recipeTitle');
    noRecipe = document.getElementById('noRecipe');
    urlInputGroup = document.getElementById('urlInputGroup');
    storeModal = document.getElementById('storeModal');
    changeStoreBtn = document.getElementById('changeStoreBtn');
    closeModalBtn = document.getElementById('closeModalBtn');
    selectedStoreLogo = document.getElementById('selectedStoreLogo');
    selectedStoreName = document.getElementById('selectedStoreName');

    // Load saved store preference
    chrome.storage.local.get(['preferredStore'], (result) => {
        if (result.preferredStore) {
            selectedStore = result.preferredStore;
            updateStoreCard();
        }
    });

    // Modal event listeners
    if (changeStoreBtn) {
        changeStoreBtn.addEventListener('click', openStoreModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeStoreModal);
    }

    // Click outside modal to close
    if (storeModal) {
        storeModal.addEventListener('click', (e) => {
            if (e.target === storeModal) {
                closeStoreModal();
            }
        });
    }

    // Store option click handlers
    document.querySelectorAll('.store-option').forEach(option => {
        option.addEventListener('click', function () {
            const store = this.dataset.store;
            selectStore(store);
            closeStoreModal();
        });
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

    // Click on "no recipe" message to show URL input
    noRecipe.addEventListener('click', () => {
        showUrlInput();
    });

    // Auto-parse current page on open
    autoParseCurrentPage();
});

function openStoreModal() {
    if (storeModal) {
        storeModal.classList.remove('hidden');
        updateStoreOptions();
    }
}

function closeStoreModal() {
    if (storeModal) {
        storeModal.classList.add('hidden');
    }
}

function selectStore(store) {
    selectedStore = store;
    updateStoreCard();
    updateStoreOptions();
    chrome.storage.local.set({ preferredStore: store });
}

function updateStoreCard() {
    const storeConfig = STORES[selectedStore];
    if (selectedStoreLogo && selectedStoreName && storeConfig) {
        selectedStoreLogo.src = storeConfig.logo;
        selectedStoreName.textContent = storeConfig.name;
    }
}

function updateStoreOptions() {
    document.querySelectorAll('.store-option').forEach(option => {
        const isSelected = option.dataset.store === selectedStore;
        option.classList.toggle('selected', isSelected);
    });
}

async function autoParseCurrentPage() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
            showNoRecipe();
            return;
        }

        const cached = tabRecipeCache.get(tab.id);
        if (cached && cached.url === tab.url) {
            currentIngredients = cached.ingredients;
            currentRecipeTitle = cached.title;
            displayIngredients(cached.ingredients, cached.title);
            recipeUrlInput.value = tab.url;
            return;
        }

        showLoadingState();

        const response = await fetch(`${API_BASE_URL}/parse-recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: tab.url })
        });

        if (!response.ok) {
            showNoRecipe();
            tabRecipeCache.delete(tab.id);
            return;
        }

        const data = await response.json();
        const ingredients = data.ingredients;
        const title = data.recipe_title;

        if (!ingredients || ingredients.length === 0) {
            showNoRecipe();
            tabRecipeCache.delete(tab.id);
            return;
        }

        currentIngredients = ingredients;
        currentRecipeTitle = title;
        displayIngredients(ingredients, title);
        recipeUrlInput.value = tab.url;

        tabRecipeCache.set(tab.id, {
            url: tab.url,
            ingredients: ingredients,
            title: title
        });

    } catch (error) {
        console.error('Auto-parse error:', error);
        showNoRecipe();
    }
}

function showLoadingState() {
    recipeTitle.classList.add('hidden');
    noRecipe.classList.add('hidden');
    ingredientList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">🔍 Looking for recipe...</div>';
}

function showNoRecipe() {
    recipeTitle.classList.add('hidden');
    ingredientList.innerHTML = '';
    noRecipe.classList.remove('hidden');
    currentIngredients = null;
    currentRecipeTitle = '';
}

function displayIngredients(ingredients, title) {
    noRecipe.classList.add('hidden');

    if (title) {
        recipeTitle.textContent = title;
        recipeTitle.classList.remove('hidden');
    } else {
        recipeTitle.classList.add('hidden');
    }

    ingredientList.innerHTML = '';

    ingredients.forEach(ing => {
        const item = document.createElement('div');
        item.className = 'ingredient-item';

        const quantity = ing.quantityList[0];
        const quantityText = `${quantity.amount} ${quantity.unit.toLowerCase()}`;

        item.innerHTML = `<span class="ingredient-quantity">${quantityText}</span> ${ing.name}`;
        ingredientList.appendChild(item);
    });
}

function showUrlInput() {
    urlInputGroup.classList.add('show');
}

async function handleGetCurrentUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            recipeUrlInput.value = tab.url;
            showStatus('URL loaded from current page', 'success');
            setTimeout(() => hideStatus(), 2000);
        }
    } catch (error) {
        showStatus('Error getting current page URL', 'error');
    }
}

async function handleAddToCart() {
    if (currentIngredients && currentIngredients.length > 0) {
        submitToStore();
        return;
    }

    const url = recipeUrlInput.value.trim();

    if (!url) {
        showStatus('Please enter a recipe URL', 'error');
        showUrlInput();
        return;
    }

    try {
        new URL(url);
    } catch (error) {
        showStatus('Please enter a valid URL', 'error');
        return;
    }

    addToCartBtn.disabled = true;
    addToCartBtn.textContent = 'Parsing Recipe...';
    showLoadingState();

    try {
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
        const title = data.recipe_title;

        if (!ingredients || ingredients.length === 0) {
            throw new Error('No ingredients found in recipe');
        }

        currentIngredients = ingredients;
        currentRecipeTitle = title;
        displayIngredients(ingredients, title);

        submitToStore();

    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
        showNoRecipe();
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
    }
}

function submitToStore() {
    if (!currentIngredients || currentIngredients.length === 0) {
        showStatus('No ingredients to add', 'error');
        return;
    }

    const storeName = selectedStore === 'wholefoods' ? 'Whole Foods' : 'Amazon Fresh';

    showStatus(`Sending ${currentIngredients.length} ingredients to ${storeName}...`, 'success');

    window.submitToAFX(currentIngredients, selectedStore, currentRecipeTitle);

    addToCartBtn.textContent = `✓ Sent to ${storeName}!`;
    addToCartBtn.disabled = true;

    setTimeout(() => {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
        hideStatus();
    }, 3000);
}

function showStatus(message, type) {
    statusDiv.className = `status ${type}`;

    if (type === 'loading') {
        statusDiv.innerHTML = `<span class="spinner"></span>${message}`;
    } else {
        statusDiv.textContent = message;
    }

    statusDiv.classList.remove('hidden');
}

function hideStatus() {
    statusDiv.classList.add('hidden');
}
