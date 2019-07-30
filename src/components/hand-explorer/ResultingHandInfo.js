import React from 'react';
import { Row, Col, Button, Collapse, Card, CardBody } from 'reactstrap';
import { convertHandToAsciiSymbols } from '../../scripts/HandConversions';
import { getTileAsText, convertTilesToAsciiSymbols } from '../../scripts/TileConversions';
import { calculateDiscardUkeire } from '../../scripts/UkeireCalculator';
import calculateStandardShanten from '../../scripts/ShantenCalculator';
import { ALL_TILES_REMAINING } from '../../Constants';
import { evaluateBestDiscard } from '../../scripts/Evaluations';
import { withTranslation } from 'react-i18next';

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
        let { t } = this.props;

        let upgradeResults = this.props.upgrades.tiles
            .sort((a, b) => b.resultingUkeire - a.resultingUkeire)
            .map((tile) => {
                return (
                    <Row>
                        {t("explorer.discardInfo.draw", {draw: getTileAsText(t, tile.tile, false), discard: getTileAsText(t, tile.discard, false), count: tile.resultingUkeire})}
                    </Row>
                );
            });

        let shantenResults = <Row/>;
        let totalShantenUkeire = 0;
        let remainingTiles = ALL_TILES_REMAINING.slice();

        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - this.props.hand[i]);
        }

        if(!this.state.shantenCollapsed && this.props.shanten > 0) {
            shantenResults = this.props.ukeire.tiles.map((tile) => {
                let resultHand = this.props.hand.slice();
                resultHand[tile]++;
                remainingTiles[tile]--;

                let discards = calculateDiscardUkeire(resultHand, remainingTiles, calculateStandardShanten);
                let bestDiscard = evaluateBestDiscard(discards);
                resultHand[bestDiscard]--;
                remainingTiles[tile]++;
                totalShantenUkeire += discards[bestDiscard].value;
                return (
                    <Row>
                        {t("explorer.discardInfo.draw", {draw: getTileAsText(t, tile, false), discard: getTileAsText(t, bestDiscard, false), count: discards[bestDiscard].value})}
                    </Row>
                );
            });
        }

        return (
            <Row>
                <Col xs="12">
                    {t("explorer.discardInfo.discard", {tile: getTileAsText(t, this.props.discard, false)})}
                </Col>
                <Col xs="12">
                    {convertHandToAsciiSymbols(this.props.hand)}
                </Col>
                <Col xs="12">
                    {t("explorer.discardInfo.shanten", {count: this.props.shanten})}
                </Col>
                <Col xs="12">
                    {t("explorer.discardInfo.ukeire", {count: this.props.ukeire.value, tiles: convertTilesToAsciiSymbols(this.props.ukeire.tiles)})}
                </Col>
                <Col xs="12">
                    <Button color="primary" onClick={this.toggleShanten}>{t("explorer.discardInfo.expand")}</Button>
                </Col>
                <Col xs="12">
                    <Collapse isOpen={!this.state.shantenCollapsed}>
                        <Card><CardBody>
                            {shantenResults}
                            <Row>
                                {t("explorer.discardInfo.average", { average: Math.round(totalShantenUkeire / shantenResults.length)})}
                            </Row>
                        </CardBody></Card>
                    </Collapse>
                </Col>
                <Col xs="12">
                    {t("explorer.discardInfo.upgrades", {count: this.props.upgrades.value, tiles: convertTilesToAsciiSymbols(upgradeTiles)})}
                </Col>
                <Col xs="12">
                    <Button color="primary" onClick={this.toggleUpgrades}>{t("explorer.discardInfo.expandUpgrades")}</Button>
                </Col>
                <Col xs="12">
                    <Collapse isOpen={!this.state.upgradesCollapsed}>
                        <Card><CardBody>
                            {upgradeResults}
                            <Row>
                                {t("explorer.discardInfo.average", {average: Math.round(total / upgradeResults.length)})}
                            </Row>
                        </CardBody></Card>
                    </Collapse>
                </Col>
            </Row>
        );
    }
}

export default withTranslation()(ResultingHandInfo);