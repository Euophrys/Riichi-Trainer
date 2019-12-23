import React from 'react';
import { Container, Collapse, Card, CardBody, Button, Row, Col, Input, Label } from 'reactstrap';
import NumericInput from 'react-numeric-input';
import { withTranslation } from "react-i18next";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            collapsed: true,
            settings: {
                verbose: true,
                showIndexes: false,
                numberOfRiichis: 1,
                minimumTurnsBeforeRiichi: 5,
                tilesInHand: 13,
            }
        };

        this.onSettingChanged = this.onSettingChanged.bind(this);
    }

    toggle() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    componentDidMount() {
        try {
            let savedSettings = window.localStorage.getItem("defenseSettings");
            if (savedSettings) {
                savedSettings = JSON.parse(savedSettings);

                let settings = {
                    verbose: savedSettings.verbose,
                    showIndexes: savedSettings.showIndexes || false,
                    numberOfRiichis: savedSettings.numberOfRiichis || 1,
                    minimumTurnsBeforeRiichi: savedSettings.minimumTurnsBeforeRiichi || 4,
                    tilesInHand: savedSettings.tilesInHand || 13,
                }

                this.setState({
                    settings: settings
                });

                this.props.onChange(settings);
            } else {
                this.props.onChange(this.state.settings);
            }
        } catch {
            this.props.onChange(this.state.settings);
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

        try {
            window.localStorage.setItem("defenseSettings", JSON.stringify(settings));
        } catch { }

        this.props.onChange(settings);
    }

    render() {
        const { t } = this.props;
        return (
            <Container>
                <Button color="primary" onClick={this.toggle}>{t("settings.buttonLabel")}</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <Card><CardBody>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="verbose"
                                    checked={this.state.settings.verbose} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="verbose">{t("settings.verbose")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="showIndexes"
                                    checked={this.state.settings.showIndexes} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="showIndexes">{t("settings.showIndexes")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="numberOfRiichis">{t("defense.riichiCount")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="numberOfRiichis"
                                    min={1} max={3} step={1}
                                    value={this.state.settings.numberOfRiichis} onChange={this.onSettingChanged} />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="minimumTurnsBeforeRiichi">{t("defense.minTurns")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="minimumTurnsBeforeRiichi"
                                    min={1} max={8} step={1}
                                    value={this.state.settings.minimumTurnsBeforeRiichi} onChange={this.onSettingChanged} />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="tilesInHand">{t("defense.tilesInHand")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="tilesInHand"
                                    min={2} max={14} step={3}
                                    value={this.state.settings.tilesInHand} onChange={this.onSettingChanged} />
                            </Col>
                        </Row>
                    </CardBody></Card>
                </Collapse>
            </Container>
        );
    }
}

export default withTranslation()(Settings);