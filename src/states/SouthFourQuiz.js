import React from 'react';
import { Container } from 'reactstrap';
import ScoreInput from '../components/ScoreInput';
import getPointsString from '../scripts/ScoreCalculation';

class SouthFourQuiz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0
        }

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(han, fu) {
        this.setState({
            score: getPointsString(han, fu, false, true)
        });
    }

    render() {
        return (
            <Container>
                <ScoreInput onScoreSubmit={this.onSubmit} />
                <div>{this.state.score}</div>
            </Container>
        );
    }
}

export default SouthFourQuiz;