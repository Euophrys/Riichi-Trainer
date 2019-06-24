import React from 'react';
import { Container, Row, Button } from 'reactstrap';
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

    onSouthFourClicked() {
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
                        <Button color="warning" xs="4" disabled={this.state.active === 1} onClick={()=>this.onAnalyzerClicked()}>Analyzer [BETA]</Button>
                        <Button xs="4" disabled={this.state.active === 4} onClick={()=>this.onSouthFourClicked()}>South Four Trainer</Button>
                        <Button xs="4" disabled={this.state.active === 3} onClick={()=>this.onExplorerClicked()}>Explorer</Button>
                        <Button xs="4" disabled={this.state.active === 2} onClick={()=>this.onUtilsClicked()}>Misc. Utils</Button>
                    </Row>
                </Container>
                {page}
            </React.Fragment>
        );
    }
}

export default MainMenu;