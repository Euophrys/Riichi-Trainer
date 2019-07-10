import React from 'react';
import { Button, Input, InputGroup, InputGroupAddon, Col } from 'reactstrap';
import { withTranslation } from 'react-i18next';

class LoadButton extends React.Component {
    onClick() {
        let string = document.getElementById("loadHandString").value;
        let characters = string.toLowerCase();
        let hand = Array(38).fill(0);
        let index = 0;
        let offset = -1;
        let tiles = 0;

        let draw = this.tryRegex(/(\d{1,2})t/, characters);
        let dora = this.tryRegex(/(\d{1,2})d/, characters);
        let seatWind = this.tryRegex(/(\d)j/, characters);
        let roundWind = this.tryRegex(/(\d)[br]/, characters);

        characters = characters.split('').reverse();
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
                        if(draw === false) draw = tile;
                    }
                }
                else if (tile === 0) {
                    tile += offset;

                    if (tile !== 30 && hand[tile] + hand[tile + 5] < 4) {
                        hand[tile]++;
                        tiles++;
                        if(draw === false) draw = tile;
                    }
                }

                index++;
            }
        }

        let ret = {
            hand,
            tiles,
            draw,
            dora,
            seatWind,
            roundWind
        };

        this.props.callback(ret);
    }

    tryRegex(regex, string) {
        let match = regex.exec(string);

        if (match) {
            return parseInt(match[1]);
        }

        return false;
    }

    getOffset(character) {
        if (character === "m" || character === "w" || character === "c") {
            return 0;
        }

        if (character === "p") {
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
        let { t } = this.props;
        return (
            <Col xs="12" sm="6" md="6" lg="8">
                <InputGroup>
                    <Input id="loadHandString" placeholder="123m456p789s12345z" />
                    <InputGroupAddon addonType="append">
                        <Button color="warning" onClick={() => this.onClick()}>{t("trainer.loadButtonLabel")}</Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
        )
    }
}

export default withTranslation()(LoadButton);