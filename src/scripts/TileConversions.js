import oneMan from '../tileImages/1m.png';
import twoMan from '../tileImages/2m.png';
import threeMan from '../tileImages/3m.png';
import fourMan from '../tileImages/4m.png';
import fiveMan from '../tileImages/5m.png';
import redFiveMan from '../tileImages/0m.png';
import sixMan from '../tileImages/6m.png';
import sevenMan from '../tileImages/7m.png';
import eightMan from '../tileImages/8m.png';
import nineMan from '../tileImages/9m.png';
import oneSou from '../tileImages/1s.png';
import twoSou from '../tileImages/2s.png';
import threeSou from '../tileImages/3s.png';
import fourSou from '../tileImages/4s.png';
import fiveSou from '../tileImages/5s.png';
import redFiveSou from '../tileImages/0s.png';
import sixSou from '../tileImages/6s.png';
import sevenSou from '../tileImages/7s.png';
import eightSou from '../tileImages/8s.png';
import nineSou from '../tileImages/9s.png';
import onePin from '../tileImages/1p.png';
import twoPin from '../tileImages/2p.png';
import threePin from '../tileImages/3p.png';
import fourPin from '../tileImages/4p.png';
import fivePin from '../tileImages/5p.png';
import redFivePin from '../tileImages/0p.png';
import sixPin from '../tileImages/6p.png';
import sevenPin from '../tileImages/7p.png';
import eightPin from '../tileImages/8p.png';
import ninePin from '../tileImages/9p.png';
import east from '../tileImages/east.png';
import south from '../tileImages/south.png';
import west from '../tileImages/west.png';
import north from '../tileImages/north.png';
import haku from '../tileImages/haku.png';
import hatsu from '../tileImages/hatsu.png';
import chun from '../tileImages/chun.png';
import back from '../tileImages/back.png';
import { convertHandToTenhouString } from './HandConversions';

const images = [
    redFiveMan, oneMan, twoMan, threeMan, fourMan, fiveMan, sixMan, sevenMan, eightMan, nineMan,
    redFivePin, onePin, twoPin, threePin, fourPin, fivePin, sixPin, sevenPin, eightPin, ninePin,
    redFiveSou, oneSou, twoSou, threeSou, fourSou, fiveSou, sixSou, sevenSou, eightSou, nineSou,
    back, east, south, west, north, haku, hatsu, chun
];

export const ascii = [
    "🀋", "🀇", "🀈", "🀉", "🀊", "🀋", "🀌", "🀍", "🀎", "🀏",
    "🀝", "🀙", "🀚", "🀛", "🀜", "🀝", "🀞", "🀟", "🀠", "🀡",
    "🀔", "🀐", "🀑", "🀒", "🀓", "🀔", "🀕", "🀖", "🀗", "🀘",
    "🀪", "🀀", "🀁", "🀂", "🀃", "🀆", "🀅", "🀄"
]

const numberText = ["redFive", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const numberCharacter = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const suitText = ["characters", "circles", "bamboo"]
const suitCharacter = ["m", "p", "s"];
const honors = ["hidden", "east", "south", "west", "north", "white", "green", "red"]

export function getTileImage(index) {
    return images[index];
}

export function getTileAsText(t, index, verbose = true) {
    if (index >= 30) {
        return t(`values.${honors[index - 30]}`);
    }

    if (verbose) {
        const number = numberText[index % 10];
        const suit = suitText[Math.floor(index / 10)];

        return t("shuupai", {value: t(`values.${number}`), suit: t(`suits.${suit}`)});
    }
    else {
        const number = numberCharacter[index % 10];
        const suit = suitCharacter[Math.floor(index / 10)];

        return `${number}${suit}`;
    }
}

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

export function convertTilesToAsciiSymbols(tiles) {
    if(typeof tiles === 'number') {
        return ascii[tiles];
    }
    
    if (typeof tiles === 'object' && tiles.length) {
        let result = "";

        for(let i = 0; i < tiles.length; i++) {
            result += ascii[tiles[i]];
        }

        return result;
    }

    return "";
}

export function convertIndexesToTenhouTiles(indexes) {
    let hand = Array(38).fill(0);

    if(typeof indexes === 'number') {
        hand[indexes] = 1;
    } else if (typeof indexes === 'object' && indexes.length) {
        for(let i = 0; i < indexes.length; i++) {
            hand[indexes[i]] += 1;
        }
    } else {
        return "Error."
    }

    return convertHandToTenhouString(hand);
}

export function convertTenhouTilesToIndex(tenhouTiles) {
    if(typeof tenhouTiles === 'number') {
        return convertTenhouTileToIndex(tenhouTiles);
    }

    if (typeof tenhouTiles === 'object' && tenhouTiles.map) {
        return tenhouTiles.map((tile) => convertTenhouTileToIndex(tile));
    }
}

const tenhouToIndexLookup = [
     1,  2,  3,  4,  5,  6,  7,  8,  9,
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27, 28, 29,
    31, 32, 33, 34, 35, 36, 37
];

function convertTenhouTileToIndex(tenhouTile){
    let base = Math.floor(tenhouTile / 4);
    return tenhouToIndexLookup[base];
}