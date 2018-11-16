import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import projectGeomLayers from '../../utils/project-geom-layers';

export default class ZoningDistrictComponent extends Component {
  init(...args) {
    super.init(...args);

    if (!this.get('model.commercialOverlays')) {
      this.get('model').setDefaultCommercialOverlays();
    }
  }

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  @service
  router;

  @service
  notificationMessages;

  coLayer = projectGeomLayers.coLayer;

  c11Layer = projectGeomLayers.c11Layer;

  c12Layer = projectGeomLayers.c12Layer;

  c13Layer = projectGeomLayers.c13Layer;

  c14Layer = projectGeomLayers.c14Layer;

  c15Layer = projectGeomLayers.c15Layer;

  c21Layer = projectGeomLayers.c21Layer;

  c22Layer = projectGeomLayers.c22Layer;

  c23Layer = projectGeomLayers.c23Layer;

  c24Layer = projectGeomLayers.c24Layer;

  c25Layer = projectGeomLayers.c25Layer;

  developmentSiteLayer = projectGeomLayers.developmentSiteLayer;

  projectAreaLayer = projectGeomLayers.projectAreaLayer;

  @action
  async save(finalGeometry) {
    const model = this.get('model');
    const featureCollection = await finalGeometry;

    model.set('commercialOverlays', featureCollection);

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }
}
