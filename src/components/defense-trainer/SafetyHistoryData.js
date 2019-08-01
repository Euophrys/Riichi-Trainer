import { getTileAsText } from '../../scripts/TileConversions';
import { SAFETY_RATING_EXPLANATIONS } from '../../Constants';
import HistoryData from '../../models/HistoryData';

export default class SafetyHistoryData extends HistoryData {
    constructor(chosenTile = -1, chosenSafety = -1, bestTile = -1, bestSafety = -1, drawnTile = -1, message = undefined) {
        super(message);
        this.chosenTile = chosenTile;
        this.chosenSafety = chosenSafety;
        this.bestTile = bestTile;
        this.bestSafety = bestSafety;
        this.drawnTile = drawnTile;
    }

    getMessage(t, concise, verbose, spoilers) {
        let result = t(`history.concise.discard`, {tile: getTileAsText(t, this.chosenTile, verbose)});

        result += ". ";

        result += t("analyzer.chosenSafety", {
            tile: getTileAsText(t, this.chosenTile, verbose),
            rating: this.chosenSafety,
            explanation: t(SAFETY_RATING_EXPLANATIONS[Math.floor(this.chosenSafety)])
        });

        if(this.chosenSafety === this.bestSafety) {
            result += t("analyzer.correctSafety");
        } else {
            result += t("analyzer.bestSafety", {
                tile: getTileAsText(t, this.bestTile, verbose),
                rating: this.bestSafety,
                explanation: t(SAFETY_RATING_EXPLANATIONS[Math.floor(this.bestSafety)])
            });
        }

        if(this.drawnTile >= 0) {
            result += t("history.verbose.draw", {tile: getTileAsText(t, this.drawnTile, verbose)});
        }
        
        result += super.getMessage(t);
        return result;
    }

    getClassName() {
        let className = "";

        if (this.chosenSafety === this.bestSafety) {
            className = "bg-success text-white";
        }
        else if (this.chosenSafety >= this.bestSafety - 3) {
            className = "bg-warning";
        }
        else {
            className = "bg-danger text-white";
        }

        return className;
    }
}