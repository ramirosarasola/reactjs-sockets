

async function testMultiplayerFlow() {
  try {
    console.log('🧪 Iniciando prueba de flujo multiplayer...\n');

    // 1. Crear primer usuario
    console.log('1️⃣ Creando primer usuario...');
    const user1Response = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'jugador1',
        email: 'jugador1@test.com'
      })
    });
    const user1 = await user1Response.json();
    console.log('✅ Usuario 1 creado:', user1.username);

    // 2. Crear segundo usuario
    console.log('\n2️⃣ Creando segundo usuario...');
    const user2Response = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'jugador2',
        email: 'jugador2@test.com'
      })
    });
    const user2 = await user2Response.json();
    console.log('✅ Usuario 2 creado:', user2.username);

    // 3. Crear juego con el primer usuario
    console.log('\n3️⃣ Creando juego...');
    const gameResponse = await fetch('http://localhost:5001/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user1.id })
    });
    const game = await gameResponse.json();
    console.log('✅ Juego creado:', game.code);

    // 4. Segundo usuario se une al juego
    console.log('\n4️⃣ Segundo usuario se une al juego...');
    const joinResponse = await fetch('http://localhost:5001/games/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user2.id,
        code: game.code
      })
    });
    const joinedGame = await joinResponse.json();
    console.log('✅ Usuario 2 se unió al juego');

    // 5. Verificar que ambos usuarios están en el juego
    console.log('\n5️⃣ Verificando jugadores en el juego...');
    const gameDetailsResponse = await fetch(`http://localhost:5001/games/${game.id}/details`);
    const gameDetails = await gameDetailsResponse.json();
    console.log('✅ Jugadores en el juego:', gameDetails.players.length);
    gameDetails.players.forEach(player => {
      console.log(`   - ${player.user.username} (${player.user.email})`);
    });

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('📋 Resumen:');
    console.log(`   - Usuario 1: ${user1.username}`);
    console.log(`   - Usuario 2: ${user2.username}`);
    console.log(`   - Código del juego: ${game.code}`);
    console.log(`   - Jugadores en el juego: ${gameDetails.players.length}`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testMultiplayerFlow(); 