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
/** Free Curve Whiteboard Component.
*
* This allows the user to free draw curves that will be smoothed and rendered to SVG Beziers.
*
*/
var FreeCurveView;
(function (FreeCurveView) {
    /**
     * The name of the mode associated with this component.
     */
    FreeCurveView.MODENAME = 'FREECURVE';
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
    ;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    // VIEW                                                                                                                                                   //
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * A function that will draw to the canvas to give imidiet user feedback whilst the user provides input to create a new element.
     *
     * @param {DrawData} input The current user input to potentially use to create element.
     * @param {CanvasRenderingContext2D} context The canvas context to be drawn to.
     */
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
            // curve through the last two points
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
    /** Free Curve Whiteboard Element View.
    *
    * This is the class that will be used to render the element. It must return an SVG tag (which may have embedded tags).
    */
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** React function to determine if component should update.
         *
         * @param {React.Prop} nextProps - The new set of props.
         * @param {React.Prop} nextState - The new element state.
         *
         * @return boolean - Whether to update this component.
         */
        ElementView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return this.props.state !== nextProps.state || this.props.mode !== nextProps.mode;
        };
        /** React render function
         *
         * @return React.DOMElement
         */
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
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1 /* Interaction */, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1 /* Interaction */, null); },
                            onMouseDown: function (e) { dispatcher.mouseDown(e, 1 /* Interaction */, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1 /* Interaction */, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1 /* Interaction */, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1 /* Interaction */, null);
                                }
                            }
                        }));
                    }
                    else if (mode == BoardModes.ERASE) {
                        items.push(React.createElement('circle', {
                            key: 'interaction', cx: state.point.x, cy: state.point.y, r: state.size / 2 + (eraseSize * viewScale), fill: state.colour, opacity: 0,
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1 /* Interaction */, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1 /* Interaction */, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1 /* Interaction */, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1 /* Interaction */, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1 /* Interaction */, null);
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
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1 /* Interaction */, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1 /* Interaction */, null); },
                            onMouseDown: function (e) { dispatcher.mouseDown(e, 1 /* Interaction */, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1 /* Interaction */, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1 /* Interaction */, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1 /* Interaction */, null);
                                }
                            }
                        }));
                    }
                    else if (mode == BoardModes.ERASE) {
                        items.push(React.createElement('path', {
                            key: 'interaction', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size + (eraseSize * viewScale),
                            strokeLinecap: 'round', opacity: 0, pointerEvents: 'stroke',
                            onMouseOver: function (e) { dispatcher.mouseOver(e, 1 /* Interaction */, null); },
                            onMouseOut: function (e) { dispatcher.mouseOut(e, 1 /* Interaction */, null); },
                            onMouseMove: function (e) { dispatcher.mouseMove(e, 1 /* Interaction */, null); },
                            onClick: function (e) {
                                if (e.detail == 2) {
                                    dispatcher.doubleClick(e, 1 /* Interaction */, null);
                                }
                                else {
                                    dispatcher.mouseClick(e, 1 /* Interaction */, null);
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
    /** Whiteboard Mode View.
    *
    * This is the class that will be used to render the mode selection button for this component. Must return a button.
    *
    */
    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** React render function
         *
         * @return React.DOMElement
         */
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
    /** Whiteboard Pallete View.
    *
    * This is the class that will be used to render the pallete for this component.
    * This will be displayed when the mode for this component is selected.
    *
    */
    var PalleteView = (function (_super) {
        __extends(PalleteView, _super);
        function PalleteView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** React render function
         *
         * @return React.DOMElement
         */
        PalleteView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            var blackButt = React.createElement('button', {
                className: 'button colour-button', id: 'black-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0 /* COLOUR */, data: PalleteColour.BLACK }); }
            });
            var blueButt = React.createElement('button', {
                className: 'button colour-button', id: 'blue-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0 /* COLOUR */, data: PalleteColour.BLUE }); }
            });
            var redButt = React.createElement('button', {
                className: 'button colour-button', id: 'red-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0 /* COLOUR */, data: PalleteColour.RED }); }
            });
            var greenButt = React.createElement('button', {
                className: 'button colour-button', id: 'green-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 0 /* COLOUR */, data: PalleteColour.GREEN }); }
            });
            var smallButt = React.createElement('button', {
                className: 'button mode-button', id: 'small-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 1 /* SIZE */, data: PalleteSize.SMALL }); }
            }, 'S');
            var medButt = React.createElement('button', {
                className: 'button mode-button', id: 'medium-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 1 /* SIZE */, data: PalleteSize.MEDIUM }); }
            }, 'M');
            var largeButt = React.createElement('button', {
                className: 'button mode-button', id: 'large-button', onKeyUp: function (e) { e.preventDefault(); },
                onClick: function () { return dispatcher({ type: 1 /* SIZE */, data: PalleteSize.LARGE }); }
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
    /** Custom Context View.
    *
    * This is the class that will be used to render the additional context menu items for this component.
    * This will be displayed when the mode for this component is selected.
    *
    * Note: Copy, Cut and Paste have standard event handlers in dispatcher. If other context items are desired they must use the custom context event.
    */
    var CustomContextView = (function (_super) {
        __extends(CustomContextView, _super);
        function CustomContextView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** React render function
         *
         * @return React.DOMElement
         */
        CustomContextView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            return null;
        };
        return CustomContextView;
    }(React.Component));
    FreeCurveView.CustomContextView = CustomContextView;
})(FreeCurveView || (FreeCurveView = {}));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponentView(FreeCurveView.MODENAME, FreeCurveView.ElementView, FreeCurveView.PalleteView, FreeCurveView.ModeView, FreeCurveView.DrawHandle);
