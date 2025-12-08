require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDatabase() {
  try {
    const result = await pool.query(`
      SELECT clave, valor 
      FROM configuracion 
      WHERE clave LIKE '%subsidio%' 
      OR clave LIKE '%sector%'
      LIMIT 10
    `);
    
    console.log('📊 Datos en configuracion:');
    console.log(result.rows);
    
    const count = await pool.query('SELECT COUNT(*) FROM configuracion');
    console.log(`\n📈 Total de registros: ${count.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
