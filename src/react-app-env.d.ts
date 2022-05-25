/// <reference types="react-scripts" />

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  colorizer: (val: number, thresholds: ThresholdObj) => string
}

type ContextType = {
  id: string,
  wikidata?: string,
  text: string,
  short_code?: string
}

type DataType = DataMapsOnly | DataRisk | DataGraph;

type DataMapsOnly = {
  maps: MapPageProps[],
  pageType: 'mapsOnly'
};

type DataGraph = {
  maps: MapPageProps[],
  pageType: 'graph',
  chart: {
    data: 'gdd32' | 'gdd50',
    title: string
  }
};

type DataRisk = {
  maps: MapThumbs[],
  pageType: 'risk',
  chart: RiskChartProps,
  text: TextProps
};

type DataAndFromAcis = {
  data: GDDObj | Tool | HSTool | null,
  todayFromAcis: boolean
};

type DateValue = [ Date, number ];

type DayValues = {
  anthracnose: StrDateValue[],
  brownPatch: StrDateValue[],
  dollarspot: StrDateValue[],
  pythiumBlight: StrDateValue[],
  heatStress: StrDateValue[]
};

type DailyChartProps = ChartProps & DataAndFromAcis;

type DisplayProps = {
    currentLocation: UserLocation,
    pastLocations: UserLocation[],
    handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void
};

type GDDObj = {
  hasToday: boolean,
  current: StrDateValue[],
  last: StrDateValue[],
  normal: StrDateValue[]
};

type HomeMap = {
  path: string,
  url: string,
  alt: string
};

type HSTool = {
  Daily: DateValue[],
  season: StrDateValue[]
};

type ImgOptions = {
  href: string;
  src: string;
  alt: string;
  width: number;
  rounded?: boolean;
}

type Indices = {
  anthracnose: Tool,
  brownPatch: Tool,
  dollarspot: Tool,
  pythiumBlight: Tool,
  heatStress: HSTool
};

type ListChartProps = {
  data: StrDateValue[] | null,
  todayFromAcis: boolean,
  title: string
};

type MapBarProps = {
  token: string,
  bounds: {
    south: number,
    west: number
  },
  handleChangeLocations: (a: 'add' | 'change' | 'remove', b: UserLocation) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapRef: any
};

type MapPageProps = {
  url: string,
  alt: string,
  description: string[],
  title?: string,
  mainSX?: {
    [key: string]: string | number
  }
};

type MapProps = {
  currentLocation: UserLocation,
  pastLocations: UserLocation[],
  handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void
};

type MapThumbProps = {
  date: string,
  thumbUrl: string,
  fullSizeUrl: string,
  alt: string,
  border: string,
  changeMap: () => void
};

type MapThumbs = {
  title: string,
  thumbs: Thumb[]
};

type MarkersProps = {
  onMarkerMouseEnter: (a: PopupContent) => void
  onMarkerMouseLeave: () => void
  onMarkerClick: (a: mapboxgl.MapboxEvent<MouseEvent>, b: UserLocation) => void
  onMarkerRightClick: (a: UserLocation, b: boolean) => void
  currentLocation: UserLocation
  pastLocations: UserLocation[]
};

type MenuObj = {
  base: string;
  name: string;
  icon: JSX.Element;
  items: NavItem[];
};

type ModalProps = {
    currentLocation: UserLocation,
    pastLocations: UserLocation[],
    handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void
};

type MultiMapPage = {
  maps: MapPageProps[]
};

type NavBarProp = {
  group: {
    base: string;
    name: string;
    icon: JSX.Element;
    items: {
      pathname: string;
      label: string;
    }[];
  }
};

type NavItem = {
  pathname: string;
  label: string;
};

type RiskChartProps = ChartProps & {
  data: 'gdd32' | 'gdd50' | 'anthracnose' | 'brownPatch' | 'dollarspot' | 'pythiumBlight' | 'heatStress'
};

type PopupContent = UserLocation & {
  isSelected: boolean
};

type RiskMapsProps = {
  maps: MapThumbs[],
  text: TextProps
};

type RouteInfo = {
  path: string
  props: DataType
};

type Row = {
  thresholds: ThresholdObj,
  name: string
}

type SeasonChartProps = {
  data: StrDateValue[],
  colorizer: (val: number, thresholds: ThresholdObj) => string,
  thresholds: ThresholdObj
};

type StrDateValue = [ string, number ];

type TextProps = {
  titlePart: string,
  description: string[],
  references?: string[]
};

type ThresholdObj = {
  low: number,
  medium: number,
  high: number
};

type Thumb = {
  fullSizeUrl: string,
  thumbUrl: string,
  alt: string,
  date: string
};

type Toggle = {
  type: string;
};

type Tool = HSTool & {
  '7 Day Avg': DateValue[]
};

type ToolData = Indices & {
  gdd32: GDDObj,
  gdd50: GDDObj,
  todayFromAcis: boolean
};

type UserLocation = {
  address: string,
  lngLat: [number,number]
};

type WeekMapsProps = {
  title: string,
  thumbs: Thumb[]
};