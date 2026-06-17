import zlib
import base64
import urllib.request
import os

def encode_plantuml(text):
    """Encode PlantUML text to URL-safe format."""
    # 1. Encode to UTF-8
    data = text.encode('utf-8')
    # 2. Compress with raw deflate (window bits = -15)
    compressed = zlib.compress(data, 9)
    # Remove zlib header (2 bytes) and checksum (4 bytes)
    compressed = compressed[2:-4]
    # 3. Standard Base64
    std_b64 = base64.b64encode(compressed).decode('ascii')
    # 4. PlantUML custom alphabet: + -> -, / -> _
    # Actually PlantUML uses: 0-9A-Za-z+-  (where ~ replaces backtick)
    # The correct transform: standard b64 -> plantuml b64
    # A-Z a-z 0-9 are kept, + -> -, / -> _
    transform = str.maketrans('+/', '-_')
    plant_b64 = std_b64.rstrip('=').translate(transform)
    return plant_b64

# Read PlantUML file
with open('usecase.puml', 'r', encoding='utf-8') as f:
    text = f.read()

print(f'PlantUML text length: {len(text)}')

# Try using plantuml package with server
try:
    from plantuml import PlantUML
    # Try with local server or direct HTTP
    # The package expects a JAR or server URL
    # Let's try to use the server URL correctly
    plantuml = PlantUML(url='http://www.plantuml.com/plantuml/png/')
    plantuml.processes(['usecase.puml'])
    if os.path.exists('usecase.png'):
        print('Done: usecase.png generated via plantuml package')
        exit(0)
except Exception as e:
    print(f'Package method failed: {e}')

# Fallback: manual encode and download
print('Trying manual encode + download...')
encoded = encode_plantuml(text)
url = f'http://www.plantuml.com/plantuml/png/{encoded}'
print(f'URL length: {len(url)}')
print(f'URL (first 100 chars): {url[:100]}...')

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = response.read()
        with open('usecase.png', 'wb') as f:
            f.write(data)
        print(f'Done: usecase.png generated ({len(data)} bytes)')
except Exception as e:
    print(f'Manual download failed: {e}')
    print('Please manually render the PlantUML code using http://www.plantuml.com/plantuml/')
    print('PlantUML code:')
    print(text)
