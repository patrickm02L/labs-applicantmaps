import { attr } from '@ember-decorators/data';
import ApplicantMap from './applicant-map';

export default class extends ApplicantMap {
  @attr('string', { defaultValue: 'Tax Map' })
  mapTypeLabel;
}
