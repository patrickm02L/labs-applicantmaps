import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import projectGeomLayers from '../../utils/project-geom-layers';

export default class DevelopmentSiteComponent extends Component {
  @service
  router;

  @service
  notificationMessages;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  developmentSiteLayer = projectGeomLayers.developmentSiteLayer;

  @action
  async save(finalGeometry) {
    const model = this.get('model');
    const { features: [{ geometry }] } = await finalGeometry;

    model.set('developmentSite', geometry);

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }
}
