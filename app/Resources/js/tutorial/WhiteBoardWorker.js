var BoardElement = (function () {
    function BoardElement(type, id, x, y, width, height, userId, callbacks, serverId, updateTime) {
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
        if (updateTime) {
            this.updateTime = updateTime;
        }
        else {
            this.updateTime = new Date();
        }
    }
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
        ControllerMessageTypes[ControllerMessageTypes["PALLETECHANGE"] = 37] = "PALLETECHANGE";
        ControllerMessageTypes[ControllerMessageTypes["LEAVE"] = 38] = "LEAVE";
        ControllerMessageTypes[ControllerMessageTypes["ERROR"] = 39] = "ERROR";
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
            this.isHost = isHost;
            this.userId = userId;
            this.allowAllEdit = allEdit;
            this.allowUserEdit = userEdit;
            this.controller = workerContext;
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
        WhiteBoardWorker.prototype.drawRect = function () {
        };
        WhiteBoardWorker.prototype.drawCurve = function () {
        };
        WhiteBoardWorker.prototype.drawElement = function () {
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
            for (var i = 0; i < ids.length; i++) {
                var elem = this.getBoardElement(ids[i]);
                if (!elem.isDeleted) {
                    var newView = elem.handleSelect();
                    this.currSelect.push(elem.id);
                    this.setElementView(elem.id, newView);
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
                    if (e.ctrlKey) {
                        this.currSelect.push(elem.id);
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
                if (e.ctrlKey) {
                    var alreadySelected = false;
                    for (var i = 0; i < this.currSelect.length; i++) {
                        if (this.currSelect[i] == elem.id) {
                            alreadySelected = true;
                        }
                    }
                    if (!alreadySelected) {
                        this.currSelect.push(elem.id);
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
                for (var i = 0; i < this.currSelect.length; i++) {
                    var selElem = this.getBoardElement(this.currSelect[i]);
                    if (selElem.id != elem.id && selElem.type == elem.type) {
                        var retVal = selElem.handlePalleteChange(this.components[elem.type].pallete, changes[j]);
                        this.handleElementMessages(selElem.id, selElem.type, retVal.serverMessages);
                        this.handleElementOperation(selElem.id, retVal.undoOp, retVal.redoOp);
                        this.setElementView(selElem.id, retVal.newView);
                    }
                }
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
            this.updateView({ cursor: 'move' });
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
            this.updateView({ cursor: 'auto' });
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
                var newElemView = elem.handleSelect();
                this.setElementView(id, newElemView);
            }
        };
        WhiteBoardWorker.prototype.deselectElement = function (id) {
            var elem = this.getBoardElement(id);
            var newElemView = elem.handleDeselect();
            this.setElementView(elem.id, newElemView);
        };
        WhiteBoardWorker.prototype.startEditElement = function (id) {
            this.currentEdit = id;
            var elem = this.getBoardElement(id);
            if (!elem.isDeleted) {
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
            if (!elem.isDeleted && elem.operationPos > 0) {
                elem.operationStack[--elem.operationPos].undo();
            }
        };
        WhiteBoardWorker.prototype.redoItemEdit = function (id) {
            var elem = this.getBoardElement(id);
            if (!elem.isDeleted && elem.operationPos < elem.operationStack.length) {
                elem.operationStack[elem.operationPos++].redo();
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
                        sendServerMsg: (function (id, type) { return function (msg) { _this.sendElementMessage(id, type, msg); }; })(localId_1, data.type),
                        createAlert: function (header, message) { },
                        createInfo: function (x, y, width, height, header, message) { return _this.addInfoMessage(x, y, width, height, header, message); },
                        removeInfo: function (id) { _this.removeInfoMessage(id); },
                        updateBoardView: (function (id) { return function (newView) { _this.setElementView(id, newView); }; })(localId_1),
                        getAudioStream: function () { return _this.getAudioStream(localId_1); },
                        getVideoStream: function () { return _this.getVideoStream(localId_1); }
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
                if (elem.type == data.type) {
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
                else {
                    console.error('Received bad element message.');
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
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
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
                    this.handleMouseElementSelect(e, elem, retVal.isSelected);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
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
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
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
                }
            }
            else {
                if (this.currSelect.length != 0) {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
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
        WhiteBoardWorker.prototype.elementDrop = function (id, e, componenet, subId) {
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
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }
            else {
                if (this.currSelect.length > 0) {
                    for (var i = 0; i < this.currSelect.length; i++) {
                        this.deselectElement(this.currSelect[i]);
                    }
                    this.currSelect = [];
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
                        this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        if (retVal.newViewCentre) {
                            this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        this.handleInfoMessage(retVal.infoMessage);
                        this.handleAlertMessage(retVal.alertMessage);
                        this.setElementView(elem.id, retVal.newView);
                    }
                }
                else if (mode != BoardModes.ERASE) {
                    if (this.currSelect.length == 0) {
                        this.drawElement();
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
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
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
                            sendServerMsg: (function (id, type) { return function (msg) { self_1.sendElementMessage(id, type, msg); }; })(localId, mode),
                            createAlert: function (header, message) { },
                            createInfo: function (x, y, width, height, header, message) { return self_1.addInfoMessage(x, y, width, height, header, message); },
                            removeInfo: function (id) { self_1.removeInfoMessage(id); },
                            updateBoardView: (function (id) { return function (newView) { self_1.setElementView(id, newView); }; })(localId),
                            getAudioStream: (function (id) { return function () { self_1.getAudioStream(id); }; })(localId),
                            getVideoStream: (function (id) { return function () { self_1.getVideoStream(id); }; })(localId)
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
                        this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        this.handleElementPalleteChanges(elem, retVal.palleteChanges);
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
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }
            this.selectDrag = false;
        };
        WhiteBoardWorker.prototype.mouseClick = function (e, mouseX, mouseY, mode) {
            if (e.detail == 2) {
                if (this.currentEdit) {
                    this.endEditElement(this.currentEdit);
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
                this.undoItemEdit(this.currentEdit);
            }
            else {
                this.undo();
            }
        };
        WhiteBoardWorker.prototype.handleRedo = function () {
            if (this.currentEdit != -1) {
                this.redoItemEdit(this.currentEdit);
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
        WhiteBoardWorker.prototype.contextCopy = function (e) {
            document.execCommand("copy");
        };
        WhiteBoardWorker.prototype.contextCut = function (e) {
            document.execCommand("cut");
        };
        WhiteBoardWorker.prototype.contextPaste = function (e) {
            document.execCommand("paste");
        };
        WhiteBoardWorker.prototype.onCopy = function (e) {
            console.log('COPY EVENT');
        };
        WhiteBoardWorker.prototype.onPaste = function (e) {
            console.log('PASTE EVENT');
        };
        WhiteBoardWorker.prototype.onCut = function (e) {
            console.log('CUT EVENT');
        };
        WhiteBoardWorker.prototype.dragOver = function (e) {
        };
        WhiteBoardWorker.prototype.drop = function (e) {
        };
        WhiteBoardWorker.prototype.palleteChange = function (change, mode) {
            var retVal = this.components[mode].pallete.handleChange(change);
            var cursor = this.components[mode].pallete.getCursor();
            this.updateView({ palleteState: retVal, cursor: cursor.cursor, cursorURL: cursor.url, cursorOffset: cursor.offset });
            if (this.currentEdit != -1) {
                var elem = this.getBoardElement(this.currSelect[0]);
                if (elem.type == mode) {
                    elem.handlePalleteChange(this.components[mode].pallete, change);
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
        console.log('Registering: ' + componentName);
        controller.components[componentName] = newComp;
    };
    LocalAbstraction.inititalize = function () {
        onmessage = function (e) {
            switch (e.data.type) {
                case 0:
                    console.log('Starting controller.');
                    controller = new WhiteBoardWorker(e.data.isHost, e.data.userId, e.data.allEdit, e.data.userEdit, self);
                    for (var i = 0; i < e.data.componentFiles.length; i++) {
                        console.log('Attempting to register: ' + e.data.componentFiles[i]);
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
                    controller.elementDrop(e.data.id, e.data.e, e.data.componenet, e.data.subId);
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
                    controller.palleteChange(e.data.change, e.data.mode);
                    break;
                case 39:
                    controller.serverError(e.data.error);
                    break;
                default:
                    console.error('ERROR: Recieved unrecognized worker message.');
            }
            var message = {
                elementViews: controller.elementUpdateBuffer, elementMessages: controller.socketMessageBuffer, deleteElements: controller.deleteBuffer,
                audioRequests: controller.audioRequests, videoRequests: controller.videoRequests, alerts: controller.alertBuffer,
                infoMessages: controller.infoBuffer, removeAlert: controller.willRemoveAlert, removeInfos: controller.removeInfoBuffer,
                selectCount: controller.currSelect.length, elementMoves: controller.elementMoves, elementDeletes: controller.elementDeletes,
                elementRestores: controller.elementRestores
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
