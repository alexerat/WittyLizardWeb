/** Template Whiteboard Component.
*
* This allows the user to free draw curves that will be smoothed and rendered to SVG Beziers.
*
*/
namespace Template {
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
    export const MODENAME = 'TEMPLATE';

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        param?: string;
        point?: Point;
        colour: string;
        size: number;
        type: string;
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

    /** Template Whiteboard Element View.
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

    /** Template Whiteboard Mode View.
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

    /** Template Whiteboard Pallete View.
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

    /** Template Custom Context View.
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

    /** Template Whiteboard Pallete.
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

    /** Template Whiteboard Element.
    *
    * This is the class that will be used to store the state and control elements of this component.
    *
    */
    export class Element extends BoardElement
    {
        // Element Specific Variables
        curveSet: Array<Point>;
        colour: string;
        size: number;

        pointInBuffer: Array<Point> = [];
        pointInTimeout;
        numRecieved = 0;
        numPoints = 0;

        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The set of messages to send to the communication server.
        */
        public static createElement( data: CreationData )
        {
            return null;
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

        private createCurveText()
        {
            var param =     "M" + this.curveSet[0].x + "," + this.curveSet[0].y;
            param = param +" C" + this.curveSet[1].x + "," + this.curveSet[1].y;
            param = param + " " + this.curveSet[2].x + "," + this.curveSet[2].y;
            param = param + " " + this.curveSet[3].x + "," + this.curveSet[3].y;

            for(var i = 4; i + 2 < this.curveSet.length; i += 3)
            {
                param = param +" C" + this.curveSet[i + 0].x + "," + this.curveSet[i + 0].y;
                param = param + " " + this.curveSet[i + 1].x + "," + this.curveSet[i + 1].y;
                param = param + " " + this.curveSet[i + 2].x + "," + this.curveSet[i + 2].y;
            }

            return param;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponent(Template.MODENAME, Template.Element, Template.ElementView, Template.Pallete, Template.PalleteView, Template.ModeView);
