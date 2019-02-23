import React from 'react';
import { Row } from 'reactstrap';
import Tile from './Tile';

class Hand extends React.Component {
    render() {
        const tiles = [];

        let hand = this.props.tiles;

        if (!hand) {
            return <Row />;
        }

        let lastDraw = this.props.lastDraw;

        if (lastDraw > -1) {
            hand[lastDraw]--;
        }

        for (let i = 0; i < hand.length; i++) {
            if (i % 10 === 5 && hand[i - 5] > 0) {
                for (let j = 0; j < hand[i - 5]; j++) {
                    tiles.push((
                        <Tile className="handTile"
                            tile={i - 5}
                            onClick={this.props.onTileClick}
                        />
                    ));
                }
            }

            if (hand[i] === 0) continue;
            if (i % 10 === 0) continue;

            for (let j = 0; j < hand[i]; j++) {
                tiles.push((
                    <Tile className="handTile"
                        tile={i}
                        onClick={this.props.onTileClick}
                    />
                ));
            }

        }

        if (lastDraw > -1) {
            hand[lastDraw]++;
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

export default Hand;