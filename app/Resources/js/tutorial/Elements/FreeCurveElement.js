var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FreeCurve;
(function (FreeCurve) {
    FreeCurve.MODENAME = 'FREECURVE';
    var PalleteChangeType;
    (function (PalleteChangeType) {
        PalleteChangeType[PalleteChangeType["COLOUR"] = 0] = "COLOUR";
        PalleteChangeType[PalleteChangeType["SIZE"] = 1] = "SIZE";
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
        ViewComponents[ViewComponents["Interaction"] = 1] = "Interaction";
    })(ViewComponents || (ViewComponents = {}));
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
        POINT: 7,
        POINTMISSED: 8,
        MISSINGPOINT: 9
    };
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            _super.call(this);
            this.baseSize = PalleteSize.SMALL;
            this.colour = 'black';
            this.currentViewState = { colour: PalleteColour.BLACK, size: PalleteSize.SMALL };
        }
        Pallete.prototype.getCurrentViewState = function () {
            return this.currentViewState;
        };
        Pallete.prototype.getCursor = function () {
            var cursorType;
            var cursorColour;
            if (this.colour == 'black') {
                cursorColour = 'black';
            }
            else if (this.colour == 'blue') {
                cursorColour = 'blue';
            }
            else if (this.colour == 'red') {
                cursorColour = 'red';
            }
            else if (this.colour == 'green') {
                cursorColour = 'green';
            }
            if (this.baseSize == PalleteSize.XSMALL) {
                cursorType =
                    {
                        cursor: 'auto', url: ['https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/DrawCursor-' + cursorColour + '-xsmall.svg'],
                        offset: { x: 1, y: 1 }
                    };
            }
            else if (this.baseSize == PalleteSize.SMALL) {
                cursorType =
                    {
                        cursor: 'auto', url: ['https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/DrawCursor-' + cursorColour + '-small.svg'],
                        offset: { x: 2.5, y: 2.5 }
                    };
            }
            else if (this.baseSize == PalleteSize.MEDIUM) {
                cursorType =
                    {
                        cursor: 'auto', url: ['https://s3-ap-southeast-2.amazonaws.com/whiteboard-storage/DrawCursor-' + cursorColour + '-medium.svg'],
                        offset: { x: 5, y: 5 }
                    };
            }
            else {
                cursorType = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };
            }
            return cursorType;
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
            else {
                console.error('Unrecognized pallete change type.');
            }
            return this.currentViewState;
        };
        return Pallete;
    }(BoardPallete));
    FreeCurve.Pallete = Pallete;
    var Element = (function (_super) {
        __extends(Element, _super);
        function Element(id, userId, x, y, width, height, callbacks, numPoints, curveSet, colour, size, serverId, updateTime) {
            _super.call(this, FreeCurve.MODENAME, id, x, y, width, height, callbacks, serverId, updateTime);
            this.moveStartX = 0;
            this.moveStartY = 0;
            this.pointBuffer = [];
            this.numRecieved = 0;
            this.numPoints = 0;
            this.isMoving = false;
            this.hasMoved = false;
            this.numRecieved = 0;
            if (serverId != null && serverId != undefined) {
                for (var i_1 = 0; i_1 < numPoints; i_1++) {
                    if (curveSet[i_1] != null && curveSet[i_1] != undefined) {
                        this.pointBuffer[i_1] = curveSet[i_1];
                        this.numRecieved++;
                    }
                }
                if (this.numRecieved < numPoints) {
                    var self_1 = this;
                    self_1.pointInTimeout = setInterval(function () {
                        for (var i_2 = 0; i_2 < self_1.numPoints; i_2++) {
                            if (self_1.pointBuffer[i_2] == null || self_1.pointBuffer[i_2] == undefined) {
                                var msg = { seq_num: i_2 };
                                var msgCont = { header: MessageTypes.MISSINGPOINT, payload: msg };
                                self_1.sendServerMsg(msgCont);
                            }
                        }
                    }, 1000);
                }
            }
            else {
                for (var i_3 = 0; i_3 < curveSet.length; i_3++) {
                    this.pointBuffer[i_3] = curveSet[i_3];
                    this.numRecieved++;
                }
            }
            this.numPoints = numPoints;
            this.curveSet = curveSet;
            this.colour = colour;
            this.size = size;
            this.isComplete = false;
            var newCurveView;
            if (this.numRecieved < this.numPoints) {
                console.log('Empty curve set.');
                newCurveView = {
                    mode: FreeCurve.MODENAME, type: 'empty', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, updateTime: this.updateTime,
                    isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height
                };
            }
            else if (this.curveSet.length > 1) {
                var pathText = this.createCurveText();
                newCurveView = {
                    mode: FreeCurve.MODENAME, type: 'path', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, param: pathText,
                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height
                };
                this.isComplete = true;
            }
            else if (this.curveSet.length == 1) {
                newCurveView = {
                    mode: FreeCurve.MODENAME, type: 'circle', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, point: this.curveSet[0],
                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height
                };
                this.isComplete = true;
            }
            this.currentViewState = newCurveView;
        }
        Element.createElement = function (data) {
            if (data.pointList) {
                var pallete = data.palleteState;
                var colour = void 0;
                var size = void 0;
                if (!pallete) {
                    colour = 'black';
                    size = 1.0;
                }
                else {
                    colour = pallete.colour;
                    size = pallete.baseSize;
                }
                size = size * data.scaleF;
                var reducedPoints = void 0;
                var curves = void 0;
                var minX = null;
                var maxX = null;
                var minY = null;
                var maxY = null;
                if (data.pointList.length > 1) {
                    reducedPoints = SmoothCurve(data.pointList);
                    reducedPoints = DeCluster(reducedPoints, 10);
                    console.log(JSON.stringify(data.pointList));
                    for (var i_4 = 0; i_4 < reducedPoints.length; i_4++) {
                        reducedPoints[i_4].x = reducedPoints[i_4].x * data.scaleF + data.panX;
                        reducedPoints[i_4].y = reducedPoints[i_4].y * data.scaleF + data.panY;
                        if (minX == null || reducedPoints[i_4].x < minX) {
                            minX = reducedPoints[i_4].x;
                        }
                        if (maxX == null || reducedPoints[i_4].x > maxX) {
                            maxX = reducedPoints[i_4].x;
                        }
                        if (minY == null || reducedPoints[i_4].y < minY) {
                            minY = reducedPoints[i_4].y;
                        }
                        if (maxY == null || reducedPoints[i_4].y > maxY) {
                            maxY = reducedPoints[i_4].y;
                        }
                    }
                    for (var i_5 = 0; i_5 < reducedPoints.length; i_5++) {
                        reducedPoints[i_5].x = reducedPoints[i_5].x - minX;
                        reducedPoints[i_5].y = reducedPoints[i_5].y - minY;
                    }
                    curves = FitCurve(reducedPoints, reducedPoints.length, 5);
                }
                else {
                    curves = [];
                    curves[0] = { x: size, y: size };
                    maxX = data.pointList[0].x * data.scaleF + data.panX + size;
                    minX = data.pointList[0].x * data.scaleF + data.panX - size;
                    maxY = data.pointList[0].y * data.scaleF + data.panY + size;
                    ;
                    minY = data.pointList[0].y * data.scaleF + data.panY - size;
                }
                return new Element(data.id, data.userId, minX, minY, maxX - minX, maxY - minY, data.callbacks, curves.length, curves, colour, size);
            }
            else if (data.serverMsg) {
                var msg = data.serverMsg;
                var pointArray = [];
                for (var i_6 = 0; i_6 < msg.points.length; i_6++) {
                    pointArray[msg.points[i_6].seq_num] = { x: msg.points[i_6].x, y: msg.points[i_6].y };
                }
                return new Element(data.id, data.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.num_points, pointArray, msg.colour, msg.size, data.serverId);
            }
            else {
                console.log('Created null element.');
                return null;
            }
        };
        Element.prototype.getNewMsg = function () {
            var pointMessages = [];
            for (var i_7 = 0; i_7 < this.pointBuffer.length; i_7++) {
                var pointCont = { seq_num: i_7, x: this.pointBuffer[i_7].x, y: this.pointBuffer[i_7].y };
                pointMessages.push(pointCont);
            }
            var msg = {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, colour: this.colour, size: this.size,
                num_points: this.numPoints, points: pointMessages
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
            this.isMoving = true;
            this.moveStartX = this.x;
            this.moveStartY = this.y;
            this.startTime = this.updateTime;
            cursorType = { cursor: 'move', url: [], offset: { x: 0, y: 0 } };
            this.updateView({ isSelected: true, isMoving: true });
            this.isSelected = true;
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
        Element.prototype.handleBoardMouseDown = function (e, x, y, palleteState) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: false,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardMouseMove = function (e, changeX, changeY, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.isMoving) {
                this.move(changeX, changeY, new Date());
                this.hasMoved = true;
            }
            retVal.newView = this.currentViewState;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardMouseUp = function (e, x, y, palleteState) {
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
            this.isMoving = false;
            this.isSelected = false;
            var newView = this.updateView({ isSelected: false, isMoving: false });
            retVal.isSelected = false;
            retVal.newView = newView;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
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
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
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
                case MessageTypes.POINT:
                    var data = message.payload;
                    if (this.numRecieved != this.numPoints) {
                        if (!this.pointBuffer[data.num]) {
                            this.pointBuffer[data.num] = { x: data.x, y: data.y };
                            this.numRecieved++;
                        }
                        if (this.numRecieved == this.numPoints) {
                            clearInterval(this.pointInTimeout);
                            this.curveSet = this.pointBuffer;
                            if (this.curveSet.length > 1) {
                                var pathText = this.createCurveText();
                                newView = {
                                    mode: FreeCurve.MODENAME, type: 'path', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour, param: pathText,
                                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height
                                };
                            }
                            else if (this.curveSet.length == 1) {
                                newView = {
                                    mode: FreeCurve.MODENAME, type: 'circle', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour,
                                    point: this.curveSet[0], updateTime: this.updateTime, isSelected: false,
                                    x: this.x, y: this.y, width: this.width, height: this.height
                                };
                            }
                            else {
                                newView = {
                                    mode: FreeCurve.MODENAME, type: 'empty', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour,
                                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height
                                };
                            }
                            this.updateView(newView);
                        }
                    }
                    newView = this.currentViewState;
                    break;
                case MessageTypes.IGNORE:
                    clearInterval(this.pointInTimeout);
                    wasDelete = true;
                    break;
                case MessageTypes.COMPLETE:
                    while (this.opBuffer.length > 0) {
                        var opMsg = void 0;
                        var op = this.opBuffer.shift();
                        opMsg = { header: op.header, payload: op.payload };
                        retMsgs.push(opMsg);
                    }
                    break;
                case MessageTypes.POINTMISSED:
                    var msdata = message.payload;
                    var point = this.curveSet[msdata.num];
                    var msg = { num: msdata.num, x: point.x, y: point.y };
                    var msgCont = { header: MessageTypes.POINT, payload: msg };
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
                default:
                    break;
            }
            var retVal = {
                newView: newView, serverMessages: retMsgs, wasEdit: wasEdit, wasDelete: wasDelete, alertMessage: alertMessage, infoMessage: infoMessage
            };
            return retVal;
        };
        Element.prototype.handleSelect = function () {
            this.isSelected = true;
            this.updateView({ isSelected: true });
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleDeselect = function () {
            this.isSelected = false;
            this.updateView({ isSelected: false });
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleCopy = function (e, palleteState) {
        };
        Element.prototype.handlePaste = function (e, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
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
        Element.prototype.handlePalleteChange = function (change) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.audioStream = function (stream) {
        };
        Element.prototype.videoStream = function (stream) {
        };
        Element.prototype.move = function (changeX, changeY, updateTime) {
            this.x += changeX;
            this.y += changeY;
            this.updateTime = updateTime;
            this.updateView({ x: this.x, y: this.y, updateTime: updateTime });
        };
        Element.prototype.createCurveText = function () {
            var param = "M" + this.curveSet[0].x + "," + this.curveSet[0].y;
            param = param + " C" + this.curveSet[1].x + "," + this.curveSet[1].y;
            param = param + " " + this.curveSet[2].x + "," + this.curveSet[2].y;
            param = param + " " + this.curveSet[3].x + "," + this.curveSet[3].y;
            for (var i = 4; i + 2 < this.curveSet.length; i += 3) {
                param = param + " C" + this.curveSet[i + 0].x + "," + this.curveSet[i + 0].y;
                param = param + " " + this.curveSet[i + 1].x + "," + this.curveSet[i + 1].y;
                param = param + " " + this.curveSet[i + 2].x + "," + this.curveSet[i + 2].y;
            }
            return param;
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
        return Element;
    }(BoardElement));
    FreeCurve.Element = Element;
})(FreeCurve || (FreeCurve = {}));
registerComponent(FreeCurve.MODENAME, FreeCurve.Element, FreeCurve.Pallete);
