import queriesProposedCommercialOverlaysQuery from 'labs-applicant-maps/utils/queries/proposed-commercial-overlays-query';
import { module, test } from 'qunit';

const EmptyFeatureCollection = {
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

module('Unit | Utility | queries/proposed-commercial-overlays-query', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const result = queriesProposedCommercialOverlaysQuery(EmptyFeatureCollection);
    assert.ok(result);
  });
});
