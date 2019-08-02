<template>
    <div class="Home">
        <div class="aside"></div>
        <div class="right-container">
            <div class="imageContainer">
                <ImageBox
                    v-for="(item, index) in imageList"
                    :key="index"
                    :src="item.src"
                    :state="item.state"
                    @click.native="selecImage(index)"
                ></ImageBox>
            </div>
            <div class="audioEdit">
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
                        <span>{{ currentTime }}</span>
                        <audio
                            style="display: none"
                            controls 
                            @loadedmetadata="loadedmetadata"
                            @timeupdate="timeupdate"
                        >
                        </audio>
                    </p>
                </div>
                <div class="audioEdit_right">
                    <div class="pointEditBox">
                        <div class="pointEditContainer">
                            <el-slider 
                                v-model="sliderValue"
                                :min="0"
                                :max="max"
                                :marks="marks"
                                :format-tooltip="formatTooltip"
                                @change="change"
                            ></el-slider>
                            <div class="pointContainer">
                                <PointBox
                                    v-for="(item, index) in pointList"
                                    :key="index"
                                    :src="item.src"
                                    :start="item.start"
                                    :end="item.end"
                                    :width="item.width"
                                ></PointBox>
                            </div>
                        </div>
                    </div>
                    <div class="btn_container">
                        <el-button :disabled="disabled" type="primary" @click="startPoint">开始打点</el-button>
                        <el-button :disabled="!disabled" type="success" @click="endPoint">结束打点</el-button>
                        <el-button @click="resetPoint">重置</el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import axios from 'axios';
import { Component, Vue } from 'vue-property-decorator';
import ImageBox from '@/components/ImageBox.vue';
import PointBox from '@/components/PointBox.vue';

const imageDataTemplate = { 
    id: 0, 
    src: 'https://creator.uuabc.com/courseware/assets/dj_EGRFf-Ed0ji6.jpg', 
    state: 0, 
    start: 0, 
    end: 0, 
    width: '', 
    height: '', 
    playState: 0 
};


@Component({
    components: {
        ImageBox,
        PointBox,
    }
})
export default class Home extends Vue {
    private pictureBookId: '';
    private sliderValue: number = 0;
    private max = 0;
    private marks = {};
    private isPlay = true;
    private duration: number = 0;
    private currentTime = 0;
    private disabled = false;
    private selectedIndex: number = 0;
    private pointStart: number = 0;
    private pointEnd: number = 0;

    private divNum: number = 30; // 展示的进度数值的段数

    private imageList = [
        { id: 0, src: 'https://creator.uuabc.com/courseware/assets/dj_EGRFf-Ed0ji6.jpg', state: 0, start: 0, end: 0, width: '', height: '', playState: 0 },
    ]

    private pointList: any[] = []

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

    pause() {
        this.isPlay = true;
        const audio = document.querySelector('audio') as any;
        audio.pause();
    }

    play() {
        this.isPlay = false;
        const audio = document.querySelector('audio') as any;
        audio.play();
    }

    change(value: number) {
        console.log('change value = ' + value);
        const audio = document.querySelector('audio') as any;
        audio.currentTime = value;
    }

    loadedmetadata(evt: any) {
        const duration = evt.currentTarget.duration;
        this.duration = duration;
        console.log('duration = ' + duration);
        this.max = Math.floor(duration);
        this.marks = this.createMarks(this.max)
    }

    timeupdate(evt: any) {
        this.sliderValue = evt.currentTarget.currentTime;
        this.currentTime = this.sliderValue;
    }

    createMarks(max: number) {
        let marks: any = {};
        for(let i = 0, len = this.divNum; i <= len; i++) {
            const num = i / len * max;
            marks[num] = this.formatTooltip(num);
        }
        return marks;
    }

    formatTooltip(value: number) {
        value = Math.floor(value);
        let minute: any = Math.floor(value / 60);
        let second: any = value - 60 * minute;
        minute = minute > 9 ? minute : `0${minute}`;
        second = second > 9 ? second : `0${second}`;
        return `${minute}:${second}`;
    }

    startPoint() {
        this.play();
        this.disabled = true;
        this.pointStart = this.currentTime;
    }

    endPoint() {
        console.log(this.selectedIndex);
        this.pause();
        this.disabled = false;
        // start、end
        this.pointEnd = this.currentTime;
        let point = this.imageList[this.selectedIndex];
        point.start = this.pointStart;
        point.end = this.pointEnd;
        let durationTime = point.end - point.start;
        // width、height
        let width;
        let height;
        let rate = durationTime / this.duration;
        if(rate > 1 / this.imageList.length) {
            height = '100px';
        } else {
            height = 'auto';
        }
        width = rate * this.imageList.length * 100 + 'px';
        point.width = width;
        point.height = height;

        this.pointList.push(point);
        // 改变状态
        this.imageList[this.selectedIndex].state = 2;
        this.selecImage(this.selectedIndex + 1);
    }

    resetPoint() {
        this.disabled = false;
        this.pointStart = 0;
        this.pointEnd = 0;
    }

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
        // axios.get('./data.json')
        // .then((response) => {
        //     // handle success
        //     console.log(response);
        //     const data = response.data;
        //     const { pictureBookId, images, audio } = data;
        //     this.pictureBookId = pictureBookId;
        //     this.exchangeImages(images);
        //     this.adjuctPointEditSize();
        //     this.reloadAudio(audio);
        // })
        // .catch(function (error) {
        //     // handle error
        //     console.log(error);
        // })
        // .finally(function () {
        //     // always executed
        // });
    }

    exchangeImages(images: string[] ) {
        this.imageList = images.map((item, index) => Object.assign({}, imageDataTemplate, {
            id: index,
            src: item,
        }));
        console.log(this.imageList);
    }

    adjuctPointEditSize() {
        const pointEditContainer = document.querySelector('.pointEditContainer') as HTMLElement;
        pointEditContainer.style.width = this.imageList.length * 100 + 'px';
    }

    reloadAudio(src: string) {
        const audio = document.querySelector('audio') as HTMLAudioElement;
        audio.src = src;
        audio.load();
    }
    
    mounted() {
        this.getResources();
    }
}
</script>
<style lang="scss" scoped>
@import '@/assets/style/mixin.scss';
.Home {
  height: 100%;
  display: flex;
}
.aside {
  height: 100%;
  width: 200px;
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
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
    // background-color: orange;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    .ImageBox {
        margin-left: 20px;
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
        padding: 0 20px;
        .pointEditBox {
            width: 1000px;
            overflow-x: auto;
        }
        .pointContainer {
            margin-top: 4px;
            width: 100%;
            height: 100px;
            background-color: #dddddd;
            overflow: hidden;
            display: flex;
        }
        .btn_container {
            margin-top: 60px;
        }
    }
}
</style>
