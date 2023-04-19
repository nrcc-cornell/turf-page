import { SSProxyBody } from '../Components/Pages/SoilSaturation/SoilSaturationPage';
import { RRProxyBody } from '../Components/Pages/RunoffRisk/RunoffRiskPage';

// const proxyUrl = 'http://192.168.0.149:8787/';
const proxyUrl = 'https://cors-proxy.benlinux915.workers.dev/';

async function updateStateFromProxy<T>(
  body: SSProxyBody | RRProxyBody,
  endpoint: string,
  setFunction: (a: T) => void
) {
  const response = await fetch(proxyUrl + endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (response.ok) {
    if (
      endpoint === 'rr-overlay'
    ) {
      const blob = await response.blob();
      setFunction(URL.createObjectURL(blob) as unknown as T);
    } else {
      const results: T = await response.json();
      setFunction(results);
    }
  } else {
    if (endpoint === 'coordinates') {
      alert(
        'A fatal error has occurred on this page. Please refresh to try again.'
      );
    } else {
      alert(
        'An error has occurred on this page. Please make a different location or depth selection to try again.'
      );
    }
  }
}

type CoordsBody = {
  dateStr: string;
};

type SoilSaturationBody = CoordsBody & {
  idxLng: number;
  idxLat: number;
};

type Depths = 'two' | 'six' | 'ten';

type DepthsObj = {
  depth: Depths;
};

type OverlayBody = CoordsBody &
  DepthsObj & {
    forecastDateStr: string;
  };

export type ProxyBody = CoordsBody | SoilSaturationBody | OverlayBody;



async function getFromProxy<T>(body: ProxyBody, endpoint: string) {
  const response = await fetch(proxyUrl + endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  let results: T | null = null;
  if (response.ok) {
    results = await response.json();
  }
  return results;
}

export { updateStateFromProxy, getFromProxy };
