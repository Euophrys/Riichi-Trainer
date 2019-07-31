import { removeRandomItem } from "./Utils";
import { convertHandToTileIndexArray } from "./HandConversions";

export function generateHand(remainingTiles) {
    let availableTiles = remainingTiles.slice();
    let tilePool = convertHandToTileIndexArray(availableTiles);

    if (tilePool.length < 14) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    let hand = Array(38).fill(0);

    for (let i = 0; i < 14; i++) {
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