/// <reference types="react-scripts" />

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  colorizer: (val: number, thresholds: ThresholdObj) => string
}

type DataAndFromAcis = {
  data: [string, number][] | Tool | HSTool | null,
  todayFromAcis: boolean
};

type DateValue = [ Date, number ];

type DayValues = {
  anthracnose: [string, number][],
  brownPatch: [string, number][],
  dollarspot: [string, number][],
  pythiumBlight: [string, number][],
  heatStress: [string, number][]
};

type DailyChartProps = ChartProps & DataAndFromAcis;

type DisplayProps = {
    currentLocation: UserLocation,
    pastLocations: UserLocation[],
    handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void
};

type GDDPageProps = {
  data: 'gdd32' | 'gdd50',
  maps: MapPageProps[]
};

type GDDProps = {
  maps: MapPageProps[],
  data: StrDateValue[] | null,
  todayFromAcis: boolean,
  base: string
};

type HomeMap = {
  path: string,
  url: string,
  alt: string
};

type HSTool = {
  Daily: DateValue[]
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
  heatStress: HSTool,
  season: DayValues
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
  title?: string
};

type MapProps = {
  currentLocation: UserLocation,
  pastLocations: UserLocation[],
  handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void,
  handleClose: () => void
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

type PageChartProps = ChartProps & {
  data: 'gdd32' | 'gdd50' | 'anthracnose' | 'brownPatch' | 'dollarspot' | 'pythiumBlight' | 'heatStress'
};

type PageProps = DataAndFromAcis & {
  text: TextProps,
  chart: PageChartProps,
  maps: MapThumbs[],
  seasonData: [string, number][] | null
};

type PopupContent = UserLocation & {
  isSelected: boolean
};

type PropsType = GDDPageProps | MultiMapPageProps[] | MapPageProps | ToolPageProps;

type RouteInfo = {
  path: string
  props: PropsType
};

type Row = {
  thresholds: ThresholdObj,
  name: string
}

type SeasonChartProps = {
  data: [string, number][],
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
  gdd32: StrDateValue[],
  gdd50: StrDateValue[],
  todayFromAcis: boolean
};

type ToolPageProps = {
  text: TextProps | ReferencedTextProps,
  chart: PageChartProps,
  maps: MapThumbs[]
};

type UserLocation = {
  address: string,
  lngLat: [number,number]
};

type WeekMapsProps = {
  title: string,
  thumbs: Thumb[]
};



interface ReferencedTextProps extends TextProps {
  references: string[]
}