import React from 'react';
import { Row, Col, Button, Collapse, Card, CardBody } from 'reactstrap';
import Hand from '../Tile';
import { convertHandToTenhouString, convertHandToAsciiSymbols } from '../../scripts/HandConversions';
import { getTileAsText, convertTilesToAsciiSymbols } from '../../scripts/TileConversions';
import { CalculateDiscardUkeire } from '../../scripts/UkeireCalculator';
import CalculateStandardShanten from '../../scripts/ShantenCalculator';
import { ALL_TILES_REMAINING } from '../../Constants';
import { evaluateBestDiscard } from '../../scripts/Evaluations';

class ResultingHandInfo extends React.Component {
    constructor(props) {
        super(props);
        this.toggleUpgrades = this.toggleUpgrades.bind(this);
        this.toggleShanten = this.toggleShanten.bind(this);
        this.state = {
            upgradesCollapsed: true,
            shantenCollapsed: true
        };
    }

    toggleUpgrades() {
        this.setState({ upgradesCollapsed: !this.state.upgradesCollapsed });
    }
    
    toggleShanten() {
        this.setState({ shantenCollapsed: !this.state.shantenCollapsed });
    }

    render() {
        if(!this.props.hand) return <Row/>;

        let upgradeTiles = this.props.upgrades.tiles.map((tile) => tile.tile);
        let total = this.props.upgrades.tiles.reduce((total, tile) => total + tile.resultingUkeire, 0);

        let upgradeResults = this.props.upgrades.tiles
            .sort((a, b) => b.resultingUkeire - a.resultingUkeire)
            .map((tile) => {
                return (
                    <Row>
                        Draw {getTileAsText(tile.tile, false)}, discard {getTileAsText(tile.discard, false)}: {tile.resultingUkeire} ukeire
                    </Row>
                );
            });

        let shantenResults = <Row/>;
        let totalShantenUkeire = 0;
        if(!this.state.shantenCollapsed && this.props.shanten > 0) {
            shantenResults = this.props.ukeire.tiles.map((tile) => {
                let resultHand = this.props.hand.slice();
                resultHand[tile]++;
                let discards = CalculateDiscardUkeire(resultHand, ALL_TILES_REMAINING, CalculateStandardShanten);
                let bestDiscard = evaluateBestDiscard(discards);
                resultHand[bestDiscard]--;
                totalShantenUkeire += discards[bestDiscard].value;
                return (
                    <Row>
                        Draw {getTileAsText(tile, false)}, discard {getTileAsText(bestDiscard, false)}: {discards[bestDiscard].value} ukeire
                    </Row>
                );
            });
        }

        return (
            <Row>
                <Col xs="12">
                    Discarding the {getTileAsText(this.props.discard, false)}:
                </Col>
                <Col xs="12">
                    {convertHandToAsciiSymbols(this.props.hand)}
                </Col>
                <Col xs="12">
                    Shanten: {this.props.shanten}
                </Col>
                <Col xs="12">
                    Ukeire: {this.props.ukeire.value} ({convertTilesToAsciiSymbols(this.props.ukeire.tiles)})
                </Col>
                <Col xs="12">
                    <Button color="primary" onClick={this.toggleShanten}>Show Next Shanten's Ukeire</Button>
                </Col>
                <Col xs="12">
                    <Collapse isOpen={!this.state.shantenCollapsed}>
                        <Card><CardBody>
                            {shantenResults}
                            <Row>
                                Average: {Math.round(totalShantenUkeire / shantenResults.length)}
                            </Row>
                        </CardBody></Card>
                    </Collapse>
                </Col>
                <Col xs="12">
                    Tiles that increase Ukeire: {this.props.upgrades.value} ({convertTilesToAsciiSymbols(upgradeTiles)})
                </Col>
                <Col xs="12">
                    <Button color="primary" onClick={this.toggleUpgrades}>Show Upgrade Results</Button>
                </Col>
                <Col xs="12">
                    <Collapse isOpen={!this.state.upgradesCollapsed}>
                        <Card><CardBody>
                            {upgradeResults}
                            <Row>
                                Average: {Math.round(total / upgradeResults.length)}
                            </Row>
                        </CardBody></Card>
                    </Collapse>
                </Col>
            </Row>
        );
    }
}

export default ResultingHandInfo;