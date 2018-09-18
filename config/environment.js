'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'labs-applicant-maps',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    host: 'https://layers-api-staging.planninglabs.nyc',
    namespace: 'v1',

    'labs-search': {
      host: 'https://search-api.planninglabs.nyc',
      route: 'search',
    },

    'ember-cli-notifications': {
      autoClear: true,
    },

    'mapbox-gl': {
      accessToken: '',
      map: {
        style: '//raw.githubusercontent.com/NYCPlanning/labs-gl-style/master/data/style.json',
        zoom: 12.25,
        center: [ -73.9868, 40.724 ]
      }
    },

    fontawesome: {
      icons: {
        'free-regular-svg-icons': 'all',
        'free-solid-svg-icons': 'all',
      },
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'dev-local') {
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    ENV.host = 'https://layers-api.planninglabs.nyc'
  }

  return ENV;
};
