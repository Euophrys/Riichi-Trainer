export default class ReplayPlayer {
    constructor(hand = []) {
        /** @type {number[]} */
        this.hand = hand;
        /** @type {number[]} */
        this.discards = [];
        /** @type {number[]} */
        this.discardsAfterRiichi = [];
        /** @type {number} */
        this.riichiTile = -1;
        /** @type {number[]} */
        this.calledTiles = []
    }

    /**
     * Returns whether this player is in riichi.
     */
    isInRiichi() {
        return this.riichiTile > -1;
    }

    /**
     * Adds the call to the player's calls and removes the tiles from the player's hand.
     * @param {number[]} calledTiles The tiles that are in the call.
     */
    callTiles(calledTiles) {
        this.calledTiles.push(calledTiles);

        if(calledTiles.length === 1) {
            // kita
            this.hand[calledTiles[0]]--;
        } else if(calledTiles.length === 4) {
            // kan
            this.hand[calledTiles[0]] = 0;
        } else {
            // pon / chi
            for(let i = 1; i < calledTiles.length; i++) {
                this.hand[calledTiles[i]]--;
            }
        }
    }

    /**
     * Removes the given tile from the player's hand and adds it to their discards.
     * @param {number} tile The discarded tile.
     */
    discardTile(tile) {
        this.discards.push(tile);
        this.hand[tile]--;

        if(this.riichiTile === -2) {
            // This player just declared riichi, so this is their riichi tile.
            this.riichiTile = tile;
        }
    }
}