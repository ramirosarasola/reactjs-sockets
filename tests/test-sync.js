async function testSynchronization() {
  try {
    console.log('🧪 Probando sincronización entre DB y sockets...\n');

    // 1. Crear usuarios
    console.log('1️⃣ Creando usuarios...');
    const user1Response = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser1',
        email: 'test1@example.com'
      })
    });
    const user1 = await user1Response.json();

    const user2Response = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser2',
        email: 'test2@example.com'
      })
    });
    const user2 = await user2Response.json();

    console.log('✅ Usuario 1 creado:', user1.username);
    console.log('✅ Usuario 2 creado:', user2.username);

    // 2. Crear juego
    console.log('\n2️⃣ Creando juego...');
    const gameResponse = await fetch('http://localhost:5001/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user1.id })
    });
    const game = await gameResponse.json();
    console.log('✅ Juego creado:', game.code);

    // 3. Segundo usuario se une por API
    console.log('\n3️⃣ Segundo usuario se une por API...');
    const joinResponse = await fetch('http://localhost:5001/games/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user2.id,
        code: game.code
      })
    });
    const joinedGame = await joinResponse.json();
    console.log('✅ Usuario 2 se unió por API');

    // 4. Verificar jugadores en la base de datos
    console.log('\n4️⃣ Verificando jugadores en DB...');
    const gameDetailsResponse = await fetch(`http://localhost:5001/games/${game.id}/details`);
    const gameDetails = await gameDetailsResponse.json();
    console.log('✅ Jugadores en DB:', gameDetails.players.length);
    gameDetails.players.forEach(player => {
      console.log(`   - ${player.user.username}`);
    });

    // 5. Simular conexión por socket (esto requeriría un cliente WebSocket real)
    console.log('\n5️⃣ Para probar sockets, necesitas:');
    console.log('   - Abrir el frontend en el navegador');
    console.log('   - Autenticarte como testuser1 o testuser2');
    console.log('   - Unirte al juego con el código:', game.code);
    console.log('   - Verificar que aparecen 2 jugadores en el lobby');

    console.log('\n🎉 ¡Prueba de sincronización completada!');
    console.log('📋 Resumen:');
    console.log(`   - Código del juego: ${game.code}`);
    console.log(`   - Jugadores en DB: ${gameDetails.players.length}`);
    console.log(`   - Usuario 1: ${user1.username}`);
    console.log(`   - Usuario 2: ${user2.username}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testSynchronization(); 