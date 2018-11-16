import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class ProjectGeometryEditComponent extends Component {
  @argument
  model;

  @argument
  type;

  @argument
  mode;

  @service
  notificationMessages;

  @service
  router;

  /* ----------  General Map  ---------- */
  showDrawInstructions = true;

  @computed('lat', 'lng')
  get center() {
    return [this.get('lat'), this.get('lng')];
  }

  @action
  hideInstructions() {
    this.set('showDrawInstructions', false);
  }

  @action
  showInstructions() {
    this.set('showDrawInstructions', true);
  }

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    window.map = map;

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();
    map.addControl(navigationControl, 'top-left');

    // fitbounds if there are geometries
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');
    if (projectGeometryBoundingBox) {
      map.fitBounds(projectGeometryBoundingBox, {
        padding: 50,
        duration: 0,
      });
    }

    const basemapLayersToHide = [
      'highway_name_other',
      'highway_name_motorway',
    ];

    basemapLayersToHide.forEach(layer => map.removeLayer(layer));
  }
}
