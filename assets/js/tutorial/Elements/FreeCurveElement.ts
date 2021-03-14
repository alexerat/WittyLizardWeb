import { SmoothCurve, DeCluster, FitCurve } from '../fitcurves';
import { BoardModes, BaseMessageTypes } from "../WhiteBoardCrossTypes";

declare function registerComponent(componentName: string, Element, Pallete);

/** Free Curve Whiteboard Component.
*
* This allows the user to free draw curves that will be smoothed and rendered to SVG Beziers.
*
*/
namespace FreeCurve {
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
    export const MODENAME = 'FREECURVE';

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
        isMoving: boolean;
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
     * The set of possible types of pallete changes.
     * Used in interfacing between component view and state.
     */
    const enum PalleteChangeType {
        COLOUR,
        SIZE
    }

    /**
     * The set of possible colours for free curves.
     * Used in interfacing between component view and state.
     */
    const PalleteColour = {
        BLACK: 'black',
        BLUE: 'blue',
        RED: 'red',
        GREEN: 'green'
    }

    /**
     * The set of possible sizes for free curves.
     * Used in interfacing between component view and state.
     */
    const PalleteSize = {
        XSMALL: 2.0,
        SMALL: 5.0,
        MEDIUM: 10.0,
        LARGE: 20.0
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

    /**
     * Message types that can be sent between the user and server.
     */
    const MessageTypes = {
        IGNORE: 1,
        POINT: 2,
        POINTMISSED: 3,
        MISSINGPOINT: 4
    };

    interface PointContainer extends Point {
        seq_num: number;
    }

    interface UserNewCurveMessage extends UserNewElementPayload {
        colour: string;
        size: number;
        num_points: number;
        points: Array<PointContainer>;
    }

    interface UserNewPointMessage extends UserMessagePayload {
        num: number;
        x: number;
        y: number;
    }

    interface UserMissingPointMessage extends UserMessagePayload {
        seq_num: number;
    }

    interface ServerNewPointMessage extends ServerMessagePayload {
        num: number;
        x: number;
        y: number;
    }
    interface ServerNewCurvePayload extends ServerMessagePayload {
        x: number;
        y: number;
        width: number;
        height: number;
        userId: number;
        size: number;
        colour: string;
        num_points: number;
        editTime: Date;
        points: Array<PointContainer>;
    }
    interface ServerMissedPointMessage extends ServerMessagePayload {
        num: number;
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
        colour: string;
        baseSize: number;

        public constructor()
        {
            super();

            this.baseSize = PalleteSize.SMALL;
            this.colour = 'black';

            this.currentViewState = { colour: PalleteColour.BLACK, size: PalleteSize.SMALL };
        }

        public getCurrentViewState()
        {
            return this.currentViewState;
        }

        public getCursor()
        {
            let cursorType: ElementCursor;
            let cursorColour: string;

            if(this.colour == 'black')
            {
                cursorColour = 'black';
            }
            else if(this.colour == 'blue')
            {
                cursorColour = 'blue';
            }
            else if(this.colour == 'red')
            {
                cursorColour = 'red';
            }
            else if(this.colour == 'green')
            {
                cursorColour = 'green';
            }

            if(this.baseSize == PalleteSize.XSMALL)
            {
                cursorType =
                {
                    cursor: 'auto', url: ['https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/DrawCursor-' + cursorColour + '-xsmall.svg'],
                    offset: {x: 1, y: 1}
                };
            }
            else if(this.baseSize == PalleteSize.SMALL)
            {
                cursorType =
                {
                    cursor: 'auto', url: ['https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/DrawCursor-' + cursorColour + '-small.svg'],
                    offset: {x: 2.5, y: 2.5}
                };
            }
            else if(this.baseSize == PalleteSize.MEDIUM)
            {
                cursorType =
                {
                    cursor: 'auto', url: ['https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/DrawCursor-' + cursorColour + '-medium.svg'],
                    offset: {x: 5, y: 5}
                };
            }
            else
            {
                cursorType = { cursor: 'auto', url: [], offset: {x: 0, y: 0} };
            }

            return cursorType;
        }

        public handleChange(change: BoardPalleteChange)
        {
            if(change.type == PalleteChangeType.COLOUR)
            {
                this.colour = change.data;
                this.updateView({ colour: change.data });
            }
            else if(change.type == PalleteChangeType.SIZE)
            {
                this.baseSize = change.data;
                this.updateView({ size: change.data });
            }
            else
            {
                console.error('Unrecognized pallete change type.');
            }
            return this.currentViewState;
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
        curveSet: Array<Point>;
        colour: string;
        size: number;

        pointBuffer: Array<Point> = [];
        pointInTimeout;
        numRecieved: number = 0;
        numPoints: number = 0;

        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The element.
        */
        public static createElement( data: CreationData )
        {
            if(data.pointList != null && data.pointList != undefined)
            {
                let pallete : Pallete = data.palleteState as Pallete;
                let colour: string;
                let size: number;

                if(!pallete)
                {
                    colour = 'black';
                    size = 1.0;
                }
                else
                {
                    colour = pallete.colour;
                    size = pallete.baseSize;
                }

                size = size * data.scaleF;

                let reducedPoints : Array<Point>;
                let curves : Array<Point>;

                let minX = null;
                let maxX = null;
                let minY = null;
                let maxY = null;

                if(data.pointList.length > 1)
                {
                    reducedPoints = SmoothCurve(data.pointList);
                    reducedPoints = DeCluster(reducedPoints, 10);

                    console.log(JSON.stringify(data.pointList));

                    for(let i = 0; i < reducedPoints.length; i++)
                    {
                        reducedPoints[i].x = reducedPoints[i].x * data.scaleF + data.panX;
                        reducedPoints[i].y = reducedPoints[i].y * data.scaleF + data.panY;

                        if(minX == null || reducedPoints[i].x < minX)
                        {
                            minX = reducedPoints[i].x;
                        }
                        if(maxX == null || reducedPoints[i].x > maxX)
                        {
                            maxX = reducedPoints[i].x;
                        }

                        if(minY == null || reducedPoints[i].y < minY)
                        {
                            minY = reducedPoints[i].y;
                        }
                        if(maxY == null || reducedPoints[i].y > maxY)
                        {
                            maxY = reducedPoints[i].y;
                        }
                    }

                    for(let i = 0; i < reducedPoints.length; i++)
                    {
                        reducedPoints[i].x = reducedPoints[i].x - minX;
                        reducedPoints[i].y = reducedPoints[i].y - minY;
                    }

                    curves = FitCurve(reducedPoints, reducedPoints.length, 5);
                }
                else
                {
                    curves = [];
                    curves[0] = { x: size, y: size };

                    maxX = data.pointList[0].x * data.scaleF + data.panX + size;
                    minX = data.pointList[0].x * data.scaleF + data.panX - size;

                    maxY = data.pointList[0].y * data.scaleF + data.panY + size;
                    minY = data.pointList[0].y * data.scaleF + data.panY - size;
                }

                return new Element(data.id, data.userId, minX, minY, maxX - minX, maxY - minY, data.callbacks, curves.length, curves, colour, size);
            }
            else if(data.serverId != null && data.serverId != undefined && data.serverMsg != null && data.serverMsg != undefined)
            {
                let msg = data.serverMsg as ServerNewCurvePayload;
                let pointArray = [];

                for(let i = 0; i < msg.points.length; i++)
                {
                    pointArray[msg.points[i].seq_num] = { x: msg.points[i].x, y: msg.points[i].y };
                }

                return new Element(data.id, data.userId, msg.x, msg.y, msg.width, msg.height,
                    data.callbacks, msg.num_points, pointArray, msg.colour, msg.size, data.serverId)
            }
            else
            {
                console.log('Created null element.');
                return null;
            }
        }

        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        public constructor(id: number, userId: number, x: number, y: number, width: number, height: number, callbacks: ElementCallbacks,
            numPoints: number, curveSet: Array<Point>, colour: string, size: number, serverId?: number, updateTime?: Date)
        {
            super(MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime);

            this.numRecieved = 0;

            if(serverId != null && serverId != undefined)
            {
                for(let i = 0; i < numPoints; i++)
                {
                    if(curveSet[i] != null && curveSet[i] != undefined)
                    {
                        this.pointBuffer[i] = curveSet[i];
                        this.numRecieved++;
                    }
                }

                if(this.numRecieved < numPoints)
                {
                    let self = this;
                    self.pointInTimeout = setInterval(() =>
                    {
                        for(let i = 0; i < self.numPoints; i++)
                        {
                            if(self.pointBuffer[i] == null || self.pointBuffer[i] == undefined)
                            {
                                let msg: UserMissingPointMessage = { seq_num: i };
                                let msgCont: UserMessage = { header: MessageTypes.MISSINGPOINT, payload: msg };
                                self.sendServerMsg(msgCont);
                            }
                        }
                    }, 1000);
                }
            }
            else
            {
                for(let i = 0; i < curveSet.length; i++)
                {
                    this.pointBuffer[i] = curveSet[i];
                    this.numRecieved++;
                }
            }

            this.numPoints = numPoints;
            this.curveSet = curveSet;
            this.colour = colour;
            this.size = size;
            this.isComplete = false;

            let newCurveView: ViewState;

            if(this.numRecieved < this.numPoints)
            {
                console.log('Empty curve set.');
                newCurveView = {
                    mode: MODENAME, type: 'empty', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, updateTime: this.updateTime,
                    isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height, isEditing: false, isResizing: false,
                    remLock: false, getLock: false
                };
            }
            else if(this.curveSet.length > 1)
            {
                let pathText = this.createCurveText();
                newCurveView = {
                    mode: MODENAME, type: 'path', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, param: pathText,
                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height, isEditing: false,
                    isResizing: false, remLock: false, getLock: false
                };
                this.isComplete = true;
            }
            else if(this.curveSet.length == 1)
            {
                newCurveView = {
                    mode: MODENAME, type: 'circle', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, point: this.curveSet[0],
                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height, isEditing: false,
                    isResizing: false, remLock: false, getLock: false
                };
                this.isComplete = true;
            }

            this.currentViewState = newCurveView;
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
            let pointMessages: Array<PointContainer> = [];

            for(let i = 0; i < this.pointBuffer.length; i++)
            {
                let pointCont: PointContainer = { seq_num: i, x: this.pointBuffer[i].x, y: this.pointBuffer[i].y };

                pointMessages.push(pointCont);
            }

            let msg: UserNewCurveMessage =
            {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, colour: this.colour, size: this.size,
                num_points: this.numPoints, points: pointMessages, editLock: false
            };

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
            // TODO:
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
            // TODO:
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

            let messages: Array<UserMessage> = [];

            return messages;
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

            this.isMoving = true;
            this.moveStartX = this.x;
            this.moveStartY = this.y;
            this.startTime = this.updateTime;

            cursorType = {cursor: 'move', url: [], offset: {x: 0, y: 0}};

            this.updateView({ isSelected: true, isMoving: true });
            this.isSelected = true;

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

            if(this.isMoving)
            {
                console.log('Should have moved.');
                this.move(changeX, changeY, new Date());
                this.hasMoved = true;
            }

            retVal.newView = this.currentViewState;
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

            if(this.hasMoved)
            {
                this.hasMoved = false;

                let changeX = this.x - this.moveStartX;
                let changeY = this.y - this.moveStartY;

                let msgPayload: UserMoveElementMessage = { x: this.x, y: this.y };
                let msg: UserMessage = { header: BaseMessageTypes.MOVE, payload: msgPayload };

                serverMsgs.push(msg);

                retVal.undoOp = () => { return this.moveOperation(-changeX, -changeY, this.startTime); };
                retVal.redoOp = () => { return this.moveOperation(changeX, changeY, this.updateTime); };
            }

            this.isMoving = false;
            this.isSelected = false;

            let newView = this.updateView({ isSelected: false, isMoving: false });

            retVal.isSelected = false;
            retVal.newView = newView;
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
            this.isMoving = true;
            this.moveStartX = this.x;
            this.moveStartY = this.y;

            this.updateView({ isMoving: true });

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
            this.move(changeX, changeY, new Date());

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
            this.isMoving = false;
            this.updateView({ isMoving: false });

            let msgPayload: UserMoveElementMessage = { x: this.x, y: this.y };
            let serverMsg: UserMessage = { header: BaseMessageTypes.MOVE, payload: msgPayload };
            let serverMsgs = [];
            let retVal : ElementMoveReturn = { newView: this.currentViewState, serverMessages: [], move: { x: this.x, y: this.y, message: serverMsg } };

            retVal.serverMessages = this.checkForServerId(serverMsgs);
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

            switch(message.header)
            {
                case MessageTypes.POINT:
                    let data = message.payload as ServerNewPointMessage;
                    // Make sure we know about this curve.
                    if(this.numRecieved != this.numPoints)
                    {
                        if(!this.pointBuffer[data.num])
                        {
                            this.pointBuffer[data.num] = {x: data.x, y: data.y};
                            this.numRecieved++;
                        }

                        if(this.numRecieved == this.numPoints)
                        {
                            clearInterval(this.pointInTimeout);
                            this.curveSet = this.pointBuffer;
                            if(this.curveSet.length > 1)
                            {
                                let pathText = this.createCurveText();
                                newView = {
                                    mode: MODENAME, type: 'path', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, param: pathText,
                                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height,
                                    isEditing: false, isResizing: false, remLock: false, getLock: false
                                };
                            }
                            else if(this.curveSet.length == 1)
                            {
                                newView = {
                                    mode: MODENAME, type: 'circle', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour,
                                    point: this.curveSet[0], updateTime: this.updateTime, isSelected: false,
                                    x: this.x, y: this.y, width: this.width, height: this.height,
                                    isEditing: false, isResizing: false, remLock: false, getLock: false
                                };
                            }
                            else
                            {
                                newView = {
                                    mode: MODENAME, type: 'empty', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour,
                                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height,
                                    isEditing: false, isResizing: false, remLock: false, getLock: false
                                };
                            }
                            this.updateView(newView);
                        }
                    }
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.IGNORE:
                    clearInterval(this.pointInTimeout);
                    wasDelete = true;
                    break;
                case MessageTypes.POINTMISSED:
                    let msdata = message.payload as ServerMissedPointMessage;
                    let point = this.curveSet[msdata.num];
                    let msg : UserNewPointMessage = { num: msdata.num, x: point.x, y: point.y};
                    let msgCont : UserMessage =  { header:  MessageTypes.POINT, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                default:
                    break;
            }

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

            this.isSelected = true;
            this.isEditing = true;
            this.updateView({ isSelected: true, isEditing: true });

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

            this.isSelected = false;
            this.isEditing = false;
            this.updateView({ isSelected: false, isEditing: false });

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

        /** Convert the list of points describing the Bezier curve into a string.
         *
         * This speeds up the rendering as this does not have to be recreated during the render pass.
         */
        private createCurveText()
        {
            let param =     "M" + this.curveSet[0].x + "," + this.curveSet[0].y;
            param = param +" C" + this.curveSet[1].x + "," + this.curveSet[1].y;
            param = param + " " + this.curveSet[2].x + "," + this.curveSet[2].y;
            param = param + " " + this.curveSet[3].x + "," + this.curveSet[3].y;

            for(let i = 4; i + 2 < this.curveSet.length; i += 3)
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
registerComponent(FreeCurve.MODENAME, FreeCurve.Element, FreeCurve.Pallete);
