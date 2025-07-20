async function testJoinGame() {
  try {
    // Primero crear un usuario
    const createUserResponse = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com'
      })
    });

    const userData = await createUserResponse.json();
    console.log('Usuario creado:', userData);

    // Crear un juego
    const createGameResponse = await fetch('http://localhost:5001/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.id
      })
    });

    const gameData = await createGameResponse.json();
    console.log('Juego creado:', gameData);

    // Crear otro usuario
    const createUser2Response = await fetch('http://localhost:5001/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser2',
        email: 'test2@example.com'
      })
    });

    const user2Data = await createUser2Response.json();
    console.log('Segundo usuario creado:', user2Data);

    // Unirse al juego
    const joinGameResponse = await fetch('http://localhost:5001/games/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user2Data.id,
        code: gameData.code
      })
    });

    const joinData = await joinGameResponse.json();
    console.log('Respuesta del join:', joinData);

  } catch (error) {
    console.error('Error:', error);
  }
}

testJoinGame(); 