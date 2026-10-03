# -*- coding: utf-8 -*-
import json
import os

print("Generating ADsP Content Engine...")

# Helper to write JS file
def write_js_file(filepath, var_name, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"// ADsP Master Data File\n// Auto-generated & curated for ADsP Exam\nwindow.{var_name} = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    print(f"Successfully generated {filepath} ({os.path.getsize(filepath):,} bytes)")

