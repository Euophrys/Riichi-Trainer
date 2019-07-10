import React from 'react';
import { Row, ListGroup, ListGroupItem } from 'reactstrap';
import ResultingHandInfo from './ResultingHandInfo';
import { CalculateUkeire, CalculateUkeireUpgrades, CalculateDiscardUkeire } from '../../scripts/UkeireCalculator';
import { CalculateStandardShanten } from '../../scripts/ShantenCalculator';
import { ALL_TILES_REMAINING } from '../../Constants';

function HandFutures(props) {
    if(!props.hand) return <Row/>;

    let tiles = [];
    let hand = props.hand.slice();
    let remainingTiles = ALL_TILES_REMAINING.slice();

    for (let i = 0; i < remainingTiles.length; i++) {
        remainingTiles[i] = Math.max(0, remainingTiles[i] - hand[i]);
    }

    for(let i = 0; i < hand.length; i++) {
        if(hand[i] > 0) {
            tiles.push(i);
        }
    }

    let baseUkeire = Math.max(...CalculateDiscardUkeire(hand, remainingTiles, CalculateStandardShanten).map(u => u.value));

    let infoObjects = tiles.map((tile) => {
        let newHand = hand.slice();
        newHand[tile]--;

        return {
            hand: newHand,
            discard: tile,
            shanten: CalculateStandardShanten(newHand),
            ukeire: CalculateUkeire(newHand, remainingTiles, CalculateStandardShanten),
            upgrades: CalculateUkeireUpgrades(newHand, remainingTiles, CalculateStandardShanten, -2, baseUkeire)
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

    if(!props.showAll) {
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