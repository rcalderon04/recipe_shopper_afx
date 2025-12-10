/**
 * Quantity Parser - JavaScript version
 * Converts ingredient text into Amazon AFX API format
 */

// Unicode fraction mapping
const UNICODE_FRACTIONS = {
    '¼': 0.25, '½': 0.5, '¾': 0.75,
    '⅐': 1 / 7, '⅑': 1 / 9, '⅒': 0.1,
    '⅓': 1 / 3, '⅔': 2 / 3,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
    '⅙': 1 / 6, '⅚': 5 / 6,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
};

// AFX-compatible unit mappings
const AFX_UNIT_MAPPINGS = {
    // Volume
    'cup': 'CUP', 'cups': 'CUP', 'c': 'CUP',
    'tablespoon': 'TABLESPOON', 'tablespoons': 'TABLESPOON', 'tbsp': 'TABLESPOON', 'tbs': 'TABLESPOON',
    'teaspoon': 'TEASPOON', 'teaspoons': 'TEASPOON', 'tsp': 'TEASPOON',
    'fluid ounce': 'FLUID_OUNCE', 'fluid ounces': 'FLUID_OUNCE', 'fl oz': 'FLUID_OUNCE', 'fl. oz': 'FLUID_OUNCE',
    'pint': 'PINT', 'pints': 'PINT', 'pt': 'PINT',
    'quart': 'QUART', 'quarts': 'QUART', 'qt': 'QUART',
    'gallon': 'GALLON', 'gallons': 'GALLON', 'gal': 'GALLON',
    'milliliter': 'MILLILITER', 'milliliters': 'MILLILITER', 'ml': 'MILLILITER',
    'liter': 'LITER', 'liters': 'LITER', 'l': 'LITER',

    // Weight
    'pound': 'POUND', 'pounds': 'POUND', 'lb': 'POUND', 'lbs': 'POUND',
    'ounce': 'OUNCE', 'ounces': 'OUNCE', 'oz': 'OUNCE',
    'gram': 'GRAM', 'grams': 'GRAM', 'g': 'GRAM',
    'kilogram': 'KILOGRAM', 'kilograms': 'KILOGRAM', 'kg': 'KILOGRAM',

    // Count (default)
    'piece': 'COUNT', 'pieces': 'COUNT',
    'clove': 'COUNT', 'cloves': 'COUNT',
    'can': 'COUNT', 'cans': 'COUNT',
    'jar': 'COUNT', 'jars': 'COUNT',
    'package': 'COUNT', 'packages': 'COUNT', 'pkg': 'COUNT',
    'bag': 'COUNT', 'bags': 'COUNT',
    'box': 'COUNT', 'boxes': 'COUNT',
    'bunch': 'COUNT', 'bunches': 'COUNT',
    'head': 'COUNT', 'heads': 'COUNT',
    'stalk': 'COUNT', 'stalks': 'COUNT',
};

/**
 * Parses a number from text, handling fractions, decimals, and unicode fractions
 */
function parseNumber(text) {
    text = text.trim();

    // Check for unicode fractions
    for (const [unicodeFrac, value] of Object.entries(UNICODE_FRACTIONS)) {
        if (text.includes(unicodeFrac)) {
            const before = text.split(unicodeFrac)[0].trim();
            if (before) {
                try {
                    return parseFloat(before) + value;
                } catch {
                    return value;
                }
            }
            return value;
        }
    }

    // Handle mixed fractions like "1 1/2"
    const mixedMatch = text.match(/(\d+)\s+(\d+)\/(\d+)/);
    if (mixedMatch) {
        const whole = parseInt(mixedMatch[1]);
        const numerator = parseInt(mixedMatch[2]);
        const denominator = parseInt(mixedMatch[3]);
        return whole + (numerator / denominator);
    }

    // Handle simple fractions like "1/2"
    const fracMatch = text.match(/(\d+)\/(\d+)/);
    if (fracMatch) {
        const numerator = parseInt(fracMatch[1]);
        const denominator = parseInt(fracMatch[2]);
        return numerator / denominator;
    }

    // Handle decimals and integers
    try {
        return parseFloat(text);
    } catch {
        return null;
    }
}

/**
 * Removes quantity, unit, and container info to get the raw ingredient name
 */
function cleanIngredientName(text) {
    if (!text) return '';

    // Check if text contains "can" or "canned" as a container word
    const hasCanContainer = /\b(can|cans|canned)\b/i.test(text);

    if (hasCanContainer) {
        // Convert "X cans" or "X can" to just "canned"
        text = text.replace(/(\d+(?:\s+\d+\/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*\(.*?\)\s*(cans?)\s+/gi, 'canned ').trim();
        text = text.replace(/^\d+\s+(cans?)\s+/gi, 'canned ').trim();
        text = text.replace(/\b(cans?)\b/gi, 'canned').trim();
        text = text.replace(/\b(canned)\s+\1\b/gi, '$1').trim();
    } else {
        // Remove complex patterns like "2 (6 oz) cans"
        const complexPattern = /(\d+(?:\s+\d+\/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*\(.*?\)\s*[a-zA-Z]+\s*/;
        text = text.replace(complexPattern, '').trim();
    }

    // Remove simple quantities and units
    const numberPattern = /^(\d+\s+\d+\/\d+|\d+\s*[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+|\d+\.\d+|\d+\s*-\s*\d+|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+)\s*/;
    text = text.replace(numberPattern, '').trim();

    // Remove unit words
    const units = Object.keys(AFX_UNIT_MAPPINGS).sort((a, b) => b.length - a.length);
    const unitPattern = new RegExp(`^(${units.map(u => u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\.?(?:s)?\\s+(?:of\\s+)?`, 'i');
    text = text.replace(unitPattern, '').trim();

    // Remove common preparation adjectives (but preserve if we have "canned")
    if (!hasCanContainer) {
        const prepWords = [
            'chopped', 'minced', 'sliced', 'diced', 'crushed', 'ground', 'grated', 'shredded',
            'cubed', 'peeled', 'cored', 'seeded', 'julienned', 'halved', 'quartered',
            'beaten', 'sifted', 'melted', 'softened', 'finely', 'coarsely', 'roughly'
        ];
        const prepPattern = new RegExp(`^(${prepWords.join('|')})\\s+`, 'i');
        for (let i = 0; i < 3; i++) {
            text = text.replace(prepPattern, '').trim();
        }
    }

    // Remove trailing phrases
    const trailingPhrases = [
        /,\s*divided.*$/i,
        /,\s*or to taste.*$/i,
        /,\s*plus more.*$/i,
        /,\s*to taste.*$/i,
        /,\s*optional.*$/i
    ];
    for (const pattern of trailingPhrases) {
        text = text.replace(pattern, '').trim();
    }

    return text;
}

/**
 * Parses ingredient text and returns AFX-compatible format
 */
function parseIngredientForAFX(ingredientText) {
    let amount = null;
    let unit = 'COUNT'; // Default to COUNT

    // Pattern for complex cases: "2 (6 ounce) cans"
    const complexPattern = /(\d+(?:\s+\d+\/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*\((\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z\s]+)\)\s*([a-zA-Z]+)/;
    const complexMatch = ingredientText.match(complexPattern);

    if (complexMatch) {
        const countStr = complexMatch[1];
        const amountStr = complexMatch[2];
        const unitStr = complexMatch[3].trim().toLowerCase();

        const count = parseNumber(countStr);
        const itemAmount = parseNumber(amountStr);

        if (count && itemAmount) {
            amount = count * itemAmount;
            unit = AFX_UNIT_MAPPINGS[unitStr] || 'COUNT';
        }
    } else {
        // Pattern for simple cases: "2 cups" or "1 pound"
        const simplePattern = /(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z\s]+?)(?:\s|,|$)/;
        const simpleMatch = ingredientText.match(simplePattern);

        if (simpleMatch) {
            const amountStr = simpleMatch[1];
            const unitStr = simpleMatch[2].trim().toLowerCase();

            const normalizedUnit = AFX_UNIT_MAPPINGS[unitStr];
            if (normalizedUnit) {
                amount = parseNumber(amountStr);
                unit = normalizedUnit;
            }
        }
    }

    // Default to 1 if no amount found
    if (amount === null) {
        amount = 1;
    }

    // Clean the ingredient name
    let name = cleanIngredientName(ingredientText);
    if (!name) {
        name = ingredientText; // Fallback to original if cleaning fails
    }

    return {
        name: name,
        quantityList: [
            {
                unit: unit,
                amount: amount
            }
        ]
    };
}

// Export for use in panel.js
window.parseIngredientForAFX = parseIngredientForAFX;
