var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FreeCurveView;
(function (FreeCurveView) {
    FreeCurveView.MODENAME = 'FREECURVE';
    var PalleteChangeType;
    (function (PalleteChangeType) {
        PalleteChangeType[PalleteChangeType["COLOUR"] = 0] = "COLOUR";
        PalleteChangeType[PalleteChangeType["SIZE"] = 1] = "SIZE";
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
        ViewComponents[ViewComponents["Interaction"] = 1] = "Interaction";
    })(ViewComponents || (ViewComponents = {}));
    FreeCurveView.DrawHandle = function (input, context) {
        var palleteState = input.palleteState;
        var i = 0;
        context.beginPath();
        context.moveTo(input.pointList[i].x, input.pointList[i].y);
        context.arc(input.pointList[i].x, input.pointList[i].y, palleteState.size / 2, 0, 2 * Math.PI);
        context.fillStyle = palleteState.colour;
        context.fill();
        context.beginPath();
        context.strokeStyle = palleteState.colour;
        context.lineWidth = palleteState.size;
        context.moveTo(input.pointList[i].x, input.pointList[i].y);
        if (input.pointList.length > 2) {
            for (i = 1; i < input.pointList.length - 2; i++) {
                var xc = (input.pointList[i].x + input.pointList[i + 1].x) / 2;
                var yc = (input.pointList[i].y + input.pointList[i + 1].y) / 2;
                context.quadraticCurveTo(input.pointList[i].x, input.pointList[i].y, xc, yc);
            }
            context.quadraticCurveTo(input.pointList[i].x, input.pointList[i].y, input.pointList[i + 1].x, input.pointList[i + 1].y);
            context.stroke();
            context.beginPath();
            context.moveTo(input.pointList[i + 1].x, input.pointList[i + 1].y);
            context.arc(input.pointList[i + 1].x, input.pointList[i + 1].y, palleteState.size / 2, 0, 2 * Math.PI);
            context.fillStyle = palleteState.colour;
            context.fill();
        }
        else {
            context.lineTo(input.pointList[1].x, input.pointList[1].y);
            context.stroke();
        }
    };
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView() {
            _super.apply(this, arguments);
        }
        ElementView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return this.props.state !== nextProps.state || this.props.mode != nextProps.mode;
        };
        ElementView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            var mode = this.props.mode;
            var viewScale = this.props.viewScale;
            var eraseSize = this.props.eraseSize;
            var items = [];
            if (state.type == 'circle') {
                if (state.isSelected) {
                    items.push(React.createElement('circle', {
                        key: 'display', cx: state.point.x, cy: state.point.y, r: state.size / 2, fill: state.colour, stroke: state.colour,
                        className: 'blinking'
                    }));
                }
                else {
                    items.push(React.createElement('circle', {
                        key: 'display', cx: state.point.x, cy: state.point.y, r: state.size / 2, fill: state.colour, stroke: state.colour
                    }));
                }
                if (!state.isMoving) {
                    if (mode == BoardModes.SELECT) {
                        items.push(React.createElement('circle', {
                            key: 'interaction', cx: state.point.x, cy: state.point.y, r: state.size / 2 + (2.5 * viewScale), fill: state.colour, opacity: 0,
                            cursor: 'move',
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1, null); },
                            onMouseDown: function (e) { dispatcher.mouseDown(e, 1, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1, null);
                                }
                            }
                        }));
                    }
                    else if (mode == BoardModes.ERASE) {
                        items.push(React.createElement('circle', {
                            key: 'interaction', cx: state.point.x, cy: state.point.y, r: state.size / 2 + (eraseSize * viewScale), fill: state.colour, opacity: 0,
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1, null);
                                }
                            }
                        }));
                    }
                }
                return React.createElement('g', { transform: 'translate(' + state.x + ',' + state.y + ')' }, items);
            }
            else if (state.type == 'path') {
                if (state.isSelected) {
                    items.push(React.createElement('path', {
                        key: 'display', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size, strokeLinecap: 'round',
                        className: 'blinking'
                    }));
                }
                else {
                    items.push(React.createElement('path', {
                        key: 'display', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size, strokeLinecap: 'round'
                    }));
                }
                if (!state.isMoving) {
                    if (mode == BoardModes.SELECT) {
                        items.push(React.createElement('path', {
                            key: 'interaction', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size + (5 * viewScale),
                            strokeLinecap: 'round', opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1, null); },
                            onMouseDown: function (e) { dispatcher.mouseDown(e, 1, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1, null);
                                }
                            }
                        }));
                    }
                    else if (mode == BoardModes.ERASE) {
                        items.push(React.createElement('path', {
                            key: 'interaction', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size + (eraseSize * viewScale),
                            strokeLinecap: 'round', opacity: 0, pointerEvents: 'stroke',
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1, null);
                                }
                            }
                        }));
                    }
                }
                return React.createElement('g', { transform: 'translate(' + state.x + ',' + state.y + ')' }, items);
            }
            else if (state.type == 'empty') {
                return null;
            }
            else {
                console.error('ERROR: Unrecognized type for SVGBezier.');
                return null;
            }
        };
        return ElementView;
    }(React.Component));
    FreeCurveView.ElementView = ElementView;
    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            _super.apply(this, arguments);
        }
        ModeView.prototype.render = function () {
            var _this = this;
            if (this.props.mode == FreeCurveView.MODENAME) {
                return React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'draw-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'D');
            }
            else {
                return React.createElement('button', {
                    className: 'button mode-button', id: 'draw-button', onKeyUp: function (e) { e.preventDefault(); },
                    onClick: function () { _this.props.dispatcher(FreeCurveView.MODENAME); }
                }, 'D');
            }
        };
        return ModeView;
    }(React.Component));
    FreeCurveView.ModeView = ModeView;
    var PalleteView = (function (_super) {
        __extends(PalleteView, _super);
        function PalleteView() {
            _super.apply(this, arguments);
        }
        PalleteView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
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
            if (state.colour == PalleteColour.BLACK) {
                blackButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'black-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            else if (state.colour == PalleteColour.BLUE) {
                blueButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            else if (state.colour == PalleteColour.RED) {
                redButt = React.createElement('button', {
                    className: 'button colour-button pressed-colour', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                });
            }
            else if (state.colour == PalleteColour.GREEN) {
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
            return React.createElement('div', null, colourCont, sizeCont);
        };
        return PalleteView;
    }(React.Component));
    FreeCurveView.PalleteView = PalleteView;
    var CustomContextView = (function (_super) {
        __extends(CustomContextView, _super);
        function CustomContextView() {
            _super.apply(this, arguments);
            this.propTypes = {};
        }
        CustomContextView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            return null;
        };
        return CustomContextView;
    }(React.Component));
    FreeCurveView.CustomContextView = CustomContextView;
})(FreeCurveView || (FreeCurveView = {}));
registerComponentView(FreeCurveView.MODENAME, FreeCurveView.ElementView, FreeCurveView.PalleteView, FreeCurveView.ModeView, FreeCurveView.DrawHandle);
