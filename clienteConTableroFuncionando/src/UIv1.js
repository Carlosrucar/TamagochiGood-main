import { UI_BUILDER } from "./Ui.js";

export const UIv1 = UI_BUILDER.init();

let isFirstDraw = true;

UIv1.initUI = () => {
    const base = document.getElementById(UIv1.uiElements.board);
    base.classList.add("board");
    
    // Añadir controles
    const controls = document.createElement("div");
    controls.classList.add("controls");
    controls.innerHTML = `
        <button id="moveForward">Mover Adelante</button>
        <button id="rotate">Girar</button>
        <button id="shoot">Disparar</button>
    `;
    document.body.appendChild(controls);
    
    // Event listeners 
    document.addEventListener("keydown", (event) => {
        if (event.key === "Up" || event.key === "ArrowUp") {
            window.dispatchEvent(new CustomEvent("playerAction", {
                detail: { type: "MOVE_FORWARD" }
            }));
        }
    });

    document.getElementById("moveForward").addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("playerAction", {
            detail: { type: "MOVE_FORWARD" }
        }));
    });
    
    document.getElementById("rotate").addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("playerAction", {
            detail: { type: "ROTATE" }
        }));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Down" || event.key === "ArrowDown") {
            window.dispatchEvent(new CustomEvent("playerAction", {
                detail: { type: "ROTATE" }
            }));
        }
    });

    document.getElementById("shoot").addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("playerAction", {
            detail: { type: "SHOOT" }
        }));
    });
}

UIv1.drawBoard = (board, playerPositions) => {
    console.log("Dibujando tablero con posiciones:", playerPositions);

    const directionDegrees = {
        "up": 0,
        "right": 90,
        "down": 180,
        "left": 270
    };

    if (board !== undefined) {
        const base = document.getElementById(UIv1.uiElements.board);
        base.innerHTML = '';
        base.style.gridTemplateColumns = `repeat(${board.length}, 100px)`;
        base.style.gridTemplateRows = `repeat(${board.length}, 100px)`;
        
        board.forEach((row, i) => row.forEach((element, j) => {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            base.appendChild(tile);
            
            if (element === 5) {
                tile.classList.add("bush");
            }
            
            const playerData = playerPositions?.find(pos => pos.x === i && pos.y === j);
            if (playerData) {
                const player = document.createElement("div");
                player.classList.add("player");
                player.style.transform = `rotate(${directionDegrees[playerData.direction.toLowerCase()]}deg)`;
                tile.appendChild(player);
            }
            
            // Solo aplicar la animación si es la primera vez
            if (isFirstDraw) {
                anime({
                    targets: tile,
                    opacity: [0, 1],
                    duration: (Math.random() * 8000) + 1000,
                    easing: 'easeInOutQuad'
                });
            } else {

                tile.style.opacity = 1;
            }
        }));
        
        isFirstDraw = false;
    }
}
UIv1.drawBoard();

