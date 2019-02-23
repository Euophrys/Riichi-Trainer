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

const images = [
    redFiveMan, oneMan, twoMan, threeMan, fourMan, fiveMan, sixMan, sevenMan, eightMan, nineMan,
    redFiveSou, oneSou, twoSou, threeSou, fourSou, fiveSou, sixSou, sevenSou, eightSou, nineSou,
    redFivePin, onePin, twoPin, threePin, fourPin, fivePin, sixPin, sevenPin, eightPin, ninePin,
    "", east, south, west, north, haku, hatsu, chun
];

const numberText = ["red five", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const numberCharacter = ["red 5", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const suitText = ["characters", "bamboo", "circles"]
const suitCharacter = ["m", "s", "p"];
const honors = ["", "east wind", "south wind", "west wind", "north wind", "white dragon", "green dragon", "red dragon"]

export function getTileImage(index) {
    return images[index];
}

export function getTileAsText(index, verbose = true) {
    if (index > 30) {
        return honors[index - 30];
    }

    if (verbose) {
        const number = numberText[index % 10];
        const suit = suitText[Math.floor(index / 10)];

        return `${number} of ${suit}`;
    }
    else {
        const number = numberCharacter[index % 10];
        const suit = suitCharacter[Math.floor(index / 10)];

        return `${number}${suit}`;
    }
}