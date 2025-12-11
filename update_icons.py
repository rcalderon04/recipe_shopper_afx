from PIL import Image
import os
import shutil

# Source image
source_path = r"C:/Users/rcald/.gemini/antigravity/brain/8cea5971-2a5f-47e0-9869-c5e209cc9f5d/recipe_shopper_icon_1765407076259.png"
dest_dir = r"c:\Users\rcald\.gemini\antigravity\scratch\recipe_shopper_afx\extension"

# Open the image
img = Image.open(source_path)

# Sizes needed
sizes = [128, 48, 16]

for size in sizes:
    # Resize
    new_img = img.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save to extension folder
    dest_path = os.path.join(dest_dir, f"icon{size}.png")
    new_img.save(dest_path)
    print(f"Saved {dest_path}")

print("Icon update complete!")
