export default class Player {
    constructor(hand = []) {
        this.name = "";
        /** @type {number[]} */
        this.hand = hand;
        /** @type {number[]} */
        this.discards = [];
        /** @type {number[]} */
        this.calledTiles = [];
        /** @type {number[]} */
        this.discardsAfterRiichi = [];
        this.riichiTile = -1;
        this.riichiIndex = -1;
        this.seat = 0;
        this.points = 25000;
    }

    /**
     * Returns whether this player is in riichi.
     */
    isInRiichi() {
        return this.riichiTile > -1;
    }

    /**
     * Returns whether this player's turn comes before the other player's.
     * @param {Player} player The player to compare with.
     */
    takesTurnBefore(player) {
        return this.seat < player.seat;
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
            this.riichiIndex = this.discards.length - 1;
        }
    }
}