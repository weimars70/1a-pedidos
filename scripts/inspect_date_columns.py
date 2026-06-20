import os
import re

directory = r"d:\unoa2\frontend\src\pages\pedidos"
files = [f for f in os.listdir(directory) if f.endswith('.vue')]

print(f"Encontrados {len(files)} archivos .vue en {directory}:\n")

for file_name in files:
    path = os.path.join(directory, file_name)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar campos de fecha en columns array
    # e.g., field: 'fecha_...' o name: 'fecha_...'
    date_fields = re.findall(r"['\"](fecha_[a-zA-Z0-9_]+)['\"]", content)
    # También buscar campos como 'fecha' o 'created_at' etc.
    other_dates = re.findall(r"['\"](fecha|created_at|updated_at)['\"]", content)
    all_dates = sorted(list(set(date_fields + other_dates)))
    
    if all_dates:
        print(f"Archivo: {file_name}")
        print(f"  Campos de fecha encontrados: {all_dates}")
        
        # Mostrar las líneas de la definición de columnas para estas fechas
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            if any(d in line for d in all_dates) and 'label' in line:
                print(f"    Línea {idx+1}: {line.strip()}")
        print("-" * 50)
