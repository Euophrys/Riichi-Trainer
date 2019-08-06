import React from 'react';
import { ListGroupItem, Collapse, Row } from 'reactstrap';
import { withTranslation } from 'react-i18next';

class HistoryMessage extends React.Component {    
    /* PROPS
        data (HistoryData),
        verbose,
        concise,
        spoilers
    */
    constructor(props) {
        super(props);
        this.state = { collapsed: true };
    }

    componentDidMount() {
        this.setState({
            collapsed: false
        });
    }

    render() {
        let { t } = this.props;
        if(!this.props.data) return <ListGroupItem></ListGroupItem>;

        let message = this.props.data.getMessage(t, this.props.concise, this.props.verbose, this.props.spoilers);
        let messageRows = message.split("<br/>").map((message) => <Row>{message}</Row>)

        return (
            <ListGroupItem className={this.props.data.getClassName()}>
                <Collapse isOpen={!this.state.collapsed}>
                    {messageRows}
                    {this.props.data.hand ? <a className="tenhouLink" href={"http://tenhou.net/2/?q=" + this.props.data.hand} target="_blank" rel="noopener noreferrer">
                        {t("history.tenhouLinkText")}
                    </a> : ""}
                </Collapse>
            </ListGroupItem>
        );
    }
}

export default withTranslation()(HistoryMessage);