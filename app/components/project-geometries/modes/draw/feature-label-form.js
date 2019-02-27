import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { alias } from '@ember-decorators/object/computed';

// it takes a selectedFeature, aliases it, and mutates properties
// based on callbacks from ember-power-select
export default class FeatureLabelFormComponent extends Component {
  @argument
  selectedFeature;

  @argument
  updateSelectedFeature() {}

  @argument
  drawStateCallback() {}

  @argument
  options=null;

  @alias('selectedFeature.features.firstObject.properties.label')
  label;

  @alias('selectedFeature.features.firstObject.properties.textCOLOR')
  textCOLOR;

  @action
  handleSelectChange(newLabel) {
    this.set('label', newLabel);
    this.set('textCOLOR', 'FF7034');
    this.updateSelectedFeature(newLabel, 'FF7034');
    const bigGuy = this.get('selectedFeature.features.firstObject.properties');
    console.log('bigGuy', bigGuy);
    this.drawStateCallback();
  }
}
