import React from 'react';
import { 
    Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Row, ListGroup, ListGroupItem, Col, Input,
    Card, CardBody } from 'reactstrap';
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
            currentRound: 0,
            messages: [],
            URLfeedback: ""
        }

        this.onURLChanged = this.onURLChanged.bind(this);
        this.onFileChanged = this.onFileChanged.bind(this);
        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.toggleRoundDropdown = this.toggleRoundDropdown.bind(this);
        this.togglePlayerDropdown = this.togglePlayerDropdown.bind(this);
    }

    onURLChanged() {
        let URLfeedback = <div/>
        if(document.getElementById('tenhouURL')) {
            let URL = document.getElementById('tenhouURL').value;
            if(URL !== "") {
                let gameRegex = /\/\?log=(.+?)&tw/;
                let match = gameRegex.exec(URL);

                if(match) {
                    URLfeedback = <a href={`http://e0.mjv.jp/0/log/?${match[1]}`}>Right click this link and choose Save As!</a>;
                } else {
                    URLfeedback = <div>Invalid URL</div>;
                }
            }
        }

        this.setState({
            URLfeedback: URLfeedback
        });
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
            messages: messages,
            currentRound: index
        });
    }

    onPlayerChoice(index) {
        let messages = parseRound(this.state.rounds[this.state.currentRound], index);
        this.setState({
            messages: messages,
            player: index
        });
    }

    parseRound() {
        let messages = parseRound(this.state.rounds[this.state.currentRound], this.state.player);
        this.setState({
            messages: messages
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
                let rows = message.split('|').map((row) => <Row>{row}</Row>)
                return <ListGroupItem>{rows}</ListGroupItem>;
            });
        }

        return (
            <Container>
                <Row>
                    <Card><CardBody>
                        Instructions:<br/>
                        Paste the URL for your replay into the text box.<br/>
                        Then, right click the link that appears and choose "Save As" or "Save Link As".<br/>
                        Finally, click "Browse..." and upload the file you saved.<br/><br/>
                        Alternatively, if you have a mjlog file on your computer, you can rename it to end in .zip.<br/>
                        Then, upload the file contained within that zip.<br/>
                        You can also just upload replay XML files directly if you have a program that fetches them for you.
                    </CardBody></Card>
                </Row>
                <Row>
                    <Input id="tenhouURL" placeholder="Tenhou Replay URL" onChange={this.onURLChanged}/> <br/>
                    {this.state.URLfeedback}
                </Row>
                <Row>
                    <Input type="file" id="fileInput" onChange={this.onFileChanged} />
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