import React from 'react';
import { Container, Row, Input, InputGroup, InputGroupAddon, Col, ListGroup, ListGroupItem, Button } from 'reactstrap';
import ScoreInput from '../components/ScoreInput';
import { getPoints } from '../scripts/ScoreCalculation';
import Player from '../models/Player';
import { randomInt, validateFu } from '../scripts/Utils';
import { SEAT_NAMES, NON_DEALER_RON_SCORES, NON_DEALER_TSUMO_SCORES } from '../Constants';

class SouthFourQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            players: [],
            messages: [],
            maxFu: 50
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

    generateNewQuiz() {
        let players = [new Player(), new Player(), new Player(), new Player()];

        // Generate randomish scores
        let pointsRemaining = 100000;

        let points = randomInt(500, 300) * 100
        players[0].points = points;
        pointsRemaining -= points;

        for(let i = 1; i < 3; i++) {
            points = randomInt(100, 300) * 100;
            players[i].points = points;
            pointsRemaining -= points;
        }

        players[3].points = pointsRemaining;

        // Give the lowest score a random non-dealer wind, then give the rest of the winds to the others
        players.sort((a, b) => a.points - b.points);

        let wind = randomInt(SEAT_NAMES.length, 1);

        for( let i = 0; i < players.length; i++)
        {
            players[i].seat = wind;
            wind = (wind + 1) % SEAT_NAMES.length;
        }

        this.setState({
            players: players,
            messages: Array(4).fill(""),
        });
    }

    onSubmit(han, fu, tsumo, ronTarget, index) {
        let players = this.state.players;
        let scores = players.map((player) => player.points);
        let distanceFromThird = scores[1] - scores[0];
        let required;
        let feedback = "Wrong! That score doesn't get you out of fourth! Highlight for the answer: ";

        if(tsumo) {
            required = findMinimumTsumoValue(scores[0], scores[1], players.find((player) => player.seat === 0).points);

            let points = getPoints(han, fu);
            scores[0] += points[0] * 2 + points[1];
            scores[1] -= players[1].seat > 0 ? points[0] : points[1];
            scores[2] -= players[2].seat > 0 ? points[0] : points[1];
            scores[3] -= players[3].seat > 0 ? points[0] : points[1];

            if(points[0] === required.nondealer && points[1] === required.dealer) {
                feedback = "Correct! That's the lowest score that gets you out of fourth!"
            } else if(points[0] > required.nondealer || points[1] > required.dealer) {
                feedback = "That score gets you out of fourth, but it's not the lowest possible. Highlight for the answer: "
            }
        } else {
            let distanceFromTarget = scores[ronTarget] - scores[0];

            if(distanceFromTarget / 2 < distanceFromThird) {
                required = findMinimumRonValue(distanceFromTarget / 2, this.state.maxFu);
            } else {
                required = findMinimumRonValue(distanceFromThird, this.state.maxFu);
            }

            let points = getPoints(han, fu, false, false);
            scores[0] += points;
            scores[ronTarget] -= points;

            if(points === required.value) {
                feedback = "Correct! That's the lowest score that gets you out of fourth! "
            } else if(points > required.value) {
                feedback = "That score gets you out of fourth, but it's not the lowest possible. Highlight for the answer: "
            }
        }
        
        let messages = this.state.messages.slice();
        messages[index] = (
            <Container>
                <Row>{feedback}&nbsp;<span>{required.han} han {required.fu} fu</span></Row>
                <Row>Results:</Row>
                <Row>{SEAT_NAMES[players[0].seat] + ": " + scores[0]} (YOU)</Row>
                <Row>{SEAT_NAMES[players[1].seat] + ": " + scores[1]} ({scores[1] - scores[0]})</Row>
                <Row>{SEAT_NAMES[players[2].seat] + ": " + scores[2]} ({scores[2] - scores[0]})</Row>
                <Row>{SEAT_NAMES[players[3].seat] + ": " + scores[3]} ({scores[3] - scores[0]})</Row>
            </Container>
        );

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

    render() {
        if(this.state.players.length === 0) {
            return (
                <div>One moment...</div>
            );
        }

        let scores = this.state.players.map((player, index) => {
            return <Row>{SEAT_NAMES[player.seat] + ": " + player.points} ({index === 0 ? "YOU" : "+" + (player.points - this.state.players[0].points)})</Row>
        });

        return (
            <Container>
                <ListGroup>
                <ListGroupItem>
                    <Col xs="12" sm="8" md="6">
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">Maximum Fu</InputGroupAddon>
                        <Input type="number" value={this.state.maxFu} placeholder="Fu" step="5" min="20" max="130" onBlur={this.onFuChanged} onChange={this.onNumberChanged} />
                    </InputGroup>
                    </Col>
                </ListGroupItem>
                <ListGroupItem>
                    <Button onClick={() => this.generateNewQuiz()}>New Situation</Button>
                </ListGroupItem>
                <ListGroupItem>
                    <Row>It's currently South 4. You are in fourth. The scores are as follows:</Row>
                    {scores}
                </ListGroupItem>
                <ListGroupItem>
                    <Row className="mb-2">What is the minimum tsumo score you need in order to escape fourth?</Row>
                    <ScoreInput onScoreSubmit={this.onSubmit} tsumo={true} ronTarget={0} index={0}/>
                    {this.state.messages[0]}
                </ListGroupItem>
                <ListGroupItem>
                    <Row className="mb-2">What is the minimum ron score you need to hit third with in order to escape fourth?</Row>
                    <ScoreInput onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={1} index={1}/>
                    {this.state.messages[1]}
                </ListGroupItem>
                <ListGroupItem>
                    <Row className="mb-2">What is the minimum ron score you need to hit second with in order to escape fourth?</Row>
                    <ScoreInput onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={2} index={2}/>
                    {this.state.messages[2]}
                </ListGroupItem>
                <ListGroupItem>
                    <Row className="mb-2">What is the minimum ron score you need to hit first with in order to escape fourth?</Row>
                    <ScoreInput onScoreSubmit={this.onSubmit} tsumo={false} ronTarget={3} index={3}/>
                    {this.state.messages[3]}
                </ListGroupItem>
                </ListGroup>
            </Container>
        );
    }
}

function findMinimumTsumoValue(fourthScore, thirdScore, dealerScore, maxFu, canBeEqual) {
    for(let i = 0; i < NON_DEALER_TSUMO_SCORES.length; i++) {
        if(NON_DEALER_TSUMO_SCORES[i].fu > maxFu) continue;

        let resultingFourthScore = fourthScore + NON_DEALER_TSUMO_SCORES[i].nondealer * 2 + NON_DEALER_TSUMO_SCORES[i].dealer;
        let resultingThirdScore = thirdScore - NON_DEALER_TSUMO_SCORES[i].nondealer;
        let resultingDealerScore = dealerScore - NON_DEALER_TSUMO_SCORES[i].dealer;

        if(resultingFourthScore > resultingThirdScore || resultingFourthScore > resultingDealerScore
            || (canBeEqual && (resultingFourthScore === resultingThirdScore || resultingFourthScore === resultingDealerScore))) {
            return NON_DEALER_TSUMO_SCORES[i];
        }
    }
}

function findMinimumRonValue(target, maxFu, canBeEqual) {
    for(let i = 0; i < NON_DEALER_RON_SCORES.length; i++) {
        if(NON_DEALER_TSUMO_SCORES[i].fu <= maxFu) continue;

        if(NON_DEALER_RON_SCORES[i].value > target
            || (NON_DEALER_TSUMO_SCORES[i].value === target && canBeEqual)) {
            return NON_DEALER_RON_SCORES[i];
        }
    }
}

export default SouthFourQuiz;