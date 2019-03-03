import React from 'react';
import { Container, Row, Button } from 'reactstrap';
import UkeireQuiz from "./UkeireQuiz";
import HandExplorer from "./HandExplorer";
import ReplayAnalysis from "./ReplayAnalysis";

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

    render() {
        let page = <Row/>;
        switch(this.state.active) {
            case 0:
                page = <UkeireQuiz/>; break;
            case 1:
                page = <ReplayAnalysis/>; break;
        }

        return (
            <React.Fragment>
                <Container className="mb-4">
                    <Row>
                        <Button xs="4" disabled={this.state.active === 0} onClick={()=>this.onTrainerClicked()}>Trainer</Button>
                        <Button xs="4" disabled={this.state.active === 1} onClick={()=>this.onAnalyzerClicked()}>Analyzer [BETA]</Button>
                    </Row>
                </Container>
                {page}
            </React.Fragment>
        );
    }
}

export default MainMenu;