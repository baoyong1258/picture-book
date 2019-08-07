<template>
     <div 
        class="ImageBox"
        @dragover.prevent.stop 
        @drop.stop='dropModuleOnBg'
        >
        <img 
            v-if="imgPath" 
            :src="imgPath" 
            :data-src="imgPath"
            @dblclick="clearBgByDblclick"
            @dragstart="dragstartByResource"
            @dragend="clearBg"
            draggable="true"
        >
        <span v-else class="icon el-icon-plus"></span>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
@Component
export default class ImageBox extends Vue {
    @Prop(String) private readonly imgPath: string;
    // 记录拖拽的源对象与目标对象是否是同一个的标记
    private isOtherBox: boolean = true;

    // 拖拽图片到指定区域
    @Emit('dropFinish')
    public dropModuleOnBg(evt: any) {
        this.isOtherBox = false;
        const src = evt.dataTransfer.getData('src');
        return src;
    }
    // 清空图片
    public clearBg(evt: any) {
        if (this.isOtherBox) {
            this.clearBgByDblclick();
        }
    }
    // 双击清空图片
    @Emit('dropFinish')
    public clearBgByDblclick() {
        return '';
    }
    // 拖拽图片
    public dragstartByResource(evt: any) {
        this.isOtherBox = true;
        const src = evt.target.dataset.src;
        evt.dataTransfer.setData('src', src);
    }
}
</script>
<style lang="scss" scoped>

.ImageBox {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border: 1px solid #ccc;
  color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 100%;
  }
}
</style>