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
/** Highlight Whiteboard Component.
*
* This allows the user to highlight areas for other users to see.
*
*/
var HighlightView;
(function (HighlightView) {
    /**
     * The name of the mode associated with this component.
     */
    HighlightView.MODENAME = 'HIGHLIGHT';
    ;
    var pad = function (s, size) {
        while (s.length < size)
            s = "0" + s;
        return s;
    };
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
    HighlightView.DrawHandle = function (input, context) {
        if (input.width > 0 && input.height > 0) {
            context.beginPath();
            context.globalAlpha = 0.4;
            context.fillStyle = 'yellow';
            context.fillRect(input.x, input.y, input.width, input.height);
            context.globalAlpha = 1.0;
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
            var viewX = this.props.viewX;
            var viewY = this.props.viewY;
            var viewWidth = this.props.viewWidth;
            var viewHeight = this.props.viewHeight;
            var item = null;
            if (state.x + state.width / 2 < viewX + viewWidth && state.x + state.width / 2 > viewX) {
                // Within x bounds.
                if (state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY) {
                    // Within view
                    item = React.createElement('rect', {
                        key: 'highlight', x: state.x, y: state.y, width: state.width, height: state.height,
                        fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, opacity: 0.4, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 0 /* Highlight */); }
                    });
                }
                else if (state.y + state.height / 2 >= viewY + viewHeight) {
                    // Top Middle
                    var points = [
                        state.x + state.width / 2, viewY + viewHeight,
                        state.x + state.width / 2 + 20 * viewScale, viewY + viewHeight - 20 * viewScale,
                        state.x + state.width / 2 + 20 * viewScale, viewY + viewHeight - 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + viewHeight - 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + viewHeight - 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
                else {
                    // Bottom Middle
                    var points = [
                        state.x + state.width / 2, viewY,
                        state.x + state.width / 2 + 20 * viewScale, viewY + 20 * viewScale,
                        state.x + state.width / 2 + 20 * viewScale, viewY + 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
            }
            else if (state.x + state.width / 2 >= viewX + viewWidth) {
                // To the right of view
                if (state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY) {
                    // Right Middle
                    var points = [
                        viewX + viewWidth, state.y + state.height / 2,
                        viewX + viewWidth - 20 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + viewWidth - 70 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + viewWidth - 70 * viewScale, state.y + state.height / 2 + 20 * viewScale,
                        viewX + viewWidth - 20 * viewScale, state.y + state.height / 2 + 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
                else if (state.y + state.height / 2 >= viewY + viewHeight) {
                    // Right Top
                    var points = [
                        viewX + viewWidth, viewY + viewHeight,
                        viewX + viewWidth, viewY + viewHeight - 14 * viewScale,
                        viewX + viewWidth - 35 * viewScale, viewY + viewHeight - 49 * viewScale,
                        viewX + viewWidth - 49 * viewScale, viewY + viewHeight - 35 * viewScale,
                        viewX + viewWidth - 14 * viewScale, viewY + viewHeight
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
                else {
                    // Right Bottom
                    var points = [
                        viewX + viewWidth, viewY,
                        viewX + viewWidth, viewY + 14 * viewScale,
                        viewX + viewWidth - 35 * viewScale, viewY + 49 * viewScale,
                        viewX + viewWidth - 49 * viewScale, viewY + 35 * viewScale,
                        viewX + viewWidth - 14 * viewScale, viewY
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
            }
            else {
                // To the left of view
                if (state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY) {
                    // Left Middle
                    var points = [
                        viewX, state.y + state.height / 2,
                        viewX + 20 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + 70 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + 70 * viewScale, state.y + state.height / 2 + 20 * viewScale,
                        viewX + 20 * viewScale, state.y + state.height / 2 + 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
                else if (state.y + state.height / 2 >= viewY + viewHeight) {
                    // Left Top
                    var points = [
                        viewX, viewY + viewHeight,
                        viewX, viewY + viewHeight - 14 * viewScale,
                        viewX + 35 * viewScale, viewY + viewHeight - 49 * viewScale,
                        viewX + 49 * viewScale, viewY + viewHeight - 35 * viewScale,
                        viewX + 14 * viewScale, viewY + viewHeight
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
                else {
                    // Left Bottom
                    var points = [
                        viewX, viewY,
                        viewX, viewY + 14 * viewScale,
                        viewX + 35 * viewScale, viewY + 49 * viewScale,
                        viewX + 49 * viewScale, viewY + 35 * viewScale,
                        viewX + 14 * viewScale, viewY
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1 /* Marker */); }
                    });
                }
            }
            return item;
        };
        return ElementView;
    }(React.Component));
    HighlightView.ElementView = ElementView;
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
            if (this.props.mode == HighlightView.MODENAME) {
                return React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'highlight-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'H');
            }
            else {
                return React.createElement('button', {
                    className: 'button mode-button', id: 'highlight-button', onKeyUp: function (e) { e.preventDefault(); },
                    onClick: function () { _this.props.dispatcher(HighlightView.MODENAME); }
                }, 'H');
            }
        };
        return ModeView;
    }(React.Component));
    HighlightView.ModeView = ModeView;
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
            return React.createElement('div', null);
        };
        return PalleteView;
    }(React.Component));
    HighlightView.PalleteView = PalleteView;
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
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.propTypes = {};
            return _this;
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
    HighlightView.CustomContextView = CustomContextView;
})(HighlightView || (HighlightView = {}));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponentView(HighlightView.MODENAME, HighlightView.ElementView, HighlightView.PalleteView, HighlightView.ModeView, HighlightView.DrawHandle);
