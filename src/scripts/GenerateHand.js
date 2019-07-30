
export function generateHand(remainingTiles) {
    let tilePool = [];
    let availableTiles = remainingTiles.slice();

    for (let i = 0; i < availableTiles.length; i++) {
        if (availableTiles[i] === 0) continue;

        for (let j = 0; j < availableTiles[i]; j++) {
            tilePool.push(i);
        }
    }

    if (tilePool.length < 14) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    let hand = Array(38).fill(0);

    for (let i = 0; i < 14; i++) {
        let tile = tilePool.splice(Math.random() * tilePool.length, 1);
        hand[tile]++;
        availableTiles[tile]--;
    }

    return {
        hand,
        availableTiles,
        tilePool
    };
}

export function fillHand(availableTiles, hand, tilesToFill) {
    let tilePool = [];

    for (let i = 0; i < availableTiles.length; i++) {
        if (availableTiles[i] === 0) continue;

        for (let j = 0; j < availableTiles[i]; j++) {
            tilePool.push(i);
        }
    }

    if (tilePool.length < tilesToFill) return { hand: undefined, availableTiles: undefined, tilePool: undefined };

    for (let i = 0; i < tilesToFill; i++) {
        let tile = tilePool.splice(Math.random() * tilePool.length, 1);
        hand[tile]++;
        availableTiles[tile]--;
    }

    return {
        hand,
        availableTiles,
        tilePool
    };
}