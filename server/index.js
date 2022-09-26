const { response } = require('express');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io   = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

const state = {
  rooms: {},
};

// Utils
const Ok = () => true;

const Err = (msg = null) => {
  if (msg) console.log('🚨', msg);
  return false;
} 

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class Room {
  constructor(player, lifetime) {
    this.firstPlayer = player;
    this.secondPlayer = null;
    this.timestamp = new Date().getTime();
    this.lifetime = lifetime;
  }

  isExist() {
    const pastTime = new Date().getTime() - this.timestamp;
    return pastTime <= this.lifetime;
  }
}

const createNewRoom = (player) => {
  if (state.rooms[player.id]) return Err('Your room is already exist.');
  state.rooms[[player.id]] = new Room(player, 1000 * 60 * 5);
  return Ok();
}

// Server
app.use(express.static(`${__dirname}/view`));

app.get('/' , (_, response) => {
  response.sendFile('index.html');
});

app.get('/game', (_, response) => {
  response.sendFile('game/index.html');
});

io.on('connection', (socket) => {
  // for ALL player
  socket.on('create-new-room', ({ id, name }) => {
    if (createNewRoom(new Player(id, name))) {
      io.emit('send-state', { state, mode: 'update-rooms' })
    }
  });

  socket.on('delete-room', ({ id }) => {
    if (state.rooms[id]) delete state.rooms[id];
    io.emit('send-state', { state, mode: 'update-rooms' });
  });

  socket.on('join-room', ({ roomId, playerId, playerName }) => {
    state.rooms[roomId].secondPlayer = new Player(playerId, playerName);
    io.emit('send-state', { state, mode: 'update-rooms' });
  });

  // for ONLY sender
  socket.on('get-rooms', () => {
    if (!state.rooms) return;

    for (const [key, room] of Object.entries(state.rooms)) {
      if (room.isExist()) continue;
      delete state.rooms[key];
    }

    socket.emit('send-state', { state, mode: 'update-rooms' });
  });
});

http.listen(PORT, console.log(`⚡ Listening on https://localhost:${PORT}`));
