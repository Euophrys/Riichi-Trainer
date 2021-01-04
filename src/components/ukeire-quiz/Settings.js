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
                characters: true,
                bamboo: true,
                circles: true,
                honors: false,
                threePlayer: false,
                redFives: 3,
                verbose: true,
                showIndexes: false,
                extraConcise: false,
                spoilers: true,
                reshuffle: true,
                simulate: false,
                exceptions: true,
                minShanten: 0,
                sort: true,
                blind: false,
                useTimer: false,
                time: 0,
                extraTime: 5,
            }
        };

        this.onSettingChanged = this.onSettingChanged.bind(this);
    }

    toggle() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    componentDidMount() {
        try {
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
                    showIndexes: savedSettings.showIndexes,
                    extraConcise: savedSettings.extraConcise,
                    spoilers: savedSettings.spoilers,
                    reshuffle: savedSettings.reshuffle,
                    simulate: savedSettings.simulate,
                    exceptions: savedSettings.exceptions,
                    minShanten: savedSettings.minShanten || 0,
                    sort: savedSettings.sort === undefined ? true : savedSettings.sort,
                    blind: savedSettings.blind,
                    useTimer: savedSettings.useTimer,
                    time: savedSettings.time || 0,
                    extraTime: savedSettings.extraTime === undefined ? 5 : savedSettings.extraTime
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
            window.localStorage.setItem("settings", JSON.stringify(settings));
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
                            <Col>
                                {t("settings.tilesAllowed")}
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="characters"
                                    checked={this.state.settings.characters} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="characters">{t("settings.characters")}</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="circles"
                                    checked={this.state.settings.circles} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="circles">{t("settings.circles")}</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="bamboo"
                                    checked={this.state.settings.bamboo} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="bamboo">{t("settings.bamboo")}</Label>
                            </Col>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="honors"
                                    checked={this.state.settings.honors} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="honors">{t("settings.honors")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="threePlayer"
                                    checked={this.state.settings.threePlayer} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="threePlayer">{t("settings.sanma")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="redFives">{t("settings.redFives")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="redFives"
                                    min={0} max={12} step={1}
                                    value={this.state.settings.redFives} onChange={this.onSettingChanged} />
                            </Col>
                        </Row>
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
                                <Input className="form-check-input" type="checkbox" id="extraConcise"
                                    checked={this.state.settings.extraConcise} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="extraConcise">{t("settings.concise")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="spoilers"
                                    checked={this.state.settings.spoilers} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="spoilers">{t("settings.spoilers")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="reshuffle"
                                    checked={this.state.settings.reshuffle} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="reshuffle">{t("settings.shuffle")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="simulate"
                                    checked={this.state.settings.simulate} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="simulate">{t("settings.simulate")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="exceptions"
                                    checked={this.state.settings.exceptions} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="exceptions">{t("settings.exceptions")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="minShanten">{t("settings.minShanten")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="minShanten"
                                    min={0} max={4} step={1}
                                    value={this.state.settings.minShanten} onChange={this.onSettingChanged} />
                                <span className="blackText">&nbsp;{t("settings.minShantenLimit")}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="sort"
                                    checked={this.state.settings.sort} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="sort">{t("settings.sort")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="blind"
                                    checked={this.state.settings.blind} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="blind">{t("settings.blind")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Input className="form-check-input" type="checkbox" id="useTimer"
                                    checked={this.state.settings.useTimer} onChange={this.onSettingChanged} />
                                <Label className="form-check-label" for="useTimer">{t("settings.useTimer")}</Label>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="time">{t("settings.time")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="time"
                                    min={1} max={99} step={1}
                                    value={this.state.settings.time} onChange={this.onSettingChanged} />
                                <span className="blackText">&nbsp;{t("settings.seconds")}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="form-check form-check-inline">
                                <Label className="form-check-label" for="time">{t("settings.extraTime")}&nbsp;</Label>
                                <NumericInput className="form-check-input" type="number" id="extraTime"
                                    min={0} max={99} step={1}
                                    value={this.state.settings.extraTime} onChange={this.onSettingChanged} />
                                <span className="blackText">&nbsp;{t("settings.seconds")}</span>
                            </Col>
                        </Row>
                    </CardBody></Card>
                </Collapse>
            </Container>
        );
    }
}

export default withTranslation()(Settings);