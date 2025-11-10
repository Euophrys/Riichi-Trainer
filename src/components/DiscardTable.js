import React from 'react';
import Tile from './Tile';
import { SEAT_NAMES } from '../Constants';
import { withTranslation } from 'react-i18next';
import './DiscardTable.css';

class DiscardTable extends React.Component {
    render() {
        let players = this.props.players;
        let { t } = this.props;

        // Player indices: 0 = bottom (you), 1 = right, 2 = top, 3 = left
        // Seats are arranged as: 0 (east) -> 1 (south) -> 2 (west) -> 3 (north)
        // We need to reorder based on player seat positions

        // Find player 0's seat position and arrange others relative to them
        const playerBySeat = {};
        players.forEach(p => {
            playerBySeat[p.seat] = p;
        });

        // Arrange players in order: bottom (player 0's seat), right, top, left
        const arrangedPlayers = [];
        const baseIndex = players[0].seat;
        for (let i = 0; i < 4; i++) {
            const seat = (baseIndex + i) % 4;
            arrangedPlayers.push(playerBySeat[seat]);
        }

        const getRotationClass = (position) => {
            // position 0 = bottom (0°), 1 = right (270°), 2 = top (180°), 3 = left (90°)
            const rotations = ['rotation-0', 'rotation-270', 'rotation-180', 'rotation-90'];
            return rotations[position];
        };

        const getRowClass = (position) => {
            // position 0 = bottom, 1 = right, 2 = top, 3 = left
            const positions = ['discard-row-bottom', 'discard-row-right', 'discard-row-top', 'discard-row-left'];
            return positions[position];
        };

        return (
            <div className="discard-table-container">
                <div className="discard-table-grid">
                    {arrangedPlayers.map((player, position) => (
                        <div key={position} className={`discard-position ${getRowClass(position)}`}>
                            <div className="discard-player-section">
                                <div className="discard-player-label">
                                    {t(player.name)} ({t(SEAT_NAMES[player.seat])})
                                </div>
                                <div className={`discard-rows ${getRotationClass(position)}`}>
                                    {Array.from({ length: (position === 1 || position === 3) ? 6 : Math.ceil(player.discards.length / 6) }).map((_, rowNum) => {
                                        let rowTiles;
                                        if (position === 1 || position === 3) {
                                            // For left/right players: arrange tiles so each row takes every 6th tile
                                            rowTiles = [];
                                            for (let col = 0; col < 3; col++) {
                                                const tileIdx = rowNum + col * 6;
                                                if (tileIdx < player.discards.length) {
                                                    rowTiles.push({ tile: player.discards[tileIdx], idx: tileIdx });
                                                }
                                            }
                                        } else {
                                            // For top/bottom players: group 6 tiles per row
                                            const startIdx = rowNum * 6;
                                            const endIdx = Math.min(startIdx + 6, player.discards.length);
                                            rowTiles = player.discards.slice(startIdx, endIdx).map((tile, idx) => ({ tile, idx: startIdx + idx }));
                                        }

                                        return (
                                            <div key={rowNum} className="discard-row">
                                                {rowTiles.map((tileObj) => {
                                                    const isRiichiTile = tileObj.idx === player.riichiIndex;

                                                    return (
                                                        <div
                                                            key={tileObj.idx}
                                                            className={`discard-tile-wrapper ${isRiichiTile ? 'riichi-tile' : ''}`}
                                                        >
                                                            <Tile
                                                                className="discardTile"
                                                                tile={tileObj.tile}
                                                                showIndexes={this.props.showIndexes}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="discard-table-info">
                    <span className="blackText">{t("discards.discardCount", { count: this.props.discardCount })}</span>&nbsp;
                    <span className="blackText">{t("discards.tilesLeft", { count: this.props.wallCount })}</span>
                </div>
            </div>
        );
    }
}

export default withTranslation()(DiscardTable);
