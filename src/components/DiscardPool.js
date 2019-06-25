import React from 'react';
import { Col, Collapse, Button, Row, ListGroup, ListGroupItem } from 'reactstrap';
import Tile from './Tile';
import { SEAT_NAMES } from '../Constants';

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

        for(let i = 0; i < players.length; i++) {
            if (players[i].discards.length < 1) continue;
            
            pools.push(
                <ListGroupItem key={i}>
                    <Row><u>{players[i].name} ({SEAT_NAMES[players[i].seat]})</u></Row>
                    <Row className="no-gutters px-sm-0 px-md-4 px-lg-5 px-xl-0 mx-lg-4">
                        {players[i].discards.map((tile, index) => {
                            return <Col xs="1" sm="2" md="2" xl="1" key={players[i].name + index}><Tile className="discardTile" tile={tile}/></Col>
                        })}
                    </Row>
                </ListGroupItem>
            )
        }

        return (
            <Col xs="12" sm={this.state.collapsed ? "12" : ""}>
                <Button className="btn-block bg-light" color="basic" onClick={this.toggle}>Discard Pool</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <ListGroup>
                        <ListGroupItem className="justify-content-center">
                            <span className="blackText">You've discarded&nbsp;<strong>{this.props.discardCount}</strong>&nbsp;tiles.</span>&nbsp;
                            <span className="blackText">There are&nbsp;<strong>{this.props.wallCount}</strong>&nbsp;tiles left in the wall.</span>
                        </ListGroupItem>
                        {pools}
                    </ListGroup>
                </Collapse>
            </Col>
        );
    }
}

export default DiscardPool;