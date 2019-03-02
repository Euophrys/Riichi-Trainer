import React from 'react';
import { Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, ListGroup, ListGroupItem, Col, Button } from 'reactstrap';
import { parseRounds, parseRound, parseRoundNames, parsePlayers } from '../scripts/ParseReplay';

class ReplayAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileName: "",
            text: "",
            rounds: [],
            roundDropdownOpen: false,
            playerDropdownOpen: false,
            player: 0,
            messages: []
        }

        this.onFileChanged = this.onFileChanged.bind(this);
        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.toggleRoundDropdown = this.toggleRoundDropdown.bind(this);
        this.togglePlayerDropdown = this.togglePlayerDropdown.bind(this);
    }

    onFileChanged(files) {
        let file = document.getElementById("fileInput").files[0];
        
        let player = 0;
        let playerRegex = /tw=(\d{1})/;
        let match = playerRegex.exec(file.name);
        if(match) {
            player = parseInt(match[1]);
        }

        this.setState({
            fileName: file.name,
            player: player,
        });

        let reader = new FileReader();
        reader.onload = this.onFileLoaded;
        reader.readAsText(file);
    }

    onFileLoaded(e) {
        let replayText = e.target.result;
        let rounds = parseRounds(replayText);
        
        this.setState({
            text: e.target.result,
            rounds: rounds
        });
    }

    toggleRoundDropdown() {
        this.setState({
            roundDropdownOpen: !this.state.roundDropdownOpen
        });
    }

    togglePlayerDropdown() {
        this.setState({
            playerDropdownOpen: !this.state.playerDropdownOpen
        });
    }

    onRoundChoice(index) {
        let messages = parseRound(this.state.rounds[index], this.state.player);
        this.setState({
            messages: messages
        });
    }

    onPlayerChoice(index) {
        this.setState({
            player: index
        });
    }

    render() {
        let roundItems;
        let playerItems;

        if(this.state.rounds.length) {
            let roundNames = parseRoundNames(this.state.rounds);
            roundItems = roundNames.map((roundName, index) => {
                return <DropdownItem onClick={()=>this.onRoundChoice(index)}>{roundName}</DropdownItem>;
            });

            let playerNames = parsePlayers(this.state.text);
            playerItems = playerNames.map((player, index) => {
                return <DropdownItem onClick={()=>this.onPlayerChoice(index)}>{index}: {player.name}</DropdownItem>
            });
        }

        let messages = <ListGroupItem/>;

        if(this.state.messages.length) {
            messages = this.state.messages.map((message) => {
                return <ListGroupItem>{message}</ListGroupItem>;
            });
        }

        return (
            <Container>
                <Row>
                    Please rename your replay file to end with '.zip' instead of '.mjlog'. <br/>
                    Then, extract the contents and upload that. <br/>
                    I'll try to find a way to make this easier later. <br/>
                    Also, only 4-player replays are supported.
                </Row>
                <Row>
                    <input type="file" id="fileInput" onChange={this.onFileChanged} />
                </Row>
                <Row>
                    { !!this.state.fileName && <a href={`http://tenhou.net/3/?log=${this.state.fileName}`}>View on Tenhou</a> }
                </Row>
                { this.state.rounds.length && (
                    <Row>
                        <Col xs="6">
                            <Dropdown isOpen={this.state.roundDropdownOpen} toggle={this.toggleRoundDropdown}>
                            <DropdownToggle caret>
                                Select a Round
                            </DropdownToggle>
                            <DropdownMenu>
                                {roundItems}
                            </DropdownMenu>
                            </Dropdown>
                        </Col>
                        <Col xs="6">
                            <Dropdown isOpen={this.state.playerDropdownOpen} toggle={this.togglePlayerDropdown}>
                            <DropdownToggle caret>
                                Change Player
                            </DropdownToggle>
                            <DropdownMenu>
                                {playerItems}
                            </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                )}
                { this.state.messages.length && (
                    <Row>
                        <Col xs="12">
                            <ListGroup>
                                {messages}
                            </ListGroup>
                        </Col>
                    </Row>
                )}
            </Container>
        );
    }
}

export default ReplayAnalysis;