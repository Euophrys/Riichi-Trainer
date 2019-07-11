import React from 'react';
import { Container, Button, ListGroup, ListGroupItem, Row } from 'reactstrap';
import Player from '../../models/Player';
import { convertTilesToAsciiSymbols, convertIndexesToTenhouTiles, getTileAsText } from '../../scripts/TileConversions';
import { ROUND_NAMES, SEAT_NAMES } from '../../Constants';
import { withTranslation } from 'react-i18next';

class RandomGameState extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            init: false,
            players: [],
            round: 0,
            doraIndicator: 1,
            turn: 3,
            userSeat: 0
        }
    }

    componentDidMount() {
        if(!this.state.init) {
            this.generateState();
        }
    }

    generateState() {
        let round = Math.floor(Math.random() * 9);

        let players = [];
        for(let i = 0; i < 4; i++) {
            players.push(new Player());
            players[i].seat = i;
        }
        
        // Generate random point totals for each player
        let maxPoints = 450;
        let pointsRemaining = 1000;

        if(round === 0) {
            for(let i = 0; i < 4; i++) {
                players[i].points = 25000;
            }
        } else if(round === 8) {
            maxPoints = 65;

            for(let i = 0; i < 3; i++) {
                let points = Math.floor(Math.random() * maxPoints) + 235;
                players[i].points = points * 100;
                pointsRemaining -= points;
                maxPoints = Math.min(maxPoints, pointsRemaining - 235);
            }

            players[3].points = pointsRemaining * 100;
        } else {
            for(let i = 0; i < 3; i++) {
                let points = Math.floor(Math.random() * maxPoints);
                players[i].points = points * 100;
                pointsRemaining -= points;
                maxPoints = Math.min(maxPoints, pointsRemaining);
            }

            players[3].points = pointsRemaining * 100;
        }

        // Pick who the user is
        let userSeat = Math.floor(Math.random() * 4);

        // Generate random discards for each player
        let tilePool = [];

        for(let i = 1; i < 38; i++) {
            if(i % 10 === 0) continue;
            tilePool.push(i);

            // This stuff is just to make middle tiles less likely to be in the discards
            if(i > 30 || (i % 10 > 6 || i % 10 < 4)) {
                tilePool.push(i);
            }

            if(i > 30 || (i % 10 > 7 || i % 10 < 3)) {
                tilePool.push(i);
                tilePool.push(i);
            }
        }

        let turn = Math.floor(Math.random() * 11) + 3;

        for(let i = 0; i < turn; i++) {
            for(let player = 0; player < 4; player++) {
                let tile = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
                players[player].discards.push(tile);
            }
        }

        for(let player = 0; player < userSeat; player++) {
            let tile = tilePool.splice(Math.floor(Math.random() * tilePool.length), 1);
            players[player].discards.push(tile);
        }

        let doraIndicator = 0;
        
        do {
            doraIndicator = Math.floor(Math.random() * 38);
        } while (tilePool.indexOf(doraIndicator) === -1)

        this.setState({
            init: true,
            userSeat: userSeat,
            players: players,
            doraIndicator: doraIndicator,
            turn: turn,
            round: round
        });
    }

    render() {
        if(this.state.init === false) {
            return <Row>Please wait...</Row>;
        }

        let { t } = this.props;

        let playerItems = this.state.players.map((player, index) => {
            return (
                <ListGroupItem key={index + 1}>
                    <Row>{t("utils.playerLabel", {
                        seat: t(SEAT_NAMES[player.seat]), 
                        you: player.seat === this.state.userSeat 
                            ? `(${t("allLast.you")})` 
                            : ""
                    })}</Row>
                    <Row>{t("utils.points")} {player.points}</Row>
                    <Row>{t("utils.discards")} {convertTilesToAsciiSymbols(player.discards)} ({convertIndexesToTenhouTiles(player.discards)})</Row>
                </ListGroupItem>
            );
        });

        return (
            <Container>
                <Button xs="12" color="primary" className="btn-block" onClick={()=>this.generateState()}>{t("utils.stateButtonLabel")}</Button>
                <ListGroup>
                    <ListGroupItem key={0}>
                        <Row>{t("utils.info", {
                            turn: this.state.turn,
                            round: t("roundName", ROUND_NAMES[this.state.round]),
                            seat: t(SEAT_NAMES[this.state.userSeat])
                        })}</Row>
                        <Row>{t("utils.dora", {tile: getTileAsText(t, this.state.doraIndicator, true)})}</Row>
                    </ListGroupItem>
                    {playerItems}
                </ListGroup>
            </Container>
        );
    }
}

export default withTranslation()(RandomGameState);