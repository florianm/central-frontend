<!--
Copyright 2019 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <page-section v-if="project != null && form != null"
    id="form-overview-right-now">
    <template #heading>
      <span>Right Now</span>
    </template>
    <template #body>
      <summary-item icon="file-o">
        <template #heading>
          <span :class="versionClass" :title="versionOrBlank">
            {{ versionOrBlank }}
          </span>
          <a :href="xmlPath" class="btn btn-primary" target="_blank">
            <span class="icon-arrow-circle-down"></span>View XML
          </a>
        </template>
        <template #body>
          <strong>Current version</strong> of this Form.
        </template>
      </summary-item>
      <summary-item :route-to="submissionsPath" icon="inbox">
        <template #heading>
          {{ form.submissions.toLocaleString() }}
          <span class="icon-angle-right"></span>
        </template>
        <template #body>
          <template v-if="form.submissions === 1">
            <strong>Submission</strong> has been saved for this Form.
          </template>
          <template v-else>
            <strong>Submissions</strong> have been saved for this Form.
          </template>
        </template>
      </summary-item>
    </template>
  </page-section>
</template>

<script>
import SummaryItem from '../../summary-item.vue';
import { requestData } from '../../../store/modules/request';

export default {
  name: 'FormOverviewRightNow',
  components: { SummaryItem },
  computed: {
    ...requestData(['project', 'form']),
    versionClass() {
      const htmlClass = ['form-version'];
      if (this.form.version === '') htmlClass.push('blank-form-version');
      return htmlClass;
    },
    versionOrBlank() {
      return this.form.version !== '' ? this.form.version : '(blank)';
    },
    xmlPath() {
      return `/v1/projects/${this.project.id}/forms/${this.form.encodedId()}.xml`;
    },
    submissionsPath() {
      return `/projects/${this.project.id}/forms/${this.form.encodedId()}/submissions`;
    }
  }
};
</script>

<style lang="scss">
@import '../../../assets/scss/variables';

#form-overview-right-now {
  .form-version {
    display: inline-block;
    font-family: $font-family-monospace;
    max-width: calc(100% - 102px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    + .btn {
      bottom: 10px;
      margin-left: 12px;
      position: relative;
    }
  }

  .blank-form-version {
    font-family: inherit;

    + .btn {
      bottom: 5px;
    }
  }
}
</style>
