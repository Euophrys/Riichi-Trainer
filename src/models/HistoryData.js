export default class HistoryData {
    constructor(chosenTile = -1, chosenUkeire = -1, bestTile = -1, bestUkeire = -1, shanten = -1, hand = "", handUkeire = -1, discards = [], drawnTile = -1, message = "") {
        this.chosenTile = chosenTile;
        this.chosenUkeire = chosenUkeire;
        this.bestTile = bestTile;
        this.bestUkeire = bestUkeire;
        this.shanten = shanten;
        this.hand = hand;
        this.handUkeire = handUkeire;
        this.discards = discards;
        this.drawnTile = drawnTile;
        this.message = message;
    }
}