import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import History from "../components/History";
import Settings from '../components/Settings';
import CopyButton from '../components/CopyButton';
import LoadButton from '../components/LoadButton';
import DiscardPool from "../components/DiscardPool";
import ValueTileDisplay from "../components/ValueTileDisplay";
import StatsDisplay from "../components/StatsDisplay";
import { GenerateHand, FillHand } from '../scripts/GenerateHand';
import { CalculateDiscardUkeire, CalculateUkeireFromOnlyHand } from "../scripts/UkeireCalculator";
import { CalculateMinimumShanten, CalculateStandardShanten } from "../scripts/ShantenCalculator";
import { getTileAsText } from "../scripts/TileConversions";
import { convertHandToTenhouString } from "../scripts/HandConversions";
import { evaluateBestDiscard } from "../scripts/Evaluations";

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
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            settings: {
                characters: true,
                bamboo: true,
                circles: true,
                honors: false,
                threePlayer: false,
                redFives: 3,
                verbose: true,
                extraConcise: false,
                spoilers: true,
                reshuffle: true,
                simulate: false,
                exceptions: true,
            },
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
            dora: 1
        }
    }

    componentDidMount() {
        if (typeof (Storage) !== "undefined") {
            let savedSettings = window.localStorage.getItem("settings");
            if (savedSettings) {
                savedSettings = JSON.parse(savedSettings);

                this.setState({
                    settings: {
                        characters: savedSettings.characters,
                        bamboo: savedSettings.bamboo,
                        circles: savedSettings.circles,
                        honors: savedSettings.honors,
                        threePlayer: savedSettings.threePlayer,
                        redFives: savedSettings.redFives || 3,
                        verbose: savedSettings.verbose,
                        extraConcise: savedSettings.extraConcise,
                        spoilers: savedSettings.spoilers,
                        reshuffle: savedSettings.reshuffle,
                        simulate: savedSettings.simulate,
                        exceptions: savedSettings.exceptions,
                    }
                }, () => this.onNewHand());
            }
            
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
            }
        }

        this.onNewHand();
    }

    discardHand() {
        let hand = this.state.hand;
        let discards = this.state.discardPool;

        for (let i = 0; i < hand.length; i++) {
            if (hand[i] === 0) continue;

            for (let j = 0; j < hand[i]; j++) {
                discards.push({tile: i, player: false});
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
        if(!this.state.settings.threePlayer) {
            possibilities.push(34);
        }

        return possibilities[Math.floor(Math.random() * possibilities.length)];
    }

    getNewHandState(hand, availableTiles, tilePool, history, discards, dora) {
        history.unshift({feedback:"Started a new hand: " + convertHandToTenhouString(hand), hand:""});
        return {
            hand: hand,
            remainingTiles: availableTiles,
            tilePool: tilePool,
            discardPool: discards,
            discardCount: 0,
            optimalCount: 0,
            achievedTotal: 0,
            possibleTotal: 0,
            history: history,
            isComplete: false,
            lastDraw: -1,
            roundWind: this.pickRoundWind(),
            seatWind: this.pickSeatWind(),
            dora: dora
        }
    }

    onNewHand() {
        let history = [];
        let dora = 1;
        let hand, testedHand, availableTiles, tilePool;

        if (!this.state.settings.reshuffle) {
            this.discardHand();
            let remainingTiles = this.state.remainingTiles;

            if(this.state.tilePool.length > 0) {
                dora = this.state.tilePool[Math.floor(Math.random() * this.state.tilePool.length)];
                remainingTiles[dora]--;
            }

            do
            {
                let generationResult = GenerateHand(remainingTiles);
                hand = generationResult.hand;
                availableTiles = generationResult.availableTiles;
                tilePool = generationResult.tilePool;

                if(!hand) break;

                testedHand = hand.slice();
                for(let i = 0; i < 30; i += 10) {
                    testedHand[i + 5] += testedHand[i];
                    testedHand[i] = 0;
                }
            } while (CalculateMinimumShanten(testedHand) === -1)

            if (!hand) {
                history.push({feedback: "There aren't enough tiles left in the wall to make a new hand. Shuffling.", hand:""});
            }
            else {
                this.setState(this.getNewHandState(hand, availableTiles, tilePool, history, this.state.discardPool, dora));
                return;
            }
        }

        let remainingTiles = this.resetRemainingTiles();
        do
        {
            let generationResult = GenerateHand(remainingTiles);
            hand = generationResult.hand;
            availableTiles = generationResult.availableTiles;
            tilePool = generationResult.tilePool;

            if(!hand) {
                history.push({feedback: "Did you turn off all the tile types? How do you expect to make a hand with no tiles?", hand:""});
                this.setState({
                    history: history
                });
                return;
            }
            
            testedHand = hand.slice();
            for(let i = 0; i < 30; i += 10) {
                testedHand[i + 5] += testedHand[i];
                testedHand[i] = 0;
            }
        } while (CalculateMinimumShanten(testedHand) === -1)

        if(tilePool.length > 0) {
            dora = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
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

            if(this.state.settings.threePlayer) {
                for(let i = 2; i < 9; i++) {
                    remainingTiles[i] = 0;
                }
            }
        }

        if (this.state.settings.bamboo) {
            for (let i = 11; i < 20; i++) {
                remainingTiles[i] = 4;
            }
        }

        if (this.state.settings.circles) {
            for (let i = 21; i < 30; i++) {
                remainingTiles[i] = 4;
            }
        }

        if (this.state.settings.honors) {
            for (let i = 31; i < 38; i++) {
                remainingTiles[i] = 4;
            }
        }

        if(this.state.settings.redFives > 0) {
            let suit = 20;

            for(let i = 0; i < this.state.settings.redFives; i++) {
                if(remainingTiles[suit + 5] > 0) {
                    remainingTiles[suit + 5]--;
                    remainingTiles[suit]++;
                }

                suit = (suit + 10) % 30;
            }
        }

        return remainingTiles;
    }

    onSettingsChanged(event, numberString, numberInput) {
        if(!event) return;

        let settings = this.state.settings;
        
        if(typeof event === "number")
        {
            settings[numberInput.id] = event;
        }
        else
        {
            settings[event.target.id] = !settings[event.target.id];
        }

        this.setState({
            settings: settings
        });

        if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem("settings", JSON.stringify(settings));
        }
    }

    onTileClicked(event) {
        let isComplete = this.state.isComplete;
        if (isComplete) return;

        let chosenTile = parseInt(event.target.name);
        let hand = this.state.hand;
        let historyString = convertHandToTenhouString(hand);

        let testedHand = hand.slice();
        for(let i = 0; i < 30; i += 10) {
            testedHand[i + 5] += testedHand[i];
            testedHand[i] = 0;
        }

        let remainingTiles = this.state.remainingTiles;
        let testedTiles = remainingTiles.slice();
        for(let i = 0; i < 30; i += 10) {
            testedTiles[i + 5] += testedTiles[i];
            testedTiles[i] = 0;
        }

        let shantenFunction = this.state.settings.exceptions ? CalculateMinimumShanten : CalculateStandardShanten;
        let ukeire = CalculateDiscardUkeire(testedHand, testedTiles, shantenFunction);
        let bestUkeire = Math.max(...ukeire);
        
        hand[chosenTile]--;
        
        let adjustedChoice = chosenTile;
        if(adjustedChoice % 10 === 0) {
            adjustedChoice += 5;
        }
        
        let chosenUkeire = ukeire[adjustedChoice];
        
        testedHand[adjustedChoice]--;
        
        let shanten = shantenFunction(testedHand);
        let handUkeire = CalculateUkeireFromOnlyHand(testedHand, this.resetRemainingTiles(), shantenFunction)
        let bestTile = evaluateBestDiscard(ukeire);
        let result = this.generateHistoryString(chosenTile, chosenUkeire, bestTile, bestUkeire, shanten);

        let discardPool = this.state.discardPool.slice();
        discardPool.push({tile: chosenTile, player: this.state.settings.simulate});
        let achievedTotal = this.state.achievedTotal + chosenUkeire;
        let possibleTotal = this.state.possibleTotal + bestUkeire;
        let tilePool = this.state.tilePool;
        let drawnTile = -1;

        if (shanten <= 0 && handUkeire === 0) {
            if(this.state.settings.extraConcise) {
                result += " Keishiki tenpai."
            } else {
                result += " You are now in keishiki tenpai. Your hand is ready, but all the winning tiles are in your hand. This doesn't count as ready in almost all rulesets. You may need to break your tenpai in order to progress.";
            }
        }
        else if (shanten <= 0) {
            result += ` Your hand is now ready. Congratulations! Your efficiency was ${achievedTotal}/${possibleTotal}, or ${Math.floor(achievedTotal / possibleTotal * 100)}%. `;
            isComplete = true;
        }
        
        if(!isComplete) {
            if (this.state.settings.simulate) {
                for (let i = 0; i < 3; i++) {
                    if (tilePool.length === 0) continue;

                    let simulatedDiscard = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
                    discardPool.push({tile: simulatedDiscard, player: false});
                    remainingTiles[simulatedDiscard]--;
                }
            }

            if (tilePool.length > 0) {
                drawnTile = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
                hand[drawnTile]++;
                remainingTiles[drawnTile]--;

                if (this.state.settings.extraConcise) {
                    result += ` Draw: ${getTileAsText(drawnTile, this.state.settings.verbose)}. `
                } else {
                    result += ` You drew the ${getTileAsText(drawnTile, this.state.settings.verbose)}. `;
                }
            }
            else {
                result += " There are no tiles left in the wall. Better luck next time! ";
                isComplete = true;
            }
        }

        let history = this.state.history;
        history.unshift({feedback: result, hand: historyString});

        this.setState({
            hand: hand,
            tilePool: tilePool,
            remainingTiles: remainingTiles,
            discardPool: discardPool,
            discardCount: this.state.discardCount + 1,
            optimalCount: this.state.optimalCount + (chosenUkeire === bestUkeire ? 1 : 0),
            hasCopied: false,
            achievedTotal: achievedTotal,
            possibleTotal: possibleTotal,
            history: history,
            isComplete: isComplete,
            lastDraw: drawnTile
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

    generateHistoryString(chosenTile, chosenUkeire, bestTile, bestUkeire, shanten) {
        let result;

        if (this.state.settings.extraConcise) {
            result = `Discard: ${getTileAsText(chosenTile, this.state.settings.verbose)} (`;

            if (chosenUkeire > 0 || shanten === 0) {
                result += `${chosenUkeire} tiles). `;
            }
            else {
                result += `lowered shanten). `
            }

            if (chosenUkeire < bestUkeire) {
                result += "Best: ";

                if (this.state.settings.spoilers) {
                    result += `${getTileAsText(bestTile, this.state.settings.verbose)}, with `;
                }

                result += `${bestUkeire} tiles.`;
            }
            else {
                result += "That was the best choice!";
            }
        }
        else {
            result = `You chose to discard the ${getTileAsText(chosenTile, this.state.settings.verbose)}, which `;

            if (chosenUkeire > 0 || shanten === 0) {
                result += `results in ${chosenUkeire} tiles that can improve the hand. `;
            }
            else {
                result += `lowers your shanten - you are now further from ready. `
            }

            if (chosenUkeire < bestUkeire) {
                result += "The most efficient tile to discard";

                if (this.state.settings.spoilers) {
                    result += `, the ${getTileAsText(bestTile, this.state.settings.verbose)},`;
                }

                result += ` would have resulted in ${bestUkeire} tiles being able to improve your hand.`;
            }
            else {
                result += "That was the best choice. Good work!";
            }
        }

        return result;
    }

    loadHand(loadData) {
        if(loadData.tiles === 0) {
            this.logToHistory("Error: Couldn't understand provided hand. ");
            return;
        }

        let remainingTiles = this.resetRemainingTiles();

        for(let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let {hand, availableTiles, tilePool} = FillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if(loadData.tiles === 0) {
            this.logToHistory("Error: Couldn't understand provided hand. ");
            return;
        }
        
        let dora = 1;
        if(tilePool.length > 0) {
            dora = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
            remainingTiles[dora]--;
        }

        this.setState(this.getNewHandState(hand, availableTiles, tilePool, [], [], dora));
    }

    logToHistory(text) {
        let history = this.state.history;
        history.unshift({feedback: text, hand:""});
        this.setState({
            history: history,
        });
    }

    render() {
        return (
            <Container>
                <Settings values={this.state.settings} onChange={this.onSettingsChanged} />
                <StatsDisplay values={this.state.stats} onReset={() => this.resetStats()}/>
                <ValueTileDisplay roundWind={this.state.roundWind} seatWind={this.state.seatWind} dora={this.state.dora}/>
                <Row className="mb-2 mt-2">
                    <span>Click the tile you want to discard.</span>
                </Row>
                <Hand tiles={this.state.hand} lastDraw={this.state.lastDraw} onTileClick={this.onTileClicked} />
                <Row className="mt-2">
                    <Col xs="6" sm="3" md="3" lg="2">
                        <Button className="btn-block" color={this.state.isComplete ? "success" : "warning"} onClick={() => this.onNewHand()}>New Hand</Button>
                    </Col>
                    <CopyButton hand={this.state.hand}/>
                    <LoadButton callback={this.loadHand}/>
                </Row>
                <Row className="mt-2 no-gutters">
                    <History history={this.state.history}/>
                    <DiscardPool discardPool={this.state.discardPool} discardCount={this.state.discardCount} wallCount={this.state.tilePool && this.state.tilePool.length}/>
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