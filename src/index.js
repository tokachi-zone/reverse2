(() => {
  /* GUI */
  const size = 8;
  const scale = 4;
  const px = 24;
  const mouse = {
    x: 0,
    y: 0,
    selecting: false,
  };

  /* Custom */
  const apply_stage_template_pattern = (stage) => {
    const length = stage.length;

    for (let y = 0; y < 3; y++) {
      stage[y] = stage[y].map((_, x) => {
        return { color: '#00f', height: (x + y % 2) % 2 };
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

  const render_cui = (stage) => {
    const style_props = [];
    console.log(stage.map((line) =>
      line.map(({ color, height }) => {
        style_props.push(`color: ${height === 0 ? 'gray' : color};`);
        return height > 0 && color ? `%c${height}` : '%c0'
      }).join(' ')
    ).join('\n'), ...style_props);
  }

  const render_gui = (context, stage) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    stage.forEach((line, y) => {
      // console.group();
      line.forEach((cell, x) => {
        const dx = x * px;
        const dy = y * px;

        // cell
        context.beginPath();
        context.fillStyle = (x + y) % 2 ? '#ddd' : '#eee';
        context.rect(dx, dy, px, px);
        context.fill();

        // stone
        if (cell.height > 0) {
          context.fillStyle = x === mouse.x && y === mouse.y ? '#c00' : cell.color;
          context.beginPath();
          context.arc(dx + px / 2, dy + px / 2, (px / 2) * 0.7, 0, 2 * Math.PI);
          context.fill();

          // height
          context.beginPath();
          context.textAlign = 'center';
          context.baseLine = 'bottom';
          context.font = `${px * 0.6}px Roboto`;
          context.fillStyle = 'white';
          context.fillText(cell.height, dx + 12, dy + px - 7);
        }
      });
      // console.groupEnd();
    });
  }

  const move = (stage, x, y, dx, dy) => {
    const [nx, ny] = [[x + dx], [y + dy]];
    if (ny < 0 || ny > 7 || nx < 0 || nx > 7) {
      console.log('範囲外への移動はできません');
      return;
    }

    // console.log(x, y, dx, dy, nx, ny);
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
  // render_cui(game_stage);
  render_gui(context, game_stage);

  // document.querySelector('button').addEventListener('click', () => {
  //   console.clear();
  //   move(game_stage);
  //   // render_cli(game_stage);
  //   render_gui(context, game_stage);
  // });

  canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
    if (mouse.selecting) return;
    mouse.x = Math.floor(clientX / px / scale);
    mouse.y = Math.floor(clientY / px / scale);
    render_gui(context, game_stage);
  });

  canvas.addEventListener('click', () => {
    mouse.selecting = !mouse.selecting;
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
