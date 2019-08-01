import React from 'react';
import { withTranslation } from "react-i18next";
import { Container, Row, Col, Button, Collapse, Card, CardBody } from 'reactstrap';
import DiscardPool from '../components/DiscardPool';
import Hand from '../components/Hand';
import History from '../components/History';
import Player from "../models/Player";
import { ALL_TILES_REMAINING, PLAYER_NAMES, SAFETY_RATING_EXPLANATIONS } from "../Constants";
import { generateHand } from "../scripts/GenerateHand";
import { shuffleArray, randomInt, removeRandomItem, getRandomItem } from "../scripts/Utils";
import calculateMinimumShanten from "../scripts/ShantenCalculator";
import { calculateDiscardUkeire } from "../scripts/UkeireCalculator";
import { evaluateBestDiscard, evaluateDiscardSafety } from "../scripts/Evaluations";
import { convertHandToTileIndexArray, convertHandToTenhouString } from "../scripts/HandConversions";
import SafetyHistoryData from '../components/defense-trainer/SafetyHistoryData';
import HistoryData from '../models/HistoryData';
import LocalizedMessage from '../models/LocalizedMessage';
import LocalizedMessageChain from '../models/LocalizedMessageChain';
import DefenseSettings from '../components/defense-trainer/DefenseSettings';

class DefenseState extends React.Component {
    constructor(props) {
        super(props);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.onSettingsChanged = this.onSettingsChanged.bind(this);
        this.state = {
            lastDraw: 0,
            isComplete: false,
            /** @type Player[] */
            players: [],
            history: [],
            tilePool: [],
            discardCount: 0,
            dora: 0,
            chartCollapsed: true,
            settings: {
                verbose: true,
                numberOfRiichis: 1,
                minimumTurnsBeforeRiichi: 4,
            }
        }
    }

    componentDidMount() {
        // Ensure settings are loaded before starting a new hand.
        this.setState({}, () => this.onNewHand());
    }

    onSettingsChanged(settings) {
        this.setState({
            settings: settings
        });
    }

    onNewHand() {
        /** @type {Player[]} */
        let players = [];
        let tilePool = [];

        let remainingTiles = ALL_TILES_REMAINING.slice();
        let dora = randomInt(10, 1) + randomInt(3) * 10;
        remainingTiles[dora]--;

        let riichiPlayers = shuffleArray([1, 2, 3]).slice(0, this.state.settings.numberOfRiichis);
        let playerSeat = randomInt(4);

        for (let i = 0; i < 4; i++) {
            let player = new Player();
            let shanten = 0;

            do {
                let generationResult = generateHand(remainingTiles);
                remainingTiles = generationResult.availableTiles;
                player.hand = generationResult.hand;
                tilePool = generationResult.tilePool;
                shanten = calculateMinimumShanten(player.hand);
            } while (shanten < 1);

            player.name = PLAYER_NAMES[i];
            player.seat = (playerSeat + i) % 4;

            if (riichiPlayers.indexOf(i) > -1) {
                let finishResult = this.finishHand(player, tilePool, remainingTiles);
                tilePool = finishResult.tilePool;
                remainingTiles = finishResult.remainingTiles;
            }

            players.push(player);
        }

        let minDiscards = Math.min(...riichiPlayers.map(player => players[player].discards.length));
        let maxDiscards = Math.max(...riichiPlayers.map(player => players[player].discards.length));

        for (let i = 0; i < riichiPlayers.length; i++) {
            let currentPlayer = players[riichiPlayers[i]];
            let riichiIndex = currentPlayer.riichiIndex;

            for(let j = riichiIndex; j < maxDiscards; j++) {
                for (let k = 0; k < riichiPlayers.length; k++) {
                    if (k === i) continue;

                    let otherPlayer = players[riichiPlayers[k]];
                    
                    if (otherPlayer.discards.length <= j) continue;

                    if (j > riichiIndex ||
                        (j === riichiIndex && currentPlayer.takesTurnBefore(otherPlayer))) {
                            currentPlayer.discardsAfterRiichi.push(otherPlayer.discards[j]);
                    }
                }
            }
        }

        players.forEach((player) => {
            while (player.discards.length < minDiscards - 1) {
                let tile = removeRandomItem(tilePool);
                player.discards.push(tile);
            }

            if (!player.isInRiichi() && player.discards.length < minDiscards) {
                // This player needs to discard one more tile
                if (riichiPlayers.some((index => players[index].takesTurnBefore(player)))) {
                    // Someone declared riichi before this player discarded
                    let discard = this.discardSafestTile(player, players, tilePool);

                    for (let j = 0; j < riichiPlayers.length; j++) {
                        if (players[riichiPlayers[j]].takesTurnBefore(player)) {
                            players[riichiPlayers[j]].discardsAfterRiichi.push(discard);
                        }
                    }
                } else {
                    // This player discarded before any riichis happened
                    this.discardMostEfficientTile(player, players, tilePool);
                }
            }

            while (player.discards.length < maxDiscards) {
                if (player.isInRiichi()) {
                    let tile = removeRandomItem(tilePool);
                    player.discards.push(tile);
                    
                    for (let j = 0; j < riichiPlayers.length; j++) {
                        let otherPlayer = players[riichiPlayers[j]];
                        if (player.discards.length - 1 > otherPlayer.riichiIndex ||
                            (player.discards.length - 1 === otherPlayer.riichiIndex && otherPlayer.takesTurnBefore(player))) {
                            otherPlayer.discardsAfterRiichi.push(tile);
                        }
                    }
                } else {
                    let discard = this.discardSafestTile(player, players, tilePool);

                    for (let j = 0; j < riichiPlayers.length; j++) {
                        if (players[riichiPlayers[j]].takesTurnBefore(player)) {
                            players[riichiPlayers[j]].discardsAfterRiichi.push(discard);
                        }
                    }
                }
            }
        });

        // playerSeat -> dealerIndex: 0 -> 0, 1 -> 3, 2 -> 2, 3 -> 1
        let dealerIndex = (4 - playerSeat) % 4;

        for (let i = dealerIndex; i > 0; i = (i + 1) % 4) {
            let discard = -1;

            if (players[i].isInRiichi()) {
                discard = removeRandomItem(tilePool);
                players[i].discards.push(discard);
            } else {
                discard = this.discardSafestTile(players[i], players, tilePool);
            }

            this.tileDiscardedAfterRiichi(discard, players);
        }

        // Dead wall
        for (let i = 0; i < 13; i++) {
            removeRandomItem(tilePool);
        }

        this.setState({
            players: players,
            tilePool: tilePool,
            history: [new HistoryData(new LocalizedMessage("trainer.start", {hand: convertHandToTenhouString(players[0].hand)}))],
            discardCount: 0,
            dora: dora,
            lastDraw: -1,
            isComplete: false
        });
    }

    discardMostEfficientTile(player, players, tilePool) {
        this.drawTilesToFourteen(player, tilePool);

        let ukeire = calculateDiscardUkeire(player.hand, this.getTilesVisibleToPlayer(player, players), calculateMinimumShanten);
        let bestTile = evaluateBestDiscard(ukeire);
        player.discardTile(bestTile);
    }

    discardSafestTile(player, players, tilePool) {
        this.drawTilesToFourteen(player, tilePool);

        let averageSafety = this.getAverageSafety(player, players);
        let bestSafety = Math.max(...averageSafety);
        let bestChoice = averageSafety.indexOf(bestSafety);

        player.discardTile(bestChoice);
        return bestChoice;
    }

    drawTilesToFourteen(player, tilePool) {
        let tilesInHand = player.hand.reduce((a, b) => a + b, 0);
        for (let i = tilesInHand; i <= 14; i++) {
            player.hand[removeRandomItem(tilePool)]++;
        }
    }

    getTilesVisibleToPlayer(player, players) {
        let visibleTiles = ALL_TILES_REMAINING.slice();

        for (let i = 0; i < player.hand.length; i++) {
            visibleTiles[i] -= player.hand[i];
        }

        for (let p = 0; p < players.length; p++) {
            for (let i = 0; i < players[p].discards.length; i++) {
                visibleTiles[players[p].discards[i]]--;
            }
        }

        return visibleTiles;
    }

    getAverageSafety(player, players) {
        let totalSafety = Array(38).fill(0);
        let riichis = 0;
    
        for(let i = 0; i < players.length; i++) {
            if(players[i].isInRiichi()) {
                riichis++;

                let safety = evaluateDiscardSafety(
                    player.hand,
                    players[i].discards,
                    this.getTilesVisibleToPlayer(player, players),
                    players[i].discardsAfterRiichi,
                    players[i].riichiTile
                );
    
                for(let j = 0; j < totalSafety.length; j++) {
                    totalSafety[j] += safety[j];
                }
            }
        }

        return totalSafety.map((x) => x / riichis);
    }

    /**
     * Brings the hand to tenpai
     * @param {Player} player 
     * @param {TileIndex[]} tilePool 
     * @param {TileCounts} remainingTiles 
     */
    finishHand(player, tilePool, remainingTiles) {
        let shanten = calculateMinimumShanten(player.hand);
        let ukeire = calculateDiscardUkeire(player.hand, remainingTiles, calculateMinimumShanten, shanten);
        let bestTile = evaluateBestDiscard(ukeire);
        let uselessTurns = this.state.settings.minimumTurnsBeforeRiichi + randomInt(5);
        let drawnTile = 0;
        player.discardTile(bestTile);

        for(let i = 0; i <= uselessTurns - shanten; i++) {
            // Draw a useless tile.
            while (true) {
                drawnTile = removeRandomItem(tilePool);
                
                if (ukeire[bestTile].tiles.includes(drawnTile)) {
                    tilePool.push(drawnTile);
                } else {
                    break;
                }
            }
            
            remainingTiles[drawnTile]--;
            player.hand[drawnTile]++;

            ukeire = calculateDiscardUkeire(player.hand, remainingTiles, calculateMinimumShanten, shanten);
            bestTile = evaluateBestDiscard(ukeire);
            player.discardTile(bestTile);
        }

        while(shanten > 0) {
            while (true) {
                drawnTile = getRandomItem(ukeire[bestTile].tiles);
                
                if (tilePool.includes(drawnTile)) {
                    break;
                }
            }
            
            remainingTiles[drawnTile]--;
            player.hand[drawnTile]++;

            shanten = calculateMinimumShanten(player.hand);

            if(shanten === 0) player.riichiTile = -2;

            ukeire = calculateDiscardUkeire(player.hand, remainingTiles, calculateMinimumShanten, shanten);
            bestTile = evaluateBestDiscard(ukeire);
            player.discardTile(bestTile);
        }

        return {
            player: player,
            tilePool: convertHandToTileIndexArray(remainingTiles),
            remainingTiles: remainingTiles            
        }
    }

    onTileClicked(event) {
        let { t } = this.props;
        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let players = this.state.players.slice();
        let averageSafety = this.getAverageSafety(players[0], players);
        players[0].discardTile(chosenTile);
        this.tileDiscardedAfterRiichi(chosenTile, players);

        let tilePool = this.state.tilePool.slice();

        for (let i = 1; i < players.length; i++) {
            if (tilePool.length === 0) break;

            let discard = -1;

            if (players[i].isInRiichi()) {
                discard = removeRandomItem(tilePool);
                players[i].discards.push(discard);
            } else {
                discard = this.discardSafestTile(players[i], players, tilePool);
            }

            this.tileDiscardedAfterRiichi(discard, players);
        }

        let draw = -1;
        let history = this.state.history.slice();

        if (tilePool.length === 0) {
            isComplete = true;
            let hands = new LocalizedMessageChain();
            hands.appendLocalizedMessage("defense.finalHands");
            for (let i = 0; i < players.length; i++) {
                hands.appendLineBreak();
                hands.appendLocalizedMessage("defense.hand", {
                    player:t(players[i].name),
                    hand:convertHandToTenhouString(players[i].hand)
                });
            }
            history.unshift(new HistoryData(hands));
        } else {
            draw = removeRandomItem(tilePool);
            players[0].hand[draw]++;
        }

        let bestSafety = Math.max(...averageSafety);
        let bestTile = averageSafety.indexOf(bestSafety);

        history.unshift(new SafetyHistoryData(
            chosenTile,
            averageSafety[chosenTile],
            bestTile,
            bestSafety,
            draw
        ));

        this.setState({
            players: players,
            tilePool: tilePool,
            discardCount: this.state.discardCount + 1,
            lastDraw: draw,
            history: history,
            isComplete: isComplete
        });
    }

    tileDiscardedAfterRiichi(tile, players) {
        for (let i = 1; i < players.length; i++) {
            if(players[i].isInRiichi()) {
                players[i].discardsAfterRiichi.push(tile);
            }
        }
    }

    toggleChart() {
        this.setState({
            chartCollapsed: !this.state.chartCollapsed
        });
    }

    render() {
        let { t } = this.props;

        if (!this.state.players.length) return <Container/>;

        let safetyRatings = SAFETY_RATING_EXPLANATIONS.map((explanation, index) => {
            if (index === 0) return <Row></Row>;
            return <Row key={index}>{t("defense.safetyRating", {rating:index, explanation: t(explanation)})}</Row>
        }).reverse();

        return (
            <Container>
                <DefenseSettings onChange={this.onSettingsChanged}/>
                <Container>
                    <Button color="primary" onClick={() => this.toggleChart()}>{t("defense.safetyRatings")}</Button>
                    <Collapse isOpen={!this.state.chartCollapsed}>
                        <Card><CardBody>
                            <Row>{t("defense.averagedSafetyRating")}</Row>
                            {safetyRatings}
                        </CardBody></Card>
                    </Collapse>
                </Container>
                <Row className="mb-2 mt-2">
                    <span>{t("defense.instructions")}</span>
                </Row>
                    <Hand tiles={this.state.players[0].hand}
                        lastDraw={this.state.lastDraw}
                        onTileClick={this.onTileClicked} />
                <Row className="mt-2">
                    <Col xs="6" sm="3" md="3" lg="2">
                        <Button className="btn-block" color={this.state.isComplete ? "success" : "warning"} onClick={() => this.onNewHand()}>{t("trainer.newHandButtonLabel")}</Button>
                    </Col>
                </Row>
                <Row className="mt-2 no-gutters">
                    <History history={this.state.history} concise={true} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers}/>
                    <DiscardPool players={this.state.players} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} />
                </Row>
            </Container>
        );
    }
}
export default withTranslation()(DefenseState);