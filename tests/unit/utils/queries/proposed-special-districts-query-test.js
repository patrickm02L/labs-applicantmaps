import queriesProposedSpecialDistrictsQuery from 'labs-applicant-maps/utils/queries/proposed-special-districts-query';
import { module, test } from 'qunit';

const DummyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordionates: [[0, 0], [0, 1], [1, 1], [1, 0]],
    },
    properties: {},
  }],
};

module('Unit | Utility | queries/proposed-special-districts-query', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const result = queriesProposedSpecialDistrictsQuery(DummyFeatureCollection);
    assert.ok(result);
  });
});
