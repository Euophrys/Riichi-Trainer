import React from 'react';
import { Container, Collapse, Card, CardBody, Button, Row, Col, Input, Label } from 'reactstrap';
import NumericInput from 'react-numeric-input';

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            collapsed: true,
            settings: {
                characters: true,
                bamboo: true,
                circles: true,
                honors: false,
                threePlayer: false,
                redFives: 3,
                verbose: true,
                extraConcise: false,
                spoilers: true,
                reshuffle: true,
                simulate: false,
                exceptions: true,
                sort: true,
                minShanten: 0,
            }
        };

        this.onSettingChanged = this.onSettingChanged.bind(this);
    }

    toggle() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    componentDidMount() {
        if (typeof (Storage) !== "undefined") {
            let savedSettings = window.localStorage.getItem("settings");
            if (savedSettings) {
                savedSettings = JSON.parse(savedSettings);

                let settings = {
                    characters: savedSettings.characters,
                    bamboo: savedSettings.bamboo,
                    circles: savedSettings.circles,
                    honors: savedSettings.honors,
                    threePlayer: savedSettings.threePlayer,
                    redFives: savedSettings.redFives || 3,
                    verbose: savedSettings.verbose,
                    extraConcise: savedSettings.extraConcise,
                    spoilers: savedSettings.spoilers,
                    reshuffle: savedSettings.reshuffle,
                    simulate: savedSettings.simulate,
                    exceptions: savedSettings.exceptions,
                    sort: savedSettings.sort === undefined ? true : savedSettings.sort,
                    minShanten: savedSettings.minShanten || 0,
                }

                this.setState({
                    settings: settings
                });

                this.props.onChange(settings);
            }
        }
    }

    onSettingChanged(event, numberString, numberInput) {
        if (!event) return;

        let settings = this.state.settings;

        if (typeof event === "number") {
            settings[numberInput.id] = event;
        }
        else {
            settings[event.target.id] = !settings[event.target.id];
        }

        this.setState({
            settings: settings
        });

        if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem("settings", JSON.stringify(settings));
        }

        this.props.onChange(settings);
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
                                    checked={this.state.settings.characters} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="characters">Characters</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="circles"
                                    checked={this.state.settings.circles} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="circles">Circles</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="bamboo"
                                    checked={this.state.settings.bamboo} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="bamboo">Bamboo</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="honors"
                                    checked={this.state.settings.honors} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="honors">Honors</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="threePlayer"
                                    checked={this.state.settings.threePlayer} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="threePlayer">Three player rules</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="redFives">Number of Red Fives:&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="redFives"
                                    min={0} max={12} step={1}
                                    value={this.state.settings.redFives} onChange={this.onSettingChanged} />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="verbose"
                                    checked={this.state.settings.verbose} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="verbose">Verbose tile names ("one of bamboo" vs "1s")</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="extraConcise"
                                    checked={this.state.settings.extraConcise} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="extraConcise">Concise history</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="spoilers"
                                    checked={this.state.settings.spoilers} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="spoilers">Show what the best option was</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="reshuffle"
                                    checked={this.state.settings.reshuffle} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="reshuffle">Shuffle discarded tiles back into the wall after starting a new hand</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="simulate"
                                    checked={this.state.settings.simulate} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="simulate">Simulate other players discarding tiles</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="exceptions"
                                    checked={this.state.settings.exceptions} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="exceptions">Consider exception hands (Kokushi/Thirteen Orphans and Chiitoitsu/Seven Pairs)</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="minShanten">Minimum starting hand shanten:&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="minShanten"
                                    min={0} max={4} step={1}
                                    value={this.state.settings.minShanten} onChange={this.onSettingChanged} />
                                <span className="blackText">&nbsp;(up to the number of allowed suits)</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="sort"
                                    checked={this.state.settings.sort} onChange={this.onSettingChanged} />
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