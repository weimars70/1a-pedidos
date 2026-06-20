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

    print("--- ROWS IN pedidos_equipos (sample) ---")
    cursor.execute("""
        SELECT pe.id, pe.id_pedido, pe.estado, ep.nombre, ep.area, pe.valor_servicio
        FROM pedidos_equipos pe
        LEFT JOIN estados_pedidos ep ON ep.id = pe.estado
        LIMIT 10;
    """)
    for row in cursor.fetchall():
        print(row)

    print("\n--- COUNT OF ROW BY ESTADO IN pedidos_equipos ---")
    cursor.execute("""
        SELECT pe.estado, ep.nombre, COUNT(*)
        FROM pedidos_equipos pe
        LEFT JOIN estados_pedidos ep ON ep.id = pe.estado
        GROUP BY pe.estado, ep.nombre;
    """)
    for row in cursor.fetchall():
        print(row)

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
