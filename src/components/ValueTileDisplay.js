import React from 'react';
import { Row, Col } from 'reactstrap';
import Tile from './Tile';

class Hand extends React.Component {
    render() {
        return (
            <Row className="justify-content-center mt-2">
                <Col style={{ textAlign: "right" }} xs="2" sm="3" md="3" lg="2"><span>Round Wind:</span></Col>
                <Col xs="2" sm="1"><Tile className="discardTile" tile={this.props.roundWind} /></Col>
                <Col style={{ textAlign: "right" }} xs="2" sm="3" md="2"><span>Seat Wind:</span></Col>
                <Col xs="2" sm="1"><Tile className="discardTile" tile={this.props.seatWind} /></Col>
                <Col style={{ textAlign: "right" }} xs="2" sm="3" md="3" lg="2"><span>Dora Indicator:</span></Col>
                <Col xs="2" sm="1"><Tile className="discardTile" tile={this.props.dora} /></Col>
            </Row>
        );
    }
}

export default Hand;