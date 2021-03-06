import Route from '@ember/routing/route';
import { action } from '@ember-decorators/object';
import { inject as service } from '@ember-decorators/service';

export default class ProjectsEditRoute extends Route {
  @service
  notificationMessages;

  model() {
    return this.modelFor('projects.edit');
  }

  @action
  error({ message }) {
    this.get('notificationMessages').error(message);
    this.transitionTo('application');
  }
}
