<script setup>
import Summary from './Summary.vue';
import { EllipsisHorizontalIcon, PlusCircleIcon, MinusCircleIcon } from '@heroicons/vue/20/solid';
import { SuccessToast } from './toasts/SuccessToast';
import { ErrorToast } from './toasts/ErrorToast';
import { writeNewTime, readAllTimes, writeNewGroup, readAllGroups, editTime } from '../firebase/crudFunctions'
import { onMounted, reactive, computed } from 'vue';
import moment from 'moment'
import lodash from 'lodash'

// state
const state = reactive({
    allTimes: [],
    allGroups: [],
    newGroupName: null,
    newGroupNameError: false,
    newTimeDescription: ''
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

const onGoingTimes = computed(() => {
    let onGoingTimes = [];
    onGoingTimes = lodash.cloneDeep(state.allTimes).filter(time => time.endTime === null);
    onGoingTimes.forEach((time) => {
        // get its group name
        if (time.groupDocID) {
            time['groupName'] = state.allGroups.find(group => group.docID === time.groupDocID);
        } else {
            time['groupName'] = 'General';
        }
    });

    return onGoingTimes;
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


async function handleStartTime(groupDocID) {
    const currentDate = new Date();
    const startYear = currentDate.getFullYear();
    const startMonth = currentDate.getMonth() + 1;
    const startDay = currentDate.getDate();
    const groupName = state.allGroups.find(group => group.docID === groupDocID)?.name;

    try {
        await writeNewTime(localStorage.uid, groupDocID, currentDate);
        state.allTimes.push(
            {
                startTime: currentDate,
                endTime: null,
                groupDocID: groupDocID,
                uid: localStorage.uid,
                startYear: startYear,
                startMonth: startMonth,
                startDay: startDay,
                description: ''
            }
        )
        SuccessToast(`${groupName ? `New task started for ${groupName}` : `New general task started`}`);
    }
    catch (err) {
        console.log(err);
        ErrorToast('An error occurred while trying to start the time');
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

function getGroupName(groupDocID) {
    const groupName = state.allGroups.find(group => group.docID === groupDocID)?.name;
    return groupName ? groupName : 'General';
}

async function handleEditTimeDescription(time) {
    time.editDescription = false;

    // check that it changed
    if (time.description !== state.newTimeDescription) {
        try {
            await editTime(state.newTimeDescription, time.docID);
            // update local data
            let allTimesCopy = lodash.cloneDeep(state.allTimes);
            let index = allTimesCopy.findIndex((x) => x.docID === time.docID);
            allTimesCopy[index].description = state.newTimeDescription;
            state.allTimes = allTimesCopy;
            SuccessToast(`Time edited successfully`);
        }
        catch (err) {
            console.log(err);
            ErrorToast('An error occurred while trying to edit the time');
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
                        <li @click="handleStartTime(group.docID)" v-for="group in state.allGroups" :key="group.docID">
                            <a class="flex justify-between items-center p-2">
                                <div>
                                    {{ group.name }}
                                </div>
                                <!-- <EllipsisHorizontalIcon class="w-6 hover:text-emerald-400" /> -->
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
                <div class="h-full border-l border-gray-300 mx-6"></div>
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
                        :class="`${index % 2 ? 'timeline-end ml-8' : 'timeline-start md:text-start'} mb-3 sm:text-sm md:text-md lg:text-lg w-60`">
                        <time class="italic">{{ moment(time.startTime).format('LT') }} to {{ time.endTime ?
                            moment(time.endTime).format('LT') : 'ongoing' }} |
                            <span class="font-bold text-emerald-500">{{ calculateTime(time) }}</span>
                        </time>
                        <div class="font-black">{{ getGroupName(time.groupDocID) }}</div>
                        <div class="w-full overflow-hidden">
                            <p class="break-words"
                                @click="time.editDescription = true; state.newTimeDescription = time.description"
                                v-if="!time.editDescription">
                                {{ time.description == '' ? 'Enter task description' : time.description }}
                            </p>
                            <textarea @blur="handleEditTimeDescription(time)" v-else v-model.trim="state.newTimeDescription"
                                class="textarea textarea-ghost w-full" placeholder="Enter task description"></textarea>
                        </div>
                    </div>
                    <hr />
                </li>
            </ul>
            <div class="divider my-5"></div>
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