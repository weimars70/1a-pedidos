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

    print("--- DEFINITION OF view_pedidos_equipos ---")
    cursor.execute("""
        SELECT view_definition 
        FROM information_schema.views 
        WHERE table_schema = 'public' AND table_name = 'view_pedidos_equipos';
    """)
    row = cursor.fetchone()
    if row:
        print(row[0])
    else:
        print("View not found or definition not available")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
