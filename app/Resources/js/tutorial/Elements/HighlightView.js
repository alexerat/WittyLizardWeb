var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var HighlightView;
(function (HighlightView) {
    HighlightView.MODENAME = 'HIGHLIGHT';
    var PalleteChangeType;
    (function (PalleteChangeType) {
    })(PalleteChangeType || (PalleteChangeType = {}));
    var ViewComponents;
    (function (ViewComponents) {
        ViewComponents[ViewComponents["Highlight"] = 0] = "Highlight";
        ViewComponents[ViewComponents["Marker"] = 1] = "Marker";
    })(ViewComponents || (ViewComponents = {}));
    ;
    var pad = function (s, size) {
        while (s.length < size)
            s = "0" + s;
        return s;
    };
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
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView() {
            return _super.apply(this, arguments) || this;
        }
        ElementView.prototype.shouldComponentUpdate = function (nextProps, nextState) {
            return this.props.state !== nextProps.state || this.props.mode !== nextProps.mode;
        };
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
                if (state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY) {
                    item = React.createElement('rect', {
                        key: 'highlight', x: state.x, y: state.y, width: state.width, height: state.height,
                        fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, opacity: 0.4, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 0); }
                    });
                }
                else if (state.y + state.height / 2 >= viewY + viewHeight) {
                    var points = [
                        state.x + state.width / 2, viewY + viewHeight,
                        state.x + state.width / 2 + 20 * viewScale, viewY + viewHeight - 20 * viewScale,
                        state.x + state.width / 2 + 20 * viewScale, viewY + viewHeight - 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + viewHeight - 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + viewHeight - 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
                else {
                    var points = [
                        state.x + state.width / 2, viewY,
                        state.x + state.width / 2 + 20 * viewScale, viewY + 20 * viewScale,
                        state.x + state.width / 2 + 20 * viewScale, viewY + 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
            }
            else if (state.x + state.width / 2 >= viewX + viewWidth) {
                if (state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY) {
                    var points = [
                        viewX + viewWidth, state.y + state.height / 2,
                        viewX + viewWidth - 20 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + viewWidth - 70 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + viewWidth - 70 * viewScale, state.y + state.height / 2 + 20 * viewScale,
                        viewX + viewWidth - 20 * viewScale, state.y + state.height / 2 + 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
                else if (state.y + state.height / 2 >= viewY + viewHeight) {
                    var points = [
                        viewX + viewWidth, viewY + viewHeight,
                        viewX + viewWidth, viewY + viewHeight - 14 * viewScale,
                        viewX + viewWidth - 35 * viewScale, viewY + viewHeight - 49 * viewScale,
                        viewX + viewWidth - 49 * viewScale, viewY + viewHeight - 35 * viewScale,
                        viewX + viewWidth - 14 * viewScale, viewY + viewHeight
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
                else {
                    var points = [
                        viewX + viewWidth, viewY,
                        viewX + viewWidth, viewY + 14 * viewScale,
                        viewX + viewWidth - 35 * viewScale, viewY + 49 * viewScale,
                        viewX + viewWidth - 49 * viewScale, viewY + 35 * viewScale,
                        viewX + viewWidth - 14 * viewScale, viewY
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
            }
            else {
                if (state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY) {
                    var points = [
                        viewX, state.y + state.height / 2,
                        viewX + 20 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + 70 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + 70 * viewScale, state.y + state.height / 2 + 20 * viewScale,
                        viewX + 20 * viewScale, state.y + state.height / 2 + 20 * viewScale
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
                else if (state.y + state.height / 2 >= viewY + viewHeight) {
                    var points = [
                        viewX, viewY + viewHeight,
                        viewX, viewY + viewHeight - 14 * viewScale,
                        viewX + 35 * viewScale, viewY + viewHeight - 49 * viewScale,
                        viewX + 49 * viewScale, viewY + viewHeight - 35 * viewScale,
                        viewX + 14 * viewScale, viewY + viewHeight
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
                else {
                    var points = [
                        viewX, viewY,
                        viewX, viewY + 14 * viewScale,
                        viewX + 35 * viewScale, viewY + 49 * viewScale,
                        viewX + 49 * viewScale, viewY + 35 * viewScale,
                        viewX + 14 * viewScale, viewY
                    ];
                    item = React.createElement('polygon', {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: function (e) { dispatcher.mouseClick(e, 1); }
                    });
                }
            }
            return item;
        };
        return ElementView;
    }(React.Component));
    HighlightView.ElementView = ElementView;
    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            return _super.apply(this, arguments) || this;
        }
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
    var PalleteView = (function (_super) {
        __extends(PalleteView, _super);
        function PalleteView() {
            return _super.apply(this, arguments) || this;
        }
        PalleteView.prototype.render = function () {
            var state = this.props.state;
            var dispatcher = this.props.dispatcher;
            return React.createElement('div', null);
        };
        return PalleteView;
    }(React.Component));
    HighlightView.PalleteView = PalleteView;
    var CustomContextView = (function (_super) {
        __extends(CustomContextView, _super);
        function CustomContextView() {
            var _this = _super.apply(this, arguments) || this;
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
    HighlightView.CustomContextView = CustomContextView;
})(HighlightView || (HighlightView = {}));
registerComponentView(HighlightView.MODENAME, HighlightView.ElementView, HighlightView.PalleteView, HighlightView.ModeView, HighlightView.DrawHandle);
