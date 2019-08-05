<template>
    <div class="Home">
        <div class="right-container">
            <!-- 图片列表 -->
            <div class="imageContainer">
                <ImageBox
                    v-for="(item, index) in imageList"
                    :key="index"
                    :index="index"
                    :src="item.src"
                    :state="item.state"
                    :playState="item.playState"
                    @click.native="selecImage(index)"
                    @biggerImage="biggerImage(index)"
                    @removeImage="removeImage(index)"
                ></ImageBox>
                <div class="biggerImageBox" v-if="biggerImageBoxShow">
                    <img 
                        :src="biggerImageSrc"
                        :data-src="biggerImageSrc"
                        @dragstart="dragstartByResource"
                        :draggable="imageList[biggerImageIndex].state !== 2"
                    >
                    <div class="mask" v-if="imageList[biggerImageIndex].state === 2">
                        <p>已使用</p>
                    </div>
                    <span class="close el-icon-circle-close" @click="biggerImageBoxShow = false"></span>
                </div>
            </div>
            <!-- 音频编辑区域 -->
            <div class="audioEdit">
                <!-- 左侧标题 -->
                <div class="audioEdit_left">
                    <p class="img">
                        <span>图片</span>
                    </p>
                    <p class="audio">
                        <span class="audio_contianer">
                            <span>音频</span>
                            <span class="btn_box">
                                <span class="el-icon-video-play" v-if="isPlay" @click="play"></span>
                                <span class="el-icon-video-pause" v-else @click="pause"></span>
                            </span>
                        </span>
                        <span>{{ currentTimeFilter }}</span>
                        <audio
                            style="display: none"
                            controls 
                            @loadedmetadata="loadedmetadata"
                            @timeupdate="timeupdate"
                        >
                        </audio>
                    </p>
                </div>
                <!-- 右侧操作区域 -->
                <div class="audioEdit_right">
                    <div class="pointEditBox">
                        <div class="pointEditContainer">
                            <!-- 时间进度条 -->
                            <el-slider 
                                v-model="sliderValue"
                                :step="0.01"
                                :min="0"
                                :max="max"
                                :marks="marks"
                                :format-tooltip="formatTooltip"
                                @change="change"
                            ></el-slider>
                            <!-- 图片匹配音频区域 -->
                            <div 
                                class="pointContainer"
                                @dragover.prevent 
                                @drop='dropModuleOnEgret'
                            >
                                <PointBox
                                    v-for="(item, index) in pointList"
                                    :key="index"
                                    :type="item.type"
                                    :index="index"
                                    :isActive="index === pointBoxActiveIndex"
                                    :src="item.src"
                                    :start="item.start"
                                    :end="item.end"
                                    :width="item.width"
                                    :positionX="item.positionX"
                                    @click.native="clcikPointBox(index)"
                                    @move="pointBoxMove"
                                ></PointBox>
                                <!-- translate工具组件 -->
                                <TranslateTool
                                    v-if="translateToolShow"
                                    :index="pointBoxActiveIndex"
                                    :isLast="pointBoxActiveIndex === pointList.length - 1"
                                    :width="pointBoxActiveItem.width"
                                    :height="pointBoxActiveItem.height"
                                    :positionX="pointBoxActiveItem.positionX"
                                    @move="pointBoxMove"
                                    @remove="removePoint"
                                ></TranslateTool>
                            </div>
                            <!-- 音频截取操作区域 -->
                            <div class="audioEditContainer" ref="audioEditContainer">
                                <DeletePointBox
                                    v-for="(item, index) in deletePointList"
                                    :key="item.id"
                                    :width="item.width"
                                    :index="index"
                                    :positionX="item.positionX"
                                ></DeletePointBox>
                            </div>
                            <!-- 进度滑块 -->
                            <div class="pointer"></div>
                        </div>
                    </div>
                    <div class="btn_container">
                        <!-- <el-button :disabled="disabled" type="primary" @click="startPoint">开始打点</el-button> -->
                        <!-- <el-button :disabled="!disabled" type="success" @click="endPoint">结束打点</el-button> -->
                        <!-- <el-button @click="resetPoint">重置</el-button> -->
                        <el-button @click="preview">预览</el-button>
                        <el-button type="primary" @click="save">保存</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
// @ts-ignore
import Mousetrap from 'mousetrap';
import { Component, Vue, Watch } from 'vue-property-decorator';
import ImageBox from '@/components/ImageBox.vue';
import PointBox from '@/components/PointBox.vue';
import DeletePointBox from '@/components/DeletePointBox.vue';
import TranslateTool from '@/components/TranslateTool.vue';
import Utils from '@/utils/index.ts';
import Matrix from '@/utils/Matrix.ts';

const imageDataTemplate = { 
    id: 0, 
    type: 1, // 图片断点类型，1: 图片，0: 删除区域
    src: '', // 图片路径
    state: 0, // 0: 默认，1: 已选中，2：已使用
    start: 0, // 起始时间
    end: 0, // 结束时间
    width: 100, // 图片宽度
    height: 'auto', // 图片高度
    playState: 0, // 播放状态 0: 暂停 1：播放
    positionX: 0, // x轴坐标
};


@Component({
    components: {
        ImageBox,
        PointBox,
        DeletePointBox,
        TranslateTool
    }
})
export default class Home extends Vue {
    private pictureBookId: ''; // 绘本Id
    private sliderValue: number = 0; // 进度条的值
    private max = 0; // 进度条最大值
    private marks = {}; // 进度条下标时间点
    private isPlay = true; // 播放状态 用于控制播放icon的切换
    private duration: number = 0; // 音频完整时间
    private currentTime = 0; // 音频播放的当前时间
    private currentTimeFilter = ''; // 音频播放的当前时间 - 展示时间
    private disabled = false; // 打点按钮是否可点击
    private selectedIndex: number = 0; // 选中图片的索引
    private pointStart: number = 0; // 打点 - 起始点时间
    private pointEnd: number = 0; // 打点 - 结束点时间
    private pointStartLeft: number = 0; // 进度指针的位置
    private divNum: number = 30; // 展示的进度数值的段数

    private pointBoxActiveIndex = 0; // 被选中的打点图片索引
    private pointBoxActiveItem = {}; // 被选中的打点图片item

    private imageList = [ // 图片列表
        { 
            id: 0, 
            src: 'https://creator.uuabc.com/courseware/assets/dj_EGRFf-Ed0ji6.jpg',
            state: 0, 
            start: 0, 
            end: 0, 
            width: 200, 
            height: '', 
            playState: 0, 
            positionX: 0 
        },
    ]
 
    private pointList: any[] = []; // 打点图片列表
    private deletePointList: any[] =[]; // 删除音频列表

    private biggerImageBoxShow: boolean = false; // 是否展示大图
    private biggerImageSrc: string = ''; // 大图src
    private biggerImageIndex: number = 0; // 大图索引

    private translateToolShow: boolean = false; // 是否展示translateTool工具组件

    private pointer: HTMLElement; // 指针dom
    private audio: HTMLAudioElement// 音频dom

    private playStatus: string = 'play'; // 播放状态：'play' 'preview'

    // 选择图片列表
    selecImage(index: number) {
        if (this.imageList[index].state) {
            return;
        } 
        this.imageList.forEach(item => {
            if(item.state === 1) {
                item.state = 0;
            }
        });
        this.imageList[index].state = 1;
        this.selectedIndex = index;
    }

    // 拖拽大图
    public dragstartByResource(evt: any) {
        let src = evt.target.dataset.src;
        evt.dataTransfer.setData('src', src);
        evt.dataTransfer.setData('index', this.biggerImageIndex);
        evt.dataTransfer.setData('type', 'image');
    }

    // 点击打点图片列表
    public clcikPointBox(index:number) {
        this.translateToolShow = true;
        this.pointBoxActiveIndex = index;
        this.pointBoxActiveItem = this.pointList[index];
    }

    // 将图片拖拽到打点区域触发
    public dropModuleOnEgret(evt: any) {
        const type = evt.dataTransfer.getData('type');
        if (!type) { return; } // 过滤可拖动元素拖动到非指定区域
        switch(type) {
            case 'image':
                this.pause();
                const src = evt.dataTransfer.getData('src');
                const index = evt.dataTransfer.getData('index');
                this.selecImage(Number(index));
                let point = this.imageList[index];
                point.state = 2;
                point.positionX = this.getMaxPositionX();
   
                // 根据pointer元素的位置和positionX计算width
                let width = Utils.getPointLeft(this.pointer) - this.pointStartLeft - point.positionX;
                if(width > 0) {
                    point.width = width;
                }

                this.pointList.push(point);
                this.reArrange();
        }
    }

    // 平移translateTool工具后的回调
    public pointBoxMove(index: number, width: number, direction: 'left' | 'right') {
        if(direction === 'left') {
            let point = this.pointList[index];
            let prePoint = this.pointList[index - 1];
            const addWidth = width - point.width;
            point.positionX -= addWidth;
            point.width += addWidth;
            if(prePoint) {
               prePoint.width -= addWidth;
            }
        } else if(direction === 'right') {
            let point = this.pointList[index];
            let nextPoint = this.pointList[index + 1];
            const addWidth = width - point.width;
            point.width += addWidth;
            if(nextPoint) {
                nextPoint.positionX += addWidth;
                nextPoint.width -= addWidth;
            }
        }
        this.reArrange();
    }

    // 删除打点图片/截取区域
    removePoint() {
        this.$confirm('确认删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            // 还原状态
            const point = this.pointList[this.pointBoxActiveIndex];
            const { id } = point;
            const imageIndex = this.imageList.findIndex(img => img.id === id);
            if(imageIndex !== -1) {
                this.imageList[imageIndex].state = 0;
            }
            // 删除打点图片
            this.pointList.splice(this.pointBoxActiveIndex, 1);
            this.translateToolShow = false;
            // 删除截取区域
            if(point.type === 0) {
                const deletePointIndex = this.deletePointList.findIndex(point => point.id === id);
                if(deletePointIndex !== -1) {
                    this.deletePointList.splice(deletePointIndex, 1);
                }
            }

            this.$message({
                type: 'success',
                message: '删除成功!'
            });
        }).catch(() => {

        })
    }

    // 暂停音频
    pause() {
        this.playStatus = 'play';
        this.isPlay = true;
        this.audio.pause();
    }

    // 播放音频
    play() {
        this.isPlay = false;
        this.audio.play();
    }

    // 播放打点图片的包含的音频
    // playPoint(index: number) {
    //     let point = this.imageList[index];
    //     this.imageList.map(item => item.playState = 0);
    //     point.playState = 1;
    //     this.currentTime = point.start;
    //     const endTime = point.end;
    //     this.isPlay = false;
    //     const audio = this.audio;
    //     audio.currentTime = this.currentTime;
    //     let fn: any;
    //     audio.addEventListener('timeupdate', fn = () => {
    //         if(audio.currentTime > endTime) {
    //             this.pausePoint(index);
    //             this.currentTime = endTime;
    //             this.sliderValue = endTime;
    //             audio.removeEventListener('timeupdate', fn);
    //         }
    //     }, false);
    //     setTimeout(() => {
    //         audio.play();
    //     }, 0);
    // }
    
    // 暂停打点图片音频
    // pausePoint(index: number) {
    //     this.imageList[index].playState = 0;
    //     this.pause();
    // }

    // 放大图片
    biggerImage(index: number) {
        this.biggerImageBoxShow = true;
        this.biggerImageSrc = this.imageList[index].src;
        this.biggerImageIndex = index;
    }

    // 将打点图片从打点区域删除
    // removeImage(index: number) {
    //     const item = this.imageList[index];
    //     const { id } = item;
    //     item.state = 0;
    //     const pointIndex = this.pointList.findIndex(point => point.id === id);
    //     if(pointIndex !== -1) {
    //         this.pointList.splice(pointIndex, 1);
    //     }
    // }

    // 删除截取音频区域
    // removeDeletePointBox(pointId: number) {
    //     const deletePonitIndex = this.deletePointList.findIndex(item => item.id === pointId);
    //     this.deletePointList.splice(deletePonitIndex, 1);
    //     const ponitIndex = this.pointList.findIndex(item => item.id === pointId);
    //     if(ponitIndex !== -1) {
    //         this.pointList.splice(ponitIndex, 1);
    //     }
    // }

    // 拖拽音频进度条触发
    change(value: number) {
        this.audio.currentTime = value;
    }

    // 监听音频原数据加载完成
    loadedmetadata(evt: any) {
        const duration = evt.currentTarget.duration;
        this.duration = duration;
        this.max = duration;
        // this.max = Math.floor(duration);
        this.marks = this.createMarks(this.max)
    }

    // 监听音频播放事件的改变
    timeupdate(evt: any) {
        this.sliderValue = evt.currentTarget.currentTime;
        this.currentTime = this.sliderValue;
        let deleteEndTime = this.getDeletePointEndTime(this.currentTime);
        // 跳过截取部分
        if(deleteEndTime !== -1) {
            // 防止循环触发
            console.log('deleteEndTime = ' + deleteEndTime);
            deleteEndTime += 0.01;
            console.log('deleteEndTime = ' + deleteEndTime);
            this.sliderValue = deleteEndTime;
            evt.currentTarget.currentTime = deleteEndTime;
            this.currentTime = deleteEndTime;
        }
        // 预览模式
        if(this.playStatus === 'preview') {
            const point = this.pointList.find(point => this.currentTime > point.start && this.currentTime < point.end);
            if(point) {
                this.biggerImageSrc = point.src;
            }
        }
    }

    // 创建音频进度条下标时间区域
    createMarks(max: number) {
        let marks: any = {};
        for(let i = 0, len = this.divNum; i <= len; i++) {
            const num = i / len * max;
            marks[num] = this.formatTooltip(num);
        }
        return marks;
    }

    // 转换进度条上方tip时间
    formatTooltip(value: number) {
        return Utils.exchangeTime(value);
    }

    // startPoint() {
    //     this.play();
    //     this.disabled = true;
    //     this.pointStart = this.currentTime;
    //     const pointer = document.querySelector('.pointer') as HTMLElement;
    //     this.pointStartLeft = Utils.getPointLeft(pointer);
    // }

    // endPoint() {
    //     this.pause();
    //     this.disabled = false;
    //     setTimeout(() => {
    //         const pointer = document.querySelector('.pointer') as HTMLElement;
    //         // start、end
    //         this.pointEnd = this.currentTime;
    //         let point = this.imageList[this.selectedIndex];
    //         point.start = this.pointStart;
    //         point.end = this.pointEnd;
    //         // width、height
    //         let width = Utils.getPointLeft(pointer) - this.pointStartLeft;
    //         point.width = width;

    //         // this.pointList.push(point);
    //         // 改变状态
    //         this.imageList[this.selectedIndex].state = 2;
    //         // this.selecImage(this.selectedIndex + 1);
    //     }, 200);
    // }

    // resetPoint() {
    //     this.disabled = false;
    //     this.pointStart = 0;
    //     this.pointEnd = 0;
    // }

    // 获取打点图片右侧x坐标最大值
    getMaxPositionX() {
        if(!this.pointList.length) { return 0 };
        const pointList = this.pointList.map(point => point.positionX + point.width);
        return Math.max(...pointList);
    }

    // 根据时间获取对应的打点位置
    getTimeByPosition(x: number) {
        let rate = x / (this.imageList.length * 100);
        return this.duration * rate;
    }

    // 判断某个时间点是否在截取音频列表的某个范围内 并返回endTime 用于跳跃截取音频的段
    getDeletePointEndTime(updateTime: number) {
        const point = this.deletePointList.find(point => updateTime > point.start && updateTime < point.end);
        if(point) {
            return point.end;
        }
        return -1;
    }

    // 根据positionX和width计算图片列表的start、end
    reArrange() {
        for(let i = 0, len = this.pointList.length; i < len; i++) {
            let point = this.pointList[i];
            let { positionX, width } = point;
            let startTime = this.getTimeByPosition(positionX);
            let endTime = this.getTimeByPosition(positionX + width);
            point.start = this.exchangeNum(startTime);
            point.end = this.exchangeNum(endTime);
        }
    }

    // 根据positionX和width截取音频列表的start、end
    reArrangeDeletePoint() {
        for(let i = 0, len = this.deletePointList.length; i < len; i++) {
            let point = this.deletePointList[i];
            let { positionX, width } = point;
            let startTime = this.getTimeByPosition(positionX);
            let endTime = this.getTimeByPosition(positionX + width);
            point.start = this.exchangeNum(startTime);
            point.end = this.exchangeNum(endTime);
        }
    }

    // 保留2位小数
    exchangeNum(num: number) {
        return Number(num.toFixed(2));
    }

    // 预览 - 从头播放一次
    preview() {
        this.currentTime = 0;
        this.sliderValue = 0;
        this.audio.currentTime = 0;
        this.playStatus = 'preview';
        this.biggerImageBoxShow = true;
        this.play();
    }

    // 保存
    save() {
        console.log('--> 保存 save');
        axios.post('https://sit-studytool.uuabc.com/api/picture-book/user-mapping', {
            "id": this.pictureBookId,
            // "mappings": { "format": [] }
            "mappings": { "format": this.pointList }
        }).then(res => {
            this.$message({
                message: '保存成功',
                type: 'success'
            });
        })
    }

    // 获取图片、音频资源
    getResources() {
        console.log('全局数据变量');
        //@ts-ignore
        console.log(pictureBookData);
        //@ts-ignore
        const { pictureBookId, images, audio } = pictureBookData;
        this.pictureBookId = pictureBookId;
        this.exchangeImages(images);
        this.adjuctPointEditSize();
        this.reloadAudio(audio);
    }

    // 根据图片资源列表和模版数据生成需要的图片数据列表
    exchangeImages(images: string[] ) {
        this.imageList = images.map((item, index) => Object.assign({}, imageDataTemplate, {
            id: index,
            src: item,
        }));
    }

    // 根据图片资源的数量动态调整打点区域的宽度
    adjuctPointEditSize() {
        const pointEditBox = document.querySelector('.pointEditBox') as HTMLElement;
        pointEditBox.style.width = (document.body.clientWidth - 200) + 'px';
        const pointEditContainer = document.querySelector('.pointEditContainer') as HTMLElement;
        pointEditContainer.style.width = this.imageList.length * 100 + 'px';
    }

    // 加载音频
    reloadAudio(src: string) {
        this.audio.src = src;
        this.audio.load();
    }

    // 监听音频裁剪区域的拖拽
    listenAudioEditContainer() {
        let el = this.$refs.audioEditContainer as HTMLElement;
        let startX = 0;
        let startY = 0;
        let startMatrix: Matrix = new Matrix();
        const endMatrix: Matrix = new Matrix();
        const initStartMatrix: Matrix = new Matrix();

        let templateData = Object.assign({}, imageDataTemplate);
        let isUp = true;

        const updateDom = (matrix: Matrix) => {
            const { x, y } = matrix;
            templateData.width = x;
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
            isUp = true;
            this.pause();
            this.reArrangeDeletePoint();
            let width = Utils.getPointLeft(this.pointer) - this.pointStartLeft - templateData.positionX;
            templateData.width = width;
            endMatrix.copyFrom(initStartMatrix);
            document.body.removeEventListener('mousemove', moveEvent, false);
            document.body.removeEventListener('mouseup', upEvent, false);
        };

        // el 监听 mousedown
        el.addEventListener('mousedown', (evt) => {
            isUp = false;
            templateData = Object.assign({}, imageDataTemplate);
            // @ts-ignore
            templateData.id = new Date().toLocaleString();
            templateData.type = 0;
            // templateData.positionX = evt.offsetX;
            templateData.positionX = this.getMaxPositionX();
            templateData.width = 0;
            setTimeout(() => {
                if(!isUp) {
                    console.log('deletePointList is pushed -->');
                    this.deletePointList.push(templateData);
                    this.pointList.push(templateData);
                }
            }, 30);
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

    // 监听快捷键
    listenKeyBoard() {
        // 空格键控制音频播放/暂停
        Mousetrap.bind('space', () => {
            console.log('空格键事件触发');
            if(this.isPlay) {
                this.play();
            } else {
                this.pause();
            }
        }); 
        // 左右键切换大图展示
        Mousetrap.bind('right', () => {
            console.log('右键事件触发');
            if(!this.biggerImageBoxShow) {
                return;
            }
            if(this.biggerImageIndex >= this.imageList.length - 1) {
                return;
            }
            this.biggerImageIndex ++;
            this.biggerImageSrc = this.imageList[this.biggerImageIndex].src;
        }); 
        Mousetrap.bind('left', () => {
            console.log('左键事件触发');
            if(!this.biggerImageBoxShow) {
                return;
            }
            if(this.biggerImageIndex <= 0) {
                return;
            }
            this.biggerImageIndex --
            this.biggerImageSrc = this.imageList[this.biggerImageIndex].src;
        }); 
        // enter确认大图
        Mousetrap.bind('enter', () => {
            console.log('enter事件触发');
            if(!this.biggerImageBoxShow) {
                return;
            }
            if(this.imageList[this.biggerImageIndex].state === 2) {
                return;
            }
            this.pause();
            let point = this.imageList[this.biggerImageIndex];
            point.state = 2;
            point.positionX = this.getMaxPositionX();

            // 根据pointer元素的位置和positionX计算width
            let width = Utils.getPointLeft(this.pointer) - this.pointStartLeft - point.positionX;
            if(width > 0) {
                point.width = width;
            }

            this.pointList.push(point);
            this.reArrange();
        })
    }   

    // 获取打点信息
    getPointListData() {
        axios.get(`https://sit-studytool.uuabc.com/api/picture-book/mappings/?id=${this.pictureBookId}`)
            .then(res => {
                const data = res.data;
                const { auto_mapping, id, picture_book_id, user_mapping } = data;
                const userFormat = user_mapping.format;
                if( userFormat instanceof Array) {
                    this.pointList = userFormat;
                    this.deletePointList = userFormat.filter(point => point.type === 0);
                    const pointIdList = this.pointList.map(point => point.id);
                    this.imageList.forEach(point => {
                        if(pointIdList.includes(point.id)) {
                            point.state = 2;
                        }
                    })
                }
            })
    }

    mounted() {
        this.audio = document.querySelector('audio') as any;

        this.getResources();

        this.getPointListData();
        // 将指针dom放入element滑块组件中
        const elSliderButtonWrapper = document.querySelector('.el-slider__button-wrapper') as HTMLElement;
        const pointer = document.querySelector('.pointer') as HTMLElement;
        this.pointer = pointer;
        elSliderButtonWrapper.appendChild(pointer);
        this.pointStartLeft = Utils.getPointLeft(pointer);

        // 
        this.listenKeyBoard();

        this.listenAudioEditContainer();
        // axios.get('https://sit-studytool.uuabc.com/api/picture-book/mappings/?id=123')
        //     .then(res => {
        //         console.log(res);
        //     })
        // axios.post('https://sit-studytool.uuabc.com/api/picture-book/user-mapping', {
        //     "id": "123",
        //     "mappings": { "format": "any JSON data" }
        // })
    }

    @Watch('currentTime')
    onChildChanged(val: number) {
        this.currentTimeFilter = Utils.exchangeTime(val);
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/style/mixin.scss';
.Home {
  height: 100%;
  display: flex;
}
.right-container {
    flex: 1;
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    padding-top: 300px;
    position: relative;
}
.imageContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 300px;
    padding: 0 20px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    .ImageBox {
        margin-left: 20px;
    }
    .biggerImageBox {
        @include center();
        border: 1px solid #000;
        .close {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 24px;
        }
        img {
            height: 280px;
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
}
.audioEdit {
    height: 100%;
    display: flex;
    // background-color: skyBlue;
    .audioEdit_left {
        width: 200px;
        border-right: 1px solid #000;
        p {
            height: 50%;
        }
        p.img {
            position: relative;
            span {
                @include center();
            }
        }
        p.audio {
            position: relative;
            .audio_contianer {
                @include center(); 
                display: flex;
                align-items: center;               
            }
            .btn_box {
                font-size: 40px;
            }
        }
    }
    .audioEdit_right {
        flex: 1;
        .pointEditBox {
            padding: 0 20px;
            width: 1000px;
            overflow-x: auto;
            position: relative;
        }
        .pointContainer {
            margin-top: 4px;
            width: 100%;
            height: 100px;
            background-color: #dddddd;
            overflow: hidden;
            position: relative;
            .TranslateTool {

            }
        }
        .audioEditContainer {
            width: 100%;
            height: 100px;
            background-color: skyBlue;
            overflow: hidden;
            position: relative;
        }
        .pointer {
            position: absolute;
            top: 18px;
            left: 18px;

            height: 220px;
            width: 1px;
            padding: 0 2px;
            border-left: 1px solid blue;
            cursor: pointer;
        }
        .btn_container {
            margin-top: 60px;
        }
    }
}
</style>
