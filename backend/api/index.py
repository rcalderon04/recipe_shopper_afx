import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS
from recipe_parser import RecipeParser
from quantity_parser import parse_ingredient_for_afx

app = Flask(__name__)
# Enable CORS for all origins (needed for Chrome extension)
CORS(app, resources={r"/*": {"origins": "*"}})

recipe_parser = RecipeParser()


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


@app.route('/parse-recipe', methods=['POST'])
def parse_recipe():
    """
    Parse recipe from URL and return AFX-compatible ingredient list.
    
    Request body:
        {
            "url": "https://example.com/recipe"
        }
    
    Response:
        {
            "ingredients": [
                {
                    "name": "butter",
                    "quantityList": [{"unit": "COUNT", "amount": 1}]
                },
                ...
            ],
            "recipe_title": "Chicken Recipe"
        }
    """
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
        
        # Parse the recipe
        result = recipe_parser.parse(url)
        raw_ingredients = result.get('ingredients', [])
        recipe_title = result.get('title', 'Recipe')
        
        if not raw_ingredients:
            return jsonify({
                "error": "No ingredients found",
                "recipe_title": recipe_title
            }), 404
        
        # Convert to AFX format
        afx_ingredients = []
        for ingredient_text in raw_ingredients:
            afx_ingredient = parse_ingredient_for_afx(ingredient_text)
            afx_ingredients.append(afx_ingredient)
        
        return jsonify({
            "ingredients": afx_ingredients,
            "recipe_title": recipe_title
        }), 200
        
    except Exception as e:
        print(f"Error parsing recipe: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("Starting Recipe Parser API on http://localhost:5000")
    print("Endpoints:")
    print("  GET  /health - Health check")
    print("  POST /parse-recipe - Parse recipe from URL")
    app.run(debug=True, host='0.0.0.0', port=5000)
