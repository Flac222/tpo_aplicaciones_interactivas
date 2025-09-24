from sqlalchemy import create_engine, inspect, text

# ⚙️ Configuración de conexión
DB_USER = "postgres"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_PORT = "5432"  # Cambiá a 3306 si usás MySQL
DB_NAME = "seeds_back"


# 🧠 Elegí el motor: 'postgresql' o 'mysql'
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 🔌 Crear engine y conectar
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

# 📋 Listar tablas
tables = inspector.get_table_names()
print("Tablas en la base de datos:")
for table in tables:
    print(f"- {table}")

def listar_tablas():
    tables = inspector.get_table_names()
    print("Tablas en la base de datos:")
    for table in tables:
        print(f"- {table}")

def mostrar_contenido(tabla):
    with engine.connect() as conn:
        try:
            result = conn.execute(text(f"SELECT * FROM {tabla} LIMIT 10"))
            rows = result.mappings().all()
            print(f"\nContenido de la tabla '{tabla}':")
            for row in rows:
                print(dict(row))

        except Exception as e:
            print(f"Error al consultar la tabla '{tabla}': {e}")

# 🧪 Ejecución
if __name__ == "__main__":
    listar_tablas()
    tabla_a_mostrar = "usuario"  # Cambiá por la tabla que quieras ver
    mostrar_contenido(tabla_a_mostrar)