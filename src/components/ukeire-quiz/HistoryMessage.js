import React from 'react';
import { ListGroupItem, Collapse } from 'reactstrap';
import { getTileAsText } from '../../scripts/TileConversions';

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
        key,
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
        if(!this.props.data.hand) {
            if(!this.props.data.message) {
                return <ListGroupItem></ListGroupItem>
            }

            let className = "";
            if(this.props.data.message.indexOf("Error") > -1) {
                className = "bg-danger text-white";
            }

            return (
                <ListGroupItem key={this.props.key} className={className}>{this.props.data.message}</ListGroupItem>
            )
        }

        let message = "";
        if(this.props.concise) {
            message = this.getConciseMessage();
        } else {
            message = this.getVerboseMessage();
        }
        message += this.props.data.message || "";

        let tenhouLink = "http://tenhou.net/2/?q=" + this.props.data.hand;

        return (
            <ListGroupItem key={this.props.key} className={this.getClassName()}>
                <Collapse isOpen={!this.state.collapsed}>
                    {message}
                    <a className="tenhouLink" href={tenhouLink} target="_blank" rel="noopener noreferrer">
                        [Accepted Tiles]
                    </a>
                </Collapse>
            </ListGroupItem>
        );
    }

    getConciseMessage() {
        let result = `Discard: ${getTileAsText(this.props.data.chosenTile, this.props.verbose)} (`;

        if (this.props.data.chosenUkeire.value > 0 || this.props.data.shanten === 0) {
            result += `${this.props.data.chosenUkeire.value} tiles). `;
        }
        else {
            result += `lowered shanten). `
        }

        if (this.props.data.chosenUkeire.value < this.props.data.bestUkeire) {
            result += "Best: ";

            if (this.props.spoilers) {
                result += `${getTileAsText(this.props.data.bestTile, this.props.verbose)}, with `;
            }

            result += `${this.props.data.bestUkeire} tiles.`;
        }
        else {
            result += "That was the best choice!";
        }
        
        if (this.props.data.shanten <= 0 && this.props.data.handUkeire.value === 0) {
            result += " All of your winning tiles are in your hand, so you aren't tenpai yet.";
        }

        if (this.isFuriten()) {
            if (this.props.data.shanten <= 0) {
                result += " Furiten.";
            } else {
                result += " Be careful of future furiten.";
            }
        }
        
        if(this.props.data.shanten > 0) {
            if(this.props.data.drawnTile === -1) {
                result += " There are no tiles left in the wall. Better luck next time! ";
            } else {
                result += ` Draw: ${getTileAsText(this.props.data.drawnTile, this.props.verbose)}. `
            }
        }

        return result;
    }

    getVerboseMessage() {
        let result = `You chose to discard the ${getTileAsText(this.props.data.chosenTile, this.props.verbose)}, which `;

        if (this.props.data.chosenUkeire.value > 0 || this.props.data.shanten === 0) {
            result += `results in ${this.props.data.chosenUkeire.value} tiles that can improve the hand. `;
        }
        else {
            result += `lowers your shanten - you are now further from ready. `
        }

        if (this.props.data.chosenUkeire.value < this.props.data.bestUkeire) {
            result += "The most efficient tile to discard";

            if (this.props.spoilers) {
                result += `, the ${getTileAsText(this.props.data.bestTile, this.props.verbose)},`;
            }

            result += ` would have resulted in ${this.props.data.bestUkeire} tiles being able to improve your hand.`;
        }
        else {
            result += "That was the best choice. Good work!";
        }

        if (this.props.data.shanten <= 0 && this.props.data.handUkeire.value === 0) {
            result += " Your hand is ready, but all the winning tiles are in your hand. This doesn't count as ready in almost all rulesets, so you'll need to change your hand.";
        }

        if (this.isFuriten()) {
            if (this.props.data.shanten <= 0) {
                result += " You are in furiten. You cannot win this hand by ron, because you have a winning tile in your discards.";
            } else {
                result += " Be careful of future furiten. Some of the tiles that improve your hand are in your discards.";
            }
        }
        
        if(this.props.data.shanten > 0) {
            if(this.props.data.drawnTile === -1) {
                result += " There are no tiles left in the wall. Better luck next time! ";
            } else {
                result += ` You drew the ${getTileAsText(this.props.data.drawnTile, this.props.verbose)}. `;
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

export default HistoryMessage;