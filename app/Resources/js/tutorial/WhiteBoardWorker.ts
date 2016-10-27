/// <reference path="../typings/lib.webworker.d.ts" />

/** The base class for whiteboard elements.
  *
  * Whiteboard components will inherit this to produce addins that allow specific 'draw' functionality.
  * This is the portion that is run on the worker thread and not the UI thread. This definition is nat availible to the UI thread.
  */
abstract class BoardElement {
    serverId: number;
    readonly id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    user: number;
    updateTime: Date;
    isDeleted: boolean;
    type: string;
    opBuffer: Array<UserMessage>;
    hoverTimer: number;
    infoElement: number;
    operationStack: Array<Operation>;
    operationPos: number;
    isSelected: boolean;
    isComplete: boolean;
    isEditing: boolean;

    currentViewState: ComponentViewState;

    // Callback Functions for Internal Element Induced Updates
    sendServerMsg: (msg: UserMessage) => void;
    createAlert: (header: string, message: string) => void;
    createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) => void;
    updateBoardView: (newView: ComponentViewState) => void;
    getAudioStream: (id: number) => void;
    getVideoStream: (id: number) => void;

    /** Constructor for the base board elements.
     *
     * This should be called by derived classes.
     *
     * @param {string} type - The typename for this element, this is defined as a constant in components.
     * @param {number} id - The local id for this element (This is provided by the controller).
     * @param {number} x - The minimum horizontal position of this element within the whiteboard.
     * @param {number} y - The minimum vertical position of this element within the whiteboard.
     * @param {number} width - The maxium horizontal extent of this element.
     * @param {number} height - The maxium vertical extent of this element.
     * @param {number} userId - The ID of the user who created (owns) this element. Current users ID if it was drawn here or will be provided by server.
     * @param {ElementCallbacks} callbacks - The controller callbacks provided to this element, these allow for internal element induced updates.
     * @param {number} [serverId] - The server ID for this element. This will be provided when this element is created from a server message.
     * @param {Date} [updateTime] - The last update time for this element. This will be provided when this element is created from a server message.
     */
    constructor(type: string, id: number, x: number, y: number, width: number, height: number, userId: number,
        callbacks: ElementCallbacks, serverId?: number, updateTime?: Date)
    {
        this.id = id;
        this.type = type;
        this.user = userId;
        this.sendServerMsg = callbacks.sendServerMsg;
        this.createAlert = callbacks.createAlert;
        this.createInfo = callbacks.createInfo;
        this.updateBoardView = callbacks.updateBoardView;
        this.getAudioStream = callbacks.getAudioStream;
        this.getVideoStream = callbacks.getVideoStream;
        this.serverId = serverId;
        this.opBuffer = [];
        this.infoElement = -1;
        this.isEditing = false;
        this.isSelected = false;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        if(updateTime)
        {
            this.updateTime = updateTime;
        }
        else
        {
            this.updateTime = new Date();
        }
    }

    /** Update the view state of this object.
     *
     * This creates a new view state object with the paramaters supplied in the JSON object, all other parameters are set from the previous state.
     *
     * @param {JSON Object} updatedParams - The parameters to be updated and their new values supplied as { x: newX, etc... }
     *
     * @return {ComponentViewState} The new view state
     */
    protected updateView(updatedParams: Object)
    {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    }

    /**   Get the current view state for this element.
     *
     *    @return {ComponentViewState} The view state of this element given it's current internal state
     */
    public getCurrentViewState()
    {
        return this.currentViewState;
    }

    /** Handle internal element behaviour after another user edits this element.
     *
     * This will remove the internal undo/redo buffer to preserve integrity.
     */
    protected remoteEdit()
    {
        this.operationPos = 0;
        this.operationStack = [];
    }

    /**
     *
     *
     */
    protected getDefaultInputReturn()
    {
        let retVal: ElementInputReturn =
        {
            newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: this.isSelected,
            newViewCentre: null, infoMessage: null, alertMessage: null, wasDelete: null, wasRestore: null, move: null
        };

        return retVal;
    }

    /**
     *
     *
     */
    protected checkForServerId(messages: Array<UserMessage>)
    {
        if(!this.serverId)
        {
            for(let i = 0; i < messages.length; i++)
            {
                console.log('No serverId, adding message to buffer.');
                this.opBuffer.push(messages[i]);
            }

            return [];
        }
        else
        {
            return messages;
        }
    }

    /**   Undo the last internal state edit
     *
     *    @return {ElementUndoRedoReturn} An object containing: the new view state, messages to be sent to the comm server,
     *    required changes to the pallete state
     */
    public handleUndo()
    {
        let retVal: ElementUndoRedoReturn = null;

        // Undo item operation at current stack position
        if(this.operationPos > 0)
        {
            retVal = this.operationStack[--this.operationPos].undo();
        }

        return retVal;
    }

    /**   Redo the last undone internal state edit.
     *
     *    @return {ElementUndoRedoReturn} An object containing: the new view state, messages to be sent to the comm server
     *    required changes to the pallete state
     */
    public handleRedo()
    {
        let retVal: ElementUndoRedoReturn = null;

        // Redo operation at current stack position
        if(this.operationPos < this.operationStack.length)
        {
            retVal = this.operationStack[this.operationPos++].redo();
        }

        return retVal;
    }

    /**
     *
     *
     */
    abstract setServerId(id: number): Array<UserMessage>;

    /**
     *
     *
     */
    abstract getNewMsg(): UserNewElementPayload;

    /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
     *
     *    Change only when sub-components require updating.
     *
     *    @return {ComponentViewState} The new view state of this element.
     */
    public erase()
    {
        this.isDeleted = true;

        return this.currentViewState;
    }

    /**   Sets this item as not deleted and process any sub-components as required, returning the new view state.
     *
     *    Change only when sub-components require updating.
     *
     *    @return {ComponentViewState} The new view state of this element.
     */
    public restore()
    {
        this.isDeleted = false;

        return this.currentViewState;
    }

    /** Handle the basic move behaviour.
     *
     *
     */
    protected move(changeX: number, changeY: number, updateTime: Date)
    {
        this.x += changeX;
        this.y += changeY;
        this.updateTime = updateTime;

        this.updateView({ x: this.x, y: this.y, updateTime: updateTime });
    }

    /**
     *
     *
     */
    abstract elementErase(): ElementUndoRedoReturn;
    /**
     *
     *
     */
    abstract elementRestore(): ElementUndoRedoReturn;
    /**
     *
     *
     */
    abstract handleErase(): ElementInputReturn;

    /**
     *
     *
     */
    abstract handleMouseDown(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputStartReturn;
    /**
     *
     *
     */
    abstract handleMouseMove(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    /**
     *
     *
     */
    abstract handleMouseUp(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    /**
     *
     *
     */
    abstract handleMouseClick(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleDoubleClick(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleTouchStart(e: TouchEvent, localTouches: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputStartReturn;
    abstract handleTouchMove(e: TouchEvent, touchChange: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleTouchEnd(e: TouchEvent, localTouches: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleTouchCancel(e: TouchEvent, localTouches: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;

    abstract handleBoardMouseDown(e: MouseEvent, x: number, y: number, palleteState: BoardPallete): ElementInputStartReturn;
    abstract handleBoardMouseMove(e: MouseEvent, changeX: number, changeY: number, mouseX: number, mouseY: number, palleteState: BoardPallete):
        ElementInputReturn;
    abstract handleBoardMouseUp(e: MouseEvent, x: number, y: number, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardTouchStart(e: TouchEvent, touches: Array<Point>, palleteState: BoardPallete): ElementInputStartReturn;
    abstract handleBoardTouchMove(e: TouchEvent, toucheChange: Array<Point>, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardTouchEnd(e: TouchEvent, touches: Array<Point>, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardTouchCancel(e: TouchEvent, touches: Array<Point>, palleteState: BoardPallete): ElementInputReturn;
    abstract handleKeyPress(e: KeyboardEvent, input: string, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCopy(e: ClipboardEvent, palleteState: BoardPallete): void;
    abstract handlePaste(e: ClipboardEvent, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCut(e: ClipboardEvent, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCustomContext(item: number, palleteState: BoardPallete): ElementInputReturn;

    abstract handleServerMessage(message): ElementMessageReturn;

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

    abstract handleStartEdit(): ElementInputReturn;
    abstract handleEndEdit(): ElementInputReturn;

    abstract handleHover(): HoverMessage;

    abstract handlePalleteChange(pallete: BoardPallete, change: BoardPalleteChange): ElementPalleteReturn;

    abstract audioStream(stream: MediaStream): void;
    abstract videoStream(stream: MediaStream): void;

    abstract startMove(): ComponentViewState;
    abstract handleMove(changeX: number, changeY: number): ComponentViewState;
    abstract endMove(): ElementMoveReturn;
}

/**
 *
 *
 */
abstract class BoardPallete
{
    /**
     *
     */
    currentViewState: BoardPalleteViewState;

    /**
     *
     *
     */
    abstract getCurrentViewState() : BoardPalleteViewState;

    /** Update the view state of this object.
     *
     * This creates a new view state object with the paramaters supplied in the JSON object, all other parameters are set from the previous state.
     *
     * @param {JSON Object} updatedParams - The parameters to be updated and their new values supplied as { x: newX, etc... }
     *
     * @return {ComponentViewState} The new view state
     */
    protected updateView(updatedParams: Object)
    {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    }

    abstract handleChange(changeMsg: BoardPalleteChange) : BoardPalleteViewState;

    abstract getCursor() : ElementCursor;
}

/** Local namespace abstraction.
  * This is to keep typescript happy, enum definitions must be kept on the worker and main UI thread. Typescript sees this as a conflict.
  * Hence this namespace will keep these definitions separate for the compiler.
  */
namespace LocalAbstraction
{
    /**
     *
     *
     */
    const BoardModes = {
        SELECT: 'SELECT',
        ERASE: 'ERASE'
    }

    /**
     *
     *
     */
    const enum WorkerMessageTypes {
        UPDATEVIEW,
        SETVBOX,
        AUDIOSTREAM,
        VIDEOSTREAM,
        NEWVIEWCENTRE,
        SETSELECT,
        ELEMENTMESSAGE,
        ELEMENTVIEW,
        ELEMENTDELETE,
        NEWALERT,
        REMOVEALERT,
        NEWINFO,
        REMOVEINFO
    }

    /**
     *
     *
     */
    const enum ControllerMessageTypes {
        START,
        SETOPTIONS,
        REGISTER,
        MODECHANGE,
        AUDIOSTREAM,
        VIDEOSTREAM,
        NEWELEMENT,
        ELEMENTID,
        BATCHMOVE,
        BATCHDELETE,
        BATCHRESTORE,
        ELEMENTMESSAGE,
        ELEMENTMOUSEOVER,
        ELEMENTMOUSEOUT,
        ELEMENTMOUSEDOWN,
        ELEMENTERASE,
        ELEMENTMOUSEMOVE,
        ELEMENTMOUSEUP,
        ELEMENTMOUSECLICK,
        ELEMENTMOUSEDBLCLICK,
        ELEMENTTOUCHSTART,
        ELEMENTTOUCHMOVE,
        ELEMENTTOUCHEND,
        ELEMENTTOUCHCANCEL,
        ELEMENTDRAG,
        ELEMENTDROP,
        MOUSEDOWN,
        MOUSEMOVE,
        MOUSEUP,
        MOUSECLICK,
        TOUCHSTART,
        TOUCHMOVE,
        TOUCHEND,
        TOUCHCANCEL,
        KEYBOARDINPUT,
        UNDO,
        REDO,
        PALLETECHANGE,
        LEAVE,
        ERROR
    }

    /** The controller class for the whiteboard that runs on the worker thread.
     *
     * This handles the whiteboard elements by managing messages between threads and handling basic behaviours.
     */
    class WhiteBoardWorker
    {
        isHost: boolean = false;
        userId: number  = 0;
        allowAllEdit: boolean = false;
        allowUserEdit: boolean = false;
        controller;
        components: Array<WorkerComponent> = [];

        isPoint:      boolean      = true;
        prevX:        number       = 0;
        prevY:        number       = 0;
        prevTouch:    TouchList;

        groupStartX:  number       = 0;
        groupStartY:  number       = 0;

        currentHover:   number  = -1;
        blockAlert:     boolean = false;
        selectDrag:     boolean = false;
        currSelect:     Array<number> = [];
        currentEdit:    number = -1;
        groupMoving:    boolean = false;
        groupMoved:     boolean = false;

        touchStartHandled:  boolean = false;

        operationStack: Array<WhiteBoardOperation> = [];
        operationPos:   number = 0;

        elementDict:  Array<number>       = [];
        boardElems:   Array<BoardElement> = [];
        infoElems:    Array<InfoMessage>  = [];

        elementUpdateBuffer = [];
        socketMessageBuffer = [];
        alertBuffer = [];
        infoBuffer = [];
        removeInfoBuffer = [];
        deleteBuffer = [];
        audioRequests = [];
        videoRequests = [];
        viewUpdateBuffer = null;
        willRemoveAlert = false;
        newViewCentre = null;
        newViewBox = null;

        elementMoves = [];
        elementDeletes = [];
        elementRestores = [];

        /** Construct the whiteboard controller.
         *
         * This is a singleton within the application.
         *
         * @param {boolean} isHost - A value indicating whether this user is the session host. Provided by the server on page load.
         * @param {number} userId - The user ID for this user.
         * @param {boolean} allEdit - A value indicating whether all users may edit all the elements in this session.
         * @param {boolean} userEdit - A value indicating whether this user may edit any elements in this session.
         * @param {Scope} workerContext - The global context for this web worker.
         */
        constructor(isHost: boolean, userId: number, allEdit: boolean, userEdit: boolean, workerContext)
        {
            this.isHost = isHost;
            this.userId = userId;
            this.allowAllEdit = allEdit;
            this.allowUserEdit = userEdit;
            this.controller = workerContext;
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //                                                                                                                                                    //
        //                                                                                                                                                    //
        // STATE MODIFIERS (INTERNAL)                                                                                                                         //
        //                                                                                                                                                    //
        //                                                                                                                                                    //
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /** Update the view state, updates will be put into a buffer ready to be posted to the UI thread as one update.
         *
         * @param {Object} updates - A JSON object containing the view state parameters to be updated.
         */
        updateView(updates)
        {
            if(this.viewUpdateBuffer == null)
            {
                this.viewUpdateBuffer = {};
            }

            Object.assign(this.viewUpdateBuffer, updates);
        }

        /** Update the view state of an element, updates will be put into a buffer ready to be posted to the UI thread as one update.
         *
         * @param {number} id - The local id for this element.
         * @param {ComponentViewState} newView - The new view for this element.
         */
        setElementView(id: number, newView: ComponentViewState)
        {
            if(newView == null)
            {
                throw "NULL ELEMENT VIEW GIVEN";
            }

            this.elementUpdateBuffer.push({ id: id, view: newView });
        }

        setRoomOptions(allowAllEdit: boolean, allowUserEdit: boolean)
        {
            this.allowAllEdit = allowAllEdit;
            this.allowUserEdit = allowUserEdit;
        }

        sendMessage(type: string, message)
        {
            this.socketMessageBuffer.push({ type: type, message: message });
        }

        getAudioStream(id: number)
        {
            this.audioRequests.push(id);
        }

        setAudioStream(id: number)
        {
            /* TODO */
        }

        getVideoStream(id: number)
        {
            this.videoRequests.push(id);
        }

        setVideoStream(id: number)
        {
            /* TODO */
        }

        newAlert(type: string, message: string)
        {
            let newMsg : AlertElement = { type: type, message: message };

            this.alertBuffer.push(newMsg);
        }

        removeAlert()
        {
            this.willRemoveAlert = true;
        }

        deleteElement(id: number)
        {
            this.deleteBuffer.push(id);
        }

        setMode(newMode: string)
        {
            let palleteView: BoardPalleteViewState = {};
            let cursor: ElementCursor = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };

            if(newMode != BoardModes.SELECT && newMode != BoardModes.ERASE)
            {
                palleteView = this.components[newMode].pallete.getCurrentViewState();
                cursor = this.components[newMode].pallete.getCursor();
            }

            this.updateView(
            {
                mode: newMode, palleteState: palleteView, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset
            });
        }

        drawRect()
        {
            /* TODO */
        }

        drawCurve()
        {
            /* TODO */
        }

        drawElement()
        {
            /* TODO */
        }

        sendElementMessage(id: number, type: string, message: UserMessage)
        {
            let serverId = this.getBoardElement(id).serverId;
            let msg: UserMessageContainer = { id: serverId, type: type, payload: message };
            this.sendMessage('MSG-COMPONENT', msg);
        }

        selectGroup(ids: Array<number>)
        {
            for(let i = 0; i < this.currSelect.length; i++)
            {
                let elem = this.getBoardElement(this.currSelect[i]);
                let newView = elem.handleDeselect();

                this.setElementView(elem.id, newView);
            }

            for(let i = 0; i < ids.length; i++)
            {
                let elem = this.getBoardElement(ids[i]);
                if(!elem.isDeleted)
                {
                    let newView = elem.handleSelect();
                    this.currSelect.push(elem.id);
                    this.setElementView(elem.id, newView);
                }
            }
        }

        handleElementOperation(id: number, undoOp: () => ElementUndoRedoReturn, redoOp: () => ElementUndoRedoReturn)
        {
            if(undoOp && redoOp)
            {
                this.newOperation(id, undoOp, redoOp);
            }
            else if(undoOp || redoOp)
            {
                console.error('Element provided either undo or redo operation. It must specify neither or both.');
            }
        }

        handleElementMessages(id: number, type: string, messages: Array<UserMessage>)
        {
            for(let i = 0; i < messages.length; i++)
            {
                this.sendElementMessage(id, type, messages[i]);
            }
        }

        handleMouseElementSelect(e: MouseEvent, elem: BoardElement, isSelected: boolean, cursor?: ElementCursor)
        {
            if(isSelected)
            {
                let alreadySelected = false;

                for(let i = 0; i < this.currSelect.length; i++)
                {
                    if(this.currSelect[i] == elem.id)
                    {
                        alreadySelected = true;
                    }
                }

                if(!alreadySelected)
                {
                    if(e.ctrlKey)
                    {
                        this.currSelect.push(elem.id);
                    }
                    else
                    {
                        for(let i = 0; i < this.currSelect.length; i++)
                        {
                            if(this.currSelect[i] != elem.id)
                            {
                                let selElem = this.getBoardElement(this.currSelect[i]);
                                let selElemView = selElem.handleDeselect();
                                this.setElementView(selElem.id, selElemView);
                            }
                        }
                        this.currSelect = [];
                        this.currSelect.push(elem.id);
                    }
                }

                if(this.currSelect.length == 1 && cursor)
                {
                    this.updateView({ cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                }
            }
            else
            {
                if(this.currSelect.length == 1 && this.currSelect[0] == elem.id)
                {
                    this.updateView({ cursor: 'auto', cursorURL: [], cursorOffset: { x: 0, y: 0 } });
                    this.currSelect = [];
                }
                else
                {
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        if(this.currSelect[i] == elem.id)
                        {
                            this.currSelect.splice(i, 1);
                        }
                    }
                }
            }
        }

        handleTouchElementSelect(e: TouchEvent, elem: BoardElement, isSelected: boolean, cursor?: ElementCursor)
        {
            if(isSelected)
            {
                if(e.ctrlKey)
                {
                    let alreadySelected = false;
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        if(this.currSelect[i] == elem.id)
                        {
                            alreadySelected = true;
                        }
                    }

                    if(!alreadySelected)
                    {
                        this.currSelect.push(elem.id);
                    }
                }
                else
                {
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        if(this.currSelect[i] != elem.id)
                        {
                            let selElem = this.getBoardElement(this.currSelect[i]);
                            let selElemView = selElem.handleDeselect();
                            this.setElementView(selElem.id, selElemView);
                        }
                    }

                    this.currSelect = [];
                    this.currSelect.push(elem.id);
                }

                if(this.currSelect.length == 1 && cursor)
                {
                    this.updateView({ cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                }
            }
            else
            {
                for(let i = 0; i < this.currSelect.length; i++)
                {
                    if(this.currSelect[i] == elem.id)
                    {
                        this.currSelect.splice(i, 1);
                    }
                }
            }
        }

        handleElementPalleteChanges(elem: BoardElement, changes: Array<BoardPalleteChange>)
        {
            for(let j = 0; j < changes.length; j++)
            {
                let change = changes[j];
                this.components[elem.type].pallete.handleChange(change);

                for(let i = 0; i < this.currSelect.length; i++)
                {
                    let selElem = this.getBoardElement(this.currSelect[i]);
                    if(selElem.id != elem.id && selElem.type == elem.type)
                    {
                        let retVal = selElem.handlePalleteChange(this.components[elem.type].pallete, changes[j]);

                        this.handleElementMessages(selElem.id, selElem.type, retVal.serverMessages);
                        this.handleElementOperation(selElem.id, retVal.undoOp, retVal.redoOp);
                        this.setElementView(selElem.id, retVal.newView);
                    }
                }
            }
        }

        handleElementNewViewCentre(x: number, y: number)
        {
            this.newViewCentre = { x: x, y: y };
        }

        handleRemoteEdit(id: number)
        {
            // Remove all operations related to this item from operation buffer
            for(let i = 0; i < this.operationStack.length; i++)
            {
                if(this.operationStack[i].ids.indexOf(id) != -1)
                {
                    // Replace operation with one that will just select the item (better user interation that removing or doing nothing)
                    let newOp: WhiteBoardOperation =
                    {
                        ids: this.operationStack[i].ids,
                        undos: [((elemIds) =>
                        {
                            return () => { this.selectGroup(elemIds); return null; };
                        })(this.operationStack[i].ids)],
                        redos: [((elemIds) =>
                        {
                            return () => { this.selectGroup(elemIds); return null; };
                        })(this.operationStack[i].ids)]
                    };

                    this.operationStack.splice(i, 1, newOp);
                }
            }
        }

        handleInfoMessage(data: InfoMessageData)
        {
            /* TODO: */
        }

        handleAlertMessage(msg: AlertMessageData)
        {
            if(msg)
            {
                this.newAlert(msg.header, msg.message);
            }
        }

        startMove(startX: number, startY: number)
        {
            this.groupStartX = startX;
            this.groupStartY = startY;
            this.groupMoving = true;
            this.updateView({ cursor: 'move' });
            for(let i = 0; i < this.currSelect.length; i++)
            {
                let elem = this.getBoardElement(this.currSelect[i]);
                let retVal = elem.startMove();
            }
        }

        moveGroup(x: number, y: number, editTime: Date)
        {
            // Loop over currently selected items, determine type and use appropriate method
            for(let i = 0; i < this.currSelect.length; i++)
            {
                let elem = this.getBoardElement(this.currSelect[i]);

                let elemView = elem.handleMove(x, y);
                this.setElementView(elem.id, elemView);
            }
        }

        endMove(endX: number, endY: number)
        {
            this.groupMoving = false;
            this.updateView({ cursor: 'auto' });

            let undoOpList = [];
            let redoOpList = [];

            for(let i = 0; i < this.currSelect.length; i++)
            {
                let elem = this.getBoardElement(this.currSelect[i]);
                let retVal = elem.endMove();

                let undoOp = ((element, changeX, changeY) =>
                {
                    return () =>
                    {
                        element.handleMove(-changeX, -changeY);
                        let ret = element.endMove();
                        this.handleElementMessages(element.id, element.type, ret.serverMessages);
                        if(element.serverId != null && element.serverId != undefined)
                        {
                            if(ret.move)
                            {
                                this.elementMoves.push({ id: element.serverId, x: ret.move.x, y: ret.move.y });
                            }
                        }
                        else
                        {
                            if(ret.move)
                            {
                                element.opBuffer.push(ret.move.message);
                            }
                        }
                        this.setElementView(element.id, ret.newView);
                    };
                })(elem, endX - this.groupStartX, endY - this.groupStartY);
                let redoOp = ((element, changeX, changeY) =>
                {
                    return () =>
                    {
                        element.handleMove(changeX, changeY);
                        let ret = element.endMove();
                        this.handleElementMessages(element.id, element.type, ret.serverMessages);
                        if(element.serverId != null && element.serverId != undefined)
                        {
                            if(ret.move)
                            {
                                this.elementMoves.push({ id: element.serverId, x: ret.move.x, y: ret.move.y });
                            }
                        }
                        else
                        {
                            if(ret.move)
                            {
                                element.opBuffer.push(ret.move.message);
                            }
                        }
                        this.setElementView(element.id, ret.newView);
                    };
                })(elem, endX - this.groupStartX, endY - this.groupStartY);

                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                }
                this.setElementView(elem.id, retVal.newView);

                undoOpList.push(undoOp);
                redoOpList.push(redoOp);
            }

            // Remove redo operations ahead of current position
            this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);

            // Add new operation to the stack
            let newOp: WhiteBoardOperation = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
            this.operationStack[this.operationPos++] = newOp;
        }

        selectElement(id: number)
        {
            let elem = this.getBoardElement(id);

            if(!elem.isDeleted)
            {
                let newElemView = elem.handleSelect();
                this.setElementView(id, newElemView);
            }
        }

        deselectElement(id: number)
        {
            let elem = this.getBoardElement(id);
            let newElemView = elem.handleDeselect();
            this.setElementView(elem.id, newElemView);
        }

        startEditElement(id: number)
        {
            /* TODO: Change board mode to this mode, check for current mode and store it. */

            this.currentEdit = id;
            let elem = this.getBoardElement(id);

            if(!elem.isDeleted)
            {
                let retVal = elem.handleStartEdit();

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }

                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        }

        endEditElement(id: number)
        {
            /* TODO: store previous mode for elements selected for edit and revert back. */

            this.currentEdit = -1;
            let elem = this.getBoardElement(id);
            let retVal = elem.handleEndEdit();

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            if(elem.serverId != null && elem.serverId != undefined)
            {
                if(retVal.move)
                {
                    this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                }
                if(retVal.wasDelete)
                {
                    this.elementDeletes.push(elem.serverId);
                }
                if(retVal.wasRestore)
                {
                    this.elementRestores.push(elem.serverId);
                }
            }
            else
            {
                if(retVal.move)
                {
                    elem.opBuffer.push(retVal.move.message);
                }
                if(retVal.wasDelete)
                {
                    elem.opBuffer.push(retVal.wasDelete.message);
                }
                if(retVal.wasRestore)
                {
                    elem.opBuffer.push(retVal.wasRestore.message);
                }
            }

            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);

            this.currSelect = [];
        }

        addInfoMessage(x: number, y: number, width: number, height: number, header: string, message: string)
        {
            let newInfo: InfoMessage =
            {
                id: -1, x: x, y: y, width: width, height: height, header: header, message: message
            };

            let localId = this.infoElems.length;
            this.infoElems[localId] = newInfo;
            newInfo.id = localId;

            let newInfoView : InfoElement =
            {
                x: x, y: y, width: width, height: height, header: header, message: message
            };

            this.infoBuffer.push(newInfoView);

            return localId;
        }

        removeInfoMessage(id: number)
        {
            this.removeInfoBuffer.push(id);
        }

        setViewBox(panX: number, panY: number, scaleF: number)
        {
            this.newViewBox = { panX: panX, panY: panY, scaleF: scaleF };
        }

        /***********************************************************************************************************************************************************
         *
         *
         *
         * INTERNAL FUNCTIONS
         *
         *
         *
         **********************************************************************************************************************************************************/
        getBoardElement(id: number)
        {
            if(this.boardElems[id])
            {
                return this.boardElems[id];
            }
            else
            {
                console.error('Attempted to get a board element that does not exist.');
                throw 'ELEMENT DOES NOT EXIST';
            }
        }

        getInfoMessage(id: number)
        {
            return this.infoElems[id];
        }

        undo()
        {
            // Undo operation at current stack position
            if(this.operationPos > 0)
            {
                let operation = this.operationStack[--this.operationPos];

                for(let i = 0; i < operation.undos.length; i++)
                {
                    let retVal: ElementUndoRedoReturn = operation.undos[i]();
                    if(retVal)
                    {
                        let elem = this.getBoardElement(retVal.id);

                        this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                        if(elem.serverId != null && elem.serverId != undefined)
                        {
                            if(retVal.move)
                            {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if(retVal.wasDelete)
                            {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if(retVal.wasRestore)
                            {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else
                        {
                            if(retVal.move)
                            {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if(retVal.wasDelete)
                            {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if(retVal.wasRestore)
                            {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        this.setElementView(retVal.id, retVal.newView);
                        if(retVal.newViewCentre)
                        {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        if(retVal.wasDelete)
                        {
                            this.deleteElement(elem.id);
                        }
                    }
                }
            }
        }

        redo()
        {
            // Redo operation at current stack position
            if(this.operationPos < this.operationStack.length)
            {
                let operation =  this.operationStack[this.operationPos++];
                for(let i = 0; i < operation.redos.length; i++)
                {
                    let retVal: ElementUndoRedoReturn = operation.redos[i]();

                    if(retVal)
                    {
                        let elem = this.getBoardElement(retVal.id);
                        this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                        if(elem.serverId != null && elem.serverId != undefined)
                        {
                            if(retVal.move)
                            {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if(retVal.wasDelete)
                            {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if(retVal.wasRestore)
                            {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else
                        {
                            if(retVal.move)
                            {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if(retVal.wasDelete)
                            {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if(retVal.wasRestore)
                            {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        this.setElementView(retVal.id, retVal.newView);
                        if(retVal.newViewCentre)
                        {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        if(retVal.wasDelete)
                        {
                            this.deleteElement(elem.id);
                        }
                    }
                }
            }
        }

        newOperation(itemId:  number, undoOp: () => ElementUndoRedoReturn, redoOp: () => ElementUndoRedoReturn)
        {
            // Remove redo operations ahead of current position
            this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);

            // Add new operation to the stack
            let newOp: WhiteBoardOperation = { ids: [itemId], undos: [undoOp], redos: [redoOp] };
            this.operationStack[this.operationPos++] = newOp;
        }

        undoItemEdit(id: number)
        {
            let elem = this.getBoardElement(id);

            // Undo item operation at current stack position
            if(!elem.isDeleted && elem.operationPos > 0)
            {
                elem.operationStack[--elem.operationPos].undo();
            }
        }

        redoItemEdit(id: number)
        {
            let elem = this.getBoardElement(id);

            // Redo operation at current stack position
            if(!elem.isDeleted && elem.operationPos < elem.operationStack.length)
            {
                elem.operationStack[elem.operationPos++].redo();
            }
        }

        addHoverInfo(id: number, mouseX: number, mouseY: number)
        {
            let elem = this.getBoardElement(id);


            let infoId = this.addInfoMessage(mouseX, mouseX, 200, 200, 'Test Message', 'User ID: ' + elem.user);

            elem.infoElement = infoId;
        }

        removeHoverInfo(id: number)
        {
            let elem = this.getBoardElement(id);
            elem.infoElement = -1;
            this.currentHover = -1;
            this.removeInfoMessage(elem.infoElement);
        }

        infoMessageTimeout(id: number, mouseX: number, mouseY: number, self)
        {
            this.addHoverInfo(id, mouseX, mouseY);
        }

        sendNewElement(msg: UserNewElementMessage)
        {
            this.sendMessage('NEW-ELEMENT', msg);
        }

        eraseElement(id: number)
        {
            let elem = this.getBoardElement(id);
            if(this.isHost || this.allowAllEdit || (this.userId == elem.user && this.allowUserEdit))
            {
                let retVal = elem.handleErase();

                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.deleteElement(id);

                if(this.currentHover == id)
                {
                    clearTimeout(elem.hoverTimer);
                    this.removeHoverInfo(this.currentHover);
                }
            }
        }

        /***********************************************************************************************************************************************************
         *
         *
         *
         * CONTROLLER MESSAGE METHODS
         *
         *
         *
         **********************************************************************************************************************************************************/
        newElement(data: ServerMessageContainer)
        {
            if(this.elementDict[data.serverId] == undefined || this.elementDict[data.serverId] == null)
            {
                if(this.components[data.type])
                {
                    let localId = this.boardElems.length;
                    let callbacks: ElementCallbacks =
                    {
                        sendServerMsg: ((id: number, type: string) =>
                        { return (msg: UserMessage) => { this.sendElementMessage(id, type, msg) }; })(localId, data.type),
                        createAlert: (header: string, message: string) => {},
                        createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) =>
                        { return this.addInfoMessage(x, y, width, height, header, message); },
                        removeInfo: (id: number) => { this.removeInfoMessage(id); },
                        updateBoardView: ((id: number) =>
                        { return (newView: ComponentViewState) => { this.setElementView(id, newView); }; })(localId),
                        getAudioStream: () => { return this.getAudioStream(localId); },
                        getVideoStream: () => { return this.getVideoStream(localId); }
                    }
                    let creationArg: CreationData = { id: localId, userId: data.userId, callbacks: callbacks, serverMsg: data.payload, serverId: data.serverId };
                    this.boardElems[localId] = this.components[data.type].Element.createElement(creationArg);
                    this.elementDict[data.serverId] = localId;

                    this.setElementView(this.boardElems[localId].id, this.boardElems[localId].getCurrentViewState());
                }
                else
                {
                    console.error('Unrecognized type.');
                }
            }
        }

        elementID(data: ServerIdMessage)
        {
            this.elementDict[data.serverId] = data.localId;
            let elem = this.boardElems[data.localId];
            let retVal = elem.setServerId(data.serverId);

            this.handleElementMessages(elem.id, elem.type, retVal);
        }

        batchMove(moveData: Array<{id: number, x: number, y: number, editTime: Date}>)
        {
            for(let i = 0; i < moveData.length; i++)
            {
                let elem = this.getBoardElement(this.elementDict[moveData[i].id]);
                let retVal = elem.handleMove(moveData[i].x - elem.x, moveData[i].y - elem.y);

                this.setElementView(elem.id, retVal);
            }
        }

        batchDelete(serverIds: Array<number>)
        {
            for(let i = 0; i < serverIds.length; i++)
            {
                let elem = this.getBoardElement(this.elementDict[serverIds[i]]);
                elem.erase();
                this.deleteElement(elem.id);
            }
        }

        batchRestore(serverIds: Array<number>)
        {
            for(let i = 0; i < serverIds.length; i++)
            {
                let elem = this.getBoardElement(this.elementDict[serverIds[i]]);
                let newView = elem.restore();
                this.setElementView(elem.id, newView);
            }
        }

        elementMessage(data: ServerMessageContainer)
        {
            if(this.elementDict[data.serverId] != undefined && this.elementDict[data.serverId] != null)
            {
                let elem = this.getBoardElement(this.elementDict[data.serverId])
                if(elem.type == data.type)
                {
                    let retVal = elem.handleServerMessage(data.payload);

                    if(retVal.wasEdit)
                    {
                        this.handleRemoteEdit(elem.id);
                    }

                    this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    this.setElementView(elem.id, retVal.newView);
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);

                    if(retVal.wasDelete)
                    {
                        this.deleteElement(elem.id);

                        // Remove from current selection
                        if(this.currSelect.indexOf(elem.id))
                        {
                            this.currSelect.splice(this.currSelect.indexOf(elem.id), 1);
                        }

                        if(this.currentHover == elem.id)
                        {
                            clearTimeout(elem.hoverTimer);
                            this.removeHoverInfo(this.currentHover);
                        }

                        for(let i = 0; i < this.operationStack.length; i++)
                        {
                            if(this.operationStack[i].ids.indexOf(elem.id) != -1)
                            {
                                if(this.operationStack[i].ids.length == 1)
                                {
                                    if(i <= this.operationPos)
                                    {
                                        this.operationPos--;
                                    }
                                    // Decrement i to account fot the removal of this item.
                                    this.operationStack.splice(i--, 1);
                                }
                                else
                                {
                                    // Remove the deleted item from the selection.
                                    this.operationStack[i].ids.splice(this.operationStack[i].ids.indexOf(elem.id), 1);

                                    // Replace operation with one that will just select the remaining items.
                                    let newOp: WhiteBoardOperation =
                                    {
                                        ids: this.operationStack[i].ids,
                                        undos: [((elemIds) =>
                                        {
                                            return () => { this.selectGroup(elemIds); return null; };
                                        })(this.operationStack[i].ids.slice())],
                                        redos: [((elemIds) =>
                                        {
                                            return () => { this.selectGroup(elemIds); return null; };
                                        })(this.operationStack[i].ids.slice())]
                                    };

                                    this.operationStack.splice(i, 1, newOp);
                                }
                            }
                        }
                    }
                }
                else
                {
                    console.error('Received bad element message.');
                }
            }
            else if(data.type && data.serverId)
            {
                let msg: UserUnknownElement = { type: data.type, id: data.serverId };
                console.log('Unknown element. ID: ' + data.serverId);
                this.sendMessage('UNKNOWN-ELEMENT', msg);
            }
        }

        serverError(message: string)
        {
            this.newAlert('SERVER ERROR', 'A server error has occured, some data in this session may be lost.');
        }

        modeChange(newMode: string)
        {
            if(this.currentEdit != -1)
            {
                this.endEditElement(this.currentEdit);
            }
            else
            {
                for(let i = 0; i < this.currSelect.length; i++)
                {
                    let elem = this.getBoardElement(this.currSelect[i]);

                    let retVal = elem.handleDeselect();
                    this.setElementView(elem.id, retVal);
                }
            }

            this.currSelect = [];
            this.setMode(newMode);
        }

        changeEraseSize(newSize: number)
        {
            let newView = { eraseSize: newSize };
            this.updateView(newView);
        }

        elementMouseOver(id: number, e: MouseEvent)
        {
            let elem = this.getBoardElement(id);
            if(this.currentHover == -1)
            {
                this.currentHover = id;
                elem.hoverTimer = setTimeout(this.infoMessageTimeout.bind(this), 2000, id);
            }
            else
            {
                let prevElem = this.getBoardElement(this.currentHover);
                clearTimeout(prevElem.hoverTimer);
            }

            /* TODO: Allow Element To Set cursor, i.e. pass function. Only do this if mode is SELECT */
        }

        elementMouseOut(id: number, e: MouseEvent)
        {
            let elem = this.getBoardElement(id);

            if(this.currentHover == id)
            {
                clearTimeout(elem.hoverTimer);
                this.removeHoverInfo(this.currentHover);
            }

            /* TODO: Reset cursor */
        }

        elementMouseDown(id: number, e: MouseEvent, mouseX: number, mouseY: number, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);
            if(this.currSelect.length > 1 && elem.isSelected && e.buttons == 1)
            {
                this.startMove(mouseX, mouseY);
            }
            /* TODO: This is too strict for text, need to allow this to go through, but maybe with NOEDIT flag */
            else if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
            {
                let retVal = elem.handleMouseDown(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }

            if(this.currentHover == id)
            {
                clearTimeout(elem.hoverTimer);
                this.removeHoverInfo(this.currentHover);
            }

            this.prevX = mouseX;
            this.prevY = mouseY;
        }

        elementMouseMove(id: number, e: MouseEvent, mouseX: number, mouseY: number, componenet?: number, subId?: number)
        {
            if(!this.groupMoving)
            {
                let elem = this.getBoardElement(id);
                if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
                {
                    let retVal = elem.handleMouseMove(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);

                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if(elem.serverId != null && elem.serverId != undefined)
                    {
                        if(retVal.move)
                        {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if(retVal.wasDelete)
                        {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if(retVal.wasRestore)
                        {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else
                    {
                        if(retVal.move)
                        {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if(retVal.wasDelete)
                        {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if(retVal.wasRestore)
                        {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleMouseElementSelect(e, elem, retVal.isSelected);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                }
            }

            this.prevX = mouseX;
            this.prevY = mouseY;
        }

        elementMouseUp(id: number, e: MouseEvent, mouseX: number, mouseY: number, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);
            if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
            {
                let retVal = elem.handleMouseUp(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        }

        elementMouseClick(id: number, e: MouseEvent, mouseX: number, mouseY: number, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);

            if(this.currentEdit != -1)
            {
                if(this.currentEdit == elem.id)
                {
                    let retVal = elem.handleMouseClick(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);

                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if(elem.serverId != null && elem.serverId != undefined)
                    {
                        if(retVal.move)
                        {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if(retVal.wasDelete)
                        {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if(retVal.wasRestore)
                        {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else
                    {
                        if(retVal.move)
                        {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if(retVal.wasDelete)
                        {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if(retVal.wasRestore)
                        {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }

                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                }
            }
            else
            {
                if(this.currSelect.length == 0 || e.ctrlKey)
                {
                    // Add this item to currently selected items.
                    this.currSelect.push(elem.id);
                    this.selectElement(elem.id);
                }
                else
                {
                    // Deselect everything currently selected.
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];

                    // Add this item to currently selected items.
                    this.currSelect.push(elem.id);
                    this.selectElement(elem.id);

                    /* TODO: Pass through, this will give text selection behaviour without edit */
                }
            }
        }

        elementMouseDoubleClick(id: number, e: MouseEvent, mouseX: number, mouseY: number, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);

            if(this.currentEdit != -1)
            {
                if(this.currentEdit == elem.id)
                {
                    let retVal = elem.handleDoubleClick(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);

                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if(elem.serverId != null && elem.serverId != undefined)
                    {
                        if(retVal.move)
                        {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if(retVal.wasDelete)
                        {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if(retVal.wasRestore)
                        {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else
                    {
                        if(retVal.move)
                        {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if(retVal.wasDelete)
                        {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if(retVal.wasRestore)
                        {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }

                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                }
            }
            else
            {
                if(this.currSelect.length != 0)
                {
                    // Deselect everything currently selected.
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
                }

                if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
                {
                    // Start edit mode
                    this.startEditElement(elem.id);
                }
                else
                {
                    // Add this item to currently selected items.
                    this.currSelect.push(elem.id);
                    this.selectElement(elem.id);

                    /* TODO: Pass through, this will give text selection behaviour without edit */
                }
            }
        }

        elementTouchStart(id: number, e: TouchEvent, boardTouches: Array<BoardTouch>, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);
            if(this.currSelect.length > 1 && elem.isSelected)
            {
                // this.startMove(mouseX, mouseY);
            }
            else if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
            {

                let localTouches: Array<BoardTouch> = [];
                for(let i = 0; i < boardTouches.length; i++)
                {
                    localTouches.push({ x: boardTouches[i].x - elem.x, y: boardTouches[i].y - elem.y, identifer: boardTouches[i].identifer });
                }

                let retVal = elem.handleTouchStart(e, localTouches, this.components[elem.type].pallete, componenet, subId);

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleTouchElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }

            if(this.currentHover == id)
            {
                clearTimeout(elem.hoverTimer);
                this.removeHoverInfo(this.currentHover);
            }

            this.prevTouch = e.touches;
        }

        elementTouchMove(id: number, e: TouchEvent, boardTouches: Array<BoardTouch>, componenet?: number, subId?: number)
        {
            if(!this.groupMoving)
            {
                let elem = this.getBoardElement(id);
                if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
                {
                    let localToucheMoves: Array<BoardTouch> = [];
                    /* TODO: Create array */

                    let elem = this.getBoardElement(id);
                    let retVal = elem.handleTouchMove(e, localToucheMoves, this.components[elem.type].pallete, componenet, subId);

                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if(elem.serverId != null && elem.serverId != undefined)
                    {
                        if(retVal.move)
                        {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if(retVal.wasDelete)
                        {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if(retVal.wasRestore)
                        {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else
                    {
                        if(retVal.move)
                        {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if(retVal.wasDelete)
                        {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if(retVal.wasRestore)
                        {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleTouchElementSelect(e, elem, retVal.isSelected);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                }
            }
            this.prevTouch = e.touches;
        }

        elementTouchEnd(id: number, e: TouchEvent, boardTouches: Array<BoardTouch>, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);
            if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
            {
                let localTouches: Array<BoardTouch> = [];
                for(let i = 0; i < boardTouches.length; i++)
                {
                    localTouches.push({ x: boardTouches[i].x - elem.x, y: boardTouches[i].y - elem.y, identifer: boardTouches[i].identifer });
                }

                let retVal = elem.handleTouchEnd(e, localTouches, this.components[elem.type].pallete, componenet, subId);

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleTouchElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        }

        elementTouchCancel(id: number, e: TouchEvent, boardTouches: Array<BoardTouch>, componenet?: number, subId?: number)
        {
            let elem = this.getBoardElement(id);
            if(this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId))
            {
                let localTouches: Array<BoardTouch> = [];
                for(let i = 0; i < boardTouches.length; i++)
                {
                    localTouches.push({ x: boardTouches[i].x - elem.x, y: boardTouches[i].y - elem.y, identifer: boardTouches[i].identifer });
                }

                let retVal = elem.handleTouchCancel(e, localTouches, this.components[elem.type].pallete, componenet, subId);

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleTouchElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        }

        elementDragOver(id: number, e: DragEvent, componenet?: number, subId?: number)
        {
            /* TODO: */
        }

        elementDrop(id: number, e: DragEvent, componenet?: number, subId?: number)
        {
            /* TODO: */
        }

        mouseDown(e: MouseEvent, mouseX: number, mouseY: number, mode: string)
        {
            if(this.currentEdit != -1)
            {
                // Pass this to currently edited item.
                let elem = this.getBoardElement(this.currentEdit);
                let retVal = elem.handleBoardMouseDown(e, mouseX, mouseY, this.components[elem.type].pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }
            else
            {
                if(this.currSelect.length > 0)
                {
                    // Deselect currently selected items
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
                }
                else
                {
                    if(e.buttons == 1 && mode == BoardModes.SELECT)
                    {
                        this.selectDrag = true;
                    }
                }
            }

            if(this.currentHover != -1)
            {
                let elem = this.getBoardElement(this.currentHover);
                if(elem.infoElement != -1)
                {
                    this.removeHoverInfo(this.currentHover);
                }
                clearTimeout(elem.hoverTimer);
            }

            this.prevX = mouseX;
            this.prevY = mouseY;
        }

        mouseMove(e: MouseEvent, mouseX: number, mouseY: number, mode: string)
        {
            let changeX = mouseX - this.prevX;
            let changeY = mouseY - this.prevY;

            if(this.currentHover != -1)
            {
                let elem = this.getBoardElement(this.currentHover);
                if(elem.infoElement != -1)
                {
                    this.removeHoverInfo(this.currentHover);
                }
                else
                {
                    clearTimeout(elem.hoverTimer);
                    elem.hoverTimer = setTimeout(this.infoMessageTimeout.bind(this), 2000, this.currentHover);
                }
            }

            if(e.buttons == 1)
            {
                if(mode == BoardModes.SELECT)
                {
                    if(this.groupMoving)
                    {
                        this.moveGroup(changeX, changeY, new Date());
                        this.groupMoved = true;
                    }
                    else if(this.currSelect.length == 1)
                    {
                        let elem = this.getBoardElement(this.currSelect[0]);
                        let retVal = elem.handleBoardMouseMove(e, changeX, changeY, mouseX, mouseY, this.components[elem.type].pallete);

                        this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                        this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        if(elem.serverId != null && elem.serverId != undefined)
                        {
                            if(retVal.move)
                            {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if(retVal.wasDelete)
                            {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if(retVal.wasRestore)
                            {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else
                        {
                            if(retVal.move)
                            {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if(retVal.wasDelete)
                            {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if(retVal.wasRestore)
                            {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        if(retVal.newViewCentre)
                        {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        this.handleInfoMessage(retVal.infoMessage);
                        this.handleAlertMessage(retVal.alertMessage);
                        this.setElementView(elem.id, retVal.newView);
                    }
                }
                else if(mode != BoardModes.ERASE)
                {
                    // This is a more strict check than for any current edits. It is slightly more future proof.
                    if(this.currSelect.length == 0)
                    {
                        // Draw a new element of this type.
                        this.drawElement();
                    }
                }
            }

            // Can only have a current edit in a mode other than SELECT or ERASE
            if(this.currentEdit != -1)
            {
                let elem = this.getBoardElement(this.currentEdit);
                let retVal = elem.handleBoardMouseMove(e, changeX, changeY, mouseX, mouseY, this.components[elem.type].pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }

            this.prevX = mouseX;
            this.prevY = mouseY;
        }

        mouseUp(e: MouseEvent, mouseX: number, mouseY: number, downX: number, downY: number, pointList: Array<Point>, mode: string,
            scaleF: number, panX: number, panY: number)
        {
            let rectLeft;
            let rectTop;
            let rectWidth;
            let rectHeight;

            if(this.currSelect.length == 0)
            {
                if(mouseX > downX)
                {
                    rectLeft = downX;
                    rectWidth = mouseX - downX;
                }
                else
                {
                    rectLeft = mouseX;
                    rectWidth = downX - mouseX;
                }

                if(mouseY > downY)
                {
                    rectTop = downY;
                    rectHeight = mouseY - downY;
                }
                else
                {
                    rectTop = mouseY;
                    rectHeight = downY - mouseY;
                }

                let x = rectLeft;
                let y = rectTop;
                let width = rectWidth;
                let height = rectHeight;

                if(mode == BoardModes.SELECT)
                {
                    // Cycle through board elements and select those within the rectangle
                    this.boardElems.forEach((elem: BoardElement) =>
                    {
                        if(!elem.isDeleted && elem.isComplete)
                        {
                            if(elem.x >= rectLeft && elem.y >= rectTop)
                            {
                                if(rectLeft + rectWidth >= elem.x + elem.width && rectTop + rectHeight >= elem.y + elem.height)
                                {
                                    this.currSelect.push(elem.id);
                                    this.selectElement(elem.id);
                                }
                            }
                        }
                    });
                }
                else if(mode != BoardModes.ERASE)
                {
                    if(this.allowUserEdit || this.isHost)
                    {
                        let self = this;
                        let localId = this.boardElems.push(null) - 1;
                        let callbacks: ElementCallbacks =
                        {
                            sendServerMsg: ((id: number, type: string) =>
                            { return (msg: UserMessage) => { self.sendElementMessage(id, type, msg) }; })(localId, mode),
                            createAlert: (header: string, message: string) => {},
                            createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) =>
                            { return self.addInfoMessage(x, y, width, height, header, message); },
                            removeInfo: (id: number) => { self.removeInfoMessage(id); },
                            updateBoardView: ((id: number) =>
                            { return (newView: ComponentViewState) => { self.setElementView(id, newView); }; })(localId),
                            getAudioStream: ((id: number) =>
                            { return () => { self.getAudioStream(id); }; })(localId),
                            getVideoStream: ((id: number) =>
                            { return () => { self.getVideoStream(id); }; })(localId)
                        }

                        let data: CreationData =
                        {
                            id: localId, userId: this.userId, callbacks: callbacks, x: x, y: y, width: width, height: height,
                            pointList: pointList, scaleF: scaleF, panX: panX, panY: panY,
                            palleteState: this.components[mode].pallete
                        };
                        let newElem: BoardElement = this.components[mode].Element.createElement(data);

                        if(newElem)
                        {
                            /* TODO: Store this mode in the 'prevMode' variable to ensure proper reversion on edit completion. */

                            let undoOp = ((elem) => { return elem.elementErase.bind(elem); })(newElem);
                            let redoOp = ((elem) => { return elem.elementRestore.bind(elem); })(newElem);
                            this.boardElems[localId] = newElem;

                            let viewState = newElem.getCurrentViewState();
                            this.setElementView(localId, viewState);

                            let payload: UserNewElementPayload = newElem.getNewMsg();
                            let msg: UserNewElementMessage = { type: newElem.type, payload: payload };

                            if(newElem.isEditing)
                            {
                                this.currentEdit = localId;

                                // Deselect currently selected items
                                for(let i = 0; i < this.currSelect.length; i++)
                                {
                                    this.deselectElement(this.currSelect[i]);
                                }
                                this.currSelect = [];
                                this.currSelect.push(localId);
                            }

                            this.handleElementOperation(localId, undoOp, redoOp);
                            this.sendNewElement(msg);
                        }
                        else
                        {
                            // Failed to create element, remove place holder.
                            this.boardElems.splice(localId, 1);
                        }
                    }
                }
            }
            else
            {
                if(mode == BoardModes.SELECT)
                {
                    if(this.currSelect.length == 1)
                    {
                        let elem = this.getBoardElement(this.currSelect[0]);
                        let retVal = elem.handleBoardMouseUp(e, mouseX, mouseY, this.components[elem.type].pallete);

                        this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                        this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        if(elem.serverId != null && elem.serverId != undefined)
                        {
                            if(retVal.move)
                            {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if(retVal.wasDelete)
                            {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if(retVal.wasRestore)
                            {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else
                        {
                            if(retVal.move)
                            {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if(retVal.wasDelete)
                            {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if(retVal.wasRestore)
                            {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        if(retVal.newViewCentre)
                        {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        this.handleInfoMessage(retVal.infoMessage);
                        this.handleAlertMessage(retVal.alertMessage);
                        this.setElementView(elem.id, retVal.newView);
                    }

                    if(this.groupMoved)
                    {
                        this.groupMoved = false;
                        this.endMove(mouseX, mouseY);
                    }
                }
            }

            if(this.currentEdit != -1)
            {
                let elem = this.getBoardElement(this.currentEdit);
                let retVal = elem.handleBoardMouseUp(e, mouseX, mouseY, this.components[elem.type].pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }

            this.selectDrag = false;
        }

        mouseClick(e: MouseEvent, mouseX: number, mouseY: number, mode: string)
        {
            // Stop editing when the board is double clicked.
            if(e.detail == 2)
            {
                if(this.currentEdit)
                {
                    this.endEditElement(this.currentEdit);
                }
            }
        }

        touchStart()
        {
            /* TODO: */
        }

        touchMove(e: TouchEvent)
        {
            /* TODO: */
        }

        touchEnd()
        {
            /* TODO: */
        }

        touchCancel()
        {
            /* TODO: */
        }

        handleUndo()
        {
            // If there is an item being edited pass this as an internal undo.
            if(this.currentEdit != -1)
            {
                this.undoItemEdit(this.currentEdit);
            }
            else
            {
                this.undo();
            }
        }

        handleRedo()
        {
            // If there is an item being edited pass this as an internal redo.
            if(this.currentEdit != -1)
            {
                this.redoItemEdit(this.currentEdit);
            }
            else
            {
                this.redo();
            }
        }

        keyBoardInput(e: KeyboardEvent, inputChar: string, mode: string)
        {
            if(this.currentEdit != -1)
            {
                let elem = this.getBoardElement(this.currSelect[0]);
                let retVal = elem.handleKeyPress(e, inputChar, this.components[elem.type].pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if(elem.serverId != null && elem.serverId != undefined)
                {
                    if(retVal.move)
                    {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if(retVal.wasDelete)
                    {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if(retVal.wasRestore)
                    {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else
                {
                    if(retVal.move)
                    {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if(retVal.wasDelete)
                    {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if(retVal.wasRestore)
                    {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }
            else if(inputChar == 'Del')
            {
                let undoOpList = [];
                let redoOpList = [];

                for(let i = 0; i < this.currSelect.length; i++)
                {
                    let elem = this.getBoardElement(this.currSelect[i]);
                    elem.erase();

                    this.deleteBuffer.push(this.currSelect[i]);
                    this.elementDeletes.push(elem.serverId);

                    let undoOp = ((element) =>
                    {
                        return () =>
                        {
                            let retVal = element.elementRestore();

                            if(element.serverId != null && element.serverId != undefined)
                            {
                                this.elementRestores.push(element.serverId);
                            }

                            this.setElementView(element.id, retVal.newView);
                        };
                    })(elem);
                    let redoOp = ((element) =>
                    {
                        return () =>
                        {
                            let retVal = element.elementErase();

                            if(element.serverId != null && element.serverId != undefined)
                            {
                                this.elementDeletes.push(element.serverId);
                            }

                            this.deleteBuffer.push(element.id);
                        };
                    })(elem);

                    undoOpList.push(undoOp);
                    redoOpList.push(redoOp);
                }

                // Remove redo operations ahead of current position
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);

                // Add new operation to the stack
                let newOp: WhiteBoardOperation = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
                this.operationStack[this.operationPos++] = newOp;
            }
        }


        /* TODO: These should be on UI thread not worker. */

        contextCopy(e: MouseEvent)
        {
            document.execCommand("copy");
        }

        contextCut(e: MouseEvent)
        {
            document.execCommand("cut");
        }

        contextPaste(e: MouseEvent)
        {
            document.execCommand("paste");
        }






        onCopy(e: ClipboardEvent)
        {
            console.log('COPY EVENT');
            /* TODO: Copy selected items, or get copy from single selected item. */
        }

        onPaste(e: ClipboardEvent)
        {
            console.log('PASTE EVENT');
            /* TODO: If we have an edit open, pass to that. Otherwise determing type and respond accordingly (maybe mode dependant). */
        }

        onCut(e: ClipboardEvent)
        {
            console.log('CUT EVENT');
            /* TODO: A mix of copy and paste behaviour, requires the most care in handling (i.e. multi selects) */
        }

        dragOver(e: DragEvent)
        {
            /* TODO: Pass to elements as necessary. Note above items. */
        }

        drop(e: DragEvent)
        {
            /* TODO: Reimplement. Note above items.
            if(e.dataTransfer.files.length  > 0)
            {
                if(e.dataTransfer.files.length == 1)
                {
                    var file: File = e.dataTransfer.files[0];
                    this.placeLocalFile(x, y, this.scaleF, this.panX, this.panY, file);
                }
            }
            else
            {
                var url: string = e.dataTransfer.getData('text/plain');
                this.placeRemoteFile(x, y, this.scaleF, this.panX, this.panY, url);
            }
            */
        }

        palleteChange(change: BoardPalleteChange, mode: string)
        {
            let retVal: BoardPalleteViewState = this.components[mode].pallete.handleChange(change);
            let cursor: ElementCursor = this.components[mode].pallete.getCursor();

            this.updateView({ palleteState: retVal, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });

            if(this.currentEdit != -1)
            {
                let elem = this.getBoardElement(this.currSelect[0]);

                if(elem.type == mode)
                {
                    elem.handlePalleteChange(this.components[mode].pallete, change);
                }
            }
        }

        clearAlert()
        {
            this.removeAlert();
        }
    }

    interface WorkerComponent {
        componentName: string;
        Element;
        pallete: BoardPallete;
    }

    let controller: WhiteBoardWorker;

    export let registerComponent = (componentName: string, Element, Pallete) =>
    {
        let pallete = new Pallete();
        let newComp: WorkerComponent =
        {
            componentName: componentName, Element: Element, pallete: pallete
        };

        console.log('Registering: ' + componentName);

        controller.components[componentName] = newComp;
    }

    export let inititalize = () =>
    {
        onmessage = function(e)
        {
            // Redirect the browser message to worker function.
            switch(e.data.type)
            {
                case ControllerMessageTypes.START:
                    console.log('Starting controller.');
                    controller = new WhiteBoardWorker(e.data.isHost, e.data.userId, e.data.allEdit, e.data.userEdit, self);

                    for(let i = 0; i < e.data.componentFiles.length; i++)
                    {
                        console.log('Attempting to register: ' + e.data.componentFiles[i]);
                        importScripts(e.data.componentFiles[i]);
                    }
                    break;
                case ControllerMessageTypes.SETOPTIONS:
                    controller.setRoomOptions(e.data.allowAllEdit, e.data.allowUserEdit);
                    break;
                case ControllerMessageTypes.MODECHANGE:
                    controller.modeChange(e.data.newMode);
                    break;
                case ControllerMessageTypes.AUDIOSTREAM:
                    /* TODO */
                    break;
                case ControllerMessageTypes.VIDEOSTREAM:
                    /* TODO */
                    break;
                case ControllerMessageTypes.NEWELEMENT:
                    controller.newElement(e.data.data);
                    break;
                case ControllerMessageTypes.ELEMENTID:
                    controller.elementID(e.data.data);
                    break;
                case ControllerMessageTypes.ELEMENTMESSAGE:
                    controller.elementMessage(e.data.data);
                    break;
                case ControllerMessageTypes.BATCHMOVE:
                    controller.batchMove(e.data.data);
                    break;
                case ControllerMessageTypes.BATCHDELETE:
                    controller.batchDelete(e.data.data);
                    break;
                case ControllerMessageTypes.BATCHRESTORE:
                    controller.batchRestore(e.data.data);
                    break;
                case ControllerMessageTypes.ELEMENTERASE:
                    controller.eraseElement(e.data.id);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSEOVER:
                    controller.elementMouseOver(e.data.id, e.data.e);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSEOUT:
                    controller.elementMouseOut(e.data.id, e.data.e);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSEDOWN:
                    controller.elementMouseDown(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSEMOVE:
                    controller.elementMouseMove(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSEUP:
                    controller.elementMouseUp(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSECLICK:
                    controller.elementMouseClick(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTMOUSEDBLCLICK:
                    controller.elementMouseDoubleClick(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTTOUCHSTART:
                    controller.elementTouchStart(e.data.id, e.data.e, e.data.localTouches, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTTOUCHMOVE:
                    controller.elementTouchMove(e.data.id, e.data.e, e.data.touchMoves, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTTOUCHEND:
                    controller.elementTouchEnd(e.data.id, e.data.e, e.data.localTouches, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTTOUCHCANCEL:
                    controller.elementTouchCancel(e.data.id, e.data.e, e.data.localTouches, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTDRAG:
                    controller.elementDragOver(e.data.id, e.data.e, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.ELEMENTDROP:
                    controller.elementDrop(e.data.id, e.data.e, e.data.componenet, e.data.subId);
                    break;
                case ControllerMessageTypes.MOUSEDOWN:
                    controller.mouseDown(e.data.e, e.data.mouseX, e.data.mouseY, e.data.mode);
                    break;
                case ControllerMessageTypes.MOUSEMOVE:
                    controller.mouseMove(e.data.e, e.data.mouseX, e.data.mouseY, e.data.mode);
                    break;
                case ControllerMessageTypes.MOUSEUP:
                    controller.mouseUp(e.data.e, e.data.mouseX, e.data.mouseY, e.data.downX, e.data.downY, e.data.pointList,
                        e.data.mode, e.data.scaleF, e.data.panX, e.data.panY);
                    break;
                case ControllerMessageTypes.MOUSECLICK:
                    controller.mouseClick(e.data.e, e.data.mouseX, e.data.mouseY, e.data.mode);
                    break;
                case ControllerMessageTypes.TOUCHSTART:
                    /* TODO */
                    break;
                case ControllerMessageTypes.TOUCHMOVE:
                    /* TODO */
                    break;
                case ControllerMessageTypes.TOUCHEND:
                    /* TODO */
                    break;
                case ControllerMessageTypes.TOUCHCANCEL:
                    /* TODO */
                    break;
                case ControllerMessageTypes.KEYBOARDINPUT:
                    controller.keyBoardInput(e.data.e, e.data.inputChar, e.data.mode);
                    break;
                case ControllerMessageTypes.UNDO:
                    controller.handleUndo();
                    break;
                case ControllerMessageTypes.REDO:
                    controller.handleRedo();
                    break;
                case ControllerMessageTypes.PALLETECHANGE:
                    controller.palleteChange(e.data.change, e.data.mode);
                    break;
                case ControllerMessageTypes.ERROR:
                    controller.serverError(e.data.error);
                    break;
                default:
                    console.error('ERROR: Recieved unrecognized worker message.');
            }

            let message =
            {
                elementViews: controller.elementUpdateBuffer, elementMessages: controller.socketMessageBuffer, deleteElements: controller.deleteBuffer,
                audioRequests: controller.audioRequests, videoRequests: controller.videoRequests, alerts: controller.alertBuffer,
                infoMessages: controller.infoBuffer, removeAlert: controller.willRemoveAlert, removeInfos: controller.removeInfoBuffer,
                selectCount: controller.currSelect.length, elementMoves: controller.elementMoves, elementDeletes: controller.elementDeletes,
                elementRestores: controller.elementRestores
            }

            if(controller.viewUpdateBuffer != null)
            {
                Object.assign(message, {viewUpdate: controller.viewUpdateBuffer});
            }
            if(controller.newViewCentre != null)
            {
                Object.assign(message, {viewCentre: controller.newViewCentre});
            }
            if(controller.newViewBox != null)
            {
                Object.assign(message, {viewBox: controller.newViewBox});
            }

            postMessage(message);

            controller.elementUpdateBuffer = [];
            controller.socketMessageBuffer = [];
            controller.alertBuffer = [];
            controller.infoBuffer = [];
            controller.removeInfoBuffer = [];
            controller.deleteBuffer = [];
            controller.audioRequests = [];
            controller.videoRequests = [];
            controller.viewUpdateBuffer = null;
            controller.willRemoveAlert = false;
            controller.newViewCentre = null;
            controller.newViewBox = null;
            controller.elementMoves = [];
            controller.elementDeletes = [];
            controller.elementRestores = [];

        }
    }
}

// Resolve the worker interface functions to the global worker namespace.
LocalAbstraction.inititalize();
let registerComponent = LocalAbstraction.registerComponent;
