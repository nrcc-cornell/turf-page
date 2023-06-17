import React, { useState, useEffect } from 'react';

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
    console.log('something updated');
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

      setSoilSaturation({
        gp: newGrowthPotential.saturationPercents,
        lawn: newLawnWatering.deficitsInches
      });
    }
    setLoading(false);
  }, [soilSatRawData, selectedSoilCapacity, lastIrrigation]);

  const changeSoilCapacity = (newSoilCap: SoilMoistureOptionLevel) => {
    setSelectedSoilCapacity(newSoilCap);
  };

  // useEffect(() => {
  //   // soilSatOpts = {
  //   //   last irrigation
  //   //   selected soil type
  //   // }
  //   // soilSatRawData = {
  //   //   precip
  //   //   et
  //   //   calcedSoilType
  //   // }

  //   // calculate soil moisture as both deficit and % and store into soilSaturation

  //   // pass the necessary soil saturation into each page
  //   // pass setter functions into each page to allow for changing the selected soil type and last irrigation
  //   if (waterDeficitModelData) {
  //     setLoading(true);


  //     const sliceIdx = waterDeficitModelData.dates.length - numDaysToProcess;
  //     const slicedSats = soilSaturations.slice(sliceIdx);
  //     const slicedAvgts = waterDeficitModelData.avgt.slice(sliceIdx);
  //     const slicedDates = waterDeficitModelData.dates.slice(sliceIdx);

  //     setGrowthPotentialModelResults(calcGrowthPotential(slicedSats, slicedAvgts, slicedDates, isIrrigation, props.currentLocation, numDaysToProcess));
  //     setLoading(false);
  //   }
  // }, [lastIrrigation, selectedSoilCapacity, soilSatRawData]);

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