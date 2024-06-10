import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from './firebase/firebaseConfig';
import { SuccessToast } from './components/toasts/SuccessToast';
import { ErrorToast } from './components/toasts/ErrorToast';


const app = createApp(App)

app.use(Toast, {
  transition: 'Vue-Toastification__fade',
  maxToasts: 5,
  newestOnTop: true
})
app.mount('#app')

function googleSignIn() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      // handle successful sign-in
      localStorage.setItem('uid', result.user.uid);
      SuccessToast(`Signed in as ${result.user.email}`);
    })
    .catch((error) => {
      // handle errors
      googleSignIn();
      console.error(error);
      ErrorToast(error);
    });
}

googleSignIn();

