import React from 'react';
import { Container, Collapse, Card, CardBody, Button, Row, Col } from 'reactstrap';

class StatsDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.toggleStats = this.toggleStats.bind(this);
        this.toggleConfirm = this.toggleConfirm.bind(this);
        this.state = {
            statsCollapsed: true,
            confirmCollapsed: true
        };
    }

    toggleStats() {
        this.setState({ statsCollapsed: !this.state.statsCollapsed });
    }

    toggleConfirm() {
        this.setState({ confirmCollapsed: !this.state.confirmCollapsed });
    }

    render() {
        let optimalDiscardRate = this.props.values.totalOptimalDiscards / this.props.values.totalDiscards;
        if (isNaN(optimalDiscardRate)) optimalDiscardRate = 0;
        optimalDiscardRate *= 100;
        optimalDiscardRate = Math.round(optimalDiscardRate);

        let efficiency = this.props.values.totalEfficiency / this.props.values.totalPossibleEfficiency;
        if (isNaN(efficiency)) efficiency = 0;
        efficiency *= 100;
        efficiency = Math.round(efficiency);

        let averageDiscards = this.props.values.totalDiscards / this.props.values.totalTenpai;
        if (isNaN(averageDiscards)) averageDiscards = 0;
        averageDiscards = Math.round(averageDiscards * 10) / 10;

        return (
            <Container>
                <Button color="primary" onClick={this.toggleStats}>Statistics</Button>
                <Collapse isOpen={!this.state.statsCollapsed}>
                    <Card><CardBody>
                        <Row>
                            These stats update every time you bring a hand to ready.
                        </Row>
                        <Row>
                            Ready Hands: {this.props.values.totalTenpai} hands
                        </Row>
                        <Row>
                            Tiles Discarded: {this.props.values.totalDiscards} tiles
                        </Row>
                        <Row>
                            Average Discards Until Ready: {averageDiscards} discards
                        </Row>
                        <Row>
                            Optimal Discards: {this.props.values.totalOptimalDiscards} discards
                        </Row>
                        <Row>
                            Optimal Discard Rate: {optimalDiscardRate}% ({this.props.values.totalOptimalDiscards}/{this.props.values.totalDiscards})
                        </Row>
                        <Row>
                            Efficiency Acquired: {this.props.values.totalEfficiency} tiles
                        </Row>
                        <Row>
                            Potential Efficiency Acquirable: {this.props.values.totalPossibleEfficiency} tiles
                        </Row>
                        <Row>
                            Overall Efficiency: {efficiency}% ({this.props.values.totalEfficiency}/{this.props.values.totalPossibleEfficiency})
                        </Row>
                        <Row className="mt-4">
                            <Button color="danger" onClick={this.toggleConfirm}>Reset Stats</Button>
                        </Row>
                        <Row>
                            <Collapse isOpen={!this.state.confirmCollapsed}>
                                <Card><CardBody>
                                    <Row>Are you sure you want to reset all of your stats to zero? You cannot undo this action.</Row>
                                    <Row>
                                        <Button color="danger" onClick={this.props.onReset}>Yes, reset!</Button>
                                        <Col xs="1" />
                                        <Button color="success" onClick={this.toggleConfirm}>No, don't reset!</Button>
                                    </Row>
                                </CardBody></Card>
                            </Collapse>
                        </Row>
                    </CardBody></Card>
                </Collapse>
            </Container>
        );
    }
}

export default StatsDisplay;