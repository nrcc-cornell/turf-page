import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { getFromProxy } from '../Scripts/proxy';

export type RunoffCoords = {
  lats: number[];
  lons: number[];
};

export type CoordsIdxObj = {
  idxLat: number;
  idxLng: number;
}
type LngLatArr = [number, number];

const convertCoordsToIdxs = (
  lngLatArr: LngLatArr,
  coordArrs: RunoffCoords
): CoordsIdxObj => {
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

export default function useRunoffApi(coords: LngLatArr) {
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [coordsIdxs, setCoordsIdxs] = useState<CoordsIdxObj | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const results = await getFromProxy<RunoffCoords>(
        { dateStr: format(new Date(), 'yyyyMMdd') },
        'coordinates'
      );
      setCoordArrs(results);
    })();
  }, []);

  useEffect(() => {
    if (coordArrs) {
      setIsLoading(true);
      let newCoordsIdxs;
      try {
        newCoordsIdxs = convertCoordsToIdxs(coords, coordArrs);
      } catch {
        newCoordsIdxs = null;
      }
      setCoordsIdxs(newCoordsIdxs);
      setIsLoading(false);
    }
  }, [coords, coordArrs]);
  
  return {
    isLoadingCoords: isLoading,
    coordsIdxs
  };
}