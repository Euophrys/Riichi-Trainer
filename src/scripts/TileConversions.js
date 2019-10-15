import oneMan from '../tileImages_black/1m.png';
import twoMan from '../tileImages_black/2m.png';
import threeMan from '../tileImages_black/3m.png';
import fourMan from '../tileImages_black/4m.png';
import fiveMan from '../tileImages_black/5m.png';
import redFiveMan from '../tileImages_black/0m.png';
import sixMan from '../tileImages_black/6m.png';
import sevenMan from '../tileImages_black/7m.png';
import eightMan from '../tileImages_black/8m.png';
import nineMan from '../tileImages_black/9m.png';
import oneSou from '../tileImages_black/1s.png';
import twoSou from '../tileImages_black/2s.png';
import threeSou from '../tileImages_black/3s.png';
import fourSou from '../tileImages_black/4s.png';
import fiveSou from '../tileImages_black/5s.png';
import redFiveSou from '../tileImages_black/0s.png';
import sixSou from '../tileImages_black/6s.png';
import sevenSou from '../tileImages_black/7s.png';
import eightSou from '../tileImages_black/8s.png';
import nineSou from '../tileImages_black/9s.png';
import onePin from '../tileImages_black/1p.png';
import twoPin from '../tileImages_black/2p.png';
import threePin from '../tileImages_black/3p.png';
import fourPin from '../tileImages_black/4p.png';
import fivePin from '../tileImages_black/5p.png';
import redFivePin from '../tileImages_black/0p.png';
import sixPin from '../tileImages_black/6p.png';
import sevenPin from '../tileImages_black/7p.png';
import eightPin from '../tileImages_black/8p.png';
import ninePin from '../tileImages_black/9p.png';
import east from '../tileImages_black/1z.png';
import south from '../tileImages_black/2z.png';
import west from '../tileImages_black/3z.png';
import north from '../tileImages_black/4z.png';
import haku from '../tileImages_black/5z.png';
import hatsu from '../tileImages_black/6z.png';
import chun from '../tileImages_black/7z.png';
import back from '../tileImages_black/back.png';
import { convertHandToTenhouString } from './HandConversions';
import { SUIT_CHARACTERS, ASCII_TILES } from '../Constants';
import { characterToSuit } from './Utils';

/** Array of png images for each tile. */
const images = [
    redFiveMan, oneMan, twoMan, threeMan, fourMan, fiveMan, sixMan, sevenMan, eightMan, nineMan,
    redFivePin, onePin, twoPin, threePin, fourPin, fivePin, sixPin, sevenPin, eightPin, ninePin,
    redFiveSou, oneSou, twoSou, threeSou, fourSou, fiveSou, sixSou, sevenSou, eightSou, nineSou,
    back, east, south, west, north, haku, hatsu, chun
];

/** Array of localization keys for each number tile value. */
const valueKeys = ["values.redFive", "values.one", "values.two", "values.three", "values.four", "values.five", "values.six", "values.seven", "values.eight", "values.nine"];
/** Array of localization keys for each suit. */
const suitKeys = ["suits.characters", "suits.circles", "suits.bamboo"];
/** Array of localization keys for each honor tile value. */
const honorKeys = ["values.hidden", "values.east", "values.south", "values.west", "values.north", "values.white", "values.green", "values.red"];

/**
 * Gets the png image for the given tile index for use in src tags.
 * @param {TileIndex} index The tile index.
 * @returns {string} Tile image png, for use in src tags.
 */
export function getTileImage(index) {
    return images[index];
}

/**
 * Converts a tile index into that tile's name.
 * @param {Function} t The i18next translation function.
 * @param {TileIndex} index The index of the tile to name.
 * @param {boolean} verbose Whether to give the full name of the tile, or the short representation. Defaults to true.
 * @returns {string} The name of the tile.
 */
export function getTileAsText(t, index, verbose = true) {
    if (index >= 30) {
        return t(honorKeys[index - 30]);
    }

    if (verbose) {
        const value = valueKeys[index % 10];
        const suit = suitKeys[Math.floor(index / 10)];

        return t("shuupai", { value: t(value), suit: t(suit) });
    }
    else {
        const value = index % 10;

        const suit = SUIT_CHARACTERS[Math.floor(index / 10)];

        return `${value}${suit}`;
    }
}

/**
 * Converts red fives to normal fives.
 * @param {TileIndex|TileIndex[]} tiles The tile index to convert, or an array of tile indexes.
 * @returns {TileIndex|TileIndex[]} The converted tile(s).
 */
export function convertRedFives(tiles) {
    if (typeof tiles === 'number') {
        if (tiles % 10 === 0) {
            return tiles + 5;
        }
    }

    if (typeof tiles === 'object' && tiles.length) {
        let result = tiles.slice();

        for (let i = 0; i < 30; i += 10) {
            result[i + 5] += result[i];
            result[i] = 0;
        }

        return result;
    }

    return tiles;
}

/**
 * Converts a tile or array of tiles into their ascii representations.
 * @param {TileIndex|TileIndex[]} tiles The tile index to convert, or an array of tile indexes.
 * @returns {string|string[]} The ascii representation of the tile(s).
 */
export function convertTilesToAsciiSymbols(tiles) {
    if (typeof tiles === 'number') {
        return ASCII_TILES[tiles];
    }

    if (typeof tiles === 'object' && tiles.length) {
        let result = "";

        for (let i = 0; i < tiles.length; i++) {
            result += ASCII_TILES[tiles[i]];
        }

        return result;
    }

    return "";
}

/**
 * Converts a tile or array of tiles into a Tenhou-style string, such as 234m567s.
 * @param {TileIndex|TileIndex[]} indexes The tile index to convert, or an array of tile indexes.
 * @returns {string} The hand string, or "Error." if an invalid parameter was given.
 */
export function convertIndexesToTenhouTiles(indexes) {
    let hand = Array(38).fill(0);

    if (typeof indexes === 'number') {
        hand[indexes] = 1;
    } else if (typeof indexes === 'object' && indexes.length) {
        for (let i = 0; i < indexes.length; i++) {
            hand[indexes[i]] += 1;
        }
    } else {
        return "Error."
    }

    return convertHandToTenhouString(hand);
}

/**
 * Converts Tenhou-style tile indexes (from 0 to 135) to a tile index (0 to 37)
 * @param {number||number[]} tenhouTiles The Tenhou-style tile index to convert, or an array of Tenhou-style tile indexes.
 * @returns {TileIndex|TileIndex[]} The converted tile index(es).
 */
export function convertTenhouTilesToIndex(tenhouTiles) {
    if (typeof tenhouTiles === 'number') {
        return convertTenhouTileToIndex(tenhouTiles);
    }

    if (typeof tenhouTiles === 'object' && tenhouTiles.map) {
        return tenhouTiles.map((tile) => convertTenhouTileToIndex(tile));
    }
}

/**
 * Converts a Tenhou-style tile index (from 0 to 135) to a tile index (0 to 37)
 * @param {number} tenhouTiles The Tenhou-style tile index to convert.
 * @returns {TileIndex} The converted tile index.
 */
function convertTenhouTileToIndex(tenhouTile) {
    let base = Math.floor(tenhouTile / 4);
    let index = tenhouToIndexLookup[base];

    // Check for red fives.
    if (index < 30 && index % 10 === 5) {
        // If the base index divides evenly into 4, it's a red five.
        if (base % 4 === 0) {
            return index - 5;
        }
    }

    return index;
}

/** An array for converting between Tenhou-style tile indexes and our tile indexes. */
const tenhouToIndexLookup = [
     1,  2,  3,  4,  5,  6,  7,  8,  9,
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37
];

/**
 * Converts a string representation of a tile into the index.
 * @param {string} tile A string tile, such as 3z
 */
export function convertStringTileToIndex(tile) {
    return parseInt(tile.charAt(0)) + characterToSuit(tile.charAt(1));
}