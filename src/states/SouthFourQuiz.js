import React from 'react';
import { Container, Row, Input, InputGroup, InputGroupAddon, Col, ListGroup, ListGroupItem, Button, ListGroupItemHeading, Label } from 'reactstrap';
import { getPoints } from '../scripts/ScoreCalculation';
import Player from '../models/Player';
import { randomInt, validateFu, shuffleArray } from '../scripts/Utils';
import { SEAT_NAMES, NON_DEALER_RON_SCORES, NON_DEALER_TSUMO_SCORES } from '../Constants';
import GyakutenQuestion from '../components/south-four-quiz/GyakutenQuestion';
import SouthFourResultMessage from "../models/SouthFourResultMessage";
import { withTranslation } from 'react-i18next';
import LocalizedMessage from '../models/LocalizedMessage';

class SouthFourQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            players: [],
            messages: [],
            maxFu: 50,
            showDifferences: true,
            loadErrorMessage: ""
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.onFuChanged = this.onFuChanged.bind(this);
    }

    componentDidMount() {
        if (typeof (Storage) !== "undefined") {
            let savedFu = window.localStorage.getItem("maxS4Fu");
            if (savedFu) {
                savedFu = parseInt(savedFu);

                this.setState({
                    maxFu: savedFu
                }, () => this.generateNewQuiz());
            } else {
                this.generateNewQuiz();
            }
        }
        else {
            this.generateNewQuiz();
        }
    }

    onLoadSituation() {
        let string = document.getElementById("loadScoresString").value;
        let scores = string.split(',');

        if(scores.length < 4) {
            this.setState({loadErrorMessage: new LocalizedMessage("allLast.error.few")});
            return;
        }
        
        let players = [new Player(), new Player(), new Player(), new Player()];

        for(let i = 0; i < players.length; i++) {
            let converted = parseInt(scores[i]);

            if(isNaN(converted)) {
                this.setState({loadErrorMessage: new LocalizedMessage("allLast.error.NaN", {seat: `$t(${SEAT_NAMES[i]})`})});
                return;
            }

            players[i].points = converted;
            players[i].seat = i;
        }

        players.sort((a, b) => a.points - b.points);
        
        if(players[0].seat === 0) {
            this.setState({loadErrorMessage: new LocalizedMessage("allLast.error.dealerLast")});
            return;
        }

        this.setState({
            players: players,
            messages: Array(15).fill(""),
            loadErrorMessage: ""
        });
    }

    generateNewQuiz() {
        let players = [new Player(), new Player(), new Player(), new Player()];

        // Generate randomish scores
        do {
            let pointsRemaining = 100000;

            let points = randomInt(500, 300) * 100
            players[0].points = points;
            pointsRemaining -= points;

            for(let i = 1; i < 3; i++) {
                points = randomInt(300, 100) * 100;
                players[i].points = points;
                pointsRemaining -= points;
            }

            players[3].points = pointsRemaining;
            players.sort((a, b) => a.points - b.points);
        } while (players[1].points - players[0].points < 1500 || players[1].points - players[0].points > 16000);

        // Give the lowest score a random non-dealer wind, then give the rest of the winds to the others
        let seats = shuffleArray([1, 2, 3]);
        seats.splice(randomInt(4,1), 0, 0);

        for( let i = 0; i < players.length; i++)
        {
            players[i].seat = seats[i];
        }

        this.setState({
            players: players,
            messages: Array(15).fill(""),
        });
    }

    onSubmit(han, fu, tsumo, ronTarget, placementTarget, index, riichis) {
        let players = this.state.players;
        let scores = players.map((player) => player.points);

        for(let i = 1; i < riichis.length; i++) {
            scores[i] -= riichis[i] * 1000;
            scores[0] += riichis[i] * 1000;
        }

        let required;
        let message = new SouthFourResultMessage();
        message.feedback = "allLast.wrong";
        // South (1 -> 0) > West (2 -> 1) > North (3 -> 2) > East (0 -> 3)
        let canBeEqual = (players[0].seat + 3) % 4 < (players[placementTarget].seat + 3) % 4;
        
        if(tsumo) {
            required = findMinimumTsumoValue(players, scores, placementTarget, this.state.maxFu, canBeEqual);
            let points = getPoints(han, fu);
            scores[0] += points[0] * 2 + points[1];
            scores[1] -= players[1].seat > 0 ? points[0] : points[1];
            scores[2] -= players[2].seat > 0 ? points[0] : points[1];
            scores[3] -= players[3].seat > 0 ? points[0] : points[1];
            
            if(points[0] === required.nondealer && points[1] === required.dealer) {
                message.feedback = "allLast.correct";
            } else if(points[0] > required.nondealer || points[1] > required.dealer) {
                message.feedback = "allLast.tooMuch";
            }
        } else {
            required = findMinimumRonValue(scores, ronTarget, placementTarget, this.state.maxFu, canBeEqual);

            let points = getPoints(han, fu, false, false);
            scores[0] += points;
            scores[ronTarget] -= points;

            if(points === required.value) {
                message.feedback = "allLast.correct";
            } else if(points > required.value) {
                message.feedback = "allLast.tooMuch";
            }
        }
        
        message.placement = placementTarget;
        message.playerSeats = players.map((player) => player.seat);
        message.scores = scores;
        message.requiredScore = required;

        let messages = this.state.messages.slice();
        messages[index] = message;

        this.setState({messages: messages});
    }

    onFuChanged(event) {
        let fu = validateFu(event.target.value, this.state.maxFu);
        event.target.value = fu;

        if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem("maxS4Fu", fu);
        }

        this.setState({
            maxFu: fu
        });
    }

    onNumberChanged(event) {
        event.target.focus();

        let value = parseInt(event.target.value);
        if (value > 30 && value % 10 === 5) {
            event.target.blur();
        }
    }

    onToggleDifferences() {
        this.setState({
            showDifferences: !this.state.showDifferences
        });
    }

    render() {
        if(this.state.players.length === 0) {
            return (
                <div>One moment...</div>
            );
        }
        
        let { t } = this.props;
        let scores = this.state.players.map((player, index) => {
            if(this.state.showDifferences) {
                return <Row key={index}>{t(SEAT_NAMES[player.seat]) + ": " + player.points} ({index === 0 ? "YOU" : "+" + (player.points - this.state.players[0].points)})</Row>;
            } else {
                return <Row key={index}>{t(SEAT_NAMES[player.seat]) + ": " + player.points}</Row>;
            }
        });

        return (
            <Container>
                <ListGroup>
                <ListGroupItemHeading><span>{t("allLast.title")}</span></ListGroupItemHeading>
                <ListGroupItem>
                    <Row>
                        <Col xs="12" sm="8" md="6">
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">{t("allLast.maxFu")}</InputGroupAddon>
                                <Input type="number" value={this.state.maxFu} placeholder={t("allLast.fu")} step="5" min="20" max="130" onBlur={this.onFuChanged} onChange={this.onNumberChanged} />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="form-check form-check-inline">
                            <Input className="form-check-input" type="checkbox" id="toggleDifference"
                                checked={this.state.showDifferences} onChange={() => this.onToggleDifferences()} />
                            <Label className="form-check-label" for="toggleDifference">{t("allLast.showDifferences")}</Label>
                        </Col>
                    </Row>
                </ListGroupItem>
                <ListGroupItem>
                    <Row>{t("allLast.loadInstructions")}</Row>
                    <InputGroup>
                        <Input id="loadScoresString" placeholder="28000,26000,24000,22000" />
                        <InputGroupAddon addonType="append">
                            <Button color="warning" onClick={() => this.onLoadSituation()}>{t("allLast.loadLabel")}</Button>
                        </InputGroupAddon>
                    </InputGroup>
                    <Row>{this.state.loadErrorMessage ? this.state.loadErrorMessage.generateString(t) : ""}</Row>
                </ListGroupItem>
                <ListGroupItem>
                    <Button onClick={() => this.generateNewQuiz()}>{t("allLast.newLabel")}</Button>
                </ListGroupItem>
                <ListGroupItemHeading><span>{t("allLast.escapeHeader")}</span></ListGroupItemHeading>
                <ListGroupItem>
                    <Row>{t("allLast.info")}</Row>
                    {scores}
                </ListGroupItem>
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={true}  ronTarget={0} placementTarget={1} index={0} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={1} placementTarget={1} index={1} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={2} placementTarget={1} index={2} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={3} placementTarget={1} index={3} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <ListGroupItemHeading><span>{t("allLast.riichiHeader")}</span></ListGroupItemHeading>
                <ListGroupItem>
                    <Row>{t("allLast.info")}</Row>
                    {scores}
                </ListGroupItem>
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={true}  ronTarget={0} placementTarget={1} index={4} riichis={[0, 0, 0, 1]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={1} placementTarget={1} index={5} riichis={[0, 0, 0, 1]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={3} placementTarget={1} index={6} riichis={[0, 0, 0, 1]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={true}  ronTarget={0} placementTarget={1} index={7} riichis={[0, 1, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={1} placementTarget={1} index={8} riichis={[0, 1, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={3} placementTarget={1} index={9} riichis={[0, 1, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <ListGroupItemHeading><span>{t("allLast.higherHeader")}</span></ListGroupItemHeading>
                <ListGroupItem>
                    <Row>{t("allLast.info")}</Row>
                    {scores}
                </ListGroupItem>
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={true}  ronTarget={0} placementTarget={2} index={10} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={1} placementTarget={2} index={11} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={2} placementTarget={2} index={12} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={true}  ronTarget={0} placementTarget={3} index={13} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                <GyakutenQuestion onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={3} placementTarget={3} index={14} riichis={[0, 0, 0, 0]} messages={this.state.messages} showDifferences={this.state.showDifferences} />
                </ListGroup>
            </Container>
        );
    }
}

function findMinimumTsumoValue(players, scores, placementTarget, maxFu, canBeEqual) {
    for(let i = 0; i < NON_DEALER_TSUMO_SCORES.length; i++) {
        if(NON_DEALER_TSUMO_SCORES[i].fu > maxFu) continue;

        let newScores = scores.slice();

        newScores[0] += NON_DEALER_TSUMO_SCORES[i].nondealer * 2 + NON_DEALER_TSUMO_SCORES[i].dealer;
        newScores[1] -= players[1].seat === 0 ? NON_DEALER_TSUMO_SCORES[i].dealer : NON_DEALER_TSUMO_SCORES[i].nondealer;
        newScores[2] -= players[2].seat === 0 ? NON_DEALER_TSUMO_SCORES[i].dealer : NON_DEALER_TSUMO_SCORES[i].nondealer;
        newScores[3] -= players[3].seat === 0 ? NON_DEALER_TSUMO_SCORES[i].dealer : NON_DEALER_TSUMO_SCORES[i].nondealer;

        let sortedScores = newScores.slice().sort((a, b) => a - b);

        if(canBeEqual) {
            if(sortedScores.lastIndexOf(newScores[0]) >= placementTarget) {
                return NON_DEALER_TSUMO_SCORES[i];
            }
        } else {
            if(sortedScores.indexOf(newScores[0]) >= placementTarget) {
                return NON_DEALER_TSUMO_SCORES[i];
            }
        }
    }

    return NON_DEALER_TSUMO_SCORES[0];
}

function findMinimumRonValue(scores, ronTarget, placementTarget, maxFu, canBeEqual) {
    for(let i = 0; i < NON_DEALER_RON_SCORES.length; i++) {
        if(NON_DEALER_RON_SCORES[i].fu > maxFu) continue;

        let newScores = scores.slice();

        newScores[0] += NON_DEALER_RON_SCORES[i].value;
        newScores[ronTarget] -= NON_DEALER_RON_SCORES[i].value;

        let sortedScores = newScores.slice().sort((a, b) => a - b);

        if(canBeEqual) {
            if(sortedScores.lastIndexOf(newScores[0]) >= placementTarget) {
                return NON_DEALER_RON_SCORES[i];
            }
        } else {
            if(sortedScores.indexOf(newScores[0]) >= placementTarget) {
                return NON_DEALER_RON_SCORES[i];
            }
        }
    }

    return NON_DEALER_RON_SCORES[0];
}

export default withTranslation()(SouthFourQuiz);