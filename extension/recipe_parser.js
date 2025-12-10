/**
 * Recipe Parser - JavaScript version
 * Extracts recipe ingredients and title from HTML content
 */

class RecipeParser {
    // No constructor needed

    /**
     * Extracts recipe title from JSON-LD or HTML
     */
    extractRecipeTitle(html) {
        // Try JSON-LD first
        const jsonLdScripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

        if (jsonLdScripts) {
            for (const script of jsonLdScripts) {
                try {
                    const jsonText = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                    const data = JSON.parse(jsonText);

                    // Handle single object
                    if (data['@type'] === 'Recipe' && data.name) {
                        return data.name;
                    }

                    // Handle @graph array
                    if (data['@graph']) {
                        for (const node of data['@graph']) {
                            if (node['@type'] === 'Recipe' && node.name) {
                                return node.name;
                            }
                        }
                    }
                } catch (e) {
                    // Continue to next script
                }
            }
        }

        // Fallback to HTML title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            return this.decodeHtml(titleMatch[1].trim());
        }

        return 'Recipe';
    }

    /**
     * Extracts ingredients from JSON-LD
     */
    extractIngredientsJsonLd(html) {
        const jsonLdScripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

        if (!jsonLdScripts) {
            return [];
        }

        for (const script of jsonLdScripts) {
            try {
                const jsonText = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                const data = JSON.parse(jsonText);

                // Handle single Recipe object
                if (data['@type'] === 'Recipe' && data.recipeIngredient) {
                    return data.recipeIngredient;
                }

                // Handle @graph array
                if (data['@graph']) {
                    for (const node of data['@graph']) {
                        if (node['@type'] === 'Recipe' && node.recipeIngredient) {
                            return node.recipeIngredient;
                        }
                    }
                }
            } catch (e) {
                // Continue to next script
            }
        }

        return [];
    }

    /**
     * Fallback: Extract ingredients from HTML
     */
    extractIngredientsHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const ingredients = [];

        // Find lists with "ingredient" in class or id
        const lists = doc.querySelectorAll('ul, ol');
        for (const list of lists) {
            const classes = list.className.toLowerCase();
            const id = (list.id || '').toLowerCase();

            if (classes.includes('ingredient') || id.includes('ingredient')) {
                const items = list.querySelectorAll('li');
                for (const item of items) {
                    const text = item.textContent.trim().replace(/\s+/g, ' ');
                    if (text) {
                        ingredients.push(text);
                    }
                }
                if (ingredients.length > 0) {
                    return ingredients;
                }
            }
        }

        // Try finding divs with ingredient classes
        const divs = doc.querySelectorAll('div');
        for (const div of divs) {
            const classes = div.className.toLowerCase();
            const id = (div.id || '').toLowerCase();

            if (classes.includes('ingredient') || id.includes('ingredient')) {
                const items = div.querySelectorAll('li');
                if (items.length > 0) {
                    for (const item of items) {
                        const text = item.textContent.trim().replace(/\s+/g, ' ');
                        if (text) {
                            ingredients.push(text);
                        }
                    }
                    if (ingredients.length > 0) {
                        return ingredients;
                    }
                }
            }
        }

        return ingredients;
    }

    /**
     * Decode HTML entities
     */
    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    /**
     * Main parse function
     * @param {string} html - The HTML content to parse
     */
    async parse(html) {
        if (!html) {
            return { ingredients: [], title: '' };
        }

        console.log('[RecipeParser] Extracting recipe title...');
        const title = this.extractRecipeTitle(html);

        console.log('[RecipeParser] Attempting JSON-LD extraction...');
        let ingredients = this.extractIngredientsJsonLd(html);

        if (!ingredients || ingredients.length === 0) {
            console.log('[RecipeParser] JSON-LD failed. Attempting HTML fallback...');
            ingredients = this.extractIngredientsHtml(html);
        }

        return {
            ingredients: ingredients,
            title: title
        };
    }
}

// Export for use in panel.js
window.RecipeParser = RecipeParser;
