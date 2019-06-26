import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import Hand from '../components/Hand';
import LoadButton from '../components/LoadButton';
import HandFutures from '../components/hand-explorer/HandFutures';
import { FillHand } from '../scripts/GenerateHand';

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

    onShowToggled() {
        this.setState({
            showAll: !this.state.showAll
        });
    }

    render() {
        return (
            <Container>
                <Row className="mb-2"><span>Warning: Loading a hand may cause the page to hang for 5-10 seconds, or more if you have an older computer, depending on the complexity of the hand. Loading a hand will show all of the ukeire and upgrade possibilities for each discard, even ones that go back in shanten. By default, options that are strictly worse than another option won't be displayed, but you can press the button below to change that. If you only need ukeire information, <a href="http://tenhou.net/2/?q=5689m247p367s1474z" target="_blank" rel="noopener noreferrer">Tenhou's calculator</a> will suffice.<br/>Shanten: The number of tiles away from ready your hand is.<br/>Ukeire: The number of tiles that reduce your shanten.</span></Row>
                <LoadButton callback={this.loadHand} />
                <Col xs="12"><Button onClick={()=>this.onShowToggled()}>{this.state.showAll ? "Show Only Notable Discards" : "Show All Possible Discards"}</Button></Col>
                <Row className="mt-2 mb-2">{this.state.message}</Row>
                <Hand tiles={this.state.hand} />
                <HandFutures hand={this.state.hand} showAll={this.state.showAll} />
            </Container>
        );
    }
}

export default HandExplorer;