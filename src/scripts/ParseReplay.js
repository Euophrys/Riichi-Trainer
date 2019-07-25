import { ALL_TILES_REMAINING, ROUND_NAMES } from '../Constants';
import { convertTenhouHandToHand, convertHandToTenhouString } from './HandConversions';
import { convertTenhouTilesToIndex, getTileAsText, convertTilesToAsciiSymbols, convertIndexesToTenhouTiles } from './TileConversions';
import { CalculateDiscardUkeire, CalculateUkeireFromOnlyHand } from './UkeireCalculator';
import CalculateMinimumShanten, { CalculateStandardShanten } from './ShantenCalculator';
import { evaluateBestDiscard, evaluateSafestDiscards } from './Evaluations';
import { getShantenOffset } from './Utils';
import ReplayTurn from '../models/ReplayTurn';
import LocalizedMessage from '../models/LocalizedMessage';

export function parseRounds(replayText) {
    let games = replayText.split("<INIT ");
    games.shift();
    return games;
}

export function parsePlayers(t, replayText) {
    let players = [];

    for(let i = 0; i < 4; i++) {
        players.push({
            name: parseName(t, replayText, i)
        });
    }

    return players;
}

function parseName(t, replayText, player) {
    let regex = new RegExp(`n${player}="(.+?)"`);
    let match = regex.exec(replayText);
    if(match) {
        return decodeURIComponent(match[1]);
    }

    return t("analyzer.noName");
}

export function parseRoundNames(roundTexts) {
    let regex = /seed="(\d+?),(\d+?),/;

    return roundTexts.map((roundText) => {
        let match = regex.exec(roundText);

        if(!match) {
            return new LocalizedMessage("analyzer.replayError");
        }

        let roundName = ROUND_NAMES[parseInt(match[1])];
        let repeats = parseInt(match[2]);
        
        return new LocalizedMessage("roundName", {wind: roundName.wind, number: roundName.number, repeats: repeats});
    });
}

export function parseRound(t, roundText, player) {
    let remainingTiles = ALL_TILES_REMAINING.slice();
    let players = [];

    for(let i = 0; i < 4; i++) {
        players.push({
            hand: parseHand(roundText, i),
            discards: [],
            discardsAfterRiichi: [],
            riichiTile: -1,
            calledTiles: []
        });
    }

    for(let j = 0; j < players[player].hand.length; j++) {
        remainingTiles[j] = Math.max(remainingTiles[j] - players[player].hand[j], 0);
    }

    let doraRegex = /seed=".+?,.+?,.+?,.+?,.+?,(\d+)"/;
    let dora = doraRegex.exec(roundText);

    if(dora) {
        dora = convertTenhouTilesToIndex(parseInt(dora[1]));
        remainingTiles[dora]--;
    }

    let regex = /<(\w{1})(.+?)\/>/g;
    let whoRegex = /who="(\d)"/;
    let turns = [];
    let match;

    let currentTurn = new ReplayTurn(
        players[player].hand.slice()
    );

    currentTurn.message.appendLocalizedMessage("analyzer.startingHand", 
        {
            hand: convertHandToTenhouString(players[player].hand),
            count: CalculateMinimumShanten(players[player].hand),
            dora: convertIndexesToTenhouTiles(dora)
        }
    );

    currentTurn.message.appendMessage("<br/>");
    
    do {
        match = regex.exec(roundText);
        
        if(match) {
            let actionInfo = parseActionType(match[1]);

            if(!actionInfo) {
                currentTurn.message.appendLocalizedMessage("analyzer.unknownAction", {debugInfo: `${roundText} | ${match}`});
                currentTurn.hand = turns[turns.length - 1].hand.slice();
                turns.push(currentTurn);
                currentTurn = new ReplayTurn();
                continue;
            }

            if(actionInfo.call) {
                let who = parseInt(whoRegex.exec(match[2])[1]);
                let calledTiles = getTilesFromCall(match[2]);
                players[who].calledTiles.push(calledTiles);
                let baseShanten = 0;
                
                if(who !== player) {
                    for(let i = 1; i < calledTiles.length; i++) {
                        remainingTiles[calledTiles[i]]--;
                    }
                } else {
                    baseShanten = CalculateStandardShanten(players[player].hand);
                }

                if(calledTiles.length === 1) {
                    // kita
                    players[who].hand[calledTiles[0]]--;
                } else if(calledTiles.length === 4) {
                    // kan
                    players[who].hand[calledTiles[0]] = 0;
                } else {
                    // pon / chi
                    for(let i = 1; i < calledTiles.length; i++) {
                        players[who].hand[calledTiles[i]]--;
                    }
                }

                if(who === player) {
                    currentTurn.hand = players[player].hand.slice();
                    currentTurn.message.appendLocalizedMessage("analyzer.call", {tile: getTileAsText(t, calledTiles[0]), meld: convertIndexesToTenhouTiles(calledTiles), hand: convertHandToTenhouString(players[who].hand)});
                    let newShanten = CalculateStandardShanten(padHand(players[player].hand));
                    if(newShanten >= baseShanten) {
                        currentTurn.message.appendLocalizedMessage("analyzer.callSameShanten");
                    }
                }

                continue;
            }

            if(actionInfo.riichi) {
                let who = whoRegex.exec(match[2]);

                if(!who) {
                    currentTurn.hand = turns[turns.length - 1].hand.slice();
                    currentTurn.message.appendLocalizedMessage("analyzer.ryuukyoku");
                    turns.push(currentTurn);
                    break;
                }

                who = parseInt(who[1]);

                if(who === player) {
                    if(players[player].riichiTile > -1) {
                        currentTurn.hand = turns[turns.length - 1].hand.slice();
                        currentTurn.message.appendLocalizedMessage("analyzer.playerRiichi");
                        turns.push(currentTurn);
                        break;
                    }
                    continue;
                }

                if(players[who].riichiTile > -1) continue;

                let paddedHand = padHand(players[player].hand.slice());
                let shanten = CalculateMinimumShanten(paddedHand);

                currentTurn.message.appendLocalizedMessage("analyzer.otherRiichi", {number: who});

                if(shanten > 1) {
                    currentTurn.message.appendLocalizedMessage("analyzer.fold", {shanten: shanten});
                } else if (shanten === 1) {
                    currentTurn.message.appendLocalizedMessage("analyzer.probablyFold");
                }

                currentTurn.message.appendMessage("<br/>");

                players[who].riichiTile = -2;
                continue;
            }

            if(actionInfo.end) {
                let who = whoRegex.exec(match[2]);
                if(currentTurn.hand.length === 0) currentTurn.hand = turns[turns.length - 1].hand.slice();
                currentTurn.message.appendLocalizedMessage("analyzer.win", {number: who[1]});
                turns.push(currentTurn);
                break;
            }

            if(actionInfo.disconnect) {

            }

            if(actionInfo.discard) {
                if(actionInfo.player === 0) {
                    // Might be DORA
                    let doraRegex = /hai="(\d+?)"/;
                    let doraMatch = doraRegex.exec(match[2]);

                    if(doraMatch) {
                        let newDoraIndicator = convertTenhouTilesToIndex(parseInt(doraMatch[1]));
                        remainingTiles[newDoraIndicator]--;
                        currentTurn.message.appendLocalizedMessage("analyzer.kandora", {tile: getTileAsText(t, newDoraIndicator)});
                        continue;
                    }
                }

                let discardIndex = convertTenhouTilesToIndex(parseInt(match[2]));

                if(actionInfo.player === player) {
                    currentTurn.hand = players[player].hand.slice();
                    analyzeDiscard(t, players[player].hand, discardIndex, remainingTiles, currentTurn);
                    analyzeSafestDiscard(t, players[player].hand, discardIndex, players, remainingTiles, currentTurn);
                    currentTurn.discards = players[player].discards.slice();
                    currentTurn.calls = players[player].calledTiles.slice();
                    turns.push(currentTurn);
                    currentTurn = new ReplayTurn();
                }
                
                for(let i = 0; i < players.length; i++) {
                    if(players[i].riichiTile > -1) {
                        players[i].discardsAfterRiichi.push(discardIndex);
                    }
                    else if(i === actionInfo.player) {
                        players[actionInfo.player].discards.push(discardIndex);
                    }

                    if(players[i].riichiTile === -2) {
                        players[i].riichiTile = discardIndex;
                    }
                }

                players[actionInfo.player].hand[discardIndex]--;

                if(actionInfo.player !== player) {
                    remainingTiles[discardIndex]--;
                }
                
                continue;
            }

            if(actionInfo.draw) {
                let index = convertTenhouTilesToIndex(parseInt(match[2]));
                players[actionInfo.player].hand[index]++;

                if(actionInfo.player === player) {
                    currentTurn.hand = players[player].hand;
                    currentTurn.draw = index;
                    currentTurn.message.appendLocalizedMessage("analyzer.draw", {tile: getTileAsText(t, index), hand: convertHandToTenhouString(players[player].hand)});
                    currentTurn.message.appendMessage("<br/>");
                    remainingTiles[index]--;
                }

                continue;
            }
        }
    } while (match);

    return turns;
}

const safetyRatingExplanations = [
    "analyzer.safetyExplanations.zero", "analyzer.safetyExplanations.one", "analyzer.safetyExplanations.two", "analyzer.safetyExplanations.three",
    "analyzer.safetyExplanations.four", "analyzer.safetyExplanations.five", "analyzer.safetyExplanations.six",
    "analyzer.safetyExplanations.seven", "analyzer.safetyExplanations.eight", "analyzer.safetyExplanations.nine",
    "analyzer.safetyExplanations.ten", "analyzer.safetyExplanations.eleven", "analyzer.safetyExplanations.twelve",
    "analyzer.safetyExplanations.thirteen", "analyzer.safetyExplanations.fourteen", "analyzer.safetyExplanations.fifteen"
];

function analyzeSafestDiscard(t, playerHand, chosenTile, players, remainingTiles, currentTurn) {
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
    currentTurn.message.appendLocalizedMessage("analyzer.chosenSafety", {
        tile: getTileAsText(t, chosenTile, true),
        rating: totalSafety[chosenTile],
        explanation: safetyRatingExplanations[Math.floor(chosenSafety / riichis)]
    });
    currentTurn.message.appendMessage("<br/>");

    let bestSafety = Math.max(...totalSafety);
    let bestChoice = totalSafety.indexOf(bestSafety);

    if(bestSafety === chosenSafety) {
        currentTurn.message.appendLocalizedMessage("analyzer.correctSafety");
    } else {
        currentTurn.message.appendLocalizedMessage("analyzer.bestSafety", {
            tile: getTileAsText(t, bestChoice, true),
            rating: bestSafety,
            explanation: safetyRatingExplanations[Math.floor(bestSafety / riichis)]
        });
    }

    currentTurn.message.appendMessage("<br/>");
}

function padHand(hand) {
    let paddedHand = hand.slice();
    for(let i = 0; i < getShantenOffset(hand); i += 2) {
        paddedHand[31] += 3;
    }

    return paddedHand;
}

function analyzeDiscard(t, hand, chosenTile, remainingTiles, currentTurn) {
    let paddedHand = padHand(hand);

    let ukeire = CalculateDiscardUkeire(paddedHand, remainingTiles, CalculateMinimumShanten);
    let bestUkeire = Math.max(...ukeire.map(o => o.value));
    paddedHand[chosenTile]--;

    let chosenUkeire = ukeire[chosenTile];

    let shanten = CalculateMinimumShanten(paddedHand);
    let handUkeire = CalculateUkeireFromOnlyHand(paddedHand, ALL_TILES_REMAINING.slice(), CalculateMinimumShanten).value;
    let bestTile = evaluateBestDiscard(ukeire);
    currentTurn.message.appendLocalizedMessage("history.verbose.discard", {tile: getTileAsText(t, chosenTile, true)});

    if (chosenUkeire.value > 0 || shanten === 0) {
        currentTurn.message.appendLocalizedMessage("history.verbose.acceptance", {count: chosenUkeire.value});
        currentTurn.message.appendMessage(` ${convertTilesToAsciiSymbols(chosenUkeire.tiles)} (${convertIndexesToTenhouTiles(chosenUkeire.tiles)})`);
    }
    else {
        currentTurn.message.appendLocalizedMessage("history.verbose.loweredShanten");
        currentTurn.className = "bg-danger text-white";
    }

    currentTurn.message.appendMessage("<br/>");

    if (chosenUkeire.value < bestUkeire) {
        currentTurn.message.appendLocalizedMessage("history.verbose.optimal");
        currentTurn.message.appendLocalizedMessage("history.verbose.optimalSpoiler", {tile: getTileAsText(t, bestTile, true)});
        currentTurn.message.appendLocalizedMessage("history.verbose.acceptance", {count: bestUkeire});
        currentTurn.message.appendMessage(` ${convertTilesToAsciiSymbols(ukeire[bestTile].tiles)} (${convertIndexesToTenhouTiles(ukeire[bestTile].tiles)})`);

        if(!currentTurn.className) {
            currentTurn.className = "bg-warning";
        }
    }
    else {
        currentTurn.message.appendLocalizedMessage("history.verbose.best");
        currentTurn.className = "bg-success text-white";
    }

    if (shanten <= 0 && handUkeire === 0) {
        currentTurn.message.appendLocalizedMessage("history.verbose.exceptionalNoten");
    }

    currentTurn.message.appendMessage("<br/>");
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
    if(letter === 'B') {
        return {disconnect: true};
    }
}

function getTilesFromCall(call) {
    let meldRegex = /m="(\d+?)"/;
    let match = meldRegex.exec(call);
    let meldInt = parseInt(match[1]);
    let meldBinary = meldInt.toString(2);
    meldBinary = meldBinary.padStart(16, '0');

    if(meldBinary.charAt(meldBinary.length - 3) === '1') {
        // Chii
        let tile = meldBinary.substr(0, 6);
        tile = parseInt(tile, 2);
        let order = tile % 3;
        tile = Math.floor(tile / 3);
        tile = 9 * Math.floor(tile / 7) + (tile % 7);
        tile = convertTenhouTilesToIndex(tile * 4);

        if(order === 0) {
            return [tile, tile + 1, tile + 2];
        }
        
        if (order === 1) {
            return [tile + 1, tile, tile + 2];
        }

        return [tile + 2, tile, tile + 1];
    }
    else if(meldBinary.charAt(meldBinary.length - 4) === '1') {
        // Pon
        let tile = meldBinary.substr(0, 7);
        tile = parseInt(tile, 2);
        tile = Math.floor(tile / 3);
        tile = convertTenhouTilesToIndex(tile * 4);

        return [tile, tile, tile];
    }
    else if(meldBinary.charAt(meldBinary.length - 5) === '1') {
        // Added kan
        let tile = meldBinary.substr(0, 7);
        tile = parseInt(tile, 2);
        tile = Math.floor(tile / 3);
        tile = convertTenhouTilesToIndex(tile * 4);

        return [tile];
    }
    else if(meldBinary.charAt(meldBinary.length - 6) === '1') {
        // Nuki
        return [34];
    }
    else {
        // Kan
        let tile = meldBinary.substr(0, 8);
        tile = parseInt(tile, 2);
        tile = Math.floor(tile / 4);
        tile = convertTenhouTilesToIndex(tile * 4);
        return [tile, tile, tile, tile];
    }
}