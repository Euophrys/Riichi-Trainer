import { ALL_TILES_REMAINING, ROUND_PARAMETERS } from '../Constants';
import { convertTenhouHandToHand, convertHandToTenhouString, convertHandToTileIndexArray } from './HandConversions';
import { convertTenhouTilesToIndex, getTileAsText, convertIndexesToTenhouTiles, convertStringTileToIndex } from './TileConversions';
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
    let games = replayText.split("RecordNewRound");
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

    // I don't know how to get this on majsoul so, numbers it is.
    for(let i = 0; i < 4; i++) {
        players.push(i);
    }

    return players;
}

/**
 * Parse the round names from a replay XML.
 * @param {string[]} roundTexts The round XMLs.
 * @returns {LocalizedMessage[]} The round names.
 */
export function parseRoundNames(roundTexts) {
    // Not sure how to get this on majsoul yet
    return roundTexts.map((roundText, index) => {
        let roundName = ROUND_PARAMETERS[0];
        
        return new LocalizedMessage("roundName", {wind: roundName.wind, number: roundName.number, repeats: index});
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
    let lines = roundText.split("Record");
    
    for(let i = 0; i < 4; i++) {
        players.push(new Player(parseStartingHand(lines[0], i)));
    }

    lines.shift();
    
    for(let j = 0; j < players[player].hand.length; j++) {
        remainingTiles[j] = Math.max(remainingTiles[j] - players[player].hand[j], 0);
    }
    
    let doraRegex = /(\d\w)/;
    let dora = doraRegex.exec(roundText);
    
    if(dora) {
        dora = convertStringTileToIndex(dora[1]);
        remainingTiles[dora]--;
    }

    let turns = [];

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

    let callRegex = /ChiPengGang.*?(\d\w).*?(\d\w).*?(\d\w)/;
    let discardRegex = /DiscardTile.*?(\d\w)/;
    let drawRegex = /DealTile.*?(\d\w)/;
    let winRegex = /Hule/;
    let closedKanRegex = /AnGangAddGang.*?(\d\w)/;
    let playerHandLengths = players.map((player) => convertHandToTileIndexArray(player.hand).length);
    let currentPlayer = playerHandLengths.indexOf(14);

    for(let l = 0; l < lines.length; l++) {
        let line = unescape(lines[l]);

        let discardMatch = discardRegex.exec(line)
        if(discardMatch) {
            let discardIndex = convertStringTileToIndex(discardMatch[1]);

            if(currentPlayer === player) {
                analyzeDiscardEfficiency(t, players[player].hand, discardIndex, remainingTiles, currentTurn);
                analyzeDiscardSafety(t, players[player].hand, discardIndex, players, remainingTiles, currentTurn);
                currentTurn.copyFrom(players[player]);
                turns.push(currentTurn);
                currentTurn = new ReplayTurn();
            }
            
            players[currentPlayer].discardTile(discardIndex);

            for(let i = 0; i < players.length; i++) {
                if(players[i].isInRiichi()) {
                    players[i].discardsAfterRiichi.push(discardIndex);
                }
            }

            if(currentPlayer !== player) {
                remainingTiles[discardIndex]--;
            }
            
            currentPlayer = (currentPlayer + 1) % 4;
            continue;
        }

        let drawMatch = drawRegex.exec(line)
        if(drawMatch) {
            let index = convertStringTileToIndex(drawMatch[1]);
            players[currentPlayer].hand[index]++;

            if(currentPlayer === player) {
                currentTurn.tileDrawn(t, players[player], index);
                remainingTiles[index]--;
            }

            continue;
        }
        
        let callMatch = callRegex.exec(line);
        if (callMatch) {
            let calledTiles = [
                convertStringTileToIndex(callMatch[1]),
                convertStringTileToIndex(callMatch[2]),
                convertStringTileToIndex(callMatch[3]),
            ];

            if (calledTiles[0] === calledTiles[1]) {
                for (let i = 0; i < players.length; i++) {
                    if (players[i].hand[calledTiles[0]] > 1) {
                        currentPlayer = i;
                        break;
                    }
                }
            }

            let baseShanten = 0;
            
            if(currentPlayer !== player) {
                for(let i = 1; i < calledTiles.length; i++) {
                    remainingTiles[calledTiles[i]]--;
                }
            } else {
                baseShanten = calculateStandardShanten(players[player].hand);
            }
            
            players[currentPlayer].callTiles(calledTiles);

            if(currentPlayer === player) {
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

        let closedKanMatch = closedKanRegex.exec(line);
        if (closedKanMatch) {
            let tile = convertStringTileToIndex(closedKanMatch[1]);
            remainingTiles[tile] = 0;
        }

        /* Dunno how to get this in majsoul
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
        */

        let winMatch = winRegex.exec(line);
        if(winMatch) {
            if(currentTurn.hand.length === 0) currentTurn.hand = turns[turns.length - 1].hand.slice();
            currentTurn.message.appendLocalizedMessage("analyzer.win", {number: "?"});
            turns.push(currentTurn);
            break;
        }
    }

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
    let shantenFunction = getShantenOffset(hand) > 0 ? calculateStandardShanten : calculateMinimumShanten;
    let ukeire = calculateDiscardUkeire(paddedHand, remainingTiles, shantenFunction);
    paddedHand[chosenTile]--;

    let chosenUkeire = ukeire[chosenTile];

    let shanten = shantenFunction(paddedHand);
    let handUkeire = calculateUkeireFromOnlyHand(paddedHand, ALL_TILES_REMAINING.slice(), shantenFunction).value;
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
    let regex = tileRegexes[player];
    let match = roundText.match(regex);
    let hand = Array(38).fill(0);

    for (let i = 0; i < match.length; i++) {
        hand[convertStringTileToIndex(match[i].substr(2))] += 1;
    }

    return hand;
}

const tileRegexes = [/:.\d[spmz]/g, /B.\d[spmz]/g, /J.\d[spmz]/g, /R.\d[spmz]/g]