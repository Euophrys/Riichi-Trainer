import React from 'react';
import { Row } from 'reactstrap';
import Tile from './Tile';

function SortedHand(props) {
    const tiles = [];

    let hand = props.tiles;

    if (!hand) {
        return <Row />;
    }

    let lastDraw = props.lastDraw;
    let index = 0;

    for (let i = 0; i < hand.length; i++) {
        tiles.push((
            <Tile className="handTile"
                key={index++}
                tile={hand[i]}
                onClick={props.onTileClick}
                showIndexes={props.showIndexes}
            />
        ));
    }

    if (lastDraw > -1) {
        tiles.push((
            <Tile className="handTile"
                key={index++}
                tile={lastDraw}
                onClick={props.onTileClick}
                showIndexes={props.showIndexes}
            />
        ));
    }

    return (
        <Row>
            {tiles}
        </Row>
    );
}

export default SortedHand;