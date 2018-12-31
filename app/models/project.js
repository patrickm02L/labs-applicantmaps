import DS from 'ember-data';
import { attr, hasMany } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import turfBbox from '@turf/bbox';
import {
  type,
  arrayOf,
  shapeOf,
  unionOf,
  optional,
  oneOf,
} from '@ember-decorators/argument/type';
import intersectingZoningQuery from 'labs-applicant-maps/utils/queries/intersecting-zoning-query';
import proposedCommercialOverlaysQuery from 'labs-applicant-maps/utils/queries/proposed-commercial-overlays-query';
import proposedSpecialDistrictsQuery from 'labs-applicant-maps/utils/queries/proposed-special-districts-query';
import rezoningAreaQuery from 'labs-applicant-maps/utils/queries/rezoning-area-query';
import isEmpty from 'labs-applicant-maps/utils/is-empty';
import wizard from 'labs-applicant-maps/utils/wizard';
import computeDifference from 'labs-applicant-maps/utils/compute-difference';
import { GEOMETRY_TYPES } from './geometric-property';

const { Model } = DS;

export const EmptyFeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: null,
    properties: {
      isEmptyDefault: true,
    },
  }],
};

const Feature = shapeOf({
  // TODO
  // id: oneOf('number', 'string'),
  type: oneOf('Feature'),
  geometry: unionOf(Object, null),
  properties: optional(Object),
});

export const FeatureCollection = shapeOf({
  type: oneOf('FeatureCollection'),
  features: arrayOf(
    Feature,
  ),
});

const hasAnswered = property => property === true || property === false;
const hasFilledOut = property => !isEmpty(property);
const requiredIf = function(question, conditionalTest = hasAnswered) {
  return function(property) {
    return this.get(question) ? conditionalTest(property) : true;
  };
};

export const projectProcedure = [
  {
    step: 'project-creation',
    routing: {
      route: 'projects.new',
    },
    conditions: {
      projectName: hasFilledOut,
    },
  },
  {
    step: 'development-site',
    routing: {
      route: 'projects.edit.steps.development-site',
    },
    conditions: {
      developmentSite: hasFilledOut,
    },
  },
  {
    step: 'project-area',
    routing: {
      route: 'projects.edit.steps.project-area',
    },
    conditions: {
      needProjectArea: hasAnswered,
      projectArea: requiredIf('needProjectArea', hasFilledOut),
    },
  },
  {
    step: 'rezoning',
    routing: {
      route: 'projects.edit.steps.rezoning',
    },
    conditions: {
      needRezoning: hasAnswered,
      needUnderlyingZoning: requiredIf('needRezoning', hasAnswered),
      needCommercialOverlay: requiredIf('needRezoning', hasAnswered),
      needSpecialDistrict: requiredIf('needRezoning', hasAnswered),
    },
  },
  {
    step: 'rezoning-underlying',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'underlying-zoning',
    },
    conditions: {
      needRezoning: hasAnswered,
      needUnderlyingZoning: requiredIf('needRezoning', hasAnswered),
      underlyingZoning: requiredIf('needUnderlyingZoning', hasFilledOut),
    },
  },
  {
    step: 'rezoning-commercial',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'commercial-overlays',
    },
    conditions: {
      needRezoning: hasAnswered,
      needCommercialOverlay: requiredIf('needRezoning', hasAnswered),
      commercialOverlays: requiredIf('needCommercialOverlay', hasFilledOut),
    },
  },
  {
    step: 'rezoning-special',
    routing: {
      route: 'projects.edit.geometry-edit',
      mode: 'draw',
      type: 'special-purpose-districts',
    },
    conditions: {
      needRezoning: hasAnswered,
      needSpecialDistrict: requiredIf('needRezoning', hasAnswered),
      specialPurposeDistricts: requiredIf('needSpecialDistrict', hasFilledOut),
    },
  },
  {
    step: 'complete',
    routing: {
      label: 'complete',
      route: 'projects.show',
    },
  },
];

const procedureKeys = projectProcedure
  .reduce((acc, { conditions }) => acc.concat(conditions ? Object.keys(conditions) : []), []);

export default class Project extends Model {
  constructor(...args) {
    super(...args);

    // add geometries of each type if they don't exist
    GEOMETRY_TYPES.forEach((geometryType) => {
      if (!this.get('geometricProperties').findBy('geometryType', geometryType)) {
        this.get('geometricProperties')
          .pushObject(this.store.createRecord('geometric-property', {
            geometryType,
            project: this,
          }));
      }
    });
  }

  @service store;

  @hasMany('area-map', { async: false }) areaMaps;

  @hasMany('tax-map', { async: false }) taxMaps;

  @hasMany('zoning-change-map', { async: false }) zoningChangeMaps;

  @hasMany('zoning-section-map', { async: false }) zoningSectionMaps;

  @hasMany('geometric-property', { async: false }) geometricProperties;

  // ******** BASIC PROJECT CREATION INFO ********
  @attr('string') projectName;

  @attr('string') applicantName;

  @attr('string') zapProjectId;

  @attr('string') description;

  @attr('number', { defaultValue: 0 }) datePrepared;

  @attr('number') stepLabel

  // ******** REQUIRED ANSWERS ********
  @attr('boolean', { allowNull: true, defaultValue: null }) needProjectArea;

  @attr('boolean', { allowNull: true, defaultValue: null }) needRezoning;

  @attr('boolean', { allowNull: true, defaultValue: null }) needUnderlyingZoning;

  @attr('boolean', { allowNull: true, defaultValue: null }) needCommercialOverlay;

  @attr('boolean', { allowNull: true, defaultValue: null }) needSpecialDistrict;

  // ******** GEOMETRIES ********
  /**
   *
   * DevelopmentSite
   * FeatureCollection of polygons or multipolygons
   */

  @computed('geometricProperties.@each.proposedGeometry')
  get developmentSite() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'developmentSite')
      .get('proposedGeometry');
  }

  @computed('geometricProperties.@each.proposedGeometry')
  get projectArea() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'projectArea')
      .get('proposedGeometry');
  }

  @computed('geometricProperties.@each.proposedGeometry')
  get underlyingZoning() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'underlyingZoning')
      .get('proposedGeometry');
  }

  @computed('geometricProperties.@each.proposedGeometry')
  get commercialOverlays() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'commercialOverlays')
      .get('proposedGeometry');
  }

  @computed('geometricProperties.@each.proposedGeometry')
  get specialPurposeDistricts() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'specialPurposeDistricts')
      .get('proposedGeometry');
  }

  @computed('geometricProperties.@each.proposedGeometry')
  get rezoningArea() {
    return this.get('geometricProperties')
      .findBy('geometryType', 'rezoningArea')
      .get('proposedGeometry');
  }

  async setRezoningArea() {
    const rezoningArea = this.get('geometricProperties').findBy('geometryType', 'rezoningArea');

    await rezoningArea.setCanonical();
  }

  // ******** COMPUTING THE CURRENT STEP FOR ROUTING ********

  @computed(...procedureKeys)
  get currentStep() {
    return wizard(projectProcedure, this);
  }

  // ******** CHECKS AND METHODS FOR REZONING QUESTIONS ********
  setRezoningFalse() {
    this.set('needRezoning', false);
    this.set('needUnderlyingZoning', null);
    this.set('needCommercialOverlay', null);
    this.set('needSpecialDistrict', null);
  }

  @computed('needRezoning', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get rezoningAnsweredAll() {
    if ((this.get('needRezoning') === true) && (this.get('needUnderlyingZoning') != null) && (this.get('needCommercialOverlay') != null) && (this.get('needSpecialDistrict') != null)) return true;
    return false;
  }

  @computed('rezoningAnsweredAll', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get rezoningAnsweredLogically() {
    if (this.get('rezoningAnsweredAll') && (this.get('needUnderlyingZoning') || this.get('needCommercialOverlay') || this.get('needSpecialDistrict'))) return true;
    if (this.get('rezoningAnsweredAll')) return false;
    return false;
  }

  @computed('needRezoning', 'needUnderlyingZoning', 'needCommercialOverlay', 'needSpecialDistrict')
  get firstGeomType() {
    if ((this.get('needRezoning') === true) && (this.get('needUnderlyingZoning') === true)) return 'underlying-zoning';
    if ((this.get('needRezoning') === true) && (this.get('needCommercialOverlay') === true)) return 'commercial-overlays';
    if ((this.get('needRezoning') === true) && (this.get('needSpecialDistrict') === true)) return 'special-purpose-districts';
    return false;
  }

  // ********************************

  @computed('geometricProperties.@each.proposedGeometry')
  get projectGeometryBoundingBox() {
    // build a geojson FeatureCollection from all three project geoms
    // const featureCollections = this
    //   .getProperties('developmentSite.proposedGeometry', 'projectArea.proposedGeometry', 'rezoningArea.proposedGeometry');

    const featureCollections = this
      .get('geometricProperties')
      .filter(geometricProperty => geometricProperty.get('geometryType') === 'developmentSite'
        || geometricProperty.get('geometryType') === 'projectArea')
      .mapBy('proposedGeometry');

    // flatten feature collections
    const featureCollection = featureCollections
      .reduce((acc, { features }) => {
        acc.features.push(...features);

        return acc;
      }, {
        type: 'FeatureCollection',
        features: [],
      });

    if (isEmpty(featureCollection)) return undefined;

    return turfBbox(featureCollection);
  }
}
