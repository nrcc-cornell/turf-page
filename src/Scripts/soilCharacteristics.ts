import { SoilMoistureOptionLevel } from './waterDeficitModel';

type SoilHorizonData = number[];

type SoilTypeData = {
  percent: number;
  horizons: (number | null)[][];
}

type SoilHorizonWeightsReduce = {
  depthAccountedFor: number;
  depths: number[];
}

type SoilTypeReduce = {
  [key: string]: SoilTypeData;
}

type SDMReturn = AsyncReturnType<typeof fetchSoilColumnDataViaPostRest>;

function noNulls<TValue>(value: (TValue | null)[]): value is TValue[] {
  return !(value.includes(null));
}

class SoilType {
  columnDepthCm = 50;
  name: string;
  areaWeight: number;
  horizons: SoilHorizonData[];

  constructor(name: string, typeData: SoilTypeData) {
    this.name = name;
    this.areaWeight = typeData.percent / 100;
    this.horizons = typeData.horizons.filter(noNulls);
  }

  calcHorizonDepth(horizon: SoilHorizonData) {
    const top = horizon[3];
    const bottom = horizon[4] > this.columnDepthCm ? this.columnDepthCm : horizon[4];
    return top >= this.columnDepthCm ? 0 : bottom - top;
  }

  calcHorizonWeightedValues(horizon: SoilHorizonData, weight: number) {
    return horizon.slice(0,3).map(val => val * weight);
  }

  calcHorizonWeights() {
    const { depthAccountedFor, depths } = this.horizons.reduce<SoilHorizonWeightsReduce>((acc, horizon) => {
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


const fetchSoilColumnDataViaPostRest = (lngLat: [number, number]) => {
  const query = `SELECT claytotal_r, sandtotal_r, silttotal_r, hzdept_r, hzdepb_r, comppct_r, compname
    FROM mapunit AS mu
    LEFT OUTER JOIN component AS c ON mu.mukey = c.mukey
    INNER JOIN chorizon AS ch ON c.cokey = ch.cokey
    WHERE mu.mukey IN (SELECT * from SDA_Get_Mukey_from_intersection_with_WktWgs84('point (${lngLat.join(' ')})')) AND hzdept_r <= 50`;

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

const convertIntoSoilTypes = (soilColumnData: SDMReturn) => {
  const sortedByName = soilColumnData.reduce((acc: SoilTypeReduce, horizon: string[]) => {
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

const calcAvgSoilComp = (soilTypes: SoilType[]) => {
  return soilTypes.reduce((acc, soilType) => {
    const typeComposition = soilType.calcWeightedAvgs();
    for (let i = 0; i < typeComposition.length; i++) {
      acc[i] += typeComposition[i] * soilType.areaWeight;
    }
    return acc;
  }, [0,0,0]);
};

const categorizeTexture = (clay: number, sand: number, silt: number): SoilMoistureOptionLevel => {
  let type: SoilMoistureOptionLevel = SoilMoistureOptionLevel.MEDIUM;
  
  if (sand >= 50 && clay < 20) {
    type = SoilMoistureOptionLevel.LOW;
  } else if (clay >= 36 || silt >= 50 || (clay >= 30 && sand < 45)) {
    type = SoilMoistureOptionLevel.HIGH;
  }

  return type;
};

export async function getSoilCapacity(lngLat: [number, number]) {
  const soilColumnData = await fetchSoilColumnDataViaPostRest(lngLat);
  const soilTypes = convertIntoSoilTypes(soilColumnData);
  const [ avgClay, avgSand, avgSilt ] = calcAvgSoilComp(soilTypes);
  return categorizeTexture(avgClay, avgSand, avgSilt);
}