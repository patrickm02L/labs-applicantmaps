import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import projectGeomLayers from '../../utils/project-geom-layers';


export default class ProjectAreaComponent extends Component {
  @service
  notificationMessages;

  @service
  router;

  @argument
  map;

  @argument
  model;

  @argument
  mode;

  developmentSiteLayer = projectGeomLayers.developmentSiteLayer;

  projectAreaLayer = projectGeomLayers.projectAreaLayer;

  @action
  async save(finalGeometry) {
    const model = this.get('model');
    const notifications = this.get('notificationMessages');
    const { features: [{ geometry }] } = await finalGeometry;

    model.set('projectArea', geometry);

    try {
      const savedProject = await model.save();

      notifications.success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      notifications.success(`Something went wrong: ${e}`);
    }
  }
}
