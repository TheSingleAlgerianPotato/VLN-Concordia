#!/usr/bin/env python3
import os
import json

def generate_entries(data_dir="data", output_file="entries.json"):
    """
    Scans the data directory to find disability entry folders and their language files,
    then generates a JSON file listing them.
    """
    entries = {}
    if not os.path.isdir(data_dir):
        print(f"Error: Data directory '{data_dir}' not found.")
        return

    print(f"Scanning directory: {data_dir}")
    for entry_name in os.listdir(data_dir):
        entry_path = os.path.join(data_dir, entry_name)
        # Ensure it's a directory and not a hidden directory/file like .gitkeep
        if os.path.isdir(entry_path) and not entry_name.startswith('.'):
            languages = []
            print(f"  Found entry directory: {entry_name}")
            for filename in os.listdir(entry_path):
                # Check if it's a markdown file and follows the lang.md pattern
                if filename.endswith(".md") and '_' not in filename and len(filename.split('.')[0]) == 2:
                    lang_code = filename.split('.')[0]
                    languages.append(lang_code)
                    print(f"    Found language file: {filename} -> lang: {lang_code}")
                elif filename.endswith(".md"):
                     print(f"    Skipping file (does not match lang.md pattern): {filename}")
                else:
                     print(f"    Skipping non-markdown file: {filename}")

            if languages:
                # Sort languages for consistent output
                languages.sort()
                entries[entry_name] = languages
            else:
                print(f"  Skipping directory '{entry_name}' as it contains no valid language files.")
        elif not entry_name.startswith('.'): # Avoid printing warnings for hidden files
             print(f"  Skipping non-directory item: {entry_name}")

    # Sort entries by directory name for consistent output
    sorted_entries = dict(sorted(entries.items()))

    print(f"Writing entries to {output_file}")
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(sorted_entries, f, ensure_ascii=False, indent=4)
        print("Successfully generated entries.json")
    except IOError as e:
        print(f"Error writing to {output_file}: {e}")

if __name__ == "__main__":
    generate_entries()

