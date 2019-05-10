export function randomInt(max, min = 0) {
    return Math.floor(Math.random() * max + min);
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