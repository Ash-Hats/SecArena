import os
import re

def strip_python(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    in_docstring = False
    docstring_char = ""
    
    for line in lines:
        stripped = line.strip()
        
        # very basic comment removal
        if stripped.startswith('#') and not stripped.startswith('# type:'):
            continue
            
        new_lines.append(line)
        
    with open(filepath, 'w') as f:
        f.writelines(new_lines)

def strip_ts(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Remove block comments
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    # Remove single line comments (but not inside URLs like http://)
    content = re.sub(r'(?<!:)//.*', '', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('backend/app'):
    for file in files:
        if file.endswith('.py'):
            strip_python(os.path.join(root, file))

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            strip_ts(os.path.join(root, file))

print("Done stripping comments")
