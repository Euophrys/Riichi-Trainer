import { allTilesRemaining } from '../Constants';
import { convertTenhouHandToHand, convertHandToTenhouString } from './HandConversions';
import { convertTenhouTilesToIndex, getTileAsText } from './TileConversions';
import { CalculateDiscardUkeire, CalculateUkeireFromOnlyHand } from './UkeireCalculator';
import CalculateMinimumShanten from './ShantenCalculator';
import { evaluateBestDiscard } from './Evaluations';

export function parseRounds(replayText) {
    let games = replayText.split("<INIT ");
    games.shift();
    return games;
}

export function parsePlayers(replayText) {
    let players = [];

    for(let i = 0; i < 4; i++) {
        players.push({
            name: parseName(replayText, i)
        });
    }

    return players;
}

function parseName(replayText, player) {
    let regex = new RegExp(`n${player}="(.+?)"`);
    let match = regex.exec(replayText);
    if(match) {
        return decodeURIComponent(match[1]);
    }

    return "Unknown";
}

const roundNames = [
    "East 1", "East 2", "East 3", "East 4",
    "South 1", "South 2", "South 3", "South 4",
    "West 1", "West 2", "West 3", "West 4"
]

export function parseRoundNames(roundTexts) {
    let regex = /seed="(\d),(\d)/;

    return roundTexts.map((roundText) => {
        let match = regex.exec(roundText);
        let roundName = roundNames[parseInt(match[1])];
        let repeats = parseInt(match[2]);
        
        if(repeats > 0) {
            return `${roundName}-${repeats}`;
        }

        return roundName;
    });
}

export function parseRound(roundText, player) {
    let remainingTiles = allTilesRemaining.slice();
    let players = [];

    for(let i = 0; i < 4; i++) {
        players.push({
            hand: parseHand(roundText, i),
            discards: []
        });
    }

    for(let j = 0; j < players[player].hand.length; j++) {
        remainingTiles[j] = Math.max(remainingTiles[j] - players[player].hand[j], 0);
    }

    let regex = /<(\w{1})(.+?)\/>/g;
    let whoRegex = /who="(\d)"/;
    let messages = [];
    messages.push("Your starting hand was " + convertHandToTenhouString(players[player].hand));
    let match;

    do {
        match = regex.exec(roundText);
        
        if(match) {
            let actionInfo = parseActionType(match[1]);

            if(actionInfo.call) {
                let who = whoRegex.exec(match[2]);

                if(parseInt(who[1]) === player) {
                    messages.push("You called a tile, which isn't supported yet. Ending analysis.");
                    break;
                } else {
                    continue;
                }
            }

            if(actionInfo.riichi) continue;
            if(actionInfo.end) {
                let who = whoRegex.exec(match[2]);
                messages.push(`Player ${who[1]} won the round.`);
                break;
            }

            if(actionInfo.discard) {
                let index = convertTenhouTilesToIndex(parseInt(match[2]));

                if(actionInfo.player === player) {
                    let message = analyzeDiscard(players[player].hand, index, remainingTiles);
                    messages[messages.length - 1] += message;
                }

                players[actionInfo.player].hand[index]--;
                players[actionInfo.player].discards.push(index);
                remainingTiles[index]--;
                continue;
            }

            if(actionInfo.draw) {
                let index = convertTenhouTilesToIndex(parseInt(match[2]));
                players[actionInfo.player].hand[index]++;

                if(actionInfo.player === player) {
                    messages.push(`You drew the ${getTileAsText(index)}. `);
                }

                continue;
            }
        }
    } while (match);

    return messages;
}

function analyzeDiscard(playerHand, chosenTile, remainingTiles) {
    let hand = playerHand.slice();
    let ukeire = CalculateDiscardUkeire(hand, remainingTiles, CalculateMinimumShanten);
    let bestUkeire = Math.max(...ukeire);

    hand[chosenTile]--;
    let chosenUkeire = ukeire[chosenTile];

    let shanten = CalculateMinimumShanten(hand);
    let handUkeire = CalculateUkeireFromOnlyHand(hand, allTilesRemaining.slice(), CalculateMinimumShanten).value;
    let bestTile = evaluateBestDiscard(ukeire);
    let result = `You chose to discard the ${getTileAsText(chosenTile, true)}, which `;

    if (chosenUkeire > 0 || shanten === 0) {
        result += `results in ${chosenUkeire} tiles that can improve the hand. `;
    }
    else {
        result += `lowers your shanten - you are now further from ready. `
    }

    if (chosenUkeire < bestUkeire) {
        result += `The most efficient tile to discard, the ${getTileAsText(bestTile, true)}, `;
        result += `would have resulted in ${bestUkeire} tiles being able to improve your hand. `;
    }
    else {
        result += "That was the best choice. Good work! ";
    }

    if (shanten <= 0 && handUkeire === 0) {
        result += " You are now in keishiki tenpai. Your hand is ready, but all the winning tiles are in your hand. This doesn't count as ready. ";
    }

    return result;
}

function parseHand(roundText, player) {
    let regex = new RegExp(`hai${player}="(.+?)"`, 'g');
    let match = regex.exec(roundText);
    let handTiles = match[1];
    return convertTenhouHandToHand(handTiles);
}

function parseActionType(letter) {
    if(letter === 'T') {
        return {draw: true, player: 0};
    }
    if(letter === 'U') {
        return {draw: true, player: 1};
    }
    if(letter === 'V') {
        return {draw: true, player: 2};
    }
    if(letter === 'W') {
        return {draw: true, player: 3};
    }
    if(letter === 'D') {
        return {discard: true, player: 0};
    }
    if(letter === 'E') {
        return {discard: true, player: 1};
    }
    if(letter === 'F') {
        return {discard: true, player: 2};
    }
    if(letter === 'G') {
        return {discard: true, player: 3};
    }
    if(letter === 'N') {
        return {call: true};
    }
    if(letter === 'A') {
        return {end: true};
    }
    if(letter === 'R') {
        return {riichi: true};
    }
}