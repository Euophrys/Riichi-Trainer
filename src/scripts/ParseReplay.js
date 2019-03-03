import { allTilesRemaining } from '../Constants';
import { convertTenhouHandToHand, convertHandToTenhouString } from './HandConversions';
import { convertTenhouTilesToIndex, getTileAsText, convertTilesToAsciiSymbols } from './TileConversions';
import { CalculateDiscardUkeire, CalculateUkeireFromOnlyHand, CalculateUkeire } from './UkeireCalculator';
import CalculateMinimumShanten from './ShantenCalculator';
import { evaluateBestDiscard, evaluateSafestDiscards } from './Evaluations';
import { freemem } from 'os';

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
            discards: [],
            discardsAfterRiichi: [],
            riichiTile: -1
        });
    }

    for(let j = 0; j < players[player].hand.length; j++) {
        remainingTiles[j] = Math.max(remainingTiles[j] - players[player].hand[j], 0);
    }

    let regex = /<(\w{1})(.+?)\/>/g;
    let whoRegex = /who="(\d)"/;
    let messages = [];
    messages.push("Your starting hand is " + convertHandToTenhouString(players[player].hand));
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

            if(actionInfo.riichi) {
                let who = whoRegex.exec(match[2]);

                if(!who) {
                    messages.push("Ryuukyoku.");
                    break;
                }

                if(parseInt(who[1]) === player) {
                    if(players[player].riichiTile > -1) {
                        messages.push("You declared riichi. Ending analysis.");
                        break;
                    }
                    continue;
                }

                if(players[parseInt(who[1])].riichiTile > -1) continue;

                let shanten = CalculateMinimumShanten(players[player].hand);
                let message = `Player ${who[1]} declared riichi. `;

                if(shanten > 1) {
                    message += `You are still ${shanten} tiles from ready, so you should fold.`;
                } else if (shanten === 1) {
                    message += `You are one tile from ready. You should consider folding.`;
                }

                messages.push(message);
                players[parseInt(who[1])].riichiTile = -2;
                continue;
            }


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
                    message = analyzeSafestDiscard(players[player].hand, index, players, remainingTiles);
                    messages[messages.length - 1] += message;
                }

                players[actionInfo.player].hand[index]--;

                if(actionInfo.player !== player) {
                    remainingTiles[index]--;
                }
                
                for(let i = 0; i < players.length; i++) {
                    if(players[i].riichiTile > -1) {
                        players[i].discardsAfterRiichi.push(index);
                    }
                    else if(i === actionInfo.player) {
                        players[actionInfo.player].discards.push(index);
                    }

                    if(players[i].riichiTile === -2) {
                        players[i].riichiTile = index;
                    }
                }

                continue;
            }

            if(actionInfo.draw) {
                let index = convertTenhouTilesToIndex(parseInt(match[2]));
                players[actionInfo.player].hand[index]++;

                if(actionInfo.player === player) {
                    messages.push(`You drew the ${getTileAsText(index)}. (${convertHandToTenhouString(players[player].hand)})|`);
                    remainingTiles[index]--;
                }

                continue;
            }
        }
    } while (match);

    return messages;
}

const safetyRatingExplanations = [
    "you shouldn't see this message, tell me if you do",
    "non-suji 4/5/6", "non-suji 3/7", "non-suji 2/8", "one-chance", "non-suji 1/9",
    "first honor tile", "suji 3/7", "suji 2/8", "suji 4/5/6", "second honor tile",
    "first suji terminal", "second suji terminal", "third suji terminal / third honor",
    "fourth suji terminal / fourth honor", "genbutsu"
]

function analyzeSafestDiscard(playerHand, chosenTile, players, remainingTiles) {
    let riichis = 0;
    let totalSafety = Array(38).fill(0);

    for(let i = 0; i < players.length; i++) {
        if(players[i].riichiTile >= 0) {
            riichis++;

            let safety = evaluateSafestDiscards(
                playerHand,
                players[i].discards,
                remainingTiles,
                players[i].discardsAfterRiichi,
                players[i].riichiTile
            );

            for(let j = 0; j < totalSafety.length; j++) {
                totalSafety[j] += safety[j];
            }
        }
    }

    if(riichis === 0) return "";
    
    let chosenSafety = totalSafety[chosenTile];
    let result = `The ${getTileAsText(chosenTile, true)}'s safety rating is ${totalSafety[chosenTile]} (${safetyRatingExplanations[Math.floor(chosenSafety / riichis)]}).|`;
    let bestSafety = Math.max(...totalSafety);
    let bestChoice = totalSafety.indexOf(bestSafety);

    if(bestSafety === chosenSafety) {
        result += `That was the safest tile.|`;
    } else {
        result += `Safest tile: ${getTileAsText(bestChoice, true)}, with a safety rating of ${bestSafety} (${safetyRatingExplanations[Math.floor(bestSafety / riichis)]}).|`;
    }

    return result;
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
    let result = `Discard: ${getTileAsText(chosenTile, true)}, `;

    if (chosenUkeire > 0 || shanten === 0) {
        let ukeireTiles = CalculateUkeire(hand, remainingTiles, CalculateMinimumShanten, shanten);
        result += `with ${chosenUkeire} tiles that can improve the hand: ${convertTilesToAsciiSymbols(ukeireTiles.tiles)}|`;
    }
    else {
        result += `which lowers your shanten.|`
    }

    if (chosenUkeire < bestUkeire) {
        hand[chosenTile]++;
        hand[bestTile]--;
        let bestUkeireTiles = CalculateUkeire(hand, remainingTiles, CalculateMinimumShanten);
        result += `Most efficient: the ${getTileAsText(bestTile, true)}, `;
        result += `with ${bestUkeire} tiles being able to improve your hand: ${convertTilesToAsciiSymbols(bestUkeireTiles.tiles)}|`;
    }
    else {
        result += "That was the most efficient choice.|";
    }

    if (shanten <= 0 && handUkeire === 0) {
        result += "You are now in keishiki tenpai. Your hand is ready, but all the winning tiles are in your hand. This doesn't count as ready.|";
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