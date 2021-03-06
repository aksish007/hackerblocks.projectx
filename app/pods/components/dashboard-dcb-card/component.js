import Component from '@ember/component';
import { restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import moment from 'moment';

export default class DashboardDcbCard extends Component {
  @service api
  @service store

  @alias('fetchDcbTopProblemTask.lastSuccessful.value') topProblem
  @alias('fetchContestStreakTask.lastSuccessful.value') streaks
  dcb_id = 1
  totalDCBs = 7

  @computed('streaks')
  get streak() {
    if (this.streaks) {
      const streak = this.streaks.toArray()[0]
      const perfectSubmissionCount = streak.get('perfectSubmissionCount') || 0
      this.set('totalDCBs', (Math.floor(perfectSubmissionCount / 7) + 1) * 7)
      return streak
    }
  }

  @computed('topProblem')
  get topProblemEnd() {
    if (this.topProblem) {
      return moment(this.topProblem.dcbProblems.start).add(86400, 'second')
    }
  }

  didReceiveAttrs() {
    this.fetchDcbTopProblemTask.perform()
    this.fetchContestStreakTask.perform()
  }

  @restartableTask fetchDcbTopProblemTask = function *() {
    const problem = yield this.api.request(`dcbs/${this.dcb_id}/top-problem`, {
      method: 'GET'
    })
    this.store.pushPayload(problem)
    return this.store.peekRecord('problem', problem.data.id)
  }

  @restartableTask fetchContestStreakTask = function *() {
    return yield this.store.query('contest-streak', {
      filter: {
        contestId: 1
      }
    })
  }
}
