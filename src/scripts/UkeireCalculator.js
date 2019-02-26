import { convertRedFives } from "./TileConversions";
import { evaluateBestDiscard } from './Evaluations';

export function CalculateDiscardUkeire(hand, remainingTiles, shantenFunction) {
    let results = Array(hand.length).fill(0);
    let baseShanten = shantenFunction(hand);

    for (let handIndex = 0; handIndex < hand.length; handIndex++) {
        if (hand[handIndex] === 0) continue;

        hand[handIndex]--;
        let ukeire = CalculateUkeire(hand, remainingTiles, shantenFunction, baseShanten).value;
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

    let value = 0;
    let tiles = [];

    // Check adding every tile to see if it improves the shanten
    for (let addedTile = 1; addedTile < convertedHand.length; addedTile++) {
        if (remainingTiles[addedTile] === 0) continue;
        if (addedTile % 10 === 0) continue;

        convertedHand[addedTile]++;

        if (shantenFunction(convertedHand) < baseShanten) {
            value += convertedTiles[addedTile];
            tiles.push(addedTile);
        }

        convertedHand[addedTile]--;
    }

    return {
        value,
        tiles
    };
}

export function CalculateDiscardUkeireUpgrades(hand, remainingTiles, shantenFunction) {
    let results = Array(hand.length).fill(0);
    let baseShanten = shantenFunction(hand);
    let baseUkeire = CalculateUkeire(hand, remainingTiles, shantenFunction).value;

    for (let handIndex = 0; handIndex < hand.length; handIndex++) {
        if (hand[handIndex] === 0) continue;

        hand[handIndex]--;
        let ukeire = CalculateUkeireUpgrades(hand, remainingTiles, shantenFunction, baseShanten, baseUkeire).value;
        hand[handIndex]++;

        // Write the results into the array
        for (let i = 0; i < hand[handIndex]; i++) {
            results[handIndex] = ukeire;
        }
    }

    return results;
}

export function CalculateUkeireUpgrades(hand, remainingTiles, shantenFunction, baseShanten = -2, baseUkeire = -1) {
    let convertedHand = convertRedFives(hand);
    let convertedTiles = convertRedFives(remainingTiles);

    if (baseShanten === -2) {
        baseShanten = shantenFunction(hand);
    }

    if (baseUkeire === -1) {
        baseUkeire = CalculateUkeire(hand, remainingTiles, shantenFunction).value;
    }

    let value = 0;
    let tiles = [];

    // Check adding every tile to see if it improves the ukeire
    for (let addedTile = 1; addedTile < convertedHand.length; addedTile++) {
        if (remainingTiles[addedTile] === 0) continue;
        if (addedTile % 10 === 0) continue;

        convertedHand[addedTile]++;

        if (shantenFunction(convertedHand) === baseShanten
            && CalculateUkeire(convertedHand, remainingTiles, shantenFunction).value > baseUkeire) {
            let discards = CalculateDiscardUkeire(convertedHand, remainingTiles, shantenFunction);
            let bestDiscard = evaluateBestDiscard(discards);

            convertedHand[bestDiscard]--;

            if(addedTile !== bestDiscard) {
                let newUkeire = CalculateUkeire(convertedHand, remainingTiles, shantenFunction).value;

                if(newUkeire > baseUkeire) {
                    value += convertedTiles[addedTile];
                    tiles.push({tile: addedTile, discard: bestDiscard, count: convertedTiles[addedTile], resultingUkeire: newUkeire});
                }
            }

            convertedHand[bestDiscard]++;
        }

        convertedHand[addedTile]--;
    }

    return {
        value,
        tiles
    };
}

export function CalculateUkeireFromOnlyHand(hand, existingTiles, shantenFunction) {
    let convertedHand = convertRedFives(hand);
    let remainingTiles = convertRedFives(existingTiles);

    for (let i = 0; i < remainingTiles.length; i++) {
        existingTiles[i] = Math.max(0, existingTiles[i] - convertedHand[i]);
    }

    return CalculateUkeire(convertedHand, existingTiles, shantenFunction);
}