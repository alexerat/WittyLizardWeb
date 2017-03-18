var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WhiteBoardTextView;
(function (WhiteBoardTextView) {
    WhiteBoardTextView.MODENAME = 'TEXT';
    var PalleteChangeType;
    (function (PalleteChangeType) {
        PalleteChangeType[PalleteChangeType["COLOUR"] = 0] = "COLOUR";
        PalleteChangeType[PalleteChangeType["SIZE"] = 1] = "SIZE";
        PalleteChangeType[PalleteChangeType["BOLD"] = 2] = "BOLD";
        PalleteChangeType[PalleteChangeType["ITALIC"] = 3] = "ITALIC";
        PalleteChangeType[PalleteChangeType["UNDERLINE"] = 4] = "UNDERLINE";
        PalleteChangeType[PalleteChangeType["THROUGHLINE"] = 5] = "THROUGHLINE";
        PalleteChangeType[PalleteChangeType["OVERLINE"] = 6] = "OVERLINE";
        PalleteChangeType[PalleteChangeType["JUSTIFIED"] = 7] = "JUSTIFIED";
    })(PalleteChangeType || (PalleteChangeType = {}));
    var PalleteColour = {
        BLACK: 'black',
        BLUE: 'blue',
        RED: 'red',
        GREEN: 'green'
    };
    var PalleteSize = {
        XSMALL: 2.0,
        SMALL: 5.0,
        MEDIUM: 10.0,
        LARGE: 20.0
    };
    var ViewComponents;
    (function (ViewComponents) {
        ViewComponents[ViewComponents["View"] = 0] = "View";
        ViewComponents[ViewComponents["Resize"] = 1] = "Resize";
        ViewComponents[ViewComponents["Interaction"] = 2] = "Interaction";
        ViewComponents[ViewComponents["TextArea"] = 3] = "TextArea";
    })(ViewComponents || (ViewComponents = {}));
    var ResizeComponents;
    (function (ResizeComponents) {
        ResizeComponents[ResizeComponents["Corner"] = 0] = "Corner";
        ResizeComponents[ResizeComponents["Right"] = 1] = "Right";
        ResizeComponents[ResizeComponents["Bottom"] = 2] = "Bottom";
    })(ResizeComponents || (ResizeComponents = {}));
    WhiteBoardTextView.DrawHandle = function (input, context) {
        if (input.width > 0 && input.height > 0) {
            context.beginPath();
            context.strokeStyle = 'black';
            context.setLineDash([5]);
            context.strokeRect(input.x, input.y, input.width, input.height);
            context.stroke();
        }
    };
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.propTypes = {};
            return _this;
        }
        ElementView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return this.props.state !== nextProps.state || this.props.mode !== nextProps.mode;
        };
        ElementView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            var mode = this.props.mode;
            var hightLightBoxes = [];
            var borderBoxes = [];
            var selCount = 0;
            var displayElement;
            var self = this;
            var lineElems = state.textNodes.map(function (textElem) {
                var sections = [];
                for (var j = 0; j < textElem.sections.length; j++) {
                    var sectionData = textElem.sections[j];
                    var glyphs = [];
                    for (var i_1 = 0; i_1 < sectionData.glyphs.length; i_1++) {
                        var glyph = sectionData.glyphs[i_1];
                        var glyphArgs = {
                            key: i_1, d: glyph.path, stroke: 'none', fill: glyph.colour,
                            transform: 'translate(' + glyph.startAdvance + ',' + 0 + ')' + 'scale(1, -1)'
                        };
                        glyphs.push(React.createElement('path', glyphArgs));
                        if (glyph.uline) {
                            glyphs.push(React.createElement('line', {
                                x1: glyph.startAdvance, y1: 300,
                                x2: glyph.startAdvance + glyph.xAdvance, y2: 300,
                                stroke: glyph.colour, strokeWidth: 150, key: 'underline' + i_1
                            }));
                        }
                        if (glyph.oline) {
                            glyphs.push(React.createElement('line', {
                                x1: glyph.startAdvance, y1: -1300,
                                x2: glyph.startAdvance + glyph.xAdvance, y2: -1300,
                                stroke: glyph.colour, strokeWidth: 150, key: 'overline' + i_1
                            }));
                        }
                        if (glyph.tline) {
                            glyphs.push(React.createElement('line', {
                                x1: glyph.startAdvance, y1: -500,
                                x2: glyph.startAdvance + glyph.xAdvance, y2: -500,
                                stroke: glyph.colour, strokeWidth: 150, key: 'throughline' + i_1
                            }));
                        }
                    }
                    var newElem = React.createElement('g', {
                        key: textElem.lineNum, transform: 'scale(' + state.size / 1000 + ',' + state.size / 1000 + ')' +
                            'translate(' + sectionData.startPos + ', 0)'
                    }, glyphs);
                    sections.push(newElem);
                }
                return React.createElement('g', {
                    key: textElem.lineNum, transform: 'translate(' + 0 + ',' + (textElem.lineNum + 1) * (2 * state.size) + ')'
                }, sections);
            });
            if (mode == BoardModes.SELECT && !state.isMoving && !state.isResizing && !state.remLock) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'move', x: 0, y: 0, width: state.width, height: state.height,
                    fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 2); }
                }));
            }
            if (state.cursor != null) {
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
                    key: 'locEdit', x: 0, y: 0, width: state.width, height: state.height,
                    fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
                if (!state.isMoving && !state.isResizing) {
                    borderBoxes.push(React.createElement('line', {
                        key: 'moveTop', x1: 0, y1: 0, x2: 0 + state.width - state.size * 0.25, y2: 0,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 2); }
                    }));
                    borderBoxes.push(React.createElement('line', {
                        key: 'moveLeft', x1: 0, y1: 0, x2: 0, y2: 0 + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 2); }
                    }));
                    borderBoxes.push(React.createElement('line', {
                        key: 'resizeBottom', x1: 0, y1: 0 + state.height,
                        x2: 0 + state.width - state.size * 0.25, y2: 0 + state.height,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 1, 2); }
                    }));
                    borderBoxes.push(React.createElement('line', {
                        key: 'resizeRight', x1: 0 + state.width, y1: 0,
                        x2: 0 + state.width, y2: 0 + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 1, 1); }
                    }));
                    borderBoxes.push(React.createElement('rect', {
                        key: 'resizeCorner', x: 0 + state.width - state.size * 0.25,
                        y: 0 + state.height - state.size * 0.25,
                        width: state.size * 0.5, height: state.size * 0.5, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                        onMouseDown: function (e) { dispatcher.mouseDown(e, 1, 0); }
                    }));
                }
            }
            else if (state.getLock) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'getEdit', x: 0, y: 0, width: state.width, height: state.height, fill: 'none',
                    stroke: 'red', strokeWidth: 2
                }));
            }
            else if (state.remLock) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'remEdit', x: 0, y: 0, width: state.width, height: state.height,
                    fill: 'none', stroke: 'red', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
            }
            borderBoxes.push(React.createElement('rect', {
                key: 'selBox', x: 0, y: 0, width: state.width, height: state.height, fill: 'none',
                opacity: 0, pointerEvents: 'fill',
                onMouseDown: function (e) { dispatcher.mouseDown(e, 3); },
                onClick: function (e) { if (e.detail == 2) {
                    dispatcher.doubleClick(e);
                } }
            }));
            return React.createElement('g', { transform: 'translate(' + state.x + ',' + state.y + ')' }, hightLightBoxes, lineElems, borderBoxes);
        };
        return ElementView;
    }(React.Component));
    WhiteBoardTextView.ElementView = ElementView;
    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ModeView.prototype.render = function () {
            var _this = this;
            if (this.props.mode == WhiteBoardTextView.MODENAME) {
                return React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'T');
            }
            else {
                return React.createElement('button', {
                    className: 'button mode-button', id: 'text-button', onKeyUp: function (e) { e.preventDefault(); },
                    onClick: function () { _this.props.dispatcher(WhiteBoardTextView.MODENAME); }
                }, 'T');
            }
        };
        return ModeView;
    }(React.Component));
    WhiteBoardTextView.ModeView = ModeView;
    var PalleteView = (function (_super) {
        __extends(PalleteView, _super);
        function PalleteView() {
            return _super !== null && _super.apply(this, arguments) || this;
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
                onClick: function () { return dispatcher({ type: 0, data: PalleteColour.BLACK }); }
            });
            var blueButt = React.createElement('button', {
                className: 'button colour-button', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0, data: PalleteColour.BLUE }); }
            });
            var redButt = React.createElement('button', {
                className: 'button colour-button', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0, data: PalleteColour.RED }); }
            });
            var greenButt = React.createElement('button', {
                className: 'button colour-button', id: 'green-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0, data: PalleteColour.GREEN }); }
            });
            var smallButt = React.createElement('button', {
                className: 'button mode-button', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 1, data: PalleteSize.SMALL }); }
            }, 'S');
            var medButt = React.createElement('button', {
                className: 'button mode-button', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 1, data: PalleteSize.MEDIUM }); }
            }, 'M');
            var largeButt = React.createElement('button', {
                className: 'button mode-button', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 1, data: PalleteSize.LARGE }); }
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
            if (state.size == PalleteSize.SMALL) {
                smallButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'S');
            }
            else if (state.size == PalleteSize.MEDIUM) {
                medButt = React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'M');
            }
            else if (state.size == PalleteSize.LARGE) {
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
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 2, data: false }); }
                }, 'B');
            }
            else {
                boldButt = React.createElement('button', {
                    className: 'button style-button', id: 'bold-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 2, data: true }); }
                }, 'B');
            }
            if (state.isItalic) {
                italButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'italic-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 3, data: false }); }
                }, 'I');
            }
            else {
                italButt = React.createElement('button', {
                    className: 'button style-button', id: 'italic-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 3, data: true }); }
                }, 'I');
            }
            if (state.isULine) {
                ulineButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'uline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 4, data: false }); }
                }, 'U');
            }
            else {
                ulineButt = React.createElement('button', {
                    className: 'button style-button', id: 'uline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 4, data: true }); }
                }, 'U');
            }
            if (state.isTLine) {
                tlineButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'tline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 5, data: false }); }
                }, 'T');
            }
            else {
                tlineButt = React.createElement('button', {
                    className: 'button style-button', id: 'tline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 5, data: true }); }
                }, 'T');
            }
            if (state.isOLine) {
                olineButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'oline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 6, data: false }); }
                }, 'O');
            }
            else {
                olineButt = React.createElement('button', {
                    className: 'button style-button', id: 'oline-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 6, data: true }); }
                }, 'O');
            }
            if (state.isJustified) {
                justButt = React.createElement('button', {
                    className: 'button style-button pressed-style', id: 'justify-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 7, data: false }); }
                }, 'J');
            }
            else {
                justButt = React.createElement('button', {
                    className: 'button style-button', id: 'justify-button',
                    onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { return dispatcher({ type: 7, data: true }); }
                }, 'J');
            }
            var styleCont = React.createElement('div', {
                className: 'whiteboard-controlgroup', id: 'whiteboard-stylegroup'
            }, boldButt, italButt, ulineButt, tlineButt, olineButt, justButt);
            return React.createElement('div', null, colourCont, sizeCont, styleCont);
        };
        return PalleteView;
    }(React.Component));
    WhiteBoardTextView.PalleteView = PalleteView;
    var CustomContextView = (function (_super) {
        __extends(CustomContextView, _super);
        function CustomContextView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.propTypes = {};
            return _this;
        }
        CustomContextView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            return null;
        };
        return CustomContextView;
    }(React.Component));
    WhiteBoardTextView.CustomContextView = CustomContextView;
})(WhiteBoardTextView || (WhiteBoardTextView = {}));
registerComponentView(WhiteBoardTextView.MODENAME, WhiteBoardTextView.ElementView, WhiteBoardTextView.PalleteView, WhiteBoardTextView.ModeView, WhiteBoardTextView.DrawHandle);
