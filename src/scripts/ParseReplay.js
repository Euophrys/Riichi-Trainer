import { ALL_TILES_REMAINING, ROUND_PARAMETERS } from '../Constants';
import { convertTenhouHandToHand, convertHandToTenhouString } from './HandConversions';
import { convertTenhouTilesToIndex, getTileAsText, convertIndexesToTenhouTiles } from './TileConversions';
import { calculateDiscardUkeire, calculateUkeireFromOnlyHand } from './UkeireCalculator';
import calculateMinimumShanten, { calculateStandardShanten } from './ShantenCalculator';
import { evaluateBestDiscard, evaluateDiscardSafety } from './Evaluations';
import { getShantenOffset } from './Utils';
import ReplayTurn from '../models/ReplayTurn';
import LocalizedMessage from '../models/LocalizedMessage';
import Player from '../models/Player';

/**
 * Separates the individual rounds from a replay.
 * @param {string} replayText The replay XML
 * @returns {string[]} The rounds in the replay.
 */
export function parseRounds(replayText) {
    let games = replayText.split("<INIT ");
    games.shift();
    return games;
}

/**
 * Parses the player names from a replay XML.
 * @param {function} t The i18next translation function.
 * @param {string} replayText The replay XML.
 * @returns {string[]} The player names.
 */
export function parsePlayers(t, replayText) {
    let players = [];

    for(let i = 0; i < 4; i++) {
        players.push(parseName(t, replayText, i));
    }

    return players;
}

/**
 * Parse the player with the given index's name from a replay XML.
 * @param {function} t The i18next translation function.
 * @param {string} replayText The replay XML.
 * @param {number} player The player index.
 */
function parseName(t, replayText, player) {
    let regex = new RegExp(`n${player}="(.+?)"`);
    let match = regex.exec(replayText);
    if(match) {
        return decodeURIComponent(match[1]);
    }

    return t("analyzer.noName");
}

/**
 * Parse the round names from a replay XML.
 * @param {string[]} roundTexts The round XMLs.
 * @returns {LocalizedMessage[]} The round names.
 */
export function parseRoundNames(roundTexts) {
    let regex = /seed="(\d+?),(\d+?),/;

    return roundTexts.map((roundText) => {
        let match = regex.exec(roundText);

        if(!match) {
            return new LocalizedMessage("analyzer.replayError");
        }

        let roundName = ROUND_PARAMETERS[parseInt(match[1])];
        let repeats = parseInt(match[2]);
        
        return new LocalizedMessage("roundName", {wind: roundName.wind, number: roundName.number, repeats: repeats});
    });
}

/**
 * Analyzes the given round.
 * @param {Function} t The i18next translation function.
 * @param {string} roundText The round XML
 * @param {number} player The index of the player, between 0 and 3.
 * @returns {ReplayTurn[]} An array of turns.
 */
export function parseRound(t, roundText, player) {
    let remainingTiles = ALL_TILES_REMAINING.slice();
    let players = [];

    for(let i = 0; i < 4; i++) {
        players.push(new Player(parseStartingHand(roundText, i)));
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
            count: calculateMinimumShanten(players[player].hand),
            dora: convertIndexesToTenhouTiles(dora)
        }
    );

    currentTurn.message.appendLineBreak();
    
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
                let baseShanten = 0;
                
                if(who !== player) {
                    for(let i = 1; i < calledTiles.length; i++) {
                        remainingTiles[calledTiles[i]]--;
                    }
                } else {
                    baseShanten = calculateStandardShanten(players[player].hand);
                }
                
                players[who].callTiles(calledTiles);

                if(who === player) {
                    currentTurn.hand = players[player].hand.slice();
                    currentTurn.message.appendLocalizedMessage("analyzer.call", {tile: getTileAsText(t, calledTiles[0]), meld: convertIndexesToTenhouTiles(calledTiles), hand: convertHandToTenhouString(players[player].hand)});
                    let newShanten = calculateStandardShanten(padHand(players[player].hand));
                    if(newShanten >= baseShanten) {
                        currentTurn.message.appendLocalizedMessage("analyzer.callSameShanten");
                    }
                    currentTurn.message.appendLineBreak();
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
                let shanten = calculateMinimumShanten(paddedHand);
                currentTurn.riichiDeclared(who, shanten);

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
                // TODO: Don't analyze safety from disconnected players.
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
                    analyzeDiscardEfficiency(t, players[player].hand, discardIndex, remainingTiles, currentTurn);
                    analyzeDiscardSafety(t, players[player].hand, discardIndex, players, remainingTiles, currentTurn);
                    currentTurn.copyFrom(players[player]);
                    turns.push(currentTurn);
                    currentTurn = new ReplayTurn();
                }
                
                players[actionInfo.player].discardTile(discardIndex);

                for(let i = 0; i < players.length; i++) {
                    if(players[i].isInRiichi()) {
                        players[i].discardsAfterRiichi.push(discardIndex);
                    }
                }

                if(actionInfo.player !== player) {
                    remainingTiles[discardIndex]--;
                }
                
                continue;
            }

            if(actionInfo.draw) {
                let index = convertTenhouTilesToIndex(parseInt(match[2]));
                players[actionInfo.player].hand[index]++;

                if(actionInfo.player === player) {
                    currentTurn.tileDrawn(t, players[player], index);
                    remainingTiles[index]--;
                }

                continue;
            }
        }
    } while (match);

    return turns;
}

/**
 * Adds a message to the current turn regarding the safety of the player's discard.
 * @param {Function} t The i18next translation function.
 * @param {TileCounts} playerHand The player's current hand.
 * @param {TileIndex} chosenTile The tile the player chose to discard.
 * @param {Player[]} players The player objects.
 * @param {TileCounts} remainingTiles The number of each tile remaining in concealed tiles.
 * @param {ReplayTurn} currentTurn The current turn object.
 */
function analyzeDiscardSafety(t, playerHand, chosenTile, players, remainingTiles, currentTurn) {
    let riichis = 0;
    let totalSafety = Array(38).fill(0);

    for(let i = 0; i < players.length; i++) {
        if(players[i].isInRiichi()) {
            riichis++;

            let safety = evaluateDiscardSafety(
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
    let bestSafety = Math.max(...totalSafety);
    let bestChoice = totalSafety.indexOf(bestSafety);

    currentTurn.addSafetyMessage(t, chosenTile, chosenSafety, bestChoice, bestSafety, riichis);
}

/**
 * Adds a message to the current turn regarding the efficiency of the chosen discard.
 * @param {Function} t The i18next translation function.
 * @param {TileCounts} hand The player's current hand.
 * @param {TileIndex} chosenTile The tile the player chose to discard.
 * @param {TileCounts} remainingTiles The number of each tile remaining in concealed tiles.
 * @param {ReplayTurn} currentTurn The current turn object.
 */
function analyzeDiscardEfficiency(t, hand, chosenTile, remainingTiles, currentTurn) {
    let paddedHand = padHand(hand);

    let ukeire = calculateDiscardUkeire(paddedHand, remainingTiles, calculateMinimumShanten);
    paddedHand[chosenTile]--;

    let chosenUkeire = ukeire[chosenTile];

    let shanten = calculateMinimumShanten(paddedHand);
    let handUkeire = calculateUkeireFromOnlyHand(paddedHand, ALL_TILES_REMAINING.slice(), calculateMinimumShanten).value;
    let bestTile = evaluateBestDiscard(ukeire);

    currentTurn.addEfficiencyMessage(t, chosenTile, chosenUkeire, bestTile, ukeire[bestTile], shanten, handUkeire);
}

/**
 * Adds triplets of East wind tiles to an open hand as a hack to make ukeire calculations accurate.
 * @param {TileCounts} hand The hand to pad.
 */
function padHand(hand) {
    let paddedHand = hand.slice();
    for(let i = 0; i < getShantenOffset(hand); i += 2) {
        paddedHand[31] += 3;
    }

    return paddedHand;
}

/**
 * Parses the starting hand of the given player from the round XML.
 * @param {string} roundText The round XML.
 * @param {number} player The index of the player to parse the hand of.
 * @returns {TileCounts} The player's starting hand.
 */
function parseStartingHand(roundText, player) {
    let regex = new RegExp(`hai${player}="(.+?)"`, 'g');
    let match = regex.exec(roundText);
    let handTiles = match[1];
    return convertTenhouHandToHand(handTiles);
}

/**
 * Converts the given letter into the corresponding action.
 * @param {string} letter The character representing the action.
 */
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

/**
 * Parses the called tiles from a tenhou replay node.
 * @param {string} call The string containing the encoded call.
 * @returns {TileIndex[]} The called tiles. Index 0 is the tile called.
 */
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