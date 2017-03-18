var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Upload;
(function (Upload) {
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
        START: 1,
        DATA: 2,
        DONE: 3,
        ROTATE: 4,
        VIEWTYPE: 5,
        UPDATE: 6
    };
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
    Upload.Pallete = Pallete;
    var Element = (function (_super) {
        __extends(Element, _super);
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
        Element.prototype.getClipboardData = function () {
            var clipData = [];
            if (this.viewType == ViewTypes.IMAGE) {
            }
            else if (this.viewType == ViewTypes.VIDEO) {
            }
            else if (this.viewType == ViewTypes.AUDIO) {
            }
            else if (this.viewType == ViewTypes.FILE) {
            }
            clipData.push({ format: 'text/uri-list', data: this.url });
            clipData.push({ format: 'text/plain', data: this.url });
            return clipData;
        };
        Element.prototype.getClipboardSVG = function () {
            return null;
        };
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
                    console.log(reader_1.result);
                    var payload = { piece: reader_1.result, place: self_1.currentPlace };
                    var msg = { header: MessageTypes.DATA, payload: payload };
                    self_1.sendServerMsg(msg);
                };
                var payload = {};
                var msg = { header: MessageTypes.START, payload: payload };
                self_1.sendServerMsg(msg);
            }
            else {
                console.error('URL Already set in upload element.');
            }
            return [];
        };
        Element.prototype.handleMouseDown = function (e, localX, localY, palleteState, component, subId) {
            var cursorType;
            if (component == 1) {
                this.isResizing = true;
                this.oldWidth = this.width;
                this.oldHeight = this.height;
                this.startTime = this.updateTime;
                if (subId == 1) {
                    this.resizeHorz = true;
                    this.resizeVert = false;
                    cursorType = { cursor: 'ew-resize', url: [], offset: { x: 0, y: 0 } };
                }
                else if (subId == 2) {
                    this.resizeHorz = false;
                    this.resizeVert = true;
                    cursorType = { cursor: 'ns-resize', url: [], offset: { x: 0, y: 0 } };
                }
                else if (subId == 0) {
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
registerComponent(Upload.MODENAME, Upload.Element, Upload.Pallete);
