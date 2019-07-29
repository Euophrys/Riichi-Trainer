import LocalizedMessageChain from "../models/LocalizedMessageChain";
// eslint-disable-next-line no-unused-vars
import ReplayPlayer from "./ReplayPlayer";
import { getTileAsText } from "../scripts/TileConversions";
import { convertHandToTenhouString } from "../scripts/HandConversions";

export default class ReplayTurn {
    constructor(hand = [], message = "", className = "", draw = -1) {
        /** @type {number[]} */
        this.hand = hand;
        this.message = new LocalizedMessageChain();
        if(message) this.message.appendMessage(message);
        this.className = className;
        this.draw = draw;
        /** @type {number[]} */
        this.discards = [];
        /** @type {number[][]} */
        this.calls = [];
    }

    /**
     * Adds a message saying that a player declared riichi and recommending whether to fold.
     * @param {number} who The index of the player who declared riichi.
     * @param {number} playerShanten The player's shanten.
     */
    riichiDeclared(who, playerShanten) {
        this.message.appendLocalizedMessage("analyzer.otherRiichi", {number: who});

        if(playerShanten > 1) {
            this.message.appendLocalizedMessage("analyzer.fold", {shanten: playerShanten});
        } else if (playerShanten === 1) {
            this.message.appendLocalizedMessage("analyzer.probablyFold");
        }

        this.message.appendLineBreak();
    }

    /**
     * Adds a message saying what tile the player drew and sets the hand and draw accordingly.
     * @param {Function} t The i18next translation function.
     * @param {ReplayPlayer} player The current player.
     * @param {number} tile The index of the tile drawn.
     */
    tileDrawn(t, player, tile) {        
        this.hand = player.hand;
        this.draw = tile;
        this.message.appendLocalizedMessage("analyzer.draw", {tile: getTileAsText(t, tile), hand: convertHandToTenhouString(player.hand)});
        this.message.appendLineBreak();
    }

    /**
     * Copies the current hand, discards, and calls from the given player.
     * @param {ReplayPlayer} player The player to copy from.
     */
    copyFrom(player) {
        this.hand = player.hand.slice();
        this.discards = player.discards.slice();
        this.calls = player.calledTiles.slice();
    }
}