import Component from '@ember/component';
import { restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class DashboardMetricsCard extends Component {
  @service api

  @alias('fetchPerformanceTask.lastSuccessful.value') performance

  didReceiveAttrs() {
    this.fetchPerformanceTask.perform()
  }

  @restartableTask fetchPerformanceTask = function *() {
    return yield this.api.request(`dashboard/performance`, {
      method: 'GET'
    })
  }
}
