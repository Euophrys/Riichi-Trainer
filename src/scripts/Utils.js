import { convertHandToTileIndexArray } from "./HandConversions";

/**
 * Generates a random number between min (inclusive) and max (exclusive).
 * @param {number} max The maximum value to generate, exclusive
 * @param {number} min The minimum value to generate, inclusive
 * @returns {number} A random number between min (inclusive) and max (exclusive).
 */
export function randomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Gets a random item in an array.
 * @param {any[]} array An array of items.
 * @returns {any} A random item from the array.
 */
export function getRandomItem(array) {
    return array[randomInt(array.length)];
}

/**
 * Removes a random item from an array and returns it.
 * @param {any[]} array An array of items.
 * @returns {any} The removed item.
 */
export function removeRandomItem(array) {
    return array.splice(randomInt(array.length), 1)[0];
}

/**
 * Randomizes the order of elements in an array.
 * @param {any[]} array An array of items.
 * @returns The randomized array.
 */
export function shuffleArray(array) {
    var currentIndex = array.length, tmp, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = randomInt(currentIndex);
      currentIndex -= 1;
  
      tmp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = tmp;
    }
  
    return array;
}

/**
 * Snaps the given fu value to valid fu values.
 * @param {number} fu The current value for the fu.
 * @param {number} previousFu The previous value for the fu.
 * @returns {number} The snapped fu.
 */
export function validateFu(fu, previousFu) {
    fu = Math.max(fu, 20);

    if (fu !== 25) {
        if (fu < previousFu) {
            fu = Math.floor(fu / 10) * 10;
        } else {
            fu = Math.ceil(fu / 10) * 10;
        }
    }

    fu = Math.min(fu, 130);

    return fu;
}

/**
 * Calculates how much further ahead in shanten the hand is compared to what the calculateStandardShanten function would return.
 * @param {number[]} hand An array containing the number of each tile present in the hand.
 * @returns {number} How many shanten the hand is offset by.
 */
export function getShantenOffset(hand) {
    let tiles = convertHandToTileIndexArray(hand);
    let offset = Math.floor((14 - tiles.length) / 3) * 2;
    return offset;
}

/**
 * Converts a character, such as "p", to a suit base, such as 10.
 * @param {string} character The character to convert.
 */
export function characterToSuit(character) {
    if (character === "m" || character === "w" || character === "c") {
        return 0;
    }

    if (character === "p") {
        return 10;
    }

    if (character === "s" || character === "b") {
        return 20;
    }

    if (character === "z" || character === "h") {
        return 30;
    }

    return -1;
}

/**
 * Gets the suit character for a tile.
 * @param {TileIndex} index The tile to get the suit letter of.
 */
export function suitCharacterFromTile(index) {
    let tensPlace = index % 10;

    switch (tensPlace) {
        case 0:
            return "m";
        case 1:
            return "p";
        case 2:
            return "s";
        case 3:
            return "z";
        default:
            return -1;
    }
}