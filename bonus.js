var findKthPositive = function(arr, k) {
    let count = 0;
    let num = 0;
    while (count < k) {
        num++;
        if (!arr.includes(num)) {
            count++;
        }
    }
    return num;
};
