import { Board } from "./entities/Board";
import { Directions } from "../player/entities/Player";

export class BoardBuilder {
    private board: Board;
    private playerPositions: Array<{x: number, y: number, direction: Directions}>;
    
    constructor() {
        this.board = {
            size: 10,
            elements: []
        }
        
        this.playerPositions = [
            {x: 0, y: 0, direction: Directions.Down},     
            {x: 0, y: 9, direction: Directions.Down},     
            {x: 9, y: 0, direction: Directions.Up},     
            {x: 9, y: 9, direction: Directions.Up}      
        ];

        const map: Array<number[]> = [
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,5,0,0,0],
            [0,5,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,5,0,0,0],
            [0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,5,0],
            [0,0,5,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,5,0,0],
            [0,0,0,0,0,0,0,0,0,0]
        ];

        for(let i = 0; i < this.board.size; i++) {
            for(let j = 0; j < this.board.size; j++) {
                if(map[i][j] === 5) {
                    this.board.elements.push({
                        x: i, 
                        y: j,
                        type: map[i][j] 
                    });
                }
            }
        }
    }

    public getBoard(): Board {
        return this.board;
    }

    public getPlayerPositions(): Array<{x: number, y: number, direction: Directions}> {
        return this.playerPositions;
    }

    
}