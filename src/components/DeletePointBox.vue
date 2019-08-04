<template>
    <div class="DeletePointBox" :style="{ 
            width: width + 'px',
            left: positionX + 'px',
        }" >
        <span class="remove el-icon-circle-close" @click="remove"></span>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Matrix from '@/utils/Matrix.ts';
@Component
export default class PointBox extends Vue {
    @Prop() private readonly width: number;
    @Prop() private readonly positionX: number;

    remove() {
        this.$emit('remove');
    }
    mounted() {}

}
</script>
<style lang="scss" scoped>
@import '@/assets/style/mixin.scss';

.DeletePointBox {
    position: absolute;
    top: 0;
    height: 100%;
    background-color: red;
    .remove {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 16px;
        color: #000;
        cursor: pointer;
    }
}
</style>
