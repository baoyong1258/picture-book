<template>
    <div 
        class="ImageBox"
        :data-src="src"
        @dragstart="dragstartByResource"
        :draggable="state !== 2"
    >
        <div class="imgContainer">
            <img :src="src" alt="">
            <div class="mask" v-if="state">
                <p v-if="state === 1">选中</p>
                <p v-if="state === 2">已使用</p>
            </div>
            <span class="bigger el-icon-zoom-in" @click="biggerImage"></span>
            <span class="isAllImage" v-if="isAllImage">纯图片</span>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class ImageBox extends Vue {
    @Prop() private readonly src: string;
    @Prop() private readonly index: number;
    @Prop() private readonly state: number;
    @Prop({ default: false }) private readonly isAllImage: boolean;
    // @Prop() private readonly playState: number;

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
    // height: 100px;
    position: relative;
    .imgContainer {
        width: 100%;
        position: relative;
    }
    img {
        width: 100%;
        // @include center();
    }
    .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        // height: 100%;
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
    .isAllImage {
        position: absolute;
        left: 0;
        bottom: 0;
        color: #409EFF;
        font-size: 14px;
        font-weight: 600;
    }
}
</style>


