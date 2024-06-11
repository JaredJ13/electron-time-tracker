<script setup>
import { auth } from '../firebase/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { SuccessToast } from './toasts/SuccessToast';
import { ErrorToast } from './toasts/ErrorToast';


async function handleSignOut() {
    try {
        await signOut(auth);
        localStorage.removeItem('uid');

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account' // always prompt the user to select an account
        });

        // sign in the user with Google popup
        const result = await signInWithPopup(auth, provider);
        localStorage.setItem('uid', result.user.uid);
        SuccessToast(`Signed in as ${result.user.email}`);
    } catch (error) {
        console.error(error);
        ErrorToast(error);
    }
}


</script>

<template>
    <div class="mt-3">
        <h1 class="font-lobster text-5xl text-center">Saily</h1>
        <p class="font-robotoCondensed italic mt-2 text-center">Track and Summarize your Daily Tasks</p>
        <p @click="handleSignOut()">Sign Out</p>
    </div>
</template>