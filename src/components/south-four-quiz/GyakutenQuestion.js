import React from 'react';
import { ListGroupItem, Row } from 'reactstrap';
import ScoreInput from './ScoreInput';
import { PLACEMENTS } from '../../Constants';

class GyakutenQuestion extends React.Component {
    render() {
        let question = "What is the minimum score you can ";

        for(let i = 1; i < this.props.riichis.length; i++) {
            if(this.props.riichis[i] > 0) {
                question = `If ${PLACEMENTS[i]} place declares riichi, what is the minimum score you can `;
                break;
            }
        }

        question += this.props.tsumo ? "tsumo " : `ron ${PLACEMENTS[this.props.ronTarget]} with `;
        question += `to get ${PLACEMENTS[this.props.placementTarget]}?`;

        return (
            <ListGroupItem>
                <Row className="mb-2">{question}</Row>
                <ScoreInput
                    onScoreSubmit={this.props.onScoreSubmit}
                    tsumo={this.props.tsumo}
                    ronTarget={this.props.ronTarget}
                    placementTarget={this.props.placementTarget}
                    index={this.props.index}
                    riichis={this.props.riichis}
                />
                {this.props.messages[this.props.index]}
            </ListGroupItem>
        );
    }
}

export default GyakutenQuestion;