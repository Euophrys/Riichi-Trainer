import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import History from "../components/ukeire-quiz/History";
import Settings from '../components/ukeire-quiz/Settings';
import CopyButton from '../components/CopyButton';
import LoadButton from '../components/LoadButton';
import DiscardPool from "../components/DiscardPool";
import ValueTileDisplay from "../components/ValueTileDisplay";
import StatsDisplay from "../components/ukeire-quiz/StatsDisplay";
import { GenerateHand, FillHand } from '../scripts/GenerateHand';
import { CalculateDiscardUkeire, CalculateUkeireFromOnlyHand } from "../scripts/UkeireCalculator";
import { CalculateMinimumShanten, CalculateStandardShanten } from "../scripts/ShantenCalculator";
import { convertRedFives } from "../scripts/TileConversions";
import { convertHandToTenhouString, convertHandToTileArray } from "../scripts/HandConversions";
import { evaluateBestDiscard } from "../scripts/Evaluations";
import { shuffleArray, removeRandomItem, getRandomItem } from '../scripts/Utils';
import SortedHand from '../components/SortedHand';
import Player from '../models/Player';
import { PLAYER_NAMES } from '../Constants';

class Quiz extends React.Component {
    constructor(props) {
        super(props);
        this.onSettingsChanged = this.onSettingsChanged.bind(this);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.loadHand = this.loadHand.bind(this);
        this.state = {
            hand: null,
            lastDraw: -1,
            remainingTiles: null,
            tilePool: null,
            discardPool: [],
            players: [],
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            settings: { /* See ../components/ukeire-quiz/Settings.js */ },
            stats: {
                totalDiscards: 0,
                totalTenpai: 0,
                totalEfficiency: 0,
                totalPossibleEfficiency: 0,
                totalOptimalDiscards: 0
            },
            history: [],
            isComplete: false,
            roundWind: 31,
            seatWind: 31,
            dora: 1,
            shuffle: []
        }
    }

    componentDidMount() {
        if (typeof (Storage) !== "undefined") {
            let savedStats = window.localStorage.getItem("stats");
            if (savedStats) {
                savedStats = JSON.parse(savedStats);

                this.setState({
                    stats: {
                        totalDiscards: savedStats.totalDiscards,
                        totalTenpai: savedStats.totalTenpai,
                        totalEfficiency: savedStats.totalEfficiency,
                        totalPossibleEfficiency: savedStats.totalPossibleEfficiency,
                        totalOptimalDiscards: savedStats.totalOptimalDiscards
                    }
                }, () => this.onNewHand());
            } else {
                this.onNewHand();
            }
        }
        else {
            this.onNewHand();
        }
    }

    onSettingsChanged(settings) {
        this.setState({
            settings: settings
        });
    }

    discardHand() {
        let hand = this.state.hand;
        let discards = this.state.discardPool;

        for (let i = 0; i < hand.length; i++) {
            if (hand[i] === 0) continue;

            for (let j = 0; j < hand[i]; j++) {
                discards.push({ tile: i, player: false });
            }
        }

        this.setState({
            discardPool: discards
        });
    }

    pickRoundWind() {
        let possibilities = [31, 32];
        return possibilities[Math.floor(Math.random() * possibilities.length)];
    }

    pickSeatWind() {
        let possibilities = [31, 32, 33];
        if (!this.state.settings.threePlayer) {
            possibilities.push(34);
        }

        return possibilities[Math.floor(Math.random() * possibilities.length)];
    }

    getNewHandState(hand, availableTiles, tilePool, history, discards, dora) {
        history.unshift({ message: "Started a new hand: " + convertHandToTenhouString(hand) });

        let players = [];
        let numberOfPlayers = this.state.settings.threePlayer ? 3 : 4;
        let seatWind = this.pickSeatWind();

        for(let i = 0; i < numberOfPlayers; i++) {
            let player = new Player();
            player.name = PLAYER_NAMES[i];
            player.seat = (seatWind - 31 + i) % numberOfPlayers;
            players.push(player);
        }

        let shuffle = convertHandToTileArray(hand);
        shuffle = shuffleArray(shuffle);
        return {
            hand: hand,
            remainingTiles: availableTiles,
            tilePool: tilePool,
            players: players,
            discardPool: discards,
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            history: history,
            isComplete: false,
            lastDraw: shuffle.pop(),
            roundWind: this.pickRoundWind(),
            seatWind: seatWind,
            dora: dora,
            shuffle: shuffle
        }
    }

    onNewHand() {
        let history = [];
        let dora = 1;
        let hand, availableTiles, tilePool;

        let minShanten = this.state.settings.minShanten;
        minShanten = Math.max(0, minShanten);
        let allowedSuits = +this.state.settings.honors
            + +this.state.settings.bamboo
            + +this.state.settings.characters
            + +this.state.settings.circles;
        minShanten = Math.min(minShanten, allowedSuits);

        if (!this.state.settings.reshuffle && this.state.hand) {
            this.discardHand();
            let remainingTiles = this.state.remainingTiles;

            if (this.state.tilePool.length > 0) {
                dora = getRandomItem(this.state.tilePool);
                remainingTiles[dora]--;
            }

            do {
                let generationResult = GenerateHand(remainingTiles);
                hand = generationResult.hand;
                availableTiles = generationResult.availableTiles;
                tilePool = generationResult.tilePool;

                if (!hand) break;
            } while (CalculateMinimumShanten(hand) < minShanten)

            if (!hand) {
                history.push({ message: "There aren't enough tiles left in the wall to make a new hand. Shuffling." });
            }
            else {
                this.setState(this.getNewHandState(hand, availableTiles, tilePool, history, this.state.discardPool, dora));
                return;
            }
        }

        let remainingTiles = this.resetRemainingTiles();
        do {
            let generationResult = GenerateHand(remainingTiles);
            hand = generationResult.hand;
            availableTiles = generationResult.availableTiles;
            tilePool = generationResult.tilePool;

            if (!hand) {
                history.push({ message: "There are not enough tiles to create a hand." });
                this.setState({
                    history: history
                });
                return;
            }
        } while (CalculateMinimumShanten(hand) < minShanten)

        if (tilePool.length > 0) {
            dora = removeRandomItem(tilePool);
            remainingTiles[dora]--;
        }

        this.setState(this.getNewHandState(hand, availableTiles, tilePool, history, [], dora));
    }

    resetRemainingTiles() {
        let remainingTiles = Array(38).fill(0);

        if (this.state.settings.characters) {
            for (let i = 1; i < 10; i++) {
                remainingTiles[i] = 4;
            }

            if (this.state.settings.threePlayer) {
                for (let i = 2; i < 9; i++) {
                    remainingTiles[i] = 0;
                }
            }
        }

        if (this.state.settings.circles) {
            for (let i = 11; i < 20; i++) {
                remainingTiles[i] = 4;
            }
        }

        if (this.state.settings.bamboo) {
            for (let i = 21; i < 30; i++) {
                remainingTiles[i] = 4;
            }
        }

        if (this.state.settings.honors) {
            for (let i = 31; i < 38; i++) {
                remainingTiles[i] = 4;
            }
        }

        if (this.state.settings.redFives > 0) {
            let suit = 20;

            for (let i = 0; i < this.state.settings.redFives; i++) {
                if (remainingTiles[suit + 5] > 0) {
                    remainingTiles[suit + 5]--;
                    remainingTiles[suit]++;
                }

                suit = (suit + 10) % 30;
            }
        }

        return remainingTiles;
    }

    onTileClicked(event) {
        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();

        let remainingTiles = this.state.remainingTiles;

        let shantenFunction = this.state.settings.exceptions ? CalculateMinimumShanten : CalculateStandardShanten;
        let ukeire = CalculateDiscardUkeire(hand, remainingTiles, shantenFunction);
        let ukeireValues = ukeire.map(o => o.value);
        let bestUkeire = Math.max(...ukeireValues);
        let handString = convertHandToTenhouString(hand);
        hand[chosenTile]--;
        let chosenUkeire = ukeire[convertRedFives(chosenTile)];

        let shanten = shantenFunction(hand);
        let handUkeire = CalculateUkeireFromOnlyHand(hand, this.resetRemainingTiles(), shantenFunction);
        let bestTile = evaluateBestDiscard(ukeire, this.state.dora + 1);

        let discardPool = this.state.discardPool.slice();
        discardPool.push({ tile: chosenTile, player: this.state.settings.simulate });
        let players = this.state.players.slice();
        players[0].discards.push(chosenTile);

        let achievedTotal = this.state.achievedTotal + chosenUkeire.value;
        let possibleTotal = this.state.possibleTotal + bestUkeire;
        let tilePool = this.state.tilePool;
        let drawnTile = -1;

        let historyObject = {
            chosenTile,
            chosenUkeire,
            bestTile,
            bestUkeire,
            shanten,
            hand: handString,
            handUkeire,
            drawnTile: -1,
            message: "",
            discards: players[0].discards.slice()
        };

        if (shanten <= 0 && handUkeire.value > 0) {
            historyObject.message = ` Your hand is now ready. Congratulations! Your efficiency was ${achievedTotal}/${possibleTotal}, or ${Math.floor(achievedTotal / possibleTotal * 100)}%. `;
            isComplete = true;
        }

        if (!isComplete) {
            if (this.state.settings.simulate) {
                for (let i = 1; i < players.length; i++) {
                    if (tilePool.length === 0) continue;

                    let simulatedDiscard = removeRandomItem(tilePool);
                    discardPool.push({ tile: simulatedDiscard, player: false });
                    players[i].discards.push(simulatedDiscard);
                    remainingTiles[simulatedDiscard]--;
                }
            }

            if (tilePool.length > 0) {
                drawnTile = removeRandomItem(tilePool);
                hand[drawnTile]++;
                remainingTiles[drawnTile]--;

                historyObject.drawnTile = drawnTile;
            }
            else {
                isComplete = true;
            }
        }
        
        let history = this.state.history;
        history.unshift(historyObject);

        let shuffle = this.state.shuffle.slice();

        if(chosenTile !== this.state.lastDraw) {
            for(let i = 0; i < shuffle.length; i++) {
                if(shuffle[i] == chosenTile) {
                    shuffle[i] = this.state.lastDraw;
                    break;
                }
            }
        }

        this.setState({
            hand: hand,
            tilePool: tilePool,
            remainingTiles: remainingTiles,
            discardPool: discardPool,
            players: players,
            discardCount: this.state.discardCount + 1,
            optimalCount: this.state.optimalCount + (chosenUkeire.value === bestUkeire ? 1 : 0),
            hasCopied: false,
            achievedTotal: achievedTotal,
            possibleTotal: possibleTotal,
            history: history,
            isComplete: isComplete,
            lastDraw: drawnTile,
            shuffle: shuffle
        }, isComplete ? () => this.saveStats() : undefined);
    }

    saveStats() {
        let stats = this.state.stats;
        stats.totalDiscards += this.state.discardCount;
        stats.totalTenpai += 1;
        stats.totalEfficiency += this.state.achievedTotal;
        stats.totalPossibleEfficiency += this.state.possibleTotal;
        stats.totalOptimalDiscards += this.state.optimalCount;

        this.setState({
            stats: stats
        });

        if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem("stats", JSON.stringify(stats));
        }
    }

    resetStats() {
        let stats = {
            totalDiscards: 0,
            totalTenpai: 0,
            totalEfficiency: 0,
            totalPossibleEfficiency: 0,
            totalOptimalDiscards: 0
        };

        this.setState({
            stats: stats
        });

        if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem("stats", JSON.stringify(stats));
        }
    }

    loadHand(loadData) {
        if (loadData.tiles === 0) {
            this.logToHistory("Error: Couldn't understand provided hand.");
            return;
        }

        let remainingTiles = this.resetRemainingTiles();

        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let { hand, availableTiles, tilePool } = FillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if (!hand) {
            this.logToHistory("Error: Not enough tiles to make a hand.");
            return;
        }

        let dora = 1;
        if (tilePool.length > 0) {
            dora = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
            remainingTiles[dora]--;
        }

        this.setState(this.getNewHandState(hand, availableTiles, tilePool, [], [], dora));
    }

    logToHistory(text) {
        let history = this.state.history;
        history.unshift({ message: text });
        this.setState({
            history: history,
        });
    }

    render() {
        let blind = this.state.players.length && this.state.players[0].discards.length && this.state.settings.blind && !this.state.isComplete;

        return (
            <Container>
                <Settings onChange={this.onSettingsChanged} />
                <StatsDisplay values={this.state.stats} onReset={() => this.resetStats()} />
                <ValueTileDisplay roundWind={this.state.roundWind} seatWind={this.state.seatWind} dora={this.state.dora} />
                <Row className="mb-2 mt-2">
                    <span>Click the tile you want to discard.</span>
                </Row>
                { this.state.settings.sort
                    ? <Hand tiles={this.state.hand}
                        lastDraw={this.state.lastDraw}
                        onTileClick={this.onTileClicked}
                        blind={blind} />
                    : <SortedHand tiles={this.state.shuffle}
                        lastDraw={this.state.lastDraw} 
                        onTileClick={this.onTileClicked} 
                        blind={blind}/>
                }
                <Row className="mt-2">
                    <Col xs="6" sm="3" md="3" lg="2">
                        <Button className="btn-block" color={this.state.isComplete ? "success" : "warning"} onClick={() => this.onNewHand()}>New Hand</Button>
                    </Col>
                    <CopyButton hand={this.state.hand} />
                    <LoadButton callback={this.loadHand} />
                </Row>
                <Row className="mt-2 no-gutters">
                    <History history={this.state.history} concise={this.state.settings.extraConcise} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers}/>
                    <DiscardPool players={this.state.players} discardPool={this.state.discardPool} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} />
                </Row>
                <Row className="mt-4">
                    <Col xs="12"><span>Credits</span></Col>
                    <Col xs="12"><span>Tile images combined from <a href="https://github.com/FluffyStuff/riichi-mahjong-tiles">riichi-mahjong-tiles by FluffyStuff on Github</a>, licensed under the <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License.</a></span></Col>
                    <Col xs="12"><span>Shanten calculation algorithm adapted from <a href="http://cmj3.web.fc2.com/#syanten">this C program collection.</a></span></Col>
                </Row>
            </Container>
        );
    }
}

export default Quiz;