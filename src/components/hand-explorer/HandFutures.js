import React from 'react';
import { Row, ListGroup, ListGroupItem } from 'reactstrap';
import ResultingHandInfo from './ResultingHandInfo';
import { CalculateUkeire, CalculateUkeireUpgrades, CalculateDiscardUkeire } from '../../scripts/UkeireCalculator';
import { CalculateMinimumShanten } from '../../scripts/ShantenCalculator';

class HandFutures extends React.Component {
    render() {
        if(!this.props.hand) return <Row/>;

        let tiles = [];
        let hand = this.props.hand.slice();

        let remainingTiles = [
            0,4,4,4,4,4,4,4,4,4,
            0,4,4,4,4,4,4,4,4,4,
            0,4,4,4,4,4,4,4,4,4,
            0,4,4,4,4,4,4,4
        ];

        for (let i = 0; i < remainingTiles.length; i++) {
            remainingTiles[i] = Math.max(0, remainingTiles[i] - hand[i]);
        }

        for(let i = 0; i < hand.length; i++) {
            if(hand[i] > 0) {
                tiles.push(i);
            }
        }

        let baseUkeire = Math.max(...CalculateDiscardUkeire(hand, remainingTiles, CalculateMinimumShanten));

        let infoObjects = tiles.map((tile) => {
            hand[tile]--;
            let newHand = hand.slice();
            hand[tile]++;

            return {
                hand: newHand,
                discard: tile,
                shanten: CalculateMinimumShanten(newHand),
                ukeire: CalculateUkeire(newHand, remainingTiles, CalculateMinimumShanten),
                upgrades: CalculateUkeireUpgrades(newHand, remainingTiles, CalculateMinimumShanten, -2, baseUkeire)
            }
        });

        infoObjects = infoObjects.sort((a, b) => {
            if(a.shanten !== b.shanten) {
                return a.shanten - b.shanten;
            }

            if(a.ukeire.value !== b.ukeire.value) {
                return b.ukeire.value - a.ukeire.value;
            }

            return b.upgrades.value - a.upgrades.value;
        });

        let filteredObjects = infoObjects.filter((obj) => {
            let strictlyBetter = infoObjects.find((other) => {
                return (other.shanten <= obj.shanten
                    && (
                        other.ukeire.value > obj.ukeire.value && other.upgrades.value > obj.upgrades.value
                        || other.ukeire.value === obj.ukeire.value && other.upgrades.value > obj.upgrades.value
                        || other.ukeire.value > obj.ukeire.value && other.upgrades.value === obj.upgrades.value
                    )
                );
            });
            return strictlyBetter === undefined;
        });

        let handInfos = filteredObjects.map((obj) => {
            return (
                <ListGroupItem>
                    <ResultingHandInfo
                        hand={obj.hand}
                        discard={obj.discard}
                        shanten={obj.shanten}
                        ukeire={obj.ukeire}
                        upgrades={obj.upgrades}
                    />
                </ListGroupItem>
            );
        });

        return (
            <Row className="mt-2">
                <ListGroup>
                    {handInfos}
                </ListGroup>
            </Row>
        );
    }
}

export default HandFutures;