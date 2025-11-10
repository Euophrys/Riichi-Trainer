import React from 'react';
import { Container, Row, Button, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import UkeireQuiz from "./UkeireQuiz";
import ReplayAnalysis from "./ReplayAnalysis";
import UtilsState from "./UtilsState";
import HandExplorer from "./HandExplorer";
import Shanten from './Shanten';
import SouthFourQuiz from './SouthFourQuiz';
import { withTranslation } from "react-i18next";
import DefenseState from './DefenseState';

const STATES = {
    UKEIRE: 0,
    REPLAY: 1,
    UTILS: 2,
    EXPLORER: 3,
    SOUTH_FOUR: 4,
    DEFENSE: 5,
    SHANTEN: 6,
};

class MainMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: 0,
            dropdownOpen: false
        }
    }

    onSetActivePage(index) {
        this.setState({
            active: index
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
        let page = <Row />;
        switch (this.state.active) {
            case STATES.UKEIRE:
                page = <UkeireQuiz />; break;
            case STATES.REPLAY:
                page = <ReplayAnalysis />; break;
            case STATES.UTILS:
                page = <UtilsState />; break;
            case STATES.EXPLORER:
                page = <HandExplorer />; break;
            case STATES.SOUTH_FOUR:
                page = <SouthFourQuiz />; break;
            case STATES.DEFENSE:
                page = <DefenseState />; break;
            case STATES.SHANTEN:
                page = <Shanten />; break;
            default:
                page = <UkeireQuiz />;
        }

        return (
            <React.Fragment>
                <Container className="mb-4">
                    <Row>
                        <Button color="success" xs="4" disabled={this.state.active === STATES.UKEIRE} onClick={() => this.onSetActivePage(STATES.UKEIRE)}>{t("menu.trainer")}</Button>
                        <Button xs="4" disabled={this.state.active === STATES.REPLAY} onClick={() => this.onSetActivePage(STATES.REPLAY)}>{t("menu.analyzer")}</Button>
                        <Button xs="4" disabled={this.state.active === STATES.SOUTH_FOUR} onClick={() => this.onSetActivePage(STATES.SOUTH_FOUR)}>{t("menu.allLast")}</Button>
                        <Button xs="4" disabled={this.state.active === STATES.DEFENSE} onClick={() => this.onSetActivePage(STATES.DEFENSE)}>{t("menu.defense")}</Button>
                        <Button xs="4" disabled={this.state.active === STATES.EXPLORER} onClick={() => this.onSetActivePage(STATES.EXPLORER)}>{t("menu.explorer")}</Button>
                        <Button xs="4" disabled={this.state.active === STATES.SHANTEN} onClick={() => this.onSetActivePage(STATES.SHANTEN)}>{t("menu.shanten")}</Button>
                        <Button xs="4" disabled={this.state.active === STATES.UTILS} onClick={() => this.onSetActivePage(STATES.UTILS)}>{t("menu.utils")}</Button>
                    </Row>
                    <Row>
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={() => this.toggleDropdown()}>
                            <DropdownToggle caret>
                                🌐 {t("menu.language")}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={() => this.changeLanguage("en")}>English</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("ja")}>日本語</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("ru")}>Русский</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("fr")}>Français</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("pl")}>polski</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("pt")}>Português Brasileiro</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("zh_CN")}>简体中文</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("ko")}>한국어</DropdownItem>
                                <DropdownItem onClick={() => this.changeLanguage("de")}>Deutsch</DropdownItem>
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
