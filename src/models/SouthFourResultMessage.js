import React from "react";
import { Container, Row } from "reactstrap";
import { PLACEMENTS, SEAT_NAMES } from "../Constants";

export default class SouthFourResultMessage {
    constructor() {
        this.playerSeats = [];
        this.scores = [];
        this.feedback = "";
        this.placement = 0;
        this.requiredScore = {han: 1, fu: 20};
    }

    generateJSX(t, showDifferences) {
        let feedback = t(this.feedback, {placement: t(PLACEMENTS[this.placement])});

        return (
            <Container>
                <Row>{feedback}&nbsp;<span>{t("allLast.score", {han: this.requiredScore.han, fu: this.requiredScore.fu})}</span></Row>
                <Row>{t("allLast.results")}</Row>
                <Row>{t(SEAT_NAMES[this.playerSeats[0]]) + ": " + this.scores[0]} {showDifferences ? `(${t("allLast.you")})` : ""}</Row>
                <Row>{t(SEAT_NAMES[this.playerSeats[1]]) + ": " + this.scores[1]} {showDifferences ? `(${this.scores[1] - this.scores[0]})` : ""}</Row>
                <Row>{t(SEAT_NAMES[this.playerSeats[2]]) + ": " + this.scores[2]} {showDifferences ? `(${this.scores[2] - this.scores[0]})` : ""}</Row>
                <Row>{t(SEAT_NAMES[this.playerSeats[3]]) + ": " + this.scores[3]} {showDifferences ? `(${this.scores[3] - this.scores[0]})` : ""}</Row>
            </Container>
        );
    }
}