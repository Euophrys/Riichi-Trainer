export function evaluateBestDiscard(ukeire) {
    let bestUkeire = Math.max(...ukeire);
    let bests = [];

    for (let i = 1; i < ukeire.length; i++) {
        if (ukeire[i] === bestUkeire) {
            bests.push(i);
        }
    }

    if (!bests.length) return -1;
    if (bests.length === 1) return bests[0];

    if (bests.indexOf(32) > -1) return 32;
    if (bests.indexOf(33) > -1) return 33;
    if (bests.indexOf(34) > -1) return 34;
    if (bests.indexOf(35) > -1) return 35;
    if (bests.indexOf(36) > -1) return 36;
    if (bests.indexOf(37) > -1) return 37;
    if (bests.indexOf(31) > -1) return 31;

    for (let i = 1; i < 10; i += 8) {
        for (let j = 0; j < 3; j++) {
            let tile = j + i;

            if (bests.indexOf(tile) > -1) return tile;
        }
    }

    for (let i = 2; i < 10; i += 6) {
        for (let j = 0; j < 3; j++) {
            let tile = j + i;

            if (bests.indexOf(tile) > -1) return tile;
        }
    }

    return bests[Math.floor(Math.random() * bests.length)];
}