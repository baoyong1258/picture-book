class Utils {
    public static exchangeTime(value: number) {
        value = Math.floor(value);
        let minute: any = Math.floor(value / 60);
        let second: any = value - 60 * minute;
        minute = minute > 9 ? minute : `0${minute}`;
        second = second > 9 ? second : `0${second}`;
        return `${minute}:${second}`;
    }

    public static getPointLeft(obj: any) { // 获取某元素以浏览器左上角为原点的坐标
        let t = obj.offsetTop; // 获取该元素对应父容器的上边距
        let l = obj.offsetLeft; // 对应父容器的上边距
        // 判断是否有父容器，如果存在则累加其边距
        while (obj = obj.offsetParent) {// 等效 obj = obj.offsetParent;while (obj != undefined)
            t += obj.offsetTop; // 叠加父容器的上边距
            l += obj.offsetLeft; // 叠加父容器的左边距
        }
        return l;
    }
}

export default Utils;
