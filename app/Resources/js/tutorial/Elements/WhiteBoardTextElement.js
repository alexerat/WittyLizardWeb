var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
var WhiteBoardText;
(function (WhiteBoardText) {
    WhiteBoardText.MODENAME = 'TEXT';
    var ViewComponents;
    (function (ViewComponents) {
        ViewComponents[ViewComponents["View"] = 0] = "View";
        ViewComponents[ViewComponents["Resize"] = 1] = "Resize";
        ViewComponents[ViewComponents["Interaction"] = 2] = "Interaction";
    })(ViewComponents || (ViewComponents = {}));
    var ResizeComponents;
    (function (ResizeComponents) {
        ResizeComponents[ResizeComponents["Corner"] = 0] = "Corner";
        ResizeComponents[ResizeComponents["Right"] = 1] = "Right";
        ResizeComponents[ResizeComponents["Bottom"] = 2] = "Bottom";
    })(ResizeComponents || (ResizeComponents = {}));
    var DrawHandle = function (input, context) {
        context.clearRect(0, 0, whitElem.width, whitElem.height);
        if (rectWidth > 0 && rectHeight > 0) {
            context.beginPath();
            context.strokeStyle = 'black';
            context.setLineDash([5]);
            context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
            context.stroke();
        }
    };
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView() {
            _super.apply(this, arguments);
            this.propTypes = {};
        }
        ElementView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            var hightLightBoxes = [];
            var borderBoxes = [];
            var selCount = 0;
            var displayElement;
            var self = this;
            var tspanElems = state.textNodes.map(function (textElem) {
                var styleNodeElems = textElem.styles.map(function (node) {
                    if (node.text.match(/\s/)) {
                        return React.createElement('tspan', { key: node.key, dx: node.dx }, node.text);
                    }
                    else {
                        return React.createElement('tspan', {
                            key: node.key, fill: node.colour, dx: node.dx, fontWeight: node.weight,
                            fontStyle: node.style, textDecoration: node.decoration
                        }, node.text);
                    }
                });
                return React.createElement('tspan', {
                    key: textElem.lineNum, x: textElem.x, y: textElem.y, xmlSpace: 'preserve' }, styleNodeElems);
            });
            if (state.mode == 'SELECT' && !state.isMoving && !state.isResizing && !state.remEdit) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'move', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 2); }
                }));
                borderBoxes.push(React.createElement('rect', {
                    key: 'selBox', x: state.x, y: state.y, width: state.width, height: state.height, fill: 'none',
                    opacity: 0, pointerEvents: 'fill',
                    onClick: function (e) { if (e.detail == 2) {
                        dispatcher.doubleClick(e);
                    } }
                }));
            }
            if (state.cursor) {
                hightLightBoxes.push(React.createElement('line', {
                    x1: state.cursor.x, y1: state.cursor.y,
                    x2: state.cursor.x, y2: state.cursor.y + state.cursor.height,
                    stroke: 'black', strokeWidth: 1, className: 'blinking', key: 'cursor'
                }));
            }
            if (state.cursorElems) {
                for (var i = 0; i < state.cursorElems.length; i++) {
                    var selElem = state.cursorElems[i];
                    selCount++;
                    hightLightBoxes.push(React.createElement('rect', {
                        x: selElem.x, y: selElem.y, width: selElem.width, height: selElem.height,
                        fill: '#0066ff', stroke: 'none', fillOpacity: 0.3, key: selCount
                    }));
                }
            }
            if (state.isEditing) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'locEdit', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
                if (!state.isMoving && !state.isResizing) {
                    borderBoxes.push(React.createElement('line', {
                        key: 'moveTop', x1: state.x, y1: state.y, x2: state.x + state.width - state.size * 0.25, y2: state.y,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 2); }
                    }));
                    borderBoxes.push(React.createElement('line', {
                        key: 'moveLeft', x1: state.x, y1: state.y, x2: state.x, y2: state.y + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 2); }
                    }));
                    borderBoxes.push(React.createElement('line', {
                        key: 'resizeBottom', x1: state.x, y1: state.y + state.height,
                        x2: state.x + state.width - state.size * 0.25, y2: state.y + state.height,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 1, 2); }
                    }));
                    borderBoxes.push(React.createElement('line', {
                        key: 'resizeRight', x1: state.x + state.width, y1: state.y,
                        x2: state.x + state.width, y2: state.y + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 1, 1); }
                    }));
                    borderBoxes.push(React.createElement('rect', {
                        key: 'resizeCorner', x: state.x + state.width - state.size * 0.25,
                        y: state.y + state.height - state.size * 0.25,
                        width: state.size * 0.5, height: state.size * 0.5, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 1, 0); }
                    }));
                }
            }
            else if (state.getLock) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'getEdit', x: state.x, y: state.y, width: state.width, height: state.height, fill: 'none',
                    stroke: 'red', strokeWidth: 2
                }));
            }
            else if (state.remEdit) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'remEdit', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', stroke: 'red', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
            }
            if (state.isEditing) {
                displayElement = React.createElement('text', {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size
                }, tspanElems);
            }
            else if (state.mode == 'SELECT' && !state.isMoving && !state.isResizing) {
                displayElement = React.createElement('text', {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size
                }, tspanElems);
            }
            else if (state.mode == WhiteBoardText.MODENAME) {
                displayElement = React.createElement('text', {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size,
                    onClick: function (e) { dispatcher.mouseClick(e, 0); },
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 0); }
                }, tspanElems);
            }
            else {
                displayElement = React.createElement('text', {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size, pointerEvents: 'none'
                }, tspanElems);
            }
            return React.createElement('g', null, hightLightBoxes, displayElement, borderBoxes);
        };
        return ElementView;
    }(React.Component));
    WhiteBoardText.ElementView = ElementView;
    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            _super.apply(this, arguments);
            this.propTypes = {};
        }
        ModeView.prototype.render = function () {
            var dispatcher = this.props.dispatcher;
            var textButt = React.createElement('button', { className: 'button mode-button', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.modeChange(1); } }, 'T');
            if (state.mode == 1) {
                textButt = React.createElement('button', { className: 'button mode-button pressed-mode', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { } }, 'T');
            }
            return React.createElement('button', {
                className: 'button mode-button', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher(WhiteBoardText.MODENAME); }
            }, 'T');
        };
        return ModeView;
    }(React.Component));
    WhiteBoardText.ModeView = ModeView;
    var PalleteView = (function (_super) {
        __extends(PalleteView, _super);
        function PalleteView() {
            _super.apply(this, arguments);
            this.propTypes = {};
        }
        PalleteView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            var boldButt;
            var italButt;
            var ulineButt;
            var tlineButt;
            var olineButt;
            var justButt;
            var blackButt = React.createElement('button', {
                className: 'button colour-button', id: 'black-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ operation: 'COLOUR', newState: 'black' }); }
            });
            var blueButt = React.createElement('button', {
                className: 'button colour-button', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher('blue'); }
            });
            var redButt = React.createElement('button', {
                className: 'button colour-button', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher('red'); }
            });
            var greenButt = React.createElement('button', {
                className: 'button colour-button', id: 'green-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher('green'); }
            });
            var smallButt = React.createElement('button', {
                className: 'button mode-button', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ operation: 'SIZE', newState: 0 }); }
            }, 'S');
            var medButt = React.createElement('button', {
                className: 'button mode-button', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ operation: 'SIZE', newState: 1 }); }
            }, 'M');
            var largeButt = React.createElement('button', {
                className: 'button mode-button', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ operation: 'SIZE', newState: 2 }); }
            }, 'L');
            if (state.colour == 'black') {
                blackButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'black-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            else if (state.colour == 'blue') {
                blueButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            else if (state.colour == 'red') {
                redButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            else if (state.colour == 'green') {
                greenButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'green-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            if (state.size == 0) {
                smallButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'S');
            }
            else if (state.size == 1) {
                medButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'M');
            }
            else if (state.size == 2) {
                largeButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'L');
            }
            var colourCont = React.createElement('div', {
                className: 'whiteboard-controlgroup', id: 'whiteboard-colourgroup'
            }, blackButt, blueButt, redButt, greenButt);
            var sizeCont = React.createElement('div', {
                className: 'whiteboard-controlgroup', id: 'whiteboard-sizegroup'
            }, smallButt, medButt, largeButt);
            if (state.isBold) {
                boldButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'bold-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(false); }
                }, 'B');
            }
            else {
                boldButt = React.createElement('button', {
                    className: 'button style-button', id: 'bold-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(true); }
                }, 'B');
            }
            if (state.isItalic) {
                italButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'italic-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(false); }
                }, 'I');
            }
            else {
                italButt = React.createElement('button', {
                    className: 'button style-button', id: 'italic-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(true); }
                }, 'I');
            }
            if (state.isULine) {
                ulineButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'uline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(false); }
                }, 'U');
            }
            else {
                ulineButt = React.createElement('button', {
                    className: 'button style-button', id: 'uline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(true); }
                }, 'U');
            }
            if (state.isTLine) {
                tlineButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'tline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(false); }
                }, 'T');
            }
            else {
                tlineButt = React.createElement('button', {
                    className: 'button style-button', id: 'tline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(true); }
                }, 'T');
            }
            if (state.isOLine) {
                olineButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'oline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(false); }
                }, 'O');
            }
            else {
                olineButt = React.createElement('button', {
                    className: 'button style-button', id: 'oline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(true); }
                }, 'O');
            }
            if (state.isJustified) {
                justButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'justify-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(false); }
                }, 'J');
            }
            else {
                justButt = React.createElement('button', {
                    className: 'button style-button', id: 'justify-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher.palleteChange(true); }
                }, 'J');
            }
            var styleCont = React.createElement('div', {
                className: 'whiteboard-controlgroup', id: 'whiteboard-stylegroup'
            }, boldButt, italButt, ulineButt, tlineButt, olineButt, justButt);
            return React.createElement('div', null, colourCont, sizeCont);
        };
        return PalleteView;
    }(React.Component));
    WhiteBoardText.PalleteView = PalleteView;
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            var _this = this;
            _super.call(this);
            this.boldChange = function (newState) {
                _this.setIsBold(newState);
                _this.styleChange();
            };
            this.italicChange = function (newState) {
                _this.setIsItalic(newState);
                _this.styleChange();
            };
            this.underlineChange = function (newState) {
                if (newState) {
                    _this.setIsOline(false);
                    _this.setIsTline(false);
                }
                _this.setIsUline(newState);
                _this.styleChange();
            };
            this.overlineChange = function (newState) {
                if (newState) {
                    _this.setIsUline(false);
                    _this.setIsTline(false);
                }
                _this.setIsOline(newState);
                _this.styleChange();
            };
            this.throughlineChange = function (newState) {
                if (newState) {
                    _this.setIsOline(false);
                    _this.setIsUline(false);
                }
                _this.setIsTline(newState);
                _this.styleChange();
            };
            this.justifiedChange = function (newState) {
                _this.setJustified(newState);
                if (_this.currTextEdit != -1) {
                    _this.setTextJustified(_this.currTextEdit, !_this.viewState.isJustified);
                }
            };
            this.setIsItalic = function (newState) {
                _this.updateView(Object.assign({}, _this.viewState, { isItalic: newState }));
            };
            this.setIsOline = function (newState) {
                _this.updateView(Object.assign({}, _this.viewState, { isOLine: newState }));
            };
            this.setIsUline = function (newState) {
                _this.updateView(Object.assign({}, _this.viewState, { isULine: newState }));
            };
            this.setIsTline = function (newState) {
                _this.updateView(Object.assign({}, _this.viewState, { isTLine: newState }));
            };
            this.setIsBold = function (newState) {
                _this.updateView(Object.assign({}, _this.viewState, { isBold: newState }));
            };
            this.setJustified = function (newState) {
                _this.updateView(Object.assign({}, _this.viewState, { isJustified: newState }));
            };
        }
        Pallete.prototype.handleChange = function (changeMsg) {
        };
        Pallete.prototype.getStyle = function () {
            return this.isItalic ? 'italic' : 'normal';
        };
        Pallete.prototype.getWeight = function () {
            return this.isBold ? 'bold' : 'normal';
        };
        Pallete.prototype.getDecoration = function () {
            if (this.isOLine) {
                return 'overline';
            }
            else if (this.isTLine) {
                return 'line-through';
            }
            else if (this.isULine) {
                return 'underline';
            }
            else {
                return 'none';
            }
        };
        return Pallete;
    }(BoardPallete));
    WhiteBoardText.Pallete = Pallete;
    var Element = (function (_super) {
        __extends(Element, _super);
        function Element() {
            _super.call(this, WhiteBoardText.MODENAME);
            this.curveSet = [];
            this.startLeft = false;
            this.idealX = 0;
            this.dist = [];
            this.text = '';
        }
        Element.getCreationParams = function (data) {
            return null;
        };
        Element.prototype.setServerId = function (id) {
            var retVal = [];
            return retVal;
        };
        Element.prototype.erase = function () {
            return null;
        };
        Element.prototype.restore = function () {
            return null;
        };
        Element.prototype.handleDeselect = function () {
        };
        Element.prototype.handleMouseDown = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
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
            return retVal;
        };
        Element.prototype.handleMouseMove = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleMouseUp = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleMouseClick = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleDoubleClick = function (e, localX, localY, palleteState, component, subId) {
            if (this.currTextEdit != -1) {
                if (this.currTextEdit != id) {
                    this.releaseText(this.currTextEdit);
                    var tbox = this.getText(this.currTextEdit);
                    var lineCount = tbox.textNodes.length;
                    if (lineCount == 0) {
                        lineCount = 1;
                    }
                    if (lineCount * 1.5 * tbox.size < tbox.height) {
                        this.resizeText(this.currTextEdit, tbox.width, lineCount * 1.5 * tbox.size);
                        this.sendTextResize(this.currTextEdit);
                    }
                }
            }
            else {
                if (this.isHost || this.userId == textBox.user) {
                    this.lockText(id);
                }
            }
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleTouchStart = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleTouchMove = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleTouchEnd = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleTouchCancel = function (e, localX, localY, palleteState, component, subId) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.handleBoardMouseDown = function (e, localX, localY, palleteState) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            if (this.currTextEdit > -1) {
                var textBox = this.getText(this.currTextEdit);
                this.cursorStart = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.changeTextSelect(this.currTextEdit, true);
            }
            return retVal;
        };
        Element.prototype.handleBoardMouseMove = function (e, changeX, changeY, palleteState) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            if (this.currTextResize != -1) {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;
                var tbox = this.getText(this.currTextResize);
                var newWidth = this.horzResize ? tbox.width + changeX : tbox.width;
                var newHeight = this.vertResize ? tbox.height + changeY : tbox.height;
                this.resizeText(this.currTextResize, newWidth, newHeight);
                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textResized = true;
            }
            else if (this.currTextMove != -1) {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;
                this.moveTextbox(this.currTextMove, true, changeX, changeY, new Date());
                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textMoved = true;
            }
            else if (this.currTextSel != -1) {
                var textBox = this.getText(this.currTextEdit);
                var newLoc = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);
                if (this.textDown < newLoc) {
                    this.cursorStart = this.textDown;
                    this.cursorEnd = newLoc;
                    this.startLeft = true;
                }
                else {
                    this.cursorStart = newLoc;
                    this.cursorEnd = this.textDown;
                    this.startLeft = false;
                }
                this.changeTextSelect(this.currTextSel, true);
            }
            return retVal;
        };
        Element.prototype.handleBoardMouseUp = function (e, localX, localY, palleteState) {
            var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        };
        Element.prototype.startMove = function (e, localX, localY, palleteState) {
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleMove = function (changeX, changeY) {
            this.x += changeX;
            this.y += changeY;
            var newView = this.updateView({ x: this.x, y: this.y });
            var serverMsg = { header: 'MOVE', payload: { x: changeX, y: changeY } };
            var retVal = { newView: newView, serverMessages: [serverMsg] };
            return retVal;
        };
        Element.prototype.endMove = function (e, localX, localY, palleteState) {
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleKeyPress = function (e, input, palleteState) {
            if (this.isWriting) {
                e.preventDefault();
                e.stopPropagation();
                var textItem;
                var i;
                var line;
                var style;
                switch (inputChar) {
                    case 'ArrowLeft':
                        textItem = this.getText(this.currTextEdit);
                        var newStart = this.cursorStart;
                        var newEnd = this.cursorEnd;
                        if (this.cursorStart == this.cursorEnd || !this.startLeft) {
                            if (this.cursorStart > 0) {
                                if (e.ctrlKey) {
                                    i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
                                    while (i > 0 && !textItem.text.charAt(i - 1).match(/\s/)) {
                                        i--;
                                    }
                                    newStart = i;
                                }
                                else {
                                    if (newStart > 0) {
                                        newStart--;
                                    }
                                }
                            }
                        }
                        else {
                            if (e.ctrlKey) {
                                i = this.cursorEnd > 0 ? this.cursorEnd - 1 : 0;
                                while (i > 0 && !textItem.text.charAt(i - 1).match(/\s/)) {
                                    i--;
                                }
                                newEnd = i;
                            }
                            else {
                                if (newEnd > 0) {
                                    newEnd--;
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (this.cursorStart == this.cursorEnd) {
                                this.startLeft = false;
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                            else if (newStart > newEnd) {
                                this.startLeft = false;
                                this.cursorStart = newEnd;
                                this.cursorEnd = newStart;
                            }
                            else {
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                            this.cursorEnd = this.cursorStart;
                        }
                        this.changeTextSelect(this.currTextEdit, true);
                        break;
                    case 'ArrowRight':
                        textItem = this.getText(this.currTextEdit);
                        var newStart = this.cursorStart;
                        var newEnd = this.cursorEnd;
                        if (this.cursorStart == this.cursorEnd || this.startLeft) {
                            if (this.cursorEnd < textItem.text.length) {
                                if (e.ctrlKey) {
                                    i = this.cursorEnd + 1;
                                    while (i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/))) {
                                        i++;
                                    }
                                    newEnd = i;
                                }
                                else {
                                    if (newEnd < textItem.text.length) {
                                        newEnd++;
                                    }
                                }
                            }
                        }
                        else {
                            if (e.ctrlKey) {
                                i = this.cursorStart < textItem.text.length ? this.cursorStart + 1 : textItem.text.length;
                                while (i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/))) {
                                    i++;
                                }
                                newStart = i;
                            }
                            else {
                                if (newStart < textItem.text.length) {
                                    newStart++;
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (this.cursorStart == this.cursorEnd) {
                                this.startLeft = true;
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                            else if (newStart > newEnd) {
                                this.startLeft = true;
                                this.cursorStart = newEnd;
                                this.cursorEnd = newStart;
                            }
                            else {
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                            this.cursorEnd = this.cursorStart;
                        }
                        this.changeTextSelect(this.currTextEdit, true);
                        break;
                    case 'ArrowUp':
                        textItem = this.getText(this.currTextEdit);
                        var newStart;
                        var newEnd;
                        if (e.ctrlKey) {
                            if (this.startLeft && this.cursorStart != this.cursorEnd) {
                                i = this.cursorEnd - 1;
                                while (i > 0 && !textItem.text.charAt(i - 1).match('\n')) {
                                    i--;
                                }
                                if (i < 0) {
                                    i = 0;
                                }
                                newStart = this.cursorStart;
                                newEnd = i;
                            }
                            else {
                                i = this.cursorStart - 1;
                                while (i > 0 && !textItem.text.charAt(i - 1).match('\n')) {
                                    i--;
                                }
                                if (i < 0) {
                                    i = 0;
                                }
                                newStart = i;
                                newEnd = this.cursorEnd;
                            }
                        }
                        else {
                            if (this.startLeft && this.cursorStart != this.cursorEnd) {
                                newStart = this.cursorStart;
                                if (this.cursorEnd <= textItem.textNodes[0].end) {
                                    newEnd = this.cursorEnd;
                                }
                                else {
                                    newEnd = this.findXHelper(textItem, true, this.cursorEnd);
                                }
                            }
                            else {
                                newEnd = this.cursorEnd;
                                if (this.cursorStart <= textItem.textNodes[0].end) {
                                    newStart = this.cursorStart;
                                }
                                else {
                                    newStart = this.findXHelper(textItem, true, this.cursorStart);
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (this.cursorStart == this.cursorEnd) {
                                this.startLeft = false;
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                            else if (newEnd < newStart) {
                                this.startLeft = false;
                                this.cursorStart = newEnd;
                                this.cursorEnd = newStart;
                            }
                            else {
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            if (this.startLeft && this.cursorStart != this.cursorEnd) {
                                this.cursorStart = newEnd;
                            }
                            else {
                                this.cursorStart = newStart;
                            }
                            this.cursorEnd = this.cursorStart;
                        }
                        this.changeTextSelect(this.currTextEdit, false);
                        break;
                    case 'ArrowDown':
                        textItem = this.getText(this.currTextEdit);
                        var newStart;
                        var newEnd;
                        if (e.ctrlKey) {
                            if (this.startLeft || this.cursorStart == this.cursorEnd) {
                                i = this.cursorEnd + 1;
                                while (i < textItem.text.length && !textItem.text.charAt(i).match('\n')) {
                                    i++;
                                }
                                newStart = this.cursorStart;
                                newEnd = i;
                            }
                            else {
                                i = this.cursorStart + 1;
                                while (i < textItem.text.length && !textItem.text.charAt(i).match('\n')) {
                                    i++;
                                }
                                newStart = i;
                                newEnd = this.cursorEnd;
                            }
                        }
                        else {
                            if (this.startLeft || this.cursorStart == this.cursorEnd) {
                                newStart = this.cursorStart;
                                if (this.cursorEnd >= textItem.textNodes[textItem.textNodes.length - 1].start) {
                                    newEnd = this.cursorEnd;
                                }
                                else {
                                    newEnd = this.findXHelper(textItem, false, this.cursorEnd);
                                }
                            }
                            else {
                                newEnd = this.cursorEnd;
                                if (this.cursorStart >= textItem.textNodes[textItem.textNodes.length - 1].start) {
                                    newStart = this.cursorStart;
                                }
                                else {
                                    newStart = this.findXHelper(textItem, false, this.cursorStart);
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (this.cursorStart == this.cursorEnd) {
                                this.startLeft = true;
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                            else if (newEnd < newStart) {
                                this.startLeft = true;
                                this.cursorStart = newEnd;
                                this.cursorEnd = newStart;
                            }
                            else {
                                this.cursorStart = newStart;
                                this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            if (this.startLeft || this.cursorStart == this.cursorEnd) {
                                this.cursorStart = newEnd;
                            }
                            else {
                                this.cursorStart = newStart;
                            }
                            this.cursorEnd = this.cursorStart;
                        }
                        this.changeTextSelect(this.currTextEdit, false);
                        break;
                    case 'Backspace':
                        textItem = this.getText(this.currTextEdit);
                        if (this.cursorEnd > 0) {
                            if (e.ctrlKey) {
                                if (this.cursorStart > 0) {
                                }
                            }
                            else {
                                if (this.cursorStart == this.cursorEnd) {
                                    this.cursorStart--;
                                }
                                var start_1 = this.cursorStart;
                                var end_1 = this.cursorEnd;
                                this.cursorEnd = this.cursorStart;
                                this.insertText(textItem, start_1, end_1, '');
                            }
                        }
                        break;
                    case 'Enter':
                        inputChar = '\n';
                    default:
                        textItem = this.getText(this.currTextEdit);
                        var start = this.cursorStart;
                        var end = this.cursorEnd;
                        this.cursorStart++;
                        this.cursorEnd = this.cursorStart;
                        this.insertText(textItem, start, end, inputChar);
                }
                break;
            }
        };
        return Element;
    }(BoardElement));
    WhiteBoardText.Element = Element;
    var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [], palleteChanges: [], isSelected: false };
    return retVal;
})(WhiteBoardText || (WhiteBoardText = {}));
handleServerMessage(message);
{
    var retVal = { newView: null, serverMessages: [], wasEdit: false };
    return retVal;
}
handleDeselect();
{
    this.isSelected = false;
    this.updateView({ isSelected: false });
    var retVal = this.currentViewState;
    return retVal;
}
handleHover();
{
    var retVal = { header: '', message: '' };
    return retVal;
}
handlePalleteChange();
{
    var retVal = { newView: null, undoOp: function () { }, redoOp: function () { }, serverMessages: [] };
    return retVal;
}
audioStream(stream, MediaStream);
{
}
videoStream(stream, MediaStream);
{
}
handleCopy(e, ClipboardEvent);
{
    if (this.isWriting && this.cursorStart != this.cursorEnd) {
        var textItem = this.getText(this.currTextEdit);
        e.clipboardData.setData('text/plain', textItem.text.substring(this.cursorStart, this.cursorEnd));
    }
}
handlePaste(e, ClipboardEvent);
{
    if (this.isWriting) {
        var textItem = this.getText(this.currTextEdit);
        var data = e.clipboardData.getData('text/plain');
        this.insertText(textItem, this.cursorStart, this.cursorEnd, data);
        this.cursorStart = this.cursorStart + data.length;
        this.cursorEnd = this.cursorStart;
        this.changeTextSelect(this.currTextEdit, true);
    }
}
handleCut();
{
}
handleCustomContext();
{
}
addTextbox(x, number, y, number, width, number, height, number, size, number, justified, boolean, userId, number, editLock, number, updateTime, Date, serverId ?  : number);
{
    var localId = void 0;
    var remLock = void 0;
    var newText = void 0;
    if (localId == null || localId == undefined) {
        newText =
            {
                text: '', user: userId, isDeleted: false, x: x, y: y, size: size, styles: [], editCount: 0, type: 'text', cursor: null, cursorElems: [],
                width: width, height: height, editLock: editLock, justified: justified, textNodes: [], dist: [0], serverId: serverId, id: 0, waiting: false,
                opBuffer: [], hoverTimer: null, infoElement: null, updateTime: updateTime, operationStack: [], operationPos: 0
            };
        localId = this.boardElems.length;
        this.boardElems[localId] = newText;
        newText.id = localId;
    }
    else {
        newText = this.getText(localId);
    }
    if (editLock == this.userId) {
        remLock = false;
        if (this.currTextEdit == -1) {
            this.currTextEdit = localId;
            this.currTextSel = localId;
            this.cursorStart = newText.text.length;
            this.cursorEnd = newText.text.length;
            this.gettingLock = -1;
            this.isWriting = true;
            this.changeTextSelect(localId, true);
            this.setMode(1);
        }
        else if (this.currTextEdit != localId) {
            this.releaseText(localId);
        }
    }
    else if (editLock != 0) {
        remLock = true;
    }
    var newView = {
        x: newText.x, y: newText.y, width: newText.width, height: newText.height, isEditing: false, remLock: remLock, getLock: false, textNodes: [],
        cursor: null, cursorElems: [], id: localId, type: 'text', size: newText.size, waiting: false, updateTime: updateTime, selected: false
    };
    var newElemList = this.viewState.boardElements.set(localId, newView);
    newElemList = newElemList.sort(this.compareUpdateTime);
    this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList }));
    return localId;
}
setColour = function (newColour) {
    _this.updateView(Object.assign({}, _this.viewState, { colour: newColour }));
};
stopLockText(id, number);
{
    this.gettingLock = -1;
    this.currTextEdit = -1;
    this.currTextSel = -1;
    this.isWriting = false;
    this.editLock = 0;
    this.cursor = null;
    this.cursorElems = [];
    var newTextView = Object.assign({}, this.getViewElement(id), { getLock: false, isEditing: false, cursor: null, cursorElems: [] });
    var newElemList = this.viewState.boardElements.set(id, newTextView);
    this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList }));
}
setTextGetLock = function (id) {
    _this.gettingLock = id;
    var tbox = _this.getText(id);
    tbox.editLock = _this.userId;
    _this.cursorStart = tbox.text.length;
    _this.cursorEnd = tbox.text.length;
    _this.isWriting = true;
    _this.changeTextSelect(id, true);
    var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: true });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
changeTextSelect = function (id, setIdeal) {
    var tbox = _this.getText(id);
    if (setIdeal) {
        if (_this.startLeft) {
            _this.textIdealX = _this.findXPos(tbox, _this.cursorEnd);
        }
        else {
            _this.textIdealX = _this.findXPos(tbox, _this.cursorStart);
        }
    }
    _this.findCursorElems(tbox, _this.cursorStart, _this.cursorEnd);
    if (tbox.styles.length > 0) {
        var i_1 = 0;
        while (i_1 < tbox.styles.length && tbox.styles[i_1].start > _this.cursorStart || tbox.styles[i_1].end < _this.cursorStart) {
            i_1++;
        }
        var isBold = tbox.styles[i_1].weight == 'bold';
        var isItalic = tbox.styles[i_1].style == 'italic';
        var isOLine = tbox.styles[i_1].decoration == 'overline';
        var isULine = tbox.styles[i_1].decoration == 'underline';
        var isTLine = tbox.styles[i_1].decoration == 'line-through';
        _this.updateView(Object.assign({}, _this.viewState, { colour: tbox.styles[i_1].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine }));
    }
    var newTextViewCurr = Object.assign({}, _this.getViewElement(id), { cursor: tbox.cursor, cursorElems: tbox.cursorElems });
    var newElemList = _this.viewState.boardElements.set(id, newTextViewCurr);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
setTextEdit = function (id) {
    _this.currTextEdit = id;
    _this.currTextSel = id;
    var tbox = _this.getText(id);
    tbox.editLock = _this.userId;
    _this.cursorStart = tbox.text.length;
    _this.cursorEnd = tbox.text.length;
    _this.gettingLock = -1;
    _this.isWriting = true;
    _this.changeTextSelect(id, true);
    var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: false, isEditing: true });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    _this.updateView(Object.assign({}, _this.viewState, { mode: 1, boardElements: newElemList }));
};
setTextLock = function (id, userId) {
    var tbox = _this.getText(id);
    tbox.editLock = userId;
    if (userId != _this.userId) {
        var newTextView = Object.assign({}, _this.getViewElement(id), { remLock: true });
        var newElemList = _this.viewState.boardElements.set(id, newTextView);
        _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
    }
};
setTextUnLock = function (id) {
    var tbox = _this.getText(id);
    tbox.editLock = 0;
    var newTextView = Object.assign({}, _this.getViewElement(id), { remLock: false });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
setTextJustified = function (id, state) {
    var textBox = _this.getText(id);
    textBox.justified = state;
    textBox.textNodes = _this.calculateTextLines(textBox);
    if (_this.currTextSel == id) {
        if (_this.startLeft) {
            _this.textIdealX = _this.findXPos(textBox, _this.cursorEnd);
        }
        else {
            _this.textIdealX = _this.findXPos(textBox, _this.cursorStart);
        }
        _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
    }
    var newTextView = Object.assign({}, _this.getViewElement(id), {
        textNodes: textBox.textNodes, cursor: textBox.cursor, cursorElems: textBox.cursorElems
    });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
    _this.sendTextJustified(id);
};
setTextArea = function (id, width, height) {
    var textBox = _this.getText(id);
    textBox.height = height;
    if (textBox.width != width) {
        textBox.width = width;
        textBox.textNodes = _this.calculateTextLines(textBox);
    }
    if (_this.currTextSel == id) {
        _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
    }
    var newTextView = Object.assign({}, _this.getViewElement(id), {
        textNodes: textBox.textNodes, width: textBox.width, height: textBox.height, cursor: textBox.cursor, cursorElems: textBox.cursorElems
    });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    newElemList = newElemList.sort(_this.compareUpdateTime);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
moveTextbox = function (id, isRelative, x, y, updateTime) {
    var textBox = _this.getText(id);
    var changeX;
    var changeY;
    if (isRelative) {
        changeX = x;
        changeY = y;
    }
    else {
        changeX = x - textBox.x;
        changeY = y - textBox.y;
    }
    textBox.x += changeX;
    textBox.y += changeY;
    for (var i_2 = 0; i_2 < textBox.textNodes.length; i_2++) {
        var node = textBox.textNodes[i_2];
        node.x += changeX;
        node.y += changeY;
    }
    if (_this.currTextSel == id) {
        _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
    }
    var newTextView = Object.assign({}, _this.getViewElement(id), {
        textNodes: textBox.textNodes, x: textBox.x, y: textBox.y, cursor: textBox.cursor, cursorElems: textBox.cursorElems, updateTime: updateTime
    });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    newElemList = newElemList.sort(_this.compareUpdateTime);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
startTextWait = function (id) {
    var textItem = _this.getText(id);
    textItem.waiting = true;
    var newTextView = Object.assign({}, _this.getViewElement(id), {
        waiting: true
    });
    var newElemList = _this.viewState.boardElements.set(id, newTextView);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
updateText = function (newText) {
    newText.textNodes = _this.calculateTextLines(newText);
    if (_this.currTextSel == newText.id) {
        _this.findCursorElems(newText, _this.cursorStart, _this.cursorEnd);
    }
    newText.waiting = false;
    var newTextView = Object.assign({}, _this.getViewElement(newText.id), {
        textNodes: newText.textNodes, width: newText.width, height: newText.height, cursor: newText.cursor, cursorElems: newText.cursorElems, waiting: false
    });
    var newElemList = _this.viewState.boardElements.set(newText.id, newTextView);
    newElemList = newElemList.sort(_this.compareUpdateTime);
    _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
};
findXPos(loc, number);
{
    if (this.textNodes.length == 0) {
        return 0;
    }
    var i = 1;
    while (i < this.textNodes.length && this.textNodes[i].start <= loc) {
        i++;
    }
    var line = this.textNodes[i - 1];
    if (line.styles.length == 0) {
        return 0;
    }
    i = 1;
    while (i < line.styles.length && line.styles[i].locStart + line.start <= loc) {
        i++;
    }
    var style = line.styles[i - 1];
    if (line.start + style.locStart == loc) {
        return style.startPos;
    }
    else {
        var currMes = this.dist[loc] - this.dist[line.start + style.locStart];
        return currMes + style.startPos;
    }
}
findTextPos(x, number, y, number);
{
    var whitElem = document.getElementById("whiteBoard-output");
    var elemRect = whitElem.getBoundingClientRect();
    var xFind = 0;
    if (y < this.y) {
        return 0;
    }
    else {
        var lineNum = Math.floor(((y - this.y) / (1.5 * this.size)) + 0.15);
        if (lineNum >= this.textNodes.length) {
            return this.text.length;
        }
        if (!this.textNodes[lineNum]) {
            console.log('Line is: ' + lineNum);
        }
        if (x > this.x) {
            if (x > this.x + this.width) {
                return this.textNodes[lineNum].end;
            }
            else {
                xFind = x - this.x;
            }
        }
        else {
            return this.textNodes[lineNum].start;
        }
        var line = this.textNodes[lineNum];
        if (line.styles.length == 0) {
            return line.start;
        }
        var i = 0;
        while (i < line.styles.length && xFind > line.styles[i].startPos) {
            i++;
        }
        var curr = i - 1;
        var style = line.styles[i - 1];
        i = style.text.length - 1;
        var currMes = this.dist[line.start + style.locStart + style.text.length - 1] - this.dist[line.start + style.locStart];
        while (i > 0 && style.startPos + currMes > xFind) {
            i--;
            currMes = this.dist[line.start + style.locStart + i] - this.dist[line.start + style.locStart];
        }
        var selPoint;
        if (i < style.text.length - 1) {
            if (xFind - (style.startPos + currMes) > (style.startPos + this.dist[line.start + style.locStart + i + 1] - this.dist[line.start + style.locStart]) - xFind) {
                selPoint = line.start + style.locStart + i + 1;
            }
            else {
                selPoint = line.start + style.locStart + i;
            }
        }
        else if (curr + 1 < line.styles.length) {
            if (xFind - (style.startPos + currMes) > line.styles[curr + 1].startPos - xFind) {
                selPoint = line.start + line.styles[curr + 1].locStart;
            }
            else {
                selPoint = line.start + style.locStart + i;
            }
        }
        else {
            if (xFind - (style.startPos + currMes) > (style.startPos + this.dist[line.start + style.locStart + i + 1] - this.dist[line.start + style.locStart]) - xFind) {
                selPoint = line.start + style.locStart + i + 1;
            }
            else {
                selPoint = line.start + style.locStart + i;
            }
        }
        return selPoint;
    }
}
findCursorElems(cursorStart, number, cursorEnd, number);
{
    this.cursorElems = [];
    if (this.textNodes.length == 0) {
        this.cursor = { x: this.x, y: this.y, height: 1.5 * this.size };
    }
    for (var i = 0; i < this.textNodes.length; i++) {
        var line = this.textNodes[i];
        var selStart = null;
        var selEnd = null;
        var startFound = false;
        var endFound = false;
        if (cursorStart >= line.start && cursorStart <= line.end) {
            if (cursorStart == line.end && !line.endCursor) {
                selStart = this.width;
            }
            else {
                for (var j = 0; j < line.styles.length && !startFound; j++) {
                    var style = line.styles[j];
                    selStart = 0;
                    selStart += style.dx;
                    if (cursorStart <= line.start + style.locStart + style.text.length) {
                        startFound = true;
                        selStart += style.startPos + this.dist[cursorStart] - this.dist[line.start + style.locStart];
                    }
                }
            }
        }
        else if (cursorStart < line.start && cursorEnd > line.start) {
            selStart = 0;
        }
        if (cursorEnd > line.start && cursorEnd <= line.end) {
            if (cursorEnd == line.end && !line.endCursor) {
                selEnd = this.width;
            }
            else {
                for (var j = 0; j < line.styles.length && !endFound; j++) {
                    var style = line.styles[j];
                    selEnd = 0;
                    selEnd += style.dx;
                    if (cursorEnd <= line.start + style.locStart + style.text.length) {
                        endFound = true;
                        selEnd += style.startPos + this.dist[cursorEnd] - this.dist[line.start + style.locStart];
                    }
                }
            }
        }
        else if (cursorEnd >= line.end && cursorStart <= line.end) {
            selEnd = this.width;
        }
        if (cursorEnd >= line.start && cursorEnd <= line.end && (this.startLeft || cursorStart == cursorEnd) && line.start != line.end) {
            if (cursorEnd != line.end || line.endCursor) {
                this.cursor = { x: this.x + selEnd, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
            }
        }
        else if (cursorStart >= line.start && cursorStart <= line.end && (!this.startLeft || cursorStart == cursorEnd)) {
            if (cursorStart != line.end || line.endCursor) {
                this.cursor = { x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
            }
        }
        if (selStart != null && selEnd != null && cursorStart != cursorEnd) {
            this.cursorElems.push({ x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, width: selEnd - selStart, height: 1.5 * this.size });
        }
    }
}
calculateLengths(start, number, end, number, prevEnd, number);
{
    var whitElem = document.getElementById("whiteBoard-output");
    var tMount;
    var startPoint;
    var styleNode;
    var change = 0;
    var style = 0;
    var oldDist = this.dist.slice();
    while (style - 1 < this.styles.length && this.styles[style].end <= start - 2) {
        style++;
    }
    if (start > 1) {
        tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tMount.setAttributeNS(null, "opacity", '0');
        tMount.setAttributeNS(null, "x", '' + this.x);
        tMount.setAttributeNS(null, "font-size", '' + this.size);
        tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
        whitElem.appendChild(tMount);
        var charLength1;
        var charLength2;
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start - 2)));
        tMount.appendChild(styleNode);
        charLength1 = styleNode.getComputedTextLength();
        if (this.styles[style].end <= start - 1) {
            style++;
        }
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start - 1)));
        tMount.appendChild(styleNode);
        charLength2 = styleNode.getComputedTextLength();
        startPoint = this.dist[start - 1] + tMount.getComputedTextLength() - charLength1 - charLength2;
        whitElem.removeChild(tMount);
        tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tMount.setAttributeNS(null, "opacity", '0');
        tMount.setAttributeNS(null, "x", '' + this.x);
        tMount.setAttributeNS(null, "font-size", '' + this.size);
        tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
        whitElem.appendChild(tMount);
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start - 1)));
        tMount.appendChild(styleNode);
        if (this.styles[style].end <= start) {
            style++;
        }
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start)));
        tMount.appendChild(styleNode);
        this.dist[start + 1] = startPoint + tMount.getComputedTextLength();
    }
    else if (start > 0) {
        startPoint = 0;
        if (this.styles[style].end <= start - 1) {
            style++;
        }
        tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tMount.setAttributeNS(null, "opacity", '0');
        tMount.setAttributeNS(null, "x", '' + this.x);
        tMount.setAttributeNS(null, "font-size", '' + this.size);
        tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
        whitElem.appendChild(tMount);
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start - 1)));
        tMount.appendChild(styleNode);
        if (this.styles[style].end <= start) {
            style++;
        }
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start)));
        tMount.appendChild(styleNode);
        this.dist[start + 1] = startPoint + tMount.getComputedTextLength();
    }
    else {
        startPoint = 0;
        style = 0;
        tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tMount.setAttributeNS(null, "opacity", '0');
        tMount.setAttributeNS(null, "x", '' + this.x);
        tMount.setAttributeNS(null, "font-size", '' + this.size);
        tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
        whitElem.appendChild(tMount);
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(start)));
        tMount.appendChild(styleNode);
        this.dist[1] = startPoint + tMount.getComputedTextLength();
    }
    for (var i = start + 1; i < end; i++) {
        if (this.styles[style].end <= i) {
            style++;
        }
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(i)));
        tMount.appendChild(styleNode);
        this.dist[i + 1] = startPoint + tMount.getComputedTextLength();
    }
    if (end < this.text.length) {
        if (this.styles[style].end <= end) {
            style++;
        }
        styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
        styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
        styleNode.appendChild(document.createTextNode(this.text.charAt(end)));
        tMount.appendChild(styleNode);
        change = startPoint + tMount.getComputedTextLength() - oldDist[prevEnd + 1];
        for (var i = end; i < this.text.length; i++) {
            this.dist[i + 1] = oldDist[i + 1 + prevEnd - end] + change;
        }
    }
    whitElem.removeChild(tMount);
}
calculateTextLines();
{
    var i_3;
    var childText = [];
    var currPos = 0;
    var prevPos = 0;
    var txtStart = 0;
    var isWhiteSpace = true;
    var dy = this.size;
    var ddy = 1.5 * this.size;
    var nodeCounter;
    var computedTextLength;
    var wordC;
    var spaceC;
    var line;
    var wordsT = [];
    var spacesT = [];
    var startSpace = true;
    var currY = this.y;
    var lineCount = 0;
    if (!this.text.length) {
        return [];
    }
    for (i_3 = 0; i_3 < this.text.length; i_3++) {
        if (isWhiteSpace) {
            if (!this.text.charAt(i_3).match(/\s/)) {
                if (i_3 > 0) {
                    spacesT.push(this.text.substring(txtStart, i_3));
                    txtStart = i_3;
                    isWhiteSpace = false;
                }
                else {
                    startSpace = false;
                    isWhiteSpace = false;
                }
            }
        }
        else {
            if (this.text.charAt(i_3).match(/\s/)) {
                wordsT.push(this.text.substring(txtStart, i_3));
                txtStart = i_3;
                isWhiteSpace = true;
            }
        }
    }
    if (isWhiteSpace) {
        spacesT.push(this.text.substring(txtStart, i_3));
    }
    else {
        wordsT.push(this.text.substring(txtStart, i_3));
    }
    wordC = 0;
    spaceC = 0;
    nodeCounter = 0;
    var nLineTrig;
    while (wordC < wordsT.length || spaceC < spacesT.length) {
        var lineComplete = false;
        var word;
        currY += dy;
        var currLength = 0;
        var tspanEl = {
            styles: [], x: this.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
            justified: this.justified, lineNum: lineCount, text: ''
        };
        var progPos = true;
        nLineTrig = false;
        if (startSpace) {
            var fLine = spacesT[spaceC].indexOf('\n');
            if (fLine != -1) {
                if (spacesT[spaceC].length > 1) {
                    if (fLine == 0) {
                        nLineTrig = true;
                        spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                        spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                    }
                    else {
                        progPos = false;
                        spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                        spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                    }
                }
                else {
                    nLineTrig = true;
                    startSpace = !startSpace;
                }
            }
            if (spaceC >= spacesT.length) {
                console.error('ERROR: Space array out of bounds');
                return [];
            }
            word = spacesT[spaceC];
            spaceC++;
        }
        else {
            if (wordC >= wordsT.length) {
                console.error('ERROR: Word array out of bounds');
                return [];
            }
            word = wordsT[wordC];
            wordC++;
        }
        if (nLineTrig) {
            word = '';
            lineComplete = true;
            tspanEl.justified = false;
            tspanEl.end = currPos;
            currPos++;
            prevPos = currPos;
        }
        computedTextLength = this.dist[currPos + word.length] - this.dist[currPos];
        if (computedTextLength > this.width) {
            lineComplete = true;
            fDash = word.indexOf('-');
            if (fDash != -1 && computedTextLength > this.width) {
                var newStr = word.substring(fDash + 1, word.length);
                wordsT.splice(wordC, 0, newStr);
                word = word.substring(0, fDash + 1);
            }
            i_3 = word.length;
            while (computedTextLength > this.width && i_3 > 0) {
                computedTextLength = this.dist[currPos + word.substring(0, i_3).length] - this.dist[currPos];
                i_3--;
            }
            if (computedTextLength <= this.width) {
                if (startSpace) {
                    if (i_3 + 2 < word.length) {
                        spacesT.splice(spaceC, 0, word.substring(i_3 + 2, word.length));
                    }
                    else {
                        startSpace = !startSpace;
                    }
                    word = word.substring(0, i_3 + 1);
                    currPos += word.length;
                    tspanEl.end = currPos;
                    prevPos = currPos + 1;
                }
                else {
                    wordsT.splice(wordC, 0, word.substring(i_3 + 1, word.length));
                    word = word.substring(0, i_3 + 1);
                    currPos += word.length;
                    tspanEl.end = currPos;
                    tspanEl.endCursor = false;
                    prevPos = currPos;
                }
            }
            else {
                console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
            }
        }
        else {
            currPos += word.length;
            if (!nLineTrig && progPos) {
                startSpace = !startSpace;
            }
        }
        line = word;
        currLength = computedTextLength;
        while (!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length)) {
            if (startSpace) {
                var fLine = spacesT[spaceC].indexOf('\n');
                if (fLine != -1) {
                    if (spacesT[spaceC].length > 1) {
                        if (fLine == 0) {
                            nLineTrig = true;
                            spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                            spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                        }
                        else {
                            progPos = false;
                            spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                            spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                        }
                    }
                    else {
                        nLineTrig = true;
                        startSpace = !startSpace;
                    }
                }
                word = spacesT[spaceC];
            }
            else {
                word = wordsT[wordC];
            }
            if (nLineTrig) {
                word = '';
                lineComplete = true;
                tspanEl.justified = false;
                tspanEl.end = currPos;
                currPos++;
                prevPos = currPos;
            }
            computedTextLength = currLength + this.dist[currPos + word.length] - this.dist[currPos];
            if (computedTextLength > this.width) {
                lineComplete = true;
                if (startSpace) {
                    if (word.length > 1) {
                        i_3 = word.length - 1;
                        while (computedTextLength > this.width && i_3 > 0) {
                            computedTextLength = currLength + this.dist[currPos + i_3] - this.dist[currPos];
                            i_3--;
                        }
                        if (computedTextLength <= this.width) {
                            if (i_3 + 2 < word.length) {
                                var newStr = word.substring(i_3 + 2, word.length);
                                spacesT.splice(spaceC, 0, newStr);
                                line += word.substring(0, i_3 + 1);
                                currPos += word.substring(0, i_3 + 1).length;
                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                                spaceC++;
                            }
                            else {
                                line += word.substring(0, i_3 + 1);
                                currPos += word.substring(0, i_3 + 1).length;
                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                                startSpace = !startSpace;
                                spaceC++;
                            }
                            currLength = computedTextLength;
                        }
                        else {
                            computedTextLength = currLength + this.dist[currPos + word.length - 1] - this.dist[currPos];
                            tspanEl.end = currPos;
                            prevPos = currPos + 1;
                            spacesT[spaceC] = spacesT[spaceC].substring(1, spacesT[spaceC].length);
                        }
                    }
                    else {
                        computedTextLength = currLength;
                        tspanEl.end = currPos;
                        currPos++;
                        prevPos = currPos;
                        startSpace = !startSpace;
                        spaceC++;
                    }
                }
                else {
                    var fDash = word.indexOf('-');
                    if (fDash != -1) {
                        computedTextLength = currLength + this.dist[currPos + fDash + 1] - this.dist[currPos];
                        if (computedTextLength <= this.width) {
                            var newStr = word.substring(fDash + 1, word.length);
                            wordsT.splice(wordC, 0, newStr);
                            wordC++;
                            line += word.substring(0, fDash + 1);
                            currPos += word.substring(0, fDash + 1).length;
                            tspanEl.end = currPos;
                            tspanEl.endCursor = false;
                            prevPos = currPos;
                            currLength = computedTextLength;
                        }
                        else {
                            computedTextLength = currLength - this.dist[currPos] + this.dist[currPos - 1];
                            line = line.substring(0, line.length - 1);
                            tspanEl.end = currPos;
                            currPos++;
                            prevPos = currPos;
                        }
                    }
                    else {
                        computedTextLength = currLength - this.dist[currPos] + this.dist[currPos - 1];
                        line = line.substring(0, line.length - 1);
                        tspanEl.end = currPos - 1;
                        prevPos = currPos;
                    }
                }
            }
            else {
                line += word;
                currPos += word.length;
                if (nLineTrig) {
                    spaceC++;
                }
                else {
                    if (startSpace) {
                        spaceC++;
                    }
                    else {
                        wordC++;
                    }
                    if (progPos) {
                        startSpace = !startSpace;
                    }
                }
                currLength = computedTextLength;
            }
        }
        tspanEl.end = tspanEl.start + line.length;
        tspanEl.text = line;
        dy = ddy;
        nodeCounter = 0;
        if (wordC == wordsT.length && spaceC == spacesT.length) {
            tspanEl.justified = false;
        }
        var reqAdjustment = this.width - computedTextLength;
        var numSpaces = tspanEl.text.length - tspanEl.text.replace(/\s/g, "").length;
        var extraSpace = reqAdjustment / numSpaces;
        var currStart = 0;
        var currLoc = 0;
        for (var j = 0; j < this.styles.length; j++) {
            if (this.styles[j].start < tspanEl.end && this.styles[j].end > tspanEl.start) {
                var startPoint = (this.styles[j].start < tspanEl.start) ? 0 : (this.styles[j].start - tspanEl.start);
                var endPoint = (this.styles[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (this.styles[j].end - tspanEl.start);
                var styleText = tspanEl.text.slice(startPoint, endPoint);
                var newStyle;
                word = '';
                for (i_3 = 0; i_3 < styleText.length; i_3++) {
                    if (styleText.charAt(i_3).match(/\s/)) {
                        if (word.length > 0) {
                            newStyle =
                                {
                                    key: nodeCounter, text: word, colour: this.styles[j].colour, dx: 0, locStart: currLoc,
                                    decoration: this.styles[j].decoration, weight: this.styles[j].weight,
                                    style: this.styles[j].style, startPos: currStart
                                };
                            currStart += this.dist[tspanEl.start + currLoc + word.length] - this.dist[tspanEl.start + currLoc];
                            currLoc += word.length;
                            word = '';
                            tspanEl.styles.push(newStyle);
                            nodeCounter++;
                        }
                        if (tspanEl.justified) {
                            newStyle =
                                {
                                    key: nodeCounter, text: styleText.charAt(i_3), colour: this.styles[j].colour, dx: extraSpace, locStart: currLoc,
                                    decoration: this.styles[j].decoration, weight: this.styles[j].weight,
                                    style: this.styles[j].style, startPos: currStart
                                };
                            currStart += extraSpace + this.dist[tspanEl.start + currLoc + 1] - this.dist[tspanEl.start + currLoc];
                        }
                        else {
                            newStyle =
                                {
                                    key: nodeCounter, text: styleText.charAt(i_3), colour: this.styles[j].colour, dx: 0, locStart: currLoc,
                                    decoration: this.styles[j].decoration, weight: this.styles[j].weight,
                                    style: this.styles[j].style, startPos: currStart
                                };
                            currStart += this.dist[tspanEl.start + currLoc + 1] - this.dist[tspanEl.start + currLoc];
                        }
                        currLoc += 1;
                        tspanEl.styles.push(newStyle);
                        nodeCounter++;
                    }
                    else {
                        word += styleText.charAt(i_3);
                        if (i_3 == styleText.length - 1) {
                            newStyle =
                                {
                                    key: nodeCounter, text: word, colour: this.styles[j].colour, dx: 0, locStart: currLoc,
                                    decoration: this.styles[j].decoration, weight: this.styles[j].weight,
                                    style: this.styles[j].style, startPos: currStart
                                };
                            currStart += this.dist[tspanEl.start + currLoc + word.length] - this.dist[tspanEl.start + currLoc];
                            currLoc += word.length;
                            tspanEl.styles.push(newStyle);
                            nodeCounter++;
                        }
                    }
                }
            }
        }
        childText.push(tspanEl);
        lineCount++;
    }
    if (nLineTrig) {
        tspanEl = {
            styles: [], x: this.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
            justified: false, lineNum: lineCount, text: ''
        };
        lineCount++;
        childText.push(tspanEl);
    }
    if (lineCount * 1.5 * this.size > this.height) {
        this.resizeText(this.id, this.width, lineCount * 1.5 * this.size);
        this.sendTextResize(this.id);
    }
    return childText;
}
findXHelper(isUp, boolean, relative, number);
{
    var i_4;
    var line_1;
    if (isUp) {
        i_4 = 1;
        while (i_4 < this.textNodes.length && relative > this.textNodes[i_4].end) {
            i_4++;
        }
        line_1 = this.textNodes[i_4 - 1];
    }
    else {
        i_4 = 0;
        while (i_4 < this.textNodes.length - 1 && relative > this.textNodes[i_4].end) {
            i_4++;
        }
        line_1 = this.textNodes[i_4 + 1];
    }
    i_4 = 0;
    while (i_4 < line_1.styles.length && this.idealX >= line_1.styles[i_4].startPos) {
        i_4++;
    }
    var curr_1 = i_4 - 1;
    var style_1 = line_1.styles[i_4 - 1];
    var currMes_1 = this.dist[line_1.start + style_1.locStart + style_1.text.length - 1] - this.dist[line_1.start + style_1.locStart];
    i_4 = style_1.text.length - 1;
    while (i_4 > 0 && style_1.startPos + currMes_1 > this.idealX) {
        i_4--;
        currMes_1 = this.dist[line_1.start + style_1.locStart + i_4] - this.dist[line_1.start + style_1.locStart];
    }
    if (i_4 < style_1.text.length - 1) {
        if (this.idealX - (style_1.startPos + currMes_1) > (style_1.startPos + this.dist[line_1.start + style_1.locStart + i_4 + 1] - this.dist[line_1.start + style_1.locStart]) - this.idealX) {
            return line_1.start + style_1.locStart + i_4 + 1;
        }
        else {
            return line_1.start + style_1.locStart + i_4;
        }
    }
    else if (curr_1 + 1 < line_1.styles.length) {
        if (this.idealX - (style_1.startPos + currMes_1) > line_1.styles[curr_1 + 1].startPos - this.idealX) {
            return line_1.start + line_1.styles[curr_1 + 1].locStart;
        }
        else {
            return line_1.start + style_1.locStart + i_4;
        }
    }
    else {
        if (this.idealX - (style_1.startPos + currMes_1) > (style_1.startPos + this.dist[line_1.start + style_1.locStart + i_4 + 1] - this.dist[line_1.start + style_1.locStart]) - this.idealX) {
            return line_1.start + style_1.locStart + i_4 + 1;
        }
        else {
            return line_1.start + style_1.locStart + i_4;
        }
    }
}
isCurrentStyle = function (style) {
    if (style.colour == _this.viewState.colour && style.decoration == _this.getDecoration() && style.weight == _this.getWeight() && style.style == _this.getStyle()) {
        return true;
    }
    else {
        return false;
    }
};
insertText = function (textItem, start, end, text) {
    var isNew = true;
    var textStart = textItem.text.slice(0, start);
    var textEnd = textItem.text.slice(end, textItem.text.length);
    var styles = [];
    var fullText = textStart + textEnd;
    _this.startTextWait(_this.currTextEdit);
    for (i = 0; i < textItem.styles.length; i++) {
        var sty = textItem.styles[i];
        if (sty.start >= start) {
            if (sty.start >= end) {
                if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                    && styles[styles.length - 1].decoration == sty.decoration
                    && styles[styles.length - 1].weight == sty.weight
                    && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= 200) {
                    styles[styles.length - 1].end += sty.end - sty.start;
                    styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                }
                else {
                    sty.start -= end - start;
                    sty.end -= end - start;
                    sty.text = fullText.slice(sty.start, sty.end);
                    styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                }
            }
            else {
                if (sty.end > end) {
                    if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                        && styles[styles.length - 1].decoration == sty.decoration
                        && styles[styles.length - 1].weight == sty.weight
                        && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - end <= 200) {
                        styles[styles.length - 1].end += sty.end - end;
                        styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                    }
                    else {
                        sty.end += start - end;
                        sty.start = start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                    }
                }
            }
        }
        else {
            if (sty.end > start) {
                if (sty.end > end) {
                    sty.end -= end - start;
                    sty.text = fullText.slice(sty.start, sty.end);
                    styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                }
                else {
                    sty.end = start;
                    sty.text = fullText.slice(sty.start, sty.end);
                    styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                }
            }
            else {
                sty.text = fullText.slice(sty.start, sty.end);
                styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
            }
        }
    }
    textItem.text = textStart + text + textEnd;
    for (var i = 0; text.length > 0 && i < styles.length; i++) {
        if (styles[i].end > start) {
            if (styles[i].start >= start) {
                if (styles[i].start == start && _this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200) {
                    isNew = false;
                    styles[i].start = start;
                }
                else {
                    styles[i].start += text.length;
                }
                styles[i].end += text.length;
            }
            else if (styles[i].end >= start) {
                if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200) {
                    isNew = false;
                    styles[i].end += text.length;
                }
                else {
                    var newSplit = {
                        start: start + text.length, end: styles[i].end + text.length, decoration: styles[i].decoration,
                        weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour
                    };
                    styles[i].end = start;
                    styles.splice(i + 1, 0, newSplit);
                    i++;
                }
            }
        }
        else if (styles[i].end == start) {
            if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200) {
                isNew = false;
                styles[i].end = start + text.length;
            }
        }
        styles[i].text = textItem.text.slice(styles[i].start, styles[i].end);
    }
    if (isNew && text.length > 0) {
        i = 0;
        while (i < styles.length && styles[i].end <= start) {
            i++;
        }
        var newStyle = {
            start: start, end: start + text.length, decoration: _this.getDecoration(),
            weight: _this.getWeight(), style: _this.getStyle(), colour: _this.viewState.colour,
            text: textItem.text.slice(start, start + text.length)
        };
        styles.splice(i, 0, newStyle);
    }
    textItem.styles = styles;
    textItem = _this.newEdit(textItem);
    if (text.length == 0) {
        if (start > 0) {
            _this.calculateLengths(textItem, start - 1, start, end);
        }
        else if (textItem.text.length > 0) {
            _this.calculateLengths(textItem, start, end, end + 1);
        }
    }
    else {
        _this.calculateLengths(textItem, start, start + text.length, end);
    }
    _this.updateText(textItem);
};
completeEdit = function (textId, userId, editId) {
    var textItem;
    var fullText = '';
    var localId = _this.textDict[textId];
    var editData = _this.textInBuffer[textId].editBuffer[userId][editId];
    textItem = _this.getText(localId);
    textItem.styles = [];
    for (var i = 0; i < editData.nodes.length; i++) {
        textItem.styles[editData.nodes[i].num] = editData.nodes[i];
    }
    for (var i = 0; i < textItem.styles.length; i++) {
        fullText += textItem.styles[i].text;
    }
    textItem.text = fullText;
    _this.startTextWait(localId);
    _this.calculateLengths(textItem, 0, fullText.length, 0);
    _this.updateText(textItem);
};
this.socket.on('STYLENODE', function (data) {
    if (!self.textInBuffer[data.serverId]) {
        console.log('STYLENODE: Unkown text, ID: ' + data.serverId);
        console.log(data);
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        if (self.textInBuffer[data.serverId].editBuffer[data.userId]) {
            if (self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId]) {
                var buffer = self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId];
                buffer.nodes.push(data);
                if (buffer.nodes.length == buffer.num_nodes) {
                    self.completeEdit(data.serverId, data.userId, data.editId);
                }
            }
            else {
                console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.serverId);
                self.socket.emit('UNKNOWN-EDIT', data.editId);
            }
        }
        else {
            console.log('WOAH BUDDY! User ID: ' + data.userId);
        }
    }
});
this.socket.on('LOCK-TEXT', function (data) {
    var localId = self.textDict[data.serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        self.setTextLock(localId, data.userId);
    }
});
this.socket.on('LOCKID-TEXT', function (data) {
    var localId = self.textDict[data.serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        if (self.gettingLock != -1 && self.getText(self.gettingLock).serverId == data.serverId) {
            self.setTextEdit(localId);
        }
        else {
            var msg = { serverId: data.serverId };
            self.socket.emit('RELEASE-TEXT', msg);
        }
    }
});
this.socket.on('EDITID-TEXT', function (data) {
    var buffer = self.textOutBuffer;
    if (data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent) {
        buffer[data.bufferId].lastSent = data.localId;
        for (var i_5 = 0; i_5 < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i_5++) {
            buffer[data.bufferId].editBuffer[data.localId].nodes[i_5].editId = data.editId;
            var node = buffer[data.bufferId].editBuffer[data.localId].nodes[i_5];
            var msg = {
                editId: node.editId, num: node.num, start: node.start, end: node.end, text: node.text, weight: node.weight, style: node.style,
                decoration: node.decoration, colour: node.colour
            };
            self.socket.emit('STYLENODE', msg);
        }
    }
});
this.socket.on('FAILED-TEXT', function (data) {
});
this.socket.on('REFUSED-TEXT', function (data) {
});
this.socket.on('RELEASE-TEXT', function (data) {
    var localId = self.textDict[data.serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        self.setTextUnLock(localId);
    }
});
this.socket.on('EDIT-TEXT', function (data) {
    if (!self.textInBuffer[data.serverId]) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        if (!self.textInBuffer[data.serverId].editBuffer[data.userId]) {
            self.textInBuffer[data.serverId].editBuffer[data.userId] = [];
        }
        self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId] = { num_nodes: data.num_nodes, nodes: [] };
    }
});
this.socket.on('MOVE-TEXT', function (data) {
    var localId = self.textDict[data.serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        self.moveTextbox(localId, false, data.x, data.y, data.editTime);
    }
});
this.socket.on('JUSTIFY-TEXT', function (data) {
    var localId = self.textDict[data.serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        self.setTextJustified(data.serverId, data.newState);
    }
});
this.socket.on('RESIZE-TEXT', function (data) {
    var localId = self.textDict[data.serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', data.serverId);
    }
    else {
        self.setTextArea(localId, data.width, data.height);
    }
});
this.socket.on('DELETE-TEXT', function (serverId) {
    var localId = self.textDict[serverId];
    if (localId == null || localId == undefined) {
        self.socket.emit('UNKNOWN-TEXT', serverId);
    }
    else {
        self.deleteElement(localId);
    }
});
this.socket.on('IGNORE-TEXT', function (serverId) {
});
this.socket.on('DROPPED-TEXT', function (data) {
});
this.socket.on('MISSED-TEXT', function (data) {
});
releaseText = function (id) {
    var textBox = _this.getText(id);
    _this.stopLockText(id);
    if (textBox.serverId) {
        var msg = { serverId: textBox.serverId };
        _this.socket.emit('RELEASE-TEXT', msg);
    }
    else {
        var msg = { serverId: null };
        var newOp = { type: 'RELEASE-TEXT', message: msg };
        textBox.opBuffer.push(newOp);
    }
};
sendTextJustified = function (id) {
    var textBox = _this.getText(id);
    if (textBox.serverId) {
        var msg = { serverId: textBox.serverId, newState: !_this.viewState.isJustified };
        _this.socket.emit('JUSTIFY-TEXT', msg);
    }
    else {
        var msg = { serverId: null, newState: !_this.viewState.isJustified };
        var newOp = { type: 'JUSTIFY-TEXT', message: msg };
        textBox.opBuffer.push(newOp);
    }
};
textEdited = function (textbox) {
    var buffer;
    var editNum;
    if (_this.textOutBuffer[textbox.id]) {
        buffer = _this.textOutBuffer[textbox.id];
        editNum = buffer.editCount;
        buffer.editCount++;
    }
    else {
        buffer = {
            id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, lastSent: 0,
            height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified, styles: []
        };
        buffer.styles = textbox.styles.slice();
        editNum = 0;
    }
    buffer.editBuffer[editNum] = { num_nodes: textbox.styles.length, nodes: [] };
    for (var i = 0; i < textbox.styles.length; i++) {
        buffer.editBuffer[editNum].nodes.push({ num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
            weight: textbox.styles[i].weight, decoration: textbox.styles[i].decoration, style: textbox.styles[i].style,
            start: textbox.styles[i].start, end: textbox.styles[i].end, editId: editNum
        });
    }
    _this.textOutBuffer[textbox.id] = buffer;
    if (textbox.serverId) {
        var msg = { serverId: textbox.serverId, localId: editNum, bufferId: textbox.id, num_nodes: textbox.styles.length };
        _this.socket.emit('EDIT-TEXT', msg);
    }
    else {
        var msg = {
            localId: textbox.id, x: _this.textOutBuffer[textbox.id].x, y: _this.textOutBuffer[textbox.id].y, size: _this.textOutBuffer[textbox.id].size,
            width: _this.textOutBuffer[textbox.id].width, height: _this.textOutBuffer[textbox.id].height, justified: _this.textOutBuffer[textbox.id].justified
        };
        _this.socket.emit('TEXTBOX', msg);
    }
};
resizeText = function (id, width, height) {
    var textBox = _this.getText(id);
    _this.setTextArea(id, width, height);
};
sendTextMove = function (id) {
    var tbox = _this.getText(_this.currTextMove);
    if (tbox.serverId) {
        var msg = { serverId: tbox.serverId, x: tbox.x, y: tbox.y };
        _this.socket.emit('MOVE-TEXT', msg);
    }
    else {
        var msg = { serverId: null, x: tbox.x, y: tbox.y };
        var newOp = { type: 'MOVE-TEXT', message: msg };
        tbox.opBuffer.push(newOp);
    }
};
sendTextResize = function (id) {
    var textBox = _this.getText(id);
    if (textBox.serverId) {
        var msg = { serverId: textBox.serverId, width: textBox.width, height: textBox.height };
        _this.socket.emit('RESIZE-TEXT', msg);
    }
    else {
        var msg = { serverId: null, width: textBox.width, height: textBox.height };
        var newOp = { type: 'RESIZE-TEXT', message: msg };
        textBox.opBuffer.push(newOp);
    }
};
lockText = function (id) {
    var textBox = _this.getText(id);
    _this.setTextGetLock(id);
    if (textBox.serverId) {
        var msg = { serverId: textBox.serverId };
        _this.socket.emit('LOCK-TEXT', msg);
    }
    else {
        var msg = { serverId: null };
        var newOp = { type: 'LOCK-TEXT', message: msg };
        textBox.opBuffer.push(newOp);
    }
};
newEdit = function (textBox) {
    textBox.editCount++;
    if (textBox.editCount > 5) {
        textBox.editCount = 0;
        clearTimeout(_this.editTimer);
        _this.textEdited(textBox);
    }
    else {
        var self = _this;
        clearTimeout(_this.editTimer);
        _this.editTimer = setTimeout(function (tBox) {
            tBox.editCount = 0;
            self.textEdited(tBox);
            clearTimeout(this.editTimer);
        }, 6000, textBox);
    }
    return textBox;
};
styleChange = function () {
    if (_this.currTextEdit != -1 && _this.cursorStart != _this.cursorEnd) {
        var textItem = _this.getText(_this.currTextEdit);
        var text = textItem.text.substring(_this.cursorStart, _this.cursorEnd);
        _this.insertText(textItem, _this.cursorStart, _this.cursorEnd, text);
    }
};
colourChange = function (newColour) {
    _this.setColour(newColour);
    _this.styleChange();
};
registerComponent(WhiteBoardText.MODENAME, WhiteBoardText.Element, WhiteBoardText.ElementView, WhiteBoardText.Pallete, WhiteBoardText.PalleteView, WhiteBoardText.ModeView);
