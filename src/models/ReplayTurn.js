export default class ReplayTurn {
    constructor(hand = [], message = "", className = "", draw = -1) {
        this.hand = hand;
        this.message = message;
        this.className = className;
        this.draw = draw;
        this.discards = [];
        this.calls = [];
    }
}