import { useState, useEffect } from 'react';

import { getWaterDeficitData, WaterDeficitModelData } from '../Scripts/getWaterDefData';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../Scripts/waterDeficitModel';
import { getSoilCapacity } from '../Scripts/soilCharacteristics';
import { CoordsIdxObj } from '../Hooks/useRunoffApi';

type SoilSaturations = {
  gp: number[];
  lawn: number[];
  soilSat: number[];
  optimalWaterTotal: number[];
  optimalWateringDates: string[];
  optimalWaterDeficits: number[];
  numFcstDays: number;
};

const LOCAL_IRRI_DATES_KEY = 'turf-eas-irrigation-dates';
const LOCAL_TOGGLE_KEY = 'turf-eas-use-ideal';


export default function useSoilInfo(today: Date, lngLat: [number, number], coordsIdxs: CoordsIdxObj | null) {
  const [irrigationDates, setIrrigationDates] = useState<string[]>(() => {
    const irriDates = localStorage.getItem(LOCAL_IRRI_DATES_KEY);
    return irriDates ? JSON.parse(irriDates) : [];
  });
  const [selectedSoilCapacity, setSelectedSoilCapacity] = useState<SoilMoistureOptionLevel>(SoilMoistureOptionLevel.MEDIUM);
  const [calculatedSoilCapacity, setCalculatedSoilCapacity] = useState<SoilMoistureOptionLevel>(SoilMoistureOptionLevel.MEDIUM);
  const [soilSatRawData, setSoilSatRawData] = useState<WaterDeficitModelData | null>(null);
  const [soilSaturation, setSoilSaturation] = useState<SoilSaturations | null>(null);
  const [useIdeal, setUseIdeal] = useState(Boolean(localStorage.getItem(LOCAL_TOGGLE_KEY)));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (coordsIdxs) {
        setLoading(true);

        const [newSSRD, newCSC] = await Promise.all([
          getWaterDeficitData(today, lngLat, coordsIdxs),
          getSoilCapacity(lngLat)
        ]);

        console.log(newSSRD);

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

      const mayFirstIdx: number[] = [];
      mayFirstIdx.push(soilSatRawData.dates.findIndex(d => d === '05-01'));

      const newWaterDeficit = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, irrigationIdxs, 0, 'actual');
      const newOptimalWatering = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, mayFirstIdx, 0, 'optimalWatering', 0.5);
      const optimalWateringDates = newOptimalWatering.optimalWateringDateIndices.map(di => today.getFullYear() + '-' + soilSatRawData.dates[di]);

      setSoilSaturation({
        gp: newWaterDeficit.saturationPercents,
        lawn: newWaterDeficit.deficitsInches,
        soilSat: newWaterDeficit.deficitsInches.map(deficit => (newWaterDeficit.soilOptions.fieldcapacity + deficit) / 12),
        optimalWaterDeficits: newOptimalWatering.deficitsInches,
        optimalWaterTotal: [newOptimalWatering.optimalWateringTotal],
        optimalWateringDates,
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

  const handleSetUseIdeal = (newValue: boolean) => {
    localStorage.setItem(LOCAL_TOGGLE_KEY, JSON.stringify(newValue));
    setUseIdeal(newValue);
  };

  return {
    isLoadingSoilInfo: loading,
    soilSaturation,
    soilSaturationDates: soilSatRawData?.dates,
    avgts: soilSatRawData?.avgt,
    recommendedSoilCap: calculatedSoilCapacity,
    selectedSoilCap: selectedSoilCapacity,
    changeSoilCapacity,
    irrigationDates: useIdeal ? (soilSaturation?.optimalWateringDates || []) : irrigationDates,
    setIrrigationDates: handleSetIrrigationDates,
    useIdeal,
    setUseIdeal: handleSetUseIdeal
  };
}