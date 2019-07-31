import React from 'react';
import { ListGroupItem, Collapse } from 'reactstrap';
import { getTileAsText } from '../../scripts/TileConversions';
import { withTranslation } from 'react-i18next';

class SafetyHistoryMessage extends React.Component {    
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
        
        if(!this.props.data.hand) {
            if(!this.props.data.message) {
                return <ListGroupItem></ListGroupItem>
            }

            let className = "";
            if(this.props.data.message.key.indexOf("error") > -1) {
                className = "bg-danger text-white";
            }

            return (
                <ListGroupItem className={className}>{this.props.data.message.generateString(t)}</ListGroupItem>
            )
        }

        let message = this.getMessage(t, this.props.concise);
        if(typeof this.props.data.message === "object") {
            message += this.props.data.message.generateString(t);
        }

        return (
            <ListGroupItem className={this.getClassName()}>
                <Collapse isOpen={!this.state.collapsed}>
                    {message}
                </Collapse>
            </ListGroupItem>
        );
    }

    getMessage(t, concise) {
        return "";
    }

    getClassName() {
        let className = "";

        if (this.props.data.chosenSafety === this.props.data.bestSafety) {
            className = "bg-success text-white";
        }
        else if (this.props.data.chosenSafety >= this.props.data.bestSafety - 2) {
            className = "bg-danger text-white";
        }
        else {
            className = "bg-warning";
        }

        return className;
    }

    isFuriten() {
        return this.props.data.chosenUkeire.tiles.some(tile => this.props.data.discards.includes(tile));
    }
}

export default withTranslation()(SafetyHistoryMessage);