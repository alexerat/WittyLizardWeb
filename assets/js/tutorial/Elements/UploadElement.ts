import { BoardModes, BaseMessageTypes } from "../WhiteBoardCrossTypes";

declare function registerComponent(componentName: string, Element, Pallete);

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

    const ViewTypes = {
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        AUDIO: 'AUDIO',
        FILE: 'FILE',
        IFRAME: 'IFRAME',
        LINK: 'LINK'
    };

    const MAXSIZE = 10485760;

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        rotation: number;
        extension: string;
        URL: string;
        isLoading: boolean;
        isUploader: boolean;
        percentUp: number;
        viewType: string;
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
        View,
        Resize,
        Interaction
    }

    const enum ResizeComponents {
        Corner,
        Right,
        Bottom
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
        START: 1,
        DATA: 2,
        DONE: 3,
        ROTATE: 4,
        VIEWTYPE: 5,
        UPDATE: 6
    };

    interface UserNewUploadMessage extends UserNewElementPayload {
        isLocal: boolean;
        fileDesc: string;
        fileSize: number;
        fileType: string;
        extension: string;
        fileURL: string;
    }
    interface UserDataMessage extends UserMessagePayload {
        piece: ArrayBuffer;
        place: number;
    }
    interface UserStartUploadMessage extends UserMessagePayload {
    }
    interface UserRotateMessage extends UserMessagePayload {
        rotation: number;
    }

    interface ServerNewUploadMessage extends ServerMessage {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        userId: number;
        editTime: Date;
        fileDesc: string;
        fileType: string;
        extension: string;
        viewType: string;
        url: string;
    }
    interface ServerDataMessage extends ServerMessagePayload {
        place: number;
        percent: number;
    }
    interface ServerRotateMessage extends ServerMessagePayload {
        rotation: number;
    }
    interface ServerCompleteMessage extends ServerMessagePayload {
        fileURL: string;
    }
    interface ServerViewTypeMessage extends ServerMessagePayload {
        viewType: string;
    }
    interface ServerUpdateMessage extends ServerMessagePayload {
        percent: number;
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
        rotation: number;
        fType: string;
        fName: string;
        fSize: number;
        fExtension: string;
        fDesc: string;
        viewType: string;
        url: string;

        file: File;
        reader: FileReader;
        currentPlace: number;


        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The set of messages to send to the communication server.
        */
        public static createElement( data: CreationData )
        {
            let width = data.width;
            let height = data.height;

            if(width == null || height == null)
            {
                width = 200 * data.scaleF;
                height = 200 * data.scaleF;
            }

            if(data.serverId != null && data.serverId != undefined)
            {
                let msg = data.serverMsg as ServerNewUploadMessage;

                if(msg.url === null)
                {
                    msg.url = '';
                }

                return new Element(data.id, msg.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, null,
                                   msg.url, msg.fileType, -1, msg.fileDesc, msg.extension, msg.viewType, data.serverId, msg.editTime);
            }
            else
            {
                return null;
            }
        }




        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        public constructor(id: number, userId: number, x: number, y: number, width: number, height: number, callbacks: ElementCallbacks,
            file: File, url: string, fType: string, fSize: number, fDesc: string, fExt: string, viewType: string, serverId?: number, updateTime?: Date)
        {
            super(MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime);

            this.url = url;
            this.file = file;
            this.fType = fType;
            this.fSize = fSize;
            this.fExtension = fExt;
            this.fDesc = fDesc;
            this.rotation = 0;
            this.viewType = viewType;
            this.currentPlace = null;

            let isLoading = (url == '' || (fType == null && (serverId == null || serverId == undefined)) ? true : false);
            let isUploader = (url == '' && (serverId == null || serverId == undefined) ? true : false);


            let newUploadView: ViewState = {
                mode: MODENAME, id: this.id, rotation: this.rotation, extension: this.fExtension, URL: this.url, isLoading: isLoading,
                isUploader: isUploader, percentUp: 0, updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width,
                height: this.height, isEditing: false, isMoving: false, isResizing: false, remLock: false, getLock: false, viewType: this.viewType
            };

            this.currentViewState = newUploadView;

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
            let msg: UserNewUploadMessage;

            if(this.url == '')
            {
                msg = {
                    localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, isLocal: true, editLock: false, fileURL: this.url,
                    fileSize: this.fSize, fileType: this.fType, extension: this.fExtension, fileDesc: this.fDesc
                };
            }
            else
            {
                msg = {
                    localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, isLocal: false, editLock: false, fileURL: this.url,
                    fileSize: this.fSize, fileType: this.fType, extension: this.fExtension, fileDesc: this.fDesc
                };
            }

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

            let clipData: Array<ClipBoardItem> = [];

            if(this.viewType == ViewTypes.IMAGE)
            {
                // TODO: Push image stream & generic file
            }
            else if(this.viewType == ViewTypes.VIDEO)
            {
                // TODO: Push video stream & generic file
            }
            else if(this.viewType == ViewTypes.AUDIO)
            {
                // TODO: Push audio stream & generic file
            }
            else if(this.viewType == ViewTypes.FILE)
            {
                // TODO: Push generic file
            }

            clipData.push({ format: 'text/uri-list', data: this.url });
            clipData.push({ format: 'text/plain', data: this.url });

            return clipData;
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

            console.log('Upload recieved server ID');

            if(this.url == '')
            {
                console.log('Setting reader.');
                let self = this;
                let reader = new FileReader();
                this.reader = reader;

                reader.onload = function(e)
                {
                    console.log('Sending data peice: ' + self.currentPlace);

                    // Send START message
                    console.log(reader.result);

                    let payload: UserDataMessage = { piece: reader.result, place: self.currentPlace };
                    let msg: UserMessage = { header: MessageTypes.DATA, payload: payload};

                    self.sendServerMsg(msg);
                };

                // Send START message
                let payload: UserStartUploadMessage = { };
                let msg: UserMessage = { header: MessageTypes.START, payload: payload};

                self.sendServerMsg(msg);
            }
            else
            {
                console.error('URL Already set in upload element.');
            }

            return [];
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

            if(component == ViewComponents.Resize)
            {
                this.isResizing = true;
                this.oldWidth = this.width;
                this.oldHeight = this.height;
                this.startTime = this.updateTime;

                if(subId == ResizeComponents.Right)
                {
                    this.resizeHorz = true;
                    this.resizeVert = false;
                    cursorType =  {cursor: 'ew-resize', url: [], offset: {x: 0, y: 0}};
                }
                else if(subId == ResizeComponents.Bottom)
                {
                    this.resizeHorz = false;
                    this.resizeVert = true;
                    cursorType = {cursor: 'ns-resize', url: [], offset: {x: 0, y: 0}};
                }
                else if(subId == ResizeComponents.Corner)
                {
                    this.resizeHorz = true;
                    this.resizeVert = true;
                    cursorType = {cursor: 'nwse-resize', url: [], offset: {x: 0, y: 0}};
                }

                this.updateView({ isResizing: true });
            }
            else
            {
                this.isMoving = true;
                this.moveStartX = this.x;
                this.moveStartY = this.y;
                this.startTime = this.updateTime;

                cursorType = {cursor: 'move', url: [], offset: {x: 0, y: 0}};

                this.updateView({ isSelected: true, isMoving: true });
                this.isSelected = true;
            }


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
            let palleteChanges: Array<BoardPalleteChange> = [];

            if(this.isResizing)
            {

                let newWidth  = this.resizeHorz ? mouseX - this.x : this.width;
                let newHeight = this.resizeVert ? mouseY - this.y : this.height;

                if(newHeight != this.oldHeight || newWidth != this.oldWidth)
                {
                    this.resize(newWidth, newHeight, new Date());

                    this.hasResized = true;
                }
            }
            else if(this.isMoving)
            {
                this.move(changeX, changeY, new Date());

                this.hasMoved = true;
            }

            retVal.newView = this.currentViewState;

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

            if(this.hasResized)
            {
                this.hasResized = false;

                let msgPayload: ServerResizeElementMessage = { width: this.width, height: this.height, editTime: new Date() };
                let msg: UserMessage = { header: BaseMessageTypes.RESIZE, payload: msgPayload };

                serverMsgs.push(msg);

                retVal.undoOp = () => { return this.resizeOperation(this.oldWidth, this.oldHeight, this.startTime); };
                retVal.redoOp = () => { return this.resizeOperation(this.width, this.height, this.updateTime); };
            }

            this.isResizing = false;
            this.isMoving = false;
            this.updateView({ isMoving: false, isResizing: false });
            retVal.newView = this.currentViewState;
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

            console.log('Upload recieved message: ' + JSON.stringify(message));

            switch(message.header)
            {
                case MessageTypes.ROTATE:
                    let rotMsg: ServerRotateMessage = message.payload as ServerRotateMessage;
                    this.rotation = rotMsg.rotation;
                    this.updateView({ rotation: this.rotation });
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.DATA:
                    this.sendFileData(message.payload as ServerDataMessage);
                    break;
                case MessageTypes.DONE:
                    this.uploadComplete(message.payload as ServerCompleteMessage);
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.VIEWTYPE:
                    let viewMsg =  message.payload as ServerViewTypeMessage;
                    this.viewType = viewMsg.viewType;
                    this.updateView({ viewType: this.viewType, isLoading: false });
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.UPDATE:
                    let updateMsg =  message.payload as ServerUpdateMessage;
                    this.updateView({ percentUp: updateMsg.percent });
                    newView = this.currentViewState as ViewState;
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

        private updateProgress(percent: number)
        {
            this.updateView({ percentUp: percent });
        }

        private uploadComplete(message: ServerCompleteMessage)
        {
            this.url = message.fileURL;
            this.updateView({ percentUp: 100, isLoading: false, URL: message.fileURL });
        }

        private rotate()
        {
            this.rotation += 90;

            if(this.rotation >= 360)
            {
                this.rotation = 0;
            }

            this.updateView({ rotation: this.rotation });

            let msg : UserRotateMessage = { rotation: this.rotation };

            return msg;
        }

        private sendFileData(message: ServerDataMessage)
        {
            this.updateProgress(message.percent);
            let nplace = message.place * 65536;
            let newFile = this.file.slice(nplace, nplace + Math.min(65536, (this.file.size - nplace)));

            this.currentPlace = message.place;

            console.log('Sending File piece: ' + (message.place + 1) + ' out of ' + (Math.floor(this.file.size / 65536) + 1));
            this.reader.readAsArrayBuffer(newFile);
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponent(Upload.MODENAME, Upload.Element, Upload.Pallete);
