/** Highlight Whiteboard Component.
*
* This allows the user to highlight areas for other users to see.
*
*/
namespace Highlight {
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
    export const MODENAME = 'HIGHLIGHT';


    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        colour: number;
    }

    /**
     * A description of the view state for the pallete of this component.
     * This will be passed from the pallete controller to the view.
     */
    interface PalleteViewState extends BoardPalleteViewState {
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
        Highlight,
        Marker
    }


    /**
     * A description of custom context items (other than copy, cut, paste).
     * This is used to identify the source of a custom context event in the element.
     */
    const enum CustomContextItems {

    }

    /**
     * Message types that can be sent between the user and server.
     */
    const MessageTypes = {
    };

    interface UserNewHighlightMessage extends UserNewElementPayload {
    }
    interface ServerNewHighlightMessage extends ServerMessage {
        x: number;
        y: number;
        width: number;
        height: number;
        userId: number;
        colour: number;
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

        public getCurrentViewState()
        {
            return this.currentViewState;
        }

        public getCursor()
        {
            let cursorType: ElementCursor = { cursor: 'auto', url: [], offset: {x: 0, y: 0} };

            return cursorType;
        }

        public handleChange(change: BoardPalleteChange)
        {
            return this.currentViewState;
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
        colour: number;

        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The set of messages to send to the communication server.
        */
        public static createElement( data: CreationData )
        {
            let width = data.width;
            let height = data.height;


            if(data.serverId != null && data.serverId != undefined)
            {
                console.log('Creating upload from message.');
                let msg = data.serverMsg as ServerNewHighlightMessage;
                console.log(msg);

                return new Element(data.id, msg.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.colour, false, data.serverId);
            }
            else
            {
                return new Element(data.id, data.userId, data.x, data.y, data.width, data.height, data.callbacks, 0xffff00, true);
            }
        }




        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        public constructor(id: number, userId: number, x: number, y: number, width: number, height: number, callbacks: ElementCallbacks, colour: number,
                            isSelected: boolean, serverId?: number)
        {
            let future = new Date();
            future.setFullYear(future.getFullYear() + 1);

            super(MODENAME, id, x, y, width, height, userId, callbacks, serverId, future);

            this.isSelected = isSelected;

            let newHighlightView: ViewState = {
                mode: MODENAME, id: this.id, updateTime: future, isSelected: isSelected, x: this.x, y: this.y, width: this.width,
                height: this.height, isEditing: false, isMoving: false, isResizing: false, remLock: false, getLock: false, colour: colour
            };

            this.currentViewState = newHighlightView;

            console.log(this);
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // EXPOSED FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**   Generate the message that would be sent to the server to generate this element.
         *
         *    This should be a single message, more messages can be sent once serverId is returned. (see setServerId)
         *
         *    @return {UserMessage} The message to generate this element.
         */
        public getNewMsg()
        {
            let msg: UserNewHighlightMessage = { localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, editLock: false };

            return msg;
        }

        /**   Generate the clipboard data that this element should produce when copied, either as a single selected item or whilst editing.
         *
         *    This should be a set of different clipboard data formats.
         *
         *    @return {Array<ClipBoardItem>} The clipboard items.
         */
        public getClipboardData()
        {
            return null;
        }

        /**   Generate the SVG string description of this objects display to be copied  when user copies multiple items.
         *
         *    This should be a string containing the svg description to display this item.
         *
         *    @return {string} The clipboard items.
         */
        public getClipboardSVG()
        {
            return null;
        }

        /**   Sets the serverId of this element and returns a list of server messages to send.
         *
         *    @param {number} id - The server ID for this element.
         *    @return {Array<UserMessage>} - The set of messages to send to the communication server.
         */
        public setServerId(id: number)
        {
            super.setServerId(id);

            return [];
        }

        /**   Handle the deselect this element.
         *    In the case of highlights this will delete the highlight.
         *
         *    @return {ComponentViewState} An object containing: the new view state
         */
        public handleDeselect()
        {
            let msg: UserMessage = { header: BaseMessageTypes.DELETE, payload: null };

            this.sendServerMsg(msg);
            this.deleteElement();

            let retVal: ComponentViewState = this.currentViewState;
            return retVal;
        }

        /**   Handle a mouse down event on this element or one of it's sub-components. Only called when board is in SELECT mode.
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
            let cursorType: ElementCursor;



            let serverMsgs: Array<UserMessage> = [];
            let retVal: ElementInputStartReturn =
            {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: cursorType, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };

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

            if(component === ViewComponents.Highlight)
            {
                retVal.wasDelete = { message: null };
            }
            else if(component === ViewComponents.Marker)
            {
                // Set View Centre
                retVal.newViewCentre = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            }

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
        public handleTouchStart(e: TouchEvent, localTouches: Array<Point>, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal: ElementInputStartReturn =
            {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };

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
        public handleTouchMove(e: TouchEvent, touchChange: Array<Point>, palleteState: Pallete, component?: ViewComponents, subId?: number)
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
        public handleTouchEnd(e: TouchEvent, localTouches: Array<Point>, palleteState: Pallete, component?: ViewComponents, subId?: number)
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
        public handleTouchCancel(e: TouchEvent, localTouches: Array<Point>, palleteState: Pallete, component?: ViewComponents, subId?: number)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse down event on the board, called when this element is being edited (and as required mode is this mode).
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} mouseX - The mouse x position, scaled to the SVG zoom.
         *    @param {number} mouseY - The mouse y position, scaled to the SVG zoom.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardMouseDown(e: MouseEvent, mouseX: number, mouseY: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal: ElementInputStartReturn =
            {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: false,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse move event on the board, called when this element is selected and in select mode.
         *    Otherwise when this item is being edited (and as required mode is this mode).
         *
         *    For Performance reasons avoid sending server messages here unless necessary, wait for mouseUp. Likewise for undo and redo ops, just leave null.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} changeX - The change of the mouse x position, scaled to the SVG zoom.
         *    @param {number} changeY - The change of the mouse y position, scaled to the SVG zoom.
         *    @param {number} mouseX - The mouse x position, scaled to the SVG zoom.
         *    @param {number} mouseY - The mouse y position, scaled to the SVG zoom.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardMouseMove(e: MouseEvent, changeX: number, changeY: number, mouseX: number, mouseY: number, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a mouse up event on the board, called when this element is selected and in select mode.
         *    Otherwise when this item is being edited (and as required mode is this mode).
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} mouseX - The mouse x position, scaled to the SVG zoom.
         *    @param {number} mouseY - The mouse y position, scaled to the SVG zoom.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleBoardMouseUp(e: MouseEvent, mouseX: number, mouseY: number, palleteState: Pallete)
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
        public handleBoardTouchStart(e: TouchEvent, touches: Array<Point>, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal: ElementInputStartReturn =
            {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };

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
        public handleBoardTouchMove(e: TouchEvent, toucheChanges: Array<Point>, palleteState: Pallete)
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
        public handleBoardTouchEnd(e: TouchEvent, touches: Array<Point>, palleteState: Pallete)
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
        public handleBoardTouchCancel(e: TouchEvent, touches: Array<Point>, palleteState: Pallete)
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
         *
         *    @return {ViewState} An object containing: the new view state
         */
        public startMove()
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
         *    @return {ViewState} An object containing: the new view state, messages to be sent to the comm server
         */
        public handleMove(changeX: number, changeY: number)
        {
            let retVal: ComponentViewState = this.currentViewState;

            return retVal;
        }

        /**   Handle the end of moving this item.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse up event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *
         *    @return {ElementMoveReturn} An object containing: the new view state
         */
        public endMove()
        {
            let retVal : ElementMoveReturn = { newView: this.currentViewState, serverMessages: [], move: null };

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
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle a messages sent from the server to this element.
         *
         *    @param {} message - The server message that was sent.
         *
         *    @return {ElementMessageReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handleElementServerMessage(message: ServerMessage)
        {
            let newView: ViewState = this.currentViewState as ViewState;
            let retMsgs: Array<UserMessage> = [];
            let alertMessage: AlertMessageData = null;
            let infoMessage: InfoMessageData = null;
            let wasEdit = false;
            let wasDelete = false;

            let retVal: ElementMessageReturn =
            {
                newView: newView, serverMessages: retMsgs, wasEdit: wasEdit, wasDelete: wasDelete, alertMessage: alertMessage, infoMessage: infoMessage
            };
            return retVal;
        }

        /**   Handle the selecting and starting of editing of this element that has not been induced by this elements input handles.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleStartEdit()
        {
            let retVal: ElementInputReturn = this.getDefaultInputReturn();
            let serverMsgs: Array<UserMessage> = [];

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle the deselect this element and ending of editing.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleEndEdit()
        {
            let retVal: ElementInputReturn = this.getDefaultInputReturn();
            let serverMsgs: Array<UserMessage> = [];

            retVal.serverMessages = this.checkForServerId(serverMsgs);
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
         *    @param {number} localX - The x position of the mouse with respect to this element.
         *    @param {number} localY - The y position of the mouse with respect to this element.
         *    @param {ClipboardEventData} data - The clipboard data to be pasted.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handlePaste(localX: number, localY: number, data: ClipboardEventData, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            // Event Unimplemented: Implementation goes here.

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**  Handle the cutting of data from this element.
         *
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleCut()
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
         *    @param {BoardPallete} pallete - The pallete for this element after changes.
         *    @param {BoardPalleteChange} change - The changes made to the pallete.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handlePalleteChange(pallete: BoardPallete, change: BoardPalleteChange)
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
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponent(Highlight.MODENAME, Highlight.Element, Highlight.Pallete);
