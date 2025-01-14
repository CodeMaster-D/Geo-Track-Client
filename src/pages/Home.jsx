import React, { useEffect, useRef, useState } from 'react';
import Maps from '../components/Maps';
import Sidebar from '../components/Sidebar';
import { fromLonLat } from 'ol/proj';
import { Overlay } from 'ol';
import { LineString } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import polyline from 'polyline';
import { useForm } from 'react-hook-form';
import { getRoute } from '../fetchApi';

const Home = () => {
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null); // Blue marker for user's location
  const startMarkerRef = useRef(null); // Start location marker
  const endMarkerRef = useRef(null); // End location marker

  const [map, setMap] = useState(null);
  const [routeLayer, setRouteLayer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStartMarkerVisible, setIsStartMarkerVisible] = useState(false);
  const [isEndMarkerVisible, setIsEndMarkerVisible] = useState(false);
  const [variant, setVariant] = useState('streets');

  const defaultValue = {
    to: '',
    from: '',
  };

  const { reset, control, watch, setValue } = useForm({
    defaultValues: defaultValue,
    mode: 'onChange',
  });

  const fetchRoute = async (from, to) => {
    const data = await getRoute(from, to);

    if (data.routes && data.routes.length > 0) {
      const encodeGeomettry = data.routes[0].geometry;
      const decodeGeometry = polyline.decode(encodeGeomettry);

      return decodeGeometry;
    } else {
      console.log('No route found');
      return null;
    }
  };

  const handleLocationSelect = async ({ from, to }) => {
    if (!map) return;

    map.getOverlays().forEach((overlay) => {
      if (overlay.getElement() !== userMarkerRef.current) {
        map.removeOverlay(overlay);
      }
    });

    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    const fromCoords = fromLonLat([from.lon, from.lat]);
    const toCoords = fromLonLat([to.lon, to.lat]);

    const startMarkerElement = startMarkerRef.current;
    const endMarkerElement = endMarkerRef.current;

    if (startMarkerElement || endMarkerElement) {
      const startMarkerOverlay = new Overlay({
        position: fromCoords,
        positioning: 'center-center',
        element: startMarkerElement,
        stopEvent: false,
      });
      const endMarkerOverlay = new Overlay({
        position: toCoords,
        positioning: 'center-center',
        element: endMarkerElement,
        stopEvent: false,
      });

      map.addOverlay(startMarkerOverlay);
      map.addOverlay(endMarkerOverlay);

      startMarkerElement.style.display = 'block';
      endMarkerElement.style.display = 'block';
    }

    const routeCoordinate = await fetchRoute(from, to);
    if (routeCoordinate) {
      const coordinates = routeCoordinate.map((coord) =>
        fromLonLat([coord[1], coord[0]])
      );
      const routeLine = new LineString(coordinates);
      const routeFeature = new Feature({
        type: 'route',
        geometry: routeLine,
      });

      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: 'blue',
            width: 3.4,
          }),
        })
      );

      const vectorSource = new VectorSource({
        features: [routeFeature],
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      map.addLayer(vectorLayer);
      setRouteLayer(vectorLayer);

      map.getView().fit(routeLine.getExtent(), {
        padding: [200, 200, 200, 200],
        duration: 2000,
      });
      setIsStartMarkerVisible(true);
      setIsEndMarkerVisible(true);
    }
  };

  const handleClearFeatures = () => {
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    if (startMarkerRef.current && endMarkerRef.current) {
      map.getOverlays().forEach((overlay) => {
        if (overlay?.getElement() !== userMarkerRef.current) {
          map.removeOverlay(overlay);
        }
      });
      startMarkerRef.current.style.display = 'none';
      endMarkerRef.current.style.display = 'none';
      setIsStartMarkerVisible(false);
      setIsEndMarkerVisible(false);
    }

    map.getView().animate({
      zoom: 2,
      duration: 2000,
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setValue('from', {
        label: 'Your Location',
        value: `${latitude},${longitude}`,
      });
    });
  }, []);

  console.log(variant);

  return (
    <>
      <Maps
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
        userMarkerRef={userMarkerRef}
        startMarkerRef={startMarkerRef}
        endMarkerRef={endMarkerRef}
        map={map}
        setMap={setMap}
        mapRef={mapRef}
        handleClearFeatures={handleClearFeatures}
        startMarkerVisible={isStartMarkerVisible}
        endMarkerVisible={isEndMarkerVisible}
        variant={variant}
      />
      <Sidebar
        onFindRoute={handleLocationSelect}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        control={control}
        watch={watch}
        setVariant={setVariant}
        variant={variant}
      />
    </>
  );
};

export default Home;
