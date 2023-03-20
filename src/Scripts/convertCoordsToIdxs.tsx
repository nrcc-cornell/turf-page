const convertCoordsToIdxs = (
  lngLatArr: [number, number],
  coordArrs: { lats: number[], lons: number[] }
) => {
  const lng = lngLatArr[0];
  const lat = lngLatArr[1];

  // find grid index in lon direction
  const gridLonsLength = coordArrs['lons'].length;
  let idxLng = null;
  for (let idx = 0; idx < gridLonsLength - 1; idx++) {
    if (lng >= coordArrs['lons'][idx] && lng < coordArrs['lons'][idx + 1]) {
      idxLng = idx;
      break;
    }
  }

  // find grid index in lat direction
  const gridLatsLength = coordArrs['lats'].length;
  let idxLat = null;
  for (let idx2 = 0; idx2 < gridLatsLength - 1; idx2++) {
    if (lat <= coordArrs['lats'][idx2] && lat > coordArrs['lats'][idx2 + 1]) {
      idxLat = idx2;
      break;
    }
  }

  if (idxLat === null) throw 'No matching latitude found';
  if (idxLng === null) throw 'No matching longitude found';
  return { idxLat, idxLng };
};

export default convertCoordsToIdxs;