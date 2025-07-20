const fetch = require('node-fetch');

async function testSimple() {
  try {
    console.log('🧪 Test simple de sincronización...\n');

    // 1. Crear un usuario
    console.log('1️⃣ Creando usuario...');
    const userResponse = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'simpleuser',
        email: 'simple@test.com'
      })
    });
    const user = await userResponse.json();
    console.log('✅ Usuario creado:', user.username);

    // 2. Crear juego
    console.log('\n2️⃣ Creando juego...');
    const gameResponse = await fetch('http://localhost:5001/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    const game = await gameResponse.json();
    console.log('✅ Juego creado:', game.code);

    // 3. Verificar jugadores
    console.log('\n3️⃣ Verificando jugadores...');
    const gameDetailsResponse = await fetch(`http://localhost:5001/games/${game.id}/details`);
    const gameDetails = await gameDetailsResponse.json();
    console.log('✅ Jugadores en DB:', gameDetails.players.length);
    gameDetails.players.forEach(player => {
      console.log(`   - ${player.user.username} (${player.user.email})`);
    });

    console.log('\n🎉 ¡Test completado!');
    console.log('📋 Para probar en el frontend:');
    console.log(`   - Código del juego: ${game.code}`);
    console.log(`   - Usuario: ${user.username}`);
    console.log(`   - Email: ${user.email}`);

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

testSimple(); 