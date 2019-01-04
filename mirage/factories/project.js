import { Factory, faker } from 'ember-cli-mirage';
import random from '../helpers/random-geometry';

const { randomPolygon } = random;

export default Factory.extend({
  afterCreate(project, server) {
    server.createList('area-map', 0, { project });
    server.createList('tax-map', 0, { project });
    server.createList('zoning-change-map', 1, { project });
    server.createList('zoning-section-map', 1, { project });
    server.create('geometric-property', {
      project,
      geometryType: 'developmentSite',
      proposedGeometry: randomPolygon(1, {
        // Manhattan bbox
        bbox: [-73.972866, 40.767488, -73.996735, 40.745782],
        num_vertices: faker.random.arrayElement([4, 6, 8, 10]),
        max_radial_length: 0.003,
      }),
    });
  },

  projectName() {
    return 'Mullberry Crossing';
  },

  applicantName() {
    return 'CMW Properties, LLC';
  },

  zapProjectId() {
    return faker.random.uuid();
  },

  datePrepared() {
    return faker.date.past();
  },

  needProjectArea() {
    return faker.random.boolean();
  },

  needRezoning() {
    // return faker.random.boolean();
    return false;
  },

  needUnderlyingZoning() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  needCommercialOverlay() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },

  needSpecialDistrict() { // eslint-disable-line
    if (this.needRezoning) {
      return faker.random.boolean();
    }
  },
});
