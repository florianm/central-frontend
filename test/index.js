import Vue from 'vue';
import { mount } from 'avoriaz';
import 'should';

// Importing src/setup.js first, because other import statements below may
// import some of the same modules as src/setup.js, and in some cases, the order
// in which src/setup.js imports modules matters.
import '../src/setup';
import Blank from '../src/components/blank.vue';
import router from '../src/router';
import store from '../src/store';
import testData from './data';
import { MockLogger } from './util/util';
import { clearNavGuards, initNavGuards } from './router';
import { clearUniqueFakerResults } from './faker';
import { destroyMarkedComponent } from './destroy';
import { setHttp } from './http';
import './assertions';



////////////////////////////////////////////////////////////////////////////////
// STANDARD BUILT-IN OBJECTS

// "iTrim" for "internally trim"
// eslint-disable-next-line no-extend-native
String.prototype.iTrim = function iTrim() {
  return this.replace(/\s+/g, ' ');
};



////////////////////////////////////////////////////////////////////////////////
// UTILITIES

setHttp(config => {
  console.log('unhandled request', config); // eslint-disable-line no-console
  return Promise.reject(new Error());
});

Vue.prototype.$logger = new MockLogger();



////////////////////////////////////////////////////////////////////////////////
// ROUTER

/*
There are two pieces of complexity in how we use the router during testing,
having to do with (1) the number of routers and (2) the number of components
into which the router is injected.

We use the single, global router during testing rather than instantiating a
different router for each test. We do so because each Vue router attaches a
history listener to the window, but does not remove it: see
vuejs/vue-router#2341. Because Karma runs all tests in a single window, multiple
history listeners could conflict with each other.

Whenever the router is injected into a component, the undocumented
VueRouter.prototype.init() is run. init() is what attaches the history listener,
and it does so whenever the number of non-destroyed components into which the
router has been previously injected is 0. That happens when (1) the first
component is mounted, or (2) another component is mounted after all previous
components have been destroyed. Vue Router seems to assume that the second case
is not possible: see
https://github.com/vuejs/vue-router/pull/2706#discussion_r274414101. For us, the
second case is not possible during production, but it would be possible (and
actually common) during testing, because each test destroys any component it
mounts. Also, again, because Karma runs all tests in a single window, we need
the router not to attach multiple listeners. For these reasons, we need to
ensure that the second case never occurs, even during testing. To do so, we
inject the router into a component that does not use the router, then we never
destroy the component. This approach is admittedly fragile, relying on
undocumented VueRouter behavior, and it may need to change with updates to the
vue-router package.
*/
mount(Blank, { router });

initNavGuards();
afterEach(clearNavGuards);



////////////////////////////////////////////////////////////////////////////////
// DESTROY COMPONENT

afterEach(() => {
  destroyMarkedComponent();

  const afterScript = $('body > script:last-of-type + *');
  if (afterScript.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`Unexpected element: ${afterScript[0].outerHTML}`);
    throw new Error('Unexpected element after last script element. Have all components and Bootstrap elements been destroyed?');
  }
});



////////////////////////////////////////////////////////////////////////////////
// VUEX

// Reset the store.
afterEach(() => {
  store.commit('resetAlert');
  store.commit('resetRequests');
  store.commit('clearData');

  // We do not reset the router state, because mockHttp() does that. (Though
  // perhaps it would be better to move that code here?)
});



////////////////////////////////////////////////////////////////////////////////
// TEST DATA

afterEach(testData.reset);



////////////////////////////////////////////////////////////////////////////////
// FAKER

afterEach(clearUniqueFakerResults);



////////////////////////////////////////////////////////////////////////////////
// RUN TESTS

// Run all tests. See the documentation for karma-webpack. We specify the files
// here rather than in karma.conf.js, because doing so is more performant. When
// I tried specifying the tests in karma.conf.js, I encountered an out-of-memory
// error.
const testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
