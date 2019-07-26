import React from 'react';
import { ListGroupItem, Collapse } from 'reactstrap';
import { getTileAsText } from '../../scripts/TileConversions';
import { withTranslation } from 'react-i18next';

class HistoryMessage extends React.Component {    
    /* PROPS
        data {
            chosenTile,
            chosenUkeire.value,
            bestTile,
            bestUkeire,
            shanten,
            hand,
            handUkeire,
            drawnTile,
            message
        },
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

        let tenhouLink = "http://tenhou.net/2/?q=" + this.props.data.hand;

        return (
            <ListGroupItem className={this.getClassName()}>
                <Collapse isOpen={!this.state.collapsed}>
                    {message}
                    <a className="tenhouLink" href={tenhouLink} target="_blank" rel="noopener noreferrer">
                        {t("history.tenhouLinkText")}
                    </a>
                </Collapse>
            </ListGroupItem>
        );
    }

    getMessage(t, concise) {
        let mode = "verbose";
        if(concise) mode = "concise";

        let result = t(`history.${mode}.discard`, {tile: getTileAsText(t, this.props.data.chosenTile, this.props.verbose)});

        if (this.props.data.chosenUkeire.value > 0 || this.props.data.shanten === 0) {
            result += t(`history.${mode}.acceptance`, {count: this.props.data.chosenUkeire.value});
        }
        else {
            result += t(`history.${mode}.loweredShanten`)
        }

        if (this.props.data.chosenUkeire.value < this.props.data.bestUkeire) {
            result += t(`history.${mode}.optimal`);

            if (this.props.spoilers) {
                result += t(`history.${mode}.optimalSpoiler`, {tile: getTileAsText(t, this.props.data.bestTile, this.props.verbose)});
            }

            result += t(`history.${mode}.acceptance`, {count: this.props.data.bestUkeire});
        }
        else {
            result += t(`history.${mode}.best`);
        }
        
        if (this.props.data.shanten <= 0 && this.props.data.handUkeire.value === 0) {
            result += t(`history.${mode}.exceptionalNoten`);
        }

        if (this.isFuriten()) {
            if (this.props.data.shanten <= 0) {
                result += t(`history.${mode}.furiten`);
            } else {
                result += t(`history.${mode}.furitenWarning`);
            }
        }
        
        if(this.props.data.shanten > 0) {
            if(this.props.data.drawnTile === -1) {
                result += t(`history.${mode}.exhausted`);
            } else {
                result += t(`history.${mode}.draw`, {tile: getTileAsText(t, this.props.data.drawnTile, this.props.verbose)})
            }
        }

        return result;
    }

    getClassName() {
        let className = "";

        if (this.props.data.chosenUkeire.value <= 0 && this.props.data.shanten > 0) {
            className = "bg-danger text-white";
        }
        else if (this.props.data.bestUkeire === this.props.data.chosenUkeire.value) {
            className = "bg-success text-white";
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

export default withTranslation()(HistoryMessage);