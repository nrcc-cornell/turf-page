import { addDays, format } from 'date-fns';

type Thumb = {
  fullSizeUrl: string,
  thumbUrl: string,
  alt: string,
  date: string
};

type MapThumbs = {
  title: string,
  thumbs: Thumb[]
};

type MapPageProps = {
  url: string,
  alt: string,
  description: string[]
};

type TextProps = {
  titlePart: string,
  description: string[]
};

interface ReferencedTextProps extends TextProps {
  references: string[]
}

type ThresholdObj = {
  low: number,
  medium: number,
  high: number
};

type Row = {
  thresholds: ThresholdObj,
  name: string
}

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  data: number,
  colorizer: (val: number, thresholds: ThresholdObj) => string
};

type ToolPageProps = {
  text: TextProps | ReferencedTextProps,
  chart: ChartProps,
  maps: MapThumbs[]
};

type PropsType = MapPageProps | ToolPageProps;

type RouteInfo = {
  path: string
  props: PropsType
};


const constructThumbs = (type: string, variety: string, name: string): Thumb[] => {
  const today = new Date();
  const thumbs: Thumb[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);

    thumbs.push({
      date: format(date, 'MM/dd/yy'),
      thumbUrl: `http://turf.eas.cornell.edu/app_data/NE/${date.getFullYear()}/thumbs/${type}/${variety}/${format(date, 'yyyyMMdd')}-${name}-Thumbnail.png`,
      fullSizeUrl: `http://turf.eas.cornell.edu/app_data/NE/${date.getFullYear()}/maps/${type}/${variety}/${format(date, 'yyyyMMdd')}-${name}-Map.png`,
      alt: `link to ${name.replaceAll('-', ' ')} map for ${format(date, 'MMMM do yyyy')}`
    });
  }

  return thumbs;
};



const routeInfo: RouteInfo[] = [
  {
    path: '/disease/anthracnose',
    props: {
      text: {
        titlePart: 'Anthracnose Disease Risk',
        description: [
          'The Anthracnose risk index is based on the model of <i>Danneberger et al. (1984)</i> (see references below) with slight modifications for compatibility with available gridded weather observations. The model combines leaf wetness (Lw) and air temperature (T) into a single index (Ia) that is used to estimate the risk of an outbreak. The equation describing the index is:',
          `<span style='font-style: italic;margin-left: 20px;'>Ia = 4.0233 - 0.2283(Lw) - 0.5303(T) - 0.0013(Lw<sup>2</sup>) + 0.0197(T<sup>2</sup>) + 0.0155(T × Lw)`,
          'Lw is the average number of hours per day that leaf wetness was present during the previous three days. Any hourly weather observation that reports either rainfall or a dew point that is less than three degrees (°C) lower than the air temperature indicates leaf wetness, indicates the occurrence leaf wetness during that hour and the next hour. T is the average air temperature (°C) for the previous three days.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the index exceeds 1.5. <span style='color: gold; font-weight: bold'>Moderate risk</span> corresponds to index values between 0.4 and 1.5. <span style='color: green; font-weight: bold'>Low risk</span> is assumed for index values of 0.4 or less. In general higher index values occur with higher temperatures and more prolonged leaf wetness.`,
          `The weekly index values reflect the longer-term persistence of Anthracnose risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using 7-day averages rather than daily values. In general, <span style='color: red; font-weight: bold'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk, <span style='color: gold; font-weight: bold'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold'>low weekly risk</span> indicates 2 or fewer days of moderate risk.`,
          `The weather data used to compute the Anthracnose index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`
        ],
        references: [
          'Danneberger, T.K., J.M. Vargas Jr., and A.L. Jones, 1984: <i>A model for weather-based forecasting of anthracnose on annual bluegrass.</i> Phytopathology, 74, 448-451'
        ]
      },
      chart: {
        data: 32,
        rows: [{
          thresholds: {
            low: 0,
            medium: 0,
            high: 0
          },
          name: ''
        }],
        ranges: [],
        title: '',
        colorizer: function(val: number, thresholds: ThresholdObj) {
          return '';
        }
      },
      maps: []
    }
  },{
    path: '/disease/brown-patch',
    props: {
      text: {
        titlePart: 'Brown Patch Disease Risk',
        description: [
          'The Brown Patch risk index is based on the model of <i>Fidanza et al. (1996)</i> (see reference below) with slight modifications for compatibility with available gridded weather observations. The model uses a combines relative humidity (RH), leaf wetness (Lw) and daily minimum air temperature (Tmin) into a single index (Ibp) the is used to estimate the risk of an outbreak. The equation describing the index is:',
          `<span style='font-style: italic;margin-left: 20px;'>Ibp = RH<sub>80</sub> + RH<sub>95</sub> + Lw + Tmin</span>`,
          `RH<sub>80</sub> equals 1 when the daily average relative humidity is 80 or above, otherwise it is set to 0. RH<sub>95</sub> is assigned a value 1 if more than 4 hourly RH values in a day exceed 95 and a value of 2 if 8 or more hours exceed 95, otherwise it is set to zero. Lw is set to 1 when leaf wetness is present during 10 or more hours in a day, otherwise it is assigned a value of 0. Any hourly weather observation that reports either rainfall or a dew point that is less than three degrees (°C) lower than the air temperature indicates that leaf wetness occurred during that hour and the next hour.`,
          'From July 1 to September 30 Tmin is assigned a value of -2. Prior to July 1 and after September 30, the value of Tmin is -4. Regardless of date, on days when the minimum temperature is 16°C (60.8°F) or higher Tmin is assigned a value of 1.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the average of the index over the previous 3 days exceeds 0.9. <span style='color: gold; font-weight: bold'>Moderate risk</span> corresponds to 3-day average index values between 0.4 and 0.9. <span style='color: green; font-weight: bold'>Low risk</span> is assumed for 3-day average index values of 0.4 or less. In general higher index values occur with higher temperatures, more prolonged leaf wetness and higher relative humidity.`,
          `The weekly index values reflect the longer-term persistence of brown patch risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using the 7-day averages rather than daily values. In general, <span style='color: red; font-weight: bold;'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk <span style='color: gold; font-weight: bold;'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold;'>low weekly risk</span> indicates 2 or fewer days with moderate risk.`,
          `The weather data used to compute the Brown Patch index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`
        ],
        references: [
          `Fidanza, M.A. P.H. Dernoeden, and A. P. Grybauskas, 1996: <i>Development and field validation of a brown patch warning model for perennial ryegrass turf.</i> Phytopathology 86, 385-390. Plant Disease, 67: 1126-1129`
        ]
      },
      chart: {
        data: 32,
        rows: [{
          thresholds: {
            low: 0,
            medium: 0,
            high: 0
          },
          name: ''
        }],
        ranges: [],
        title: '',
        colorizer: function(val: number, thresholds: ThresholdObj) {
          return '';
        }
      },
      maps: []
    }
  },{
    path: '/disease/dollarspot',
    props: {
      text: {
        titlePart: 'Dollarspot Disease Risk',
        description: [
          `The Dollarspot risk index is based on the models of <i>Mills and Rothwell and Hall, R.</i> (see references below) with slight modifications for compatibility with available gridded weather observations. The model combines relative humidity (RH) leaf wetness (Lw), air temperature (T) and number of consecutive days with rainfall into a single index (Id) that is used to estimate the risk of an outbreak. The equation describing the index is:`,
          `<span style='font-style: italic;margin-left: 20px;'>Ia = Drh + Dlw + Drain</span>`,
          'Each variable in the equation is originally set to zero. Drh is set to 1 when 3 or more hours during the previous seven days had both an RH of greater than 90% and a temperature greater than 25°C (77°F). Dlw is set to 1 if the average daily temperature exceeds 15°C (59°F) and the average number of hours per day that leaf wetness was present during the previous 3 days exceeds 8. Any hourly weather observation that reports either rainfall or a dew point that is less than three degrees (°C) lower than the air temperature indicates the occurrence leaf wetness during that hour and the next hour. Drain is assigned a value of 1 under two conditions: a) when three or more consecutive days received rainfall and the average temperature on these days exceeded 15°C (59°F) b) when two or more consecutive days received rainfall and the average temperature on these days exceeded 20°C (68°F).',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the average of the index over previous 3 days exceeds 0.7. <span style='color: gold; font-weight: bold'>Moderate risk</span> corresponds to 3-day average index values between 0.4 and 0.7. <span style='color: green; font-weight: bold'>Low risk</span> is assumed for 3-day average index values of 0.4 or less. In general higher index values occur with warmer and wetter conditons.`,
          `The weekly index values reflect the longer-term persistence of Dollarspot risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using the 7-day average rather than daily values. In general, <span style='color: red; font-weight: bold'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk, <span style='color: gold; font-weight: bold'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold'>low weekly risk</span> indicates 2 or fewer days with moderate risk.`,
          `The weather data used to compute the Dollarspot index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`
        ],
        references: [
          'Mills, S.G. and Rothwell, J.D. 1982: <i>Predicting diseases - the hygrothermograph.</i> Greenmaster, 18(4), 14-15',
          'Hall, R. 1984: <i>Relationship between weather factors and dollar spot of creeping bentgrass.</i> Can. J. Plant Sci. 64: 167-174'
        ]
      },
      chart: {
        data: 32,
        rows: [{
          thresholds: {
            low: 0,
            medium: 0,
            high: 0
          },
          name: ''
        }],
        ranges: [],
        title: '',
        colorizer: function(val: number, thresholds: ThresholdObj) {
          return '';
        }
      },
      maps: []
    }
  },{
    path: '/disease/pythium-blight',
    props: {
      text: {
        titlePart: 'Pythium Blight Disease Risk',
        description: [
          'The Pythium Blight risk index is based on the model of <i>Nutter et al. (1983)</i> (see references below) with slight modifications for compatibility with available gridded weather observations. The model combines relative humidity and air temperature into a single index (Ipb) that is used to estimate the risk of an outbreak. The equation describing the index is:',
          `<span style='font-style: italic;margin-left: 20px;'>Ipb = (T<sub>max</sub> - 86) + (T<sub>min</sub> - 68) + 0.5(RH<sub>89</sub> - 6)</span>`,
          'T<sub>max</sub> and T<sub>min</sub> are daily maximum and minimum temperature, respectively and RH<sub>89</sub> is the number of hours in the day that RH exceeds 89%.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated when the average of the index over previous 3 days exceeds 3.6. Moderate risk corresponds to 3-day average index values between 0.4 and 3.6. Low risk is assumed for 3-day average index values of 0.4 or less. In general, higher index values occur with higher temperatures and relative humidity.`,
          `The weekly index values reflect the longer-term persistence of Pythium Blight risk. They are simply a 7-day average of the daily index values. High, Moderate and low risk are based on the same index thresholds, but using the 7-day average rather than daily values. In general, <span style='color: red; font-weight: bold'>high weekly risk</span> indicates consistent (4 or more days) of moderate to high daily risk, <span style='color: gold; font-weight: bold'>moderate weekly risk</span> indicates 2 or 3 days of moderate to high daily risk and <span style='color: green; font-weight: bold'>low weekly risk</span> indicates 2 or fewer days with moderate risk.`,
          `The weather data used to compute the Pythium Blight index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted risk uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`
        ],
        references: [
          'Nutter, F.W., H. Cole, and R.D. Schein, 1983: <i>Disease forecasting systems for warm weather pythium blight of turfgrass.</i> Plant Dis. 67:1126'
        ]
      },
      chart: {
        data: 32,
        rows: [{
          thresholds: {
            low: 0,
            medium: 0,
            high: 0
          },
          name: ''
        }],
        ranges: [],
        title: '',
        colorizer: function(val: number, thresholds: ThresholdObj) {
          return '';
        }
      },
      maps: []
    }
  },{
    path: '/turf-weed/dandelion',
    props: {
      text: {
        titlePart: 'Dandelion Control Recommendations',
        description: [
          'Dandelion Control Recommendations are based on accumulated Growing Degree Days (GDD).',
          `For 2,4-D + 2,4-DP Amine, <span style='font-weight: bold; color: red'>Early</span> indicates that application on Kentucky bluegrass (Poa pratensis L.) controls less that 60% of the dandelions present. This occurs with fewer than 150 accumulated base-50°F GDD. <span style='font-weight: bold; color:green;'>Favorable</span> control (> 80%) is indicated when GDD accumulation exceeds 180. Otherwise <span style='font-weight: bold; color:gold;'>Marginal</span> control can be expected. These thresholds are based on (reference).`,
          `For 2,4-D + 2,4-DP Ester, <span style='font-weight: bold; color: red'>Early</span> indicates that application on Kentucky bluegrass (Poa pratensis L.) controls less that 60% of the dandelions present. This occurs with fewer than 130 accumulated base-50°F GDD. <span style='font-weight: bold; color:green;'>Favorable</span> control (> 80%) is indicated when GDD accumulation exceeds 145. Otherwise <span style='font-weight: bold; color:gold;'>Marginal</span> control can be expected. These thresholds are based on (reference).`,
          `The weather data used to compute the Growing Degree Days (GDD) upon which these recomendations are based is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma">Real-time Mesoscale Analysis (RTMA)</a>. Forecasted recommendations use data from the <a href="https://www.weather.gov/mdl/ndfd_home">National Digital Forecast Database (NDFD)</a>.`
        ]
      },
      chart: {
        data: 50,
        rows: [{
          thresholds: {
            low: 150,
            medium: 180,
            high: 0
          },
          name: 'Amine'
        },{
          thresholds: {
            low: 130,
            medium: 145,
            high: 0
          },
          name: 'Ester'
        }],
        colorizer: function(val: number, thresholds: ThresholdObj) {
          let backgroundColor = 'rgb(0,170,0)';
          if (val < thresholds.low) {
            backgroundColor = 'rgb(255,0,0)';
          } else if (val < thresholds.medium) {
            backgroundColor = 'gold';
          }
          return backgroundColor;
        },
        ranges: [['Early', 'rgb(255,0,0)'], ['Marginal', 'gold'], ['Favorable', 'rgb(0,170,0)']],
        title: 'Dandelion Control Recommendations'
      },
      maps: [{
        title: 'Amine Maps',
        thumbs: constructThumbs('Dandelion', 'Amine', 'Amine-Dandelion-Control')
      },{
        title: 'Ester Maps',
        thumbs: constructThumbs('Dandelion', 'Ester', 'Ester-Dandelion-Control')
      }]
    }
  },{
    path: '/turf-weed/seedhead',
    props: {
      text: {
        titlePart: 'Seedhead Control Recommendations',
        description: [
          'Base 32°F growing degree day (GDD) accumulation is an experimental measure for predicting ideal annual bluegrass seedhead development and potential treatment with plant growth regulators. Preliminary data suggests that the Ideal application is from 200 to 300 GDD for Proxy and 350 to 450 GDD for Embark. Control using Proxy is Marginal for GDD accumulations between 300 and 500. Marginal control using Embark can be obtained between 450 and 650 GDD. Otherwise the current state of seedhead development is either Too Early or Too Late for effective control.',
          `The weather data used to compute the Growing Degree Days (GDD) upon which these recomendations are based is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma">Real-time Mesoscale Analysis (RTMA)</a>. Forecasted recommendations use data from the <a href="https://www.weather.gov/mdl/ndfd_home">National Digital Forecast Database (NDFD)</a>.`
        ]
      },
      chart: {
        data: 32,
        rows: [{
          thresholds: {
            low: 350,
            medium: 450,
            high: 650
          },
          name: 'Embark'
        },{
          thresholds: {
            low: 200,
            medium: 300,
            high: 500
          },
          name: 'Proxy'
        }],
        ranges: [['Too Early', 'rgb(255,0,0)'], ['Ideal', 'rgb(0,170,0)'], ['Marginal', 'gold'], ['Too Late', 'rgb(170,170,170)']],
        title: 'Seedhead Control Recommendations',
        colorizer: function(val: number, thresholds: ThresholdObj) {
          let backgroundColor = 'rgb(170,170,170)';
          if (val < thresholds.low) {
            backgroundColor = 'rgb(255,0,0)';
          } else if (val < thresholds.medium) {
            backgroundColor = 'rgb(0,170,0)';
          } else if (val < thresholds.high) {
            backgroundColor = 'gold';
          }
          return backgroundColor;
        }
      },
      maps: [{
        title: 'Embark Maps',
        thumbs: constructThumbs('Seedhead', 'Embark', 'Embark-Seedhead-Control')
      },{
        title: 'Proxy Maps',
        thumbs: constructThumbs('Seedhead', 'Proxy', 'Proxy-Seedhead-Control')
      }]
    }
  },{
    path: '/turf-weed/gdd/accumulation',
    props: {
      url: 'https://www.nrcc.cornell.edu/dyn_images/grass/sgdd32.png',
      alt: '7 Day average base 32°F GDD accumulation',
      description: [
        'This map shows base 32°F GDD accumulation since February 1.',
        'Growing degree days (GDD) are a means by which turf and weed development can be monitored. Base 32°F GDD accumulation is an experimental measure for predicting ideal annual bluegrass seedhead development and potential assessment with plant growth regulators. Preliminary data suggests that the ideal application time might be from 400 to 600 GDD for Proxy and 500 to 650 GDD for Embark.'
      ]
    }
  },{
    path: '/turf-weed/gdd/forecast',
    props: {
      url: 'https://www.nrcc.cornell.edu/dyn_images/grass/wgdd32fcst.png',
      alt: 'Forecast base 32°F GDD accumulation',
      description: [
        'This map shows the forecast for base 32°F GDD accumulation over the next week. The forecast is based on guidance from the National Weather Service 7-day temperature forecast.',
        'Growing degree days (GDD) are a means by which turf and weed development can be monitored. Base 32°F GDD accumulation is an experimental measure for predicting ideal annual bluegrass seedhead development and potential assessment with plant growth regulators. Preliminary data suggests that the ideal application time might be from 400 to 600 GDD for Proxy and 500 to 650 GDD for Embark.'
      ]
    }
  },{
    path: '/irrigation/rainfall',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/wptot.png',
      alt: 'Total rainfall over the last 7 days',
      description: [
        'Approximately 700 rain gauge sites are used to map the total rainfall (inches) observed over the last 7 days.'
      ]
    }
  },{
    path: '/irrigation/evapotranspiration',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/wpet.png',
      alt: 'Total potential evapotranspiration (inches) over last 7 days',
      description: [
        'The Penman Monteith equation is used to calculate the total potential evapotranspiration (inches) over the last 7 days at approximately 200 sites used to generate this map.'
      ]
    }
  },{
    path: '/irrigation/moisture-deficit',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/wdfct.png',
      alt: 'Moisture deficit over last 7 days',
      description: [
        'Moisture deficit is the difference between rainfall and evapotranspiration.',
        'This map depicts total mositure deficet for the past week. Negative values indicate that evapotranspiration exceeded precipitation. Positive values indicate the precipitation exceeded evapotranspiration.',
        'Data on this map is useful for assessing irrigation requirements.'
      ]
    }
  },{
    path: '/irrigation/topsoil-moisture/current',
    props: {
      url: 'http://www.cpc.ncep.noaa.gov/products/monitoring_and_data/soilmmap.gif',
      alt: 'USDA Topsil Moisture (% State Area)',
      description: []
    }
  },{
    path: '/irrigation/topsoil-moisture/current-vs-5-year-mean',
    props: {
      url: 'http://www.cpc.ncep.noaa.gov/products/monitoring_and_data/5yrcomp.gif',
      alt: 'USDA Topsil Moisture - Current vs. 5-year Mean',
      description: []
    }
  },{
    path: '/irrigation/topsoil-moisture/current-vs-10-year-mean',
    props: {
      url: 'http://www.cpc.ncep.noaa.gov/products/monitoring_and_data/10yrcomp.gif',
      alt: 'USDA Topsil Moisture - Current vs. 10-year Mean',
      description: []
    }
  },{
    path: '/50gdd/7-day',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/wgdd.png',
      alt: '7 Day average base 50°F GDD accumulation',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        'This map shows the number of base 50°F growing degree days (GDD) that have accumulated over the last 7 days.'
      ]
    }
  },{
    path: '/50gdd/forecast',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/wgddfcst.png',
      alt: 'Base 50°F GDD accumulation forecast',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        'This map shows the forecast for base 50°F GDD accumulation over the next week. The forecast is based on guidance from the National Weather Service 7-day temperature forecast.'
      ]
    }
  },{
    path: '/50gdd/since',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/sgdd.png',
      alt: 'Base 50°F GDD accumulation since March 15',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        'This map shows the total accumulation of base 50°F GDD from March 15 until the current day.'
      ]
    }
  },{
    path: '/50gdd/difference/year/days',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/sgdifd.png',
      alt: 'Difference in base 50°F GDD accumulation over last year',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        `In terms of days, the GDD comparisons are able to answer the question, "When during the previous growing season did the current 50°F GDD accumulation occur ?" A mapped value of -7 indicates that the current season is 7 days behind the previous year's accumulation. If 58 GDD were accumulated on April 7, 2017, a value of -7 would indicate that 58 GDD had already been accumulated on April 1, 2016.`
      ]
    }
  },{
    path: '/50gdd/difference/year/gdd',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/sgdifg.png',
      alt: 'Difference in base 50°F GGD accumulation over last year',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        'In terms of GDD, the comparisons are able to answer the question, "How different is the GDD accumulation in the current growing season from the same day in the previous season ?" A mapped value of -25 indicates that the GDD accummulation in the current year is 25 GGD less than was accumulated in the previous year. For example, if 48 GDD have accumulated by April 7 this year, a value of -25 would indicate that 73 GDD had already been accumulated by April 7 of the previous year.'
      ]
    }
  },{
    path: '/50gdd/difference/normal/days',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/sgdptd.png',
      alt: 'Base 50°F GDD accumulation difference from "normal"',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        'In terms of days, the GDD comparisons are able to answer the question, "When during an average growing season did the current 50°F GDD accumulation occur ?" A mapped value of -7 indicates that the current season is 7 days behind the average season accumulation.',
        'For example, if 58 GDD have accumulated by April 7 of this year, then a value of -7 would indicate that historically, an average of 58 GDD have already accumulated by April 1.'
      ]
    }
  },{
    path: '/50gdd/difference/normal/gdd',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/sgdptg.png',
      alt: 'Base 50°F GGD accumulation difference from "normal"',
      description: [
        'Degree days are a means by which turf and weed development can be monitored.',
        'In terms of GDD, the comparisons are able to answer the question, "When during an average growing season did the current 50°F GDD accumulation occur ?" A mapped value of 22 indicates that GDD accumulation in the current season is greater the historical average accumulation.',
        'For example, if 78 GDD have been accumulated by April 7 of the current year, a value of 22 would indicate that, historically, an average of only 53 GDD have accumulated by April 7.'
      ]
    }
  },{
    path: '/temperature/heat-stress',
    props: {
      text: {
        titlePart: 'the Heat Stress Index',
        description: [
          'The Heat Stress Index is simply the number of nighttime (8 pm to 7 am) hours in which the temperature exceeds 69°F and the sum of temperature and relative humidity exceeds 150.',
          `On a daily basis, <span style='color: red; font-weight: bold'>high risk</span> is indicated for a heat stress index of 5 or more hours. <span style='color: gold; font-weight: bold'>Moderate risk</span> is associated with a heat stress index of 2-4 hours. <span style='color: green; font-weight: bold'>Low risk</span> is assumed otherwise.`,
          `The weather data used to compute the Heat Stress Index is from the National Weather Service's <a href="http://www.nco.ncep.noaa.gov/pmb/products/rtma"> Real-time Mesoscale Analysis (RTMA)</a>. Forecasted heat stress uses data from the <a href="https://www.weather.gov/mdl/ndfd_home"> National Digital Forecast Database (NDFD)</a>.`
        ]
      },
      chart: {
        data: 32,
        rows: [{
          thresholds: {
            low: 0,
            medium: 0,
            high: 0
          },
          name: ''
        }],
        ranges: [],
        title: '',
        colorizer: function(val: number, thresholds: ThresholdObj) {
          return '';
        }
      },
      maps: []
    }
  },{
    path: '/temperature/departure',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/wtdpt.png',
      alt: 'Temperature departure (°F)',
      description: [
        'The average of the temperatures over past 30 years on any particular day is commonly called the "normal". As depicted here, "departure" is the difference between the average temperature (°F) over the last 7 days and average of the normal temperatures for the same 7 days.',
        'Negative values indicate areas where temperatures are cooler than normal. Positive values indicate areas where temperatures are warmer than normal.'
      ]
    }
  },{
    path: '/temperature/soil',
    props: {
      url: 'http://www.nrcc.cornell.edu/dyn_images/grass/soilTemp.png',
      alt: 'Temperature (°F) of the soil 2" below the surface',
      description: [
        'Temperature (°F) of the soil 2" below the surface.'
      ]
    }
  }
];



export default routeInfo;