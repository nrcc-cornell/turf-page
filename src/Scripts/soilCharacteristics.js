const SOIL_TYPES = {
  low: {
    wiltingpoint: 1.0,
    prewiltingpoint: 1.15,
    stressthreshold: 1.5,
    fieldcapacity: 2.0,
    saturation: 5.0
  },
  medium: {
    wiltingpoint: 2.0,
    // wiltingpoint: 1.0,
    prewiltingpoint: 2.225,
    stressthreshold: 2.8,
    // fieldcapacity: 4.8,
    fieldcapacity: 3.5,
    saturation: 5.5
  },
  high: {
    wiltingpoint: 3.0,
    prewiltingpoint: 3.3,
    stressthreshold: 4.0,
    fieldcapacity: 5.0,
    saturation: 6.5
  }
};

class SoilType {
  columnDepthCm = 50;

  constructor(name, typeData) {
    this.name = name;
    this.areaWeight = typeData.percent / 100;
    this.horizons = typeData.horizons.filter(horizon => !(horizon.includes(null)));
  }

  calcHorizonDepth(horizon) {
    const top = horizon[3];
    const bottom = horizon[4] > this.columnDepthCm ? this.columnDepthCm : horizon[4];
    return top >= this.columnDepthCm ? 0 : bottom - top;
  }

  calcHorizonWeightedValues(horizon, weight) {
    return horizon.slice(0,3).map(val => val * weight);
  }

  calcHorizonWeights() {
    const { depthAccountedFor, depths } = this.horizons.reduce((acc, horizon) => {
      const thisHorizonDepth = this.calcHorizonDepth(horizon);
      acc.depthAccountedFor += thisHorizonDepth;
      acc.depths.push(thisHorizonDepth);
      return acc;
    }, { depthAccountedFor: 0, depths: [] });
    return depths.map(depth => depth / depthAccountedFor);
  }

  calcWeightedAvgs() {
    const weights = this.calcHorizonWeights();
    return this.horizons.reduce((acc, horizon, weightIndex) => {
      const weightedValues = this.calcHorizonWeightedValues(horizon, weights[weightIndex]);
      for (let i = 0; i < weightedValues.length; i++) {
        acc[i] += weightedValues[i];
      }
      return acc;
    }, [0,0,0]);
  }
}


const fetchSoilColumnDataViaPostRest = (lat, lon) => {
  const query = `SELECT claytotal_r, sandtotal_r, silttotal_r, hzdept_r, hzdepb_r, comppct_r, compname
    FROM mapunit AS mu
    LEFT OUTER JOIN component AS c ON mu.mukey = c.mukey
    INNER JOIN chorizon AS ch ON c.cokey = ch.cokey
    WHERE mu.mukey IN (SELECT * from SDA_Get_Mukey_from_intersection_with_WktWgs84('point (${lon} ${lat})')) AND hzdept_r <= 50`;

  return fetch(
    'https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'JSON',
        query: query,
      }),
    }
  )
    .then((res) => res.json())
    .then((jData) => {
      return jData.Table;
    })
    .catch((e) => {
      console.log(e);
      console.log('failed soil data...');
      return null;
    });
};

const convertIntoSoilTypes = (soilColumnData) => {
  const sortedByName = soilColumnData.reduce((acc, horizon) => {
    if (!(horizon[6] in acc)) acc[horizon[6]] = { percent: parseInt(horizon[5]), horizons: [] };
    acc[horizon[6]].horizons.push(horizon.slice(0,5).map(val => val === null ? null : parseInt(val)));
    return acc;
  }, {});

  const areaSum = Object.keys(sortedByName).reduce((sum,name) => sum += sortedByName[name].percent, 0);
  if (areaSum < 100) {
    const unaccounted = 100 - areaSum;
    const portion = unaccounted / Object.keys(sortedByName).length;
    Object.keys(sortedByName).forEach(name => sortedByName[name].percent += portion);
  }

  return Object.keys(sortedByName).map(name => new SoilType(name, sortedByName[name]));
};

const calcAvgSoilComp = (soilTypes) => {
  return soilTypes.reduce((acc, soilType) => {
    const typeComposition = soilType.calcWeightedAvgs();
    for (let i = 0; i < typeComposition.length; i++) {
      acc[i] += typeComposition[i] * soilType.areaWeight;
    }
    return acc;
  }, [0,0,0]);
};

const categorizeTexture = (clay, sand, silt) => {
  let type = 'medium';
  
  if (sand >= 75) {
    type = 'low';
  } else if (clay >= 40) {
    type = 'high';
  }

  return SOIL_TYPES[type];
};

export default async function fetchSoilConstants(lat, lon) {
  const soilColumnData = await fetchSoilColumnDataViaPostRest(lat, lon);
  console.log(soilColumnData);
  const soilTypes = convertIntoSoilTypes(soilColumnData);
  const [ avgClay, avgSand, avgSilt ] = calcAvgSoilComp(soilTypes);
  return categorizeTexture(avgClay, avgSand, avgSilt);
}