import React from 'react';
import { ListGroupItem, Row } from 'reactstrap';
import ScoreInput from './ScoreInput';
import { PLACEMENTS } from '../../Constants';

function GyakutenQuestion(props) {
    let question = "What is the minimum score you can ";

    for(let i = 1; i < props.riichis.length; i++) {
        if(props.riichis[i] > 0) {
            question = `If ${PLACEMENTS[i]} place declares riichi, what is the minimum score you can `;
            break;
        }
    }

    question += props.tsumo ? "tsumo " : `ron ${PLACEMENTS[props.ronTarget]} with `;
    question += `to get ${PLACEMENTS[props.placementTarget]}?`;

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