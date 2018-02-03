export const randomPick = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const mergeArrays = (arr1, arr2) => {
  if (Array.isArray(arr2)) {
    return [
      ...arr1,
      ...arr2,
    ];
  }
  return arr1;
};

export const delayExecution = async (func, minDelay = 500, maxDelay = 700) => {
  return new Promise((resolve) => {
    const multiplier = (maxDelay - minDelay) + 1;
    const time = Math.floor((Math.random() * multiplier) + minDelay);
    setTimeout(() => {
      resolve(func());
    }, time);
  });
};
