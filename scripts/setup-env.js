#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variables de entorno para TutiFruti Frontend...\n');

const envExamplePath = path.join(__dirname, '..', 'env.example');
const envPath = path.join(__dirname, '..', '.env');

// Verificar si ya existe el archivo .env
if (fs.existsSync(envPath)) {
  console.log('⚠️  El archivo .env ya existe.');
  console.log('   Si quieres sobrescribirlo, elimínalo manualmente y ejecuta este script nuevamente.\n');
  process.exit(0);
}

// Leer el archivo de ejemplo
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ No se encontró el archivo env.example');
  process.exit(1);
}

try {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Crear el archivo .env
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Archivo .env creado exitosamente!');
  console.log('📝 Ubicación:', envPath);
  console.log('\n📋 Variables configuradas:');
  console.log('   - VITE_API_BASE_URL=http://localhost:5001');
  console.log('   - VITE_SOCKET_URL=http://localhost:5001');
  console.log('   - VITE_NODE_ENV=development');
  console.log('\n💡 Para producción, edita el archivo .env y cambia las URLs.');
  console.log('📖 Consulta ENVIRONMENT_SETUP.md para más información.\n');

} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
  process.exit(1);
} 