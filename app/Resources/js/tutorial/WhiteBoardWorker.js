var BaseMessageTypes = {
    DELETE: -1,
    RESTORE: -2,
    DROPPED: -3,
    MOVE: -4,
    RESIZE: -5,
    LOCK: -6,
    RELEASE: -7,
    LOCKID: -8,
    REFUSE: -9,
    COMPLETE: -10
};
var MAXSIZE = 10485760;
var UploadViewTypes = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    FILE: 'FILE',
    IFRAME: 'IFRAME'
};
var BoardElement = (function () {
    function BoardElement(type, id, x, y, width, height, userId, callbacks, serverId, updateTime) {
        this.isResizing = false;
        this.resizeHorz = false;
        this.resizeVert = false;
        this.hasResized = false;
        this.id = id;
        this.type = type;
        this.user = userId;
        this.sendServerMsg = callbacks.sendServerMsg;
        this.createAlert = callbacks.createAlert;
        this.createInfo = callbacks.createInfo;
        this.updateBoardView = callbacks.updateBoardView;
        this.updatePallete = callbacks.updatePallete;
        this.getAudioStream = callbacks.getAudioStream;
        this.getVideoStream = callbacks.getVideoStream;
        this.deleteElement = callbacks.deleteElement;
        this.serverId = serverId;
        this.opBuffer = [];
        this.operationStack = [];
        this.operationPos = 0;
        this.infoElement = -1;
        this.isEditing = false;
        this.isSelected = false;
        this.gettingLock = false;
        this.editLock = false;
        this.lockedBy = null;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isMoving = false;
        this.moveStartX = 0;
        this.moveStartY = 0;
        this.hasMoved = false;
        this.isResizing = false;
        this.resizeHorz = false;
        this.resizeVert = false;
        this.hasResized = false;
        if (serverId == null || serverId == undefined) {
            this.idTimeout = setTimeout(this.idFailed, 10000);
        }
        if (updateTime) {
            this.updateTime = updateTime;
        }
        else {
            this.updateTime = new Date();
        }
    }
    BoardElement.prototype.setServerId = function (id) {
        this.serverId = id;
        clearTimeout(this.idTimeout);
        return null;
    };
    BoardElement.prototype.idFailed = function () {
        this.createAlert('CONNECTION ERROR', 'Unable to send data to server due to connection problems.');
        var msg = { header: BaseMessageTypes.DELETE, payload: null };
        this.sendServerMsg(msg);
        this.deleteElement();
    };
    BoardElement.prototype.updateView = function (updatedParams) {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    };
    BoardElement.prototype.getCurrentViewState = function () {
        return this.currentViewState;
    };
    BoardElement.prototype.remoteEdit = function () {
        this.operationPos = 0;
        this.operationStack = [];
    };
    BoardElement.prototype.getDefaultInputReturn = function () {
        var retVal = {
            newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: this.isSelected,
            newViewCentre: null, infoMessage: null, alertMessage: null, wasDelete: null, wasRestore: null, move: null
        };
        return retVal;
    };
    BoardElement.prototype.checkForServerId = function (messages) {
        if (!this.serverId) {
            for (var i = 0; i < messages.length; i++) {
                console.log('No serverId, adding message to buffer.');
                this.opBuffer.push(messages[i]);
            }
            return [];
        }
        else {
            return messages;
        }
    };
    BoardElement.prototype.handleUndo = function () {
        var retVal = null;
        if (this.operationPos > 0) {
            retVal = this.operationStack[--this.operationPos].undo();
        }
        return retVal;
    };
    BoardElement.prototype.handleRedo = function () {
        var retVal = null;
        if (this.operationPos < this.operationStack.length) {
            retVal = this.operationStack[this.operationPos++].redo();
        }
        return retVal;
    };
    BoardElement.prototype.erase = function () {
        this.isDeleted = true;
        return this.currentViewState;
    };
    BoardElement.prototype.restore = function () {
        this.isDeleted = false;
        return this.currentViewState;
    };
    BoardElement.prototype.move = function (changeX, changeY, updateTime) {
        this.x += changeX;
        this.y += changeY;
        this.updateTime = updateTime;
        this.updateView({ x: this.x, y: this.y, updateTime: updateTime });
    };
    BoardElement.prototype.resize = function (width, height, updateTime) {
        this.updateTime = updateTime;
        this.height = height;
        this.updateView({
            width: this.width, height: this.height
        });
    };
    BoardElement.prototype.moveOperation = function (changeX, changeY, updateTime) {
        this.move(changeX, changeY, updateTime);
        var msgPayload = { x: this.x, y: this.y };
        var serverMsg = { header: BaseMessageTypes.MOVE, payload: msgPayload };
        var retVal = {
            id: this.id, newView: this.currentViewState, serverMessages: [], palleteChanges: [], newViewCentre: null, wasDelete: null,
            wasRestore: null, move: { x: changeX, y: changeY, message: serverMsg }
        };
        return retVal;
    };
    BoardElement.prototype.resizeOperation = function (width, height, updateTime) {
        var serverMessages = [];
        this.resize(width, height, updateTime);
        var msgPayload = { width: this.width, height: this.height };
        var serverMsg = { header: BaseMessageTypes.RESIZE, payload: msgPayload };
        serverMessages.push(serverMsg);
        var retVal = {
            id: this.id, newView: this.currentViewState, serverMessages: [], palleteChanges: [], newViewCentre: null, wasDelete: null,
            wasRestore: null, move: null
        };
        retVal.serverMessages = this.checkForServerId(serverMessages);
        return retVal;
    };
    BoardElement.prototype.elementErase = function () {
        var retMsgs = [];
        var centrePos = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        var message = { header: BaseMessageTypes.DELETE, payload: null };
        this.erase();
        var retVal = {
            id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: { message: message },
            wasRestore: null, move: null
        };
        var msg = { header: BaseMessageTypes.DELETE, payload: null };
        retMsgs.push(msg);
        retVal.serverMessages = this.checkForServerId(retMsgs);
        return retVal;
    };
    BoardElement.prototype.elementRestore = function () {
        var retMsgs = [];
        var centrePos = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        var message = { header: BaseMessageTypes.RESTORE, payload: null };
        this.restore();
        var retVal = {
            id: this.id, newView: this.currentViewState, serverMessages: [], newViewCentre: centrePos, palleteChanges: [], wasDelete: null,
            wasRestore: { message: message }, move: null
        };
        var msg = { header: BaseMessageTypes.RESTORE, payload: null };
        retMsgs.push(msg);
        retVal.serverMessages = this.checkForServerId(retMsgs);
        return retVal;
    };
    BoardElement.prototype.handleErase = function () {
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
    BoardElement.prototype.setEdit = function () {
        this.gettingLock = false;
        this.isEditing = true;
        this.updateView({ getLock: false, isEditing: true });
    };
    BoardElement.prototype.setLock = function (userId) {
        this.lockedBy = userId;
        this.editLock = true;
        this.updateView({ remLock: true });
    };
    BoardElement.prototype.setUnLock = function () {
        this.lockedBy = null;
        this.editLock = false;
        this.updateView({ remLock: false });
    };
    BoardElement.prototype.handleServerMessage = function (message) {
        var newView = this.currentViewState;
        var retMsgs = [];
        var alertMessage = null;
        var infoMessage = null;
        var wasEdit = false;
        var wasDelete = false;
        console.log("Recieved message: " + JSON.stringify(message));
        switch (message.header) {
            case BaseMessageTypes.DROPPED:
                alertMessage = { header: 'CONNECTION ERROR', message: 'Unable to send data to server due to connection problems.' };
                wasDelete = true;
                break;
            case BaseMessageTypes.COMPLETE:
                while (this.opBuffer.length > 0) {
                    var opMsg = void 0;
                    var op = this.opBuffer.shift();
                    opMsg = { header: op.header, payload: op.payload };
                    retMsgs.push(opMsg);
                }
                break;
            case BaseMessageTypes.MOVE:
                var mvdata = message.payload;
                this.move(mvdata.x - this.x, mvdata.y - this.y, mvdata.editTime);
                this.updateTime = mvdata.editTime;
                newView = this.currentViewState;
                break;
            case BaseMessageTypes.RESIZE:
                var resizeData = message.payload;
                this.resize(resizeData.width, resizeData.height, resizeData.editTime);
                newView = this.currentViewState;
                break;
            case BaseMessageTypes.LOCK:
                var lockData = message.payload;
                this.setLock(lockData.userId);
                newView = this.currentViewState;
                break;
            case BaseMessageTypes.RELEASE:
                this.setUnLock();
                break;
            case BaseMessageTypes.LOCKID:
                if (this.gettingLock) {
                    this.setEdit();
                }
                else {
                    var releaseMsg = { header: BaseMessageTypes.RELEASE, payload: null };
                    retMsgs.push(releaseMsg);
                }
                newView = this.currentViewState;
                break;
            case BaseMessageTypes.REFUSE:
                alertMessage = { header: 'Unable To Edit Item', message: 'The current room settings do not allow the editing of this item.' };
                break;
            case BaseMessageTypes.DELETE:
                wasDelete = true;
                this.erase();
                newView = this.currentViewState;
                break;
            case BaseMessageTypes.RESTORE:
                this.restore();
                newView = this.currentViewState;
                break;
            default:
                return this.handleElementServerMessage(message);
        }
        var retVal = {
            newView: newView, serverMessages: retMsgs, wasEdit: wasEdit, wasDelete: wasDelete, alertMessage: alertMessage, infoMessage: infoMessage
        };
        return retVal;
    };
    BoardElement.prototype.handleSelect = function () {
        this.isSelected = true;
        this.updateView({ isSelected: true });
        var retVal = this.currentViewState;
        return retVal;
    };
    BoardElement.prototype.handleDeselect = function () {
        this.isSelected = false;
        this.updateView({ isSelected: false });
        var retVal = this.currentViewState;
        return retVal;
    };
    return BoardElement;
}());
var BoardPallete = (function () {
    function BoardPallete() {
    }
    BoardPallete.prototype.updateView = function (updatedParams) {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    };
    return BoardPallete;
}());
var LocalAbstraction;
(function (LocalAbstraction) {
    var BoardModes = {
        SELECT: 'SELECT',
        ERASE: 'ERASE'
    };
    var WorkerMessageTypes;
    (function (WorkerMessageTypes) {
        WorkerMessageTypes[WorkerMessageTypes["UPDATEVIEW"] = 0] = "UPDATEVIEW";
        WorkerMessageTypes[WorkerMessageTypes["SETVBOX"] = 1] = "SETVBOX";
        WorkerMessageTypes[WorkerMessageTypes["AUDIOSTREAM"] = 2] = "AUDIOSTREAM";
        WorkerMessageTypes[WorkerMessageTypes["VIDEOSTREAM"] = 3] = "VIDEOSTREAM";
        WorkerMessageTypes[WorkerMessageTypes["NEWVIEWCENTRE"] = 4] = "NEWVIEWCENTRE";
        WorkerMessageTypes[WorkerMessageTypes["SETSELECT"] = 5] = "SETSELECT";
        WorkerMessageTypes[WorkerMessageTypes["ELEMENTMESSAGE"] = 6] = "ELEMENTMESSAGE";
        WorkerMessageTypes[WorkerMessageTypes["ELEMENTVIEW"] = 7] = "ELEMENTVIEW";
        WorkerMessageTypes[WorkerMessageTypes["ELEMENTDELETE"] = 8] = "ELEMENTDELETE";
        WorkerMessageTypes[WorkerMessageTypes["NEWALERT"] = 9] = "NEWALERT";
        WorkerMessageTypes[WorkerMessageTypes["REMOVEALERT"] = 10] = "REMOVEALERT";
        WorkerMessageTypes[WorkerMessageTypes["NEWINFO"] = 11] = "NEWINFO";
        WorkerMessageTypes[WorkerMessageTypes["REMOVEINFO"] = 12] = "REMOVEINFO";
    })(WorkerMessageTypes || (WorkerMessageTypes = {}));
    var ControllerMessageTypes;
    (function (ControllerMessageTypes) {
        ControllerMessageTypes[ControllerMessageTypes["START"] = 0] = "START";
        ControllerMessageTypes[ControllerMessageTypes["SETOPTIONS"] = 1] = "SETOPTIONS";
        ControllerMessageTypes[ControllerMessageTypes["REGISTER"] = 2] = "REGISTER";
        ControllerMessageTypes[ControllerMessageTypes["MODECHANGE"] = 3] = "MODECHANGE";
        ControllerMessageTypes[ControllerMessageTypes["AUDIOSTREAM"] = 4] = "AUDIOSTREAM";
        ControllerMessageTypes[ControllerMessageTypes["VIDEOSTREAM"] = 5] = "VIDEOSTREAM";
        ControllerMessageTypes[ControllerMessageTypes["NEWELEMENT"] = 6] = "NEWELEMENT";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTID"] = 7] = "ELEMENTID";
        ControllerMessageTypes[ControllerMessageTypes["BATCHMOVE"] = 8] = "BATCHMOVE";
        ControllerMessageTypes[ControllerMessageTypes["BATCHDELETE"] = 9] = "BATCHDELETE";
        ControllerMessageTypes[ControllerMessageTypes["BATCHRESTORE"] = 10] = "BATCHRESTORE";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMESSAGE"] = 11] = "ELEMENTMESSAGE";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEOVER"] = 12] = "ELEMENTMOUSEOVER";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEOUT"] = 13] = "ELEMENTMOUSEOUT";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEDOWN"] = 14] = "ELEMENTMOUSEDOWN";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTERASE"] = 15] = "ELEMENTERASE";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEMOVE"] = 16] = "ELEMENTMOUSEMOVE";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEUP"] = 17] = "ELEMENTMOUSEUP";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSECLICK"] = 18] = "ELEMENTMOUSECLICK";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEDBLCLICK"] = 19] = "ELEMENTMOUSEDBLCLICK";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHSTART"] = 20] = "ELEMENTTOUCHSTART";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHMOVE"] = 21] = "ELEMENTTOUCHMOVE";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHEND"] = 22] = "ELEMENTTOUCHEND";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHCANCEL"] = 23] = "ELEMENTTOUCHCANCEL";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTDRAG"] = 24] = "ELEMENTDRAG";
        ControllerMessageTypes[ControllerMessageTypes["ELEMENTDROP"] = 25] = "ELEMENTDROP";
        ControllerMessageTypes[ControllerMessageTypes["MOUSEDOWN"] = 26] = "MOUSEDOWN";
        ControllerMessageTypes[ControllerMessageTypes["MOUSEMOVE"] = 27] = "MOUSEMOVE";
        ControllerMessageTypes[ControllerMessageTypes["MOUSEUP"] = 28] = "MOUSEUP";
        ControllerMessageTypes[ControllerMessageTypes["MOUSECLICK"] = 29] = "MOUSECLICK";
        ControllerMessageTypes[ControllerMessageTypes["TOUCHSTART"] = 30] = "TOUCHSTART";
        ControllerMessageTypes[ControllerMessageTypes["TOUCHMOVE"] = 31] = "TOUCHMOVE";
        ControllerMessageTypes[ControllerMessageTypes["TOUCHEND"] = 32] = "TOUCHEND";
        ControllerMessageTypes[ControllerMessageTypes["TOUCHCANCEL"] = 33] = "TOUCHCANCEL";
        ControllerMessageTypes[ControllerMessageTypes["KEYBOARDINPUT"] = 34] = "KEYBOARDINPUT";
        ControllerMessageTypes[ControllerMessageTypes["UNDO"] = 35] = "UNDO";
        ControllerMessageTypes[ControllerMessageTypes["REDO"] = 36] = "REDO";
        ControllerMessageTypes[ControllerMessageTypes["DRAG"] = 37] = "DRAG";
        ControllerMessageTypes[ControllerMessageTypes["DROP"] = 38] = "DROP";
        ControllerMessageTypes[ControllerMessageTypes["PASTE"] = 39] = "PASTE";
        ControllerMessageTypes[ControllerMessageTypes["CUT"] = 40] = "CUT";
        ControllerMessageTypes[ControllerMessageTypes["PALLETECHANGE"] = 41] = "PALLETECHANGE";
        ControllerMessageTypes[ControllerMessageTypes["LEAVE"] = 42] = "LEAVE";
        ControllerMessageTypes[ControllerMessageTypes["ERROR"] = 43] = "ERROR";
    })(ControllerMessageTypes || (ControllerMessageTypes = {}));
    var WhiteBoardWorker = (function () {
        function WhiteBoardWorker(isHost, userId, allEdit, userEdit, workerContext) {
            this.isHost = false;
            this.userId = 0;
            this.allowAllEdit = false;
            this.allowUserEdit = false;
            this.components = [];
            this.isPoint = true;
            this.prevX = 0;
            this.prevY = 0;
            this.groupStartX = 0;
            this.groupStartY = 0;
            this.currentHover = -1;
            this.blockAlert = false;
            this.selectDrag = false;
            this.currSelect = [];
            this.currentEdit = -1;
            this.groupMoving = false;
            this.groupMoved = false;
            this.touchStartHandled = false;
            this.dropToElement = false;
            this.operationStack = [];
            this.operationPos = 0;
            this.elementDict = [];
            this.boardElems = [];
            this.infoElems = [];
            this.elementUpdateBuffer = [];
            this.socketMessageBuffer = [];
            this.alertBuffer = [];
            this.infoBuffer = [];
            this.removeInfoBuffer = [];
            this.deleteBuffer = [];
            this.audioRequests = [];
            this.videoRequests = [];
            this.viewUpdateBuffer = null;
            this.willRemoveAlert = false;
            this.newViewCentre = null;
            this.newViewBox = null;
            this.elementMoves = [];
            this.elementDeletes = [];
            this.elementRestores = [];
            this.clipboardItems = [];
            this.isHost = isHost;
            this.userId = userId;
            this.allowAllEdit = allEdit;
            this.allowUserEdit = userEdit;
            this.controller = workerContext;
            console.log('Room options: allowAllEdit: ' + allEdit + ', allowUserEdit: ' + userEdit + ', isHost: ' + isHost);
        }
        WhiteBoardWorker.prototype.updateView = function (updates) {
            if (this.viewUpdateBuffer == null) {
                this.viewUpdateBuffer = {};
            }
            Object.assign(this.viewUpdateBuffer, updates);
        };
        WhiteBoardWorker.prototype.setElementView = function (id, newView) {
            if (newView == null) {
                throw "NULL ELEMENT VIEW GIVEN";
            }
            this.elementUpdateBuffer.push({ id: id, view: newView });
        };
        WhiteBoardWorker.prototype.setRoomOptions = function (allowAllEdit, allowUserEdit) {
            this.allowAllEdit = allowAllEdit;
            this.allowUserEdit = allowUserEdit;
            console.log('Room options: allowAllEdit: ' + allowAllEdit + ', allowUserEdit: ' + allowUserEdit);
        };
        WhiteBoardWorker.prototype.endCallback = function () {
            var clipData = [];
            if (controller.currSelect.length > 1) {
            }
            else {
                for (var i = 0; i < controller.clipboardItems.length; i++) {
                    clipData.push({ format: controller.clipboardItems[i].format, data: controller.clipboardItems[i].data });
                }
            }
            var message = {
                elementViews: controller.elementUpdateBuffer, elementMessages: controller.socketMessageBuffer, deleteElements: controller.deleteBuffer,
                audioRequests: controller.audioRequests, videoRequests: controller.videoRequests, alerts: controller.alertBuffer,
                infoMessages: controller.infoBuffer, removeAlert: controller.willRemoveAlert, removeInfos: controller.removeInfoBuffer,
                selectCount: controller.currSelect.length, elementMoves: controller.elementMoves, elementDeletes: controller.elementDeletes,
                elementRestores: controller.elementRestores, clipboardData: clipData
            };
            if (controller.viewUpdateBuffer != null) {
                Object.assign(message, { viewUpdate: controller.viewUpdateBuffer });
            }
            if (controller.newViewCentre != null) {
                Object.assign(message, { viewCentre: controller.newViewCentre });
            }
            if (controller.newViewBox != null) {
                Object.assign(message, { viewBox: controller.newViewBox });
            }
            postMessage(message);
        };
        WhiteBoardWorker.prototype.sendMessage = function (type, message) {
            this.socketMessageBuffer.push({ type: type, message: message });
        };
        WhiteBoardWorker.prototype.getAudioStream = function (id) {
            this.audioRequests.push(id);
        };
        WhiteBoardWorker.prototype.setAudioStream = function (id) {
        };
        WhiteBoardWorker.prototype.getVideoStream = function (id) {
            this.videoRequests.push(id);
        };
        WhiteBoardWorker.prototype.setVideoStream = function (id) {
        };
        WhiteBoardWorker.prototype.newAlert = function (type, message) {
            var newMsg = { type: type, message: message };
            this.alertBuffer.push(newMsg);
        };
        WhiteBoardWorker.prototype.removeAlert = function () {
            this.willRemoveAlert = true;
        };
        WhiteBoardWorker.prototype.deleteElement = function (id) {
            this.deleteBuffer.push(id);
        };
        WhiteBoardWorker.prototype.setMode = function (newMode) {
            var palleteView = {};
            var cursor = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };
            if (newMode != BoardModes.SELECT && newMode != BoardModes.ERASE) {
                palleteView = this.components[newMode].pallete.getCurrentViewState();
                cursor = this.components[newMode].pallete.getCursor();
            }
            this.updateView({
                mode: newMode, palleteState: palleteView, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset
            });
        };
        WhiteBoardWorker.prototype.sendElementMessage = function (id, type, message) {
            var serverId = this.getBoardElement(id).serverId;
            var msg = { id: serverId, type: type, payload: message };
            this.sendMessage('MSG-COMPONENT', msg);
        };
        WhiteBoardWorker.prototype.selectGroup = function (ids) {
            for (var i = 0; i < this.currSelect.length; i++) {
                var elem = this.getBoardElement(this.currSelect[i]);
                var newView = elem.handleDeselect();
                this.setElementView(elem.id, newView);
            }
            this.clipboardItems = [];
            for (var i = 0; i < ids.length; i++) {
                var elem = this.getBoardElement(ids[i]);
                if (!elem.isDeleted) {
                    var retVal = elem.handleSelect();
                    this.currSelect.push(elem.id);
                    this.setElementView(elem.id, retVal);
                    var svgItems = [];
                    if (ids.length > 1) {
                        var svgElem = elem.getClipboardSVG();
                        if (svgElem != null) {
                            this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem, id: elem.id });
                        }
                    }
                    else {
                        var clipElems = elem.getClipboardData();
                        if (clipElems != null) {
                            for (var i_1 = 0; i_1 < clipElems.length; i_1++) {
                                this.clipboardItems.push({ format: clipElems[i_1].format, data: clipElems[i_1].data, id: elem.id });
                            }
                        }
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.handleElementOperation = function (id, undoOp, redoOp) {
            if (undoOp && redoOp) {
                this.newOperation(id, undoOp, redoOp);
            }
            else if (undoOp || redoOp) {
                console.error('Element provided either undo or redo operation. It must specify neither or both.');
            }
        };
        WhiteBoardWorker.prototype.handleElementMessages = function (id, type, messages) {
            for (var i = 0; i < messages.length; i++) {
                this.sendElementMessage(id, type, messages[i]);
            }
        };
        WhiteBoardWorker.prototype.handleMouseElementSelect = function (e, elem, isSelected, cursor) {
            if (isSelected) {
                var alreadySelected = false;
                for (var i = 0; i < this.currSelect.length; i++) {
                    if (this.currSelect[i] == elem.id) {
                        alreadySelected = true;
                    }
                }
                if (!alreadySelected) {
                    if (e.ctrlKey && this.currSelect.length > 0) {
                        if (this.currSelect.length == 1) {
                            this.clipboardItems = [];
                            var svgElem_1 = this.boardElems[this.currSelect[0]].getClipboardSVG();
                            if (svgElem_1 != null) {
                                this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem_1, id: this.boardElems[this.currSelect[0]].id });
                            }
                        }
                        this.currSelect.push(elem.id);
                        var svgElem = elem.getClipboardSVG();
                        if (svgElem != null) {
                            this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem, id: elem.id });
                        }
                    }
                    else {
                        for (var i = 0; i < this.currSelect.length; i++) {
                            if (this.currSelect[i] != elem.id) {
                                var selElem = this.getBoardElement(this.currSelect[i]);
                                var selElemView = selElem.handleDeselect();
                                this.setElementView(selElem.id, selElemView);
                            }
                        }
                        this.currSelect = [];
                        this.clipboardItems = [];
                        var clipElems = elem.getClipboardData();
                        if (clipElems != null) {
                            for (var i = 0; i < clipElems.length; i++) {
                                this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                            }
                        }
                        this.currSelect.push(elem.id);
                    }
                }
                if (this.currSelect.length == 1 && cursor) {
                    this.updateView({ cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                }
            }
            else {
                if (this.currSelect.length == 1 && this.currSelect[0] == elem.id) {
                    this.updateView({ cursor: 'auto', cursorURL: [], cursorOffset: { x: 0, y: 0 } });
                    this.currSelect = [];
                }
                else {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        if (this.currSelect[i] == elem.id) {
                            this.currSelect.splice(i, 1);
                        }
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.handleTouchElementSelect = function (e, elem, isSelected, cursor) {
            if (isSelected) {
                if (e.ctrlKey && this.currSelect.length > 0) {
                    if (this.currSelect.length == 1) {
                        this.clipboardItems = [];
                        var svgElem_2 = this.boardElems[this.currSelect[0]].getClipboardSVG();
                        if (svgElem_2 != null) {
                            this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem_2, id: this.boardElems[this.currSelect[0]].id });
                        }
                    }
                    this.currSelect.push(elem.id);
                    var svgElem = elem.getClipboardSVG();
                    if (svgElem != null) {
                        this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem, id: elem.id });
                    }
                }
                else {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        if (this.currSelect[i] != elem.id) {
                            var selElem = this.getBoardElement(this.currSelect[i]);
                            var selElemView = selElem.handleDeselect();
                            this.setElementView(selElem.id, selElemView);
                        }
                    }
                    this.currSelect = [];
                    this.clipboardItems = [];
                    var clipElems = elem.getClipboardData();
                    if (clipElems != null) {
                        for (var i = 0; i < clipElems.length; i++) {
                            this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                        }
                    }
                    this.currSelect.push(elem.id);
                }
                if (this.currSelect.length == 1 && cursor) {
                    this.updateView({ cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                }
            }
            else {
                for (var i = 0; i < this.currSelect.length; i++) {
                    if (this.currSelect[i] == elem.id) {
                        this.currSelect.splice(i, 1);
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.handleElementPalleteChanges = function (elem, changes) {
            for (var j = 0; j < changes.length; j++) {
                var change = changes[j];
                this.components[elem.type].pallete.handleChange(change);
            }
            if (changes.length > 0) {
                var cursor = this.components[elem.type].pallete.getCursor();
                var state = this.components[elem.type].pallete.getCurrentViewState();
                this.updateView({ palleteState: state, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
            }
        };
        WhiteBoardWorker.prototype.handleElementNewViewCentre = function (x, y) {
            this.newViewCentre = { x: x, y: y };
        };
        WhiteBoardWorker.prototype.handleRemoteEdit = function (id) {
            var _this = this;
            for (var i = 0; i < this.operationStack.length; i++) {
                if (this.operationStack[i].ids.indexOf(id) != -1) {
                    var newOp = {
                        ids: this.operationStack[i].ids,
                        undos: [(function (elemIds) {
                                return function () { _this.selectGroup(elemIds); return null; };
                            })(this.operationStack[i].ids)],
                        redos: [(function (elemIds) {
                                return function () { _this.selectGroup(elemIds); return null; };
                            })(this.operationStack[i].ids)]
                    };
                    this.operationStack.splice(i, 1, newOp);
                }
            }
        };
        WhiteBoardWorker.prototype.handleInfoMessage = function (data) {
        };
        WhiteBoardWorker.prototype.handleAlertMessage = function (msg) {
            if (msg) {
                this.newAlert(msg.header, msg.message);
            }
        };
        WhiteBoardWorker.prototype.startMove = function (startX, startY) {
            this.groupStartX = startX;
            this.groupStartY = startY;
            this.groupMoving = true;
            this.updateView({ cursor: 'move', cursorURL: [], cursorOffset: { x: 0, y: 0 } });
            for (var i = 0; i < this.currSelect.length; i++) {
                var elem = this.getBoardElement(this.currSelect[i]);
                var retVal = elem.startMove();
            }
        };
        WhiteBoardWorker.prototype.moveGroup = function (x, y, editTime) {
            for (var i = 0; i < this.currSelect.length; i++) {
                var elem = this.getBoardElement(this.currSelect[i]);
                var elemView = elem.handleMove(x, y);
                this.setElementView(elem.id, elemView);
            }
        };
        WhiteBoardWorker.prototype.endMove = function (endX, endY) {
            var _this = this;
            this.groupMoving = false;
            this.updateView({ cursor: 'auto', cursorURL: [], cursorOffset: { x: 0, y: 0 } });
            var undoOpList = [];
            var redoOpList = [];
            for (var i = 0; i < this.currSelect.length; i++) {
                var elem = this.getBoardElement(this.currSelect[i]);
                var retVal = elem.endMove();
                var undoOp = (function (element, changeX, changeY) {
                    return function () {
                        element.handleMove(-changeX, -changeY);
                        var ret = element.endMove();
                        _this.handleElementMessages(element.id, element.type, ret.serverMessages);
                        if (element.serverId != null && element.serverId != undefined) {
                            if (ret.move) {
                                _this.elementMoves.push({ id: element.serverId, x: ret.move.x, y: ret.move.y });
                            }
                        }
                        else {
                            if (ret.move) {
                                element.opBuffer.push(ret.move.message);
                            }
                        }
                        _this.setElementView(element.id, ret.newView);
                    };
                })(elem, endX - this.groupStartX, endY - this.groupStartY);
                var redoOp = (function (element, changeX, changeY) {
                    return function () {
                        element.handleMove(changeX, changeY);
                        var ret = element.endMove();
                        _this.handleElementMessages(element.id, element.type, ret.serverMessages);
                        if (element.serverId != null && element.serverId != undefined) {
                            if (ret.move) {
                                _this.elementMoves.push({ id: element.serverId, x: ret.move.x, y: ret.move.y });
                            }
                        }
                        else {
                            if (ret.move) {
                                element.opBuffer.push(ret.move.message);
                            }
                        }
                        _this.setElementView(element.id, ret.newView);
                    };
                })(elem, endX - this.groupStartX, endY - this.groupStartY);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                }
                this.setElementView(elem.id, retVal.newView);
                undoOpList.push(undoOp);
                redoOpList.push(redoOp);
            }
            this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
            var newOp = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
            this.operationStack[this.operationPos++] = newOp;
        };
        WhiteBoardWorker.prototype.selectElement = function (id) {
            var elem = this.getBoardElement(id);
            if (!elem.isDeleted) {
                var retVal = elem.handleSelect();
                if (this.currSelect.length > 1) {
                    if (this.currSelect.length == 2) {
                        this.clipboardItems = [];
                        var svgElem_3 = this.boardElems[this.currSelect[0]].getClipboardSVG();
                        if (svgElem_3 != null) {
                            this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem_3, id: this.boardElems[this.currSelect[0]].id });
                        }
                    }
                    var svgElem = elem.getClipboardSVG();
                    if (svgElem != null) {
                        this.clipboardItems.push({ format: 'image/svg+xml', data: svgElem, id: elem.id });
                    }
                }
                else {
                    var clipElems = elem.getClipboardData();
                    if (clipElems != null) {
                        for (var i = 0; i < clipElems.length; i++) {
                            this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                        }
                    }
                }
                this.setElementView(id, retVal);
            }
        };
        WhiteBoardWorker.prototype.deselectElement = function (id) {
            var elem = this.getBoardElement(id);
            var newElemView = elem.handleDeselect();
            for (var i = 0; i < this.clipboardItems.length; i++) {
                if (this.clipboardItems[i].elemId == id) {
                    this.clipboardItems.splice(i, 1);
                    i--;
                }
            }
            this.setElementView(elem.id, newElemView);
        };
        WhiteBoardWorker.prototype.startEditElement = function (id) {
            this.currentEdit = id;
            var elem = this.getBoardElement(id);
            if (!elem.isDeleted) {
                this.setMode(elem.type);
                var retVal = elem.handleStartEdit();
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        };
        WhiteBoardWorker.prototype.endEditElement = function (id) {
            this.setMode(BoardModes.SELECT);
            this.currentEdit = -1;
            var elem = this.getBoardElement(id);
            var retVal = elem.handleEndEdit();
            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            if (elem.serverId != null && elem.serverId != undefined) {
                if (retVal.move) {
                    this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                }
                if (retVal.wasDelete) {
                    this.elementDeletes.push(elem.serverId);
                }
                if (retVal.wasRestore) {
                    this.elementRestores.push(elem.serverId);
                }
            }
            else {
                if (retVal.move) {
                    elem.opBuffer.push(retVal.move.message);
                }
                if (retVal.wasDelete) {
                    elem.opBuffer.push(retVal.wasDelete.message);
                }
                if (retVal.wasRestore) {
                    elem.opBuffer.push(retVal.wasRestore.message);
                }
            }
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if (retVal.newViewCentre) {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
            this.currSelect = [];
        };
        WhiteBoardWorker.prototype.addInfoMessage = function (x, y, width, height, header, message) {
            var newInfo = {
                id: -1, x: x, y: y, width: width, height: height, header: header, message: message
            };
            var localId = this.infoElems.length;
            this.infoElems[localId] = newInfo;
            newInfo.id = localId;
            var newInfoView = {
                x: x, y: y, width: width, height: height, header: header, message: message
            };
            this.infoBuffer.push(newInfoView);
            return localId;
        };
        WhiteBoardWorker.prototype.removeInfoMessage = function (id) {
            this.removeInfoBuffer.push(id);
        };
        WhiteBoardWorker.prototype.setViewBox = function (panX, panY, scaleF) {
            this.newViewBox = { panX: panX, panY: panY, scaleF: scaleF };
        };
        WhiteBoardWorker.prototype.getBoardElement = function (id) {
            if (this.boardElems[id]) {
                return this.boardElems[id];
            }
            else {
                console.error('Attempted to get a board element that does not exist.');
                throw 'ELEMENT DOES NOT EXIST';
            }
        };
        WhiteBoardWorker.prototype.getInfoMessage = function (id) {
            return this.infoElems[id];
        };
        WhiteBoardWorker.prototype.undo = function () {
            if (this.operationPos > 0) {
                var operation = this.operationStack[--this.operationPos];
                for (var i = 0; i < operation.undos.length; i++) {
                    var retVal = operation.undos[i]();
                    if (retVal) {
                        var elem = this.getBoardElement(retVal.id);
                        this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                        if (elem.serverId != null && elem.serverId != undefined) {
                            if (retVal.move) {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if (retVal.wasDelete) {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if (retVal.wasRestore) {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else {
                            if (retVal.move) {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if (retVal.wasDelete) {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if (retVal.wasRestore) {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        this.setElementView(retVal.id, retVal.newView);
                        if (retVal.newViewCentre) {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        if (retVal.wasDelete) {
                            this.deleteElement(elem.id);
                        }
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.redo = function () {
            if (this.operationPos < this.operationStack.length) {
                var operation = this.operationStack[this.operationPos++];
                for (var i = 0; i < operation.redos.length; i++) {
                    var retVal = operation.redos[i]();
                    if (retVal) {
                        var elem = this.getBoardElement(retVal.id);
                        this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                        if (elem.serverId != null && elem.serverId != undefined) {
                            if (retVal.move) {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if (retVal.wasDelete) {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if (retVal.wasRestore) {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else {
                            if (retVal.move) {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if (retVal.wasDelete) {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if (retVal.wasRestore) {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        this.setElementView(retVal.id, retVal.newView);
                        if (retVal.newViewCentre) {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        if (retVal.wasDelete) {
                            this.deleteElement(elem.id);
                        }
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.newOperation = function (itemId, undoOp, redoOp) {
            this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
            var newOp = { ids: [itemId], undos: [undoOp], redos: [redoOp] };
            this.operationStack[this.operationPos++] = newOp;
        };
        WhiteBoardWorker.prototype.undoItemEdit = function (id) {
            var elem = this.getBoardElement(id);
            if (!elem.isDeleted) {
                var retVal = elem.handleUndo();
                if (retVal) {
                    this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                    if (elem.serverId != null && elem.serverId != undefined) {
                        if (retVal.move) {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if (retVal.wasDelete) {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if (retVal.wasRestore) {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else {
                        if (retVal.move) {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if (retVal.wasDelete) {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if (retVal.wasRestore) {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    this.setElementView(retVal.id, retVal.newView);
                    if (retVal.newViewCentre) {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    if (retVal.wasDelete) {
                        this.deleteElement(elem.id);
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.redoItemEdit = function (id) {
            var elem = this.getBoardElement(id);
            if (!elem.isDeleted) {
                var retVal = elem.handleRedo();
                if (retVal) {
                    this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                    if (elem.serverId != null && elem.serverId != undefined) {
                        if (retVal.move) {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if (retVal.wasDelete) {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if (retVal.wasRestore) {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else {
                        if (retVal.move) {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if (retVal.wasDelete) {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if (retVal.wasRestore) {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    this.setElementView(retVal.id, retVal.newView);
                    if (retVal.newViewCentre) {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    if (retVal.wasDelete) {
                        this.deleteElement(elem.id);
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.addHoverInfo = function (id, mouseX, mouseY) {
            var elem = this.getBoardElement(id);
            var infoId = this.addInfoMessage(mouseX, mouseX, 200, 200, 'Test Message', 'User ID: ' + elem.user);
            elem.infoElement = infoId;
        };
        WhiteBoardWorker.prototype.removeHoverInfo = function (id) {
            var elem = this.getBoardElement(id);
            elem.infoElement = -1;
            this.currentHover = -1;
            this.removeInfoMessage(elem.infoElement);
        };
        WhiteBoardWorker.prototype.infoMessageTimeout = function (id, mouseX, mouseY, self) {
            this.addHoverInfo(id, mouseX, mouseY);
        };
        WhiteBoardWorker.prototype.sendNewElement = function (msg) {
            this.sendMessage('NEW-ELEMENT', msg);
        };
        WhiteBoardWorker.prototype.eraseElement = function (id) {
            var elem = this.getBoardElement(id);
            console.log('Check for user match: ' + (this.userId == elem.user));
            console.log('Elem user: ' + elem.user + ', this user: ' + this.userId);
            if (this.isHost || this.allowAllEdit || (this.userId == elem.user && this.allowUserEdit)) {
                var retVal = elem.handleErase();
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.deleteElement(id);
                if (this.currentHover == id) {
                    clearTimeout(elem.hoverTimer);
                    this.removeHoverInfo(this.currentHover);
                }
            }
        };
        WhiteBoardWorker.prototype.newElement = function (data) {
            var _this = this;
            if (this.elementDict[data.serverId] == undefined || this.elementDict[data.serverId] == null) {
                if (this.components[data.type]) {
                    var localId_1 = this.boardElems.length;
                    var callbacks = {
                        sendServerMsg: (function (id, type) { return function (msg) { _this.sendElementMessage(id, type, msg); _this.endCallback(); }; })(localId_1, data.type),
                        createAlert: function (header, message) { _this.endCallback(); },
                        createInfo: function (x, y, width, height, header, message) { var retVal = _this.addInfoMessage(x, y, width, height, header, message); _this.endCallback(); return retVal; },
                        removeInfo: function (id) { _this.removeInfoMessage(id); _this.endCallback(); },
                        updateBoardView: (function (id) { return function (newView) { _this.setElementView(id, newView); _this.endCallback(); }; })(localId_1),
                        updatePallete: (function (type) {
                            return function (changes) {
                                for (var j = 0; j < changes.length; j++) {
                                    var change = changes[j];
                                    _this.components[type].pallete.handleChange(change);
                                }
                                var cursor = _this.components[type].pallete.getCursor();
                                var state = _this.components[type].pallete.getCurrentViewState();
                                _this.updateView({ palleteState: state, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                                _this.endCallback();
                            };
                        })(data.type),
                        getAudioStream: function () { return _this.getAudioStream(localId_1); },
                        getVideoStream: function () { return _this.getVideoStream(localId_1); },
                        deleteElement: (function (id) { return (function () { _this.deleteElement(id); _this.endCallback(); }); })(localId_1)
                    };
                    var creationArg = { id: localId_1, userId: data.userId, callbacks: callbacks, serverMsg: data.payload, serverId: data.serverId };
                    this.boardElems[localId_1] = this.components[data.type].Element.createElement(creationArg);
                    this.elementDict[data.serverId] = localId_1;
                    this.setElementView(this.boardElems[localId_1].id, this.boardElems[localId_1].getCurrentViewState());
                }
                else {
                    console.error('Unrecognized type.');
                }
            }
        };
        WhiteBoardWorker.prototype.elementID = function (data) {
            this.elementDict[data.serverId] = data.localId;
            var elem = this.boardElems[data.localId];
            var retVal = elem.setServerId(data.serverId);
            this.handleElementMessages(elem.id, elem.type, retVal);
        };
        WhiteBoardWorker.prototype.batchMove = function (moveData) {
            for (var i = 0; i < moveData.length; i++) {
                var elem = this.getBoardElement(this.elementDict[moveData[i].id]);
                var retVal = elem.handleMove(moveData[i].x - elem.x, moveData[i].y - elem.y);
                this.setElementView(elem.id, retVal);
            }
        };
        WhiteBoardWorker.prototype.batchDelete = function (serverIds) {
            for (var i = 0; i < serverIds.length; i++) {
                var elem = this.getBoardElement(this.elementDict[serverIds[i]]);
                elem.erase();
                this.deleteElement(elem.id);
            }
        };
        WhiteBoardWorker.prototype.batchRestore = function (serverIds) {
            for (var i = 0; i < serverIds.length; i++) {
                var elem = this.getBoardElement(this.elementDict[serverIds[i]]);
                var newView = elem.restore();
                this.setElementView(elem.id, newView);
            }
        };
        WhiteBoardWorker.prototype.elementMessage = function (data) {
            var _this = this;
            if (this.elementDict[data.serverId] != undefined && this.elementDict[data.serverId] != null) {
                var elem = this.getBoardElement(this.elementDict[data.serverId]);
                var retVal = elem.handleServerMessage(data.payload);
                if (retVal.wasEdit) {
                    this.handleRemoteEdit(elem.id);
                }
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                this.setElementView(elem.id, retVal.newView);
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                if (retVal.wasDelete) {
                    this.deleteElement(elem.id);
                    if (this.currSelect.indexOf(elem.id)) {
                        this.currSelect.splice(this.currSelect.indexOf(elem.id), 1);
                    }
                    if (this.currentHover == elem.id) {
                        clearTimeout(elem.hoverTimer);
                        this.removeHoverInfo(this.currentHover);
                    }
                    for (var i = 0; i < this.operationStack.length; i++) {
                        if (this.operationStack[i].ids.indexOf(elem.id) != -1) {
                            if (this.operationStack[i].ids.length == 1) {
                                if (i <= this.operationPos) {
                                    this.operationPos--;
                                }
                                this.operationStack.splice(i--, 1);
                            }
                            else {
                                this.operationStack[i].ids.splice(this.operationStack[i].ids.indexOf(elem.id), 1);
                                var newOp = {
                                    ids: this.operationStack[i].ids,
                                    undos: [(function (elemIds) {
                                            return function () { _this.selectGroup(elemIds); return null; };
                                        })(this.operationStack[i].ids.slice())],
                                    redos: [(function (elemIds) {
                                            return function () { _this.selectGroup(elemIds); return null; };
                                        })(this.operationStack[i].ids.slice())]
                                };
                                this.operationStack.splice(i, 1, newOp);
                            }
                        }
                    }
                }
            }
            else if (data.type && data.serverId) {
                var msg = { type: data.type, id: data.serverId };
                console.log('Unknown element. ID: ' + data.serverId);
                this.sendMessage('UNKNOWN-ELEMENT', msg);
            }
        };
        WhiteBoardWorker.prototype.serverError = function (message) {
            this.newAlert('SERVER ERROR', 'A server error has occured, some data in this session may be lost.');
        };
        WhiteBoardWorker.prototype.modeChange = function (newMode) {
            if (this.currentEdit != -1) {
                this.endEditElement(this.currentEdit);
            }
            else {
                for (var i = 0; i < this.currSelect.length; i++) {
                    var elem = this.getBoardElement(this.currSelect[i]);
                    var retVal = elem.handleDeselect();
                    this.setElementView(elem.id, retVal);
                }
            }
            this.currSelect = [];
            this.clipboardItems = [];
            this.setMode(newMode);
        };
        WhiteBoardWorker.prototype.changeEraseSize = function (newSize) {
            var newView = { eraseSize: newSize };
            this.updateView(newView);
        };
        WhiteBoardWorker.prototype.elementMouseOver = function (id, e) {
            var elem = this.getBoardElement(id);
            if (this.currentHover == -1) {
                this.currentHover = id;
                elem.hoverTimer = setTimeout(this.infoMessageTimeout.bind(this), 2000, id);
            }
            else {
                var prevElem = this.getBoardElement(this.currentHover);
                clearTimeout(prevElem.hoverTimer);
            }
        };
        WhiteBoardWorker.prototype.elementMouseOut = function (id, e) {
            var elem = this.getBoardElement(id);
            if (this.currentHover == id) {
                clearTimeout(elem.hoverTimer);
                this.removeHoverInfo(this.currentHover);
            }
        };
        WhiteBoardWorker.prototype.elementMouseDown = function (id, e, mouseX, mouseY, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.currSelect.length > 1 && elem.isSelected && e.buttons == 1) {
                console.log('Started Move.');
                this.startMove(mouseX, mouseY);
            }
            else if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                var retVal = elem.handleMouseDown(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
            if (this.currentHover == id) {
                clearTimeout(elem.hoverTimer);
                this.removeHoverInfo(this.currentHover);
            }
            this.prevX = mouseX;
            this.prevY = mouseY;
        };
        WhiteBoardWorker.prototype.elementMouseMove = function (id, e, mouseX, mouseY, componenet, subId) {
            if (!this.groupMoving) {
                var elem = this.getBoardElement(id);
                if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                    var retVal = elem.handleMouseMove(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);
                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if (elem.serverId != null && elem.serverId != undefined) {
                        if (retVal.move) {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if (retVal.wasDelete) {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if (retVal.wasRestore) {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else {
                        if (retVal.move) {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if (retVal.wasDelete) {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if (retVal.wasRestore) {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    this.handleMouseElementSelect(e, elem, retVal.isSelected);
                    if (retVal.newViewCentre) {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                }
            }
            this.prevX = mouseX;
            this.prevY = mouseY;
        };
        WhiteBoardWorker.prototype.elementMouseUp = function (id, e, mouseX, mouseY, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                var retVal = elem.handleMouseUp(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        };
        WhiteBoardWorker.prototype.elementMouseClick = function (id, e, mouseX, mouseY, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.currentEdit != -1) {
                if (this.currentEdit == elem.id) {
                    var retVal = elem.handleMouseClick(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);
                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if (elem.serverId != null && elem.serverId != undefined) {
                        if (retVal.move) {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if (retVal.wasDelete) {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if (retVal.wasRestore) {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else {
                        if (retVal.move) {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if (retVal.wasDelete) {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if (retVal.wasRestore) {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                    this.clipboardItems = [];
                    var clipElems = elem.getClipboardData();
                    if (clipElems != null) {
                        for (var i = 0; i < clipElems.length; i++) {
                            this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                        }
                    }
                }
            }
            else {
                if (this.currSelect.length == 0 || e.ctrlKey) {
                    this.currSelect.push(elem.id);
                    this.selectElement(elem.id);
                }
                else {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
                    this.clipboardItems = [];
                    this.currSelect.push(elem.id);
                    this.selectElement(elem.id);
                }
            }
        };
        WhiteBoardWorker.prototype.elementMouseDoubleClick = function (id, e, mouseX, mouseY, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.currentEdit != -1) {
                if (this.currentEdit == elem.id) {
                    var retVal = elem.handleDoubleClick(e, mouseX - elem.x, mouseY - elem.y, this.components[elem.type].pallete, componenet, subId);
                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    if (elem.serverId != null && elem.serverId != undefined) {
                        if (retVal.move) {
                            this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if (retVal.wasDelete) {
                            this.elementDeletes.push(elem.serverId);
                        }
                        if (retVal.wasRestore) {
                            this.elementRestores.push(elem.serverId);
                        }
                    }
                    else {
                        if (retVal.move) {
                            elem.opBuffer.push(retVal.move.message);
                        }
                        if (retVal.wasDelete) {
                            elem.opBuffer.push(retVal.wasDelete.message);
                        }
                        if (retVal.wasRestore) {
                            elem.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                    this.clipboardItems = [];
                    var clipElems = elem.getClipboardData();
                    if (clipElems != null) {
                        for (var i = 0; i < clipElems.length; i++) {
                            this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                        }
                    }
                }
            }
            else {
                if (this.currSelect.length != 0) {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
                    this.clipboardItems = [];
                }
                if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                    this.startEditElement(elem.id);
                }
                else {
                    this.currSelect.push(elem.id);
                    this.selectElement(elem.id);
                }
            }
        };
        WhiteBoardWorker.prototype.elementTouchStart = function (id, e, boardTouches, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.currSelect.length > 1 && elem.isSelected) {
            }
            else if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                var localTouches = [];
                for (var i = 0; i < boardTouches.length; i++) {
                    localTouches.push({ x: boardTouches[i].x - elem.x, y: boardTouches[i].y - elem.y, identifer: boardTouches[i].identifer });
                }
                var retVal = elem.handleTouchStart(e, localTouches, this.components[elem.type].pallete, componenet, subId);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleTouchElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
            if (this.currentHover == id) {
                clearTimeout(elem.hoverTimer);
                this.removeHoverInfo(this.currentHover);
            }
            this.prevTouch = e.touches;
        };
        WhiteBoardWorker.prototype.elementTouchMove = function (id, e, boardTouches, componenet, subId) {
            if (!this.groupMoving) {
                var elem = this.getBoardElement(id);
                if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                    var localToucheMoves = [];
                    var elem_1 = this.getBoardElement(id);
                    var retVal = elem_1.handleTouchMove(e, localToucheMoves, this.components[elem_1.type].pallete, componenet, subId);
                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(id, elem_1.type, retVal.serverMessages);
                    if (elem_1.serverId != null && elem_1.serverId != undefined) {
                        if (retVal.move) {
                            this.elementMoves.push({ id: elem_1.serverId, x: retVal.move.x, y: retVal.move.y });
                        }
                        if (retVal.wasDelete) {
                            this.elementDeletes.push(elem_1.serverId);
                        }
                        if (retVal.wasRestore) {
                            this.elementRestores.push(elem_1.serverId);
                        }
                    }
                    else {
                        if (retVal.move) {
                            elem_1.opBuffer.push(retVal.move.message);
                        }
                        if (retVal.wasDelete) {
                            elem_1.opBuffer.push(retVal.wasDelete.message);
                        }
                        if (retVal.wasRestore) {
                            elem_1.opBuffer.push(retVal.wasRestore.message);
                        }
                    }
                    this.handleTouchElementSelect(e, elem_1, retVal.isSelected);
                    this.handleElementPalleteChanges(elem_1, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(id, retVal.newView);
                }
            }
            this.prevTouch = e.touches;
        };
        WhiteBoardWorker.prototype.elementTouchEnd = function (id, e, boardTouches, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                var localTouches = [];
                for (var i = 0; i < boardTouches.length; i++) {
                    localTouches.push({ x: boardTouches[i].x - elem.x, y: boardTouches[i].y - elem.y, identifer: boardTouches[i].identifer });
                }
                var retVal = elem.handleTouchEnd(e, localTouches, this.components[elem.type].pallete, componenet, subId);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleTouchElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        };
        WhiteBoardWorker.prototype.elementTouchCancel = function (id, e, boardTouches, componenet, subId) {
            var elem = this.getBoardElement(id);
            if (this.isHost || this.allowAllEdit || (this.allowUserEdit && elem.user == this.userId)) {
                var localTouches = [];
                for (var i = 0; i < boardTouches.length; i++) {
                    localTouches.push({ x: boardTouches[i].x - elem.x, y: boardTouches[i].y - elem.y, identifer: boardTouches[i].identifer });
                }
                var retVal = elem.handleTouchCancel(e, localTouches, this.components[elem.type].pallete, componenet, subId);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleTouchElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
        };
        WhiteBoardWorker.prototype.elementDragOver = function (id, e, componenet, subId) {
        };
        WhiteBoardWorker.prototype.elementDrop = function (id, e, mouseX, mouseY, componenet, subId) {
        };
        WhiteBoardWorker.prototype.mouseDown = function (e, mouseX, mouseY, mode) {
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currentEdit);
                var retVal = elem.handleBoardMouseDown(e, mouseX, mouseY, this.components[elem.type].pallete);
                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            else {
                if (this.currSelect.length > 0) {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
                    this.clipboardItems = [];
                }
                else {
                    if (e.buttons == 1 && mode == BoardModes.SELECT) {
                        this.selectDrag = true;
                    }
                }
            }
            if (this.currentHover != -1) {
                var elem = this.getBoardElement(this.currentHover);
                if (elem.infoElement != -1) {
                    this.removeHoverInfo(this.currentHover);
                }
                clearTimeout(elem.hoverTimer);
            }
            this.prevX = mouseX;
            this.prevY = mouseY;
        };
        WhiteBoardWorker.prototype.mouseMove = function (e, mouseX, mouseY, mode) {
            var changeX = mouseX - this.prevX;
            var changeY = mouseY - this.prevY;
            if (this.currentHover != -1) {
                var elem = this.getBoardElement(this.currentHover);
                if (elem.infoElement != -1) {
                    this.removeHoverInfo(this.currentHover);
                }
                else {
                    clearTimeout(elem.hoverTimer);
                    elem.hoverTimer = setTimeout(this.infoMessageTimeout.bind(this), 2000, this.currentHover);
                }
            }
            if (e.buttons == 1) {
                if (mode == BoardModes.SELECT) {
                    if (this.groupMoving) {
                        this.moveGroup(changeX, changeY, new Date());
                        this.groupMoved = true;
                    }
                    else if (this.currSelect.length == 1) {
                        var elem = this.getBoardElement(this.currSelect[0]);
                        var retVal = elem.handleBoardMouseMove(e, changeX, changeY, mouseX, mouseY, this.components[elem.type].pallete);
                        this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                        this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        if (elem.serverId != null && elem.serverId != undefined) {
                            if (retVal.move) {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if (retVal.wasDelete) {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if (retVal.wasRestore) {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else {
                            if (retVal.move) {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if (retVal.wasDelete) {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if (retVal.wasRestore) {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        if (retVal.newViewCentre) {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        this.handleInfoMessage(retVal.infoMessage);
                        this.handleAlertMessage(retVal.alertMessage);
                        this.setElementView(elem.id, retVal.newView);
                        this.clipboardItems = [];
                        var clipElems = elem.getClipboardData();
                        if (clipElems != null) {
                            for (var i = 0; i < clipElems.length; i++) {
                                this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                            }
                        }
                    }
                }
            }
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currentEdit);
                var retVal = elem.handleBoardMouseMove(e, changeX, changeY, mouseX, mouseY, this.components[elem.type].pallete);
                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            this.prevX = mouseX;
            this.prevY = mouseY;
        };
        WhiteBoardWorker.prototype.mouseUp = function (e, mouseX, mouseY, downX, downY, pointList, mode, scaleF, panX, panY) {
            var _this = this;
            var rectLeft;
            var rectTop;
            var rectWidth;
            var rectHeight;
            if (this.currSelect.length == 0) {
                if (mouseX > downX) {
                    rectLeft = downX;
                    rectWidth = mouseX - downX;
                }
                else {
                    rectLeft = mouseX;
                    rectWidth = downX - mouseX;
                }
                if (mouseY > downY) {
                    rectTop = downY;
                    rectHeight = mouseY - downY;
                }
                else {
                    rectTop = mouseY;
                    rectHeight = downY - mouseY;
                }
                var x = rectLeft;
                var y = rectTop;
                var width = rectWidth;
                var height = rectHeight;
                if (mode == BoardModes.SELECT) {
                    this.boardElems.forEach(function (elem) {
                        if (!elem.isDeleted && elem.isComplete) {
                            if (elem.x >= rectLeft && elem.y >= rectTop) {
                                if (rectLeft + rectWidth >= elem.x + elem.width && rectTop + rectHeight >= elem.y + elem.height) {
                                    _this.currSelect.push(elem.id);
                                    _this.selectElement(elem.id);
                                }
                            }
                        }
                    });
                }
                else if (mode != BoardModes.ERASE) {
                    if (this.allowUserEdit || this.isHost) {
                        var self_1 = this;
                        var localId = this.boardElems.push(null) - 1;
                        var callbacks = {
                            sendServerMsg: (function (id, type) { return function (msg) { _this.sendElementMessage(id, type, msg); _this.endCallback(); }; })(localId, mode),
                            createAlert: function (header, message) { _this.endCallback(); },
                            createInfo: function (x, y, width, height, header, message) { var retVal = _this.addInfoMessage(x, y, width, height, header, message); _this.endCallback(); return retVal; },
                            removeInfo: function (id) { self_1.removeInfoMessage(id); _this.endCallback(); },
                            updateBoardView: (function (id) { return function (newView) { self_1.setElementView(id, newView); _this.endCallback(); }; })(localId),
                            updatePallete: (function (type) {
                                return function (changes) {
                                    for (var j = 0; j < changes.length; j++) {
                                        var change = changes[j];
                                        _this.components[type].pallete.handleChange(change);
                                    }
                                    var cursor = _this.components[type].pallete.getCursor();
                                    var state = _this.components[type].pallete.getCurrentViewState();
                                    _this.updateView({ palleteState: state, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                                    _this.endCallback();
                                };
                            })(mode),
                            getAudioStream: (function (id) { return function () { self_1.getAudioStream(id); }; })(localId),
                            getVideoStream: (function (id) { return function () { self_1.getVideoStream(id); }; })(localId),
                            deleteElement: (function (id) { return (function () { _this.deleteElement(id); _this.endCallback(); }); })(localId)
                        };
                        var data = {
                            id: localId, userId: this.userId, callbacks: callbacks, x: x, y: y, width: width, height: height,
                            pointList: pointList, scaleF: scaleF, panX: panX, panY: panY,
                            palleteState: this.components[mode].pallete
                        };
                        var newElem = this.components[mode].Element.createElement(data);
                        if (newElem) {
                            var undoOp = (function (elem) { return elem.elementErase.bind(elem); })(newElem);
                            var redoOp = (function (elem) { return elem.elementRestore.bind(elem); })(newElem);
                            this.boardElems[localId] = newElem;
                            var viewState = newElem.getCurrentViewState();
                            this.setElementView(localId, viewState);
                            var payload = newElem.getNewMsg();
                            var msg = { type: newElem.type, payload: payload };
                            if (newElem.isEditing) {
                                this.currentEdit = localId;
                                for (var i = 0; i < this.currSelect.length; i++) {
                                    this.deselectElement(this.currSelect[i]);
                                }
                                this.currSelect = [];
                                this.clipboardItems = [];
                                var clipElems = newElem.getClipboardData();
                                if (clipElems != null) {
                                    for (var i = 0; i < clipElems.length; i++) {
                                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: localId });
                                    }
                                }
                                this.currSelect.push(localId);
                            }
                            else if (newElem.isSelected) {
                                for (var i = 0; i < this.currSelect.length; i++) {
                                    this.deselectElement(this.currSelect[i]);
                                }
                                this.currSelect = [];
                                this.clipboardItems = [];
                                var clipElems = newElem.getClipboardData();
                                if (clipElems != null) {
                                    for (var i = 0; i < clipElems.length; i++) {
                                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: localId });
                                    }
                                }
                                this.currSelect.push(localId);
                            }
                            this.handleElementOperation(localId, undoOp, redoOp);
                            this.sendNewElement(msg);
                        }
                        else {
                            this.boardElems.splice(localId, 1);
                        }
                    }
                }
            }
            else {
                if (mode == BoardModes.SELECT) {
                    if (this.currSelect.length == 1) {
                        var elem = this.getBoardElement(this.currSelect[0]);
                        var retVal = elem.handleBoardMouseUp(e, mouseX, mouseY, this.components[elem.type].pallete);
                        this.updateView({ cursor: 'auto', cursorURL: [], cursorOffset: { x: 0, y: 0 } });
                        this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                        this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        if (elem.serverId != null && elem.serverId != undefined) {
                            if (retVal.move) {
                                this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                            }
                            if (retVal.wasDelete) {
                                this.elementDeletes.push(elem.serverId);
                            }
                            if (retVal.wasRestore) {
                                this.elementRestores.push(elem.serverId);
                            }
                        }
                        else {
                            if (retVal.move) {
                                elem.opBuffer.push(retVal.move.message);
                            }
                            if (retVal.wasDelete) {
                                elem.opBuffer.push(retVal.wasDelete.message);
                            }
                            if (retVal.wasRestore) {
                                elem.opBuffer.push(retVal.wasRestore.message);
                            }
                        }
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        if (retVal.newViewCentre) {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        this.handleInfoMessage(retVal.infoMessage);
                        this.handleAlertMessage(retVal.alertMessage);
                        this.setElementView(elem.id, retVal.newView);
                    }
                    if (this.groupMoved) {
                        this.groupMoved = false;
                        this.endMove(mouseX, mouseY);
                    }
                }
            }
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currentEdit);
                var retVal = elem.handleBoardMouseUp(e, mouseX, mouseY, this.components[elem.type].pallete);
                this.updateView({ cursor: 'auto', cursorURL: [], cursorOffset: { x: 0, y: 0 } });
                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            this.selectDrag = false;
        };
        WhiteBoardWorker.prototype.mouseClick = function (e, mouseX, mouseY, mode) {
            if (e.detail == 2) {
                if (this.currentEdit != -1) {
                    var elem = this.getBoardElement(this.currentEdit);
                    this.endEditElement(this.currentEdit);
                    this.clipboardItems = [];
                    var clipElems = elem.getClipboardData();
                    if (clipElems != null) {
                        for (var i = 0; i < clipElems.length; i++) {
                            this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                        }
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.touchStart = function () {
        };
        WhiteBoardWorker.prototype.touchMove = function (e) {
        };
        WhiteBoardWorker.prototype.touchEnd = function () {
        };
        WhiteBoardWorker.prototype.touchCancel = function () {
        };
        WhiteBoardWorker.prototype.handleUndo = function () {
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currentEdit);
                this.undoItemEdit(this.currentEdit);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            else {
                this.undo();
            }
        };
        WhiteBoardWorker.prototype.handleRedo = function () {
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currentEdit);
                this.redoItemEdit(this.currentEdit);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            else {
                this.redo();
            }
        };
        WhiteBoardWorker.prototype.keyBoardInput = function (e, inputChar, mode) {
            var _this = this;
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currSelect[0]);
                var retVal = elem.handleKeyPress(e, inputChar, this.components[elem.type].pallete);
                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            else if (inputChar == 'Del') {
                var undoOpList = [];
                var redoOpList = [];
                for (var i = 0; i < this.currSelect.length; i++) {
                    var elem = this.getBoardElement(this.currSelect[i]);
                    elem.erase();
                    this.deleteBuffer.push(this.currSelect[i]);
                    this.elementDeletes.push(elem.serverId);
                    var undoOp = (function (element) {
                        return function () {
                            var retVal = element.elementRestore();
                            if (element.serverId != null && element.serverId != undefined) {
                                _this.elementRestores.push(element.serverId);
                            }
                            _this.setElementView(element.id, retVal.newView);
                        };
                    })(elem);
                    var redoOp = (function (element) {
                        return function () {
                            var retVal = element.elementErase();
                            if (element.serverId != null && element.serverId != undefined) {
                                _this.elementDeletes.push(element.serverId);
                            }
                            _this.deleteBuffer.push(element.id);
                        };
                    })(elem);
                    undoOpList.push(undoOp);
                    redoOpList.push(redoOp);
                }
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                var newOp = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
                this.operationStack[this.operationPos++] = newOp;
            }
        };
        WhiteBoardWorker.prototype.paste = function (mouseX, mouseY, data, mode) {
            var _this = this;
            console.log('PASTE EVENT WORKER');
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currSelect[0]);
                var retVal = elem.handlePaste(mouseX - elem.x, mouseY - elem.y, data, this.components[elem.type].pallete);
                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            else {
                if (data.isInternal) {
                    if (data.wasCut) {
                    }
                    else {
                    }
                }
                else {
                }
                var undoOpList = [];
                var redoOpList = [];
                for (var i = 0; i < this.currSelect.length; i++) {
                    var elem = this.getBoardElement(this.currSelect[i]);
                    elem.erase();
                    this.deleteBuffer.push(this.currSelect[i]);
                    this.elementDeletes.push(elem.serverId);
                    var undoOp = (function (element) {
                        return function () {
                            var retVal = element.elementRestore();
                            if (element.serverId != null && element.serverId != undefined) {
                                _this.elementRestores.push(element.serverId);
                            }
                            _this.setElementView(element.id, retVal.newView);
                        };
                    })(elem);
                    var redoOp = (function (element) {
                        return function () {
                            var retVal = element.elementErase();
                            if (element.serverId != null && element.serverId != undefined) {
                                _this.elementDeletes.push(element.serverId);
                            }
                            _this.deleteBuffer.push(element.id);
                        };
                    })(elem);
                    undoOpList.push(undoOp);
                    redoOpList.push(redoOp);
                }
                if (mode == BoardModes.SELECT || mode == BoardModes.ERASE) {
                }
                else {
                }
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                var newOp = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
                this.operationStack[this.operationPos++] = newOp;
            }
        };
        WhiteBoardWorker.prototype.cut = function () {
            var _this = this;
            console.log('CUT EVENT WORKER');
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currSelect[0]);
                var retVal = elem.handleCut();
                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                if (elem.serverId != null && elem.serverId != undefined) {
                    if (retVal.move) {
                        this.elementMoves.push({ id: elem.serverId, x: retVal.move.x, y: retVal.move.y });
                    }
                    if (retVal.wasDelete) {
                        this.elementDeletes.push(elem.serverId);
                    }
                    if (retVal.wasRestore) {
                        this.elementRestores.push(elem.serverId);
                    }
                }
                else {
                    if (retVal.move) {
                        elem.opBuffer.push(retVal.move.message);
                    }
                    if (retVal.wasDelete) {
                        elem.opBuffer.push(retVal.wasDelete.message);
                    }
                    if (retVal.wasRestore) {
                        elem.opBuffer.push(retVal.wasRestore.message);
                    }
                }
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
                this.clipboardItems = [];
                var clipElems = elem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                    }
                }
            }
            else {
                var undoOpList = [];
                var redoOpList = [];
                for (var i = 0; i < this.currSelect.length; i++) {
                    var elem = this.getBoardElement(this.currSelect[i]);
                    elem.erase();
                    this.deleteBuffer.push(this.currSelect[i]);
                    this.elementDeletes.push(elem.serverId);
                    var undoOp = (function (element) {
                        return function () {
                            var retVal = element.elementRestore();
                            if (element.serverId != null && element.serverId != undefined) {
                                _this.elementRestores.push(element.serverId);
                            }
                            _this.setElementView(element.id, retVal.newView);
                        };
                    })(elem);
                    var redoOp = (function (element) {
                        return function () {
                            var retVal = element.elementErase();
                            if (element.serverId != null && element.serverId != undefined) {
                                _this.elementDeletes.push(element.serverId);
                            }
                            _this.deleteBuffer.push(element.id);
                        };
                    })(elem);
                    undoOpList.push(undoOp);
                    redoOpList.push(redoOp);
                }
                this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);
                var newOp = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
                this.operationStack[this.operationPos++] = newOp;
            }
        };
        WhiteBoardWorker.prototype.dragOver = function (e, mode) {
        };
        WhiteBoardWorker.prototype.drop = function (e, plainData, mouseX, mouseY, scaleF, mode) {
            if (!this.dropToElement) {
                if (this.components['UPLOAD'] == null || this.components['UPLOAD'] == undefined) {
                    console.log('UPLOAD COMPONENT NOT READY.');
                    return;
                }
                if (e.dataTransfer.files.length > 0) {
                    if (e.dataTransfer.files.length == 1) {
                        var file = e.dataTransfer.files[0];
                        this.placeLocalFile(mouseX, mouseY, scaleF, file);
                    }
                }
                else {
                    var url = plainData;
                    this.placeRemoteFile(mouseX, mouseY, scaleF, url);
                }
            }
        };
        WhiteBoardWorker.prototype.addFile = function (x, y, width, height, fType, fSize, fDesc, fExt, file, url) {
            var _this = this;
            var localId = this.boardElems.push(null) - 1;
            var callbacks = {
                sendServerMsg: (function (id, type) { return function (msg) { _this.sendElementMessage(id, type, msg); _this.endCallback(); }; })(localId, 'UPLOAD'),
                createAlert: function (header, message) { _this.endCallback(); },
                createInfo: function (x, y, width, height, header, message) { var retVal = _this.addInfoMessage(x, y, width, height, header, message); _this.endCallback(); return retVal; },
                removeInfo: function (id) { _this.removeInfoMessage(id); _this.endCallback(); },
                updateBoardView: (function (id) { return function (newView) { _this.setElementView(id, newView); }; })(localId),
                updatePallete: (function (type) {
                    return function (changes) {
                        for (var j = 0; j < changes.length; j++) {
                            var change = changes[j];
                            _this.components[type].pallete.handleChange(change);
                        }
                        var cursor = _this.components[type].pallete.getCursor();
                        var state = _this.components[type].pallete.getCurrentViewState();
                        _this.updateView({ palleteState: state, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
                        _this.endCallback();
                    };
                })('UPLOAD'),
                getAudioStream: function () { return _this.getAudioStream(localId); },
                getVideoStream: function () { return _this.getVideoStream(localId); },
                deleteElement: (function (id) { return (function () { _this.deleteElement(id); _this.endCallback(); }); })(localId)
            };
            var newElem;
            if (url.match(/youtube/) || url.match(/youtu.be/)) {
                console.log('Youtube content detected.');
                var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                var match = url.match(regExp);
                if (match && match[7].length == 11) {
                    url = 'https://www.youtube.com/embed/' + match[7];
                }
            }
            if (fType == null) {
                newElem = new this.components['UPLOAD'].Element(localId, this.userId, x, y, width, height, callbacks, file, url, fType, fSize, fDesc, fExt, null);
            }
            else {
                var viewType = UploadViewTypes.FILE;
                if (url != '') {
                    viewType = UploadViewTypes.IFRAME;
                }
                if (fSize <= MAXSIZE) {
                    if (fType.match(/image/)) {
                        viewType = UploadViewTypes.IMAGE;
                    }
                    else if (fType.match(/video/)) {
                        viewType = UploadViewTypes.VIDEO;
                    }
                    else if (fType.match(/audio/)) {
                        viewType = UploadViewTypes.AUDIO;
                    }
                }
                newElem = new this.components['UPLOAD'].Element(localId, this.userId, x, y, width, height, callbacks, file, url, fType, fSize, fDesc, fExt, viewType);
            }
            var undoOp = (function (elem) { return elem.elementErase.bind(elem); })(newElem);
            var redoOp = (function (elem) { return elem.elementRestore.bind(elem); })(newElem);
            this.boardElems[localId] = newElem;
            var viewState = newElem.getCurrentViewState();
            this.setElementView(localId, viewState);
            var payload = newElem.getNewMsg();
            var msg = { type: newElem.type, payload: payload };
            if (newElem.isEditing) {
                this.currentEdit = localId;
                for (var i = 0; i < this.currSelect.length; i++) {
                    this.deselectElement(this.currSelect[i]);
                }
                this.currSelect = [];
                this.clipboardItems = [];
                var clipElems = newElem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: localId });
                    }
                }
                this.currSelect.push(localId);
            }
            else if (newElem.isSelected) {
                for (var i = 0; i < this.currSelect.length; i++) {
                    this.deselectElement(this.currSelect[i]);
                }
                this.currSelect = [];
                this.clipboardItems = [];
                var clipElems = newElem.getClipboardData();
                if (clipElems != null) {
                    for (var i = 0; i < clipElems.length; i++) {
                        this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: localId });
                    }
                }
                this.currSelect.push(localId);
            }
            this.handleElementOperation(localId, undoOp, redoOp);
            this.sendNewElement(msg);
        };
        WhiteBoardWorker.prototype.placeLocalFile = function (mouseX, mouseY, scaleF, file) {
            console.log(mouseX);
            console.log(scaleF);
            var width = 200 * scaleF;
            var height = 200 * scaleF;
            var fExt = file.name.split('.').pop();
            console.log('File type is: ' + file.type);
            if (file.type.match(/octet-stream/)) {
                this.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
                return null;
            }
            else {
                var isImage = file.type.match(/image/);
                if (!isImage) {
                    width = 150 * scaleF;
                }
                if (file.size < MAXSIZE) {
                    this.addFile(mouseX, mouseY, width, height, file.type, file.size, '', fExt, file, '');
                }
                else {
                    this.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
                    return null;
                }
            }
        };
        WhiteBoardWorker.prototype.placeRemoteFile = function (mouseX, mouseY, scaleF, url) {
            console.log('Remote File Placed');
            var width = 200 * scaleF;
            var height = 200 * scaleF;
            var fExt = url.split('.').pop();
            var fDesc = '';
            var self = this;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                console.log(request.status);
                if (request.readyState === 4) {
                    var type = request.getResponseHeader('Content-Type');
                    var size = parseInt(request.getResponseHeader('Content-Length'));
                    if (type == null || type == undefined) {
                        self.addFile(mouseX, mouseY, width, height, null, null, '', fExt, null, url);
                        return;
                    }
                    if (type.match(/octete-stream/)) {
                        self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
                        return;
                    }
                    var isImage = type.split('/')[0] == 'image' ? true : false;
                    if (!isImage) {
                        width = 150 * scaleF;
                    }
                    console.log('Size was: ' + size);
                    self.addFile(mouseX, mouseY, width, height, type, size, '', fExt, null, url);
                }
            };
            request.open('HEAD', url, true);
            request.send(null);
        };
        WhiteBoardWorker.prototype.palleteChange = function (change, mode) {
            var retVal = this.components[mode].pallete.handleChange(change);
            var cursor = this.components[mode].pallete.getCursor();
            this.updateView({ palleteState: retVal, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currSelect[0]);
                if (elem.type == mode) {
                    var retVal_1 = elem.handlePalleteChange(this.components[mode].pallete, change);
                    this.handleElementOperation(elem.id, retVal_1.undoOp, retVal_1.redoOp);
                    this.handleElementMessages(elem.id, elem.type, retVal_1.serverMessages);
                    this.setElementView(elem.id, retVal_1.newView);
                    this.clipboardItems = [];
                    var clipElems = elem.getClipboardData();
                    if (clipElems != null) {
                        for (var i = 0; i < clipElems.length; i++) {
                            this.clipboardItems.push({ format: clipElems[i].format, data: clipElems[i].data, id: elem.id });
                        }
                    }
                }
            }
        };
        WhiteBoardWorker.prototype.clearAlert = function () {
            this.removeAlert();
        };
        return WhiteBoardWorker;
    }());
    var controller;
    LocalAbstraction.registerComponent = function (componentName, Element, Pallete) {
        var pallete = new Pallete();
        var newComp = {
            componentName: componentName, Element: Element, pallete: pallete
        };
        controller.components[componentName] = newComp;
    };
    LocalAbstraction.inititalize = function () {
        onmessage = function (e) {
            switch (e.data.type) {
                case 0:
                    controller = new WhiteBoardWorker(e.data.isHost, e.data.userId, e.data.allEdit, e.data.userEdit, self);
                    for (var i = 0; i < e.data.componentFiles.length; i++) {
                        importScripts(e.data.componentFiles[i]);
                    }
                    break;
                case 1:
                    controller.setRoomOptions(e.data.allowAllEdit, e.data.allowUserEdit);
                    break;
                case 3:
                    controller.modeChange(e.data.newMode);
                    break;
                case 4:
                    break;
                case 5:
                    break;
                case 6:
                    controller.newElement(e.data.data);
                    break;
                case 7:
                    controller.elementID(e.data.data);
                    break;
                case 11:
                    controller.elementMessage(e.data.data);
                    break;
                case 8:
                    controller.batchMove(e.data.data);
                    break;
                case 9:
                    controller.batchDelete(e.data.data);
                    break;
                case 10:
                    controller.batchRestore(e.data.data);
                    break;
                case 15:
                    controller.eraseElement(e.data.id);
                    break;
                case 12:
                    controller.elementMouseOver(e.data.id, e.data.e);
                    break;
                case 13:
                    controller.elementMouseOut(e.data.id, e.data.e);
                    break;
                case 14:
                    controller.elementMouseDown(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case 16:
                    controller.elementMouseMove(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case 17:
                    controller.elementMouseUp(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case 18:
                    controller.elementMouseClick(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case 19:
                    controller.elementMouseDoubleClick(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case 20:
                    controller.elementTouchStart(e.data.id, e.data.e, e.data.localTouches, e.data.componenet, e.data.subId);
                    break;
                case 21:
                    controller.elementTouchMove(e.data.id, e.data.e, e.data.touchMoves, e.data.componenet, e.data.subId);
                    break;
                case 22:
                    controller.elementTouchEnd(e.data.id, e.data.e, e.data.localTouches, e.data.componenet, e.data.subId);
                    break;
                case 23:
                    controller.elementTouchCancel(e.data.id, e.data.e, e.data.localTouches, e.data.componenet, e.data.subId);
                    break;
                case 24:
                    controller.elementDragOver(e.data.id, e.data.e, e.data.componenet, e.data.subId);
                    break;
                case 25:
                    controller.elementDrop(e.data.id, e.data.e, e.data.mouseX, e.data.mouseY, e.data.componenet, e.data.subId);
                    break;
                case 26:
                    controller.mouseDown(e.data.e, e.data.mouseX, e.data.mouseY, e.data.mode);
                    break;
                case 27:
                    controller.mouseMove(e.data.e, e.data.mouseX, e.data.mouseY, e.data.mode);
                    break;
                case 28:
                    controller.mouseUp(e.data.e, e.data.mouseX, e.data.mouseY, e.data.downX, e.data.downY, e.data.pointList, e.data.mode, e.data.scaleF, e.data.panX, e.data.panY);
                    break;
                case 29:
                    controller.mouseClick(e.data.e, e.data.mouseX, e.data.mouseY, e.data.mode);
                    break;
                case 30:
                    break;
                case 31:
                    break;
                case 32:
                    break;
                case 33:
                    break;
                case 34:
                    controller.keyBoardInput(e.data.e, e.data.inputChar, e.data.mode);
                    break;
                case 35:
                    controller.handleUndo();
                    break;
                case 36:
                    controller.handleRedo();
                    break;
                case 37:
                    controller.dragOver(e.data.e, e.data.mode);
                    break;
                case 38:
                    controller.drop(e.data.e, e.data.plainData, e.data.mouseX, e.data.mouseY, e.data.scaleF, e.data.mode);
                    break;
                case 39:
                    controller.paste(e.data.mouseX, e.data.mouseY, e.data.data, e.data.mode);
                    break;
                case 40:
                    controller.cut();
                    break;
                case 41:
                    controller.palleteChange(e.data.change, e.data.mode);
                    break;
                case 43:
                    controller.serverError(e.data.error);
                    break;
                default:
                    console.error('ERROR: Recieved unrecognized worker message.');
            }
            var clipData = [];
            if (controller.currSelect.length > 1) {
            }
            else {
                for (var i = 0; i < controller.clipboardItems.length; i++) {
                    clipData.push({ format: controller.clipboardItems[i].format, data: controller.clipboardItems[i].data });
                }
            }
            var message = {
                elementViews: controller.elementUpdateBuffer, elementMessages: controller.socketMessageBuffer, deleteElements: controller.deleteBuffer,
                audioRequests: controller.audioRequests, videoRequests: controller.videoRequests, alerts: controller.alertBuffer,
                infoMessages: controller.infoBuffer, removeAlert: controller.willRemoveAlert, removeInfos: controller.removeInfoBuffer,
                selectCount: controller.currSelect.length, elementMoves: controller.elementMoves, elementDeletes: controller.elementDeletes,
                elementRestores: controller.elementRestores, clipboardData: clipData
            };
            if (controller.viewUpdateBuffer != null) {
                Object.assign(message, { viewUpdate: controller.viewUpdateBuffer });
            }
            if (controller.newViewCentre != null) {
                Object.assign(message, { viewCentre: controller.newViewCentre });
            }
            if (controller.newViewBox != null) {
                Object.assign(message, { viewBox: controller.newViewBox });
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
        };
    };
})(LocalAbstraction || (LocalAbstraction = {}));
LocalAbstraction.inititalize();
var registerComponent = LocalAbstraction.registerComponent;
