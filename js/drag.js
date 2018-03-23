(function () {
    var isMobile = 'ontouchstart' in document;
    var transform = getTransform();
    var eventNames = getEventNames();

    /**
     * 获取当前浏览器支持的 transform 属性名称
     */
    function getTransform() {
        var transform = '',
            divStyle = document.createElement('div').style,
            transformArr = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'],
            i = 0,
            len = transformArr.length;

        for (; i < len; i++) {
            if (transformArr[i] in divStyle) {
                return transform = transformArr[i];
            }
        }

        return transform;
    }

    /**
     * 获取移动端或者 PC 端浏览器的事件名称集合
     */
    function getEventNames() {
        var down = 'mousedown',
            move = 'mousemove',
            up = 'mouseup';

        if (isMobile) {
            down = 'touchstart';
            move = 'touchmove';
            up = 'touchend';
        }

        return {
            down: down,
            move: move,
            up: up
        };
    }

    /**
     * 包装可拖拽 Dom 元素的构造函数
     * 参数为 Dom 对象或元素的 id 值
     * @param {Object, String} selector
     */
    function Drag(selector) {
        this.elem = typeof selector === 'object' ? selector : document.getElementById(selector);
        this.startX = 0;
        this.startY = 0;
        this.sourceX = 0;
        this.sourceY = 0;
        this.init();
    }

    Drag.prototype = {
        constructor: Drag,
        init: function () { // 初始化实例方法
            this.setDrag();
        },
        getStyle: (function () { // 获取样式方法
            if (document.defaultView.getComputedStyle) {
                return function (property) {
                    return document.defaultView.getComputedStyle(this.elem, null)[property];
                };
            } else {
                return function (property) {
                    return this.elem.currentStyle[property];
                };
            }
        })(),
        getPosition: (function () { // 获取被拖拽元素坐标方法
            var pos = {
                x: 0,
                y: 0
            };

            // 如果当前浏览器支持 transform 使用 transform（防止重绘），不支持使用 position
            if (transform) {
                return function () {
                    var transformValue = this.getStyle(transform);

                    if (transformValue == 'none') {
                        this.elem.style[transform] = 'translate(0, 0)';
                    } else {
                        var temp = transformValue.match(/-?\d+/g);
                        pos = {
                            x: parseInt(temp[4].trim()),
                            y: parseInt(temp[5].trim())
                        }
                    }

                    return pos;
                };
            } else {
                return function () {
                    if (this.getStyle('position') == 'static') {
                        this.elem.style.position = 'relative';
                    } else {
                        pos = {
                            x: parseInt(this.getStyle('left') ? this.getStyle('left') : 0),
                            y: parseInt(this.getStyle('top') ? this.getStyle('top') : 0)
                        };
                    }

                    return pos;
                };
            }
        })(),
        setPostion: (function () { // 设置被拖拽元素坐标方法
            if (transform) {
                return function (pos) {
                    this.elem.style[transform] = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
                };
            } else {
                return function (pos) {
                    this.elem.style.left = pos.x + 'px';
                    this.elem.style.top = pos.y + 'px';
                };
            }
        })(),
        setDrag: function () { // 设置拖拽事件及回调
            var _this = this;
            this.elem.addEventListener(eventNames.down, start, false);

            function start(event) {
                var pos = _this.getPosition();

                _this.startX = isMobile ? event.targetTouches[0].pageX : event.pageX;
                _this.startY = isMobile ? event.targetTouches[0].pageY : event.pageY;
                _this.sourceX = pos.x;
                _this.sourceY = pos.y;

                document.addEventListener(eventNames.move, move, false);
                document.addEventListener(eventNames.up, end, false);
            }

            function move(event) {
                var currentX = isMobile ? event.targetTouches[0].pageX : event.pageX;
                var currentY = isMobile ? event.targetTouches[0].pageY : event.pageY;

                var distanceX = currentX - _this.startX;
                var distanceY = currentY - _this.startY;

                _this.setPostion({
                    x: (_this.sourceX + distanceX).toFixed(),
                    y: (_this.sourceY + distanceY).toFixed()
                })
            }

            function end(event) {
                document.removeEventListener(eventNames.move, move);
                document.removeEventListener(eventNames.up, end);
            }
        }
    }

    window.Drag = Drag;
})();