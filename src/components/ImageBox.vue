<template>
    <div 
        class="ImageBox"
        :data-src="src"
        @dragstart="dragstartByResource"
        draggable="true"
    >
        <img :src="src" alt="">
        <div class="mask" v-if="state">
            <p v-if="state === 1">选中</p>
            <p v-if="state === 2">已使用</p>
        </div>
        <!-- <span class="btn_box" v-if="state === 2">
            <span class="el-icon-video-play" v-if="playState === 0" @click="play"></span>
            <span class="el-icon-video-pause" v-else @click="pause"></span>
        </span> -->
        <span class="bigger el-icon-zoom-in" @click="biggerImage"></span>
        <span v-if="state === 2" class="remove el-icon-circle-close" @click="removeImage"></span>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class ImageBox extends Vue {
    @Prop() private readonly src: string;
    @Prop() private readonly index: number;
    @Prop() private readonly state: number;
    @Prop() private readonly playState: number;

    // 源对象开始拖拽 - 资源
    public dragstartByResource(evt: any) {
        let src = evt.target.dataset.src;
        evt.dataTransfer.setData('src', src);
        evt.dataTransfer.setData('index', this.index);
        evt.dataTransfer.setData('type', 'image');
    }

    play() {
        this.$emit('play');
    }

    pause() {
        this.$emit('pause');
    }

    biggerImage() {
        this.$emit('biggerImage');        
    }

    removeImage() {
        this.$emit('removeImage');
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/style/mixin.scss';

.ImageBox {
    width: 100px;
    height: 100px;
    position: relative;
    img {
        width: 100%;
        @include center();
    }
    .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
    }
    .btn_box {
        font-size: 40px;
        color: skyBlue;
        @include center(); 
        cursor: pointer;
    }
    .icon {
        position: absolute;
        right: 0;
        cursor: pointer;
    }
    .bigger {
        @extend .icon;
        font-size: 20px;
        color: orange;
        bottom: 0;
    }
    .remove {
        @extend .icon;
        font-size: 16px;
        color: red;
        top: 0;
    }
}
</style>


