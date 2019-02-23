import React from 'react';
import { ListGroup, ListGroupItem, Col, Collapse, Button } from 'reactstrap';

class History extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = { collapsed: false };
    }

    toggle() {
        this.setState({ collapsed: !this.state.collapsed });
    }

    render() {
        let history = this.props.history;
        history = history.map((historyObject, index) => {
            let text = historyObject.feedback;
            let className = "";

            if (text.indexOf("shanten") >= 0 || text.indexOf("Error") >= 0) {
                className = "bg-danger text-white";
            }
            else if (text.indexOf("best choice") >= 0) {
                className = "bg-success text-white";
            }
            else if (text.indexOf("tiles.") >= 0 || text.indexOf("most efficient") >= 0) {
                className = "bg-warning";
            }

            if (index === 0) {
                className += " recentHistory";
            }

            let tenhouLink = "http://tenhou.net/2/?q=" + historyObject.hand;
            return (
                <ListGroupItem key={index} className={className}>
                    {text}
                    {historyObject.hand !== "" && (<a className="tenhouLink" href={tenhouLink} target="_blank" rel="noopener noreferrer">
                        [Accepted Tiles]
                    </a>)}
                </ListGroupItem>
            );
        });

        return (
            <Col xs="12" sm={this.state.collapsed ? "12" : ""}>
                <Button className="btn-block bg-light" color="basic" onClick={this.toggle}>Hand History</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <ListGroup>
                        {history}
                    </ListGroup>
                </Collapse>
            </Col>
        );
    }
}

export default History;