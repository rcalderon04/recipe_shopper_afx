"""
AFX-compatible quantity parser for recipe ingredients.

Converts ingredient text into Amazon AFX API format with structured quantities.
"""

import re
from fractions import Fraction


# Unicode fraction mapping
UNICODE_FRACTIONS = {
    '¼': 0.25, '½': 0.5, '¾': 0.75,
    '⅐': 1/7, '⅑': 1/9, '⅒': 0.1,
    '⅓': 1/3, '⅔': 2/3,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8,
    '⅙': 1/6, '⅚': 5/6,
    '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
}

# AFX-compatible unit mappings
AFX_UNIT_MAPPINGS = {
    # Volume
    'cup': 'CUP', 'cups': 'CUP', 'c': 'CUP',
    'tablespoon': 'TABLESPOON', 'tablespoons': 'TABLESPOON', 'tbsp': 'TABLESPOON', 'tbs': 'TABLESPOON',
    'teaspoon': 'TEASPOON', 'teaspoons': 'TEASPOON', 'tsp': 'TEASPOON',
    'fluid ounce': 'FLUID_OUNCE', 'fluid ounces': 'FLUID_OUNCE', 'fl oz': 'FLUID_OUNCE', 'fl. oz': 'FLUID_OUNCE',
    'pint': 'PINT', 'pints': 'PINT', 'pt': 'PINT',
    'quart': 'QUART', 'quarts': 'QUART', 'qt': 'QUART',
    'gallon': 'GALLON', 'gallons': 'GALLON', 'gal': 'GALLON',
    'milliliter': 'MILLILITER', 'milliliters': 'MILLILITER', 'ml': 'MILLILITER',
    'liter': 'LITER', 'liters': 'LITER', 'l': 'LITER',
    
    # Weight
    'pound': 'POUND', 'pounds': 'POUND', 'lb': 'POUND', 'lbs': 'POUND',
    'ounce': 'OUNCE', 'ounces': 'OUNCE', 'oz': 'OUNCE',
    'gram': 'GRAM', 'grams': 'GRAM', 'g': 'GRAM',
    'kilogram': 'KILOGRAM', 'kilograms': 'KILOGRAM', 'kg': 'KILOGRAM',
    
    # Count (default)
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
}


def parse_number(text):
    """
    Parses a number from text, handling fractions, decimals, and unicode fractions.
    """
    text = text.strip()
    
    # Check for unicode fractions
    for unicode_frac, value in UNICODE_FRACTIONS.items():
        if unicode_frac in text:
            before = text.split(unicode_frac)[0].strip()
            if before:
                try:
                    return float(before) + value
                except:
                    return value
            return value
    
    # Handle mixed fractions like "1 1/2"
    mixed_match = re.match(r'(\d+)\s+(\d+)/(\d+)', text)
    if mixed_match:
        whole = int(mixed_match.group(1))
        numerator = int(mixed_match.group(2))
        denominator = int(mixed_match.group(3))
        return whole + (numerator / denominator)
    
    # Handle simple fractions like "1/2"
    frac_match = re.match(r'(\d+)/(\d+)', text)
    if frac_match:
        numerator = int(frac_match.group(1))
        denominator = int(frac_match.group(2))
        return numerator / denominator
    
    # Handle decimals and integers
    try:
        return float(text)
    except:
        return None


def clean_ingredient_name(text):
    """
    Removes quantity, unit, and container info to get the raw ingredient name.
    Example: "1 tablespoon dill" -> "dill"
             "2 (6 oz) cans tomato paste" -> "canned tomato paste"
    """
    if not text:
        return ""
    
    # Check if text contains "can" or "canned" as a container word
    has_can_container = bool(re.search(r'\b(can|cans|canned)\b', text, re.IGNORECASE))
    
    if has_can_container:
        # Convert "X cans" or "X can" to just "canned"
        text = re.sub(r'(\d+(?:\s+\d+/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*\(.*?\)\s*(cans?)\s+', r'canned ', text, flags=re.IGNORECASE).strip()
        text = re.sub(r'^\d+\s+(cans?)\s+', r'canned ', text, flags=re.IGNORECASE).strip()
        text = re.sub(r'\b(cans?)\b', 'canned', text, flags=re.IGNORECASE).strip()
        text = re.sub(r'\b(canned)\s+\1\b', r'\1', text, flags=re.IGNORECASE).strip()
    else:
        # Remove complex patterns like "2 (6 oz) cans"
        complex_pattern = r'(\d+(?:\s+\d+/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*\(.*?\)\s*[a-zA-Z]+\s*'
        text = re.sub(complex_pattern, '', text).strip()
    
    # Remove simple quantities and units
    number_pattern = r'^(\d+\s+\d+/\d+|\d+\s*[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+/\d+|\d+\.\d+|\d+\s*-\s*\d+|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+)\s*'
    text = re.sub(number_pattern, '', text).strip()
    
    # Remove unit words
    units = list(AFX_UNIT_MAPPINGS.keys())
    units.sort(key=len, reverse=True)
    unit_pattern = r'^(' + '|'.join(map(re.escape, units)) + r')\.?(?:s)?\s+(?:of\s+)?'
    text = re.sub(unit_pattern, '', text, flags=re.IGNORECASE).strip()
    
    # Remove common preparation adjectives (but preserve if we have "canned")
    if not has_can_container:
        prep_words = [
            'chopped', 'minced', 'sliced', 'diced', 'crushed', 'ground', 'grated', 'shredded',
            'cubed', 'peeled', 'cored', 'seeded', 'julienned', 'halved', 'quartered',
            'beaten', 'sifted', 'melted', 'softened', 'finely', 'coarsely', 'roughly'
        ]
        prep_pattern = r'^(' + '|'.join(map(re.escape, prep_words)) + r')\s+'
        for _ in range(3):
            text = re.sub(prep_pattern, '', text, flags=re.IGNORECASE).strip()
    
    # Remove trailing phrases
    trailing_phrases = [
        r',\s*divided.*$',
        r',\s*or to taste.*$',
        r',\s*plus more.*$',
        r',\s*to taste.*$',
        r',\s*optional.*$'
    ]
    for pattern in trailing_phrases:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE).strip()
    
    return text


def parse_ingredient_for_afx(ingredient_text):
    """
    Parses ingredient text and returns AFX-compatible format.
    
    Returns:
        dict: {
            "name": "butter",
            "quantityList": [{"unit": "COUNT", "amount": 1}]
        }
    """
    # Extract quantity information
    amount = None
    unit = "COUNT"  # Default to COUNT
    
    # Pattern for complex cases: "2 (6 ounce) cans"
    complex_pattern = r'(\d+(?:\s+\d+/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*\((\d+(?:\.\d+)?(?:\s+\d+/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z\s]+)\)\s*([a-zA-Z]+)'
    complex_match = re.search(complex_pattern, ingredient_text)
    
    if complex_match:
        count_str = complex_match.group(1)
        amount_str = complex_match.group(2)
        unit_str = complex_match.group(3).strip().lower()
        
        count = parse_number(count_str)
        item_amount = parse_number(amount_str)
        
        if count and item_amount:
            amount = count * item_amount
            unit = AFX_UNIT_MAPPINGS.get(unit_str, "COUNT")
    else:
        # Pattern for simple cases: "2 cups" or "1 pound"
        simple_pattern = r'(\d+(?:\.\d+)?(?:\s+\d+/\d+)?|[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*([a-zA-Z\s]+?)(?:\s|,|$)'
        simple_match = re.search(simple_pattern, ingredient_text)
        
        if simple_match:
            amount_str = simple_match.group(1)
            unit_str = simple_match.group(2).strip().lower()
            
            normalized_unit = AFX_UNIT_MAPPINGS.get(unit_str)
            if normalized_unit:
                amount = parse_number(amount_str)
                unit = normalized_unit
    
    # Default to 1 if no amount found
    if amount is None:
        amount = 1
    
    # Clean the ingredient name
    name = clean_ingredient_name(ingredient_text)
    if not name:
        name = ingredient_text  # Fallback to original if cleaning fails
    
    return {
        "name": name,
        "quantityList": [
            {
                "unit": unit,
                "amount": amount
            }
        ]
    }


if __name__ == "__main__":
    # Test cases
    test_cases = [
        "2 cups minced onion",
        "2 (6 ounce) cans tomato paste",
        "1 pound ground beef",
        "3 cloves garlic",
        "½ cup water",
        "1 ½ teaspoons salt",
        "butter",
        "2 chicken breasts"
    ]
    
    print("AFX Quantity Parser Test Cases:\n")
    for test in test_cases:
        result = parse_ingredient_for_afx(test)
        print(f"Input: {test}")
        print(f"Output: {result}")
        print()
