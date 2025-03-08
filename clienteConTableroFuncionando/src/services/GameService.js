import { Board } from "../entities/Board.js";
import { Queue } from "../Queue.js";
import { ConnectionHandler } from "./ConnectionHandler.js";

export class GameService {
    #states = {
        WAITING : 0,
        PLAYING : 1,
        ENDED : 2
    };
    #ui = null;
    #players = [];
    #board = null;
    #queue = null;
    #state = null;
    #parallel = null;

    #actionsList = {
        "NEW_PLAYER": this.do_newPlayer.bind(this),
        "BOARD": this.do_newBoard.bind(this),
        "UPDATE_POSITIONS": this.do_updatePositions.bind(this),
        "BUSH_STATUS": this.do_bushStatus.bind(this),
        "SHOOT": this.do_shoot.bind(this),
    };

    constructor(ui){
        this.#state = this.#states.WAITING;
        this.#board = new Board();
        this.#queue = new Queue();
        this.#parallel = null;
        this.checkScheduler();
        this.#ui = ui;

        window.addEventListener("playerAction", (event) => {
            const action = event.detail;
            switch(action.type) {
                case "MOVE_FORWARD":
                    this.sendAction("MOVE_FORWARD");
                    break;
                case "ROTATE":
                    this.sendAction("ROTATE");
                    break;
                case "SHOOT":
                    this.sendAction("SHOOT");
                    break;

            }
        });
    }

    sendAction(actionType) {
        console.log(`Sending action: ${actionType}`); 
        if (ConnectionHandler.socket && ConnectionHandler.connected) {
            console.log("Sending through socket:", actionType);
            ConnectionHandler.socket.emit("message", {
                type: actionType,
                content: {}
            });
        } else {
            console.warn("No socket connection available. Connected:", ConnectionHandler.connected);
            console.warn("Socket object:", ConnectionHandler.socket);
        }
    }

    checkScheduler() {
        if (!this.#queue.isEmpty()) {
            if (this.#parallel == null) {
                this.#parallel = setInterval(
                    async ()=>{
                        const action = this.#queue.getMessage();
                        if (action != undefined) {
                            await this.#actionsList[action.type] (action.content);
                        } else {
                            this.stopScheduler();
                        }
                    }
                );
            }
        }
    }

    stopScheduler() {
        clearInterval(this.#parallel);
        this.#parallel = null;
    }

    do (data) {
        this.#queue.addMessage(data);
        this.checkScheduler();
    };

    async do_newPlayer (payload) {
        console.log("ha llegado un jugador nuevo");
    };

    async do_newBoard(payload) {
        const { board, playerPositions } = payload;
        this.#board.build(board);
        this.#ui.drawBoard(this.#board.map, playerPositions);
    }

    async do_updatePositions(payload) {
        console.log("Received update positions payload:", payload);
        const playerPositions = payload.playerPositions;
        if (playerPositions) {
            console.log("Drawing with positions:", playerPositions);
            this.#ui.drawBoard(this.#board.map, playerPositions);
        } else {
            console.warn("No player positions in payload:", payload);
        }
    }

    async do_bushStatus(payload) {
        const { inBush } = payload;
        if (inBush) {
            alert("¡Estás escondido en un arbusto!"); 
        }
    }

    async do_shoot(payload) {
        const { hit } = payload;
        if (hit) {
            alert("¡Has acertado!");
        } else {
            alert("¡Has fallado!");
        }
    }
    

 
}