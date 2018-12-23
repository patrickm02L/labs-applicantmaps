import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import isFeatureCollectionChanged from 'labs-applicant-maps/utils/is-feature-collection-changed';
import isEmpty from '../../../utils/is-empty';

// Proposed Special Purpose Districts
export const specialPurposeDistrictsLayer = {
  id: 'proposed-special-purpose-districts-fill',
  type: 'fill',
  paint: {
    'fill-color': 'rgba(94, 102, 51, 1)',
    'fill-opacity': 0.2,
  },
};

export const specialPurposeDistrictsLabelsLayer = {
  id: 'proposed-special-purpose-districts-labels',
  type: 'symbol',
  layout: {
    'symbol-placement': 'point',
    'text-field': '{label}',
    'text-size': 12,
    visibility: 'visible',
    'symbol-avoid-edges': false,
    'text-offset': [
      1,
      1,
    ],
    'text-keep-upright': true,
    'symbol-spacing': 200,
    'text-allow-overlap': true,
    'text-ignore-placement': true,
    'text-justify': 'left',
    'text-anchor': 'center',
    'text-max-angle': 90,
  },
  paint: {
    'text-color': 'rgba(70, 76, 38, 1)',
    'text-halo-color': '#FFFFFF',
    'text-halo-width': 2,
    'text-halo-blur': 2,
    'text-opacity': 1,
  },
};

export default class specialPurposeDistrictsComponent extends Component {
  init(...args) {
    super.init(...args);

    if (isEmpty(this.get('model.specialPurposeDistricts'))) {
      this.get('model').setDefaultSpecialPurposeDistricts();
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

  specialPurposeDistrictsLayer = specialPurposeDistrictsLayer;

  specialPurposeDistrictsLabelsLayer = specialPurposeDistrictsLabelsLayer;

  @computed('model.specialPurposeDistricts')
  get isReadyToProceed() {
    // here, it gets set once by the constructor
    // const initial = model.get(attribute);
    const [
      initial,
      proposed, // upstream proposed should always be FC
    ] = this.get('model').changedAttributes().specialPurposeDistricts || [];

    // console.log('if no initial and proposed');
    // check that proposed is not the original
    if ((!initial || isEmpty(initial)) && proposed) {
      return isFeatureCollectionChanged(this.get('model.originalSpecialPurposeDistricts'), proposed);
    }

    // console.log('if no proposed, there are no changes');
    if (!proposed) return false; // no changes are proposed to canonical

    return !isEmpty(this.get('model.specialPurposeDistricts'))
      && isFeatureCollectionChanged(initial, proposed);
  }

  @action
  async save() {
    const model = this.get('model');

    // because we've just changed the proposed zoning,
    // we should also calculate the rezoning area
    await model.setRezoningArea();

    try {
      const savedProject = await model.save();

      this.get('notificationMessages').success('Project saved!');
      this.get('router').transitionTo('projects.show', savedProject);
    } catch (e) {
      this.get('notificationMessages').success(`Something went wrong: ${e}`);
    }
  }
}
