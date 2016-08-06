var SVGSpinner = React.createClass({ displayName: 'SVGSpinner',
    render: function () {
        var background = React.createElement('circle', {
            key: 'background', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.2 * this.props.size, fill: 'none', stroke: '#333333'
        });
        var bar = React.createElement('circle', {
            key: 'bar', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.15 * this.props.size,
            fill: 'none', stroke: '#FF9F1E',
            style: { transformOrigin: this.props.x + 'px ' + this.props.y + 'px' }
        });
        var highlight = React.createElement('circle', {
            key: 'highlight', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.15 * this.props.size,
            fill: 'none', stroke: '#FFFFFF', strokeOpacity: 0.3, className: 'spinner', strokeDasharray: this.props.size * 2 * Math.PI / 4,
            style: { transformOrigin: this.props.x + 'px ' + this.props.y + 'px' }
        });
        return React.createElement('g', null, background, bar, highlight);
    }
});
var SVGProgress = React.createClass({ displayName: 'SVGProgress',
    render: function () {
        var background = React.createElement('circle', {
            key: 'background', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.2 * this.props.size, fill: 'none', stroke: '#333333'
        });
        var bar = React.createElement('circle', {
            key: 'bar', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.15 * this.props.size, strokeDasharray: this.props.size * 2 * Math.PI,
            strokeDashoffset: (this.props.value / this.props.max + 1) * this.props.size * 2 * Math.PI, fill: 'none', stroke: '#FF9F1E', className: 'spinner',
            style: { transformOrigin: this.props.x + 'px ' + this.props.y + 'px' }
        });
        var text = React.createElement('text', {
            key: 'text', className: 'noselect', x: this.props.x - this.props.size * 0.5, y: this.props.y + this.props.size * 0.15, fontSize: this.props.size * 0.5,
            fill: '#FF9F1E'
        }, ('00' + Math.round(this.props.value)).substr(-2) + '%');
        return React.createElement('g', null, text, background, bar);
    }
});
var SVGBezier = React.createClass({ displayName: 'SVGBezier',
    render: function () {
        var items = [];
        var self = this;
        if (this.props.type == 'circle') {
            if (this.props.mode == 2) {
                items.push(React.createElement('circle', {
                    key: 'delete', cx: this.props.x, cy: this.props.y, r: this.props.size * 3, fill: this.props.colour,
                    onClick: self.props.mouseClick, opacity: 0
                }));
            }
            else if (this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing) {
                items.push(React.createElement('circle', {
                    key: 'move', cx: this.props.x, cy: this.props.y, r: this.props.size * 3, fill: this.props.colour,
                    onMouseDown: self.props.mouseDown, opacity: 0, cursor: 'move'
                }));
            }
            items.push(React.createElement('circle', {
                key: 'display', cx: this.props.x, cy: this.props.y, r: this.props.size, fill: this.props.colour, stroke: this.props.colour,
                onMouseMove: self.props.mouseMove
            }));
            return React.createElement('g', null, items);
        }
        else if (this.props.type == 'path') {
            if (this.props.mode == 2) {
                items.push(React.createElement('path', {
                    key: 'delete', d: this.props.param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size * 3, strokeLinecap: 'round',
                    onClick: this.props.mouseClick, opacity: 0, pointerEvents: 'stroke'
                }));
            }
            else if (this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing) {
                items.push(React.createElement('path', {
                    key: 'move', d: this.props.param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size * 3, strokeLinecap: 'round',
                    onMouseDown: this.props.mouseDown, opacity: 0, cursor: 'move', pointerEvents: 'stroke'
                }));
            }
            items.push(React.createElement('path', {
                key: 'display', d: this.props.param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size, strokeLinecap: 'round',
                onMouseMove: this.props.mouseMove
            }));
            return React.createElement('g', null, items);
        }
        else {
            console.error('ERROR: Unrecognized type for SVGBezier.');
            return null;
        }
    }
});
var SVGText = React.createClass({ displayName: 'SVGText',
    render: function () {
        var hightLightBoxes = [];
        var borderBoxes = [];
        var selCount = 0;
        var displayElement;
        var self = this;
        var tspanElems = this.props.textNodes.map(function (textElem) {
            var styleNodeElems = textElem.styles.map(function (node) {
                if (node.text.match(/\s/)) {
                    return React.createElement('tspan', { key: node.key, dx: node.dx }, node.text);
                }
                else {
                    return React.createElement('tspan', { key: node.key, fill: node.colour, dx: node.dx, fontWeight: node.weight, fontStyle: node.style, textDecoration: node.decoration }, node.text);
                }
            });
            return React.createElement('tspan', {
                key: textElem.lineNum, x: textElem.x, y: textElem.y, xmlSpace: 'preserve' }, styleNodeElems);
        });
        if (this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing && !this.props.remEdit) {
            borderBoxes.push(React.createElement('rect', {
                key: 'move', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                onMouseDown: this.props.mouseMoveDown
            }));
            borderBoxes.push(React.createElement('rect', {
                key: 'selBox', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height, fill: 'none', opacity: 0, pointerEvents: 'fill',
                onClick: function (e) { if (e.detail == 2) {
                    self.props.doubleClick();
                } }
            }));
        }
        if (this.props.cursor) {
            hightLightBoxes.push(React.createElement('line', {
                x1: this.props.cursor.x, y1: this.props.cursor.y,
                x2: this.props.cursor.x, y2: this.props.cursor.y + this.props.cursor.height,
                stroke: 'black', strokeWidth: 1, className: 'blinking', key: 'cursor'
            }));
        }
        if (this.props.cursorElems) {
            for (var i = 0; i < this.props.cursorElems.length; i++) {
                var selElem = this.props.cursorElems[i];
                selCount++;
                hightLightBoxes.push(React.createElement('rect', {
                    x: selElem.x, y: selElem.y, width: selElem.width, height: selElem.height,
                    fill: '#0066ff', stroke: 'none', fillOpacity: 0.3, key: selCount
                }));
            }
        }
        if (this.props.isEditing) {
            borderBoxes.push(React.createElement('rect', {
                key: 'locEdit', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
            }));
            if (!this.props.isMoving && !this.props.isResizing) {
                borderBoxes.push(React.createElement('line', {
                    key: 'moveTop', x1: this.props.x, y1: this.props.y, x2: this.props.x + this.props.width - this.props.size * 0.25, y2: this.props.y,
                    fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                    onMouseDown: this.props.mouseMoveDown
                }));
                borderBoxes.push(React.createElement('line', {
                    key: 'moveLeft', x1: this.props.x, y1: this.props.y, x2: this.props.x, y2: this.props.y + this.props.height - this.props.size * 0.25,
                    fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                    onMouseDown: this.props.mouseMoveDown
                }));
                borderBoxes.push(React.createElement('line', {
                    key: 'resizeBottom', x1: this.props.x, y1: this.props.y + this.props.height, x2: this.props.x + this.props.width - this.props.size * 0.25, y2: this.props.y + this.props.height,
                    fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                    onMouseDown: function (e) { self.props.mouseResizeDown(e, true, false); }
                }));
                borderBoxes.push(React.createElement('line', {
                    key: 'resizeRight', x1: this.props.x + this.props.width, y1: this.props.y, x2: this.props.x + this.props.width, y2: this.props.y + this.props.height - this.props.size * 0.25,
                    fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                    onMouseDown: function (e) { self.props.mouseResizeDown(e, false, true); }
                }));
                borderBoxes.push(React.createElement('rect', {
                    key: 'resizeCorner', x: this.props.x + this.props.width - this.props.size * 0.25, y: this.props.y + this.props.height - this.props.size * 0.25,
                    width: this.props.size * 0.5, height: this.props.size * 0.5, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                    onMouseDown: function (e) { self.props.mouseResizeDown(e, true, true); }
                }));
            }
        }
        else if (this.props.getLock) {
            borderBoxes.push(React.createElement('rect', {
                key: 'getEdit', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height, fill: 'none', stroke: 'red', strokeWidth: 2
            }));
        }
        else if (this.props.remEdit) {
            borderBoxes.push(React.createElement('rect', {
                key: 'remEdit', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                fill: 'none', stroke: 'red', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
            }));
        }
        if (this.props.isEditing) {
            displayElement = React.createElement('text', {
                className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size
            }, tspanElems);
        }
        else if (this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing) {
            displayElement = React.createElement('text', {
                className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size
            }, tspanElems);
        }
        else if (this.props.mode == 2) {
            displayElement = React.createElement('text', {
                className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size,
                onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove
            }, tspanElems);
        }
        else {
            displayElement = React.createElement('text', {
                className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size, pointerEvents: 'none'
            }, tspanElems);
        }
        return React.createElement('g', null, hightLightBoxes, displayElement, borderBoxes);
    }
});
var SVGImage = React.createClass({ displayName: 'SVGImage',
    render: function () {
        var loadBar = null;
        var waitSpin = null;
        var borderBoxes = [];
        var displayElement;
        var actWidth = this.props.rotation == 90 || this.props.rotation == 270 ? this.props.height : this.props.width;
        var actHeight = this.props.rotation == 90 || this.props.rotation == 270 ? this.props.width : this.props.height;
        var self = this;
        if (this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing) {
            if (this.props.isLoading) {
                waitSpin = React.createElement(SVGSpinner, {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });
                if (this.props.isUploader) {
                    loadBar = React.createElement(SVGProgress, {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2.0
                    });
                }
            }
            else {
                displayElement = React.createElement('image', {
                    x: this.props.x, y: this.props.y, width: actWidth, height: actHeight, xlinkHref: this.props.URL,
                    pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none',
                    transform: 'rotate(' + this.props.rotation + ' ' + (this.props.x + actWidth / 2.0) + ' ' + (this.props.y + actHeight / 2.0) + ')'
                });
            }
            borderBoxes.push(React.createElement('rect', {
                key: 'moveFull', x: this.props.x, y: this.props.y,
                width: this.props.width, height: this.props.height, opacity: 0, cursor: 'move', pointerEvents: 'all',
                onMouseDown: function (e) { self.props.mouseMoveDown(e); }
            }));
            borderBoxes.push(React.createElement('line', {
                key: 'resizeBottom', x1: this.props.x, y1: this.props.y + this.props.height, x2: this.props.x + this.props.width - 1, y2: this.props.y + this.props.height,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                onMouseDown: function (e) { self.props.mouseResizeDown(e, true, false); }
            }));
            borderBoxes.push(React.createElement('line', {
                key: 'resizeRight', x1: this.props.x + this.props.width, y1: this.props.y, x2: this.props.x + this.props.width, y2: this.props.y + this.props.height - 1,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                onMouseDown: function (e) { self.props.mouseResizeDown(e, false, true); }
            }));
            borderBoxes.push(React.createElement('rect', {
                key: 'resizeCorner', x: this.props.x + this.props.width - 1, y: this.props.y + this.props.height - 1,
                width: 2, height: 2, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                onMouseDown: function (e) { self.props.mouseResizeDown(e, true, true); }
            }));
            borderBoxes.push(React.createElement('rect', {
                key: 'rotateCorner', x: this.props.x - 1, y: this.props.y - 1, width: 2, height: 2, opacity: 0, cursor: 'grab', pointerEvents: 'fill',
                onClick: function (e) { self.props.rotateClick(); }
            }));
        }
        else if (this.props.mode == 2) {
            if (this.props.isLoading) {
                waitSpin = React.createElement(SVGSpinner, {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });
                if (this.props.isUploader) {
                    loadBar = React.createElement(SVGProgress, {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else {
                displayElement = React.createElement('image', {
                    x: this.props.x, y: this.props.y, width: actWidth, height: actHeight, xlinkHref: this.props.URL, preserveAspectRatio: 'none',
                    transform: 'rotate(' + this.props.rotation + ' ' + (this.props.x + actWidth / 2.0) + ' ' + (this.props.y + actHeight / 2.0) + ')',
                    onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove, onMouseDown: function (e) { e.preventDefault(); }
                });
            }
        }
        else {
            if (this.props.isLoading) {
                waitSpin = React.createElement(SVGSpinner, {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });
                if (this.props.isUploader) {
                    loadBar = React.createElement(SVGProgress, {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else {
                displayElement = React.createElement('image', {
                    x: this.props.x, y: this.props.y, width: actWidth, height: actHeight, xlinkHref: this.props.URL, preserveAspectRatio: 'none',
                    transform: 'rotate(' + this.props.rotation + ' ' + (this.props.x + actWidth / 2.0) + ' ' + (this.props.y + actHeight / 2.0) + ')',
                    onMouseDown: function (e) { e.preventDefault(); }
                });
            }
        }
        return React.createElement('g', {}, displayElement, borderBoxes, waitSpin, loadBar);
    } });
var SVGFile = React.createClass({ displayName: 'SVGFile',
    render: function () {
        var loadBar = null;
        var waitSpin = null;
        var borderBoxes = [];
        var displayElement;
        var self = this;
        var viewBox = '0 0 ' + this.props.width + ' ' + this.props.height;
        if (this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing) {
            if (this.props.isLoading) {
                waitSpin = React.createElement(SVGSpinner, {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });
                if (this.props.isUploader) {
                    loadBar = React.createElement(SVGProgress, {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else {
                displayElement = React.createElement('image', {
                    x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                    xlinkHref: 'https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/file_image.svg',
                    pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none'
                });
            }
            borderBoxes.push(React.createElement('rect', {
                key: 'moveFull', x: this.props.x, y: this.props.y,
                width: this.props.width, height: this.props.height, opacity: 0, cursor: 'move', pointerEvents: 'all',
                onMouseDown: function (e) { self.props.mouseMoveDown(e); }
            }));
            borderBoxes.push(React.createElement('line', {
                key: 'resizeBottom', x1: this.props.x, y1: this.props.y + this.props.height, x2: this.props.x + this.props.width - 1, y2: this.props.y + this.props.height,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                onMouseDown: function (e) { self.props.mouseResizeDown(e, true, false); }
            }));
            borderBoxes.push(React.createElement('line', {
                key: 'resizeRight', x1: this.props.x + this.props.width, y1: this.props.y, x2: this.props.x + this.props.width, y2: this.props.y + this.props.height - 1,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                onMouseDown: function (e) { self.props.mouseResizeDown(e, false, true); }
            }));
            borderBoxes.push(React.createElement('rect', {
                key: 'resizeCorner', x: this.props.x + this.props.width - 1, y: this.props.y + this.props.height - 1,
                width: 2, height: 2, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                onMouseDown: function (e) { self.props.mouseResizeDown(e, true, true); }
            }));
        }
        else if (this.props.mode == 2) {
            if (this.props.isLoading) {
                waitSpin = React.createElement(SVGSpinner, {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });
                if (this.props.isUploader) {
                    loadBar = React.createElement(SVGProgress, {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else {
                displayElement = React.createElement('image', {
                    x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                    xlinkHref: 'https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/file_image.svg', preserveAspectRatio: 'none',
                    onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove, onMouseDown: function (e) { e.preventDefault(); }
                });
            }
        }
        else {
            if (this.props.isLoading) {
                waitSpin = React.createElement(SVGSpinner, {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });
                if (this.props.isUploader) {
                    loadBar = React.createElement(SVGProgress, {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else {
                displayElement = React.createElement('image', {
                    x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                    xlinkHref: 'https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/file_image.svg', preserveAspectRatio: 'none',
                    onMouseDown: function (e) { e.preventDefault(); }
                });
            }
        }
        var text = React.createElement('text', {
            key: 'text', className: 'noselect', x: this.props.x, y: this.props.y + this.props.height * 0.6, fontSize: this.props.width * 0.4,
            fill: '#000000'
        }, '.' + this.props.extension);
        return React.createElement('g', {}, displayElement, borderBoxes, waitSpin, loadBar, text);
    } });
var SVGHighlight = React.createClass({ displayName: 'SVGHighlight',
    render: function () {
        return React.createElement('rect', {
            key: 'hightlight', x: this.props.x, y: this.props.y, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6),
            width: this.props.width, height: this.props.height, opacity: 0.4
        });
    } });
var SVGHighlightTag = React.createClass({ displayName: 'SVGHighlightTag',
    render: function () {
        if (this.props.viewX + this.props.viewWidth < this.props.x + 0.5 * this.props.width) {
            if (this.props.viewY + this.props.viewHeight < this.props.y + 0.5 * this.props.height) {
                var points = [
                    { x: this.props.viewX + this.props.viewWidth, y: this.props.viewY + this.props.viewHeight },
                    { x: this.props.viewX + this.props.viewWidth, y: this.props.viewY + this.props.viewHeight - 14.14 * this.props.viewScale },
                    { x: this.props.viewX + this.props.viewWidth - 49.50 * this.props.viewScale, y: this.props.viewY + this.props.viewHeight - 63.64 * this.props.viewScale },
                    { x: this.props.viewX + this.props.viewWidth - 63.64 * this.props.viewScale, y: this.props.viewY + this.props.viewHeight - 49.50 * this.props.viewScale },
                    { x: this.props.viewX + this.props.viewWidth - 14.14 * this.props.viewScale, y: this.props.viewY + this.props.viewHeight }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
            else if (this.props.viewY < this.props.y + 0.5 * this.props.height) {
                var yPosMid = this.props.y + 0.5 * this.props.height;
                var xPosMid = this.props.viewX + this.props.viewWidth - 40 * this.props.viewScale;
                console.log('Drawing right side, viewWidth is: ' + this.props.viewWidth);
                var points = [
                    { x: xPosMid + 40 * this.props.viewScale, y: yPosMid },
                    { x: xPosMid + 30 * this.props.viewScale, y: yPosMid - 10 * this.props.viewScale },
                    { x: xPosMid - 40 * this.props.viewScale, y: yPosMid - 10 * this.props.viewScale },
                    { x: xPosMid - 40 * this.props.viewScale, y: yPosMid + 10 * this.props.viewScale },
                    { x: xPosMid + 30 * this.props.viewScale, y: yPosMid + 10 * this.props.viewScale }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
            else {
                var points = [
                    { x: this.props.viewX + this.props.viewWidth, y: this.props.viewY },
                    { x: this.props.viewX + this.props.viewWidth - 14.14 * this.props.viewScale, y: this.props.viewY },
                    { x: this.props.viewX + this.props.viewWidth - 63.64 * this.props.viewScale, y: this.props.viewY + 49.50 * this.props.viewScale },
                    { x: this.props.viewX + this.props.viewWidth - 49.50 * this.props.viewScale, y: this.props.viewY + 63.64 * this.props.viewScale },
                    { x: this.props.viewX + this.props.viewWidth, y: this.props.viewY + 14.14 * this.props.viewScale }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
        }
        else if (this.props.viewX < this.props.x + 0.5 * this.props.width) {
            var xPosMid = this.props.x - 0.5 * this.props.width;
            if (this.props.viewY + this.props.viewHeight < this.props.y + 0.5 * this.props.height) {
                var yPosMid = this.props.viewY + this.props.viewHeight - 40 * this.props.viewScale;
                var points = [
                    { x: xPosMid, y: yPosMid + 40 * this.props.viewScale },
                    { x: xPosMid - 10 * this.props.viewScale, y: yPosMid + 30 * this.props.viewScale },
                    { x: xPosMid - 10 * this.props.viewScale, y: yPosMid - 40 * this.props.viewScale },
                    { x: xPosMid + 10 * this.props.viewScale, y: yPosMid - 40 * this.props.viewScale },
                    { x: xPosMid + 10 * this.props.viewScale, y: yPosMid + 30 * this.props.viewScale }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
            else if (this.props.viewY < this.props.y + 0.5 * this.props.height) {
                return null;
            }
            else {
                var yPosMid = this.props.viewY + 40 * this.props.viewScale;
                var points = [
                    { x: xPosMid, y: yPosMid - 40 * this.props.viewScale },
                    { x: xPosMid - 10 * this.props.viewScale, y: yPosMid - 30 * this.props.viewScale },
                    { x: xPosMid - 10 * this.props.viewScale, y: yPosMid + 40 * this.props.viewScale },
                    { x: xPosMid + 10 * this.props.viewScale, y: yPosMid + 40 * this.props.viewScale },
                    { x: xPosMid + 10 * this.props.viewScale, y: yPosMid - 30 * this.props.viewScale }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
        }
        else {
            if (this.props.viewY + this.props.viewHeight < this.props.y + 0.5 * this.props.height) {
                var points = [
                    { x: this.props.viewX, y: this.props.viewY + this.props.viewHeight },
                    { x: this.props.viewX, y: this.props.viewY + this.props.viewHeight - 14.14 * this.props.viewScale },
                    { x: this.props.viewX + 49.50 * this.props.viewScale, y: this.props.viewY + this.props.viewHeight - 63.64 * this.props.viewScale },
                    { x: this.props.viewX + 63.64 * this.props.viewScale, y: this.props.viewY + this.props.viewHeight - 49.50 * this.props.viewScale },
                    { x: this.props.viewX + 14.14 * this.props.viewScale, y: this.props.viewY + this.props.viewHeight }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
            else if (this.props.viewY < this.props.y + 0.5 * this.props.height) {
                var yPosMid = this.props.y + 0.5 * this.props.height;
                var xPosMid = this.props.viewX + 40 * this.props.viewScale;
                var points = [
                    { x: xPosMid - 40 * this.props.viewScale, y: yPosMid },
                    { x: xPosMid - 30 * this.props.viewScale, y: yPosMid - 10 * this.props.viewScale },
                    { x: xPosMid + 40 * this.props.viewScale, y: yPosMid - 10 * this.props.viewScale },
                    { x: xPosMid + 40 * this.props.viewScale, y: yPosMid + 10 * this.props.viewScale },
                    { x: xPosMid - 30 * this.props.viewScale, y: yPosMid + 10 * this.props.viewScale }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
            else {
                var points = [
                    { x: this.props.viewX, y: this.props.viewY },
                    { x: this.props.viewX + 14.14 * this.props.viewScale, y: this.props.viewY },
                    { x: this.props.viewX + 63.64 * this.props.viewScale, y: this.props.viewY + 49.50 * this.props.viewScale },
                    { x: this.props.viewX + 49.50 * this.props.viewScale, y: this.props.viewY + 63.64 * this.props.viewScale },
                    { x: this.props.viewX, y: this.props.viewY + 14.14 * this.props.viewScale }
                ];
                var pointStr = points[0].x + ',' + points[0].y + ' ' + points[1].x + ',' + points[1].y + ' ' + points[2].x + ',' + points[2].y + ' '
                    + points[3].x + ',' + points[3].y + ' ' + points[4].x + ',' + points[4].y;
                return React.createElement('polygon', {
                    key: 'hightlightTag', points: pointStr, fill: '#' + ('00000' + this.props.colour.toString(16)).substr(-6), onClick: this.props.mouseClick, pointerEvents: 'all',
                });
            }
        }
    } });
var SVGComponent = React.createClass({ displayName: 'SVGComponent',
    render: function () {
        var displayElements = [];
        var highlights = [];
        var state = this.props.state;
        var dispatcher = state.dispatcher;
        var cursorType = 'auto';
        if (state.itemMoving) {
            cursorType = 'move';
        }
        else if (state.itemResizing) {
            if (state.resizeHorz) {
                if (state.resizeVert) {
                    cursorType = 'nwse-resize';
                }
                else {
                    cursorType = 'ew-resize';
                }
            }
            else {
                cursorType = 'ns-resize';
            }
        }
        state.boardElements.forEach(function (element) {
            if (element.type == 'text') {
                var tElement = element;
                displayElements.push(React.createElement(SVGText, {
                    key: tElement.id, size: tElement.size, x: tElement.x, y: tElement.y, width: tElement.width, height: tElement.height, mode: state.mode,
                    isMoving: state.itemMoving, isResizing: state.itemResizing, isEditing: tElement.isEditing, cursor: tElement.cursor, isWaiting: tElement.waiting,
                    cursorElems: tElement.cursorElems, textNodes: tElement.textNodes, remEdit: tElement.remLock, getLock: tElement.getLock,
                    mouseClick: (function (id) { return function () { dispatcher.textMouseClick(id); }; })(element.id),
                    doubleClick: (function (id) { return function () { dispatcher.textMouseDblClick(id); }; })(element.id),
                    mouseMove: (function (id) { return function () { dispatcher.textMouseMove(id); }; })(element.id),
                    mouseMoveDown: (function (id) { return function (e) { dispatcher.textMouseMoveDown(id, e); }; })(element.id),
                    mouseResizeDown: (function (id) { return function (e, vert, horz) { dispatcher.textMouseResizeDown(id, vert, horz, e); }; })(element.id)
                }));
            }
            else if (element.type == 'circle') {
                var cElement = element;
                displayElements.push(React.createElement(SVGBezier, {
                    key: cElement.id, x: cElement.point.x, y: cElement.point.y, colour: cElement.colour, size: cElement.size, mode: state.mode, type: 'circle',
                    isMoving: state.itemMoving, isResizing: state.itemResizing,
                    mouseMove: (function (id) { return function () { dispatcher.curveMouseMove(id); }; })(element.id),
                    mouseClick: (function (id) { return function () { dispatcher.curveMouseClick(id); }; })(element.id),
                    mouseDown: (function (id) { return function (e) { dispatcher.curveMouseDown(id, e); }; })(element.id)
                }));
            }
            else if (element.type == 'path') {
                var cElement = element;
                displayElements.push(React.createElement(SVGBezier, {
                    key: cElement.id, param: cElement.param, colour: cElement.colour, size: cElement.size, mode: state.mode, type: 'path',
                    isMoving: state.itemMoving, isResizing: state.itemResizing,
                    mouseMove: (function (id) { return function () { dispatcher.curveMouseMove(id); }; })(element.id),
                    mouseClick: (function (id) { return function () { dispatcher.curveMouseClick(id); }; })(element.id),
                    mouseDown: (function (id) { return function (e) { dispatcher.curveMouseDown(id, e); }; })(element.id)
                }));
            }
            else if (element.type == 'highlight') {
                var hElement = element;
                if (hElement.x >= state.viewX + state.viewWidth || hElement.x + hElement.width <= state.viewX) {
                    highlights.push(React.createElement(SVGHighlightTag, {
                        key: 'tag' + hElement.id, x: hElement.x, y: hElement.y, width: hElement.width, height: hElement.height, colour: hElement.colour,
                        viewX: state.viewX, viewY: state.viewY, viewWidth: state.viewWidth, viewHeight: state.viewHeight, viewScale: state.viewScale,
                        mouseClick: (function (id) { return function () { console.log('Registered in view.'); dispatcher.highlightTagClick(id); }; })(element.id),
                    }));
                }
                else if (hElement.y >= state.viewY + state.viewHeight || hElement.y + hElement.height <= state.viewY) {
                    highlights.push(React.createElement(SVGHighlightTag, {
                        key: 'tag' + hElement.id, x: hElement.x, y: hElement.y, width: hElement.width, height: hElement.height, colour: hElement.colour,
                        viewX: state.viewX, viewY: state.viewY, viewWidth: state.viewWidth, viewHeight: state.viewHeight, viewScale: state.viewScale,
                        mouseClick: (function (id) { return function () { console.log('Registered in view.'); dispatcher.highlightTagClick(id); }; })(element.id),
                    }));
                }
                highlights.push(React.createElement(SVGHighlight, {
                    key: hElement.id, x: hElement.x, y: hElement.y, width: hElement.width, height: hElement.height,
                    colour: hElement.colour
                }));
            }
            else if (element.type == 'file') {
                var fElement = element;
                if (fElement.isImage) {
                    displayElements.push(React.createElement(SVGImage, {
                        key: fElement.id, x: fElement.x, y: fElement.y, width: fElement.width, height: fElement.height, percentUp: fElement.percentUp,
                        mode: state.mode, isMoving: state.itemMoving, isResizing: state.itemResizing, URL: fElement.URL, isLoading: fElement.isLoading,
                        isUploader: fElement.isUploader, rotation: fElement.rotation,
                        mouseClick: (function (id) { return function () { dispatcher.fileMouseClick(id); }; })(element.id),
                        mouseMove: (function (id) { return function () { dispatcher.fileMouseMove(id); }; })(element.id),
                        rotateClick: (function (id) { return function () { dispatcher.fileRotateClick(id); }; })(element.id),
                        mouseMoveDown: (function (id) { return function (e) { dispatcher.fileMouseMoveDown(id, e); }; })(element.id),
                        mouseResizeDown: (function (id) { return function (e, vert, horz) { dispatcher.fileMouseResizeDown(id, vert, horz, e); }; })(element.id)
                    }));
                }
                else {
                    displayElements.push(React.createElement(SVGFile, {
                        key: fElement.id, x: fElement.x, y: fElement.y, width: fElement.width, height: fElement.height, percentUp: fElement.percentUp,
                        mode: state.mode, isMoving: state.itemMoving, isResizing: state.itemResizing, URL: fElement.URL, isLoading: fElement.isLoading,
                        isUploader: fElement.isUploader, extension: fElement.extension,
                        mouseClick: (function (id) { return function () { dispatcher.fileMouseClick(id); }; })(element.id),
                        mouseMove: (function (id) { return function () { dispatcher.fileMouseMove(id); }; })(element.id),
                        mouseMoveDown: (function (id) { return function (e) { dispatcher.fileMouseMoveDown(id, e); }; })(element.id),
                        mouseResizeDown: (function (id) { return function (e, vert, horz) { dispatcher.fileMouseResizeDown(id, vert, horz, e); }; })(element.id)
                    }));
                }
            }
        });
        return React.createElement('svg', { className: 'svgcomponent', id: 'whiteBoard-output', viewBox: state.viewBox, cursor: cursorType }, displayElements, highlights);
    }
});
var ControlComponent = React.createClass({ displayName: 'ControlComponent',
    render: function () {
        var state = this.props.state;
        var dispatcher = state.dispatcher;
        var blackButt = React.createElement('button', { className: 'button colour-button', id: 'black-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.colourChange('black'); } });
        var blueButt = React.createElement('button', { className: 'button colour-button', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.colourChange('blue'); } });
        var redButt = React.createElement('button', { className: 'button colour-button', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.colourChange('red'); } });
        var greenButt = React.createElement('button', { className: 'button colour-button', id: 'green-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.colourChange('green'); } });
        var drawButt = React.createElement('button', { className: 'button mode-button', id: 'draw-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.modeChange(0); } }, 'D');
        var textButt = React.createElement('button', { className: 'button mode-button', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.modeChange(1); } }, 'T');
        var eraseButt = React.createElement('button', { className: 'button mode-button', id: 'erase-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.modeChange(2); } }, 'E');
        var selectButt = React.createElement('button', { className: 'button mode-button', id: 'select-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.modeChange(3); } }, 'S');
        var highlightButt = React.createElement('button', { className: 'button mode-button', id: 'highlight-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.modeChange(4); } }, 'H');
        var smallButt = React.createElement('button', { className: 'button mode-button', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.sizeChange(0); } }, 'S');
        var medButt = React.createElement('button', { className: 'button mode-button', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.sizeChange(1); } }, 'M');
        var largeButt = React.createElement('button', { className: 'button mode-button', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.sizeChange(2); } }, 'L');
        var boldButt;
        var italButt;
        var ulineButt;
        var tlineButt;
        var olineButt;
        var justButt;
        if (state.colour == 'black') {
            blackButt = React.createElement('button', { className: 'button colour-button pressed-colour', id: 'black-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } });
        }
        else if (state.colour == 'blue') {
            blueButt = React.createElement('button', { className: 'button colour-button pressed-colour', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } });
        }
        else if (state.colour == 'red') {
            redButt = React.createElement('button', { className: 'button colour-button pressed-colour', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } });
        }
        else if (state.colour == 'green') {
            greenButt = React.createElement('button', { className: 'button colour-button pressed-colour', id: 'green-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } });
        }
        if (state.mode == 0) {
            drawButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'draw-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'D');
        }
        else if (state.mode == 1) {
            textButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'T');
        }
        else if (state.mode == 2) {
            eraseButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'erase-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'E');
        }
        else if (state.mode == 3) {
            selectButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'select-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'S');
        }
        else if (state.mode == 4) {
            highlightButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'highlight-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'H');
        }
        if (state.sizeMode == 0) {
            smallButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'S');
        }
        else if (state.sizeMode == 1) {
            medButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'M');
        }
        else if (state.sizeMode == 2) {
            largeButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'L');
        }
        if (state.isBold) {
            boldButt = React.createElement('button', {
                className: 'button style-button pressed-style', id: 'bold-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.boldChange(false); }
            }, 'B');
        }
        else {
            boldButt = React.createElement('button', {
                className: 'button style-button', id: 'bold-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.boldChange(true); }
            }, 'B');
        }
        if (state.isItalic) {
            italButt = React.createElement('button', {
                className: 'button style-button pressed-style', id: 'italic-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.italicChange(false); }
            }, 'I');
        }
        else {
            italButt = React.createElement('button', {
                className: 'button style-button', id: 'italic-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.italicChange(true); }
            }, 'I');
        }
        if (state.isULine) {
            ulineButt = React.createElement('button', {
                className: 'button style-button pressed-style', id: 'uline-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.underlineChange(false); }
            }, 'U');
        }
        else {
            ulineButt = React.createElement('button', {
                className: 'button style-button', id: 'uline-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.underlineChange(true); }
            }, 'U');
        }
        if (state.isTLine) {
            tlineButt = React.createElement('button', {
                className: 'button style-button pressed-style', id: 'tline-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.throughlineChange(false); }
            }, 'T');
        }
        else {
            tlineButt = React.createElement('button', {
                className: 'button style-button', id: 'tline-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.throughlineChange(true); }
            }, 'T');
        }
        if (state.isOLine) {
            olineButt = React.createElement('button', {
                className: 'button style-button pressed-style', id: 'oline-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.overlineChange(false); }
            }, 'O');
        }
        else {
            olineButt = React.createElement('button', {
                className: 'button style-button', id: 'oline-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.overlineChange(true); }
            }, 'O');
        }
        if (state.isJustified) {
            justButt = React.createElement('button', {
                className: 'button style-button pressed-style', id: 'justify-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.justifiedChange(false); }
            }, 'J');
        }
        else {
            justButt = React.createElement('button', {
                className: 'button style-button', id: 'justify-button',
                onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.justifiedChange(true); }
            }, 'J');
        }
        var colourCont = React.createElement('div', { className: 'whiteboard-controlgroup', id: 'whiteboard-colourgroup' }, blackButt, blueButt, redButt, greenButt);
        var modeCont = React.createElement('div', { className: 'whiteboard-controlgroup', id: 'whiteboard-modegroup' }, drawButt, textButt, eraseButt, selectButt, highlightButt);
        var sizeCont = React.createElement('div', { className: 'whiteboard-controlgroup', id: 'whiteboard-sizegroup' }, smallButt, medButt, largeButt);
        var styleCont = React.createElement('div', { className: 'whiteboard-controlgroup', id: 'whiteboard-stylegroup' }, boldButt, italButt, ulineButt, tlineButt, olineButt, justButt);
        return React.createElement('div', { className: 'large-1 small-2 columns', id: 'whiteboard-controler' }, colourCont, modeCont, sizeCont, styleCont);
    } });
var WhiteBoardView = React.createClass({ displayName: 'Whiteboard',
    getInitialState: function () {
        return {
            viewBox: '0 0 0 0',
            mode: 0,
            sizeMode: 1,
            baseSize: 1,
            viewX: 0,
            viewY: 0,
            viewWidth: 0,
            viewHeight: 0,
            viewScale: 1,
            colour: 'black',
            isBold: false,
            isItalic: false,
            isULine: false,
            isOLine: false,
            isTLine: false,
            isJustified: true,
            itemMoving: false,
            itemResizing: false,
            resizeVert: false,
            resizeHorz: false,
            boardElements: Immutable.OrderedMap(),
            infoElements: Immutable.List(),
            alertElements: Immutable.List(),
            dispatcher: {
                curveMouseDown: function (id, e) { },
                curveMouseClick: function (id) { },
                curveMouseMove: function (id) { },
                textMouseClick: function (id) { },
                textMouseDblClick: function (id) { },
                textMouseMove: function (id) { },
                textMouseMoveDown: function (id, e) { },
                textMouseResizeDown: function (id, vert, horz, e) { },
                fileMouseClick: function (id) { },
                fileMouseMove: function (id) { },
                fileMouseMoveDown: function (id, e) { },
                fileMouseResizeDown: function (id, vert, horz, e) { },
                clearAlert: function (id) { },
                colourChange: function (newColour) { },
                modeChange: function (newMode) { },
                boldChange: function (newState) { },
                italicChange: function (newState) { },
                underlineChange: function (newState) { },
                overlineChange: function (newState) { },
                throughlineChange: function (newState) { },
                justifiedChange: function (newState) { },
                onCopy: function (e) { },
                onCut: function (e) { },
                onPaste: function (e) { },
                contextCopy: function (e) { },
                contextCut: function (e) { },
                contextPaste: function (e) { },
                mouseDown: function (e) { },
                mouseWheel: function (e) { },
                mouseMove: function (e) { },
                mouseUp: function (e) { } }
        };
    },
    storeUpdate: function (newState) {
        this.setState(newState);
    },
    render: function () {
        var state = this.state;
        var dispatcher = state.dispatcher;
        var inElem = React.createElement('canvas', { className: 'inputSpace', id: 'whiteBoard-input' });
        document.body.addEventListener('mouseup', this.mouseUp, false);
        var outElem = React.createElement(SVGComponent, {
            className: "renderSpace", id: "whiteBoard-output", state: state
        });
        var whitElem = React.createElement('div', {
            className: "large-11 small-10 columns", id: "whiteboard-container", onMouseDown: dispatcher.mouseDown, onDrop: dispatcher.drop,
            onDragOver: dispatcher.dragOver, onMouseMove: dispatcher.mouseMove, onMouseUp: dispatcher.mouseUp, onMouseLeave: dispatcher.mouseUp,
            onWheel: dispatcher.mouseWheel, onCopy: dispatcher.onCopy, onPaste: dispatcher.onPaste, onCut: dispatcher.onCut, contextMenu: 'whiteboard-context'
        }, outElem, inElem);
        var contElem = React.createElement(ControlComponent, {
            className: "controlPanel", id: "whiteboard-controller", state: state
        });
        var contextMenu = React.createElement('menu', { type: 'context', id: 'whiteboard-context' }, React.createElement('menuitem', { label: 'Copy', onClick: dispatcher.contextCopy }), React.createElement('menuitem', { label: 'Cut', onClick: dispatcher.contextCut }), React.createElement('menuitem', { label: 'Paste', onClick: dispatcher.contextPaste }));
        var infoElems = [];
        for (var i = 0; i < state.infoElements.size; i++) {
            var info = state.infoElements.get(i);
            var elemStyle = 'position: absolute; z-index: 10; x: ' + info.x + '; y: ' + info.y + '; width: ' + info.width + '; height: ' + info.height + ';';
            var infoElem = React.createElement('div', { className: 'callout secondary', style: elemStyle }, React.createElement('h5', null, info.header), React.createElement('p', null, info.message));
            infoElems.push(infoElem);
        }
        if (state.alertElements.size > 0) {
            var alertMsg = state.alertElements.first();
            var alertElem = React.createElement('div', { className: 'alert callout alert-message', onClick: dispatcher.clearAlert }, React.createElement('h5', null, alertMsg.type), React.createElement('p', null, alertMsg.message));
            return (React.createElement("div", { className: "expanded row", id: "whiteboard-row" }, whitElem, contElem, alertElem, infoElems, contextMenu));
        }
        else {
            return (React.createElement("div", { className: "expanded row", id: "whiteboard-row" }, whitElem, contElem, infoElems, contextMenu));
        }
    } });
