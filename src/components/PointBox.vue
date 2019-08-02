<template>
    <div class="PointBox" :style="{ width: width }">
        <img :src="src" alt="" :style="{ width: width, height: height }">
        <!-- <div class="mask">
            <p>{{ start }} - {{ end }}</p>
        </div> -->
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class PointBox extends Vue {
    @Prop() private readonly src: string;
    @Prop() private readonly start: number;
    @Prop() private readonly end: number;
    @Prop() private readonly width: string;
    @Prop() private readonly height: string;
}
</script>
<style lang="scss" scoped>
@import '@/assets/style/mixin.scss';

.PointBox {
    height: 100%;
    position: relative;
    img {
        position: absolute;
        top: 0;
        left: 0;
    }
    .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        position: relative;
        word-wrap: break-word;
        p {
            color: red;
        }
    }
}
</style>
