export const ALL_TILES_REMAINING = [
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4
];

export const ALL_SIMPLES_REMAINING = [
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    0, 0, 0, 0, 0, 0, 0, 0
];

export const PLAYER_NAMES = [
    "trainer.playerNames.you", "trainer.playerNames.right", "trainer.playerNames.across", "trainer.playerNames.left"
];

export const SEAT_NAMES = [
    "winds.east", "winds.south", "winds.west", "winds.north"
];

export const ROUND_NAMES = [
    {wind:'$t(winds.east)', number: 1},  {wind:'$t(winds.east)', number: 2},  {wind:'$t(winds.east)', number: 3},  {wind:'$t(winds.east)', number: 4},
    {wind:'$t(winds.south)', number: 1}, {wind:'$t(winds.south)', number: 2}, {wind:'$t(winds.south)', number: 3}, {wind:'$t(winds.south)', number: 4},
    {wind:'$t(winds.west)', number: 1},  {wind:'$t(winds.west)', number: 2},  {wind:'$t(winds.west)', number: 3},  {wind:'$t(winds.west)', number: 4},
    {wind:'$t(winds.north)', number: 1}, {wind:'$t(winds.north)', number: 2}, {wind:'$t(winds.north)', number: 3}, {wind:'$t(winds.north)', number: 4}
];

export const NON_DEALER_RON_SCORES = [
    {han: 1, fu: 30, value: 1000}, {han: 1, fu: 40, value: 1300}, {han: 1, fu: 50, value: 1600}, {han: 2, fu: 30, value: 2000},
    {han: 1, fu: 70, value: 2300}, {han: 2, fu: 40, value: 2600}, {han: 1, fu: 90, value: 2900}, {han: 3, fu: 25, value: 3200},
    {han: 1, fu: 110, value: 3600}, {han: 3, fu: 30, value: 3900}, {han: 2, fu: 70, value: 4500}, {han: 3, fu: 40, value: 5200},
    {han: 2, fu: 90, value: 5800}, {han: 4, fu: 25, value: 6400}, {han: 2, fu: 110, value: 7100}, {han: 4, fu: 30, value: 7700},
    {han: 5, fu: 20, value: 8000}, {han: 6, fu: 20, value: 12000}, {han: 8, fu: 20, value: 16000}, {han: 11, fu: 20, value: 24000}, {han: 13, fu: 20, value: 32000}
];

export const NON_DEALER_TSUMO_SCORES = [
    {han: 1, fu: 30, nondealer: 300, dealer: 500}, {han: 2, fu: 20, nondealer: 400, dealer: 700}, {han: 1, fu: 50, nondealer: 400, dealer: 800},
    {han: 2, fu: 30, nondealer: 500, dealer: 1000}, {han: 1, fu: 70, nondealer: 600, dealer: 1200}, {han: 2, fu: 40, nondealer: 700, dealer: 1300},
    {han: 1, fu: 90, nondealer: 800, dealer: 1500}, {han: 3, fu: 25, nondealer: 800, dealer: 1600}, {han: 1, fu: 110, nondealer: 900, dealer: 1800},
    {han: 3, fu: 30, nondealer: 1000, dealer: 2000}, {han: 2, fu: 70, nondealer: 1200, dealer: 2300}, {han: 3, fu: 40, nondealer: 1300, dealer: 2600},
    {han: 2, fu: 90, nondealer: 1500, dealer: 2900}, {han: 4, fu: 25, nondealer: 1600, dealer: 3200}, {han: 2, fu: 110, nondealer: 1800, dealer: 3600},
    {han: 4, fu: 30, nondealer: 2000, dealer: 3900}, {han: 5, fu: 20, nondealer: 2000, dealer: 4000}, {han: 6, fu: 20, nondealer: 3000, dealer: 6000},
    {han: 8, fu: 20, nondealer: 4000, dealer: 8000}, {han: 11, fu: 20, nondealer: 6000, dealer: 12000}, {han: 13, fu: 20, nondealer: 8000, dealer: 16000}
];

export const PLACEMENTS = [
    "allLast.placements.fourth", "allLast.placements.third", "allLast.placements.second", "allLast.placements.first"
];