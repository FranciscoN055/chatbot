require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando creación de base de datos...\n');

    // Crear tabla de socios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS socios (
        id SERIAL PRIMARY KEY,
        rut VARCHAR(12) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        direccion VARCHAR(200) NOT NULL,
        telefono VARCHAR(15),
        email VARCHAR(100),
        fecha_inscripcion DATE DEFAULT CURRENT_DATE,
        estado VARCHAR(20) DEFAULT 'activo'
      );
    `);
    console.log('✅ Tabla "socios" creada');

    // Crear tabla de medidores
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medidores (
        id SERIAL PRIMARY KEY,
        numero_medidor VARCHAR(20) UNIQUE NOT NULL,
        socio_id INTEGER REFERENCES socios(id),
        fecha_instalacion DATE,
        estado VARCHAR(20) DEFAULT 'activo',
        lectura_inicial INTEGER DEFAULT 0
      );
    `);
    console.log('✅ Tabla "medidores" creada');

    // Crear tabla de lecturas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lecturas (
        id SERIAL PRIMARY KEY,
        medidor_id INTEGER REFERENCES medidores(id),
        periodo VARCHAR(7) NOT NULL,
        lectura_anterior INTEGER NOT NULL,
        lectura_actual INTEGER NOT NULL,
        consumo INTEGER NOT NULL,
        fecha_lectura DATE DEFAULT CURRENT_DATE
      );
    `);
    console.log('✅ Tabla "lecturas" creada');

    // Crear tabla de facturas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS facturas (
        id SERIAL PRIMARY KEY,
        socio_id INTEGER REFERENCES socios(id),
        periodo VARCHAR(7) NOT NULL,
        consumo_m3 INTEGER NOT NULL,
        monto_consumo DECIMAL(10,2) NOT NULL,
        cargo_fijo DECIMAL(10,2) DEFAULT 5000,
        total DECIMAL(10,2) NOT NULL,
        fecha_emision DATE DEFAULT CURRENT_DATE,
        fecha_vencimiento DATE,
        estado VARCHAR(20) DEFAULT 'pendiente'
      );
    `);
    console.log('✅ Tabla "facturas" creada');

    // Crear tabla de pagos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        factura_id INTEGER REFERENCES facturas(id),
        monto DECIMAL(10,2) NOT NULL,
        fecha_pago DATE DEFAULT CURRENT_DATE,
        metodo_pago VARCHAR(50) NOT NULL
      );
    `);
    console.log('✅ Tabla "pagos" creada');

    // Crear tabla de tarifas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarifas (
        id SERIAL PRIMARY KEY,
        tramo_inicio INTEGER NOT NULL,
        tramo_fin INTEGER,
        precio_m3 DECIMAL(10,2) NOT NULL,
        descripcion VARCHAR(100)
      );
    `);
    console.log('✅ Tabla "tarifas" creada\n');

    // Insertar datos de ejemplo
    console.log('📝 Insertando datos de ejemplo...\n');

    // Socios
    await pool.query(`
      INSERT INTO socios (rut, nombre, apellido, direccion, telefono, email) VALUES
      ('12345678-9', 'Juan', 'Pérez', 'Calle Principal 123', '+56912345678', 'juan.perez@email.com'),
      ('98765432-1', 'María', 'González', 'Av. Libertad 456', '+56987654321', 'maria.gonzalez@email.com'),
      ('11223344-5', 'Pedro', 'Ramírez', 'Pasaje Los Robles 789', '+56911223344', 'pedro.ramirez@email.com'),
      ('55667788-9', 'Ana', 'Silva', 'Calle Los Pinos 321', '+56955667788', 'ana.silva@email.com'),
      ('99887766-5', 'Carlos', 'Muñoz', 'Av. Central 654', '+56999887766', 'carlos.munoz@email.com'),
      ('22334455-6', 'Laura', 'Torres', 'Calle Nueva 987', '+56922334455', 'laura.torres@email.com'),
      ('66778899-0', 'Diego', 'Vargas', 'Pasaje El Sol 147', '+56966778899', 'diego.vargas@email.com'),
      ('33445566-7', 'Sofía', 'Rojas', 'Av. Poniente 258', '+56933445566', 'sofia.rojas@email.com'),
      ('77889900-1', 'Roberto', 'Castro', 'Calle Las Flores 369', '+56977889900', 'roberto.castro@email.com'),
      ('44556677-8', 'Valentina', 'Morales', 'Pasaje Norte 741', '+56944556677', 'valentina.morales@email.com')
      ON CONFLICT (rut) DO NOTHING;
    `);
    console.log('✅ 10 socios insertados');

    // Medidores
    await pool.query(`
      INSERT INTO medidores (numero_medidor, socio_id, fecha_instalacion, lectura_inicial) VALUES
      ('MED-001', 1, '2024-01-15', 1000),
      ('MED-002', 2, '2024-01-20', 1500),
      ('MED-003', 3, '2024-02-10', 2000),
      ('MED-004', 4, '2024-02-15', 1200),
      ('MED-005', 5, '2024-03-01', 1800),
      ('MED-006', 6, '2024-03-10', 1600),
      ('MED-007', 7, '2024-04-05', 1400),
      ('MED-008', 8, '2024-04-15', 1700),
      ('MED-009', 9, '2024-05-01', 1900),
      ('MED-010', 10, '2024-05-10', 1300)
      ON CONFLICT (numero_medidor) DO NOTHING;
    `);
    console.log('✅ 10 medidores insertados');

    // Tarifas
    await pool.query(`
      INSERT INTO tarifas (tramo_inicio, tramo_fin, precio_m3, descripcion) VALUES
      (0, 10, 450, 'Consumo básico 0-10 m³'),
      (11, 20, 550, 'Consumo medio 11-20 m³'),
      (21, 30, 700, 'Consumo alto 21-30 m³'),
      (31, NULL, 900, 'Consumo excedente más de 30 m³')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Tarifas insertadas');

    // Lecturas del mes actual
    await pool.query(`
      INSERT INTO lecturas (medidor_id, periodo, lectura_anterior, lectura_actual, consumo) VALUES
      (1, '2025-12', 1000, 1015, 15),
      (2, '2025-12', 1500, 1523, 23),
      (3, '2025-12', 2000, 2012, 12),
      (4, '2025-12', 1200, 1228, 28),
      (5, '2025-12', 1800, 1818, 18),
      (6, '2025-12', 1600, 1610, 10),
      (7, '2025-12', 1400, 1435, 35),
      (8, '2025-12', 1700, 1720, 20),
      (9, '2025-12', 1900, 1908, 8),
      (10, '2025-12', 1300, 1325, 25)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Lecturas de diciembre 2025 insertadas');

    // Facturas
    await pool.query(`
      INSERT INTO facturas (socio_id, periodo, consumo_m3, monto_consumo, cargo_fijo, total, fecha_vencimiento, estado) VALUES
      (1, '2025-12', 15, 8250, 5000, 13250, '2025-12-25', 'pendiente'),
      (2, '2025-12', 23, 13500, 5000, 18500, '2025-12-25', 'pendiente'),
      (3, '2025-12', 12, 6650, 5000, 11650, '2025-12-25', 'pendiente'),
      (4, '2025-12', 28, 16550, 5000, 21550, '2025-12-25', 'pendiente'),
      (5, '2025-12', 18, 10100, 5000, 15100, '2025-12-25', 'pagada'),
      (6, '2025-12', 10, 4500, 5000, 9500, '2025-12-25', 'pagada'),
      (7, '2025-12', 35, 27200, 5000, 32200, '2025-12-25', 'pendiente'),
      (8, '2025-12', 20, 11500, 5000, 16500, '2025-12-25', 'pendiente'),
      (9, '2025-12', 8, 3600, 5000, 8600, '2025-12-25', 'pagada'),
      (10, '2025-12', 25, 14550, 5000, 19550, '2025-12-25', 'pendiente')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Facturas de diciembre 2025 insertadas');

    // Pagos
    await pool.query(`
      INSERT INTO pagos (factura_id, monto, fecha_pago, metodo_pago) VALUES
      (5, 15100, '2025-12-05', 'Transferencia'),
      (6, 9500, '2025-12-03', 'Efectivo'),
      (9, 8600, '2025-12-06', 'Tarjeta')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Pagos insertados\n');

    console.log('🎉 ¡Base de datos configurada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('   - 10 socios registrados');
    console.log('   - 10 medidores instalados');
    console.log('   - 4 tramos de tarifas');
    console.log('   - 10 lecturas del mes actual');
    console.log('   - 10 facturas generadas');
    console.log('   - 3 pagos registrados\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
