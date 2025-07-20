async function testConnectivity() {
  try {
    console.log('🧪 Probando conectividad con el backend...\n');

    // 1. Health check
    console.log('1️⃣ Health check...');
    try {
      const healthResponse = await fetch('http://localhost:5001/health');
      const health = await healthResponse.json();
      console.log('✅ Backend respondiendo:', health);
    } catch (error) {
      console.error('❌ Backend no responde:', error.message);
      return;
    }

    // 2. Crear usuario de prueba
    console.log('\n2️⃣ Creando usuario de prueba...');
    const userResponse = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'connectivitytest',
        email: 'connectivity@test.com'
      })
    });
    const user = await userResponse.json();
    console.log('✅ Usuario creado:', user.username);

    // 3. Crear juego
    console.log('\n3️⃣ Creando juego...');
    const gameResponse = await fetch('http://localhost:5001/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    const game = await gameResponse.json();
    console.log('✅ Juego creado:', game.code);

    // 4. Verificar detalles del juego
    console.log('\n4️⃣ Verificando detalles del juego...');
    const gameDetailsResponse = await fetch(`http://localhost:5001/games/${game.id}/details`);
    const gameDetails = await gameDetailsResponse.json();
    console.log('✅ Detalles del juego:');
    console.log(`   - Código: ${gameDetails.code}`);
    console.log(`   - Jugadores: ${gameDetails.players.length}`);
    gameDetails.players.forEach(player => {
      console.log(`   - ${player.user.username}`);
    });

    console.log('\n🎉 ¡Conectividad verificada!');
    console.log('📋 Para probar en el frontend:');
    console.log(`   - Código del juego: ${game.code}`);
    console.log(`   - Usuario: ${user.username}`);
    console.log(`   - Email: ${user.email}`);

  } catch (error) {
    console.error('❌ Error en la prueba de conectividad:', error);
  }
}

testConnectivity(); 