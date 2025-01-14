import axios from 'axios';

export const getGeoLocation = async (query) => {
  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.data;

    return data;
  } catch (error) {
    console.error('Error fetching data from API', error);
    return null;
  }
};

export const getRoute = async (from, to) => {
  try {
    const res = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full`
    );
    const data = await res.data;

    return data;
  } catch (error) {
    console.error('Error fetching route', error);
    return null;
  }
};
