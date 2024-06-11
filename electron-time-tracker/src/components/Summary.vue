<script setup>

</script>

<template>
    <div class="font-robotoCondensed">
        <h2 class="font-bold text-center text-xl md:text-2xl">Summary</h2>

        <!-- Total Stats -->
        <div class="flex justify-center items-center">
            <div class="stats stats-vertical sm:stats-horizontal shadow mt-5">
                <div class="stat">
                    <div class="stat-title">Total Tasks</div>
                    <div class="stat-value text-center">12</div>
                    <!-- <div class="stat-desc">↗︎ 400 (22%)</div> -->
                </div>
                <div class="stat">
                    <div class="stat-title">Total Hours</div>
                    <div class="stat-value text-emerald-500 text-center">7.98</div>
                    <div class="stat-desc text-center">7 hrs 59 mins</div>
                </div>
            </div>
        </div>
        <!--  Group Stats -->
        <div>
            <h3 class="text-center mt-8">Misc</h3>
            <div class="flex justify-center items-center">
                <div class="stats stats-vertical sm:stats-horizontal shadow mt-1">
                    <div class="stat">
                        <div class="stat-title">Total Tasks</div>
                        <div class="stat-value text-center">7</div>
                        <!-- <div class="stat-desc">↗︎ 400 (22%)</div> -->
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Hours</div>
                        <div class="stat-value text-emerald-500 text-center">5.23</div>
                        <div class="stat-desc text-center">7 hrs 59 mins</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">OT Hours</div>
                        <div class="stat-value text-emerald-500 text-center">0.5</div>
                        <div class="stat-desc text-center">30 mins</div>
                    </div>
                </div>
            </div>
        </div>
        <!--  /Group Stats -->

    </div>
</template>