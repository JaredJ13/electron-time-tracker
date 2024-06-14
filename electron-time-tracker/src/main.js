import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from './firebase/firebaseConfig';
import { SuccessToast } from './components/toasts/SuccessToast';
import { ErrorToast } from './components/toasts/ErrorToast';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'



const app = createApp(App)

app.use(Toast, {
  transition: 'Vue-Toastification__fade',
  maxToasts: 5,
  newestOnTop: true
})

app.component('VueDatePicker', VueDatePicker);

function googleSignIn() {
  return new Promise((resolve, reject) => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // handle successful sign-in
        localStorage.setItem('uid', result.user.uid);
        SuccessToast(`Signed in as ${result.user.email}`);
        resolve(result);
      })
      .catch((error) => {
        // handle errors
        console.error(error);
        ErrorToast(error);
        reject(error);
      });
  });
}

googleSignIn().then((result) => {
  // Do something after sign-in, such as mounting the app
  app.mount('#app');
}).catch((error) => {
  // Handle any errors here
});



