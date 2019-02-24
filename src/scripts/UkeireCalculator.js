import { convertRedFives } from "./TileConversions";

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
    let convertedHand = convertRedFives(hand);
    let convertedTiles = convertRedFives(remainingTiles);

    if (baseShanten === -2) {
        baseShanten = shantenFunction(hand);
    }

    let ukeire = 0;

    // Check adding every tile to see if it improves the shanten
    for (let addedTile = 1; addedTile < convertedHand.length; addedTile++) {
        if (remainingTiles[addedTile] === 0) continue;
        if (addedTile % 10 === 0) continue;

        convertedHand[addedTile]++;

        if (shantenFunction(convertedHand) < baseShanten) {
            ukeire += convertedTiles[addedTile];
        }

        convertedHand[addedTile]--;
    }

    return ukeire;
}

export function CalculateUkeireFromOnlyHand(hand, existingTiles, shantenFunction) {
    let convertedHand = convertRedFives(hand);
    let remainingTiles = convertRedFives(existingTiles);

    for (let i = 0; i < remainingTiles.length; i++) {
        existingTiles[i] = Math.max(0, existingTiles[i] - convertedHand[i]);
    }

    return CalculateUkeire(convertedHand, existingTiles, shantenFunction);
}