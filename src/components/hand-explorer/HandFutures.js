import React from 'react';
import { Row, ListGroup, ListGroupItem } from 'reactstrap';
import ResultingHandInfo from './ResultingHandInfo';
import { calculateUkeire, calculateUkeireUpgrades, calculateDiscardUkeire } from '../../scripts/UkeireCalculator';
import { calculateStandardShanten } from '../../scripts/ShantenCalculator';
import { ALL_TILES_REMAINING } from '../../Constants';

function HandFutures(props) {
    if (!props.hand) return <Row />;

    let tiles = [];
    let hand = props.hand.slice();
    let remainingTiles = ALL_TILES_REMAINING.slice();

    for (let i = 0; i < remainingTiles.length; i++) {
        remainingTiles[i] = Math.max(0, remainingTiles[i] - hand[i]);
    }

    for (let i = 0; i < hand.length; i++) {
        if (hand[i] > 0) {
            tiles.push(i);
        }
    }

    let baseUkeire = Math.max(...calculateDiscardUkeire(hand, remainingTiles, calculateStandardShanten).map(u => u.value));

    let infoObjects = tiles.map((tile) => {
        let newHand = hand.slice();
        newHand[tile]--;

        return {
            hand: newHand,
            discard: tile,
            shanten: calculateStandardShanten(newHand),
            ukeire: calculateUkeire(newHand, remainingTiles, calculateStandardShanten),
            upgrades: calculateUkeireUpgrades(newHand, remainingTiles, calculateStandardShanten, -2, baseUkeire)
        }
    });

    infoObjects = infoObjects.sort((a, b) => {
        if (a.shanten !== b.shanten) {
            return a.shanten - b.shanten;
        }

        if (a.ukeire.value !== b.ukeire.value) {
            return b.ukeire.value - a.ukeire.value;
        }

        return b.upgrades.value - a.upgrades.value;
    });

    if (!props.showAll) {
        infoObjects = infoObjects.filter((obj) => {
            let strictlyBetter = infoObjects.find((other) => {
                return (other.shanten <= obj.shanten
                    && (
                        (other.ukeire.value > obj.ukeire.value && other.upgrades.value > obj.upgrades.value)
                        || (other.ukeire.value === obj.ukeire.value && other.upgrades.value > obj.upgrades.value)
                        || (other.ukeire.value > obj.ukeire.value && other.upgrades.value === obj.upgrades.value)
                    )
                );
            });
            return strictlyBetter === undefined;
        });
    }

    let handInfos = infoObjects.map((obj) => {
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

export default HandFutures;