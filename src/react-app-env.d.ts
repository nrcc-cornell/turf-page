/// <reference types="react-scripts" />

type ChartProps = {
  rows: Row[];
  ranges: string[][];
  title: string;
};

type ConditionTextProps = {
  fromLast: number;
  fromNormal: number;
};

type ColorizerFunc = (val: number) => string;

type ContextType = {
  id: string;
  wikidata?: string;
  text: string;
  short_code?: string;
};

type MapsOnlyPageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'mapsOnly' | 'soilSat' | 'runoffRisk' | 'growthPotential' | 'lawn-watering';
};

type GraphPageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'graph';
  chart: {
    data: 'gdd32' | 'gdd50' | 'precip';
    title: string;
    rowNames: string[];
  };
};

type SeedWeedPageInfo = {
  maps: {
    title: string;
    thumbs: {
      fullSizeUrl: string;
      thumbUrl: string;
      name: string;
      title: string;
      alt?: string;
      date?: string;
    }[];
  }[];
  pageType: 'seedWeed';
  chart: {
    rows: {
      rowName: string;
      data: 'gdd32' | 'gdd50';
      colorizer: ColorizerFunc;
    }[];
    legend: string[][];
    title: string;
  };
  text: {
    titlePart: string;
    description: string[];
    references?: string[];
  };
};

type TablePageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'table';
  chart: {
    data: 'gdd50DiffGdds' | 'temp';
    title: string;
    rowNames: string[];
  };
};

type GddDiffDaysPageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'text';
  data: 'gdd50DiffDays';
};

type DiseaseStressRiskPageInfo = {
  maps: {
    title: string;
    thumbs: {
      fullSizeUrl: string;
      thumbUrl: string;
      name: string;
      title: string;
      alt?: string;
      date?: string;
    }[];
  }[];
  pageType: 'risk';
  chart: {
    rows: {
      thresholds: {
        low: number;
        medium: number;
        high: number;
      };
      rowName: string;
      data: 'anthracnose' | 'brownPatch' | 'dollarspot' | 'pythiumBlight' | 'heatStress';
    }[];
    legend: string[][];
    title: string;
  };
  text: {
    titlePart: string;
    description: string[];
    references?: string[];
  };
};

type PollinatorPageInfo = {
  maps: {
    title: string;
    thumbs: ThumbUrls[];
  }[];
  pageType: 'pollinator';
  chart: {
    rows: {
      data: string;
      rowName: string;
      colorizer: ColorizerFunc;
    }[];
    legend: string[][];
    title: string
  };
};

type PageInfo = DiseaseStressRiskPageInfo | GddDiffDaysPageInfo | TablePageInfo | SeedWeedPageInfo | GraphPageInfo | MapsOnlyPageInfo | PollinatorPageInfo;

type GrowthPotentialGraph = {
  data: StrDateValue[];
};

type DateValue = [Date, number];

type DayValues = {
  anthracnose: StrDateValue[];
  brownPatch: StrDateValue[];
  dollarspot: StrDateValue[];
  pythiumBlight: StrDateValue[];
  heatStress: StrDateValue[];
};

type DisplayProps = {
  currentLocation: UserLocation;
  pastLocations: UserLocation[];
  handleChangeLocations: (
    a: 'add' | 'remove' | 'change',
    b: UserLocation
  ) => void;
};

type GrowthPotentialPageProps = DisplayProps & { sx: { [key: string]: string }; };

type GridDatum = [string, number, number, number, number];

type HomeMap = {
  path: string;
  url: string;
  alt: string;
};

type ImgOptions = {
  href: string;
  src: string;
  alt: string;
  width: number;
  rounded?: boolean;
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

type OverlayMapProps = MapProps & {
  src: string;
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
  colorizer: ColorizerFunc;
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
  text?: TextProps;
};

type RouteInfo = {
  path: string;
  props: PageInfo;
};

type Row = {
  thresholds: ThresholdObj;
  name: string;
};

type SeasonChartProps = {
  data: StrDateValue[];
  colorizer: ColorizerFunc;
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

type AvgTemps = {
  dates: string[];
  temps: number[];
};

type RiskData = {
  season: [string, number][];
  '7 Day Avg'?: [Date, number][];
};

type GraphData = {
  table: [string, number][][];
  current: [string, number][];
  last: [string, number][];
  normal: [string, number][];
};

type TableData = {
  table: [string, number][][];
};

type ToolData = RiskDataResults & GraphDataResults;

type RiskDataResults = {
  anthracnose: RiskData;
  brownPatch: RiskData;
  dollarspot: RiskData;
  pythiumBlight: RiskData;
  heatStress: RiskData;
};

type GraphDataResults = {
  gdd32: GraphData;
  gdd50: GraphData;
  gdd50DiffGdds: TableData;
  gdd50DiffDays: TableData;
  precip: GraphData;
  temp: TableData;
  todayFromAcis: boolean;
};

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
