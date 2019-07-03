import React from 'react';
import { Container } from 'reactstrap';
import RandomGameState from '../components/utils/RandomGameState';
import ConvertHand from '../components/utils/ConvertHand';
import RCalculation from '../components/utils/RCalculation';

class UtilsState extends React.Component {
    render() {
        return (
            <Container>
                <h2 style={{"textAlign": "center"}}>Hand Conversion</h2>
                <ConvertHand/>
                <br/>
                <h2 style={{"textAlign": "center"}}>Random Game State Generator</h2>
                <RandomGameState/>
            </Container>
        );
    }
}

export default UtilsState;