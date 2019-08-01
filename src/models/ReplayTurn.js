import LocalizedMessageChain from "../models/LocalizedMessageChain";
// eslint-disable-next-line no-unused-vars
import Player from "./Player";
import { getTileAsText, convertTilesToAsciiSymbols, convertIndexesToTenhouTiles } from "../scripts/TileConversions";
import { convertHandToTenhouString } from "../scripts/HandConversions";
import { SAFETY_RATING_EXPLANATIONS } from "../Constants";

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
     * @param {Player} player The current player.
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
     * @param {Player} player The player to copy from.
     */
    copyFrom(player) {
        this.hand = player.hand.slice();
        this.discards = player.discards.slice();
        this.calls = player.calledTiles.slice();
    }

    /**
     * Adds a message comparing the efficiency of the player's discard with the most efficient discard.
     * @param {Function} t The i18next translation function.
     * @param {number} chosenTile The index of the chosen tile.
     * @param {{value:number,tiles:number[]}} chosenUkeire The ukeire object for the chosen tile.
     * @param {number} bestTile The index of the best tile.
     * @param {{value:number,tiles:number[]}} bestUkeire The ukeire object for the best tile.
     * @param {number} shanten The hand's shanten.
     * @param {number} handUkeire The ukeire of the hand without considering tiles outside of it.
     */
    addEfficiencyMessage(t, chosenTile, chosenUkeire, bestTile, bestUkeire, shanten, handUkeire) {
        this.message.appendLocalizedMessage("history.verbose.discard", {tile: getTileAsText(t, chosenTile, true)});
        
        if (chosenUkeire.value > 0 || shanten === 0) {
            this.message.appendLocalizedMessage("history.verbose.acceptance", {count: chosenUkeire.value});
            this.message.appendMessage(` ${convertTilesToAsciiSymbols(chosenUkeire.tiles)} (${convertIndexesToTenhouTiles(chosenUkeire.tiles)})`);
        }
        else {
            this.message.appendLocalizedMessage("history.verbose.loweredShanten");
            this.className = "bg-danger text-white";
        }
    
        this.message.appendLineBreak();
    
        if (chosenUkeire.value < bestUkeire.value) {
            this.message.appendLocalizedMessage("history.verbose.optimal");
            this.message.appendLocalizedMessage("history.verbose.optimalSpoiler", {tile: getTileAsText(t, bestTile, true)});
            this.message.appendLocalizedMessage("history.verbose.acceptance", {count: bestUkeire.value});
            this.message.appendMessage(` ${convertTilesToAsciiSymbols(bestUkeire.tiles)} (${convertIndexesToTenhouTiles(bestUkeire.tiles)})`);
    
            if(!this.className) {
                this.className = "bg-warning";
            }
        }
        else {
            this.message.appendLocalizedMessage("history.verbose.best");
            this.className = "bg-success text-white";
        }
    
        if (shanten <= 0 && handUkeire === 0) {
            this.message.appendLocalizedMessage("history.verbose.exceptionalNoten");
        }
    
        this.message.appendLineBreak();
    }

    /**
     * Adds a message comparing the safety of the player's tile to the safest possible tile.
     * @param {Function} t The i18next translation function.
     * @param {number} chosenTile The index of the chosen tile.
     * @param {number} chosenSafety The safety rating of the chosen tile.
     * @param {number} bestTile The index of the safest tile.
     * @param {number} bestSafety The safety rating of the safest tile.
     * @param {number} riichiCount The number of players in riichi.
     */
    addSafetyMessage(t, chosenTile, chosenSafety, bestTile, bestSafety, riichiCount) {
        this.message.appendLocalizedMessage("analyzer.chosenSafety", {
            tile: getTileAsText(t, chosenTile, true),
            rating: chosenSafety,
            explanation: SAFETY_RATING_EXPLANATIONS[Math.floor(chosenSafety / riichiCount)]
        });
        this.message.appendLineBreak();
        
        if(bestSafety === chosenSafety) {
            this.message.appendLocalizedMessage("analyzer.correctSafety");
        } else {
            this.message.appendLocalizedMessage("analyzer.bestSafety", {
                tile: getTileAsText(t, bestTile, true),
                rating: bestSafety,
                explanation: SAFETY_RATING_EXPLANATIONS[Math.floor(bestSafety / riichiCount)]
            });
        }
    
        this.message.appendLineBreak();
    }
}