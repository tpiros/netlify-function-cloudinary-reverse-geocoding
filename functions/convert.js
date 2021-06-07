// Decimal Degrees = degrees + (minutes/60) + (seconds/3600)
// DD = d + (min/60) + (sec/3600)
// N (+), E (+), S (-), W (-)
const convert = (lat, lng) => {
  const latElements = lat.split(' ');
  let = decimalLat = (
    parseInt(latElements[0]) +
    parseInt(latElements[2]) / 60 +
    parseFloat(latElements[3]) / 3600
  ).toFixed(4);
  if (latElements.pop() === 'S') {
    decimalLat = decimalLat * -1;
  }

  const lngElements = lng.split(' ');
  let decimalLng = (
    parseInt(lngElements[0]) +
    parseInt(lngElements[2]) / 60 +
    parseFloat(lngElements[3]) / 3600
  ).toFixed(4);
  if (lngElements.pop() === 'W') {
    decimalLng = decimalLng * -1;
  }

  return `${decimalLat}, ${decimalLng}`;
};

module.exports = convert;
