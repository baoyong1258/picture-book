<template>
    <div class="PointBox" :style="{ 
            width: width + 'px',
            left: positionX + 'px',
        }" >
        <div class="imgBox">
            <img v-if="type == 1" :src="src" :style="{ width: width+ 'px', height: height }" ref="img">
            <div v-else class="deleteBox" :style="{ width: width+ 'px' }" ></div>
        </div>
        <div class="direction" v-if="type == 1">
            <span class="left el-icon-d-arrow-left" v-if="direction === 0"></span>
            <span class="right el-icon-d-arrow-right" v-else></span>
        </div>
        <div v-if="hasSpacePage && type != 0" class="spaceSign">
            <p>空白页</p>
        </div>

        <!-- <div class="mask">
            <p>{{ start }} - {{ end }}</p>
        </div> -->
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
    @Prop({ default: false }) private readonly hasSpacePage: boolean;
    @Prop({ default: 0 }) private readonly direction: 0 | 1;


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
    .direction {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        span {
            font-size: 16px;
            font-weight: 600;
            // color: #67C23A;
            color: #F56C6C;
        }
        .left {
            float: left;
        }
        .right {
            float: right;
        }
    }
    .spaceSign {
        position: absolute;
        top: -10px;
        right: 0;
        width: 1px;
        background-color: #ffffff;
        height: 110px;
        p {
            @include center-x();
            top: -26px;
            font-size: 10px;
        }
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
