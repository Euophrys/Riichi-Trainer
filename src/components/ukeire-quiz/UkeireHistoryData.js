import { getTileAsText } from "../../scripts/TileConversions";
import HistoryData from "../../models/HistoryData";
import { CSS_CLASSES } from "../../Constants";

export default class UkeireHistoryData extends HistoryData {
    /** A history object for the ukeire trainer, which tells the efficiency of a given discard. */
    constructor(chosenTile = -1, chosenUkeire = -1, bestTile = -1, bestUkeire = undefined, shanten = -1, hand = "", handUkeire = -1, discards = [], drawnTile = -1, message = undefined) {
        super(message);
        this.chosenTile = chosenTile;
        this.chosenUkeire = chosenUkeire;
        this.bestTile = bestTile;
        this.bestUkeire = bestUkeire;
        this.shanten = shanten;
        this.hand = hand;
        this.handUkeire = handUkeire;
        this.discards = discards;
        this.drawnTile = drawnTile;
    }

    getMessage(t, concise, verbose, spoilers) {
        let mode = "verbose";
        if (concise) mode = "concise";

        let result = t(`history.${mode}.discard`, { tile: getTileAsText(t, this.chosenTile, verbose) });

        if (this.chosenUkeire.value > 0 || this.shanten === 0) {
            result += t(`history.${mode}.acceptance`, { count: this.chosenUkeire.value });
            result += t(`history.${mode}.tilesExpanded`, { tiles: this.chosenUkeire.tiles.map(tile => getTileAsText(t, tile, verbose)).join(", ") });
        }
        else {
            result += t(`history.${mode}.loweredShanten`)
        }


        if (this.chosenUkeire.value < this.bestUkeire.value) {
            result += t(`history.${mode}.optimal`);

            if (spoilers) {
                result += t(`history.${mode}.optimalSpoiler`, { tile: getTileAsText(t, this.bestTile, verbose), tiles: this.bestUkeire.tiles.map(tile => getTileAsText(t, tile, verbose)).join(", ") });
            }

            result += t(`history.${mode}.acceptance`, { count: this.bestUkeire.value });

            if (spoilers) {
                result += t(`history.${mode}.tilesExpanded`, { tiles: this.bestUkeire.tiles.map(tile => getTileAsText(t, tile, verbose)).join(", ") });
            }
        }
        else {
            result += t(`history.${mode}.best`);
        }

        if (this.shanten <= 0 && this.handUkeire.value === 0) {
            result += t(`history.${mode}.exceptionalNoten`);
        }

        if (this.isFuriten()) {
            if (this.shanten <= 0) {
                result += t(`history.${mode}.furiten`);
            } else {
                result += t(`history.${mode}.furitenWarning`);
            }
        }

        if (this.shanten > 0) {
            if (this.drawnTile === -1) {
                result += t(`history.${mode}.exhausted`);
            } else {
                result += t(`history.${mode}.draw`, { tile: getTileAsText(t, this.drawnTile, verbose) })
            }
        }

        result += super.getMessage(t);

        return result;
    }

    getClassName() {
        let className = "";

        if (this.chosenUkeire.value <= 0 && this.shanten > 0) {
            className = CSS_CLASSES.INCORRECT;
        }
        else if (this.bestUkeire.value === this.chosenUkeire.value) {
            className = CSS_CLASSES.CORRECT;
        }
        else {
            className = CSS_CLASSES.WARNING;
        }

        return className;
    }

    /** Returns whether the hand is in furiten, or might be later. */
    isFuriten() {
        return this.chosenUkeire.tiles.some(tile => this.discards.includes(tile));
    }
}