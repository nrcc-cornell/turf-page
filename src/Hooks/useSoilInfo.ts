import { useState, useEffect } from 'react';

import { getWaterDeficitData, WaterDeficitModelData } from '../Scripts/getWaterDefData';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../Scripts/waterDeficitModel';
import { getSoilCapacity } from '../Scripts/soilCharacteristics';
import { CoordsIdxObj } from '../Hooks/useRunoffApi';

type SoilSaturations = {
  [key:string]: number[]
};

export default function useSoilInfo(today: Date, lngLat: [number, number], coordsIdxs: CoordsIdxObj | null) {
  const [lastIrrigation, setLastIrrigation] = useState('');
  const [selectedSoilCapacity, setSelectedSoilCapacity] = useState<SoilMoistureOptionLevel>(SoilMoistureOptionLevel.MEDIUM);
  const [calculatedSoilCapacity, setCalculatedSoilCapacity] = useState<SoilMoistureOptionLevel>(SoilMoistureOptionLevel.MEDIUM);
  const [soilSatRawData, setSoilSatRawData] = useState<WaterDeficitModelData | null>(null);
  const [soilSaturation, setSoilSaturation] = useState<SoilSaturations | null>(null);
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
      }
    })();
  }, [today, lngLat, coordsIdxs]);

  useEffect(() => {
    if (soilSatRawData) {
      const irrigationIdxs: number[] = [];
      if (lastIrrigation) {
        irrigationIdxs.push(soilSatRawData.dates.findIndex(d => d === lastIrrigation.slice(5)));
      }

      const newGrowthPotential = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, irrigationIdxs, 0, 'gp');
      const newLawnWatering = runWaterDeficitModel(soilSatRawData.precip, soilSatRawData.et, selectedSoilCapacity, irrigationIdxs, 0, 'lawn');



      // Why dont the sat percentages make sense based on the amount that the deficit changes?
      // What is the max, what is the min, what should the sats be at each deficit

      // console.log('-----------------------');
      // for (let i = 100; i < 111; i++) {
      //   console.log(soilSatRawData.dates[i]);
      //   console.log(newGrowthPotential.deficitsInches[i], newGrowthPotential.saturationPercents[i], newLawnWatering.deficitsInches[i], newLawnWatering.saturationPercents[i]);
      // }
      // console.log('-----------------------');





      setSoilSaturation({
        gp: newGrowthPotential.saturationPercents,
        lawn: newLawnWatering.deficitsInches,
        soilSat: newLawnWatering.deficitsInches.map(deficit => (newLawnWatering.soilOptions.fieldcapacity + deficit) / 12)
      });
    }
    setLoading(false);
  }, [soilSatRawData, selectedSoilCapacity, lastIrrigation]);

  const changeSoilCapacity = (newSoilCap: SoilMoistureOptionLevel) => {
    setSelectedSoilCapacity(newSoilCap);
  };

  return {
    isLoadingSoilInfo: loading,
    soilSaturation,
    soilSaturationDates: soilSatRawData?.dates,
    avgts: soilSatRawData?.avgt,
    recommendedSoilCap: calculatedSoilCapacity,
    selectedSoilCap: selectedSoilCapacity,
    changeSoilCapacity,
    lastIrrigation,
    setLastIrrigation
  };
}