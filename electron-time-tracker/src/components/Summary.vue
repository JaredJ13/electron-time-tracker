<script setup>
import { defineProps, reactive, computed } from 'vue';
import { ClipboardIcon } from '@heroicons/vue/20/solid';
import { SuccessToast } from './toasts/SuccessToast';


const props = defineProps(['totalHours', 'totalTasks', 'groupTotals']);

const state = reactive({

});

// computed
const formattedTotalHours = computed(() => {
    let totalHours = Number(props.totalHours);
    let hours = Math.floor(totalHours);
    let minutes = (totalHours - hours) * 60;

    return `${hours}hrs ${minutes.toFixed(0)}mins`;
});

function handleCopyToClipboard(string) {
    console.log(string)
    navigator.clipboard.writeText(string);
    SuccessToast('Copied to clipboard');
}

</script>

<template>
    <div class="font-robotoCondensed mb-6">
        <h2 class="font-bold text-center text-xl md:text-2xl text-emerald-500">Summary</h2>

        <!-- Total Stats -->
        <div class="flex justify-center items-center">
            <div class="stats stats-vertical sm:stats-horizontal shadow mt-5 bg-gray-50">
                <div class="stat">
                    <div class="stat-title text-center">Total Tasks</div>
                    <div class="stat-value text-center text-emerald-500">{{ totalTasks }}</div>
                    <!-- <div class="stat-desc">↗︎ 400 (22%)</div> -->
                </div>
                <div class="stat">
                    <div class="stat-title text-center">Total Hours</div>
                    <div class="stat-value text-emerald-500 text-center">{{ totalHours }}</div>
                    <div class="stat-desc text-center">{{ formattedTotalHours }}</div>
                </div>
            </div>
        </div>
        <div class="divider mt-10 px-20 md:px-52">Group Summaries</div>
        <!--  Group Stats -->
        <div class="w-60 mx-auto mb-10">
            <div v-for="(total, index) in groupTotals" :key="index">
                <h3 class="text-center text-lg font-bold mt-8">{{ total.name }}</h3>
                <div class="flex justify-center items-center">
                    <div class="stats stats-vertical sm:stats-horizontal shadow mt-1 bg-gray-50">
                        <div class="stat">
                            <div class="stat-title text-center">Tasks</div>
                            <div class="stat-value text-center">{{ total.totalTasks }}</div>

                            <!-- <div class="stat-desc">↗︎ 400 (22%)</div> -->
                        </div>
                        <div class="stat">
                            <div class="stat-title text-center">Hours</div>
                            <div class="stat-value text-center">{{ total.totalHours.toFixed(2) }}</div>
                            <div class="stat-desc text-center">{{ total.hours }}hrs {{ total.minutes.toFixed(0) }}mins</div>
                        </div>
                    </div>
                </div>
                <details class="collapse collapse-arrow bg-gray-50 mt-2 shadow" open>
                    <summary class="collapse-title text-sm font-medium pb-0">Description:</summary>
                    <div class="collapse-content flex flex-col items-center">
                        <p class="whitespace-pre-wrap">{{ total.description }}</p>
                        <ClipboardIcon @click="handleCopyToClipboard(total.description)"
                            class="w-4 h-4 hover:text-emerald-500 hover:cursor-pointer transition" />
                    </div>
                </details>
            </div>
        </div>
        <!--  /Group Stats -->

    </div>
</template>