import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';
import { useTranslation } from 'react-i18next';

function Tile(props) {
    let { t } = useTranslation();

    let displayTile = props.displayTile || props.tile;

    return (
        <img className={props.className}
            name={props.tile}
            src={getTileImage(displayTile)}
            title={getTileAsText(t, displayTile)}
            alt={getTileAsText(t, displayTile)}
            onClick={props.onClick}
        />
    );
}

export default Tile;