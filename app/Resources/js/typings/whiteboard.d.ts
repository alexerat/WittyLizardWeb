/***************************************************************************************************************************************************************
 *
 *
 *
 *
 *
 **************************************************************************************************************************************************************/
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
    data: number
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
    updateBoardView: (newView: ComponentViewState) => void;
    getAudioStream: (id: number) => void;
    getVideoStream: (id: number) => void;
}
interface ElementInputReturn {
    newView:  ComponentViewState;
    undoOp: () => ElementUndoRedoReturn;
    redoOp: () => ElementUndoRedoReturn;
    serverMessages: Array<UserMessage>;
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
    newView:  ComponentViewState;
    serverMessages: Array<ServerMessage>;
    palleteChanges: Array<BoardPalleteChange>;
    newViewCentre: Point;
    wasDelete?: boolean;
}
interface ElementMoveReturn {
    newView:  ComponentViewState;
    serverMessages: Array<UserMessage>;
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
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pointList?: Array<Point>;
    palleteState?: BoardPallete;
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

    serverMsg?: ServerPayload;
    serverId?: number;

    audio?;
    video?;
}
interface ComponentViewState {
    id: number;
    mode: string;
    updateTime: Date;
    isSelected: boolean;
}
interface ComponentDispatcher {
    mouseOver:   (e: MouseEvent, component?: number, subComp?: number) => void;
    mouseOut:   (e: MouseEvent, component?: number, subComp?: number) => void;
    mouseDown:   (e: MouseEvent, component?: number, subComp?: number) => void;
    mouseMove:   (e: MouseEvent, component?: number, subComp?: number) => void;
    mouseUp:     (e: MouseEvent, component?: number, subComp?: number) => void;
    mouseClick:  (e: MouseEvent, component?: number, subComp?: number) => void;
    doubleClick: (e: MouseEvent, component?: number, subComp?: number) => void;

    touchStart: (e: TouchEvent, component?: number, subComp?: number) => void;
    touchMove: (e: TouchEvent, component?: number, subComp?: number) => void;
    touchEnd: (e: TouchEvent, component?: number, subComp?: number) => void;
    touchCancel: (e: TouchEvent, component?: number, subComp?: number) => void;

    dragOver: (e: DragEvent, component?: number, subComp?: number) => void;
    drop: (e: DragEvent, component?: number, subComp?: number) => void;
}
interface ComponentProp {
    state: ComponentViewState;
    dispatcher: ComponentDispatcher;
    mode: string;
    viewScale: number;
    eraseSize: number;
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


interface CursorElement extends Point {
    height: number;
}
interface CursorSelection extends CursorElement {
    width: number;
}
interface Style {
    weight: string;
    decoration: string;
    style: string;
    colour: string;
}
interface TextStyle extends Style {
    start: number;
    end: number;
    text: string;
    num: number;
}
interface TextNode {
    lineNum: number;
    x: number;
    y: number;
    styles: Array<StyleNode>;
    dx: number;
    dy: number;
    start: number;
    end: number;
    endCursor: boolean;
    justified: boolean;
    text: string;
}
interface StyleNode {
    key: number;
    text: string;
    colour: string;
    dx: number;
    locStart: number;
    decoration: string;
    weight: string;
    style: string;
    startPos: number;
}
interface WhiteBoardText extends BoardElement {
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
}
interface Highlight extends BoardElement {
    colour: number;
}
interface TextInBufferElement {
    x: number;
    y: number;
    size: number;
    user: number;
    editLock: number;
    width: number;
    height: number;
    justified: boolean;
    styles: Array<TextStyle>;
    editBuffer: Array<Array<TextInNodeElement>>;
}
interface TextOutBufferElement {
    id: number;
    editCount: number;
    x: number;
    y: number;
    size: number;
    width: number;
    height: number;
    justified: boolean;
    styles: Array<TextStyle>;
    editBuffer: Array<TextInNodeElement>;
    lastSent: number;
}
interface TextOutNode extends TextStyle {
    editId: number;
}
interface TextInNodeElement {
    num_nodes: number;
    nodes: Array<TextOutNode>;
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
    payload: ServerPayload;
}
interface ServerPayload {

}
interface ServerBoardJoinMessage {
    userId: number;
    colour: number;
}
interface ServeBaseMessage extends ServerPayload {
    serverId: number;
}
interface ServerIdMessage {
    serverId: number;
    localId: number;
}
interface ServerMoveElementMessage extends ServeBaseMessage {
    x: number;
    y: number;
    editTime: Date;
}
interface ServerNewTextboxMessage extends ServeBaseMessage {
    x: number;
    y: number;
    width: number;
    height: number;
    justified: boolean;
    editCount: number;
    userId: number;
    size: number;
    editLock: number;
    editTime: Date;
}
interface ServerStyleNodeMessage extends ServeBaseMessage {
    userId: number;
    editId: number;
    weight: string;
    decoration: string;
    style: string;
    colour: string;
    start: number;
    end: number;
    text: string;
    num: number;
}
interface ServerMissedTextMessage extends ServeBaseMessage {
    editId: number;
}
interface ServerResizeTextMessage extends ServeBaseMessage {
    width: number;
    height: number;
    editTime: Date;
}
interface ServerJustifyTextMessage extends ServeBaseMessage {
    newState: boolean;
}
interface ServerEditTextMessage extends ServeBaseMessage {
    userId: number;
    editId: number;
    num_nodes: number;
    editTime: Date;
}
interface ServerEditIdMessage extends ServerMessage {
    editId: number;
    bufferId: number;
    localId: number;
}
interface ServerLockIdMessage extends ServeBaseMessage {

}
interface ServerLockTextMessage extends ServeBaseMessage {
    userId: number;
}
interface ServerReleaseTextMessage extends ServeBaseMessage {

}
interface ServerRefusedTextMessage extends ServeBaseMessage {

}
interface ServerHighLightMessage extends ServerMessage {
    x: number;
    y: number;
    width: number;
    height: number;
    userId: number;
    colour: number;
}

/***************************************************************************************************************************************************************
 *
 *
 *
 *
 *
 **************************************************************************************************************************************************************/

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

interface UserNewTextMessage extends UserMessage {
    localId: number;
    size: number;
    x: number;
    y: number;
    width: number;
    height: number;
    justified: boolean;
}
interface UserEditTextMessage extends UserMessagePayload {
    localId: number;
    bufferId: number;
    num_nodes: number;
}
interface UserStyleNodeMessage extends UserMessagePayload {
    editId: number;
    num: number;
    start: number;
    end: number;
    text: string;
    weight: string;
    style: string;
    decoration: string;
    colour: string;
}
interface UserJustifyTextMessage extends UserMessagePayload {
    newState: boolean;
}
interface UserLockTextMessage extends UserMessagePayload {
}
interface UserReleaseTextMessage extends UserMessagePayload {
    serverId: number;
}
interface UserResizeTextMessage extends UserMessagePayload {
    width: number;
    height: number;
}
interface UserMissingTextMessage extends UserMessagePayload {
    seq_num: number;
}
interface UserHighLightMessage extends UserMessage {
    x: number;
    y: number;
    width: number;
    height: number;
}
