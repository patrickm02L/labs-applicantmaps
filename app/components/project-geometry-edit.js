import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import mapboxgl from 'mapbox-gl';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { tagName } from '@ember-decorators/component';
import carto from 'cartobox-promises-utility/utils/carto';
import projectGeomLayers from '../utils/project-geom-layers';

const bufferMeters = 500;

@tagName('')
export default class ProjectGeometryEditComponent extends Component {
  @argument
  model;

  @argument
  type;

  @argument
  mode;

  @service
  notificationMessages;

  @service
  router;

  /* ----------  General Map  ---------- */
  showDrawInstructions = true;

  @computed('lat', 'lng')
  get center() {
    return [this.get('lat'), this.get('lng')];
  }

  @action
  hideInstructions() {
    this.set('showDrawInstructions', false);
  }

  @action
  showInstructions() {
    this.set('showDrawInstructions', true);
  }

  projectGeomLayers = projectGeomLayers;

  @action
  handleMapLoad(map) {
    this.set('mapInstance', map);
    window.map = map;

    // setup controls
    const navigationControl = new mapboxgl.NavigationControl();
    map.addControl(navigationControl, 'top-left');

    // fitbounds if there are geometries
    const projectGeometryBoundingBox = this.get('model.projectGeometryBoundingBox');
    if (projectGeometryBoundingBox) {
      map.fitBounds(projectGeometryBoundingBox, {
        padding: 50,
        duration: 0,
      });
    }

    const basemapLayersToHide = [
      'highway_path',
      'highway_minor',
      'highway_major_casing',
      'highway_major_inner',
      'highway_major_subtle',
      'highway_motorway_casing',
      'highway_motorway_inner',
      'highway_motorway_subtle',
      'highway_motorway_bridge_casing',
      'highway_motorway_bridge_inner',
      'highway_name_other',
      'highway_name_motorway',
      'tunnel_motorway_casing',
      'tunnel_motorway_inner',
      'railway_transit',
      'railway_transit_dashline',
      'railway_service',
      'railway_service_dashline',
      'railway',
      'railway_dashline',
    ];

    basemapLayersToHide.forEach(layer => map.removeLayer(layer));
  }

  @action
  async save(model) {
    const project = await model.save();

    this.get('notificationMessages').success('Project saved!');

    this.get('router').transitionTo('projects.show', project);
  }

  /* ----------  Zoning Districts Edit  ---------- */
  @action
  addProposedZoning() {
    this.getClippedZoning();
    this.getClippedCommercialOverlays();
    this.getClippedSpecialPurposeDistricts();
  }

  @action
  async getClippedZoning() {
    // get the project's development site polygon as a reference for what area of the city to get zoning polygons for
    const developmentSite = this.get('model.developmentSite');

    // Get zoning districts
    const zoningQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${JSON.stringify(developmentSite)}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(zoning.the_geom, buffer.the_geom) AS the_geom, zonedist AS label
      FROM planninglabs.zoning_districts_v201809 zoning, buffer
      WHERE ST_Intersects(zoning.the_geom,buffer.the_geom)
    `;
    const clippedZoningDistricts = await carto.SQL(zoningQuery, 'geojson');
    this.set('model.proposedZoning', clippedZoningDistricts);
  }

  @action
  async getClippedCommercialOverlays() {
    const developmentSite = this.get('model.developmentSite');

    // Get commercial overlays
    const commercialOverlaysQuery = `
          WITH buffer as (
            SELECT ST_SetSRID(
              ST_Buffer(
                ST_GeomFromGeoJSON('${JSON.stringify(developmentSite)}')::geography,
                ${bufferMeters}
              ),
            4326)::geometry AS the_geom
          )
          SELECT ST_Intersection(co.the_geom, buffer.the_geom) AS the_geom, overlay AS label
          FROM planninglabs.commercial_overlays_v201809 co, buffer
          WHERE ST_Intersects(co.the_geom,buffer.the_geom)
        `;
    const clippedCommercialOverlays = await carto.SQL(commercialOverlaysQuery, 'geojson');
    this.set('model.proposedCommercialOverlays', clippedCommercialOverlays);
  }

  @action
  async getClippedSpecialPurposeDistricts() {
    const developmentSite = this.get('model.developmentSite');

    // Get special purpose districts
    const specialPurposeDistrictsQuery = `
      WITH buffer as (
        SELECT ST_SetSRID(
          ST_Buffer(
            ST_GeomFromGeoJSON('${JSON.stringify(developmentSite)}')::geography,
            ${bufferMeters}
          ),
        4326)::geometry AS the_geom
      )
      SELECT ST_Intersection(spd.the_geom, buffer.the_geom) AS the_geom, sdname AS label
      FROM planninglabs.special_purpose_districts_v201809 spd, buffer
      WHERE ST_Intersects(spd.the_geom,buffer.the_geom)
    `;

    const clippedSpecialPurposeDistricts = await carto.SQL(specialPurposeDistrictsQuery, 'geojson');
    this.set('model.proposedSpecialPurposeDistricts', clippedSpecialPurposeDistricts);
  }
}
