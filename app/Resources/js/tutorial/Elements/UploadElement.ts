/** Upload Whiteboard Component.
*
* This allows the user to free draw curves that will be smoothed and rendered to SVG Beziers.
*
*/
namespace Upload {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    // MODEL                                                                                                                                                  //
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * The name of the mode associated with this component.
     */
    export const MODENAME = 'UPLOAD';

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        rotation: number;
        isImage: boolean;
        extension: string;
        URL: string;
        isLoading: boolean;
        isUploader: boolean;
        percentUp: number;
    }

    /**
     * A description of the view state for the pallete of this component.
     * This will be passed from the pallete controller to the view.
     */
    interface PalleteViewState extends BoardPalleteViewState {
        colour: string;
        size: number;
    }

    /**
     *
     *
     */
    interface ElementParamaters extends BoardElementParameters {

    }

    /**
     *
     *
     */
    interface PalleteChangeData extends BoardPalleteChange {

    }

    /**
     * A description of components within the view of an element.
     * This is used to identify the source of user input from the element view.
     */
    const enum ViewComponents {
        View,
        Interaction
    }

    /**
     * A description of custom context items (other than copy, cut, paste).
     * This is used to identify the source of a custom context event in the element.
     */
    const enum CustomContextItems {

    }

    const MessageTypes = {
        POINT: 'POINT',
        POINTMISSED: 'MISSED-POINT'
    };

    interface ServerUploadIdMessage extends ServeBaseMessage {
        localId: number;
    }
    interface ServerUploadDataMessage extends ServeBaseMessage {
        place: number;
        percent: number;
    }
    interface ServerNewUploadMessage extends ServeBaseMessage {
        fileDesc: string;
        fileType: string;
        extension: string;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        userId: number;
        editTime: Date;
        url?: string;
    }
    interface ServerResizeFileMessage extends ServeBaseMessage {
        width: number;
        height: number;
        editTime: Date;
    }
    interface ServerRotateFileMessage extends ServeBaseMessage {
        rotation: number;
    }
    interface ServerUploadEndMessage extends ServeBaseMessage {
        fileURL: string;
    }

    interface UserStartUploadMessage extends UserMessage {
        localId: number;
        fileName: string;
        fileSize: number;
        fileType: string;
        extension: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }
    interface UserRemoteFileMessage extends UserMessage {
        localId: number;
        fileURL: string;
        x: number;
        y: number;
        width: number;
        height: number;
        fileDesc: string;
    }
    interface UserUploadDataMessage extends UserMessagePayload {
        piece: ArrayBuffer;
    }
    interface UserResizeFileMessage extends UserMessagePayload {
        width: number;
        height: number;
    }
    interface UserRotateFileMessage extends UserMessagePayload {
        rotation: number;
    }

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
     * @param {CreationData} input The current user input to potentially use to create element.
     * @param {CanvasRenderingContext2D} context The canvas context to be drawn to.
     */
    let DrawHandle = (input: CreationData, context: CanvasRenderingContext2D) => {

    };

    var SVGImage = React.createClass({displayName: 'SVGImage',
    render: function()
    {
        var loadBar = null;
        var waitSpin = null;
        var borderBoxes = [];
        var displayElement;

        let actWidth = this.props.rotation == 90 || this.props.rotation == 270 ? this.props.height : this.props.width;
        let actHeight = this.props.rotation == 90 || this.props.rotation == 270 ? this.props.width : this.props.height;

        var self = this;

        if(this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing)
        {
            if(this.props.isLoading)
            {
                waitSpin = React.createElement(SVGSpinner,
                {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });

                if(this.props.isUploader)
                {
                    loadBar = React.createElement(SVGProgress,
                    {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2.0
                    });
                }
            }
            else
            {

                displayElement = React.createElement('image',
                {
                    x: this.props.x, y: this.props.y, width: actWidth, height: actHeight, xlinkHref: this.props.URL,
                    pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none',
                    transform: 'rotate(' + this.props.rotation + ' ' + (this.props.x + actWidth / 2.0) + ' ' + (this.props.y + actHeight / 2.0) + ')'
                });
            }

            borderBoxes.push(React.createElement('rect',
            {
                key: 'moveFull', x: this.props.x, y: this.props.y,
                width: this.props.width, height: this.props.height, opacity: 0, cursor: 'move', pointerEvents: 'all',
                onMouseDown: function(e) { self.props.mouseMoveDown(e); }
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'resizeBottom', x1: this.props.x, y1: this.props.y + this.props.height, x2: this.props.x + this.props.width - 1, y2: this.props.y + this.props.height,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, true, false); }
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'resizeRight', x1: this.props.x + this.props.width, y1: this.props.y, x2: this.props.x + this.props.width, y2: this.props.y + this.props.height - 1,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, false, true); }
            }));

            borderBoxes.push(React.createElement('rect',
            {
                key: 'resizeCorner', x: this.props.x + this.props.width - 1, y: this.props.y + this.props.height - 1,
                width: 2, height: 2, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, true, true); }
            }));

            borderBoxes.push(React.createElement('rect',
            {
                key: 'rotateCorner', x: this.props.x - 1, y: this.props.y - 1, width: 2, height: 2, opacity: 0, cursor: 'grab', pointerEvents: 'fill',
                onClick: function(e) { self.props.rotateClick(); }
            }));
        }
        else if(this.props.mode == 2)
        {
            if(this.props.isLoading)
            {
                waitSpin = React.createElement(SVGSpinner,
                {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });

                if(this.props.isUploader)
                {
                    loadBar = React.createElement(SVGProgress,
                    {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else
            {
                displayElement = React.createElement('image',
                {
                    x: this.props.x, y: this.props.y, width: actWidth, height: actHeight, xlinkHref: this.props.URL, preserveAspectRatio: 'none',
                    transform: 'rotate(' + this.props.rotation + ' ' + (this.props.x + actWidth / 2.0) + ' ' + (this.props.y + actHeight / 2.0) + ')',
                    onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove, onMouseDown: function(e) { e.preventDefault() }
                });
            }
        }
        else
        {
            if(this.props.isLoading)
            {
                waitSpin = React.createElement(SVGSpinner,
                {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });

                if(this.props.isUploader)
                {
                    loadBar = React.createElement(SVGProgress,
                    {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else
            {
                displayElement = React.createElement('image',
                {
                    x: this.props.x, y: this.props.y, width: actWidth, height: actHeight, xlinkHref: this.props.URL, preserveAspectRatio: 'none',
                    transform: 'rotate(' + this.props.rotation + ' ' + (this.props.x + actWidth / 2.0) + ' ' + (this.props.y + actHeight / 2.0) + ')',
                    onMouseDown: function(e) { e.preventDefault() }
                });
            }
        }

        return React.createElement('g', { }, displayElement, borderBoxes, waitSpin, loadBar);
    }});

    var SVGFile = React.createClass({displayName: 'SVGFile',
    render: function()
    {
        var loadBar = null;
        var waitSpin = null;
        var borderBoxes = [];
        var displayElement;
        var self = this;

        var viewBox = '0 0 ' + this.props.width + ' ' + this.props.height;

        if(this.props.mode == 3 && !this.props.isMoving && !this.props.isResizing)
        {
            if(this.props.isLoading)
            {
                waitSpin = React.createElement(SVGSpinner,
                {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });

                if(this.props.isUploader)
                {
                    loadBar = React.createElement(SVGProgress,
                    {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else
            {
                displayElement = React.createElement('image',
                {
                    x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                    xlinkHref: 'https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/file_image.svg',
                    pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none'
                });
            }

            borderBoxes.push(React.createElement('rect',
            {
                key: 'moveFull', x: this.props.x, y: this.props.y,
                width: this.props.width, height: this.props.height, opacity: 0, cursor: 'move', pointerEvents: 'all',
                onMouseDown: function(e) { self.props.mouseMoveDown(e); }
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'resizeBottom', x1: this.props.x, y1: this.props.y + this.props.height, x2: this.props.x + this.props.width - 1, y2: this.props.y + this.props.height,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, true, false); }
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'resizeRight', x1: this.props.x + this.props.width, y1: this.props.y, x2: this.props.x + this.props.width, y2: this.props.y + this.props.height - 1,
                fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, false, true); }
            }));

            borderBoxes.push(React.createElement('rect',
            {
                key: 'resizeCorner', x: this.props.x + this.props.width - 1, y: this.props.y + this.props.height - 1,
                width: 2, height: 2, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, true, true); }
            }));
        }
        else if(this.props.mode == 2)
        {
            if(this.props.isLoading)
            {
                waitSpin = React.createElement(SVGSpinner,
                {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });

                if(this.props.isUploader)
                {
                    loadBar = React.createElement(SVGProgress,
                    {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else
            {
                displayElement = React.createElement('image',
                {
                    x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                    xlinkHref: 'https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/file_image.svg', preserveAspectRatio: 'none',
                    onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove, onMouseDown: function(e) { e.preventDefault() }
                });
            }
        }
        else
        {
            if(this.props.isLoading)
            {
                waitSpin = React.createElement(SVGSpinner,
                {
                    x: this.props.x, y: this.props.y, size: this.props.width / 2
                });

                if(this.props.isUploader)
                {
                    loadBar = React.createElement(SVGProgress,
                    {
                        x: this.props.x, y: this.props.y, max: 100, value: this.props.percentUp, size: this.props.width / 2
                    });
                }
            }
            else
            {
                displayElement = React.createElement('image',
                {
                    x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
                    xlinkHref: 'https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/file_image.svg', preserveAspectRatio: 'none',
                    onMouseDown: function(e) { e.preventDefault() }
                });
            }
        }

        let text = React.createElement('text',
        {
            key: 'text', className: 'noselect', x: this.props.x, y: this.props.y + this.props.height * 0.6, fontSize: this.props.width * 0.4,
            fill: '#000000'
        }, '.' + this.props.extension);

        return React.createElement('g', { }, displayElement, borderBoxes, waitSpin, loadBar, text);
    }});


    /** Upload Whiteboard Element View.
    *
    * This is the class that will be used to render the element. It must return an SVG tag (which may have embedded tags).
    */
    export class ElementView extends React.Component
    {
        propTypes = {};
        props: ComponentProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            let state = this.props.state as ViewState;
            let dispatcher = this.props.dispatcher;

            let items = [];

            if(state.type == 'circle')
            {
                if(state.mode == BoardModes.ERASE)
                {
                    items.push(React.createElement('circle',
                    {
                        key: 'delete', cx: state.point.x, cy: state.point.y, r: state.size * 3, fill: state.colour,
                        onClick: dispatcher.mouseClick, opacity: 0
                    }));
                }
                else if(state.mode == BoardModes.SELECT)
                {
                    items.push(React.createElement('circle',
                    {
                        key: 'move', cx: state.point.x, cy: state.point.y, r: state.size * 3, fill: state.colour,
                        onMouseDown: dispatcher.mouseDown, opacity: 0, cursor: 'move'
                    }));
                }

                items.push(React.createElement('circle',
                {
                    key: 'display', cx: state.point.x, cy: state.point.y, r: state.size, fill: state.colour, stroke: state.colour,
                    onMouseMove: dispatcher.mouseMove
                }));

                return React.createElement('g', null, items);
            }
            else if(state.type == 'path')
            {
                if(state.mode == BoardModes.ERASE)
                {
                    items.push(React.createElement('path',
                    {
                        key: 'delete', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size * 3, strokeLinecap: 'round',
                        onClick: dispatcher.mouseClick, opacity: 0, pointerEvents: 'stroke'
                    }));
                }
                else if(state.mode == BoardModes.SELECT)
                {
                    items.push(React.createElement('path',
                    {
                        key: 'move', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size * 3, strokeLinecap: 'round',
                        onMouseDown: dispatcher.mouseDown, opacity: 0, cursor: 'move', pointerEvents: 'stroke'
                    }));
                }

                items.push(React.createElement('path',
                {
                    key: 'display', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size, strokeLinecap: 'round',
                    onMouseMove: dispatcher.mouseMove
                }));

                return React.createElement('g', null, items);
            }
            else
            {
                console.error('ERROR: Unrecognized type for SVGBezier.');

                return null;
            }
        }
    }

    /** Upload Whiteboard Mode View.
    *
    * This is the class that will be used to render the mode selection button for this component. Must return a button.
    *
    */
    export class ModeView extends React.Component
    {
        propTypes = {};

        props: ModeProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            if(this.props.mode == MODENAME)
            {
                return React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'draw-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'D');
            }
            else
            {
                return React.createElement('button',
                {
                    className: 'button mode-button', id: 'draw-button', onKeyUp: function(e) { e.preventDefault(); },
                    onClick: () => this.props.dispatcher(MODENAME)
                }, 'D');
            }
        }
    }

    /** Upload Whiteboard Pallete View.
    *
    * This is the class that will be used to render the pallete for this component.
    * This will be displayed when the mode for this component is selected.
    *
    */
    export class PalleteView extends React.Component
    {
        propTypes = {};

        props: PalleteProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            let state = this.props.state as PalleteViewState;
            let dispatcher = this.props.dispatcher;

            let blackButt = React.createElement('button',
            {
                className: 'button colour-button', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({operation: 'COLOUR', newState: 'black'})
            });
            let blueButt  = React.createElement('button',
            {
                className: 'button colour-button', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher('blue')
            });
            let redButt   = React.createElement('button',
            {
                className: 'button colour-button', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher('red')
            });
            let greenButt = React.createElement('button',
            {
                className: 'button colour-button', id: 'green-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher('green')
            });

            let smallButt = React.createElement('button',
            {
                className: 'button mode-button', id: 'small-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({operation: 'SIZE', newState: 0})
            }, 'S');
            let medButt   = React.createElement('button',
            {
                className: 'button mode-button', id: 'medium-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({operation: 'SIZE', newState: 1})
            }, 'M');
            let largeButt = React.createElement('button',
            {
                className: 'button mode-button', id: 'large-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({operation: 'SIZE', newState: 2})
            }, 'L');

            if(state.colour == 'black')
            {
                blackButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == 'blue')
            {
                blueButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == 'red')
            {
                redButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == 'green')
            {
                greenButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'green-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }

            if(state.size == 0)
            {
                smallButt = React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'S');
            }
            else if(state.size == 1)
            {
                medButt = React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'M');
            }
            else if(state.size == 2)
            {
                largeButt = React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'large-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'L');
            }

            let colourCont = React.createElement('div',
            {
                className: 'whiteboard-controlgroup', id: 'whiteboard-colourgroup'
            }, blackButt, blueButt, redButt, greenButt);

            let sizeCont = React.createElement('div',
            {
                className: 'whiteboard-controlgroup', id: 'whiteboard-sizegroup'
            }, smallButt, medButt, largeButt);

            return React.createElement('div', null, colourCont, sizeCont);
        }
    }

    /** Upload Custom Context View.
    *
    * This is the class that will be used to render the additional context menu items for this component.
    * This will be displayed when the mode for this component is selected.
    *
    * Note: Copy, Cut and Paste have standard event handlers in dispatcher. If other context items are desired they must use the custom context event.
    */
    export class CustomContextView extends React.Component
    {
        propTypes = {};

        props: PalleteProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            let state = this.props.state as PalleteViewState;
            let dispatcher = this.props.dispatcher;

            return null;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    // CONTROLLER                                                                                                                                             //
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** Upload Whiteboard Pallete.
    *
    * This is the class that will be used to store the state and control the pallete for this component.
    *
    */
    export class Pallete extends BoardPallete
    {
        public constructor()
        {
            super();
            // return palleteState
        }

        public handleChange(changeMsg: BoardPalleteChange)
        {
            // return newPalleteView
        }
    }

    /** Upload Whiteboard Element.
    *
    * This is the class that will be used to store the state and control elements of this component.
    *
    */
    export class Element extends BoardElement
    {
        // Element Specific Variables
        rotation: number;
        isImage: boolean;
        fType: string;

        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The set of messages to send to the communication server.
        */
        public static createElement( data: CreationData )
        {
            return null;
        }

        placeLocalFile = (mouseX: number, mouseY: number, scaleF: number, panX: number, panY: number, file: File) : void =>
        {
            let x = scaleF * mouseX + panX;
            let y = scaleF * mouseY + panY;
            let width = 200 * scaleF;
            let height = 200 * scaleF;
            let isImage = false;
            let fType = file.name.split('.').pop();

            let mType = file.type;
            let size = file.size;

            console.log('File type is: ' + file.type);

            if(mType.match(/octet-stream/))
            {
                this.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
            }
            else
            {
                isImage = mType.split('/')[0] == 'image' ? true : false;

                if(!isImage)
                {
                    width = 150 * scaleF;
                }

                if(size < 10485760)
                {
                    let localId = this.addFile(x, y, width, height, this.userId, isImage, file.name, file.type, fType, 0, undefined, new Date());

                    this.sendLocalFile(x, y, width, height, file, localId);
                }
                else
                {
                    this.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
                }
            }
        }

        placeRemoteFile = (mouseX: number, mouseY: number, scaleF: number, panX: number, panY: number, url: string) : void =>
        {
            console.log('Remote File Placed');
            let x = scaleF * mouseX + panX;
            let y = scaleF * mouseY + panY;
            let width = 200 * scaleF;
            let height = 200 * scaleF;

            let loc = document.createElement("a");
            loc.href = url;

            let path = loc.pathname;
            let fType = path.split('.').pop();
            let fDesc = '';

            let isImage = false;
            let self = this;

            var request = new XMLHttpRequest();
            request.onreadystatechange = function ()
            {
                if (request.readyState === 4)
                {
                    let type = request.getResponseHeader('Content-Type');
                    let size = parseInt(request.getResponseHeader('Content-Length'));

                    if(size > 10485760)
                    {
                        self.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
                    }
                    else
                    {
                        if(type.match(/octete-stream/))
                        {
                            self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
                        }
                        else
                        {
                            if(type.match(/image/))
                            {
                                isImage = true;
                            }

                            let localId = self.addFile(x, y, width, height, self.userId, isImage, fDesc, fType, fType, 0, undefined, new Date());
                            self.sendRemoteFile(x, y, width, height, url, localId);
                        }
                    }
                }
            };

            request.open('HEAD', url, true);
            request.send(null);
        }

        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        public constructor(id: number, userId: number, x: number, y: number, width: number, height: number, callbacks: ElementCallbacks,
            numPoints: number, curveSet: Array<Point>, colour: string, size: number, serverId?: number, updateTime?: Date)
        {
            super(MODENAME, id, x, y, width, height, callbacks, serverId, updateTime);

            this.numPoints = numPoints;
            this.curveSet = curveSet;
            this.colour = colour;
            this.size = size;
        }



        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // EXPOSED FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**   Generate the view state for this element given the current state. This should not be favoured as it is a slower method to change view states.
         *
         *    @return {viewState} The view state of this element given it's current internal state
         */
        public getCurrentViewState()
        {
            let newCurveView: ViewState;
            if(this.curveSet.length > 1)
            {
                var pathText = this.createCurveText();
                newCurveView = {
                    mode: MODENAME, type: 'path', id: this.id, size: this.size,
                    colour: this.colour, param: pathText, updateTime: this.updateTime, isSelected: false
                };
            }
            else
            {
                newCurveView = {
                    mode: MODENAME, type: 'circle', id: this.id, size: this.size,
                    colour: this.colour, point: this.curveSet[0], updateTime: this.updateTime, isSelected: false
                };
            }

            return newCurveView;
        }

        /**   Generate the message that would be sent to the server to generate this element.
         *
         *    This should be a single message, more messages can be sent once serverId is returned. (see setServerId)
         *
         *    @return {UserMessage} The message to generate this element.
         */
        public getCreationMessage()
        {
            let msg: UserNewCurveMessage =
            {
                localId: this.id, colour: this.colour, num_points: this.curveSet.length, size: this.size,
                x: this.x, y: this.y, width: this.width, height: this.height
            };

            let msgCont: UserMessage = { header: BoardMessageTypes.NEW, payload: msg }

            return msgCont;
        }

        /**   Sets the serverId of this element and returns a list of server messages to send.
         *
         *    @return Array<UserMessage> The set of messages to send to the communication server.
         */
        public setServerId(id: number)
        {
            this.serverId = id;

            let messages: Array<UserMessage> = [];

            // Send the points for this curve.
            for(let i = 0; i < this.curveSet.length; i++)
            {
                let curve = this.curveSet[i];
                let msg : UserNewPointMessage = { num: i, x: curve.x, y: curve.y};
                let msgCont : UserMessage =  { header: MessageTypes.POINT, payload: msg };
                messages.push(msgCont);
            }

            for(let i = 0; i < this.opBuffer.length; i++)
            {
                messages.push(this.opBuffer[i]);
            }

            return messages;
        }

        /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
         *
         *    Change only when sub-components require updating.
         *
         *    @return {ElementEraseReturn} The new view state of this element.
         */
        public erase()
        {
            let retMsgs: Array<UserMessage> = [];
            let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            let retVal: ElementEraseReturn = { serverMessages: [], newViewCentre: centrePos };

            let msg: UserMessage = { header: BoardMessageTypes.DELETE, payload: null };
            retMsgs.push(msg);

            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        }

        /**   Sets this item as not deleted and process any sub-components as required, returning the new view state.
         *
         *    Change only when sub-components require updating.
         *
         *    @return {ElementRestoreReturn} The new view state of this element.
         */
        public restore()
        {
            let retMsgs: Array<UserMessage> = [];
            let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            let retVal: ElementRestoreReturn = { newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos };

            let msg: UserMessage = { header: BoardMessageTypes.RESTORE, payload: null };
            retMsgs.push(msg);

            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        }

        /**   Handle a mouse down event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleMouseDown(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse move event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleMouseMove(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse up event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleMouseUp(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse click event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleMouseClick(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse double click event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleDoubleClick(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch start event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleTouchStart(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch move event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleTouchMove(e: TouchEvent, changeX: number, changeY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch end event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleTouchEnd(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch cancel event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *    @param {ViewComponents} [component] - The type of subcomponent.
         *    @param {number} [subId] - The ID of the subcomponent
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleTouchCancel(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse down event on the board, called when this element is selected.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardMouseDown(e: MouseEvent, x: number, y: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse move event on the board, called when this element is selected.
         *
         *    For Performance reasons avoid sending server messages here unless necessary, wait for mouseUp. Likewise for undo and redo ops, just leave null.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} changeX - The change of the mouse x position, scaled to the SVG zoom.
         *    @param {number} changeY - The change of the mouse y position, scaled to the SVG zoom.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardMouseMove(e: MouseEvent, changeX: number, changeY: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.
            else if(this.currFileMove != -1)
            {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;

                this.moveUpload(this.currFileMove, true, changeX, changeY, new Date());

                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.fileMoved = true;
            }
            else if(this.currFileResize != -1)
            {
                let changeX = (e.clientX - this.prevX) * this.scaleF;
                let changeY = (e.clientY - this.prevY) * this.scaleF;
                let file = this.getUpload(this.currFileResize);

                let newWidth  = this.horzResize ? file.width  + changeX : file.width;
                let newHeight = this.vertResize ? file.height + changeY : file.height;

                this.resizeFile(this.currFileResize, newWidth, newHeight);

                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.fileResized = true;
            }

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse up event on the board, called when this element is selected.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardMouseUp(e: MouseEvent, x: number, y: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch start event on the board, called when this element is selected.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardTouchStart(e: TouchEvent, x: number, y: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch move event on the board, called when this element is selected.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardTouchMove(e: TouchEvent, changeX: number, changeY: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch end event on the board, called when this element is selected.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardTouchEnd(e: TouchEvent, x: number, y: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a touch cancel event on the board, called when this element is selected.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardTouchCancel(e: TouchEvent, x: number, y: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle the start of moving this item.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ViewState} An object containing: the new view state
         */
        public startMove(e: MouseEvent, localX: number, localY: number, palleteState: Pallete)
        {
            let retVal: ComponentViewState = this.currentViewState;
            return retVal;
        }

        /**   Handle a move of this element, called when this element is moved by the user.
         *
         *    This MUST be implemented. DO NOT CHANGE UNLESS NECESSARY.
         *
         *    @param {number} changeX - The expected change in this elements x position.
         *    @param {number} changeY - The expected change in this elements y position.
         *
         *    @return {ElementMoveReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handleMove(changeX: number, changeY: number)
        {
            this.x += changeX;
            this.y += changeY;

            let newView = this.updateView({ x: this.x, y: this.y });

            let serverMsg: UserMessage = { header: BoardMessageTypes.MOVE, payload: { x: changeX, y: changeY } };
            let retVal : ElementMoveReturn = { newView: newView, serverMessages: [serverMsg] };

            if(!this.serverId)
            {
                this.opBuffer.push(serverMsg);
                retVal.serverMessages = [];
            }

            return retVal;
        }

        /**   Handle the end of moving this item.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse up event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ViewState} An object containing: the new view state
         */
        public endMove(e: MouseEvent, localX: number, localY: number, palleteState: Pallete)
        {
            let retVal: ComponentViewState = this.currentViewState;
            return retVal;
        }

        /**   Handle a key press event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleKeyPress(e: KeyboardEvent, input: string, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];

            let retVal: ElementInputReturn =
            {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: false, newViewCentre: null
            };

            if(!this.serverId)
            {
                this.opBuffer.concat(serverMsgs);
                retVal.serverMessages = [];
            }

            return retVal;
        }

        /**   Handle a messages sent from the server to this element.
         *
         *    @param {} message - The server message that was sent.
         *
         *    @return {ElementMessageReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handleServerMessage(message: ServerMessage)
        {
            let newView: ViewState = null;
            let retMsgs: Array<UserMessage> = [];
            let wasEdit = false;
            let wasDelete = false;

            switch(message.header)
            {
                case MessageTypes.POINT:
                    let data = message.payload as ServerNewPointMessage;
                    // Make sure we know about this curve.
                    if(this.numRecieved != this.numPoints)
                    {
                        if(!this.pointInBuffer[data.num])
                        {
                            this.pointInBuffer[data.num] = {x: data.x, y: data.y};
                            this.numRecieved++;
                        }

                        if(this.numRecieved == this.numPoints)
                        {
                            clearInterval(this.pointInTimeout);
                            this.curveSet = this.pointInBuffer;
                            newView = this.getCurrentViewState();
                        }
                    }
                    break;
                case BoardMessageTypes.IGNORE:
                    clearInterval(this.pointInTimeout);
                    wasDelete = true;
                    break;
                case BoardMessageTypes.COMPLETE:
                    while(this.opBuffer.length > 0)
                    {
                        let opMsg: UserMessage;
                        let op = this.opBuffer.shift();

                        opMsg = { header: op.header, payload: op.payload };

                        retMsgs.push(opMsg);
                    }
                    break;
                case MessageTypes.POINTMISSED:
                    let msdata = message.payload as ServerMissedPointMessage;
                    let point = this.curveSet[msdata.num];
                    let msg : UserNewPointMessage = { num: msdata.num, x: point.x, y: point.y};
                    let msgCont : UserMessage =  { header:  MessageTypes.POINT, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                case BoardMessageTypes.DROPPED:
                    wasDelete = true;
                    break;
                case BoardMessageTypes.MOVE:
                    let mvdata = message.payload as ServerMoveElementMessage;
                    this.move(mvdata.x - this.x, mvdata.y - this.y, mvdata.editTime);
                    this.updateTime = mvdata.editTime;
                    break;
                case BoardMessageTypes.DELETE:
                    wasDelete = true;
                    this.isDeleted = true;
                    break;
                case BoardMessageTypes.RESTORE:
                    break;
                default:
                    break;
            }

            let retVal: ElementMessageReturn = { newView: newView, serverMessages: retMsgs, wasEdit: wasEdit, wasDelete: wasDelete };
            return retVal;
        }

        this.socket.on('FILE-START', function(data: ServerNewUploadMessage)
        {
            console.log('Recieved File Start.');
            console.log('File type is: ' + data.fileType);

            let isImage = data.fileType.split('/')[0] == 'image' ? true : false;

            let localId;

            if(data.url)
            {
                console.log('Adding completed file.');
                localId = self.addFile(data.x, data.y, data.width, data.height, data.userId, isImage, data.fileDesc, data.fileType, data.extension, data.rotation, data.url, data.editTime, data.serverId);
            }
            else
            {
                localId = self.addFile(data.x, data.y, data.width, data.height, data.userId, isImage, data.fileDesc, data.fileType, data.extension, data.rotation, undefined, data.editTime, data.serverId);
            }

            console.log('Logging file in dictionary, ServerID: ' + data.serverId + ' LocalID: ' + localId);
            self.uploadDict[data.serverId] = localId;
        });
        this.socket.on('FILEID', function(data: ServerUploadIdMessage)
        {
            console.log('FILEID Received.');
            let file: Upload = self.getUpload(data.localId);

            self.uploadDict[data.serverId] = data.localId;
            file.serverId = data.serverId;

            while(file.opBuffer.length > 0)
            {
                let op = file.opBuffer.shift();

                if(op.message == null)
                {
                    self.socket.emit(op.type, data.serverId);
                }
                else
                {
                    let msg = {};

                    Object.assign(msg, op.message, { serverId: data.serverId });
                    self.socket.emit(op.type, msg);
                }
            }
        });
        this.socket.on('FILE-DATA', function(data: ServerUploadDataMessage)
        {
            console.log('Received Request for more file data.');
            self.sendFileData(data.serverId, data.place, data.percent);
        });
        this.socket.on('FILE-DONE', function(data: ServerUploadEndMessage)
        {
            console.log('Received File Done.');
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.setUploadComplete(localId, data.fileURL);
            }
        });
        this.socket.on('MOVE-FILE', function(data: ServerMoveElementMessage)
        {
            console.log('Recieved move file. ServerID: ' + data.serverId);
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.moveUpload(localId, false, data.x, data.y, data.editTime);
            }

        });
        this.socket.on('RESIZE-FILE', function(data: ServerResizeFileMessage)
        {
            console.log('Recieved resize file.');
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.setUploadArea(localId, data.width, data.height, data.editTime);
            }
        });
        this.socket.on('ROTATE-FILE', function(data: ServerRotateFileMessage)
        {
            console.log('Recieved rotate file.');
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.setUploadRotation(localId, data.rotation);
            }
        });
        this.socket.on('DELETE-FILE', function(serverId: number)
        {
            var localId = self.uploadDict[serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', serverId);
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('ABANDON-FILE', function(serverId: number)
        {
            var localId = self.uploadDict[serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', serverId);
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('FILE-OVERSIZE', function(localId: number)
        {
            self.deleteElement(localId);
            self.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
        });
        this.socket.on('FILE-BADTYPE', function(localId: number)
        {
            self.deleteElement(localId);
            self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
        });

        /**   Handle the selecting of this element that has not been induced by this elements input handles.
         *
         *    @return {ComponentViewState} An object containing: the new view state
         */
        public handleSelect()
        {
            this.isSelected = true;
            this.updateView({ isSelected: true });

            let retVal: ComponentViewState = this.currentViewState;
            return retVal;
        }

        /**   Handle the deselect this element.
         *
         *    @return {ComponentViewState} An object containing: the new view state
         */
        public handleDeselect()
        {
            this.isSelected = false;
            this.updateView({ isSelected: false });

            let retVal: ComponentViewState = this.currentViewState;
            return retVal;
        }

        /**   Handle the copying of data from this element.
         *
         *    @param {ClipboardEvent} e - The clipboard event data associated with the copy event.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         */
        public handleCopy(e: ClipboardEvent, palleteState: Pallete)
        {

        }

        /**   Handle the pasting of data into this element.
         *
         *    @param {ClipboardEvent} e - The clipboard event data associated with the copy event.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handlePaste(e: ClipboardEvent, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**  Handle the cutting of data from this element.
         *
         *    @param {ClipboardEvent} e - The clipboard event data associated with the copy event.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleCut(e: ClipboardEvent, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a custom context event on this component, events are dispatched by the pressing of custom buttons set in the CustomContextView.
         *
         *    @param {ClipboardEvent} e - The clipboard event data associated with the copy event.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleCustomContext(item: CustomContextItems, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Produce a hover info message for this element.
         *
         *    @return {HoverMessage} The data to be displayed in the hover info message for this element
         */
        public handleHover()
        {
            let retVal: HoverMessage = { header: '', message: '' };
            return retVal;
        }

        /**   Handle a change in the pallete for this component. Passed when this element is selected.
         *
         *    @param {BoardPalleteChange} palleteChange - The pallete change to be handled.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handlePalleteChange()
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle the requested audio stream.
         *
         *    @param {MediaStream} stream - The audio stream.
         */
        public audioStream(stream: MediaStream)
        {

        }

        /**   Handle the requested video stream.
         *
         *    @param {MediaStream} stream - The video stream.
         */
        public videoStream(stream: MediaStream)
        {

        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // INTERNAL FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         *
         *
         */
        private move(changeX: number, changeY: number, updateTime: Date)
        {
            this.x += changeX;
            this.y += changeY;

            for(var i = 0; i < this.curveSet.length; i++)
            {
                this.curveSet[i].x += changeX;
                this.curveSet[i].y += changeY;
            }

            let newCurveView : ElementView;

            if(this.curveSet.length > 1)
            {
                let pathText = this.createCurveText();

                newCurveView = Object.assign({}, this.currentViewState, { param: pathText, updateTime: updateTime });
            }
            else
            {
                newCurveView = Object.assign({}, this.currentViewState, { point: this.curveSet[0], updateTime: updateTime });
            }
        }

        addFile = (x: number, y: number, width: number, height: number, userId: number, isImage: boolean, fDesc: string, fType: string, extension: string, rotation: number, url: string = '', updateTime: Date, serverId?: number) : number =>
        {
            let newUpload: Upload =
            {
                type: 'file', id: -1, user: userId, isDeleted: false, serverId: serverId, x: x, y: y, width: width, height: height, isImage: isImage, fType: fType,
                rotation: rotation, opBuffer: [], hoverTimer: null, infoElement: null, updateTime: updateTime
            };

            let localId = this.boardElems.length;
            this.boardElems[localId] = newUpload;
            newUpload.id = localId;

            let isLoading = url == '' ? true : false;
            let isUploader = userId == this.userId || userId == 0 ? true : false;

            let newUploadView : UploadElement =
            {
                id: localId, x: x, y: y, width: width, height: height, isImage: isImage, extension: extension, rotation: rotation,
                URL: url, isLoading: isLoading, isUploader: isUploader, percentUp: 0, type: 'file', updateTime: updateTime, selected: false
            };

            let newElemList = this.viewState.boardElements.set(localId, newUploadView);
            newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

            return localId;
        }

        updateProgress = (id: number, percent: number) : void =>
        {
            var newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
                percentUp: percent
            });

            var newElemList = this.viewState.boardElements.set(id, newFileView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        setUploadComplete = (id: number, fileURL: string) : void =>
        {
            let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
                percentUp: 100, isLoading: false, URL: fileURL
            });

            let newElemList = this.viewState.boardElements.set(id, newFileView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        rotateUpload = (id: number) : void =>
        {
            let file = this.getUpload(id);

            file.rotation += 90;

            if(file.rotation >= 360)
            {
                file.rotation = 0;
            }

            let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
                rotation: file.rotation
            });

            let newElemList = this.viewState.boardElements.set(id, newFileView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        setUploadArea = (id: number, width: number, height: number, updateTime: Date) : void =>
        {
            let file = this.getUpload(id);

            file.height = height;
            file.width = width;

            let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
                width: file.width, height: file.height, updateTime: updateTime
            });

            let newElemList = this.viewState.boardElements.set(id, newFileView);
            newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        setUploadRotation = (id: number, rotation: number) : void =>
        {
            let file = this.getUpload(id);

            file.rotation = rotation;

            let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
                rotation: file.rotation
            });

            let newElemList = this.viewState.boardElements.set(id, newFileView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        sendLocalFile = (posX: number, posY: number, width: number, height: number, file: File, localId: number) : void =>
        {
            let newReader = new FileReader();

            let self = this;
            newReader.onload = function(e)
            {
                let serverId: number = self.getBoardElement(localId).serverId;
                let newDataMsg: UserUploadDataMessage = { serverId: serverId, piece: e.target.result };
                self.socket.emit('FILE-DATA', newDataMsg);
            };

            this.fileUploads[localId] = file;
            this.fileReaders[localId] = newReader;

            let fExtension = file.name.split('.').pop();

            let fileMsg: UserStartUploadMessage = { localId: localId, x: posX, y: posY, width: width, height: height, fileSize: file.size, fileName: file.name, fileType: file.type, extension: fExtension };
            this.socket.emit('FILE-START', fileMsg);
        }

        sendFileData = (serverId: number, place: number, percent: number, attempt: number = 0) : void =>
        {

            let localId = this.uploadDict[serverId];
            if(localId == null || localId == undefined)
            {
                if(attempt < 5)
                {
                    setTimeout(this.sendFileData.bind(this), 1000, serverId, place, percent, ++attempt);
                }
                else
                {
                    this.socket.emit('STOP-FILE', serverId);
                }
            }
            else
            {
                this.updateProgress(localId, percent);
                let file = this.fileUploads[localId];
                let reader = this.fileReaders[localId];
                let nplace = place * 65536;
                let newFile = file.slice(nplace, nplace + Math.min(65536, (file.size - nplace)));

                console.log('Sending File piece: ' + (place + 1) + ' out of ' + (Math.floor(file.size / 65536) + 1));
                reader.readAsArrayBuffer(newFile);
            }
        }

        sendRemoteFile = (posX: number, posY: number, width: number, height: number, url: string, localId: number) : void =>
        {
            console.log('Sending Remote File.');
            let msg: UserRemoteFileMessage = { localId: localId, fileURL: url, x: posX, y: posY, width: width, height: height, fileDesc: '' };
            this.socket.emit('REMOTE-FILE', msg);
        }

        resizeFile = (id: number, width: number, height: number) : void =>
        {
            let file = this.getUpload(id);

            this.setUploadArea(id, width, height, new Date());
        }

        sendFileMove = (id: number) : void =>
        {
            let file = this.getUpload(this.currFileMove);

            if(file.serverId)
            {
                let msg: UserMoveElementMessage = { serverId: file.serverId, x: file.x, y: file.y };
                this.socket.emit('MOVE-FILE', msg);
            }
            else
            {
                let msg: UserMoveElementMessage = { serverId: null, x: file.x, y: file.y };
                let newOp : OperationBufferElement = { type: 'MOVE-FILE', message: msg };
                file.opBuffer.push(newOp);
            }
        }

        sendFileResize = (id: number) : void =>
        {
            let file = this.getUpload(this.currFileResize);

            if(file.serverId)
            {
                let msg: UserResizeFileMessage = {serverId: file.serverId, width: file.width, height: file.height};
                this.socket.emit('RESIZE-FILE', msg);
            }
            else
            {
                let msg: UserResizeFileMessage = { serverId: null, width: file.width, height: file.height };
                let newOp : OperationBufferElement = { type: 'RESIZE-FILE', message: msg };
                file.opBuffer.push(newOp);
            }
        }

        sendFileRotate = (id: number) : void =>
        {
            let file : Upload = this.getUpload(id);

            if(file.serverId)
            {
                let msg : UserRotateFileMessage = { serverId: file.serverId, rotation: file.rotation };
                this.socket.emit('ROTATE-FILE', msg);
            }
            else
            {
                let msg: UserRotateFileMessage = { serverId: null, rotation: file.rotation };
                let newOp : OperationBufferElement = { type: 'ROTATE-FILE', message: msg };
                file.opBuffer.push(newOp);
            }
        }

        deleteFile = (id: number) : void =>
        {
            let fileBox = this.getUpload(id);

            if(fileBox.serverId)
            {
                this.socket.emit('DELETE-FILE', fileBox.serverId);
            }
            else
            {
                let newOp : OperationBufferElement = { type: 'DELETE-FILE', message: null };
                fileBox.opBuffer.push(newOp);
            }
            this.deleteElement(id);
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponent(Upload.MODENAME, Upload.Element, Upload.ElementView, Upload.Pallete, Upload.PalleteView, Upload.ModeView);
