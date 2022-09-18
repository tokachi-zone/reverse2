(() => {
  /* Params */
  const size = 8;
  const scale = 4;
  const px = 24;

  const game = {
    mode: 'play',
  };

  const mouse = {
    x: 0,
    y: 0,
    selecting: false,
  };

  /* Temporal */
  const apply_stage_template_pattern = (stage) => {
    const length = stage.length;

    for (let y = 0; y < 3; y++) {
      stage[y] = stage[y].map((_, x) => {
        return { color: '#00e', height: (x + y % 2) % 2 };
      })
    }

    for (let y = length - 3; y < length; y++) {
      stage[y] = stage[y].map((_, x) => {
        return { color: '#0b0', height: (x + (y % 2)) % 2 };
      })
    }

    return stage;
  }

  /* Base */
  const init_game_stage = (size) => {
    return new Array(size).fill().map(() => {
      return new Array(size).fill({
        color: null,
        height: 0,
      });
    });
  }

  const draw_stone_and_level = (level, x, y) => {
    context.beginPath();
    context.arc(x + px / 2, y + px / 2, (px / 2) * 0.7, 0, 2 * Math.PI);
    context.fill();

    // height level
    context.beginPath();
    context.textAlign = 'center';
    context.baseLine = 'bottom';
    context.font = `${px * 0.6}px Roboto`;
    context.fillStyle = 'white';
    context.fillText(level, x + 12, y + px - 7);
  }

  const render_gui = (context, stage) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    stage.forEach((line, y) => {
      line.forEach((cell, x) => {
        const dx = x * px;
        const dy = y * px;
        const selecting = x === mouse.x && y === mouse.y;

        // cell
        context.beginPath();
        context.fillStyle = (x + y) % 2 ? '#ddd' : '#eee';
        context.rect(dx, dy, px, px);
        context.fill();

        if (game.mode === 'put' && selecting) {
          context.fillStyle = '#333';
          draw_stone_and_level(document.querySelector('input').value, dx, dy);
        }

        if (game.mode === 'remove' && selecting) {
          context.fillStyle = 'red';
          draw_stone_and_level('!', dx, dy);
        }

        // stone
        if (cell.height > 0) {
          if (selecting && game.mode !== 'play') return;
          context.fillStyle = selecting && game.mode === 'play' ? '#c00' : cell.color;
          draw_stone_and_level(cell.height, dx, dy);
        }
      });
    });

    if (game.mode !== 'play') {
      context.fillStyle = 'rgba(255, 255, 255, 0.6)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  const move = (stage, x, y, dx, dy) => {
    const [nx, ny] = [[x + dx], [y + dy]];
    if (ny < 0 || ny > 7 || nx < 0 || nx > 7) {
      alert('範囲外への移動はできません');
      return;
    }

    const next = stage[ny][nx];
    console.log(next.height);

    if (next.height > 0) {
      if (next.color === stage[y][x].color) {
        // merge
        console.log('merge');
        stage[y + dy][x+ dx] = {
          color: stage[y][x].color,
          height: next.height + stage[y][x].height,
        };
      } else {
        // kill
        console.log('kill');
        stage[y + dy][x+ dx] = {
          color: stage[y][x].color,
          height: stage[y][x].height,
        };
      }

      stage[y][x] = {
        color: null,
        height: 0,
      };
    } else {
      stage[y + dy][x+ dx] = {
        color: stage[y][x].color,
        height: stage[y][x].height,
      };

      stage[y][x] = {
        color: null,
        height: 0,
      };
    }

    console.log('end');
    return stage;
  }

  const canvas = document.querySelector('canvas');
  const context = canvas.getContext('2d');
  canvas.width = size * px * scale;
  canvas.height = size * px * scale;
  context.scale(scale, scale);

  let game_stage = init_game_stage(size);
  apply_stage_template_pattern(game_stage);
  render_gui(context, game_stage);

  /* events */
  const toggle_put_mode = (target) => {
    if (game.mode !== 'play' && game.mode !== 'put') return;
    game.mode = game.mode === 'play' ? 'put' : 'play';
    target.innerText = game.mode === 'play' ? '設置' : 'キャンセル';
  }

  const toggle_remove_mode = (target) => {
    if (game.mode !== 'play' && game.mode !== 'remove') return;
    game.mode = game.mode === 'play' ? 'remove' : 'play';
    target.innerText = game.mode === 'play' ? '削除' : 'キャンセル';
  }

  canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
    if (mouse.selecting) return;
    mouse.x = Math.floor(clientX / px / scale);
    mouse.y = Math.floor(clientY / px / scale);
    render_gui(context, game_stage);
  });

  canvas.addEventListener('click', () => {
    if (game.mode === 'play') {
      mouse.selecting = !mouse.selecting;
      return;
    }

    if (game.mode === 'put') {
      game_stage[mouse.y][mouse.x] = {
        color: document.querySelector('select').value,
        height: Number(document.querySelector('input').value),
      };
  
      toggle_put_mode(document.querySelector('#put'));
      return;
    }

    if (game.mode === 'remove') {
      game_stage[mouse.y][mouse.x] = {
        color: null,
        height : 0,
      };

      toggle_remove_mode(document.querySelector('#remove'));
      return;
    }

    render_gui(context, game_stage);
  });

  document.querySelector('#put').addEventListener('click', ({ target }) => {
    mouse.selecting = false;
    toggle_put_mode(target);
    render_gui(context, game_stage);
  });

  document.querySelector('#remove').addEventListener('click', ({ target }) => {
    mouse.selecting = false;
    toggle_remove_mode(target);
    render_gui(context, game_stage);
  });

  document.querySelector('#reset').addEventListener('click', () => {
    game_stage = init_game_stage(size);
    apply_stage_template_pattern(game_stage);
    render_gui(context, game_stage);
  });

  document.querySelector('#clear').addEventListener('click', () => {
    game_stage = game_stage.map(() => {
      return new Array(size).fill().map(() => {
        return {
          color: null,
          height: 0,
        };
      });
    });
    render_gui(context, game_stage);
  });

  document.addEventListener('keydown', ({ key }) => {
    if (!mouse.selecting) return;
    // console.log('key', key);

    switch (key.toLocaleLowerCase()) {
      case 'w': {
        move(game_stage, mouse.x, mouse.y, 0, -1);
        mouse.y -= 1;
        break;
      }

      case 'a': {
        move(game_stage, mouse.x, mouse.y, -1, 0);
        mouse.x -= 1;
        break;
      }

      case 's': {
        move(game_stage, mouse.x, mouse.y, 0, 1);
        mouse.y += 1;
        break;
      }

      case 'd': {
        move(game_stage, mouse.x, mouse.y, 1, 0);
        mouse.x += 1;
        break;
      }
    }

    render_gui(context, game_stage);
  })
})();
