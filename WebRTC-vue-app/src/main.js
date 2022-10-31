import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import './styles/app.css';
import router from './router';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import {
  faGear,
  faMicrophone,
  faVolumeUp,
  faVideo,
  faMicrophoneSlash,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';

/* add icons to the library */
library.add(
  faGear,
  faMicrophone,
  faVolumeUp,
  faVideo,
  faMicrophoneSlash,
  faVideoSlash
);

const pinia = createPinia();
const app = createApp(App);
app.use(router);
app.use(pinia);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.mount('#app');
