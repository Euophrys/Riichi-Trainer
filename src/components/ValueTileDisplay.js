import React from 'react';
import { Row, Col } from 'reactstrap';
import Tile from './Tile';
import { useTranslation } from 'react-i18next';

function ValueTileDisplay(props) {
    let { t } = useTranslation();
    return (
        <Row className="justify-content-center mt-2">
            <Col style={{ textAlign: "right" }} xs="2" sm="3" md="3" lg="2"><span>{t("trainer.roundWind")}</span></Col>
            <Col xs="2" sm="1"><Tile className="discardTile" tile={props.roundWind} /></Col>
            <Col style={{ textAlign: "right" }} xs="2" sm="3" md="2"><span>{t("trainer.seatWind")}</span></Col>
            <Col xs="2" sm="1"><Tile className="discardTile" tile={props.seatWind} /></Col>
            <Col style={{ textAlign: "right" }} xs="2" sm="3" md="3" lg="2"><span>{t("trainer.doraIndicator")}</span></Col>
            <Col xs="2" sm="1"><Tile className="discardTile" tile={props.dora} /></Col>
        </Row>
    );
}

export default ValueTileDisplay;