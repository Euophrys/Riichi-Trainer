import React from 'react';
import { Container, Row, Button, Col } from 'reactstrap';
import UkeireQuiz from "./UkeireQuiz";
import ReplayAnalysis from "./ReplayAnalysis";
import UtilsState from "./UtilsState";
import HandExplorer from "./HandExplorer";
import SouthFourQuiz from './SouthFourQuiz';

class MainMenu extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            active: 0
        }
    }

    onTrainerClicked() {
        this.setState({
            active: 0
        });
    }
    
    onAnalyzerClicked() {
        this.setState({
            active: 1
        });
    }

    onUtilsClicked() {
        this.setState({
            active: 2
        });
    }

    onExplorerClicked() {
        this.setState({
            active: 3
        });
    }

    onAllLastClicked() {
        this.setState({
            active: 4
        });
    }

    render() {
        let page = <Row/>;
        switch(this.state.active) {
            case 0:
                page = <UkeireQuiz/>; break;
            case 1:
                page = <ReplayAnalysis/>; break;
            case 2:
                page = <UtilsState/>; break;
            case 3:
                page = <HandExplorer/>; break;
            case 4:
                page = <SouthFourQuiz/>; break;
            default:
                page = <UkeireQuiz/>;
        }

        return (
            <React.Fragment>
                <Container className="mb-4">
                    <Row>
                        <Button color="success" xs="4" disabled={this.state.active === 0} onClick={()=>this.onTrainerClicked()}>Trainer</Button>
                        <Button xs="4" disabled={this.state.active === 1} onClick={()=>this.onAnalyzerClicked()}>Analyzer</Button>
                        <Button xs="4" disabled={this.state.active === 4} onClick={()=>this.onAllLastClicked()}>All Last Trainer</Button>
                        <Button xs="4" disabled={this.state.active === 3} onClick={()=>this.onExplorerClicked()}>Explorer</Button>
                        <Button xs="4" disabled={this.state.active === 2} onClick={()=>this.onUtilsClicked()}>Misc. Utils</Button>
                    </Row>
                </Container>
                {page}
                <Container className="mt-4">
                    <Row className="mt-4">
                        <Col xs="12"><span>Credits</span></Col>
                        <Col xs="12"><span>Tile images combined from <a href="https://github.com/FluffyStuff/riichi-mahjong-tiles">riichi-mahjong-tiles by FluffyStuff on Github</a>, licensed under the <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License.</a></span></Col>
                        <Col xs="12"><span>Shanten calculation algorithm adapted from <a href="http://cmj3.web.fc2.com/#syanten">this C program collection.</a></span></Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

export default MainMenu;