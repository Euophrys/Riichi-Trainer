import { convertRedFives } from "./TileConversions";
import { evaluateBestDiscard } from './Evaluations';
import { getShantenOffset } from "./Utils";

export function calculateDiscardUkeire(hand, remainingTiles, shantenFunction, baseShanten = -2, shantenOffset = -2) {
    let results = Array(hand.length).fill(0);
    let convertedHand = convertRedFives(hand);

    if(shantenOffset === -2) {
        shantenOffset = getShantenOffset(convertedHand);
    }

    if (baseShanten === -2) {
        baseShanten = shantenFunction(convertedHand) - shantenOffset;
    }

    // Check the ukeire of each hand that results from each discard
    for (let handIndex = 0; handIndex < convertedHand.length; handIndex++) {
        if (convertedHand[handIndex] === 0) {
            results[handIndex] = {value: 0, tiles: []};
            continue;
        }

        convertedHand[handIndex]--;
        let ukeire = calculateUkeire(convertedHand, remainingTiles, shantenFunction, baseShanten, shantenOffset);
        convertedHand[handIndex]++;

        results[handIndex] = ukeire;
    }

    return results;
}

export function calculateUkeire(hand, remainingTiles, shantenFunction, baseShanten = -2, shantenOffset = -2) {
    let convertedHand = convertRedFives(hand);
    let convertedTiles = convertRedFives(remainingTiles);

    if(shantenOffset === -2) {
        shantenOffset = getShantenOffset(convertedHand);
    }

    if (baseShanten === -2) {
        baseShanten = shantenFunction(convertedHand) - shantenOffset;
    }

    let value = 0;
    let tiles = [];

    // Check adding every tile to see if it improves the shanten
    for (let addedTile = 1; addedTile < convertedHand.length; addedTile++) {
        if (remainingTiles[addedTile] === 0) continue;
        if (addedTile % 10 === 0) continue;

        convertedHand[addedTile]++;

        if (shantenFunction(convertedHand) - shantenOffset < baseShanten) {
            // Improves shanten. Add the number of remaining tiles to the ukeire count
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

export function calculateDiscardUkeireUpgrades(hand, remainingTiles, shantenFunction) {
    let results = Array(hand.length).fill(0);
    let convertedHand = convertRedFives(hand);
    let shantenOffset = getShantenOffset(convertedHand);
    let baseShanten = shantenFunction(convertedHand) - shantenOffset;
    let baseUkeire = calculateUkeire(convertedHand, remainingTiles, shantenFunction, baseShanten, shantenOffset).value;

    for (let handIndex = 0; handIndex < hand.length; handIndex++) {
        if (hand[handIndex] === 0) continue;

        hand[handIndex]--;
        let ukeire = calculateUkeireUpgrades(convertedHand, remainingTiles, shantenFunction, baseShanten, baseUkeire, shantenOffset);
        hand[handIndex]++;

        for (let i = 0; i < hand[handIndex]; i++) {
            results[handIndex] = ukeire;
        }
    }

    return results;
}

export function calculateUkeireUpgrades(hand, remainingTiles, shantenFunction, baseShanten = -2, baseUkeire = -1, shantenOffset = -2) {
    let convertedHand = convertRedFives(hand);
    let convertedTiles = convertRedFives(remainingTiles);

    if(shantenOffset === -2) {
        shantenOffset = getShantenOffset(convertedHand);
    }

    if (baseShanten === -2) {
        baseShanten = shantenFunction(convertedHand);
    }

    if (baseUkeire === -1) {
        baseUkeire = calculateUkeire(hand, remainingTiles, shantenFunction, baseShanten, shantenOffset).value;
    }

    let value = 0;
    let tiles = [];

    // Check adding every tile to see if it improves the ukeire
    for (let addedTile = 1; addedTile < convertedHand.length; addedTile++) {
        if (remainingTiles[addedTile] === 0) continue;
        if (addedTile % 10 === 0) continue;

        convertedHand[addedTile]++;
        remainingTiles[addedTile]--;

        if (shantenFunction(convertedHand) - shantenOffset === baseShanten
            && calculateUkeire(convertedHand, remainingTiles, shantenFunction, baseShanten, shantenOffset).value > baseUkeire) {
            let discards = calculateDiscardUkeire(convertedHand, remainingTiles, shantenFunction, baseShanten, shantenOffset);
            let bestDiscard = evaluateBestDiscard(discards);

            convertedHand[bestDiscard]--;

            if(addedTile !== bestDiscard) {
                let newUkeire = calculateUkeire(convertedHand, remainingTiles, shantenFunction, baseShanten, shantenOffset).value;

                if(newUkeire > baseUkeire) {
                    value += convertedTiles[addedTile];
                    tiles.push({tile: addedTile, discard: bestDiscard, count: convertedTiles[addedTile], resultingUkeire: newUkeire});
                }
            }

            convertedHand[bestDiscard]++;
        }

        convertedHand[addedTile]--;
        remainingTiles[addedTile]++;
    }

    return {
        value,
        tiles
    };
}

export function calculateUkeireFromOnlyHand(hand, existingTiles, shantenFunction) {
    let convertedHand = convertRedFives(hand);
    let remainingTiles = convertRedFives(existingTiles);

    for (let i = 0; i < remainingTiles.length; i++) {
        existingTiles[i] = Math.max(0, existingTiles[i] - convertedHand[i]);
    }

    return calculateUkeire(convertedHand, existingTiles, shantenFunction);
}