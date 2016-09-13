/** Whiteboard Text Component.
*
* This allows the user to write text and have it rendered as SVG text.
*
*/
namespace WhiteBoardText {
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
    export let MODENAME = 'TEXT';

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        editLock: number;
        styles: Array<TextStyle>;
        text: string;
        justified: boolean;
        textNodes: Array<TextNode>;
        cursor: CursorElement;
        cursorElems: Array<CursorSelection>;
        dist: Array<number>;
        editCount: number;
        size: number;
        waiting: boolean;

        isEditing: boolean;
        isResizing: boolean;
        remEdit: boolean;
        getLock: boolean;
    }

    /**
     * A description of the view state for the pallete of this component.
     * This will be passed from the pallete controller to the view.
     */
    interface PalleteViewState extends BoardPalleteViewState {
        size: number;
        colour: string;
        isBold: boolean;
        isItalic: boolean;
        isULine: boolean;
        isOLine: boolean;
        isTLine: boolean;
        isJustified: boolean;
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
        Resize,
        Interaction
    }

    const enum ResizeComponents {
        Corner,
        Right,
        Bottom
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
        context.clearRect(0, 0, whitElem.width, whitElem.height);

        if(rectWidth > 0 && rectHeight > 0)
        {
            context.beginPath();
            context.strokeStyle = 'black';
            context.setLineDash([5]);
            context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
            context.stroke();
        }
    };

    /** Whiteboard Element View.
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

            var hightLightBoxes = [];
            var borderBoxes = [];
            var selCount = 0;
            var displayElement;
            var self = this;

            var tspanElems = state.textNodes.map(function (textElem : TextNode)
            {
                var styleNodeElems = textElem.styles.map(function (node)
                {
                    if(node.text.match(/\s/))
                    {
                        return React.createElement('tspan', {key: node.key, dx: node.dx}, node.text);
                    }
                    else
                    {
                        return React.createElement('tspan',
                        {
                            key: node.key, fill: node.colour, dx: node.dx, fontWeight: node.weight,
                            fontStyle: node.style, textDecoration: node.decoration
                        }, node.text);
                    }
                });


                return React.createElement('tspan',
                {
                    key: textElem.lineNum, x: textElem.x, y: textElem.y, xmlSpace: 'preserve'}, styleNodeElems
                );
            });


            if(state.mode == 'SELECT' && !state.isMoving && !state.isResizing && !state.remEdit)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'move', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                    onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                }));

                borderBoxes.push(React.createElement('rect',
                {
                    key: 'selBox', x: state.x, y: state.y, width: state.width, height: state.height, fill: 'none',
                    opacity: 0, pointerEvents: 'fill',
                    onClick: (e) => { if(e.detail == 2) { dispatcher.doubleClick(e); } }
                }));
            }

            if(state.cursor)
            {
                hightLightBoxes.push(React.createElement('line',
                {
                    x1: state.cursor.x, y1: state.cursor.y,
                    x2: state.cursor.x, y2: state.cursor.y + state.cursor.height,
                    stroke: 'black', strokeWidth: 1, className: 'blinking', key: 'cursor'
                }));
            }

            if(state.cursorElems)
            {
                for(var i = 0; i < state.cursorElems.length; i++)
                {
                    var selElem = state.cursorElems[i];
                    selCount++;
                    hightLightBoxes.push(React.createElement('rect',
                    {
                        x: selElem.x, y: selElem.y, width: selElem.width, height: selElem.height,
                        fill: '#0066ff', stroke: 'none', fillOpacity: 0.3, key: selCount
                    }));
                }
            }
            if(state.isEditing)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'locEdit', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));

                if(!state.isMoving && !state.isResizing)
                {
                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'moveTop', x1: state.x, y1: state.y, x2: state.x + state.width - state.size * 0.25, y2: state.y,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                    }));

                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'moveLeft', x1: state.x, y1: state.y, x2: state.x, y2: state.y + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                    }));

                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'resizeBottom', x1: state.x, y1: state.y + state.height,
                        x2: state.x + state.width - state.size * 0.25, y2: state.y + state.height,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Bottom); }
                    }));

                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'resizeRight', x1: state.x + state.width, y1: state.y,
                        x2: state.x + state.width, y2: state.y + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Right); }
                    }));

                    borderBoxes.push(React.createElement('rect',
                    {
                        key: 'resizeCorner', x: state.x + state.width - state.size * 0.25,
                        y: state.y  + state.height - state.size * 0.25,
                        width: state.size * 0.5, height: state.size * 0.5, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Corner); }
                    }));
                }
            }
            else if(state.getLock)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'getEdit', x: state.x, y: state.y, width: state.width, height: state.height, fill: 'none',
                    stroke: 'red', strokeWidth: 2
                }));
            }
            else if(state.remEdit)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'remEdit', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', stroke: 'red', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
            }

            if(state.isEditing)
            {
                displayElement = React.createElement('text',
                {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size
                }, tspanElems);
            }
            else if(state.mode == 'SELECT' && !state.isMoving && !state.isResizing)
            {

                displayElement = React.createElement('text',
                {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size
                }, tspanElems);
            }
            else if(state.mode == MODENAME)
            {
                displayElement = React.createElement('text',
                {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size,
                    onClick: (e) => { dispatcher.mouseClick(e, ViewComponents.View); },
                    onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.View); }
                }, tspanElems);
            }
            else
            {
                displayElement = React.createElement('text',
                {
                    className: 'noselect', x: state.x, y: state.y, fontSize: state.size, pointerEvents: 'none'
                }, tspanElems);
            }

            return React.createElement('g', null, hightLightBoxes, displayElement, borderBoxes);
        }
    }

    /** Whiteboard Mode View.
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
            let dispatcher = this.props.dispatcher;

            let textButt      = React.createElement('button', {className: 'button mode-button', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.modeChange(1)}, 'T');
            if(state.mode == 1)
            {
                textButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {} }, 'T');
            }

            return React.createElement('button',
            {
                className: 'button mode-button', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher(MODENAME)
            }, 'T');
        }
    }

    /** Whiteboard Pallete View.
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

            let boldButt;
            let italButt;
            let ulineButt;
            let tlineButt;
            let olineButt;
            let justButt;

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


            if(state.isBold)
            {
                boldButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'bold-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(false)
                }, 'B');
            }
            else
            {
                boldButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'bold-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(true)
                }, 'B');
            }

            if(state.isItalic)
            {
                italButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'italic-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(false)
                }, 'I');
            }
            else
            {
                italButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'italic-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(true)
                }, 'I');
            }

            if(state.isULine)
            {
                ulineButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'uline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(false)
                }, 'U');
            }
            else
            {
                ulineButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'uline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(true)
                }, 'U');
            }
            if(state.isTLine)
            {
                tlineButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'tline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(false)
                }, 'T');
            }
            else
            {
                tlineButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'tline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(true)
                }, 'T');
            }
            if(state.isOLine)
            {
                olineButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'oline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(false)
                }, 'O');
            }
            else
            {
                olineButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'oline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(true)
                }, 'O');
            }

            if(state.isJustified)
            {
                justButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'justify-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(false)
                }, 'J');
            }
            else
            {
                justButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'justify-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.palleteChange(true)
                }, 'J');
            }

            let styleCont = React.createElement('div',
            {
                className: 'whiteboard-controlgroup', id: 'whiteboard-stylegroup'
            }, boldButt, italButt, ulineButt, tlineButt, olineButt, justButt);

            return React.createElement('div', null, colourCont, sizeCont);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    // CONTROLLER                                                                                                                                             //
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** Free Curve Whiteboard Pallete.
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

        boldChange = (newState: boolean) : void =>
        {
            this.setIsBold(newState);
            this.styleChange();
        }

        italicChange = (newState: boolean) : void =>
        {
            this.setIsItalic(newState);
            this.styleChange();
        }

        underlineChange = (newState: boolean) : void =>
        {
            if(newState)
            {
                this.setIsOline(false);
                this.setIsTline(false);
            }

            this.setIsUline(newState);
            this.styleChange();
        }

        overlineChange = (newState: boolean) : void =>
        {
            if(newState)
            {
                this.setIsUline(false);
                this.setIsTline(false);
            }

            this.setIsOline(newState);
            this.styleChange();
        }

        throughlineChange = (newState: boolean) : void =>
        {
            if(newState)
            {
                this.setIsOline(false);
                this.setIsUline(false);
            }

            this.setIsTline(newState);
            this.styleChange();
        }

        justifiedChange = (newState: boolean) : void =>
        {
            this.setJustified(newState);

            if(this.currTextEdit != -1)
            {
                this.setTextJustified(this.currTextEdit, !this.viewState.isJustified);
            }
        }


        getStyle()
        {
            return this.isItalic ? 'italic' : 'normal';
        }

        getWeight()
        {
            return this.isBold ? 'bold' : 'normal';
        }

        getDecoration()
        {
            if(this.isOLine)
            {
                return 'overline'
            }
            else if(this.isTLine)
            {
                return 'line-through'
            }
            else if(this.isULine)
            {
                return 'underline'
            }
            else
            {
                return 'none'
            }
        }

        setIsItalic = (newState: boolean) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { isItalic: newState}));
        }

        setIsOline = (newState: boolean) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { isOLine: newState}));
        }

        setIsUline = (newState: boolean) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { isULine: newState}));
        }

        setIsTline = (newState: boolean) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { isTLine: newState}));
        }

        setIsBold = (newState: boolean) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { isBold: newState}));
        }

        setJustified = (newState: boolean) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { isJustified: newState}));
        }
    }

    /** Free Curve Whiteboard Element.
    *
    * This is the class that will be used to store the state and control elements of this component.
    *
    */
    export class Element extends BoardElement
    {
        // Element Specific Variables
        curveSet: Array<Point> = [];
        colour: string;
        size: number;
        startLeft: boolean = false;
        idealX: number = 0;
        textNodes;
        dist: Array<number> = [];
        text: string = '';
        cursorElems;
        cursor;
        styles;
        isWriting: boolean;
        editLock: boolean;


        /**   Create the set of constructor parameters for this type based on the user input, return null if invalid
        *
        *     @return Array<ComponentUserMessage> The set of messages to send to the communication server.
        */
        public static getCreationParams( data: CreationData )
        {
            return null;
        }

        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        public constructor(  )
        {
            super(MODENAME);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // EXPOSED FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**   Sets the serverId of this element and returns a list of server messages to send.
        *
        *     @return Array<ElementUserMessage> The set of messages to send to the communication server.
        */
        public setServerId(id: number)
        {
            let retVal: Array<ElementUserMessage> = [];
            return retVal;
        }

        /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
        *
        *     @return {ViewState} The new view state of this element.
        */
        public erase()
        {
            return null;
        }

        /**   Sets this item as not deleted and process any sub-components as required, returning the new view state.
        *
        *     @return {ViewState} The new view state of this element.
        */
        public restore()
        {
            return null;
        }

        public handleDeselect()
        {
            // TODO: Stop text editing or trying to get lock.
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleMouseDown(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
            if(state.itemMoving)
            {
                cursorType = 'move';
            }
            else if(state.itemResizing)
            {
                if(state.resizeHorz)
                {
                    if(state.resizeVert)
                    {
                        cursorType = 'nwse-resize';
                    }
                    else
                    {
                        cursorType = 'ew-resize';
                    }
                }
                else
                {
                    cursorType = 'ns-resize';
                }
            }
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleMouseMove(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleMouseUp(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleMouseClick(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleDoubleClick(e: MouseEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            if(this.currTextEdit != -1)
            {
                if(this.currTextEdit != id)
                {
                    this.releaseText(this.currTextEdit);
                    var tbox = this.getText(this.currTextEdit);
                    var lineCount = tbox.textNodes.length;

                    if(lineCount == 0)
                    {
                        lineCount = 1;
                    }

                    if(lineCount * 1.5 * tbox.size < tbox.height)
                    {
                        this.resizeText(this.currTextEdit, tbox.width, lineCount * 1.5 * tbox.size);
                        this.sendTextResize(this.currTextEdit);
                    }
                }
            }
            else
            {
                if(this.isHost || this.userId == textBox.user)
                {
                    this.lockText(id);
                }
            }

            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleTouchStart(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleTouchMove(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleTouchEnd(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleTouchCancel(e: TouchEvent, localX: number, localY: number, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleBoardMouseDown(e: MouseEvent, localX: number, localY: number, palleteState: Pallete)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };

            if(this.currTextEdit > -1)
            {
                let textBox = this.getText(this.currTextEdit);

                this.cursorStart = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.changeTextSelect(this.currTextEdit, true);
            }

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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleBoardMouseMove(e: MouseEvent, changeX: number, changeY: number, palleteState: Pallete)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
            if(this.currTextResize != -1)
            {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;
                var tbox = this.getText(this.currTextResize);

                var newWidth  = this.horzResize ? tbox.width  + changeX : tbox.width;
                var newHeight = this.vertResize ? tbox.height + changeY : tbox.height;

                this.resizeText(this.currTextResize, newWidth, newHeight);

                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textResized = true;
            }
            else if(this.currTextMove != -1)
            {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;

                this.moveTextbox(this.currTextMove, true, changeX, changeY, new Date());
                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textMoved = true;
            }
            else if(this.currTextSel != -1)
            {
                var textBox = this.getText(this.currTextEdit);
                var newLoc = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);

                if(this.textDown < newLoc)
                {
                    this.cursorStart = this.textDown;
                    this.cursorEnd = newLoc;
                    this.startLeft = true;
                }
                else
                {
                    this.cursorStart = newLoc;
                    this.cursorEnd = this.textDown;
                    this.startLeft = false;
                }

                this.changeTextSelect(this.currTextSel, true);
            }

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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleBoardMouseUp(e: MouseEvent, localX: number, localY: number, palleteState: Pallete)
        {
            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
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

            let serverMsg: ElementUserMessage = { header: 'MOVE', payload: { x: changeX, y: changeY } };
            let retVal : ElementMoveReturn = { newView: newView, serverMessages: [serverMsg] };

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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleKeyPress(e: KeyboardEvent, input: string, palleteState: Pallete)
        {
            if(this.isWriting)
            {
                e.preventDefault();
                e.stopPropagation();
                var textItem: WhiteBoardText;
                var i: number;
                var line: TextNode;
                var style: StyleNode;


                switch(inputChar)
                {

                case 'ArrowLeft':
                    textItem = this.getText(this.currTextEdit);

                    var newStart = this.cursorStart;
                    var newEnd = this.cursorEnd;

                    if(this.cursorStart == this.cursorEnd || !this.startLeft)
                    {
                        if(this.cursorStart > 0)
                        {
                            if(e.ctrlKey)
                            {
                                i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
                                while(i > 0 && !textItem.text.charAt(i - 1).match(/\s/))
                                {
                                    i--;
                                }

                                newStart = i;
                            }
                            else
                            {
                                if(newStart > 0)
                                {
                                    newStart--;
                                }
                            }
                        }
                    }
                    else
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorEnd > 0 ? this.cursorEnd - 1 : 0;
                            while(i > 0 && !textItem.text.charAt(i - 1).match(/\s/))
                            {
                                i--;
                            }

                            newEnd = i;
                        }
                        else
                        {
                            if(newEnd > 0)
                            {
                                newEnd--;
                            }
                        }
                    }

                    if(e.shiftKey)
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.startLeft = false;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if(newStart > newEnd)
                        {
                            this.startLeft = false;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else
                        {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                    }
                    else
                    {
                        this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                        this.cursorEnd = this.cursorStart;
                    }

                    this.changeTextSelect(this.currTextEdit, true);
                    break;
                case 'ArrowRight':
                    textItem = this.getText(this.currTextEdit);

                    var newStart = this.cursorStart;
                    var newEnd = this.cursorEnd;

                    if(this.cursorStart == this.cursorEnd || this.startLeft)
                    {
                        if(this.cursorEnd < textItem.text.length)
                        {
                            if(e.ctrlKey)
                            {
                                i = this.cursorEnd + 1;
                                while(i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/)))
                                {
                                    i++;
                                }

                                newEnd = i;
                            }
                            else
                            {
                                if(newEnd < textItem.text.length)
                                {
                                    newEnd++;
                                }
                            }
                        }
                    }
                    else
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorStart < textItem.text.length ? this.cursorStart + 1 : textItem.text.length;
                            while(i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/)))
                            {
                                i++;
                            }

                            newStart = i;
                        }
                        else
                        {
                            if(newStart < textItem.text.length)
                            {
                                newStart++;
                            }
                        }
                    }

                    if(e.shiftKey)
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.startLeft = true;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if(newStart > newEnd)
                        {
                            this.startLeft = true;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else
                        {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                    }
                    else
                    {
                        this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                        this.cursorEnd = this.cursorStart;
                    }

                    this.changeTextSelect(this.currTextEdit, true);
                    break;
                case 'ArrowUp':
                    textItem = this.getText(this.currTextEdit);

                    var newStart: number;
                    var newEnd: number;

                    if(e.ctrlKey)
                    {
                        if(this.startLeft && this.cursorStart != this.cursorEnd)
                        {
                            i = this.cursorEnd - 1;
                            while(i > 0 && !textItem.text.charAt(i - 1).match('\n'))
                            {
                                i--;
                            }

                            if(i < 0)
                            {
                                i = 0;
                            }

                            newStart = this.cursorStart;
                            newEnd = i;
                        }
                        else
                        {
                            i = this.cursorStart - 1;
                            while(i > 0 && !textItem.text.charAt(i - 1).match('\n'))
                            {
                                i--;
                            }

                            if(i < 0)
                            {
                                i = 0;
                            }

                            newStart = i;
                            newEnd = this.cursorEnd;
                        }
                    }
                    else
                    {
                        if(this.startLeft && this.cursorStart != this.cursorEnd)
                        {
                            newStart = this.cursorStart;
                            // If the cursor is on the first line do nothng
                            if(this.cursorEnd <= textItem.textNodes[0].end)
                            {
                                newEnd = this.cursorEnd;
                            }
                            else
                            {
                                newEnd = this.findXHelper(textItem, true, this.cursorEnd);
                            }
                        }
                        else
                        {
                            newEnd = this.cursorEnd;

                            if(this.cursorStart <= textItem.textNodes[0].end)
                            {
                                newStart = this.cursorStart;
                            }
                            else
                            {
                                newStart = this.findXHelper(textItem, true, this.cursorStart);
                            }
                        }
                    }

                    if(e.shiftKey)
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.startLeft = false;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if(newEnd < newStart)
                        {
                            this.startLeft = false;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else
                        {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                    }
                    else
                    {
                        if(this.startLeft && this.cursorStart != this.cursorEnd)
                        {
                            this.cursorStart = newEnd;
                        }
                        else
                        {
                            this.cursorStart = newStart;
                        }
                        this.cursorEnd = this.cursorStart;
                    }

                    this.changeTextSelect(this.currTextEdit, false);
                    break;
                case 'ArrowDown':
                    textItem = this.getText(this.currTextEdit);

                    var newStart: number;
                    var newEnd: number;

                    if(e.ctrlKey)
                    {
                        if(this.startLeft || this.cursorStart == this.cursorEnd)
                        {
                            i = this.cursorEnd + 1;
                            while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                            {
                                i++;
                            }

                            newStart = this.cursorStart;
                            newEnd = i;
                        }
                        else
                        {
                            i = this.cursorStart + 1;
                            while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                            {
                                i++;
                            }

                            newStart = i;
                            newEnd = this.cursorEnd;
                        }
                    }
                    else
                    {
                        if(this.startLeft || this.cursorStart == this.cursorEnd)
                        {
                            newStart = this.cursorStart;
                            // If the cursor is on the last line do nothng
                            if(this.cursorEnd >= textItem.textNodes[textItem.textNodes.length - 1].start)
                            {
                                newEnd = this.cursorEnd;
                            }
                            else
                            {
                                newEnd = this.findXHelper(textItem, false, this.cursorEnd);
                            }
                        }
                        else
                        {
                            newEnd = this.cursorEnd;

                            if(this.cursorStart >= textItem.textNodes[textItem.textNodes.length - 1].start)
                            {
                                newStart = this.cursorStart;
                            }
                            else
                            {
                                newStart = this.findXHelper(textItem, false, this.cursorStart);
                            }
                        }
                    }

                    if(e.shiftKey)
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.startLeft = true;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if(newEnd < newStart)
                        {
                            this.startLeft = true;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else
                        {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                    }
                    else
                    {
                        if(this.startLeft || this.cursorStart == this.cursorEnd)
                        {
                            this.cursorStart = newEnd;
                        }
                        else
                        {
                            this.cursorStart = newStart;
                        }
                        this.cursorEnd = this.cursorStart;
                    }

                    this.changeTextSelect(this.currTextEdit, false);
                    break;
                case 'Backspace':
                    textItem = this.getText(this.currTextEdit);

                    if(this.cursorEnd > 0)
                    {
                        if(e.ctrlKey)
                        {
                            if(this.cursorStart > 0)
                            {
                                // TODO: Move to start of previous word
                            }
                        }
                        else
                        {
                            if(this.cursorStart == this.cursorEnd)
                            {
                                this.cursorStart--;
                            }

                            let start = this.cursorStart;
                            let end = this.cursorEnd;
                            this.cursorEnd = this.cursorStart;

                            this.insertText(textItem, start, end, '');
                        }
                    }
                    break;
                case 'Enter':
                    inputChar = '\n';
                default:
                    textItem = this.getText(this.currTextEdit);


                        let start = this.cursorStart;
                        let end = this.cursorEnd;
                        this.cursorStart++;
                        this.cursorEnd = this.cursorStart;

                        this.insertText(textItem, start, end, inputChar);
                    }
                    break;
                }
            }

            let retVal: ElementInputReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [], palleteChanges: [], isSelected: false };
            return retVal;
        }

        /**   Handle a key press event on this element or one of it's sub-components.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *
         *    @return {ElementMessageReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handleServerMessage(message)
        {
            let retVal: ElementMessageReturn = { newView: null, serverMessages: [], wasEdit: false };
            return retVal;
        }

        /**   Redo the last undone internal state edit
         *
         *    @return {ElementUndoRedoReturn} An object containing: the new view state
         *    required changes to the pallete state
         */
        public handleDeselect()
        {
            this.isSelected = false;
            this.updateView({ isSelected: false });

            let retVal: ComponentViewState = this.currentViewState;
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
         *    @return {ElementPalleteReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handlePalleteChange()
        {
            let retVal: ElementPalleteReturn = { newView: null, undoOp: () => {}, redoOp: () => {}, serverMessages: [] };
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

        public handleCopy(e: ClipboardEvent)
        {
            if(this.isWriting && this.cursorStart != this.cursorEnd)
            {
                let textItem = this.getText(this.currTextEdit);

                e.clipboardData.setData('text/plain', textItem.text.substring(this.cursorStart, this.cursorEnd));
            }
        }

        public handlePaste(e: ClipboardEvent)
        {
            if(this.isWriting)
            {
                let textItem = this.getText(this.currTextEdit);
                let data = e.clipboardData.getData('text/plain');

                this.insertText(textItem, this.cursorStart, this.cursorEnd, data);

                this.cursorStart = this.cursorStart + data.length;
                this.cursorEnd = this.cursorStart;

                this.changeTextSelect(this.currTextEdit, true);
            }
        }

        public handleCut()
        {

        }

        public handleCustomContext()
        {

        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // INTERNAL FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        addTextbox(x: number, y: number, width: number, height: number, size: number, justified: boolean, userId: number, editLock: number, updateTime: Date, serverId?: number)
        {
            let localId: number;
            let remLock: boolean;

            let newText : WhiteBoardText;

            if(localId == null || localId == undefined)
            {
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
            else
            {
                // TODO: This is a conflict?
                newText = this.getText(localId);
            }

            if(editLock == this.userId)
            {
                remLock = false;
                if(this.currTextEdit == -1)
                {
                    this.currTextEdit = localId;
                    this.currTextSel = localId;

                    this.cursorStart = newText.text.length;
                    this.cursorEnd = newText.text.length;
                    this.gettingLock = -1;
                    this.isWriting = true;

                    this.changeTextSelect(localId, true);
                    this.setMode(1);
                }
                else if(this.currTextEdit != localId)
                {
                    this.releaseText(localId);
                }
            }
            else if(editLock != 0)
            {
                remLock = true;
            }

            let newView : TextElement = {
                x: newText.x, y: newText.y, width: newText.width, height: newText.height, isEditing: false, remLock: remLock, getLock: false, textNodes: [],
                cursor: null, cursorElems: [], id: localId, type: 'text', size: newText.size, waiting: false, updateTime: updateTime, selected: false
            };

            let newElemList = this.viewState.boardElements.set(localId, newView);
            newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

            return localId;
        }

        setColour = (newColour: string) : void =>
        {
            this.updateView(Object.assign({}, this.viewState, { colour: newColour}));
        }

        stopLockText(id: number)
        {
            this.gettingLock = -1;
            this.currTextEdit = -1;
            this.currTextSel = -1;
            this.isWriting = false;

            this.editLock = 0;
            this.cursor = null;
            this.cursorElems = [];

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: false, isEditing: false, cursor: null, cursorElems: []});
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        setTextGetLock = (id: number) : void =>
        {
            this.gettingLock = id;

            let tbox = this.getText(id);

            tbox.editLock = this.userId;
            this.cursorStart = tbox.text.length;
            this.cursorEnd = tbox.text.length;
            this.isWriting = true;

            this.changeTextSelect(id, true);

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: true});
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        changeTextSelect = (id: number, setIdeal: boolean) : void =>
        {
            let tbox = this.getText(id);

            if(setIdeal)
            {
                if(this.startLeft)
                {
                    this.textIdealX = this.findXPos(tbox, this.cursorEnd);
                }
                else
                {
                    this.textIdealX = this.findXPos(tbox, this.cursorStart);
                }
            }

            this.findCursorElems(tbox, this.cursorStart, this.cursorEnd);

            if(tbox.styles.length > 0)
            {
                let i = 0;

                while(i < tbox.styles.length && tbox.styles[i].start > this.cursorStart || tbox.styles[i].end < this.cursorStart)
                {
                    i++;
                }

                let isBold = tbox.styles[i].weight == 'bold';
                let isItalic = tbox.styles[i].style == 'italic';
                let isOLine = tbox.styles[i].decoration == 'overline';
                let isULine = tbox.styles[i].decoration == 'underline';
                let isTLine = tbox.styles[i].decoration == 'line-through';

                this.updateView(Object.assign({}, this.viewState, { colour: tbox.styles[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine }));
            }

            let newTextViewCurr : TextElement = Object.assign({}, this.getViewElement(id), {cursor: tbox.cursor, cursorElems: tbox.cursorElems});

            let newElemList = this.viewState.boardElements.set(id, newTextViewCurr);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        setTextEdit = (id: number) : void =>
        {
            this.currTextEdit = id;
            this.currTextSel  = id;

            let tbox = this.getText(id);

            tbox.editLock = this.userId;
            this.cursorStart = tbox.text.length;
            this.cursorEnd = tbox.text.length;
            this.gettingLock = -1;
            this.isWriting = true;

            this.changeTextSelect(id, true);

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: false, isEditing: true});
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, {mode: 1, boardElements: newElemList}));
        }

        setTextLock = (id: number, userId: number) : void =>
        {
            let tbox = this.getText(id);
            tbox.editLock = userId;

            if(userId != this.userId)
            {
                let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {remLock: true});
                let newElemList = this.viewState.boardElements.set(id, newTextView);
                this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
            }
        }

        setTextUnLock = (id: number) : void =>
        {
            let tbox = this.getText(id);
            tbox.editLock = 0;

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), { remLock: false });
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        setTextJustified = (id: number, state: boolean) : void =>
        {
            let textBox = this.getText(id);

            textBox.justified = state;
            textBox.textNodes = this.calculateTextLines(textBox);

            if(this.currTextSel == id)
            {
                if(this.startLeft)
                {
                    this.textIdealX = this.findXPos(textBox, this.cursorEnd);
                }
                else
                {
                    this.textIdealX = this.findXPos(textBox, this.cursorStart);
                }

                this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
            }

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
                textNodes: textBox.textNodes, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList }));

            this.sendTextJustified(id);
        }

        setTextArea = (id: number, width: number, height: number) : void =>
        {
            let textBox = this.getText(id);

            textBox.height = height;

            if(textBox.width != width)
            {
                textBox.width = width;
                textBox.textNodes = this.calculateTextLines(textBox);
            }

            if(this.currTextSel == id)
            {
                this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
            }

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
                textNodes: textBox.textNodes, width: textBox.width, height: textBox.height, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        moveTextbox = (id: number, isRelative: boolean, x: number, y: number, updateTime: Date) : void =>
        {
            let textBox = this.getText(id);
            let changeX;
            let changeY;

            if(isRelative)
            {
                changeX = x;
                changeY = y;
            }
            else
            {
                changeX = x - textBox.x;
                changeY = y - textBox.y;
            }

            textBox.x += changeX;
            textBox.y += changeY

            for(let i = 0; i < textBox.textNodes.length; i++)
            {
                var node = textBox.textNodes[i];
                node.x += changeX;
                node.y += changeY;
            }

            if(this.currTextSel == id)
            {
                this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
            }

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
                textNodes: textBox.textNodes, x: textBox.x, y: textBox.y, cursor: textBox.cursor, cursorElems: textBox.cursorElems, updateTime: updateTime
            });
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        startTextWait = (id: number) : void =>
        {
            let textItem: WhiteBoardText = this.getText(id);

            textItem.waiting = true;

            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
                waiting: true
            });
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        updateText = (newText: WhiteBoardText) : void =>
        {
            newText.textNodes = this.calculateTextLines(newText);

            if(this.currTextSel == newText.id)
            {
                this.findCursorElems(newText, this.cursorStart, this.cursorEnd);
            }

            newText.waiting = false;

            var newTextView : TextElement = Object.assign({}, this.getViewElement(newText.id), {
                textNodes: newText.textNodes, width: newText.width, height: newText.height, cursor: newText.cursor, cursorElems: newText.cursorElems, waiting: false
            });
            var newElemList = this.viewState.boardElements.set(newText.id, newTextView);
            newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }

        /**
         *
         *    @param {number} loc -
         */
        private findXPos(loc: number)
        {
            if(this.textNodes.length == 0)
            {
                return 0;
            }

            var i = 1;
            while(i < this.textNodes.length && this.textNodes[i].start <= loc)
            {
                i++
            }

            var line = this.textNodes[i - 1];

            if(line.styles.length == 0)
            {
                return 0;
            }

            i = 1;
            while(i < line.styles.length && line.styles[i].locStart + line.start <= loc)
            {
                i++
            }

            var style = line.styles[i - 1];

            if(line.start + style.locStart == loc)
            {
                return style.startPos;
            }
            else
            {
                var currMes = this.dist[loc] - this.dist[line.start + style.locStart];

                return currMes + style.startPos;
            }
        }

        /**
         *
         *    @param
         */
        private findTextPos(x: number, y: number)
        {
            var whitElem  = document.getElementById("whiteBoard-output");
            var elemRect = whitElem.getBoundingClientRect();
            var xFind = 0;

            if(y < this.y)
            {
                return 0;
            }
            else
            {
                var lineNum = Math.floor(((y - this.y) / (1.5 * this.size)) + 0.15);

                if(lineNum >= this.textNodes.length)
                {
                    return this.text.length;
                }

                if(!this.textNodes[lineNum])
                {
                    console.log('Line is: ' + lineNum);
                }

                if(x > this.x)
                {
                    if(x > this.x + this.width)
                    {
                        return this.textNodes[lineNum].end;
                    }
                    else
                    {
                        xFind = x - this.x;
                    }
                }
                else
                {
                    return this.textNodes[lineNum].start;
                }

                var line = this.textNodes[lineNum];

                if(line.styles.length == 0)
                {
                    return line.start;
                }


                var i = 0;
                while(i < line.styles.length && xFind > line.styles[i].startPos)
                {
                    i++;
                }

                var curr = i - 1;
                var style = line.styles[i - 1];


                i = style.text.length - 1;

                var currMes = this.dist[line.start + style.locStart + style.text.length - 1] - this.dist[line.start + style.locStart];

                while(i > 0 && style.startPos + currMes > xFind)
                {
                    i--;
                    currMes = this.dist[line.start + style.locStart + i] - this.dist[line.start + style.locStart];
                }

                // i and currMes is now the position to the right of the search point.
                // We just need to check if left or right is closer then reurn said point.
                var selPoint;

                if(i < style.text.length - 1)
                {
                    if(xFind - (style.startPos + currMes) > (style.startPos + this.dist[line.start + style.locStart + i + 1] - this.dist[line.start + style.locStart]) - xFind)
                    {
                        selPoint = line.start + style.locStart + i + 1;
                    }
                    else
                    {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                else if(curr + 1 < line.styles.length)
                {

                    if(xFind - (style.startPos + currMes) > line.styles[curr + 1].startPos - xFind)
                    {
                        selPoint = line.start + line.styles[curr + 1].locStart;
                    }
                    else
                    {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                else
                {
                    if(xFind - (style.startPos + currMes) > (style.startPos + this.dist[line.start + style.locStart + i + 1] - this.dist[line.start + style.locStart]) - xFind)
                    {
                        selPoint = line.start + style.locStart + i + 1;
                    }
                    else
                    {
                        selPoint = line.start + style.locStart + i;
                    }
                }

                return selPoint;
            }
        }

        /**
         *
         *    @param
         */
        private findCursorElems(cursorStart: number, cursorEnd: number)
        {
            this.cursorElems = [];

            if(this.textNodes.length == 0)
            {
                this.cursor = { x: this.x, y: this.y, height: 1.5 * this.size };
            }

            for(var i = 0; i < this.textNodes.length; i++)
            {
                var line: TextNode = this.textNodes[i];
                var selStart: number = null;
                var selEnd: number = null;
                var startFound: boolean = false;
                var endFound: boolean = false;

                if(cursorStart >= line.start && cursorStart <= line.end)
                {
                    if(cursorStart == line.end && !line.endCursor)
                    {
                        selStart = this.width;
                    }
                    else
                    {
                        for(var j = 0; j < line.styles.length && !startFound; j++)
                        {
                            var style: StyleNode = line.styles[j];

                            selStart = 0;
                            selStart += style.dx;

                            if(cursorStart <= line.start + style.locStart + style.text.length)
                            {
                                startFound = true;
                                selStart += style.startPos + this.dist[cursorStart] - this.dist[line.start + style.locStart];
                            }
                        }
                    }
                }
                else if(cursorStart < line.start && cursorEnd > line.start)
                {
                    selStart = 0;
                }

                if(cursorEnd > line.start && cursorEnd <= line.end)
                {
                    if(cursorEnd == line.end && !line.endCursor)
                    {
                        selEnd = this.width;
                    }
                    else
                    {
                        for(var j = 0; j < line.styles.length && !endFound; j++)
                        {
                            var style: StyleNode = line.styles[j];

                            selEnd = 0;
                            selEnd += style.dx;

                            if(cursorEnd <= line.start + style.locStart + style.text.length)
                            {
                                endFound = true;
                                selEnd += style.startPos + this.dist[cursorEnd] - this.dist[line.start + style.locStart];
                            }
                        }
                    }
                }
                else if(cursorEnd >= line.end  && cursorStart <= line.end)
                {
                    selEnd = this.width;
                }

                if(cursorEnd >= line.start && cursorEnd <= line.end && (this.startLeft || cursorStart == cursorEnd) && line.start != line.end)
                {
                    if(cursorEnd != line.end || line.endCursor)
                    {
                        this.cursor = { x: this.x + selEnd, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
                    }
                }
                else if(cursorStart >= line.start && cursorStart <= line.end && (!this.startLeft || cursorStart == cursorEnd))
                {
                    if(cursorStart != line.end || line.endCursor)
                    {
                        this.cursor = { x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
                    }
                }

                if(selStart != null && selEnd != null && cursorStart != cursorEnd)
                {
                    this.cursorElems.push({ x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, width: selEnd - selStart, height: 1.5 * this.size });
                }
            }
        }

        /**
         *
         *    @param
         */
        private calculateLengths(start: number, end: number, prevEnd: number)
        {
            var whitElem  = document.getElementById("whiteBoard-output");
            var tMount: SVGTextElement;
            var startPoint: number;
            var styleNode: SVGTSpanElement;
            var change: number = 0;
            var style: number = 0;
            var oldDist: Array<number> = this.dist.slice();

            while(style - 1 < this.styles.length && this.styles[style].end <= start - 2)
            {
                style++;
            }

            if(start > 1)
            {
                // Calculate the start point taking into account the kerning.
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

                if(this.styles[style].end <= start - 1)
                {
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

                // Calculate the start dist from start point with it's combined length of the previous character
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

                if(this.styles[style].end <= start)
                {
                    style++;
                }

                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
                styleNode.appendChild(document.createTextNode(this.text.charAt(start)));
                tMount.appendChild(styleNode);

                this.dist[start + 1] = startPoint + tMount.getComputedTextLength();
            }
            else if(start > 0)
            {
                startPoint = 0;
                if(this.styles[style].end <= start - 1)
                {
                    style++;
                }

                // Calculate the start dist from start point with it's combined length of the previous character
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

                if(this.styles[style].end <= start)
                {
                    style++;
                }

                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
                styleNode.appendChild(document.createTextNode(this.text.charAt(start)));
                tMount.appendChild(styleNode);

                this.dist[start + 1] = startPoint + tMount.getComputedTextLength();
            }
            else
            {
                startPoint = 0;
                style = 0;

                // Just use the very first character, no extra calculation required.
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


            for(var i = start + 1; i < end; i++)
            {
                if(this.styles[style].end <= i)
                {
                    style++;
                }

                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
                styleNode.appendChild(document.createTextNode(this.text.charAt(i)));
                tMount.appendChild(styleNode);

                this.dist[i + 1] = startPoint + tMount.getComputedTextLength();
            }


            if(end < this.text.length)
            {
                if(this.styles[style].end <= end)
                {
                    style++;
                }

                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", this.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", this.styles[style].weight);
                styleNode.appendChild(document.createTextNode(this.text.charAt(end)));
                tMount.appendChild(styleNode);

                change = startPoint + tMount.getComputedTextLength() - oldDist[prevEnd + 1];

                for(var i = end; i < this.text.length; i++)
                {
                    this.dist[i + 1] = oldDist[i + 1 + prevEnd - end] + change;
                }
            }
            whitElem.removeChild(tMount);
        }

        private calculateTextLines()
        {
            let i: number;
            var childText = [];
            var currPos: number = 0;
            var prevPos: number = 0;
            var txtStart: number = 0;
            var isWhiteSpace = true;
            var dy: number = this.size;
            var ddy: number = 1.5 * this.size;
            var nodeCounter: number;
            var computedTextLength: number;
            var wordC: number;
            var spaceC: number;
            var line: string;
            var wordsT: Array<string> = [];
            var spacesT: Array<string> = [];
            var startSpace: boolean = true;
            var currY: number = this.y;
            var lineCount: number = 0;

            if(!this.text.length)
            {
                return [];
            }

            for(i = 0; i < this.text.length; i++)
            {
                if(isWhiteSpace)
                {
                    if(!this.text.charAt(i).match(/\s/))
                    {
                        if(i > 0)
                        {
                            spacesT.push(this.text.substring(txtStart, i));
                            txtStart = i;
                            isWhiteSpace = false;
                        }
                        else
                        {
                            startSpace = false;
                            isWhiteSpace = false;
                        }
                    }
                }
                else
                {
                    if(this.text.charAt(i).match(/\s/))
                    {
                        wordsT.push(this.text.substring(txtStart, i));
                        txtStart = i;
                        isWhiteSpace = true;
                    }
                }
            }

            if(isWhiteSpace)
            {
                spacesT.push(this.text.substring(txtStart, i));
            }
            else
            {
                wordsT.push(this.text.substring(txtStart, i));
            }

            wordC = 0;
            spaceC = 0;
            nodeCounter = 0;

            var nLineTrig: boolean;

            while(wordC < wordsT.length || spaceC < spacesT.length)
            {
                var lineComplete: boolean = false;
                var word: string;

                currY += dy;
                var currLength = 0;
                var tspanEl : TextNode = {
                    styles: [], x: this.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                    justified: this.justified, lineNum: lineCount, text: ''
                };
                var progPos = true;

                nLineTrig = false;

                if(startSpace)
                {
                    var fLine = spacesT[spaceC].indexOf('\n');
                    if(fLine != -1)
                    {
                        if(spacesT[spaceC].length > 1)
                        {
                            if(fLine == 0)
                            {
                                nLineTrig = true;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                            }
                            else
                            {
                                progPos = false;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                            }
                        }
                        else
                        {
                            nLineTrig = true;
                            startSpace = !startSpace;
                        }
                    }

                    if(spaceC >= spacesT.length)
                    {
                        console.error('ERROR: Space array out of bounds');
                        return [];
                    }

                    word = spacesT[spaceC];
                    spaceC++;
                }
                else
                {
                    if(wordC >= wordsT.length)
                    {
                        console.error('ERROR: Word array out of bounds');
                        return [];
                    }
                    word = wordsT[wordC];
                    wordC++;
                }

                if(nLineTrig)
                {
                    word = '';
                    lineComplete = true;
                    tspanEl.justified = false;
                    tspanEl.end = currPos;
                    currPos++;
                    prevPos = currPos;
                }

                computedTextLength = this.dist[currPos + word.length] - this.dist[currPos];

                if(computedTextLength > this.width)
                {
                    // Find a place that splits it to fit, check for dashes
                    lineComplete = true;

                    fDash = word.indexOf('-');

                    if(fDash != -1 && computedTextLength > this.width)
                    {
                        // Split the string at dash, use the bit before the dash
                        var newStr = word.substring(fDash + 1, word.length);
                        // Insert the new string into the words array after current position
                        wordsT.splice(wordC, 0, newStr);
                        word = word.substring(0, fDash + 1);
                    }

                    // Work backwards to find the overflow split
                    i = word.length;
                    while(computedTextLength > this.width && i > 0)
                    {
                        computedTextLength = this.dist[currPos + word.substring(0, i).length] - this.dist[currPos];
                        i--;
                    }

                    // Add to buffer
                    if(computedTextLength <= this.width)
                    {
                        // Insert the new string into the words array after current position
                        if(startSpace)
                        {
                            if(i + 2 < word.length)
                            {
                                spacesT.splice(spaceC, 0, word.substring(i + 2, word.length));
                            }
                            else
                            {
                                startSpace = !startSpace;
                            }
                            word = word.substring(0, i + 1);
                            currPos += word.length;
                            tspanEl.end = currPos;
                            prevPos = currPos + 1;
                        }
                        else
                        {
                            wordsT.splice(wordC, 0, word.substring(i + 1, word.length));
                            word = word.substring(0, i + 1);
                            currPos += word.length;
                            tspanEl.end = currPos;
                            tspanEl.endCursor = false;
                            prevPos = currPos;
                        }
                    }
                    else
                    {
                        console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                    }
                }
                else
                {
                    currPos += word.length;

                    if(!nLineTrig && progPos)
                    {
                        startSpace = !startSpace;
                    }
                }

                line = word;
                currLength = computedTextLength;

                while(!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length))
                {
                    // Loop to finish line
                    if(startSpace)
                    {
                        var fLine = spacesT[spaceC].indexOf('\n');
                        if(fLine != -1)
                        {
                            if(spacesT[spaceC].length > 1)
                            {
                                if(fLine == 0)
                                {
                                    nLineTrig = true;
                                    spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                    spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                                }
                                else
                                {
                                    progPos = false;
                                    spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                    spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                                }
                            }
                            else
                            {
                                nLineTrig = true;
                                startSpace = !startSpace;
                            }
                        }

                        word = spacesT[spaceC];
                    }
                    else
                    {
                        word = wordsT[wordC];
                    }

                    if(nLineTrig)
                    {
                        word = '';
                        lineComplete = true;
                        tspanEl.justified = false;
                        tspanEl.end = currPos;
                        currPos++;
                        prevPos = currPos;
                    }

                    computedTextLength = currLength + this.dist[currPos + word.length] - this.dist[currPos];

                    if(computedTextLength > this.width)
                    {
                        lineComplete = true;

                        if(startSpace)
                        {
                            if(word.length > 1)
                            {
                                // Split the space add other to stack
                                i = word.length - 1;
                                while(computedTextLength > this.width && i > 0)
                                {
                                    computedTextLength = currLength + this.dist[currPos + i] - this.dist[currPos];
                                    i--;
                                }

                                if(computedTextLength <= this.width)
                                {
                                    if(i + 2 < word.length)
                                    {
                                        var newStr = word.substring(i + 2, word.length);
                                        // Insert the new string into the words array after current position
                                        spacesT.splice(spaceC, 0, newStr);

                                        line += word.substring(0, i + 1);
                                        currPos += word.substring(0, i + 1).length;
                                        tspanEl.end = currPos;
                                        currPos++;
                                        prevPos = currPos;
                                        spaceC++;
                                    }
                                    else
                                    {
                                        line += word.substring(0, i + 1);

                                        currPos += word.substring(0, i + 1).length;
                                        tspanEl.end = currPos;
                                        currPos++;
                                        prevPos = currPos;
                                        startSpace = !startSpace;
                                        spaceC++;
                                    }

                                    currLength = computedTextLength;
                                }
                                else
                                {
                                    computedTextLength = currLength + this.dist[currPos + word.length - 1] - this.dist[currPos];
                                    tspanEl.end = currPos;
                                    prevPos = currPos + 1;
                                    spacesT[spaceC] = spacesT[spaceC].substring(1, spacesT[spaceC].length);
                                }
                            }
                            else
                            {
                                computedTextLength = currLength;
                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                                startSpace = !startSpace;
                                spaceC++;
                            }
                        }
                        else
                        {
                            // Check for dashes, if there is split check, if good add word and put other in stack
                            var fDash = word.indexOf('-');

                            if(fDash != -1)
                            {
                                computedTextLength = currLength + this.dist[currPos + fDash + 1] - this.dist[currPos];
                                //computedTextLength = currLength + this.calculateWordWidth(word.substring(0, fDash + 1), currPos, sizeCheck, textbox.styles);

                                // Check and if fits, split away
                                if(computedTextLength <= this.width)
                                {
                                    var newStr = word.substring(fDash + 1, word.length);
                                    // Insert the new string into the words array after current position
                                    wordsT.splice(wordC, 0, newStr);
                                    wordC++;

                                    line += word.substring(0, fDash + 1);

                                    currPos += word.substring(0, fDash + 1).length;
                                    tspanEl.end = currPos;
                                    tspanEl.endCursor = false;
                                    prevPos = currPos;

                                    currLength = computedTextLength;
                                }
                                else
                                {
                                    computedTextLength = currLength - this.dist[currPos] + this.dist[currPos - 1];

                                    line = line.substring(0, line.length - 1);

                                    tspanEl.end = currPos;
                                    currPos++;
                                    prevPos = currPos;
                                }
                            }
                            else
                            {
                                computedTextLength = currLength - this.dist[currPos] + this.dist[currPos - 1];

                                line = line.substring(0, line.length - 1);
                                tspanEl.end = currPos - 1;
                                prevPos = currPos;
                            }
                        }
                    }
                    else
                    {
                        line += word;
                        currPos += word.length;

                        if(nLineTrig)
                        {
                            spaceC++;
                        }
                        else
                        {
                            if(startSpace)
                            {
                                spaceC++;
                            }
                            else
                            {
                                wordC++;
                            }

                            if(progPos)
                            {
                                startSpace = !startSpace;
                            }
                        }
                        currLength = computedTextLength;
                    }
                }

                tspanEl.end = tspanEl.start + line.length;

                // Once the line is complete / out of stuff split into styles
                tspanEl.text = line;
                dy = ddy;
                nodeCounter = 0;

                if(wordC == wordsT.length && spaceC == spacesT.length)
                {
                    tspanEl.justified = false;
                }

                var reqAdjustment = this.width - computedTextLength;
                var numSpaces = tspanEl.text.length - tspanEl.text.replace(/\s/g, "").length;
                var extraSpace = reqAdjustment / numSpaces;
                var currStart = 0;
                var currLoc = 0;

                for(var j = 0; j < this.styles.length; j++)
                {
                    if(this.styles[j].start < tspanEl.end && this.styles[j].end > tspanEl.start)
                    {
                        var startPoint = (this.styles[j].start < tspanEl.start) ? 0 : (this.styles[j].start - tspanEl.start);
                        var endPoint = (this.styles[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (this.styles[j].end - tspanEl.start);
                        var styleText = tspanEl.text.slice(startPoint, endPoint);
                        var newStyle: StyleNode;
                        word = '';

                        for(i = 0; i < styleText.length; i++)
                        {
                            if(styleText.charAt(i).match(/\s/))
                            {
                                if(word.length > 0)
                                {
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


                                if(tspanEl.justified)
                                {
                                    newStyle =
                                    {
                                        key: nodeCounter, text: styleText.charAt(i), colour: this.styles[j].colour, dx: extraSpace, locStart: currLoc,
                                        decoration: this.styles[j].decoration, weight: this.styles[j].weight,
                                        style: this.styles[j].style, startPos: currStart
                                    };


                                    currStart += extraSpace + this.dist[tspanEl.start + currLoc + 1] - this.dist[tspanEl.start + currLoc];
                                }
                                else
                                {
                                    newStyle =
                                    {
                                        key: nodeCounter, text: styleText.charAt(i), colour: this.styles[j].colour, dx: 0, locStart: currLoc,
                                        decoration: this.styles[j].decoration, weight: this.styles[j].weight,
                                        style: this.styles[j].style, startPos: currStart
                                    };


                                    currStart += this.dist[tspanEl.start + currLoc + 1] - this.dist[tspanEl.start + currLoc];
                                }
                                currLoc += 1;

                                tspanEl.styles.push(newStyle);
                                nodeCounter++;
                            }
                            else
                            {
                                word += styleText.charAt(i);

                                if(i == styleText.length - 1)
                                {
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

            if(nLineTrig)
            {
                tspanEl = {
                    styles: [], x: this.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                    justified: false, lineNum: lineCount, text: ''
                };

                lineCount++;
                childText.push(tspanEl);
            }

            if(lineCount * 1.5 * this.size > this.height)
            {
                this.resizeText(this.id, this.width, lineCount * 1.5 * this.size);
                this.sendTextResize(this.id);
            }

            return childText;
        }

        private findXHelper(isUp: boolean, relative: number)
        {
            let i: number;
            let line: TextNode;

            if(isUp)
            {
                i = 1;
                while(i < this.textNodes.length && relative > this.textNodes[i].end)
                {
                    i++;
                }
                line = this.textNodes[i - 1];
            }
            else
            {
                i = 0;
                while(i < this.textNodes.length - 1 && relative > this.textNodes[i].end)
                {
                    i++;
                }
                line = this.textNodes[i + 1];
            }

            i = 0;
            while(i < line.styles.length && this.idealX >= line.styles[i].startPos)
            {
                i++;
            }
            let curr = i - 1;
            let style: StyleNode = line.styles[i - 1];


            let currMes = this.dist[line.start + style.locStart + style.text.length - 1] - this.dist[line.start + style.locStart];
            i = style.text.length - 1;
            while(i > 0 && style.startPos + currMes > this.idealX)
            {
                i--;
                currMes = this.dist[line.start + style.locStart + i] - this.dist[line.start + style.locStart];
            }

            // i and currMes is now the position to the right of the search point.
            // We just need to check if left or right is closer then reurn said point.
            if(i < style.text.length - 1)
            {
                if(this.idealX - (style.startPos + currMes) > (style.startPos + this.dist[line.start + style.locStart + i + 1] - this.dist[line.start + style.locStart]) - this.idealX)
                {
                    return line.start + style.locStart + i + 1;
                }
                else
                {
                    return line.start + style.locStart + i;
                }
            }
            else if(curr + 1 < line.styles.length)
            {

                if(this.idealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - this.idealX)
                {
                    return line.start + line.styles[curr + 1].locStart;
                }
                else
                {
                    return line.start + style.locStart + i;
                }
            }
            else
            {
                if(this.idealX - (style.startPos + currMes) > (style.startPos + this.dist[line.start + style.locStart + i + 1] - this.dist[line.start + style.locStart]) - this.idealX)
                {
                    return line.start + style.locStart + i + 1;
                }
                else
                {
                    return line.start + style.locStart + i;
                }
            }
        }
    }

    isCurrentStyle = (style : Style) : boolean =>
    {
        if(style.colour == this.viewState.colour && style.decoration == this.getDecoration() && style.weight == this.getWeight() && style.style == this.getStyle())
        {
            return true;
        }
        else
        {
            return false;
        }
    }



    insertText = (textItem: WhiteBoardText, start: number, end: number, text: string) : void =>
    {
        let isNew = true;
        let textStart = textItem.text.slice(0, start);
        let textEnd = textItem.text.slice(end, textItem.text.length);
        let styles = [];

        let fullText = textStart + textEnd;

        this.startTextWait(this.currTextEdit);

        for(i = 0; i < textItem.styles.length; i++)
        {
            let sty = textItem.styles[i];

            if(sty.start >= start)
            {
                if(sty.start >= end)
                {
                    // Completely after selection
                    if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                        && styles[styles.length - 1].decoration == sty.decoration
                        && styles[styles.length - 1].weight == sty.weight
                        && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= 200)
                    {
                        // If this is the same as the previous style and are length compatible then combine
                        styles[styles.length - 1].end += sty.end - sty.start;
                        styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                    }
                    else
                    {
                        sty.start -= end - start;
                        sty.end -= end - start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                    }
                }
                else
                {
                    if(sty.end > end)
                    {
                        // End stradle
                        if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                            && styles[styles.length - 1].decoration == sty.decoration
                            && styles[styles.length - 1].weight == sty.weight
                            && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - end <= 200)
                        {
                            // If this is the same as the previous style and are length compatible then combine
                            styles[styles.length - 1].end += sty.end - end;
                            styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                        }
                        else
                        {
                            sty.end +=  start - end;
                            sty.start = start;
                            sty.text = fullText.slice(sty.start, sty.end);
                            styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                        }

                    }

                    // Otherwise we don't push it as it is removed by the selection.
                }
            }
            else
            {
                if(sty.end > start)
                {
                    if(sty.end > end)
                    {
                        // Selection within style
                        sty.end -= end - start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                    }
                    else
                    {
                        // Start stradle
                        sty.end = start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                    }
                }
                else
                {
                    // Completely before selection
                    sty.text = fullText.slice(sty.start, sty.end);
                    styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                }
            }
        }

        textItem.text = textStart + text + textEnd;

        for(var i = 0; text.length > 0 && i < styles.length; i++)
        {
            if(styles[i].end > start)
            {
                if(styles[i].start >= start)
                {
                    // This style is all after the selected text.
                    if(styles[i].start == start && this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200)
                    {
                        isNew = false;
                        styles[i].start = start;
                    }
                    else
                    {
                        styles[i].start += text.length;
                    }

                    styles[i].end += text.length;
                }
                else if(styles[i].end >= start)
                {
                    // The cursor selection is completely within the style.
                    if(this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200)
                    {
                        isNew = false;
                        styles[i].end += text.length;
                    }
                    else
                    {
                        // Split this style ready for the new style.
                        var newSplit =
                        {
                            start: start + text.length, end: styles[i].end + text.length, decoration: styles[i].decoration,
                            weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour
                        };

                        styles[i].end = start;
                        styles.splice(i + 1, 0, newSplit);
                        i++;
                    }
                }
            }
            else if(styles[i].end == start)
            {
                if(this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200)
                {
                    isNew = false;
                    styles[i].end = start + text.length;
                }
            }

            styles[i].text = textItem.text.slice(styles[i].start, styles[i].end);
        }

        if(isNew && text.length > 0)
        {
            i = 0;

            while(i < styles.length && styles[i].end <= start)
            {
                i++
            }

            var newStyle =
            {
                start: start, end: start + text.length, decoration: this.getDecoration(),
                weight: this.getWeight(), style: this.getStyle(), colour: this.viewState.colour,
                text: textItem.text.slice(start, start + text.length)
            };

            styles.splice(i, 0, newStyle);
        }

        textItem.styles = styles;

        textItem = this.newEdit(textItem);

        if(text.length == 0)
        {
            if(start > 0)
            {
                this.calculateLengths(textItem, start - 1, start, end);
            }
            else if(textItem.text.length > 0)
            {
                this.calculateLengths(textItem, start, end, end + 1);
            }
        }
        else
        {
            this.calculateLengths(textItem, start, start + text.length, end);
        }

        this.updateText(textItem);
    }

    completeEdit = (textId: number, userId: number, editId: number) : void =>
    {
        var textItem: WhiteBoardText;
        var fullText = '';
        var localId = this.textDict[textId];
        var editData = this.textInBuffer[textId].editBuffer[userId][editId];

        textItem = this.getText(localId);
        textItem.styles = [];

        for(var i = 0; i < editData.nodes.length; i++)
        {
            textItem.styles[editData.nodes[i].num] = editData.nodes[i];
        }

        for(var i = 0; i < textItem.styles.length; i++)
        {
            fullText += textItem.styles[i].text;
        }

        textItem.text = fullText;

        this.startTextWait(localId);
        this.calculateLengths(textItem, 0, fullText.length, 0);
        this.updateText(textItem);
    }

    this.socket.on('STYLENODE', function(data: ServerStyleNodeMessage)
    {
        if(!self.textInBuffer[data.serverId])
        {
            console.log('STYLENODE: Unkown text, ID: ' + data.serverId);
            console.log(data);
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            if(self.textInBuffer[data.serverId].editBuffer[data.userId])
            {
                if(self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId])
                {
                    let buffer = self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId];
                    buffer.nodes.push(data);
                    if(buffer.nodes.length == buffer.num_nodes)
                    {
                        self.completeEdit(data.serverId, data.userId, data.editId);
                    }
                }
                else
                {
                    console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.serverId);
                    self.socket.emit('UNKNOWN-EDIT', data.editId);
                }
            }
            else
            {
                // TODO:
                console.log('WOAH BUDDY! User ID: ' + data.userId);
            }
        }
    });
    this.socket.on('LOCK-TEXT', function(data: ServerLockTextMessage)
    {
        let localId = self.textDict[data.serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            self.setTextLock(localId, data.userId);
        }
    });
    this.socket.on('LOCKID-TEXT', function(data: ServerLockIdMessage)
    {
        let localId = self.textDict[data.serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            if(self.gettingLock != -1 && self.getText(self.gettingLock).serverId == data.serverId)
            {
                self.setTextEdit(localId);
            }
            else
            {
                let msg: UserReleaseTextMessage = {serverId: data.serverId};
                self.socket.emit('RELEASE-TEXT', msg);
            }
        }
    });
    this.socket.on('EDITID-TEXT', function(data: ServerEditIdMessage)
    {
        let buffer = self.textOutBuffer;

        if(data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent)
        {
            buffer[data.bufferId].lastSent = data.localId;
            for(let i = 0; i < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i++)
            {
                buffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.editId;
                let node = buffer[data.bufferId].editBuffer[data.localId].nodes[i];

                let msg: UserStyleNodeMessage = {
                    editId: node.editId, num: node.num, start: node.start, end: node.end, text: node.text, weight: node.weight, style: node.style,
                    decoration: node.decoration, colour: node.colour
                };
                self.socket.emit('STYLENODE', msg);
            }
        }

    });
    this.socket.on('FAILED-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('REFUSED-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('RELEASE-TEXT', function(data: ServerReleaseTextMessage)
    {
        let localId = self.textDict[data.serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            self.setTextUnLock(localId);
        }
    });
    this.socket.on('EDIT-TEXT', function(data: ServerEditTextMessage)
    {
        if(!self.textInBuffer[data.serverId])
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            if(!self.textInBuffer[data.serverId].editBuffer[data.userId])
            {
                self.textInBuffer[data.serverId].editBuffer[data.userId] = [];
            }

            self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId] = {num_nodes: data.num_nodes, nodes: []};
        }

    });
    this.socket.on('MOVE-TEXT', function(data: ServerMoveElementMessage)
    {
        let localId = self.textDict[data.serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            self.moveTextbox(localId, false, data.x, data.y, data.editTime);
        }
    });
    this.socket.on('JUSTIFY-TEXT', function(data: ServerJustifyTextMessage)
    {
        let localId = self.textDict[data.serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            self.setTextJustified(data.serverId, data.newState);
        }
    });
    this.socket.on('RESIZE-TEXT', function(data: ServerResizeTextMessage)
    {
        let localId = self.textDict[data.serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', data.serverId);
        }
        else
        {
            self.setTextArea(localId, data.width, data.height);
        }
    });
    this.socket.on('DELETE-TEXT', function(serverId: number)
    {
        let localId = self.textDict[serverId];

        if(localId == null || localId == undefined)
        {
            self.socket.emit('UNKNOWN-TEXT', serverId);
        }
        else
        {
            self.deleteElement(localId);
        }
    });
    this.socket.on('IGNORE-TEXT', function(serverId: number)
    {
        //clearInterval(self.textInTimeouts[serverId]);
    });
    this.socket.on('DROPPED-TEXT', function(data)
    {
        // TODO: We need to stop trying to get it.
    });
    this.socket.on('MISSED-TEXT', function(data: ServerMissedTextMessage)
    {
        // TODO:
    });


    releaseText = (id: number) : void =>
    {
        let textBox = this.getText(id);

        this.stopLockText(id);
        if(textBox.serverId)
        {
            let msg : UserReleaseTextMessage = { serverId: textBox.serverId };
            this.socket.emit('RELEASE-TEXT', msg);
        }
        else
        {
            let msg: UserReleaseTextMessage = { serverId: null };
            let newOp : OperationBufferElement = { type: 'RELEASE-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    sendTextJustified = (id: number) : void =>
    {
        let textBox = this.getText(id);

        if(textBox.serverId)
        {
            let msg: UserJustifyTextMessage = { serverId: textBox.serverId, newState: !this.viewState.isJustified };
            this.socket.emit('JUSTIFY-TEXT', msg);
        }
        else
        {
            let msg: UserJustifyTextMessage = { serverId: null, newState: !this.viewState.isJustified };
            let newOp : OperationBufferElement = { type: 'JUSTIFY-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    textEdited = (textbox: WhiteBoardText) : void =>
    {
        var buffer : TextOutBufferElement;
        var editNum: number;

        // This is a new textbox.
        if(this.textOutBuffer[textbox.id])
        {
            buffer = this.textOutBuffer[textbox.id];
            editNum = buffer.editCount;
            buffer.editCount++;
        }
        else
        {
            buffer = {
                id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, lastSent: 0,
                height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified, styles: []
            };
            buffer.styles = textbox.styles.slice();
            editNum = 0;
        }


        buffer.editBuffer[editNum] = {num_nodes: textbox.styles.length, nodes: []};

        for(var i = 0; i < textbox.styles.length; i++)
        {
            buffer.editBuffer[editNum].nodes.push(
            {   num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                weight: textbox.styles[i].weight, decoration:  textbox.styles[i].decoration, style: textbox.styles[i].style,
                start: textbox.styles[i].start, end: textbox.styles[i].end, editId: editNum
            });
        }

        this.textOutBuffer[textbox.id] = buffer;
        if(textbox.serverId)
        {
            let msg: UserEditTextMessage = {serverId: textbox.serverId, localId: editNum, bufferId: textbox.id, num_nodes: textbox.styles.length};
            this.socket.emit('EDIT-TEXT', msg);
        }
        else
        {
            // TODO: Not Sure about this!!!!
            let msg: UserNewTextMessage = {
                localId: textbox.id, x: this.textOutBuffer[textbox.id].x, y: this.textOutBuffer[textbox.id].y, size: this.textOutBuffer[textbox.id].size,
                width: this.textOutBuffer[textbox.id].width, height: this.textOutBuffer[textbox.id].height, justified: this.textOutBuffer[textbox.id].justified
            };
            this.socket.emit('TEXTBOX', msg);
        }
    }

    resizeText = (id: number, width: number, height: number) : void =>
    {
        let textBox = this.getText(id);

        this.setTextArea(id, width, height);
    }

    sendTextMove = (id: number) : void =>
    {
        let tbox = this.getText(this.currTextMove);

        if(tbox.serverId)
        {
            let msg: UserMoveElementMessage = { serverId: tbox.serverId, x: tbox.x, y: tbox.y };
            this.socket.emit('MOVE-TEXT', msg);
        }
        else
        {
            let msg: UserMoveElementMessage = { serverId: null, x: tbox.x, y: tbox.y };
            let newOp : OperationBufferElement = { type: 'MOVE-TEXT', message: msg };
            tbox.opBuffer.push(newOp);
        }
    }

    sendTextResize = (id: number) : void =>
    {
        let textBox = this.getText(id);

        if(textBox.serverId)
        {
            let msg: UserResizeTextMessage = { serverId: textBox.serverId, width: textBox.width, height: textBox.height };
            this.socket.emit('RESIZE-TEXT', msg);
        }
        else
        {
            let msg: UserResizeTextMessage = { serverId: null, width: textBox.width, height: textBox.height };
            let newOp : OperationBufferElement = { type: 'RESIZE-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    lockText = (id: number) : void =>
    {
        let textBox : WhiteBoardText = this.getText(id);

        this.setTextGetLock(id);

        if(textBox.serverId)
        {
            let msg: UserLockTextMessage = { serverId:  textBox.serverId };
            this.socket.emit('LOCK-TEXT', msg);
        }
        else
        {
            let msg: UserLockTextMessage = { serverId: null };
            let newOp : OperationBufferElement = { type: 'LOCK-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    newEdit = (textBox: WhiteBoardText) : WhiteBoardText =>
    {
        textBox.editCount++;

        if(textBox.editCount > 5)
        {
            // Notify of changes and clear that pesky timeout
            textBox.editCount = 0;
            clearTimeout(this.editTimer);
            this.textEdited(textBox);
        }
        else
        {
            // Set timeout
            var self = this;
            clearTimeout(this.editTimer);
            this.editTimer = setTimeout(function(tBox)
            {
                tBox.editCount = 0;
                self.textEdited(tBox);
                clearTimeout(this.editTimer);

            }, 6000, textBox);
        }

        return textBox;
    }

    styleChange = () : void =>
    {
        if(this.currTextEdit != -1 && this.cursorStart != this.cursorEnd)
        {
            let textItem: WhiteBoardText = this.getText(this.currTextEdit);

            let text = textItem.text.substring(this.cursorStart, this.cursorEnd);

            this.insertText(textItem, this.cursorStart, this.cursorEnd, text);
        }
    }

    colourChange = (newColour: string) : void =>
    {
        this.setColour(newColour);
        this.styleChange();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponent(WhiteBoardText.MODENAME, WhiteBoardText.Element, WhiteBoardText.ElementView, WhiteBoardText.Pallete, WhiteBoardText.PalleteView, WhiteBoardText.ModeView);
