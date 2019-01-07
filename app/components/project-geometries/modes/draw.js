import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { EmptyFeatureCollection } from 'labs-applicant-maps/models/geometric-property';

export default class DrawComponent extends Component {
  constructor(...args) {
    super(...args);

    this.callbacks = {
      drawState: () => this.drawStateCallback(),
      selectedFeature: () => this.selectedFeatureCallback(),
      skipToDirectSelect: () => this.skipToDirectSelectCallback(),
    };

    this._bindCallbacks();
  }

  target = 'draw';

  _bindCallbacks() {
    const { mapInstance } = this.get('map');

    mapInstance.on('draw.create', this.callbacks.drawState);
    mapInstance.on('draw.update', this.callbacks.drawState);
    mapInstance.on('draw.delete', this.callbacks.drawState);
    mapInstance.on('draw.selectionchange', this.callbacks.selectedFeature);
    mapInstance.on('draw.selectionchange', this.callbacks.skipToDirectSelect);
  }

  drawStateCallback() {
    const drawnFeatures = this.get('drawnFeatures');
    const { draw: { add } } = this.get('map');

    add(drawnFeatures);
    this.set('geometricProperty', drawnFeatures);
  }

  // update which is the selected feature
  selectedFeatureCallback() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const { features: [firstSelectedFeature] } = draw.getSelected();

    if (firstSelectedFeature) {
      this.set('selectedFeature', { type: 'FeatureCollection', features: [firstSelectedFeature] });
    } else {
      this.set('selectedFeature', EmptyFeatureCollection);
    }
  }

  // skip simple_select mode, jump straight to direct_select
  // mode so users can immediately select vertices
  // this helps avoid an additional click when something is selected
  skipToDirectSelectCallback() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const mode = draw.getMode();
    const [selected] = draw.getSelectedIds();

    if (selected && mode === 'simple_select') {
      draw.changeMode('direct_select', { featureId: selected });
    }
  }

  // Get drawn features, if they're valid
  // We need to remove weird null coordinates.
  // This makes the component expect a certain type of FC
  // which is bad.
  // See https://github.com/mapbox/mapbox-gl-draw/issues/774
  @computed('geometricProperty')
  get drawnFeatures() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const features = draw.getAll().features
      .filter(({ geometry: { coordinates: [[firstCoord]] = [] } }) => firstCoord !== null);

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  // @required
  // mapbox-gl map context with draw instance
  @argument
  map;

  // @type(FeatureCollection)
  @argument
  geometricProperty;

  // @type(FeatureCollection)
  selectedFeature = EmptyFeatureCollection;

  @action
  handleTrashButtonClick() {
    const { draw: { drawInstance: draw } } = this.get('map');
    const selectedFeature = draw.getSelectedIds();
    const { features: [feature] } = draw.getSelectedPoints();

    if (feature) {
      draw.trash();
    } else {
      draw.delete(selectedFeature);
    }

    this.drawStateCallback();
  }

  @action
  updateSelectedFeature(label) {
    const { draw: { drawInstance: draw } } = this.get('map');
    const { features: [firstFeature] } = this.get('selectedFeature');

    draw.setFeatureProperty(firstFeature.id, 'label', label);

    // this triggers an update that renders the new label as mutated above to show up in the selected feature
    // see https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md#events
    this.drawStateCallback();
  }

  /* =================================================
  =            COMPONENT LIFECYCLE HOOKS            =
  ================================================= */

  didInsertElement(...params) {
    const { draw: { shouldReset } } = this.get('map');
    shouldReset(this.get('geometricProperty'));

    super.didInsertElement(...params);
  }

  willDestroyElement(...args) {
    const { mapInstance } = this.get('map');

    mapInstance.off('draw.create', this.callbacks.drawState);
    mapInstance.off('draw.update', this.callbacks.drawState);
    mapInstance.off('draw.delete', this.callbacks.drawState);
    mapInstance.off('draw.modechange', this.callbacks.drawMode);
    mapInstance.off('draw.selectionchange', this.callbacks.selectedFeature);
    mapInstance.off('draw.selectionchange', this.callbacks.skipToDirectSelect);

    super.willDestroyElement(...args);
  }
}
