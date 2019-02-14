import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import { EmptyFeatureCollection } from '../../models/project';
import projectGeometryIcons from '../../utils/project-geom-icons';


export default class ShowProjectController extends Controller {
  EmptyFeatureCollection = EmptyFeatureCollection;

  projectGeometryIcons = projectGeometryIcons;

  @service
  store;

  @computed()
  get taxLotsLayerGroup() {
    return this.get('store').peekRecord('layer-group', 'tax-lots');
  }

  @action
  handleMapLoad(map) {
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');

    map.fitBounds(projectGeometryBoundingBox, {
      padding: 50,
      duration: 0,
    });
  }
}
