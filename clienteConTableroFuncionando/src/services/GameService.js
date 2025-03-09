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
        console.log(`Acción: ${actionType}`); 
        if (ConnectionHandler.socket && ConnectionHandler.connected) {
            console.log("Enviando:", actionType);
            ConnectionHandler.socket.emit("message", {
                type: actionType,
                content: {}
            });
        } else {
            console.warn("Conexion al Socket no es posible. Conectado:", ConnectionHandler.connected);
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
        console.log("Posiciones jugador:", payload);
        const playerPositions = payload.playerPositions;
        if (playerPositions) {
            console.log("Estas son sus posiciones:", playerPositions);
            this.#ui.drawBoard(this.#board.map, playerPositions);
        } else {
            console.warn("No hay posicion de los players:", payload);
        }
    }

    async do_bushStatus(payload) {
        //Añado el playerID para que sepa si es el jugador que esta en el arbusto ya que antes me avisaba a todos los jugadores.
        const { inBush, playerId } = payload;
        if (inBush && playerId === ConnectionHandler.socket.id) {
            alert("Estás escondido en un arbusto");
        }
    }
    

 
}