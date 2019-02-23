import React from 'react';
import { getTileImage, getTileAsText } from '../scripts/TileConversions';

class Tile extends React.Component {
    render() {
        return (
            <img className={this.props.className}
                name={this.props.tile}
                src={getTileImage(this.props.tile)}
                title={getTileAsText(this.props.tile)}
                alt={getTileAsText(this.props.tile)}
                onClick={this.props.onClick}
            />
        );
    }
}

export default Tile;