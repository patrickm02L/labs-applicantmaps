import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';

export default class ToggleModeButton extends Component {
  @argument
  isReadyToProceed;
}
