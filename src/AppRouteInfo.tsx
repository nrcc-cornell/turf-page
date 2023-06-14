import { DiseaseStressRiskPageInfo } from './Components/Pages/DiseaseStressRisk/DiseaseStressRiskPage';
import { GddDiffDaysPageInfo } from './Components/Pages/GddDiffDays/GddDiffDaysPage';
import { TablePageInfo } from './Components/Pages/TablePage/TablePage';
import { SeedWeedPageInfo } from './Components/Pages/SeedWeed/SeedWeedPage';
import { GraphPageInfo } from './Components/Pages/GraphPage/GraphPage';
import { MapsOnlyPageInfo } from './Components/Pages/MapsOnlyPage/MapsOnlyPage';
import { PollinatorPageInfo } from './Components/Pages/PollinatorRisk/PollinatorRiskPage';
import { MapPageProps } from './Components/MapPage';
import { MapThumbs } from './Components/RSWMaps';
import { ThumbUrls } from './Components/WeekMaps';

export type PageInfo = DiseaseStressRiskPageInfo | GddDiffDaysPageInfo | TablePageInfo | SeedWeedPageInfo | GraphPageInfo | MapsOnlyPageInfo | PollinatorPageInfo;

type RouteInfo = {
  path: string;
  props: PageInfo;
};

type HomeMap = {
  path: string;
  url: string;
  alt: string;
};

const constructThumbs = (name: string, title: string): ThumbUrls[] => {
  const thumbs: ThumbUrls[] = [];
  for (let i = 0; i < 6; i++) {
    thumbs.push({
      thumbUrl: `https://turf.eas.cornell.edu/maps/f${i + 1}_${name}_map_thumb.png`,
      fullSizeUrl: `https://turf.eas.cornell.edu/maps/f${i + 1}_${name}_map.png`,
      name,
      title,
    });
  }
  return thumbs;
};

const riskRanges = [
  ['No Risk', 'rgb(0,170,0)'],
  ['Moderate', 'rgb(255,215,0)'],
  ['High', 'rgb(255,0,0)'],
];

const routeInfo: RouteInfo[] = [
  {
    path: '/disease-stress/anthracnose',
    props: {
      pageType: 'risk',
      text: {
        titlePart: 'Anthracnose Disease Risk',
        description: [
          'The Anthracnose risk index is based on the model of <i>Danneberger et al. (1984)</i> (see references below) with slight modifications for compatibility with available gridded weather observations. The model combines leaf wetness (Lw) and air temperature (T) into a single index (Ia) that is used to estimate the risk of an outbreak. The equation describing the index is:',
          `<div class='aFormula'>Ia = 4.0233 - 0.2283(Lw) - 0.5303(T) - 0.0013(Lw<sup>2</sup>) + 0.0197(T<sup>2</sup>) + 0.0155(T × Lw)</div>`,
          'Lw is the average number of hours per day that leaf wetness was present during the previous three days. Any hourly weather observation that reports either rainfall or a dew point that is less than three degrees (°C) lower than the air temperature indicates leaf wetness, indicates the occurrence leaf wetness during that hour and the next hour. T is the average air temperature (°C) for the previous three days.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the index exceeds 1.5. <span style='color: rgb(255,215,0); font-weight: bold'>Moderate risk</span> corresponds to index values between 0.4 and 1.5. <span style='color: green; font-weight: bold'>Low risk</span> is assumed for index values of 0.4 or less. In general higher index values occur with higher temperatures and more prolonged leaf wetness.`,
          `The weekly index values reflect the longer-term persistence of Anthracnose risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using 7-day averages rather than daily values. In general, <span style='color: red; font-weight: bold'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk, <span style='color: rgb(255,215,0); font-weight: bold'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold'>low weekly risk</span> indicates 2 or fewer days of moderate risk.`,
          `The weather data used to compute the Anthracnose index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`,
        ],
        references: [
          '<b>Danneberger, T.K., J.M. Vargas Jr., and A.L. Jones, 1984</b>: <i>A model for weather-based forecasting of anthracnose on annual bluegrass.</i> Phytopathology, 74, 448-451',
        ],
      },
      chart: {
        rows: [
          {
            rowName: 'Daily',
            data: 'anthracnose',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 1.5,
            },
          },
          {
            rowName: '7 Day Avg',
            data: 'anthracnose',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 1.5,
            },
          },
        ],
        legend: riskRanges,
        title: 'Anthracnose Risk Estimates',
      },
      maps: [
        {
          title: 'Anthracnose Risk Maps',
          thumbs: constructThumbs('anthracnose', 'Anthracnose Risk'),
        },
      ],
    },
  },
  {
    path: '/disease-stress/brown-patch',
    props: {
      pageType: 'risk',
      text: {
        titlePart: 'Brown Patch Disease Risk',
        description: [
          'The Brown Patch risk index is based on the model of <i>Fidanza et al. (1996)</i> (see reference below) with slight modifications for compatibility with available gridded weather observations. The model uses a combines relative humidity (RH), leaf wetness (Lw) and daily minimum air temperature (Tmin) into a single index (Ibp) the is used to estimate the risk of an outbreak. The equation describing the index is:',
          `<span style='font-style: italic;margin-left: 20px;'>Ibp = RH<sub>80</sub> + RH<sub>95</sub> + Lw + Tmin</span>`,
          `RH<sub>80</sub> equals 1 when the daily average relative humidity is 80 or above, otherwise it is set to 0. RH<sub>95</sub> is assigned a value 1 if more than 4 hourly RH values in a day exceed 95 and a value of 2 if 8 or more hours exceed 95, otherwise it is set to zero. Lw is set to 1 when leaf wetness is present during 10 or more hours in a day, otherwise it is assigned a value of 0. Any hourly weather observation that reports either rainfall or a dew point that is less than three degrees (°C) lower than the air temperature indicates that leaf wetness occurred during that hour and the next hour.`,
          'From July 1 to September 30 Tmin is assigned a value of -2. Prior to July 1 and after September 30, the value of Tmin is -4. Regardless of date, on days when the minimum temperature is 16°C (60.8°F) or higher Tmin is assigned a value of 1.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the average of the index over the previous 3 days exceeds 0.9. <span style='color: rgb(255,215,0); font-weight: bold'>Moderate risk</span> corresponds to 3-day average index values between 0.4 and 0.9. <span style='color: green; font-weight: bold'>Low risk</span> is assumed for 3-day average index values of 0.4 or less. In general higher index values occur with higher temperatures, more prolonged leaf wetness and higher relative humidity.`,
          `The weekly index values reflect the longer-term persistence of brown patch risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using the 7-day averages rather than daily values. In general, <span style='color: red; font-weight: bold;'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk <span style='color: rgb(255,215,0); font-weight: bold;'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold;'>low weekly risk</span> indicates 2 or fewer days with moderate risk.`,
          `The weather data used to compute the Brown Patch index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`,
        ],
        references: [
          `<b>Fidanza, M.A. P.H. Dernoeden, and A. P. Grybauskas, 1996</b>: <i>Development and field validation of a brown patch warning model for perennial ryegrass turf.</i> Phytopathology 86, 385-390. Plant Disease, 67: 1126-1129`,
        ],
      },
      chart: {
        rows: [
          {
            rowName: 'Daily',
            data: 'brownPatch',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 0.9,
            },
          },
          {
            rowName: '7 Day Avg',
            data: 'brownPatch',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 0.9,
            },
          },
        ],
        legend: riskRanges,
        title: 'Brown Patch Risk Estimates',
      },
      maps: [
        {
          title: 'Brown Patch Risk Maps',
          thumbs: constructThumbs('brown_patch', 'Brown Patch Risk'),
        },
      ],
    },
  },
  {
    path: '/disease-stress/dollarspot',
    props: {
      pageType: 'risk',
      text: {
        titlePart: 'Dollarspot Disease Risk',
        description: [
          `The Dollarspot risk index is based on the models of <i>Mills and Rothwell and Hall, R.</i> (see references below) with slight modifications for compatibility with available gridded weather observations. The model combines relative humidity (RH) leaf wetness (Lw), air temperature (T) and number of consecutive days with rainfall into a single index (Id) that is used to estimate the risk of an outbreak. The equation describing the index is:`,
          `<span style='font-style: italic;margin-left: 20px;'>Ia = Drh + Dlw + Drain</span>`,
          'Each variable in the equation is originally set to zero. Drh is set to 1 when 3 or more hours during the previous seven days had both an RH of greater than 90% and a temperature greater than 25°C (77°F). Dlw is set to 1 if the average daily temperature exceeds 15°C (59°F) and the average number of hours per day that leaf wetness was present during the previous 3 days exceeds 8. Any hourly weather observation that reports either rainfall or a dew point that is less than three degrees (°C) lower than the air temperature indicates the occurrence leaf wetness during that hour and the next hour. Drain is assigned a value of 1 under two conditions: a) when three or more consecutive days received rainfall and the average temperature on these days exceeded 15°C (59°F) b) when two or more consecutive days received rainfall and the average temperature on these days exceeded 20°C (68°F).',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the average of the index over previous 3 days exceeds 0.7. <span style='color: rgb(255,215,0); font-weight: bold'>Moderate risk</span> corresponds to 3-day average index values between 0.4 and 0.7. <span style='color: green; font-weight: bold'>Low risk</span> is assumed for 3-day average index values of 0.4 or less. In general higher index values occur with warmer and wetter conditons.`,
          `The weekly index values reflect the longer-term persistence of Dollarspot risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using the 7-day average rather than daily values. In general, <span style='color: red; font-weight: bold'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk, <span style='color: rgb(255,215,0); font-weight: bold'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold'>low weekly risk</span> indicates 2 or fewer days with moderate risk.`,
          `The weather data used to compute the Dollarspot index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`,
        ],
        references: [
          '<b>DeGaetano, A. T., and Rossi, F. S. 2007</b>: <i>Long-term trends in meteorological conditions favorable for dollar spot in eastern portions of the United States.</i> Online. Applied Turfgrass Science doi:<a href=https://doi.org/10.1094/ATS-2007-1217-02-RS rel=noreferrer target=_blank>https://doi.org/10.1094/ATS-2007-1217-02-RS</a>.',
          '<b>Hall, R. 1984</b>: <i>Relationship between weather factors and dollar spot of creeping bentgrass.</i> Can. J. Plant Sci. 64: 167-174',
          '<b>Mills, S.G. and Rothwell, J.D. 1982</b>: <i>Predicting diseases - the hygrothermograph.</i> Greenmaster, 18(4), 14-15',
        ],
      },
      chart: {
        rows: [
          {
            rowName: 'Daily',
            data: 'dollarspot',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 0.7,
            },
          },
          {
            rowName: '7 Day Avg',
            data: 'dollarspot',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 0.7,
            },
          },
        ],
        legend: riskRanges,
        title: 'Dollarspot Risk Estimates',
      },
      maps: [
        {
          title: 'Dollarspot Risk Maps',
          thumbs: constructThumbs('dollarspot', 'Dollarspot Risk'),
        },
      ],
    },
  },
  {
    path: '/disease-stress/pythium-blight',
    props: {
      pageType: 'risk',
      text: {
        titlePart: 'Pythium Blight Disease Risk',
        description: [
          'The Pythium Blight risk index is based on the model of <i>Nutter et al. (1983)</i> (see references below) with slight modifications for compatibility with available gridded weather observations. The model combines relative humidity and air temperature into a single index (Ipb) that is used to estimate the risk of an outbreak. The equation describing the index is:',
          `<div class='pFormula'>Ipb = (T<sub>max</sub> - 86) + (T<sub>min</sub> - 68) + 0.5(RH<sub>89</sub> - 6)</div>`,
          'T<sub>max</sub> and T<sub>min</sub> are daily maximum and minimum temperature, respectively and RH<sub>89</sub> is the number of hours in the day that RH exceeds 89%.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the average of the index over previous 3 days exceeds 3.6. Moderate risk corresponds to 3-day average index values between 0.4 and 3.6. Low risk is assumed for 3-day average index values of 0.4 or less. In general, higher index values occur with higher temperatures and relative humidity.`,
          `The weekly index values reflect the longer-term persistence of Pythium Blight risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using the 7-day average rather than daily values. In general, <span style='color: red; font-weight: bold'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk, <span style='color: rgb(255,215,0); font-weight: bold'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold'>low weekly risk</span> indicates 2 or fewer days with moderate risk.`,
          `The weather data used to compute the Pythium Blight index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`,
        ],
        references: [
          '<b>Nutter, F.W., H. Cole, and R.D. Schein, 1983</b>: <i>Disease forecasting systems for warm weather pythium blight of turfgrass.</i> Plant Dis. 67:1126',
        ],
      },
      chart: {
        rows: [
          {
            rowName: 'Daily',
            data: 'pythiumBlight',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 3.6,
            },
          },
          {
            rowName: '7 Day Avg',
            data: 'pythiumBlight',
            thresholds: {
              low: 0.4,
              medium: 0,
              high: 3.6,
            },
          },
        ],
        legend: riskRanges,
        title: 'Pythium Blight Risk Estimates',
      },
      maps: [
        {
          title: 'Pythium Blight Risk Maps',
          thumbs: constructThumbs('pythium_blight', 'Pythium Blight Risk'),
        },
      ],
    },
  },
  {
    path: '/disease-stress/heat-stress',
    props: {
      pageType: 'risk',
      text: {
        titlePart: 'the Heat Stress Index',
        description: [
          'The Heat Stress Index is simply the number of nighttime (8 pm to 7 am) hours in which the temperature exceeds 69°F and the sum of temperature and relative humidity exceeds 150.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated for a heat stress index of 5 or more hours. <span style='color: rgb(255,215,0); font-weight: bold'>Moderate risk</span> is associated with a heat stress index of 2-4 hours. <span style='color: green; font-weight: bold'>Low risk</span> is assumed otherwise.`,
          `The weather data used to compute the Heat Stress Index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted heat stress uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`,
        ],
      },
      chart: {
        rows: [
          {
            rowName: 'Daily',
            data: 'heatStress',
            thresholds: {
              low: 2,
              medium: 0,
              high: 5,
            },
          },
        ],
        legend: riskRanges,
        title: 'Heat Stress Index Estimates',
      },
      maps: [
        {
          title: 'Heat Stress Index Maps',
          thumbs: constructThumbs('heat_stress', 'Heat Stress Risk'),
        },
      ],
    },
  },
  {
    path: '/seedhead-weed/dandelion',
    props: {
      pageType: 'seedWeed',
      text: {
        titlePart: 'Dandelion Control Recommendations',
        description: [
          'Dandelion Control Recommendations are based on accumulated Growing Degree Days (GDD).',
          `For 2,4-D + 2,4-DP Amine, <span style='font-weight: bold; color: red'>Early</span> indicates that application on Kentucky bluegrass (Poa pratensis L.) controls less that 60% of the dandelions present. This occurs with fewer than 150 accumulated base-50°F GDD. <span style='font-weight: bold; color:green;'>Favorable</span> control (> 80%) is indicated when GDD accumulation exceeds 180. Otherwise <span style='font-weight: bold; color:rgb(255,215,0);'>Marginal</span> control can be expected. These thresholds are based on (reference).`,
          `For 2,4-D + 2,4-DP Ester, <span style='font-weight: bold; color: red'>Early</span> indicates that application on Kentucky bluegrass (Poa pratensis L.) controls less that 60% of the dandelions present. This occurs with fewer than 130 accumulated base-50°F GDD. <span style='font-weight: bold; color:green;'>Favorable</span> control (> 80%) is indicated when GDD accumulation exceeds 145. Otherwise <span style='font-weight: bold; color:rgb(255,215,0);'>Marginal</span> control can be expected. These thresholds are based on (reference).`,
          `The weather data used to compute the Growing Degree Days (GDD) upon which these recomendations are based is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma">Real-time Mesoscale Analysis (RTMA)</a>. Forecasted recommendations use data from the <a href="https://www.weather.gov/mdl/ndfd_home">National Digital Forecast Database (NDFD)</a>.`,
        ],
      },
      chart: {
        rows: [
          {
            rowName: 'Amine',
            data: 'gdd50',
            colorizer: function (val: number) {
              let backgroundColor = 'rgb(0,170,0)';
              if (val < 150) {
                backgroundColor = 'rgb(255,0,0)';
              } else if (val < 180) {
                backgroundColor = 'rgb(255,215,0)';
              }
              return backgroundColor;
            },
          },
          {
            rowName: 'Ester',
            data: 'gdd50',
            colorizer: function (val: number) {
              let backgroundColor = 'rgb(0,170,0)';
              if (val < 130) {
                backgroundColor = 'rgb(255,0,0)';
              } else if (val < 145) {
                backgroundColor = 'rgb(255,215,0)';
              }
              return backgroundColor;
            },
          },
        ],
        legend: [
          ['Early', 'rgb(255,0,0)'],
          ['Marginal', 'rgb(255,215,0)'],
          ['Favorable', 'rgb(0,170,0)'],
        ],
        title: 'Dandelion Control Recommendations',
      },
      maps: [
        {
          title: 'Amine Maps',
          thumbs: constructThumbs('amine', 'Amine Dandelion Control'),
        },
        {
          title: 'Ester Maps',
          thumbs: constructThumbs('ester', 'Ester Dandelion Control'),
        },
      ],
    },
  },
  {
    path: '/seedhead-weed/seedhead',
    props: {
      pageType: 'seedWeed',
      text: {
        titlePart: 'Seedhead Control Recommendations',
        description: [
          'Base 32°F growing degree day (GDD) accumulation is an experimental measure for predicting ideal annual bluegrass seedhead development and potential treatment with plant growth regulators. Preliminary data suggests that the Ideal application is from 200 to 300 GDD for Proxy and 350 to 450 GDD for Embark. Control using Proxy is Marginal for GDD accumulations between 300 and 500. Marginal control using Embark can be obtained between 450 and 650 GDD. Otherwise the current state of seedhead development is either Too Early or Too Late for effective control.',
          `The weather data used to compute the Growing Degree Days (GDD) upon which these recomendations are based is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma">Real-time Mesoscale Analysis (RTMA)</a>. Forecasted recommendations use data from the <a href="https://www.weather.gov/mdl/ndfd_home">National Digital Forecast Database (NDFD)</a>.`,
        ],
      },
      chart: {
        rows: [
          {
            data: 'gdd32',
            rowName: 'Embark',
            colorizer: function (val: number) {
              let backgroundColor = 'rgb(170,170,170)';
              if (val < 350) {
                backgroundColor = 'rgb(255,0,0)';
              } else if (val < 450) {
                backgroundColor = 'rgb(0,170,0)';
              } else if (val < 650) {
                backgroundColor = 'rgb(255,215,0)';
              }
              return backgroundColor;
            },
          },
          {
            data: 'gdd32',
            rowName: 'Proxy',
            colorizer: function (val: number) {
              let backgroundColor = 'rgb(170,170,170)';
              if (val < 200) {
                backgroundColor = 'rgb(255,0,0)';
              } else if (val < 300) {
                backgroundColor = 'rgb(0,170,0)';
              } else if (val < 500) {
                backgroundColor = 'rgb(255,215,0)';
              }
              return backgroundColor;
            },
          },
        ],
        legend: [
          ['Too Early', 'rgb(255,0,0)'],
          ['Ideal', 'rgb(0,170,0)'],
          ['Marginal', 'rgb(255,215,0)'],
          ['Too Late', 'rgb(170,170,170)'],
        ],
        title: 'Seedhead Control Recommendations',
      },
      maps: [
        {
          title: 'Embark Maps',
          thumbs: constructThumbs('embark', 'Embark Seedhead Control'),
        },
        {
          title: 'Proxy Maps',
          thumbs: constructThumbs('proxy', 'Proxy Seedhead Control'),
        },
      ],
    },
  },
  {
    path: '/pollinator-protection',
    props: {
      pageType: 'pollinator',
      maps: [
        {
          title: 'Dandelion Flower Status',
          thumbs: constructThumbs('dandelion', 'Dandelion Flower Status maps'),
        },
        {
          title: 'White Clover Flower Status',
          thumbs: constructThumbs('clover', 'White Clover Flower Status maps'),
        },
      ],
      chart: {
        rows: [
          {
            rowName: 'Dandelion',
            data: 'gdd50',
            colorizer: function (val: number) {
              let backgroundColor = 'rgb(170,170,170)';
              if (val < 40) {
                backgroundColor = 'rgb(0,170,0)';
              } else if (val < 100) {
                backgroundColor = 'rgb(255,215,0)';
              } else if (val < 350) {
                backgroundColor = 'rgb(255,0,0)';
              }
              return backgroundColor;
            },
          },
          {
            rowName: 'White Clover',
            data: 'daylength',
            colorizer: function (val: number) {
              let backgroundColor = 'rgb(170,170,170)';
              if (val < 1) {
                backgroundColor = 'rgb(255,0,0)';
              } else if (val < 2) {
                backgroundColor = 'rgb(255,215,0)';
              } else if (val < 3) {
                backgroundColor = 'rgb(0,170,0)';
              }
              return backgroundColor;
            },
          },
        ],
        legend: [
          ['Not yet flowering', 'rgb(255,0,0)'],
          ['Beginning to flower', 'rgb(255,215,0)'],
          ['Flowering', 'rgb(0,170,0)'],
          ['No longer flowering', 'rgb(170,170,170)'],
        ],
        title: 'Pollinator Plants in the Lawn',
      },
    },
  },
  {
    path: '/season/gdd/32',
    props: {
      pageType: 'graph',
      chart: {
        data: 'gdd32',
        title: '32°F GDD Accumulation',
        rowNames: ['GDDs'],
      },
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/sgdd32.png',
          alt: '7 day base 32°F GDD accumulation',
          title: '7 day base 32°F GDD accumulation',
          description: [
            'This map shows base 32°F GDD accumulation since February 1.',
            'Growing degree days (GDD) are a means by which turf and weed development can be monitored. Base 32°F GDD accumulation is an experimental measure for predicting ideal annual bluegrass seedhead development and potential assessment with plant growth regulators. Preliminary data suggests that the ideal application time might be from 400 to 600 GDD for Proxy and 500 to 650 GDD for Embark.',
          ],
        },
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wgdd32fcst.png',
          alt: 'Forecast base 32°F GDD accumulation',
          title: 'Forecast base 32°F GDD accumulation',
          description: [
            'This map shows the forecast for base 32°F GDD accumulation over the next week. The forecast is based on guidance from the National Weather Service 7-day temperature forecast.',
            'Growing degree days (GDD) are a means by which turf and weed development can be monitored. Base 32°F GDD accumulation is an experimental measure for predicting ideal annual bluegrass seedhead development and potential assessment with plant growth regulators. Preliminary data suggests that the ideal application time might be from 400 to 600 GDD for Proxy and 500 to 650 GDD for Embark.',
          ],
        },
      ],
    },
  },
  {
    path: '/season/gdd/50',
    props: {
      pageType: 'graph',
      chart: {
        data: 'gdd50',
        title: '50°F GDD accumulation',
        rowNames: ['GDDs'],
      },
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wgdd.png',
          alt: '7 day base 50°F GDD accumulation',
          title: '7 day base 50°F GDD accumulation',
          description: [
            'Degree days are a means by which turf and weed development can be monitored.',
            'This map shows the number of base 50°F growing degree days (GDD) that have accumulated over the last 7 days.',
          ],
        },
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wgddfcst.png',
          alt: 'Base 50°F GDD accumulation forecast',
          title: 'Base 50°F GDD accumulation forecast',
          description: [
            'Degree days are a means by which turf and weed development can be monitored.',
            'This map shows the forecast for base 50°F GDD accumulation over the next week. The forecast is based on guidance from the National Weather Service 7-day temperature forecast.',
          ],
        },
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/sgdd.png',
          alt: 'Base 50°F GDD accumulation since March 15',
          title: 'Accumulation since March 15',
          description: [
            'Degree days are a means by which turf and weed development can be monitored.',
            'This map shows the total accumulation of base 50°F GDD from March 15 until the current day.',
          ],
        },
      ],
    },
  },
  {
    path: '/season/gdd/differences/gdd',
    props: {
      pageType: 'table',
      chart: {
        data: 'gdd50DiffGdds',
        title: '50°F GDD Differences (GDDs)',
        rowNames: ['Last Year', 'Normal'],
      },
      maps: [{
        url: 'http://turf.eas.cornell.edu/maps/gdds_last_year_map.png',
        alt: 'Difference in base 50°F GGD accumulation over last year',
        title: 'Difference from Last Year',
        description: [
          'Degree days are a means by which turf and weed development can be monitored.',
          'In terms of GDD, the comparisons are able to answer the question, "How different is the GDD accumulation in the current growing season from the same day in the previous season ?" A mapped value of -25 indicates that the GDD accummulation in the current year is 25 GGD less than was accumulated in the previous year. For example, if 48 GDD have accumulated by April 7 this year, a value of -25 would indicate that 73 GDD had already been accumulated by April 7 of the previous year.'
        ]
      },{
        url: 'http://turf.eas.cornell.edu/maps/gdds_normal_map.png',
        alt: 'Base 50°F GGD accumulation difference from "normal"',
        title: 'Difference from "Normal"',
        description: [
          'Degree days are a means by which turf and weed development can be monitored.',
          'In terms of GDD, the comparisons are able to answer the question, "When during an average growing season did the current 50°F GDD accumulation occur ?" A mapped value of 22 indicates that GDD accumulation in the current season is greater the historical average accumulation.',
          'For example, if 78 GDD have been accumulated by April 7 of the current year, a value of 22 would indicate that, historically, an average of only 56 GDD have accumulated by April 7.'
        ]
      }]
    }
  },
  {
    path: '/season/gdd/differences/days',
    props: {
      pageType: 'text',
      data: 'gdd50DiffDays',
      maps: [{
        url: 'http://turf.eas.cornell.edu/maps/days_last_year_map.png',
        alt: 'Difference in base 50°F GDD accumulation over last year',
        title: 'Difference from Last Year',
        description: [
          'Degree days are a means by which turf and weed development can be monitored.',
          `In terms of days, the GDD comparisons are able to answer the question, "When during the previous growing season did the current 50°F GDD accumulation occur ?" A mapped value of -7 indicates that the current season is 7 days behind the previous year's accumulation. If 58 GDD were accumulated on April 8, 2017, a value of -7 would indicate that 58 GDD had already been accumulated on April 1, 2016.`
        ]
      },{
        url: 'http://turf.eas.cornell.edu/maps/days_normal_map.png',
        alt: 'Base 50°F GDD accumulation difference from "normal"',
        title: 'Difference from "Normal"',
        description: [
          'Degree days are a means by which turf and weed development can be monitored.',
          'In terms of days, the GDD comparisons are able to answer the question, "When during an average growing season did the current 50°F GDD accumulation occur ?" A mapped value of -7 indicates that the current season is 7 days behind the average season accumulation.',
          'For example, if 58 GDD have accumulated by April 8 of this year, then a value of -7 would indicate that historically, an average of 58 GDD have already accumulated by April 1.'
        ]
      }]
    }
  },
  {
    path: '/season/temperature-departure',
    props: {
      pageType: 'table',
      chart: {
        data: 'temp',
        title: 'Temperature Depature',
        rowNames: ['Average', 'Departure'],
      },
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wtdpt.png',
          alt: 'Temperature departure (°F)',
          title: 'Temperature departure (°F)',
          description: [
            'The average of the temperatures over past 30 years on any particular day is commonly called the "normal". As depicted here, "departure" is the difference between the average temperature (°F) over the last 7 days and average of the normal temperatures for the same 7 days.',
            'Negative values indicate areas where temperatures are cooler than normal. Positive values indicate areas where temperatures are warmer than normal.',
          ],
        },
      ],
    },
  },
  {
    path: '/season/soil-temperature',
    props: {
      pageType: 'mapsOnly',
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/soilTemp.png',
          alt: 'Temperature (°F) of the soil 2" below the surface',
          title: 'Temperature (°F) of the soil 2" below the surface',
          description: ['Temperature (°F) of the soil 2" below the surface.'],
        },
      ],
    },
  },
  {
    path: '/irrigation/rainfall',
    props: {
      pageType: 'graph',
      chart: {
        data: 'precip',
        title: `Last Week's Rainfall Accumulation`,
        rowNames: ['Inches'],
      },
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wptot.png',
          alt: 'Total rainfall over the last 7 days',
          title: 'Total rainfall over the last 7 days',
          description: [
            'Gridded radar data and approximately 700 rain gauge sites are used to map the total rainfall (inches) observed over the last 7 days.',
          ],
        },
      ],
    },
  },
  {
    path: '/irrigation/lawn-watering-tool',
    props: {
      pageType: 'lawn-watering',
      chart: {
        data: 'temp',
        title: 'Water Deficit Forecast',
        rowNames: ['In./Ft. Soil'],
      },
      maps: [
        {
          url: '',
          alt: '',
          description: [],
        },
      ],
    },
  },
  {
    path: '/irrigation/evapotranspiration',
    props: {
      pageType: 'mapsOnly',
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wpet.png',
          alt: 'Total potential evapotranspiration (inches) over last 7 days',
          title: 'Total potential evapotranspiration (inches) over last 7 days',
          description: [
            'The Penman Monteith equation is used to calculate the total potential evapotranspiration (inches) over the last 7 days at approximately 200 sites used to generate this map.',
          ],
        },
      ],
    },
  },
  {
    path: '/irrigation/moisture-deficit',
    props: {
      pageType: 'mapsOnly',
      maps: [
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wdfct.png',
          alt: 'Moisture deficit over last 7 days',
          title: 'Observed Moisture Deficit',
          description: [
            'Moisture deficit is the difference between rainfall and evapotranspiration.',
            'This map depicts total moisture deficit for the past week. Negative values indicate that evapotranspiration exceeded precipitation. Positive values indicate the precipitation exceeded evapotranspiration.',
            'Data on this map is useful for assessing irrigation requirements.',
          ],
        },
        {
          url: 'https://www.nrcc.cornell.edu/dyn_images/grass/dfct_fcst.png',
          alt: 'Forecast moisture deficit over next 3 days',
          title: 'Moisture Deficit Forecast',
          description: [
            'Moisture deficit is the difference between rainfall and evapotranspiration.',
            'This map displays the forecast moisture deficit for the next 3-days. Negative values indicate that evapotranspiration will exceeded precipitation over the next 3 days. Positive values indicate the precipitation will exceed evapotranspiration.',
            'Data on this map is useful for assessing irrigation requirements.',
          ],
        },
      ],
    },
  },
  {
    path: '/irrigation/topsoil-moisture/forecast',
    props: {
      pageType: 'soilSat',
      maps: [
        {
          url: '',
          alt: '',
          description: [],
        },
      ],
    },
  },
  {
    path: '/irrigation/topsoil-moisture/current',
    props: {
      pageType: 'mapsOnly',
      maps: [
        {
          url: 'https://www.cpc.ncep.noaa.gov/products/monitoring_and_data/soilmmap.gif',
          alt: 'USDA Topsoil Moisture (% State Area)',
          title: 'USDA Topsoil Moisture (% State Area)',
          description: [],
        },
      ],
    },
  },
  {
    path: '/irrigation/topsoil-moisture/current-vs-10-year-mean',
    props: {
      pageType: 'mapsOnly',
      maps: [
        {
          url: 'https://www.cpc.ncep.noaa.gov/products/monitoring_and_data/10yrcomp.gif',
          alt: 'USDA Topsoil Moisture - Current vs. 10-year Mean',
          title: 'USDA Topsoil Moisture - Current vs. 10-year Mean',
          description: [],
        },
      ],
    },
  },
  {
    path: '/growth-potential',
    props: {
      pageType: 'growthPotential',
      maps: [
        {
          url: '',
          alt: '',
          description: [],
        },
      ],
    },
  },
  {
    path: '/runoff-risk',
    props: {
      pageType: 'runoffRisk',
      maps: [
        {
          url: '',
          alt: '',
          description: [],
        },
      ],
    },
  },
];

const frontPageMaps: HomeMap[] = routeInfo
  .map((page) => {
    return page.props.maps
      .map((m: MapThumbs | MapPageProps) => {
        if ('thumbs' in m) {
          return {
            path: page.path,
            url: m.thumbs[0].fullSizeUrl,
            alt: `Today's ` + m.title.slice(0, -1),
          };
        } else {
          return {
            path: page.path,
            url: m.url,
            alt: m.alt,
          };
        }
      })
      .filter((x: HomeMap) => x);
  })
  .flat();

export { routeInfo as AppRouteInfo, frontPageMaps };
