<!--
Copyright 2017 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <div id="form-edit" class="panel panel-simple">
    <div class="panel-heading"><h1 class="panel-title">Form Stage</h1></div>
    <div class="panel-body">
      <form>
        <fieldset :disabled="awaitingResponse">
          <div class="radio">
            <label>
              <input :checked="state === 'open'" type="radio" value="open"
                @change="changeState('open')">
              <div>
                <strong>Open</strong>
                <span>
                  <spinner :state="awaitingResponse && state === 'open'"/>
                </span>
              </div>
              <div>
                This form is available to download onto mobile devices and
                accepts new submissions.
              </div>
            </label>
          </div>
          <div class="radio">
            <label>
              <input :checked="state === 'closing'" type="radio" value="closing"
                @change="changeState('closing')">
              <div>
                <strong>Closing</strong>
                <span>
                  <spinner :state="awaitingResponse && state === 'closing'"/>
                </span>
              </div>
              <div>
                This form accepts new submissions, but is <em>not available</em>
                to download onto mobile devices.
              </div>
            </label>
          </div>
          <div class="radio">
            <label>
              <input :checked="state === 'closed'" type="radio" value="closed"
                @change="changeState('closed')">
              <div>
                <strong>Closed</strong>
                <span>
                  <spinner :state="awaitingResponse && state === 'closed'"/>
                </span>
              </div>
              <div>
                This form is not available to download onto mobile devices, nor
                does it accept new submissions.
              </div>
            </label>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>

<script>
import request from '../../mixins/request';
import { requestData } from '../../store/modules/request';

export default {
  name: 'FormEdit',
  mixins: [request()],
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      awaitingResponse: false,
      state: this.$store.state.request.data.form.state
    };
  },
  computed: requestData(['form']),
  methods: {
    changeState(newState) {
      const path = `/projects/${this.projectId}/forms/${this.form.encodedId()}`;
      this.patch(path, { state: newState })
        .then(response => {
          this.$store.commit('setData', {
            key: 'form',
            // We do not simply specify response.data, because it does not
            // include extended metadata.
            value: this.form.with({
              state: newState,
              updatedAt: response.data.updatedAt
            })
          });
          this.$alert().success('Form settings saved!');
        })
        .catch(() => {});
      this.state = newState;
    }
  }
};
</script>

<style lang="scss">
#form-edit .radio span {
  margin-left: 20px;
  // Spinner is positioned absolutely.
  position: relative;
}
</style>
