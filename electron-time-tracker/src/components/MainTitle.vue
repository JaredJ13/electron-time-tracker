<script setup>
import { auth } from '../firebase/firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { SuccessToast } from './toasts/SuccessToast';
import { ErrorToast } from './toasts/ErrorToast';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/vue/20/solid';


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
    <div class="mt-3 relative">
        <div class="text-center">
            <h1 class="font-lobster text-5xl">Saily</h1>
            <p class="font-robotoCondensed italic mt-2">Track and Summarize your Daily Tasks</p>
        </div>
        <ArrowLeftEndOnRectangleIcon class="absolute right-10 top-5 cursor-pointer w-5 h-5" @click="handleSignOut()" />
    </div>
</template>