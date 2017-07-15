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
