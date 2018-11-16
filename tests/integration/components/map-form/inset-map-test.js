import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | inset-map', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{map-form/inset-map}}`);

    assert.equal(this.element.textContent.trim(), 'Missing Mapbox GL JS CSS');

    // Template block usage:
    await render(hbs`
      {{#map-form/inset-map}}
        Missing Mapbox GL JS CSS
      {{/map-form/inset-map}}
    `);

    assert.equal(this.element.textContent.trim(), 'Missing Mapbox GL JS CSS');
  });
});