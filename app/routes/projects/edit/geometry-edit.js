import Route from '@ember/routing/route';

const mapEditingLayerGroups = {
  'layer-groups': [
    {
      id: 'tax-lots',
      visible: true,
      layers: [
        {
          highlightable: true,
          clickable: false,
          tooltipable: true,
          tooltipTemplate: '{{address}} (BBL: {{bbl}})',
        },
        {},
        { style: { layout: { 'text-field': '{lot}' } } },
        {
          style: {
            id: 'block-labels',
            type: 'symbol',
            source: 'pluto',
            'source-layer': 'block-centroids',
            minzoom: 14,
            maxzoom: 24,
            layout: {
              'text-field': '{block}',
              'text-font': [
                'Open Sans Bold',
                'Arial Unicode MS Regular',
              ],
              'text-size': 22,
            },
            paint: {
              'text-halo-color': 'rgba(255, 255, 255, 0.5)',
              'text-halo-width': 1,
              'text-color': 'rgba(121, 121, 121, 1)',
              'text-halo-blur': 0,
              'text-opacity': {
                stops: [
                  [
                    14,
                    0,
                  ],
                  [
                    15,
                    1,
                  ],
                ],
              },
            },
          },
        },
      ],
    },
    {
      id: 'zoning-districts',
      visible: true,
      layers: [
        {
          highlightable: false,
          clickable: false,
          tooltipable: false,
          style: {
            paint: {
              'fill-opacity': 0,
            },
          },
        },
        {
          tooltipable: false,
          style: {
            paint: {
              'line-opacity': 0.05,
            },
          },
        },
        {
          style: {
            paint: {
              'text-opacity': 0,
            },
          },
        },
      ],
    },
    {
      id: 'street-centerlines',
      visible: true,
      layers: [
        {},
        {
          before: 'place_country_major',
          style: {
            id: 'citymap-street-centerlines-line',
            type: 'line',
            source: 'digital-citymap',
            'source-layer': 'street-centerlines',
            metadata: {
              'nycplanninglabs:layergroupid': 'street-centerlines',
            },
            minzoom: 13,
            paint: {
              'line-dasharray': [
                5,
                3,
              ],
              'line-color': 'rgba(193, 193, 193, 1)',
              'line-width': 0.5,
            },
          },
        },
      ],
    },
  ],
};

export default class GeometryEditRoute extends Route {
  queryParams = {
    mode: { replace: true },
    type: { replace: true },
    target: { replace: true },
  };

  // This hook gets triggered multiple times, updating the data store with layer groups.
  // When this happens, ember-mapbox-gl internals trigger an update to mapbox-gl's internal
  // state, which throws errors about layers already existing.
  // This is a workaround which returns what's already in the store if those keys already exist.
  // This is a design flaw I think - the data store isn't really necessary for our layer group
  // configuration.
  async model() {
    const layerGroupCount = mapEditingLayerGroups['layer-groups'].length;
    const layerGroupsInStore = this.store.peekAll('layer-group');
    let layerGroups;
    if (layerGroupsInStore.length === layerGroupCount) {
      layerGroups = layerGroupsInStore;
    } else {
      layerGroups = await this.store.query('layer-group', mapEditingLayerGroups);
    }

    const project = this.modelFor('projects.edit');
    const { meta } = layerGroups;

    return {
      layerGroups: {
        // meta is a critical part of the map - it's all the style information
        // however, it's only accessible from a "query". This suggests it's more
        // important that side information. It should probably be it's own model
        meta,
        layerGroups,
      },
      project,
    };
  }

  setupController(controller, model) {
    if (!controller.get('layerGroups')) {
      controller.set('layerGroups', model.layerGroups);
    }

    super.setupController(controller, model);
  }
}
