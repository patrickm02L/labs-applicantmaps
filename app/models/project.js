import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import turfBbox from '@turf/bbox';
import { camelize } from '@ember/string';
import config from '../config/environment';

const { mapTypes } = config;
const { Model } = DS;

// const requiredFields = [
//   'projectName',
//   'developmentSite',
// ];

export default class extends Model {
  @hasMany('area-map', { async: false }) areaMaps;

  @hasMany('tax-map', { async: false }) taxMaps;

  @hasMany('zoning-change-map', { async: false }) zoningChangeMaps;

  @hasMany('zoning-section-map', { async: false }) zoningSectionMaps;

  @computed(...mapTypes.map(type => `${camelize(type)}.@each.length`))
  get applicantMaps() {
    const maps = this.getProperties('areaMaps', 'taxMaps', 'zoningChangeMaps', 'zoningSectionMaps');
    return Object.values(maps).reduce((acc, curr) => acc.concat(...curr.toArray()), []);
  }

  // ******** BASIC PROJECT CREATION INFO ********
  @attr('string') projectName;

  @attr('string') applicantName;

  @attr('string') zapProjectId;

  @attr('string') description;

  @attr('number', { defaultValue: 0 }) datePrepared;

  // ******** REQUIRED ANSWERS ********
  @attr('boolean', { defaultValue: null }) needProjectArea;

  @attr('boolean', { defaultValue: null }) needRezoning;

  @attr('boolean', { defaultValue: null }) needUnderlyingZoning;

  @attr('boolean', { defaultValue: null }) needCommercialOverlay;

  @attr('boolean', { defaultValue: null }) needSpecialDistrict;

  // ******** GEOMETRIES ********
  @attr({ defaultValue: null }) developmentSite

  @attr() projectArea

  @attr() rezoningArea

  @attr() proposedZoning

  @attr() proposedCommercialOverlays

  @attr() proposedSpecialDistricts

  // ******** VALIDATION CHECKS / STEPS ********

  // @computed(...requiredFields)
  // get isValid() {
  //   return requiredFields.every(field => this.get(field));
  // }

  // @computed(...requiredFields)
  // get requiredFieldsCompleted() {
  //   return requiredFields.filter(field => this.get(field));
  // }

  @computed('developmentSite', 'projectName', 'projectArea', 'rezoningArea', 'proposedZoning', 'proposedCommercialOverlays', 'proposedSpecialDistricts', 'needProjectArea', 'needRezoning', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get currentStep() {
    const developmentSite = this.get('developmentSite');
    const projectArea = this.get('projectArea');
    const projectName = this.get('projectName');
    const rezoningArea = this.get('rezoningArea');
    const proposedZoning = this.get('proposedZoning');
    const proposedCommercialOverlays = this.get('proposedCommercialOverlays');
    const proposedSpecialDistricts = this.get('proposedSpecialDistricts');
    const needProjectArea = this.get('needProjectArea');
    const needRezoning = this.get('needRezoning');
    const needUnderlyingZoning = this.get('needUnderlyingZoning');
    const needCommercialOverlay = this.get('needCommercialOverlay');
    const needSpecialDistrict = this.get('needSpecialDistrict');

    if (projectName == null) {
      return 'project-creation';
    } if (developmentSite == null) {
      return 'development-site';
    } if ((needProjectArea === true || needProjectArea === null) && projectArea === null) {
      return 'project-area';
    } if ((needRezoning === true || needRezoning === null) && rezoningArea === null) {
      return 'project-area';
    } if ((needUnderlyingZoning === true || needUnderlyingZoning === null) && proposedZoning === null) {
      return 'underlying-zoning';
    } if ((needCommercialOverlay === true || needCommercialOverlay === null) && proposedCommercialOverlays === null) {
      return 'commercial-overlay';
    } if ((needSpecialDistrict === true || needSpecialDistrict === null) && proposedSpecialDistricts === null) {
      return 'special-district';
    } return 'complete';
  }

  // @computed()
  // get hasCompletedSteps() {
  //   // need a way to compute this
  //   return false;
  // }

  @computed('projectArea')
  get projectAreaSource() {
    const projectArea = this.get('projectArea');
    return {
      type: 'geojson',
      data: projectArea,
    };
  }

  // ********************************

  @computed('developmentSite', 'projectArea', 'rezoningArea')
  get projectGeometryBoundingBox() {
    // build a geojson FeatureCollection from all three project geoms
    const geometries = this.getProperties('developmentSite', 'projectArea', 'rezoningArea');

    // if all three are undefined, return undefined
    const allUndefined = Object.values(geometries)
      .reduce((acc, geometry) => acc && !geometry, true);
    if (allUndefined) return undefined;

    const featureCollection = Object.values(geometries)
      .reduce((acc, geometry) => {
        if (geometry) {
          acc.features.push({
            type: 'Feature',
            geometry,
          });
        }

        return acc;
      }, {
        type: 'FeatureCollection',
        features: [],
      });

    return turfBbox(featureCollection);
  }
}
