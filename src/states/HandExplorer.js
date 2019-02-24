import React from 'react';
import { Container, Row } from 'reactstrap';
import Hand from '../components/Hand';
import LoadButton from '../components/LoadButton';
import HandFutures from '../components/hand-explorer/HandFutures';
import { GenerateHand, FillHand } from '../scripts/GenerateHand';

class HandExplorer extends React.Component {
    constructor(props) {
        super(props);
        this.loadHand = this.loadHand.bind(this);
        this.state = {
            message: "",
            hand: null
        }
    }

    componentDidMount() {
        let remainingTiles = [
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            0, 0, 0, 0, 0, 0, 0, 0
        ];

        let { hand } = GenerateHand(remainingTiles);
        this.setState({
            hand: hand
        });
    }

    loadHand(loadData) {
        if (loadData.tiles === 0) {
            this.setState({
                message: "Error: Couldn't understand provided hand."
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

        let { hand } = FillHand(remainingTiles, loadData.hand, 14 - loadData.tiles);

        if (!hand) {
            this.setState({
                message: "Error: Couldn't understand provided hand."
            });
            return;
        }

        this.setState({
            message: "",
            hand: hand
        });
    }

    render() {
        return (
            <Container>
                <LoadButton callback={this.loadHand} />
                <Row className="mt-2 mb-2">{this.state.message}</Row>
                <Hand tiles={this.state.hand} />
                <HandFutures hand={this.state.hand} />
            </Container>
        );
    }
}

export default HandExplorer;