import React from 'react';
import { Container, Row, Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import UkeireQuiz from "./UkeireQuiz";
import ReplayAnalysis from "./ReplayAnalysis";
import UtilsState from "./UtilsState";
import HandExplorer from "./HandExplorer";
import SouthFourQuiz from './SouthFourQuiz';
import { withTranslation } from "react-i18next";

class MainMenu extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            active: 0,
            dropdownOpen: false
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

    onUtilsClicked() {
        this.setState({
            active: 2
        });
    }

    onExplorerClicked() {
        this.setState({
            active: 3
        });
    }

    onAllLastClicked() {
        this.setState({
            active: 4
        });
    }

    toggleDropdown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    changeLanguage(newLanguage) {
        let { i18n } = this.props;
        i18n.changeLanguage(newLanguage);
    }

    render() {
        let { t } = this.props;
        let page = <Row/>;
        switch(this.state.active) {
            case 0:
                page = <UkeireQuiz/>; break;
            case 1:
                page = <ReplayAnalysis/>; break;
            case 2:
                page = <UtilsState/>; break;
            case 3:
                page = <HandExplorer/>; break;
            case 4:
                page = <SouthFourQuiz/>; break;
            default:
                page = <UkeireQuiz/>;
        }

        return (
            <React.Fragment>
                <Container className="mb-4">
                    <Row>
                        <Button color="success" xs="4" disabled={this.state.active === 0} onClick={()=>this.onTrainerClicked()}>{t("menu.trainer")}</Button>
                        <Button xs="4" disabled={this.state.active === 1} onClick={()=>this.onAnalyzerClicked()}>{t("menu.analyzer")}</Button>
                        <Button xs="4" disabled={this.state.active === 4} onClick={()=>this.onAllLastClicked()}>{t("menu.allLast")}</Button>
                        <Button xs="4" disabled={this.state.active === 3} onClick={()=>this.onExplorerClicked()}>{t("menu.explorer")}</Button>
                        <Button xs="4" disabled={this.state.active === 2} onClick={()=>this.onUtilsClicked()}>{t("menu.utils")}</Button>
                    </Row>
                    <Row>
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggleDropdown()}>
                            <DropdownToggle caret>
                                🌐 {t("menu.language")}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => this.changeLanguage("en")}>English</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("jp")}>日本語</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Row>
                </Container>
                {page}
                <Container className="mt-4">
                    <Row className="mt-4">
                        <Col xs="12"><span>{t("credits.label")}</span></Col>
                        <Col xs="12"><span>{t("credits.tilesPreLink")} <a href="https://github.com/FluffyStuff/riichi-mahjong-tiles">{t("credits.tilesLinkText")}</a>{t("credits.tilesPostLink")}<a href="https://creativecommons.org/licenses/by/4.0/">{t("credits.ccLinkText")}</a></span></Col>
                        <Col xs="12"><span>{t("credits.shantenPreLink")}<a href="http://cmj3.web.fc2.com/#syanten">{t("credits.shantenLinkText")}</a>{t("credits.shantenPostLink")}</span></Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

export default withTranslation()(MainMenu);