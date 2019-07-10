import React from 'react';
import { 
    Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle,
    Row, ListGroup, ListGroupItem, Col, Input,
    Card, CardBody, Button } from 'reactstrap';
import { parseRounds, parseRound, parseRoundNames, parsePlayers } from '../scripts/ParseReplay';
import Hand from '../components/Hand';
import { convertIndexesToTenhouTiles, convertTilesToAsciiSymbols } from '../scripts/TileConversions';
import { convertHandToTenhouString } from '../scripts/HandConversions';
import { withTranslation } from 'react-i18next';

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
        let { t } = this.props;
        if(document.getElementById('tenhouURL')) {
            let URL = document.getElementById('tenhouURL').value;
            if(URL !== "") {
                let gameRegex = /\/\?log=(.+?)&tw/;
                let match = gameRegex.exec(URL);

                if(match) {
                    URLfeedback = <a href={`http://e0.mjv.jp/0/log/?${match[1]}`} target="_blank" rel="noopener noreferrer">{t("analyzer.downloadInstructions")}</a>;
                } else {
                    URLfeedback = <div>{t("analyzer.invalidURL")}</div>;
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
        let { t } = this.props;
        let turns = parseRound(t, this.state.rounds[index], this.state.player);
        this.setState({
            turns: turns,
            currentRound: index,
            currentTurn: 0,
        });
    }

    onPlayerChoice(index) {
        let currentRound = Math.max(0, this.state.currentRound);
        let { t } = this.props;
        let turns = parseRound(t, this.state.rounds[currentRound], index);
        this.setState({
            turns: turns,
            player: index,
            currentTurn: 0,
            currentRound: currentRound,
        });
    }

    parseRound() {
        let { t } = this.props;
        let turns = parseRound(t, this.state.rounds[this.state.currentRound], this.state.player);
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
            message = <ListGroupItem className={currentTurn.className}>{currentTurn.message.map((row) => <Row>{row}</Row>)}</ListGroupItem>;
        }

        let calls = "";
        let {t} = this.props;

        for(let i = 0; currentTurn && i < currentTurn.calls.length; i++) {
            if(calls) calls += t("analyzer.callsSeparator");
            calls += `${convertTilesToAsciiSymbols(currentTurn.calls[i])} (${convertIndexesToTenhouTiles(currentTurn.calls[i])})`;
        }

        return (
            <Container>
                <Row>
                    <Card><CardBody>
                        {t("analyzer.instructions1")}<br/>
                        {t("analyzer.instructions2")}<br/>
                        {t("analyzer.instructions3")}<br/>
                        {t("analyzer.instructions4")}<br/><br/>
                        {t("analyzer.instructions5")}<br/>
                        {t("analyzer.instructions6")}<br/>
                        {t("analyzer.instructions7")}<br/><br/>
                        {t("analyzer.instructions8")}<br/>
                        {t("analyzer.instructions9")}
                    </CardBody></Card>
                </Row>
                <Row>
                    <Input id="tenhouURL" placeholder={t("analyzer.URLplaceholder")} onChange={this.onURLChanged}/> <br/>
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
                                {t("analyzer.roundSelect")}
                            </DropdownToggle>
                            <DropdownMenu>
                                {roundItems}
                            </DropdownMenu>
                            </Dropdown>
                        </Col>
                        <Col xs="6">
                            <Dropdown isOpen={this.state.playerDropdownOpen} toggle={this.togglePlayerDropdown}>
                            <DropdownToggle caret>
                                {t("analyzer.playerSelect")}
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
                                <Button color="primary" block={true} xs="6" disabled={this.state.currentTurn <= 0} onClick={() => this.onPreviousTurn()}>{t("analyzer.previousTurn")}</Button>
                            </Col>
                            <Col xs="4">
                                <Button color="primary" block={true} xs="6" disabled={this.state.currentTurn >= this.state.turns.length - 1} onClick={() => this.onNextTurn()}>{t("analyzer.nextTurn")}</Button>
                            </Col>
                            <Col xs="4">
                                <Button color="primary" block={true} xs="6" disabled={this.state.currentTurn >= this.state.turns.length - 1} onClick={() => this.onNextIssue()}>{t("analyzer.nextIssue")}</Button>
                            </Col>
                        </Row>
                        <br/>
                        <ListGroup>
                            <ListGroupItem>
                                <Row>{t("analyzer.turn", {round: roundNames[this.state.currentRound], turn: this.state.currentTurn + 1})}</Row>
                                <Row>{currentTurn.discards.length ? t("analyzer.discards", {symbols: convertTilesToAsciiSymbols(currentTurn.discards), tiles: convertIndexesToTenhouTiles(currentTurn.discards)}) : ""}</Row>
                                <Row>{calls.length > 0 ? t("analyzer.calls", {calls: calls}) : ""}</Row>
                            </ListGroupItem>
                            {message}
                            <ListGroupItem>
                                <a className="tenhouLink" href={"http://tenhou.net/2/?q=" + convertHandToTenhouString(currentTurn.hand)} target="_blank" rel="noopener noreferrer">
                                    {t("analyzer.tenhouLinkText")}
                                </a>
                            </ListGroupItem>
                        </ListGroup>
                    </React.Fragment>
                )}
            </Container>
        );
    }
}

export default withTranslation()(ReplayAnalysis);