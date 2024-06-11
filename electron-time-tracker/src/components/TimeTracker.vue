<script setup>
import Summary from './Summary.vue';
import { EllipsisHorizontalIcon, PlusCircleIcon, MinusCircleIcon } from '@heroicons/vue/20/solid';
import { SuccessToast } from './toasts/SuccessToast';
import { ErrorToast } from './toasts/ErrorToast';
import { writeNewTime, readAllTimes, writeNewGroup, readAllGroups } from '../firebase/crudFunctions'
import { onMounted, reactive, computed } from 'vue';
import moment from 'moment'
import lodash from 'lodash'

// state
const state = reactive({
    allTimes: [],
    allGroups: [],
    newGroupName: null,
    newGroupNameError: false,
});

// computed 
const activeGroups = computed(() => {
    let activeGroups = [];
    let allGroupsCopy = lodash.cloneDeep(state.allGroups);

    activeGroups = allGroupsCopy.filter(group => group.active === true);

    return activeGroups;
});

const inactiveGroups = computed(() => {
    let inactiveGroups = [];
    let allGroupsCopy = lodash.cloneDeep(state.allGroups);

    inactiveGroups = allGroupsCopy.filter(group => group.active === false);

    return inactiveGroups;
});

onMounted(async () => {
    // get all the times for the logged in user for today
    try {
        let allTimes = await readAllTimes(localStorage.uid, new Date());
        let allGroups = await readAllGroups(localStorage.uid);
        state.allTimes = allTimes;
        state.allGroups = allGroups;
    }
    catch (err) {
        console.log(err);
        ErrorToast('An error occurred while trying to load user data.');
    }
});


async function handleStartTime(groupID) {
    const currentDate = new Date();
    const startYear = currentDate.getFullYear();
    const startMonth = currentDate.getMonth() + 1;
    const startDay = currentDate.getDate();

    if (groupID) {
        // start time for specific group
        SuccessToast('Test');
    } else {
        // start general time
        try {
            await writeNewTime(localStorage.uid, groupID, currentDate);
            state.allTimes.push(
                {
                    startTime: currentDate,
                    endTime: null,
                    groupID: groupID,
                    uid: localStorage.uid,
                    startYear: startYear,
                    startMonth: startMonth,
                    startDay: startDay,
                    description: ''
                }
            )
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

async function handleAddGroup() {
    // validate
    if (!state.newGroupName) {
        state.newGroupNameError = true
    }
    else {
        state.newGroupNameError = false

        // write new group to db and add to local data
        try {
            const currentDate = new Date();
            const newGroupDocID = await writeNewGroup(localStorage.uid, state.newGroupName, currentDate);
            state.allGroups.push(
                {
                    uid: localStorage.uid,
                    name: state.newGroupName,
                    createdDate: currentDate,
                    docID: newGroupDocID,
                    active: true
                }
            )
            SuccessToast(`New time group created: ${state.newGroupName}`);
        }
        catch (err) {
            console.log(err);
            ErrorToast('An error occurred while trying to create a new time group');
        }
    }

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
                        <li v-for="group in state.allGroups" :key="group.docID">
                            <a class="flex justify-between items-center p-2">
                                <div>
                                    {{ group.name }}
                                </div>
                                <EllipsisHorizontalIcon class="w-6 hover:text-emerald-400" />
                            </a>
                        </li>
                        <li onclick="modal_manageGroups.showModal()">
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
            </ul>
            <div class="border-b border-black h-2 w-full my-5"></div>
        </div>

        <!-- manage groups modal -->
        <dialog id="modal_manageGroups" class="modal">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Manage Time Groups</h3>
                <div class="divider divider-start">Add New Group</div>
                <div class="flex items-center">
                    <input v-model.trim="state.newGroupName" type="text" maxlength="20" placeholder="eg: Mockup Design"
                        :class="`input input-bordered w-full mr-2 ${state.newGroupNameError ? 'input-error' : ''}`" />
                    <PlusCircleIcon @click="handleAddGroup()"
                        class="w-8 h-8 hover:text-emerald-500 hover:cursor-pointer transition" />
                </div>
                <div class="divider divider-start">My Groups</div>
                <div class="collapse bg-gray-100 mb-2">
                    <input type="checkbox" value="true" />
                    <div class="collapse-title text-sm">
                        Active Groups
                    </div>
                    <div class="collapse-content">
                        <ul>
                            <li v-for="group in activeGroups" :key="group.docID" class="flex items-center">{{ group.name }}
                                <MinusCircleIcon
                                    class="w-5 h-5 ml-1 hover:text-red-500 hover:cursor-pointer hover:transition" />
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="collapse bg-gray-100">
                    <input type="checkbox" />
                    <div class="collapse-title text-sm">
                        Deactivated Groups
                    </div>
                    <div class="collapse-content">
                        <ul>
                            <li v-for="group in inactiveGroups" :key="group.docID" class="flex items-center">{{ group.name
                            }}
                                <PlusCircleIcon
                                    class="w-5 h-5 ml-1 hover:text-emerald-500 hover:cursor-pointer hover:transition" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <!-- tasks summary -->
        <div>
            <Summary />
        </div>
    </div>
</template>