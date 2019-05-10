import React from 'react';
import { Row } from 'reactstrap';
import Tile from './Tile';

class SortedHand extends React.Component {
    render() {
        const tiles = [];

        let hand = this.props.tiles;

        if (!hand) {
            return <Row />;
        }

        let lastDraw = this.props.lastDraw;

        for (let i = 0; i < hand.length; i++) {
            tiles.push((
                <Tile className="handTile"
                    tile={hand[i]}
                    onClick={this.props.onTileClick}
                />
            ));
        }

        if (lastDraw > -1) {
            tiles.push((
                <Tile className="handTile"
                    tile={lastDraw}
                    onClick={this.props.onTileClick}
                />
            ));
        }

        return (
            <Row>
                {tiles}
            </Row>
        );
    }
}

export default SortedHand;