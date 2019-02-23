export function CalculateDiscardUkeire(hand, remainingTiles, shantenFunction) {
    let results = Array(hand.length).fill(0);
    let baseShanten = shantenFunction(hand);

    for (let handIndex = 0; handIndex < hand.length; handIndex++) {
        if (hand[handIndex] === 0) continue;

        hand[handIndex]--;
        let ukeire = CalculateUkeire(hand, remainingTiles, shantenFunction, baseShanten);
        hand[handIndex]++;

        // Write the results into the array
        for (let i = 0; i < hand[handIndex]; i++) {
            results[handIndex] = ukeire;
        }
    }

    return results;
}

export function CalculateUkeire(hand, remainingTiles, shantenFunction, baseShanten = -2) {
    if (baseShanten === -2) {
        baseShanten = shantenFunction(hand);
    }

    let ukeire = 0;

    // Check adding every tile to see if it improves the shanten
    for (let addedTile = 1; addedTile < hand.length; addedTile++) {
        if (remainingTiles[addedTile] === 0) continue;
        if (addedTile % 10 === 0) continue;

        hand[addedTile]++;

        if (shantenFunction(hand) < baseShanten) {
            ukeire += remainingTiles[addedTile];
        }

        hand[addedTile]--;
    }

    return ukeire;
}

export function CalculateUkeireFromOnlyHand(hand, existingTiles, shantenFunction) {
    for (let i = 0; i < existingTiles.length; i++) {
        if (i % 10 === 0) {
            existingTiles[i + 5] += existingTiles[i];
            existingTiles[i] = 0;
            continue;
        }

        existingTiles[i] = Math.max(0, existingTiles[i] - hand[i]);
    }

    return CalculateUkeire(hand, existingTiles, shantenFunction);
}