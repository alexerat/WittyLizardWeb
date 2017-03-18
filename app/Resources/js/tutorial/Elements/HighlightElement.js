var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Highlight;
(function (Highlight) {
    Highlight.MODENAME = 'HIGHLIGHT';
    var ViewComponents;
    (function (ViewComponents) {
        ViewComponents[ViewComponents["Highlight"] = 0] = "Highlight";
        ViewComponents[ViewComponents["Marker"] = 1] = "Marker";
    })(ViewComponents || (ViewComponents = {}));
    var CustomContextItems;
    (function (CustomContextItems) {
    })(CustomContextItems || (CustomContextItems = {}));
    var MessageTypes = {};
    var Pallete = (function (_super) {
        __extends(Pallete, _super);
        function Pallete() {
            return _super.call(this) || this;
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
    Highlight.Pallete = Pallete;
    var Element = (function (_super) {
        __extends(Element, _super);
        function Element(id, userId, x, y, width, height, callbacks, colour, isSelected, serverId) {
            var _this;
            var future = new Date();
            future.setFullYear(future.getFullYear() + 1);
            _this = _super.call(this, Highlight.MODENAME, id, x, y, width, height, userId, callbacks, serverId, future) || this;
            _this.isSelected = isSelected;
            var newHighlightView = {
                mode: Highlight.MODENAME, id: _this.id, updateTime: future, isSelected: isSelected, x: _this.x, y: _this.y, width: _this.width,
                height: _this.height, isEditing: false, isMoving: false, isResizing: false, remLock: false, getLock: false, colour: colour
            };
            _this.currentViewState = newHighlightView;
            console.log(_this);
            return _this;
        }
        Element.createElement = function (data) {
            var width = data.width;
            var height = data.height;
            if (data.serverId != null && data.serverId != undefined) {
                console.log('Creating upload from message.');
                var msg = data.serverMsg;
                console.log(msg);
                return new Element(data.id, msg.userId, msg.x, msg.y, msg.width, msg.height, data.callbacks, msg.colour, false, data.serverId);
            }
            else {
                return new Element(data.id, data.userId, data.x, data.y, data.width, data.height, data.callbacks, 0xffff00, true);
            }
        };
        Element.prototype.getNewMsg = function () {
            var msg = { localId: this.id, x: this.x, y: this.y, width: this.width, height: this.height, editLock: false };
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
            return [];
        };
        Element.prototype.handleDeselect = function () {
            var msg = { header: BaseMessageTypes.DELETE, payload: null };
            this.sendServerMsg(msg);
            this.deleteElement();
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleMouseDown = function (e, localX, localY, palleteState, component, subId) {
            var cursorType;
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
            if (component === 0) {
                retVal.wasDelete = { message: null };
            }
            else if (component === 1) {
                retVal.newViewCentre = { x: this.x + this.width / 2, y: this.y + this.height / 2 };
            }
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
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleBoardMouseUp = function (e, mouseX, mouseY, palleteState) {
            var serverMsgs = [];
            var retVal = this.getDefaultInputReturn();
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
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.handleMove = function (changeX, changeY) {
            var retVal = this.currentViewState;
            return retVal;
        };
        Element.prototype.endMove = function () {
            var retVal = { newView: this.currentViewState, serverMessages: [], move: null };
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
            var retVal = {
                newView: newView, serverMessages: retMsgs, wasEdit: wasEdit, wasDelete: wasDelete, alertMessage: alertMessage, infoMessage: infoMessage
            };
            return retVal;
        };
        Element.prototype.handleStartEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
            retVal.serverMessages = this.checkForServerId(serverMsgs);
            return retVal;
        };
        Element.prototype.handleEndEdit = function () {
            var retVal = this.getDefaultInputReturn();
            var serverMsgs = [];
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
        return Element;
    }(BoardElement));
    Highlight.Element = Element;
})(Highlight || (Highlight = {}));
registerComponent(Highlight.MODENAME, Highlight.Element, Highlight.Pallete);
