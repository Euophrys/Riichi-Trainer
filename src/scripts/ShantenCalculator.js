import { convertRedFives } from "./TileConversions";

// Converted from http://cmj3.web.fc2.com/#syanten

let hand = new Array(38);
let completeSets;
let pair;
let partialSets;
let bestShanten;

export function CalculateMinimumShanten(handToCheck) {
    let standardShanten = CalculateStandardShanten(handToCheck);
    let chiitoiShanten = CalculateChiitoitsuShanten(handToCheck);
    let kokushiShanten = CalculateKokushiShanten(handToCheck);

    return Math.min(standardShanten, chiitoiShanten, kokushiShanten);
}

export function CalculateKnittedShanten(handToCheck) {
    let honorsCount = 0;

    for (let i = 31; i < handToCheck.length; i++) {
        if (handToCheck[i] >= 1) {
            honorsCount++;
        }
    }

    let bestKnittedStraight = findMostViableKnittedStraight(handToCheck);
    let knittedAndHonorsShanten = 13 - bestKnittedStraight.length - honorsCount;

    let hand = handToCheck.slice();
    for (let i = 0; i < bestKnittedStraight.length; i++) {
        hand[bestKnittedStraight[i]]--;
    }

    let knittedStraightShanten = 9 - bestKnittedStraight.length;
    let standardShanten = CalculateStandardShanten(hand);
    let combinedShanten = standardShanten - Math.floor(bestKnittedStraight / 3) * 2;

    return Math.min(combinedShanten, knittedAndHonorsShanten);
}

function findMostViableKnittedStraight(handToCheck) {
    let possibilites = [
        [1, 4, 7, 12, 15, 18, 23, 26, 29],
        [1, 4, 7, 22, 25, 28, 13, 16, 19],
        [11, 14, 17, 22, 25, 28, 3, 6, 9],
        [11, 14, 17, 2, 5, 8, 23, 26, 29],
        [21, 24, 27, 2, 5, 8, 13, 16, 19],
        [21, 24, 27, 12, 15, 18, 3, 6, 9]
    ];

    let best = [];

    for (let i = 0; i < possibilites.length; i++) {
        let current = [];

        for (let j = 0; j < possibilites[i].length; j++) {
            if (handToCheck[possibilites[i][j]] >= 1) {
                current.push(possibilites[i][j]);
            }
        }

        if (current.length > best.length) {
            best = current.slice();

            // 9 is the best case scenario
            if (best.length === 9) return best;
        }
    }

    return best;
}

// Seven Pairs
function CalculateChiitoitsuShanten(handToCheck) {
    hand = convertRedFives(handToCheck);
    let pairCount = 0, uniqueTiles = 0;

    for (let i = 1; i < hand.length; i++) {
        if (handToCheck[i] === 0) continue;

        uniqueTiles++;

        if (handToCheck[i] >= 2) {
            pairCount++;
        }
    }

    let shanten = 6 - pairCount;

    if (uniqueTiles < 7) {
        shanten += 7 - uniqueTiles;
    }

    return shanten;
}

// Thirteen Orphans
function CalculateKokushiShanten(handToCheck) {
    hand = convertRedFives(handToCheck);
    let uniqueTiles = 0;
    let hasPair = 0;

    for (let i = 1; i < hand.length; i++) {
        if (i % 10 === 1 || i % 10 === 9 || i > 30) {
            if (handToCheck[i] !== 0) {
                uniqueTiles++;

                if (handToCheck[i] >= 2) {
                    hasPair = 1;
                }
            }
        }
    }

    return 13 - uniqueTiles - hasPair;
}

export function CalculateStandardShanten(handToCheck) {
    hand = convertRedFives(handToCheck);

    // Initialize variables
    completeSets = 0;
    pair = 0;
    partialSets = 0;
    bestShanten = 8;

    // Loop through hand, removing all pair candidates and checking their shanten
    for (let i = 1; i < hand.length; i++) {
        if (hand[i] >= 2) {
            pair++;
            hand[i] -= 2;
            RemoveCompletedSets(1);
            hand[i] += 2;
            pair--;
        }
    }

    // Check shanten when there's nothing used as a pair
    RemoveCompletedSets(1);

    return bestShanten;
}

// Removes all possible combinations of complete sets from the hand and checks the shanten of each.
function RemoveCompletedSets(i) {
    // Skip to the next tile that exists in the hand.
    for (; i < hand.length && hand[i] === 0; i++) { }

    if (i >= hand.length) {
        // We've gone through the whole hand, now check for partial sets.
        RemovePotentialSets(1);
        return;
    }

    // Pung
    if (hand[i] >= 3) {
        completeSets++;
        hand[i] -= 3;
        RemoveCompletedSets(i);
        hand[i] += 3;
        completeSets--;
    }

    // Chow
    if (i < 30 && hand[i + 1] !== 0 && hand[i + 2] !== 0) {
        completeSets++;
        hand[i]--; hand[i + 1]--; hand[i + 2]--;
        RemoveCompletedSets(i);
        hand[i]++; hand[i + 1]++; hand[i + 2]++;
        completeSets--;
    }

    // Check all alternative hand configurations
    RemoveCompletedSets(i + 1);
}

function RemovePotentialSets(i) {
    // Skip to the next tile that exists in the hand
    for (; i < hand.length && hand[i] === 0; i++) { }

    if (i >= hand.length) {
        // We've checked everything. See if this shanten is better than the current best.
        let currentShanten = 8 - (completeSets * 2) - partialSets - pair;
        if (currentShanten < bestShanten) {
            bestShanten = currentShanten;
        }
        return;
    }

    // A standard hand will only ever have four groups plus a pair.
    if (completeSets + partialSets < 4) {
        // Pair
        if (hand[i] === 2) {
            partialSets++;
            hand[i] -= 2;
            RemovePotentialSets(i);
            hand[i] += 2;
            partialSets--;
        }

        // Edge or Side wait protorun
        if (i < 30 && hand[i + 1] !== 0) {
            partialSets++;
            hand[i]--; hand[i + 1]--;
            RemovePotentialSets(i);
            hand[i]++; hand[i + 1]++;
            partialSets--;
        }

        // Closed wait protorun
        if (i < 30 && i % 10 <= 8 && hand[i + 2] !== 0) {
            partialSets++;
            hand[i]--; hand[i + 2]--;
            RemovePotentialSets(i);
            hand[i]++; hand[i + 2]++;
            partialSets--;
        }
    }

    // Check all alternative hand configurations
    RemovePotentialSets(i + 1);
}

export default CalculateMinimumShanten;