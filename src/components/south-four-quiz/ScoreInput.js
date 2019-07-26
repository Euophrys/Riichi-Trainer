import React from 'react';
import { Button, Input, InputGroup, InputGroupAddon, Col, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';

class ScoreInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            han: 1,
            fu: 20
        }

        this.onHanChanged = this.onHanChanged.bind(this);
        this.onFuChanged = this.onFuChanged.bind(this);
    }

    onHanChanged(event) {
        let han = this.validateHan(event.target.value);
        event.target.value = han;
        this.setState({
            han: han
        });
    }

    validateHan(han) {
        han = Math.max(han, this.state.fu > 110 ? 2 : 1);
        han = Math.min(han, this.props.maxHan || 13);
        return han;
    }

    onFuChanged(event) {
        let fu = this.validateFu(event.target.value, this.state.fu);
        event.target.value = fu;
        this.setState({
            fu: fu
        });
    }

    validateFu(fu) {
        fu = Math.max(fu, 20);

        if (fu !== 25) {
            if (fu < this.state.fu) {
                fu = Math.floor(fu / 10) * 10;
            } else {
                fu = Math.ceil(fu / 10) * 10;
            }
        }

        fu = Math.min(fu, this.props.maxFu || 130);

        return fu;
    }

    onScoreSubmit() {
        this.props.onScoreSubmit(this.state.han, this.state.fu, this.props.tsumo, this.props.ronTarget, this.props.placementTarget, this.props.index, this.props.riichis);
    }

    onNumberChanged(event) {
        event.target.focus();

        let value = parseInt(event.target.value);
        if (value > 30 && value % 10 === 5) {
            event.target.blur();
        }
    }

    render() {
        let { t } = this.props;

        return (
            <Row>
                <Col xs="4" sm="3">
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">{t("allLast.han")}</InputGroupAddon>
                        <Input type="number" placeholder={t("allLast.han")} step="1" min="1" max={this.props.maxHan || 13} onBlur={this.onHanChanged} onChange={this.onNumberChanged} />
                    </InputGroup>
                </Col>
                <Col xs="4" sm="3">
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">{t("allLast.fu")}</InputGroupAddon>
                        <Input type="number" placeholder={t("allLast.fu")} step="5" min="20" max={this.props.maxFu || 130} onBlur={this.onFuChanged} onChange={this.onNumberChanged} />
                    </InputGroup>
                </Col>
                <Col xs="2">
                    <Button className="btn-block" onClick={() => this.onScoreSubmit()}>{t("allLast.submit")}</Button>
                </Col>
            </Row>
        )
    }
}

export default withTranslation()(ScoreInput);