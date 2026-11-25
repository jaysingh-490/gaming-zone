const gameArea = document.getElementById("gameArea");
const gameScreen = document.getElementById("gameScreen");
const gameTitle = document.getElementById("gameTitle");

let activeGame = null;
let gameTimers = [];
let keyHandler = null;

function addTimer(timer) {
    gameTimers.push(timer);
}

function clearGameResources() {
    gameTimers.forEach(timer => {
        clearInterval(timer);
        clearTimeout(timer);
    });

    gameTimers = [];

    if (keyHandler) {
        document.removeEventListener("keydown", keyHandler);
        keyHandler = null;
    }
}

function openGame(game) {
    clearGameResources();
    activeGame = game;

    gameScreen.style.display = "block";
    gameScreen.scrollIntoView({ behavior: "smooth" });

    const names = {
        snake: "🐍 Snake Game",
        memory: "🧠 Memory Card Game",
        car: "🏎‍🟀 Car Racing",
        pong: "🏓 Ping Pong Game",
        space: "🚀 Space Shooter",
        tic: "❌ Tic-Tac-Toe",
        puzzle: "🧩 Puzzle Game"
    };

    gameTitle.textContent = names[game];
    showGameCountdown(game);
}

function showGameCountdown(game) {
    const startFunctions = {
        snake: startSnake,
        memory: startMemory,
        car: startCar,
        pong: startPong,
        space: startSpace,
        tic: startTicTacToe,
        puzzle: startPuzzle
    };

    const steps = ["3", "2", "1", "READY!", "GO!"];
    let index = 0;

    gameArea.innerHTML = `
        <div style="min-height:260px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;background:#080d16;
        border:1px solid #00ff99;border-radius:16px;margin:16px auto;
        padding:24px;color:white;text-align:center;">

            <p style="color:#00ff99;font-size:18px;letter-spacing:3px;">
                GET READY!
            </p>

            <div id="countdownNumber"
            style="font-size:72px;font-weight:900;color:#00ff99;">
                3
            </div>

            <p style="color:#b8c7d9;">Game starts in a moment...</p>
        </div>
    `;

    function nextStep() {
        if (activeGame !== game) return;

        index++;

        if (index >= steps.length) {
            startFunctions[game]();
            return;
        }

        const countdownNumber = document.getElementById("countdownNumber");
        if (!countdownNumber) return;

        countdownNumber.textContent = steps[index];

        countdownNumber.style.color =
            steps[index] === "GO!" ? "#ffffff" : "#00ff99";

        const delay = steps[index] === "READY!" ? 650 : 900;

        addTimer(setTimeout(nextStep, delay));
    }

    addTimer(setTimeout(nextStep, 900));
}

function closeGame() {
    clearGameResources();
    activeGame = null;

    gameScreen.style.display = "none";
    gameArea.innerHTML = "";

    document.getElementById("games").scrollIntoView({
        behavior: "smooth"
    });
}


// ==================================================
// 1. SNAKE GAME
// ==================================================

function startSnake() {
    gameArea.innerHTML = `
        <h3>🐍 Snake Game</h3>
        <p>Use buttons or arrow keys to move!</p>
        <p>Score: <span id="snakeScore">0</span></p>

        <canvas id="snakeCanvas" width="300" height="300"
        style="background:#080d16;border:1px solid #00ff99;margin-top:15px">
        </canvas>

        <div style="display:grid;grid-template-columns:60px 60px 60px;
        gap:8px;justify-content:center;margin:20px auto;">
            <div></div>
            <button onclick="snakeMove('UP')">⬆️</button>
            <div></div>
            <button onclick="snakeMove('LEFT')">⬅️</button>
            <button onclick="snakeMove('DOWN')">⬇️</button>
            <button onclick="snakeMove('RIGHT')">➡️</button>
        </div>

        <button onclick="openGame('snake')" class="play-btn">
            🔄 Restart Snake
        </button>
    `;

    const c = document.getElementById("snakeCanvas");
    const ctx = c.getContext("2d");
    const size = 15;

    let snake = [
        { x: 150, y: 150 },
        { x: 135, y: 150 }
    ];

    let food = randomFood();
    let dir = "RIGHT";
    let nextDir = "RIGHT";
    let score = 0;
    let over = false;

    function randomFood() {
        return {
            x: Math.floor(Math.random() * 20) * size,
            y: Math.floor(Math.random() * 20) * size
        };
    }

    function draw() {
        ctx.fillStyle = "#080d16";
        ctx.fillRect(0, 0, 300, 300);

        ctx.fillStyle = "#ff4d6d";
        ctx.fillRect(food.x, food.y, size, size);

        snake.forEach((part, i) => {
            ctx.fillStyle = i === 0 ? "#00ff99" : "#00b879";
            ctx.fillRect(part.x, part.y, size - 2, size - 2);
        });
    }

    window.snakeMove = function(direction) {
        const opposite = {
            UP: "DOWN",
            DOWN: "UP",
            LEFT: "RIGHT",
            RIGHT: "LEFT"
        };

        if (!over && direction !== opposite[dir]) {
            nextDir = direction;
        }
    };

    function tick() {
        if (over) return;

        dir = nextDir;

        let head = { ...snake[0] };

        if (dir === "UP") head.y -= size;
        if (dir === "DOWN") head.y += size;
        if (dir === "LEFT") head.x -= size;
        if (dir === "RIGHT") head.x += size;

        const eating = head.x === food.x && head.y === food.y;
        const body = eating ? snake : snake.slice(0, -1);

        if (
            head.x < 0 || head.y < 0 ||
            head.x >= 300 || head.y >= 300 ||
            body.some(p => p.x === head.x && p.y === head.y)
        ) {
            over = true;
            draw();

            ctx.fillStyle = "white";
            ctx.font = "24px Arial";
            ctx.fillText("GAME OVER", 85, 150);
            return;
        }

        snake.unshift(head);

        if (eating) {
            score += 10;
            document.getElementById("snakeScore").textContent = score;

            food = randomFood();

            while (snake.some(p => p.x === food.x && p.y === food.y)) {
                food = randomFood();
            }
        } else {
            snake.pop();
        }

        draw();
    }

    keyHandler = function(e) {
        const keys = {
            ArrowUp: "UP",
            ArrowDown: "DOWN",
            ArrowLeft: "LEFT",
            ArrowRight: "RIGHT"
        };

        if (!keys[e.key]) return;

        e.preventDefault();
        snakeMove(keys[e.key]);
    };

    document.addEventListener("keydown", keyHandler);
    draw();
    addTimer(setInterval(tick, 130));
}


// ==================================================
// 2. MEMORY CARD GAME
// ==================================================

function startMemory() {
    const symbols = [
        "🍎", "🍎", "🍕", "🍕",
        "🚀", "🚀", "🐱", "🐱",
        "⚽", "⚽", "🌟", "🌟"
    ];

    symbols.sort(() => Math.random() - 0.5);

    let first = null;
    let lock = false;
    let matched = 0;
    let moves = 0;

    gameArea.innerHTML = `
        <h3>Find matching pairs!</h3>
        <p>Moves: <span id="moves">0</span></p>

        <div id="memoryBoard" style="display:grid;
        grid-template-columns:repeat(4,1fr);gap:8px;margin-top:20px"></div>

        <button onclick="openGame('memory')" class="play-btn">Restart</button>
    `;

    const board = document.getElementById("memoryBoard");

    symbols.forEach(symbol => {
        const card = document.createElement("button");
        card.textContent = "?";
        card.dataset.symbol = symbol;

        card.style.cssText = `
            height:65px;font-size:25px;background:#1e293b;
            color:white;border:1px solid #334155;border-radius:10px;
        `;

        card.onclick = () => {
            if (lock || card.classList.contains("matched") || card === first) return;

            card.textContent = symbol;
            card.style.background = "#14532d";

            if (!first) {
                first = card;
                return;
            }

            moves++;
            document.getElementById("moves").textContent = moves;

            if (first.dataset.symbol === symbol) {
                first.classList.add("matched");
                card.classList.add("matched");
                first = null;
                matched += 2;

                if (matched === symbols.length) {
                    addTimer(setTimeout(() => alert("You won! Moves: " + moves), 200));
                }
            } else {
                lock = true;
                const previous = first;
                first = null;

                addTimer(setTimeout(() => {
                    card.textContent = "?";
                    previous.textContent = "?";
                    card.style.background = "#1e293b";
                    previous.style.background = "#1e293b";
                    lock = false;
                }, 700));
            }
        };

        board.appendChild(card);
    });
}


// ==================================================
// 3. CAR RACING GAME
// ==================================================

function startCar() {
    gameArea.innerHTML = `
        <h3>🏎‍🟀 Car Racing</h3>
        <p>Select your difficulty</p>

        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:20px 0">
            <button onclick="selectCarMode('easy')">🟢 Easy</button>
            <button onclick="selectCarMode('medium')">🟡 Medium</button>
            <button onclick="selectCarMode('high')">🔴 High</button>
        </div>

        <div id="carGameArea"></div>
    `;

    window.selectCarMode = function(mode) {
        let speed, spawnRate;

        if (mode === "easy") {
            speed = 3;
            spawnRate = 55;
        } else if (mode === "medium") {
            speed = 5;
            spawnRate = 40;
        } else {
            speed = 7;
            spawnRate = 25;
        }

        const modeName = {
            easy: "🟢 EASY",
            medium: "🟡 MEDIUM",
            high: "🔴 HIGH"
        };

        document.getElementById("carGameArea").innerHTML = `
            <h4>${modeName[mode]} MODE</h4>
            <p>Score: <span id="carScore">0</span></p>

            <canvas id="carCanvas" width="320" height="500"
            style="display:block;width:100%;max-width:320px;height:auto;
            background:#222;border-radius:10px;margin:15px auto"></canvas>

            <div style="display:flex;justify-content:center;gap:15px;margin-top:12px">
                <button onclick="moveCar(-1)">⬅️</button>
                <button onclick="moveCar(1)">➡️</button>
            </div>

            <button onclick="openGame('car')" class="play-btn">🔄 Restart</button>
            <p>Use Arrow Keys or A / D to move</p>
        `;

        const canvas = document.getElementById("carCanvas");
        const ctx = canvas.getContext("2d");
        const lanes = [55, 150, 245];

        let playerLane = 1;
        let player = { x: lanes[playerLane], y: 420, w: 42, h: 65 };
        let traffic = [];
        let score = 0;
        let frame = 0;
        let running = true;
        let roadOffset = 0;

        window.moveCar = function(direction) {
            if (!running) return;
            playerLane += direction;
            playerLane = Math.max(0, Math.min(2, playerLane));
            player.x = lanes[playerLane];
        };

        keyHandler = function(e) {
            if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
                e.preventDefault();
                moveCar(-1);
            }

            if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
                e.preventDefault();
                moveCar(1);
            }
        };

        document.addEventListener("keydown", keyHandler);

        function drawPlayer() {
            ctx.fillStyle = "#00ff99";
            ctx.fillRect(player.x - 21, player.y, 42, 65);

            ctx.fillStyle = "#b9ecff";
            ctx.fillRect(player.x - 14, player.y + 10, 28, 15);

            ctx.fillStyle = "#123345";
            ctx.fillRect(player.x - 14, player.y + 36, 28, 13);

            ctx.fillStyle = "#111";
            ctx.fillRect(player.x - 25, player.y + 12, 5, 15);
            ctx.fillRect(player.x + 20, player.y + 12, 5, 15);
            ctx.fillRect(player.x - 25, player.y + 40, 5, 15);
            ctx.fillRect(player.x + 20, player.y + 40, 5, 15);
        }

        function drawTraffic(car) {
            ctx.fillStyle = car.color;
            ctx.fillRect(car.x - 21, car.y, 42, 65);

            ctx.fillStyle = "#b9ecff";
            ctx.fillRect(car.x - 14, car.y + 10, 28, 15);

            ctx.fillStyle = "#222";
            ctx.fillRect(car.x - 14, car.y + 37, 28, 13);

            ctx.fillStyle = "#111";
            ctx.fillRect(car.x - 25, car.y + 12, 5, 15);
            ctx.fillRect(car.x + 20, car.y + 12, 5, 15);
            ctx.fillRect(car.x - 25, car.y + 40, 5, 15);
            ctx.fillRect(car.x + 20, car.y + 40, 5, 15);
        }

        function drawRoad() {
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, 320, 500);

            ctx.fillStyle = "#14532d";
            ctx.fillRect(0, 0, 20, 500);
            ctx.fillRect(300, 0, 20, 500);

            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(25, 0, 5, 500);
            ctx.fillRect(290, 0, 5, 500);

            ctx.fillStyle = "#ffffff";
            roadOffset = (roadOffset + speed) % 60;

            for (let y = -60 + roadOffset; y < 500; y += 60) {
                ctx.fillRect(105, y, 5, 30);
                ctx.fillRect(200, y, 5, 30);
            }
        }

        function spawnTraffic() {
            const lane = Math.floor(Math.random() * 3);

            if (traffic.some(car => car.lane === lane && car.y < 130)) return;

            const colors = ["#ff4757", "#3498db", "#f1c40f", "#9b59b6"];

            traffic.push({
                lane,
                x: lanes[lane],
                y: -80,
                w: 42,
                h: 65,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        function isColliding(a, b) {
            return (
                a.x - 19 < b.x + 19 &&
                a.x + 19 > b.x - 19 &&
                a.y + 8 < b.y + b.h - 8 &&
                a.y + a.h - 8 > b.y + 8
            );
        }

        function gameOver() {
            running = false;

            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.fillRect(25, 170, 270, 150);
            ctx.textAlign = "center";

            ctx.fillStyle = "#ff4757";
            ctx.font = "bold 30px Arial";
            ctx.fillText("GAME OVER", 160, 220);

            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Score: " + score, 160, 260);
        }

        function tick() {
            if (!running) return;

            frame++;
            drawRoad();

            if (frame % spawnRate === 0) spawnTraffic();

            traffic.forEach(car => {
                car.y += Math.min(speed + Math.floor(score / 15), 12);
            });

            for (const car of traffic) {
                if (isColliding(player, car)) {
                    drawTraffic(car);
                    drawPlayer();
                    gameOver();
                    clearInterval(loop);
                    return;
                }
            }

            const before = traffic.length;
            traffic = traffic.filter(car => car.y < 520);

            if (traffic.length < before) {
                score++;
                document.getElementById("carScore").textContent = score;
            }

            traffic.forEach(drawTraffic);
            drawPlayer();
        }

        drawRoad();
        drawPlayer();

        const loop = setInterval(tick, 50);
        addTimer(loop);
    };
}


// ==================================================
// 4. PING PONG GAME
// ==================================================

function startPong() {
    gameArea.innerHTML = `
        <h3>Ping Pong</h3>
        <p>Move your mouse or finger to control the paddle.</p>
        <p>Score: <span id="pongScore">0</span></p>

        <canvas id="pongCanvas" width="320" height="400"
        style="background:#080d16;border:1px solid #00ff99;margin-top:15px"></canvas>

        <button onclick="openGame('pong')" class="play-btn">🔄 Restart Ping Pong</button>
    `;

    const c = document.getElementById("pongCanvas");
    const ctx = c.getContext("2d");

    let paddle = { x: 130, y: 365, w: 60, h: 10 };
    let ball = { x: 160, y: 200, dx: 3, dy: 4, r: 7 };
    let score = 0;
    let over = false;

    function draw() {
        ctx.fillStyle = "#080d16";
        ctx.fillRect(0, 0, 320, 400);

        ctx.fillStyle = "#00ff99";
        ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

        ctx.fillStyle = "#ff4d6d";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#263449";
        for (let x = 0; x < 320; x += 20) {
            ctx.fillRect(x, 180, 10, 2);
        }

        if (over) {
            ctx.fillStyle = "white";
            ctx.font = "22px Arial";
            ctx.fillText("GAME OVER", 95, 200);
        }
    }

    function tick() {
        if (over) return;

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x < ball.r || ball.x > 320 - ball.r) ball.dx *= -1;
        if (ball.y < ball.r) ball.dy *= -1;

        if (
            ball.dy > 0 &&
            ball.y + ball.r >= paddle.y &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.w
        ) {
            ball.dy *= -1;
            score++;
            document.getElementById("pongScore").textContent = score;
        }

        if (ball.y > 400) over = true;
        draw();
    }

    function movePaddle(x) {
        paddle.x = Math.max(0, Math.min(320 - paddle.w, x - paddle.w / 2));
    }

    c.addEventListener("mousemove", e => {
        const rect = c.getBoundingClientRect();
        movePaddle((e.clientX - rect.left) * (c.width / rect.width));
    });

    c.addEventListener("touchmove", e => {
        e.preventDefault();
        const rect = c.getBoundingClientRect();
        movePaddle((e.touches[0].clientX - rect.left) * (c.width / rect.width));
    }, { passive: false });

    draw();
    addTimer(setInterval(tick, 16));
}


// ==================================================
// 5. SPACE SHOOTER
// ==================================================

function startSpace() {
    gameArea.innerHTML = `
        <h3>Space Shooter</h3>
        <p>Move with arrows and press SPACE to shoot.</p>
        <p>Score: <span id="spaceScore">0</span></p>

        <canvas id="spaceCanvas" width="320" height="400"
        style="background:#080d16;border:1px solid #334155;margin-top:15px"></canvas>

        <div style="margin-top:10px">
            <button onclick="spaceMove(-1)">◀️</button>
            <button onclick="spaceShoot()">🚀 SHOOT</button>
            <button onclick="spaceMove(1)">▶️</button>
        </div>

        <button onclick="openGame('space')" class="play-btn">🔄 Restart Space Shooter</button>
    `;

    const c = document.getElementById("spaceCanvas");
    const ctx = c.getContext("2d");

    let player = { x: 150, y: 350, w: 25, h: 25 };
    let bullets = [];
    let enemies = [];
    let score = 0;
    let over = false;

    window.spaceMove = function(direction) {
        if (over) return;
        player.x += direction * 20;
        player.x = Math.max(0, Math.min(295, player.x));
    };

    window.spaceShoot = function() {
        if (!over) bullets.push({ x: player.x + 12, y: player.y });
    };

    keyHandler = function(e) {
        if (e.key === "ArrowLeft") spaceMove(-1);
        if (e.key === "ArrowRight") spaceMove(1);

        if (e.code === "Space") {
            e.preventDefault();
            spaceShoot();
        }
    };

    document.addEventListener("keydown", keyHandler);

    function tick() {
        if (over) return;

        ctx.fillStyle = "#080d16";
        ctx.fillRect(0, 0, 320, 400);

        ctx.fillStyle = "#00ff99";
        ctx.fillRect(player.x, player.y, player.w, player.h);

        bullets.forEach(b => b.y -= 6);
        enemies.forEach(e => e.y += 2);

        ctx.fillStyle = "#ffff00";
        bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

        ctx.fillStyle = "#ff4d6d";
        enemies.forEach(e => ctx.fillRect(e.x, e.y, 20, 20));

        for (let bi = bullets.length - 1; bi >= 0; bi--) {
            for (let ei = enemies.length - 1; ei >= 0; ei--) {
                const b = bullets[bi];
                const e = enemies[ei];

                if (
                    b.x >= e.x && b.x <= e.x + 20 &&
                    b.y >= e.y && b.y <= e.y + 20
                ) {
                    bullets.splice(bi, 1);
                    enemies.splice(ei, 1);
                    score++;
                    document.getElementById("spaceScore").textContent = score;
                    break;
                }
            }
        }

        bullets = bullets.filter(b => b.y > -10);
        enemies = enemies.filter(e => e.y < 400);

        if (enemies.some(e => e.y + 20 >= player.y)) {
            over = true;
            ctx.fillStyle = "white";
            ctx.font = "22px Arial";
            ctx.fillText("GAME OVER", 95, 200);
        }
    }

    addTimer(setInterval(() => {
        if (!over && Math.random() < 0.5) {
            enemies.push({
                x: Math.floor(Math.random() * 15) * 20,
                y: 0
            });
        }
    }, 800));

    addTimer(setInterval(tick, 30));
}


// ==================================================
// 6. TIC-TAC-TOE
// ==================================================

function startTicTacToe() {
    let board = Array(9).fill("");
    let current = "X";
    let finished = false;

    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    gameArea.innerHTML = `
        <h3>Tic-Tac-Toe</h3>
        <p id="ticMessage">Player X's turn</p>

        <div id="ticBoard" style="display:grid;
        grid-template-columns:repeat(3,80px);gap:8px;
        justify-content:center;margin:20px auto;position:relative;width:256px;">

            <svg id="winLine" viewBox="0 0 256 256"
            style="position:absolute;top:0;left:0;width:100%;height:100%;
            pointer-events:none;z-index:5;">
                <line id="winningLine" x1="0" y1="0" x2="0" y2="0"
                stroke="#00ff99" stroke-width="7" stroke-linecap="round"
                style="filter:drop-shadow(0 0 8px #00ff99);opacity:0"/>
            </svg>
        </div>

        <button onclick="openGame('tic')" class="play-btn">🔄 Restart</button>
    `;

    const boardElement = document.getElementById("ticBoard");
    const winningLine = document.getElementById("winningLine");

    board.forEach((_, i) => {
        const cell = document.createElement("button");

        cell.style.cssText = `
            width:80px;height:80px;font-size:35px;font-weight:bold;
            background:#1e293b;color:#00ff99;border:1px solid #334155;
            border-radius:10px;cursor:pointer;
        `;

        cell.onclick = () => {
            if (board[i] || finished) return;

            board[i] = current;
            cell.textContent = current;
            cell.style.color = current === "X" ? "#00ff99" : "#ff4d6d";

            const winningCombo = checkWinner();

            if (winningCombo) {
                document.getElementById("ticMessage").textContent =
                    "🎉 Player " + current + " wins!";

                finished = true;

                const positions = [
                    [40,40], [128,40], [216,40],
                    [40,128], [128,128], [216,128],
                    [40,216], [128,216], [216,216]
                ];

                const first = positions[winningCombo[0]];
                const last = positions[winningCombo[2]];

                winningLine.setAttribute("x1", first[0]);
                winningLine.setAttribute("y1", first[1]);
                winningLine.setAttribute("x2", last[0]);
                winningLine.setAttribute("y2", last[1]);
                winningLine.style.opacity = "1";

                winningLine.setAttribute("stroke",
                    current === "X" ? "#00ff99" : "#ff4d6d");

                return;
            }

            if (board.every(cell => cell !== "")) {
                document.getElementById("ticMessage").textContent = "🤝 Draw!";
                finished = true;
                return;
            }

            current = current === "X" ? "O" : "X";
            document.getElementById("ticMessage").textContent =
                "Player " + current + "'s turn";
        };

        boardElement.appendChild(cell);
    });

    function checkWinner() {
        return wins.find(combo => combo.every(i => board[i] === current));
    }
}


// ==================================================
// 7. PUZZLE GAME
// ==================================================

function startPuzzle() {
    let nums = [1,2,3,4,5,6,7,8,0];
    let moves = 0;

    function getNeighbors(index) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const list = [];

        if (row > 0) list.push(index - 3);
        if (row < 2) list.push(index + 3);
        if (col > 0) list.push(index - 1);
        if (col < 2) list.push(index + 1);

        return list;
    }

    for (let i = 0; i < 150; i++) {
        const empty = nums.indexOf(0);
        const neighbors = getNeighbors(empty);
        const swap = neighbors[Math.floor(Math.random() * neighbors.length)];

        [nums[empty], nums[swap]] = [nums[swap], nums[empty]];
    }

    gameArea.innerHTML = `
        <h3>Number Puzzle</h3>
        <p>Arrange the numbers from 1 to 8.</p>
        <p>Moves: <span id="puzzleMoves">0</span></p>

        <div id="puzzleBoard" style="display:grid;
        grid-template-columns:repeat(3,75px);gap:7px;
        justify-content:center;margin:20px auto"></div>

        <button onclick="openGame('puzzle')" class="play-btn">Shuffle Again</button>
    `;

    const board = document.getElementById("puzzleBoard");

    function render() {
        board.innerHTML = "";

        nums.forEach((num, index) => {
            const button = document.createElement("button");
            button.textContent = num || "";

            button.style.cssText = `
                width:75px;height:75px;font-size:25px;
                background:${num ? "#1e293b" : "#080d16"};
                color:#00ff99;border:1px solid #334155;border-radius:10px;
            `;

            button.onclick = () => move(index);
            board.appendChild(button);
        });
    }

    function move(index) {
        const empty = nums.indexOf(0);
        if (!getNeighbors(empty).includes(index)) return;

        [nums[empty], nums[index]] = [nums[index], nums[empty]];

        moves++;
        document.getElementById("puzzleMoves").textContent = moves;

        render();

        if (nums.join(",") === "1,2,3,4,5,6,7,8,0") {
            addTimer(setTimeout(() => alert("Puzzle solved! 🎉"), 100));
        }
    }

    render();
}
