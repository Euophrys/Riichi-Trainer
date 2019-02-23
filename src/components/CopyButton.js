import React from 'react';
import { Button, Col } from 'reactstrap';
import { convertHandToTenhouString } from '../scripts/HandConversions';

class CopyButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lastCopy: "Never copied."
        }
    }

    onClick() {
        const el = document.createElement('textarea');
        el.value = convertHandToTenhouString(this.props.hand);
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        const selected =
            document.getSelection().rangeCount > 0
                ? document.getSelection().getRangeAt(0)
                : false;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        if (selected) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(selected);
        }

        this.setState({
            lastCopy: convertHandToTenhouString(this.props.hand)
        });
    }

    render() {
        let hasCopied = false;
        if (this.props.hand) {
            hasCopied = this.state.lastCopy === convertHandToTenhouString(this.props.hand);
        }

        return (
            <Col xs="6" sm="3" md="3" lg="2">
                <Button className="btn-block" color={hasCopied ? "info" : "primary"} onClick={() => this.onClick()}>{hasCopied ? "Copied!" : "Copy Hand"}</Button>
            </Col>
        );
    }
}

export default CopyButton;