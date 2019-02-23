function calculateBasicPoints(han, fu, yakuman) {
    if (han <= 0) return 0;

    var basicPoints;

    if (yakuman > 0) {
        basicPoints = 8000 * yakuman;
    }
    else if (han < 5) {
        basicPoints = Math.min(fu * Math.pow(2, han + 2), 2000);
    }
    else if (han === 5) {
        basicPoints = 2000;
    }
    else if (han < 8) {
        basicPoints = 3000;
    }
    else if (han < 11) {
        basicPoints = 4000;
    }
    else if (han < 13) {
        basicPoints = 6000;
    }
    else {
        // Counted yakuman
        basicPoints = 8000;
    }

    return basicPoints;
}

export default function getPointsString(han = 1, fu = 20, dealer = false, tsumo = true, yakuman = 0) {
    let basicPoints = calculateBasicPoints(han, fu, yakuman);
    console.log("Han: " + han + " Fu: " + fu);
    if (tsumo) {
        if (dealer) {
            return roundPoints(basicPoints * 2);
        }
        else {
            return roundPoints(basicPoints) + "/" + roundPoints(basicPoints * 2);
        }
    }
    else {
        if (dealer) {
            return roundPoints(basicPoints * 6);
        }
        else {
            return roundPoints(basicPoints * 4);
        }
    }
}

function roundPoints(points) {
    return Math.ceil(points / 100) * 100;
}