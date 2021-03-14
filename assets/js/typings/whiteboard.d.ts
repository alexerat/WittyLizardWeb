/***************************************************************************************************************************************************************
 *
 *
 *
 *
 *
 **************************************************************************************************************************************************************/
declare var io : {
    connect(url: string): Socket;
}
interface Socket 
{
    connected: boolean;
    on(event: string, callback: (...data: any[]) => void );
    emit(event: string, ...data: any[]);
    close(): void;
}

interface BoardComponent {
    componentName: string;
    ElementView;
    PalleteView;
    ModeView
    DrawHandle: (data: DrawData, context: CanvasRenderingContext2D) => void;
}

interface Operation
{
    undo: () => ElementUndoRedoReturn;
    redo: () => ElementUndoRedoReturn;
}

interface WhiteBoardOperation
{
    ids: Array<number>;
    undos: Array<() => ElementUndoRedoReturn>;
    redos: Array<() => ElementUndoRedoReturn>;
}

interface WorkerMessage {
    elementViews: any[]; 
    elementMessages: any[]; 
    deleteElements: any[];
    audioRequests: any[]; 
    videoRequests: any[]; 
    alerts: any[];
    infoMessages: any[]; 
    removeAlertCount: number; 
    removeInfos: any[];
    selectCount: number; 
    elementMoves: any[]; 
    elementDeletes: any[];
    elementRestores: any[]; 
    clipboardData: any[];
    viewUpdate: any[];
    newViewCentre: any; 
    newViewBox: any;
}

/** The base class for whiteboard elements.
  *
  * Whiteboard components will inherit this to produce addins that allow specific 'draw' functionality.
  * This is the portion that is run on the worker thread and not the UI thread. This definition is nat availible to the UI thread.
  */
declare abstract class BoardElement {

    readonly id: number;
    readonly type: string;
    readonly user: number;

    idTimeout: any;

    serverId: number;
    x: number;
    y: number;
    width: number;
    height: number;

    updateTime: Date;
    isDeleted: boolean;
    opBuffer: Array<UserMessage>;
    hoverTimer: number;
    infoElement: number;
    operationStack: Array<Operation>;
    operationPos: number;
    isSelected: boolean;
    isComplete: boolean;
    isEditing: boolean;
    gettingLock: boolean;
    editLock: boolean;
    lockedBy: number;

    isMoving: boolean;
    moveStartX: number;
    moveStartY: number;
    hasMoved: boolean;
    startTime: Date;
    isResizing: boolean;
    resizeHorz: boolean;
    resizeVert: boolean;
    oldWidth: number;
    oldHeight: number;
    hasResized: boolean;

    currentViewState: ComponentViewState;

    // Callback Functions for Internal Element Induced Updates
    sendServerMsg: (msg: UserMessage) => void;
    createAlert: (header: string, message: string) => void;
    createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) => void;
    updateBoardView: (newView: ComponentViewState) => void;
    updatePallete: (changes: Array<BoardPalleteChange>) => void;
    getAudioStream: (id: number) => void;
    getVideoStream: (id: number) => void;
    deleteElement: () => void;

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
        callbacks: ElementCallbacks, serverId?: number, updateTime?: Date);

    /**   Sets the serverId of this element and returns a list of server messages to send.
     *
     *    @param {number} id - The server ID for this element.
     *    @return {Array<UserMessage>} - The set of messages to send to the communication server.
     */
    public setServerId(id: number): Array<UserMessage>;

    private idFailed(): void;

    /** Update the view state of this object.
     *
     * This creates a new view state object with the paramaters supplied in the JSON object, all other parameters are set from the previous state.
     *
     * @param {JSON Object} updatedParams - The parameters to be updated and their new values supplied as { x: newX, etc... }
     *
     * @return {ComponentViewState} The new view state
     */
    protected updateView(updatedParams: Object): ComponentViewState;

    /**   Get the current view state for this element.
     *
     *    @return {ComponentViewState} The view state of this element given it's current internal state
     */
    public getCurrentViewState(): ComponentViewState;

    /** Handle internal element behaviour after another user edits this element.
     *
     * This will remove the internal undo/redo buffer to preserve integrity.
     */
    protected remoteEdit(): void;

    /**
     *
     *
     */
    protected getDefaultInputReturn(): ElementInputReturn;

    /**
     *
     *
     */
    protected checkForServerId(messages: Array<UserMessage>): Array<UserMessage>;

    /**   Undo the last internal state edit
     *
     *    @return {ElementUndoRedoReturn} An object containing: the new view state, messages to be sent to the comm server,
     *    required changes to the pallete state
     */
    public handleUndo(): ElementUndoRedoReturn;

    /**   Redo the last undone internal state edit.
     *
     *    @return {ElementUndoRedoReturn} An object containing: the new view state, messages to be sent to the comm server
     *    required changes to the pallete state
     */
    public handleRedo(): ElementUndoRedoReturn;

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
    public erase(): ComponentViewState;

    /**   Sets this item as not deleted and process any sub-components as required, returning the new view state.
     *
     *    Change only when sub-components require updating.
     *
     *    @return {ComponentViewState} The new view state of this element.
     */
    public restore(): ComponentViewState;

    /** Handle the basic move behaviour.
     *
     *
     */
    protected move(changeX: number, changeY: number, updateTime: Date): void;

    /** Handle the basic resize behaviour.
     *
     *
     */
    protected resize(width: number, height: number, updateTime: Date): void;

    /** Handle a move operation and provide view and message updates.
     * This is used to handle undo and redo operations.
     *
     */
    protected moveOperation(changeX: number, changeY: number, updateTime: Date): ElementUndoRedoReturn;

    /**
     *
     *
     */
    protected resizeOperation(width: number, height: number, updateTime: Date): ElementUndoRedoReturn;

    /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
     *
     *    Change only when sub-components require updating.
     *
     *    @return {ElementUndoRedoReturn} The new view state of this element.
     */
    public elementErase(): ElementUndoRedoReturn;

    /**   Sets this item as not deleted and process any sub-components as required, returning the new view state.
     *
     *    Change only when sub-components require updating.
     *
     *    @return {ElementUndoRedoReturn} The new view state of this element.
     */
    public elementRestore(): ElementUndoRedoReturn;

    /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
     *
     *    Change only when sub-components require updating.
     *
     *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
     *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
     */
    public handleErase(): ElementInputReturn;

    /**
     *
     *
     */
    protected setEdit(): void;

    /**
     *
     *
     */
    protected setLock(userId: number): void;

    /**
     *
     *
     */
    protected setUnLock(): void;


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
    abstract handlePaste(localX: number, localY: number, data: ClipboardEventData, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCut(): ElementInputReturn;
    abstract handleCustomContext(item: number, palleteState: BoardPallete): ElementInputReturn;

    abstract handleElementServerMessage(message): ElementMessageReturn;

    abstract getClipboardSVG(): string;
    abstract getClipboardData(): Array<ClipBoardItem>;

    /**   Handle a messages sent from the server to this element.
     *
     *    @param {} message - The server message that was sent.
     *
     *    @return {ElementMessageReturn} An object containing: the new view state, messages to be sent to the comm server
     */
    public handleServerMessage(message: ServerMessage): ElementMessageReturn;

    /**   Handle the selecting of this element that has not been induced by this elements input handles.
     *
     *    @return {ComponentViewState} An object containing: the new view state
     */
    public handleSelect(): ComponentViewState;

    /**   Handle the deselect this element.
     *
     *    @return {ComponentViewState} An object containing: the new view state
     */
    public handleDeselect(): ComponentViewState;

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
declare abstract class BoardPallete
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
    protected updateView(updatedParams: Object);

    abstract handleChange(changeMsg: BoardPalleteChange) : BoardPalleteViewState;

    abstract getCursor() : ElementCursor;
}

interface WhiteBoardDispatcher
{
    elementMouseOver: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;
    elementMouseOut: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;
    elementMouseDown: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;
    elementMouseMove: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;
    elementMouseUp: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;
    elementMouseClick: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;
    elementMouseDoubleClick: (id: number, e: React.MouseEvent<Element>, component?: number, subId?: number) => void;

    elementTouchStart: (id: number, e: React.TouchEvent<Element>, component?: number, subId?: number) => void;
    elementTouchMove: (id: number, e: React.TouchEvent<Element>, component?: number, subId?: number) => void;
    elementTouchEnd: (id: number, e: React.TouchEvent<Element>, component?: number, subId?: number) => void;
    elementTouchCancel: (id: number, e: React.TouchEvent<Element>, component?: number, subId?: number) => void;

    elementDragOver: (id: number, e: React.DragEvent<Element>, component?: number, subId?: number) => void;
    elementDrop: (id: number, e: React.DragEvent<Element>, component?: number, subId?: number) => void;

    palleteChange: (change: BoardPalleteChange) => void;
    changeEraseSize: (newSize: number) => void;

    clearAlert: (id: number) => void;
    modeChange: (newMode: string) => void;

    mouseWheel: (e: React.WheelEvent<Element>) => void;
    mouseDown: (e: React.MouseEvent<Element>) => void;
    mouseMove: (e: React.MouseEvent<Element>) => void;
    mouseUp: (e: React.MouseEvent<Element>) => void;
    mouseClick: (e: React.MouseEvent<Element>) => void;

    touchStart: (e: React.TouchEvent<Element>) => void;
    touchMove: (e: React.TouchEvent<Element>) => void;
    touchEnd: (e: React.TouchEvent<Element>) => void;
    touchCancel: (e: React.TouchEvent<Element>) => void;

    contextCopy: (e: React.MouseEvent<Element>) => void;
    contextCut: (e: React.MouseEvent<Element>) => void;
    contextPaste: (e: React.MouseEvent<Element>) => void;
    onCopy: (e: React.ClipboardEvent<Element>) => void;
    onPaste: (e: React.ClipboardEvent<Element>) => void;
    onCut: (e: React.ClipboardEvent<Element>) => void;

    dragOver: (e: React.DragEvent<Element>) => void;
    drop: (e: React.DragEvent<Element>) => void;
}


interface WhiteBoardViewState
{
    mode: string;
    blockAlert: boolean;
    baseSize: number;
    viewBox: string;
    viewX: number;
    viewY: number;
    viewWidth: number;
    viewHeight: number;
    viewScale: number;
    eraseSize: number;
    cursor: string;
    cursorURL: Array<string>;
    cursorOffset: Point;
    components: Immutable.Map<string, BoardComponent>;
    palleteState: BoardPalleteViewState;
    boardElements: Immutable.OrderedMap<number, ComponentViewState>;
    alertElements: Immutable.List<AlertElement>;
    infoElements: Immutable.List<InfoElement>;
    dispatcher: WhiteBoardDispatcher;
}

 interface AlertElement {
    type: string;
    message: string;
}

interface InfoElement {
    x: number;
    y: number;
    width: number;
    height: number;
    header: string;
    message: string;
}

 interface ComponentRegistrationData {
    element: BoardElement;

}
interface ElementCursor {
    cursor: string;
    url: Array<string>;
    offset: Point;
}
interface InfoMessageData {
    x: number;
    y: number;
    width: number;
    height:  number;
    header: string;
    message: string;
}
interface AlertMessageData {
    header: string;
    message: string;
}
interface BoardPalleteViewState {

}
interface BoardPalleteChange {
    type: number,
    data: any
}
interface BoardElementParameters {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    user: number;
    updateTime: Date;
}
interface ElementCallbacks {
    sendServerMsg: (msg: UserMessage) => void;
    createAlert: (header: string, message: string) => void;
    createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) => number;
    removeInfo: (id: number) => void;
    updatePallete: (changes: Array<BoardPalleteChange>) => void;
    updateBoardView: (newView: ComponentViewState) => void;
    deleteElement: () => void;
    getAudioStream: (id: number) => void;
    getVideoStream: (id: number) => void;
}
interface ElementInputReturn {
    newView:  ComponentViewState;
    undoOp: () => ElementUndoRedoReturn;
    redoOp: () => ElementUndoRedoReturn;
    serverMessages: Array<UserMessage>;
    move: {x: number, y: number, message: UserMessage};
    wasDelete: { message: UserMessage };
    wasRestore: { message: UserMessage };
    palleteChanges: Array<BoardPalleteChange>;
    infoMessage: InfoMessageData;
    alertMessage: AlertMessageData;
    isSelected: boolean;
    newViewCentre: Point;
}
interface ElementInputStartReturn extends ElementInputReturn {
    cursor: ElementCursor;
}
interface ElementMessageReturn {
    newView: ComponentViewState;
    serverMessages: Array<UserMessage>;
    infoMessage: InfoMessageData;
    alertMessage: AlertMessageData;
    wasEdit?: boolean;
    wasDelete?: boolean;
}
interface ElementUndoRedoReturn {
    id: number;
    move: {x: number, y: number, message: UserMessage};
    wasDelete: { message: UserMessage };
    wasRestore: { message: UserMessage };
    newView:  ComponentViewState;
    serverMessages: Array<ServerMessage>;
    palleteChanges: Array<BoardPalleteChange>;
    newViewCentre: Point;
}
interface ElementMoveReturn {
    newView:  ComponentViewState;
    serverMessages: Array<UserMessage>;
    move: {x: number, y: number, message: UserMessage};
}
interface ElementPalleteReturn {
    newView:  ComponentViewState;
    undoOp: () => ElementUndoRedoReturn;
    redoOp: () => ElementUndoRedoReturn;
    serverMessages: Array<UserMessage>;
}
interface PalleteChangeReturn {
    newView: BoardPalleteViewState;
    cursor: string;
    cursorURL: Array<string>;
}

interface HoverMessage {
    header: string;
    message: string;
}
interface DrawData {
    x: number;
    y: number;
    width: number;
    height: number;
    pointList: Array<Point>;
    palleteState: BoardPalleteViewState;
}
interface CreationData {
    id: number;
    userId: number;
    callbacks: ElementCallbacks;
    palleteState?: BoardPallete;

    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pointList?: Array<Point>;
    scaleF?: number;
    panX?: number;
    panY?: number;

    pasteEvent?: ClipboardEvent;
    dropEvent?: DragEvent;

    serverMsg?: ServerMessagePayload;
    serverId?: number;

    audio?;
    video?;
}
interface ComponentViewState {
    id: number;
    mode: string;
    updateTime: Date;
    isSelected: boolean;
    x: number;
    y: number;
    width: number;
    height: number;

    isEditing: boolean;
    isMoving: boolean;
    isResizing: boolean;
    remLock: boolean;
    getLock: boolean;
}
interface ComponentDispatcher {
    mouseOver:   (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;
    mouseOut:   (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;
    mouseDown:   (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;
    mouseMove:   (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;
    mouseUp:     (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;
    mouseClick:  (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;
    doubleClick: (e: React.MouseEvent<Element>, component?: number, subComp?: number) => void;

    touchStart: (e: React.TouchEvent<Element>, component?: number, subComp?: number) => void;
    touchMove: (e: React.TouchEvent<Element>, component?: number, subComp?: number) => void;
    touchEnd: (e: React.TouchEvent<Element>, component?: number, subComp?: number) => void;
    touchCancel: (e: React.TouchEvent<Element>, component?: number, subComp?: number) => void;

    dragOver: (e: React.DragEvent<Element>, component?: number, subComp?: number) => void;
    drop: (e: React.DragEvent<Element>, component?: number, subComp?: number) => void;
}
interface ComponentProp {
    state: ComponentViewState;
    dispatcher: ComponentDispatcher;
    mode: string;
    eraseSize: number;
    viewScale: number;
    viewX: number;
    viewY: number;
    viewWidth: number;
    viewHeight: number;
}
interface ModeProp {
    mode: string;
    dispatcher: (string) => void;
}
interface PalleteProp {
    state: BoardPalleteViewState;
    dispatcher: (change: BoardPalleteChange) => void;
}
interface ComponenetProp {

}
interface Point {
    x: number;
    y: number;
}
interface BoardTouch {
    x: number;
    y: number;
    identifer: number;
}

interface TextOperation
{
    undo: () => void;
    redo: () => void;
}
interface InfoMessage {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    header: string;
    message: string;
}

interface ClipBoardItem {
    format: string;
    data: string;
}

interface ClipboardEventData {
    isInternal: boolean;
    wasCut: boolean;
    files: FileList;
    url: string;
    urlList: string;
    plainText: string;
    htmlText: string;
    enrichedText: string;
    csv: string;
    xml: string;
    image: string;
}



/***************************************************************************************************************************************************************
 *
 *
 *
 *
 *
 **************************************************************************************************************************************************************/
interface ServerMessageContainer {
    serverId: number;
    userId: number;
    type: string;
    payload: ServerMessage;
}
interface ServerMessage {
    header: number;
    payload: ServerMessagePayload;
}
interface ServerMessagePayload {

}

interface ServerOptionsMessage {
    allEdit: boolean;
    userEdit: boolean;
}

interface ServerBoardJoinMessage {
    userId: number;
    colour: number;
}
interface ServerIdMessage {
    serverId: number;
    localId: number;
}
interface ServerMoveElementMessage extends ServerMessagePayload {
    x: number;
    y: number;
    editTime: Date;
}
interface ServerResizeElementMessage extends ServerMessagePayload {
    width: number;
    height: number;
    editTime: Date;
}
interface ServerLockElementMessage extends ServerMessagePayload {
    userId: number;
}


interface UserMessagePayload {

}
interface UserMessage {
    header: number;
    payload: UserMessagePayload;
}
interface UserNewElementPayload extends UserMessagePayload {
    localId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    editLock: boolean;
}
interface UserNewElementMessage {
    type: string;
    payload: UserNewElementPayload;
}
interface UserMessageContainer {
    id: number;
    type: string;
    payload: UserMessage;
}
interface UserUnknownElement {
    type: string;
    id: number;
}

interface UserMoveElementMessage extends UserMessagePayload {
    x: number;
    y: number;
}
interface UserResizeElementMessage extends UserMessagePayload {
    width: number;
    height: number;
}
