import LocalizedMessageChain from "../models/LocalizedMessageChain";

export default class ReplayTurn {
    constructor(hand = [], message = "", className = "", draw = -1) {
        this.hand = hand;
        this.message = new LocalizedMessageChain();
        if(message) this.message.appendMessage(message);
        this.className = className;
        this.draw = draw;
        this.discards = [];
        this.calls = [];
    }
}