export const runoffRiskLegendInfo = [
  { color: '#52be80', label: 'Little/No Runoff' },
  { color: '#ffd700', label: 'Low' },
  { color: '#ffaa1c', label: 'Moderate' },
  { color: '#ff0000', label: 'High' },
];

const precipLegendInfo = [
  { color: '#FEFBB1', label: 'Zero' },
  { color: '#D0D091', label: 'Trace-0.10' },
  { color: '#78C6A6', label: '0.10-0.25' },
  { color: '#409457', label: '0.25-0.50' },
  { color: '#2A7FB0', label: '0.50-0.75' },
  { color: '#81B0CF', label: '0.75-1.00' },
  { color: '#BECEDB', label: '1.00-1.50' },
  { color: '#FCB9B5', label: '1.50-3.00' },
  { color: '#F672A5', label: '> 3.00' },
];

const soilTempLegendInfo = [
  { color: '#79B5FC', label: '< 32' },
  { color: '#7CC483', label: '32-34' },
  { color: '#EECE9B', label: '34-40' },
  { color: '#F89369', label: '40-45' },
  { color: '#DD5845', label: '45-50' },
  { color: '#B32423', label: '>50' },
];

export type  VariableOption = {
  overlay: string;
  legend: { color: string, label: string }[];
  useCanvas: boolean;
}

export type VariableOptions = {
  [key:string]: VariableOption
}

export const variableOptions = {
'Runoff Risk (24-hour)': {
  overlay: 'RRAF_dailyRiskPercWinter',
  // overlay: 'turf_24hr',
  legend: runoffRiskLegendInfo,
  useCanvas: true
},
'Runoff Risk (72-hour)': {
  overlay: 'RRAF_dailyRiskPercWinter72Hour',
  // overlay: 'turf_72hr',
  legend: runoffRiskLegendInfo,
  useCanvas: true
},
'Soil Temperature (2" depth, °F)': {
  overlay: 'dailyAvgSoilTemp_2in_F',
  legend: soilTempLegendInfo,
  useCanvas: false
},
'Soil Temperature (6" depth, °F)': {
  overlay: 'dailyAvgSoilTemp_6in_F',
  legend: soilTempLegendInfo,
  useCanvas: false
},
'Soil Temperature (sfc-10" depth, °F)': {
  overlay: 'dailyAvgSoilTemp_sfc10_F',
  legend: soilTempLegendInfo,
  useCanvas: false
},
'Precipitation (in)': {
  overlay: 'dailyPrecip_vol_INCHES',
  legend: precipLegendInfo,
  useCanvas: false
},
'Rainfall + Snowmelt (in)': {
  overlay: 'dailyRAIM_vol_INCHES',
  legend: precipLegendInfo,
  useCanvas: false
},
'Snow Water Equivalent (in)': {
  overlay: 'dailyAvgSWE_INCHES',
  legend: precipLegendInfo,
  useCanvas: false
}};


const soilSatLegendInfo = [
  { color: '#f8fdc7', label: '0-20' },
  { color: '#9be1b6', label: '20-40' },
  { color: '#51bac7', label: '40-60' },
  { color: '#3d89ba', label: '60-80' },
  { color: '#344792', label: '80-100' },
];

export const ssVariableOptions = {
  'Soil Saturation (2" depth, %)': {
    overlay: 'dailyAvgSoilSat_2in',
    legend: soilSatLegendInfo,
    useCanvas: false
  },
    'Soil Saturation (6" depth, %)': {
    overlay: 'dailyAvgSoilSat_2in',
    legend: soilSatLegendInfo,
    useCanvas: false
  },
    'Soil Saturation (sfc-10" depth, %)': {
    overlay: 'dailyAvgSoilSat_sfc10',
    legend: soilSatLegendInfo,
    useCanvas: false
  },
};