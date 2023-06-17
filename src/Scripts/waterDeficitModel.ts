export enum SoilMoistureOptionLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

type SoilCharacteristics = {
  wiltingpoint: number,
  prewiltingpoint: number,
  stressthreshold: number,
  fieldcapacity: number,
  saturation: number
}

// soildata:
// soil moisture and drainage characteristics for different levels of soil water capacity
export const SOIL_DATA = {
  soilmoistureoptions: {
    gp: {
      low: {
        wiltingpoint: 1.0,
        prewiltingpoint: 1.15,
        stressthreshold: 1.5,
        fieldcapacity: 2.1,
        saturation: 5.2,
      },
      medium: {
        wiltingpoint: 1.0,
        prewiltingpoint: 2.225,
        stressthreshold: 2.8,
        fieldcapacity: 4.2,
        saturation: 5.8,
      },
      high: {
        wiltingpoint: 1.0,
        prewiltingpoint: 3.3,
        stressthreshold: 4.0,
        fieldcapacity: 5.0,
        saturation: 6.5,
      },
      kc: 1.2,
      p: 0.7
    },
    lawn: {
      low: {
        wiltingpoint: 1.0,
        prewiltingpoint: 1.15,
        stressthreshold: 1.5,
        fieldcapacity: 2.0,
        saturation: 5.0,
      },
      medium: {
        wiltingpoint: 2.0,
        prewiltingpoint: 2.225,
        stressthreshold: 2.8,
        fieldcapacity: 3.5,
        saturation: 5.5,
      },
      high: {
        wiltingpoint: 3.0,
        prewiltingpoint: 3.3,
        stressthreshold: 4.0,
        fieldcapacity: 5.0,
        saturation: 6.5,
      },
      kc: 1.0,
      p: 0.5
    },
  },
  soildrainageoptions: {
    low: { daysToDrainToFcFromSat: 0.125 },
    medium: { daysToDrainToFcFromSat: 1.0 },
    high: { daysToDrainToFcFromSat: 2.0 },
  },
  soilRecommendations: {
    low: [[0, 'No deficit, watering is unnecessary'],[-0.5, 'Low deficit, no plant stress, watering is unnecessary'], [-0.85, 'Moderate deficit, plant stress likely, consider watering'], [-999, 'High deficit, severe plant stress likely, watering is recommended']],
    medium: [[0, 'No deficit, watering is unnecessary'],[-0.7, 'Low deficit, no plant stress, watering is unnecessary'], [-1.275, 'Moderate deficit, plant stress likely, consider watering'], [-999, 'High deficit, severe plant stress likely, watering is recommended']],
    high: [[0, 'No deficit, watering is unnecessary'],[-1.0, 'Low deficit, no plant stress, watering is unnecessary'], [-1.7, 'Moderate deficit, plant stress likely, consider watering'], [-999, 'High deficit, severe plant stress likely, watering is recommended']],
  }
};

// Derived from Brian's csf-waterdef code
function getPotentialDailyDrainage(soilCharacteristics: SoilCharacteristics, drainagecap: number): number {
  // -----------------------------------------------------------------------------------------
  // Calculate potential daily drainage of soil
  // -----------------------------------------------------------------------------------------
  return (
    (soilCharacteristics.saturation -
      soilCharacteristics.fieldcapacity) /
    drainagecap
  );
}

function getTawForPlant(soilCharacteristics: SoilCharacteristics): number {
  // -----------------------------------------------------------------------------------------
  // Calculate total available water (TAW) for plant, defined here as:
  // soil moisture at field capacity minus soil moisture at wilting point
  // -----------------------------------------------------------------------------------------
  return soilCharacteristics.fieldcapacity - soilCharacteristics.wiltingpoint;
}

function getWaterStressCoeff(Dr: number, TAW: number, p: number): number {
  // -----------------------------------------------------------------------------------------
  // Calculate coefficient for adjusting ET when accounting for decreased ET during water stress conditions.
  // Refer to FAO-56 eq 84, pg 169
  // Dr  : the antecedent water deficit (in)
  // TAW : total available (in) water for the plant (soil moisture at field capacity minus soil moisture at wilting point).
  // p   : at what fraction between field capacity and wilting point do we start applying this water stress factor.
  // Ks  : water stress coefficient
  // -----------------------------------------------------------------------------------------
  let Ks: number | null = null;
  Dr = -1 * Dr;
  Ks = Dr <= p * TAW ? 1 : (TAW - Dr) / ((1 - p) * TAW);
  Ks = Math.max(Ks, 0);
  return Ks;
}

export function runWaterDeficitModel(
  precip: number[],
  pet: number[],
  soilcap: SoilMoistureOptionLevel,
  irrigationIdxs: number[],
  initDeficit: number,
  returnType: ('gp' | 'lawn')
) {
  // -----------------------------------------------------------------------------------------
  // Calculate daily water deficit (inches) from daily precipitation, evapotranspiration, soil drainage and runoff.
  //
  // The water deficit is calculated relative to field capacity (i.e. the amount of water available to the plant).
  // Therefore, the water deficit is:
  //    - zero when soil moisture is at field capacity
  //    - a negative value when soil moisture is between field capacity and the wilting point
  //    - a positive value when soil moisture is between field capacity and saturation
  //    - bounded below by the wilting point ( = soil moisture at wilting point minus soil moisture at field capacity )
  //    - bounded above by saturation ( = soil moisture at saturation minus soil moisture at field capacity)
  //
  //  precip       : daily precipitation array (in) : (NRCC ACIS grid 3)
  //  pet          : daily potential evapotranspiration array (in) : (grass reference PET obtained from NRCC MORECS model output)
  //  initDeficit  : water deficit used to initialize the model
  //  soilcap      : soil water capacity ('high','medium','low')
  //
  // -----------------------------------------------------------------------------------------

  const soil_options = SOIL_DATA.soilmoistureoptions[returnType];

  // Total water available to plant
  let TAW: number | null = null;
  // water stress coefficient
  let Ks: number | null = null;

  // values of model components for a single day
  let totalDailyPrecip: number | null = null;
  let totalDailyPET: number | null = null;
  let dailyPotentialDrainageRate: number | null = null;

  // hourly rates of model components
  let hourlyPrecip: number | null = null;
  let hourlyPET: number | null = null;
  let hourlyDrainage: number | null = null;
  let hourlyPotentialDrainage: number | null = null;

  // OUTPUT VARS
  // arrays holding daily values of model components
  // deficitDaily is water deficit calculation we are looking for.
  // Other variables are just for potential water balance verification, etc, if the user chooses.
  const deficitDaily: number[] = [];
  const saturationDaily: number[] = [];

  // a running tally of the deficit
  // Initialize deficit
  //   : to zero if saturated soil after irrigation)
  //   : to last observed deficit if running for forecasts
  let deficit = initDeficit;

  // the first elements in our output arrays. It include the water deficit initialization. Others will populate starting Day 2.
  deficitDaily.push(deficit);
  saturationDaily.push((soil_options[soilcap].fieldcapacity + deficit) / soil_options[soilcap].saturation);

  // Calculate daily drainage rate that occurs when soil water content is between saturation and field capacity
  dailyPotentialDrainageRate = getPotentialDailyDrainage(soil_options[soilcap], SOIL_DATA.soildrainageoptions[soilcap].daysToDrainToFcFromSat);

  // Loop through all days, starting with the second day (we already have the deficit for the initial day from model initialization)
  for (let idx = 1; idx < pet.length; idx++) {
    // Calculate Ks, the water stress coefficient, using antecedent deficit
    TAW = getTawForPlant(soil_options[soilcap]);
    Ks = getWaterStressCoeff(deficitDaily[idx - 1], TAW, soil_options.p);

    // We already know what the daily total is for Precip and ET
    totalDailyPET = -1 * pet[idx] * soil_options.kc * Ks;
    totalDailyPrecip = precip[idx] + (irrigationIdxs.includes(idx) ? 0.50 : 0);

    // Convert daily rates to hourly rates. For this simple model, rates are constant throughout the day.
    // For precip   : this assumption is about all we can do without hourly observations
    // For PET      : this assumption isn't great. Something following diurnal cycle would be best.
    // For drainage : this assumption is okay
    // ALL HOURLY RATES POSITIVE
    hourlyPrecip = totalDailyPrecip / 24;
    hourlyPET = (-1 * totalDailyPET) / 24;
    hourlyPotentialDrainage = dailyPotentialDrainageRate / 24;

    for (let hr = 1; hr <= 24; hr++) {
      // Calculate hourly drainage estimate. It is bounded by the potential drainage rate and available
      // water in excess of the field capacity. We assume drainage does not occur below field capacity.
      if (deficit > 0) {
        hourlyDrainage = Math.min(deficit, hourlyPotentialDrainage);
      } else {
        hourlyDrainage = 0;
      }

      // Adjust deficit based on hourly water budget.
      // deficit is bound by saturation (soil can't be super-saturated). This effectively reduces deficit by hourly runoff as well.
      deficit = Math.min(
        deficit + hourlyPrecip - hourlyPET - hourlyDrainage,
        soil_options[soilcap].saturation -
          soil_options[soilcap].fieldcapacity
      );

      // deficit is bound by wilting point, but calculations should never reach wilting point based on this model. We bound it below for completeness.
      // In the real world, deficit is able to reach wilting point. The user should note that deficit values NEAR the wilting point
      // from this model should be interpreted as 'danger of wilting exists'.
      deficit = Math.max(
        deficit,
        -1 *
          (soil_options[soilcap].fieldcapacity -
            soil_options[soilcap].wiltingpoint)
      );
    }

    deficitDaily.push(deficit);
    saturationDaily.push((soil_options[soilcap].fieldcapacity + deficit) / soil_options[soilcap].saturation);
  }

  return { saturationPercents: saturationDaily, deficitsInches: deficitDaily };
}