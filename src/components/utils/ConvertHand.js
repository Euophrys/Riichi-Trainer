import React from 'react';
import { Container, Button, Input, InputGroup, InputGroupAddon, ListGroupItem, ListGroup } from 'reactstrap';
import { convertHandToAsciiSymbols, convertHandToDiscordEmoji } from '../../scripts/HandConversions';
import { withTranslation } from 'react-i18next';
import { characterToSuit } from '../../scripts/Utils';

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
                offset = characterToSuit(characters[index]);
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

    render() {
        let { t } = this.props;
        return (
            <Container>
                <InputGroup>
                    <Input id="convertHandString" placeholder="123m456p789s12345z" />
                    <InputGroupAddon addonType="append">
                        <Button color="primary" onClick={() => this.onClick()}>{t("utils.convertButtonLabel")}</Button>
                    </InputGroupAddon>
                </InputGroup>
                <ListGroup>
                    <ListGroupItem>{t("utils.ascii")} {convertHandToAsciiSymbols(this.state.hand)}</ListGroupItem>
                    <ListGroupItem>{t("utils.emoji")} {convertHandToDiscordEmoji(this.state.hand)}</ListGroupItem>
                </ListGroup>
            </Container>
        )
    }
}

export default withTranslation()(ConvertHand);