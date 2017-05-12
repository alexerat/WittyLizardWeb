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
/** Upload Whiteboard Component.
*
* This allows the user to place images, videos and files in the whiteboard space.
*
*/
var UploadView;
(function (UploadView) {
    /**
     * The name of the mode associated with this component.
     */
    UploadView.MODENAME = 'UPLOAD';
    var ViewTypes = {
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        AUDIO: 'AUDIO',
        FILE: 'FILE',
        IFRAME: 'IFRAME',
        LINK: 'LINK'
    };
    var BUCKETURL = 'https://wittylizard-162000.appspot.com/whiteboard_storage';
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
    UploadView.DrawHandle = function (input, context) {
        if (input.width > 0 && input.height > 0) {
            context.beginPath();
            context.strokeStyle = 'black';
            context.setLineDash([5]);
            context.strokeRect(input.x, input.y, input.width, input.height);
            context.stroke();
        }
    };
    /** Upload Whiteboard Element View.
    *
    * This is the class that will be used to render the element. It must return an SVG tag (which may have embedded tags).
    */
    var ElementView = (function (_super) {
        __extends(ElementView, _super);
        function ElementView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.propTypes = {};
            return _this;
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
            var loadBar = null;
            var waitSpin = null;
            var borderBoxes = [];
            var displayElement;
            var actWidth = state.rotation == 90 || state.rotation == 270 ? state.height : state.width;
            var actHeight = state.rotation == 90 || state.rotation == 270 ? state.width : state.height;
            var self = this;
            if (state.isSelected) {
                borderBoxes.push(React.createElement('rect', {
                    key: 'selected', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
            }
            if (state.mode == BoardModes.SELECT && !state.isMoving && !state.isResizing) {
                if (state.isLoading) {
                    waitSpin = React.createElement(SVGSpinner, {
                        x: state.x, y: state.y, size: state.width / 2
                    });
                    if (state.isUploader || state.percentUp != 0) {
                        loadBar = React.createElement(SVGProgress, {
                            x: state.x, y: state.y, max: 100, value: state.percentUp, size: state.width / 2.0
                        });
                    }
                }
                else {
                    if (state.viewType == ViewTypes.IMAGE) {
                        displayElement = React.createElement('image', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, xlinkHref: state.URL,
                            pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        });
                    }
                    else if (state.viewType == ViewTypes.VIDEO) {
                        var video = React.createElement('video', { src: state.URL });
                        displayElement = React.createElement('foreignObject', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        }, video);
                    }
                    else if (state.viewType == ViewTypes.AUDIO) {
                        var audio = React.createElement('audio', { src: state.URL });
                        displayElement = React.createElement('foreignObject', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        }, audio);
                    }
                    else if (state.viewType == ViewTypes.IFRAME) {
                        var iFrame = React.createElement('iframe', { src: state.URL, frameborder: 0 });
                        displayElement = React.createElement('foreignObject', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        }, iFrame);
                    }
                    else if (state.viewType == ViewTypes.FILE) {
                        displayElement = React.createElement('image', {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/file_image.svg',
                            pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none'
                        });
                    }
                    else if (state.viewType == ViewTypes.LINK) {
                        displayElement = React.createElement('rect', {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/link_image.svg',
                            cursor: 'pointer', pointerEvents: 'fill',
                            onMouseClick: function (e) { window.open(state.URL); }
                        });
                    }
                }
                borderBoxes.push(React.createElement('rect', {
                    key: 'moveFull', x: state.x, y: state.y,
                    width: state.width, height: state.height, opacity: 0, cursor: 'move', pointerEvents: 'all',
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 2 /* Interaction */); }
                }));
                borderBoxes.push(React.createElement('line', {
                    key: 'resizeBottom', x1: state.x, y1: state.y + state.height, x2: state.x + state.width - 1, y2: state.y + state.height,
                    fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 1 /* Resize */, 2 /* Bottom */); }
                }));
                borderBoxes.push(React.createElement('line', {
                    key: 'resizeRight', x1: state.x + state.width, y1: state.y, x2: state.x + state.width, y2: state.y + state.height - 1,
                    fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 1 /* Resize */, 1 /* Right */); }
                }));
                borderBoxes.push(React.createElement('rect', {
                    key: 'resizeCorner', x: state.x + state.width - 1, y: state.y + state.height - 1,
                    width: 2, height: 2, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                    onMouseDown: function (e) { dispatcher.mouseDown(e, 1 /* Resize */, 0 /* Corner */); }
                }));
                borderBoxes.push(React.createElement('rect', {
                    key: 'rotateCorner', x: state.x - 1, y: state.y - 1, width: 2, height: 2, opacity: 0, cursor: 'grab', pointerEvents: 'fill',
                    onClick: function (e) { dispatcher.mouseClick(e, 3 /* Rotate */); }
                }));
            }
            else if (state.mode == BoardModes.ERASE) {
                if (state.isLoading) {
                    waitSpin = React.createElement(SVGSpinner, {
                        x: state.x, y: state.y, size: state.width / 2
                    });
                    if (state.isUploader) {
                        loadBar = React.createElement(SVGProgress, {
                            x: state.x, y: state.y, max: 100, value: state.percentUp, size: state.width / 2
                        });
                    }
                }
                else {
                    if (state.viewType == ViewTypes.IMAGE) {
                        displayElement = React.createElement('image', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, xlinkHref: state.URL, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onClick: dispatcher.mouseClick, onMouseMove: dispatcher.mouseMove, onMouseDown: function (e) { e.preventDefault(); }
                        });
                    }
                    else if (state.viewType == ViewTypes.VIDEO) {
                    }
                    else if (state.viewType == ViewTypes.AUDIO) {
                    }
                    else if (state.viewType == ViewTypes.IFRAME) {
                        var iFrame = React.createElement('iframe', { src: state.URL, frameborder: 0 });
                        displayElement = React.createElement('foreignObject', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onClick: dispatcher.mouseClick, onMouseMove: dispatcher.mouseMove, onMouseDown: function (e) { e.preventDefault(); }
                        }, iFrame);
                    }
                    else if (state.viewType == ViewTypes.FILE) {
                        displayElement = React.createElement('image', {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/file_image.svg', preserveAspectRatio: 'none',
                            onClick: dispatcher.mouseClick, onMouseMove: dispatcher.mouseMove, onMouseDown: function (e) { e.preventDefault(); }
                        });
                    }
                    else if (state.viewType == ViewTypes.LINK) {
                    }
                }
            }
            else {
                if (state.isLoading) {
                    waitSpin = React.createElement(SVGSpinner, {
                        x: state.x, y: state.y, size: state.width / 2
                    });
                    if (state.isUploader) {
                        loadBar = React.createElement(SVGProgress, {
                            x: state.x, y: state.y, max: 100, value: state.percentUp, size: state.width / 2
                        });
                    }
                }
                else {
                    if (state.viewType == ViewTypes.IMAGE) {
                        displayElement = React.createElement('image', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, xlinkHref: state.URL, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onMouseDown: function (e) { e.preventDefault(); }
                        });
                    }
                    else if (state.viewType == ViewTypes.VIDEO) {
                    }
                    else if (state.viewType == ViewTypes.AUDIO) {
                    }
                    else if (state.viewType == ViewTypes.IFRAME) {
                        var iFrame = React.createElement('iframe', { src: state.URL, frameborder: 0 });
                        displayElement = React.createElement('foreignObject', {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onMouseDown: function (e) { e.preventDefault(); }
                        }, iFrame);
                    }
                    else if (state.viewType == ViewTypes.FILE) {
                        displayElement = React.createElement('image', {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/file_image.svg', preserveAspectRatio: 'none',
                            onMouseDown: function (e) { e.preventDefault(); }
                        });
                    }
                    else if (state.viewType == ViewTypes.LINK) {
                    }
                }
            }
            var text = null;
            if (state.viewType == ViewTypes.FILE) {
                text = React.createElement('text', {
                    key: 'text', className: 'noselect', x: state.x, y: state.y + state.height * 0.6, fontSize: state.width * 0.4,
                    fill: '#000000'
                }, '.' + state.extension);
            }
            return React.createElement('g', {}, displayElement, borderBoxes, waitSpin, loadBar, text);
        };
        return ElementView;
    }(React.Component));
    UploadView.ElementView = ElementView;
    /** Upload Whiteboard Mode View.
    *
    * This is the class that will be used to render the mode selection button for this component. Must return a button.
    *
    */
    var ModeView = (function (_super) {
        __extends(ModeView, _super);
        function ModeView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.propTypes = {};
            return _this;
        }
        /** React render function
         *
         * @return React.DOMElement
         */
        ModeView.prototype.render = function () {
            var _this = this;
            if (this.props.mode == UploadView.MODENAME) {
                return React.createElement('button', {
                    className: 'button mode-button pressed-mode', id: 'file-button', onKeyUp: function (e) { e.preventDefault(); }, onClick: function () { }
                }, 'F');
            }
            else {
                return React.createElement('button', {
                    className: 'button mode-button', id: 'file-button', onKeyUp: function (e) { e.preventDefault(); },
                    onClick: function () { return _this.props.dispatcher(UploadView.MODENAME); }
                }, 'F');
            }
        };
        return ModeView;
    }(React.Component));
    UploadView.ModeView = ModeView;
    /** Upload Whiteboard Pallete View.
    *
    * This is the class that will be used to render the pallete for this component.
    * This will be displayed when the mode for this component is selected.
    *
    */
    var PalleteView = (function (_super) {
        __extends(PalleteView, _super);
        function PalleteView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.propTypes = {};
            return _this;
        }
        /** React render function
         *
         * @return React.DOMElement
         */
        PalleteView.prototype.render = function () {
            return null;
        };
        return PalleteView;
    }(React.Component));
    UploadView.PalleteView = PalleteView;
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
    UploadView.CustomContextView = CustomContextView;
})(UploadView || (UploadView = {}));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponentView(UploadView.MODENAME, UploadView.ElementView, UploadView.PalleteView, UploadView.ModeView, UploadView.DrawHandle);
