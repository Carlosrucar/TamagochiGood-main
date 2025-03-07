import { Room } from "../../room/entities/Room";
import { Board } from "./Board";
import { Directions } from "../../player/entities/Player"; 

export enum GameStates {
    WAITING, PLAYING
}

export enum Messages {
    BOARD = "BOARD",
    NEW_PLAYER = "NEW_PLAYER",
    MOVE_FORWARD = "MOVE_FORWARD",
    ROTATE = "ROTATE",
    SHOOT = "SHOOT",
    UPDATE_POSITIONS = "UPDATE_POSITIONS",
    PLAYER_ELIMINATED = "PLAYER_ELIMINATED",
    BUSH_STATUS = "BUSH_STATUS"
}

export interface Game {
    id: String,
    state: GameStates,
    room: Room,
    board: Board,
    playerPositions: Array<{x: number, y: number, direction: Directions}>
}