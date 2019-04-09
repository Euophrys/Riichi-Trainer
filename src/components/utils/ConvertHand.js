import React from 'react';
import { Container, Button, Input, InputGroup, InputGroupAddon, ListGroupItem, ListGroup } from 'reactstrap';
import { convertHandToAsciiSymbols, convertHandToDiscordEmoji } from '../../scripts/HandConversions';

class ConvertHand extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hand: [0, 1]
        }
    }

    onClick() {
        let string = document.getElementById("convertHandString").value;
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

        this.setState({
            hand: hand
        });
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
            <Container>
                <InputGroup>
                    <Input id="convertHandString" placeholder="123m456p789s12345z" />
                    <InputGroupAddon addonType="append">
                        <Button color="primary" onClick={() => this.onClick()}>Convert Hand</Button>
                    </InputGroupAddon>
                </InputGroup>
                <ListGroup>
                    <ListGroupItem>ASCII: {convertHandToAsciiSymbols(this.state.hand)}</ListGroupItem>
                    <ListGroupItem>Emoji: {convertHandToDiscordEmoji(this.state.hand)}</ListGroupItem>
                </ListGroup>
            </Container>
        )
    }
}

export default ConvertHand;