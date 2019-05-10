import React from 'react';
import { Container, Collapse, Card, CardBody, Button, Row, Col, Input, Label } from 'reactstrap';
import NumericInput from 'react-numeric-input';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = { collapsed: true };
    }

    toggle() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    render() {
        return (
            <Container>
                <Button color="primary" onClick={this.toggle}>Settings</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <Card><CardBody>
                        <Row>
                            <Col>
                                Tiles Allowed:
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="characters"
                                    checked={this.props.values.characters} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="characters">Characters</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="circles"
                                    checked={this.props.values.circles} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="circles">Circles</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="bamboo"
                                    checked={this.props.values.bamboo} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="bamboo">Bamboo</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="honors"
                                    checked={this.props.values.honors} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="honors">Honors</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="threePlayer"
                                    checked={this.props.values.threePlayer} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="threePlayer">Three player rules</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="verbose">Number of Red Fives:&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="redFives"
                                    min={0} max={12} step={1}
                                    value={this.props.values.redFives} onChange={this.props.onChange} />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="verbose"
                                    checked={this.props.values.verbose} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="verbose">Verbose tile names ("one of bamboo" vs "1s")</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="extraConcise"
                                    checked={this.props.values.extraConcise} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="extraConcise">Concise history</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="spoilers"
                                    checked={this.props.values.spoilers} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="spoilers">Show what the best option was</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="reshuffle"
                                    checked={this.props.values.reshuffle} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="reshuffle">Shuffle discarded tiles back into the wall after starting a new hand</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="simulate"
                                    checked={this.props.values.simulate} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="simulate">Simulate other players discarding tiles</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="exceptions"
                                    checked={this.props.values.exceptions} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="exceptions">Consider exception hands (Kokushi/Thirteen Orphans and Chiitoitsu/Seven Pairs)</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="sort"
                                    checked={this.props.values.sort} onChange={this.props.onChange} />
                                <Label className="form-check-label" for="sort">Sort hand</Label>
                            </Col>
                        </Row>
                    </CardBody></Card>
                </Collapse>
            </Container>
        );
    }
}

export default Settings;