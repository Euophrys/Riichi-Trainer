import React from 'react';
import { Button, Input, InputGroup, InputGroupAddon, Col } from 'reactstrap';

class LoadButton extends React.Component {
    onClick() {
        let string = document.getElementById("loadHandString").value;
        let characters = string.toLowerCase().split('').reverse();
        let hand = Array(38).fill(0);
        let index = 0;
        let offset = -1;
        let tiles = 0;

        while (index < characters.length && tiles < 14) {
            do {
                offset = this.getOffset(characters[index]);
                index++;
            } while (offset === -1 && index < characters.length);

            while (!isNaN(characters[index]) && index < characters.length && tiles < 14) {
                let tile = parseInt(characters[index]);

                if (tile > 0) {
                    tile += offset;

                    if (hand[tile] < 4) {
                        hand[tile]++;
                        tiles++;
                    }
                }
                else if (tile === 0) {
                    tile += offset;

                    if (tile !== 30 && hand[tile] + hand[tile + 5] < 4) {
                        hand[tile]++;
                        tiles++;
                    }
                }

                index++;
            }
        }

        let ret = {
            hand: hand,
            tiles: tiles
        };

        this.props.callback(ret);
    }

    getOffset(character) {
        if (character === "m" || character === "w" || character === "c") {
            return 0;
        }

        if (character === "p" || character === "d") {
            return 10;
        }

        if (character === "s" || character === "b") {
            return 20;
        }

        if (character === "z" || character === "h") {
            return 30;
        }

        return -1;
    }

    render() {
        return (
            <Col xs="12" sm="6" md="6" lg="8">
                <InputGroup>
                    <Input id="loadHandString" placeholder="123m456s789p12345z" />
                    <InputGroupAddon addonType="append">
                        <Button color="warning" onClick={() => this.onClick()}>Load Hand</Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        )
    }
}

export default LoadButton;