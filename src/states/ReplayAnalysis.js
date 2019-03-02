import React from 'react';
import { Container } from 'reactstrap';

class ReplayAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: ""
        }

        this.onFileChanged = this.onFileChanged.bind(this);
    }

    onFileChanged(files) {
        this.setState({
            file: document.getElementById("fileInput").files[0]
        });
    }

    render() {
        return (
            <Container>
                <input type="file" id="fileInput" accept=".mjlog" onChange={this.onFileChanged} />
                <span>{this.state.file.name}</span>
            </Container>
        );
    }
}

export default ReplayAnalysis;