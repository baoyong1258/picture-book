<template>
    <div class="PointBox" :style="{ 
            width: width + 'px',
            left: positionX + 'px',
        }" >
        <div class="imgBox">
            <img v-if="type == 1" :src="src" :style="{ width: width+ 'px', height: height }" ref="img">
            <div v-else class="deleteBox" :style="{ width: width+ 'px' }" ></div>
        </div>
        <div class="mask">
            <!-- <p>{{ start }} - {{ end }}</p> -->
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Matrix from '@/utils/Matrix.ts';
@Component
export default class PointBox extends Vue {
    @Prop() private readonly type: number;
    @Prop() private readonly index: number;
    @Prop() private readonly src: string;
    @Prop() private readonly start: number;
    @Prop() private readonly end: number;
    @Prop() private readonly width: number;
    @Prop() private readonly height: string;
    @Prop() private readonly positionX: number;


    mounted() {}

}
</script>
<style lang="scss" scoped>
@import '@/assets/style/mixin.scss';

.PointBox {
    height: 100%;
    position: absolute;
    top: 0;
    .imgBox {
        position: relative;
        .deleteBox {
            background-color: orange;
            height: 100px;
        }
    }
    img {
        // position: absolute;
        // top: 0;
        // left: 0;
    }
    // .mask {
    //     position: absolute;
    //     top: 0;
    //     left: 0;
    //     width: 100%;
    //     height: 100%;
    //     background-color: rgba(0, 0, 0, 0.3);
    //     position: relative;
    //     word-wrap: break-word;
    //     p {
    //         color: red;
    //     }
    // }
}
</style>
