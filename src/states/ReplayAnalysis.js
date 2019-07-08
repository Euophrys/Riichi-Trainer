import React from 'react';
import { 
    Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Row, ListGroup, ListGroupItem, Col, Input,
    Card, CardBody, Button } from 'reactstrap';
import { parseRounds, parseRound, parseRoundNames, parsePlayers } from '../scripts/ParseReplay';
import Hand from '../components/Hand';
import { convertIndexesToTenhouTiles, convertTilesToAsciiSymbols } from '../scripts/TileConversions';
import { convertHandToTenhouString } from '../scripts/HandConversions';

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
            currentRound: -1,
            turns: [],
            URLfeedback: "",
            currentTurn: 0,
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
                    URLfeedback = <a href={`http://e0.mjv.jp/0/log/?${match[1]}`} target="_blank" rel="noopener noreferrer">Right click this link and choose Save As!</a>;
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
        let turns = parseRound(this.state.rounds[index], this.state.player);
        this.setState({
            turns: turns,
            currentRound: index,
            currentTurn: 0,
        });
    }

    onPlayerChoice(index) {
        let currentRound = Math.max(0, this.state.currentRound);
        let turns = parseRound(this.state.rounds[currentRound], index);
        this.setState({
            turns: turns,
            player: index,
            currentTurn: 0,
            currentRound: currentRound,
        });
    }

    parseRound() {
        let turns = parseRound(this.state.rounds[this.state.currentRound], this.state.player);
        this.setState({
            turns: turns
        });
    }

    onNextTurn() {
        if(this.state.currentTurn < this.state.turns.length - 1) {
            this.setState({currentTurn: this.state.currentTurn + 1});
        }
    }

    onPreviousTurn() {
        if(this.state.currentTurn > 0) {
            this.setState({currentTurn: this.state.currentTurn - 1});
        }
    }

    onNextIssue() {
        if(this.state.currentTurn >= this.state.turns.length - 1) return;
        let currentTurn = this.state.currentTurn;

        while(currentTurn < this.state.turns.length - 1) {
            currentTurn++;

            if(this.state.turns[currentTurn].className !== "bg-success text-white") {
                break;
            }
        }
        
        this.setState({currentTurn: currentTurn});
    }

    render() {
        let roundItems;
        let playerItems;
        let roundNames = parseRoundNames(this.state.rounds);

        if(this.state.rounds.length) {
            roundItems = roundNames.map((roundName, index) => {
                return <DropdownItem disabled={index === this.state.currentRound} onClick={()=>this.onRoundChoice(index)}>{roundName}</DropdownItem>;
            });

            let PLAYER_NAMES = parsePlayers(this.state.text);
            playerItems = PLAYER_NAMES.map((player, index) => {
                return <DropdownItem disabled={index === this.state.player} onClick={()=>this.onPlayerChoice(index)}>{index}: {player.name}</DropdownItem>
            });
        }

        let message = <ListGroupItem/>;
        let currentTurn = this.state.turns[this.state.currentTurn];

        if(this.state.turns.length) {
            message = <ListGroupItem className={currentTurn.className}>{currentTurn.message.split('|').map((row) => <Row>{row}</Row>)}</ListGroupItem>;
        }

        let calls = "";

        for(let i = 0; currentTurn && i < currentTurn.calls.length; i++) {
            if(calls) calls += ", ";
            calls += `${convertTilesToAsciiSymbols(currentTurn.calls[i])} (${convertIndexesToTenhouTiles(currentTurn.calls[i])})`;
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
                        You can also just upload replay XML files directly if you have a program that fetches them for you.<br/>
                        <br/>
                        The disclaimer from the efficiency trainer applies here as well.<br/>
                        For safety ratings, higher is better. 1 is the worst, and 15 is the best.
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
                { this.state.turns.length && (
                    <React.Fragment>
                        <br/>
                        <Hand tiles={currentTurn.hand} lastDraw={currentTurn.draw}/>
                        <br/>
                        <Row>
                            <Col xs="4">
                                <Button color="primary" block={true} xs="6" disabled={this.state.currentTurn <= 0} onClick={() => this.onPreviousTurn()}>Previous Turn</Button>
                            </Col>
                            <Col xs="4">
                                <Button color="primary" block={true} xs="6" disabled={this.state.currentTurn >= this.state.turns.length - 1} onClick={() => this.onNextTurn()}>Next Turn</Button>
                            </Col>
                            <Col xs="4">
                                <Button color="primary" block={true} xs="6" disabled={this.state.currentTurn >= this.state.turns.length - 1} onClick={() => this.onNextIssue()}>Next Issue</Button>
                            </Col>
                        </Row>
                        <br/>
                        <ListGroup>
                            <ListGroupItem>
                                <Row>{roundNames[this.state.currentRound]}, Turn {this.state.currentTurn + 1}</Row>
                                <Row>{currentTurn.discards.length ? `Tiles In Your Discards: ${convertTilesToAsciiSymbols(currentTurn.discards)} (${convertIndexesToTenhouTiles(currentTurn.discards)})` : ""}</Row>
                                <Row>{calls.length > 0 ? `Your Calls: ${calls}` : ""}</Row>
                            </ListGroupItem>
                            {message}
                            <ListGroupItem>
                                <a className="tenhouLink" href={"http://tenhou.net/2/?q=" + convertHandToTenhouString(currentTurn.hand)} target="_blank" rel="noopener noreferrer">
                                    [Tenhou Ukeire Analysis]
                                </a>
                            </ListGroupItem>
                        </ListGroup>
                    </React.Fragment>
                )}
            </Container>
        );
    }
}

export default ReplayAnalysis;