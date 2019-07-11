import React from 'react';
import { ListGroupItem, Row } from 'reactstrap';
import ScoreInput from './ScoreInput';
import { PLACEMENTS } from '../../Constants';
import { useTranslation } from 'react-i18next';

function GyakutenQuestion(props) {
    let { t } = useTranslation();
    
    let question = t("allLast.question", {
        action: props.tsumo ? t("allLast.tsumo") : t("allLast.ron", {target: t(PLACEMENTS[props.ronTarget])}),
        placement: t(PLACEMENTS[props.placementTarget])
    });

    for(let i = 1; i < props.riichis.length; i++) {
        if(props.riichis[i] > 0) {
            question = t("allLast.riichiQuestion", {
                player: t(PLACEMENTS[i]),
                action: props.tsumo ? t("allLast.tsumo") : t("allLast.ron", {target: t(PLACEMENTS[props.ronTarget])}),
                placement: t(PLACEMENTS[props.placementTarget])
            });
            break;
        }
    }

    return (
        <ListGroupItem>
            <Row className="mb-2">{question}</Row>
            <ScoreInput
                onScoreSubmit={props.onScoreSubmit}
                tsumo={props.tsumo}
                ronTarget={props.ronTarget}
                placementTarget={props.placementTarget}
                index={props.index}
                riichis={props.riichis}
            />
            {props.messages[props.index]}
        </ListGroupItem>
    );
}

export default GyakutenQuestion;