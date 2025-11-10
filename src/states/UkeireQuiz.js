import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import History from "../components/History";
import Settings from '../components/ukeire-quiz/Settings';
import CopyButton from '../components/CopyButton';
import LoadButton from '../components/LoadButton';
import DiscardPool from "../components/DiscardPool";
import ValueTileDisplay from "../components/ValueTileDisplay";
import StatsDisplay from "../components/ukeire-quiz/StatsDisplay";
import { generateHand, fillHand } from '../scripts/GenerateHand';
import { calculateDiscardUkeire, calculateUkeireFromOnlyHand } from "../scripts/UkeireCalculator";
import { calculateMinimumShanten, calculateStandardShanten } from "../scripts/ShantenCalculator";
import { convertRedFives } from "../scripts/TileConversions";
import { convertHandToTenhouString, convertHandToTileIndexArray } from "../scripts/HandConversions";
import { evaluateBestDiscard } from "../scripts/Evaluations";
import { shuffleArray, removeRandomItem, getRandomItem } from '../scripts/Utils';
import SortedHand from '../components/SortedHand';
import Player from '../models/Player';
import { PLAYER_NAMES } from '../Constants';
import { withTranslation } from 'react-i18next';
import LocalizedMessage from '../models/LocalizedMessage';
import UkeireHistoryData from '../components/ukeire-quiz/UkeireHistoryData';
import HistoryData from '../models/HistoryData';

class UkeireQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.onSettingsChanged = this.onSettingsChanged.bind(this);
        this.onTileClicked = this.onTileClicked.bind(this);
        this.loadHand = this.onHandLoaded.bind(this);
        this.updateTime = this.onUpdateTime.bind(this);
        this.timerUpdate = null;
        this.timer = null;
        this.state = {
            hand: null,
            lastDraw: -1,
            remainingTiles: null,
            tilePool: null,
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
            shuffle: [],
            disclaimerSeen: false,
            currentTime: 0,
            currentBonus: 0,
        }
    }

    componentDidMount() {
        try {
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
                this.setState({}, () => this.onNewHand());
            }
        } catch {
            this.setState({}, () => this.onNewHand());
        }
    }

    componentWillUnmount() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }
    }

    onSettingsChanged(settings) {
        if (!settings.useTimer) {
            if (this.timer != null) {
                clearTimeout(this.timer);
                clearInterval(this.timerUpdate);
            }
        }

        this.setState({
            settings: settings
        });
    }

    /** Puts all the tiles in the player's hand into the player's discards. */
    discardHand() {
        let hand = this.state.hand;
        let players = this.state.players.slice();

        for (let i = 0; i < hand.length; i++) {
            if (hand[i] === 0) continue;

            for (let j = 0; j < hand[i]; j++) {
                players[0].discards.push(i);
            }
        }

        this.setState({
            players: players
        });
    }

    /** 
     * Randomly chooses between East and South round. 
     * @returns {number} 31 for East, 32 for South
     */
    pickRoundWind() {
        return getRandomItem([31, 32]);
    }

    /**
     * Randomly chooses a seat for the player, between East, South, West, and North (unless it's three player)
     * @returns {number} A number between 31 and 34
     */
    pickSeatWind() {
        let possibilities = [31, 32, 33];
        if (!this.state.settings.threePlayer) {
            possibilities.push(34);
        }

        return getRandomItem(possibilities);
    }

    /**
     * Sets the state to a clean slate based on the given parameters.
     * @param {TileCounts} hand The player's hand.
     * @param {TileCounts} availableTiles The tiles remaining in the wall.
     * @param {TileIndex[]} tilePool A list of tile indexes representing the remaining tiles.
     * @param {UkeireHistoryData[]} history A list of history objects.
     * @param {TileIndex} dora The dora indicator.
     * @param {TileIndex} lastDraw The tile the player just drew.
     * @param {TileIndex} seatWind The player's seat.
     * @param {TileIndex} roundWind The round.
     */
    setNewHandState(hand, availableTiles, tilePool, history, dora, lastDraw = false, seatWind = false, roundWind = false) {
        history.unshift(new HistoryData(new LocalizedMessage("trainer.start", { hand: convertHandToTenhouString(hand) })));

        let players = [];
        let numberOfPlayers = this.state.settings.threePlayer ? 3 : 4;
        seatWind = seatWind || this.pickSeatWind();

        for (let i = 0; i < numberOfPlayers; i++) {
            let player = new Player();
            player.name = PLAYER_NAMES[i];
            player.seat = (seatWind - 31 + i) % numberOfPlayers;
            players.push(player);
        }

        if (lastDraw !== false) hand[lastDraw]--;
        let shuffle = convertHandToTileIndexArray(hand);
        if (lastDraw !== false) hand[lastDraw]++;
        shuffle = shuffleArray(shuffle);

        this.setState({
            hand: hand,
            remainingTiles: availableTiles,
            tilePool: tilePool,
            players: players,
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            history: history,
            isComplete: false,
            lastDraw: lastDraw || shuffle.pop(),
            roundWind: roundWind || this.pickRoundWind(),
            seatWind: seatWind,
            dora: dora,
            shuffle: shuffle,
            currentTime: this.state.settings.time + 2,
            currentBonus: this.state.settings.extraTime
        });

        if (this.state.disclaimerSeen && this.state.settings.useTimer) {
            this.timer = setTimeout(
                () => {
                    this.onTileClicked({target:{name:this.state.lastDraw}});
                    this.setState({
                        currentBonus: 0
                    });
                },
                (this.state.settings.time + this.state.settings.extraTime + 2) * 1000
            );
            this.timerUpdate = setInterval(this.updateTime, 100);
        }
    }

    /** Generates a new hand and fresh game state. */
    onNewHand() {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let history = [];
        let dora = 1;
        let hand, availableTiles, tilePool;

        let minShanten = this.state.settings.minShanten;
        minShanten = Math.max(0, minShanten);

        // Count how many suits are currently enabled.
        let allowedSuits = +this.state.settings.honors
            + +this.state.settings.bamboo
            + +this.state.settings.characters
            + +this.state.settings.circles;

        minShanten = Math.min(minShanten, allowedSuits);

        if (!this.state.settings.reshuffle && this.state.hand) {
            this.discardHand();
            let remainingTiles = this.state.remainingTiles.slice();

            if (this.state.tilePool.length > 0) {
                dora = removeRandomItem(this.state.tilePool);
                remainingTiles[dora]--;
            }

            do {
                let generationResult = generateHand(remainingTiles);
                hand = generationResult.hand;
                availableTiles = generationResult.availableTiles;
                tilePool = generationResult.tilePool;

                if (!hand) break;
            } while (calculateMinimumShanten(hand) < minShanten)

            if (!hand) {
                history.push(new HistoryData(new LocalizedMessage("trainer.error.wallEmptyShuffle")));
                // Continues into the normal flow, rebuilding the wall.
            }
            else {
                this.setNewHandState(hand, availableTiles, tilePool, history, dora);
                return;
            }
        }

        let remainingTiles = this.getStartingTiles();
        do {
            let generationResult = generateHand(remainingTiles);
            hand = generationResult.hand;
            availableTiles = generationResult.availableTiles;
            tilePool = generationResult.tilePool;

            if (!hand) {
                history.push(new HistoryData(new LocalizedMessage("trainer.error.wallEmpty")));

                this.setState({
                    history: history
                });
                return;
            }
        } while (calculateMinimumShanten(hand) < minShanten)

        if (tilePool.length > 0) {
            dora = removeRandomItem(tilePool);
            availableTiles[dora]--;
        }

        this.setNewHandState(hand, availableTiles, tilePool, history, dora);
    }

    /**
     * Creates an array containing how many of each tile should be in the wall at the start of the game based on the current settings.
     * @returns {TileCounts} The available tiles.
     */
    getStartingTiles() {
        let availableTiles = Array(38).fill(0);

        if (this.state.settings.characters) {
            for (let i = 1; i < 10; i++) {
                availableTiles[i] = 4;
            }

            if (this.state.settings.threePlayer) {
                for (let i = 2; i < 9; i++) {
                    availableTiles[i] = 0;
                }
            }
        }

        if (this.state.settings.circles) {
            for (let i = 11; i < 20; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.state.settings.bamboo) {
            for (let i = 21; i < 30; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.state.settings.honors) {
            for (let i = 31; i < 38; i++) {
                availableTiles[i] = 4;
            }
        }

        if (this.state.settings.redFives > 0) {
            // Start with pinzu, since 4 red fives usually involves two 0p
            let suit = 10;

            for (let i = 0; i < this.state.settings.redFives; i++) {
                if (availableTiles[suit + 5] > 0) {
                    availableTiles[suit + 5]--;
                    availableTiles[suit]++;
                }

                suit = (suit + 10) % 30;
            }
        }

        return availableTiles;
    }

    /** Discards the clicked tile, adds a message comparing its efficiency with the best tile, and draws a new tile */
    onTileClicked(event) {
        if (this.timer != null) {
            clearTimeout(this.timer);
            clearInterval(this.timerUpdate);
        }

        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand.slice();
        let remainingTiles = this.state.remainingTiles.slice();

        let shantenFunction = this.state.settings.exceptions ? calculateMinimumShanten : calculateStandardShanten;
        let ukeire = calculateDiscardUkeire(hand, remainingTiles, shantenFunction);
        let chosenUkeire = ukeire[convertRedFives(chosenTile)];

        let handString = convertHandToTenhouString(hand);
        hand[chosenTile]--;

        let shanten = shantenFunction(hand);
        let handUkeire = calculateUkeireFromOnlyHand(hand, this.getStartingTiles(), shantenFunction);
        let bestTile = evaluateBestDiscard(ukeire, this.state.dora + 1);

        let players = this.state.players.slice();
        players[0].discards.push(chosenTile);

        let achievedTotal = this.state.achievedTotal + chosenUkeire.value;
        let possibleTotal = this.state.possibleTotal + ukeire[bestTile].value;
        let tilePool = this.state.tilePool.slice();
        let drawnTile = -1;


        let historyData = new UkeireHistoryData(
            chosenTile,
            chosenUkeire,
            bestTile,
            ukeire[bestTile],
            shanten,
            handString,
            handUkeire,
            players[0].discards.slice()
        );

        if (shanten <= 0 && handUkeire.value > 0) {
            // If the hand is tenpai, and has winning tiles outside of the hand, training is complete
            let message = new LocalizedMessage("trainer.complete", { achieved: achievedTotal, total: possibleTotal, percent: Math.floor(achievedTotal / possibleTotal * 1000) / 10 })
            historyData.message = message;
            isComplete = true;
        }

        if (!isComplete) {
            if (this.state.settings.simulate) {
                for (let i = 1; i < players.length; i++) {
                    if (tilePool.length === 0) continue;

                    let simulatedDiscard = removeRandomItem(tilePool);
                    players[i].discards.push(simulatedDiscard);
                    remainingTiles[simulatedDiscard]--;
                }
            }

            if (tilePool.length > 0) {
                drawnTile = removeRandomItem(tilePool);
                hand[drawnTile]++;
                remainingTiles[drawnTile]--;

                historyData.drawnTile = drawnTile;

                if (this.state.settings.useTimer) {
                    this.timer = setTimeout(
                        () => {
                            this.onTileClicked({target:{name:this.state.lastDraw}});
                            this.setState({
                                currentBonus: 0
                            });
                        },
                        (this.state.settings.time + this.state.currentBonus) * 1000
                    );
                    this.timerUpdate = setInterval(this.updateTime, 100);
                }
            }
            else {
                // No tiles left in the wall
                isComplete = true;
            }
        }

        let history = this.state.history;
        history.unshift(historyData);

        let shuffle = this.state.shuffle.slice();

        if (chosenTile !== this.state.lastDraw) {
            for (let i = 0; i < shuffle.length; i++) {
                if (shuffle[i] === chosenTile) {
                    shuffle[i] = this.state.lastDraw;
                    break;
                }
            }
        }

        this.setState({
            hand: hand,
            tilePool: tilePool,
            remainingTiles: remainingTiles,
            players: players,
            discardCount: this.state.discardCount + 1,
            optimalCount: this.state.optimalCount + (chosenUkeire.value === ukeire[bestTile].value ? 1 : 0),
            hasCopied: false,
            achievedTotal: achievedTotal,
            possibleTotal: possibleTotal,
            history: history,
            isComplete: isComplete,
            lastDraw: drawnTile,
            shuffle: shuffle,
            disclaimerSeen: true,
            currentTime: this.state.settings.time,
        }, isComplete ? () => this.saveStats() : undefined);
    }

    onUpdateTime() {
        if (this.state.currentTime > 0.1) {
            this.setState({
                currentTime: Math.max(this.state.currentTime - 0.1, 0)
            });
        } else {
            this.setState({
                currentBonus: Math.max(this.state.currentBonus - 0.1, 0)
            });
        }
    }

    /** Save the player's current stats into local storage. */
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

        try {
            window.localStorage.setItem("stats", JSON.stringify(stats));
        } catch { }
    }

    /** Reset the player's stats to nothing. */
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

        try {
            window.localStorage.setItem("stats", JSON.stringify(stats));
        } catch { }
    }

    /**
     * Starts a new round with the hand the player loaded, if possible.
     * @param {{hand:TileCounts, tiles:number, dora:TileIndex, roundWind:number, seatWind: number, draw:TileIndex}} loadData The data from the hand parser.
     */
    onHandLoaded(loadData) {
        if (loadData.tiles === 0) {
            this.logToHistory("trainer.error.load");
            return;
        }

        let remainingTiles = this.getStartingTiles();

        // Remove the tiles in the hand from the wall
        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let dora = loadData.dora;
        if (dora !== false) {
            dora = Math.min(Math.max(0, dora), 37);
            remainingTiles[dora]--;
        }

        let { hand, availableTiles, tilePool } = fillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if (!hand) {
            this.logToHistory("trainer.error.wallEmpty");
            return;
        }

        if (dora === false) {
            if (tilePool.length > 0) {
                dora = removeRandomItem(tilePool);
                availableTiles[dora]--;
            }
        }

        let roundWind = loadData.roundWind;
        let seatWind = loadData.seatWind;
        let draw = loadData.draw;

        if (roundWind !== false) {
            roundWind = Math.min(Math.max(1, roundWind), 4) + 30;
        }
        if (seatWind !== false) {
            seatWind = Math.min(Math.max(1, seatWind), 4) + 30;
        }
        if (draw !== false) {
            draw = Math.min(Math.max(0, draw), 37);
            // Ensure the drawn tile is in the hand
            if (hand[draw] <= 0) draw = false;
        }

        this.setNewHandState(hand, availableTiles, tilePool, [], dora, draw, seatWind, roundWind);
    }

    /**
     * Adds an object to the history containing just a message.
     * @param {string} text The localization key to log to the history.
     */
    logToHistory(text) {
        let history = this.state.history;
        history.unshift(new HistoryData(new LocalizedMessage(text)));
        this.setState({
            history: history,
        });
    }

    render() {
        let { t } = this.props;
        let blind = this.state.players.length && this.state.players[0].discards.length && this.state.settings.blind && !this.state.isComplete;

        return (
            <Container>
                <Settings onChange={this.onSettingsChanged} />
                <StatsDisplay values={this.state.stats} onReset={() => this.resetStats()} />
                <Row>
                    {this.state.disclaimerSeen ? "" : <span>{t("trainer.disclaimer")}</span>}
                </Row>
                <ValueTileDisplay roundWind={this.state.roundWind} seatWind={this.state.seatWind} dora={this.state.dora} showIndexes={this.state.settings.showIndexes} />
                <Row className="mb-2 mt-2">
                    <span>{t("trainer.instructions")}</span>
                </Row>
                {this.state.settings.sort
                    ? <Hand tiles={this.state.hand}
                        lastDraw={this.state.lastDraw}
                        onTileClick={this.onTileClicked}
                        showIndexes={this.state.settings.showIndexes && !blind}
                        blind={blind} />
                    : <SortedHand tiles={this.state.shuffle}
                        lastDraw={this.state.lastDraw}
                        onTileClick={this.onTileClicked}
                        showIndexes={this.state.settings.showIndexes && !blind}
                        blind={blind} />
                }
                {this.state.settings.useTimer ?
                    <Row className="mt-2" style={{justifyContent:'flex-end', marginRight:1}}><span>{this.state.currentTime.toFixed(1)} + {this.state.currentBonus.toFixed(1)}</span></Row>
                    : ""
                }
                <Row className="mt-2">
                    <Col xs="6" sm="3" md="3" lg="2">
                        <Button className="btn-block" color={this.state.isComplete ? "success" : "warning"} onClick={() => this.onNewHand()}>{t("trainer.newHandButtonLabel")}</Button>
                    </Col>
                    <CopyButton hand={this.state.hand} />
                    <LoadButton callback={this.loadHand} />
                </Row>
                <Row className="mt-2 no-gutters">
                    <History history={this.state.history} concise={this.state.settings.extraConcise} verbose={this.state.settings.verbose} spoilers={this.state.settings.spoilers}/>
                    <DiscardPool players={this.state.players} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length} showIndexes={this.state.settings.showIndexes} />
                </Row>
            </Container>
        );
    }
}

export default withTranslation()(UkeireQuiz);
