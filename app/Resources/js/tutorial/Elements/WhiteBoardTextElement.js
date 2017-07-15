var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/** A helper function to determine if a codepoint should be treated as a grammatical hyphen.
 *
 *
 */
var isHyphen = function (codePoint) {
    switch (codePoint) {
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
var WhiteBoardText;
(function (WhiteBoardText) {
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
    WhiteBoardText.MODENAME = 'TEXT';
    /**
     * The set of possible colours for free curves.
     * Used in interfacing between component view and state.
     */
    var PalleteColour = {
        BLACK: 'black',
        BLUE: 'blue',
        RED: 'red',
        GREEN: 'green'
    };
    /**
     * The set of possible sizes for free curves.
     * Used in interfacing between component view and state.
     */
    var PalleteSize = {
        XSMALL: 2.0,
        SMALL: 5.0,
        MEDIUM: 10.0,
        LARGE: 20.0
    };
    /**
     * Message types that can be sent between the user and server.
     */
    var MessageTypes = {
        NODE: 1,
        MISSED: 2,
        JUSTIFY: 3,
        EDIT: 4,
        COMPLETE: 5,
        DROPPED: 6,
        IGNORE: 7,
        SIZECHANGE: 8
    };
    var MAX_STYLE_LENGTH = 200;
    var MAX_SEGEMENT_LENGTH = 63;
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
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            var _this = _super.call(this) || this;
            _this.baseSize = PalleteSize.MEDIUM;
            _this.colour = 'black';
            _this.isBold = false;
            _this.isItalic = false;
            _this.isOLine = false;
            _this.isTLine = false;
            _this.isULine = false;
            _this.currentViewState = { colour: PalleteColour.BLACK, size: PalleteSize.MEDIUM };
            return _this;
        }
        Pallete.prototype.getCurrentViewState = function () {
            return this.currentViewState;
        };
        Pallete.prototype.getCursor = function () {
            var cursorType;
            var cursorColour;
            cursorType = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };
            return cursorType;
        };
        Pallete.prototype.getColour = function () {
            return this.colour;
        };
        Pallete.prototype.getStyle = function () {
            return this.isItalic ? 'italic' : 'normal';
        };
        Pallete.prototype.getWeight = function () {
            return this.isBold ? 'bold' : 'normal';
        };
        Pallete.prototype.isOverline = function () {
            return this.isOLine;
        };
        Pallete.prototype.isUnderline = function () {
            return this.isULine;
        };
        Pallete.prototype.isThroughline = function () {
            return this.isTLine;
        };
        Pallete.prototype.handleChange = function (change) {
            if (change.type == 0 /* COLOUR */) {
                this.colour = change.data;
                this.updateView({ colour: change.data });
            }
            else if (change.type == 1 /* SIZE */) {
                this.baseSize = change.data;
                this.updateView({ size: change.data });
            }
            else if (change.type == 2 /* BOLD */) {
                this.isBold = change.data;
                this.updateView({ isBold: change.data });
            }
            else if (change.type == 3 /* ITALIC */) {
                this.isItalic = change.data;
                this.updateView({ isItalic: change.data });
            }
            else if (change.type == 4 /* UNDERLINE */) {
                this.isULine = change.data;
                this.updateView({ isULine: change.data });
            }
            else if (change.type == 6 /* OVERLINE */) {
                this.isOLine = change.data;
                this.updateView({ isOLine: change.data });
            }
            else if (change.type == 5 /* THROUGHLINE */) {
                this.isTLine = change.data;
                this.updateView({ isTLine: change.data });
            }
            else if (change.type == 7 /* JUSTIFIED */) {
                this.isJustified = change.data;
                this.updateView({ isJustified: change.data });
            }
            else if (change.type == 8 /* TEXTCHANGE */) {
                var dataIn = change.data;
                this.colour = dataIn.colour;
                this.isBold = dataIn.isBold;
                this.isItalic = dataIn.isItalic;
                this.isULine = dataIn.isULine;
                this.isOLine = dataIn.isOLine;
                this.isTLine = dataIn.isTLine;
                this.updateView({
                    colour: dataIn.colour, isBold: dataIn.isBold, isItalic: dataIn.isItalic,
                    isULine: dataIn.isULine, isOLine: dataIn.isOLine, isTLine: dataIn.isTLine
                });
            }
            else {
                console.error('Unrecognized pallete change type.');
            }
            return this.currentViewState;
        };
        return Pallete;
    }(BoardPallete));
    WhiteBoardText.Pallete = Pallete;
    /** Free Curve Whiteboard Element.
    *
    * This is the class that will be used to store the state and control elements of this component.
    *
    */
    var Element = (function (_super) {
        __extends(Element, _super);
        /**   Create the element as per the supplied parameters.
        *
        *     @return Element The new element created as per the supplied parameters
        */
        function Element(id, userId, x, y, width, height, callbacks, size, isJustified, num_styles, styles, editLock, lockedBy, isEditing, serverId, updateTime) {
            var _this = _super.call(this, WhiteBoardText.MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime) || this;
            _this.textSelecting = false;
            _this.startLeft = false;
            _this.textNodes = [];
            _this.wordData = [];
            _this.lineData = [];
            _this.linePositions = [];
            _this.editData = null;
            _this.glyphCount = 0;
            _this.text = '';
            _this.lines = [];
            _this.styleSet = [];
            _this.editInBuffer = [];
            _this.editOutBuffer = [];
            _this.editNum = 0;
            _this.editCount = 0;
            _this.textDown = 0;
            _this.idealX = 0;
            // Undo Redo Buffers for merging.
            _this.wordStart = null;
            _this.wordEnd = null;
            _this.prevWordStart = null;
            _this.prevWordEnd = null;
            _this.paraStart = null;
            _this.paraEnd = null;
            _this.prevParaStart = null;
            _this.prevParaEnd = null;
            _this.prevStyle = null;
            _this.prevCursorPos = null;
            _this.lastFowardEdit = null;
            _this.wasSpaceLast = false;
            _this.spaceToggle = false;
            _this.cursorUndoPositions = [];
            _this.cursorRedoPositions = [];
            _this.waitingForFont = [];
            _this.text = '';
            if (serverId == null || serverId == undefined) {
                _this.isEditing = true;
            }
            _this.lockedBy = lockedBy;
            _this.isJustified = isJustified;
            _this.size = size;
            _this.editInBuffer[0] = [];
            _this.editInBuffer[0][0] = { num_styles: num_styles, num_recieved: 0, styles: [], editTimer: null };
            var buffer = _this.editInBuffer[0][0];
            for (var i = 0; i < styles.length; i++) {
                var style = styles[i];
                // Check for integrity.
                if (style != null && style != undefined && style.text != null && style.text != undefined && style.seq_num != null && style.seq_num != undefined
                    && style.start != null && style.start != undefined && style.end != null && style.end != undefined && style.style != null
                    && style.style != undefined && style.weight != null && style.weight != undefined && style.colour != null && style.colour != undefined
                    && style.oline != null && style.oline != undefined && style.uline != null && style.uline != undefined
                    && style.tline != null && style.tline != undefined) {
                    buffer.styles[style.seq_num] = style;
                    buffer.num_recieved++;
                }
            }
            if (buffer.num_recieved < buffer.num_styles) {
                var self_1 = _this;
                buffer.editTimer = setInterval(function (id, userId) {
                    var buffer = self_1.editInBuffer[0][0];
                    for (var i = 0; i < buffer.num_styles; i++) {
                        if (buffer[i] == null || buffer[i] == undefined) {
                            var msg = { editId: id, userId: userId, seq_num: i };
                            var msgCont = { header: MessageTypes.MISSED, payload: msg };
                            self_1.sendServerMsg(msgCont);
                        }
                    }
                }, 1000, 0, userId);
            }
            else {
                _this.completeEdit(0, 0);
            }
            _this.cursorStart = 0;
            _this.cursorEnd = 0;
            _this.wordStart = 0;
            _this.selectedCharacters = [];
            _this.stringStart = 0;
            _this.prevCursorPos = _this.cursorStart;
            _this.gettingLock = false;
            _this.isEditing = isEditing;
            _this.isSelected = isEditing;
            _this.changeSelect(true);
            var newView = {
                mode: WhiteBoardText.MODENAME, id: _this.id, x: _this.x, y: _this.y, width: _this.width, height: _this.height, isEditing: _this.isEditing,
                remLock: (_this.lockedBy != null && !_this.isEditing), getLock: false, textNodes: _this.textNodes, cursor: null, cursorElems: [], size: _this.size,
                updateTime: updateTime, isSelected: false, text: _this.text, justified: true, isMoving: false, isResizing: false
            };
            _this.currentViewState = newView;
            return _this;
        }
        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The element.
        */
        Element.createElement = function (data) {
            if (data.serverId != null && data.serverId != undefined && data.serverMsg != null && data.serverMsg != undefined) {
                var msg = data.serverMsg;
                return new Element(data.id, data.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.size, msg.justified, msg.num_styles, msg.nodes, (msg.editLock != 0), (msg.editLock == 0 ? null : msg.editLock), false, data.serverId, msg.editTime);
            }
            else if (data.x != null && data.x != undefined && data.y != null && data.y != undefined &&
                data.width != null && data.width != undefined && data.height != null && data.height != undefined) {
                var pallete = data.palleteState;
                var colour = void 0;
                var size = void 0;
                if (!pallete) {
                    size = 1.0;
                }
                else {
                    size = pallete.baseSize;
                }
                size = size * data.scaleF;
                if (data.width > 20 && data.height > 20) {
                    return new Element(data.id, data.userId, data.x + data.panX, data.y + data.panY, data.width * data.scaleF, data.height * data.scaleF, data.callbacks, size, pallete.isJustified, 0, [], false, -1, true);
                }
            }
            return null;
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // EXPOSED FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**   Generate the message that would be sent to the server to generate this element.
         *
         *    This should be a single message, more messages can be sent once serverId is returned. (see setServerId)
         *
         *    @return {UserMessage} The message to generate this element.
         */
        Element.prototype.getNewMsg = function () {
            var msg = {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height,
                size: this.size, justified: this.isJustified, editLock: true
            };
            return msg;
        };
        /**   Generate the clipboard data that this element should produce when copied, either as a single selected item or whilst editing.
         *
         *    This should be a set of different clipboard data formats.
         *
         *    @return {Array<ClipBoardItem>} The clipboard items.
         */
        Element.prototype.getClipboardData = function () {
            // TODO: Create enriched and html text.
            var plainText = '';
            for (var i = 0; i < this.selectedCharacters.length; i++) {
                plainText += this.text.substring(this.selectedCharacters[i], this.selectedCharacters[i] + 1);
            }
            var clipData = [];
            clipData.push({ format: 'text/plain', data: plainText });
            return clipData;
        };
        /**   Generate the SVG string description of this objects display to be copied  when user copies multiple items.
         *
         *    This should be a string containing the svg description to display this item.
         *
         *    @return {string} The clipboard items.
         */
        Element.prototype.getClipboardSVG = function () {
            // TODO:
            return null;
        };
        /**   Sets the serverId of this element and returns a list of server messages to send.
         *
         *    @param {number} id - The server ID for this element.
         *    @return {Array<UserMessage>} - The set of messages to send to the communication server.
         */
        Element.prototype.setServerId = function (id) {
            _super.prototype.setServerId.call(this, id);
            var messages = [];
            return messages;
        };
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
        Element.prototype.handleMouseDown = function (e, localX, localY, palleteState, component, subId) {
            var cursorType;
            if (component == 1 /* Resize */) {
                this.isResizing = true;
                this.oldWidth = this.width;
                this.oldHeight = this.height;
                this.startTime = this.updateTime;
                if (subId == 1 /* Right */) {
                    this.resizeHorz = true;
                    this.resizeVert = false;
                    cursorType = { cursor: 'ew-resize', url: [], offset: { x: 0, y: 0 } };
                }
                else if (subId == 2 /* Bottom */) {
                    this.resizeHorz = false;
                    this.resizeVert = true;
                    cursorType = { cursor: 'ns-resize', url: [], offset: { x: 0, y: 0 } };
                }
                else if (subId == 0 /* Corner */) {
                    this.resizeHorz = true;
                    this.resizeVert = true;
                    cursorType = { cursor: 'nwse-resize', url: [], offset: { x: 0, y: 0 } };
                }
                this.updateView({ isResizing: true });
            }
            else if (component == 2 /* Interaction */) {
                this.isMoving = true;
                this.moveStartX = this.x;
                this.moveStartY = this.y;
                this.startTime = this.updateTime;
                cursorType = { cursor: 'move', url: [], offset: { x: 0, y: 0 } };
                this.updateView({ isSelected: true, isMoving: true });
                this.isSelected = true;
            }
            else if (component == 3 /* TextArea */) {
                this.textSelecting = true;
            }
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: cursorType, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleMouseMove = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (e.buttons == 1) {
                this.cursorStart = this.findTextPos(localX, localY);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.changeSelect(true);
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleMouseUp = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleMouseClick = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            /* TODO: Handle text select by click here */
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleDoubleClick = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.isEditing) {
                /* TODO: Handle text select of words when editing */
            }
            else {
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleTouchStart = function (e, localTouches, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleTouchMove = function (e, touchChange, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleTouchEnd = function (e, localTouches, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleTouchCancel = function (e, localTouches, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleBoardMouseDown = function (e, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: false,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            if (this.isEditing && e.buttons === 1) {
                this.textSelecting = true;
                this.cursorStart = this.findTextPos(mouseX - this.x, mouseY - this.y);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                (_a = retVal.palleteChanges).push.apply(_a, this.changeSelect(true));
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
            var _a;
        };
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
        Element.prototype.handleBoardMouseMove = function (e, changeX, changeY, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            var palleteChanges = [];
            if (this.isResizing) {
                var lineCount = this.textNodes.length;
                if (lineCount == 0) {
                    lineCount = 1;
                }
                var newWidth = this.resizeHorz ? Math.max(2 * this.size, mouseX - this.x) : this.width;
                var newHeight = this.resizeVert ? Math.max(lineCount * 2 * this.size, mouseY - this.y) : this.height;
                if (newHeight != this.oldHeight || newWidth != this.oldWidth) {
                    this.resize(newWidth, newHeight, new Date());
                    this.hasResized = true;
                }
            }
            else if (this.isMoving) {
                this.move(changeX, changeY, new Date());
                this.hasMoved = true;
            }
            else if (e.buttons === 1 && this.textSelecting) {
                var newLoc = this.findTextPos(mouseX - this.x, mouseY - this.y);
                if (this.textDown < newLoc) {
                    this.cursorStart = this.textDown;
                    this.cursorEnd = newLoc;
                    this.startLeft = true;
                }
                else {
                    this.cursorStart = newLoc;
                    this.cursorEnd = this.textDown;
                    this.startLeft = false;
                }
                this.changeSelect(true);
            }
            retVal.newView = this.currentViewState;
            return retVal;
        };
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
        Element.prototype.handleBoardMouseUp = function (e, mouseX, mouseY, palleteState) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.hasMoved) {
                this.hasMoved = false;
                var changeX_1 = this.x - this.moveStartX;
                var changeY_1 = this.y - this.moveStartY;
                var msgPayload = { x: this.x, y: this.y };
                var msg = { header: BaseMessageTypes.MOVE, payload: msgPayload };
                serverMsgs.push(msg);
                retVal.undoOp = function () { return _this.moveOperation(-changeX_1, -changeY_1, _this.startTime); };
                retVal.redoOp = function () { return _this.moveOperation(changeX_1, changeY_1, _this.updateTime); };
            }
            if (this.hasResized) {
                this.hasResized = false;
                var msgPayload = { width: this.width, height: this.height, editTime: new Date() };
                var msg = { header: BaseMessageTypes.RESIZE, payload: msgPayload };
                serverMsgs.push(msg);
                retVal.undoOp = function () { return _this.resizeOperation(_this.oldWidth, _this.oldHeight, _this.startTime); };
                retVal.redoOp = function () { return _this.resizeOperation(_this.width, _this.height, _this.updateTime); };
            }
            this.textSelecting = false;
            this.isResizing = false;
            this.isMoving = false;
            this.updateView({ isMoving: false, isResizing: false });
            retVal.newView = this.currentViewState;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleBoardTouchStart = function (e, touches, palleteState) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleBoardTouchMove = function (e, toucheChanges, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleBoardTouchEnd = function (e, touches, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleBoardTouchCancel = function (e, touches, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        /**   Handle the start of moving this item.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse down event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *
         *    @return {ViewState} An object containing: the new view state
         */
        Element.prototype.startMove = function () {
            this.isMoving = true;
            this.moveStartX = this.x;
            this.moveStartY = this.y;
            this.updateView({ isMoving: true });
            var retVal = this.currentViewState;
            return retVal;
        };
        /**   Handle a move of this element, called when this element is moved by the user.
         *
         *    This MUST be implemented. DO NOT CHANGE UNLESS NECESSARY.
         *
         *    @param {number} changeX - The expected change in this elements x position.
         *    @param {number} changeY - The expected change in this elements y position.
         *
         *    @return {ViewState} An object containing: the new view state, messages to be sent to the comm server
         */
        Element.prototype.handleMove = function (changeX, changeY) {
            this.move(changeX, changeY, new Date());
            var retVal = this.currentViewState;
            return retVal;
        };
        /**   Handle the end of moving this item.
         *
         *    @param {MouseEvent} e - The mouse event data associated with the mouse up event.
         *    @param {number} localX - The relative position of the event to this elemens x position.
         *    @param {number} localY - The relative position of the event to this elemens y position.
         *
         *    @return {ElementMoveReturn} An object containing: the new view state
         */
        Element.prototype.endMove = function () {
            this.isMoving = false;
            this.updateView({ isMoving: false });
            var msgPayload = { x: this.x, y: this.y };
            var serverMsg = { header: BaseMessageTypes.MOVE, payload: msgPayload };
            var serverMsgs = [];
            var retVal = { newView: this.currentViewState, serverMessages: [], move: { x: this.x, y: this.y, message: serverMsg } };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
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
        Element.prototype.handleKeyPress = function (e, input, palleteState) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            var i;
            var newStart;
            var newEnd;
            var wasSpace = false;
            var wasNewPara = false;
            var prevStringStart;
            var prevCursorStart;
            var prevCursorEnd;
            var insertion = { start: null, text: null, style: null };
            var deletions = [];
            var editData = { deletions: deletions, insertion: insertion, styleChanges: [] };
            switch (input) {
                case 'ArrowLeft':
                    newStart = this.cursorStart;
                    newEnd = this.cursorEnd;
                    if (this.cursorStart == this.cursorEnd || !this.startLeft) {
                        if (this.cursorStart > 0) {
                            if (e.ctrlKey) {
                                i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
                                while (i > 0 && !this.text.charAt(i - 1).match(/\s/)) {
                                    i--;
                                }
                                newStart = i;
                            }
                            else {
                                if (newStart > 0) {
                                    newStart--;
                                }
                            }
                        }
                    }
                    else {
                        if (e.ctrlKey) {
                            i = this.cursorEnd > 0 ? this.cursorEnd - 1 : 0;
                            while (i > 0 && !this.text.charAt(i - 1).match(/\s/)) {
                                i--;
                            }
                            newEnd = i;
                        }
                        else {
                            if (newEnd > 0) {
                                newEnd--;
                            }
                        }
                    }
                    if (e.shiftKey) {
                        if (this.cursorStart == this.cursorEnd) {
                            this.startLeft = false;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if (newStart > newEnd) {
                            this.startLeft = false;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        this.changeSelect(true);
                    }
                    else {
                        this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                        this.cursorEnd = this.cursorStart;
                        (_a = retVal.palleteChanges).push.apply(_a, this.changeSelect(true));
                    }
                    break;
                case 'ArrowRight':
                    newStart = this.cursorStart;
                    newEnd = this.cursorEnd;
                    if (this.cursorStart == this.cursorEnd || this.startLeft) {
                        if (this.cursorEnd < this.text.length) {
                            if (e.ctrlKey) {
                                i = this.cursorEnd + 1;
                                while (i < this.text.length && !(this.text.charAt(i - 1).match(/\s/) && this.text.charAt(i).match(/[^\s]/))) {
                                    i++;
                                }
                                newEnd = i;
                            }
                            else {
                                if (newEnd < this.text.length) {
                                    newEnd++;
                                }
                            }
                        }
                    }
                    else {
                        if (e.ctrlKey) {
                            i = this.cursorStart < this.text.length ? this.cursorStart + 1 : this.text.length;
                            while (i < this.text.length && !(this.text.charAt(i - 1).match(/\s/) && this.text.charAt(i).match(/[^\s]/))) {
                                i++;
                            }
                            newStart = i;
                        }
                        else {
                            if (newStart < this.text.length) {
                                newStart++;
                            }
                        }
                    }
                    if (e.shiftKey) {
                        if (this.cursorStart == this.cursorEnd) {
                            this.startLeft = true;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if (newStart > newEnd) {
                            this.startLeft = true;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        this.changeSelect(true);
                    }
                    else {
                        this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                        this.cursorEnd = this.cursorStart;
                        (_b = retVal.palleteChanges).push.apply(_b, this.changeSelect(true));
                    }
                    break;
                case 'ArrowUp':
                    if (e.ctrlKey) {
                        if (this.startLeft && this.cursorStart != this.cursorEnd) {
                            i = this.cursorEnd - 1;
                            while (i > 0 && !this.text.charAt(i - 1).match('\n')) {
                                i--;
                            }
                            if (i < 0) {
                                i = 0;
                            }
                            newStart = this.cursorStart;
                            newEnd = i;
                        }
                        else {
                            i = this.cursorStart - 1;
                            while (i > 0 && !this.text.charAt(i - 1).match('\n')) {
                                i--;
                            }
                            if (i < 0) {
                                i = 0;
                            }
                            newStart = i;
                            newEnd = this.cursorEnd;
                        }
                    }
                    else {
                        if (this.startLeft && this.cursorStart != this.cursorEnd) {
                            newStart = this.cursorStart;
                            // If the cursor is on the first line do nothng
                            if (this.cursorEnd <= this.textNodes[0].end) {
                                newEnd = this.cursorEnd;
                            }
                            else {
                                newEnd = this.findXHelper(true, this.cursorEnd);
                            }
                        }
                        else {
                            newEnd = this.cursorEnd;
                            if (this.cursorStart <= this.textNodes[0].end) {
                                newStart = this.cursorStart;
                            }
                            else {
                                newStart = this.findXHelper(true, this.cursorStart);
                            }
                        }
                    }
                    if (e.shiftKey) {
                        if (this.cursorStart == this.cursorEnd) {
                            this.startLeft = false;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if (newEnd < newStart) {
                            this.startLeft = false;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        this.changeSelect(false);
                    }
                    else {
                        if (this.startLeft && this.cursorStart != this.cursorEnd) {
                            this.cursorStart = newEnd;
                        }
                        else {
                            this.cursorStart = newStart;
                        }
                        this.cursorEnd = this.cursorStart;
                        (_c = retVal.palleteChanges).push.apply(_c, this.changeSelect(false));
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey) {
                        if (this.startLeft || this.cursorStart == this.cursorEnd) {
                            i = this.cursorEnd + 1;
                            while (i < this.text.length && !this.text.charAt(i).match('\n')) {
                                i++;
                            }
                            newStart = this.cursorStart;
                            newEnd = i;
                        }
                        else {
                            i = this.cursorStart + 1;
                            while (i < this.text.length && !this.text.charAt(i).match('\n')) {
                                i++;
                            }
                            newStart = i;
                            newEnd = this.cursorEnd;
                        }
                    }
                    else {
                        if (this.startLeft || this.cursorStart == this.cursorEnd) {
                            newStart = this.cursorStart;
                            // If the cursor is on the last line do nothng
                            if (this.cursorEnd >= this.textNodes[this.textNodes.length - 1].start) {
                                newEnd = this.cursorEnd;
                            }
                            else {
                                newEnd = this.findXHelper(false, this.cursorEnd);
                            }
                        }
                        else {
                            newEnd = this.cursorEnd;
                            if (this.cursorStart >= this.textNodes[this.textNodes.length - 1].start) {
                                newStart = this.cursorStart;
                            }
                            else {
                                newStart = this.findXHelper(false, this.cursorStart);
                            }
                        }
                    }
                    if (e.shiftKey) {
                        if (this.cursorStart == this.cursorEnd) {
                            this.startLeft = true;
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        else if (newEnd < newStart) {
                            this.startLeft = true;
                            this.cursorStart = newEnd;
                            this.cursorEnd = newStart;
                        }
                        else {
                            this.cursorStart = newStart;
                            this.cursorEnd = newEnd;
                        }
                        this.changeSelect(false);
                    }
                    else {
                        if (this.startLeft || this.cursorStart == this.cursorEnd) {
                            this.cursorStart = newEnd;
                        }
                        else {
                            this.cursorStart = newStart;
                        }
                        this.cursorEnd = this.cursorStart;
                        (_d = retVal.palleteChanges).push.apply(_d, this.changeSelect(false));
                    }
                    break;
                case 'Backspace':
                    if (this.wordEnd > this.operationPos) {
                        this.wordEnd = this.operationPos;
                        this.lastFowardEdit = this.wordEnd;
                        // There has been a sequence of undos before this input, tidy up the undo/redo merging.
                        if (this.wordStart >= this.operationPos) {
                            // Throw away previous word and split this word.
                            this.wordStart = this.prevWordStart;
                            this.prevWordStart = null;
                            this.prevWordEnd = null;
                        }
                    }
                    if (this.cursorEnd > 0) {
                        var tPrevStart = this.cursorStart;
                        prevStringStart = this.stringStart;
                        prevCursorStart = this.cursorStart;
                        var bPrevCursorStart = this.cursorStart;
                        prevCursorEnd = this.cursorEnd;
                        var prevText_1 = this.text;
                        var prevStyles_1 = this.styleSet;
                        if (e.ctrlKey) {
                            if (this.cursorStart > 0) {
                                // TODO: Move to start of previous word
                            }
                        }
                        else {
                            if (this.cursorStart == this.cursorEnd) {
                                this.cursorStart--;
                                this.findStringPositions();
                                bPrevCursorStart = this.cursorStart;
                            }
                            var sortedSelect_1 = this.selectedCharacters.slice();
                            sortedSelect_1.sort(function (a, b) { return b - a; });
                            var prev_1 = -2;
                            var start_1 = -1;
                            editData.insertion = null;
                            // Check if we are deleting over a line or a paragraph and create contigeous deletions.
                            for (var i_1 = 0; i_1 < sortedSelect_1.length; i_1++) {
                                if (sortedSelect_1[i_1] - 1 != prev_1) {
                                    if (start_1 >= 0) {
                                        var newDeletion = { start: start_1, end: prev_1 };
                                        deletions.push(newDeletion);
                                    }
                                    start_1 = sortedSelect_1[i_1];
                                }
                                prev_1 = sortedSelect_1[i_1];
                                if (this.text.charAt(sortedSelect_1[i_1]).match(/\s/)) {
                                    if (this.wasSpaceLast) {
                                        this.spaceToggle = true;
                                    }
                                    wasSpace = true;
                                }
                                if (this.text.charAt(sortedSelect_1[i_1]) == '\n') {
                                    wasNewPara = true;
                                }
                            }
                            this.removeSelection(sortedSelect_1);
                            this.generateLines();
                            this.evaluateChanges(editData);
                            this.calculateTextLines();
                            this.findStringPositions();
                            var msg_1 = this.newEdit();
                            if (msg_1 != null) {
                                serverMsgs.push(msg_1);
                            }
                            this.cursorEnd = this.cursorStart;
                        }
                        /* TODO: Check this condition. */
                        if ((wasSpace && !this.spaceToggle) || (!wasSpace && this.spaceToggle) || this.prevCursorPos != tPrevStart) {
                            var undoStart = this.prevWordStart;
                            var undoEnd = this.prevWordEnd;
                            if (this.lastFowardEdit != null) {
                                this.wordEnd = this.lastFowardEdit;
                            }
                            this.wordMerger(undoStart, undoEnd);
                            if (this.lastFowardEdit != null) {
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
                        var undoPositions_1 = {
                            start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                        };
                        var redoPositions_1 = {
                            start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                        };
                        var undoOp_1 = function () {
                            _this.text = prevText_1;
                            _this.styleSet = prevStyles_1;
                            _this.cursorStart = undoPositions_1.bStart;
                            _this.cursorEnd = undoPositions_1.bPrevEnd;
                            _this.startLeft = true;
                            _this.generateLines();
                            _this.calculateTextLines();
                            _this.findStringPositions();
                            _this.findCursorElems();
                            _this.updateView({
                                textNodes: _this.textNodes, width: _this.width, height: _this.height,
                                cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                            });
                            var retVal = {
                                id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                                palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                            };
                            return retVal;
                        };
                        var newText_1 = this.text;
                        var newStyles_1 = this.styleSet;
                        var redoOp_1 = function () {
                            _this.text = newText_1;
                            _this.styleSet = newStyles_1;
                            _this.cursorStart = redoPositions_1.end;
                            _this.cursorEnd = redoPositions_1.end;
                            _this.startLeft = true;
                            _this.generateLines();
                            _this.calculateTextLines();
                            _this.findStringPositions();
                            _this.findCursorElems();
                            _this.updateView({
                                textNodes: _this.textNodes, width: _this.width, height: _this.height,
                                cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                            });
                            var retVal = {
                                id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                                palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                            };
                            return retVal;
                        };
                        this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                        this.operationStack[this.operationPos++] = { undo: undoOp_1, redo: redoOp_1 };
                        if (!wasSpace) {
                            this.wasSpaceLast = false;
                            this.spaceToggle = false;
                        }
                        else {
                            this.wasSpaceLast = true;
                        }
                        this.wordEnd = this.operationPos;
                        this.cursorUndoPositions.push(undoPositions_1);
                        this.cursorRedoPositions.push(redoPositions_1);
                        this.prevCursorPos = this.cursorStart;
                        /* TODO: Check for more than one space in selection (non-consecutive) if so apply another merge */
                    }
                    break;
                default:
                    if (input == 'Enter') {
                        input = '\n';
                        wasNewPara = true;
                    }
                    else if (input == 'Tab') {
                        input = '\t';
                    }
                    if (this.wordEnd > this.operationPos) {
                        this.wordEnd = this.operationPos;
                        // There has been a sequence of undos before this input, tidy up the undo/redo merging.
                        if (this.wordStart >= this.operationPos) {
                            // Throw away previous word and split this word.
                            this.wordStart = this.prevWordStart;
                            this.prevWordStart = null;
                            this.prevWordEnd = null;
                        }
                    }
                    if (input.match(/\s/)) {
                        if (this.wasSpaceLast) {
                            this.spaceToggle = true;
                        }
                        wasSpace = true;
                    }
                    var sortedSelect = this.selectedCharacters.slice();
                    sortedSelect.sort(function (a, b) { return b - a; });
                    var prev = -2;
                    var start = -1;
                    // Create contigeous deletions.
                    for (var i_2 = 0; i_2 < sortedSelect.length; i_2++) {
                        if (sortedSelect[i_2] - 1 != prev) {
                            if (start >= 0) {
                                var newDeletion = { start: start, end: prev };
                                deletions.push(newDeletion);
                            }
                            start = sortedSelect[i_2];
                        }
                        prev = sortedSelect[i_2];
                    }
                    var prevText_2 = this.text;
                    var prevStyles_2 = this.styleSet;
                    this.removeSelection(sortedSelect);
                    this.generateLines();
                    this.calculateTextLines();
                    this.findStringPositions();
                    var tmpGlyphLength = this.glyphCount;
                    var newStyle = {
                        colour: palleteState.getColour(), weight: palleteState.getWeight(), style: palleteState.getStyle(),
                        oline: palleteState.isOverline(), uline: palleteState.isUnderline(), tline: palleteState.isThroughline()
                    };
                    prevStringStart = this.stringStart;
                    prevCursorStart = this.cursorStart;
                    prevCursorEnd = this.cursorEnd;
                    insertion.start = this.stringStart;
                    insertion.text = input;
                    insertion.style = null;
                    var sty = this.insertText(input, newStyle);
                    editData.insertion.style = sty;
                    this.evaluateChanges(editData);
                    this.generateLines();
                    this.calculateTextLines();
                    this.cursorStart += this.glyphCount - tmpGlyphLength;
                    this.cursorEnd = this.cursorStart;
                    this.findStringPositions();
                    var msg = this.newEdit();
                    if (msg != null) {
                        serverMsgs.push(msg);
                    }
                    (_e = retVal.palleteChanges).push.apply(_e, this.changeSelect(true));
                    if ((wasSpace && !this.spaceToggle) || (!wasSpace && this.spaceToggle) || this.prevCursorPos != prevCursorStart || this.prevCursorPos != prevCursorEnd) {
                        var undoStart = this.prevWordStart;
                        var undoEnd = this.prevWordEnd;
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
                    var undoPositions_2 = {
                        start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                    };
                    var redoPositions_2 = {
                        start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                    };
                    var newCursorStart = this.cursorStart;
                    var undoOp = function () {
                        _this.text = prevText_2;
                        _this.styleSet = prevStyles_2;
                        _this.cursorStart = undoPositions_2.start;
                        _this.cursorEnd = undoPositions_2.prevEnd;
                        _this.startLeft = true;
                        _this.generateLines();
                        _this.calculateTextLines();
                        _this.findStringPositions();
                        _this.findCursorElems();
                        _this.updateView({
                            textNodes: _this.textNodes, width: _this.width, height: _this.height, cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                        });
                        var retVal = {
                            id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                            palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                        };
                        return retVal;
                    };
                    var newText_2 = this.text;
                    var newStyles_2 = this.styleSet;
                    var redoOp = function () {
                        _this.text = newText_2;
                        _this.styleSet = newStyles_2;
                        _this.cursorStart = redoPositions_2.start;
                        _this.cursorEnd = redoPositions_2.end;
                        _this.startLeft = true;
                        _this.generateLines();
                        _this.calculateTextLines();
                        _this.findStringPositions();
                        _this.findCursorElems();
                        _this.updateView({
                            textNodes: _this.textNodes, width: _this.width, height: _this.height, cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                        });
                        var retVal = {
                            id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                            palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                        };
                        return retVal;
                    };
                    this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                    this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };
                    this.wordEnd = this.operationPos;
                    if (!wasSpace) {
                        this.lastFowardEdit = this.wordEnd;
                        this.wasSpaceLast = false;
                        this.spaceToggle = false;
                    }
                    else {
                        this.wasSpaceLast = true;
                    }
                    this.cursorUndoPositions.push(undoPositions_2);
                    this.cursorRedoPositions.push(redoPositions_2);
                    this.prevCursorPos = this.cursorStart;
                    break;
            }
            if (this.isSelected) {
                this.findCursorElems();
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
            return retVal;
            var _a, _b, _c, _d, _e;
        };
        /**   Handle a messages sent from the server to this element.
         *
         *    @param {ServerMessage} message - The server message that was sent.
         *
         *    @return {ElementMessageReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        Element.prototype.handleElementServerMessage = function (message) {
            var newView = this.currentViewState;
            var retMsgs = [];
            var alertMessage = null;
            var infoMessage = null;
            var wasEdit = false;
            var wasDelete = false;
            switch (message.header) {
                case MessageTypes.NODE:
                    var nodeData = message.payload;
                    if (this.editInBuffer[nodeData.userId] != null && this.editInBuffer[nodeData.userId] != undefined &&
                        this.editInBuffer[nodeData.userId][nodeData.editId] != null && this.editInBuffer[nodeData.userId][nodeData.editId] != undefined) {
                        var buffer_1 = this.editInBuffer[nodeData.userId][nodeData.editId];
                        buffer_1.styles.push(nodeData.node);
                        if (buffer_1.styles.length == this.editInBuffer[nodeData.userId][nodeData.editId].num_styles) {
                            clearInterval(this.editInBuffer[nodeData.userId][nodeData.editId].editTimer);
                            this.completeEdit(nodeData.userId, nodeData.editId);
                        }
                    }
                    else {
                        /* TODO: Remove debug code. */
                        console.log('STYLENODE: Unkown edit, ID: ' + nodeData.editId);
                    }
                    newView = this.currentViewState;
                    break;
                case MessageTypes.JUSTIFY:
                    var justifyData = message.payload;
                    this.setJustified(justifyData.newState);
                    newView = this.currentViewState;
                    break;
                case MessageTypes.SIZECHANGE:
                    var sizeData = message.payload;
                    this.size = sizeData.newSize;
                    this.generateLines();
                    this.calculateTextLines();
                    if (this.isSelected) {
                        this.findCursorElems();
                    }
                    this.updateView({
                        textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false,
                        size: this.size
                    });
                    break;
                case MessageTypes.DROPPED:
                    /* TODO: Rollback. */
                    break;
                case MessageTypes.COMPLETE:
                    while (this.opBuffer.length > 0) {
                        var opMsg = void 0;
                        var op = this.opBuffer.shift();
                        opMsg = { header: op.header, payload: op.payload };
                        retMsgs.push(opMsg);
                    }
                    break;
                case MessageTypes.MISSED:
                    var msdata = message.payload;
                    var node = this.editOutBuffer[msdata.editId][msdata.num];
                    var msg = {
                        node: node, editId: msdata.editId,
                    };
                    var msgCont = { header: MessageTypes.NODE, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                case MessageTypes.EDIT:
                    var editData = message.payload;
                    if (this.editInBuffer[editData.userId] == null || this.editInBuffer[editData.userId] == undefined) {
                        this.editInBuffer[editData.userId] = [];
                    }
                    this.editInBuffer[editData.userId][editData.editId] = { num_styles: editData.num_styles, num_recieved: 0, styles: [], editTimer: null };
                    var buffer = this.editInBuffer[editData.userId][editData.editId];
                    for (var i = 0; i < editData.styles.length; i++) {
                        var style = editData.styles[i];
                        // Check for integrity.
                        if (style != null && style != undefined && style.text != null && style.text != undefined
                            && style.seq_num != null && style.seq_num != undefined && style.start != null && style.start != undefined && style.end != null
                            && style.end != undefined && style.style != null && style.style != undefined && style.weight != null && style.weight != undefined
                            && style.colour != null && style.colour != undefined && style.oline != null && style.oline != undefined && style.uline != null
                            && style.uline != undefined && style.tline != null && style.tline != undefined) {
                            buffer.styles[style.seq_num] = style;
                            buffer.num_recieved++;
                        }
                    }
                    if (buffer.num_recieved < buffer.num_styles) {
                        var self_2 = this;
                        buffer.editTimer = setInterval(function (id, userId) {
                            var buffer = self_2.editInBuffer[userId][id];
                            for (var i = 0; i < buffer.num_styles; i++) {
                                if (buffer[i] == null || buffer[i] == undefined) {
                                    var msg_2 = { editId: id, userId: userId, seq_num: i };
                                    var msgCont_1 = { header: MessageTypes.MISSED, payload: msg_2 };
                                    self_2.sendServerMsg(msgCont_1);
                                }
                            }
                        }, 1000, editData.editId, editData.userId);
                    }
                    else {
                        this.completeEdit(editData.userId, editData.editId);
                    }
                    break;
                default:
                    console.error('Unrecognized server message.');
                    break;
            }
            var retVal = {
                newView: newView, serverMessages: retMsgs, wasEdit: wasEdit, wasDelete: wasDelete, alertMessage: alertMessage, infoMessage: infoMessage
            };
            return retVal;
        };
        /**   Handle the selecting and starting of editing of this element that has not been induced by this elements input handles.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        Element.prototype.handleStartEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
            this.isSelected = true;
            this.gettingLock = true;
            /* TODO: This should be set to total number of glyphs. */
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            (_a = retVal.palleteChanges).push.apply(_a, this.changeSelect(true));
            this.updateView({ gettingLock: true, isSelected: true });
            var messageContainer = { header: BaseMessageTypes.LOCK, payload: null };
            serverMsgs.push(messageContainer);
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
            var _a;
        };
        /**   Handle the deselect this element and ending of editing.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        Element.prototype.handleEndEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
            this.isSelected = false;
            this.isEditing = false;
            this.updateView({ isSelected: false, isEditing: false });
            this.stopLock();
            var messageContainer = { header: BaseMessageTypes.RELEASE, payload: null };
            serverMsgs.push(messageContainer);
            var lineCount = this.textNodes.length;
            if (lineCount == 0) {
                lineCount = 1;
            }
            if (lineCount * 2 * this.size < this.height) {
                this.resize(this.width, lineCount * 2 * this.size, new Date());
                /* TODO: Add resize message to messages */
            }
            // Merge letter undo/redos into word undo redos.
            if (this.wordEnd != null) {
                var undoStart = this.wordStart;
                var undoEnd = this.wordEnd;
                this.operationStack.splice(undoStart, undoEnd - undoStart);
                this.wordEnd = null;
                this.operationPos -= undoEnd - undoStart;
            }
            if (this.prevWordStart != null && this.prevWordEnd != null) {
                var undoStart = this.prevWordStart;
                var undoEnd = this.prevWordEnd;
                this.operationStack.splice(undoStart, undoEnd - undoStart);
                this.prevWordEnd = null;
                this.prevWordStart = null;
                this.operationPos -= undoEnd - undoStart;
            }
            retVal.newView = this.currentViewState;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        /**   Handle the deselect this element.
         *
         *    @return {ComponentViewState} An object containing: the new view state
         */
        Element.prototype.handleDeselect = function () {
            this.cursorElems = null;
            this.updateView({ cursor: null, cursorElems: [] });
            return _super.prototype.handleDeselect.call(this);
        };
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
        Element.prototype.handlePaste = function (localX, localY, data, palleteState) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // TODO: Handle enriched text and html text.
            //
            var input = data.plainText;
            if (this.isEditing) {
                var sortedSelect = this.selectedCharacters.slice();
                sortedSelect.sort(function (a, b) { return b - a; });
                var prevText_3 = this.text;
                var prevStyles_3 = this.styleSet;
                this.removeSelection(sortedSelect);
                this.generateLines();
                this.calculateTextLines();
                this.findStringPositions();
                var tmpGlyphLength = this.glyphCount;
                var newStyle = {
                    colour: palleteState.getColour(), weight: palleteState.getWeight(), style: palleteState.getStyle(),
                    oline: palleteState.isOverline(), uline: palleteState.isUnderline(), tline: palleteState.isThroughline()
                };
                var prevStringStart = this.stringStart;
                var prevCursorStart = this.cursorStart;
                var prevCursorEnd = this.cursorEnd;
                this.insertText(input, newStyle);
                this.generateLines();
                this.calculateTextLines();
                this.cursorStart += this.glyphCount - tmpGlyphLength;
                this.cursorEnd = this.cursorStart;
                this.findStringPositions();
                var msg = this.newEdit();
                if (msg != null) {
                    serverMsgs.push(msg);
                }
                (_a = retVal.palleteChanges).push.apply(_a, this.changeSelect(true));
                var undoStart = this.prevWordStart;
                var undoEnd = this.prevWordEnd;
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
                var undoPositions_3 = {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                };
                var redoPositions_3 = {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: prevCursorStart, bPrevEnd: prevCursorEnd
                };
                var newCursorStart = this.cursorStart;
                var undoOp = function () {
                    _this.text = prevText_3;
                    _this.styleSet = prevStyles_3;
                    _this.cursorStart = undoPositions_3.start;
                    _this.cursorEnd = undoPositions_3.prevEnd;
                    _this.startLeft = true;
                    _this.generateLines();
                    _this.calculateTextLines();
                    _this.findStringPositions();
                    _this.findCursorElems();
                    _this.updateView({
                        textNodes: _this.textNodes, width: _this.width, height: _this.height, cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                    });
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };
                    return retVal;
                };
                var newText_3 = this.text;
                var newStyles_3 = this.styleSet;
                var redoOp = function () {
                    _this.text = newText_3;
                    _this.styleSet = newStyles_3;
                    _this.cursorStart = redoPositions_3.start;
                    _this.cursorEnd = redoPositions_3.end;
                    _this.startLeft = true;
                    _this.generateLines();
                    _this.calculateTextLines();
                    _this.findStringPositions();
                    _this.findCursorElems();
                    _this.updateView({
                        textNodes: _this.textNodes, width: _this.width, height: _this.height, cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                    });
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };
                    return retVal;
                };
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };
                this.wordEnd = this.operationPos;
                this.lastFowardEdit = this.wordEnd;
                this.wasSpaceLast = false;
                this.cursorUndoPositions.push(undoPositions_3);
                this.cursorRedoPositions.push(redoPositions_3);
                this.prevCursorPos = this.cursorStart;
            }
            if (this.isSelected) {
                this.findCursorElems();
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
            /* TODO: Handle undo redo and resize */
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
            return retVal;
            var _a;
        };
        /**  Handle the cutting of data from this element.
         *
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected
         */
        Element.prototype.handleCut = function () {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.wordEnd > this.operationPos) {
                this.wordEnd = this.operationPos;
                this.lastFowardEdit = this.wordEnd;
                // There has been a sequence of undos before this input, tidy up the undo/redo merging.
                if (this.wordStart >= this.operationPos) {
                    // Throw away previous word and split this word.
                    this.wordStart = this.prevWordStart;
                    this.prevWordStart = null;
                    this.prevWordEnd = null;
                }
            }
            if (this.cursorEnd > 0 && this.cursorStart != this.cursorEnd) {
                var tPrevStart = this.cursorStart;
                var prevStringStart = this.stringStart;
                var prevCursorStart = this.cursorStart;
                var bPrevCursorStart = this.cursorStart;
                var prevCursorEnd = this.cursorEnd;
                var prevText_4 = this.text;
                var prevStyles_4 = this.styleSet;
                var wasSpace = false;
                var wasNewPara = false;
                var sortedSelect = this.selectedCharacters.slice();
                sortedSelect.sort(function (a, b) { return b - a; });
                // Check if we are deleting over a line or a paragraph
                for (var i = 0; i < sortedSelect.length; i++) {
                    if (this.text.charAt(sortedSelect[i]).match(/\s/)) {
                        if (this.wasSpaceLast) {
                            this.spaceToggle = true;
                        }
                        wasSpace = true;
                    }
                    if (this.text.charAt(sortedSelect[i]) == '\n') {
                        wasNewPara = true;
                    }
                }
                this.removeSelection(sortedSelect);
                this.generateLines();
                this.calculateTextLines();
                this.findStringPositions();
                var msg = this.newEdit();
                if (msg != null) {
                    serverMsgs.push(msg);
                }
                this.cursorEnd = this.cursorStart;
                /* TODO: Check this condition. */
                if ((wasSpace && !this.spaceToggle) || (!wasSpace && this.spaceToggle) || this.prevCursorPos != tPrevStart) {
                    var undoStart = this.prevWordStart;
                    var undoEnd = this.prevWordEnd;
                    if (this.lastFowardEdit != null) {
                        this.wordEnd = this.lastFowardEdit;
                    }
                    this.wordMerger(undoStart, undoEnd);
                    if (this.lastFowardEdit != null) {
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
                var undoPositions_4 = {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                };
                var redoPositions_4 = {
                    start: prevCursorStart, end: this.cursorStart, prevEnd: prevCursorEnd, bStart: bPrevCursorStart, bPrevEnd: prevCursorEnd
                };
                var undoOp = function () {
                    _this.text = prevText_4;
                    _this.styleSet = prevStyles_4;
                    _this.cursorStart = undoPositions_4.bStart;
                    _this.cursorEnd = undoPositions_4.bPrevEnd;
                    _this.startLeft = true;
                    _this.generateLines();
                    _this.calculateTextLines();
                    _this.findStringPositions();
                    _this.findCursorElems();
                    _this.updateView({
                        textNodes: _this.textNodes, width: _this.width, height: _this.height,
                        cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                    });
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };
                    return retVal;
                };
                var newText_4 = this.text;
                var newStyles_4 = this.styleSet;
                var redoOp = function () {
                    _this.text = newText_4;
                    _this.styleSet = newStyles_4;
                    _this.cursorStart = redoPositions_4.end;
                    _this.cursorEnd = redoPositions_4.end;
                    _this.startLeft = true;
                    _this.generateLines();
                    _this.calculateTextLines();
                    _this.findStringPositions();
                    _this.findCursorElems();
                    _this.updateView({
                        textNodes: _this.textNodes, width: _this.width, height: _this.height,
                        cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                    });
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: null,
                        palleteChanges: [], wasDelete: null, wasRestore: null, move: null
                    };
                    return retVal;
                };
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };
                if (!wasSpace) {
                    this.wasSpaceLast = false;
                    this.spaceToggle = false;
                }
                else {
                    this.wasSpaceLast = true;
                }
                this.wordEnd = this.operationPos;
                this.cursorUndoPositions.push(undoPositions_4);
                this.cursorRedoPositions.push(redoPositions_4);
                this.prevCursorPos = this.cursorStart;
                /* TODO: Check for more than one space in selection (non-consecutive) if so apply another merge */
            }
            if (this.isSelected) {
                this.findCursorElems();
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
            /* TODO: Handle undo redo and resize */
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
            return retVal;
        };
        /**   Handle a custom context event on this component, events are dispatched by the pressing of custom buttons set in the CustomContextView.
         *
         *    @param {ClipboardEvent} e - The clipboard event data associated with the copy event.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        Element.prototype.handleCustomContext = function (item, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        /**   Produce a hover info message for this element.
         *
         *    @return {HoverMessage} The data to be displayed in the hover info message for this element
         */
        Element.prototype.handleHover = function () {
            var retVal = { header: '', message: '' };
            return retVal;
        };
        /**   Handle a change in the pallete for this component. Passed when this element is selected.
         *
         *    @param {BoardPallete} pallete - The pallete for this element after changes.
         *    @param {BoardPalleteChange} change - The changes made to the pallete.
         *
         *    @return {ElementPalleteReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        Element.prototype.handlePalleteChange = function (pallete, change) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            var palleteChanges = [];
            if (change.type == 7 /* JUSTIFIED */) {
                var prevVal_1 = this.isJustified;
                var undoOp = function () {
                    var retMsgs = [];
                    var palleteChanges = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.setJustified(prevVal_1);
                    palleteChanges.push({ type: 7 /* JUSTIFIED */, data: _this.isJustified });
                    var payload = { newState: prevVal_1 };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                var redoOp = function () {
                    var retMsgs = [];
                    var palleteChanges = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.setJustified(pallete.isJustified);
                    palleteChanges.push({ type: 7 /* JUSTIFIED */, data: _this.isJustified });
                    var payload = { newState: _this.isJustified };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };
                retVal.undoOp = null;
                retVal.redoOp = null;
                this.setJustified(pallete.isJustified);
                palleteChanges.push({ type: 7 /* JUSTIFIED */, data: this.isJustified });
                var payload = { newState: this.isJustified };
                var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                serverMsgs.push(msg);
            }
            else if (change.type == 1 /* SIZE */) {
                var prevVal_2 = this.size;
                var undoOp = function () {
                    var retMsgs = [];
                    var palleteChanges = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.size = prevVal_2;
                    _this.generateLines();
                    _this.calculateTextLines();
                    if (_this.isSelected) {
                        _this.findCursorElems();
                    }
                    _this.updateView({
                        textNodes: _this.textNodes, width: _this.width, height: _this.height, cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false,
                        size: _this.size
                    });
                    palleteChanges.push({ type: 1 /* SIZE */, data: _this.size });
                    var payload = { newSize: _this.size };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                var redoOp = function () {
                    var retMsgs = [];
                    var palleteChanges = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.size = pallete.baseSize;
                    _this.generateLines();
                    _this.calculateTextLines();
                    if (_this.isSelected) {
                        _this.findCursorElems();
                    }
                    _this.updateView({
                        textNodes: _this.textNodes, width: _this.width, height: _this.height, cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false,
                        size: _this.size
                    });
                    palleteChanges.push({ type: 1 /* SIZE */, data: _this.size });
                    var payload = { newSize: _this.size };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: palleteChanges,
                        wasDelete: null, wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };
                retVal.undoOp = null;
                retVal.redoOp = null;
                this.size = pallete.baseSize;
                this.generateLines();
                this.calculateTextLines();
                if (this.isSelected) {
                    this.findCursorElems();
                }
                this.updateView({
                    textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false,
                    size: this.size
                });
                palleteChanges.push({ type: 1 /* SIZE */, data: this.size });
                var payload = { newSize: this.size };
                var msg = { header: MessageTypes.SIZECHANGE, payload: payload };
                console.log('Adding size change message.');
                console.log(msg);
                serverMsgs.push(msg);
            }
            else {
                var styles_1 = [];
                if (this.selectedCharacters.length > 0) {
                    // Sort the selected characters
                    var sortedSelect = this.selectedCharacters.slice();
                    sortedSelect.sort(function (a, b) { return a - b; });
                    for (var i = 0; i < this.styleSet.length; i++) {
                        var style = this.styleSet[i];
                        if (sortedSelect.length == 0) {
                            style.text = this.text.substring(style.start, style.end);
                            style.seq_num = styles_1.length;
                            styles_1.push(style);
                        }
                        else if (this.isCurrentStyle(style, pallete) || sortedSelect[0] >= style.end) {
                            if (styles_1.length > 0 && this.stylesMatch(styles_1[styles_1.length - 1], style)
                                && styles_1[styles_1.length - 1].end - styles_1[styles_1.length - 1].start + style.end - style.start <= MAX_STYLE_LENGTH) {
                                styles_1[styles_1.length - 1].end = style.end;
                                styles_1[styles_1.length - 1].text = this.text.substring(styles_1[styles_1.length - 1].start, styles_1[styles_1.length - 1].end);
                            }
                            else {
                                style.text = this.text.substring(style.start, style.end);
                                style.seq_num = styles_1.length;
                                styles_1.push(style);
                            }
                        }
                        else {
                            var styleSplits = [];
                            if (style.start < sortedSelect[0]) {
                                style.end = sortedSelect[0];
                                style.text = this.text.substring(style.start, style.end);
                                style.seq_num = styles_1.length;
                                styles_1.push(style);
                            }
                            for (var j = 0; j < sortedSelect.length; j++) {
                                if (style.end <= sortedSelect[j]) {
                                    break;
                                }
                                // At this point we actually know the selected position is within this style.
                                if (styleSplits.length > 0 && styleSplits[styleSplits.length - 1].end < sortedSelect[j]) {
                                    // Push the original style gap between the previous style.
                                    style.start = styleSplits[styleSplits.length - 1].end;
                                    style.end = sortedSelect[j];
                                    style.text = this.text.substring(style.start, style.end);
                                    style.seq_num = styles_1.length;
                                    styles_1.push(style);
                                }
                                // If it's the same as the last thing we pushed just extend.
                                if (styleSplits.length > 0 && this.isCurrentStyle(styleSplits[styleSplits.length - 1], pallete)) {
                                    if (styleSplits[styleSplits.length - 1].end - styleSplits[styleSplits.length - 1].start < MAX_STYLE_LENGTH) {
                                        styleSplits[styleSplits.length - 1].end++;
                                        styleSplits[styleSplits.length - 1].text = this.text.substring(styleSplits[styleSplits.length - 1].start, styleSplits[styleSplits.length - 1].end);
                                    }
                                    else {
                                        var newStyle = {
                                            start: sortedSelect[j], end: sortedSelect[j] + 1, oline: pallete.isOverline(), uline: pallete.isUnderline(),
                                            tline: pallete.isThroughline(), weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                            text: this.text.substring(sortedSelect[j], sortedSelect[j] + 1), seq_num: null
                                        };
                                        styleSplits.push(newStyle);
                                    }
                                }
                                else {
                                    var newStyle = {
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
                            if (styleSplits[styleSplits.length - 1].end < style.end) {
                                // Push the original style gap between the previous style.
                                style.start = styleSplits[styleSplits.length - 1].end;
                                style.text = this.text.substring(style.start, style.end);
                                styleSplits.push(style);
                            }
                            var lastStyle = styles_1[styles_1.length - 1];
                            // Test the endpoints, merge and number.
                            if (styles_1.length > 0 && lastStyle.colour == styleSplits[0].colour && lastStyle.oline == styleSplits[0].oline
                                && lastStyle.uline == styleSplits[0].uline
                                && lastStyle.tline == styleSplits[0].tline
                                && lastStyle.weight == styleSplits[0].weight
                                && lastStyle.end - lastStyle.start + styleSplits[0].end - styleSplits[0].start <= MAX_STYLE_LENGTH) {
                                lastStyle.end = styleSplits[0].end;
                                lastStyle.text = this.text.substring(lastStyle.start, lastStyle.end);
                            }
                            else {
                                styleSplits[0].seq_num = styles_1.length;
                                styles_1.push(styleSplits[0]);
                            }
                            for (var j = 1; j < styleSplits.length; j++) {
                                styleSplits[j].seq_num = styles_1.length;
                                styles_1.push(styleSplits[j]);
                            }
                        }
                    }
                }
                else {
                    styles_1 = this.styleSet;
                }
                var undoSet_1 = this.styleSet.slice();
                var cursoorStartPrev_1 = this.cursorStart;
                var cursoorEndPrev_1 = this.cursorEnd;
                // TODO: Undo redo merging.
                var undoOp = function () { return _this.setStyleSet(undoSet_1, cursoorStartPrev_1, cursoorEndPrev_1); };
                var redoOp = function () { return _this.setStyleSet(styles_1, cursoorStartPrev_1, cursoorEndPrev_1); };
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                this.operationStack[this.operationPos++] = { undo: undoOp, redo: redoOp };
                // This does not produce whiteboard level undo/redo operations.
                retVal.undoOp = null;
                retVal.redoOp = null;
                retVal.palleteChanges = palleteChanges;
                this.styleSet = styles_1;
                this.generateLines();
                this.calculateTextLines();
                if (this.isSelected) {
                    this.findCursorElems();
                }
                this.updateView({
                    textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
                });
                serverMsgs.push(this.textEdited());
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            retVal.newView = this.currentViewState;
            return retVal;
        };
        /**   Handle the requested audio stream.
         *
         *    @param {MediaStream} stream - The audio stream.
         */
        Element.prototype.audioStream = function (stream) {
        };
        /**   Handle the requested video stream.
         *
         *    @param {MediaStream} stream - The video stream.
         */
        Element.prototype.videoStream = function (stream) {
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // INTERNAL FUNCTIONS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         *
         *
         */
        Element.prototype.setStyleSet = function (styleSet, cursorStart, cursorEnd) {
            var retMsgs = [];
            var centrePos = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            this.cursorStart = cursorStart;
            this.cursorEnd = cursorEnd;
            this.styleSet = styleSet;
            this.generateLines();
            this.calculateTextLines();
            if (this.isSelected) {
                this.findCursorElems();
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
            var msg = this.textEdited();
            var retVal = {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                wasRestore: null, move: null
            };
            retMsgs.push(msg);
            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        };
        /** Handle the basic resize behaviour.
         *
         *
         */
        Element.prototype.resize = function (width, height, updateTime) {
            this.updateTime = updateTime;
            this.height = height;
            if (this.width != width) {
                this.width = width;
                this.calculateTextLines();
            }
            if (this.isEditing) {
                this.findCursorElems();
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems
            });
        };
        /**
         *
         *
         */
        Element.prototype.stopLock = function () {
            this.gettingLock = false;
            this.editLock = false;
            this.cursor = null;
            this.cursorElems = [];
            this.updateView({ getLock: false, isEditing: false, cursor: null, cursorElems: [] });
        };
        /**
         *
         *
         */
        Element.prototype.changeSelect = function (setIdeal) {
            var palleteChanges = [];
            if (setIdeal) {
                if (this.startLeft) {
                    this.idealX = this.findXPos(this.cursorEnd);
                }
                else {
                    this.idealX = this.findXPos(this.cursorStart);
                }
            }
            this.findStringPositions();
            this.findCursorElems();
            if (this.styleSet.length > 0) {
                var i = 0;
                while (i < this.styleSet.length - 1 && (this.styleSet[i].start > this.cursorStart || this.styleSet[i].end < this.cursorStart)) {
                    i++;
                }
                var isBold = this.styleSet[i].weight == 'bold';
                var isItalic = this.styleSet[i].style == 'italic';
                var isOLine = this.styleSet[i].oline;
                var isULine = this.styleSet[i].uline;
                var isTLine = this.styleSet[i].tline;
                var change = {
                    colour: this.styleSet[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine
                };
                palleteChanges.push({ type: 8 /* TEXTCHANGE */, data: change });
            }
            this.updateView({ cursor: this.cursor, cursorElems: this.cursorElems });
            return palleteChanges;
        };
        /**
         *
         *
         */
        Element.prototype.setEdit = function () {
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            this.gettingLock = false;
            this.isEditing = true;
            this.updatePallete(this.changeSelect(true));
            this.updateView({ getLock: false, isEditing: true });
        };
        /**
         *
         *
         */
        Element.prototype.setJustified = function (state) {
            this.isJustified = state;
            this.calculateTextLines();
            if (this.isEditing) {
                if (this.startLeft) {
                    this.idealX = this.findXPos(this.cursorEnd);
                }
                else {
                    this.idealX = this.findXPos(this.cursorStart);
                }
                this.findCursorElems();
            }
            this.updateView({ textNodes: this.textNodes, cursor: this.cursor, cursorElems: this.cursorElems });
        };
        /**
         *
         *    @param {number} loc -
         */
        Element.prototype.findXPos = function (loc) {
            if (this.textNodes.length == 0) {
                return 0;
            }
            for (var i = 0; i < this.textNodes.length; i++) {
                var line = this.textNodes[i];
                if (loc >= line.start && loc <= line.end) {
                    if (loc == line.end) {
                        if (line.sections.length == 0) {
                            return 0;
                        }
                        else if (!line.spaceRemoved) {
                            var lastSec = line.sections[line.sections.length - 1];
                            var glyphIdx = loc - line.start - -1;
                            var localPos = (lastSec.glyphs[loc - line.start - 1].startAdvance + lastSec.glyphs[loc - line.start - 1].xAdvance);
                            return (lastSec.startPos + localPos * this.size / 1000);
                        }
                    }
                    else {
                        for (var j = 0; j < line.sections.length; j++) {
                            if (line.sections[j].startGlyph <= loc && line.sections[j].startGlyph + line.sections[j].glyphs.length >= loc) {
                                var localPos = line.sections[j].glyphs[loc - line.sections[j].startGlyph - line.start].startAdvance;
                                return (line.sections[j].startPos + localPos * this.size / 1000);
                            }
                        }
                    }
                }
            }
        };
        /**
         *
         *    @param
         */
        Element.prototype.findTextPos = function (x, y) {
            var xFind = 0;
            if (y < 0 || this.textNodes.length == 0) {
                return 0;
            }
            else {
                var lineNum = Math.floor((y / (2 * this.size)));
                if (lineNum >= this.textNodes.length) {
                    return this.textNodes[this.textNodes.length - 1].end;
                }
                /* TODO: Remove debugging code. */
                if (!this.textNodes[lineNum]) {
                    console.log('Line is: ' + lineNum);
                }
                if (x > 0) {
                    if (x > this.width) {
                        return this.textNodes[lineNum].end;
                    }
                    else {
                        xFind = x;
                    }
                }
                else {
                    return this.textNodes[lineNum].start;
                }
                var line = this.textNodes[lineNum];
                if (line.sections.length == 0) {
                    return line.start;
                }
                var i = 0;
                while (i < line.sections.length && xFind > line.sections[i].startPos) {
                    i++;
                }
                var secIdx = i - 1;
                var sec = line.sections[secIdx];
                i = 0;
                while (i < sec.glyphs.length && xFind > sec.startPos + sec.glyphs[i].startAdvance * this.size / 1000) {
                    i++;
                }
                var curr = i - 1;
                var glyph = sec.glyphs[curr];
                // i and currMes is now the position to the right of the search point.
                // We just need to check if left or right is closer then reurn said point.
                var selPoint = void 0;
                var glyphStart = sec.startPos + glyph.startAdvance * this.size / 1000;
                var glyphEnd = glyphStart + glyph.xAdvance * this.size / 1000;
                if (xFind - glyphStart > glyphEnd - xFind) {
                    selPoint = line.start + curr + 1;
                }
                else {
                    selPoint = line.start + curr;
                }
                return selPoint;
            }
        };
        /**
         *
         *
         */
        Element.prototype.findCursorElems = function () {
            this.cursorElems = [];
            if (this.textNodes.length == 0 && this.isEditing) {
                this.cursor = { x: 0, y: 0, height: 2 * this.size };
            }
            for (var i = 0; i < this.textNodes.length; i++) {
                var line = this.textNodes[i];
                var selStart = null;
                var selEnd = null;
                var endFound = false;
                if (this.cursorStart >= line.start && this.cursorStart <= line.end) {
                    if (this.cursorStart == line.start) {
                        selStart = 0;
                    }
                    else if (this.cursorStart == line.end) {
                        var sec = line.sections[line.sections.length - 1];
                        var idx = this.cursorStart - sec.startGlyph - 1;
                        selStart = sec.startPos + ((sec.glyphs[idx].startAdvance + sec.glyphs[idx].xAdvance) * this.size / 1000);
                    }
                    else {
                        for (var j = 0; j < line.sections.length; j++) {
                            var sec = line.sections[j];
                            if (this.cursorStart >= sec.startGlyph && this.cursorStart <= sec.startGlyph + sec.glyphs.length) {
                                selStart = sec.startPos + sec.glyphs[this.cursorStart - sec.startGlyph].startAdvance * this.size / 1000;
                            }
                        }
                    }
                }
                else if (this.cursorStart < line.start) {
                    selStart = 0;
                }
                if (this.cursorEnd >= line.start && this.cursorEnd <= line.end) {
                    if (this.cursorEnd == line.start) {
                        selEnd = 0;
                    }
                    else if (this.cursorEnd == line.end) {
                        if (!line.spaceRemoved && line.justified) {
                            selEnd = this.width;
                        }
                        else {
                            var sec = line.sections[line.sections.length - 1];
                            var idx = this.cursorEnd - line.start - 1;
                            selStart = sec.startPos + ((sec.glyphs[idx].startAdvance + sec.glyphs[idx].xAdvance) * this.size / 1000);
                        }
                    }
                    else {
                        for (var j = 0; j < line.sections.length; j++) {
                            var sec = line.sections[j];
                            if (this.cursorEnd >= sec.startGlyph && this.cursorEnd <= sec.startGlyph + sec.glyphs.length) {
                                selEnd = sec.startPos + sec.glyphs[this.cursorEnd - sec.startGlyph].startAdvance * this.size / 1000;
                            }
                        }
                    }
                }
                else if (this.cursorEnd > line.end) {
                    selEnd = this.width;
                }
                if (this.isEditing) {
                    if (this.cursorEnd >= line.start && this.cursorEnd <= line.end && (this.startLeft || this.cursorStart == this.cursorEnd)) {
                        this.cursor = { x: selEnd, y: 2 * this.size * line.lineNum + 0.2 * this.size, height: 2 * this.size };
                    }
                    else if (this.cursorStart >= line.start && this.cursorStart <= line.end && !this.startLeft) {
                        this.cursor = { x: selStart, y: 2 * this.size * line.lineNum + 0.2 * this.size, height: 2 * this.size };
                    }
                }
                else {
                    this.cursor = null;
                }
                if (selStart != null && selEnd != null && this.cursorStart != this.cursorEnd) {
                    this.cursorElems.push({
                        x: selStart, y: 2 * this.size * line.lineNum + 0.2 * this.size, width: selEnd - selStart, height: 2 * this.size
                    });
                }
            }
        };
        /**
         *
         *
         */
        Element.prototype.splitText = function (text) {
            var words = [];
            var j;
            var isWhiteSpace = text.charAt(0).match(/\s/) ? true : false;
            var txtStart = 0;
            for (j = 0; j < text.length; j++) {
                if (isWhiteSpace) {
                    if (!text.charAt(j).match(/\s/)) {
                        if (j > 0) {
                            txtStart = j;
                            isWhiteSpace = false;
                        }
                        else {
                            isWhiteSpace = false;
                        }
                    }
                }
                else {
                    if (text.charAt(j).match(/\s/)) {
                        words.push({ start: txtStart, word: text.substring(txtStart, j) });
                        txtStart = j;
                        isWhiteSpace = true;
                    }
                }
            }
            if (!isWhiteSpace) {
                words.push({ start: txtStart, word: text.substring(txtStart, j) });
            }
            return words;
        };
        /**
         *
         *
         */
        Element.prototype.splitSegments = function (style, wordStart, localStart, word) {
            // TODO: Language determination and splitting
            var segments = [];
            var wordPos = 0;
            var hasHyphen = false;
            var advance = 0;
            while (word.length - wordPos > MAX_SEGEMENT_LENGTH) {
                var wordSlice_1 = word.slice(wordPos, wordPos + MAX_SEGEMENT_LENGTH);
                var glyphs_1 = [];
                hasHyphen = this.processGlyphs(glyphs_1, style, word, wordStart + localStart + wordPos);
                var wordAdvance_1 = 0;
                for (var k = 0; k < glyphs_1.length; k++) {
                    wordAdvance_1 += (glyphs_1[k].xAdvance) * this.size / 1000;
                }
                var newSegment_1 = {
                    style: style, startPos: localStart + wordPos, glyphs: glyphs_1, startAdvance: advance,
                    segmentAdvance: wordAdvance_1, segmentLength: word.length, hasHyphen: hasHyphen
                };
                segments.push(newSegment_1);
                wordPos += MAX_SEGEMENT_LENGTH;
                advance += wordAdvance_1;
            }
            var wordSlice = word.slice(wordPos, word.length);
            var glyphs = [];
            hasHyphen = this.processGlyphs(glyphs, style, word, wordStart + localStart + wordPos);
            var wordAdvance = 0;
            for (var k = 0; k < glyphs.length; k++) {
                wordAdvance += (glyphs[k].xAdvance) * this.size / 1000;
            }
            var newSegment = {
                style: style, startPos: localStart + wordPos, glyphs: glyphs, startAdvance: advance,
                segmentAdvance: wordAdvance, segmentLength: word.length, hasHyphen: hasHyphen
            };
            segments.push(newSegment);
            return segments;
        };
        /**
         *
         *
         */
        Element.prototype.splitWithStyles = function (wordStart, localStart, word) {
            var segments = [];
            var styIndex = 0;
            while (styIndex + 1 < this.styleSet.length && this.styleSet[styIndex + 1].start < wordStart + localStart) {
                styIndex++;
            }
            var style = this.styleSet[styIndex];
            var currentStart = localStart;
            var end = wordStart + localStart + word.length;
            while (end > style.end) {
                var text_1 = word.substring(wordStart + localStart, style.end);
                segments.push.apply(segments, this.splitSegments(style, wordStart, localStart, text_1));
                styIndex++;
                style = this.styleSet[styIndex];
                localStart += style.end - (wordStart + localStart);
            }
            var text = word.substring(wordStart + localStart, end);
            segments.push.apply(segments, this.splitSegments(style, wordStart, localStart, text));
            return segments;
        };
        /**
         *
         *
         */
        Element.prototype.applyDeletion = function (word, deletion) {
            if (deletion.end < word.startPos) {
                var change = deletion.end - deletion.start;
                word.startPos -= change;
                for (var k = 0; k < word.segments.length; k++) {
                    word.segments[k].startPos -= change;
                }
            }
            else if (deletion.start < word.startPos + word.wordLength) {
                if (deletion.start > word.startPos) {
                    if (deletion.end < word.startPos + word.wordLength) {
                        word.wordLength -= deletion.end - deletion.start;
                        word.wordAdvance = -1;
                    }
                    else {
                        word.wordLength = deletion.start - word.startPos;
                        word.wordAdvance = -1;
                    }
                }
                else {
                    word.startPos -= word.startPos - deletion.start;
                    if (deletion.end < word.startPos + word.wordLength) {
                        word.wordLength -= deletion.end - word.startPos;
                        word.wordAdvance = -1;
                    }
                    else {
                        word.wordLength = 0;
                    }
                }
                for (var k = 0; k < word.segments.length; k++) {
                    var segment = word.segments[k];
                    if (deletion.end < segment.startPos) {
                        segment.startPos -= deletion.end - deletion.start;
                    }
                    else if (deletion.start < segment.startPos + segment.segmentLength) {
                        if (deletion.start > segment.startPos) {
                            if (deletion.end < segment.startPos + segment.segmentLength) {
                                segment.segmentLength -= deletion.end - deletion.start;
                                segment.segmentAdvance = -1;
                            }
                            else {
                                segment.segmentLength = deletion.start - segment.startPos;
                                segment.segmentAdvance = -1;
                            }
                        }
                        else {
                            segment.startPos -= segment.startPos - deletion.start;
                            if (deletion.end < segment.startPos + segment.segmentLength) {
                                segment.segmentLength -= deletion.end - segment.startPos;
                                segment.segmentAdvance = -1;
                            }
                            else {
                                // Segment was removed by deletion.
                                word.segments.splice(k, 1);
                                k--;
                            }
                        }
                    }
                }
            }
        };
        Element.prototype.processDeletions = function () {
            // TODO
        };
        Element.prototype.processInsertions = function () {
            // TODO
        };
        Element.prototype.processStyleChanges = function () {
            // TODO
        };
        /**
         *
         *
         */
        Element.prototype.evaluateChanges = function (editData) {
            // TODO: Remove debug code.
            console.log("Edit data is:");
            console.log(editData);
            var newLinePositions = [];
            var lineStartWord = 0;
            //let removedLines: Array<number> = [];
            var currentLine = 0;
            var oldLineIndex = 0;
            var newWordData = [];
            var inserted = false;
            var insertData = [];
            var insertStyle;
            var newLineData = [];
            if (editData.insertion != null) {
                insertData = this.splitText(editData.insertion.text);
                insertStyle = editData.insertion.style;
                console.log('Insertion detected. Data is:');
                console.log(insertData);
                console.log(insertStyle);
            }
            for (var i = 0; i < this.linePositions.length; i++) {
                var removed = false;
                var newPosition = this.linePositions[i];
                for (var j = 0; j < editData.deletions.length; j++) {
                    var deletion = editData.deletions[j];
                    if (this.linePositions[i] >= deletion.start && this.linePositions[i] < deletion.end) {
                        //removedLines.push(i);
                        removed = true;
                    }
                    else if (this.linePositions[i] >= deletion.end) {
                        newPosition -= (deletion.end - deletion.start);
                    }
                }
                if (!removed) {
                    if (editData.insertion != null && newPosition >= editData.insertion.start) {
                        newPosition += editData.insertion.text.length;
                    }
                    newLinePositions.push(newPosition);
                }
            }
            var word = null;
            var nextWord = null;
            var wordCount = 0;
            var totalCount = 0;
            for (var i = 0; i < this.wordData.length; i++) {
                if (this.wordData.length > 1) {
                    if (nextWord == null) {
                        word = {
                            startPos: this.wordData[i].startPos, wordAdvance: this.wordData[i].wordAdvance, segments: this.wordData[i].segments,
                            wordLength: this.wordData[i].wordLength
                        };
                        nextWord = {
                            startPos: this.wordData[i + 1].startPos, wordAdvance: this.wordData[i + 1].wordAdvance, segments: this.wordData[i + 1].segments,
                            wordLength: this.wordData[i + 1].wordLength
                        };
                        for (var j = 0; j < editData.deletions.length; j++) {
                            this.applyDeletion(word, editData.deletions[j]);
                            this.applyDeletion(nextWord, editData.deletions[j]);
                        }
                    }
                    else {
                        word = nextWord;
                        nextWord = {
                            startPos: this.wordData[i + 1].startPos, wordAdvance: this.wordData[i + 1].wordAdvance, segments: this.wordData[i + 1].segments,
                            wordLength: this.wordData[i + 1].wordLength
                        };
                        for (var j = 0; j < editData.deletions.length; j++) {
                            this.applyDeletion(nextWord, editData.deletions[j]);
                        }
                    }
                    while (word.startPos + word.wordLength == nextWord.startPos) {
                        // Merge words and set nextWord to null.
                        word.wordLength += nextWord.wordLength;
                        var wordSeg = word.segments[word.segments.length - 1];
                        var sty1 = wordSeg.style;
                        var sty2 = nextWord.segments[0].style;
                        for (var j = 0; j < nextWord.segments.length; j++) {
                            nextWord.segments[j].startPos += word.wordLength;
                        }
                        if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                            wordSeg.segmentLength += nextWord.segments[0].segmentLength;
                            wordSeg.segmentAdvance = -1;
                            (_a = word.segments).push.apply(_a, nextWord.segments.slice(1, nextWord.segments.length));
                        }
                        else {
                            (_b = word.segments).push.apply(_b, nextWord.segments.slice(0, nextWord.segments.length));
                        }
                        i++;
                        nextWord = {
                            startPos: this.wordData[i + 1].startPos, wordAdvance: this.wordData[i + 1].wordAdvance, segments: this.wordData[i + 1].segments,
                            wordLength: this.wordData[i + 1].wordLength
                        };
                    }
                }
                else {
                    word = {
                        startPos: this.wordData[i].startPos, wordAdvance: this.wordData[i].wordAdvance, segments: this.wordData[i].segments,
                        wordLength: this.wordData[i].wordLength
                    };
                }
                // Push the current line foward to include this word.
                while (newLinePositions[oldLineIndex] > word.startPos) {
                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                    currentLine++;
                    oldLineIndex++;
                    totalCount += wordCount;
                    wordCount = 0;
                }
                if (insertData.length == 0 && editData.insertion != null && editData.insertion.text.length > 0) {
                    // Insert was spaces only
                    if (word.startPos >= editData.insertion.start) {
                        word.startPos += editData.insertion.text.length;
                    }
                    newWordData.push(word);
                    inserted = true;
                }
                else if (word.wordLength > 0) {
                    console.log('Made it here.');
                    var insert = insertData[0];
                    console.log('and new word data is:');
                    console.log(newWordData);
                    if (editData.insertion.start >= word.startPos && editData.insertion.start <= word.startPos + word.wordLength) {
                        console.log('Went in here.');
                        if (editData.insertion.start == word.startPos + word.wordLength) {
                            console.log('and in here.');
                            // Insert is at the end of this word.
                            if (editData.insertion.text.charAt(0).match(/\s/)) {
                                // Word is seperate so just insert new word.
                                newWordData.push(word);
                                wordCount++;
                                // Check for new lines at the start of the insertion.
                                var startSpaces = editData.insertion.text.substring(0, insert.start);
                                var newLineIndex = startSpaces.indexOf('\n');
                                var runningPos = insertData[0].start;
                                while (newLineIndex >= 0) {
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
                                var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                var wordAdvance = 0;
                                for (var k = 0; k < newSegments.length; k++) {
                                    wordAdvance += newSegments[k].segmentAdvance;
                                }
                                var newWord = {
                                    startPos: insert.start + editData.insertion.start, wordAdvance: wordAdvance,
                                    wordLength: insert.word.length, segments: newSegments
                                };
                                newWordData.push(newWord);
                                wordCount++;
                            }
                            else {
                                var seg = word.segments[word.segments.length - 1];
                                var sty1 = seg.style;
                                var sty2 = insertStyle;
                                if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                    console.log('Made it to the right spot.');
                                    // Extend the last segment of this word.
                                    var newText = this.text.substring(seg.startPos, seg.startPos + seg.segmentLength + insert.word.length);
                                    var newSegments = this.splitSegments(insertStyle, word.startPos, seg.startPos, newText);
                                    word.wordAdvance -= seg.segmentAdvance;
                                    word.segments.splice(word.segments.length - 1, 1);
                                    var wordAdvance = 0;
                                    for (var k = 0; k < newSegments.length; k++) {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    word.wordAdvance += wordAdvance;
                                    (_c = word.segments).push.apply(_c, newSegments);
                                    word.wordLength += insert.word.length;
                                    console.log('New word data was: ');
                                    console.log(newWordData);
                                    newWordData.push(word);
                                    wordCount++;
                                    console.log('New word data is now: ');
                                    console.log(newWordData);
                                }
                                else {
                                    // Just add another segment and adjust some stuff.
                                    var newText = this.text.substring(editData.insertion.start, editData.insertion.start + insert.word.length);
                                    var newSegments = this.splitSegments(insertStyle, word.startPos, editData.insertion.start - word.startPos, newText);
                                    var wordAdvance = 0;
                                    for (var k = 0; k < newSegments.length; k++) {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    word.wordAdvance += wordAdvance;
                                    (_d = word.segments).push.apply(_d, newSegments);
                                    word.wordLength += insert.word.length;
                                    newWordData.push(word);
                                    wordCount++;
                                }
                            }
                        }
                        else if (editData.insertion.start != word.startPos) {
                            console.log('Went in this condition.');
                            var seg = null;
                            var segIndex = -1;
                            for (var k = 0; k < word.segments.length; k++) {
                                var segment = word.segments[k];
                                if (editData.insertion.start == segment.startPos + segment.segmentLength) {
                                    seg = segment;
                                    segIndex = k;
                                    if (segment.style.style == insertStyle.style && segment.style.weight == insertStyle.weight) {
                                        break;
                                    }
                                }
                                else if (editData.insertion.start >= segment.startPos && editData.insertion.start < segment.startPos + segment.segmentLength) {
                                    seg = segment;
                                    segIndex = k;
                                    break;
                                }
                            }
                            var sty1 = seg.style;
                            var sty2 = insertStyle;
                            // Add original piece before slice and first insert word
                            if (insertData.length == 1) {
                                if (editData.insertion.text.charAt(0).match(/\s/)) {
                                    // Check for new lines at the start of the insertion.
                                    var startSpaces = editData.insertion.text.substring(0, insert.start);
                                    var newLineIndex = startSpaces.indexOf('\n');
                                    var runningPos = insertData[0].start;
                                    while (newLineIndex >= 0) {
                                        runningPos += newLineIndex;
                                        startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                        newLinePositions.splice(currentLine, 0, runningPos);
                                        newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                        currentLine++;
                                        totalCount += wordCount;
                                        wordCount = 0;
                                        newLineIndex = startSpaces.indexOf('\n');
                                    }
                                    var segStartText = this.text.substring(seg.startPos, insert.start);
                                    var newStartSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, segStartText);
                                    var startWordAdvance = 0;
                                    for (var k = 0; k < segIndex; k++) {
                                        startWordAdvance += word.segments[k].segmentAdvance;
                                    }
                                    for (var k = 0; k < newStartSegments.length; k++) {
                                        startWordAdvance += newStartSegments[k].segmentAdvance;
                                    }
                                    var newStartWord = {
                                        startPos: word.startPos, wordAdvance: startWordAdvance,
                                        wordLength: insert.start - word.startPos, segments: word.segments.slice(0, segIndex).concat(newStartSegments)
                                    };
                                    newWordData.push(newStartWord);
                                    wordCount++;
                                    if (editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/)) {
                                        // New insert is surrounded by spaces so split segment into new words.
                                        var insertSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                        var insertWordAdvance = 0;
                                        for (var k = 0; k < insertSegments.length; k++) {
                                            insertWordAdvance += insertSegments[k].segmentAdvance;
                                        }
                                        var insertWord = {
                                            startPos: insert.start, wordAdvance: insertWordAdvance,
                                            wordLength: insert.word.length, segments: insertSegments
                                        };
                                        newWordData.push(insertWord);
                                        wordCount++;
                                        // Check for new lines at the end of the insertion.
                                        var spacesStart = insertData[0].start + insertData[0].word.length;
                                        var spacesEnd = insert.start + insert.word.length;
                                        var startSpaces_1 = editData.insertion.text.substring(spacesStart, spacesEnd);
                                        var newLineIndex_1 = startSpaces_1.indexOf('\n');
                                        var runningPos_1 = insertData[0].start + insertData[0].word.length;
                                        while (newLineIndex_1 >= 0) {
                                            runningPos_1 += newLineIndex_1;
                                            startSpaces_1 = startSpaces_1.substring(newLineIndex_1, startSpaces_1.length);
                                            newLinePositions.splice(currentLine, 0, runningPos_1);
                                            newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                            currentLine++;
                                            totalCount += wordCount;
                                            wordCount = 0;
                                            newLineIndex_1 = startSpaces_1.indexOf('\n');
                                        }
                                        // Insert new word for split segment after.
                                        var newEndStart = editData.insertion.start + editData.insertion.text.length;
                                        var segEndText = this.text.substring(newEndStart, seg.segmentLength - (insert.start - (seg.startPos + word.startPos)));
                                        var newEndSegments = this.splitSegments(seg.style, word.startPos, 0, segEndText);
                                        var endWordAdvance = 0;
                                        for (var k = segIndex + 1; k < word.segments.length; k++) {
                                            endWordAdvance += word.segments[k].segmentAdvance;
                                            word.segments[k].startPos -= (editData.insertion.start - word.startPos);
                                        }
                                        for (var k = 0; k < newEndSegments.length; k++) {
                                            endWordAdvance += newEndSegments[k].segmentAdvance;
                                        }
                                        var endSegments = newEndSegments.slice();
                                        if (segIndex < word.segments.length) {
                                            endSegments.push.apply(endSegments, word.segments.slice(segIndex + 1, word.segments.length));
                                        }
                                        var newEndWord = {
                                            startPos: newEndStart, wordAdvance: endWordAdvance,
                                            wordLength: word.wordLength - newStartWord.wordLength, segments: endSegments
                                        };
                                        newWordData.push(newEndWord);
                                        wordCount++;
                                    }
                                    else {
                                        // Check for merger of end segments
                                        if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                            // Extend this segment
                                            var includeNextSeg = false;
                                            var newLength = (seg.segmentLength - (insert.start - (seg.startPos + word.startPos))) + insert.word.length;
                                            if (segIndex < word.segments.length) {
                                                var testSty = word.segments[segIndex + 1].style;
                                                if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                                    includeNextSeg = true;
                                                    newLength += word.segments[segIndex + 1].segmentLength;
                                                }
                                            }
                                            var newText = this.text.substring(insert.start, insert.start + newLength);
                                            var newSegments = this.splitSegments(insertStyle, word.startPos, 0, newText);
                                            var endWordAdvance = 0;
                                            for (var k = segIndex + 1; k < word.segments.length; k++) {
                                                endWordAdvance += word.segments[k].segmentAdvance;
                                                word.segments[k].startPos -= (editData.insertion.start - word.startPos);
                                            }
                                            for (var k = 0; k < newSegments.length; k++) {
                                                endWordAdvance += newSegments[k].segmentAdvance;
                                            }
                                            var endSegments = newSegments.slice();
                                            var tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                            if (tmpIndex + 1 < word.segments.length) {
                                                endSegments.push.apply(endSegments, word.segments.slice(tmpIndex + 1, word.segments.length));
                                            }
                                            var newEndWord = {
                                                startPos: insert.start, wordAdvance: endWordAdvance,
                                                wordLength: newLength, segments: endSegments
                                            };
                                            newWordData.push(newEndWord);
                                            wordCount++;
                                        }
                                        else {
                                            var includeNextSeg = false;
                                            var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                            var splitStart = insert.start + insert.word.length;
                                            var splitLength = seg.segmentLength - (insert.start - (seg.startPos + word.startPos));
                                            if (segIndex < word.segments.length) {
                                                var testSty = word.segments[segIndex + 1].style;
                                                if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                                    includeNextSeg = true;
                                                    splitLength += word.segments[segIndex + 1].segmentLength;
                                                }
                                            }
                                            var splitText = this.text.substring(splitStart, splitStart + splitLength);
                                            var splitSegments = this.splitSegments(seg.style, word.startPos, insert.word.length, splitText);
                                            var endWordAdvance = 0;
                                            var newLength = 0;
                                            for (var k = segIndex + 1; k < word.segments.length; k++) {
                                                endWordAdvance += word.segments[k].segmentAdvance;
                                                newLength += word.segments[k].segmentLength;
                                                word.segments[k].startPos -= (editData.insertion.start - word.startPos);
                                            }
                                            for (var k = 0; k < newSegments.length; k++) {
                                                endWordAdvance += newSegments[k].segmentAdvance;
                                                newLength += newSegments[k].segmentLength;
                                            }
                                            for (var k = 0; k < splitSegments.length; k++) {
                                                endWordAdvance += splitSegments[k].segmentAdvance;
                                                newLength += splitSegments[k].segmentLength;
                                            }
                                            var endSegments = splitSegments.concat(newSegments);
                                            var tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                            if (tmpIndex + 1 < word.segments.length) {
                                                endSegments.push.apply(endSegments, word.segments.slice(tmpIndex + 1, word.segments.length));
                                            }
                                            var newEndWord = {
                                                startPos: insert.start, wordAdvance: endWordAdvance,
                                                wordLength: newLength, segments: endSegments
                                            };
                                            newWordData.push(newEndWord);
                                            wordCount++;
                                        }
                                    }
                                }
                                else if (editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/)) {
                                    // Check for merger of start segments
                                    if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                        // Extend this segment
                                        var newText = this.text.substring(segIndex, insert.start + insert.word.length);
                                        var newStartSegments = this.splitSegments(insertStyle, word.startPos, segIndex, newText);
                                        var startWordAdvance = 0;
                                        for (var k = 0; k < segIndex; k++) {
                                            startWordAdvance += newStartSegments[k].segmentAdvance;
                                        }
                                        var newStartWord = {
                                            startPos: word.startPos, wordAdvance: startWordAdvance,
                                            wordLength: insert.start - word.startPos + insert.word.length,
                                            segments: word.segments.slice(0, segIndex).concat(newStartSegments)
                                        };
                                        newWordData.push(newStartWord);
                                        wordCount++;
                                    }
                                    else {
                                        var newSegments = this.splitSegments(insertStyle, word.startPos, insert.start - word.startPos, insert.word);
                                        var splitText = this.text.substring(seg.startPos, insert.start);
                                        var splitSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, splitText);
                                        var startWordAdvance = 0;
                                        var newLength = 0;
                                        for (var k = 0; k < segIndex; k++) {
                                            startWordAdvance += word.segments[k].segmentAdvance;
                                            newLength += word.segments[k].segmentLength;
                                        }
                                        for (var k = 0; k < newSegments.length; k++) {
                                            startWordAdvance += newSegments[k].segmentAdvance;
                                            newLength += newSegments[k].segmentLength;
                                        }
                                        for (var k = 0; k < splitSegments.length; k++) {
                                            startWordAdvance += splitSegments[k].segmentAdvance;
                                            newLength += splitSegments[k].segmentLength;
                                        }
                                        var startSegments = splitSegments.concat(newSegments);
                                        if (segIndex > 0) {
                                            startSegments.push.apply(startSegments, word.segments.slice(0, segIndex));
                                        }
                                        var newstartWord = {
                                            startPos: insert.start, wordAdvance: startWordAdvance,
                                            wordLength: newLength, segments: startSegments
                                        };
                                        newWordData.push(newstartWord);
                                        wordCount++;
                                    }
                                    // Check for new lines at the end of the insertion.
                                    var spacesStart = insertData[0].start + insertData[0].word.length;
                                    var spacesEnd = insert.start + insert.word.length;
                                    var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                    var newLineIndex = startSpaces.indexOf('\n');
                                    var runningPos = insertData[0].start + insertData[0].word.length;
                                    while (newLineIndex >= 0) {
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
                                    var newSegEnd = seg.startPos + seg.segmentLength + editData.insertion.text.length;
                                    var segEndText = this.text.substring(insert.start + editData.insertion.text.length, newSegEnd);
                                    var newEndSegments = this.splitSegments(seg.style, word.startPos, 0, segEndText);
                                    var endWordAdvance = 0;
                                    for (var k = segIndex + 1; k < word.segments.length; k++) {
                                        endWordAdvance += word.segments[k].segmentAdvance;
                                        word.segments[k].startPos -= insert.start - (seg.startPos + word.startPos);
                                    }
                                    for (var k = 0; k < newEndSegments.length; k++) {
                                        endWordAdvance += newEndSegments[k].segmentAdvance;
                                    }
                                    var endSegments = newEndSegments;
                                    if (segIndex + 1 < word.segments.length) {
                                        endSegments.push.apply(endSegments, word.segments.slice(segIndex + 1, word.segments.length));
                                    }
                                    var newEndWord = {
                                        startPos: insert.start + editData.insertion.text.length, wordAdvance: endWordAdvance,
                                        wordLength: newSegEnd - (insert.start + editData.insertion.text.length), segments: endSegments
                                    };
                                    newWordData.push(newEndWord);
                                    wordCount++;
                                }
                                else {
                                    // Insert new text into word.
                                    if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                        var includeNextSeg = false;
                                        var splitLength = seg.segmentLength + insert.word.length;
                                        if (segIndex < word.segments.length) {
                                            var testSty = word.segments[segIndex + 1].style;
                                            if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                                includeNextSeg = true;
                                                splitLength += word.segments[segIndex + 1].segmentLength;
                                            }
                                        }
                                        var newText = this.text.substring(seg.startPos, seg.startPos + splitLength);
                                        var newSegments = this.splitSegments(insertStyle, word.startPos, seg.startPos, newText);
                                        word.wordAdvance -= seg.segmentAdvance;
                                        word.segments.splice(segIndex, includeNextSeg ? 2 : 1);
                                        var wordAdvance = 0;
                                        for (var k = 0; k < newSegments.length; k++) {
                                            wordAdvance += newSegments[k].segmentAdvance;
                                        }
                                        for (var k = segIndex + 1; k < word.segments.length; k++) {
                                            word.segments[k].startPos += insert.word.length;
                                        }
                                        word.wordAdvance += wordAdvance;
                                        (_e = word.segments).splice.apply(_e, [segIndex, 0].concat(newSegments));
                                        newWordData.push(word);
                                        wordCount++;
                                    }
                                    else {
                                        // Insert new segment splitting segment.
                                        var startText = this.text.substring(seg.startPos, insert.start);
                                        var newStartSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, startText);
                                        var newSegments = this.splitSegments(insertStyle, word.startPos, insert.start - word.startPos, insert.word);
                                        var includeNextSeg = false;
                                        var newEndPos = 2 * seg.startPos + seg.segmentAdvance - insert.start;
                                        if (segIndex < word.segments.length) {
                                            var testSty = word.segments[segIndex + 1].style;
                                            if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                                includeNextSeg = true;
                                                newEndPos += word.segments[segIndex + 1].segmentLength;
                                            }
                                        }
                                        var endLocalStart = insert.start - word.startPos + insert.word.length;
                                        var endText = this.text.substring(insert.start + insert.word.length, word.startPos + newEndPos);
                                        var newEndSegments = this.splitSegments(seg.style, word.startPos, endLocalStart, endText);
                                        word.wordAdvance -= seg.segmentAdvance;
                                        word.wordLength += insert.word.length;
                                        for (var k = segIndex + 1; k < word.segments.length; k++) {
                                            word.segments[k].startPos += insert.word.length;
                                        }
                                        for (var k = 0; k < newStartSegments.length; k++) {
                                            word.wordAdvance += newStartSegments[k].segmentAdvance;
                                        }
                                        for (var k = 0; k < newSegments.length; k++) {
                                            word.wordAdvance += newSegments[k].segmentAdvance;
                                        }
                                        for (var k = 0; k < newEndSegments.length; k++) {
                                            word.wordAdvance += newEndSegments[k].segmentAdvance;
                                        }
                                        var wordSegments = [];
                                        if (segIndex > 0) {
                                            wordSegments.push.apply(wordSegments, word.segments.slice(0, segIndex));
                                        }
                                        wordSegments.push.apply(wordSegments, newStartSegments);
                                        wordSegments.push.apply(wordSegments, newSegments);
                                        wordSegments.push.apply(wordSegments, newEndSegments);
                                        var tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                        if (tmpIndex + 1 < word.segments.length) {
                                            wordSegments.push.apply(wordSegments, word.segments.slice(tmpIndex + 1, word.segments.length));
                                        }
                                        word.segments = wordSegments;
                                        newWordData.push(word);
                                        wordCount++;
                                    }
                                }
                            }
                            else {
                                if (editData.insertion.text.charAt(0).match(/\s/)) {
                                    // Check for new lines at the start of the insertion.
                                    var startSpaces = editData.insertion.text.substring(0, insert.start);
                                    var newLineIndex = startSpaces.indexOf('\n');
                                    var runningPos = insertData[0].start;
                                    while (newLineIndex >= 0) {
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
                                    var segStartText = this.text.substring(seg.startPos, insert.start);
                                    var newStartSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, segStartText);
                                    var startWordAdvance = 0;
                                    for (var k = 0; k < segIndex; k++) {
                                        startWordAdvance += word.segments[k].segmentAdvance;
                                    }
                                    for (var k = 0; k < newStartSegments.length; k++) {
                                        startWordAdvance += newStartSegments[k].segmentAdvance;
                                    }
                                    var newStartWord = {
                                        startPos: word.startPos, wordAdvance: startWordAdvance,
                                        wordLength: insert.start - word.startPos, segments: word.segments.slice(0, segIndex).concat(newStartSegments)
                                    };
                                    newWordData.push(newStartWord);
                                    wordCount++;
                                    var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                    var insertWordAdvance = 0;
                                    for (var k = 0; k < newSegments.length; k++) {
                                        insertWordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    var insertWord = {
                                        startPos: insert.start, wordAdvance: insertWordAdvance,
                                        wordLength: insert.word.length, segments: newSegments
                                    };
                                    newWordData.push(insertWord);
                                    wordCount++;
                                }
                                else {
                                    var newSegments = [];
                                    var insertWordAdvance = 0;
                                    // Merge first piece with first new word
                                    if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                        // Merge segments.
                                        var newWord = this.text.substring(seg.startPos, insert.start + insert.word.length);
                                        if (segIndex > 0) {
                                            newSegments.push.apply(newSegments, word.segments.slice(0, segIndex));
                                        }
                                        newSegments.push.apply(newSegments, this.splitSegments(insertStyle, word.startPos, seg.startPos, newWord));
                                    }
                                    else {
                                        // Add new segment.
                                        var cutText = this.text.substring(seg.startPos, insert.start);
                                        var cutSegments = this.splitSegments(seg.style, word.startPos, seg.startPos, cutText);
                                        if (segIndex > 0) {
                                            newSegments.push.apply(newSegments, word.segments.slice(0, segIndex));
                                        }
                                        if (cutSegments.length > 0) {
                                            newSegments.push.apply(newSegments, cutSegments);
                                        }
                                        newSegments.push.apply(newSegments, this.splitSegments(insertStyle, word.startPos, insert.start - word.startPos, insert.word));
                                    }
                                    for (var k = 0; k < newSegments.length; k++) {
                                        insertWordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    var insertWord = {
                                        startPos: word.startPos, wordAdvance: insertWordAdvance,
                                        wordLength: insert.start + insert.word.length - word.startPos, segments: newSegments
                                    };
                                    newWordData.push(insertWord);
                                    wordCount++;
                                }
                            }
                        }
                        // Insert all isolated words.
                        for (var j = 1; j < insertData.length - 1; j++) {
                            // Check for new lines at the start of the insertion.
                            var spacesStart = insertData[j - 1].start + insertData[j - 1].word.length;
                            var spacesEnd = insertData[j].start;
                            var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            var newLineIndex = startSpaces.indexOf('\n');
                            var runningPos = insertData[j - 1].start + insertData[j - 1].word.length;
                            while (newLineIndex >= 0) {
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
                            var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insertData[j].word);
                            var wordAdvance = 0;
                            for (var k = 0; k < newSegments.length; k++) {
                                wordAdvance += newSegments[k].segmentAdvance;
                            }
                            var newWord = {
                                startPos: insertData[j].start + editData.insertion.start, wordAdvance: wordAdvance,
                                wordLength: insertData[j].word.length, segments: newSegments
                            };
                            newWordData.push(newWord);
                            wordCount++;
                        }
                        if (insertData.length > 1) {
                            // Check for new lines.
                            var spacesStart = insertData[insertData.length - 2].start + insertData[insertData.length - 2].word.length;
                            var spacesEnd = insertData[insertData.length - 1].start;
                            var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            var newLineIndex = startSpaces.indexOf('\n');
                            var runningPos = spacesStart;
                            while (newLineIndex >= 0) {
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
                        if (editData.insertion.start == word.startPos) {
                            console.log('Did the start insert thing.');
                            if (editData.insertion.text.charAt(editData.insertion.text.length - 1).match(/\s/)) {
                                // Word is seperate so just insert new word.
                                var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                var wordAdvance = 0;
                                for (var k = 0; k < newSegments.length; k++) {
                                    wordAdvance += newSegments[k].segmentAdvance;
                                }
                                var newWord = {
                                    startPos: insert.start + editData.insertion.start, wordAdvance: wordAdvance,
                                    wordLength: insert.word.length, segments: newSegments
                                };
                                newWordData.push(newWord);
                                wordCount++;
                                // Check for new lines.
                                var spacesStart = insertData[insertData.length - 1].start + insertData[insertData.length - 1].word.length;
                                var spacesEnd = editData.insertion.start + editData.insertion.text.length;
                                var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                var newLineIndex = startSpaces.indexOf('\n');
                                var runningPos = spacesStart;
                                while (newLineIndex >= 0) {
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
                            else {
                                var seg = word.segments[0];
                                var sty1 = word.segments[0].style;
                                var sty2 = insertStyle;
                                if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                    // Extend the first segment of this word.
                                    var includeNextSeg = false;
                                    var newLength = seg.segmentLength + insert.word.length;
                                    if (word.segments.length > 1) {
                                        var testSty = word.segments[1].style;
                                        if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                            includeNextSeg = true;
                                            newLength += word.segments[1].segmentLength;
                                        }
                                    }
                                    var newText = this.text.substring(word.startPos, word.startPos + newLength);
                                    var newSegments = this.splitSegments(insertStyle, word.startPos, 0, newText);
                                    word.wordAdvance -= seg.segmentAdvance;
                                    word.segments.splice(0, includeNextSeg ? 2 : 1);
                                    var wordAdvance = 0;
                                    for (var k = 0; k < newSegments.length; k++) {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    for (var k = 0; k < word.segments.length; k++) {
                                        word.segments[k].startPos += insert.word.length;
                                    }
                                    word.wordAdvance += wordAdvance;
                                    word.segments = newSegments.concat(word.segments);
                                    newWordData.push(word);
                                    wordCount++;
                                }
                                else {
                                    // Just add another segment and adjust some stuff.
                                    var includeNextSeg = false;
                                    var newLength = insert.word.length;
                                    if (word.segments.length > 1) {
                                        var testSty = word.segments[1].style;
                                        if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                            includeNextSeg = true;
                                            newLength += word.segments[1].segmentLength;
                                        }
                                    }
                                    var newText = this.text.substring(insert.start, insert.start + newLength);
                                    var newSegments = this.splitSegments(insertStyle, word.startPos, 0, newText);
                                    var wordAdvance = 0;
                                    for (var k = 0; k < newSegments.length; k++) {
                                        wordAdvance += newSegments[k].segmentAdvance;
                                    }
                                    for (var k = 0; k < word.segments.length; k++) {
                                        word.segments[k].startPos += insert.word.length;
                                    }
                                    word.wordAdvance += wordAdvance;
                                    word.segments = newSegments.concat(word.segments.slice(includeNextSeg ? 1 : 0));
                                    newWordData.push(word);
                                    wordCount++;
                                }
                            }
                        }
                        else if (editData.insertion.start != word.startPos + word.wordLength && insertData.length > 1) {
                            console.log('Did the end multi insert data.');
                            var seg = null;
                            var segIndex = -1;
                            for (var k = 0; k < word.segments.length; k++) {
                                var segment = word.segments[k];
                                if (editData.insertion.start == segment.startPos + segment.segmentLength) {
                                    seg = segment;
                                    segIndex = k;
                                    if (segment.style.style == insertStyle.style && segment.style.weight == insertStyle.weight) {
                                        break;
                                    }
                                }
                                else if (editData.insertion.start >= segment.startPos && editData.insertion.start < segment.startPos + segment.segmentLength) {
                                    seg = segment;
                                    segIndex = k;
                                    break;
                                }
                            }
                            var sty1 = seg.style;
                            var sty2 = insertStyle;
                            // Add original piece after slice and if there is more than one insert word add the last.
                            if (editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/)) {
                                // Split off last piece as own word and insert last new word.
                                var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                var insertWordAdvance = 0;
                                for (var k = 0; k < newSegments.length; k++) {
                                    insertWordAdvance += newSegments[k].segmentAdvance;
                                }
                                var insertWord = {
                                    startPos: insert.start, wordAdvance: insertWordAdvance,
                                    wordLength: insert.word.length, segments: newSegments
                                };
                                newWordData.push(insertWord);
                                wordCount++;
                                // Check for new lines.
                                var spacesStart = insertData[insertData.length - 1].start + insertData[insertData.length - 1].word.length;
                                var spacesEnd = editData.insertion.start + editData.insertion.text.length;
                                var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                var newLineIndex = startSpaces.indexOf('\n');
                                var runningPos = spacesStart;
                                while (newLineIndex >= 0) {
                                    runningPos += newLineIndex;
                                    startSpaces = startSpaces.substring(newLineIndex, startSpaces.length);
                                    newLinePositions.splice(currentLine, 0, runningPos);
                                    newLineData[currentLine] = { startWord: totalCount, count: wordCount };
                                    currentLine++;
                                    totalCount += wordCount;
                                    wordCount = 0;
                                    newLineIndex = startSpaces.indexOf('\n');
                                }
                                var cutStart = editData.insertion.start + editData.insertion.text.length;
                                var cutLength = seg.startPos + seg.segmentLength + word.startPos - editData.insertion.start;
                                var cutText = this.text.substring(cutStart, cutStart + cutLength);
                                var cutSegments = this.splitSegments(seg.style, word.startPos, 0, cutText);
                                var cutWordAdvance = 0;
                                for (var k = 0; k < cutSegments.length; k++) {
                                    cutWordAdvance += cutSegments[k].segmentAdvance;
                                }
                                for (var k = segIndex + 1; k < word.segments.length; k++) {
                                    cutWordAdvance += word.segments[k].segmentAdvance;
                                    word.segments[k].startPos -= editData.insertion.start - word.startPos;
                                }
                                if (segIndex < word.segments.length) {
                                    cutSegments.push.apply(cutSegments, word.segments.slice(segIndex + 1, word.segments.length));
                                }
                                var cutWord = {
                                    startPos: cutStart, wordAdvance: cutWordAdvance,
                                    wordLength: word.wordLength - (editData.insertion.start - word.startPos), segments: cutSegments
                                };
                                newWordData.push(cutWord);
                                wordCount++;
                            }
                            else {
                                var includeNextSeg = false;
                                var cutLength = seg.startPos + seg.segmentLength + word.startPos - editData.insertion.start;
                                var newSegments = [];
                                var insertWordAdvance = 0;
                                if (segIndex < word.segments.length) {
                                    var testSty = word.segments[segIndex + 1].style;
                                    if (testSty.style == sty1.style && testSty.weight == sty1.weight) {
                                        includeNextSeg = true;
                                        cutLength += word.segments[segIndex + 1].segmentLength;
                                    }
                                }
                                // Merge first piece with first new word
                                if (sty1.style == sty2.style && sty1.weight == sty2.weight) {
                                    // Merge segments.
                                    var newWord = this.text.substring(insert.start, insert.start + insert.word.length + cutLength);
                                    newSegments = this.splitSegments(insertStyle, word.startPos, 0, newWord);
                                    for (var k = segIndex + 1; k < word.segments.length; k++) {
                                        word.segments[k].startPos -= editData.insertion.start - word.startPos;
                                    }
                                    var tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                    if (tmpIndex < word.segments.length) {
                                        newSegments.push.apply(newSegments, word.segments.slice(tmpIndex + 1, word.segments.length));
                                    }
                                }
                                else {
                                    // Add new segment.
                                    var cutText = this.text.substring(insert.start + insert.word.length, insert.start + insert.word.length + cutLength);
                                    var cutSegments = this.splitSegments(seg.style, word.startPos, insert.word.length, cutText);
                                    newSegments = this.splitSegments(insertStyle, word.startPos, 0, insert.word);
                                    if (cutSegments.length > 0) {
                                        newSegments.push.apply(newSegments, cutSegments);
                                    }
                                    for (var k = segIndex + 1; k < word.segments.length; k++) {
                                        word.segments[k].startPos -= editData.insertion.start - word.startPos;
                                    }
                                    var tmpIndex = segIndex + (includeNextSeg ? 1 : 0);
                                    if (tmpIndex < word.segments.length) {
                                        newSegments.push.apply(newSegments, word.segments.slice(tmpIndex + 1, word.segments.length));
                                    }
                                }
                                for (var k = 0; k < newSegments.length; k++) {
                                    insertWordAdvance += newSegments[k].segmentAdvance;
                                }
                                var insertWord = {
                                    startPos: word.startPos, wordAdvance: insertWordAdvance,
                                    wordLength: insert.word.length + word.wordLength - (insert.start - word.startPos), segments: newSegments
                                };
                                newWordData.push(insertWord);
                                wordCount++;
                            }
                        }
                        inserted = true;
                    }
                    else if (!inserted && editData.insertion.start < word.startPos) {
                        console.log('Did the non-insert add.');
                        // Just add new words. This happens when insert was in spaces.
                        inserted = true;
                        if (editData.insertion.text.charAt(0).match(/\s/)) {
                            // Check for new lines.
                            var spacesStart = 0;
                            var spacesEnd = insertData[0].start;
                            var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            var newLineIndex = startSpaces.indexOf('\n');
                            var runningPos = spacesStart;
                            while (newLineIndex >= 0) {
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
                        for (var j = 0; j < insertData.length; j++) {
                            var newSegments = this.splitSegments(insertStyle, word.startPos, 0, insertData[j].word);
                            var wordAdvance = 0;
                            for (var k = 0; k < newSegments.length; k++) {
                                wordAdvance += newSegments[k].segmentAdvance;
                            }
                            var newWord = {
                                startPos: insertData[j].start + editData.insertion.start, wordAdvance: wordAdvance,
                                wordLength: insertData[j].word.length, segments: newSegments
                            };
                            newWordData.push(newWord);
                            wordCount++;
                            if (j < insertData.length - 1) {
                                // Check for new lines.
                                var spacesStart = insertData[j].start + insertData[j].word.length;
                                var spacesEnd = editData.insertion.start + editData.insertion.text.length;
                                var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                                var newLineIndex = startSpaces.indexOf('\n');
                                var runningPos = spacesStart;
                                while (newLineIndex >= 0) {
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
                        if (editData.insertion.text.charAt(editData.insertion.text.length).match(/\s/)) {
                            // Check for new lines.
                            var spacesStart = insertData[insertData.length - 1].start + insertData[insertData.length - 1].word.length;
                            var spacesEnd = editData.insertion.start + editData.insertion.text.length;
                            var startSpaces = editData.insertion.text.substring(spacesStart, spacesEnd);
                            var newLineIndex = startSpaces.indexOf('\n');
                            var runningPos = spacesStart;
                            while (newLineIndex >= 0) {
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
                    else {
                        console.log('Did the final else.');
                        if (word.startPos >= editData.insertion.start) {
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
                if (editData.styleChanges.length > 0 && editData.insertion == null) {
                    var changedSegments = [];
                    var working = [];
                    // Used to add an extra segment beyond the changes at the end. This assists keeping segments from over splitting.
                    var endNextAdded = false;
                    var changesSegsAdvance = 0;
                    var newSegments = [];
                    for (var j = 0; j < editData.styleChanges.length; j++) {
                        var change = editData.styleChanges[j];
                        if (change.start < word.startPos + word.wordLength && change.end > word.startPos) {
                            for (var k = 0; k < word.segments.length; k++) {
                                var seg = word.segments[k];
                                if (change.start < seg.startPos + seg.segmentLength && change.end > seg.startPos) {
                                    if (working.length == 0 || working[working.length - 1] == k - 1) {
                                        // Check for a reset as there was just one segment between sections.
                                        if (endNextAdded) {
                                            endNextAdded = false;
                                        }
                                        if (working.length == 0 && k > 0) {
                                            working.push(k - 1);
                                            changesSegsAdvance += word.segments[k - 1].segmentAdvance;
                                        }
                                        working.push(k);
                                    }
                                    else if (!endNextAdded) {
                                        endNextAdded = true;
                                        working.push(k);
                                        changesSegsAdvance += seg.segmentAdvance;
                                    }
                                    else {
                                        endNextAdded = false;
                                        changedSegments.push(working);
                                        working = [];
                                    }
                                }
                                else if (change.start >= seg.startPos + seg.segmentLength) {
                                    break;
                                }
                            }
                        }
                    }
                    var prevAdded = 0;
                    var newAdvance = 0;
                    for (var j = 0; j < changedSegments.length; j++) {
                        if (prevAdded < changedSegments[j][0]) {
                            newSegments.push.apply(newSegments, word.segments.slice(prevAdded, changedSegments[j][0]));
                        }
                        var localStart = word.segments[changedSegments[j][0]].startPos;
                        var start = word.startPos + localStart;
                        var endSeg = word.segments[changedSegments[j][changedSegments[j].length - 1]];
                        var textLength = endSeg.startPos + endSeg.segmentLength - localStart;
                        var splitText = this.text.substring(start, start + textLength);
                        var newSplit = this.splitWithStyles(word.startPos, localStart, splitText);
                        for (var k = 0; k < newSplit.length; k++) {
                            newAdvance += newSplit[k].segmentAdvance;
                        }
                        newSegments.push.apply(newSegments, newSplit);
                    }
                    word.segments = newSegments;
                    word.wordAdvance += newAdvance - changesSegsAdvance;
                    newWordData.push(word);
                    wordCount++;
                    console.log('Did the style change insert.');
                }
            }
            if (editData.insertion != null && !inserted) {
                // New insert is after all words so add it here.
                for (var j = 0; j < insertData.length; j++) {
                    var newSegments = this.splitSegments(insertStyle, insertData[j].start, 0, insertData[j].word);
                    var wordAdvance = 0;
                    for (var k = 0; k < newSegments.length; k++) {
                        wordAdvance += newSegments[k].segmentAdvance;
                    }
                    var newWord = {
                        startPos: insertData[j].start + editData.insertion.start, wordAdvance: wordAdvance,
                        wordLength: insertData[j].word.length, segments: newSegments
                    };
                    newWordData.push(newWord);
                    wordCount++;
                }
            }
            if (newLineData.length == 0) {
                newLineData[currentLine] = { startWord: 0, count: wordCount };
            }
            this.lineData = newLineData;
            this.linePositions = newLinePositions;
            this.wordData = newWordData;
            console.log('New word data is:');
            console.log(newWordData);
            console.log('Line data is:');
            console.log(newLineData);
            var _a, _b, _c, _d, _e;
        };
        /**
         *
         *
         */
        Element.prototype.calculateTextLines = function () {
            var childText = [];
            var currPos = 0;
            var prevGlyphPos = 0;
            var txtStart = 0;
            var dy = 2 * this.size;
            var computedTextLength;
            var currY = this.y;
            var lineCount = 0;
            var isSpace = false;
            var currStyle = 0;
            var glyphCount = 0;
            if (this.text.length == 0) {
                this.textNodes = [];
                this.glyphCount = 0;
                return;
            }
            for (var k = 0; k < this.lineData.length; k++) {
                console.log('Processing line ' + k);
                computedTextLength = 0;
                var wordNum = 0;
                var wordIdx = this.lineData[k].startWord;
                var wordCount = this.lineData[k].count;
                var startPos = k > 0 ? this.linePositions[k - 1] + 1 : 0;
                var endPos = k < this.lineData.length - 1 ? this.linePositions[k] : this.text.length;
                var insertSpace = false;
                var currentAdvance = 0;
                var lineComplete = false;
                // Keeps the position that a word or space is sliced when a new line is required.
                var slicePos = 0;
                var sliceSeg = 0;
                var wasSpaceLast = false;
                var spaceAdvance = 0;
                var sliceAdvance = 0;
                var tspanEl = void 0;
                var prevSlicePos = 0;
                var numSpaces = 0;
                var lineGlyphCount = 0;
                // Add words and spaces in between.
                while (wordNum < wordCount) {
                    // The text span element to represent a line of glyphs.
                    tspanEl =
                        {
                            x: this.x, y: currY, dx: 0, dy: dy, start: prevGlyphPos, end: 0, endStringPos: 0,
                            spaceRemoved: true, justified: this.isJustified, lineNum: lineCount, sections: []
                        };
                    numSpaces = 0;
                    // Check for leading spaces.
                    if (wordCount > 0) {
                        if (startPos < this.wordData[wordIdx].startPos) {
                            insertSpace = true;
                        }
                    }
                    else if (startPos != endPos) {
                        insertSpace = true;
                    }
                    prevSlicePos = slicePos;
                    slicePos = 0;
                    if (insertSpace) {
                        if (prevSlicePos > 0) {
                            if (spaceAdvance - sliceAdvance > this.width) {
                                var tmpAdvance = 0;
                                // Find the point to split
                                for (var j = prevSlicePos; j < glyphs.length; j++) {
                                    if (tmpAdvance + glyphs[j].xAdvance > this.width) {
                                        slicePos = j + 1;
                                        if (j + 1 >= glyphs.length) {
                                            wasSpaceLast = true;
                                        }
                                    }
                                    tmpAdvance += glyphs[j].xAdvance;
                                }
                                numSpaces += slicePos - prevSlicePos - 1;
                                var newSec = {
                                    startPos: currentAdvance - sliceAdvance, glyphs: glyphs.slice(prevSlicePos, slicePos - 1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[prevSlicePos].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                if (wasSpaceLast) {
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
                            else {
                                numSpaces += glyphs.length - prevSlicePos;
                                // Just add sliced spaces.
                                var newSec = {
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
                        else {
                            var start = this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength;
                            var end = this.wordData[wordIdx + 1].startPos;
                            var text = this.text.substring(start, end);
                            spaceAdvance = this.processSpaceGlyphs(glyphs, text, start);
                            if (spaceAdvance > this.width) {
                                var tmpAdvance = 0;
                                // Find the point to split
                                for (var j = 0; j < glyphs.length; j++) {
                                    if (tmpAdvance + glyphs[j].xAdvance > this.width) {
                                        slicePos = j + 1;
                                        if (j + 1 >= glyphs.length) {
                                            wasSpaceLast = true;
                                        }
                                    }
                                    tmpAdvance += glyphs[j].xAdvance;
                                }
                                numSpaces += slicePos - 1;
                                var newSec = {
                                    startPos: currentAdvance, glyphs: glyphs.slice(0, slicePos - 1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                lineGlyphCount += slicePos - 1;
                                if (wasSpaceLast) {
                                    slicePos = 0;
                                    insertSpace = !insertSpace;
                                    wordIdx++;
                                    wordNum++;
                                }
                                sliceAdvance = tmpAdvance;
                                lineComplete = true;
                                glyphCount += lineGlyphCount;
                            }
                            else {
                                numSpaces += glyphs.length;
                                // Just add spaces.
                                var newSec = {
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
                    else {
                        var word = this.wordData[wordIdx];
                        if (prevSlicePos > 0 || sliceSeg > 0) {
                            if (word.wordAdvance - sliceAdvance > this.width) {
                                var tmpAdvance = 0;
                                var segIndex = sliceSeg;
                                // This word will need splitting.
                                var fDash = -1;
                                var fDashSeg = -1;
                                var fDashGlyph = void 0;
                                var sections = [];
                                // Check Sliced word over.
                                if (word.segments[segIndex].hasHyphen) {
                                    var glyphAdvance = 0;
                                    var seg = word.segments[segIndex];
                                    for (var i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[i].xAdvance <= this.width; i++) {
                                        if (seg.glyphs[i].isHyphen) {
                                            fDash = i;
                                            fDashSeg = segIndex;
                                        }
                                        glyphAdvance += seg.glyphs[i].xAdvance;
                                    }
                                }
                                var endPos_1 = word.segments[segIndex].glyphs.length;
                                if (tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width) {
                                    var glyphAdvance = 0;
                                    var seg = word.segments[segIndex];
                                    while (slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[slicePos].xAdvance <= this.width) {
                                        slicePos++;
                                        sliceSeg = segIndex;
                                        glyphAdvance += seg.glyphs[slicePos].xAdvance;
                                    }
                                    endPos_1 = slicePos;
                                }
                                var newSec = {
                                    startPos: tmpAdvance - sliceAdvance, glyphs: word.segments[segIndex].glyphs.slice(prevSlicePos, endPos_1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[prevSlicePos].stringPositions[0]
                                };
                                sections.push(newSec);
                                tmpAdvance += word.segments[segIndex].segmentAdvance;
                                lineGlyphCount += (endPos_1 - prevSlicePos);
                                // Now check over the rest.
                                for (segIndex = sliceSeg + 1; segIndex < word.segments.length && tmpAdvance < this.width; segIndex++) {
                                    slicePos = 0;
                                    if (word.segments[segIndex].hasHyphen) {
                                        var glyphAdvance = 0;
                                        var seg = word.segments[segIndex];
                                        for (var i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[i].xAdvance <= this.width; i++) {
                                            if (seg.glyphs[i].isHyphen) {
                                                fDash = i;
                                                fDashSeg = segIndex;
                                            }
                                            glyphAdvance += seg.glyphs[i].xAdvance;
                                        }
                                    }
                                    var endPos_2 = word.segments[segIndex].glyphs.length;
                                    if (tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width) {
                                        var glyphAdvance = 0;
                                        var seg = word.segments[segIndex];
                                        while (slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[slicePos].xAdvance <= this.width) {
                                            slicePos++;
                                            sliceSeg = segIndex;
                                            glyphAdvance += seg.glyphs[slicePos].xAdvance;
                                        }
                                        endPos_2 = slicePos;
                                    }
                                    var newSec_1 = {
                                        startPos: tmpAdvance, glyphs: word.segments[segIndex].glyphs.slice(0, endPos_2),
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[0].stringPositions[0]
                                    };
                                    sections.push(newSec_1);
                                    tmpAdvance += word.segments[segIndex].segmentAdvance;
                                    lineGlyphCount += endPos_2;
                                }
                                if (fDash != -1) {
                                    slicePos = fDash + 1;
                                    sliceSeg = fDashSeg;
                                }
                                tspanEl.spaceRemoved = false;
                                sliceAdvance += tmpAdvance;
                                lineComplete = true;
                                glyphCount += lineGlyphCount;
                            }
                            else {
                                // Just add sliced word.
                                // Add sliced seg first.
                                var secEnd = word.segments[sliceSeg].glyphs.length;
                                var newSec = {
                                    startPos: currentAdvance - sliceAdvance, glyphs: word.segments[sliceSeg].glyphs.slice(slicePos, secEnd),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[sliceSeg].glyphs[slicePos].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                currentAdvance += (word.segments[sliceSeg].segmentAdvance - sliceAdvance);
                                // Then add the rest.
                                for (var j = sliceSeg + 1; j < word.segments.length; j++) {
                                    var newSec_2 = {
                                        startPos: currentAdvance, glyphs: word.segments[j].glyphs,
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[j].glyphs[0].stringPositions[0]
                                    };
                                    tspanEl.sections.push(newSec_2);
                                    currentAdvance += word.segments[j].segmentAdvance;
                                    lineGlyphCount += word.segments[j].glyphs.length;
                                }
                                insertSpace = !insertSpace;
                            }
                        }
                        else {
                            if (word.wordAdvance > this.width) {
                                var tmpAdvance = 0;
                                var segIndex = 0;
                                // This word will need splitting.
                                var fDash = -1;
                                var fDashSeg = -1;
                                var fDashGlyph = void 0;
                                var sections = [];
                                for (segIndex = 0; segIndex < word.segments.length && tmpAdvance < this.width; segIndex++) {
                                    slicePos = 0;
                                    if (word.segments[segIndex].hasHyphen) {
                                        var glyphAdvance = 0;
                                        var seg = word.segments[segIndex];
                                        var glyph = seg.glyphs[0];
                                        for (var i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + glyph.xAdvance <= this.width; i++) {
                                            glyph = seg.glyphs[i];
                                            if (seg.glyphs[i].isHyphen) {
                                                fDash = i;
                                                fDashSeg = segIndex;
                                            }
                                            glyphAdvance += glyph.xAdvance * 1000 / this.size;
                                        }
                                    }
                                    var endPos_3 = word.segments[segIndex].glyphs.length;
                                    if (tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width) {
                                        var glyphAdvance = 0;
                                        var seg = word.segments[segIndex];
                                        var glyph = seg.glyphs[slicePos];
                                        while (slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + glyph.xAdvance * 1000 / this.size <= this.width) {
                                            slicePos++;
                                            sliceSeg = segIndex;
                                            glyph = seg.glyphs[slicePos];
                                            glyphAdvance += glyph.xAdvance * 1000 / this.size;
                                        }
                                        endPos_3 = slicePos;
                                    }
                                    var newSec = {
                                        startPos: tmpAdvance, glyphs: word.segments[segIndex].glyphs.slice(0, endPos_3),
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[0].stringPositions[0]
                                    };
                                    sections.push(newSec);
                                    tmpAdvance += word.segments[segIndex].segmentAdvance;
                                    lineGlyphCount += endPos_3;
                                }
                                if (fDash != -1) {
                                    slicePos = fDash + 1;
                                    sliceSeg = fDashSeg;
                                }
                                tspanEl.spaceRemoved = false;
                                sliceAdvance = tmpAdvance;
                                lineComplete = true;
                                glyphCount += lineGlyphCount;
                            }
                            else {
                                // Just add word.
                                for (var j = 0; j < word.segments.length; j++) {
                                    var newSec = {
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
                    while (!lineComplete && wordIdx < wordCount) {
                        if (insertSpace) {
                            var start = this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength;
                            var end = this.wordData[wordIdx + 1].startPos;
                            var text = this.text.substring(start, end);
                            spaceAdvance = this.processSpaceGlyphs(glyphs, text, start);
                            if (spaceAdvance > this.width) {
                                var tmpAdvance = 0;
                                // Find the point to split
                                for (var j = 0; j < glyphs.length; j++) {
                                    if (tmpAdvance + glyphs[j].xAdvance * 1000 / this.size > this.width) {
                                        slicePos = j + 1;
                                        if (j + 1 >= glyphs.length) {
                                            wasSpaceLast = true;
                                        }
                                    }
                                    tmpAdvance += glyphs[j].xAdvance * 1000 / this.size;
                                }
                                numSpaces += slicePos - 1;
                                var newSec = {
                                    startPos: currentAdvance, glyphs: glyphs.slice(0, slicePos - 1),
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                if (wasSpaceLast) {
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
                            else {
                                numSpaces += glyphs.length;
                                // Just add spaces.
                                var newSec = {
                                    startPos: currentAdvance, glyphs: glyphs,
                                    startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[0].stringPositions[0]
                                };
                                tspanEl.sections.push(newSec);
                                currentAdvance += spaceAdvance;
                                lineGlyphCount += glyphs.length;
                                insertSpace = !insertSpace;
                            }
                        }
                        else {
                            var word = this.wordData[wordIdx];
                            if (word.wordAdvance > this.width) {
                                var tmpAdvance = 0;
                                var segIndex = 0;
                                // This word will need splitting.
                                var fDash = -1;
                                var fDashSeg = -1;
                                var fDashGlyph = void 0;
                                var sections = [];
                                for (segIndex = 0; segIndex < word.segments.length && tmpAdvance < this.width; segIndex++) {
                                    if (word.segments[segIndex].hasHyphen) {
                                        var glyphAdvance = 0;
                                        var seg = word.segments[segIndex];
                                        for (var i = 0; i < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[i].xAdvance <= this.width; i++) {
                                            if (seg.glyphs[i].isHyphen) {
                                                fDash = i;
                                                fDashSeg = segIndex;
                                            }
                                            glyphAdvance += seg.glyphs[i].xAdvance;
                                        }
                                    }
                                    var endPos_4 = word.segments[segIndex].glyphs.length;
                                    if (tmpAdvance + word.segments[segIndex].segmentAdvance >= this.width) {
                                        var glyphAdvance = 0;
                                        var seg = word.segments[segIndex];
                                        while (slicePos < seg.glyphs.length && tmpAdvance + glyphAdvance + seg.glyphs[slicePos].xAdvance <= this.width) {
                                            slicePos++;
                                            sliceSeg = segIndex;
                                            glyphAdvance += seg.glyphs[slicePos].xAdvance;
                                        }
                                        endPos_4 = slicePos;
                                    }
                                    var newSec = {
                                        startPos: tmpAdvance, glyphs: word.segments[segIndex].glyphs.slice(0, endPos_4),
                                        startGlyph: lineGlyphCount + glyphCount, stringStart: word.segments[segIndex].glyphs[0].stringPositions[0]
                                    };
                                    sections.push(newSec);
                                    lineGlyphCount += endPos_4;
                                    tmpAdvance += word.segments[segIndex].segmentAdvance;
                                }
                                if (fDash != -1) {
                                    slicePos = fDash + 1;
                                    sliceSeg = fDashSeg;
                                    tspanEl.spaceRemoved = false;
                                    sliceAdvance = tmpAdvance;
                                    glyphCount += lineGlyphCount;
                                    (_a = tspanEl.sections).push.apply(_a, sections);
                                }
                                lineComplete = true;
                            }
                            else {
                                // Just add word.
                                for (var j = 0; j < word.segments.length; j++) {
                                    var newSec = {
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
                    var reqAdjustment = this.width - currentAdvance;
                    var extraSpace = 0;
                    if (tspanEl.justified) {
                        extraSpace = reqAdjustment / numSpaces;
                    }
                    var currentDist = 0;
                    for (var j = 0; j < tspanEl.sections.length; j++) {
                        var sec = tspanEl.sections[j];
                        if (sec.glyphs[0].isSpace) {
                            sec.startPos = currentDist;
                            for (var i = 0; i < sec.glyphs.length; i++) {
                                sec.glyphs[i].xAdvance += extraSpace * this.size / 1000;
                                currentDist += sec.glyphs[i].xAdvance * 1000 / this.size;
                            }
                        }
                        else {
                            var secAdvance = 0;
                            if (j + 1 < tspanEl.sections.length) {
                                secAdvance = tspanEl.sections[j + 1].startPos - sec.startPos;
                            }
                            sec.startPos = currentDist;
                            currentDist += secAdvance;
                        }
                    }
                    tspanEl.endStringPos = currPos;
                    tspanEl.end = tspanEl.start + lineGlyphCount;
                    prevGlyphPos = tspanEl.start + lineGlyphCount + (tspanEl.spaceRemoved ? 1 : 0);
                    if (lineComplete) {
                        childText.push(tspanEl);
                    }
                    lineCount++;
                    currentAdvance = 0;
                }
                var lineEnd = this.text.length;
                if (k + 1 < this.lineData.length) {
                    lineEnd = this.linePositions[k + 1];
                }
                // Check for trailing spaces.
                if (!lineComplete && wordCount > 0 && lineEnd > this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength) {
                    sliceAdvance = 0;
                    var first = true;
                    var start = this.wordData[wordIdx].startPos + this.wordData[wordIdx].wordLength;
                    var text = this.text.substring(start, lineEnd);
                    spaceAdvance = this.processSpaceGlyphs(glyphs, text, start);
                    while (prevSlicePos > 0 || first) {
                        first = false;
                        if (spaceAdvance - sliceAdvance > this.width) {
                            var tmpAdvance = 0;
                            // Find the point to split
                            for (var j = prevSlicePos; j < glyphs.length; j++) {
                                if (tmpAdvance + glyphs[j].xAdvance > this.width) {
                                    slicePos = j + 1;
                                    if (j + 1 >= glyphs.length) {
                                        wasSpaceLast = true;
                                    }
                                }
                                tmpAdvance += glyphs[j].xAdvance;
                            }
                            numSpaces += slicePos - prevSlicePos - 1;
                            var newSec = {
                                startPos: currentAdvance - sliceAdvance, glyphs: glyphs.slice(prevSlicePos, slicePos - 1),
                                startGlyph: lineGlyphCount + glyphCount, stringStart: glyphs[prevSlicePos].stringPositions[0]
                            };
                            tspanEl.sections.push(newSec);
                            if (wasSpaceLast) {
                                slicePos = 0;
                                insertSpace = !insertSpace;
                                wordIdx++;
                                wordNum++;
                            }
                            sliceAdvance += tmpAdvance;
                            lineComplete = true;
                        }
                        else {
                            numSpaces += glyphs.length - prevSlicePos;
                            // Just add sliced spaces.
                            var newSec = {
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
                if (!lineComplete) {
                    tspanEl.justified = false;
                    // This was the last line so we didnt remove a string character.
                    if (k == this.lines.length - 1) {
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
            if (lineCount * 2 * this.size > this.height) {
                this.resize(this.width, lineCount * 2 * this.size, new Date());
                this.hasResized = true;
            }
            this.textNodes = childText;
            this.glyphCount = glyphCount;
            console.log('Glyph count is: ' + glyphCount + '. New text nodes are: ');
            console.log(this.textNodes);
            return true;
            var _a;
        };
        /**
         *
         *
         */
        Element.prototype.processGlyphs = function (glyphs, style, word, stringStart) {
            var _this = this;
            var fontSet = 'NORMAL';
            if (style.weight == 'bold') {
                if (style.style == 'italic') {
                    fontSet = 'BOLDITALIC';
                }
                else {
                    fontSet = 'BOLD';
                }
            }
            else {
                if (style.style == 'italic') {
                    fontSet = 'ITALIC';
                }
            }
            var hasHyphen = false;
            var tempGlyphs;
            if (fontHelper[fontSet] == null || fontHelper[fontSet] == undefined) {
                var callback = function () {
                    if (!_this.isDeleted) {
                        // TODO: Adjust cursor start and end after replacement of tofu.
                        console.log("Width now is: " + _this.width);
                        _this.calculateTextLines();
                        if (_this.isSelected) {
                            _this.findCursorElems();
                        }
                        _this.updateView({
                            textNodes: _this.textNodes, width: _this.width, height: _this.height,
                            cursor: _this.cursor, cursorElems: _this.cursorElems, waiting: false
                        });
                        _this.updateBoardView(_this.currentViewState);
                    }
                };
                if (loadingFonts[fontSet] === true) {
                    if (this.waitingForFont[fontSet] == null || this.waitingForFont[fontSet] == undefined) {
                        var callbackID = loadCallbacks[fontSet].length;
                        loadCallbacks[fontSet][callbackID] = callback;
                        this.waitingForFont[fontSet] = callbackID;
                    }
                }
                else {
                    var callbackID = this.getAdditionalFont(fontSet, callback);
                    this.waitingForFont[fontSet] = callbackID;
                }
                // Add TOFU in place of font glyphs.
                tempGlyphs = { glyphs: [], positions: [] };
                for (var i = 0; i < word.length; i++) {
                    tempGlyphs.glyphs[i] =
                        {
                            id: 0, advanceWidth: 1229, advanceHeight: 2789, isLigature: false, isMark: false, codePoints: [-1],
                            path: 'M193 1462L1034 1462L1034 0L193 0ZM297 104L930 104L930 1358L297 1358Z', stringPositions: [i]
                        };
                    tempGlyphs.positions[i] =
                        {
                            xAdvance: 1229, xOffset: 0, yAdvance: 0, yOffset: 0
                        };
                }
            }
            else {
                tempGlyphs = fontHelper[fontSet].layout(word);
            }
            var currentStyle = style;
            var startAdvance = 0;
            for (var i = 0; i < tempGlyphs.glyphs.length; i++) {
                if (style.end < tempGlyphs.glyphs[i].stringPositions[0] + stringStart) {
                    var nxtIdx = currentStyle.seq_num + 1;
                    currentStyle = this.styleSet[nxtIdx];
                }
                var isHyph = false;
                if (tempGlyphs.glyphs[i].codePoints.length == 1 && isHyphen(tempGlyphs.glyphs[i].codePoints[0])) {
                    isHyph = true;
                    hasHyphen = true;
                }
                var newGlyph = {
                    isLigature: tempGlyphs.glyphs[i].isLigature, isMark: tempGlyphs.glyphs[i].isMark, startAdvance: startAdvance,
                    codePoints: tempGlyphs.glyphs[i].codePoints, path: tempGlyphs.glyphs[i].path, stringPositions: tempGlyphs.glyphs[i].stringPositions,
                    colour: style.colour, uline: style.uline, oline: style.oline, tline: style.tline, xAdvance: tempGlyphs.positions[i].xAdvance,
                    yAdvance: tempGlyphs.positions[i].yAdvance, xOffset: tempGlyphs.positions[i].xOffset, yOffset: tempGlyphs.positions[i].yOffset,
                    isSpace: false, isHyphen: isHyph
                };
                // TODO: Vertical Text
                startAdvance += newGlyph.xAdvance;
                glyphs[i] = newGlyph;
                for (var j = 0; j < tempGlyphs.glyphs[i].stringPositions.length; j++) {
                    tempGlyphs.glyphs[i].stringPositions[j] += stringStart;
                }
            }
            return hasHyphen;
        };
        /**
         *
         *
         */
        Element.prototype.processSpaceGlyphs = function (glyphs, word, stringStart) {
            var tempGlyphs = { glyphs: [], positions: [] };
            var advance = 0;
            for (var i = 0; i < word.length; i++) {
                if (word.charAt(i) == '\t') {
                    glyphs[i] =
                        {
                            xAdvance: 2128, xOffset: 0, yAdvance: 0, yOffset: 0, startAdvance: advance,
                            isLigature: false, isMark: false, codePoints: [9], path: '', stringPositions: [i],
                            colour: null, uline: null, oline: null, tline: null, isSpace: true, isHyphen: false
                        };
                }
                else {
                    glyphs[i] =
                        {
                            xAdvance: 532, xOffset: 0, yAdvance: 0, yOffset: 0, startAdvance: advance,
                            isLigature: false, isMark: false, codePoints: [9], path: '', stringPositions: [i],
                            colour: null, uline: null, oline: null, tline: null, isSpace: true, isHyphen: false
                        };
                }
                for (var j = 0; j < glyphs[i].stringPositions.length; j++) {
                    glyphs[i].stringPositions[j] += stringStart;
                }
                advance += glyphs[i].xAdvance;
            }
            return advance;
        };
        /**
         *
         *
         */
        Element.prototype.findXHelper = function (isUp, relative) {
            var i;
            var line;
            if (isUp) {
                i = 1;
                while (i < this.textNodes.length && relative > this.textNodes[i].end) {
                    i++;
                }
                line = this.textNodes[i - 1];
            }
            else {
                i = 0;
                while (i < this.textNodes.length - 1 && relative > this.textNodes[i].end) {
                    i++;
                }
                line = this.textNodes[i + 1];
            }
            if (line.sections.length == 0) {
                return line.start;
            }
            i = 0;
            while (i < line.sections.length && this.idealX >= line.sections[i].startPos) {
                i++;
            }
            var secIdx = i - 1;
            var sec = line.sections[secIdx];
            i = 0;
            while (i < sec.glyphs.length && this.idealX >= (sec.startPos + sec.glyphs[i].startAdvance) * this.size / 1000) {
                i++;
            }
            var curr = i - 1;
            var glyph = sec.glyphs[curr];
            // i and currMes is now the position to the right of the search point.
            // We just need to check if left or right is closer then reurn said point.
            var selPoint;
            var glyphStart = sec.startPos + glyph.startAdvance * this.size / 1000;
            var glyphEnd = glyphStart + glyph.xAdvance * this.size / 1000;
            if (this.idealX - glyphStart > glyphEnd - this.idealX) {
                selPoint = line.start + curr + 1;
            }
            else {
                selPoint = line.start + curr;
            }
            return selPoint;
        };
        /**
         *
         *
         */
        Element.prototype.isCurrentStyle = function (style, pallete) {
            if (style.colour == pallete.colour && style.oline == pallete.isOverline() && style.uline == pallete.isUnderline() &&
                style.tline == pallete.isThroughline() && style.weight == pallete.getWeight() && style.style == pallete.getStyle()) {
                return true;
            }
            else {
                return false;
            }
        };
        /**
         *
         * @param soretedSelect  The selection to remove sorted in reverse order.
         */
        Element.prototype.removeSelection = function (sortedSelect) {
            for (var i = 0; i < sortedSelect.length; i++) {
                // Remove all selected characters and shift style positions.
                this.removeCharacter(sortedSelect[i]);
            }
        };
        /**
         *
         * This method might be a bit slow as it removes each character individually. TODO: Check for slow behaviour and resolve if necessary.
         */
        Element.prototype.removeCharacter = function (index) {
            this.text = this.text.substring(0, index) + this.text.substring(index + 1, this.text.length);
            var newStyles = [];
            for (var i = 0; i < this.styleSet.length; i++) {
                var sty = this.styleSet[i];
                var styEnd = sty.end;
                var styStart = sty.start;
                // Move the end back if necessary.
                if (styEnd > index) {
                    styEnd--;
                }
                // Move the start back if necessary.
                if (styStart > index) {
                    styStart--;
                }
                // Don't push this style onto the new set if it has been removed.
                if (styStart != index || styEnd != index) {
                    // Check to see if we can just extend last style pushed onto new styles.
                    if (newStyles.length > 0 && this.stylesMatch(newStyles[newStyles.length - 1], sty)
                        && newStyles[newStyles.length - 1].end - newStyles[newStyles.length - 1].start + styEnd - styStart <= MAX_STYLE_LENGTH) {
                        // If this is the same as the previous style and are length compatible then combine
                        newStyles[newStyles.length - 1].end += styEnd - styStart;
                        newStyles[newStyles.length - 1].text = this.text.slice(newStyles[newStyles.length - 1].start, newStyles[newStyles.length - 1].end);
                    }
                    else {
                        // Push this style onto the new stack
                        newStyles.push({
                            start: styStart, end: styEnd, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                            style: sty.style, weight: sty.weight, text: this.text.slice(styStart, styEnd), seq_num: newStyles.length
                        });
                    }
                }
            }
            this.styleSet = newStyles;
        };
        /**
         *
         *
         */
        Element.prototype.stylesMatch = function (style1, style2) {
            return style1.colour == style2.colour && style1.oline == style2.oline && style1.uline == style2.uline && style1.tline == style2.tline
                && style1.weight == style2.weight;
        };
        /**
         *
         *
         */
        Element.prototype.insertText = function (text, newStyle) {
            // Now Insert the string at the stringStart position.
            var isNew = true;
            var textStart = this.text.slice(0, this.stringStart);
            var textEnd = this.text.slice(this.stringStart, this.text.length);
            var styles = [];
            var fullText = textStart + text + textEnd;
            var hasInserted = false;
            var newSty = null;
            // Create new style set.
            for (var i = 0; i < this.styleSet.length; i++) {
                var sty = this.styleSet[i];
                if (sty.start >= this.stringStart) {
                    if (!hasInserted) {
                        if (text.length <= MAX_STYLE_LENGTH) {
                            // Insert the new style
                            styles.push({
                                start: this.stringStart, end: this.stringStart + text.length, colour: newStyle.colour, oline: newStyle.oline,
                                uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                text: fullText.slice(this.stringStart, this.stringStart + text.length), seq_num: styles.length
                            });
                        }
                        else {
                            // New Style would be too long so split it up.
                            var splitArray = this.getStyleSplits(text.length);
                            var prevStart = 0;
                            for (var j = 0; j < splitArray.length; j++) {
                                styles.push({
                                    start: this.stringStart + prevStart, end: this.stringStart + splitArray[j], colour: newStyle.colour,
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
                    if (styles.length > 0 && this.stylesMatch(styles[styles.length - 1], sty)
                        && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= MAX_STYLE_LENGTH) {
                        // If this is the same as the previous style and are length compatible then combine
                        styles[styles.length - 1].end += sty.end - sty.start;
                        styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                    }
                    else {
                        styles.push({
                            start: sty.start + text.length, end: sty.end + text.length, colour: sty.colour, oline: sty.oline, uline: sty.uline,
                            tline: sty.tline, style: sty.style, weight: sty.weight, text: fullText.slice(sty.start + text.length, sty.end + text.length),
                            seq_num: styles.length
                        });
                    }
                }
                else {
                    if (sty.end < this.stringStart) {
                        // Completely before selection
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({
                            start: sty.start, end: sty.end, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                            style: sty.style, weight: sty.weight, text: sty.text, seq_num: styles.length
                        });
                    }
                    else {
                        // Split by selection
                        if (this.stylesMatch(sty, newStyle)) {
                            if (sty.end - sty.start + text.length <= MAX_STYLE_LENGTH) {
                                styles.push({
                                    start: sty.start, end: sty.end + text.length, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                                    style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, sty.end + text.length), seq_num: styles.length
                                });
                            }
                            else {
                                // New Style would be too long so split it up.
                                var splitArray = this.getStyleSplits(sty.end - sty.start + text.length);
                                var prevStart = 0;
                                for (var j = 0; j < splitArray.length; j++) {
                                    styles.push({
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
                        else {
                            // Style before the new split
                            styles.push({
                                start: sty.start, end: this.stringStart, colour: sty.colour, oline: sty.oline, uline: sty.uline, tline: sty.tline,
                                style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, this.stringStart), seq_num: styles.length
                            });
                            if (text.length <= MAX_STYLE_LENGTH) {
                                // Insert the new style
                                styles.push({
                                    start: this.stringStart, end: this.stringStart + text.length, colour: newStyle.colour, oline: newStyle.oline,
                                    uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                    text: fullText.slice(this.stringStart, this.stringStart + text.length), seq_num: styles.length
                                });
                            }
                            else {
                                // New Style would be too long so split it up.
                                var splitArray = this.getStyleSplits(text.length);
                                var prevStart = 0;
                                for (var j = 0; j < splitArray.length; j++) {
                                    styles.push({
                                        start: this.stringStart + prevStart, end: this.stringStart + splitArray[j], colour: newStyle.colour,
                                        oline: newStyle.oline, uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                                        text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), seq_num: styles.length
                                    });
                                    prevStart = splitArray[j];
                                }
                            }
                            newSty = styles[styles.length - 1];
                            hasInserted = true;
                            if (this.stringStart != sty.end) {
                                // Style after the new split
                                styles.push({
                                    start: this.stringStart + text.length, end: sty.end + text.length, colour: sty.colour, oline: sty.oline,
                                    uline: sty.uline, tline: sty.tline, style: sty.style, weight: sty.weight,
                                    text: fullText.slice(this.stringStart + text.length, sty.end + text.length), seq_num: styles.length
                                });
                            }
                        }
                    }
                }
            }
            if (!hasInserted) {
                // Insert the new style at the end of the list.
                if (text.length <= MAX_STYLE_LENGTH) {
                    // Insert the new style
                    styles.push({
                        start: this.stringStart, end: this.stringStart + text.length, colour: newStyle.colour, oline: newStyle.oline,
                        uline: newStyle.uline, tline: newStyle.tline, style: newStyle.style, weight: newStyle.weight,
                        text: fullText.slice(this.stringStart, this.stringStart + text.length), seq_num: styles.length
                    });
                }
                else {
                    // New Style would be too long so split it up.
                    var splitArray = this.getStyleSplits(text.length);
                    var prevStart = 0;
                    for (var j = 0; j < splitArray.length; j++) {
                        styles.push({
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
        };
        /** A helper function to chunk styles to the maximum style size.
         *
         *
         */
        Element.prototype.getStyleSplits = function (length) {
            var slices = [];
            var lengthCount = 0;
            while (lengthCount < length) {
                slices.push(length - lengthCount < MAX_STYLE_LENGTH ? length : MAX_STYLE_LENGTH);
                lengthCount += length - lengthCount < MAX_STYLE_LENGTH ? length - lengthCount : MAX_STYLE_LENGTH;
            }
            console.log("Split array for long style is: ");
            console.log(slices);
            return slices;
        };
        /**
         *
         *
         */
        Element.prototype.newEdit = function () {
            var _this = this;
            this.editCount++;
            if (this.editCount > 5) {
                // Notify of changes and clear that pesky timeout
                this.editCount = 0;
                clearTimeout(this.editTimer);
                return this.textEdited();
            }
            else {
                // Set timeout
                var self_3 = this;
                clearTimeout(this.editTimer);
                this.editTimer = setTimeout(function () {
                    self_3.editCount = 0;
                    self_3.sendServerMsg(self_3.textEdited());
                    clearTimeout(_this.editTimer);
                }, 6000);
                return null;
            }
        };
        /** Generate the set of text lines, denoted by the newline characters in the text.
         *  These are given in terms of arrays of spaces and words.
         *
         *
         */
        Element.prototype.generateLines = function () {
            var linesText = [];
            var lines = [];
            var textSort = this.text;
            while (textSort.indexOf('\n') != -1) {
                linesText.push(textSort.substring(0, textSort.indexOf('\n')));
                textSort = textSort.substring(textSort.indexOf('\n') + 1, textSort.length);
            }
            linesText.push(textSort.substring(0, textSort.length));
            for (var i = 0; i < linesText.length; i++) {
                var lineText = linesText[i];
                var txtStart = 0;
                var isWhiteSpace = true;
                var lineData = { words: [], spaces: [], startSpace: true };
                var j = void 0;
                for (j = 0; j < lineText.length; j++) {
                    if (isWhiteSpace) {
                        if (!lineText.charAt(j).match(/\s/)) {
                            if (j > 0) {
                                lineData.spaces.push(lineText.substring(txtStart, j));
                                txtStart = j;
                                isWhiteSpace = false;
                            }
                            else {
                                lineData.startSpace = false;
                                isWhiteSpace = false;
                            }
                        }
                    }
                    else {
                        if (lineText.charAt(j).match(/\s/)) {
                            lineData.words.push(lineText.substring(txtStart, j));
                            txtStart = j;
                            isWhiteSpace = true;
                        }
                    }
                }
                if (isWhiteSpace) {
                    lineData.spaces.push(lineText.substring(txtStart, j));
                }
                else {
                    lineData.words.push(lineText.substring(txtStart, j));
                }
                lines[i] = lineData;
            }
            this.lines = lines;
        };
        /**
         *
         *
         */
        Element.prototype.completeEdit = function (userId, editId) {
            var fullText = '';
            var editData = this.editInBuffer[userId][editId];
            for (var i = 0; i < editData.styles.length; i++) {
                this.styleSet[editData.styles[i].seq_num] = editData.styles[i];
            }
            for (var i = 0; i < this.styleSet.length; i++) {
                fullText += this.styleSet[i].text;
            }
            this.text = fullText;
            this.generateLines();
            this.calculateTextLines();
            if (this.isSelected) {
                this.findCursorElems();
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
        };
        /**
         *
         *
         */
        Element.prototype.textEdited = function () {
            var editNum = this.editNum++;
            this.editOutBuffer[editNum] = [];
            for (var i = 0; i < this.styleSet.length; i++) {
                this.editOutBuffer[editNum].push(this.styleSet[i]);
            }
            var payload = { bufferId: editNum, num_styles: this.editOutBuffer[editNum].length, nodes: this.editOutBuffer[editNum] };
            var msg = { header: MessageTypes.EDIT, payload: payload };
            return msg;
        };
        /**
         *
         *
         */
        Element.prototype.findStringPositions = function () {
            this.selectedCharacters = [];
            var found = [];
            var newStringStart = null;
            if (this.textNodes.length == 0) {
                this.stringStart = 0;
                return;
            }
            for (var i = 0; i < this.textNodes.length; i++) {
                var line = this.textNodes[i];
                if (this.cursorEnd < line.start) {
                    this.stringStart = newStringStart;
                    return;
                }
                if (line.end >= this.cursorStart) {
                    var largestStringPos = 0;
                    if (i > 0) {
                        largestStringPos = this.textNodes[i - 1].endStringPos;
                    }
                    for (var j = 0; j < line.sections.length; j++) {
                        var sec = line.sections[j];
                        if (this.cursorStart < line.start + sec.startGlyph + sec.glyphs.length && this.cursorEnd > line.start + sec.startGlyph) {
                            // There is a special catch for the final glyph here, when the cursor is at the end of text we need the next glyph back.
                            for (var gPos = this.cursorStart - 1 > line.start ? this.cursorStart - 1 - line.start : 0; gPos < sec.glyphs.length; gPos++) {
                                var glyph = sec.glyphs[gPos];
                                if (line.start + sec.startGlyph + j >= this.cursorStart && line.start + sec.startGlyph + j <= this.cursorEnd) {
                                    for (var k = 0; k < glyph.stringPositions.length; k++) {
                                        if (newStringStart == null || glyph.stringPositions[k] < newStringStart) {
                                            newStringStart = glyph.stringPositions[k];
                                        }
                                        if (glyph.stringPositions[k] > largestStringPos) {
                                            largestStringPos = glyph.stringPositions[k];
                                        }
                                        if (found[glyph.stringPositions[k]] === undefined && line.start + j != this.cursorEnd) {
                                            found[glyph.stringPositions[k]] = true;
                                            this.selectedCharacters.push(glyph.stringPositions[k]);
                                        }
                                    }
                                }
                                else if (line.start + j == this.cursorStart - 1) {
                                    for (var k = 0; k < glyph.stringPositions.length; k++) {
                                        if (glyph.stringPositions[k] > largestStringPos) {
                                            largestStringPos = glyph.stringPositions[k];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (line.end == this.cursorStart) {
                        newStringStart = largestStringPos + 1;
                    }
                    // If there is a space removed and the end selection is after this line, add the space string position.
                    if (this.cursorEnd > line.end && line.spaceRemoved) {
                        if (line.sections.length == 0) {
                            if (found[largestStringPos] === undefined) {
                                found[largestStringPos] = true;
                                this.selectedCharacters.push(largestStringPos);
                            }
                        }
                        else {
                            if (found[largestStringPos + 1] === undefined) {
                                found[largestStringPos + 1] = true;
                                this.selectedCharacters.push(largestStringPos + 1);
                            }
                        }
                    }
                }
                else if (i == this.textNodes.length - 1) {
                    // This was the last line but the cursor is after it (this happens when there was a space removed) we can cheat because it is at the end.
                    newStringStart = this.text.length;
                }
            }
            this.stringStart = newStringStart;
        };
        /**
         *
         *
         */
        Element.prototype.wordMerger = function (undoStart, undoEnd) {
            // Merge letter undo/redos into word undo redos beyond previous word.
            if (this.prevWordStart != null && this.prevWordEnd != null) {
                var newOp = { undo: this.operationStack[undoStart].undo, redo: this.operationStack[undoEnd - 1].redo };
                this.cursorUndoPositions[undoStart].end = this.cursorUndoPositions[undoEnd - 1].end;
                this.cursorUndoPositions[undoStart].bStart = this.cursorUndoPositions[undoEnd - 1].bStart;
                var diff = 0;
                for (var i = 1; i < undoEnd - undoStart; i++) {
                    diff += this.cursorUndoPositions[undoStart + i].prevEnd - this.cursorUndoPositions[undoStart + i].start;
                }
                this.cursorUndoPositions[undoStart].prevEnd += diff;
                this.cursorRedoPositions[undoEnd - 1].start = this.cursorRedoPositions[undoStart].start;
                this.cursorRedoPositions[undoEnd - 1].bPrevEnd = this.cursorRedoPositions[undoStart].bPrevEnd;
                this.operationStack.splice(undoStart, undoEnd - undoStart, newOp);
                this.cursorUndoPositions.splice(undoStart + 1, undoEnd - undoStart - 1);
                this.cursorRedoPositions.splice(undoStart, undoEnd - undoStart - 1);
                this.prevWordEnd = this.wordEnd - (undoEnd - undoStart - 1);
                this.prevWordStart = this.wordStart - (undoEnd - undoStart - 1);
                this.operationPos -= undoEnd - undoStart - 1;
                if (this.lastFowardEdit != null) {
                    this.lastFowardEdit -= undoEnd - undoStart - 1;
                }
            }
            else {
                this.prevWordEnd = this.wordEnd;
                this.prevWordStart = this.wordStart;
            }
            // If there is more than one non-consecutive space, push through again.
            this.wordStart = this.operationPos;
            this.wordEnd = this.wordStart;
        };
        /**
         *
         *
         */
        Element.prototype.getAdditionalFont = function (fontSet, callback) {
            loadingFonts[fontSet] = true;
            loadCallbacks[fontSet] = [];
            var callbackID = loadCallbacks[fontSet].length;
            if (callback != null) {
                loadCallbacks[fontSet][callbackID] = callback;
            }
            var req = self.indexedDB.open("fonts", 1);
            req.onsuccess = function (event) {
                var db = event.target.result;
                var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
                var normReq = fontObjectStore.get(fontSet);
                normReq.onerror = function (event) {
                    // TODO: Handle errors!
                    console.log("Was error.");
                };
                normReq.onsuccess = function (event) {
                    if (normReq.result == null || normReq.result == undefined) {
                        var normReqExt_1 = new XMLHttpRequest();
                        normReqExt_1.open("GET", fontList[fontSet].file, true);
                        normReqExt_1.responseType = "arraybuffer";
                        normReqExt_1.onload = function (oEvent) {
                            var arrayBuffer = normReqExt_1.response;
                            var buffer = new NodeBuffer.Buffer(arrayBuffer);
                            fontHelper[fontSet] = fontkit.create(buffer);
                            for (var i = 0; i < loadCallbacks[fontSet].length; i++) {
                                loadCallbacks[fontSet][i]();
                            }
                            var fontData = { fontName: fontSet, fontBuffer: arrayBuffer };
                            var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
                            var req = fontObjectStore.put(fontData);
                            req.onerror = function (event) {
                                // Handle errors!
                                console.log("Was error.");
                            };
                        };
                        normReqExt_1.send(null);
                    }
                    else {
                        var font = normReq.result.fontBuffer;
                        if (font != null) {
                            var arrayBuffer = normReq.result.fontBuffer;
                            var buffer = new NodeBuffer.Buffer(arrayBuffer);
                            fontHelper[fontSet] = fontkit.create(buffer);
                            for (var i = 0; i < loadCallbacks[fontSet].length; i++) {
                                loadCallbacks[fontSet][i]();
                            }
                        }
                        else {
                            // TODO: Generally shouldn't happen but should handle it.
                            console.log("Was null.");
                        }
                    }
                };
            };
            /* TODO: Handle these errors, may need to tell user to close and open tab. Also make sure upgrade needed has completed. */
            req.onerror = function (event) {
                console.error("Database error: " + event.target.errorCode);
            };
            req.onupgradeneeded = function (event) {
                console.log("IndexedDB error.");
            };
            return callbackID;
        };
        return Element;
    }(BoardElement));
    WhiteBoardText.Element = Element;
})(WhiteBoardText || (WhiteBoardText = {}));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var fontList = [];
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
var fontHelper = [];
var loadCallbacks = [];
var loadingFonts = [];
// Always load the basic latin font set.
loadingFonts['NORMAL'] = true;
loadCallbacks['NORMAL'] = [];
loadingFonts['BOLD'] = true;
loadCallbacks['BOLD'] = [];
loadingFonts['ITALIC'] = true;
loadCallbacks['ITALIC'] = [];
loadingFonts['BOLDITALIC'] = true;
loadCallbacks['BOLDITALIC'] = [];
var getFont = function (fontName, fontObjectStore, db) {
    var req = fontObjectStore.get(fontName);
    req.onerror = function (event) {
        // Handle errors!
        console.log("Was error.");
    };
    req.onsuccess = function (event) {
        if (req.result == null || req.result == undefined) {
            var normReqExt_2 = new XMLHttpRequest();
            normReqExt_2.open("GET", fontList[fontName].file, true);
            normReqExt_2.responseType = "arraybuffer";
            normReqExt_2.onload = function (oEvent) {
                var arrayBuffer = normReqExt_2.response;
                var buffer = new NodeBuffer.Buffer(arrayBuffer);
                fontHelper[fontName] = fontkit.create(buffer);
                for (var i = 0; i < loadCallbacks[fontName].length; i++) {
                    loadCallbacks[fontName][i]();
                }
                var fontData = { fontName: fontName, fontBuffer: arrayBuffer };
                var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
                var req = fontObjectStore.put(fontData);
                req.onerror = function (event) {
                    // Handle errors!
                    console.log("Was error.");
                };
            };
            normReqExt_2.send(null);
        }
        else {
            var font = req.result.fontBuffer;
            if (font != null) {
                var arrayBuffer = req.result.fontBuffer;
                var buffer = new NodeBuffer.Buffer(arrayBuffer);
                fontHelper[fontName] = fontkit.create(buffer);
                for (var i = 0; i < loadCallbacks[fontName].length; i++) {
                    loadCallbacks[fontName][i]();
                }
            }
            else {
                // TODO: Generally shouldn't happen but should handle it.
                console.log("Was null.");
            }
        }
    };
};
var req = self.indexedDB.open("fonts", 1);
req.onsuccess = function (event) {
    var db = event.target.result;
    var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
    getFont("NORMAL", fontObjectStore, db);
    getFont("BOLD", fontObjectStore, db);
    getFont("ITALIC", fontObjectStore, db);
    getFont("BOLDITALIC", fontObjectStore, db);
};
req.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
};
req.onupgradeneeded = function (event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("font-files", { keyPath: "fontName" });
    objectStore.transaction.oncomplete = function (event) {
        // Store values in the newly created objectStore.
        // Set here
        var normReq = new XMLHttpRequest();
        normReq.open("GET", fontList['NORMAL'].file, true);
        normReq.responseType = "arraybuffer";
        normReq.onload = function (oEvent) {
            var arrayBuffer = normReq.response;
            var buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['NORMAL'] = fontkit.create(buffer);
            for (var i = 0; i < loadCallbacks['NORMAL'].length; i++) {
                loadCallbacks['NORMAL'][i]();
            }
            var fontData = { fontName: 'NORMAL', fontBuffer: arrayBuffer };
            var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            var req = fontObjectStore.put(fontData);
            req.onerror = function (event) {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = function (event) {
                console.log('Successfully added normal font to database.');
            };
        };
        normReq.send(null);
        var boldReq = new XMLHttpRequest();
        boldReq.open("GET", fontList['BOLD'].file, true);
        boldReq.responseType = "arraybuffer";
        boldReq.onload = function (oEvent) {
            var arrayBuffer = boldReq.response;
            var buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['BOLD'] = fontkit.create(buffer);
            for (var i = 0; i < loadCallbacks['BOLD'].length; i++) {
                loadCallbacks['BOLD'][i]();
            }
            var fontData = { fontName: 'BOLD', fontBuffer: arrayBuffer };
            var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            var req = fontObjectStore.put(fontData);
            req.onerror = function (event) {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = function (event) {
                console.log('Successfully added BOLD font to database.');
            };
        };
        boldReq.send(null);
        var italReq = new XMLHttpRequest();
        italReq.open("GET", fontList['ITALIC'].file, true);
        italReq.responseType = "arraybuffer";
        italReq.onload = function (oEvent) {
            var arrayBuffer = italReq.response;
            var buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['ITALIC'] = fontkit.create(buffer);
            for (var i = 0; i < loadCallbacks['ITALIC'].length; i++) {
                loadCallbacks['ITALIC'][i]();
            }
            var fontData = { fontName: 'ITALIC', fontBuffer: arrayBuffer };
            var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            var req = fontObjectStore.put(fontData);
            req.onerror = function (event) {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = function (event) {
                console.log('Successfully added ITALIC font to database.');
            };
        };
        italReq.send(null);
        var boldItalReq = new XMLHttpRequest();
        boldItalReq.open("GET", fontList['BOLDITALIC'].file, true);
        boldItalReq.responseType = "arraybuffer";
        boldItalReq.onload = function (oEvent) {
            var arrayBuffer = boldItalReq.response;
            var buffer = new NodeBuffer.Buffer(arrayBuffer);
            fontHelper['BOLDITALIC'] = fontkit.create(buffer);
            for (var i = 0; i < loadCallbacks['BOLDITALIC'].length; i++) {
                loadCallbacks['BOLDITALIC'][i]();
            }
            var fontData = { fontName: 'BOLDITALIC', fontBuffer: arrayBuffer };
            var fontObjectStore = db.transaction("font-files", "readwrite").objectStore("font-files");
            var req = fontObjectStore.put(fontData);
            req.onerror = function (event) {
                // Handle errors!
                console.log("Was error.");
            };
            // TODO: Test and remove debug code.
            req.onsuccess = function (event) {
                console.log('Successfully added BOLDITALIC font to database.');
            };
        };
        boldItalReq.send(null);
    };
};
req.onblocked = function () {
    // This will occur when another tab is open, ask user to close.
    console.error("Database is locked but needs upgrading.");
};
registerComponent(WhiteBoardText.MODENAME, WhiteBoardText.Element, WhiteBoardText.Pallete);
