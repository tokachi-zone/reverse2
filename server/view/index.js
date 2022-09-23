(() => {
  const socket = io();
  const name = document.querySelector('#name');
  const createButton = document.querySelector('#createRoom');
  const refreshButton = document.querySelector('#refreshRoom');

  const elm = (kind) => document.createElement(kind);

  const updateRooms = ({ rooms }) => {
    const rawRoot = document.querySelector('#roomList');
    const cloneRoot = rawRoot.cloneNode(false);
    rawRoot.parentNode.replaceChild(cloneRoot, rawRoot);

    if (Object.entries(rooms).length === 0) {
      // cloneRoot.textContent = 'No rooms';
      const div = elm('div');
      div.textContent = 'No rooms';
      div.style = `
        margin-top: 10px;
      `;
      cloneRoot.appendChild(div);
      return;
    }

    for (const [_, room] of Object.entries(rooms)) {
      const { firstPlayer, secondPlayer } = room;
      const isOwned = firstPlayer.id === socket.id;

      const player = (label) => {
        const div = elm('div');
        div.textContent = label;
        div.style = `
          font-size: 15px;
          color: #222;
        `;
        return div;
      }

      const grid = elm('div');
      grid.style = `
        background: #ccc;
        padding: 10px;
        border-radius: 4px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        width: 340px;
        margin: 10px 0;
      `;

      const playerContainer = elm('div');
      playerContainer.appendChild(player(`1P: ${firstPlayer.name || 'Unknown'}`));
      playerContainer.appendChild(player(`2P: ${secondPlayer ? secondPlayer.name ? secondPlayer.name : 'Unknown' : '-'}`));

      const actionButton = elm('button');
      actionButton.textContent = isOwned ? 'Delete' : 'Join';

      actionButton.style = `
        background: ${isOwned? 'gray' : '#135CED'};
        color: white;
        border-radius: 4px;
        border: none;
        cursor: pointer;
      `;

      grid.appendChild(playerContainer);
      grid.appendChild(actionButton);
      cloneRoot.appendChild(grid);

      actionButton.addEventListener('click', () => {
        const isExist = new Date().getTime() - room.timestamp <= room.lifetime;

        if (!isExist) {
          alert('その部屋は存在しません');
          return;
        }

        if (isOwned && confirm('Are you sure to delete this room?')) {
          socket.emit('delete-room', { id: socket.id });
          return;
        }

        if (confirm('Are you sure to join to this room?')) {
          socket.emit('join-room', {
            roomId: firstPlayer.id,
            playerId: socket.id,
            playerName: name.value || null,
          });
        }
      });
    }
  }

  socket.on('connect', () => {
    // socket.emit('get-rooms');

    // Socket Events
    socket.on('send-state', ({ state, mode }) => {
      switch (mode) {
        default: {
          break;
        }

        case 'update-rooms': {
          console.log('state', state);
          updateRooms(state);
          break;
        }
      }
    })

    // DOM Events
    createButton.addEventListener('click', () => {
      socket.emit('create-new-room', {
        id: socket.id,
        name: name.value || null,
      });
    });

    refreshButton.addEventListener('click', () => {
      socket.emit('get-rooms');
    })
  })
})();
