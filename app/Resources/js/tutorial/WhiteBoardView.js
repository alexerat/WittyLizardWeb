var EraseSize = {
    SMALL: 1,
    MEDIUM: 5,
    LARGE: 10
};
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
var SVGComponent = React.createClass({ displayName: 'SVGComponent',
    render: function () {
        var displayElements = [];
        var highlights = [];
        var state = this.props.state;
        var dispatcher = state.dispatcher;
        var cursorType;
        if (state.cursorURL.length > 0) {
            cursorType = 'url(' + state.cursorURL[0] + ') ' + state.cursorOffset.x + ' ' + state.cursorOffset.y;
            for (var i = 1; i < state.cursorURL.length; i++) {
                cursorType += ',url(' + state.cursorURL[i] + ') ' + state.cursorOffset.x + ' ' + state.cursorOffset.y;
            }
            cursorType += ',auto';
        }
        else {
            cursorType = state.cursor;
        }
        state.boardElements.forEach(function (element) {
            var dispater = {
                mouseOver: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseOver(id, e, component, subComp); };
                })(element.id),
                mouseOut: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseOut(id, e, component, subComp); };
                })(element.id),
                mouseDown: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseDown(id, e, component, subComp); };
                })(element.id),
                mouseMove: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseMove(id, e, component, subComp); };
                })(element.id),
                mouseUp: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseUp(id, e, component, subComp); };
                })(element.id),
                mouseClick: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseClick(id, e, component, subComp); };
                })(element.id),
                doubleClick: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementMouseDoubleClick(id, e, component, subComp); };
                })(element.id),
                touchStart: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementTouchStart(id, e, component, subComp); };
                })(element.id),
                touchMove: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementTouchMove(id, e, component, subComp); };
                })(element.id),
                touchEnd: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementTouchEnd(id, e, component, subComp); };
                })(element.id),
                touchCancel: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementTouchCancel(id, e, component, subComp); };
                })(element.id),
                dragOver: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementDragOver(id, e, component, subComp); };
                })(element.id),
                drop: (function (id) {
                    return function (e, component, subComp) { dispatcher.elementDrop(id, e, component, subComp); };
                })(element.id),
            };
            displayElements.push(React.createElement(state.components.get(element.mode).ElementView, {
                key: element.id, mode: state.mode, state: element, dispatcher: dispater, viewScale: state.viewScale, eraseSize: state.eraseSize
            }));
        });
        return React.createElement('svg', {
            key: 'whiteBoard-output', className: 'svgcomponent', id: 'whiteBoard-output', viewBox: state.viewBox, cursor: cursorType
        }, displayElements);
    }
});
var ControlComponent = React.createClass({ displayName: 'ControlComponent',
    render: function () {
        var state = this.props.state;
        var dispatcher = this.props.dispatcher;
        var modeButtons = [];
        var pallete = null;
        var eraseButt = React.createElement('button', {
            className: 'button mode-button', id: 'erase-button', onKeyUp: function (e) { e.preventDefault(); },
            onClick: function () { return dispatcher.modeChange(BoardModes.ERASE); }
        }, 'E');
        var selectButt = React.createElement('button', {
            className: 'button mode-button', id: 'select-button', onKeyUp: function (e) { e.preventDefault(); },
            onClick: function () { return dispatcher.modeChange(BoardModes.SELECT); }
        }, 'S');
        if (state.mode == BoardModes.ERASE) {
            eraseButt = React.createElement('button', {
                className: 'button mode-button pressed-mode', id: 'erase-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
            }, 'E');
            var smallButt = React.createElement('button', {
                className: 'button mode-button', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher.changeEraseSize(EraseSize.SMALL); }
            }, 'S');
            var medButt = React.createElement('button', {
                className: 'button mode-button', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher.changeEraseSize(EraseSize.MEDIUM); }
            }, 'M');
            var largeButt = React.createElement('button', {
                className: 'button mode-button', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher.changeEraseSize(EraseSize.LARGE); }
            }, 'L');
            if (state.eraseSize == EraseSize.SMALL) {
                smallButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'S');
            }
            else if (state.eraseSize == EraseSize.MEDIUM) {
                medButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'M');
            }
            else if (state.eraseSize == EraseSize.LARGE) {
                largeButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'L');
            }
            var sizeCont = React.createElement('div', {
                className: 'whiteboard-controlgroup', id: 'whiteboard-sizegroup'
            }, smallButt, medButt, largeButt);
            pallete = React.createElement('div', null, sizeCont);
        }
        else if (state.mode == BoardModes.SELECT) {
            selectButt = React.createElement('button', {
                className: 'button mode-button pressed-mode', id: 'select-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
            }, 'S');
        }
        else if (state.mode != '') {
            pallete = React.createElement(state.components.get(state.mode).PalleteView, { state: state.palleteState, dispatcher: dispatcher.palleteChange });
        }
        modeButtons.push(selectButt);
        modeButtons.push(eraseButt);
        state.components.forEach(function (component) {
            modeButtons.push(React.createElement(component.ModeView, { key: component.componentName, mode: state.mode, dispatcher: dispatcher.modeChange }));
        });
        var modeCont = React.createElement('div', { className: 'whiteboard-controlgroup', id: 'whiteboard-modegroup' }, modeButtons);
        return React.createElement('div', { className: 'large-1 small-2 columns', id: 'whiteboard-controler' }, modeCont, pallete);
    } });
var WhiteBoardView = React.createClass({ displayName: 'Whiteboard',
    getInitialState: function () {
        return {
            viewBox: '0 0 0 0',
            components: Immutable.Map(),
            mode: '',
            palleteState: {},
            cursor: 'auto',
            cursorURL: [],
            cursorOffset: { x: 0, y: 0 },
            baseSize: 1,
            eraseSize: 1.0,
            viewX: 0,
            viewY: 0,
            viewWidth: 0,
            viewHeight: 0,
            viewScale: 1,
            boardElements: Immutable.OrderedMap(),
            infoElements: Immutable.List(),
            alertElements: Immutable.List(),
            dispatcher: {
                palleteChange: function (change) { },
                changeEraseSize: function (newSize) { },
                elementMouseOver: function (id, e) { },
                elementMouseOut: function (id, e) { },
                elementMouseDown: function (id, e) { },
                elementMouseMove: function (id, e) { },
                elementMouseUp: function (id, e) { },
                elementMouseClick: function (id, e) { },
                elementMouseDoubleClick: function (id, e) { },
                elementTouchStart: function (id, e) { },
                elementTouchMove: function (id, e) { },
                elementTouchEnd: function (id, e) { },
                elementTouchCancel: function (id, e) { },
                elementDragOver: function (id, e) { },
                elementDrop: function (id, e) { },
                clearAlert: function (id) { },
                modeChange: function (newMode) { },
                onCopy: function (e) { },
                onCut: function (e) { },
                onPaste: function (e) { },
                contextCopy: function (e) { },
                contextCut: function (e) { },
                contextPaste: function (e) { },
                mouseDown: function (e) { },
                mouseWheel: function (e) { },
                mouseMove: function (e) { },
                mouseUp: function (e) { },
                mouseClick: function (e) { },
                touchStart: function (e) { },
                touchMove: function (e) { },
                touchEnd: function (e) { },
                touchCancel: function (e) { },
                dragOver: function (e) { },
                drop: function (e) { }
            }
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
            className: "renderSpace", id: "whiteBoard-output", key: 'output', state: state
        });
        var whitElem = React.createElement('div', {
            className: "large-11 small-10 columns", id: "whiteboard-container", key: 'whiteboard', onMouseDown: dispatcher.mouseDown, onDrop: dispatcher.drop,
            onDragOver: dispatcher.dragOver, onMouseMove: dispatcher.mouseMove, onMouseUp: dispatcher.mouseUp, onClick: dispatcher.mouseClick,
            onMouseLeave: dispatcher.mouseUp, onWheel: dispatcher.mouseWheel, onCopy: dispatcher.onCopy, onPaste: dispatcher.onPaste, onCut: dispatcher.onCut,
            contextMenu: 'whiteboard-context'
        }, outElem, inElem);
        var contElem = React.createElement(ControlComponent, {
            className: "controlPanel", id: "whiteboard-controller", key: 'controlPanel',
            state: { mode: state.mode, components: state.components, palleteState: state.palleteState, eraseSize: state.eraseSize },
            dispatcher: { modeChange: dispatcher.modeChange, palleteChange: dispatcher.palleteChange, changeEraseSize: dispatcher.changeEraseSize }
        });
        var contextMenu = React.createElement('menu', { type: 'context', id: 'whiteboard-context', key: 'context' }, React.createElement('menuitem', { label: 'Copy', onClick: dispatcher.contextCopy }), React.createElement('menuitem', { label: 'Cut', onClick: dispatcher.contextCut }), React.createElement('menuitem', { label: 'Paste', onClick: dispatcher.contextPaste }));
        var infoElems = [];
        for (var i = 0; i < state.infoElements.size; i++) {
            var info = state.infoElements.get(i);
            var elemStyle = { position: 'absolute', zIndex: 10, left: info.x, top: info.y, width: info.width, height: info.height };
            var infoElem = React.createElement('div', { key: i, className: 'callout secondary', style: elemStyle }, React.createElement('h5', null, info.header), React.createElement('p', null, info.message));
            infoElems.push(infoElem);
        }
        if (state.alertElements.size > 0 && !state.blockAlert) {
            var alertMsg = state.alertElements.first();
            var alertElem = React.createElement('div', { className: 'alert callout alert-message', onClick: dispatcher.clearAlert }, React.createElement('h5', null, alertMsg.type), React.createElement('p', null, alertMsg.message));
            return (React.createElement("div", { className: "expanded row", id: "whiteboard-row" }, whitElem, contElem, alertElem, infoElems, contextMenu));
        }
        else {
            return (React.createElement("div", { className: "expanded row", id: "whiteboard-row" }, whitElem, contElem, infoElems, contextMenu));
        }
    } });
