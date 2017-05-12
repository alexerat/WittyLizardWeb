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
/** Upload Whiteboard Component.
*
* This allows the user to free draw curves that will be smoothed and rendered to SVG Beziers.
*
*/
var Upload;
(function (Upload) {
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
    Upload.MODENAME = 'UPLOAD';
    var ViewTypes = {
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        AUDIO: 'AUDIO',
        FILE: 'FILE',
        IFRAME: 'IFRAME',
        LINK: 'LINK'
    };
    var MAXSIZE = 10485760;
    /**
     * Message types that can be sent between the user and server.
     */
    var MessageTypes = {
        START: 1,
        DATA: 2,
        DONE: 3,
        ROTATE: 4,
        VIEWTYPE: 5,
        UPDATE: 6
    };
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
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            return _super.call(this) || this;
            // return palleteState
        }
        Pallete.prototype.getCurrentViewState = function () {
            return this.currentViewState;
        };
        Pallete.prototype.getCursor = function () {
            var cursorType = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };
            return cursorType;
        };
        Pallete.prototype.handleChange = function (change) {
            return this.currentViewState;
        };
        return Pallete;
    }(BoardPallete));
    Upload.Pallete = Pallete;
    /** Upload Whiteboard Element.
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
        function Element(id, userId, x, y, width, height, callbacks, file, url, fType, fSize, fDesc, fExt, viewType, serverId, updateTime) {
            var _this = _super.call(this, Upload.MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime) || this;
            _this.url = url;
            _this.file = file;
            _this.fType = fType;
            _this.fSize = fSize;
            _this.fExtension = fExt;
            _this.fDesc = fDesc;
            _this.rotation = 0;
            _this.viewType = viewType;
            _this.currentPlace = null;
            var isLoading = (url == '' || (fType == null && (serverId == null || serverId == undefined)) ? true : false);
            var isUploader = (url == '' && (serverId == null || serverId == undefined) ? true : false);
            var newUploadView = {
                mode: Upload.MODENAME, id: _this.id, rotation: _this.rotation, extension: _this.fExtension, URL: _this.url, isLoading: isLoading,
                isUploader: isUploader, percentUp: 0, updateTime: _this.updateTime, isSelected: false, x: _this.x, y: _this.y, width: _this.width,
                height: _this.height, isEditing: false, isMoving: false, isResizing: false, remLock: false, getLock: false, viewType: _this.viewType
            };
            _this.currentViewState = newUploadView;
            console.log(_this);
            return _this;
        }
        /**   Create the element from the creation data, return null if not valid.
        *
        *     @return Element The set of messages to send to the communication server.
        */
        Element.createElement = function (data) {
            var width = data.width;
            var height = data.height;
            if (width == null || height == null) {
                width = 200 * data.scaleF;
                height = 200 * data.scaleF;
            }
            if (data.serverId != null && data.serverId != undefined) {
                var msg = data.serverMsg;
                if (msg.url === null) {
                    msg.url = '';
                }
                return new Element(data.id, msg.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, null, msg.url, msg.fileType, -1, msg.fileDesc, msg.extension, msg.viewType, data.serverId, msg.editTime);
            }
            else {
                return null;
            }
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
            var msg;
            if (this.url == '') {
                msg = {
                    localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, isLocal: true, editLock: false, fileURL: this.url,
                    fileSize: this.fSize, fileType: this.fType, extension: this.fExtension, fileDesc: this.fDesc
                };
            }
            else {
                msg = {
                    localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, isLocal: false, editLock: false, fileURL: this.url,
                    fileSize: this.fSize, fileType: this.fType, extension: this.fExtension, fileDesc: this.fDesc
                };
            }
            return msg;
        };
        /**   Generate the clipboard data that this element should produce when copied, either as a single selected item or whilst editing.
         *
         *    This should be a set of different clipboard data formats.
         *
         *    @return {Array<ClipBoardItem>} The clipboard items.
         */
        Element.prototype.getClipboardData = function () {
            var clipData = [];
            if (this.viewType == ViewTypes.IMAGE) {
                // TODO: Push image stream & generic file
            }
            else if (this.viewType == ViewTypes.VIDEO) {
                // TODO: Push video stream & generic file
            }
            else if (this.viewType == ViewTypes.AUDIO) {
                // TODO: Push audio stream & generic file
            }
            else if (this.viewType == ViewTypes.FILE) {
                // TODO: Push generic file
            }
            clipData.push({ format: 'text/uri-list', data: this.url });
            clipData.push({ format: 'text/plain', data: this.url });
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
            console.log('Upload recieved server ID');
            if (this.url == '') {
                console.log('Setting reader.');
                var self_1 = this;
                var reader_1 = new FileReader();
                this.reader = reader_1;
                reader_1.onload = function (e) {
                    console.log('Sending data peice: ' + self_1.currentPlace);
                    // Send START message
                    console.log(reader_1.result);
                    var payload = { piece: reader_1.result, place: self_1.currentPlace };
                    var msg = { header: MessageTypes.DATA, payload: payload };
                    self_1.sendServerMsg(msg);
                };
                // Send START message
                var payload = {};
                var msg = { header: MessageTypes.START, payload: payload };
                self_1.sendServerMsg(msg);
            }
            else {
                console.error('URL Already set in upload element.');
            }
            return [];
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
            else {
                this.isMoving = true;
                this.moveStartX = this.x;
                this.moveStartY = this.y;
                this.startTime = this.updateTime;
                cursorType = { cursor: 'move', url: [], offset: { x: 0, y: 0 } };
                this.updateView({ isSelected: true, isMoving: true });
                this.isSelected = true;
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
            // Event Unimplemented: Implementation goes here.
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
            // Event Unimplemented: Implementation goes here.
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
            // Event Unimplemented: Implementation goes here.
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
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
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
                var newWidth = this.resizeHorz ? mouseX - this.x : this.width;
                var newHeight = this.resizeVert ? mouseY - this.y : this.height;
                if (newHeight != this.oldHeight || newWidth != this.oldWidth) {
                    this.resize(newWidth, newHeight, new Date());
                    this.hasResized = true;
                }
            }
            else if (this.isMoving) {
                this.move(changeX, changeY, new Date());
                this.hasMoved = true;
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
         *    required changes to the pallete state, whether to set this element as selected, whether to to move the current view
         */
        Element.prototype.handleKeyPress = function (e, input, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        /**   Handle a messages sent from the server to this element.
         *
         *    @param {} message - The server message that was sent.
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
            console.log('Upload recieved message: ' + JSON.stringify(message));
            switch (message.header) {
                case MessageTypes.ROTATE:
                    var rotMsg = message.payload;
                    this.rotation = rotMsg.rotation;
                    this.updateView({ rotation: this.rotation });
                    newView = this.currentViewState;
                    break;
                case MessageTypes.DATA:
                    this.sendFileData(message.payload);
                    break;
                case MessageTypes.DONE:
                    this.uploadComplete(message.payload);
                    newView = this.currentViewState;
                    break;
                case MessageTypes.VIEWTYPE:
                    var viewMsg = message.payload;
                    this.viewType = viewMsg.viewType;
                    this.updateView({ viewType: this.viewType, isLoading: false });
                    newView = this.currentViewState;
                    break;
                case MessageTypes.UPDATE:
                    var updateMsg = message.payload;
                    this.updateView({ percentUp: updateMsg.percent });
                    newView = this.currentViewState;
                    break;
                default:
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
            this.isEditing = true;
            this.updateView({ isSelected: true, isEditing: true });
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
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
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        /**   Handle the copying of data from this element.
         *
         *    @param {ClipboardEvent} e - The clipboard event data associated with the copy event.
         *    @param {Pallete} palleteState - The current state of the pallete for this component.
         */
        Element.prototype.handleCopy = function (e, palleteState) {
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
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        /**  Handle the cutting of data from this element.
         *
         *
         *    @return {ElementInputReturn} An object containing: the new view state, undo operation, redo operation, messages to be sent to the comm server,
         *    required changes to the pallete state, whether to set this element as selected
         */
        Element.prototype.handleCut = function () {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
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
         *    @return {ElementInputReturn} An object containing: the new view state, messages to be sent to the comm server
         */
        Element.prototype.handlePalleteChange = function (pallete, change) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            // Event Unimplemented: Implementation goes here.
            retVal.serverMessages = this.checkForServerId(serverMsgs);
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
        Element.prototype.updateProgress = function (percent) {
            this.updateView({ percentUp: percent });
        };
        Element.prototype.uploadComplete = function (message) {
            this.url = message.fileURL;
            this.updateView({ percentUp: 100, isLoading: false, URL: message.fileURL });
        };
        Element.prototype.rotate = function () {
            this.rotation += 90;
            if (this.rotation >= 360) {
                this.rotation = 0;
            }
            this.updateView({ rotation: this.rotation });
            var msg = { rotation: this.rotation };
            return msg;
        };
        Element.prototype.sendFileData = function (message) {
            this.updateProgress(message.percent);
            var nplace = message.place * 65536;
            var newFile = this.file.slice(nplace, nplace + Math.min(65536, (this.file.size - nplace)));
            this.currentPlace = message.place;
            console.log('Sending File piece: ' + (message.place + 1) + ' out of ' + (Math.floor(this.file.size / 65536) + 1));
            this.reader.readAsArrayBuffer(newFile);
        };
        return Element;
    }(BoardElement));
    Upload.Element = Element;
})(Upload || (Upload = {}));
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponent(Upload.MODENAME, Upload.Element, Upload.Pallete);
