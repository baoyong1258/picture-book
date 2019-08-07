import Vue from 'vue';
import Matrix from '../utils/Matrix';

Vue.directive('drag', {
    bind(el, binding, vnode) {
        let startX = 0;
        let startY = 0;
        let startMatrix: Matrix = new Matrix();
        const endMatrix: Matrix = new Matrix();
        const initStartMatrix: Matrix = new Matrix();

        const updateDom = (matrix: Matrix) => {
            const { x, y } = matrix;
            const transform = `matrix(1,0,0,1,${x},${y})`;
            el.style.transform = transform;
        };

        const moveEvent = (evt: MouseEvent) => {
            initStartMatrix.copyFrom(startMatrix);
            const endX = evt.x;
            const endY = evt.y;
            const addX = endX - startX;
            const addY = endY - startY;
            initStartMatrix.translate(addX, addY);
            updateDom(initStartMatrix);
        };

        const upEvent = () => {
            endMatrix.copyFrom(initStartMatrix);
            document.body.removeEventListener('mousemove', moveEvent, false);
            document.body.removeEventListener('mouseup', upEvent, false);
        };

        el.addEventListener('mousedown', (evt) => {
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
    },
});
