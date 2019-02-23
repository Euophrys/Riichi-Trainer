import React from 'react';
import { Card, CardBody, Col, Collapse, Button, Row } from 'reactstrap';
import Tile from './Tile';

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
        let discards = this.props.discardPool;
        discards = discards.map((tile) => {
            return <Col xs="1" className={tile.player ? "bg-warning" : ""}><Tile className="discardTile" tile={tile.tile} /></Col>
        });

        return (
            <Col xs="12" sm={this.state.collapsed ? "12" : ""}>
                <Button className="btn-block bg-light" color="basic" onClick={this.toggle}>Discard Pool</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <Card><CardBody>
                        <Row className="justify-content-center mb-1">
                            <span className="blackText">You've discarded&nbsp;<strong>{this.props.discardCount}</strong>&nbsp;tiles.</span>&nbsp;
                            <span className="blackText">There are&nbsp;<strong>{this.props.wallCount}</strong>&nbsp;tiles left in the wall.</span>
                        </Row>
                        <Row className="no-gutters">
                            {discards}
                        </Row>
                    </CardBody></Card>
                </Collapse>
            </Col>
        );
    }
}

export default DiscardPool;