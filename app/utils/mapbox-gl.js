import MapboxGl from 'mapbox-gl';

export default {
  ...MapboxGl,
  Map(...args) {
    const mapboxGl = new MapboxGl.Map(...args);
    // return mapboxGl;
    return Object.create(mapboxGl);
  },
};
