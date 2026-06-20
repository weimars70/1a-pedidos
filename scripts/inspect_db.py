import os
import sys

def main():
    # We will try to install psycopg2-binary or pg8000 if not available
    try:
        import psycopg2
    except ImportError:
        import subprocess
        print("psycopg2 not found, installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        import psycopg2

    # Database parameters
    conn = psycopg2.connect(
        host="2.58.80.90",
        port=55433,
        database="unoa",
        user="weymars",
        password="##LosHijos162025?!##"
    )
    cursor = conn.cursor()

    # Query all tables and views containing "pedido"
    print("--- TABLES & VIEWS CONTAINING 'pedido' ---")
    cursor.execute("""
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE '%pedido%'
        ORDER BY table_name;
    """)
    for row in cursor.fetchall():
        print(f"Name: {row[0]}, Type: {row[1]}")

    # Query columns of key views/tables
    targets = ['pedidos', 'pedidos_personal', 'pedidos_equipos', 'estados_pedidos']
    for t in targets:
        print(f"\n--- COLUMNS OF TABLE/VIEW '{t}' ---")
        cursor.execute(f"""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = '{t}'
            ORDER BY ordinal_position;
        """)
        for row in cursor.fetchall():
            print(f"  Column: {row[0]}, Type: {row[1]} (len: {row[2]})")

    # Let's inspect some rows in estados_pedidos to see the statuses
    print("\n--- ROWS IN estados_pedidos ---")
    try:
        cursor.execute("SELECT * FROM estados_pedidos;")
        for row in cursor.fetchall():
            print(row)
    except Exception as e:
        print("Error reading estados_pedidos:", e)

    # Let's inspect if there are views containing 'especial' or 'area'
    print("\n--- TABLES & VIEWS CONTAINING 'especial' OR 'area' ---")
    cursor.execute("""
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND (table_name LIKE '%especial%' OR table_name LIKE '%area%')
        ORDER BY table_name;
    """)
    for row in cursor.fetchall():
        print(f"Name: {row[0]}, Type: {row[1]}")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
