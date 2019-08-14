import React from 'react';
import { Container } from 'reactstrap';
import RandomGameState from '../components/utils/RandomGameState';
import ConvertHand from '../components/utils/ConvertHand';
import RCalculation from '../components/utils/RCalculation';
import { useTranslation } from 'react-i18next';

function UtilsState(props) {
    let { t } = useTranslation();
    return (
        <Container>
            <h2 style={{ "textAlign": "center" }}>{t("utils.convertHeader")}</h2>
            <ConvertHand />
            <br />
            <h2 style={{ "textAlign": "center" }}>{t("utils.stateHeader")}</h2>
            <RandomGameState />
        </Container>
    );
}

export default UtilsState;