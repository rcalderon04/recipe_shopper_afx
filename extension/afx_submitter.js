/**
 * AFX Submitter - Handles submission of ingredients to Amazon AFX API
 * Supports both Whole Foods and Amazon Fresh storefronts
 */

const AFX_ENDPOINT = 'https://www.amazon.com/afx/ingredients/landing';

// Store brand IDs (store names come from panel.js STORES object)
const BRAND_IDS = {
    wholefoods: 'VUZHIFdob2xlIEZvb2Rz',  // Base64: "UFG Whole Foods"
    amazonfresh: 'QW1hem9uIEZyZXNo'  // Base64: "Amazon Fresh"
};

/**
 * Submits ingredients to Amazon AFX endpoint
 * @param {Array} ingredients - Array of ingredient objects in AFX format
 * @param {string} storeId - Store identifier ('wholefoods' or 'amazonfresh')
 * @param {string} recipeTitle - Title of the recipe (optional)
 */
function submitToAFX(ingredients, storeId = 'wholefoods', recipeTitle = '') {
    const brandId = BRAND_IDS[storeId];
    const storeName = storeId === 'wholefoods' ? 'Whole Foods' : 'Amazon Fresh';

    if (!brandId) {
        console.error('Invalid store ID:', storeId);
        return;
    }

    // Create the AFX payload
    const afxPayload = {
        ingredients: ingredients
    };

    // Create a hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = AFX_ENDPOINT;
    form.target = '_blank'; // Open in new tab
    form.style.display = 'none';

    // Add ingredients field
    const ingredientsInput = document.createElement('input');
    ingredientsInput.type = 'hidden';
    ingredientsInput.name = 'ingredients';
    ingredientsInput.value = JSON.stringify(afxPayload);
    form.appendChild(ingredientsInput);

    // Add brand field
    const brandInput = document.createElement('input');
    brandInput.type = 'hidden';
    brandInput.name = 'brand';
    brandInput.value = storeName;
    form.appendChild(brandInput);

    // Add brand ID field
    const brandIdInput = document.createElement('input');
    brandIdInput.type = 'hidden';
    brandIdInput.name = 'almBrandId';
    brandIdInput.value = brandId;
    form.appendChild(brandIdInput);

    // Append form to body, submit, and remove
    document.body.appendChild(form);
    form.submit();

    // Clean up after a short delay
    setTimeout(() => {
        document.body.removeChild(form);
    }, 100);

    console.log('Submitted to', storeName, ':', {
        ingredientCount: ingredients.length,
        recipeTitle: recipeTitle,
        storeId: storeId
    });
}

// Export for use in popup.js
window.submitToAFX = submitToAFX;
