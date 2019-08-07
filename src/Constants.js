/** @readonly The tile counts if every tile is available. */
export const ALL_TILES_REMAINING = [
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4
];

/** @readonly Array of characters representing each suit. */
export const SUIT_CHARACTERS = ["m", "p", "s", "z"];

/** @readonly Array of indexes to show on the tiles. */
export const TILE_INDEXES = [
    5, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    5, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    5, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    " ", "E", "S", "W", "N", "W", "G", "R"
];

/** @readonly Array of ascii characters for each tile. */
export const ASCII_TILES = [
    "🀋", "🀇", "🀈", "🀉", "🀊", "🀋", "🀌", "🀍", "🀎", "🀏",
    "🀝", "🀙", "🀚", "🀛", "🀜", "🀝", "🀞", "🀟", "🀠", "🀡",
    "🀔", "🀐", "🀑", "🀒", "🀓", "🀔", "🀕", "🀖", "🀗", "🀘",
    "🀪", "🀀", "🀁", "🀂", "🀃", "🀆", "🀅", "🀄"
];

/** @readonly The localization keys for the player names. */
export const PLAYER_NAMES = [
    "trainer.playerNames.you", "trainer.playerNames.right", "trainer.playerNames.across", "trainer.playerNames.left"
];

/** @readonly The localization keys for the seat names. */
export const SEAT_NAMES = [
    "winds.east", "winds.south", "winds.west", "winds.north"
];

/** @readonly The localization keys for each safety rating explanation. */
export const SAFETY_RATING_EXPLANATIONS = [
    "analyzer.safetyExplanations.zero", "analyzer.safetyExplanations.one", "analyzer.safetyExplanations.two", "analyzer.safetyExplanations.three",
    "analyzer.safetyExplanations.four", "analyzer.safetyExplanations.five", "analyzer.safetyExplanations.six",
    "analyzer.safetyExplanations.seven", "analyzer.safetyExplanations.eight", "analyzer.safetyExplanations.nine",
    "analyzer.safetyExplanations.ten", "analyzer.safetyExplanations.eleven", "analyzer.safetyExplanations.twelve",
    "analyzer.safetyExplanations.thirteen", "analyzer.safetyExplanations.fourteen", "analyzer.safetyExplanations.fifteen"
];

/** @readonly The parameters to be given to the localization for round names for each round. */
export const ROUND_PARAMETERS = [
    {wind:'$t(winds.east)', number: 1},  {wind:'$t(winds.east)', number: 2},  {wind:'$t(winds.east)', number: 3},  {wind:'$t(winds.east)', number: 4},
    {wind:'$t(winds.south)', number: 1}, {wind:'$t(winds.south)', number: 2}, {wind:'$t(winds.south)', number: 3}, {wind:'$t(winds.south)', number: 4},
    {wind:'$t(winds.west)', number: 1},  {wind:'$t(winds.west)', number: 2},  {wind:'$t(winds.west)', number: 3},  {wind:'$t(winds.west)', number: 4},
    {wind:'$t(winds.north)', number: 1}, {wind:'$t(winds.north)', number: 2}, {wind:'$t(winds.north)', number: 3}, {wind:'$t(winds.north)', number: 4}
];

/** @readonly The han, fu, and payments for each score combination on ron, sorted from lowest score to highest. */
export const RON_SCORES = [
    {han: 1, fu: 30, nondealer: 1000, dealer: 1500}, {han: 1, fu: 40, nondealer: 1300, dealer: 2000}, {han: 2, fu: 25, nondealer: 1600, dealer: 2400},
    {han: 2, fu: 30, nondealer: 2000, dealer: 2900}, {han: 1, fu: 70, nondealer: 2300, dealer: 3400}, {han: 2, fu: 40, nondealer: 2600, dealer: 3900},
    {han: 1, fu: 90, nondealer: 2900, dealer: 4400}, {han: 3, fu: 25, nondealer: 3200, dealer: 4800}, {han: 1, fu: 110, nondealer: 3600, dealer: 5300},
    {han: 3, fu: 30, nondealer: 3900, dealer: 5800}, {han: 2, fu: 70, nondealer: 4500, dealer: 6800}, {han: 3, fu: 40, nondealer: 5200, dealer: 7700}, 
    {han: 2, fu: 90, nondealer: 5800, dealer: 8700}, {han: 4, fu: 25, nondealer: 6400, dealer: 9600}, {han: 2, fu: 110, nondealer: 7100, dealer: 10600},
    {han: 4, fu: 30, nondealer: 7700, dealer: 11600}, {han: 5, fu: 30, nondealer: 8000, dealer: 12000}, {han: 6, fu: 30, nondealer: 12000, dealer: 18000},
    {han: 8, fu: 30, nondealer: 16000, dealer: 24000}, {han: 11, fu: 30, nondealer: 24000, dealer: 36000}, {han: 13, fu: 30, nondealer: 32000, dealer: 48000}
];

/** @readonly The han, fu, and payments for each score combination on tsumo, sorted from lowest score to highest. */
export const TSUMO_SCORES = [
    {han: 1, fu: 30, nondealer: 300, dealer: 500}, {han: 2, fu: 20, nondealer: 400, dealer: 700}, {han: 1, fu: 50, nondealer: 400, dealer: 800},
    {han: 2, fu: 30, nondealer: 500, dealer: 1000}, {han: 1, fu: 70, nondealer: 600, dealer: 1200}, {han: 2, fu: 40, nondealer: 700, dealer: 1300},
    {han: 1, fu: 90, nondealer: 800, dealer: 1500}, {han: 3, fu: 25, nondealer: 800, dealer: 1600}, {han: 1, fu: 110, nondealer: 900, dealer: 1800},
    {han: 3, fu: 30, nondealer: 1000, dealer: 2000}, {han: 2, fu: 70, nondealer: 1200, dealer: 2300}, {han: 3, fu: 40, nondealer: 1300, dealer: 2600},
    {han: 2, fu: 90, nondealer: 1500, dealer: 2900}, {han: 4, fu: 25, nondealer: 1600, dealer: 3200}, {han: 2, fu: 110, nondealer: 1800, dealer: 3600},
    {han: 4, fu: 30, nondealer: 2000, dealer: 3900}, {han: 5, fu: 20, nondealer: 2000, dealer: 4000}, {han: 6, fu: 20, nondealer: 3000, dealer: 6000},
    {han: 8, fu: 20, nondealer: 4000, dealer: 8000}, {han: 11, fu: 20, nondealer: 6000, dealer: 12000}, {han: 13, fu: 20, nondealer: 8000, dealer: 16000}
];

/** @readonly The localization keys for each placement. */
export const PLACEMENTS = [
    "allLast.placements.fourth", "allLast.placements.third", "allLast.placements.second", "allLast.placements.first"
];