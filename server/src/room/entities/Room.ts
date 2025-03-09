import { Game } from "../../game/entities/Game";
import { Player } from "../../player/entities/Player";

export const RoomConfig = {
    maxRoomPlayers : 1
};

export interface Room {
    name : String;
    players : Player[];
    occupied: Boolean;
    game: Game |null;
}