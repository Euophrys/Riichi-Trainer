import React from 'react';
import { Row, Col } from 'reactstrap';
import Hand from '../Tile';
import { convertHandToTenhouString } from '../../scripts/HandConversions';
import { getTileAsText } from '../../scripts/TileConversions';

class ResultingHandInfo extends React.Component {
    render() {
        return (
            <Row>
                <Col xs="12">
                    Discarding the {getTileAsText(this.props.discard, false)}:
                </Col>
                <Col xs="12">
                    {convertHandToTenhouString(this.props.hand)}
                </Col>
                <Col xs="12">
                    Shanten: {this.props.shanten}
                </Col>
                <Col xs="12">
                    Ukeire: {this.props.ukeire}
                </Col>
                <Col xs="12">
                    Tiles that increase Ukeire: {this.props.upgrades}
                </Col>
            </Row>
        );
    }
}

export default ResultingHandInfo;