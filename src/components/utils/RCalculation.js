import React from 'react';
import { Container, Button, Input, InputGroup, InputGroupAddon, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row } from 'reactstrap';

class RCalculation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dropdownOpen: false,
            output: ""
        }
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    onSetR(newR) {
        document.getElementById("opponentR").value = newR;
    }

    onCalculate() {
        let currentR = parseFloat(document.getElementById("currentR").value);
        let targetR = parseFloat(document.getElementById("targetR").value);
        let games = parseInt(document.getElementById("games").value);
        let opponentR = parseFloat(document.getElementById("opponentR").value);
        let firstRate = parseFloat(document.getElementById("firstRate").value);
        let secondRate = parseFloat(document.getElementById("secondRate").value);
        let thirdRate = parseFloat(document.getElementById("thirdRate").value);
        let fourthRate = parseFloat(document.getElementById("fourthRate").value);

        if (isNaN(currentR)) {
            this.setState({ output: "Current R is not a number." });
            return;
        }
        if (isNaN(targetR)) {
            this.setState({ output: "Target R is not a number." });
            return;
        }
        if (isNaN(games)) {
            this.setState({ output: "Game count is not a number." });
            return;
        }
        if (isNaN(opponentR)) {
            this.setState({ output: "Opponent average R is not a number." });
            return;
        }
        if (isNaN(firstRate)) {
            this.setState({ output: "First rate is not a number." });
            return;
        }
        if (isNaN(secondRate)) {
            this.setState({ output: "Second rate is not a number." });
            return;
        }
        if (isNaN(thirdRate)) {
            this.setState({ output: "Third rate is not a number." });
            return;
        }
        if (isNaN(fourthRate)) {
            this.setState({ output: "Fourth rate is not a number." });
            return;
        }

        let totalRate = firstRate + secondRate + thirdRate + fourthRate;
        if (totalRate < 98 || totalRate > 102) {
            this.setState({ output: "Placements don't add up to 100%." });
            return;
        }

        let adjustment = Math.max(1 - (games * 0.002), 0.2);
        let averageRate = (opponentR * 3 + currentR) / 4;
        // change = adjustment*(base+(average table rate - own rate)/40)
        let firstRChange = adjustment * (30 + ((averageRate - currentR) / 40));
        let secondRChange = adjustment * (10 + ((averageRate - currentR) / 40));
        let thirdRChange = adjustment * (-10 + ((averageRate - currentR) / 40));
        let fourthRChange = adjustment * (-30 + ((averageRate - currentR) / 40));

        let averageChange =
            firstRChange * firstRate
            + secondRChange * secondRate
            + thirdRChange * thirdRate
            + fourthRChange * fourthRate;
        averageChange = averageChange / 100;

        let output = `R for first: ${firstRChange}, R for second: ${secondRChange}, R for third: ${thirdRChange}, R for fourth: ${fourthRChange}, average R: ${averageChange}`;

        let higherTargetR = currentR - targetR < 0;

        if (averageChange === 0
            || (averageChange < 0 && higherTargetR)
            || (averageChange > 0 && !higherTargetR)) {
            this.setState({ output: `You will never reach your goal with those placements. ${output}` });
            return;
        }

        this.setState({ output: output });
    }

    render() {
        return (
            <Container>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Current R:
                    </InputGroupAddon>
                    <Input type="number" id="currentR" placeholder="1500" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Target R:
                    </InputGroupAddon>
                    <Input type="number" id="targetR" placeholder="1800" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Games Played:
                    </InputGroupAddon>
                    <Input type="number" id="games" placeholder="400" />
                </InputGroup>
                <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggle()}>
                    <DropdownToggle caret>
                        Set Average R To Room Average
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => this.onSetR(1500)}>Ippan</DropdownItem>
                        <DropdownItem onClick={() => this.onSetR(1700)}>Joukyuu</DropdownItem>
                        <DropdownItem onClick={() => this.onSetR(1900)}>Tokujou</DropdownItem>
                        <DropdownItem onClick={() => this.onSetR(2100)}>Houou</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Opponent Average R:
                    </InputGroupAddon>
                    <Input type="number" id="opponentR" placeholder="1700" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        First Rate (%):
                    </InputGroupAddon>
                    <Input type="number" id="firstRate" placeholder="26.0" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Second Rate (%):
                    </InputGroupAddon>
                    <Input type="number" id="secondRate" placeholder="24.0" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Third Rate (%):
                    </InputGroupAddon>
                    <Input type="number" id="thirdRate" placeholder="30.0" />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType="prepend">
                        Fourth Rate (%):
                    </InputGroupAddon>
                    <Input type="number" id="fourthRate" placeholder="20.0" />
                </InputGroup>
                <Button onClick={() => this.onCalculate()}>Calculate</Button>
                <Row>{this.state.output}</Row>
            </Container>
        )
    }
}

export default RCalculation;