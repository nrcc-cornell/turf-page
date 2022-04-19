type MapPageProps = {
  url: string,
  alt: string,
  description: string[]
};

type PageProps = {
  page: 'seedhead' | ''
};

type RouteInfo = {
  path: string
  props: MapPageProps | PageProps
};

const routeInfo: RouteInfo[] = [
  {
    path: '/',
    props: {
      page: ''
    }
  },{
    path: '/disease/anthracnose',
    props: {
      page: ''
    }
  },{
    path: '/disease/brown-patch',
    props: {
      page: ''
    }
  },{
    path: '/disease/dollarspot',
    props: {
      page: ''
    }
  },{
    path: '/disease/pythium-blight',
    props: {
      page: ''
    }
  },{
    path: '/turf-weed/dandelion',
    props: {
      page: ''
    }
  },{
    path: '/turf-weed/seedhead',
    props: {
      page: 'seedhead'
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
      page: ''
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