import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import LoadButton from '../components/LoadButton';
import HandFutures from '../components/hand-explorer/HandFutures';
import { fillHand } from '../scripts/GenerateHand';
import { withTranslation } from 'react-i18next';

class HandExplorer extends React.Component {
    constructor(props) {
        super(props);
        this.loadHand = this.loadHand.bind(this);
        this.state = {
            message: "",
            hand: null,
            showAll: false
        }
    }

    loadHand(loadData) {
        let { t } = this.props;

        if (loadData.tiles === 0) {
            this.setState({
                message: t("trainer.error.load")
            });
            return;
        }

        let remainingTiles = [
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 0, 0, 0, 0, 0, 0, 0
        ];

        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - loadData.hand[i]);
        }

        let { hand } = fillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if (!hand) {
            this.setState({
                message: t("trainer.error.load")
            });
            return;
        }

        this.setState({
            message: "",
            hand: hand
        });
    }

    onShowToggled() {
        this.setState({
            showAll: !this.state.showAll
        });
    }

    render() {
        let { t } = this.props;
        return (
            <Container>
                <Row className="mb-2">
                    <span>
                        {t("explorer.warning")}
                        <br />{t("explorer.shanten")}
                        <br />{t("explorer.ukeire")}
                    </span></Row>
                <LoadButton callback={this.loadHand} />
                <Col xs="12"><Button onClick={() => this.onShowToggled()}>{this.state.showAll ? t("explorer.notableDiscards") : t("explorer.allDiscards")}</Button></Col>
                <Row className="mt-2 mb-2">{this.state.message}</Row>
                <Hand tiles={this.state.hand} />
                <HandFutures hand={this.state.hand} showAll={this.state.showAll} />
            </Container>
        );
    }
}

export default withTranslation()(HandExplorer);