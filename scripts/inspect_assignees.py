import psycopg2

def main():
    conn = psycopg2.connect(
        host="2.58.80.90",
        port=55433,
        database="unoa",
        user="weymars",
        password="##LosHijos162025?!##"
    )
    cursor = conn.cursor()

    print("--- COLUMNS OF TABLE 'pedidos_asignados_equipos' ---")
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_asignados_equipos'
        ORDER BY ordinal_position;
    """)
    for row in cursor.fetchall():
        print(row)

    print("\n--- SAMPLE ROWS FROM 'pedidos_asignados_equipos' ---")
    try:
        cursor.execute("SELECT * FROM pedidos_asignados_equipos LIMIT 10;")
        for row in cursor.fetchall():
            print(row)
    except Exception as e:
        print("Error:", e)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
