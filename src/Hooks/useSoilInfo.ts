import { useState, useEffect } from 'react';

import { getWaterDeficitData, WaterDeficitModelData } from '../Scripts/getWaterDefData';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../Scripts/waterDeficitModel';
import { getSoilCapacity } from '../Scripts/soilCharacteristics';
import { CoordsIdxObj } from '../Hooks/useRunoffApi';

export type IrriTimingOption = ('default' | 'avoidPlantStress' | 'avoidDormancy');

type IrriTimingObj = {
  deficits: number[]
  saturations: number[]
  wateringTotal: number[]
  wateringDates: string[]
};

type SoilSaturations = {
  default: IrriTimingObj;
  avoidDormancy: IrriTimingObj;
  avoidPlantStress: IrriTimingObj;
  numFcstDays: number;
};

const LOCAL_IRRI_DATES_KEY = 'turf-eas-irrigation-dates';
const LOCAL_IRRI_TIMING_KEY = 'turf-eas-irrigation-timing';


export default function useSoilInfo(today: Date, lngLat: [number, number], coordsIdxs: CoordsIdxObj | null) {
  const [irrigationDates, setIrrigationDates] = useState<string[]>(() => {
    const irriDates = localStorage.getItem(LOCAL_IRRI_DATES_KEY);
    return irriDates ? JSON.parse(irriDates) : [];
  });
  const [selectedSoilCapacity, setSelectedSoilCapacity] = useState<SoilMoistureOptionLevel>(SoilMoistureOptionLevel.MEDIUM);
  const [calculatedSoilCapacity, setCalculatedSoilCapacity] = useState<SoilMoistureOptionLevel>(SoilMoistureOptionLevel.MEDIUM);
  const [soilSatRawData, setSoilSatRawData] = useState<WaterDeficitModelData | null>(null);
  const [soilSaturation, setSoilSaturation] = useState<SoilSaturations | null>(null);
  const [irrigationTiming, setIrrigationTiming] = useState(localStorage.getItem(LOCAL_IRRI_TIMING_KEY) || 'default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (coordsIdxs) {
        setLoading(true);

        const [newSSRD, newCSC] = await Promise.all([
          getWaterDeficitData(today, lngLat, coordsIdxs),
          getSoilCapacity(lngLat)
        ]);

        setSoilSatRawData(newSSRD);
        setCalculatedSoilCapacity(newCSC);
        setSelectedSoilCapacity(newCSC);
        if (newSSRD === null) {
          setLoading(false);
        }
      }
    })();
  }, [today, lngLat, coordsIdxs]);

  useEffect(() => {
    if (soilSatRawData) {
      const irrigationIdxs: number[] = irrigationDates.map(irriDate => soilSatRawData.dates.findIndex(d => d === irriDate.slice(5)));

      const aprilFirstIdx: number[] = [];
      aprilFirstIdx.push(soilSatRawData.dates.findIndex(d => d === '04-01'));

      const newDefault = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, irrigationIdxs, 0, 'actual');
      const newDormancyWatering = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, aprilFirstIdx, 0, 'avoidDormancy', 0.5);
      const newDormancyDates = newDormancyWatering.optimalWateringDateIndices.map(di => today.getFullYear() + '-' + soilSatRawData.dates[di]);

      const newPlantStressWatering = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, aprilFirstIdx, 0, 'avoidPlantStress', 0.5);
      const newPlantStressDates = newPlantStressWatering.optimalWateringDateIndices.map(di => today.getFullYear() + '-' + soilSatRawData.dates[di]);

      setSoilSaturation({
        default: {
          deficits: newDefault.deficitsInches,
          saturations: newDefault.saturationPercents,
          wateringDates: [],
          wateringTotal: []
        },
        avoidDormancy: {
          deficits: newDormancyWatering.deficitsInches,
          saturations: newDormancyWatering.saturationPercents,
          wateringTotal: [newDormancyWatering.optimalWateringTotal],
          wateringDates: newDormancyDates,
        },
        avoidPlantStress: {
          deficits: newPlantStressWatering.deficitsInches,
          saturations: newPlantStressWatering.saturationPercents,
          wateringTotal: [newPlantStressWatering.optimalWateringTotal],
          wateringDates: newPlantStressDates,
        },
        numFcstDays: soilSatRawData.numFcstDays
      });
    }
    setLoading(false);
  }, [soilSatRawData, selectedSoilCapacity, irrigationDates]);

  const changeSoilCapacity = (newSoilCap: SoilMoistureOptionLevel) => {
    setSelectedSoilCapacity(newSoilCap);
  };

  const handleSetIrrigationDates = (newDates: string[]) => {
    localStorage.setItem(LOCAL_IRRI_DATES_KEY, JSON.stringify(newDates));
    setIrrigationDates(newDates);
  };

  const handleSetUseIdeal = (newValue: string) => {
    localStorage.setItem(LOCAL_IRRI_TIMING_KEY, newValue);
    setIrrigationTiming(newValue);
  };

  return {
    isLoadingSoilInfo: loading,
    soilSaturation,
    soilSaturationDates: soilSatRawData?.dates,
    avgts: soilSatRawData?.avgt,
    recommendedSoilCap: calculatedSoilCapacity,
    selectedSoilCap: selectedSoilCapacity,
    changeSoilCapacity,
    irrigationDates: irrigationTiming === 'default' ? irrigationDates: (soilSaturation ? soilSaturation[irrigationTiming as ('avoidPlantStress' | 'avoidDormancy')].wateringDates : []),
    setIrrigationDates: handleSetIrrigationDates,
    irrigationTiming,
    setIrrigationTiming: handleSetUseIdeal
  };
}