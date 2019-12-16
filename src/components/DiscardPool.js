import React from 'react';
import { Col, Collapse, Button, Row, ListGroup, ListGroupItem } from 'reactstrap';
import Tile from './Tile';
import { SEAT_NAMES } from '../Constants';
import { withTranslation } from 'react-i18next';

class DiscardPool extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = { collapsed: false };
    }

    toggle() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    render() {
        let players = this.props.players;
        let pools = [];
        let { t } = this.props;

        for (let i = 0; i < players.length; i++) {
            if (players[i].discards.length < 1) continue;

            pools.push(
                <ListGroupItem key={i}>
                    <Row><u>{t(players[i].name)} ({t(SEAT_NAMES[players[i].seat])})</u></Row>
                    <Row className="no-gutters px-sm-0 px-md-4 px-lg-5 px-xl-0 mx-lg-4">
                        {players[i].discards.map((tile, index) => {
                            return (
                                <Col xs="1" sm="2" md="2" xl="1" key={players[i].name + index} style={index === players[i].riichiIndex ? {backgroundColor: "red"} : {}}>
                                    <Tile className="discardTile" tile={tile} showIndexes={this.props.showIndexes}/>
                                </Col>
                            );
                        })}
                    </Row>
                </ListGroupItem>
            )
        }

        return (
            <Col xs="12" sm={this.state.collapsed ? "12" : ""}>
                <Button className="btn-block bg-light" color="basic" onClick={this.toggle}>{t("discards.label")}</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <ListGroup>
                        <ListGroupItem className="justify-content-center">
                            <span className="blackText">{t("discards.discardCount", { count: this.props.discardCount })}</span>&nbsp;
                            <span className="blackText">{t("discards.tilesLeft", { count: this.props.wallCount })}</span>
                        </ListGroupItem>
                        {pools}
                    </ListGroup>
                </Collapse>
            </Col>
        );
    }
}

export default withTranslation()(DiscardPool);