import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import turfBbox from 'npm:@turf/bbox';
import turfBuffer from 'npm:@turf/buffer';

export default class extends Component {
  @argument
  boundsPolygon

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    const bounds = this.get('boundsPolygon');

    map.fitBounds(turfBbox.default(turfBuffer.default(bounds, 3)), {
      duration: 0,
    });
  }
}
