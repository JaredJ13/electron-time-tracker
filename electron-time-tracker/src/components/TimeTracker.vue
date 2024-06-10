<script setup>
import Summary from './Summary.vue';
import { EllipsisHorizontalIcon, PlusCircleIcon } from '@heroicons/vue/20/solid';
import { SuccessToast } from './toasts/SuccessToast';
import { ErrorToast } from './toasts/ErrorToast';
import { writeNewTime, readAllTimes } from '../firebase/crudFunctions'
import { onMounted, reactive } from 'vue';
import moment from 'moment'


const state = reactive({
    allTimes: []
});

onMounted(async () => {
    // get all the times for the logged in user for today
    try {
        let allTimes = await readAllTimes(localStorage.uid, new Date());
        state.allTimes = allTimes;
        console.log(allTimes)
    }
    catch (err) {
        console.log(err);
        ErrorToast('An error occurred while trying to load the the times for the current user.');
    }
});


async function handleStartTime(groupID) {

    if (groupID) {
        // start time for specific group
        SuccessToast('Test');
    } else {
        // start general time
        try {
            await writeNewTime(localStorage.uid, groupID, new Date());
            SuccessToast(`${groupID ? `New task started for ${groupID}` : `New general task started`}`);
        }
        catch (err) {
            console.log(err);
            ErrorToast('An error occurred while trying to start the time');
        }
    }
}

function calculateTime(time) {
    // calculate the difference in milliseconds
    const timeDifference = (time.endTime ? time.endTime.getTime() : new Date()) - time.startTime.getTime();

    // calculate difference in minutes and hours
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const hoursDifference = Math.floor(minutesDifference / 60);

    let formattedDifference = '';
    if (hoursDifference >= 1) {
        formattedDifference += `${hoursDifference}hr `;
    }
    if (minutesDifference % 60 !== 0) {
        formattedDifference += `${minutesDifference % 60}mins`;
    }

    return formattedDifference;
}

</script>

<template>
    <div class="font-robotoCondensed mt-8">
        <!-- start and stop buttons -->
        <div>
            <div class="flex justify-center items-center h-12">
                <details class="dropdown">
                    <summary class="m-1 btn w-40 font-bold">Start Task</summary>
                    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        <li @click="handleStartTime(null)">
                            <a class="flex justify-between items-center p-2">
                                <div>
                                    General
                                </div>
                            </a>
                        </li>
                        <li>
                            <a class="flex justify-between items-center p-2">
                                <div>
                                    Misc
                                </div>
                                <EllipsisHorizontalIcon class="w-6 hover:text-emerald-400" />
                            </a>
                        </li>
                        <li>
                            <a class="flex justify-between items-center p-2">
                                <div>
                                    Wilard Dev
                                </div>
                                <EllipsisHorizontalIcon class="w-6 hover:text-emerald-400" />
                            </a>
                        </li>
                        <li>
                            <a class="flex justify-center p-2 group">
                                Add Group
                                <PlusCircleIcon class="w-6 group-hover:text-emerald-500" />
                            </a>
                        </li>
                    </ul>
                </details>
                <div class="h-full border-l border-black mx-6"></div>
                <details class="dropdown">
                    <summary class="m-1 btn w-40 font-bold">End Task</summary>
                    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        <li><a>Group 1</a></li>
                        <li><a>Group 2</a></li>
                    </ul>
                </details>
            </div>
        </div>

        <!-- daily task timeline -->
        <div class="px-40 pt-10">
            <ul v-if="state.allTimes.length > 0"
                class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                <li v-for="(time, index) in state.allTimes" :key="time.docID">
                    <div class="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            class="h-5 w-5 hover:fill-yellow-400 hover:cursor-pointer transition">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div
                        :class="`${index % 2 ? 'timeline-end' : 'timeline-start'} md:text-end mb-3 sm:text-sm md:text-md lg:text-lg`">
                        <time class="italic">{{ moment(time.startTime).format('LT') }} to {{ time.endTime ?
                            moment(time.endTime).format('LT')
                            : 'ongoing' }} |
                            <span class="font-bold text-emerald-500">{{ calculateTime(time) }}</span></time>
                        <div class="font-black">General</div>
                        Morning meeting
                    </div>
                    <hr />
                </li>
                <!-- <li>
                    <hr />
                    <div class="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            class="h-5 w-5 hover:fill-yellow-400 hover:cursor-pointer transition">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="timeline-end mb-3 sm:text-sm md:text-md lg:text-lg">
                        <time class="italic">4:31 PM to 5:40 PM | <span class="font-bold text-emerald-500">1 hr 9
                                mins (1.15hrs)</span></time>
                        <div class="font-black">Wilard Dev</div>
                        iMac is a family of all-in-one Mac desktop computers designed and built by Apple Inc. It has
                        been the primary part of Apple's consumer desktop offerings since its debut in August 1998, and
                        has evolved through seven distinct forms
                    </div>
                    <hr />
                </li> -->
            </ul>
            <div class="border-b border-black h-2 w-full my-5"></div>
        </div>

        <!-- tasks summary -->
        <div>
            <Summary />
        </div>
    </div>
</template>