import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';

class Tile extends React.Component {
    render() {
        let displayTile = this.props.displayTile || this.props.tile;

        return (
            <img className={this.props.className}
                name={this.props.tile}
                src={getTileImage(displayTile)}
                title={getTileAsText(displayTile)}
                alt={getTileAsText(displayTile)}
                onClick={this.props.onClick}
            />
        );
    }
}

export default Tile;