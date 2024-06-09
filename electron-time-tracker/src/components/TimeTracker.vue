<script setup>
import Summary from './Summary.vue';
import { EllipsisHorizontalIcon, PlusCircleIcon } from '@heroicons/vue/20/solid';

</script>

<template>
    <div class="font-robotoCondensed mt-8">
        <!-- start and stop buttons -->
        <div>
            <div class="flex justify-center items-center h-12">
                <details class="dropdown">
                    <summary class="m-1 btn w-40 font-bold">Start Time</summary>
                    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        <li>
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
                    <summary class="m-1 btn w-40 font-bold">End Time</summary>
                    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                        <li><a>Group 1</a></li>
                        <li><a>Group 2</a></li>
                    </ul>
                </details>
            </div>
        </div>

        <!-- daily task timeline -->
        <div class="px-40 pt-10">
            <ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                <li>
                    <div class="timeline-middle">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                            class="h-5 w-5 hover:fill-yellow-400 hover:cursor-pointer transition">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="timeline-start md:text-end mb-3 sm:text-sm md:text-md lg:text-lg">
                        <time class="italic">3:56 PM to 4:30 PM | <span class="font-bold text-emerald-500">34
                                mins (0.57hrs)</span></time>
                        <div class="font-black">Misc</div>
                        The Apple Macintosh—later rebranded as the Macintosh 128K—is the
                    </div>
                    <hr />
                </li>
                <li>
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
                </li>
            </ul>
            <div class="border-b border-black h-2 w-full my-5"></div>
        </div>

        <!-- tasks summary -->
        <div>
            <Summary />
        </div>
    </div>
</template>