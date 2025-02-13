export class Queue {
    #queue = null;

    constructor(){
        this.#queue = Array();

    }

    addMessage(payload){
        this.#queue.push(payload);

    };

    getMessage(){
        return this.#queue.shift();
    };

    isEmpty() {
        return this.#queue.lenth == 0;
    }
}