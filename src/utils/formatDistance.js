/**
 * @description 当距离小于1000米 展示'xx m'，大于则展示'xx km'
 * @param {Number} distance 
 */
export  function formatDistance(distance) {
    if (distance === null) {
        return distance
    }
    if (isNaN(distance)) {
        distance = ''
    } else {
        if (distance < 1) {
            distance = distance.toFixed(2) * 1000 + 'm'
        } else {
            distance = distance.toFixed(2) + 'km'
        }
    }

    return distance
}