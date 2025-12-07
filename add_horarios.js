require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addHorarios() {
  try {
    console.log('📅 Agregando horarios de atención...\n');

    // Crear tabla de configuración
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descripcion VARCHAR(200)
      );
    `);
    console.log('✅ Tabla "configuracion" creada');

    // Insertar horarios
    await pool.query(`
      INSERT INTO configuracion (clave, valor, descripcion) VALUES
      ('horario_atencion', 'Lunes a Viernes - Mañana: 09:00 a 13:00 hrs. - Tarde: 14:00 a 16:45 hrs.', 'Horario de atención al público'),
      ('telefono', '+56 2 1234 5678', 'Teléfono de contacto'),
      ('email', 'contacto@cooperativaagua.cl', 'Correo electrónico de contacto'),
      ('direccion', 'Av. Principal 123, Ciudad', 'Dirección de oficina principal'),
      ('cargo_fijo_base', '5000', 'Cargo fijo mensual base en pesos')
      ON CONFLICT (clave) 
      DO UPDATE SET valor = EXCLUDED.valor, descripcion = EXCLUDED.descripcion;
    `);
    console.log('✅ Horarios y datos de contacto insertados\n');

    // Mostrar datos
    const result = await pool.query('SELECT * FROM configuracion ORDER BY id');
    console.log('📋 Configuración actual:');
    result.rows.forEach(row => {
      console.log(`   ${row.clave}: ${row.valor}`);
    });

    console.log('\n✅ ¡Horarios agregados exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addHorarios();
