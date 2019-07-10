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

const emoji = [":0m:", ":1m:", ":2m:", ":3m:", ":4m:", ":5m:", ":6m:", ":7m:", ":8m:", ":9m:", 
                ":0p:", ":1p:", ":2p:", ":3p:", ":4p:", ":5p:", ":6p:", ":7p:", ":8p:", ":9p:", 
                ":0s:", ":1s:", ":2s:", ":3s:", ":4s:", ":5s:", ":6s:", ":7s:", ":8s:", ":9s:", 
                ":baka:", ":1z:", ":2z:", ":3z:", ":4z:", ":5z:", ":6z:", ":7z:" ];

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

export function convertHandToTileArray(hand) {
    let result = [];

    for(let i = 0; i < hand.length; i++) {
        for(let j = 0; j < hand[i]; j++) {
            result.push(i);
        }
    }

    return result;
}