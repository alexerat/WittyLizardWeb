/** A helper function to determine if a codepoint should be treated as a grammatical hyphen.
 *
 *
 */
let isHyphen = (codePoint: number) =>
{
    switch(codePoint)
    {
        case 45:
        case 1418:
        case 5120:
        case 6150:
        case 8208:
        case 8209:
        case 8210:
        case 8211:
        case 8212:
        case 8213:
        case 8275:
        case 11799:
        case 11802:
        case 11834:
        case 11835:
        case 11840:
        case 12316:
        case 12336:
        case 12448:
        case 65073:
        case 65074:
        case 65112:
        case 65123:
        case 65293:
            return true;
        default:
            return false;
    }
};

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
        text: string;
        justified: boolean;
        textNodes: Array<TextNode>;
        cursor: CursorElement;
        cursorElems: Array<CursorSelection>;
        size: number;

        isEditing: boolean;
        isMoving: boolean;
        isResizing: boolean;
        remLock: boolean;
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
     * The set of possible types of pallete changes.
     * Used in interfacing between component view and state.
     */
    const enum PalleteChangeType {
        COLOUR,
        SIZE,
        BOLD,
        ITALIC,
        UNDERLINE,
        THROUGHLINE,
        OVERLINE,
        JUSTIFIED
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
        NEW: 0,
        DELETE: 1,
        RESTORE: 2,
        IGNORE: 3,
        COMPLETE: 4,
        DROPPED: 5,
        MOVE: 6,
        NODE: 7,
        NODEMISSED: 8,
        MISSINGNODE: 9,
        RESIZE: 10,
        JUSTIFY: 11,
        LOCK: 12,
        RELEASE: 13,
        LOCKID: 14,
        EDIT: 15,
        UNKNOWNEDIT: 16,
        IGNOREEDIT: 17,
        SIZECHANGE: 18
    };

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
    interface TextGlyph {
        path: string;
        stringPositions: Array<number>;
        startPos: number;
        advance: number;
        weight: string;
        colour: string;
        style: string;
        decoration: string;
    }
    interface TextNode {
        lineNum: number;
        x: number;
        y: number;
        dx: number;
        dy: number;
        start: number;
        end: number;
        spaceRemoved: boolean;
        justified: boolean;
        glyphs: Array<TextGlyph>;
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

    interface ServerNewTextboxMessage extends ServerPayload {
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
        num_styles: number;
        styles: Array<TextStyle>;
    }
    interface ServerStyleNodeMessage extends ServerPayload {
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
    interface ServerMissedMessage extends ServerPayload {
        editId: number;
        num: number;
    }
    interface ServerResizeMessage extends ServerPayload {
        width: number;
        height: number;
        editTime: Date;
    }
    interface ServerJustifyMessage extends ServerPayload {
        newState: boolean;
    }
    interface ServerEditMessage extends ServerPayload {
        userId: number;
        editId: number;
        num_styles: number;
        styles: Array<TextStyle>;
        editTime: Date;
    }
    interface ServerEditIdMessage extends ServerPayload {
        editId: number;
        bufferId: number;
        localId: number;
    }
    interface ServerLockIdMessage extends ServerPayload {

    }
    interface ServerLockMessage extends ServerPayload {
        userId: number;
    }
    interface ServerIgnoreEditMessage extends ServerPayload {
        editId: number;
    }
    interface ServerChangeSizeMessage extends ServerPayload {
        newSize: number;
    }
    interface UserNewTextMessage extends UserNewElementPayload {
        size: number;
        justified: boolean;
        num_styles: number;
        styles: Array<TextStyle>;
    }
    interface UserEditMessage extends UserMessagePayload {
        bufferId: number;
        num_styles: number;
        styles: Array<TextStyle>;
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
    interface UserJustifyMessage extends UserMessagePayload {
        newState: boolean;
    }
    interface UserResizeMessage extends UserMessagePayload {
        width: number;
        height: number;
    }
    interface UserMissingMessage extends UserMessagePayload {
        seq_num: number;
    }
    interface UserChangeSizeMessage extends UserMessagePayload {
        newSize: number;
    }

    const MAX_STYLE_LENGTH = 200;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    // CONTROLLER                                                                                                                                             //
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** Text Whiteboard Pallete.
    *
    * This is the class that will be used to store the state and control the pallete for this component.
    *
    */
    export class Pallete extends BoardPallete
    {
        colour: string;
        baseSize: number;
        isBold: boolean;
        isItalic: boolean;
        isULine: boolean;
        isTLine: boolean;
        isOLine: boolean;
        isJustified: boolean;

        public constructor()
        {
            super();

            this.baseSize = PalleteSize.SMALL;
            this.colour = 'black';
            this.isBold = false;
            this.isItalic = false;
            this.isOLine = false;
            this.isTLine = false;
            this.isULine = false;

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

            cursorType = { cursor: 'auto', url: [], offset: {x: 0, y: 0} };

            return cursorType;
        }

        public getColour()
        {
            return this.colour;
        }

        public getStyle()
        {
            return this.isItalic ? 'italic' : 'normal';
        }

        public getWeight()
        {
            return this.isBold ? 'bold' : 'normal';
        }

        public getDecoration()
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
            else if(change.type == PalleteChangeType.BOLD)
            {
                this.isBold = change.data;
                this.updateView({ isBold: change.data });
            }
            else if(change.type == PalleteChangeType.ITALIC)
            {
                this.isItalic = change.data;
                this.updateView({ isItalic: change.data });
            }
            else if(change.type == PalleteChangeType.UNDERLINE)
            {
                if(change.data)
                {
                    this.isOLine = false;
                    this.isTLine = false;
                }
                this.isULine = change.data;

                this.updateView({ isULine: change.data, isOLine: false, isTLine: false });
            }
            else if(change.type == PalleteChangeType.OVERLINE)
            {
                if(change.data)
                {
                    this.isULine = false;
                    this.isTLine = false;
                }
                this.isOLine = change.data;

                this.updateView({ isOLine: change.data, isULine: false, isTLine: false });
            }
            else if(change.type == PalleteChangeType.THROUGHLINE)
            {
                if(change.data)
                {
                    this.isULine = false;
                    this.isOLine = false;
                }
                this.isTLine = change.data;

                this.updateView({ isTLine: change.data, isULine: false, isOLine: false });
            }
            else if(change.type == PalleteChangeType.JUSTIFIED)
            {
                this.isJustified = change.data;

                this.updateView({ isJustified: change.data });
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
        size: number;
        isJustified: boolean;
        cursorStart: number;
        cursorEnd: number;
        selectedCharacters: Array<number>;
        stringStart: number;

        startLeft: boolean = false;
        textNodes: Array<TextNode> = [];
        text: string = '';
        lines = [];
        cursorElems;
        cursor;
        styleSet: Array<TextStyle> = [];
        gettingLock: boolean = false;
        editLock: boolean;
        lockedBy: number;

        editInBuffer: Array<{ num_styles: number, num_recieved: number, styles: Array<TextStyle>, editTimer }> = [];
        editOutBuffer: Array<Array<TextStyle>> = [];
        editNum: number = 0;
        editCount: number = 0;
        editTimer;

        isMoving: boolean = false;
        moveStartX: number = 0;
        moveStartY: number = 0;
        hasMoved: boolean = false;
        startTime: Date;
        isResizing: boolean = false;
        resizeHorz: boolean = false;
        resizeVert: boolean = false;
        oldWidth: number;
        oldHeight: number;
        hasResized: boolean = false;
        textDown: number = 0;
        idealX: number = 0;


        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The element.
        */
        public static createElement( data: CreationData )
        {
            if(data.serverId != null && data.serverId != undefined && data.serverMsg != null && data.serverMsg != undefined)
            {
                let msg = data.serverMsg as ServerNewTextboxMessage;

                return new Element(data.id, data.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.size,
                    msg.justified, msg.num_styles, msg.styles, msg.editLock != -1, msg.editLock, false, data.serverId, msg.editTime)
            }
            else if(data.x != null && data.x != undefined && data.y != null && data.y != undefined &&
                data.width != null && data.width != undefined && data.height != null && data.height != undefined)
            {

                let pallete : Pallete = data.palleteState as Pallete;
                let colour: string;
                let size: number;

                if(!pallete)
                {
                    size = 1.0;
                }
                else
                {
                    size = pallete.baseSize;
                }

                size = size * data.scaleF;

                if(data.width > 20 && data.height > 20)
                {
                    return new Element(data.id, data.userId, data.x + data.panX, data.y + data.panY, data.width * data.scaleF, data.height * data.scaleF,
                        data.callbacks, size, pallete.isJustified, 0, [], false, -1, true)
                }
            }

            return null;
        }

        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        public constructor(id: number, userId: number, x: number, y: number, width: number, height: number, callbacks: ElementCallbacks,
            size: number, isJustified: boolean, num_styles: number, styles: Array<TextStyle>, editLock: boolean, lockedBy: number, isEditing: boolean,
            serverId?: number, updateTime?: Date)
        {
            super(MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime);

            this.text = '';

            if(serverId != null && serverId != undefined)
            {
                this.editInBuffer[0] = { num_styles: num_styles, num_recieved: 0, styles: [], editTimer: null };

                let buffer = this.editInBuffer[0];

                for(let i = 0; i < styles.length; i++)
                {
                    let style = styles[i];
                    // Check for integrity.
                    if(style != null && style != undefined && style.text != null && style.text != undefined && style.num != null && style.num != undefined
                        && style.start != null && style.start != undefined && style.end != null && style.end != undefined && style.style != null &&
                        style.style != undefined && style.weight != null && style.weight != undefined && style.colour != null && style.colour != undefined
                        && style.decoration != null && style.decoration != undefined)
                    {
                        buffer.styles[style.num] = style;
                        buffer.num_recieved++;
                    }
                }

                if(buffer.num_recieved < buffer.num_styles)
                {
                    let self = this;
                    buffer.editTimer = setInterval((id) =>
                    {
                        let buffer = self.editInBuffer[id];
                        for(let i = 0; i < buffer.num_styles; i++)
                        {
                            if(buffer[i] == null || buffer[i] == undefined)
                            {
                                let msg: UserMissingMessage = { seq_num: i };
                                let msgCont: UserMessage = { header: MessageTypes.MISSINGNODE, payload: msg };
                                self.sendServerMsg(msgCont);
                            }
                        }
                    }, 1000, 0);
                }
                else
                {
                    this.completeEdit(0);
                }
            }
            else
            {
                this.editInBuffer[0] = { num_styles: 0, num_recieved: 0, styles: [], editTimer: null };

                this.isEditing = true;
            }

            this.lockedBy = lockedBy;

            this.calculateTextLines();
            this.cursorStart = 0;
            this.cursorEnd = 0;
            this.selectedCharacters = [];
            this.stringStart = 0;

            this.gettingLock = false;
            this.isEditing = isEditing;
            this.isSelected = isEditing;
            this.size = size;
            this.changeSelect(true);

            let newView : ViewState = {
                mode: MODENAME, id: this.id, x: this.x, y: this.y, width: this.width, height: this.height, isEditing: this.isEditing,
                remLock: this.lockedBy != -1, getLock: false, textNodes: [], cursor: null, cursorElems: [], size: this.size, updateTime: updateTime,
                isSelected: false, text: this.text, justified: true, isMoving: false, isResizing: false
            };

            this.currentViewState = newView;
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
            let styleMessages: Array<TextStyle> = [];

            for(let i = 0; i < this.editInBuffer[0].styles.length; i++)
            {
                styleMessages.push(this.editInBuffer[0].styles[i]);
            }

            let msg: UserNewTextMessage =
            {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, size: this.size, justified: this.isJustified,
                num_styles: this.editInBuffer[0].num_styles, styles: styleMessages
            };

            return msg;
        }

        /**   Sets the serverId of this element and returns a list of server messages to send.
         *
         *    @return Array<UserMessage> The set of messages to send to the communication server.
         */
        public setServerId(id: number)
        {
            this.serverId = id;

            let messages: Array<UserMessage> = [];

            return messages;
        }

        /* TODO: Erase and restore is probably better placed in the base class. */

        /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
         *
         *    Change only when sub-components require updating.
         *
         *    @return {ElementUndoRedoReturn} The new view state of this element.
         */
        public elementErase()
        {
            let retMsgs: Array<UserMessage> = [];
            let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

            let message: UserMessage = { header: MessageTypes.DELETE, payload: null };

            this.erase();

            let retVal: ElementUndoRedoReturn =
            {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: { message: message },
                wasRestore: null, move: null
            };

            let msg: UserMessage = { header: MessageTypes.DELETE, payload: null };
            retMsgs.push(msg);

            retVal.serverMessages = this.checkForServerId(retMsgs);

            return retVal;
        }

        /**   Sets this item as not deleted and process any sub-components as required, returning the new view state.
         *
         *    Change only when sub-components require updating.
         *
         *    @return {ElementUndoRedoReturn} The new view state of this element.
         */
        public elementRestore()
        {
            let retMsgs: Array<UserMessage> = [];
            let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

            let message: UserMessage = { header: MessageTypes.RESTORE, payload: null };

            this.restore();

            let retVal: ElementUndoRedoReturn =
            {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                wasRestore: { message: message }, move: null
            };

            let msg: UserMessage = { header: MessageTypes.RESTORE, payload: null };
            retMsgs.push(msg);

            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        }

        /**   Sets this item as deleted and process any sub-components as required, returning the new view state.
         *
         *    Change only when sub-components require updating.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        public handleErase()
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            let eraseRet = this.elementErase();

            retVal.serverMessages = eraseRet.serverMessages;
            retVal.newView = eraseRet.newView;

            let undoOp = this.elementRestore;
            let redoOp = this.elementErase;

            retVal.undoOp = undoOp.bind(this);
            retVal.redoOp = redoOp.bind(this);

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

            if(component == ViewComponents.Resize)
            {
                this.isResizing = true;
                this.oldWidth = this.width;
                this.oldHeight = this.height;
                this.startTime = this.updateTime;

                if(subId == ResizeComponents.Right)
                {
                    cursorType =  {cursor: 'ew-resize', url: [], offset: {x: 0, y: 0}};
                }
                else if(subId == ResizeComponents.Bottom)
                {
                    cursorType = {cursor: 'ns-resize', url: [], offset: {x: 0, y: 0}};
                }
                else if(subId == ResizeComponents.Corner)
                {
                    cursorType = {cursor: 'nwse-resize', url: [], offset: {x: 0, y: 0}};
                }
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

            if(e.buttons == 1)
            {
                this.cursorStart = this.findTextPos(localX, localY);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.changeSelect(true);
            }

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

            /* TODO: Handle text select by click here */

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

            if(this.isEditing)
            {
                /* TODO: Handle text select of words when editing */

            }
            else
            {

            }

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

            if(this.isEditing)
            {
                this.cursorStart = this.findTextPos(mouseX - this.x, mouseY - this.y);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.changeSelect(true);
            }

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

            if(this.isResizing)
            {
                let newWidth  = this.resizeHorz ? this.width  + changeX : this.width;
                let newHeight = this.resizeVert ? this.height + changeY : this.height;

                this.resize(newWidth, newHeight, new Date());

                this.hasResized = true;
            }
            else if(this.isMoving)
            {
                this.move(changeX, changeY, new Date());

                this.hasMoved = true;
            }
            else if(this.isEditing && e.buttons == 1)
            {
                let newLoc = this.findTextPos(mouseX - this.x, mouseY - this.y);

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

                this.changeSelect(true);
            }

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
                let msg: UserMessage = { header: MessageTypes.MOVE, payload: msgPayload };

                serverMsgs.push(msg);

                retVal.undoOp = () => { return this.moveOperation(-changeX, -changeY, this.startTime); };
                retVal.redoOp = () => { return this.moveOperation(changeX, changeY, this.updateTime); };
            }

            if(this.hasResized)
            {
                this.hasResized = false;

                let msgPayload: UserResizeMessage = { width: this.width, height: this.height };
                let msg: UserMessage = { header: MessageTypes.RESIZE, payload: msgPayload };

                serverMsgs.push(msg);

                retVal.undoOp = () => { return this.resizeOperation(this.oldWidth, this.oldHeight, this.startTime); };
                retVal.redoOp = () => { return this.resizeOperation(this.width, this.height, this.updateTime); };
            }

            this.isMoving = false;

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
            let serverMsg: UserMessage = { header: MessageTypes.MOVE, payload: msgPayload };
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleKeyPress(e: KeyboardEvent, input: string, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();
            let i: number;
            let line: TextNode;
            let style: StyleNode;
            let newStart: number;
            let newEnd: number;

            switch(input)
            {

            case 'ArrowLeft':
                newStart = this.cursorStart;
                newEnd = this.cursorEnd;

                if(this.cursorStart == this.cursorEnd || !this.startLeft)
                {
                    if(this.cursorStart > 0)
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
                            while(i > 0 && !this.text.charAt(i - 1).match(/\s/))
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
                        while(i > 0 && !this.text.charAt(i - 1).match(/\s/))
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

                this.changeSelect(true);
                break;
            case 'ArrowRight':
                newStart = this.cursorStart;
                newEnd = this.cursorEnd;

                if(this.cursorStart == this.cursorEnd || this.startLeft)
                {
                    if(this.cursorEnd < this.text.length)
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorEnd + 1;
                            while(i < this.text.length && !(this.text.charAt(i - 1).match(/\s/) && this.text.charAt(i).match(/[^\s]/)))
                            {
                                i++;
                            }

                            newEnd = i;
                        }
                        else
                        {
                            if(newEnd < this.text.length)
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
                        i = this.cursorStart < this.text.length ? this.cursorStart + 1 : this.text.length;
                        while(i < this.text.length && !(this.text.charAt(i - 1).match(/\s/) && this.text.charAt(i).match(/[^\s]/)))
                        {
                            i++;
                        }

                        newStart = i;
                    }
                    else
                    {
                        if(newStart < this.text.length)
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

                this.changeSelect(true);
                break;
            case 'ArrowUp':
                if(e.ctrlKey)
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        i = this.cursorEnd - 1;
                        while(i > 0 && !this.text.charAt(i - 1).match('\n'))
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
                        while(i > 0 && !this.text.charAt(i - 1).match('\n'))
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
                        if(this.cursorEnd <= this.textNodes[0].end)
                        {
                            newEnd = this.cursorEnd;
                        }
                        else
                        {
                            newEnd = this.findXHelper(true, this.cursorEnd);
                        }
                    }
                    else
                    {
                        newEnd = this.cursorEnd;

                        if(this.cursorStart <= this.textNodes[0].end)
                        {
                            newStart = this.cursorStart;
                        }
                        else
                        {
                            newStart = this.findXHelper(true, this.cursorStart);
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

                this.changeSelect(false);
                break;
            case 'ArrowDown':
                if(e.ctrlKey)
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        i = this.cursorEnd + 1;
                        while(i < this.text.length && !this.text.charAt(i).match('\n'))
                        {
                            i++;
                        }

                        newStart = this.cursorStart;
                        newEnd = i;
                    }
                    else
                    {
                        i = this.cursorStart + 1;
                        while(i < this.text.length && !this.text.charAt(i).match('\n'))
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
                        if(this.cursorEnd >= this.textNodes[this.textNodes.length - 1].start)
                        {
                            newEnd = this.cursorEnd;
                        }
                        else
                        {
                            newEnd = this.findXHelper(false, this.cursorEnd);
                        }
                    }
                    else
                    {
                        newEnd = this.cursorEnd;

                        if(this.cursorStart >= this.textNodes[this.textNodes.length - 1].start)
                        {
                            newStart = this.cursorStart;
                        }
                        else
                        {
                            newStart = this.findXHelper(false, this.cursorStart);
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

                this.changeSelect(false);
                break;
            case 'Backspace':
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

                        this.insertText('', palleteState);
                    }
                }
                break;
            case 'Enter':
                input = '\n';
            default:
                let start = this.cursorStart;
                let end = this.cursorEnd;
                this.cursorStart++;
                this.cursorEnd = this.cursorStart;

                console.log('Inserting: ' + input);

                this.insertText(input, palleteState);
                this.stringStart += input.length;
                break;
            }

            /* TODO: Handle undo redo. */

            if(this.hasResized)
            {
                this.hasResized = false;

                let msgPayload: UserResizeMessage = { width: this.width, height: this.height };
                let msg: UserMessage = { header: MessageTypes.RESIZE, payload: msgPayload };

                serverMsgs.push(msg);

                retVal.undoOp = () => { return this.resizeOperation(this.oldWidth, this.oldHeight, this.startTime); };
                retVal.redoOp = () => { return this.resizeOperation(this.width, this.height, this.updateTime); };
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
            let newView: ViewState = this.currentViewState as ViewState;
            let retMsgs: Array<UserMessage> = [];
            let alertMessage: AlertMessageData = null;
            let infoMessage: InfoMessageData = null;
            let wasEdit = false;
            let wasDelete = false;

            switch(message.header)
            {
                case MessageTypes.NODE:
                    let nodeData = message.payload as ServerStyleNodeMessage;

                    if(this.editInBuffer[nodeData.editId])
                    {
                        let buffer = this.editInBuffer[nodeData.editId];
                        buffer.styles.push(nodeData);
                        if(buffer.styles.length == this.editInBuffer[nodeData.editId].num_styles)
                        {
                            clearInterval(this.editInBuffer[nodeData.editId].editTimer);
                            this.completeEdit(nodeData.editId);
                        }
                    }
                    else
                    {
                        /* TODO: Remove debug code. */
                        console.log('STYLENODE: Unkown edit, ID: ' + nodeData.editId);

                        let message: UserMessage = { header: MessageTypes.UNKNOWNEDIT, payload: null };

                        retMsgs.push(message);
                    }

                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.RESIZE:
                    let resizeData = message.payload as ServerResizeMessage;

                    this.resize(resizeData.width, resizeData.height, resizeData.editTime);
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.JUSTIFY:
                    let justifyData = message.payload as ServerJustifyMessage;

                    this.setJustified(justifyData.newState);
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.LOCK:
                    let lockData = message.payload as ServerLockMessage;

                    this.setLock(lockData.userId);
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.RELEASE:
                    this.setUnLock();
                    break;
                case MessageTypes.LOCKID:
                    if(this.gettingLock)
                    {
                        this.setEdit();
                    }
                    else
                    {
                        let releaseMsg: UserMessage = { header: MessageTypes.RELEASE, payload: null };
                        retMsgs.push(releaseMsg);
                    }

                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.IGNORE:
                    if(this.editInBuffer[0])
                    {
                        clearInterval(this.editInBuffer[0].editTimer);
                        this.editInBuffer[0] = null;
                    }
                    wasDelete = true;
                    break;
                case MessageTypes.IGNOREEDIT:
                    let igdata = message.payload as ServerIgnoreEditMessage;
                    if(this.editInBuffer[igdata.editId])
                    {
                        clearInterval(this.editInBuffer[igdata.editId].editTimer);
                        this.editInBuffer[igdata.editId] = null;
                    }
                    break;
                case MessageTypes.COMPLETE:
                    while(this.opBuffer.length > 0)
                    {
                        let opMsg: UserMessage;
                        let op = this.opBuffer.shift();
                        opMsg = { header: op.header, payload: op.payload };
                        retMsgs.push(opMsg);
                    }
                    break;
                case MessageTypes.NODEMISSED:
                    let msdata = message.payload as ServerMissedMessage;
                    let node: TextStyle = this.editOutBuffer[msdata.editId][msdata.num];

                    let msg : UserStyleNodeMessage =
                    {
                        num: msdata.num, editId: msdata.editId, start: node.start, end: node.end, text: node.text,
                        weight: node.weight, style: node.style, decoration: node.decoration, colour: node.colour
                    };
                    let msgCont : UserMessage =  { header:  MessageTypes.NODE, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                case MessageTypes.DROPPED:
                    alertMessage = { header: 'CONNECTION ERROR', message: 'Unable to send data to server due to connection problems.' };
                    wasDelete = true;
                    break;
                case MessageTypes.MOVE:
                    let mvdata = message.payload as ServerMoveElementMessage;
                    this.move(mvdata.x - this.x, mvdata.y - this.y, mvdata.editTime);
                    this.updateTime = mvdata.editTime;
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.DELETE:
                    wasDelete = true;
                    this.erase();
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.RESTORE:
                    this.restore();
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.EDIT:
                    let editData = message.payload as ServerEditMessage;

                    if(!this.editInBuffer[editData.editId])
                    {
                        this.editInBuffer[editData.editId] = { num_styles: editData.num_styles, num_recieved: 0, styles: [], editTimer: null };
                    }

                    let buffer = this.editInBuffer[editData.editId];

                    for(let i = 0; i < editData.styles.length; i++)
                    {
                        let style = editData.styles[i];
                        // Check for integrity.
                        if(style != null && style != undefined && style.text != null && style.text != undefined && style.num != null && style.num != undefined
                            && style.start != null && style.start != undefined && style.end != null && style.end != undefined && style.style != null &&
                            style.style != undefined && style.weight != null && style.weight != undefined && style.colour != null && style.colour != undefined
                            && style.decoration != null && style.decoration != undefined)
                        {
                            buffer.styles[style.num] = style;
                            buffer.num_recieved++;
                        }
                    }

                    if(buffer.num_recieved < buffer.num_styles)
                    {
                        let self = this;
                        buffer.editTimer = setInterval((id) =>
                        {
                            let buffer = self.editInBuffer[id];
                            for(let i = 0; i < buffer.num_styles; i++)
                            {
                                if(buffer[i] == null || buffer[i] == undefined)
                                {
                                    let msg: UserMissingMessage = { seq_num: i };
                                    let msgCont: UserMessage = { header: MessageTypes.MISSINGNODE, payload: msg };
                                    self.sendServerMsg(msgCont);
                                }
                            }
                        }, 1000, editData.editId);
                    }
                    break;
                default:
                    console.error('Unrecognized server message.');
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
            this.gettingLock = true;
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            this.changeSelect(true);
            this.updateView({ gettingLock: true, isSelected: true });

            let messageContainer: UserMessage = { header: MessageTypes.LOCK, payload: null };

            serverMsgs.push(messageContainer);

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

            this.stopLock();

            let messageContainer: UserMessage = { header: MessageTypes.RELEASE, payload: null };
            serverMsgs.push(messageContainer);

            let lineCount = this.textNodes.length;

            if(lineCount == 0)
            {
                lineCount = 1;
            }

            if(lineCount * 1.5 * this.size < this.height)
            {
                this.resize(this.width, lineCount * 1.5 * this.size, new Date());

                /* TODO: Add resize message to messages */
            }

            retVal.newView = this.currentViewState;
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
            if(this.isEditing && this.cursorStart != this.cursorEnd)
            {
                e.clipboardData.setData('text/plain', this.text.substring(this.cursorStart, this.cursorEnd));
            }
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

            if(this.isEditing)
            {
                let data = e.clipboardData.getData('text/plain');

                this.insertText(data, palleteState);

                this.cursorStart = this.cursorStart + data.length;
                this.cursorEnd = this.cursorStart;

                this.changeSelect(true);
            }

            /* TODO: Handle undo redo and resize */

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

            /* TODO */

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
         *    @return {ElementPalleteReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        public handlePalleteChange(pallete: Pallete, change: BoardPalleteChange)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();

            if(change.type == PalleteChangeType.JUSTIFIED)
            {
                let prevVal = this.isJustified;

                retVal.undoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.setJustified(prevVal);

                    let payload: UserJustifyMessage = { newState: prevVal };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                retVal.redoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.setJustified(pallete.isJustified);

                    let payload: UserJustifyMessage = { newState: pallete.isJustified };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                this.setJustified(pallete.isJustified);

                let payload: UserJustifyMessage = { newState: this.isJustified };
                let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };

                serverMsgs.push(msg);
            }
            else if(change.type == PalleteChangeType.SIZE)
            {
                let prevVal = this.size;

                retVal.undoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.size = prevVal;
                    this.updateText();

                    let payload: UserChangeSizeMessage = { newSize: prevVal };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                retVal.redoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.size = pallete.baseSize;
                    this.updateText();

                    let payload: UserChangeSizeMessage = { newSize: pallete.baseSize };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                this.size = pallete.baseSize;
                this.updateText();

                let payload: UserJustifyMessage = { newState: this.isJustified };
                let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };

                serverMsgs.push(msg);
            }
            else
            {
                let styles: Array<TextStyle> = [];

                // Sort the selected characters
                let sortedSelect: Array<number> = this.selectedCharacters.slice();
                sortedSelect.sort();

                for(let i = 0; i < this.styleSet.length; i++)
                {
                    let style = this.styleSet[i];

                    // First
                    let currentStyle: TextStyle = null;
                    // Last
                    let newStyle: TextStyle = null;

                    for(let j = 0; j < sortedSelect.length; j++)
                    {
                        if(style.start <= sortedSelect[j] && style.end > sortedSelect[j])
                        {
                            // Need To add in a new style.
                            if(!this.isCurrentStyle(style, pallete))
                            {
                                if(style.start == sortedSelect[j])
                                {
                                    newStyle =
                                    {
                                        start: sortedSelect[j], end: sortedSelect[j] + 1, decoration: pallete.getDecoration(),
                                        weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                        text: this.text.charAt(sortedSelect[j]), num: styles.length
                                    };

                                    style.start = sortedSelect[j] + 1;
                                    i--;
                                }
                                else if(style.end - 1 == sortedSelect[j])
                                {
                                    currentStyle =
                                    {
                                        start: style.start, end: sortedSelect[j], decoration: style.decoration,
                                        weight: style.weight, style: style.style, colour: style.colour,
                                        text: this.text.substring(style.start, sortedSelect[j]), num: styles.length
                                    };

                                    newStyle =
                                    {
                                        start: sortedSelect[j], end: sortedSelect[j] + 1, decoration: pallete.getDecoration(),
                                        weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                        text: this.text.charAt(sortedSelect[j]), num: styles.length + 1
                                    };
                                }
                                else
                                {
                                    currentStyle =
                                    {
                                        start: style.start, end: sortedSelect[j], decoration: style.decoration,
                                        weight: style.weight, style: style.style, colour: style.colour,
                                        text: this.text.substring(style.start, sortedSelect[j]), num: styles.length
                                    };

                                    newStyle =
                                    {
                                        start: sortedSelect[j], end: sortedSelect[j] + 1, decoration: pallete.getDecoration(),
                                        weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                        text: this.text.charAt(sortedSelect[j]), num: styles.length + 1
                                    };

                                    style.start = sortedSelect[j] + 1;
                                    i--;
                                }

                                break;
                            }
                        }

                        // If no new style splitting, add current style.
                        if(newStyle == null)
                        {
                            currentStyle =
                            {
                                start: style.start, end: style.end, decoration: style.decoration,
                                weight: style.weight, style: style.style, colour: style.colour,
                                text: this.text.substring(style.start, style.end), num: styles.length
                            };
                        }

                        // Add styles to set.
                        if(currentStyle != null)
                        {
                            styles.push(currentStyle);
                        }
                        if(newStyle != null)
                        {
                            styles.push(newStyle);
                        }
                    }
                }

                // Create undo.
                let undoSet = this.styleSet.slice();

                retVal.undoOp = () => { return this.setStyleSet(undoSet); };
                retVal.redoOp = () => { return this.setStyleSet(styles); };

                this.styleSet = styles;
                this.updateText();
                serverMsgs.push(this.textEdited());
            }

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
        private setStyleSet(styleSet: Array<TextStyle>)
        {
            let retMsgs: Array<UserMessage> = [];
            let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

            this.styleSet = styleSet;
            this.updateText();
            let payload = this.textEdited();

            let retVal: ElementUndoRedoReturn =
            {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                wasRestore: null, move: null
            };

            let msg: UserMessage = { header: MessageTypes.EDIT, payload: payload };
            retMsgs.push(msg);

            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        }

        /** Handle the basic resize behaviour.
         *
         *
         */
        private resize(width: number, height: number, updateTime: Date)
        {
            this.updateTime = updateTime;

            this.height = height;

            if(this.width != width)
            {
                this.width = width;
                this.textNodes = this.calculateTextLines();
            }

            if(this.isEditing)
            {
                this.findCursorElems(this.cursorStart, this.cursorEnd);
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems
            });
        }

        /** Handle a move operation and provide view and message updates.
         * TODO: This should probably be in the BoardElement class definition. Problem is the message type.
         * This is used to handle undo and redo operations.
         *
         */
        private moveOperation(changeX: number, changeY: number, updateTime: Date)
        {
            this.move(changeX, changeY, updateTime);

            let msgPayload: UserMoveElementMessage = { x: this.x, y: this.y };
            let serverMsg: UserMessage = { header: MessageTypes.MOVE, payload: msgPayload };

            let retVal: ElementUndoRedoReturn =
            {
                id: this.id, newView: this.currentViewState, serverMessages: [], palleteChanges: [], newViewCentre: null, wasDelete: null,
                wasRestore: null, move: { x: changeX, y: changeY, message: serverMsg }
            };

            return retVal;
        }

        /**
         *
         *
         */
        private resizeOperation(width: number, height: number, updateTime: Date)
        {
            let serverMessages: Array<UserMessage> = [];

            this.resize(width, height, updateTime);

            let msgPayload: UserResizeMessage = { width: this.width, height: this.height };
            let serverMsg: UserMessage = { header: MessageTypes.RESIZE, payload: msgPayload };

            serverMessages.push(serverMsg);

            let retVal: ElementUndoRedoReturn =
            {
                id: this.id, newView: this.currentViewState, serverMessages: [], palleteChanges: [], newViewCentre: null, wasDelete: null,
                wasRestore: null, move: null
            };

            retVal.serverMessages = this.checkForServerId(serverMessages);
            return retVal;
        }

        /**
         *
         *
         */
        private stopLock()
        {
            this.gettingLock = false;

            this.editLock = false;
            this.cursor = null;
            this.cursorElems = [];

            this.updateView({ getLock: false, isEditing: false, cursor: null, cursorElems: [] });
        }

        /**
         *
         *
         */
        private changeSelect(setIdeal: boolean)
        {
            let palleteChange = null;

            if(setIdeal)
            {
                if(this.startLeft)
                {
                    this.idealX = this.findXPos(this.cursorEnd);
                }
                else
                {
                    this.idealX = this.findXPos(this.cursorStart);
                }
            }

            this.findCursorElems(this.cursorStart, this.cursorEnd);

            if(this.styleSet.length > 0)
            {
                let i = 0;

                while(i < this.styleSet.length && this.styleSet[i].start > this.cursorStart || this.styleSet[i].end < this.cursorStart)
                {
                    i++;
                }

                let isBold = this.styleSet[i].weight == 'bold';
                let isItalic = this.styleSet[i].style == 'italic';
                let isOLine = this.styleSet[i].decoration == 'overline';
                let isULine = this.styleSet[i].decoration == 'underline';
                let isTLine = this.styleSet[i].decoration == 'line-through';

                /* TODO: Update pallete */
                palleteChange = { colour: this.styleSet[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine };
            }

            this.updateView({cursor: this.cursor, cursorElems: this.cursorElems});

            return palleteChange;
        }

        /**
         *
         *
         */
        private setEdit()
        {
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            this.gettingLock = false;
            this.isEditing = true;

            this.changeSelect(true);

            this.updateView({ getLock: false, isEditing: true });
        }

        /**
         *
         *
         */
        private setLock(userId: number)
        {
            this.lockedBy = userId;
            this.editLock = true;

            this.updateView({ remLock: true });
        }

        /**
         *
         *
         */
        private setUnLock()
        {
            this.editLock = false;

            this.updateView({ remLock: false });
        }

        /**
         *
         *
         */
        private setJustified(state: boolean)
        {
            this.isJustified = state;
            this.textNodes = this.calculateTextLines();

            if(this.isEditing)
            {
                if(this.startLeft)
                {
                    this.idealX = this.findXPos(this.cursorEnd);
                }
                else
                {
                    this.idealX = this.findXPos(this.cursorStart);
                }

                this.findCursorElems(this.cursorStart, this.cursorEnd);
            }

            this.updateView({ textNodes: this.textNodes, cursor: this.cursor, cursorElems: this.cursorElems });
        }

        /**
         *
         *
         */
        private updateText()
        {
            console.log('Generating lines...');
            this.generateLines();
            this.textNodes = this.calculateTextLines();

            if(this.isSelected)
            {
                this.findCursorElems(this.cursorStart, this.cursorEnd);
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
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

            let currGlyphCount = 0;

            for(let i = 0; i < this.textNodes.length; i++)
            {
                let line: TextNode = this.textNodes[i];

                if(currGlyphCount + line.glyphs.length > loc)
                {
                    return line.glyphs[loc - currGlyphCount].startPos;
                }

                currGlyphCount += line.glyphs.length;
            }
        }

        /**
         *
         *    @param
         */
        private findTextPos(x: number, y: number)
        {
            let xFind = 0;

            if(y < this.y || this.textNodes.length == 0)
            {
                return 0;
            }
            else
            {
                let lineNum = Math.floor(((y - this.y) / (1.5 * this.size)) + 0.15);

                if(lineNum >= this.textNodes.length)
                {
                    return this.textNodes[this.textNodes.length - 1].end;
                }


                /* TODO: Remove debugging code. */
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

                let line = this.textNodes[lineNum];

                if(line.glyphs.length == 0)
                {
                    return line.start;
                }


                let i = 0;
                while(i < line.glyphs.length && xFind > line.glyphs[i].startPos)
                {
                    i++;
                }

                let curr = i - 1;
                let glyph = line.glyphs[i - 1];

                // i and currMes is now the position to the right of the search point.
                // We just need to check if left or right is closer then reurn said point.
                let selPoint;

                if(curr + 1 < line.glyphs.length)
                {
                    if(xFind - glyph.startPos > line.glyphs[curr + 1].startPos - xFind)
                    {
                        selPoint = line.start + curr + 1;
                    }
                    else
                    {
                        selPoint = line.start + i;
                    }
                }
                else
                {
                    if(xFind - glyph.startPos > glyph.startPos + glyph.advance - xFind)
                    {
                        selPoint = line.start + curr + 1;
                    }
                    else
                    {
                        selPoint = line.start + i;
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

            let currGlyphCount = 0;

            for(let i = 0; i < this.textNodes.length; i++)
            {
                let line: TextNode = this.textNodes[i];
                let selStart: number = null;
                let selEnd: number = null;
                let endFound: boolean = false;

                if(cursorStart >= currGlyphCount && cursorStart < currGlyphCount + line.glyphs.length)
                {
                    if(cursorStart == currGlyphCount + line.glyphs.length && !line.spaceRemoved)
                    {
                        selStart = this.width;
                    }
                    else
                    {
                        selStart = line.glyphs[cursorStart - currGlyphCount].startPos;
                    }
                }
                else if(cursorStart < currGlyphCount && cursorEnd > currGlyphCount)
                {
                    selStart = 0;
                }

                if(cursorEnd > currGlyphCount && cursorEnd < currGlyphCount + line.glyphs.length)
                {
                    if(cursorEnd == currGlyphCount + line.glyphs.length && !line.spaceRemoved)
                    {
                        selEnd = this.width;
                    }
                    else
                    {
                        selEnd = line.glyphs[cursorEnd - currGlyphCount].startPos;
                    }
                }
                else if(cursorEnd >= currGlyphCount + line.glyphs.length && cursorStart <= currGlyphCount + line.glyphs.length && i < this.textNodes.length - 1)
                {
                    selEnd = this.width;
                }

                if(cursorEnd >= currGlyphCount && cursorEnd <= currGlyphCount + line.glyphs.length && (this.startLeft || cursorStart == cursorEnd) &&
                    currGlyphCount!= currGlyphCount + line.glyphs.length)
                {
                    if(cursorEnd != currGlyphCount + line.glyphs.length || line.spaceRemoved)
                    {
                        this.cursor = { x: this.x + selEnd, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
                    }
                }
                else if(cursorStart >= currGlyphCount && cursorStart <= currGlyphCount + line.glyphs.length && (!this.startLeft || cursorStart == cursorEnd))
                {
                    if(cursorStart != currGlyphCount + line.glyphs.length || line.spaceRemoved)
                    {
                        this.cursor = { x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
                    }
                }

                if(selStart != null && selEnd != null && cursorStart != cursorEnd)
                {
                    this.cursorElems.push(
                    {
                        x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, width: selEnd - selStart, height: 1.5 * this.size
                    });
                }

                currGlyphCount += line.glyphs.length;
            }
        }

        /**
         *
         *
         */
        private calculateTextLines()
        {
            let i: number;
            let childText = [];
            let currPos: number = 0;
            let prevPos: number = 0;
            let txtStart: number = 0;
            let dy: number = this.size;
            let ddy: number = 1.5 * this.size;
            let nodeCounter: number;
            let computedTextLength: number;
            let currY: number = this.y;
            let lineCount: number = 0;
            let isSpace: boolean = false;
            let currStyle: number = 0;

            for(let k = 0; k < this.lines.length; k++)
            {
                nodeCounter = 0;
                computedTextLength = 0;

                let nLineTrig: boolean = false;
                let startSpace: boolean = this.lines[k].startSpace;
                let wordsT: Array<string> = this.lines[k].words;
                let spacesT: Array<string> = this.lines[k].spaces;
                let wordC: number = 0;
                let spaceC: number = 0;
                let line: string = '';
                let fDash: number;

                console.log('Calculating line.');
                console.log(wordsT);
                console.log(this.styleSet);

                while(wordC < wordsT.length || spaceC < spacesT.length)
                {
                    let lineComplete: boolean = false;
                    let word: string;
                    let tmpLineGlyphs = [];

                    currY += dy;
                    let currLength = 0;
                    let tspanEl : TextNode = {
                        x: this.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, spaceRemoved: true,
                        justified: this.isJustified, lineNum: lineCount, glyphs: []
                    };
                    let progPos = true;

                    nLineTrig = false;

                    if(startSpace)
                    {
                        if(spaceC >= spacesT.length)
                        {
                            console.error('ERROR: Space array out of bounds');
                            return [];
                        }

                        word = spacesT[spaceC];
                        isSpace = true;
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
                        isSpace = false;
                        wordC++;
                    }

                    let glyphRun = { glyphs: [], positions: [] };
                    let wordPos = 0;
                    let tempGlyphs;

                    while(currStyle < this.styleSet.length && currPos + word.length > this.styleSet[currStyle].end)
                    {
                        let fontSet = 'NORMAL';

                        if(this.styleSet[currStyle].weight == 'bold')
                        {
                            if(this.styleSet[currStyle].style == 'italic')
                            {
                                fontSet = 'BOLDITALIC';
                            }
                            else
                            {
                                fontSet = 'BOLD';
                            }
                        }
                        else
                        {
                            if(this.styleSet[currStyle].style == 'italic')
                            {
                                fontSet = 'ITALIC';
                            }
                        }



                        console.log(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));

                        tempGlyphs = fontHelper[fontSet].layout(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));
                        for(let i = 0; i < tempGlyphs.length; i++)
                        {
                            tempGlyphs.glyphs[i].weight = this.styleSet[currStyle].weight;
                            tempGlyphs.glyphs[i].colour = this.styleSet[currStyle].colour;
                            tempGlyphs.glyphs[i].style = this.styleSet[currStyle].style;
                            tempGlyphs.glyphs[i].decoration = this.styleSet[currStyle].decoration;
                        }

                        glyphRun.glyphs.push(...tempGlyphs.glyphs);
                        glyphRun.positions.push(...tempGlyphs.positions);
                        wordPos = this.styleSet[currStyle].end - currPos;
                        currStyle++;
                    }

                    /* TODO: Do we even need this. */
                    if(currStyle < this.styleSet.length)
                    {
                        let fontSet = 'NORMAL';

                        if(this.styleSet[currStyle].weight == 'bold')
                        {
                            if(this.styleSet[currStyle].style == 'italic')
                            {
                                fontSet = 'BOLDITALIC';
                            }
                            else
                            {
                                fontSet = 'BOLD';
                            }
                        }
                        else
                        {
                            if(this.styleSet[currStyle].style == 'italic')
                            {
                                fontSet = 'ITALIC';
                            }
                        }


                        console.log(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));

                        tempGlyphs = fontHelper[fontSet].layout(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));
                        for(let i = 0; i < tempGlyphs.length; i++)
                        {
                            tempGlyphs.glyphs[i].weight = this.styleSet[currStyle].weight;
                            tempGlyphs.glyphs[i].colour = this.styleSet[currStyle].colour;
                            tempGlyphs.glyphs[i].style = this.styleSet[currStyle].style;
                            tempGlyphs.glyphs[i].decoration = this.styleSet[currStyle].decoration;
                        }

                        glyphRun.glyphs.push(...tempGlyphs.glyphs);
                        glyphRun.positions.push(...tempGlyphs.positions);
                    }

                    let wordGlyphs = [];
                    let fDash = -1;

                    console.log(tempGlyphs);
                    console.log(glyphRun.positions);
                    console.log(this.width);
                    console.log(computedTextLength);

                    for(let j = 0; j < glyphRun.positions.length; j++)
                    {
                        let charWidth = (glyphRun.positions[j].xAdvance) * this.size / 1000;
                        console.log(computedTextLength);
                        console.log(charWidth);
                        if(computedTextLength + charWidth < this.width)
                        {
                            if(glyphRun.glyphs[j].codePoints.length == 1 && isHyphen(glyphRun.glyphs[j].codePoints[0]))
                            {
                                fDash = j;
                            }

                            let wordGlyph = { path: glyphRun.glyphs[j].path.toSVG(), stringPositions: glyphRun.glyphs[j].stringPositions,
                                xAdvance: glyphRun.positions[j].xAdvance, yAdvance: glyphRun.positions[j].yAdvance, xOffset: glyphRun.positions[j].xOffset,
                                yOffset: glyphRun.positions[j].yOffset, isSpace: isSpace, weight: glyphRun.glyphs[j].weight, colour: glyphRun.glyphs[j].colour,
                                style: glyphRun.glyphs[j].style, decoration: glyphRun.glyphs[j].decoration };

                            wordGlyphs.push(wordGlyph);
                            computedTextLength += charWidth;
                        }
                        else
                        {
                            lineComplete = true;

                            if(fDash != -1)
                            {
                                // Split the string at dash, use the bit before the dash
                                let newStr = word.substring(fDash + 1, word.length);
                                // Insert the new string into the words array after current position
                                wordsT.splice(wordC, 0, newStr);
                            }
                            else
                            {
                                if(j == 0)
                                {
                                    console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                                    return [];
                                }

                                if(startSpace)
                                {
                                    if(j + 1 < word.length)
                                    {
                                        spacesT.splice(spaceC, 0, word.substring(j + 1, word.length));
                                    }
                                    else
                                    {
                                        startSpace = !startSpace;
                                    }
                                    currPos += wordGlyphs.length;
                                    prevPos = currPos + 1;
                                }
                                else
                                {
                                    wordsT.splice(wordC, 0, word.substring(j, word.length));
                                    currPos += wordGlyphs.length;
                                    tspanEl.spaceRemoved = false;
                                    prevPos = currPos;
                                }
                            }
                            break;
                        }
                    }

                    if(!lineComplete && progPos)
                    {
                        currPos += word.length;
                        startSpace = !startSpace;
                    }

                    line = word;
                    currLength = computedTextLength;
                    tmpLineGlyphs.push(...wordGlyphs);

                    while(!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length))
                    {
                        wordGlyphs = [];

                        // Loop to finish line
                        if(startSpace)
                        {
                            word = spacesT[spaceC++];
                            isSpace = true;
                        }
                        else
                        {
                            word = wordsT[wordC++];
                            isSpace = false;
                        }

                        let glyphRun = { glyphs: [], positions: [] };
                        let wordPos = 0;
                        let tempGlyphs;

                        while(currStyle < this.styleSet.length && currPos + word.length > this.styleSet[currStyle].end)
                        {
                            let fontSet = 'NORMAL';

                            if(this.styleSet[currStyle].weight == 'bold')
                            {
                                if(this.styleSet[currStyle].style == 'italic')
                                {
                                    fontSet = 'BOLDITALIC';
                                }
                                else
                                {
                                    fontSet = 'BOLD';
                                }
                            }
                            else
                            {
                                if(this.styleSet[currStyle].style == 'italic')
                                {
                                    fontSet = 'ITALIC';
                                }
                            }

                            tempGlyphs = fontHelper[fontSet].layout(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));

                            for(let i = 0; i < tempGlyphs.length; i++)
                            {
                                tempGlyphs.glyphs[i].weight = this.styleSet[currStyle].weight;
                                tempGlyphs.glyphs[i].colour = this.styleSet[currStyle].colour;
                                tempGlyphs.glyphs[i].style = this.styleSet[currStyle].style;
                                tempGlyphs.glyphs[i].decoration = this.styleSet[currStyle].decoration;
                            }

                            glyphRun.glyphs.push(...tempGlyphs.glyphs);
                            glyphRun.positions.push(...tempGlyphs.positions);
                            wordPos = this.styleSet[currStyle].end - currPos;
                            currStyle++;
                        }

                        /* TODO: Do we even need this. */
                        if(currStyle < this.styleSet.length)
                        {
                            let fontSet = 'NORMAL';

                            if(this.styleSet[currStyle].weight == 'bold')
                            {
                                if(this.styleSet[currStyle].style == 'italic')
                                {
                                    fontSet = 'BOLDITALIC';
                                }
                                else
                                {
                                    fontSet = 'BOLD';
                                }
                            }
                            else
                            {
                                if(this.styleSet[currStyle].style == 'italic')
                                {
                                    fontSet = 'ITALIC';
                                }
                            }

                            tempGlyphs = fontHelper[fontSet].layout(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));

                            for(let i = 0; i < tempGlyphs.length; i++)
                            {
                                tempGlyphs.glyphs[i].weight = this.styleSet[currStyle].weight;
                                tempGlyphs.glyphs[i].colour = this.styleSet[currStyle].colour;
                                tempGlyphs.glyphs[i].style = this.styleSet[currStyle].style;
                                tempGlyphs.glyphs[i].decoration = this.styleSet[currStyle].decoration;
                            }

                            glyphRun.glyphs.push(...tempGlyphs.glyphs);
                            glyphRun.positions.push(...tempGlyphs.positions);
                        }


                        let tmpLength = computedTextLength;

                        for(let j = 0; j < glyphRun.positions.length; j++)
                        {
                            let charWidth = (glyphRun.positions[j].xAdvance) * this.size / 1000;
                            if(tmpLength + charWidth < this.width)
                            {
                                if(glyphRun.glyphs[j].codePoints.length == 1 && isHyphen(glyphRun.glyphs[j].codePoints[0]))
                                {
                                    fDash = j;
                                }

                                let wordGlyph = { path: glyphRun.glyphs[j].path.toSVG(), stringPositions: glyphRun.glyphs[j].stringPositions,
                                    xAdvance: glyphRun.positions[j].xAdvance, yAdvance: glyphRun.positions[j].yAdvance, xOffset: glyphRun.positions[j].xOffset,
                                    yOffset: glyphRun.positions[j].yOffset, isSpace: isSpace, weight: glyphRun.glyphs[j].weight,
                                    colour: glyphRun.glyphs[j].colour, style: glyphRun.glyphs[j].style, decoration: glyphRun.glyphs[j].decoration };

                                wordGlyphs.push(wordGlyph);
                                tmpLength += charWidth;
                            }
                            else
                            {
                                lineComplete = true;

                                if(startSpace)
                                {
                                    if(word.length > j + 1)
                                    {
                                        wordsT[--spaceC] = word.substring(j + 1, word.length);
                                        word =  word.substring(0, j);
                                        startSpace = !startSpace;
                                    }
                                }
                                else
                                {
                                    word = '';
                                    wordC--;
                                    startSpace = !startSpace;
                                    tmpLength = computedTextLength;
                                    wordGlyphs = [];
                                }

                                break;
                            }
                        }

                        computedTextLength = tmpLength;
                        currPos += word.length;
                        startSpace = !startSpace;

                        tmpLineGlyphs.push(...wordGlyphs);
                    }

                    // Once the line is complete / out of stuff split into styles
                    dy = ddy;
                    nodeCounter = 0;

                    if(wordC == wordsT.length && spaceC == spacesT.length)
                    {
                        tspanEl.justified = false;
                    }

                    let reqAdjustment = this.width - computedTextLength;
                    let numSpaces = line.length - line.replace(/\s/g, "").length;
                    let extraSpace = 0;

                    if(tspanEl.justified)
                    {
                        extraSpace = reqAdjustment / numSpaces;
                    }

                    let lineGlyphs = [];
                    let currentDist = 0;

                    for(let i = 0; i < tmpLineGlyphs.length; i++)
                    {
                        let newGlyph: TextGlyph =
                        {
                            path: tmpLineGlyphs[i].path, stringPositions: tmpLineGlyphs[i].stringPositions, startPos: currentDist,
                            advance: tmpLineGlyphs[i].xAdvance, weight: tmpLineGlyphs[i].weight, colour: tmpLineGlyphs[i].colour, style: tmpLineGlyphs[i].style,
                            decoration: tmpLineGlyphs[i].decoration
                        };

                        console.log(tmpLineGlyphs[i].path);

                        currentDist += tmpLineGlyphs[i].xAdvance;

                        if(tmpLineGlyphs[i].isSpace)
                        {
                            currentDist += extraSpace;
                        }

                        lineGlyphs.push(newGlyph);
                    }

                    tspanEl.glyphs = lineGlyphs;
                    tspanEl.end = tspanEl.start + lineGlyphs.length;

                    childText.push(tspanEl);
                    lineCount++;
                }
            }

            if(lineCount * 1.5 * this.size > this.height)
            {
                this.resize(this.width, lineCount * 1.5 * this.size, new Date());
                this.hasResized = true;
            }

            return childText;
        }

        /**
         *
         *
         */
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
            while(i < line.glyphs.length && this.idealX > line.glyphs[i].startPos)
            {
                i++;
            }

            let curr = i - 1;
            let glyph = line.glyphs[i - 1];

            // i and currMes is now the position to the right of the search point.
            // We just need to check if left or right is closer then reurn said point.
            let selPoint;

            if(curr + 1 < line.glyphs.length)
            {
                if(this.idealX - glyph.startPos > line.glyphs[curr + 1].startPos - this.idealX)
                {
                    selPoint = line.start + curr + 1;
                }
                else
                {
                    selPoint = line.start + i;
                }
            }
            else
            {
                if(this.idealX - glyph.startPos > glyph.startPos + glyph.advance - this.idealX)
                {
                    selPoint = line.start + curr + 1;
                }
                else
                {
                    selPoint = line.start + i;
                }
            }

            return selPoint;
        }

        /**
         *
         *
         */
        private isCurrentStyle(style: Style, pallete: Pallete)
        {
            if(style.colour == pallete.colour && style.decoration == pallete.getDecoration() &&
                style.weight == pallete.getWeight() && style.style == pallete.getStyle())
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /**
         *
         * This method might be a bit slow as it removes each character individually. TODO: Monitor this behaviour.
         */
        private removeCharacter(index: number)
        {
            this.text = this.text.slice(0, index) + this.text.slice(index, this.text.length);

            for(let i = 0; i < this.styleSet.length; i++)
            {
                if(this.styleSet[i].end >= index)
                {
                    this.styleSet[i].end--;
                }

                if(this.styleSet[i].start == index && this.styleSet[i].end == index)
                {
                    // Remove this style from the set.
                    this.styleSet.splice(i, 1);
                }
                else if(this.styleSet[i].start > index)
                {
                    this.styleSet[i].start--;
                }
            }
        }

        /**
         *
         *
         */
        private insertText(text: string, pallete: Pallete)
        {
            // New Code
            for(let i = 0; i < this.selectedCharacters.length; i++)
            {
                // Remove all selected characters and shift style positions.
                this.removeCharacter(this.selectedCharacters[i]);
            }

            // Now Insert the string at the stringStart position.
            let isNew = true;
            let textStart = this.text.slice(0, this.stringStart);
            let textEnd = this.text.slice(this.stringStart, this.text.length);
            let styles: Array<TextStyle> = [];

            let fullText = textStart + text + textEnd;

            let hasInserted = false;

            // Create new style set.
            for(let i = 0; i < this.styleSet.length; i++)
            {
                let sty = this.styleSet[i];

                if(sty.start >= this.stringStart)
                {
                    if(hasInserted)
                    {
                        // Completely after selection
                        if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                            && styles[styles.length - 1].decoration == sty.decoration
                            && styles[styles.length - 1].weight == sty.weight
                            && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= MAX_STYLE_LENGTH)
                        {
                            // If this is the same as the previous style and are length compatible then combine
                            styles[styles.length - 1].end += sty.end - sty.start;
                            styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                        }
                        else
                        {

                            styles.push(
                            {
                                start: sty.start + text.length, end: sty.end + text.length, colour: sty.colour, decoration: sty.decoration,
                                style: sty.style, weight: sty.weight, text: fullText.slice(sty.start + text.length, sty.end + text.length), num: styles.length
                            });
                        }
                    }
                    else
                    {
                        if(text.length <= MAX_STYLE_LENGTH)
                        {
                            console.log('This stupid thing.');

                            // Insert the new style
                            styles.push(
                            {
                                start: this.stringStart, end: this.stringStart + text.length, colour: pallete.getColour(), decoration: pallete.getDecoration(),
                                style: pallete.getStyle(), weight: pallete.getWeight(), text: fullText.slice(this.stringStart, this.stringStart + text.length),
                                num: styles.length
                            });
                        }
                        else
                        {
                            // New Style would be too long so split it up.
                            let splitArray = this.getStyleSplits(text.length);
                            let prevStart = 0;

                            console.log('This stupid thing1.');

                            for(let j = 0; j < splitArray.length; j++)
                            {
                                styles.push(
                                {
                                    start: this.stringStart + prevStart, end: this.stringStart + prevStart + splitArray[j],colour: pallete.getColour(),
                                    decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                                    text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), num: styles.length
                                });

                                prevStart += splitArray[j];
                            }
                        }

                        hasInserted = true;
                    }
                }
                else
                {
                    if(sty.end < this.stringStart)
                    {
                        console.log('This stupid thing2.');

                        // Completely before selection
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push(
                        {
                            start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration,
                            style: sty.style, weight: sty.weight, text: sty.text, num: styles.length
                        });
                    }
                    else
                    {
                        if(this.isCurrentStyle(sty, pallete))
                        {
                            if(sty.end - sty.start + text.length <= MAX_STYLE_LENGTH)
                            {
                                console.log('This stupid thing3.');

                                styles.push(
                                {
                                    start: sty.start, end: sty.end + text.length, colour: sty.colour, decoration: sty.decoration,
                                    style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, sty.end + text.length), num: styles.length
                                });
                            }
                            else
                            {
                                // New Style would be too long so split it up.
                                let splitArray = this.getStyleSplits(sty.end - sty.start + text.length);
                                let prevStart = 0;

                                console.log('This stupid thing4.');

                                for(let j = 0; j < splitArray.length; j++)
                                {
                                    styles.push(
                                    {
                                        start: sty.start + prevStart, end: sty.end + prevStart + splitArray[j], colour: sty.colour,
                                        decoration: sty.decoration, style: sty.style, weight: sty.weight,
                                        text: fullText.slice(sty.start + prevStart, sty.start + prevStart + splitArray[j]), num: styles.length
                                    });

                                    prevStart += splitArray[j];
                                }
                            }
                        }
                        else
                        {
                            console.log('This stupid thing5.');

                            // Style before the new split
                            styles.push(
                            {
                                start: sty.start, end: this.stringStart, colour: sty.colour, decoration: sty.decoration,
                                style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, this.stringStart), num: styles.length
                            });

                            if(text.length <= MAX_STYLE_LENGTH)
                            {
                                // Insert the new style
                                styles.push(
                                {
                                    start: this.stringStart, end: this.stringStart + text.length, colour: pallete.getColour(),
                                    decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                                    text: fullText.slice(this.stringStart, this.stringStart + text.length), num: styles.length
                                });
                            }
                            else
                            {
                                // New Style would be too long so split it up.
                                let splitArray = this.getStyleSplits(text.length);
                                let prevStart = 0;

                                for(let j = 0; j < splitArray.length; j++)
                                {
                                    styles.push(
                                    {
                                        start: this.stringStart + prevStart, end: this.stringStart + prevStart + splitArray[j],colour: pallete.getColour(),
                                        decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                                        text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), num: styles.length
                                    });

                                    prevStart += splitArray[j];
                                }
                            }

                            // Style after the new split
                            styles.push(
                            {
                                start: this.stringStart + text.length, end: sty.end + text.length, colour: sty.colour, decoration: sty.decoration,
                                style: sty.style, weight: sty.weight, text: fullText.slice(this.stringStart + text.length, sty.end + text.length),
                                num: styles.length
                            });
                        }
                    }

                    hasInserted = true;
                }
            }

            if(!hasInserted)
            {
                console.log('This stupid thing6.');

                // Insert the new style at the end of the list.
                if(text.length <= MAX_STYLE_LENGTH)
                {
                    // Insert the new style
                    styles.push(
                    {
                        start: this.stringStart, end: this.stringStart + text.length, colour: pallete.getColour(), decoration: pallete.getDecoration(),
                        style: pallete.getStyle(), weight: pallete.getWeight(), text: fullText.slice(this.stringStart, this.stringStart + text.length),
                        num: styles.length
                    });
                }
                else
                {
                    // New Style would be too long so split it up.
                    let splitArray = this.getStyleSplits(text.length);
                    let prevStart = 0;

                    for(let j = 0; j < splitArray.length; j++)
                    {
                        styles.push(
                        {
                            start: this.stringStart + prevStart, end: this.stringStart + prevStart + splitArray[j],colour: pallete.getColour(),
                            decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                            text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), num: styles.length
                        });

                        prevStart += splitArray[j];
                    }
                }
            }

            this.text = fullText;
            this.styleSet = styles;
            this.updateText();
            return this.newEdit();
        }

        /** A helper function to chunk styles to the maximum style size.
         *
         *
         */
        private getStyleSplits(length: number)
        {
            let slices = [];
            let lengthCount = 0;

            while(lengthCount < length)
            {
                slices.push(length - lengthCount < MAX_STYLE_LENGTH ? length - lengthCount : MAX_STYLE_LENGTH);
                lengthCount += length - lengthCount < MAX_STYLE_LENGTH ? length - lengthCount : MAX_STYLE_LENGTH;
            }

            return slices;
        }

        /**
         *
         *
         */
        private newEdit()
        {
            this.editCount++;

            if(this.editCount > 5)
            {
                // Notify of changes and clear that pesky timeout
                this.editCount = 0;
                clearTimeout(this.editTimer);
                return this.textEdited();
            }
            else
            {
                // Set timeout
                let self = this;
                clearTimeout(this.editTimer);
                this.editTimer = setTimeout(() =>
                {
                    self.editCount = 0;
                    self.sendServerMsg(self.textEdited());
                    clearTimeout(this.editTimer);

                }, 6000);

                return null;
            }
        }

        /** Generate the set of text lines, denoted by the newline characters in the text.
         *  These are given in terms of arrays of spaces and words.
         *
         *
         */
        private generateLines()
        {
            let linesText = [];
            let lines = [];

            let textSort = this.text;

            while(textSort.indexOf('\n') != -1)
            {
                linesText.push(textSort.substring(0, textSort.indexOf('\n')));
                textSort = textSort.substring(textSort.indexOf('\n') + 1, textSort.length);
            }

            linesText.push(textSort.substring(0, textSort.length));

            for(let i = 0; i < linesText.length; i++)
            {
                let lineText = linesText[i];
                let txtStart = 0;
                let isWhiteSpace = true;
                let lineData = { words: [], spaces: [], startSpace: true };

                let j;
                for(j = 0; j < lineText.length; j++)
                {
                    if(isWhiteSpace)
                    {
                        if(!lineText.charAt(j).match(/\s/))
                        {
                            if(j > 0)
                            {
                                lineData.spaces.push(lineText.substring(txtStart, j));
                                txtStart = j;
                                isWhiteSpace = false;
                            }
                            else
                            {
                                lineData.startSpace = false;
                                isWhiteSpace = false;
                            }
                        }
                    }
                    else
                    {
                        if(lineText.charAt(j).match(/\s/))
                        {
                            lineData.words.push(lineText.substring(txtStart, j));
                            txtStart = j;
                            isWhiteSpace = true;
                        }
                    }
                }

                if(isWhiteSpace)
                {
                    lineData.spaces.push(lineText.substring(txtStart, j));
                }
                else
                {
                    lineData.words.push(lineText.substring(txtStart, j));
                }

                lines[i] = lineData;
            }

            this.lines = lines;
        }

        /**
         *
         *
         */
        private completeEdit(editId: number)
        {
            let fullText = '';
            let editData = this.editInBuffer[editId];

            for(let i = 0; i < editData.styles.length; i++)
            {
                this.styleSet[editData[i].num] = editData[i];
            }

            for(let i = 0; i < this.styleSet.length; i++)
            {
                fullText += this.styleSet[i].text;
            }

            this.text = fullText;

            this.updateText();
        }

        /**
         *
         *
         */
        private textEdited()
        {
            // This is a new textbox.
            this.editOutBuffer = [];
            let editNum = this.editNum++;

            for(let i = 0; i < this.styleSet.length; i++)
            {
                this.editOutBuffer[editNum].push(this.styleSet[i]);
            }

            let payload: UserEditMessage = { bufferId: editNum, num_styles: this.editOutBuffer[editNum].length, styles: this.editOutBuffer[editNum] };
            let msg: UserMessage = { header: MessageTypes.EDIT, payload: payload };

            return msg;
        }

        /**
         *
         *
         */
        private findStringPositions()
        {
            this.selectedCharacters = [];

            let found = [];

            if(this.textNodes.length == 0)
            {
                return 0;
            }

            let currGlyphCount = 0;

            for(let i = 0; i < this.textNodes.length; i++)
            {
                let line = this.textNodes[i];

                if(this.cursorEnd < currGlyphCount)
                {
                    break;
                }


                for(let j = 0; j < line.glyphs.length; j++)
                {
                    let glyph = line.glyphs[j];

                    if(currGlyphCount + j >= this.cursorStart && currGlyphCount + j < this.cursorEnd)
                    {
                        for(let k = 0; k < glyph.stringPositions.length; k++)
                        {
                            if(glyph.stringPositions[k] === undefined)
                            {
                                found[glyph.stringPositions[k]] = true;
                                this.selectedCharacters.push(glyph.stringPositions[k]);
                            }
                        }
                    }

                    if(currGlyphCount + j == this.cursorStart)
                    {
                        this.stringStart = glyph.stringPositions[0];
                    }
                }




                currGlyphCount += line.glyphs.length;
            }
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let fontHelper = [];

declare let fontkit: {
    create: (buff) => void
};

declare let NodeBuffer: {
    Buffer;
};

let normReq = new XMLHttpRequest();
normReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Regular.ttf", true);
normReq.responseType = "arraybuffer";

normReq.onload = function(oEvent)
{
    let arrayBuffer = normReq.response;

    let buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['NORMAL'] = fontkit.create(buffer);
};

normReq.send(null);

let boldReq = new XMLHttpRequest();
boldReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Bold.ttf", true);
boldReq.responseType = "arraybuffer";

boldReq.onload = function(oEvent)
{
    let arrayBuffer = boldReq.response;

    let buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['BOLD'] = fontkit.create(buffer);
};

boldReq.send(null);

let italReq = new XMLHttpRequest();
italReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Italic.ttf", true);
italReq.responseType = "arraybuffer";

italReq.onload = function(oEvent)
{
    let arrayBuffer = italReq.response;

    let buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['ITALIC'] = fontkit.create(buffer);
};

italReq.send(null);

let boldItalReq = new XMLHttpRequest();
boldItalReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-BoldItalic.ttf", true);
boldItalReq.responseType = "arraybuffer";

boldItalReq.onload = function(oEvent)
{
    let arrayBuffer = boldItalReq.response;

    let buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['BOLDITALIC'] = fontkit.create(buffer);
};

boldItalReq.send(null);

registerComponent(WhiteBoardText.MODENAME, WhiteBoardText.Element, WhiteBoardText.Pallete);
