<template>
    <div class="ImageBox">
        <img :src="src" alt="">
        <div class="mask" v-if="state">
            <p v-if="state === 1">选中态</p>
            <p v-if="state === 2">已使用态</p>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
@Component
export default class ImageBox extends Vue {
    @Prop() private readonly src: string;
    @Prop() private readonly state: number;
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
}
</style>


