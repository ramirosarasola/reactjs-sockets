const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:5001';

async function testSingleUserGame() {
  console.log('🧪 Probando funcionalidad de usuario único por juego...\n');

  // Crear dos clientes simulando el mismo usuario
  const client1 = io(SERVER_URL);
  const client2 = io(SERVER_URL);

  const username = 'TestUser';
  const gameCode1 = 'TEST1';
  const gameCode2 = 'TEST2';

  return new Promise((resolve) => {
    let step = 0;
    const maxSteps = 4;

    const nextStep = () => {
      step++;
      if (step >= maxSteps) {
        console.log('\n✅ Prueba completada');
        client1.disconnect();
        client2.disconnect();
        resolve();
      }
    };

    // Paso 1: Cliente 1 se une al juego 1
    console.log('📋 Paso 1: Cliente 1 se une al juego 1...');
    client1.emit('join_game', { gameCode: gameCode1, username });

    client1.on('joined_game', (data) => {
      console.log('✅ Cliente 1 unido al juego 1:', data);
      nextStep();
    });

    client1.on('player_list', (players) => {
      console.log('📋 Lista de jugadores en juego 1:', players.length);
    });

    // Paso 2: Cliente 2 se une al juego 2
    setTimeout(() => {
      console.log('\n📋 Paso 2: Cliente 2 se une al juego 2...');
      client2.emit('join_game', { gameCode: gameCode2, username });

      client2.on('joined_game', (data) => {
        console.log('✅ Cliente 2 unido al juego 2:', data);
        nextStep();
      });

      client2.on('player_list', (players) => {
        console.log('📋 Lista de jugadores en juego 2:', players.length);
      });
    }, 1000);

    // Paso 3: Verificar que el cliente 1 fue removido del juego 1
    setTimeout(() => {
      console.log('\n📋 Paso 3: Verificando que cliente 1 fue removido del juego 1...');
      client1.emit('join_game', { gameCode: gameCode1, username });

      client1.on('player_list', (players) => {
        const playerInGame1 = players.find(p => p.username === username);
        if (!playerInGame1) {
          console.log('✅ Cliente 1 fue removido correctamente del juego 1');
        } else {
          console.log('❌ Cliente 1 aún está en el juego 1');
        }
        nextStep();
      });
    }, 2000);

    // Paso 4: Verificar que el cliente 2 está en el juego 2
    setTimeout(() => {
      console.log('\n📋 Paso 4: Verificando que cliente 2 está en el juego 2...');
      client2.emit('join_game', { gameCode: gameCode2, username });

      client2.on('player_list', (players) => {
        const playerInGame2 = players.find(p => p.username === username);
        if (playerInGame2) {
          console.log('✅ Cliente 2 está correctamente en el juego 2');
        } else {
          console.log('❌ Cliente 2 no está en el juego 2');
        }
        nextStep();
      });
    }, 3000);

    // Manejo de errores
    client1.on('error', (error) => {
      console.error('❌ Error en cliente 1:', error);
    });

    client2.on('error', (error) => {
      console.error('❌ Error en cliente 2:', error);
    });
  });
}

// Ejecutar la prueba
testSingleUserGame().then(() => {
  console.log('\n🎉 Prueba de usuario único completada');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error en la prueba:', error);
  process.exit(1);
}); 