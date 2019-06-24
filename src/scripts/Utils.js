
export function randomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min) + min);
}

export function getRandomItem(array) {
    return array[randomInt(array.length)];
}

export function removeRandomItem(array) {
    return array.splice(randomInt(array.length), 1);
}

export function shuffleArray(array) {
    var currentIndex = array.length, tmp, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = randomInt(currentIndex);
      currentIndex -= 1;
  
      tmp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = tmp;
    }
  
    return array;
}

export function validateFu(fu, currentFu) {
    fu = Math.max(fu, 20);

    if (fu !== 25) {
        if (fu < currentFu) {
            fu = Math.floor(fu / 10) * 10;
        } else {
            fu = Math.ceil(fu / 10) * 10;
        }
    }

    fu = Math.min(fu, 130);

    return fu;
}