/// <reference types="react-scripts" />

type ChartProps = {
  rows: Row[];
  ranges: string[][];
  title: string;
};

type Colorizer = (val: number, thresholds: ThresholdObj) => string;

type ConditionTextProps = {
  fromLast: number;
  fromNormal: number;
};

type ContextType = {
  id: string;
  wikidata?: string;
  text: string;
  short_code?: string;
};

type DataType =
  | DataMapsOnly
  | DataRisk
  | DataSeedWeed
  | DataGraph
  | DataTable
  | DataText
  | DataGrowthPotential;

type DataGrowthPotential = {
  pageType: 'growthPotential';
  maps: MapPageProps[];
};

type DataMapsOnly = {
  maps: MapPageProps[];
  pageType: 'mapsOnly';
};

type DataGraph = {
  maps: MapPageProps[];
  pageType: 'graph';
  chart: {
    data: 'gdd32' | 'gdd50' | 'precip';
    title: string;
    rowNames: string[];
  };
};

type DataTable = {
  maps: MapPageProps[];
  pageType: 'table';
  chart: {
    data: 'gdd50DiffGdds' | 'temp';
    title: string;
    rowNames: string[];
  };
};

type DataText = {
  maps: MapPageProps[];
  pageType: 'text';
  data: 'gdd50DiffDays';
};

type DataRisk = {
  maps: MapThumbs[];
  pageType: 'risk';
  chart: RiskChartProps;
  text: TextProps;
};

type DataSeedWeed = {
  maps: MapThumbs[];
  pageType: 'seedWeed';
  chart: SeedWeedChartProps;
  text: TextProps;
};

type DataAndFromAcis = {
  data: GraphDataObj | RiskTool | HSTool | null;
  todayFromAcis: boolean;
};

type DateValue = [Date, number];

type DayValues = {
  anthracnose: StrDateValue[];
  brownPatch: StrDateValue[];
  dollarspot: StrDateValue[];
  pythiumBlight: StrDateValue[];
  heatStress: StrDateValue[];
};

type DailyChartProps = ChartProps & DataAndFromAcis & { colorizer: Colorizer };

type DisplayProps = {
  currentLocation: UserLocation;
  pastLocations: UserLocation[];
  handleChangeLocations: (
    a: 'add' | 'remove' | 'change',
    b: UserLocation
  ) => void;
};

type OtherTool = {
  current: StrDateValue[];
  last: StrDateValue[];
  normal: StrDateValue[];
};

type TableData = {
  table: StrDateValue[][];
};

type GraphDataObj = TableData & OtherTool;

type GraphDataResults = {
  gdd32: GraphDataObj;
  gdd50: GraphDataObj;
  gdd50DiffGdds: TableData;
  gdd50DiffDays: TableData;
  precip: GraphDataObj;
  temp: TableData;
  todayFromAcis: boolean;
};

type GridDatum = [string, number, number, number, number];

type HomeMap = {
  path: string;
  url: string;
  alt: string;
};

type HSTool = {
  // Daily: DateValue[],
  season: StrDateValue[];
};

type ImgOptions = {
  href: string;
  src: string;
  alt: string;
  width: number;
  rounded?: boolean;
};

type Indices = {
  anthracnose: RiskTool;
  brownPatch: RiskTool;
  dollarspot: RiskTool;
  pythiumBlight: RiskTool;
  heatStress: HSTool;
};

type ListChartProps = {
  data: StrDateValue[][] | null;
  todayFromAcis: boolean;
  title: string;
  rowNames: string[];
};

type MapBarProps = {
  token: string;
  bounds: {
    south: number;
    west: number;
  };
  handleChangeLocations: (
    a: 'add' | 'change' | 'remove',
    b: UserLocation
  ) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapRef: any;
};

type MapPageProps = {
  url: string;
  alt: string;
  description: string[];
  title?: string;
  mainSX?: {
    [key: string]: string | number;
  };
};

type MapProps = {
  currentLocation: UserLocation;
  pastLocations: UserLocation[];
  handleChangeLocations: (
    a: 'add' | 'remove' | 'change',
    b: UserLocation
  ) => void;
};

type GPMapProps = MapProps & {
  imgsrc: string;
};

type MapThumbProps = {
  date: string;
  thumbUrl: string;
  fullSizeUrl: string;
  alt: string;
  border: string;
  changeMap: () => void;
};

type MapThumbs = {
  title: string;
  thumbs: ThumbUrls[];
};

type MarkersProps = {
  onMarkerMouseEnter: (a: PopupContent) => void;
  onMarkerMouseLeave: () => void;
  onMarkerClick: (a: mapboxgl.MapboxEvent<MouseEvent>, b: UserLocation) => void;
  onMarkerRightClick: (a: UserLocation, b: boolean) => void;
  currentLocation: UserLocation;
  pastLocations: UserLocation[];
};

type MenuObj = {
  base: string;
  name: string;
  icon: JSX.Element;
  items: NavItem[];
};

type ModalProps = {
  currentLocation: UserLocation;
  pastLocations: UserLocation[];
  handleChangeLocations: (
    a: 'add' | 'remove' | 'change',
    b: UserLocation
  ) => void;
};

type MultiMapPage = {
  maps: MapPageProps[];
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
  };
};

type NavItem = {
  pathname: string;
  label: string;
};

type RiskChartProps = ChartProps & {
  data:
    | 'anthracnose'
    | 'brownPatch'
    | 'dollarspot'
    | 'pythiumBlight'
    | 'heatStress';
};

type SeedWeedChartProps = ChartProps & {
  data: 'gdd32' | 'gdd50';
  colorizer: Colorizer;
};

type SeriesObj = {
  data: (string | number)[][];
  name: string;
  color: string;
  zIndex: number;
  id?: string;
  linkedTo?: string;
  dashStyle?: 'Dash';
};

type PopupContent = UserLocation & {
  isSelected: boolean;
};

type RiskGraph = {
  data: HSTool | (HSTool & { '7 Day Avg': StrDateValue[] });
  todayFromAcis: boolean;
  thresholds: ThresholdObj;
  title: string;
};

type RiskMapsProps = {
  maps: MapThumbs[];
  text: TextProps;
};

type RouteInfo = {
  path: string;
  props: DataType;
};

type Row = {
  thresholds: ThresholdObj;
  name: string;
};

type SeasonChartProps = {
  data: StrDateValue[];
  colorizer: Colorizer;
  thresholds: ThresholdObj;
};

type StrDateValue = [string, number];

type TextProps = {
  titlePart: string;
  description: string[];
  references?: string[];
};

type ThresholdObj = {
  low: number;
  medium: number;
  high: number;
};

type ThumbUrls = {
  fullSizeUrl: string;
  thumbUrl: string;
  name: string;
  title: string;
  alt?: string;
  date?: string;
};

type Toggle = {
  type: string;
};

type RiskTool = HSTool & {
  '7 Day Avg': DateValue[];
};

type AvgTemps = {
  dates: string[];
  temps: number[];
};

type ToolData = Indices & GraphDataResults;

type UserLocation = {
  address: string;
  lngLat: [number, number];
};

type WeekMapsProps = {
  title: string;
  thumbs: Thumb[];
};

type SumObj = { sum: number; count: number };

type DSC = {
  date: string;
  gdd32: SumObj;
  gdd50: SumObj;
  precip: SumObj;
  temp: SumObj;
};
