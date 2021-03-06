import { Factory, faker } from 'ember-cli-mirage';
import random from '../helpers/random-geometry';

const { randomPolygon } = random;

export default Factory.extend({
  proposedGeometry() {
    return randomPolygon(1, {
      // Manhattan bbox
      bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
      num_vertices: faker.random.arrayElement([4, 6, 8, 10]),
      max_radial_length: 0.003,
    });
  },
});
