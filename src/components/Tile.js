import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';
import { useTranslation } from 'react-i18next';
import { TILE_INDEXES } from '../Constants';

function Tile(props) {
    let { t } = useTranslation();

    let displayTile = props.displayTile || props.tile;

    return (
        <div className={props.className}>
            <img
                className="tile"
                name={props.tile}
                src={getTileImage(displayTile)}
                title={getTileAsText(t, displayTile)}
                alt={getTileAsText(t, displayTile)}
                onClick={props.onClick}
            />
            <span className="index">{props.showIndexes ? TILE_INDEXES[displayTile] : ""}</span>
        </div>
    );
}

export default Tile;