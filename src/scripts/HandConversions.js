import { convertTenhouTilesToIndex } from './TileConversions';
import { SUIT_CHARACTERS, ASCII_TILES } from '../Constants';

/**
 * Converts a hand array into a Tenhou hand string, such as 234m567s.
 * @param {TileCounts} hand An array containing the number of each tile present in the hand.
 * @returns {string} The Tenhou hand string.
 */
export function convertHandToTenhouString(hand) {
    let handString = "";
    let valuesInSuit = "";

    for (let suit = 0; suit < 4; suit++) {
        for (let i = suit * 10 + 1; i < suit * 10 + 10; i++) {
            let value = i % 10;

            // If we're at the fives, add the zeroes here, if there are any (0 = red five).
            if (value === 5 && hand[i - 5] > 0) {
                for (let j = 0; j < hand[i - 5]; j++) {
                    valuesInSuit += 0;
                }
            }
    
            for (let j = 0; j < hand[i]; j++) {
                valuesInSuit += value;
            }
        }
    
        // Don't add to the hand if there are no values in the suit, to avoid having random letters.
        if (valuesInSuit !== "") {
            handString += valuesInSuit + SUIT_CHARACTERS[suit];
            valuesInSuit = "";
        }
    };

    return handString;
}

/**
 * Converts a hand array into a string of ASCII characters.
 * @param {TileCounts} hand An array containing the number of each tile present in the hand.
 * @returns {string} ASCII representation of the hand
 */
export function convertHandToAsciiSymbols(hand) {
    let result = "";
    
    for(let i = 0; i < hand.length; i++) {
        for(let j = 0; j < hand[i]; j++) {
            result += ASCII_TILES[i];
        }
    }

    return result;
}

/**
 * Converts a Tenhou hand from a replay into a hand array.
 * @param {string} tenhouHand String of a Tenhou replay hand
 * @returns {TileCounts} An array containing the number of each tile present in the hand.
 */
export function convertTenhouHandToHand(tenhouHand) {
    let handTiles = tenhouHand.split(",");
    let convertedTiles = convertTenhouTilesToIndex(handTiles);
    let hand = Array(38).fill(0);

    for(let i = 0; i < convertedTiles.length; i++) {
        hand[convertedTiles[i]]++;
    }

    return hand;
}

/** An array of the emoji for each tile. */
const emoji = [":0m:", ":1m:", ":2m:", ":3m:", ":4m:", ":5m:", ":6m:", ":7m:", ":8m:", ":9m:", 
                ":0p:", ":1p:", ":2p:", ":3p:", ":4p:", ":5p:", ":6p:", ":7p:", ":8p:", ":9p:", 
                ":0s:", ":1s:", ":2s:", ":3s:", ":4s:", ":5s:", ":6s:", ":7s:", ":8s:", ":9s:", 
                ":baka:", ":1z:", ":2z:", ":3z:", ":4z:", ":5z:", ":6z:", ":7z:" ];

/**
 * Converts a hand array into a string of emoji for use on the Discord.
 * @param {TileCounts} hand An array containing the number of each tile present in the hand.
 * @returns {string} A string of discord emoji.
 */
export function convertHandToDiscordEmoji(hand) {
    let result = "";
    
    for(let i = 0; i < hand.length; i++) {
        if (i % 10 === 5 && hand[i - 5] > 0) {
            result += emoji[i - 5];
        }

        if(i % 10 === 0) continue;
        
        for(let j = 0; j < hand[i]; j++) {
            result += emoji[i];
        }
    }

    return result;
}

/**
 * Converts a hand array into an array of tile indexes.
 * @param {TileCounts} hand An array containing the number of each tile present in the hand.
 * @returns {TileIndex[]} An array of tile indexes.
 */
export function convertHandToTileIndexArray(hand) {
    let result = [];

    for(let i = 0; i < hand.length; i++) {
        for(let j = 0; j < hand[i]; j++) {
            result.push(i);
        }
    }

    return result;
}