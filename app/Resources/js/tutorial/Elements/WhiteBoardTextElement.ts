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
        JUSTIFIED,
        TEXTCHANGE
    }

    interface TextPalleteChange {
        colour: string;
        isBold: boolean;
        isItalic: boolean;
        isOLine: boolean;
        isULine: boolean;
        isTLine: boolean;
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
        Interaction,
        TextArea
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
        NODE: 1,
        MISSED: 2,
        JUSTIFY: 3,
        EDIT: 4,
        COMPLETE: 5,
        DROPPED: 6,
        IGNORE: 7,
        SIZECHANGE: 8
    };

    interface CursorElement extends Point {
        height: number;
    }
    interface CursorSelection extends CursorElement {
        width: number;
    }
    interface Style {
        weight: string;
        style: string;
        colour: string;
        oline: boolean;
        uline: boolean;
        tline: boolean;
    }
    interface TextStyle extends Style {
        start: number;
        end: number;
        text: string;
        seq_num: number;
    }
    interface Section {
        startPos: number;
        startGlyph: number;
        stringStart: number;
        glyphs: Array<GlyphData>;
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
        sections: Array<Section>;
        endStringPos: number;
    }
    interface WhiteBoardText extends BoardElementParameters {
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

    /* Data types to optimize text calculations, for normal words there will only be one segment,
     * for very long words (>15 chars) multiple segments will be used. Styling will also cause splitting into segments. */
    interface GlyphData {
        isLigature: boolean;
        isMark: boolean;
        codePoints: Array<number>;
        path: string;
        stringPositions: Array<number>;
        colour: string;
        uline: boolean;
        oline: boolean;
        tline: boolean;
        startAdvance: number;
        xAdvance: number;
        yAdvance: number;
        xOffset: number;
        yOffset: number;
        isSpace: boolean;
        isHyphen: boolean;
    }
    interface SegmentData {
        style: TextStyle;
        startPos: number;
        glyphs: Array<GlyphData>;
        startAdvance: number;
        segmentAdvance: number;
        segmentLength: number;
        hasHyphen: boolean;
    }
    interface WordData {
        startPos: number;
        wordAdvance: number;
        wordLength: number;
        segments: Array<SegmentData>;
    }
    /* Line data is assigned to splits generated by new line characters. */
    interface LineData {
        startWord: number;
        count: number;
    }

    interface EditData {
        deletions: Array<{ start: number, end: number }>;
        insertion: { start: number, text: string, style: TextStyle };
        styleChanges: Array<{ start: number, end: number }>;
    }

    interface ServerNewTextPayload extends ServerMessagePayload {
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
        nodes: Array<NodeContainer>;
    }
    interface ServerStyleNodeMessage extends ServerMessagePayload {
        editId: number;
        userId: number;
        node: TextStyle;
    }
    interface ServerMissedMessage extends ServerMessagePayload {
        editId: number;
        num: number;
    }
    interface ServerJustifyMessage extends ServerMessagePayload {
        newState: boolean;
    }
    interface ServerEditMessage extends ServerMessagePayload {
        userId: number;
        editId: number;
        num_styles: number;
        styles: Array<TextStyle>;
        editTime: Date;
    }
    interface ServerEditIdMessage extends ServerMessagePayload {
        editId: number;
        bufferId: number;
        localId: number;
    }
    interface ServerLockIdMessage extends ServerMessagePayload {

    }
    interface ServerLockMessage extends ServerMessagePayload {
        userId: number;
    }
    interface ServerChangeSizeMessage extends ServerMessagePayload {
        newSize: number;
    }
    interface ServerDroppedMessage extends ServerMessagePayload {
        editId: number;
        bufferId: number;
    }

    interface NodeContainer extends Style {
        seq_num: number;
        start: number;
        end: number;
        text: string;
    }

    interface UserNewTextMessage extends UserNewElementPayload {
        size: number;
        justified: boolean;
    }
    interface UserEditMessage extends UserMessagePayload {
        bufferId: number;
        num_styles: number;
        nodes: Array<TextStyle>;
    }
    interface UserNodeMessage extends UserMessagePayload {
        editId: number;
        node: TextStyle;
    }
    interface UserJustifyMessage extends UserMessagePayload {
        newState: boolean;
    }

    interface UserMissingNodeMessage extends UserMessagePayload {
        editId: number;
        userId: number;
        seq_num: number;
    }
    interface UserChangeSizeMessage extends UserMessagePayload {
        newSize: number;
    }
    interface PreviousCursorPositions {
        start: number;
        end: number;
        prevEnd: number;
        bStart: number;
        bPrevEnd: number;
    }

    const MAX_STYLE_LENGTH = 200;
    const MAX_SEGEMENT_LENGTH = 63;

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

            this.baseSize = PalleteSize.MEDIUM;
            this.colour = 'black';
            this.isBold = false;
            this.isItalic = false;
            this.isOLine = false;
            this.isTLine = false;
            this.isULine = false;

            this.currentViewState = { colour: PalleteColour.BLACK, size: PalleteSize.MEDIUM };
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

        public isOverline()
        {
            return this.isOLine;
        }

        public isUnderline()
        {
            return this.isULine;
        }

        public isThroughline()
        {
            return this.isTLine;
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
                this.isULine = change.data;
                this.updateView({ isULine: change.data });
            }
            else if(change.type == PalleteChangeType.OVERLINE)
            {
                this.isOLine = change.data;
                this.updateView({ isOLine: change.data });
            }
            else if(change.type == PalleteChangeType.THROUGHLINE)
            {
                this.isTLine = change.data;
                this.updateView({ isTLine: change.data });
            }
            else if(change.type == PalleteChangeType.JUSTIFIED)
            {
                this.isJustified = change.data;
                this.updateView({ isJustified: change.data });
            }
            else if(change.type == PalleteChangeType.TEXTCHANGE)
            {
                let dataIn = change.data as TextPalleteChange;
                this.colour = dataIn.colour;
                this.isBold = dataIn.isBold;
                this.isItalic = dataIn.isItalic;
                this.isULine = dataIn.isULine;
                this.isOLine = dataIn.isOLine;
                this.isTLine = dataIn.isTLine;
                this.updateView(
                {
                    colour: dataIn.colour, isBold: dataIn.isBold, isItalic: dataIn.isItalic,
                    isULine: dataIn.isULine, isOLine: dataIn.isOLine, isTLine: dataIn.isTLine
                });
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
        textSelecting: boolean = false;

        startLeft: boolean = false;
        textNodes: Array<TextNode> = [];
        wordData: Array<WordData> = [];
        lineData: Array<LineData> = [];
        linePositions: Array<number> = [];
        editData: EditData = null;
        glyphCount: number = 0;
        text: string = '';
        lines = [];
        cursorElems;
        cursor;
        styleSet: Array<TextStyle> = [];

        editInBuffer: Array<Array<{ num_styles: number, num_recieved: number, styles: Array<TextStyle>, editTimer }>> = [];
        editOutBuffer: Array<Array<TextStyle>> = [];
        editNum: number = 0;
        editCount: number = 0;
        editTimer;

        textDown: number = 0;
        idealX: number = 0;

        // Undo Redo Buffers for merging.
        wordStart: number = null;
        wordEnd: number = null;
        prevWordStart: number = null;
        prevWordEnd: number = null;
        paraStart: number = null;
        paraEnd: number = null;
        prevParaStart: number = null;
        prevParaEnd: number = null;
        prevStyle: Style = null;
        prevCursorPos: number = null;
        lastFowardEdit: number = null;
        wasSpaceLast: boolean = false;
        spaceToggle: boolean = false;
        cursorUndoPositions: Array<PreviousCursorPositions> = [];
        cursorRedoPositions: Array<PreviousCursorPositions> = [];

        waitingForFont: Array<number> = [];


        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The element.
        */
        public static createElement( data: CreationData )
        {
            if(data.serverId != null && data.serverId != undefined && data.serverMsg != null && data.serverMsg != undefined)
            {
                let msg = data.serverMsg as ServerNewTextPayload;

                return new Element(data.id, data.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.size,
                    msg.justified, msg.num_styles, msg.nodes, (msg.editLock != 0), (msg.editLock == 0 ? null : msg.editLock),
                    false, data.serverId, msg.editTime)
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
            size: number, isJustified: boolean, num_styles: number, styles: Array<NodeContainer>, editLock: boolean, lockedBy: number, isEditing: boolean,
            serverId?: number, updateTime?: Date)
        {
            super(MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime);

            this.text = '';

            if(serverId == null || serverId == undefined)
            {
                this.isEditing = true;
            }

            this.lockedBy = lockedBy;
            this.isJustified = isJustified;
            this.size = size;

            this.editInBuffer[0] = [];
            this.editInBuffer[0][0] = { num_styles: num_styles, num_recieved: 0, styles: [], editTimer: null };

            let buffer = this.editInBuffer[0][0];

            for(let i = 0; i < styles.length; i++)
            {
                let style = styles[i];
                // Check for integrity.
                if(style != null && style != undefined && style.text != null && style.text != undefined && style.seq_num != null && style.seq_num != undefined
                    && style.start != null && style.start != undefined && style.end != null && style.end != undefined && style.style != null
                    && style.style != undefined && style.weight != null && style.weight != undefined && style.colour != null && style.colour != undefined
                    && style.oline != null && style.oline != undefined && style.uline != null && style.uline != undefined
                    && style.tline != null && style.tline != undefined)
                {
                    buffer.styles[style.seq_num] = style;
                    buffer.num_recieved++;
                }
            }

            if(buffer.num_recieved < buffer.num_styles)
            {
                let self = this;
                buffer.editTimer = setInterval((id, userId) =>
                {
                    let buffer = self.editInBuffer[0][0];
                    for(let i = 0; i < buffer.num_styles; i++)
                    {
                        if(buffer[i] == null || buffer[i] == undefined)
                        {
                            let msg: UserMissingNodeMessage = { editId: id, userId: userId, seq_num: i };
                            let msgCont: UserMessage = { header: MessageTypes.MISSED, payload: msg };
                            self.sendServerMsg(msgCont);
                        }
                    }
                }, 1000, 0, userId);
            }
            else
            {
                this.completeEdit(0, 0);
            }

            this.cursorStart = 0;
            this.cursorEnd = 0;
            this.wordStart = 0;
            this.selectedCharacters = [];
            this.stringStart = 0;
            this.prevCursorPos = this.cursorStart;

            this.gettingLock = false;
            this.isEditing = isEditing;
            this.isSelected = isEditing;

            this.changeSelect(true);

            let newView : ViewState = {
                mode: MODENAME, id: this.id, x: this.x, y: this.y, width: this.width, height: this.height, isEditing: this.isEditing,
                remLock: (this.lockedBy != null && !this.isEditing), getLock: false, textNodes: this.textNodes, cursor: null, cursorElems: [], size: this.size,
                updateTime: updateTime, isSelected: false, text: this.text, justified: true, isMoving: false, isResizing: false
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
            let msg: UserNewTextMessage =
            {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height,
                size: this.size, justified: this.isJustified, editLock: true
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
            // TODO: Create enriched and html text.

            let plainText = '';
            for(let i = 0; i < this.selectedCharacters.length; i++)
            {
                plainText += this.text.substring(this.selectedCharacters[i], this.selectedCharacters[i] + 1);
            }

            let clipData: Array<ClipBoardItem> = [];

            clipData.push({ format: 'text/plain', data: plainText });

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
            else if(component == ViewComponents.Interaction)
            {
                this.isMoving = true;
                this.moveStartX = this.x;
                this.moveStartY = this.y;
                this.startTime = this.updateTime;

                cursorType = {cursor: 'move', url: [], offset: {x: 0, y: 0}};

                this.updateView({ isSelected: true, isMoving: true });
                this.isSelected = true;
            }
            else if(component == ViewComponents.TextArea)
            {
                this.textSelecting = true;
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

            if(this.isEditing && e.buttons === 1)
            {
                this.textSelecting = true;
                this.cursorStart = this.findTextPos(mouseX - this.x, mouseY - this.y);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                retVal.palleteChanges.push(...this.changeSelect(true));
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
            let palleteChanges: Array<BoardPalleteChange> = [];

            if(this.isResizing)
            {
                let lineCount = this.textNodes.length;

                if(lineCount == 0)
                {
                    lineCount = 1;
                }

                let newWidth  = this.resizeHorz ? Math.max(2 * this.size, mouseX - this.x) : this.width;
                let newHeight = this.resizeVert ? Math.max(lineCount * 2 * this.size, mouseY - this.y) : this.height;

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
            else if(e.buttons === 1 && this.textSelecting)
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

            this.textSelecting = false;
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
         *    required changes to the pallete state, whether to set this element as selected
         */
        public handleKeyPress(e: KeyboardEvent, input: string, palleteState: Pallete)
        {
            let serverMsgs: Array<UserMessage> = [];
            let retVal = this.getDefaultInputReturn();
            let i: number;
            let newStart: number;
            let newEnd: number;
            let wasSpace = false;
            let wasNewPara = false;
            let prevStringStart: number;
            let prevCursorStart: number;
            let prevCursorEnd: number;

            let insertion: { start: number, text: string, style: TextStyle } = { start: null, text: null, style: null };
            let deletions: Array<{ start: number, end: number }> = [];
            let editData: EditData = { deletions: deletions, insertion: insertion, styleChanges: [] };

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
                    this.changeSelect(true)
                }
                else
                {
                    this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                    this.cursorEnd = this.cursorStart;
                    retVal.palleteChanges.push(...this.changeSelect(true));
                }
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
                    this.changeSelect(true)
                }
                else
                {
                    this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                    this.cursorEnd = this.cursorStart;
                    retVal.palleteChanges.push(...this.changeSelect(true));
                }
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
                    this.changeSelect(false)
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
                    retVal.palleteChanges.push(...this.changeSelect(false));
                }
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
                    this.changeSelect(false)
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
                    retVal.palleteChanges.push(...this.changeSelect(false));
                }
                break;
            case 'Backspace':
                if(this.wordEnd > this.operationPos)
                {
                    this.wordEnd = this.operationPos;
                    this.lastFowardEdit = this.wordEnd;

                    // There has been a sequence of undos before this input, tidy up the undo/redo merging.
                    if(this.wordStart >= this.operationPos)
                    {
                        // Throw away previous word and split this word.
                        this.wordStart = this.prevWordStart;
                        this.prevWordStart = null;
                        this.prevWordEnd = null;
                    }
                }

                if(this.cursorEnd > 0)
                {
                    let tPrevStart = this.cursorStart;
                    prevStringStart = this.stringStart;
                    prevCursorStart = this.cursorStart;
                    let bPrevCursorStart = this.cursorStart;
                    prevCursorEnd = this.cursorEnd;

                    let prevText = this.text;
                    let prevStyles = this.styleSet;

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
                            this.findStringPositions();
                            bPrevCursorStart = this.cursorStart;
                        }

                        let sortedSelect: Array<number> = this.selectedCharacters.slice();
                        sortedSelect.sort(function(a, b) { return b - a; });
                        let prev = -2;
                        let start = -1;
                        editData.insertion = null;

                        // Check if we are deleting over a line or a paragraph and create contigeous deletions.
                        for(let i = 0; i < sortedSelect.length; i++)
                        {
                            if(sortedSelect[i] - 1 != prev)
                            {
                                if(start >= 0)
                                {
                                    let newDeletion = { start: start, end: prev };
                                    deletions.push(newDeletion);
                                }

                                start = sortedSelect[i];
                            }

                            prev = sortedSelect[i];

                            if(this.text.charAt(sortedSelect[i]).match(/\s/))
                            {
                                if(this.wasSpaceLast)
                                {
                                    this.spaceToggle = true;
                                }
                                wasSpace = true;
                            }

                            if(this.text.charAt(sortedSelect[i]) == '\n')
                            {
                                wasNewPara = true;
                            }
                        }

                        this.removeSelection(sortedSelect);
                        this.generateLines();

                        this.evaluateChanges(editData);

                        this.calculateTextLines();
                        this.findStringPositions();
                        let msg = this.newEdit();

                        if(msg != null)
                        {
                            serverMsgs.push(msg);
                        }

                        this.cursorEnd = this.cursorStart;
                    }

                    /* TODO: Check this condition. */
                    if((wasSpace && !this.spaceToggle) || (!wasSpace && this.spaceToggle) || this.prevCursorPos != tPrevStart)
                    {
                        let undoStart = this.prevWordStart;
                        let undoEnd = this.prevWordEnd;

                        if(this.lastFowardEdit != null)
                        {
                            this.wordEnd = this.lastFowardEdit;
                        }

                        this.wordMerger(undoStart, undoEnd);

                        if(this.lastFowardEdit != null)
                        {
                            this.wordStart = this.lastFowardEdit;
                            this.wordEnd = this.operationPos;

                            undoStart = this.prevWordStart;
                            undoEnd = this.prevWordEnd;
                            this.wordMerger(undoStart, undoEnd);
                        }

                        this.lastFowardEdit = null;
                    }

                    /*
                    if(wasNewPara)
                    {
                        // Merge word undos/redos into paragraph undo/redos beyond previous paragraph.
                        if(this.prevParaStart != null && this.prevParaEnd != null)
                        {
                            let undoStart = this.prevParaStart;
                            let undoEnd = this.prevParaEnd;

                            this.operationStack.splice(undoStart, undoEnd - undoStart);

                            this.prevParaEnd = this.paraEnd - (undoEnd - undoStart);
                            this.prevParaStart = this.paraStart - (undoEnd - undoStart);
                            this.operationPos -= undoEnd - undoStart;
                        }
                        else
                        {
                            this.prevParaEnd = this.paraEnd;
                            this.prevParaStart = this.paraStart;
                        }

                        this.paraStart = this.operationPos + 1;
                        this.paraEnd = this.paraStart;
                    }
                    */

                    let undoPositions: PreviousCursorPositions =
                    {
                        start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                    };
                    let redoPositions: PreviousCursorPositions =
                    {
                        start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                    };

                    let undoOp = () =>
                    {
                        this.text = prevText;
                        this.styleSet = prevStyles;

                        this.cursorStart = undoPositions.bStart;
                        this.cursorEnd = undoPositions.bPrevEnd;

                        this.startLeft = true;
                        this.generateLines();
                        this.calculateTextLines();
                        this.findStringPositions();
                        this.findCursorElems();

                        this.updateView(
                        {
                            textNodes: this.textNodes, width: this.width, height: this.height,
                            cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                        });

                        let retVal: ElementUndoRedoReturn =
                        {
                            id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                            palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                        };

                        return retVal;
                    };

                    let newText = this.text;
                    let newStyles = this.styleSet;

                    let redoOp = () =>
                    {
                        this.text = newText;
                        this.styleSet = newStyles;

                        this.cursorStart = redoPositions.end;
                        this.cursorEnd = redoPositions.end;
                        this.startLeft = true;
                        this.generateLines();
                        this.calculateTextLines();
                        this.findStringPositions();
                        this.findCursorElems();

                        this.updateView(
                        {
                            textNodes: this.textNodes, width: this.width, height: this.height,
                            cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                        });

                        let retVal: ElementUndoRedoReturn =
                        {
                            id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                            palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                        };

                        return retVal;
                    };

                    this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                    this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                    if(!wasSpace)
                    {
                        this.wasSpaceLast = false;
                        this.spaceToggle = false;
                    }
                    else
                    {
                        this.wasSpaceLast = true;
                    }

                    this.wordEnd = this.operationPos;
                    this.cursorUndoPositions.push(undoPositions);
                    this.cursorRedoPositions.push(redoPositions);
                    this.prevCursorPos = this.cursorStart;

                    /* TODO: Check for more than one space in selection (non-consecutive) if so apply another merge */
                }
                break;
            default:
                if(input == 'Enter')
                {
                    input = '\n';
                    wasNewPara = true;
                }
                else if(input == 'Tab')
                {
                    input = '\t';
                }

                if(this.wordEnd > this.operationPos)
                {
                    this.wordEnd = this.operationPos;
                    // There has been a sequence of undos before this input, tidy up the undo/redo merging.
                    if(this.wordStart >= this.operationPos)
                    {
                        // Throw away previous word and split this word.
                        this.wordStart = this.prevWordStart;
                        this.prevWordStart = null;
                        this.prevWordEnd = null;
                    }
                }

                if(input.match(/\s/))
                {
                    if(this.wasSpaceLast)
                    {
                        this.spaceToggle = true;
                    }

                    wasSpace = true;
                }

                let sortedSelect: Array<number> = this.selectedCharacters.slice();
                sortedSelect.sort(function(a, b) { return b - a; });
                let prev = -2;
                let start = -1;

                // Create contigeous deletions.
                for(let i = 0; i < sortedSelect.length; i++)
                {
                    if(sortedSelect[i] - 1 != prev)
                    {
                        if(start >= 0)
                        {
                            let newDeletion = { start: start, end: prev };
                            deletions.push(newDeletion);
                        }

                        start = sortedSelect[i];
                    }

                    prev = sortedSelect[i];
                }

                let prevText = this.text;
                let prevStyles = this.styleSet;

                this.removeSelection(sortedSelect);
                this.generateLines();
                this.calculateTextLines();
                this.findStringPositions();

                let tmpGlyphLength = this.glyphCount;

                let newStyle =
                {
                    colour: palleteState.getColour(), weight: palleteState.getWeight(), style: palleteState.getStyle(),
                    oline: palleteState.isOverline(), uline: palleteState.isUnderline(), tline: palleteState.isThroughline()
                };
                prevStringStart = this.stringStart;
                prevCursorStart = this.cursorStart;
                prevCursorEnd = this.cursorEnd;


                insertion.start = this.stringStart;
                insertion.text = input;
                insertion.style = null;

                let sty = this.insertText(input, newStyle);
                editData.insertion.style = sty;
                this.evaluateChanges(editData);

                this.generateLines();
                this.calculateTextLines();

                this.cursorStart += this.glyphCount - tmpGlyphLength;
                this.cursorEnd = this.cursorStart;
                this.findStringPositions();

                let msg = this.newEdit();

                if(msg != null)
                {
                    serverMsgs.push(msg);
                }
                retVal.palleteChanges.push(...this.changeSelect(true));

                if((wasSpace && !this.spaceToggle) || (!wasSpace && this.spaceToggle) || this.prevCursorPos != prevCursorStart || this.prevCursorPos != prevCursorEnd)
                {
                    let undoStart = this.prevWordStart;
                    let undoEnd = this.prevWordEnd;

                    this.wordMerger(undoStart, undoEnd);
                    this.lastFowardEdit = null;
                }

                /*
                if(wasNewPara)
                {
                    // Merge word undos/redos into paragraph undo/redos beyond previous paragraph.
                    if(this.prevParaStart != null && this.prevParaEnd != null)
                    {
                        let undoStart = this.prevParaStart;
                        let undoEnd = this.prevParaEnd;

                        this.operationStack.splice(undoStart, undoEnd - undoStart);

                        this.prevParaEnd = this.paraEnd - (undoEnd - undoStart);
                        this.prevParaStart = this.paraStart - (undoEnd - undoStart);
                        this.operationPos -= undoEnd - undoStart;
                    }
                    else
                    {
                        this.prevParaEnd = this.paraEnd;
                        this.prevParaStart = this.paraStart;
                    }

                    this.paraStart = this.operationPos + 1;
                    this.paraEnd = this.paraStart;
                }
                */

                let undoPositions: PreviousCursorPositions =
                {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                };
                let redoPositions: PreviousCursorPositions =
                {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                };

                let newCursorStart = this.cursorStart;

                let undoOp = () =>
                {
                    this.text = prevText;
                    this.styleSet = prevStyles;

                    this.cursorStart = undoPositions.start;
                    this.cursorEnd = undoPositions.prevEnd;
                    this.startLeft = true;
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    this.findCursorElems();

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                    });

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };

                    return retVal;
                };

                let newText = this.text;
                let newStyles = this.styleSet;

                let redoOp = () =>
                {
                    this.text = newText;
                    this.styleSet = newStyles;

                    this.cursorStart = redoPositions.start;
                    this.cursorEnd = redoPositions.end;
                    this.startLeft = true;
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    this.findCursorElems();

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                    });

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };

                    return retVal;
                };

                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                this.wordEnd = this.operationPos;

                if(!wasSpace)
                {
                    this.lastFowardEdit = this.wordEnd;
                    this.wasSpaceLast = false;
                    this.spaceToggle = false;
                }
                else
                {
                    this.wasSpaceLast = true;
                }

                this.cursorUndoPositions.push(undoPositions);
                this.cursorRedoPositions.push(redoPositions);
                this.prevCursorPos = this.cursorStart;

                break;
            }

            if(this.isSelected)
            {
                this.findCursorElems();
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;

            return retVal;
        }

        /**   Handle a messages sent from the server to this element.
         *
         *    @param {ServerMessage} message - The server message that was sent.
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
                case MessageTypes.NODE:
                    let nodeData = message.payload as ServerStyleNodeMessage;

                    if(this.editInBuffer[nodeData.userId] != null && this.editInBuffer[nodeData.userId] != undefined &&
                       this.editInBuffer[nodeData.userId][nodeData.editId] != null && this.editInBuffer[nodeData.userId][nodeData.editId] != undefined)
                    {
                        let buffer = this.editInBuffer[nodeData.userId][nodeData.editId];
                        buffer.styles.push(nodeData.node);
                        if(buffer.styles.length == this.editInBuffer[nodeData.userId][nodeData.editId].num_styles)
                        {
                            clearInterval(this.editInBuffer[nodeData.userId][nodeData.editId].editTimer);
                            this.completeEdit(nodeData.userId, nodeData.editId);
                        }
                    }
                    else
                    {
                        /* TODO: Remove debug code. */
                        console.log('STYLENODE: Unkown edit, ID: ' + nodeData.editId);
                    }

                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.JUSTIFY:
                    let justifyData = message.payload as ServerJustifyMessage;

                    this.setJustified(justifyData.newState);
                    newView = this.currentViewState as ViewState;
                    break;
                case MessageTypes.SIZECHANGE:
                    let sizeData = message.payload as ServerChangeSizeMessage;
                    this.size = sizeData.newSize;
                    this.generateLines();
                    this.calculateTextLines();

                    if(this.isSelected)
                    {
                        this.findCursorElems();
                    }

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false,
                        size: this.size
                    });
                    break;
                case MessageTypes.DROPPED:
                    /* TODO: Rollback. */
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
                case MessageTypes.MISSED:
                    let msdata = message.payload as ServerMissedMessage;
                    let node: TextStyle = this.editOutBuffer[msdata.editId][msdata.num];

                    let msg : UserNodeMessage =
                    {
                        node: node, editId: msdata.editId,
                    };
                    let msgCont : UserMessage =  { header:  MessageTypes.NODE, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                case MessageTypes.EDIT:
                    let editData = message.payload as ServerEditMessage;

                    if(this.editInBuffer[editData.userId] == null || this.editInBuffer[editData.userId] == undefined)
                    {
                        this.editInBuffer[editData.userId] = [];
                    }

                    this.editInBuffer[editData.userId][editData.editId] = { num_styles: editData.num_styles, num_recieved: 0, styles: [], editTimer: null };

                    let buffer = this.editInBuffer[editData.userId][editData.editId];

                    for(let i = 0; i < editData.styles.length; i++)
                    {
                        let style = editData.styles[i];
                        // Check for integrity.
                        if(style != null && style != undefined && style.text != null && style.text != undefined
                            && style.seq_num != null && style.seq_num != undefined && style.start != null && style.start != undefined && style.end != null
                            && style.end != undefined && style.style != null && style.style != undefined && style.weight != null && style.weight != undefined
                            && style.colour != null && style.colour != undefined && style.oline != null && style.oline != undefined && style.uline != null
                            && style.uline != undefined && style.tline != null && style.tline != undefined)
                        {
                            buffer.styles[style.seq_num] = style;
                            buffer.num_recieved++;
                        }
                    }

                    if(buffer.num_recieved < buffer.num_styles)
                    {
                        let self = this;
                        buffer.editTimer = setInterval((id, userId) =>
                        {
                            let buffer = self.editInBuffer[userId][id];
                            for(let i = 0; i < buffer.num_styles; i++)
                            {
                                if(buffer[i] == null || buffer[i] == undefined)
                                {
                                    let msg: UserMissingNodeMessage = { editId: id, userId: userId, seq_num: i };
                                    let msgCont: UserMessage = { header: MessageTypes.MISSED, payload: msg };
                                    self.sendServerMsg(msgCont);
                                }
                            }
                        }, 1000, editData.editId, editData.userId);
                    }
                    else
                    {
                        this.completeEdit(editData.userId, editData.editId);
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

            /* TODO: This should be set to total number of glyphs. */
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;

            retVal.palleteChanges.push(...this.changeSelect(true));
            this.updateView({ gettingLock: true, isSelected: true });

            let messageContainer: UserMessage = { header: BaseMessageTypes.LOCK, payload: null };

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

            let messageContainer: UserMessage = { header: BaseMessageTypes.RELEASE, payload: null };
            serverMsgs.push(messageContainer);

            let lineCount = this.textNodes.length;

            if(lineCount == 0)
            {
                lineCount = 1;
            }

            if(lineCount * 2 * this.size < this.height)
            {
                this.resize(this.width, lineCount * 2 * this.size, new Date());

                /* TODO: Add resize message to messages */
            }

            // Merge letter undo/redos into word undo redos.
            if(this.wordEnd != null)
            {
                let undoStart = this.wordStart;
                let undoEnd = this.wordEnd;

                this.operationStack.splice(undoStart, undoEnd - undoStart);

                this.wordEnd = null;
                this.operationPos -= undoEnd - undoStart;
            }

            if(this.prevWordStart != null && this.prevWordEnd != null)
            {
                let undoStart = this.prevWordStart;
                let undoEnd = this.prevWordEnd;

                this.operationStack.splice(undoStart, undoEnd - undoStart);

                this.prevWordEnd = null;
                this.prevWordStart = null;
                this.operationPos -= undoEnd - undoStart;
            }

            retVal.newView = this.currentViewState;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        }

        /**   Handle the deselect this element.
         *
         *    @return {ComponentViewState} An object containing: the new view state
         */
        public handleDeselect()
        {
            this.cursorElems = null;

            this.updateView({ cursor: null, cursorElems: [] });

            return super.handleDeselect();
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

            // TODO: Handle enriched text and html text.
            //
            let input = data.plainText;

            if(this.isEditing)
            {
                let sortedSelect: Array<number> = this.selectedCharacters.slice();
                sortedSelect.sort(function(a, b) { return b - a; });

                let prevText = this.text;
                let prevStyles = this.styleSet;

                this.removeSelection(sortedSelect);
                this.generateLines();
                this.calculateTextLines();
                this.findStringPositions();

                let tmpGlyphLength = this.glyphCount;

                let newStyle =
                {
                    colour: palleteState.getColour(), weight: palleteState.getWeight(), style: palleteState.getStyle(),
                    oline: palleteState.isOverline(), uline: palleteState.isUnderline(), tline: palleteState.isThroughline()
                };
                let prevStringStart = this.stringStart;
                let prevCursorStart = this.cursorStart;
                let prevCursorEnd = this.cursorEnd;

                this.insertText(input, newStyle);
                this.generateLines();
                this.calculateTextLines();

                this.cursorStart += this.glyphCount - tmpGlyphLength;
                this.cursorEnd = this.cursorStart;
                this.findStringPositions();

                let msg = this.newEdit();

                if(msg != null)
                {
                    serverMsgs.push(msg);
                }
                retVal.palleteChanges.push(...this.changeSelect(true));

                let undoStart = this.prevWordStart;
                let undoEnd = this.prevWordEnd;

                this.wordMerger(undoStart, undoEnd);
                this.lastFowardEdit = null;

                /*
                if(wasNewPara)
                {
                    // Merge word undos/redos into paragraph undo/redos beyond previous paragraph.
                    if(this.prevParaStart != null && this.prevParaEnd != null)
                    {
                        let undoStart = this.prevParaStart;
                        let undoEnd = this.prevParaEnd;

                        this.operationStack.splice(undoStart, undoEnd - undoStart);

                        this.prevParaEnd = this.paraEnd - (undoEnd - undoStart);
                        this.prevParaStart = this.paraStart - (undoEnd - undoStart);
                        this.operationPos -= undoEnd - undoStart;
                    }
                    else
                    {
                        this.prevParaEnd = this.paraEnd;
                        this.prevParaStart = this.paraStart;
                    }

                    this.paraStart = this.operationPos + 1;
                    this.paraEnd = this.paraStart;
                }
                */

                let undoPositions: PreviousCursorPositions =
                {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                };
                let redoPositions: PreviousCursorPositions =
                {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                };

                let newCursorStart = this.cursorStart;

                let undoOp = () =>
                {
                    this.text = prevText;
                    this.styleSet = prevStyles;

                    this.cursorStart = undoPositions.start;
                    this.cursorEnd = undoPositions.prevEnd;
                    this.startLeft = true;
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    this.findCursorElems();

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                    });

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };

                    return retVal;
                };

                let newText = this.text;
                let newStyles = this.styleSet;

                let redoOp = () =>
                {
                    this.text = newText;
                    this.styleSet = newStyles;

                    this.cursorStart = redoPositions.start;
                    this.cursorEnd = redoPositions.end;
                    this.startLeft = true;
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    this.findCursorElems();

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                    });

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };

                    return retVal;
                };

                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                this.wordEnd = this.operationPos;

                this.lastFowardEdit = this.wordEnd;
                this.wasSpaceLast = false;

                this.cursorUndoPositions.push(undoPositions);
                this.cursorRedoPositions.push(redoPositions);
                this.prevCursorPos = this.cursorStart;
            }

            if(this.isSelected)
            {
                this.findCursorElems();
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });

            /* TODO: Handle undo redo and resize */

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
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

            if(this.wordEnd > this.operationPos)
            {
                this.wordEnd = this.operationPos;
                this.lastFowardEdit = this.wordEnd;

                // There has been a sequence of undos before this input, tidy up the undo/redo merging.
                if(this.wordStart >= this.operationPos)
                {
                    // Throw away previous word and split this word.
                    this.wordStart = this.prevWordStart;
                    this.prevWordStart = null;
                    this.prevWordEnd = null;
                }
            }

            if(this.cursorEnd > 0 && this.cursorStart != this.cursorEnd)
            {
                let tPrevStart = this.cursorStart;
                let prevStringStart = this.stringStart;
                let prevCursorStart = this.cursorStart;
                let bPrevCursorStart = this.cursorStart;
                let prevCursorEnd = this.cursorEnd;

                let prevText = this.text;
                let prevStyles = this.styleSet;
                let wasSpace = false;
                let wasNewPara = false;

                let sortedSelect: Array<number> = this.selectedCharacters.slice();
                sortedSelect.sort(function(a, b) { return b - a; });

                // Check if we are deleting over a line or a paragraph
                for(let i = 0; i < sortedSelect.length; i++)
                {
                    if(this.text.charAt(sortedSelect[i]).match(/\s/))
                    {
                        if(this.wasSpaceLast)
                        {
                            this.spaceToggle = true;
                        }
                        wasSpace = true;
                    }

                    if(this.text.charAt(sortedSelect[i]) == '\n')
                    {
                        wasNewPara = true;
                    }
                }

                this.removeSelection(sortedSelect);
                this.generateLines();
                this.calculateTextLines();
                this.findStringPositions();
                let msg = this.newEdit();

                if(msg != null)
                {
                    serverMsgs.push(msg);
                }

                this.cursorEnd = this.cursorStart;

                /* TODO: Check this condition. */
                if((wasSpace && !this.spaceToggle) || (!wasSpace && this.spaceToggle) || this.prevCursorPos != tPrevStart)
                {
                    let undoStart = this.prevWordStart;
                    let undoEnd = this.prevWordEnd;

                    if(this.lastFowardEdit != null)
                    {
                        this.wordEnd = this.lastFowardEdit;
                    }

                    this.wordMerger(undoStart, undoEnd);

                    if(this.lastFowardEdit != null)
                    {
                        this.wordStart = this.lastFowardEdit;
                        this.wordEnd = this.operationPos;

                        undoStart = this.prevWordStart;
                        undoEnd = this.prevWordEnd;
                        this.wordMerger(undoStart, undoEnd);
                    }

                    this.lastFowardEdit = null;
                }

                /*
                if(wasNewPara)
                {
                    // Merge word undos/redos into paragraph undo/redos beyond previous paragraph.
                    if(this.prevParaStart != null && this.prevParaEnd != null)
                    {
                        let undoStart = this.prevParaStart;
                        let undoEnd = this.prevParaEnd;

                        this.operationStack.splice(undoStart, undoEnd - undoStart);

                        this.prevParaEnd = this.paraEnd - (undoEnd - undoStart);
                        this.prevParaStart = this.paraStart - (undoEnd - undoStart);
                        this.operationPos -= undoEnd - undoStart;
                    }
                    else
                    {
                        this.prevParaEnd = this.paraEnd;
                        this.prevParaStart = this.paraStart;
                    }

                    this.paraStart = this.operationPos + 1;
                    this.paraEnd = this.paraStart;
                }
                */

                let undoPositions: PreviousCursorPositions =
                {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                };
                let redoPositions: PreviousCursorPositions =
                {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                };

                let undoOp = () =>
                {
                    this.text = prevText;
                    this.styleSet = prevStyles;

                    this.cursorStart = undoPositions.bStart;
                    this.cursorEnd = undoPositions.bPrevEnd;

                    this.startLeft = true;
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    this.findCursorElems();

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height,
                        cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                    });

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };

                    return retVal;
                };

                let newText = this.text;
                let newStyles = this.styleSet;

                let redoOp = () =>
                {
                    this.text = newText;
                    this.styleSet = newStyles;

                    this.cursorStart = redoPositions.end;
                    this.cursorEnd = redoPositions.end;
                    this.startLeft = true;
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    this.findCursorElems();

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height,
                        cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                    });

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };

                    return retVal;
                };

                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                if(!wasSpace)
                {
                    this.wasSpaceLast = false;
                    this.spaceToggle = false;
                }
                else
                {
                    this.wasSpaceLast = true;
                }

                this.wordEnd = this.operationPos;
                this.cursorUndoPositions.push(undoPositions);
                this.cursorRedoPositions.push(redoPositions);
                this.prevCursorPos = this.cursorStart;

                /* TODO: Check for more than one space in selection (non-consecutive) if so apply another merge */
            }

            if(this.isSelected)
            {
                this.findCursorElems();
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });

            /* TODO: Handle undo redo and resize */

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
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

            let palleteChanges: Array<BoardPalleteChange> = [];

            if(change.type == PalleteChangeType.JUSTIFIED)
            {
                let prevVal = this.isJustified;

                let undoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let palleteChanges: Array<BoardPalleteChange> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.setJustified(prevVal);

                    palleteChanges.push({ type: PalleteChangeType.JUSTIFIED, data: this.isJustified });

                    let payload: UserJustifyMessage = { newState: prevVal };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                let redoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let palleteChanges: Array<BoardPalleteChange> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.setJustified(pallete.isJustified);

                    palleteChanges.push({ type: PalleteChangeType.JUSTIFIED, data: this.isJustified });

                    let payload: UserJustifyMessage = { newState: this.isJustified };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                retVal.undoOp = null;
                retVal.redoOp = null;

                this.setJustified(pallete.isJustified);

                palleteChanges.push({ type: PalleteChangeType.JUSTIFIED, data: this.isJustified });

                let payload: UserJustifyMessage = { newState: this.isJustified };
                let msg: UserMessage = { header: MessageTypes.JUSTIFY, payload: payload };

                serverMsgs.push(msg);
            }
            else if(change.type == PalleteChangeType.SIZE)
            {
                let prevVal = this.size;

                let undoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let palleteChanges: Array<BoardPalleteChange> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.size = prevVal;
                    this.generateLines();
                    this.calculateTextLines();

                    if(this.isSelected)
                    {
                        this.findCursorElems();
                    }

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false,
                        size: this.size
                    });

                    palleteChanges.push({ type: PalleteChangeType.SIZE, data: this.size });

                    let payload: UserChangeSizeMessage = { newSize: this.size };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                let redoOp = () =>
                {
                    let retMsgs: Array<UserMessage> = [];
                    let palleteChanges: Array<BoardPalleteChange> = [];
                    let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

                    this.size = pallete.baseSize;
                    this.generateLines();
                    this.calculateTextLines();

                    if(this.isSelected)
                    {
                        this.findCursorElems();
                    }

                    this.updateView(
                    {
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false,
                        size: this.size
                    });

                    palleteChanges.push({ type: PalleteChangeType.SIZE, data: this.size });

                    let payload: UserChangeSizeMessage = { newSize: this.size };

                    let retVal: ElementUndoRedoReturn =
                    {
                        id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };

                    let msg: UserMessage = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);

                    retVal.serverMessages = this.checkForServerId(retMsgs);
                    return retVal;
                };

                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                retVal.undoOp = null;
                retVal.redoOp = null;

                this.size = pallete.baseSize;
                this.generateLines();
                this.calculateTextLines();

                if(this.isSelected)
                {
                    this.findCursorElems();
                }

                this.updateView(
                {
                    textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false,
                    size: this.size
                });

                palleteChanges.push({ type: PalleteChangeType.SIZE, data: this.size });

                let payload: UserChangeSizeMessage = { newSize: this.size };
                let msg: UserMessage = { header: MessageTypes.SIZECHANGE, payload: payload };

                console.log('Adding size change message.');
                console.log(msg);

                serverMsgs.push(msg);
            }
            else
            {
                let styles: Array<TextStyle> = [];

                if(this.selectedCharacters.length > 0)
                {
                    // Sort the selected characters
                    let sortedSelect: Array<number> = this.selectedCharacters.slice();
                    sortedSelect.sort(function(a, b) { return a - b; });

                    for(let i = 0; i < this.styleSet.length; i++)
                    {
                        let style = this.styleSet[i];

                        if(sortedSelect.length == 0)
                        {
                            style.text = this.text.substring(style.start, style.end);
                            style.seq_num = styles.length;
                            styles.push(style);

                        }
                        else if(this.isCurrentStyle(style, pallete) || sortedSelect[0] >= style.end)
                        {
                            if(styles.length > 0 && this.stylesMatch(styles[styles.length - 1], style)
                                && styles[styles.length - 1].end - styles[styles.length - 1].start + style.end - style.start <= MAX_STYLE_LENGTH)
                            {
                                styles[styles.length - 1].end = style.end;
                                styles[styles.length - 1].text = this.text.substring(styles[styles.length - 1].start, styles[styles.length - 1].end);
                            }
                            else
                            {
                                style.text = this.text.substring(style.start, style.end);
                                style.seq_num = styles.length;
                                styles.push(style);
                            }
                        }
                        else
                        {
                            let styleSplits: Array<TextStyle> = [];

                            if(style.start < sortedSelect[0])
                            {
                                style.end = sortedSelect[0];
                                style.text = this.text.substring(style.start, style.end);
                                style.seq_num = styles.length;
                                styles.push(style);
                            }

                            for(let j = 0; j < sortedSelect.length; j++)
                            {
                                if(style.end <= sortedSelect[j])
                                {
                                    break;
                                }

                                // At this point we actually know the selected position is within this style.
                                if(styleSplits.length > 0 && styleSplits[styleSplits.length - 1].end < sortedSelect[j])
                                {
                                    // Push the original style gap between the previous style.
                                    style.start = styleSplits[styleSplits.length - 1].end;
                                    style.end = sortedSelect[j];
                                    style.text = this.text.substring(style.start, style.end);
                                    style.seq_num = styles.length;
                                    styles.push(style);
                                }

                                // If it's the same as the last thing we pushed just extend.
                                if(styleSplits.length > 0 && this.isCurrentStyle(styleSplits[styleSplits.length - 1], pallete))
                                {
                                    if(styleSplits[styleSplits.length - 1].end - styleSplits[styleSplits.length - 1].start < MAX_STYLE_LENGTH)
                                    {
                                        styleSplits[styleSplits.length - 1].end++;
                                        styleSplits[styleSplits.length - 1].text = this.text.substring(styleSplits[styleSplits.length - 1].start,
                                                                                                       styleSplits[styleSplits.length - 1].end);
                                    }
                                    else
                                    {
                                        let newStyle: TextStyle = {
                                            start: sortedSelect[j], end: sortedSelect[j] + 1, oline: pallete.isOverline(), uline: pallete.isUnderline(),
                                            tline: pallete.isThroughline(), weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                            text: this.text.substring(sortedSelect[j], sortedSelect[j] + 1), seq_num: null
                                        };

                                        styleSplits.push(newStyle);
                                    }
                                }
                                else
                                {
                                    let newStyle: TextStyle = {
                                        start: sortedSelect[j], end: sortedSelect[j] + 1, oline: pallete.isOverline(), uline: pallete.isUnderline(),
                                        tline: pallete.isThroughline(), weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                        text: this.text.substring(sortedSelect[j], sortedSelect[j] + 1), seq_num: null
                                    };

                                    styleSplits.push(newStyle);
                                }

                                sortedSelect.splice(0, 1);
                                j--;
                            }

                            // If there is any left over style push that on.
                            if(styleSplits[styleSplits.length - 1].end < style.end)
                            {
                                // Push the original style gap between the previous style.
                                style.start = styleSplits[styleSplits.length - 1].end;
                                style.text = this.text.substring(style.start, style.end);
                                styleSplits.push(style);
                            }

                            let lastStyle = styles[styles.length - 1];

                            // Test the endpoints, merge and number.
                            if(styles.length > 0 && lastStyle.colour == styleSplits[0].colour && lastStyle.oline == styleSplits[0].oline
                                && lastStyle.uline == styleSplits[0].uline
                                && lastStyle.tline == styleSplits[0].tline
                                && lastStyle.weight == styleSplits[0].weight
                                && lastStyle.end - lastStyle.start + styleSplits[0].end - styleSplits[0].start <= MAX_STYLE_LENGTH)
                            {
                                lastStyle.end = styleSplits[0].end;
                                lastStyle.text = this.text.substring(lastStyle.start, lastStyle.end);
                            }
                            else
                            {
                                styleSplits[0].seq_num = styles.length;
                                styles.push(styleSplits[0]);
                            }

                            for(let j = 1; j < styleSplits.length; j++)
                            {
                                styleSplits[j].seq_num = styles.length;
                                styles.push(styleSplits[j]);
                            }
                        }
                    }
                }
                else
                {
                    styles = this.styleSet;
                }


                let undoSet = this.styleSet.slice();
                let cursoorStartPrev = this.cursorStart;
                let cursoorEndPrev = this.cursorEnd;

                // TODO: Undo redo merging.
                let undoOp = () => { return this.setStyleSet(undoSet, cursoorStartPrev, cursoorEndPrev); };
                let redoOp = () => { return this.setStyleSet(styles, cursoorStartPrev, cursoorEndPrev); };

                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };

                // This does not produce whiteboard level undo/redo operations.
                retVal.undoOp = null;
                retVal.redoOp = null;

                retVal.palleteChanges = palleteChanges;

                this.styleSet = styles;
                this.generateLines();
                this.calculateTextLines();

                if(this.isSelected)
                {
                    this.findCursorElems();
                }

                this.updateView(
                {
                    textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                });
                serverMsgs.push(this.textEdited());
            }

            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
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
        private setStyleSet(styleSet: Array<TextStyle>, cursorStart: number, cursorEnd: number)
        {
            let retMsgs: Array<UserMessage> = [];
            let centrePos: Point = { x: this.x + this.width / 2, y: this.y + this.height / 2 };

            this.cursorStart = cursorStart;
            this.cursorEnd = cursorEnd;
            this.styleSet = styleSet;
            this.generateLines();
            this.calculateTextLines();

            if(this.isSelected)
            {
                this.findCursorElems();
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
            let msg = this.textEdited();

            let retVal: ElementUndoRedoReturn =
            {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                wasRestore: null, move: null
            };

            retMsgs.push(msg);

            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        }

        /** Handle the basic resize behaviour.
         *
         *
         */
        protected resize(width: number, height: number, updateTime: Date)
        {
            this.updateTime = updateTime;

            this.height = height;

            if(this.width != width)
            {
                this.width = width;
                this.calculateTextLines();
            }

            if(this.isEditing)
            {
                this.findCursorElems();
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems
            });
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
            let palleteChanges: Array<BoardPalleteChange> = [];

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

            this.findStringPositions();
            this.findCursorElems();

            if(this.styleSet.length > 0)
            {
                let i = 0;

                while(i < this.styleSet.length - 1 && (this.styleSet[i].start > this.cursorStart || this.styleSet[i].end < this.cursorStart))
                {
                    i++;
                }

                let isBold = this.styleSet[i].weight == 'bold';
                let isItalic = this.styleSet[i].style == 'italic';
                let isOLine = this.styleSet[i].oline;
                let isULine = this.styleSet[i].uline;
                let isTLine = this.styleSet[i].tline;

                let change: TextPalleteChange =
                {
                    colour: this.styleSet[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine
                };

                palleteChanges.push({ type: PalleteChangeType.TEXTCHANGE, data: change });
            }

            this.updateView({cursor: this.cursor, cursorElems: this.cursorElems});

            return palleteChanges;
        }

        /**
         *
         *
         */
        protected setEdit()
        {
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            this.gettingLock = false;
            this.isEditing = true;

            this.updatePallete(this.changeSelect(true));

            this.updateView({ getLock: false, isEditing: true });
        }

        /**
         *
         *
         */
        private setJustified(state: boolean)
        {
            this.isJustified = state;
            this.calculateTextLines();

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

                this.findCursorElems();
            }

            this.updateView({ textNodes: this.textNodes, cursor: this.cursor, cursorElems: this.cursorElems });
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

            for(let i = 0; i < this.textNodes.length; i++)
            {
                let line: TextNode = this.textNodes[i];

                if(loc >= line.start && loc <= line.end)
                {
                    if(loc == line.end)
                    {
                        if(line.sections.length == 0)
                        {
                            return 0;
                        }
                        else if(!line.spaceRemoved)
                        {
                            let lastSec = line.sections[line.sections.length - 1];
                            let glyphIdx = loc - line.start -  - 1
                            let localPos = (lastSec.glyphs[loc - line.start - 1].startAdvance + lastSec.glyphs[loc - line.start - 1].xAdvance);
                            return (lastSec.startPos + localPos * this.size / 1000);
                        }
                    }
                    else
                    {
                        for(let j = 0; j < line.sections.length; j++)
                        {
                            if(line.sections[j].startGlyph <= loc && line.sections[j].startGlyph + line.sections[j].glyphs.length >= loc)
                            {
                                let localPos = line.sections[j].glyphs[loc - line.sections[j].startGlyph - line.start].startAdvance;
                                return (line.sections[j].startPos + localPos * this.size / 1000);
                            }
                        }
                    }
                }
            }
        }

        /**
         *
         *    @param
         */
        private findTextPos(x: number, y: number)
        {
            let xFind = 0;

            if(y < 0 || this.textNodes.length == 0)
            {
                return 0;
            }
            else
            {
                let lineNum = Math.floor((y / (2 * this.size)));

                if(lineNum >= this.textNodes.length)
                {
                    return this.textNodes[this.textNodes.length - 1].end;
                }


                /* TODO: Remove debugging code. */
                if(!this.textNodes[lineNum])
                {
                    console.log('Line is: ' + lineNum);
                }

                if(x > 0)
                {
                    if(x > this.width)
                    {
                        return this.textNodes[lineNum].end;
                    }
                    else
                    {
                        xFind = x;
                    }
                }
                else
                {
                    return this.textNodes[lineNum].start;
                }

                let line = this.textNodes[lineNum];

                if(line.sections.length == 0)
                {
                    return line.start;
                }


                let i = 0;
                while(i < line.sections.length && xFind > line.sections[i].startPos)
                {
                    i++;
                }

                let secIdx = i - 1;
                let sec = line.sections[secIdx];
                i = 0;

                while(i < sec.glyphs.length && xFind > sec.startPos + sec.glyphs[i].startAdvance * this.size / 1000)
                {
                    i++;
                }

                let curr = i - 1;
                let glyph = sec.glyphs[curr];

                // i and currMes is now the position to the right of the search point.
                // We just need to check if left or right is closer then reurn said point.
                let selPoint;
                let glyphStart = sec.startPos + glyph.startAdvance * this.size / 1000;
                let glyphEnd = glyphStart + glyph.xAdvance * this.size / 1000;

                if(xFind - glyphStart > glyphEnd - xFind)
                {
                    selPoint = line.start + curr + 1;
                }
                else
                {
                    selPoint = line.start + curr;
                }

                return selPoint;
            }
        }

        /**
         *
         *
         */
        private findCursorElems()
        {
            this.cursorElems = [];

            if(this.textNodes.length == 0 && this.isEditing)
            {
                this.cursor = { x: 0, y: 0, height: 2 * this.size };
            }

            for(let i = 0; i < this.textNodes.length; i++)
            {
                let line: TextNode = this.textNodes[i];
                let selStart: number = null;
                let selEnd: number = null;
                let endFound: boolean = false;

                if(this.cursorStart >= line.start && this.cursorStart <= line.end)
                {
                    if(this.cursorStart == line.start)
                    {
                        selStart = 0;
                    }
                    else if(this.cursorStart == line.end)
                    {
                        let sec = line.sections[line.sections.length - 1];
                        let idx = this.cursorStart - sec.startGlyph - 1;
                        selStart = sec.startPos + ((sec.glyphs[idx].startAdvance + sec.glyphs[idx].xAdvance) * this.size / 1000);
                    }
                    else
                    {
                        for(let j = 0; j < line.sections.length; j++)
                        {
                            let sec = line.sections[j];
                            if(this.cursorStart >= sec.startGlyph && this.cursorStart <= sec.startGlyph + sec.glyphs.length)
                            {
                                selStart = sec.startPos + sec.glyphs[this.cursorStart - sec.startGlyph].startAdvance * this.size / 1000;
                            }
                        }
                    }
                }
                else if(this.cursorStart < line.start)
                {
                    selStart = 0;
                }

                if(this.cursorEnd >= line.start && this.cursorEnd <= line.end)
                {
                    if(this.cursorEnd == line.start)
                    {
                        selEnd = 0;
                    }
                    else if(this.cursorEnd == line.end)
                    {
                        if(!line.spaceRemoved && line.justified)
                        {
                            selEnd = this.width;
                        }
                        else
                        {
                            let sec = line.sections[line.sections.length - 1];
                            let idx = this.cursorEnd - line.start - 1;
                            selStart = sec.startPos + ((sec.glyphs[idx].startAdvance + sec.glyphs[idx].xAdvance) * this.size / 1000);
                        }
                    }
                    else
                    {
                        for(let j = 0; j < line.sections.length; j++)
                        {
                            let sec = line.sections[j];
                            if(this.cursorEnd >= sec.startGlyph && this.cursorEnd <= sec.startGlyph + sec.glyphs.length)
                            {
                                selEnd = sec.startPos + sec.glyphs[this.cursorEnd - sec.startGlyph].startAdvance * this.size / 1000;
                            }
                        }
                    }
                }
                else if(this.cursorEnd > line.end)
                {
                    selEnd = this.width;
                }


                if(this.isEditing)
                {
                    if(this.cursorEnd >= line.start && this.cursorEnd <= line.end && (this.startLeft || this.cursorStart == this.cursorEnd))
                    {
                        this.cursor = { x: selEnd, y: 2 * this.size * line.lineNum + 0.2 * this.size, height: 2 * this.size };
                    }
                    else if(this.cursorStart >= line.start && this.cursorStart <= line.end && !this.startLeft)
                    {
                        this.cursor = { x: selStart, y: 2 * this.size * line.lineNum + 0.2 * this.size, height: 2 * this.size };
                    }
                }
                else
                {
                    this.cursor = null;
                }

                if(selStart != null && selEnd != null && this.cursorStart != this.cursorEnd)
                {
                    this.cursorElems.push(
                    {
                        x: selStart, y: 2 * this.size * line.lineNum  + 0.2 * this.size, width: selEnd - selStart, height: 2 * this.size
                    });
                }
            }
        }

        /**
         *
         *
         */
        private splitText(text: string)
        {
            let words: Array<{start: number, word: string}> = [];
            let j;
            let isWhiteSpace = text.charAt(0).match(/\s/) ? true : false;
            let txtStart = 0;
            for(j = 0; j < text.length; j++)
            {
                if(isWhiteSpace)
                {
                    if(!text.charAt(j).match(/\s/))
                    {
                        if(j > 0)
                        {
                            txtStart = j;
                            isWhiteSpace = false;
                        }
                        else
                        {
                            isWhiteSpace = false;
                        }
                    }
                }
                else
                {
                    if(text.charAt(j).match(/\s/))
                    {
                        words.push({ start: txtStart, word: text.substring(txtStart, j) });
                        txtStart = j;
                        isWhiteSpace = true;
                    }
                }
            }

            if(!isWhiteSpace)
            {
                words.push({ start: txtStart, word: text.substring(txtStart, j) });
            }

            return words;
        }

        /**
         *
         *
         */
        private splitSegments(style: TextStyle, wordStart: number, localStart: number, word: string)
        {
            // TODO: Language determination and splitting
            let segments: Array<SegmentData> = [];
            let wordPos = 0;
            let hasHyphen = false;
            let advance = 0;

            while(word.length - wordPos > MAX_SEGEMENT_LENGTH)
            {
                let wordSlice = word.slice(wordPos, wordPos + MAX_SEGEMENT_LENGTH)
                let glyphs: Array<GlyphData> = [];

                hasHyphen = this.processGlyphs(glyphs, style, word, wordStart + localStart + wordPos);

                let wordAdvance: number = 0;

                for(let k = 0; k < glyphs.length; k++)
                {
                    wordAdvance += (glyphs[k].xAdvance) * this.size / 1000;
                }

                let newSegment: SegmentData = {
                    style: style, startPos: localStart + wordPos, glyphs: glyphs, startAdvance: advance,
                    segmentAdvance: wordAdvance, segmentLength: word.length, hasHyphen: hasHyphen
                };

                segments.push(newSegment);
                wordPos += MAX_SEGEMENT_LENGTH;
                advance += wordAdvance;
            }

            let wordSlice = word.slice(wordPos, word.length);
            let glyphs: Array<GlyphData> = [];

            hasHyphen = this.processGlyphs(glyphs, style, word, wordStart + localStart + wordPos);

            let wordAdvance: number = 0;

            for(let k = 0; k < glyphs.length; k++)
            {
                wordAdvance += (glyphs[k].xAdvance) * this.size / 1000;
            }

            let newSegment: SegmentData = {
                style: style, startPos: localStart + wordPos, glyphs: glyphs, startAdvance: advance,
                segmentAdvance: wordAdvance, segmentLength: word.length, hasHyphen: hasHyphen
            };

            segments.push(newSegment);

            return segments;
        }

        /**
         *
         *
         */
        private splitWithStyles(wordStart: number, localStart: number, word: string)
        {
            let segments: Array<SegmentData> = [];
            let styIndex: number = 0;

            while(styIndex + 1 < this.styleSet.length && this.styleSet[styIndex + 1].start < wordStart + localStart)
            {
                styIndex++;
            }

            let style = this.styleSet[styIndex];
            let currentStart = localStart;
            let end = wordStart + localStart + word.length;

            while(end > style.end)
            {
                let text = word.substring(wordStart + localStart, style.end);
                segments.push(...this.splitSegments(style, wordStart, localStart, text));
                styIndex++;
                style = this.styleSet[styIndex];
                localStart += style.end - (wordStart + localStart);
            }

            let text = word.substring(wordStart + localStart, end);
            segments.push(...this.splitSegments(style, wordStart, localStart, text))

            return segments;
        }

        /**
         *
         *
         */
        private applyDeletion(word: WordData, deletion: {start: number, end: number})
        {
            if(deletion.end < word.startPos)
            {
                let change = deletion.end - deletion.start;

                word.startPos -= change;

                for(let k = 0; k < word.segments.length; k++)
                {
                    word.segments[k].startPos -= change;
                }
            }
            else if(deletion.start < word.startPos + word.wordLength)
            {
                if(deletion.start > word.startPos)
                {
                    if(deletion.end < word.startPos + word.wordLength)
                    {
                        word.wordLength -= deletion.end - deletion.start;
                        word.wordAdvance = -1;
                    }
                    else
                    {
                        word.wordLength = deletion.start - word.startPos;
                        word.wordAdvance = -1;
                    }
                }
                else
                {
                    word.startPos -= word.startPos - deletion.start;
                    if(deletion.end < word.startPos + word.wordLength)
                    {
                        word.wordLength -= deletion.end - word.startPos;
                        word.wordAdvance = -1;
                    }
                    else
                    {
                        word.wordLength = 0;
                    }
                }

                for(let k = 0; k < word.segments.length; k++)
                {
                    let segment = word.segments[k];
                    if(deletion.end < segment.startPos)
                    {
                        segment.startPos -= deletion.end - deletion.start;
                    }
                    else if(deletion.start < segment.startPos + segment.segmentLength)
                    {
                        if(deletion.start > segment.startPos)
                        {
                            if(deletion.end < segment.startPos + segment.segmentLength)
                            {
                                segment.segmentLength -= deletion.end - deletion.start;
                                segment.segmentAdvance = -1;
                            }
                            else
                            {
                                segment.segmentLength = deletion.start - segment.startPos;
                                segment.segmentAdvance = -1;
                            }
                        }
                        else
                        {
                            segment.startPos -= segment.startPos - deletion.start;
                            if(deletion.end < segment.startPos + segment.segmentLength)
                            {
                                segment.segmentLength -= deletion.end - segment.startPos;
                                segment.segmentAdvance = -1;
                            }
                            else
                            {
                                // Segment was removed by deletion.
                                word.segments.splice(k, 1);
                                k--;
                            }
                        }
                    }
                }
            }
        }

        private processDeletions()
        {
            // TODO
        }

        private processInsertions()
        {
            // TODO
        }

        private processStyleChanges()
        {
            // TODO
        }

        /**
         *
         *
         */
        private evaluateChanges(editData: EditData)
        {
            // TODO: Remove debug code.
            console.log("Edit data is:");
            console.log(editData);


            let newLinePositions: Array<number> = [];
            let lineStartWord: number = 0;
            //let removedLines: Array<number> = [];

            let currentLine: number = 0;
            let oldLineIndex: number = 0;
            let newWordData: Array<WordData> = [];
            let inserted: boolean = false;
            let insertData: Array<{ start: number, word: string }> = [];
            let insertStyle: TextStyle;

            let newLineData: Array<LineData> = [];

            if(editData.insertion != null)
            {
                insertData = this.splitText(editData.insertion.text);
                insertStyle = editData.insertion.style;
                console.log('Insertion detected. Data is:');
                console.log(insertData);
                console.log(insertStyle);
            }

            for(let i = 0; i < this.linePositions.length; i++)
            {
                let removed = false;
                let newPosition = this.linePositions[i];

                for(let j = 0; j < editData.deletions.length; j++)
                {
                    let deletion = editData.deletions[j];

                    if(this.linePositions[i] >= deletion.start && this.linePositions[i] < deletion.end)
                    {
                        //removedLines.push(i);
                        removed = true;
                    }
                    else if(this.linePositions[i] >= deletion.end)
                    {
                        newPosition -= (deletion.end - deletion.start);
                    }
                }

                if(!removed)
                {
                    if(editData.insertion != null && newPosition >= editData.insertion.start)
                    {
                        newPosition += editData.insertion.text.length;
                    }

                    newLinePositions.push(newPosition);
                }
            }

            let word: WordData = null;
            let nextWord: WordData = null;
            let wordCount: number = 0;
            let totalCount: number = 0;

            for(let i = 0; i < this.wordData.length; i++)
            {
                if(this.wordData.length > 1)
                {
                    if(nextWord == null)
                    {
                        word = {
                            startPos: this.wordData[i].startPos, wordAdvance: this.wordData[i].wordAdvance, segments: this.wordData[i].segments,
                            wordLength: this.wordData[i].wordLength
                        };

                        nextWord = {
                            startPos: this.wordData[i + 1].startPos, wordAdvance: this.wordData[i + 1].wordAdvance, segments: this.wordData[i + 1].segments,
                            wordLength: this.wordData[i + 1].wordLength
                        };

                        for(let j = 0; j < editData.deletions.length; j++)
                        {
                            this.applyDeletion(word, editData.deletions[j]);
                            this.applyDeletion(nextWord, editData.deletions[j]);
                        }
                    }
                    else
                    {
                        word = nextWord;

                        nextWord = {
                            startPos: this.wordData[i + 1].startPos, wordAdvance: this.wordData[i + 1].wordAdvance, segments: this.wordData[i + 1].segments,
                            wordLength: this.wordData[i + 1].wordLength
                        };

                        for(let j = 0; j < editData.deletions.length; j++)
                        {
                            this.applyDeletion(nextWord, editData.deletions[j]);
                        }
                    }

                    while(word.startPos + word.wordLength == nextWord.startPos)
                    {
                        // Merge words and set nextWord to null.
                        word.wordLength += nextWord.wordLength;

                        let wordSeg = word.segments[word.segments.length - 1];
                        let sty1 = wordSeg.style;
                        let sty2 = nextWord.segments[0].style;

                        for(let j = 0; j < nextWord.segments.length; j++)
                        {
                            nextWord.segments[j].startPos += word.wordLength;
                        }

                        if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                        {
                            wordSeg.segmentLength += nextWord.segments[0].segmentLength;
                            wordSeg.segmentAdvance = -1;
                            word.segments.push(...nextWord.segments.slice(1, nextWord.segments.length));
                        }
                        else
                        {
                            word.segments.push(...nextWord.segments.slice(0, nextWord.segments.length));
                        }

                        i++;
                        nextWord = {
                            startPos: this.wordData[i + 1].startPos, wordAdvance: this.wordData[i + 1].wordAdvance, segments: this.wordData[i + 1].segments,
                            wordLength: this.wordData[i + 1].wordLength
                        };
                    }
                }
                else
                {
                    word = {
                        startPos: this.wordData[i].startPos, wordAdvance: this.wordData[i].wordAdvance, segments: this.wordData[i].segments,
                        wordLength: this.wordData[i].wordLength
                    };
                }
                
                // Push the current line foward to include this word.
                while(newLinePositions[oldLineIndex] > word.startPos)
                {
                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                    currentLine++;
                    oldLineIndex++;
                    totalCount += wordCount;
                    wordCount = 0;
                }

                if(insertData.length == 0 && editData.insertion != null && editData.insertion.text.length > 0)
                {
                    // Insert was spaces only
                    if(word.startPos >= editData.insertion.start)
                    {
                        word.startPos += editData.insertion.text.length;
                    }

                    newWordData.push(word);

                    inserted = true;
                }
                else if(word.wordLength > 0)
                {
                    console.log('Made it here.');
                    let insert = insertData[0];
                    console.log('and new word data is:');
                    console.log(newWordData);

                    if(editData.insertion.start >= word.startPos && editData.insertion.start <= word.startPos + word.wordLength)
                    {
                        console.log('Went in here.');
                        if(editData.insertion.start == word.startPos + word.wordLength)
                        {
                            console.log('and in here.');
                            // Insert is at the end of this word.
                            if(editData.insertion.text.charAt(0).match(/\s/))
                            {
                                // Word is seperate so just insert new word.
                                newWordData.push(word);
                                wordCount++;

                                // Check for new lines at the start of the insertion.
                                let startSpaces = editData.insertion.text.substring(0, insert.start);
                                let newLineIndex = startSpaces.indexOf('\n');
                                let runningPos = insertData[0].start;
                                while(newLineIndex >= 0)
                                {
                                    runningPos += newLineIndex;
                                    startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                    newLinePositions.splice(currentLine, 0, runningPos);
                                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                    currentLine++;
                                    totalCount += wordCount;
                                    wordCount = 0;
                                    newLineIndex = startSpaces.indexOf('\n');
                                }

                                // Generate new segments
                                let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                let wordAdvance: number = 0;

                                for(let k = 0; k < newSegments.length; k++)
                                {
                                    wordAdvance += newSegments[k].segmentAdvance;
                                }

                                let newWord: WordData = {
                                    startPos: insert.start + editData.insertion.start, wordAdvance: wordAdvance,
                                    wordLength: insert.word.length, segments: newSegments
                                };

                                newWordData.push(newWord);
                                wordCount++;
                            }
                            else
                            {
                                let seg = word.segments[word.segments.length - 1];
                                let sty1 = seg.style;
                                let sty2 = insertStyle;

                                if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                {
                                    console.log('Made it to the right spot.');
                                    // Extend the last segment of this word.
                                    let newText = this.text.substring(seg.startPos, seg.startPos + seg.segmentLength + insert.word.length);
                                    let newSegments = this.splitSegments(insertStyle, word.startPos, seg.startPos, newText);

                                    word.wordAdvance -= seg.segmentAdvance;
                                    word.segments.splice(word.segments.length - 1, 1);

                                    let wordAdvance: number = 0;

                                    for(let k = 0; k < newSegments.length; k++)
                                    {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }

                                    word.wordAdvance += wordAdvance;
                                    word.segments.push(...newSegments);
                                    word.wordLength += insert.word.length;

                                    console.log('New word data was: ');
                                    console.log(newWordData);

                                    newWordData.push(word);
                                    wordCount++;

                                    console.log('New word data is now: ');
                                    console.log(newWordData);
                                }
                                else
                                {
                                    // Just add another segment and adjust some stuff.
                                    let newText = this.text.substring(editData.insertion.start, editData.insertion.start + insert.word.length);
                                    let newSegments = this.splitSegments(insertStyle, word.startPos, editData.insertion.start - word.startPos, newText);

                                    let wordAdvance: number = 0;

                                    for(let k = 0; k < newSegments.length; k++)
                                    {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }

                                    word.wordAdvance += wordAdvance;
                                    word.segments.push(...newSegments);
                                    word.wordLength += insert.word.length;

                                    newWordData.push(word);
                                    wordCount++;
                                }
                            }
                        }
                        else if(editData.insertion.start != word.startPos)
                        {
                            console.log('Went in this condition.');
                            let seg: SegmentData = null;
                            let segIndex = -1;

                            for(let k = 0; k < word.segments.length; k++)
                            {
                                let segment = word.segments[k];
                                if(editData.insertion.start == segment.startPos + segment.segmentLength)
                                {
                                    seg = segment;
                                    segIndex = k;

                                    if(segment.style.style == insertStyle.style && segment.style.weight == insertStyle.weight)
                                    {
                                        break;
                                    }
                                }
                                else if(editData.insertion.start >= segment.startPos && editData.insertion.start < segment.startPos + segment.segmentLength)
                                {
                                    seg = segment;
                                    segIndex = k;
                                    break;
                                }
                            }

                            let sty1 = seg.style;
                            let sty2 = insertStyle;

                            // Add original piece before slice and first insert word
                            if(insertData.length == 1)
                            {
                                if(editData.insertion.text.charAt(0).match(/\s/))
                                {
                                    // Check for new lines at the start of the insertion.
                                    let startSpaces = editData.insertion.text.substring(0, insert.start);
                                    let newLineIndex = startSpaces.indexOf('\n');
                                    let runningPos = insertData[0].start;
                                    while(newLineIndex >= 0)
                                    {
                                        runningPos += newLineIndex;
                                        startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                        newLinePositions.splice(currentLine, 0, runningPos);
                                        newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                        currentLine++;
                                        totalCount += wordCount;
                                        wordCount = 0;
                                        newLineIndex = startSpaces.indexOf('\n');
                                    }

                                    let segStartText = this.text.substring(seg.startPos, insert.start);
                                    let newStartSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, segStartText);
                                    let startWordAdvance: number = 0;

                                    for(let k = 0; k < segIndex; k++)
                                    {
                                        startWordAdvance += word.segments[k].segmentAdvance;
                                    }

                                    for(let k = 0; k < newStartSegments.length; k++)
                                    {
                                        startWordAdvance += newStartSegments[k].segmentAdvance;
                                    }

                                    let newStartWord: WordData = {
                                        startPos: word.startPos, wordAdvance: startWordAdvance,
                                        wordLength: insert.start - word.startPos, segments: [...word.segments.slice(0, segIndex), ...newStartSegments]
                                    };

                                    newWordData.push(newStartWord);
                                    wordCount++;

                                    if(editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/))
                                    {
                                        // New insert is surrounded by spaces so split segment into new words.
                                        let insertSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                        let insertWordAdvance: number = 0;

                                        for(let k = 0; k < insertSegments.length; k++)
                                        {
                                            insertWordAdvance += insertSegments[k].segmentAdvance;
                                        }

                                        let insertWord: WordData = {
                                            startPos: insert.start, wordAdvance: insertWordAdvance,
                                            wordLength: insert.word.length, segments: insertSegments
                                        };

                                        newWordData.push(insertWord);
                                        wordCount++;

                                        // Check for new lines at the end of the insertion.
                                        let spacesStart = insertData[0].start + insertData[0].word.length;
                                        let spacesEnd = insert.start + insert.word.length;
                                        let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                        let newLineIndex = startSpaces.indexOf('\n');
                                        let runningPos = insertData[0].start + insertData[0].word.length;
                                        while(newLineIndex >= 0)
                                        {
                                            runningPos += newLineIndex;
                                            startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                            newLinePositions.splice(currentLine, 0, runningPos);
                                            newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                            currentLine++;
                                            totalCount += wordCount;
                                            wordCount = 0;
                                            newLineIndex = startSpaces.indexOf('\n');
                                        }

                                        // Insert new word for split segment after.
                                        let newEndStart = editData.insertion.start + editData.insertion.text.length;
                                        let segEndText = this.text.substring(newEndStart, seg.segmentLength - (insert.start - (seg.startPos + word.startPos)));
                                        let newEndSegments = this.splitSegments(seg.style, word.startPos, 0, segEndText);
                                        let endWordAdvance: number = 0;

                                        for(let k = segIndex + 1; k < word.segments.length; k++)
                                        {
                                            endWordAdvance += word.segments[k].segmentAdvance;
                                            word.segments[k].startPos -= (editData.insertion.start - word.startPos);
                                        }

                                        for(let k = 0; k < newEndSegments.length; k++)
                                        {
                                            endWordAdvance += newEndSegments[k].segmentAdvance;
                                        }

                                        let endSegments = [...newEndSegments];

                                        if(segIndex < word.segments.length)
                                        {
                                            endSegments.push(...word.segments.slice(segIndex + 1, word.segments.length));
                                        }

                                        let newEndWord: WordData = {
                                            startPos: newEndStart, wordAdvance: endWordAdvance,
                                            wordLength: word.wordLength - newStartWord.wordLength, segments: endSegments
                                        };

                                        newWordData.push(newEndWord);
                                        wordCount++;
                                    }
                                    else
                                    {
                                        // Check for merger of end segments
                                        if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                        {
                                            // Extend this segment
                                            let includeNextSeg = false;
                                            let newLength = (seg.segmentLength - (insert.start - (seg.startPos + word.startPos))) + insert.word.length;

                                            if(segIndex < word.segments.length)
                                            {
                                                let testSty = word.segments[segIndex + 1].style;
                                                if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                                {
                                                    includeNextSeg = true;
                                                    newLength += word.segments[segIndex + 1].segmentLength;
                                                }
                                            }

                                            let newText = this.text.substring(insert.start, insert.start + newLength);
                                            let newSegments = this.splitSegments(insertStyle, word.startPos, 0, newText);
                                            let endWordAdvance: number = 0;

                                            for(let k = segIndex + 1; k < word.segments.length; k++)
                                            {
                                                endWordAdvance += word.segments[k].segmentAdvance;
                                                word.segments[k].startPos -= (editData.insertion.start - word.startPos);
                                            }

                                            for(let k = 0; k < newSegments.length; k++)
                                            {
                                                endWordAdvance += newSegments[k].segmentAdvance;
                                            }

                                            let endSegments = [...newSegments];

                                            let tmpIndex = segIndex + (includeNextSeg ? 1 : 0);

                                            if(tmpIndex + 1 < word.segments.length)
                                            {
                                                endSegments.push(...word.segments.slice(tmpIndex + 1, word.segments.length));
                                            }

                                            let newEndWord: WordData = {
                                                startPos: insert.start, wordAdvance: endWordAdvance,
                                                wordLength: newLength, segments: endSegments
                                            };

                                            newWordData.push(newEndWord);
                                            wordCount++;
                                        }
                                        else
                                        {
                                            let includeNextSeg = false;
                                            let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                            let splitStart = insert.start + insert.word.length;
                                            let splitLength = seg.segmentLength - (insert.start - (seg.startPos + word.startPos));

                                            if(segIndex < word.segments.length)
                                            {
                                                let testSty = word.segments[segIndex + 1].style;
                                                if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                                {
                                                    includeNextSeg = true;
                                                    splitLength += word.segments[segIndex + 1].segmentLength;
                                                }
                                            }

                                            let splitText = this.text.substring(splitStart, splitStart + splitLength);
                                            let splitSegments = this.splitSegments(seg.style, word.startPos, insert.word.length, splitText);
                                            let endWordAdvance: number = 0;
                                            let newLength: number = 0;

                                            for(let k = segIndex + 1; k < word.segments.length; k++)
                                            {
                                                endWordAdvance += word.segments[k].segmentAdvance;
                                                newLength += word.segments[k].segmentLength;
                                                word.segments[k].startPos -= (editData.insertion.start - word.startPos);
                                            }

                                            for(let k = 0; k < newSegments.length; k++)
                                            {
                                                endWordAdvance += newSegments[k].segmentAdvance;
                                                newLength += newSegments[k].segmentLength;
                                            }

                                            for(let k = 0; k < splitSegments.length; k++)
                                            {
                                                endWordAdvance += splitSegments[k].segmentAdvance;
                                                newLength += splitSegments[k].segmentLength;
                                            }

                                            let endSegments = [...splitSegments, ...newSegments];

                                            let tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                            if(tmpIndex + 1 < word.segments.length)
                                            {
                                                endSegments.push(...word.segments.slice(tmpIndex + 1, word.segments.length));
                                            }

                                            let newEndWord: WordData = {
                                                startPos: insert.start, wordAdvance: endWordAdvance,
                                                wordLength: newLength, segments: endSegments
                                            };

                                            newWordData.push(newEndWord);
                                            wordCount++;
                                        }
                                    }
                                }
                                else if(editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/))
                                {
                                    // Check for merger of start segments
                                    if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                    {
                                        // Extend this segment
                                        let newText = this.text.substring(segIndex, insert.start + insert.word.length);
                                        let newStartSegments = this.splitSegments(insertStyle, word.startPos, segIndex, newText);

                                        let startWordAdvance: number = 0;

                                        for(let k = 0; k < segIndex; k++)
                                        {
                                            startWordAdvance += newStartSegments[k].segmentAdvance;
                                        }

                                        let newStartWord: WordData = {
                                            startPos: word.startPos, wordAdvance: startWordAdvance,
                                            wordLength: insert.start - word.startPos + insert.word.length,
                                            segments: [...word.segments.slice(0, segIndex), ...newStartSegments]
                                        };

                                        newWordData.push(newStartWord);
                                        wordCount++;
                                    }
                                    else
                                    {
                                        let newSegments = this.splitSegments(insertStyle, word.startPos, insert.start - word.startPos, insert.word);
                                        let splitText = this.text.substring(seg.startPos, insert.start);
                                        let splitSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, splitText);
                                        let startWordAdvance: number = 0;
                                        let newLength: number = 0;

                                        for(let k = 0; k < segIndex; k++)
                                        {
                                            startWordAdvance += word.segments[k].segmentAdvance;
                                            newLength += word.segments[k].segmentLength;
                                        }

                                        for(let k = 0; k < newSegments.length; k++)
                                        {
                                            startWordAdvance += newSegments[k].segmentAdvance;
                                            newLength += newSegments[k].segmentLength;
                                        }

                                        for(let k = 0; k < splitSegments.length; k++)
                                        {
                                            startWordAdvance += splitSegments[k].segmentAdvance;
                                            newLength += splitSegments[k].segmentLength;
                                        }

                                        let startSegments: Array<any> = [...splitSegments, ...newSegments];

                                        if(segIndex > 0)
                                        {
                                            startSegments.push(...word.segments.slice(0, segIndex));
                                        }

                                        let newstartWord: WordData = {
                                            startPos: insert.start, wordAdvance: startWordAdvance,
                                            wordLength: newLength, segments: startSegments
                                        };

                                        newWordData.push(newstartWord);
                                        wordCount++;
                                    }

                                    // Check for new lines at the end of the insertion.
                                    let spacesStart = insertData[0].start + insertData[0].word.length;
                                    let spacesEnd = insert.start + insert.word.length;
                                    let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                    let newLineIndex = startSpaces.indexOf('\n');
                                    let runningPos = insertData[0].start + insertData[0].word.length;
                                    while(newLineIndex >= 0)
                                    {
                                        runningPos += newLineIndex;
                                        startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                        newLinePositions.splice(currentLine, 0, runningPos);
                                        newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                        currentLine++;
                                        totalCount += wordCount;
                                        wordCount = 0;
                                        newLineIndex = startSpaces.indexOf('\n');
                                    }

                                    // Insert new word after split.
                                    let newSegEnd = seg.startPos + seg.segmentLength + editData.insertion.text.length;
                                    let segEndText = this.text.substring(insert.start + editData.insertion.text.length, newSegEnd);
                                    let newEndSegments = this.splitSegments(seg.style, word.startPos, 0, segEndText);
                                    let endWordAdvance: number = 0;

                                    for(let k = segIndex + 1; k < word.segments.length; k++)
                                    {
                                        endWordAdvance += word.segments[k].segmentAdvance;
                                        word.segments[k].startPos -= insert.start - (seg.startPos + word.startPos);
                                    }

                                    for(let k = 0; k < newEndSegments.length; k++)
                                    {
                                        endWordAdvance += newEndSegments[k].segmentAdvance;
                                    }

                                    let endSegments = newEndSegments;

                                    if(segIndex + 1 < word.segments.length)
                                    {
                                        endSegments.push(...word.segments.slice(segIndex + 1, word.segments.length));
                                    }

                                    let newEndWord: WordData = {
                                        startPos: insert.start + editData.insertion.text.length, wordAdvance: endWordAdvance,
                                        wordLength: newSegEnd - (insert.start + editData.insertion.text.length), segments: endSegments
                                    };

                                    newWordData.push(newEndWord);
                                    wordCount++;
                                }
                                else
                                {
                                    // Insert new text into word.
                                    if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                    {
                                        let includeNextSeg = false;
                                        let splitLength = seg.segmentLength + insert.word.length;

                                        if(segIndex < word.segments.length)
                                        {
                                            let testSty = word.segments[segIndex + 1].style;
                                            if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                            {
                                                includeNextSeg = true;
                                                splitLength += word.segments[segIndex + 1].segmentLength;
                                            }
                                        }

                                        let newText = this.text.substring(seg.startPos, seg.startPos + splitLength);
                                        let newSegments = this.splitSegments(insertStyle, word.startPos, seg.startPos, newText);

                                        word.wordAdvance -= seg.segmentAdvance;
                                        word.segments.splice(segIndex, includeNextSeg ? 2 : 1);

                                        let wordAdvance: number = 0;

                                        for(let k = 0; k < newSegments.length; k++)
                                        {
                                            wordAdvance += newSegments[k].segmentAdvance;
                                        }
                                        for(let k = segIndex + 1; k < word.segments.length; k++)
                                        {
                                            word.segments[k].startPos += insert.word.length;
                                        }

                                        word.wordAdvance += wordAdvance;

                                        word.segments.splice(segIndex, 0, ...newSegments);

                                        newWordData.push(word);
                                        wordCount++;
                                    }
                                    else
                                    {
                                        // Insert new segment splitting segment.
                                        let startText = this.text.substring(seg.startPos, insert.start);
                                        let newStartSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, startText);
                                        let newSegments = this.splitSegments(insertStyle, word.startPos, insert.start - word.startPos, insert.word);

                                        let includeNextSeg = false;
                                        let newEndPos = 2 * seg.startPos + seg.segmentAdvance - insert.start;

                                        if(segIndex < word.segments.length)
                                        {
                                            let testSty = word.segments[segIndex + 1].style;
                                            if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                            {
                                                includeNextSeg = true;
                                                newEndPos += word.segments[segIndex + 1].segmentLength;
                                            }
                                        }
                                        let endLocalStart = insert.start - word.startPos + insert.word.length;
                                        let endText = this.text.substring(insert.start + insert.word.length, word.startPos + newEndPos);
                                        let newEndSegments = this.splitSegments(seg.style, word.startPos, endLocalStart, endText);


                                        word.wordAdvance -= seg.segmentAdvance;
                                        word.wordLength += insert.word.length;

                                        for(let k = segIndex + 1; k < word.segments.length; k++)
                                        {
                                            word.segments[k].startPos += insert.word.length;
                                        }

                                        for(let k = 0; k < newStartSegments.length; k++)
                                        {
                                            word.wordAdvance += newStartSegments[k].segmentAdvance;
                                        }
                                        for(let k = 0; k < newSegments.length; k++)
                                        {
                                            word.wordAdvance += newSegments[k].segmentAdvance;
                                        }
                                        for(let k = 0; k < newEndSegments.length; k++)
                                        {
                                            word.wordAdvance += newEndSegments[k].segmentAdvance;
                                        }

                                        let wordSegments = [];

                                        if(segIndex > 0)
                                        {
                                            wordSegments.push(...word.segments.slice(0, segIndex));
                                        }

                                        wordSegments.push(...newStartSegments);
                                        wordSegments.push(...newSegments);
                                        wordSegments.push(...newEndSegments);

                                        let tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                        if(tmpIndex + 1 < word.segments.length)
                                        {
                                            wordSegments.push(...word.segments.slice(tmpIndex + 1, word.segments.length));
                                        }

                                        word.segments = wordSegments;

                                        newWordData.push(word);
                                        wordCount++;
                                    }
                                }
                            }
                            else
                            {
                                if(editData.insertion.text.charAt(0).match(/\s/))
                                {
                                    // Check for new lines at the start of the insertion.
                                    let startSpaces = editData.insertion.text.substring(0, insert.start);
                                    let newLineIndex = startSpaces.indexOf('\n');
                                    let runningPos = insertData[0].start;
                                    while(newLineIndex >= 0)
                                    {
                                        runningPos += newLineIndex;
                                        startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                        newLinePositions.splice(currentLine, 0, runningPos);
                                        newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                        currentLine++;
                                        totalCount += wordCount;
                                        wordCount = 0;
                                        newLineIndex = startSpaces.indexOf('\n');
                                    }

                                    // Split off first piece as own word and insert first new word.
                                    let segStartText = this.text.substring(seg.startPos, insert.start);
                                    let newStartSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, segStartText);
                                    let startWordAdvance: number = 0;

                                    for(let k = 0; k < segIndex; k++)
                                    {
                                        startWordAdvance += word.segments[k].segmentAdvance;
                                    }

                                    for(let k = 0; k < newStartSegments.length; k++)
                                    {
                                        startWordAdvance += newStartSegments[k].segmentAdvance;
                                    }

                                    let newStartWord: WordData = {
                                        startPos: word.startPos, wordAdvance: startWordAdvance,
                                        wordLength: insert.start - word.startPos, segments: [...word.segments.slice(0, segIndex), ...newStartSegments]
                                    };

                                    newWordData.push(newStartWord);
                                    wordCount++;

                                    let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                    let insertWordAdvance: number = 0;

                                    for(let k = 0; k < newSegments.length; k++)
                                    {
                                        insertWordAdvance += newSegments[k].segmentAdvance;
                                    }

                                    let insertWord: WordData = {
                                        startPos: insert.start, wordAdvance: insertWordAdvance,
                                        wordLength: insert.word.length, segments: newSegments
                                    };

                                    newWordData.push(insertWord);
                                    wordCount++;
                                }
                                else
                                {
                                    let newSegments: Array<SegmentData> = [];
                                    let insertWordAdvance: number = 0;

                                    // Merge first piece with first new word
                                    if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                    {
                                        // Merge segments.
                                        let newWord = this.text.substring(seg.startPos, insert.start + insert.word.length);

                                        if(segIndex > 0)
                                        {
                                            newSegments.push(...word.segments.slice(0, segIndex));
                                        }

                                        newSegments.push(...this.splitSegments(insertStyle, word.startPos, seg.startPos, newWord));
                                    }
                                    else
                                    {
                                        // Add new segment.
                                        let cutText = this.text.substring(seg.startPos, insert.start);
                                        let cutSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, cutText);

                                        if(segIndex > 0)
                                        {
                                            newSegments.push(...word.segments.slice(0, segIndex));
                                        }

                                        if(cutSegments.length > 0)
                                        {
                                            newSegments.push(...cutSegments);
                                        }

                                        newSegments.push(...this.splitSegments(insertStyle, word.startPos, insert.start - word.startPos, insert.word));
                                    }

                                    for(let k = 0; k < newSegments.length; k++)
                                    {
                                        insertWordAdvance += newSegments[k].segmentAdvance;
                                    }

                                    let insertWord: WordData = {
                                        startPos: word.startPos, wordAdvance: insertWordAdvance,
                                        wordLength: insert.start + insert.word.length - word.startPos, segments: newSegments
                                    };

                                    newWordData.push(insertWord);
                                    wordCount++;
                                }
                            }
                        }

                        // Insert all isolated words.
                        for(let j = 1; j < insertData.length - 1; j++)
                        {
                            // Check for new lines at the start of the insertion.
                            let spacesStart = insertData[j -1].start + insertData[j -1].word.length;
                            let spacesEnd = insertData[j].start;
                            let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            let newLineIndex = startSpaces.indexOf('\n');
                            let runningPos = insertData[j -1].start + insertData[j -1].word.length;
                            while(newLineIndex >= 0)
                            {
                                runningPos += newLineIndex;
                                startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                newLinePositions.splice(currentLine, 0, runningPos);
                                newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                currentLine++;
                                totalCount += wordCount;
                                wordCount = 0;
                                newLineIndex = startSpaces.indexOf('\n');
                            }

                            console.log('Went through loop.');
                            let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insertData[j].word);
                            let wordAdvance: number = 0;

                            for(let k = 0; k < newSegments.length; k++)
                            {
                                wordAdvance += newSegments[k].segmentAdvance;
                            }

                            let newWord: WordData = {
                                startPos: insertData[j].start + editData.insertion.start, wordAdvance: wordAdvance,
                                wordLength: insertData[j].word.length, segments: newSegments
                            };

                            newWordData.push(newWord);
                            wordCount++;
                        }

                        if(insertData.length > 1)
                        {
                            // Check for new lines.
                            let spacesStart = insertData[insertData.length - 2].start + insertData[insertData.length - 2].word.length;
                            let spacesEnd = insertData[insertData.length - 1].start;
                            let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            let newLineIndex = startSpaces.indexOf('\n');
                            let runningPos = spacesStart;
                            while(newLineIndex >= 0)
                            {
                                runningPos += newLineIndex;
                                startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                newLinePositions.splice(currentLine, 0, runningPos);
                                newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                currentLine++;
                                totalCount += wordCount;
                                wordCount = 0;
                                newLineIndex = startSpaces.indexOf('\n');
                            }
                        }
                        
                        insert = insertData[insertData.length - 1];

                        if(editData.insertion.start == word.startPos)
                        {
                            console.log('Did the start insert thing.');
                            if(editData.insertion.text.charAt(editData.insertion.text.length - 1).match(/\s/))
                            {
                                // Word is seperate so just insert new word.
                                let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                let wordAdvance: number = 0;

                                for(let k = 0; k < newSegments.length; k++)
                                {
                                    wordAdvance += newSegments[k].segmentAdvance;
                                }

                                let newWord: WordData = {
                                    startPos: insert.start + editData.insertion.start, wordAdvance: wordAdvance,
                                    wordLength: insert.word.length, segments: newSegments
                                };

                                newWordData.push(newWord);
                                wordCount++;

                                // Check for new lines.
                                let spacesStart = insertData[insertData.length - 1].start + insertData[insertData.length - 1].word.length;
                                let spacesEnd = editData.insertion.start + editData.insertion.text.length;
                                let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                let newLineIndex = startSpaces.indexOf('\n');
                                let runningPos = spacesStart;
                                while(newLineIndex >= 0)
                                {
                                    runningPos += newLineIndex;
                                    startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                    newLinePositions.splice(currentLine, 0, runningPos);
                                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                    currentLine++;
                                    totalCount += wordCount;
                                    wordCount = 0;
                                    newLineIndex = startSpaces.indexOf('\n');
                                }

                                // Then push current word.
                                word.startPos += editData.insertion.text.length;
                                newWordData.push(word);
                                wordCount++;
                            }
                            else
                            {
                                let seg = word.segments[0];
                                let sty1 = word.segments[0].style;
                                let sty2 = insertStyle;

                                if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                {
                                    // Extend the first segment of this word.
                                    let includeNextSeg = false;
                                    let newLength = seg.segmentLength + insert.word.length;

                                    if(word.segments.length > 1)
                                    {
                                        let testSty = word.segments[1].style;
                                        if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                        {
                                            includeNextSeg = true;
                                            newLength += word.segments[1].segmentLength;
                                        }
                                    }

                                    let newText = this.text.substring(word.startPos, word.startPos + newLength);
                                    let newSegments = this.splitSegments(insertStyle, word.startPos, 0, newText);

                                    word.wordAdvance -= seg.segmentAdvance;
                                    word.segments.splice(0, includeNextSeg ? 2 : 1);

                                    let wordAdvance: number = 0;

                                    for(let k = 0; k < newSegments.length; k++)
                                    {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    for(let k = 0; k < word.segments.length; k++)
                                    {
                                        word.segments[k].startPos += insert.word.length;
                                    }

                                    word.wordAdvance += wordAdvance;
                                    word.segments = [...newSegments, ...word.segments];

                                    newWordData.push(word);
                                    wordCount++;
                                }
                                else
                                {
                                    // Just add another segment and adjust some stuff.
                                    let includeNextSeg = false;
                                    let newLength = insert.word.length;

                                    if(word.segments.length > 1)
                                    {
                                        let testSty = word.segments[1].style;
                                        if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                        {
                                            includeNextSeg = true;
                                            newLength += word.segments[1].segmentLength;
                                        }
                                    }

                                    let newText = this.text.substring(insert.start, insert.start + newLength);
                                    let newSegments = this.splitSegments(insertStyle, word.startPos, 0, newText);

                                    let wordAdvance: number = 0;

                                    for(let k = 0; k < newSegments.length; k++)
                                    {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    for(let k = 0; k < word.segments.length; k++)
                                    {
                                        word.segments[k].startPos += insert.word.length;
                                    }

                                    word.wordAdvance += wordAdvance;
                                    word.segments = [...newSegments, ...word.segments.slice(includeNextSeg ? 1 : 0)];

                                    newWordData.push(word);
                                    wordCount++;
                                }
                            }
                        }
                        else if(editData.insertion.start != word.startPos + word.wordLength && insertData.length > 1)
                        {
                            console.log('Did the end multi insert data.');
                            let seg: SegmentData = null;
                            let segIndex = -1;

                            for(let k = 0; k < word.segments.length; k++)
                            {
                                let segment = word.segments[k];
                                if(editData.insertion.start == segment.startPos + segment.segmentLength)
                                {
                                    seg = segment;
                                    segIndex = k;

                                    if(segment.style.style == insertStyle.style && segment.style.weight == insertStyle.weight)
                                    {
                                        break;
                                    }
                                }
                                else if(editData.insertion.start >= segment.startPos && editData.insertion.start < segment.startPos + segment.segmentLength)
                                {
                                    seg = segment;
                                    segIndex = k;
                                    break;
                                }
                            }

                            let sty1 = seg.style;
                            let sty2 = insertStyle;

                            // Add original piece after slice and if there is more than one insert word add the last.
                            if(editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/))
                            {
                                // Split off last piece as own word and insert last new word.
                                let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                let insertWordAdvance: number = 0;

                                for(let k = 0; k < newSegments.length; k++)
                                {
                                    insertWordAdvance += newSegments[k].segmentAdvance;
                                }

                                let insertWord: WordData = {
                                    startPos: insert.start, wordAdvance: insertWordAdvance,
                                    wordLength: insert.word.length, segments: newSegments
                                };

                                newWordData.push(insertWord);
                                wordCount++;

                                // Check for new lines.
                                let spacesStart = insertData[insertData.length - 1].start + insertData[insertData.length - 1].word.length;
                                let spacesEnd = editData.insertion.start + editData.insertion.text.length;
                                let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                let newLineIndex = startSpaces.indexOf('\n');
                                let runningPos = spacesStart;
                                while(newLineIndex >= 0)
                                {
                                    runningPos += newLineIndex;
                                    startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                    newLinePositions.splice(currentLine, 0, runningPos);
                                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                    currentLine++;
                                    totalCount += wordCount;
                                    wordCount = 0;
                                    newLineIndex = startSpaces.indexOf('\n');
                                }

                                let cutStart = editData.insertion.start + editData.insertion.text.length;
                                let cutLength = seg.startPos + seg.segmentLength + word.startPos - editData.insertion.start;
                                let cutText = this.text.substring(cutStart, cutStart + cutLength);
                                let cutSegments = this.splitSegments(seg.style, word.startPos, 0, cutText);

                                let cutWordAdvance: number = 0;

                                for(let k = 0; k < cutSegments.length; k++)
                                {
                                    cutWordAdvance += cutSegments[k].segmentAdvance;
                                }
                                for(let k = segIndex + 1; k < word.segments.length; k++)
                                {
                                    cutWordAdvance += word.segments[k].segmentAdvance;
                                    word.segments[k].startPos -= editData.insertion.start - word.startPos;
                                }

                                if(segIndex < word.segments.length)
                                {
                                    cutSegments.push(...word.segments.slice(segIndex + 1, word.segments.length));
                                }

                                let cutWord: WordData = {
                                    startPos: cutStart, wordAdvance: cutWordAdvance,
                                    wordLength: word.wordLength - (editData.insertion.start - word.startPos), segments: cutSegments
                                };

                                newWordData.push(cutWord);
                                wordCount++;
                            }
                            else
                            {
                                let includeNextSeg = false;
                                let cutLength = seg.startPos + seg.segmentLength + word.startPos - editData.insertion.start;
                                let newSegments: Array<SegmentData> = [];
                                let insertWordAdvance: number = 0;

                                if(segIndex < word.segments.length)
                                {
                                    let testSty = word.segments[segIndex + 1].style;
                                    if(testSty.style == sty1.style && testSty.weight == sty1.weight)
                                    {
                                        includeNextSeg = true;
                                        cutLength += word.segments[segIndex + 1].segmentLength;
                                    }
                                }

                                // Merge first piece with first new word
                                if(sty1.style == sty2.style && sty1.weight == sty2.weight)
                                {
                                    // Merge segments.
                                    let newWord = this.text.substring(insert.start, insert.start + insert.word.length + cutLength);
                                    newSegments = this.splitSegments(insertStyle, word.startPos, 0, newWord);

                                    for(let k = segIndex + 1; k < word.segments.length; k++)
                                    {
                                        word.segments[k].startPos -= editData.insertion.start - word.startPos;
                                    }

                                    let tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                    if(tmpIndex < word.segments.length)
                                    {
                                        newSegments.push(...word.segments.slice(tmpIndex + 1, word.segments.length));
                                    }
                                }
                                else
                                {
                                    // Add new segment.
                                    let cutText = this.text.substring(insert.start + insert.word.length, insert.start + insert.word.length + cutLength);
                                    let cutSegments = this.splitSegments(seg.style, word.startPos, insert.word.length, cutText);
                                    newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);

                                    if(cutSegments.length > 0)
                                    {
                                        newSegments.push(...cutSegments);
                                    }

                                    for(let k = segIndex + 1; k < word.segments.length; k++)
                                    {
                                        word.segments[k].startPos -= editData.insertion.start - word.startPos;
                                    }

                                    let tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                    if(tmpIndex < word.segments.length)
                                    {
                                        newSegments.push(...word.segments.slice(tmpIndex + 1, word.segments.length));
                                    }
                                }

                                for(let k = 0; k < newSegments.length; k++)
                                {
                                    insertWordAdvance += newSegments[k].segmentAdvance;
                                }

                                let insertWord: WordData = {
                                    startPos: word.startPos, wordAdvance: insertWordAdvance,
                                    wordLength: insert.word.length + word.wordLength - (insert.start - word.startPos), segments: newSegments
                                };

                                newWordData.push(insertWord);
                                wordCount++;
                            }
                        }

                        inserted = true;
                    }
                    else if(!inserted && editData.insertion.start < word.startPos)
                    {
                        console.log('Did the non-insert add.');
                        // Just add new words. This happens when insert was in spaces.
                        inserted = true;

                        if(editData.insertion.text.charAt(0).match(/\s/))
                        {
                            // Check for new lines.
                            let spacesStart = 0;
                            let spacesEnd = insertData[0].start;
                            let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            let newLineIndex = startSpaces.indexOf('\n');
                            let runningPos = spacesStart;
                            while(newLineIndex >= 0)
                            {
                                runningPos += newLineIndex;
                                startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                newLinePositions.splice(currentLine, 0, runningPos);
                                newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                currentLine++;
                                totalCount += wordCount;
                                wordCount = 0;
                                newLineIndex = startSpaces.indexOf('\n');
                            }
                        }

                        for(let j = 0; j < insertData.length; j++)
                        {
                            let newSegments = this.splitSegments(insertStyle, word.startPos, 0, insertData[j].word);
                            let wordAdvance: number = 0;

                            for(let k = 0; k < newSegments.length; k++)
                            {
                                wordAdvance += newSegments[k].segmentAdvance;
                            }

                            let newWord: WordData = {
                                startPos: insertData[j].start + editData.insertion.start, wordAdvance: wordAdvance,
                                wordLength: insertData[j].word.length, segments: newSegments
                            };

                            newWordData.push(newWord);
                            wordCount++;

                            if(j < insertData.length - 1)
                            {
                                // Check for new lines.
                                let spacesStart = insertData[j].start + insertData[j].word.length;
                                let spacesEnd = editData.insertion.start + editData.insertion.text.length;
                                let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                let newLineIndex = startSpaces.indexOf('\n');
                                let runningPos = spacesStart;
                                while(newLineIndex >= 0)
                                {
                                    runningPos += newLineIndex;
                                    startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                    newLinePositions.splice(currentLine, 0, runningPos);
                                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                    currentLine++;
                                    totalCount += wordCount;
                                    wordCount = 0;
                                    newLineIndex = startSpaces.indexOf('\n');
                                }
                            }

                        }

                        if(editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/))
                        {
                            // Check for new lines.
                            let spacesStart = insertData[insertData.length - 1].start + insertData[insertData.length - 1].word.length;
                            let spacesEnd = editData.insertion.start + editData.insertion.text.length;
                            let startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            let newLineIndex = startSpaces.indexOf('\n');
                            let runningPos = spacesStart;
                            while(newLineIndex >= 0)
                            {
                                runningPos += newLineIndex;
                                startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                newLinePositions.splice(currentLine, 0, runningPos);
                                newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                currentLine++;
                                totalCount += wordCount;
                                wordCount = 0;
                                newLineIndex = startSpaces.indexOf('\n');
                            }
                        }

                        word.startPos += editData.insertion.text.length;
                        newWordData.push(word);
                        wordCount++;
                    }
                    else
                    {
                        console.log('Did the final else.');
                        if(word.startPos >=  editData.insertion.start)
                        {
                            word.startPos += editData.insertion.text.length;
                        }

                        console.log('New word data was:');
                        console.log(newWordData);
                        newWordData.push(word);
                        wordCount++;
                        console.log('New word data is now:');
                        console.log(newWordData);
                    }
                }

                if(editData.styleChanges.length > 0 && editData.insertion == null)
                {
                    let changedSegments: Array<Array<number>> = [];
                    let working = [];

                    // Used to add an extra segment beyond the changes at the end. This assists keeping segments from over splitting.
                    let endNextAdded = false;
                    let changesSegsAdvance = 0;
                    let newSegments = [];

                    for(let j = 0; j < editData.styleChanges.length; j++)
                    {
                        let change = editData.styleChanges[j];

                        if(change.start < word.startPos + word.wordLength && change.end > word.startPos)
                        {
                            for(let k = 0; k < word.segments.length; k++)
                            {
                                let seg = word.segments[k];
                                if(change.start < seg.startPos + seg.segmentLength && change.end > seg.startPos)
                                {
                                    if(working.length == 0 || working[working.length - 1] == k - 1)
                                    {
                                        // Check for a reset as there was just one segment between sections.
                                        if(endNextAdded)
                                        {
                                            endNextAdded = false;
                                        }

                                        if(working.length == 0 && k > 0)
                                        {
                                            working.push(k - 1);
                                            changesSegsAdvance += word.segments[k-1].segmentAdvance;
                                        }

                                        working.push(k);
                                    }
                                    else if(!endNextAdded)
                                    {
                                        endNextAdded = true;
                                        working.push(k);
                                        changesSegsAdvance += seg.segmentAdvance;
                                    }
                                    else
                                    {
                                        endNextAdded = false;
                                        changedSegments.push(working);
                                        working = [];
                                    }

                                }
                                else if(change.start >= seg.startPos + seg.segmentLength)
                                {
                                    break;
                                }
                            }
                        }
                    }

                    let prevAdded = 0;
                    let newAdvance = 0;

                    for(let j = 0; j < changedSegments.length; j++)
                    {
                        if(prevAdded < changedSegments[j][0])
                        {
                            newSegments.push(...word.segments.slice(prevAdded, changedSegments[j][0]));
                        }

                        let localStart = word.segments[changedSegments[j][0]].startPos;
                        let start = word.startPos + localStart;
                        let endSeg = word.segments[changedSegments[j][changedSegments[j].length - 1]];
                        let textLength = endSeg.startPos + endSeg.segmentLength - localStart;
                        let splitText = this.text.substring(start, start + textLength);

                        let newSplit: Array<SegmentData> = this.splitWithStyles(word.startPos, localStart, splitText);

                        for(let k = 0; k < newSplit.length; k++)
                        {
                            newAdvance += newSplit[k].segmentAdvance;
                        }

                        newSegments.push(...newSplit);
                    }

                    word.segments = newSegments;
                    word.wordAdvance += newAdvance - changesSegsAdvance;

                    newWordData.push(word);
                    wordCount++;

                    console.log('Did the style change insert.');
                }
            }

            if(editData.insertion != null && !inserted)
            {
                // New insert is after all words so add it here.
                for(let j = 0; j < insertData.length; j++)
                {
                    let newSegments = this.splitSegments(insertStyle, insertData[j].start, 0, insertData[j].word);
                    let wordAdvance: number = 0;

                    for(let k = 0; k < newSegments.length; k++)
                    {
                        wordAdvance += newSegments[k].segmentAdvance;
                    }

                    let newWord: WordData = {
                        startPos: insertData[j].start + editData.insertion.start, wordAdvance: wordAdvance,
                        wordLength: insertData[j].word.length, segments: newSegments
                    };

                    newWordData.push(newWord);
                    wordCount++;
                }
            }

            if(newLineData.length == 0)
            {
                newLineData[currentLine] = { startWord: 0, count: wordCount };
            }

            this.lineData = newLineData;
            this.linePositions = newLinePositions;
            this.wordData = newWordData;
            console.log('New word data is:');
            console.log(newWordData);
            console.log('Line data is:');
            console.log(newLineData);
        }

        /**
         *
         *
         */
        private calculateTextLines()
        {
            let childText = [];
            let currPos: number = 0;
            let prevGlyphPos: number = 0;
            let txtStart: number = 0;
            let dy: number = 2 * this.size;
            let computedTextLength: number;
            let currY: number = this.y;
            let lineCount: number = 0;
            let isSpace: boolean = false;
            let currStyle: number = 0;
            let glyphCount: number = 0;

            if(this.text.length == 0)
            {
                this.textNodes = [];
                this.glyphCount = 0;
                return;
            }

            for(let k = 0; k < this.lineData.length; k++)
            {
                console.log('Processing line ' + k);

                computedTextLength = 0;

                let wordNum: number = 0;
                let wordIdx: number = this.lineData[k].startWord;
                let wordCount: number = this.lineData[k].count;
                let startPos: number = k > 0 ? this.linePositions[k - 1] + 1 : 0;
                let endPos: number = k < this.lineData.length - 1 ? this.linePositions[k] : this.text.length;
                let insertSpace: boolean = false;
                let currentAdvance: number = 0;
                let lineComplete: boolean = false;
                // Keeps the position that a word or space is sliced when a new line is required.
                let slicePos: number = 0;
                let sliceSeg: number = 0;

                let wasSpaceLast: boolean = false;
                let spaceAdvance: number = 0;
                let sliceAdvance: number = 0;
                let tspanEl : TextNode;
                let prevSlicePos: number = 0;
                let numSpaces: number = 0;
                let lineGlyphCount: number = 0;

                // Add words and spaces in between.
                while(wordNum < wordCount)
                {
                    // The text span element to represent a line of glyphs.
                    tspanEl =
                    {
                        x: this.x, y: currY, dx: 0, dy: dy, start: prevGlyphPos, end: 0, endStringPos: 0,
                        spaceRemoved: true, justified: this.isJustified, lineNum: lineCount, sections: []
                    };

                    numSpaces = 0;

                    // Check for leading spaces.
                    if(wordCount > 0)
                    {
                        if(startPos < this.wordData[wordIdx].startPos)
                        {
                            insertSpace = true;
                        }
                    }
                    else if(startPos != endPos)
                    {
                        insertSpace = true;
                    }

                    prevSlicePos = slicePos;
                    slicePos = 0;

                    if(insertSpace)
                    {
                        if(prevSlicePos > 0)
                        {
                            if(spaceAdvance - sliceAdvance > this.width)
                            {
                                let tmpAdvance = 0;

                                // Find the point to split
                                for(let j = prevSlicePos; j < glyphs.length; j++)
                                {
                                    if(tmpAdvance + glyphs[j].xAdvance > this.width)
                                    {
                                        slicePos = j + 1;

                                        if(j + 1 >= glyphs.length)
                                        {
                                            wasSpaceLast = true;
                                        }
                                    }
                                    tmpAdvance += glyphs[j].xAdvance;
                                }

                                numSpaces += slicePos - prevSlicePos - 1;

                                let newSec: Section = {
                                    startPos: currentAdvance - sliceAdvance, glyphs: glyphs.slice(prevSlicePos, slicePos - 1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[prevSlicePos].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);

                                if(wasSpaceLast)
                                {
                                    slicePos = 0;
                                    insertSpace = !insertSpace;
                                    wordIdx++;
                                    wordNum++;
                                }

                                sliceAdvance += tmpAdvance;
                                lineGlyphCount += (slicePos - prevSlicePos - 1);
                                lineComplete = true;
                                glyphCount += lineGlyphCount + 1;
                            }
                            else
                            {
                                numSpaces += glyphs.length - prevSlicePos;

                                // Just add sliced spaces.
                                let newSec: Section = {
                                    startPos: currentAdvance - sliceAdvance, glyphs: glyphs.slice(prevSlicePos, glyphs.length),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[prevSlicePos].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                currentAdvance += (spaceAdvance - sliceAdvance);
                                lineGlyphCount += (glyphs.length - prevSlicePos);
                                sliceAdvance = 0;
                                insertSpace = !insertSpace;
                                wordIdx++;
                                wordNum++;
                            }
                        }
                        else
                        {
                            let start = this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength;
                            let end = this.wordData[wordIdx + 1].startPos;
                            let text = this.text.substring(start, end);

                            spaceAdvance = this.processSpaceGlyphs(glyphs, text, start);

                            if(spaceAdvance > this.width)
                            {
                                let tmpAdvance = 0;
                                // Find the point to split
                                for(let j = 0; j < glyphs.length; j++)
                                {
                                    if(tmpAdvance + glyphs[j].xAdvance > this.width)
                                    {
                                        slicePos = j + 1;

                                        if(j + 1 >= glyphs.length)
                                        {
                                            wasSpaceLast = true;
                                        }
                                    }
                                    tmpAdvance += glyphs[j].xAdvance;
                                }

                                numSpaces += slicePos - 1;

                                let newSec: Section = {
                                    startPos: currentAdvance, glyphs: glyphs.slice(0, slicePos - 1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                lineGlyphCount += slicePos - 1;

                                if(wasSpaceLast)
                                {
                                    slicePos = 0;
                                    insertSpace = !insertSpace;
                                    wordIdx++;
                                    wordNum++;
                                }

                                sliceAdvance = tmpAdvance;
                                lineComplete = true;
                                glyphCount += lineGlyphCount;
                            }
                            else
                            {
                                numSpaces += glyphs.length;

                                // Just add spaces.
                                let newSec: Section = {
                                    startPos: currentAdvance, glyphs: glyphs,
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                currentAdvance += spaceAdvance;
                                lineGlyphCount += glyphs.length;
                                insertSpace = !insertSpace;
                            }
                        }
                    }
                    else
                    {
                        let word = this.wordData[wordIdx];
                        if(prevSlicePos > 0 || sliceSeg > 0)
                        {
                            if(word.wordAdvance - sliceAdvance > this.width)
                            {
                                let tmpAdvance = 0;
                                let segIndex = sliceSeg;
                                // This word will need splitting.
                                let fDash = -1;
                                let fDashSeg = -1;
                                let fDashGlyph;
                                let sections: Array<Section> = [];

                                // Check Sliced word over.
                                if(word.segments[segIndex].hasHyphen)
                                {
                                    let glyphAdvance = 0;
                                    let seg = word.segments[segIndex];
                                    for(let i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[i].xAdvance <= this.width; i++)
                                    {
                                        if(seg.glyphs[i].isHyphen)
                                        {
                                            fDash = i;
                                            fDashSeg = segIndex;
                                        }
                                        glyphAdvance += seg.glyphs[i].xAdvance;
                                    }
                                }
                                let endPos = word.segments[segIndex].glyphs.length;
                                if(tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width)
                                {
                                    let glyphAdvance = 0;
                                    let seg = word.segments[segIndex];
                                    while(slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[slicePos].xAdvance <= this.width)
                                    {
                                        slicePos++;
                                        sliceSeg = segIndex;
                                        glyphAdvance += seg.glyphs[slicePos].xAdvance;
                                    }
                                    endPos = slicePos;
                                }

                                let newSec: Section = {
                                    startPos: tmpAdvance - sliceAdvance, glyphs: word.segments[segIndex].glyphs.slice(prevSlicePos, endPos),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[prevSlicePos].stringPositions[0]
                                };
                                sections.push(newSec);
                                tmpAdvance += word.segments[segIndex].segmentAdvance;
                                lineGlyphCount += (endPos - prevSlicePos);

                                // Now check over the rest.
                                for(segIndex = sliceSeg + 1; segIndex < word.segments.length && tmpAdvance < this.width; segIndex++)
                                {
                                    slicePos = 0;
                                    if(word.segments[segIndex].hasHyphen)
                                    {
                                        let glyphAdvance = 0;
                                        let seg = word.segments[segIndex];
                                        for(let i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[i].xAdvance <= this.width; i++)
                                        {
                                            if(seg.glyphs[i].isHyphen)
                                            {
                                                fDash = i;
                                                fDashSeg = segIndex;
                                            }
                                            glyphAdvance += seg.glyphs[i].xAdvance;
                                        }
                                    }

                                    let endPos = word.segments[segIndex].glyphs.length;
                                    if(tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width)
                                    {
                                        let glyphAdvance = 0;
                                        let seg = word.segments[segIndex];
                                        while(slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[slicePos].xAdvance <= this.width)
                                        {
                                            slicePos++;
                                            sliceSeg = segIndex;
                                            glyphAdvance += seg.glyphs[slicePos].xAdvance;
                                        }
                                        endPos = slicePos;
                                    }

                                    let newSec: Section = {
                                        startPos: tmpAdvance, glyphs: word.segments[segIndex].glyphs.slice(0, endPos),
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[0].stringPositions[0]
                                    };
                                    sections.push(newSec);
                                    tmpAdvance += word.segments[segIndex].segmentAdvance;
                                    lineGlyphCount += endPos;
                                }

                                if(fDash != -1)
                                {
                                    slicePos = fDash + 1;
                                    sliceSeg  = fDashSeg;
                                }

                                tspanEl.spaceRemoved = false;
                                sliceAdvance += tmpAdvance;
                                lineComplete = true;
                                glyphCount += lineGlyphCount;
                            }
                            else
                            {
                                // Just add sliced word.
                                // Add sliced seg first.
                                let secEnd = word.segments[sliceSeg].glyphs.length;
                                let newSec: Section = {
                                    startPos: currentAdvance - sliceAdvance, glyphs: word.segments[sliceSeg].glyphs.slice(slicePos, secEnd),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[sliceSeg].glyphs[slicePos].stringPositions[0]
                                };

                                tspanEl.sections.push(newSec);
                                currentAdvance += (word.segments[sliceSeg].segmentAdvance - sliceAdvance);

                                // Then add the rest.
                                for(let j = sliceSeg + 1; j < word.segments.length; j++)
                                {
                                    let newSec: Section = {
                                        startPos: currentAdvance, glyphs: word.segments[j].glyphs,
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[j].glyphs[0].stringPositions[0]
                                    };

                                    tspanEl.sections.push(newSec);
                                    currentAdvance += word.segments[j].segmentAdvance;
                                    lineGlyphCount += word.segments[j].glyphs.length;
                                }

                                insertSpace = !insertSpace;
                            }
                        }
                        else
                        {
                            if(word.wordAdvance > this.width)
                            {
                                let tmpAdvance = 0;
                                let segIndex = 0;
                                // This word will need splitting.
                                let fDash = -1;
                                let fDashSeg = -1;
                                let fDashGlyph;
                                let sections: Array<Section> = [];

                                for(segIndex = 0; segIndex < word.segments.length && tmpAdvance < this.width; segIndex++)
                                {
                                    slicePos = 0;
                                    if(word.segments[segIndex].hasHyphen)
                                    {
                                        let glyphAdvance = 0;
                                        let seg = word.segments[segIndex];
                                        let glyph = seg.glyphs[0];
                                        for(let i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + glyph.xAdvance <= this.width; i++)
                                        {
                                            glyph = seg.glyphs[i];
                                            if(seg.glyphs[i].isHyphen)
                                            {
                                                fDash = i;
                                                fDashSeg = segIndex;
                                            }
                                            glyphAdvance += glyph.xAdvance * 1000 / this.size;
                                        }
                                    }

                                    let endPos = word.segments[segIndex].glyphs.length;
                                    if(tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width)
                                    {
                                        let glyphAdvance = 0;
                                        let seg = word.segments[segIndex];
                                        let glyph = seg.glyphs[slicePos];
                                        while(slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + glyph.xAdvance * 1000 / this.size <= this.width)
                                        {
                                            slicePos++;
                                            sliceSeg = segIndex;
                                            glyph = seg.glyphs[slicePos];
                                            glyphAdvance += glyph.xAdvance * 1000 / this.size;
                                        }
                                        endPos = slicePos;
                                    }

                                    let newSec: Section = {
                                        startPos: tmpAdvance, glyphs: word.segments[segIndex].glyphs.slice(0, endPos),
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[0].stringPositions[0]
                                    };
                                    sections.push(newSec);
                                    tmpAdvance += word.segments[segIndex].segmentAdvance;
                                    lineGlyphCount += endPos;
                                }

                                if(fDash != -1)
                                {
                                    slicePos = fDash + 1;
                                    sliceSeg  = fDashSeg;
                                }

                                tspanEl.spaceRemoved = false;
                                sliceAdvance = tmpAdvance;
                                lineComplete = true;
                                glyphCount += lineGlyphCount;
                            }
                            else
                            {
                                // Just add word.
                                for(let j = 0; j < word.segments.length; j++)
                                {
                                    let newSec: Section = {
                                        startPos: currentAdvance, glyphs: word.segments[j].glyphs,
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[j].glyphs[0].stringPositions[0]
                                    };

                                    tspanEl.sections.push(newSec);
                                    currentAdvance += word.segments[j].segmentAdvance;
                                    lineGlyphCount += word.segments[j].glyphs.length;
                                }

                                insertSpace = !insertSpace;
                            }
                        }
                    }

                    // Add words and spaces to line until complete.
                    while(!lineComplete && wordIdx < wordCount)
                    {
                        if(insertSpace)
                        {
                            let start = this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength;
                            let end = this.wordData[wordIdx + 1].startPos;
                            let text = this.text.substring(start, end);

                            spaceAdvance = this.processSpaceGlyphs(glyphs, text, start);

                            if(spaceAdvance > this.width)
                            {
                                let tmpAdvance = 0;
                                // Find the point to split
                                for(let j = 0; j < glyphs.length; j++)
                                {
                                    if(tmpAdvance + glyphs[j].xAdvance * 1000 / this.size > this.width)
                                    {
                                        slicePos = j + 1;

                                        if(j + 1 >= glyphs.length)
                                        {
                                            wasSpaceLast = true;
                                        }
                                    }
                                    tmpAdvance += glyphs[j].xAdvance * 1000 / this.size;
                                }

                                numSpaces += slicePos - 1;

                                let newSec: Section = {
                                    startPos: currentAdvance, glyphs: glyphs.slice(0, slicePos - 1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);

                                if(wasSpaceLast)
                                {
                                    slicePos = 0;
                                    insertSpace = !insertSpace;
                                    wordIdx++;
                                    wordNum++;
                                }

                                lineGlyphCount += slicePos - 1;
                                glyphCount += lineGlyphCount + 1;
                                sliceAdvance = tmpAdvance;
                                lineComplete = true;
                            }
                            else
                            {
                                numSpaces += glyphs.length;

                                // Just add spaces.
                                let newSec: Section = {
                                    startPos: currentAdvance, glyphs: glyphs,
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                currentAdvance += spaceAdvance;
                                lineGlyphCount += glyphs.length;
                                insertSpace = !insertSpace;
                            }
                        }
                        else
                        {
                            let word = this.wordData[wordIdx];
                            if(word.wordAdvance > this.width)
                            {
                                let tmpAdvance = 0;
                                let segIndex = 0;
                                // This word will need splitting.
                                let fDash = -1;
                                let fDashSeg = -1;
                                let fDashGlyph;
                                let sections: Array<Section> = [];

                                for(segIndex = 0; segIndex < word.segments.length && tmpAdvance < this.width; segIndex++)
                                {
                                    if(word.segments[segIndex].hasHyphen)
                                    {
                                        let glyphAdvance = 0;
                                        let seg = word.segments[segIndex];
                                        for(let i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[i].xAdvance <= this.width; i++)
                                        {
                                            if(seg.glyphs[i].isHyphen)
                                            {
                                                fDash = i;
                                                fDashSeg = segIndex;
                                            }
                                            glyphAdvance += seg.glyphs[i].xAdvance;
                                        }
                                    }

                                    let endPos = word.segments[segIndex].glyphs.length;
                                    if(tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width)
                                    {
                                        let glyphAdvance = 0;
                                        let seg = word.segments[segIndex];
                                        while(slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[slicePos].xAdvance <= this.width)
                                        {
                                            slicePos++;
                                            sliceSeg = segIndex;
                                            glyphAdvance += seg.glyphs[slicePos].xAdvance;
                                        }
                                        endPos = slicePos;
                                    }

                                    let newSec: Section = {
                                        startPos: tmpAdvance, glyphs: word.segments[segIndex].glyphs.slice(0, endPos),
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[0].stringPositions[0]
                                    };
                                    sections.push(newSec);
                                    lineGlyphCount += endPos;
                                    tmpAdvance += word.segments[segIndex].segmentAdvance;
                                }

                                if(fDash != -1)
                                {
                                    slicePos = fDash + 1;
                                    sliceSeg = fDashSeg;
                                    tspanEl.spaceRemoved = false;
                                    sliceAdvance = tmpAdvance;
                                    glyphCount += lineGlyphCount;
                                    tspanEl.sections.push(...sections);
                                }

                                lineComplete = true;
                            }
                            else
                            {
                                // Just add word.
                                for(let j = 0; j < word.segments.length; j++)
                                {
                                    let newSec: Section = {
                                        startPos: currentAdvance, glyphs: word.segments[j].glyphs,
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[j].glyphs[0].stringPositions[0]
                                    };

                                    tspanEl.sections.push(newSec);
                                    currentAdvance += word.segments[j].segmentAdvance;
                                    lineGlyphCount += word.segments[j].glyphs.length;
                                }

                                insertSpace = !insertSpace;
                            }
                        }
                    }

                    let reqAdjustment = this.width - currentAdvance;
                    let extraSpace = 0;

                    if(tspanEl.justified)
                    {
                        extraSpace = reqAdjustment / numSpaces;
                    }

                    let currentDist = 0;

                    for(let j = 0; j < tspanEl.sections.length; j++)
                    {
                        let sec = tspanEl.sections[j];

                        if(sec.glyphs[0].isSpace)
                        {
                            sec.startPos = currentDist;
                            for(let i = 0; i < sec.glyphs.length; i++)
                            {
                                sec.glyphs[i].xAdvance += extraSpace * this.size / 1000;
                                currentDist += sec.glyphs[i].xAdvance * 1000 / this.size;
                            }
                        }
                        else
                        {
                            let secAdvance = 0;
                            if(j + 1 < tspanEl.sections.length)
                            {
                                secAdvance = tspanEl.sections[j + 1].startPos - sec.startPos;
                            }

                            sec.startPos = currentDist;
                            currentDist += secAdvance;
                        }
                    }

                    tspanEl.endStringPos = currPos;
                    tspanEl.end = tspanEl.start + lineGlyphCount;

                    prevGlyphPos = tspanEl.start + lineGlyphCount + (tspanEl.spaceRemoved ? 1 : 0);

                    if(lineComplete)
                    {
                        childText.push(tspanEl);
                    }

                    lineCount++;
                    currentAdvance = 0;
                }

                let lineEnd = this.text.length;

                if(k + 1 < this.lineData.length)
                {
                    lineEnd = this.linePositions[k + 1];
                }

                // Check for trailing spaces.
                if(!lineComplete && wordCount > 0 && lineEnd > this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength)
                {
                    sliceAdvance = 0;
                    let first = true;
                    let start = this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength;
                    let text = this.text.substring(start, lineEnd);
                    spaceAdvance = this.processSpaceGlyphs(glyphs, text, start);

                    while(prevSlicePos > 0 || first)
                    {
                        first = false;
                        if(spaceAdvance - sliceAdvance > this.width)
                        {
                            let tmpAdvance = 0;
                            // Find the point to split
                            for(let j = prevSlicePos; j < glyphs.length; j++)
                            {
                                if(tmpAdvance + glyphs[j].xAdvance > this.width)
                                {
                                    slicePos = j + 1;

                                    if(j + 1 >= glyphs.length)
                                    {
                                        wasSpaceLast = true;
                                    }
                                }
                                tmpAdvance += glyphs[j].xAdvance;
                            }

                            numSpaces += slicePos - prevSlicePos - 1;

                            let newSec: Section = {
                                startPos: currentAdvance - sliceAdvance, glyphs: glyphs.slice(prevSlicePos, slicePos - 1),
                                startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[prevSlicePos].stringPositions[0] };
                            tspanEl.sections.push(newSec);

                            if(wasSpaceLast)
                            {
                                slicePos = 0;
                                insertSpace = !insertSpace;
                                wordIdx++;
                                wordNum++;
                            }

                            sliceAdvance += tmpAdvance;
                            lineComplete = true;
                        }
                        else
                        {
                            numSpaces += glyphs.length - prevSlicePos;

                            // Just add sliced spaces.
                            let newSec: Section = {
                                startPos: currentAdvance, glyphs: glyphs.slice(prevSlicePos, glyphs.length),
                                startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                            };
                            tspanEl.sections.push(newSec);
                            currentAdvance += (spaceAdvance - sliceAdvance);
                            insertSpace = !insertSpace;
                            wordIdx++;
                            wordNum++;
                        }
                    }
                }

                // Tidy up last line.
                if(!lineComplete)
                {
                    tspanEl.justified = false;

                    // This was the last line so we didnt remove a string character.
                    if(k == this.lines.length - 1)
                    {
                        tspanEl.spaceRemoved = false;
                    }
                }
            }



            // OLD
            /*
            for(let k = 0; k < this.lines.length; k++)
            {
                computedTextLength = 0;

                let startSpace: boolean = this.lines[k].startSpace;
                let wordsT: Array<string> = this.lines[k].words.slice();
                let spacesT: Array<string> = this.lines[k].spaces.slice();
                let wordC: number = 0;
                let spaceC: number = 0;
                let fDash: number;
                let wasSpaceLast: boolean;

                while(wordC < wordsT.length || spaceC < spacesT.length)
                {
                    let numSpaces = 0;
                    let lineComplete: boolean = false;
                    let word: string;
                    let tmpLineGlyphs = [];
                    let dropSpace = false;
                    let stringStart = currPos;
                    let wordStyles = 0;
                    wasSpaceLast = false;

                    currY += dy;
                    let currLength = 0;
                    let tspanEl : TextNode =
                    {
                        x: this.x, y: currY, dx: 0, dy: dy, start: prevGlyphPos, end: 0, endStringPos: 0,
                        spaceRemoved: true, justified: this.isJustified, lineNum: lineCount, glyphs: []
                    };

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

                    // We may be behind on the style position.
                    while(this.styleSet[currStyle].end <= currPos && currStyle < this.styleSet.length - 1)
                    {
                        currStyle++;
                    }

                    while(currStyle < this.styleSet.length && currPos + word.length > this.styleSet[currStyle].end)
                    {
                        this.processGlyphs(glyphRun, this.styleSet[currStyle], word.substring(wordPos, this.styleSet[currStyle].end - currPos), stringStart);

                        stringStart += (this.styleSet[currStyle].end - currPos) - wordPos;
                        wordPos = this.styleSet[currStyle].end - currPos;
                        currStyle++;
                        wordStyles++;
                    }

                    if(currStyle < this.styleSet.length)
                    {
                        this.processGlyphs(glyphRun, this.styleSet[currStyle], word.substring(wordPos, this.styleSet[currStyle].end - currPos), stringStart);
                    }

                    let wordGlyphs = [];
                    let fDash = -1;
                    let fDashGlyph;

                    for(let j = 0; j < glyphRun.positions.length; j++)
                    {
                        let charWidth = (glyphRun.positions[j].xAdvance) * this.size / 1000;

                        if(computedTextLength + charWidth < this.width)
                        {
                            if(glyphRun.glyphs[j].codePoints.length == 1 && isHyphen(glyphRun.glyphs[j].codePoints[0]))
                            {
                                fDash = j;
                                fDashGlyph = wordGlyphs.length;
                            }

                            let wordGlyph = { path: glyphRun.glyphs[j].path, stringPositions: glyphRun.glyphs[j].stringPositions,
                                xAdvance: glyphRun.positions[j].xAdvance, yAdvance: glyphRun.positions[j].yAdvance, xOffset: glyphRun.positions[j].xOffset,
                                yOffset: glyphRun.positions[j].yOffset, isSpace: isSpace, colour: glyphRun.glyphs[j].colour, uline: glyphRun.glyphs[j].uline,
                                oline: glyphRun.glyphs[j].oline, tline: glyphRun.glyphs[j].tline };

                            wordGlyphs.push(wordGlyph);
                            computedTextLength += charWidth;

                            if(isSpace)
                            {
                                numSpaces++;
                            }
                        }
                        else
                        {
                            // When we complete a line we actually need to wind back the style.
                            lineComplete = true;

                            currStyle -= wordStyles;

                            if(fDash != -1)
                            {
                                // Split the string at dash, use the bit before the dash
                                let newStr = word.substring(fDash + 1, word.length);
                                // Insert the new string into the words array after current position
                                // TODO: Just move word index back and change this item.
                                wordsT.splice(wordC, 0, newStr);

                                // TODO: Need to fix up the glyph run too I think.

                                currPos += fDash + 1;
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
                                        // TODO: Just move space index back and change this item.
                                        spacesT.splice(spaceC, 0, word.substring(j + 1, word.length));
                                        currPos += j + 1;
                                    }
                                    else
                                    {
                                        wasSpaceLast = true;
                                        startSpace = !startSpace;
                                        currPos += word.length;
                                    }
                                }
                                else
                                {
                                    // TODO: Just move word index back and change this item.
                                    wordsT.splice(wordC, 0, word.substring(j, word.length));
                                    currPos += j;
                                    tspanEl.spaceRemoved = false;
                                }
                            }
                            break;
                        }
                    }

                    if(!lineComplete)
                    {
                        currPos += word.length;
                        startSpace = !startSpace;
                    }

                    currLength = computedTextLength;
                    tmpLineGlyphs.push(...wordGlyphs);

                    while(!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length))
                    {
                        wordGlyphs = [];
                        stringStart = currPos;
                        wordStyles = 0;

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
                            this.processGlyphs(glyphRun, this.styleSet[currStyle], word.substring(wordPos, this.styleSet[currStyle].end - currPos), stringStart);

                            stringStart += (this.styleSet[currStyle].end - currPos) - wordPos;
                            wordPos = this.styleSet[currStyle].end - currPos;
                            currStyle++;
                            wordStyles++;
                        }

                        if(currStyle < this.styleSet.length)
                        {
                            this.processGlyphs(glyphRun, this.styleSet[currStyle], word.substring(wordPos, this.styleSet[currStyle].end - currPos), stringStart);
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

                                let wordGlyph = { path: glyphRun.glyphs[j].path, stringPositions: glyphRun.glyphs[j].stringPositions,
                                    xAdvance: glyphRun.positions[j].xAdvance, yAdvance: glyphRun.positions[j].yAdvance, xOffset: glyphRun.positions[j].xOffset,
                                    yOffset: glyphRun.positions[j].yOffset, isSpace: isSpace, colour: glyphRun.glyphs[j].colour,
                                    uline: glyphRun.glyphs[j].uline, oline: glyphRun.glyphs[j].oline, tline: glyphRun.glyphs[j].tline };

                                wordGlyphs.push(wordGlyph);
                                tmpLength += charWidth;

                                if(isSpace)
                                {
                                    numSpaces++;
                                }
                            }
                            else
                            {
                                // When we complete a line we actually need to wind back the style.
                                lineComplete = true;
                                currStyle -= wordStyles;

                                if(startSpace)
                                {
                                    if(word.length > j + 1)
                                    {
                                        spacesT[--spaceC] = word.substring(j + 1, word.length);
                                        word = word.substring(0, j);
                                        startSpace = !startSpace;
                                        currPos++;
                                    }
                                    else
                                    {
                                        wasSpaceLast = true;
                                    }
                                }
                                else
                                {
                                    word = '';
                                    wordC--;
                                    startSpace = !startSpace;
                                    tmpLength = computedTextLength;
                                    wordGlyphs = [];
                                    dropSpace = true;
                                }

                                break;
                            }
                        }

                        computedTextLength = tmpLength;
                        currPos += word.length;
                        startSpace = !startSpace;

                        tmpLineGlyphs.push(...wordGlyphs);
                    }

                    if(wordC == wordsT.length && spaceC == spacesT.length && !lineComplete)
                    {
                        tspanEl.justified = false;

                        // This was the last line so we didnt remove a string character.
                        if(k == this.lines.length - 1)
                        {
                            tspanEl.spaceRemoved = false;
                        }
                    }

                    // Drop out the last space glyph and recalculate length.
                    if(dropSpace)
                    {
                        let removedSpace = tmpLineGlyphs.splice(tmpLineGlyphs.length - 1, 1);
                        computedTextLength -= removedSpace[0].xAdvance * this.size / 1000;
                        numSpaces--;
                    }

                    let reqAdjustment = (this.width - computedTextLength) * 1000 / this.size;
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
                            advance: tmpLineGlyphs[i].xAdvance + (tmpLineGlyphs[i].isSpace ? extraSpace : 0),
                            colour: tmpLineGlyphs[i].colour, uline: tmpLineGlyphs[i].uline, oline: tmpLineGlyphs[i].oline, tline: tmpLineGlyphs[i].tline
                        };

                        currentDist += tmpLineGlyphs[i].xAdvance;

                        if(tmpLineGlyphs[i].isSpace)
                        {
                            currentDist += extraSpace;
                        }

                        lineGlyphs.push(newGlyph);
                    }

                    tspanEl.glyphs = lineGlyphs;
                    tspanEl.endStringPos = currPos;
                    tspanEl.end = tspanEl.start + lineGlyphs.length;

                    prevGlyphPos = tspanEl.start + lineGlyphs.length + (tspanEl.spaceRemoved ? 1 : 0);
                    glyphCount += lineGlyphs.length + (tspanEl.spaceRemoved ? 1 : 0);

                    childText.push(tspanEl);

                    lineCount++;
                    computedTextLength = 0;
                }

                if(wasSpaceLast)
                {
                    currY += dy;

                    // Insert an empty line.
                    let tspanEl : TextNode =
                    {
                        x: this.x, y: currY, dx: 0, dy: dy, start: prevGlyphPos, end: prevGlyphPos, endStringPos: currPos,
                        spaceRemoved: false, justified: false, lineNum: lineCount, glyphs: []
                    };

                    childText.push(tspanEl);

                    lineCount++;
                }

                // A return character separated this line so take it into account.
                currPos++;
            }
            */

            if(lineCount * 2 * this.size > this.height)
            {
                this.resize(this.width, lineCount * 2 * this.size, new Date());
                this.hasResized = true;
            }

            this.textNodes = childText;
            this.glyphCount = glyphCount;


            console.log('Glyph count is: ' + glyphCount + '. New text nodes are: ');
            console.log(this.textNodes);
            return true;
        }

        /**
         *
         *
         */
        private processGlyphs(glyphs: Array<GlyphData>, style: TextStyle, word: string, stringStart: number)
        {
            let fontSet = 'NORMAL';

            if(style.weight == 'bold')
            {
                if(style.style == 'italic')
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
                if(style.style == 'italic')
                {
                    fontSet = 'ITALIC';
                }
            }

            let hasHyphen = false;
            let tempGlyphs;

            if(fontHelper[fontSet] == null || fontHelper[fontSet] == undefined)
            {
                let callback = () =>
                {
                    if(!this.isDeleted)
                    {
                        // TODO: Adjust cursor start and end after replacement of tofu.
                        console.log("Width now is: " + this.width);


                        this.calculateTextLines();

                        if(this.isSelected)
                        {
                            this.findCursorElems();
                        }

                        this.updateView(
                        {
                            textNodes: this.textNodes, width: this.width, height: this.height,
                            cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                        });

                        this.updateBoardView(this.currentViewState);
                    }
                };

                if(loadingFonts[fontSet] === true)
                {
                    if(this.waitingForFont[fontSet] == null || this.waitingForFont[fontSet] == undefined)
                    {
                        let callbackID = loadCallbacks[fontSet].length;
                        loadCallbacks[fontSet][callbackID] = callback;
                        this.waitingForFont[fontSet] = callbackID;
                    }
                }
                else
                {
                    let callbackID = this.getAdditionalFont(fontSet, callback);
                    this.waitingForFont[fontSet] = callbackID;
                }

                // Add TOFU in place of font glyphs.
                tempGlyphs = { glyphs: [], positions: [] };

                for(let i = 0; i < word.length; i++)
                {
                    tempGlyphs.glyphs[i] =
                    {
                        id: 0, advanceWidth: 1229, advanceHeight: 2789, isLigature: false, isMark: false, codePoints: [-1],
                        path: 'M193 1462L1034 1462L1034 0L193 0ZM297 104L930 104L930 1358L297 1358Z', stringPositions: [i]
                    };

                    tempGlyphs.positions[i] =
                    {
                        xAdvance: 1229, xOffset: 0, yAdvance: 0, yOffset: 0
                    }
                }
            }
            else
            {
                tempGlyphs = fontHelper[fontSet].layout(word);
            }

            let currentStyle = style;
            let startAdvance = 0;

            for(let i = 0; i < tempGlyphs.glyphs.length; i++)
            {
                if(style.end < tempGlyphs.glyphs[i].stringPositions[0] + stringStart)
                {
                    let nxtIdx = currentStyle.seq_num + 1;
                    currentStyle = this.styleSet[nxtIdx];
                }

                let isHyph = false;
                if(tempGlyphs.glyphs[i].codePoints.length == 1 && isHyphen(tempGlyphs.glyphs[i].codePoints[0]))
                {
                    isHyph = true;
                    hasHyphen = true;
                }

                let newGlyph: GlyphData = {
                    isLigature: tempGlyphs.glyphs[i].isLigature, isMark: tempGlyphs.glyphs[i].isMark, startAdvance: startAdvance,
                    codePoints: tempGlyphs.glyphs[i].codePoints, path: tempGlyphs.glyphs[i].path, stringPositions: tempGlyphs.glyphs[i].stringPositions,
                    colour: style.colour, uline: style.uline, oline: style.oline, tline: style.tline, xAdvance: tempGlyphs.positions[i].xAdvance,
                    yAdvance: tempGlyphs.positions[i].yAdvance, xOffset: tempGlyphs.positions[i].xOffset, yOffset: tempGlyphs.positions[i].yOffset,
                    isSpace: false, isHyphen: isHyph
                };

                // TODO: Vertical Text
                startAdvance += newGlyph.xAdvance;


                glyphs[i] = newGlyph;

                for(let j = 0; j < tempGlyphs.glyphs[i].stringPositions.length; j++)
                {
                    tempGlyphs.glyphs[i].stringPositions[j] += stringStart;
                }
            }

            return hasHyphen;
        }

        /**
         *
         *
         */
        private processSpaceGlyphs(glyphs: Array<GlyphData>, word: string, stringStart: number)
        {
            let tempGlyphs = { glyphs: [], positions: [] };
            let advance = 0;

            for(let i = 0; i < word.length; i++)
            {
                if(word.charAt(i) == '\t')
                {
                    glyphs[i] =
                    {
                        xAdvance: 2128, xOffset: 0, yAdvance: 0, yOffset: 0, startAdvance: advance,
                        isLigature: false, isMark: false, codePoints: [9], path: '', stringPositions: [i],
                        colour: null, uline: null, oline: null, tline: null, isSpace: true, isHyphen: false
                    };
                }
                else
                {
                    glyphs[i] =
                    {
                        xAdvance: 532, xOffset: 0, yAdvance: 0, yOffset: 0, startAdvance: advance,
                        isLigature: false, isMark: false, codePoints: [9], path: '', stringPositions: [i],
                        colour: null, uline: null, oline: null, tline: null, isSpace: true, isHyphen: false
                    };
                }

                for(let j = 0; j < glyphs[i].stringPositions.length; j++)
                {
                    glyphs[i].stringPositions[j] += stringStart;
                }
                advance += glyphs[i].xAdvance;
            }

            return advance;
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

            if(line.sections.length == 0)
            {
                return line.start;
            }

            i = 0;
            while(i < line.sections.length && this.idealX >= line.sections[i].startPos)
            {
                i++;
            }

            let secIdx = i - 1;
            let sec = line.sections[secIdx];

            i = 0;
            while(i < sec.glyphs.length && this.idealX >= (sec.startPos + sec.glyphs[i].startAdvance) * this.size / 1000)
            {
                i++;
            }

            let curr = i - 1;
            let glyph = sec.glyphs[curr];

            // i and currMes is now the position to the right of the search point.
            // We just need to check if left or right is closer then reurn said point.
            let selPoint;

            let glyphStart = sec.startPos + glyph.startAdvance * this.size / 1000;
            let glyphEnd = glyphStart + glyph.xAdvance * this.size / 1000;
            if(this.idealX - glyphStart > glyphEnd - this.idealX)
            {
                selPoint = line.start + curr + 1;
            }
            else
            {
                selPoint = line.start + curr;
            }

            return selPoint;
        }

        /**
         *
         *
         */
        private isCurrentStyle(style: Style, pallete: Pallete)
        {
            if(style.colour == pallete.colour && style.oline == pallete.isOverline() && style.uline == pallete.isUnderline() &&
                style.tline == pallete.isThroughline() && style.weight == pallete.getWeight() && style.style == pallete.getStyle())
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
         * @param soretedSelect  The selection to remove sorted in reverse order.
         */
        private removeSelection(sortedSelect: Array<number>)
        {
            for(let i = 0; i < sortedSelect.length; i++)
            {
                // Remove all selected characters and shift style positions.
                this.removeCharacter(sortedSelect[i]);
            }
        }

        /**
         *
         * This method might be a bit slow as it removes each character individually. TODO: Check for slow behaviour and resolve if necessary.
         */
        private removeCharacter(index: number)
        {
            this.text = this.text.substring(0, index) + this.text.substring(index + 1, this.text.length);

            let newStyles: Array<TextStyle> = [];

            for(let i = 0; i < this.styleSet.length; i++)
            {
                let sty = this.styleSet[i];

                let styEnd = sty.end;
                let styStart = sty.start;
                // Move the end back if necessary.
                if(styEnd > index)
                {
                    styEnd--;
                }

                // Move the start back if necessary.
                if(styStart > index)
                {
                    styStart--;
                }


                // Don't push this style onto the new set if it has been removed.
                if(styStart != index || styEnd != index)
                {
                    // Check to see if we can just extend last style pushed onto new styles.
                    if(newStyles.length > 0 && this.stylesMatch(newStyles[newStyles.length - 1], sty)
                        && newStyles[newStyles.length - 1].end - newStyles[newStyles.length - 1].start + styEnd - styStart <= MAX_STYLE_LENGTH)
                    {
                        // If this is the same as the previous style and are length compatible then combine
                        newStyles[newStyles.length - 1].end += styEnd - styStart;
                        newStyles[newStyles.length - 1].text = this.text.slice(newStyles[newStyles.length - 1].start, newStyles[newStyles.length - 1].end);
                    }
                    else
                    {
                        // Push this style onto the new stack
                        newStyles.push(
                        {
                            start: styStart, end: styEnd, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                            style: sty.style, weight: sty.weight, text: this.text.slice(styStart, styEnd), seq_num: newStyles.length
                        });
                    }
                }

            }

            this.styleSet = newStyles;
        }

        /**
         *
         *
         */
        private stylesMatch(style1: Style, style2: Style)
        {
            return style1.colour == style2.colour && style1.oline == style2.oline && style1.uline == style2.uline && style1.tline == style2.tline
                && style1.weight == style2.weight;
        }

        /**
         *
         *
         */
        private insertText(text: string, newStyle: Style)
        {
            // Now Insert the string at the stringStart position.
            let isNew = true;
            let textStart = this.text.slice(0, this.stringStart);
            let textEnd = this.text.slice(this.stringStart, this.text.length);
            let styles: Array<TextStyle> = [];

            let fullText = textStart + text + textEnd;

            let hasInserted = false;
            let newSty: TextStyle = null;

            // Create new style set.
            for(let i = 0; i < this.styleSet.length; i++)
            {
                let sty = this.styleSet[i];

                if(sty.start >= this.stringStart)
                {
                    if(!hasInserted)
                    {
                        if(text.length <= MAX_STYLE_LENGTH)
                        {
                            // Insert the new style
                            styles.push(
                            {
                                start: this.stringStart, end: this.stringStart + text.length, colour: newStyle.colour, oline: newStyle.oline,
                                uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                text: fullText.slice(this.stringStart, this.stringStart + text.length), seq_num: styles.length
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
                                    start: this.stringStart + prevStart, end: this.stringStart + splitArray[j],colour: newStyle.colour,
                                    oline: newStyle.oline, uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                    text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), seq_num: styles.length
                                });

                                prevStart = splitArray[j];
                            }
                        }
                        newSty = styles[styles.length - 1];
                        hasInserted = true;
                    }

                    // Completely after selection
                    if(styles.length > 0 && this.stylesMatch(styles[styles.length - 1], sty)
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
                            start: sty.start + text.length, end: sty.end + text.length, colour: sty.colour, oline: sty.oline, uline: sty.uline,
                            tline: sty.tline, style: sty.style, weight: sty.weight, text: fullText.slice(sty.start + text.length, sty.end + text.length),
                            seq_num: styles.length
                        });
                    }
                }
                else
                {
                    if(sty.end < this.stringStart)
                    {
                        // Completely before selection
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push(
                        {
                            start: sty.start, end: sty.end, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                            style: sty.style, weight: sty.weight, text: sty.text, seq_num: styles.length
                        });
                    }
                    else
                    {
                        // Split by selection
                        if(this.stylesMatch(sty, newStyle))
                        {
                            if(sty.end - sty.start + text.length <= MAX_STYLE_LENGTH)
                            {
                                styles.push(
                                {
                                    start: sty.start, end: sty.end + text.length, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                                    style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, sty.end + text.length), seq_num: styles.length
                                });
                            }
                            else
                            {
                                // New Style would be too long so split it up.
                                let splitArray = this.getStyleSplits(sty.end - sty.start + text.length);
                                let prevStart = 0;

                                for(let j = 0; j < splitArray.length; j++)
                                {
                                    styles.push(
                                    {
                                        start: sty.start + prevStart, end: sty.start + splitArray[j], colour: sty.colour,
                                        oline: sty.oline, uline: sty.uline, tline: sty.tline, style: sty.style, weight: sty.weight,
                                        text: fullText.slice(sty.start + prevStart, sty.start + prevStart + splitArray[j]), seq_num: styles.length
                                    });

                                    prevStart = splitArray[j];
                                }
                            }

                            newSty = styles[styles.length - 1];
                            hasInserted = true;
                        }
                        else
                        {
                            // Style before the new split
                            styles.push(
                            {
                                start: sty.start, end: this.stringStart, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                                style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, this.stringStart), seq_num: styles.length
                            });

                            if(text.length <= MAX_STYLE_LENGTH)
                            {
                                // Insert the new style
                                styles.push(
                                {
                                    start: this.stringStart, end: this.stringStart + text.length, colour: newStyle.colour, oline: newStyle.oline,
                                    uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                    text: fullText.slice(this.stringStart, this.stringStart + text.length), seq_num: styles.length
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
                                        start: this.stringStart + prevStart, end: this.stringStart + splitArray[j], colour: newStyle.colour,
                                        oline: newStyle.oline, uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                        text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), seq_num: styles.length
                                    });

                                    prevStart = splitArray[j];
                                }
                            }

                            newSty = styles[styles.length - 1];
                            hasInserted = true;

                            if(this.stringStart != sty.end)
                            {
                                // Style after the new split
                                styles.push(
                                {
                                    start: this.stringStart + text.length, end: sty.end + text.length, colour: sty.colour, oline: sty.oline,
                                    uline: sty.uline, tline: sty.tline, style: sty.style, weight: sty.weight,
                                    text: fullText.slice(this.stringStart + text.length, sty.end + text.length), seq_num: styles.length
                                });
                            }
                        }
                    }
                }
            }

            if(!hasInserted)
            {
                // Insert the new style at the end of the list.
                if(text.length <= MAX_STYLE_LENGTH)
                {
                    // Insert the new style
                    styles.push(
                    {
                        start: this.stringStart, end: this.stringStart + text.length, colour: newStyle.colour, oline: newStyle.oline,
                        uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                        text: fullText.slice(this.stringStart, this.stringStart + text.length), seq_num: styles.length
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
                            start: this.stringStart + prevStart, end: this.stringStart + splitArray[j], colour: newStyle.colour,
                            oline: newStyle.oline, uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                            text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), seq_num: styles.length
                        });

                        prevStart = splitArray[j];
                    }
                }

                newSty = styles[styles.length - 1];
            }

            this.text = fullText;
            this.styleSet = styles;

            return newSty;
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
                slices.push(length - lengthCount < MAX_STYLE_LENGTH ? length : MAX_STYLE_LENGTH);
                lengthCount += length - lengthCount < MAX_STYLE_LENGTH ? length - lengthCount : MAX_STYLE_LENGTH;
            }

            console.log("Split array for long style is: ");
            console.log(slices);

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
        private completeEdit(userId: number, editId: number)
        {
            let fullText = '';
            let editData = this.editInBuffer[userId][editId];

            for(let i = 0; i < editData.styles.length; i++)
            {
                this.styleSet[editData.styles[i].seq_num] = editData.styles[i];
            }

            for(let i = 0; i < this.styleSet.length; i++)
            {
                fullText += this.styleSet[i].text;
            }

            this.text = fullText;

            this.generateLines();
            this.calculateTextLines();

            if(this.isSelected)
            {
                this.findCursorElems();
            }

            this.updateView(
            {
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
        }

        /**
         *
         *
         */
        private textEdited()
        {
            let editNum = this.editNum++;

            this.editOutBuffer[editNum] = [];

            for(let i = 0; i < this.styleSet.length; i++)
            {
                this.editOutBuffer[editNum].push(this.styleSet[i]);
            }

            let payload: UserEditMessage = { bufferId: editNum, num_styles: this.editOutBuffer[editNum].length, nodes: this.editOutBuffer[editNum] };
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
            let newStringStart = null;

            if(this.textNodes.length == 0)
            {
                this.stringStart = 0;
                return;
            }

            for(let i = 0; i < this.textNodes.length; i++)
            {
                let line = this.textNodes[i];

                if(this.cursorEnd < line.start)
                {
                    this.stringStart = newStringStart;
                    return;
                }

                if(line.end >= this.cursorStart)
                {
                    let largestStringPos = 0;

                    if(i > 0)
                    {
                        largestStringPos = this.textNodes[i-1].endStringPos;
                    }

                    for(let j = 0; j < line.sections.length; j++)
                    {
                        let sec = line.sections[j];

                        if(this.cursorStart < line.start + sec.startGlyph + sec.glyphs.length && this.cursorEnd > line.start + sec.startGlyph)
                        {
                            // There is a special catch for the final glyph here, when the cursor is at the end of text we need the next glyph back.
                            for(let gPos = this.cursorStart - 1 > line.start ? this.cursorStart - 1 - line.start : 0; gPos < sec.glyphs.length; gPos++)
                            {
                                let glyph = sec.glyphs[gPos];

                                if(line.start + sec.startGlyph + j >= this.cursorStart && line.start + sec.startGlyph + j <= this.cursorEnd)
                                {
                                    for(let k = 0; k < glyph.stringPositions.length; k++)
                                    {
                                        if(newStringStart ==  null || glyph.stringPositions[k] < newStringStart)
                                        {
                                            newStringStart = glyph.stringPositions[k];
                                        }

                                        if(glyph.stringPositions[k] > largestStringPos)
                                        {
                                            largestStringPos = glyph.stringPositions[k];
                                        }

                                        if(found[glyph.stringPositions[k]] === undefined && line.start + j != this.cursorEnd)
                                        {
                                            found[glyph.stringPositions[k]] = true;
                                            this.selectedCharacters.push(glyph.stringPositions[k]);
                                        }
                                    }
                                }
                                else if(line.start + j == this.cursorStart - 1)
                                {
                                    for(let k = 0; k < glyph.stringPositions.length; k++)
                                    {
                                        if(glyph.stringPositions[k] > largestStringPos)
                                        {
                                            largestStringPos = glyph.stringPositions[k];
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if(line.end == this.cursorStart)
                    {
                        newStringStart = largestStringPos + 1;
                    }

                    // If there is a space removed and the end selection is after this line, add the space string position.
                    if(this.cursorEnd > line.end && line.spaceRemoved)
                    {
                        if(line.sections.length == 0)
                        {
                            if(found[largestStringPos] === undefined)
                            {
                                found[largestStringPos] = true;
                                this.selectedCharacters.push(largestStringPos);
                            }
                        }
                        else
                        {
                            if(found[largestStringPos + 1] === undefined)
                            {
                                found[largestStringPos + 1] = true;
                                this.selectedCharacters.push(largestStringPos + 1);
                            }
                        }
                    }
                }
                else if(i == this.textNodes.length - 1)
                {
                    // This was the last line but the cursor is after it (this happens when there was a space removed) we can cheat because it is at the end.
                    newStringStart = this.text.length;
                }
            }

            this.stringStart = newStringStart;
        }

        /**
         *
         *
         */
        private wordMerger(undoStart: number, undoEnd: number)
        {
            // Merge letter undo/redos into word undo redos beyond previous word.
            if(this.prevWordStart != null && this.prevWordEnd != null)
            {
                let newOp = { undo: this.operationStack[undoStart].undo, redo: this.operationStack[undoEnd - 1].redo };

                this.cursorUndoPositions[undoStart].end = this.cursorUndoPositions[undoEnd - 1].end;
                this.cursorUndoPositions[undoStart].bStart = this.cursorUndoPositions[undoEnd - 1].bStart;


                let diff = 0;
                for(let i = 1; i < undoEnd - undoStart; i++)
                {
                    diff += this.cursorUndoPositions[undoStart + i].prevEnd - this.cursorUndoPositions[undoStart + i].start;
                }

                this.cursorUndoPositions[undoStart].prevEnd += diff;

                this.cursorRedoPositions[undoEnd - 1].start = this.cursorRedoPositions[undoStart].start;
                this.cursorRedoPositions[undoEnd - 1].bPrevEnd = this.cursorRedoPositions[undoStart].bPrevEnd;

                this.operationStack.splice(undoStart, undoEnd - undoStart, newOp);
                this.cursorUndoPositions.splice(undoStart + 1, undoEnd - undoStart - 1);
                this.cursorRedoPositions.splice(undoStart, undoEnd - undoStart - 1);

                this.prevWordEnd = this.wordEnd - (undoEnd - undoStart - 1);
                this.prevWordStart = this.wordStart - (undoEnd - undoStart - 1) ;
                this.operationPos -= undoEnd - undoStart - 1;

                if(this.lastFowardEdit != null)
                {
                    this.lastFowardEdit -= undoEnd - undoStart - 1;
                }
            }
            else
            {

                this.prevWordEnd = this.wordEnd;
                this.prevWordStart = this.wordStart;
            }

            // If there is more than one non-consecutive space, push through again.

            this.wordStart = this.operationPos;
            this.wordEnd = this.wordStart;

        }

        /**
         *
         *
         */
        private getAdditionalFont(fontSet: string, callback: () => void)
        {
            loadingFonts[fontSet] = true;
            loadCallbacks[fontSet] = [];
            let callbackID = loadCallbacks[fontSet].length;

            if(callback != null)
            {
                loadCallbacks[fontSet][callbackID] = callback;
            }

            let req = self.indexedDB.open("fonts", 1);

            req.onsuccess = (event: any) =>
            {
                let db = event.target.result as IDBDatabase;

                let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");

                let normReq = fontObjectStore.get(fontSet);

                normReq.onerror = (event) =>
                {
                    // TODO: Handle errors!
                    console.log("Was error.");
                };
                normReq.onsuccess = (event) =>
                {
                    if(normReq.result == null || normReq.result == undefined)
                    {
                        let normReqExt = new XMLHttpRequest();
                        normReqExt.open("GET", fontList[fontSet].file, true);
                        normReqExt.responseType = "arraybuffer";

                        normReqExt.onload = (oEvent) =>
                        {
                            let arrayBuffer = normReqExt.response;

                            let buffer = new NodeBuffer.Buffer(arrayBuffer);
                            fontHelper[fontSet] = fontkit.create(buffer);

                            for(let i = 0; i < loadCallbacks[fontSet].length; i++)
                            {
                                loadCallbacks[fontSet][i]();
                            }

                            let fontData = { fontName: fontSet, fontBuffer: arrayBuffer };

                            let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
                            let req = fontObjectStore.put(fontData);

                            req.onerror = (event) =>
                            {
                                // Handle errors!
                                console.log("Was error.");
                            };
                        };

                        normReqExt.send(null);
                    }
                    else
                    {
                        let font = normReq.result.fontBuffer;

                        if(font != null)
                        {
                            let arrayBuffer = normReq.result.fontBuffer;
                            let buffer = new NodeBuffer.Buffer(arrayBuffer);
                            fontHelper[fontSet] = fontkit.create(buffer);

                            for(let i = 0; i < loadCallbacks[fontSet].length; i++)
                            {
                                loadCallbacks[fontSet][i]();
                            }
                        }
                        else
                        {
                            // TODO: Generally shouldn't happen but should handle it.
                            console.log("Was null.");
                        }
                    }
                };
            };

            /* TODO: Handle these errors, may need to tell user to close and open tab. Also make sure upgrade needed has completed. */
            req.onerror = (event: any) =>
            {
                console.error("Database error: " + event.target.errorCode);
            };
            req.onupgradeneeded = (event: any) =>
            {
                console.log("IndexedDB error.");
            };

            return callbackID;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let fontList = [];

// Amazon Code.
/*
fontList['NORMAL'] = { file: "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Regular.ttf", ver: 1, style: "NORMAL" };
fontList['BOLD'] = { file: "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Bold.ttf", ver: 1, style: "BOLD" };
fontList['ITALIC'] = { file: "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Italic.ttf", ver: 1, style: "ITALIC" };
fontList['BOLDITALIC'] = { file: "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-BoldItalic.ttf", ver: 1, style: "BOLDITALIC" };
*/

// Google Code
fontList['NORMAL'] = { file: "https://wittylizard-168912.appspot.com/Fonts/NotoSans-Regular.ttf", ver: 1, style: "NORMAL" };
fontList['BOLD'] = { file: "https://wittylizard-168912.appspot.com/Fonts/NotoSans-Bold.ttf", ver: 1, style: "BOLD" };
fontList['ITALIC'] = { file: "https://wittylizard-168912.appspot.com/Fonts/NotoSans-Italic.ttf", ver: 1, style: "ITALIC" };
fontList['BOLDITALIC'] = { file: "https://wittylizard-168912.appspot.com/Fonts/NotoSans-BoldItalic.ttf", ver: 1, style: "BOLDITALIC" };


let fontHelper = [];
let loadCallbacks: Array<Array<() => void>> = [];
let loadingFonts: Array<boolean> = [];

// Always load the basic latin font set.
loadingFonts['NORMAL'] = true;
loadCallbacks['NORMAL'] = [];
loadingFonts['BOLD'] = true;
loadCallbacks['BOLD'] = [];
loadingFonts['ITALIC'] = true;
loadCallbacks['ITALIC'] = [];
loadingFonts['BOLDITALIC'] = true;
loadCallbacks['BOLDITALIC'] = [];

let getFont = (fontName: string, fontObjectStore, db) =>
{
    let req = fontObjectStore.get(fontName);

    req.onerror = (event) =>
    {
        // Handle errors!
        console.log("Was error.");
    };
    req.onsuccess = (event) =>
    {
        if(req.result == null || req.result == undefined)
        {
            let normReqExt = new XMLHttpRequest();
            normReqExt.open("GET", fontList[fontName].file, true);
            normReqExt.responseType = "arraybuffer";

            normReqExt.onload = (oEvent) =>
            {
                let arrayBuffer = normReqExt.response;

                let buffer = new NodeBuffer.Buffer(arrayBuffer);
                fontHelper[fontName] = fontkit.create(buffer);
                for(let i = 0; i < loadCallbacks[fontName].length; i++)
                {
                    loadCallbacks[fontName][i]();
                }

                let fontData = { fontName: fontName, fontBuffer: arrayBuffer };

                let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
                let req = fontObjectStore.put(fontData);

                req.onerror = (event) =>
                {
                    // Handle errors!
                    console.log("Was error.");
                };
            };

            normReqExt.send(null);
        }
        else
        {
            let font = req.result.fontBuffer;

            if(font != null)
            {
                let arrayBuffer = req.result.fontBuffer;
                let buffer = new NodeBuffer.Buffer(arrayBuffer);
                fontHelper[fontName] = fontkit.create(buffer);
                for(let i = 0; i < loadCallbacks[fontName].length; i++)
                {
                    loadCallbacks[fontName][i]();
                }
            }
            else
            {
                // TODO: Generally shouldn't happen but should handle it.
                console.log("Was null.");
            }
        }
    };
}

let req = self.indexedDB.open("fonts", 1);

req.onsuccess = (event: any) =>
{
    let db = event.target.result as IDBDatabase;

    let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");

    getFont("NORMAL", fontObjectStore, db);
    getFont("BOLD", fontObjectStore, db);
    getFont("ITALIC", fontObjectStore, db);
    getFont("BOLDITALIC", fontObjectStore, db);
};

req.onerror = (event: any) =>
{
    console.error("Database error: " + event.target.errorCode);
};

req.onupgradeneeded = (event: any) =>
{
    let db = event.target.result as IDBDatabase;

    let objectStore = db.createObjectStore("font-files", { keyPath: "fontName" });

    objectStore.transaction.oncomplete = (event) =>
    {
        // Store values in the newly created objectStore.
        // Set here


        let normReq = new XMLHttpRequest();
        normReq.open("GET", fontList['NORMAL'].file, true);
        normReq.responseType = "arraybuffer";

        normReq.onload = (oEvent) =>
        {
            let arrayBuffer = normReq.response;

            let buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['NORMAL'] = fontkit.create(buffer);
            for(let i = 0; i < loadCallbacks['NORMAL'].length; i++)
            {
                loadCallbacks['NORMAL'][i]();
            }

            let fontData = { fontName: 'NORMAL', fontBuffer: arrayBuffer };

            let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            let req = fontObjectStore.put(fontData);

            req.onerror = (event) =>
            {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = (event) =>
            {
                console.log('Successfully added normal font to database.');
            };
        };

        normReq.send(null);

        let boldReq = new XMLHttpRequest();
        boldReq.open("GET", fontList['BOLD'].file, true);
        boldReq.responseType = "arraybuffer";


        boldReq.onload = function(oEvent)
        {
            let arrayBuffer = boldReq.response;

            let buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['BOLD'] = fontkit.create(buffer);
            for(let i = 0; i < loadCallbacks['BOLD'].length; i++)
            {
                loadCallbacks['BOLD'][i]();
            }

            let fontData = { fontName: 'BOLD', fontBuffer: arrayBuffer };

            let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            let req = fontObjectStore.put(fontData);

            req.onerror = (event) =>
            {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = (event) =>
            {
                console.log('Successfully added BOLD font to database.');
            };
        };

        boldReq.send(null);

        let italReq = new XMLHttpRequest();
        italReq.open("GET", fontList['ITALIC'].file, true);
        italReq.responseType = "arraybuffer";


        italReq.onload = function(oEvent)
        {
            let arrayBuffer = italReq.response;

            let buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['ITALIC'] = fontkit.create(buffer);
            for(let i = 0; i < loadCallbacks['ITALIC'].length; i++)
            {
                loadCallbacks['ITALIC'][i]();
            }

            let fontData = { fontName: 'ITALIC', fontBuffer: arrayBuffer };

            let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            let req = fontObjectStore.put(fontData);

            req.onerror = (event) =>
            {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = (event) =>
            {
                console.log('Successfully added ITALIC font to database.');
            };
        };

        italReq.send(null);

        let boldItalReq = new XMLHttpRequest();
        boldItalReq.open("GET", fontList['BOLDITALIC'].file, true);
        boldItalReq.responseType = "arraybuffer";


        boldItalReq.onload = function(oEvent)
        {
            let arrayBuffer = boldItalReq.response;

            let buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['BOLDITALIC'] = fontkit.create(buffer);
            for(let i = 0; i < loadCallbacks['BOLDITALIC'].length; i++)
            {
                loadCallbacks['BOLDITALIC'][i]();
            }

            let fontData = { fontName: 'BOLDITALIC', fontBuffer: arrayBuffer };

            let fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            let req = fontObjectStore.put(fontData);

            req.onerror = (event) =>
            {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = (event) =>
            {
                console.log('Successfully added BOLDITALIC font to database.');
            };
        };

        boldItalReq.send(null);
    }
};

req.onblocked = () =>
{
    // This will occur when another tab is open, ask user to close.
    console.error("Database is locked but needs upgrading.");
};

declare let fontkit: {
    create: (buff) => any
};

declare let NodeBuffer: {
    Buffer;
};



registerComponent(WhiteBoardText.MODENAME, WhiteBoardText.Element, WhiteBoardText.Pallete);
