import Component from 'ember-mapbox-composer/components/labs-map';
import layout from 'ember-mapbox-composer/templates/components/labs-map';
import { getOwner } from '@ember/application';
import { assign } from '@ember/polyfills';
import { bind } from '@ember/runloop';
import { get } from '@ember/object';
import MapboxGlWrapper from '../utils/mapbox-gl';

export default Component.extend({
  _setup() {
    const mbglConfig = getOwner(this).resolveRegistration('config:environment')['mapbox-gl'];
    const options = assign({}, mbglConfig.map, get(this, 'initOptions'));
    options.container = this.element;

    const map = new MapboxGlWrapper.Map(options);
    console.log(map)
    map.once('load', bind(this, this._onLoad, map));
  },
  layout,
});
