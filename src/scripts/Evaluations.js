import { getRandomItem } from "./Utils";

/**
 * Determines the best tile to discard when given tiles with equal ukeire.
 * @param {UkeireObject[]} ukeireObjects The ukeire objects for each discard.
 * @param {TileIndex} dora The current dora.
 */
export function evaluateBestDiscard(ukeireObjects, dora = -1) {
    let ukeire = ukeireObjects.map(o => o.value);
    let bestUkeire = Math.max(...ukeire);
    let bests = [];

    for (let i = 0; i < ukeire.length; i++) {
        if (ukeire[i] === bestUkeire) {
            bests.push(i);
        }
    }
    
    if (!bests.length) return -1;
    if (bests.length === 1) return bests[0];
    
    // Avoid suggesting to discard the dora.
    if (bests.indexOf(dora) > -1) bests.splice(bests.indexOf(dora), 1);
    
    // Suggest discarding winds first, then dragons, if any are present.
    if (bests.indexOf(32) > -1) return 32;
    if (bests.indexOf(33) > -1) return 33;
    if (bests.indexOf(34) > -1) return 34;
    if (bests.indexOf(31) > -1) return 31;
    if (bests.indexOf(35) > -1) return 35;
    if (bests.indexOf(36) > -1) return 36;
    if (bests.indexOf(37) > -1) return 37;

    // Suggest discarding terminals.
    for (let i = 1; i < 10; i += 8) {
        for (let j = 0; j < 3; j++) {
            let tile = j + i;

            if (bests.indexOf(tile) > -1) return tile;
        }
    }

    // Suggest discarding twos and eights.
    for (let i = 2; i < 10; i += 6) {
        for (let j = 0; j < 3; j++) {
            let tile = j + i;

            if (bests.indexOf(tile) > -1) return tile;
        }
    }

    // Suggest a random remaining tile (all are between 3 and 7)
    return getRandomItem(bests);
}

/**
 * Calculates the safety rating for each tile in the player's hand.
 * @param {TileCounts} hand An array containing the number of each tile present in the hand.
 * @param {TileIndex[]} opponentDiscards An array of tile indexes representing the opponent's discard pool.
 * @param {TileCounts} remainingTiles An array containing the number of each tile the player cannot see.
 * @param {TileIndex[]} tilesDiscardedAfterRiichi An array of tile indexes discarded after the opponent declared riichi.
 * @param {TileIndex} riichiTile The tile index of the tile the opponent declared riichi with.
 */
export function evaluateDiscardSafety(hand, opponentDiscards, remainingTiles, tilesDiscardedAfterRiichi, riichiTile) {
    let safetyRanks = Array(38).fill(0);

    for(let i = 0; i < hand.length; i++) {
        if(hand[i] <= 0) continue;

        // Genbutsu
        if(opponentDiscards.indexOf(i) >= 0 || tilesDiscardedAfterRiichi.indexOf(i) >= 0) {
            safetyRanks[i] = 15;
            continue;
        }

        if(i < 30 && (i % 10 === 1 || i % 10 === 9)) {
            // Terminal
            if(checkIfIsSuji(i, opponentDiscards, remainingTiles, riichiTile)) {
                safetyRanks[i] = 14 - remainingTiles[i];
            } else {
                safetyRanks[i] = 5;
            }
            continue;
        }

        if(i > 30) {
            // Honor
            switch(remainingTiles[i]) {
                case 0:
                    safetyRanks[i] = 14; break;
                case 1:
                    safetyRanks[i] = 13; break;
                case 2:
                    safetyRanks[i] = 10; break;
                default: // 3 remain
                    safetyRanks[i] =  6; break;
            }
            continue;
        }

        if(checkIfIsSuji(i, opponentDiscards, remainingTiles, riichiTile)) {
            switch(i % 10) {
                case 4:
                case 5:
                case 6:
                    safetyRanks[i] = 9;
                    break;
                case 2:
                case 8:
                    safetyRanks[i] = 8;
                    break;
                default: // 3 or 7
                    safetyRanks[i] = 7;
                    break;
            }
        } else {
            switch(i % 10) {
                case 4:
                case 5:
                case 6:
                    safetyRanks[i] = 1;
                    break;
                case 2:
                case 8:
                    safetyRanks[i] = 3;
                    break;
                default: // 3 or 7
                    safetyRanks[i] = 2;
                    break;
            }
        }
    }

    return safetyRanks;
}

/**
 * Returns true if the given tile is a suji of one of the opponent's discarded tiles, and false otherwise.
 * @param {TileIndex} tile The tile index to check.
 * @param {TileIndex[]} opponentDiscards The tiles the opponent has discarded.
 * @param {TileCounts} remainingTiles An array containing the number of each tile the player cannot see.
 * @param {TileIndex} riichiTile The tile index of the tile the opponent declared riichi with.
 */
function checkIfIsSuji(tile, opponentDiscards, remainingTiles, riichiTile) {
    let sujiA = tile - 3;
    let sujiB = tile + 3;

    let sujiAPassed = false;
    let sujiBPassed = false;

    if(sujiA % 10 === 0 || Math.floor(sujiA / 10) !== Math.floor(tile / 10)) {
        sujiAPassed = true;
    } else {
        // Riichi suji isn't seen as safe, so just ignore it
        if(sujiA === riichiTile) return false;

        sujiAPassed = opponentDiscards.indexOf(sujiA) >= 0;
        sujiAPassed = sujiAPassed || remainingTiles[sujiA + 1] === 0 || remainingTiles[sujiA + 2] === 0;
    }

    if(sujiB % 10 === 0 || Math.floor(sujiB / 10) !== Math.floor(tile / 10)) {
        sujiBPassed = true;
    } else {
        // Riichi suji isn't seen as safe, so just ignore it
        if(sujiB === riichiTile) return false;

        sujiBPassed = opponentDiscards.indexOf(sujiB) >= 0;
        sujiBPassed = sujiBPassed || remainingTiles[sujiB - 1] === 0 || remainingTiles[sujiB - 2] === 0;
    }

    return sujiAPassed && sujiBPassed;
}