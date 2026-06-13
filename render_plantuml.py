from plantuml import PlantUML
import os
import sys

# Use online PlantUML server
plantuml = PlantUML(url='http://www.plantuml.com/plantuml/png/')

try:
    # processes() generates PNG files in the same directory as the input files
    plantuml.processes(['usecase.puml'])
    # Check if PNG was generated
    png_file = 'usecase.png'
    if os.path.exists(png_file):
        print(f'Done: {png_file} generated successfully')
    else:
        print('Error: PNG file was not generated')
        sys.exit(1)
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
