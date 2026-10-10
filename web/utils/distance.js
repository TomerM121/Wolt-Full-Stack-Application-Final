function distance(location1, location2) {
    const dx = location1.latitude - location2.latitude;
    const dy = location1.longitude - location2.longitude;

    return Math.sqrt(dx * dx + dy * dy);
}

module.exports = { distance };