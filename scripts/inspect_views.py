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

    views = ['view_pedidos_equipos', 'view_pedidos_equipos_new', 'view_pedidos_equipos_valores']
    for v in views:
        print(f"\n--- COLUMNS OF VIEW '{v}' ---")
        try:
            cursor.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{v}'
                ORDER BY ordinal_position;
            """)
            for row in cursor.fetchall():
                print(row)
        except Exception as e:
            print("Error:", e)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
