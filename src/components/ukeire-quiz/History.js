import React from 'react';
import { ListGroup, Col, Collapse, Button } from 'reactstrap';
import HistoryMessage from './HistoryMessage';
import { withTranslation } from 'react-i18next';

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
        let history = this.props.history.map((historyObject, index) => {
            return (
                <HistoryMessage
                    key={index - this.props.history.length}
                    concise={this.props.concise}
                    data={historyObject}
                    spoilers={this.props.spoilers}
                    verbose={this.props.verbose}
                />
            );
        });

        let { t } = this.props;

        return (
            <Col xs="12" sm={this.state.collapsed ? "12" : ""}>
                <Button className="btn-block bg-light" color="basic" onClick={this.toggle}>{t("history.label")}</Button>
                <Collapse isOpen={!this.state.collapsed}>
                    <ListGroup>
                        {history}
                    </ListGroup>
                </Collapse>
            </Col>
        );
    }
}

export default withTranslation()(History);