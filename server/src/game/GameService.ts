import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates, Messages } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService";

export class GameService {
    private games: Game[];

    private static instance: GameService;
    private constructor() {
        this.games = [];
    }

    static getInstance(): GameService {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new GameService();
        return this.instance;
    }

    public buildPlayer(socket: Socket): Player {
        const playerCount = this.games.reduce((count, game) => count + game.room.players.length, 0);
        const initialPositions = [
            {x: 0, y: 0},     
            {x: 0, y: 9},     
            {x: 9, y: 0},     
            {x: 9, y: 9}      
        ];
        
        const position = initialPositions[playerCount % 4]; 
    
        const player: Player = {
            id: socket,
            x: position.x,
            y: position.y,
            state: PlayerStates.Idle,
            direction: Directions.Idle,
            visibility: true
        };

        if (position.x === 0 && position.y === 0 || position.x === 0 && position.y === 9) {
            player.direction = Directions.Down;
        } else {
            player.direction =  Directions.Up;
        }

        return player;
    }

    public addPlayer(player: Player): boolean {
        const room: Room = RoomService.getInstance().addPlayer(player);
        const playerData = {
            id: player.id.id,
            x: player.x,
            y: player.y,
            state: player.state,
            direction: player.direction,
            visibility: player.visibility
        };
        
        ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, playerData);
    
        const genRanHex = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        if (room.players.length == 1) {
            const boardBuilder = new BoardBuilder();
            const game: Game = {
                id: "game" + genRanHex(128),
                state: GameStates.WAITING,
                room: room,
                board: boardBuilder.getBoard(),
                //Aqui agarro todas las posiciones que me da el BoardBuilder y a cada una le pongo una propiedad visibility en true para que los jugadores sean visibles al inicio.
                playerPositions: boardBuilder.getPlayerPositions().map(pos => ({ x: pos.x, y: pos.y, direction: pos.direction, visibility: true }))

            }
            room.game = game;
            this.games.push(game);
        }
    
        if (room.occupied) {
            if (room.game) {
                room.game.state = GameStates.PLAYING;
                if (ServerService.getInstance().isActive()) {
                    ServerService.getInstance().sendMessage(room.name, Messages.BOARD, {
                        board: room.game.board,
                        playerPositions: room.game.playerPositions
                    });
                }
            }
            return true;
        }
        return false;
    }

    public handlePlayerAction(socket: Socket, action: string): void {
        const player = this.findPlayerBySocket(socket);
        console.log("Player action received:", action);
        
        if (!player) {
            console.log("No player found for socket");
            return;
        }
    
        const room = this.findRoomByPlayer(player);
        if (room && room.game) {
            console.log("Before action - Player positions:", room.game.playerPositions);
            
            switch (action) {
                case Messages.MOVE_FORWARD:
                    this.movePlayerForward(player);
                    break;
                case Messages.ROTATE:
                    this.rotatePlayer(player);
                    break;
                //Aqui estoy intentando implementar el caso de que el jugador dispare.
                case Messages.SHOOT:
                    this.shootPlayer(player);
                    break;
            }
    
            console.log("After action - Player positions:", room.game.playerPositions);
            
            ServerService.getInstance().sendMessage(room.name, Messages.UPDATE_POSITIONS, {
                playerPositions: room.game.playerPositions
            });
        }
    }
    

    private movePlayerForward(player: Player): void {
        const room = this.findRoomByPlayer(player);
        if (!room || !room.game) return;
        
        const currentPosition = room.players.find(p => p.id === player.id);
        console.log("From position:", currentPosition);
        
        if (!currentPosition) return;
    
        const newPosition = this.calculateNewPosition(currentPosition, player.direction);
        console.log("To position:", newPosition);
        
        const isOccupied = room.game.playerPositions.some(pos => 
            pos.x === newPosition.x && pos.y === newPosition.y
        );

        const isBush = room.game.board.elements.some(element => 
            element.x === newPosition.x && element.y === newPosition.y
        );

        // Aqui voy a intentar hacer que cuandoeste en el arbusto desaparezca el jugador.
        player.visibility = !isBush;
        currentPosition.visibility = !isBush;

        if (isBush) {
            console.log("Estas en un arbusto");
            ServerService.getInstance().sendMessage(room.name, Messages.BUSH_STATUS, {
                playerId: player.id.id,
                inBush: true
            });
        } else {
            ServerService.getInstance().sendMessage(room.name, Messages.BUSH_STATUS, {
                playerId: player.id.id,
                inBush: false
            });
        }
        
        if (this.isValidPosition(newPosition) && !isOccupied) {
            const oldX = currentPosition.x;
            const oldY = currentPosition.y;
            
            room.game.playerPositions = room.game.playerPositions.filter(pos => 
                !(pos.x === oldX && pos.y === oldY)
            );
    
            currentPosition.x = newPosition.x;
            currentPosition.y = newPosition.y;
    
            room.game.playerPositions.push({
                x: newPosition.x,
                y: newPosition.y,
                direction: player.direction,
                visibility: player.visibility 
            });
        }
    }
    
    private rotatePlayer(player: Player): void {
        const room = this.findRoomByPlayer(player);
        if (!room || !room.game) return;
        
        const currentPosition = room.players.find(p => p.id === player.id);
        if (!currentPosition) return;
    
        let newDirection = Directions.Up;
        if (player.direction === Directions.Up) newDirection = Directions.Right;
        else if (player.direction === Directions.Right) newDirection = Directions.Down;
        else if (player.direction === Directions.Down) newDirection = Directions.Left;
        else if (player.direction === Directions.Left) newDirection = Directions.Up;
    
        player.direction = newDirection;
        currentPosition.direction = newDirection;
    
        const gamePosition = room.game.playerPositions.find(
            pos => pos.x === currentPosition.x && pos.y === currentPosition.y
        );
        
        if (gamePosition) {
            gamePosition.direction = newDirection;
            room.game.playerPositions = [...room.game.playerPositions];
        }
        

        ServerService.getInstance().sendMessage(room.name, Messages.UPDATE_POSITIONS, {
            playerPositions: room.game.playerPositions
        });
    
        console.log("Player rotated, new direction:", newDirection);
        console.log("Updated player position:", gamePosition);
    }
    
    private findPlayerBySocket(socket: Socket): Player | undefined {
        return this.games.flatMap(game => game.room.players)
            .find(player => player.id === socket);
    }
    
    private findRoomByPlayer(player: Player): Room | undefined {
        return this.games.find(game => 
            game.room.players.includes(player))?.room;
    }
    
    private isValidPosition(position: {x: number, y: number}): boolean {
        return position.x >= 0 && position.x < 10 && 
               position.y >= 0 && position.y < 10;
    }
    
    private calculateNewPosition(currentPos: {x: number, y: number}, direction: Directions): {x: number, y: number} {
        const moves: Record<Directions, {x: number, y: number}> = {
            [Directions.Up]: {x: -1, y: 0},    
            [Directions.Right]: {x: 0, y: 1},   
            [Directions.Down]: {x: 1, y: 0},    
            [Directions.Left]: {x: 0, y: -1},   
            [Directions.Idle]: {x: 0, y: 0}
        };
        
        const move = moves[direction];
        
        const newPos = {
            x: currentPos.x + move.x,
            y: currentPos.y + move.y
        };
        console.log("New position calculated:", newPos);
        return newPos;
    }
    //Voy a implementar la función shootPlayer para que el jugador pero no consigo que me desaparezca el jugador al que disparo.
        private shootPlayer(player: Player): void {
        const room = this.findRoomByPlayer(player);
        if (!room || !room.game) return;
    
        const shooter = room.players.find(p => p.id === player.id);
        if (!shooter) return;
    
        // Calculo la posición del disparo
        const targetPosition = this.calculateNewPosition(shooter, shooter.direction);
    
        // Busco si hay un jugador en esa posición
        const targetPlayer = room.game.playerPositions.find(pos => 
            pos.x === targetPosition.x && 
            pos.y === targetPosition.y && 
            pos.visibility === true // Solo puede disparar a jugadores visibles
        );
    
        if (targetPlayer) {
            // Encuentro el jugador real correspondiente a la posición
            const hitPlayer = room.players.find(p => 
                p.x === targetPosition.x && 
                p.y === targetPosition.y
            );
    
            if (hitPlayer) {
                // Elimino al jugador del juego
                room.players = room.players.filter(p => p.id !== hitPlayer.id);
                room.game.playerPositions = room.game.playerPositions.filter(pos => 
                    !(pos.x === targetPosition.x && pos.y === targetPosition.y)
                );
    
                // Notifico a todos los jugadores
                ServerService.getInstance().sendMessage(room.name, Messages.PLAYER_ELIMINATED, {
                    eliminatedPlayer: hitPlayer.id.id,
                    shooterId: shooter.id.id
                });
    
                // Actualizo las posiciones para todos
                ServerService.getInstance().sendMessage(room.name, Messages.UPDATE_POSITIONS, {
                    playerPositions: room.game.playerPositions
                });
    
                // Desconecto al jugador eliminado
                hitPlayer.id.disconnect();
            }
        }
    }

    
}