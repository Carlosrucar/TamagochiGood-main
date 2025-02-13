export const ELEMENTS = {
    bush : 5,
    player : 1
};
export class Board {
    #map = null;
    #states = {
        NO_BUILD : 0,
        BUILD : 1
    }
    #state = null;

    constructor() {
        this.#state = this.#states.NO_BUILD;
    }

    build(payload) {
        const { size, elements } = payload;
        this.#map = new Array(size).fill().map(() => new Array(size).fill(0));
        elements.forEach(element => this.#map[element.x][element.y] = element.type);
        this.#state = this.#states.BUILD;
    }

    get map() {
        if (this.#state === this.#states.BUILD) {
            return this.#map;
        } return undefined;
    }
}