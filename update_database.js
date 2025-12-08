require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addExtraInfo() {
  try {
    console.log('🚀 Agregando información adicional de la cooperativa...\n');

    // Agregar más información a la tabla de configuración
    await pool.query(`
      INSERT INTO configuracion (clave, valor) VALUES
      ('sectores', '7 sectores: Aníbana, Molinos, La Compañía, Santa Margarita, Maitén 1, Maitén 2, La Morera'),
      ('tiempo_corte_programado', 'Entre 30 minutos y 1 hora generalmente'),
      ('tiempo_emergencia', 'Variable según complejidad, puede ser desde 1 hora hasta 6 horas en casos críticos'),
      ('aviso_emergencia', 'Los operadores avisan con aproximadamente 10 minutos de anticipación cuando es posible'),
      ('procedimiento_post_reparacion', 'Después de una reparación, deje correr el agua de su llave por 5 minutos para eliminar posibles partículas'),
      ('subsidio_requisitos', 'Ficha de Protección Social actualizada en la municipalidad y cuentas al día'),
      ('subsidio_monto', 'Aproximadamente $5,000 de descuento mensual'),
      ('subsidio_limite', 'Beneficia consumos hasta 13 metros cúbicos'),
      ('subsidio_beneficiarios', '152 beneficiarios activos actualmente'),
      ('convenio_pago', 'Convenios de pago sin intereses disponibles para casos de sobreconsumo o dificultades económicas. Debe firmarse entre socio y gerente'),
      ('intereses', 'NO se cobran intereses por deuda, corte ni reposición de agua'),
      ('responsabilidad_fugas', 'Fugas después del medidor son responsabilidad del socio. Fugas antes del medidor son responsabilidad de la cooperativa'),
      ('cloro_rango', 'El nivel de cloro se mantiene entre 0.2 y 2.0, normalmente entre 0.7 y 1.7'),
      ('revisiones_diarias', 'El operador realiza revisiones en la mañana, al mediodía y en la tarde (hasta las 17:00)'),
      ('sistema_respaldo', 'Contamos con grupo electrógeno y paneles solares como respaldo. Autonomía mínima de 1 día sin luz'),
      ('historia_cooperativa', 'Fundada en 1968 por aproximadamente 20 socios fundadores para combatir epidemias de tifoidea'),
      ('camaras_corte', 'Sistema de cámaras de corte independientes por sector para minimizar afectación en emergencias'),
      ('cuota_participacion', 'Socios nuevos pagan cuota de participación para equiparar el aporte de socios fundadores'),
      ('lavado_tanque', 'El lavado de tanque y matriz se realiza después de las 23:00 hrs para no afectar el servicio diurno'),
      ('comunicacion_emergencias', 'Avisos por WhatsApp, Facebook y llamadas telefónicas. Comunicación 24/7'),
      ('tipo_reclamos', 'Reclamos más comunes: fugas en vía pública, baja presión, cortes de agua no avisados, boletas no recibidas')
      ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;
    `);
    console.log('✅ Información adicional agregada a "configuracion"');

    console.log('\n✅ ¡Base de datos actualizada exitosamente!');
    console.log('📊 Información agregada:');
    console.log('   - Detalles de los 7 sectores');
    console.log('   - Tiempos de corte y emergencias');
    console.log('   - Información de subsidios');
    console.log('   - Convenios de pago');
    console.log('   - Procedimientos operativos');
    console.log('   - Historia de la cooperativa');
    console.log('   - Sistemas de respaldo y comunicación\n');

  } catch (error) {
    console.error('❌ Error al actualizar base de datos:', error);
  } finally {
    await pool.end();
  }
}

addExtraInfo();
