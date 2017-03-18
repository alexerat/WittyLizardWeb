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
        IGNORE: 1,
        POINT: 2,
        POINTMISSED: 3,
        MISSINGPOINT: 4
    };
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            var _this = _super.call(this) || this;
            _this.baseSize = PalleteSize.SMALL;
            _this.colour = 'black';
            _this.currentViewState = { colour: PalleteColour.BLACK, size: PalleteSize.SMALL };
            return _this;
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
            var _this = _super.call(this, FreeCurve.MODENAME, id, x, y, width, height, userId, callbacks, serverId, updateTime) || this;
            _this.pointBuffer = [];
            _this.numRecieved = 0;
            _this.numPoints = 0;
            _this.numRecieved = 0;
            if (serverId != null && serverId != undefined) {
                for (var i = 0; i < numPoints; i++) {
                    if (curveSet[i] != null && curveSet[i] != undefined) {
                        _this.pointBuffer[i] = curveSet[i];
                        _this.numRecieved++;
                    }
                }
                if (_this.numRecieved < numPoints) {
                    var self_1 = _this;
                    self_1.pointInTimeout = setInterval(function () {
                        for (var i = 0; i < self_1.numPoints; i++) {
                            if (self_1.pointBuffer[i] == null || self_1.pointBuffer[i] == undefined) {
                                var msg = { seq_num: i };
                                var msgCont = { header: MessageTypes.MISSINGPOINT, payload: msg };
                                self_1.sendServerMsg(msgCont);
                            }
                        }
                    }, 1000);
                }
            }
            else {
                for (var i = 0; i < curveSet.length; i++) {
                    _this.pointBuffer[i] = curveSet[i];
                    _this.numRecieved++;
                }
            }
            _this.numPoints = numPoints;
            _this.curveSet = curveSet;
            _this.colour = colour;
            _this.size = size;
            _this.isComplete = false;
            var newCurveView;
            if (_this.numRecieved < _this.numPoints) {
                console.log('Empty curve set.');
                newCurveView = {
                    mode: FreeCurve.MODENAME, type: 'empty', id: _this.id, size: _this.size, isMoving: _this.isMoving, colour: _this.colour, updateTime: _this.updateTime,
                    isSelected: false, x: _this.x, y: _this.y, width: _this.width, height: _this.height, isEditing: false, isResizing: false,
                    remLock: false, getLock: false
                };
            }
            else if (_this.curveSet.length > 1) {
                var pathText = _this.createCurveText();
                newCurveView = {
                    mode: FreeCurve.MODENAME, type: 'path', id: _this.id, size: _this.size, isMoving: _this.isMoving, colour: _this.colour, param: pathText,
                    updateTime: _this.updateTime, isSelected: false, x: _this.x, y: _this.y, width: _this.width, height: _this.height, isEditing: false,
                    isResizing: false, remLock: false, getLock: false
                };
                _this.isComplete = true;
            }
            else if (_this.curveSet.length == 1) {
                newCurveView = {
                    mode: FreeCurve.MODENAME, type: 'circle', id: _this.id, size: _this.size, isMoving: _this.isMoving, colour: _this.colour, point: _this.curveSet[0],
                    updateTime: _this.updateTime, isSelected: false, x: _this.x, y: _this.y, width: _this.width, height: _this.height, isEditing: false,
                    isResizing: false, remLock: false, getLock: false
                };
                _this.isComplete = true;
            }
            _this.currentViewState = newCurveView;
            return _this;
        }
        Element.createElement = function (data) {
            if (data.pointList != null && data.pointList != undefined) {
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
                    for (var i = 0; i < reducedPoints.length; i++) {
                        reducedPoints[i].x = reducedPoints[i].x * data.scaleF + data.panX;
                        reducedPoints[i].y = reducedPoints[i].y * data.scaleF + data.panY;
                        if (minX == null || reducedPoints[i].x < minX) {
                            minX = reducedPoints[i].x;
                        }
                        if (maxX == null || reducedPoints[i].x > maxX) {
                            maxX = reducedPoints[i].x;
                        }
                        if (minY == null || reducedPoints[i].y < minY) {
                            minY = reducedPoints[i].y;
                        }
                        if (maxY == null || reducedPoints[i].y > maxY) {
                            maxY = reducedPoints[i].y;
                        }
                    }
                    for (var i = 0; i < reducedPoints.length; i++) {
                        reducedPoints[i].x = reducedPoints[i].x - minX;
                        reducedPoints[i].y = reducedPoints[i].y - minY;
                    }
                    curves = FitCurve(reducedPoints, reducedPoints.length, 5);
                }
                else {
                    curves = [];
                    curves[0] = { x: size, y: size };
                    maxX = data.pointList[0].x * data.scaleF + data.panX + size;
                    minX = data.pointList[0].x * data.scaleF + data.panX - size;
                    maxY = data.pointList[0].y * data.scaleF + data.panY + size;
                    minY = data.pointList[0].y * data.scaleF + data.panY - size;
                }
                return new Element(data.id, data.userId, minX, minY, maxX - minX, maxY - minY, data.callbacks, curves.length, curves, colour, size);
            }
            else if (data.serverId != null && data.serverId != undefined && data.serverMsg != null && data.serverMsg != undefined) {
                var msg = data.serverMsg;
                var pointArray = [];
                for (var i = 0; i < msg.points.length; i++) {
                    pointArray[msg.points[i].seq_num] = { x: msg.points[i].x, y: msg.points[i].y };
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
            for (var i = 0; i < this.pointBuffer.length; i++) {
                var pointCont = { seq_num: i, x: this.pointBuffer[i].x, y: this.pointBuffer[i].y };
                pointMessages.push(pointCont);
            }
            var msg = {
                localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, colour: this.colour, size: this.size,
                num_points: this.numPoints, points: pointMessages, editLock: false
            };
            return msg;
        };
        Element.prototype.getClipboardData = function () {
            return null;
        };
        Element.prototype.getClipboardSVG = function () {
            return null;
        };
        Element.prototype.setServerId = function (id) {
            _super.prototype.setServerId.call(this, id);
            var messages = [];
            return messages;
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
        Element.prototype.handleBoardMouseDown = function (e, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = {
                newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: false,
                newViewCentre: null, cursor: null, infoMessage: null, alertMessage: null, move: null, wasDelete: null, wasRestore: null
            };
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardMouseMove = function (e, changeX, changeY, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            if (this.isMoving) {
                console.log('Should have moved.');
                this.move(changeX, changeY, new Date());
                this.hasMoved = true;
            }
            retVal.newView = this.currentViewState;
            retVal.serverMessages = this.checkForServerId(serverMsgs);
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
                var msg = { header: BaseMessageTypes.MOVE, payload: msgPayload };
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
            var serverMsg = { header: BaseMessageTypes.MOVE, payload: msgPayload };
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
        Element.prototype.handleElementServerMessage = function (message) {
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
                                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height,
                                    isEditing: false, isResizing: false, remLock: false, getLock: false
                                };
                            }
                            else if (this.curveSet.length == 1) {
                                newView = {
                                    mode: FreeCurve.MODENAME, type: 'circle', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour,
                                    point: this.curveSet[0], updateTime: this.updateTime, isSelected: false,
                                    x: this.x, y: this.y, width: this.width, height: this.height,
                                    isEditing: false, isResizing: false, remLock: false, getLock: false
                                };
                            }
                            else {
                                newView = {
                                    mode: FreeCurve.MODENAME, type: 'empty', id: this.id, size: this.size, isMoving: this.isMoving, colour: this.colour,
                                    updateTime: this.updateTime, isSelected: false, x: this.x, y: this.y, width: this.width, height: this.height,
                                    isEditing: false, isResizing: false, remLock: false, getLock: false
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
                case MessageTypes.POINTMISSED:
                    var msdata = message.payload;
                    var point = this.curveSet[msdata.num];
                    var msg = { num: msdata.num, x: point.x, y: point.y };
                    var msgCont = { header: MessageTypes.POINT, payload: msg };
                    retMsgs.push(msgCont);
                    break;
                default:
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
            this.isEditing = true;
            this.updateView({ isSelected: true, isEditing: true });
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleEndEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
            this.isSelected = false;
            this.isEditing = false;
            this.updateView({ isSelected: false, isEditing: false });
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleCopy = function (e, palleteState) {
        };
        Element.prototype.handlePaste = function (localX, localY, data, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleCut = function () {
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
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.audioStream = function (stream) {
        };
        Element.prototype.videoStream = function (stream) {
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
        return Element;
    }(BoardElement));
    FreeCurve.Element = Element;
})(FreeCurve || (FreeCurve = {}));
registerComponent(FreeCurve.MODENAME, FreeCurve.Element, FreeCurve.Pallete);
