import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import './styles/app.css';
import router from './router';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import Toast from 'vue-toastification';
// Import the CSS or use your own!
import 'vue-toastification/dist/index.css';

/* import specific icons */
import {
  faGear,
  faMicrophone,
  faVolumeUp,
  faVideo,
  faMicrophoneSlash,
  faVideoSlash,
  faDisplay,
  faAngleRight,
  faAngleLeft,
  faShareFromSquare,
  faMessage as faMessageSolid,
} from '@fortawesome/free-solid-svg-icons';

import { faMessage as faMessageRegular } from '@fortawesome/free-regular-svg-icons';
/* add icons to the library */
library.add(
  faGear,
  faMicrophone,
  faVolumeUp,
  faVideo,
  faMicrophoneSlash,
  faVideoSlash,
  faDisplay,
  faAngleRight,
  faAngleLeft,
  faShareFromSquare,
  faMessageSolid,
  faMessageRegular
);

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(Toast);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.mount('#app');
