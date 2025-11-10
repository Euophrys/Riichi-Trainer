import { removeRandomItem } from "./Utils";
import { convertHandToTileIndexArray } from "./HandConversions";

/**
 * Generates a random hand of the specified number of tiles.
 * @param {TileCounts} remainingTiles The number of each tile in the wall.
 * @param {number} handSize The number of tiles in the hand (default: 14).
 */
export function generateHand(remainingTiles, handSize = 14) {
    let availableTiles = remainingTiles.slice();
    let tilePool = convertHandToTileIndexArray(availableTiles);

    if (tilePool.length < handSize) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    let hand = Array(38).fill(0);

    for (let i = 0; i < handSize; i++) {
        let tile = removeRandomItem(tilePool);
        hand[tile]++;
        availableTiles[tile]--;
    }

    for (let i = handSize, j = 0; i < 14; j++, i += 3) {
        hand[j + 31] += 3;
    }

    return {
        hand,
        availableTiles,
        tilePool
    };
}

/**
 * Adds a number of tiles to the given hand.
 * @param {TileCounts} remainingTiles The number of each tile in the wall.
 * @param {TileCounts} hand The number of each tile in the player's hand.
 * @param {number} tilesToFill How many tiles to add.
 */
export function fillHand(remainingTiles, hand, tilesToFill) {
    let availableTiles = remainingTiles.slice();
    let tilePool = convertHandToTileIndexArray(availableTiles);

    if (tilePool.length < tilesToFill) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    for (let i = 0; i < tilesToFill; i++) {
        let tile = removeRandomItem(tilePool);
        hand[tile]++;
        availableTiles[tile]--;
    }

    return {
        hand,
        availableTiles,
        tilePool
    };
}