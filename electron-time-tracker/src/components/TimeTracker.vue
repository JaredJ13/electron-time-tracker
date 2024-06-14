<script setup>
import Summary from './Summary.vue';
import { EllipsisHorizontalIcon, PlusCircleIcon, MinusCircleIcon, PencilIcon } from '@heroicons/vue/20/solid';
import { SuccessToast } from './toasts/SuccessToast';
import { ErrorToast } from './toasts/ErrorToast';
import { writeNewTime, readAllTimes, writeNewGroup, readAllGroups, editTime, endTime, deleteTime } from '../firebase/crudFunctions'
import { onMounted, reactive, computed, watch } from 'vue';
import moment from 'moment'
import lodash from 'lodash'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

// state
const state = reactive({
    allTimes: [],
    allGroups: [],
    newGroupName: null,
    newGroupNameError: false,
    newTimeDescription: '',
    newStartTime: {
        hours: new Date(),
        minutes: new Date(),
    },
    newEndTime: {
        hours: new Date(),
        minutes: new Date(),
    }
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
            time['groupName'] = state.allGroups.find(group => group.docID === time.groupDocID)?.name;
        } else {
            time['groupName'] = 'General';
        }
    });

    return onGoingTimes;
});

const totalHours = computed(() => {
    let total = 0;

    state.allTimes.forEach((time) => {
        const { startTime, endTime } = time;

        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);

            // Calculate the difference in milliseconds
            const diff = end - start;

            // Convert milliseconds to hours
            const hours = diff / (1000 * 60 * 60);

            // Add to the total
            total += hours;
        } else if (startTime && !endTime) {
            const start = new Date(startTime);
            const now = new Date();

            // Calculate the difference in milliseconds
            const diff = now - start;

            // Convert milliseconds to hours
            const hours = diff / (1000 * 60 * 60);

            // Add to the total
            total += hours;
        }
    });
    // Return the total rounded to two decimal places
    return total.toFixed(2);
});

const groupTotals = computed(() => {
    let totals = {};

    let allTimesCopy = lodash.cloneDeep(state.allTimes);

    // get General group totals
    let generalGroupTimes = allTimesCopy.filter((x) => x.groupDocID === null);
    let generalGroupTotals = { totalTasks: 0, totalHours: 0, hours: 0, minutes: 0 };
    generalGroupTimes.forEach((time) => {

    });

    // state.allGroups.forEach((group)=>{
    //     if(group.)
    // });
});

// const dateSortedTimes = computed(() => {
//     let timesCopy = [];
//     timesCopy = lodash.cloneDeep(state.allTimes).sort((a, b) => a.startTime - b.startTime);
//     return timesCopy;
// });

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

    let ongoingTimeExists = false;
    // check if another time is still ongoing
    if (state.allTimes.find(x => x.endTime === null)) {
        ongoingTimeExists = true
    }

    if (!ongoingTimeExists) {
        try {
            let timeDocID = await writeNewTime(localStorage.uid, groupDocID, currentDate);
            state.allTimes.push(
                {
                    startTime: currentDate,
                    endTime: null,
                    groupDocID: groupDocID,
                    uid: localStorage.uid,
                    startYear: startYear,
                    startMonth: startMonth,
                    startDay: startDay,
                    endDay: null,
                    endMonth: null,
                    endYear: null,
                    description: '',
                    docID: timeDocID
                }
            )
            SuccessToast(`${groupName ? `New task started for ${groupName}` : `New general task started`}`);
        }
        catch (err) {
            console.log(err);
            ErrorToast('An error occurred while trying to start the time');
        }
    }
    else {
        ErrorToast('You must end your current task to start a new one');
    }
}

async function handleEndTime(time) {
    try {
        let currentDate = new Date();
        const endYear = currentDate.getFullYear();
        const endMonth = currentDate.getMonth() + 1;
        const endDay = currentDate.getDate();

        await endTime(currentDate, time.docID);
        // update local data
        let allTimesCopy = lodash.cloneDeep(state.allTimes);
        let index = allTimesCopy.findIndex((x) => x.docID === time.docID);

        allTimesCopy[index].endTime = currentDate;
        allTimesCopy[index].endDay = endDay;
        allTimesCopy[index].endMonth = endMonth;
        allTimesCopy[index].endYear = endYear;

        if (state.newEndTime) {
            state.newEndTime.hours = allTimesCopy[index].endTime.getHours();
            state.newEndTime.minutes = allTimesCopy[index].endTime.getMinutes();
        }
        else {
            state.newEndTime = { hours: new Date().getHours(), minutes: new Date().getMinutes };
        }

        state.allTimes = allTimesCopy;

        SuccessToast(`Task ended for ${time.groupName}`);
    }
    catch (err) {
        console.log(err);
        ErrorToast(`An error occurred while trying to end the task for ${time.groupName}`);
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

    return formattedDifference === '' ? '0mins' : formattedDifference;
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

async function handleEditTime(time, timeRange) {
    try {
        const startYear = timeRange.startTime.getFullYear();
        const startMonth = timeRange.startTime.getMonth() + 1;
        const startDay = timeRange.startTime.getDate();
        let endYear = null;
        let endMonth = null;
        let endDay = null;

        if (timeRange.endTime) {
            endYear = timeRange.endTime.getFullYear();
            endMonth = timeRange.endTime.getMonth() + 1;
            endDay = timeRange.endTime.getDate();
        }

        await editTime(state.newTimeDescription, timeRange, time.docID);
        time.editTime = false;
        // update local data
        let allTimesCopy = lodash.cloneDeep(state.allTimes);
        let index = allTimesCopy.findIndex((x) => x.docID === time.docID);
        allTimesCopy[index].description = state.newTimeDescription;
        allTimesCopy[index].startTime = timeRange.startTime,
            allTimesCopy[index].startDay = startDay,
            allTimesCopy[index].startMonth = startMonth,
            allTimesCopy[index].startYear = startYear,
            allTimesCopy[index].endTime = timeRange.endTime,
            allTimesCopy[index].endDay = endDay,
            allTimesCopy[index].endMonth = endMonth,
            allTimesCopy[index].endYear = endYear
        state.allTimes = allTimesCopy;
        SuccessToast(`Task edited successfully`);
    }
    catch (err) {
        console.log(err);
        ErrorToast('An error occurred while trying to edit the task');
    }
}

async function handleDeleteTask(docID) {
    try {
        await deleteTime(docID);
        // update local data
        let allTimesCopy = lodash.cloneDeep(state.allTimes);
        let index = allTimesCopy.findIndex((x) => x.docID === docID);

        allTimesCopy.splice(index, 1);

        state.allTimes = allTimesCopy;

        SuccessToast(`Task deleted`);
    }
    catch (err) {
        console.log(err);
        ErrorToast(`An error occurred while trying to delete the task`);
    }
}

function handleSwitchToEditTime(time) {
    time.editTime = !time.editTime;
    if (time.editTime) {
        // edit mode
        state.newTimeDescription = time.description;
        state.newStartTime.hours = time.startTime.getHours();
        state.newStartTime.minutes = time.startTime.getMinutes();
        if (time.endTime) {
            state.newEndTime.hours = time.endTime.getHours();
            state.newEndTime.minutes = time.endTime.getMinutes();
        }
        else {
            if (state.newEndTime) {
                state.newEndTime.hours = new Date();
                state.newEndTime.minutes = new Date();
            }
            else {
                state.newEndTime = { hours: new Date(), minutes: new Date() };
            }
        }
    }
}

function handleCheckForChanges(time) {
    let endTimeDifferent = false;
    if (time.endTime && state.newEndTime) {
        if (time.endTime.getHours() !== state.newEndTime.hours || time.endTime.getMinutes() !== state.newEndTime.minutes) {
            endTimeDifferent = true;
        }
    }
    else if (time.endTime && !state.newEndTime) {
        endTimeDifferent = true;
    }
    else {
        if (typeof state.newEndTime.hours !== 'object' || typeof state.newEndTime.minutes !== 'object') {
            endTimeDifferent = true;
        }
    }

    if (time.description !== state.newTimeDescription || time.startTime.getHours() !== state.newStartTime.hours || time.startTime.getMinutes() !== state.newStartTime.minutes || endTimeDifferent) {
        let start = new Date(new Date().setHours(state.newStartTime.hours, state.newStartTime.minutes));
        let end = null;

        if (state.newEndTime && typeof state.newEndTime.hours !== 'object' && endTimeDifferent && !state.endTime) {
            end = new Date(new Date().setHours(state.newEndTime.hours, state.newEndTime.minutes));
        }
        else if (state.newEndTime && endTimeDifferent && !state.endTime) {
            end = new Date(new Date().setHours(state.newEndTime.hours.getHours(), state.newEndTime.minutes.getMinutes()));
        }

        const timeRange = { startTime: start, endTime: end };

        handleEditTime(time, timeRange);
    }
}

</script>

<template>
    <div class="font-robotoCondensed mt-8">
        <!-- start and stop buttons -->
        <div>
            <div class="flex justify-center items-center h-12">
                <div class="dropdown">
                    <div tabindex="0" role="button" class="m-1 btn w-40 font-bold">Start Task</div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
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
                </div>
                <div class="h-full border-l border-gray-300 mx-6"></div>
                <div class="dropdown">
                    <div tabindex="0" role="button" class="m-1 btn w-40 font-bold">End Task</div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li v-for="time in onGoingTimes" :key="time.docID" @click="handleEndTime(time)">
                            <a>{{ time.groupName }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- daily task timeline -->
        <div class="px-40 pt-10">
            <ul v-if="state.allTimes.length > 0"
                class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                <li v-for="(time, index) in state.allTimes" :key="time.docID">
                    <div class="timeline-middle">
                        <PencilIcon @click="handleSwitchToEditTime(time)"
                            class="w-4 h-4 hover:text-yellow-400 hover:cursor-pointer transition" />
                    </div>
                    <div
                        :class="`${index % 2 ? 'timeline-end ml-8' : 'timeline-start md:text-start'} mb-3 sm:text-sm md:text-md lg:text-lg ${!time.editTime ? 'w-40 md:w-60' : 'w-60 md:w-72'}`">
                        <time v-if="!time.editTime" class="italic">{{
                            moment(time.startTime).format('LT') }} to {{
        time.endTime ?
        moment(time.endTime).format('LT') : 'ongoing' }} |
                            <span class="font-bold text-emerald-500">{{ calculateTime(time) }}</span>
                        </time>
                        <div v-else class="flex">
                            <div>
                                <VueDatePicker v-model="state.newStartTime" time-picker :is-24="false"
                                    placeholder="Start Time" :clearable="false" />
                            </div>
                            <div>
                                <VueDatePicker v-model="state.newEndTime" time-picker :is-24="false"
                                    placeholder="End Time" />
                            </div>
                        </div>
                        <div class="font-black">{{ getGroupName(time.groupDocID) }}</div>
                        <div class="w-full overflow-hidden">
                            <p class="break-words" v-if="!time.editTime">
                                {{ time.description == '' ? 'Enter task description' : time.description }}
                            </p>
                            <textarea v-else v-model.trim="state.newTimeDescription" class="textarea textarea-ghost w-full"
                                placeholder="Enter task description"></textarea>
                        </div>
                        <div v-if="time.editTime" class="flex">
                            <button @click="handleDeleteTask(time.docID)"
                                class="btn btn-xs mr-1 hover:bg-red-500 hover:border-red-500 transition">Delete
                                Task</button>
                            <button @click="handleCheckForChanges(time)"
                                class="btn btn-xs bg-emerald-300 border-emerald-300 hover:bg-emerald-400 hover:border-emerald-400 transition">Save
                                Changes</button>
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
            <Summary :totalHours="totalHours" :totalTasks="state.allTimes.length" />
        </div>
    </div>
</template>