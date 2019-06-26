import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';

function Tile(props) {
    let displayTile = props.displayTile || props.tile;

    return (
        <img className={props.className}
            name={props.tile}
            src={getTileImage(displayTile)}
            title={getTileAsText(displayTile)}
            alt={getTileAsText(displayTile)}
            onClick={props.onClick}
        />
    );
}

export default Tile;