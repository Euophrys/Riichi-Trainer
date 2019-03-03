import { ascii, convertTenhouTilesToIndex } from './TileConversions';

export function convertHandToTenhouString(hand) {
    let string = "";
    let suit = "";

    for (let i = 0; i < 10; i++) {
        if (i % 10 === 5 && hand[i - 5] > 0) {
            for (let j = 0; j < hand[i - 5]; j++) {
                suit += 0;
            }
        }

        if (i % 10 === 0) continue;

        for (let j = 0; j < hand[i]; j++) {
            suit += i;
        }
    }

    if (suit !== "") {
        string += suit + "m";
        suit = "";
    }

    for (let i = 10; i < 20; i++) {
        if (i % 10 === 5 && hand[i - 5] > 0) {
            for (let j = 0; j < hand[i - 5]; j++) {
                suit += 0;
            }
        }

        if (i % 10 === 0) continue;

        for (let j = 0; j < hand[i]; j++) {
            suit += i - 10;
        }
    }

    if (suit !== "") {
        string += suit + "p";
        suit = "";
    }

    for (let i = 20; i < 30; i++) {
        if (i % 10 === 5 && hand[i - 5] > 0) {
            for (let j = 0; j < hand[i - 5]; j++) {
                suit += 0;
            }
        }

        if (i % 10 === 0) continue;

        for (let j = 0; j < hand[i]; j++) {
            suit += (i - 20);
        }
    }

    if (suit !== "") {
        string += suit + "s";
        suit = "";
    }


    for (let i = 31; i < 38; i++) {
        for (let j = 0; j < hand[i]; j++) {
            suit += i - 30;
        }
    }

    if (suit !== "") {
        string += suit + "z";
        suit = "";
    }

    return string;
}

export function convertHandToAsciiSymbols(hand) {
    let result = "";
    
    for(let i = 0; i < hand.length; i++) {
        for(let j = 0; j < hand[i]; j++) {
            result += ascii[i];
        }
    }

    return result;
}

export function convertTenhouHandToHand(tenhouHand) {
    let handTiles = tenhouHand.split(",");
    let convertedTiles = convertTenhouTilesToIndex(handTiles);
    let hand = Array(38).fill(0);

    for(let i = 0; i < convertedTiles.length; i++) {
        hand[convertedTiles[i]]++;
    }

    return hand;
}