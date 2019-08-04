<template>
    <div class="TranslateTool"
        ref="translateTool"
        :style="{ 
            width: width + 'px',
            left: positionX + 'px',
        }"
    >
        <span class="leftLine" ref="leftLine"></span>
        <span class="rightLine" ref="rightLine"></span>
    </div>
</template>
<script lang="ts" scoped>
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Matrix from '@/utils/Matrix.ts';

@Component
export default class TranslateTool extends Vue {
    @Prop() private readonly index: number;
    @Prop({ default: 100 }) private readonly width: number;
    // @Prop() private readonly height: string;
    @Prop() private readonly positionX: number;

    private initWidth: number = 0;
    private direction: 'left' | 'right' = 'right';

    move(x: number, direction: string) {
        let width; 
        if(direction === 'right') {
            width = this.initWidth + x
        } else {
            width = this.initWidth - x;
        }
        // this.resultWidth = width;
        this.$emit('move', this.index, width, direction);
    }

    listenMove() {
        let el = this.$refs.translateTool as HTMLElement;
        let startX = 0;
        let startY = 0;
        let startMatrix: Matrix = new Matrix();
        const endMatrix: Matrix = new Matrix();
        const initStartMatrix: Matrix = new Matrix();

        const updateDom = (matrix: Matrix) => {
            const { x, y } = matrix;
            this.move(x, this.direction);
        };

        // document 监听 mousemove
        const moveEvent = (evt: MouseEvent) => {
            initStartMatrix.copyFrom(startMatrix);
            const endX = evt.x;
            const endY = evt.y;
            const addX = endX - startX;
            const addY = endY - startY;
            initStartMatrix.translate(addX, addY);
            updateDom(initStartMatrix);
        };

        // document 监听 mouseup
        const upEvent = () => {
            endMatrix.copyFrom(initStartMatrix);
            document.body.removeEventListener('mousemove', moveEvent, false);
            document.body.removeEventListener('mouseup', upEvent, false);
        };

        // el 监听 mousedown
        el.addEventListener('mousedown', (evt) => {
            console.log('--> listenMove');
            this.initWidth = this.width;
            startX = evt.x;
            startY = evt.y;
            if (!el.style.transform) {
                startMatrix = new Matrix(1, 0, 0, 1, 0, 0);
            } else {
                startMatrix.copyFrom(endMatrix);
            }
            document.body.addEventListener('mousemove', moveEvent, false);
            document.body.addEventListener('mouseup', upEvent, false);
        }, false);
    }

    listenLeftMove() {
        let el = this.$refs.leftLine as HTMLElement;
        // el 监听 mousedown
        el.addEventListener('mousedown', (evt) => {
            console.log('--> listenLeftMove');
            this.direction = 'left';
        }, false);
    }

    listenRightMove() {
        let el = this.$refs.rightLine as HTMLElement;
        // el 监听 mousedown
        el.addEventListener('mousedown', (evt) => {
            console.log('--> listenRightMove');
            this.direction = 'right';
        }, false);
    }

    mounted() {
        this.listenLeftMove();
        this.listenRightMove();
        this.listenMove();
        let translateTool = this.$refs.translateTool as HTMLElement;
        translateTool.onmousedown = function(e){
            e.preventDefault()
        };
    }
}
</script>
<style lang="scss" scoped>
.TranslateTool {
    position: absolute;
    top: 0;
    height: 100px;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid red;
    display: flex;
}
.line_common {
    flex: 1;
    cursor: pointer;
}
.leftLine {
    @extend .line_common;
    background-color: rgba(0, 0, 255, 0);
    left: 20px;
}
.rightLine {
    @extend .line_common;
    background-color: rgba(255, 0, 0, 0);
    border-left: 1px dashed orange;
    right: 20px;
}

</style>


