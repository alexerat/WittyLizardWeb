var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var WhiteBoardText;
(function (WhiteBoardText) {
    WhiteBoardText.MODENAME = 'TEXT';
    var PalleteChangeType;
    (function (PalleteChangeType) {
        PalleteChangeType[PalleteChangeType["COLOUR"] = 0] = "COLOUR";
        PalleteChangeType[PalleteChangeType["SIZE"] = 1] = "SIZE";
        PalleteChangeType[PalleteChangeType["BOLD"] = 2] = "BOLD";
        PalleteChangeType[PalleteChangeType["ITALIC"] = 3] = "ITALIC";
        PalleteChangeType[PalleteChangeType["UNDERLINE"] = 4] = "UNDERLINE";
        PalleteChangeType[PalleteChangeType["THROUGHLINE"] = 5] = "THROUGHLINE";
        PalleteChangeType[PalleteChangeType["OVERLINE"] = 6] = "OVERLINE";
        PalleteChangeType[PalleteChangeType["JUSTIFIED"] = 7] = "JUSTIFIED";
    })(PalleteChangeType || (PalleteChangeType = {}));
    var PalleteColour = {
        BLACK: 'black',
        BLUE: 'blue',
        RED: 'red',
        GREEN: 'green'
    };
    var PalleteSize = {
        XSMALL: 2.0,
        SMALL: 5.0,
        MEDIUM: 10.0,
        LARGE: 20.0
    };
    var ViewComponents;
    (function (ViewComponents) {
        ViewComponents[ViewComponents["View"] = 0] = "View";
        ViewComponents[ViewComponents["Resize"] = 1] = "Resize";
        ViewComponents[ViewComponents["Interaction"] = 2] = "Interaction";
    })(ViewComponents || (ViewComponents = {}));
    var ResizeComponents;
    (function (ResizeComponents) {
        ResizeComponents[ResizeComponents["Corner"] = 0] = "Corner";
        ResizeComponents[ResizeComponents["Right"] = 1] = "Right";
        ResizeComponents[ResizeComponents["Bottom"] = 2] = "Bottom";
    })(ResizeComponents || (ResizeComponents = {}));
    var CustomContextItems;
    (function (CustomContextItems) {
    })(CustomContextItems || (CustomContextItems = {}));
    var MessageTypes = {
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
    var MAX_STYLE_LENGTH = 200;
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            var _this = _super.call(this) || this;
            _this.baseSize = PalleteSize.SMALL;
            _this.colour = 'black';
            _this.isBold = false;
            _this.isItalic = false;
            _this.isOLine = false;
            _this.isTLine = false;
            _this.isULine = false;
            _this.currentViewState = { colour: PalleteColour.BLACK, size: PalleteSize.SMALL };
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
        Pallete.prototype.getDecoration = function () {
            if (this.isOLine) {
                return 'overline';
            }
            else if (this.isTLine) {
                return 'line-through';
            }
            else if (this.isULine) {
                return 'underline';
            }
            else {
                return 'none';
            }
        };
        Pallete.prototype.handleChange = function (change) {
            if (change.type == 0) {
                this.colour = change.data;
                this.updateView({ colour: change.data });
            }
            else if (change.type == 1) {
                this.baseSize = change.data;
                this.updateView({ size: change.data });
            }
            else if (change.type == 2) {
                this.isBold = change.data;
                this.updateView({ isBold: change.data });
            }
            else if (change.type == 3) {
                this.isItalic = change.data;
                this.updateView({ isItalic: change.data });
            }
            else if (change.type == 4) {
                if (change.data) {
                    this.isOLine = false;
                    this.isTLine = false;
                }
                this.isULine = change.data;
                this.updateView({ isULine: change.data, isOLine: false, isTLine: false });
            }
            else if (change.type == 6) {
                if (change.data) {
                    this.isULine = false;
                    this.isTLine = false;
                }
                this.isOLine = change.data;
                this.updateView({ isOLine: change.data, isULine: false, isTLine: false });
            }
            else if (change.type == 5) {
                if (change.data) {
                    this.isULine = false;
                    this.isOLine = false;
                }
                this.isTLine = change.data;
                this.updateView({ isTLine: change.data, isULine: false, isOLine: false });
            }
            else if (change.type == 7) {
                this.isJustified = change.data;
                this.updateView({ isJustified: change.data });
            }
            else {
                console.error('Unrecognized pallete change type.');
            }
            return this.currentViewState;
        };
        return Pallete;
    }(BoardPallete));
    WhiteBoardText.Pallete = Pallete;
    var Element = (function (_super) {
        __extends(Element, _super);
        function Element(id, userId, x, y, width, height, callbacks, size, isJustified, num_styles, styles, editLock, lockedBy, isEditing, serverId, updateTime) {
            var _this = _super.call(this, WhiteBoardText.MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime) || this;
            _this.startLeft = false;
            _this.textNodes = [];
            _this.text = '';
            _this.lines = [];
            _this.styleSet = [];
            _this.gettingLock = false;
            _this.editInBuffer = [];
            _this.editOutBuffer = [];
            _this.editNum = 0;
            _this.editCount = 0;
            _this.isMoving = false;
            _this.moveStartX = 0;
            _this.moveStartY = 0;
            _this.hasMoved = false;
            _this.isResizing = false;
            _this.resizeHorz = false;
            _this.resizeVert = false;
            _this.hasResized = false;
            _this.textDown = 0;
            _this.idealX = 0;
            _this.text = '';
            if (serverId != null && serverId != undefined) {
                _this.editInBuffer[0] = { num_styles: num_styles, num_recieved: 0, styles: [], editTimer: null };
                var buffer = _this.editInBuffer[0];
                for (var i = 0; i < styles.length; i++) {
                    var style = styles[i];
                    if (style != null && style != undefined && style.text != null && style.text != undefined && style.num != null && style.num != undefined
                        && style.start != null && style.start != undefined && style.end != null && style.end != undefined && style.style != null &&
                        style.style != undefined && style.weight != null && style.weight != undefined && style.colour != null && style.colour != undefined
                        && style.decoration != null && style.decoration != undefined) {
                        buffer.styles[style.num] = style;
                        buffer.num_recieved++;
                    }
                }
                if (buffer.num_recieved < buffer.num_styles) {
                    var self_1 = _this;
                    buffer.editTimer = setInterval(function (id) {
                        var buffer = self_1.editInBuffer[id];
                        for (var i = 0; i < buffer.num_styles; i++) {
                            if (buffer[i] == null || buffer[i] == undefined) {
                                var msg = { seq_num: i };
                                var msgCont = { header: MessageTypes.MISSINGNODE, payload: msg };
                                self_1.sendServerMsg(msgCont);
                            }
                        }
                    }, 1000, 0);
                }
                else {
                    _this.completeEdit(0);
                }
            }
            else {
                _this.editInBuffer[0] = { num_styles: 0, num_recieved: 0, styles: [], editTimer: null };
                _this.isEditing = true;
            }
            _this.lockedBy = lockedBy;
            _this.calculateTextLines();
            _this.cursorStart = 0;
            _this.cursorEnd = 0;
            _this.selectedCharacters = [];
            _this.stringStart = 0;
            _this.gettingLock = false;
            _this.isEditing = isEditing;
            _this.isSelected = isEditing;
            _this.size = size;
            _this.changeSelect(true);
            var newView = {
                mode: WhiteBoardText.MODENAME, id: _this.id, x: _this.x, y: _this.y, width: _this.width, height: _this.height, isEditing: _this.isEditing,
                remLock: _this.lockedBy != -1, getLock: false, textNodes: [], cursor: null, cursorElems: [], size: _this.size, updateTime: updateTime,
                isSelected: false, text: _this.text, justified: true, isMoving: false, isResizing: false
            };
            _this.currentViewState = newView;
            return _this;
        }
        Element.createElement = function (data) {
            if (data.serverId != null && data.serverId != undefined && data.serverMsg != null && data.serverMsg != undefined) {
                var msg = data.serverMsg;
                return new Element(data.id, data.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.size, msg.justified, msg.num_styles, msg.styles, msg.editLock != -1, msg.editLock, false, data.serverId, msg.editTime);
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
        Element.prototype.getNewMsg = function () {
            var styleMessages = [];
            for (var i = 0; i < this.editInBuffer[0].styles.length; i++) {
                styleMessages.push(this.editInBuffer[0].styles[i]);
            }
            var msg = {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, size: this.size, justified: this.isJustified,
                num_styles: this.editInBuffer[0].num_styles, styles: styleMessages
            };
            return msg;
        };
        Element.prototype.setServerId = function (id) {
            this.serverId = id;
            var messages = [];
            return messages;
        };
        Element.prototype.elementErase = function () {
            var retMsgs = [];
            var centrePos = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            var message = { header: MessageTypes.DELETE, payload: null };
            this.erase();
            var retVal = {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: { message: message },
                wasRestore: null, move: null
            };
            var msg = { header: MessageTypes.DELETE, payload: null };
            retMsgs.push(msg);
            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        };
        Element.prototype.elementRestore = function () {
            var retMsgs = [];
            var centrePos = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            var message = { header: MessageTypes.RESTORE, payload: null };
            this.restore();
            var retVal = {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                wasRestore: { message: message }, move: null
            };
            var msg = { header: MessageTypes.RESTORE, payload: null };
            retMsgs.push(msg);
            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        };
        Element.prototype.handleErase = function () {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            var eraseRet = this.elementErase();
            retVal.serverMessages = eraseRet.serverMessages;
            retVal.newView = eraseRet.newView;
            var undoOp = this.elementRestore;
            var redoOp = this.elementErase;
            retVal.undoOp = undoOp.bind(this);
            retVal.redoOp = redoOp.bind(this);
            return retVal;
        };
        Element.prototype.handleMouseDown = function (e, localX, localY, palleteState, component, subId) {
            var cursorType;
            if (component == 1) {
                this.isResizing = true;
                this.oldWidth = this.width;
                this.oldHeight = this.height;
                this.startTime = this.updateTime;
                if (subId == 1) {
                    cursorType = { cursor: 'ew-resize', url: [], offset: { x: 0, y: 0 } };
                }
                else if (subId == 2) {
                    cursorType = { cursor: 'ns-resize', url: [], offset: { x: 0, y: 0 } };
                }
                else if (subId == 0) {
                    cursorType = { cursor: 'nwse-resize', url: [], offset: { x: 0, y: 0 } };
                }
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
        Element.prototype.handleMouseUp = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleMouseClick = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleDoubleClick = function (e, localX, localY, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.isEditing) {
            }
            else {
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleTouchStart = function (e, localTouches, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleTouchMove = function (e, touchChange, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleTouchEnd = function (e, localTouches, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleTouchCancel = function (e, localTouches, palleteState, component, subId) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardMouseDown = function (e, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: false,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            if (this.isEditing) {
                this.cursorStart = this.findTextPos(mouseX - this.x, mouseY - this.y);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.changeSelect(true);
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardMouseMove = function (e, changeX, changeY, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.isResizing) {
                var newWidth = this.resizeHorz ? this.width + changeX : this.width;
                var newHeight = this.resizeVert ? this.height + changeY : this.height;
                this.resize(newWidth, newHeight, new Date());
                this.hasResized = true;
            }
            else if (this.isMoving) {
                this.move(changeX, changeY, new Date());
                this.hasMoved = true;
            }
            else if (this.isEditing && e.buttons == 1) {
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
            return retVal;
        };
        Element.prototype.handleBoardMouseUp = function (e, mouseX, mouseY, palleteState) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.hasMoved) {
                this.hasMoved = false;
                var changeX_1 = this.x - this.moveStartX;
                var changeY_1 = this.y - this.moveStartY;
                var msgPayload = { x: this.x, y: this.y };
                var msg = { header: MessageTypes.MOVE, payload: msgPayload };
                serverMsgs.push(msg);
                retVal.undoOp = function () { return _this.moveOperation(-changeX_1, -changeY_1, _this.startTime); };
                retVal.redoOp = function () { return _this.moveOperation(changeX_1, changeY_1, _this.updateTime); };
            }
            if (this.hasResized) {
                this.hasResized = false;
                var msgPayload = { width: this.width, height: this.height };
                var msg = { header: MessageTypes.RESIZE, payload: msgPayload };
                serverMsgs.push(msg);
                retVal.undoOp = function () { return _this.resizeOperation(_this.oldWidth, _this.oldHeight, _this.startTime); };
                retVal.redoOp = function () { return _this.resizeOperation(_this.width, _this.height, _this.updateTime); };
            }
            this.isMoving = false;
            return retVal;
        };
        Element.prototype.handleBoardTouchStart = function (e, touches, palleteState) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: true,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardTouchMove = function (e, toucheChanges, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardTouchEnd = function (e, touches, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardTouchCancel = function (e, touches, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.startMove = function () {
            this.isMoving = true;
            this.moveStartX = this.x;
            this.moveStartY = this.y;
            this.updateView({ isMoving: true });
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleMove = function (changeX, changeY) {
            this.move(changeX, changeY, new Date());
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.endMove = function () {
            this.isMoving = false;
            this.updateView({ isMoving: false });
            var msgPayload = { x: this.x, y: this.y };
            var serverMsg = { header: MessageTypes.MOVE, payload: msgPayload };
            var serverMsgs = [];
            var retVal = { newView: this.currentViewState, serverMessages: [], move: { x: this.x, y: this.y, message: serverMsg } };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleKeyPress = function (e, input, palleteState) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            var i;
            var line;
            var style;
            var newStart;
            var newEnd;
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
                    }
                    else {
                        this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                        this.cursorEnd = this.cursorStart;
                    }
                    this.changeSelect(true);
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
                    }
                    else {
                        this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                        this.cursorEnd = this.cursorStart;
                    }
                    this.changeSelect(true);
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
                    }
                    else {
                        if (this.startLeft && this.cursorStart != this.cursorEnd) {
                            this.cursorStart = newEnd;
                        }
                        else {
                            this.cursorStart = newStart;
                        }
                        this.cursorEnd = this.cursorStart;
                    }
                    this.changeSelect(false);
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
                    }
                    else {
                        if (this.startLeft || this.cursorStart == this.cursorEnd) {
                            this.cursorStart = newEnd;
                        }
                        else {
                            this.cursorStart = newStart;
                        }
                        this.cursorEnd = this.cursorStart;
                    }
                    this.changeSelect(false);
                    break;
                case 'Backspace':
                    if (this.cursorEnd > 0) {
                        if (e.ctrlKey) {
                            if (this.cursorStart > 0) {
                            }
                        }
                        else {
                            if (this.cursorStart == this.cursorEnd) {
                                this.cursorStart--;
                            }
                            var start_1 = this.cursorStart;
                            var end_1 = this.cursorEnd;
                            this.cursorEnd = this.cursorStart;
                            this.insertText('', palleteState);
                        }
                    }
                    break;
                case 'Enter':
                    input = '\n';
                default:
                    var start = this.cursorStart;
                    var end = this.cursorEnd;
                    this.cursorStart++;
                    this.cursorEnd = this.cursorStart;
                    console.log('Inserting: ' + input);
                    this.insertText(input, palleteState);
                    this.stringStart += input.length;
                    break;
            }
            if (this.hasResized) {
                this.hasResized = false;
                var msgPayload = { width: this.width, height: this.height };
                var msg = { header: MessageTypes.RESIZE, payload: msgPayload };
                serverMsgs.push(msg);
                retVal.undoOp = function () { return _this.resizeOperation(_this.oldWidth, _this.oldHeight, _this.startTime); };
                retVal.redoOp = function () { return _this.resizeOperation(_this.width, _this.height, _this.updateTime); };
            }
            return retVal;
        };
        Element.prototype.handleServerMessage = function (message) {
            var newView = this.currentViewState;
            var retMsgs = [];
            var alertMessage = null;
            var infoMessage = null;
            var wasEdit = false;
            var wasDelete = false;
            switch (message.header) {
                case MessageTypes.NODE:
                    var nodeData = message.payload;
                    if (this.editInBuffer[nodeData.editId]) {
                        var buffer_1 = this.editInBuffer[nodeData.editId];
                        buffer_1.styles.push(nodeData);
                        if (buffer_1.styles.length == this.editInBuffer[nodeData.editId].num_styles) {
                            clearInterval(this.editInBuffer[nodeData.editId].editTimer);
                            this.completeEdit(nodeData.editId);
                        }
                    }
                    else {
                        console.log('STYLENODE: Unkown edit, ID: ' + nodeData.editId);
                        var message_1 = { header: MessageTypes.UNKNOWNEDIT, payload: null };
                        retMsgs.push(message_1);
                    }
                    newView = this.currentViewState;
                    break;
                case MessageTypes.RESIZE:
                    var resizeData = message.payload;
                    this.resize(resizeData.width, resizeData.height, resizeData.editTime);
                    newView = this.currentViewState;
                    break;
                case MessageTypes.JUSTIFY:
                    var justifyData = message.payload;
                    this.setJustified(justifyData.newState);
                    newView = this.currentViewState;
                    break;
                case MessageTypes.LOCK:
                    var lockData = message.payload;
                    this.setLock(lockData.userId);
                    newView = this.currentViewState;
                    break;
                case MessageTypes.RELEASE:
                    this.setUnLock();
                    break;
                case MessageTypes.LOCKID:
                    if (this.gettingLock) {
                        this.setEdit();
                    }
                    else {
                        var releaseMsg = { header: MessageTypes.RELEASE, payload: null };
                        retMsgs.push(releaseMsg);
                    }
                    newView = this.currentViewState;
                    break;
                case MessageTypes.IGNORE:
                    if (this.editInBuffer[0]) {
                        clearInterval(this.editInBuffer[0].editTimer);
                        this.editInBuffer[0] = null;
                    }
                    wasDelete = true;
                    break;
                case MessageTypes.IGNOREEDIT:
                    var igdata = message.payload;
                    if (this.editInBuffer[igdata.editId]) {
                        clearInterval(this.editInBuffer[igdata.editId].editTimer);
                        this.editInBuffer[igdata.editId] = null;
                    }
                    break;
                case MessageTypes.COMPLETE:
                    while (this.opBuffer.length > 0) {
                        var opMsg = void 0;
                        var op = this.opBuffer.shift();
                        opMsg = { header: op.header, payload: op.payload };
                        retMsgs.push(opMsg);
                    }
                    break;
                case MessageTypes.NODEMISSED:
                    var msdata = message.payload;
                    var node = this.editOutBuffer[msdata.editId][msdata.num];
                    var msg = {
                        num: msdata.num, editId: msdata.editId, start: node.start, end: node.end, text: node.text,
                        weight: node.weight, style: node.style, decoration: node.decoration, colour: node.colour
                    };
                    var msgCont = { header: MessageTypes.NODE, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                case MessageTypes.DROPPED:
                    alertMessage = { header: 'CONNECTION ERROR', message: 'Unable to send data to server due to connection problems.' };
                    wasDelete = true;
                    break;
                case MessageTypes.MOVE:
                    var mvdata = message.payload;
                    this.move(mvdata.x - this.x, mvdata.y - this.y, mvdata.editTime);
                    this.updateTime = mvdata.editTime;
                    newView = this.currentViewState;
                    break;
                case MessageTypes.DELETE:
                    wasDelete = true;
                    this.erase();
                    newView = this.currentViewState;
                    break;
                case MessageTypes.RESTORE:
                    this.restore();
                    newView = this.currentViewState;
                    break;
                case MessageTypes.EDIT:
                    var editData = message.payload;
                    if (!this.editInBuffer[editData.editId]) {
                        this.editInBuffer[editData.editId] = { num_styles: editData.num_styles, num_recieved: 0, styles: [], editTimer: null };
                    }
                    var buffer = this.editInBuffer[editData.editId];
                    for (var i = 0; i < editData.styles.length; i++) {
                        var style = editData.styles[i];
                        if (style != null && style != undefined && style.text != null && style.text != undefined && style.num != null && style.num != undefined
                            && style.start != null && style.start != undefined && style.end != null && style.end != undefined && style.style != null &&
                            style.style != undefined && style.weight != null && style.weight != undefined && style.colour != null && style.colour != undefined
                            && style.decoration != null && style.decoration != undefined) {
                            buffer.styles[style.num] = style;
                            buffer.num_recieved++;
                        }
                    }
                    if (buffer.num_recieved < buffer.num_styles) {
                        var self_2 = this;
                        buffer.editTimer = setInterval(function (id) {
                            var buffer = self_2.editInBuffer[id];
                            for (var i = 0; i < buffer.num_styles; i++) {
                                if (buffer[i] == null || buffer[i] == undefined) {
                                    var msg_1 = { seq_num: i };
                                    var msgCont_1 = { header: MessageTypes.MISSINGNODE, payload: msg_1 };
                                    self_2.sendServerMsg(msgCont_1);
                                }
                            }
                        }, 1000, editData.editId);
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
        Element.prototype.handleStartEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
            this.isSelected = true;
            this.gettingLock = true;
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            this.changeSelect(true);
            this.updateView({ gettingLock: true, isSelected: true });
            var messageContainer = { header: MessageTypes.LOCK, payload: null };
            serverMsgs.push(messageContainer);
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleEndEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
            this.isSelected = false;
            this.isEditing = false;
            this.updateView({ isSelected: false, isEditing: false });
            this.stopLock();
            var messageContainer = { header: MessageTypes.RELEASE, payload: null };
            serverMsgs.push(messageContainer);
            var lineCount = this.textNodes.length;
            if (lineCount == 0) {
                lineCount = 1;
            }
            if (lineCount * 1.5 * this.size < this.height) {
                this.resize(this.width, lineCount * 1.5 * this.size, new Date());
            }
            retVal.newView = this.currentViewState;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleCopy = function (e, palleteState) {
            if (this.isEditing && this.cursorStart != this.cursorEnd) {
                e.clipboardData.setData('text/plain', this.text.substring(this.cursorStart, this.cursorEnd));
            }
        };
        Element.prototype.handlePaste = function (e, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.isEditing) {
                var data = e.clipboardData.getData('text/plain');
                this.insertText(data, palleteState);
                this.cursorStart = this.cursorStart + data.length;
                this.cursorEnd = this.cursorStart;
                this.changeSelect(true);
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleCut = function (e, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleCustomContext = function (item, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleHover = function () {
            var retVal = { header: '', message: '' };
            return retVal;
        };
        Element.prototype.handlePalleteChange = function (pallete, change) {
            var _this = this;
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (change.type == 7) {
                var prevVal_1 = this.isJustified;
                retVal.undoOp = function () {
                    var retMsgs = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.setJustified(prevVal_1);
                    var payload = { newState: prevVal_1 };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                retVal.redoOp = function () {
                    var retMsgs = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.setJustified(pallete.isJustified);
                    var payload = { newState: pallete.isJustified };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                this.setJustified(pallete.isJustified);
                var payload = { newState: this.isJustified };
                var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                serverMsgs.push(msg);
            }
            else if (change.type == 1) {
                var prevVal_2 = this.size;
                retVal.undoOp = function () {
                    var retMsgs = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.size = prevVal_2;
                    _this.updateText();
                    var payload = { newSize: prevVal_2 };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                retVal.redoOp = function () {
                    var retMsgs = [];
                    var centrePos = { x: _this.x + _this.width / 2, y: _this.y + _this.height / 2 };
                    _this.size = pallete.baseSize;
                    _this.updateText();
                    var payload = { newSize: pallete.baseSize };
                    var retVal = {
                        id: _this.id, newView: _this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                        wasRestore: null, move: null
                    };
                    var msg = { header: MessageTypes.SIZECHANGE, payload: payload };
                    retMsgs.push(msg);
                    retVal.serverMessages = _this.checkForServerId(retMsgs);
                    return retVal;
                };
                this.size = pallete.baseSize;
                this.updateText();
                var payload = { newState: this.isJustified };
                var msg = { header: MessageTypes.JUSTIFY, payload: payload };
                serverMsgs.push(msg);
            }
            else {
                var styles_1 = [];
                var sortedSelect = this.selectedCharacters.slice();
                sortedSelect.sort();
                for (var i = 0; i < this.styleSet.length; i++) {
                    var style = this.styleSet[i];
                    var currentStyle = null;
                    var newStyle = null;
                    for (var j = 0; j < sortedSelect.length; j++) {
                        if (style.start <= sortedSelect[j] && style.end > sortedSelect[j]) {
                            if (!this.isCurrentStyle(style, pallete)) {
                                if (style.start == sortedSelect[j]) {
                                    newStyle =
                                        {
                                            start: sortedSelect[j], end: sortedSelect[j] + 1, decoration: pallete.getDecoration(),
                                            weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                            text: this.text.charAt(sortedSelect[j]), num: styles_1.length
                                        };
                                    style.start = sortedSelect[j] + 1;
                                    i--;
                                }
                                else if (style.end - 1 == sortedSelect[j]) {
                                    currentStyle =
                                        {
                                            start: style.start, end: sortedSelect[j], decoration: style.decoration,
                                            weight: style.weight, style: style.style, colour: style.colour,
                                            text: this.text.substring(style.start, sortedSelect[j]), num: styles_1.length
                                        };
                                    newStyle =
                                        {
                                            start: sortedSelect[j], end: sortedSelect[j] + 1, decoration: pallete.getDecoration(),
                                            weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                            text: this.text.charAt(sortedSelect[j]), num: styles_1.length + 1
                                        };
                                }
                                else {
                                    currentStyle =
                                        {
                                            start: style.start, end: sortedSelect[j], decoration: style.decoration,
                                            weight: style.weight, style: style.style, colour: style.colour,
                                            text: this.text.substring(style.start, sortedSelect[j]), num: styles_1.length
                                        };
                                    newStyle =
                                        {
                                            start: sortedSelect[j], end: sortedSelect[j] + 1, decoration: pallete.getDecoration(),
                                            weight: pallete.getWeight(), style: pallete.getStyle(), colour: pallete.getColour(),
                                            text: this.text.charAt(sortedSelect[j]), num: styles_1.length + 1
                                        };
                                    style.start = sortedSelect[j] + 1;
                                    i--;
                                }
                                break;
                            }
                        }
                        if (newStyle == null) {
                            currentStyle =
                                {
                                    start: style.start, end: style.end, decoration: style.decoration,
                                    weight: style.weight, style: style.style, colour: style.colour,
                                    text: this.text.substring(style.start, style.end), num: styles_1.length
                                };
                        }
                        if (currentStyle != null) {
                            styles_1.push(currentStyle);
                        }
                        if (newStyle != null) {
                            styles_1.push(newStyle);
                        }
                    }
                }
                var undoSet_1 = this.styleSet.slice();
                retVal.undoOp = function () { return _this.setStyleSet(undoSet_1); };
                retVal.redoOp = function () { return _this.setStyleSet(styles_1); };
                this.styleSet = styles_1;
                this.updateText();
                serverMsgs.push(this.textEdited());
            }
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.audioStream = function (stream) {
        };
        Element.prototype.videoStream = function (stream) {
        };
        Element.prototype.setStyleSet = function (styleSet) {
            var retMsgs = [];
            var centrePos = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            this.styleSet = styleSet;
            this.updateText();
            var payload = this.textEdited();
            var retVal = {
                id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
                wasRestore: null, move: null
            };
            var msg = { header: MessageTypes.EDIT, payload: payload };
            retMsgs.push(msg);
            retVal.serverMessages = this.checkForServerId(retMsgs);
            return retVal;
        };
        Element.prototype.resize = function (width, height, updateTime) {
            this.updateTime = updateTime;
            this.height = height;
            if (this.width != width) {
                this.width = width;
                this.textNodes = this.calculateTextLines();
            }
            if (this.isEditing) {
                this.findCursorElems(this.cursorStart, this.cursorEnd);
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems
            });
        };
        Element.prototype.moveOperation = function (changeX, changeY, updateTime) {
            this.move(changeX, changeY, updateTime);
            var msgPayload = { x: this.x, y: this.y };
            var serverMsg = { header: MessageTypes.MOVE, payload: msgPayload };
            var retVal = {
                id: this.id, newView: this.currentViewState, serverMessages: [], palleteChanges: [], newViewCentre: null, wasDelete: null,
                wasRestore: null, move: { x: changeX, y: changeY, message: serverMsg }
            };
            return retVal;
        };
        Element.prototype.resizeOperation = function (width, height, updateTime) {
            var serverMessages = [];
            this.resize(width, height, updateTime);
            var msgPayload = { width: this.width, height: this.height };
            var serverMsg = { header: MessageTypes.RESIZE, payload: msgPayload };
            serverMessages.push(serverMsg);
            var retVal = {
                id: this.id, newView: this.currentViewState, serverMessages: [], palleteChanges: [], newViewCentre: null, wasDelete: null,
                wasRestore: null, move: null
            };
            retVal.serverMessages = this.checkForServerId(serverMessages);
            return retVal;
        };
        Element.prototype.stopLock = function () {
            this.gettingLock = false;
            this.editLock = false;
            this.cursor = null;
            this.cursorElems = [];
            this.updateView({ getLock: false, isEditing: false, cursor: null, cursorElems: [] });
        };
        Element.prototype.changeSelect = function (setIdeal) {
            var palleteChange = null;
            if (setIdeal) {
                if (this.startLeft) {
                    this.idealX = this.findXPos(this.cursorEnd);
                }
                else {
                    this.idealX = this.findXPos(this.cursorStart);
                }
            }
            this.findCursorElems(this.cursorStart, this.cursorEnd);
            if (this.styleSet.length > 0) {
                var i = 0;
                while (i < this.styleSet.length && this.styleSet[i].start > this.cursorStart || this.styleSet[i].end < this.cursorStart) {
                    i++;
                }
                var isBold = this.styleSet[i].weight == 'bold';
                var isItalic = this.styleSet[i].style == 'italic';
                var isOLine = this.styleSet[i].decoration == 'overline';
                var isULine = this.styleSet[i].decoration == 'underline';
                var isTLine = this.styleSet[i].decoration == 'line-through';
                palleteChange = { colour: this.styleSet[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine };
            }
            this.updateView({ cursor: this.cursor, cursorElems: this.cursorElems });
            return palleteChange;
        };
        Element.prototype.setEdit = function () {
            this.cursorStart = this.text.length;
            this.cursorEnd = this.text.length;
            this.gettingLock = false;
            this.isEditing = true;
            this.changeSelect(true);
            this.updateView({ getLock: false, isEditing: true });
        };
        Element.prototype.setLock = function (userId) {
            this.lockedBy = userId;
            this.editLock = true;
            this.updateView({ remLock: true });
        };
        Element.prototype.setUnLock = function () {
            this.editLock = false;
            this.updateView({ remLock: false });
        };
        Element.prototype.setJustified = function (state) {
            this.isJustified = state;
            this.textNodes = this.calculateTextLines();
            if (this.isEditing) {
                if (this.startLeft) {
                    this.idealX = this.findXPos(this.cursorEnd);
                }
                else {
                    this.idealX = this.findXPos(this.cursorStart);
                }
                this.findCursorElems(this.cursorStart, this.cursorEnd);
            }
            this.updateView({ textNodes: this.textNodes, cursor: this.cursor, cursorElems: this.cursorElems });
        };
        Element.prototype.updateText = function () {
            console.log('Generating lines...');
            this.generateLines();
            this.textNodes = this.calculateTextLines();
            if (this.isSelected) {
                this.findCursorElems(this.cursorStart, this.cursorEnd);
            }
            this.updateView({
                textNodes: this.textNodes, width: this.width, height: this.height, cursor: this.cursor, cursorElems: this.cursorElems, waiting: false
            });
        };
        Element.prototype.findXPos = function (loc) {
            if (this.textNodes.length == 0) {
                return 0;
            }
            var currGlyphCount = 0;
            for (var i = 0; i < this.textNodes.length; i++) {
                var line = this.textNodes[i];
                if (currGlyphCount + line.glyphs.length > loc) {
                    return line.glyphs[loc - currGlyphCount].startPos;
                }
                currGlyphCount += line.glyphs.length;
            }
        };
        Element.prototype.findTextPos = function (x, y) {
            var xFind = 0;
            if (y < this.y || this.textNodes.length == 0) {
                return 0;
            }
            else {
                var lineNum = Math.floor(((y - this.y) / (1.5 * this.size)) + 0.15);
                if (lineNum >= this.textNodes.length) {
                    return this.textNodes[this.textNodes.length - 1].end;
                }
                if (!this.textNodes[lineNum]) {
                    console.log('Line is: ' + lineNum);
                }
                if (x > this.x) {
                    if (x > this.x + this.width) {
                        return this.textNodes[lineNum].end;
                    }
                    else {
                        xFind = x - this.x;
                    }
                }
                else {
                    return this.textNodes[lineNum].start;
                }
                var line = this.textNodes[lineNum];
                if (line.glyphs.length == 0) {
                    return line.start;
                }
                var i = 0;
                while (i < line.glyphs.length && xFind > line.glyphs[i].startPos) {
                    i++;
                }
                var curr = i - 1;
                var glyph = line.glyphs[i - 1];
                var selPoint = void 0;
                if (curr + 1 < line.glyphs.length) {
                    if (xFind - glyph.startPos > line.glyphs[curr + 1].startPos - xFind) {
                        selPoint = line.start + curr + 1;
                    }
                    else {
                        selPoint = line.start + i;
                    }
                }
                else {
                    if (xFind - glyph.startPos > glyph.startPos + glyph.advance - xFind) {
                        selPoint = line.start + curr + 1;
                    }
                    else {
                        selPoint = line.start + i;
                    }
                }
                return selPoint;
            }
        };
        Element.prototype.findCursorElems = function (cursorStart, cursorEnd) {
            this.cursorElems = [];
            if (this.textNodes.length == 0) {
                this.cursor = { x: this.x, y: this.y, height: 1.5 * this.size };
            }
            var currGlyphCount = 0;
            for (var i = 0; i < this.textNodes.length; i++) {
                var line = this.textNodes[i];
                var selStart = null;
                var selEnd = null;
                var endFound = false;
                if (cursorStart >= currGlyphCount && cursorStart < currGlyphCount + line.glyphs.length) {
                    if (cursorStart == currGlyphCount + line.glyphs.length && !line.spaceRemoved) {
                        selStart = this.width;
                    }
                    else {
                        selStart = line.glyphs[cursorStart - currGlyphCount].startPos;
                    }
                }
                else if (cursorStart < currGlyphCount && cursorEnd > currGlyphCount) {
                    selStart = 0;
                }
                if (cursorEnd > currGlyphCount && cursorEnd < currGlyphCount + line.glyphs.length) {
                    if (cursorEnd == currGlyphCount + line.glyphs.length && !line.spaceRemoved) {
                        selEnd = this.width;
                    }
                    else {
                        selEnd = line.glyphs[cursorEnd - currGlyphCount].startPos;
                    }
                }
                else if (cursorEnd >= currGlyphCount + line.glyphs.length && cursorStart <= currGlyphCount + line.glyphs.length && i < this.textNodes.length - 1) {
                    selEnd = this.width;
                }
                if (cursorEnd >= currGlyphCount && cursorEnd <= currGlyphCount + line.glyphs.length && (this.startLeft || cursorStart == cursorEnd) &&
                    currGlyphCount != currGlyphCount + line.glyphs.length) {
                    if (cursorEnd != currGlyphCount + line.glyphs.length || line.spaceRemoved) {
                        this.cursor = { x: this.x + selEnd, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
                    }
                }
                else if (cursorStart >= currGlyphCount && cursorStart <= currGlyphCount + line.glyphs.length && (!this.startLeft || cursorStart == cursorEnd)) {
                    if (cursorStart != currGlyphCount + line.glyphs.length || line.spaceRemoved) {
                        this.cursor = { x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, height: 1.5 * this.size };
                    }
                }
                if (selStart != null && selEnd != null && cursorStart != cursorEnd) {
                    this.cursorElems.push({
                        x: this.x + selStart, y: this.y + 1.5 * this.size * line.lineNum, width: selEnd - selStart, height: 1.5 * this.size
                    });
                }
                currGlyphCount += line.glyphs.length;
            }
        };
        Element.prototype.calculateTextLines = function () {
            var i;
            var childText = [];
            var currPos = 0;
            var prevPos = 0;
            var txtStart = 0;
            var dy = this.size;
            var ddy = 1.5 * this.size;
            var nodeCounter;
            var computedTextLength;
            var currY = this.y;
            var lineCount = 0;
            var isSpace = false;
            var currStyle = 0;
            for (var k = 0; k < this.lines.length; k++) {
                nodeCounter = 0;
                computedTextLength = 0;
                var nLineTrig = false;
                var startSpace = this.lines[k].startSpace;
                var wordsT = this.lines[k].words;
                var spacesT = this.lines[k].spaces;
                var wordC = 0;
                var spaceC = 0;
                var line = '';
                var fDash = void 0;
                console.log('Calculating line.');
                console.log(wordsT);
                console.log(this.styleSet);
                while (wordC < wordsT.length || spaceC < spacesT.length) {
                    var lineComplete = false;
                    var word = void 0;
                    var tmpLineGlyphs = [];
                    currY += dy;
                    var currLength = 0;
                    var tspanEl = {
                        x: this.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, spaceRemoved: true,
                        justified: this.isJustified, lineNum: lineCount, glyphs: []
                    };
                    var progPos = true;
                    nLineTrig = false;
                    if (startSpace) {
                        if (spaceC >= spacesT.length) {
                            console.error('ERROR: Space array out of bounds');
                            return [];
                        }
                        word = spacesT[spaceC];
                        isSpace = true;
                        spaceC++;
                    }
                    else {
                        if (wordC >= wordsT.length) {
                            console.error('ERROR: Word array out of bounds');
                            return [];
                        }
                        word = wordsT[wordC];
                        isSpace = false;
                        wordC++;
                    }
                    var glyphRun = { glyphs: [], positions: [] };
                    var wordPos = 0;
                    var tempGlyphs = void 0;
                    while (currStyle < this.styleSet.length && currPos + word.length > this.styleSet[currStyle].end) {
                        var fontSet = 'NORMAL';
                        if (this.styleSet[currStyle].weight == 'bold') {
                            if (this.styleSet[currStyle].style == 'italic') {
                                fontSet = 'BOLDITALIC';
                            }
                            else {
                                fontSet = 'BOLD';
                            }
                        }
                        else {
                            if (this.styleSet[currStyle].style == 'italic') {
                                fontSet = 'ITALIC';
                            }
                        }
                        console.log(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));
                        tempGlyphs = fontHelper[fontSet].layout(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));
                        for (var i_1 = 0; i_1 < tempGlyphs.length; i_1++) {
                            tempGlyphs.glyphs[i_1].weight = this.styleSet[currStyle].weight;
                            tempGlyphs.glyphs[i_1].colour = this.styleSet[currStyle].colour;
                            tempGlyphs.glyphs[i_1].style = this.styleSet[currStyle].style;
                            tempGlyphs.glyphs[i_1].decoration = this.styleSet[currStyle].decoration;
                        }
                        (_a = glyphRun.glyphs).push.apply(_a, tempGlyphs.glyphs);
                        (_b = glyphRun.positions).push.apply(_b, tempGlyphs.positions);
                        wordPos = this.styleSet[currStyle].end - currPos;
                        currStyle++;
                    }
                    if (currStyle < this.styleSet.length) {
                        var fontSet = 'NORMAL';
                        if (this.styleSet[currStyle].weight == 'bold') {
                            if (this.styleSet[currStyle].style == 'italic') {
                                fontSet = 'BOLDITALIC';
                            }
                            else {
                                fontSet = 'BOLD';
                            }
                        }
                        else {
                            if (this.styleSet[currStyle].style == 'italic') {
                                fontSet = 'ITALIC';
                            }
                        }
                        console.log(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));
                        tempGlyphs = fontHelper[fontSet].layout(word.substring(wordPos, this.styleSet[currStyle].end - currPos - wordPos));
                        for (var i_2 = 0; i_2 < tempGlyphs.length; i_2++) {
                            tempGlyphs.glyphs[i_2].weight = this.styleSet[currStyle].weight;
                            tempGlyphs.glyphs[i_2].colour = this.styleSet[currStyle].colour;
                            tempGlyphs.glyphs[i_2].style = this.styleSet[currStyle].style;
                            tempGlyphs.glyphs[i_2].decoration = this.styleSet[currStyle].decoration;
                        }
                        (_c = glyphRun.glyphs).push.apply(_c, tempGlyphs.glyphs);
                        (_d = glyphRun.positions).push.apply(_d, tempGlyphs.positions);
                    }
                    var wordGlyphs = [];
                    var fDash_1 = -1;
                    console.log(tempGlyphs);
                    console.log(glyphRun.positions);
                    console.log(this.width);
                    console.log(computedTextLength);
                    for (var j = 0; j < glyphRun.positions.length; j++) {
                        var charWidth = (glyphRun.positions[j].xAdvance) * this.size / 1000;
                        console.log(computedTextLength);
                        console.log(charWidth);
                        if (computedTextLength + charWidth < this.width) {
                            if (glyphRun.glyphs[j].codePoints.length == 1 && isHyphen(glyphRun.glyphs[j].codePoints[0])) {
                                fDash_1 = j;
                            }
                            var wordGlyph = { path: glyphRun.glyphs[j].path.toSVG(), stringPositions: glyphRun.glyphs[j].stringPositions,
                                xAdvance: glyphRun.positions[j].xAdvance, yAdvance: glyphRun.positions[j].yAdvance, xOffset: glyphRun.positions[j].xOffset,
                                yOffset: glyphRun.positions[j].yOffset, isSpace: isSpace, weight: glyphRun.glyphs[j].weight, colour: glyphRun.glyphs[j].colour,
                                style: glyphRun.glyphs[j].style, decoration: glyphRun.glyphs[j].decoration };
                            wordGlyphs.push(wordGlyph);
                            computedTextLength += charWidth;
                        }
                        else {
                            lineComplete = true;
                            if (fDash_1 != -1) {
                                var newStr = word.substring(fDash_1 + 1, word.length);
                                wordsT.splice(wordC, 0, newStr);
                            }
                            else {
                                if (j == 0) {
                                    console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                                    return [];
                                }
                                if (startSpace) {
                                    if (j + 1 < word.length) {
                                        spacesT.splice(spaceC, 0, word.substring(j + 1, word.length));
                                    }
                                    else {
                                        startSpace = !startSpace;
                                    }
                                    currPos += wordGlyphs.length;
                                    prevPos = currPos + 1;
                                }
                                else {
                                    wordsT.splice(wordC, 0, word.substring(j, word.length));
                                    currPos += wordGlyphs.length;
                                    tspanEl.spaceRemoved = false;
                                    prevPos = currPos;
                                }
                            }
                            break;
                        }
                    }
                    if (!lineComplete && progPos) {
                        currPos += word.length;
                        startSpace = !startSpace;
                    }
                    line = word;
                    currLength = computedTextLength;
                    tmpLineGlyphs.push.apply(tmpLineGlyphs, wordGlyphs);
                    while (!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length)) {
                        wordGlyphs = [];
                        if (startSpace) {
                            word = spacesT[spaceC++];
                            isSpace = true;
                        }
                        else {
                            word = wordsT[wordC++];
                            isSpace = false;
                        }
                        var glyphRun_1 = { glyphs: [], positions: [] };
                        var wordPos_1 = 0;
                        var tempGlyphs_1 = void 0;
                        while (currStyle < this.styleSet.length && currPos + word.length > this.styleSet[currStyle].end) {
                            var fontSet = 'NORMAL';
                            if (this.styleSet[currStyle].weight == 'bold') {
                                if (this.styleSet[currStyle].style == 'italic') {
                                    fontSet = 'BOLDITALIC';
                                }
                                else {
                                    fontSet = 'BOLD';
                                }
                            }
                            else {
                                if (this.styleSet[currStyle].style == 'italic') {
                                    fontSet = 'ITALIC';
                                }
                            }
                            tempGlyphs_1 = fontHelper[fontSet].layout(word.substring(wordPos_1, this.styleSet[currStyle].end - currPos - wordPos_1));
                            for (var i_3 = 0; i_3 < tempGlyphs_1.length; i_3++) {
                                tempGlyphs_1.glyphs[i_3].weight = this.styleSet[currStyle].weight;
                                tempGlyphs_1.glyphs[i_3].colour = this.styleSet[currStyle].colour;
                                tempGlyphs_1.glyphs[i_3].style = this.styleSet[currStyle].style;
                                tempGlyphs_1.glyphs[i_3].decoration = this.styleSet[currStyle].decoration;
                            }
                            (_e = glyphRun_1.glyphs).push.apply(_e, tempGlyphs_1.glyphs);
                            (_f = glyphRun_1.positions).push.apply(_f, tempGlyphs_1.positions);
                            wordPos_1 = this.styleSet[currStyle].end - currPos;
                            currStyle++;
                        }
                        if (currStyle < this.styleSet.length) {
                            var fontSet = 'NORMAL';
                            if (this.styleSet[currStyle].weight == 'bold') {
                                if (this.styleSet[currStyle].style == 'italic') {
                                    fontSet = 'BOLDITALIC';
                                }
                                else {
                                    fontSet = 'BOLD';
                                }
                            }
                            else {
                                if (this.styleSet[currStyle].style == 'italic') {
                                    fontSet = 'ITALIC';
                                }
                            }
                            tempGlyphs_1 = fontHelper[fontSet].layout(word.substring(wordPos_1, this.styleSet[currStyle].end - currPos - wordPos_1));
                            for (var i_4 = 0; i_4 < tempGlyphs_1.length; i_4++) {
                                tempGlyphs_1.glyphs[i_4].weight = this.styleSet[currStyle].weight;
                                tempGlyphs_1.glyphs[i_4].colour = this.styleSet[currStyle].colour;
                                tempGlyphs_1.glyphs[i_4].style = this.styleSet[currStyle].style;
                                tempGlyphs_1.glyphs[i_4].decoration = this.styleSet[currStyle].decoration;
                            }
                            (_g = glyphRun_1.glyphs).push.apply(_g, tempGlyphs_1.glyphs);
                            (_h = glyphRun_1.positions).push.apply(_h, tempGlyphs_1.positions);
                        }
                        var tmpLength = computedTextLength;
                        for (var j = 0; j < glyphRun_1.positions.length; j++) {
                            var charWidth = (glyphRun_1.positions[j].xAdvance) * this.size / 1000;
                            if (tmpLength + charWidth < this.width) {
                                if (glyphRun_1.glyphs[j].codePoints.length == 1 && isHyphen(glyphRun_1.glyphs[j].codePoints[0])) {
                                    fDash_1 = j;
                                }
                                var wordGlyph = { path: glyphRun_1.glyphs[j].path.toSVG(), stringPositions: glyphRun_1.glyphs[j].stringPositions,
                                    xAdvance: glyphRun_1.positions[j].xAdvance, yAdvance: glyphRun_1.positions[j].yAdvance, xOffset: glyphRun_1.positions[j].xOffset,
                                    yOffset: glyphRun_1.positions[j].yOffset, isSpace: isSpace, weight: glyphRun_1.glyphs[j].weight,
                                    colour: glyphRun_1.glyphs[j].colour, style: glyphRun_1.glyphs[j].style, decoration: glyphRun_1.glyphs[j].decoration };
                                wordGlyphs.push(wordGlyph);
                                tmpLength += charWidth;
                            }
                            else {
                                lineComplete = true;
                                if (startSpace) {
                                    if (word.length > j + 1) {
                                        wordsT[--spaceC] = word.substring(j + 1, word.length);
                                        word = word.substring(0, j);
                                        startSpace = !startSpace;
                                    }
                                }
                                else {
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
                        tmpLineGlyphs.push.apply(tmpLineGlyphs, wordGlyphs);
                    }
                    dy = ddy;
                    nodeCounter = 0;
                    if (wordC == wordsT.length && spaceC == spacesT.length) {
                        tspanEl.justified = false;
                    }
                    var reqAdjustment = this.width - computedTextLength;
                    var numSpaces = line.length - line.replace(/\s/g, "").length;
                    var extraSpace = 0;
                    if (tspanEl.justified) {
                        extraSpace = reqAdjustment / numSpaces;
                    }
                    var lineGlyphs = [];
                    var currentDist = 0;
                    for (var i_5 = 0; i_5 < tmpLineGlyphs.length; i_5++) {
                        var newGlyph = {
                            path: tmpLineGlyphs[i_5].path, stringPositions: tmpLineGlyphs[i_5].stringPositions, startPos: currentDist,
                            advance: tmpLineGlyphs[i_5].xAdvance, weight: tmpLineGlyphs[i_5].weight, colour: tmpLineGlyphs[i_5].colour, style: tmpLineGlyphs[i_5].style,
                            decoration: tmpLineGlyphs[i_5].decoration
                        };
                        console.log(tmpLineGlyphs[i_5].path);
                        currentDist += tmpLineGlyphs[i_5].xAdvance;
                        if (tmpLineGlyphs[i_5].isSpace) {
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
            if (lineCount * 1.5 * this.size > this.height) {
                this.resize(this.width, lineCount * 1.5 * this.size, new Date());
                this.hasResized = true;
            }
            return childText;
            var _a, _b, _c, _d, _e, _f, _g, _h;
        };
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
            i = 0;
            while (i < line.glyphs.length && this.idealX > line.glyphs[i].startPos) {
                i++;
            }
            var curr = i - 1;
            var glyph = line.glyphs[i - 1];
            var selPoint;
            if (curr + 1 < line.glyphs.length) {
                if (this.idealX - glyph.startPos > line.glyphs[curr + 1].startPos - this.idealX) {
                    selPoint = line.start + curr + 1;
                }
                else {
                    selPoint = line.start + i;
                }
            }
            else {
                if (this.idealX - glyph.startPos > glyph.startPos + glyph.advance - this.idealX) {
                    selPoint = line.start + curr + 1;
                }
                else {
                    selPoint = line.start + i;
                }
            }
            return selPoint;
        };
        Element.prototype.isCurrentStyle = function (style, pallete) {
            if (style.colour == pallete.colour && style.decoration == pallete.getDecoration() &&
                style.weight == pallete.getWeight() && style.style == pallete.getStyle()) {
                return true;
            }
            else {
                return false;
            }
        };
        Element.prototype.removeCharacter = function (index) {
            this.text = this.text.slice(0, index) + this.text.slice(index, this.text.length);
            for (var i = 0; i < this.styleSet.length; i++) {
                if (this.styleSet[i].end >= index) {
                    this.styleSet[i].end--;
                }
                if (this.styleSet[i].start == index && this.styleSet[i].end == index) {
                    this.styleSet.splice(i, 1);
                }
                else if (this.styleSet[i].start > index) {
                    this.styleSet[i].start--;
                }
            }
        };
        Element.prototype.insertText = function (text, pallete) {
            for (var i = 0; i < this.selectedCharacters.length; i++) {
                this.removeCharacter(this.selectedCharacters[i]);
            }
            var isNew = true;
            var textStart = this.text.slice(0, this.stringStart);
            var textEnd = this.text.slice(this.stringStart, this.text.length);
            var styles = [];
            var fullText = textStart + text + textEnd;
            var hasInserted = false;
            for (var i = 0; i < this.styleSet.length; i++) {
                var sty = this.styleSet[i];
                if (sty.start >= this.stringStart) {
                    if (hasInserted) {
                        if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                            && styles[styles.length - 1].decoration == sty.decoration
                            && styles[styles.length - 1].weight == sty.weight
                            && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= MAX_STYLE_LENGTH) {
                            styles[styles.length - 1].end += sty.end - sty.start;
                            styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                        }
                        else {
                            styles.push({
                                start: sty.start + text.length, end: sty.end + text.length, colour: sty.colour, decoration: sty.decoration,
                                style: sty.style, weight: sty.weight, text: fullText.slice(sty.start + text.length, sty.end + text.length), num: styles.length
                            });
                        }
                    }
                    else {
                        if (text.length <= MAX_STYLE_LENGTH) {
                            console.log('This stupid thing.');
                            styles.push({
                                start: this.stringStart, end: this.stringStart + text.length, colour: pallete.getColour(), decoration: pallete.getDecoration(),
                                style: pallete.getStyle(), weight: pallete.getWeight(), text: fullText.slice(this.stringStart, this.stringStart + text.length),
                                num: styles.length
                            });
                        }
                        else {
                            var splitArray = this.getStyleSplits(text.length);
                            var prevStart = 0;
                            console.log('This stupid thing1.');
                            for (var j = 0; j < splitArray.length; j++) {
                                styles.push({
                                    start: this.stringStart + prevStart, end: this.stringStart + prevStart + splitArray[j], colour: pallete.getColour(),
                                    decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                                    text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), num: styles.length
                                });
                                prevStart += splitArray[j];
                            }
                        }
                        hasInserted = true;
                    }
                }
                else {
                    if (sty.end < this.stringStart) {
                        console.log('This stupid thing2.');
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({
                            start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration,
                            style: sty.style, weight: sty.weight, text: sty.text, num: styles.length
                        });
                    }
                    else {
                        if (this.isCurrentStyle(sty, pallete)) {
                            if (sty.end - sty.start + text.length <= MAX_STYLE_LENGTH) {
                                console.log('This stupid thing3.');
                                styles.push({
                                    start: sty.start, end: sty.end + text.length, colour: sty.colour, decoration: sty.decoration,
                                    style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, sty.end + text.length), num: styles.length
                                });
                            }
                            else {
                                var splitArray = this.getStyleSplits(sty.end - sty.start + text.length);
                                var prevStart = 0;
                                console.log('This stupid thing4.');
                                for (var j = 0; j < splitArray.length; j++) {
                                    styles.push({
                                        start: sty.start + prevStart, end: sty.end + prevStart + splitArray[j], colour: sty.colour,
                                        decoration: sty.decoration, style: sty.style, weight: sty.weight,
                                        text: fullText.slice(sty.start + prevStart, sty.start + prevStart + splitArray[j]), num: styles.length
                                    });
                                    prevStart += splitArray[j];
                                }
                            }
                        }
                        else {
                            console.log('This stupid thing5.');
                            styles.push({
                                start: sty.start, end: this.stringStart, colour: sty.colour, decoration: sty.decoration,
                                style: sty.style, weight: sty.weight, text: fullText.slice(sty.start, this.stringStart), num: styles.length
                            });
                            if (text.length <= MAX_STYLE_LENGTH) {
                                styles.push({
                                    start: this.stringStart, end: this.stringStart + text.length, colour: pallete.getColour(),
                                    decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                                    text: fullText.slice(this.stringStart, this.stringStart + text.length), num: styles.length
                                });
                            }
                            else {
                                var splitArray = this.getStyleSplits(text.length);
                                var prevStart = 0;
                                for (var j = 0; j < splitArray.length; j++) {
                                    styles.push({
                                        start: this.stringStart + prevStart, end: this.stringStart + prevStart + splitArray[j], colour: pallete.getColour(),
                                        decoration: pallete.getDecoration(), style: pallete.getStyle(), weight: pallete.getWeight(),
                                        text: fullText.slice(this.stringStart + prevStart, this.stringStart + prevStart + splitArray[j]), num: styles.length
                                    });
                                    prevStart += splitArray[j];
                                }
                            }
                            styles.push({
                                start: this.stringStart + text.length, end: sty.end + text.length, colour: sty.colour, decoration: sty.decoration,
                                style: sty.style, weight: sty.weight, text: fullText.slice(this.stringStart + text.length, sty.end + text.length),
                                num: styles.length
                            });
                        }
                    }
                    hasInserted = true;
                }
            }
            if (!hasInserted) {
                console.log('This stupid thing6.');
                if (text.length <= MAX_STYLE_LENGTH) {
                    styles.push({
                        start: this.stringStart, end: this.stringStart + text.length, colour: pallete.getColour(), decoration: pallete.getDecoration(),
                        style: pallete.getStyle(), weight: pallete.getWeight(), text: fullText.slice(this.stringStart, this.stringStart + text.length),
                        num: styles.length
                    });
                }
                else {
                    var splitArray = this.getStyleSplits(text.length);
                    var prevStart = 0;
                    for (var j = 0; j < splitArray.length; j++) {
                        styles.push({
                            start: this.stringStart + prevStart, end: this.stringStart + prevStart + splitArray[j], colour: pallete.getColour(),
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
        };
        Element.prototype.getStyleSplits = function (length) {
            var slices = [];
            var lengthCount = 0;
            while (lengthCount < length) {
                slices.push(length - lengthCount < MAX_STYLE_LENGTH ? length - lengthCount : MAX_STYLE_LENGTH);
                lengthCount += length - lengthCount < MAX_STYLE_LENGTH ? length - lengthCount : MAX_STYLE_LENGTH;
            }
            return slices;
        };
        Element.prototype.newEdit = function () {
            var _this = this;
            this.editCount++;
            if (this.editCount > 5) {
                this.editCount = 0;
                clearTimeout(this.editTimer);
                return this.textEdited();
            }
            else {
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
        Element.prototype.completeEdit = function (editId) {
            var fullText = '';
            var editData = this.editInBuffer[editId];
            for (var i = 0; i < editData.styles.length; i++) {
                this.styleSet[editData[i].num] = editData[i];
            }
            for (var i = 0; i < this.styleSet.length; i++) {
                fullText += this.styleSet[i].text;
            }
            this.text = fullText;
            this.updateText();
        };
        Element.prototype.textEdited = function () {
            this.editOutBuffer = [];
            var editNum = this.editNum++;
            for (var i = 0; i < this.styleSet.length; i++) {
                this.editOutBuffer[editNum].push(this.styleSet[i]);
            }
            var payload = { bufferId: editNum, num_styles: this.editOutBuffer[editNum].length, styles: this.editOutBuffer[editNum] };
            var msg = { header: MessageTypes.EDIT, payload: payload };
            return msg;
        };
        Element.prototype.findStringPositions = function () {
            this.selectedCharacters = [];
            var found = [];
            if (this.textNodes.length == 0) {
                return 0;
            }
            var currGlyphCount = 0;
            for (var i = 0; i < this.textNodes.length; i++) {
                var line = this.textNodes[i];
                if (this.cursorEnd < currGlyphCount) {
                    break;
                }
                for (var j = 0; j < line.glyphs.length; j++) {
                    var glyph = line.glyphs[j];
                    if (currGlyphCount + j >= this.cursorStart && currGlyphCount + j < this.cursorEnd) {
                        for (var k = 0; k < glyph.stringPositions.length; k++) {
                            if (glyph.stringPositions[k] === undefined) {
                                found[glyph.stringPositions[k]] = true;
                                this.selectedCharacters.push(glyph.stringPositions[k]);
                            }
                        }
                    }
                    if (currGlyphCount + j == this.cursorStart) {
                        this.stringStart = glyph.stringPositions[0];
                    }
                }
                currGlyphCount += line.glyphs.length;
            }
        };
        return Element;
    }(BoardElement));
    WhiteBoardText.Element = Element;
})(WhiteBoardText || (WhiteBoardText = {}));
var fontHelper = [];
var normReq = new XMLHttpRequest();
normReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Regular.ttf", true);
normReq.responseType = "arraybuffer";
normReq.onload = function (oEvent) {
    var arrayBuffer = normReq.response;
    var buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['NORMAL'] = fontkit.create(buffer);
};
normReq.send(null);
var boldReq = new XMLHttpRequest();
boldReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Bold.ttf", true);
boldReq.responseType = "arraybuffer";
boldReq.onload = function (oEvent) {
    var arrayBuffer = boldReq.response;
    var buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['BOLD'] = fontkit.create(buffer);
};
boldReq.send(null);
var italReq = new XMLHttpRequest();
italReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-Italic.ttf", true);
italReq.responseType = "arraybuffer";
italReq.onload = function (oEvent) {
    var arrayBuffer = italReq.response;
    var buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['ITALIC'] = fontkit.create(buffer);
};
italReq.send(null);
var boldItalReq = new XMLHttpRequest();
boldItalReq.open("GET", "https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/NotoSans-BoldItalic.ttf", true);
boldItalReq.responseType = "arraybuffer";
boldItalReq.onload = function (oEvent) {
    var arrayBuffer = boldItalReq.response;
    var buffer = new NodeBuffer.Buffer(arrayBuffer);
    fontHelper['BOLDITALIC'] = fontkit.create(buffer);
};
boldItalReq.send(null);
registerComponent(WhiteBoardText.MODENAME, WhiteBoardText.Element, WhiteBoardText.Pallete);
