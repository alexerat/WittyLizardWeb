if (typeof Object.assign != 'function') {
    (function () {
        Object.assign = function (target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var output = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source !== undefined && source !== null) {
                    for (var nextKey in source) {
                        if (source.hasOwnProperty(nextKey)) {
                            output[nextKey] = source[nextKey];
                        }
                    }
                }
            }
            return output;
        };
    })();
}
var WhiteBoardController = (function () {
    function WhiteBoardController(isHost, userId) {
        var _this = this;
        this.isHost = false;
        this.userId = 0;
        this.socket = null;
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.touchPress = false;
        this.moving = false;
        this.scaleF = 1;
        this.panX = 0;
        this.panY = 0;
        this.scaleNum = 0;
        this.pointList = [];
        this.isPoint = true;
        this.prevX = 0;
        this.prevY = 0;
        this.curveChangeX = 0;
        this.curveChangeY = 0;
        this.currTextEdit = -1;
        this.currTextSel = -1;
        this.currTextMove = -1;
        this.currTextResize = -1;
        this.currCurveMove = -1;
        this.vertResize = false;
        this.horzResize = false;
        this.cursorStart = 0;
        this.cursorEnd = 0;
        this.startLeft = false;
        this.textDown = 0;
        this.textIdealX = 0;
        this.gettingLock = -1;
        this.curveMoved = false;
        this.textMoved = false;
        this.textResized = false;
        this.isWriting = false;
        this.textDict = [];
        this.curveDict = [];
        this.boardElems = [];
        this.curveOutBuffer = [];
        this.curveInBuffer = [];
        this.curveInTimeouts = [];
        this.curveOutTimeouts = [];
        this.textOutBuffer = [];
        this.textInBuffer = [];
        this.setView = function (view) {
            var whitElem = document.getElementById('whiteBoard-input');
            var whitCont = document.getElementById('whiteboard-container');
            whitElem.style.width = whitCont.clientWidth + 'px';
            whitElem.style.height = whitCont.clientHeight + 'px';
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            window.addEventListener('resize', _this.windowResize);
            document.addEventListener('keypress', _this.keyPress);
            var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;
            _this.viewState.viewBox = newVBox;
            _this.view = view;
            view.setState(_this.viewState);
        };
        this.updateView = function (viewState) {
            _this.viewState = viewState;
            _this.view.storeUpdate(_this.viewState);
        };
        this.getStyle = function () {
            return _this.viewState.isItalic ? 'italic' : 'normal';
        };
        this.getWeight = function () {
            return _this.viewState.isBold ? 'bold' : 'normal';
        };
        this.getDecoration = function () {
            if (_this.viewState.isOLine) {
                return 'overline';
            }
            else if (_this.viewState.isTLine) {
                return 'line-through';
            }
            else if (_this.viewState.isULine) {
                return 'underline';
            }
            else {
                return 'none';
            }
        };
        this.getCurve = function (id) {
            if (_this.boardElems[id].type == 'curve') {
                return _this.boardElems[id];
            }
            else {
                throw 'Element is not of curve type';
            }
        };
        this.getText = function (id) {
            if (_this.boardElems[id].type == 'text') {
                return _this.boardElems[id];
            }
            else {
                console.log('Type was: ' + _this.boardElems[id].type);
                throw 'Element is not of text type';
            }
        };
        this.getViewElement = function (id) {
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            return _this.viewState.boardElements.get(viewIndex);
        };
        this.deleteElement = function (id) {
            _this.boardElems[id].isDeleted = true;
            var newElemList = _this.viewState.boardElements.filter(function (elem) { return elem.id !== id; });
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.restoreElement = function (id) {
            _this.boardElems[id].isDeleted = false;
            if (_this.boardElems[id].type === 'text') {
            }
            else if (_this.boardElems[id].type === 'curve') {
            }
        };
        this.addCurve = function (curveSet, userId, colour, size, serverId) {
            var newCurve = {
                type: 'curve', id: -1, user: userId, isDeleted: false, colour: colour, size: size, curveSet: curveSet, serverId: serverId
            };
            var localId = _this.boardElems.length;
            _this.boardElems[localId] = newCurve;
            newCurve.id = localId;
            if (serverId) {
                _this.curveDict[serverId] = localId;
            }
            var newCurveView;
            if (curveSet.length > 1) {
                var pathText = _this.createCurveText(curveSet);
                newCurveView = { type: 'path', id: localId, size: newCurve.size, colour: newCurve.colour, param: pathText };
            }
            else {
                newCurveView = { type: 'circle', id: localId, size: newCurve.size, colour: newCurve.colour, point: curveSet[0] };
            }
            var newElemList = _this.viewState.boardElements.push(newCurveView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            return localId;
        };
        this.moveCurve = function (id, changeX, changeY) {
            var curve = _this.getCurve(id);
            for (var i = 0; i < curve.curveSet.length; i++) {
                curve.curveSet[i].x += changeX;
                curve.curveSet[i].y += changeY;
            }
            var newCurveView;
            if (curve.curveSet.length > 1) {
                var pathText = _this.createCurveText(curve.curveSet);
                newCurveView = Object.assign({}, _this.getViewElement(id), { param: pathText });
            }
            else {
                newCurveView = Object.assign({}, _this.getViewElement(id), { point: curve.curveSet });
            }
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newCurveView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.addTextbox = function (x, y, width, height, size, justified, userId, editLock, serverId) {
            var localId;
            var remLock;
            if (serverId) {
                localId = _this.textDict[serverId];
            }
            var newText;
            if (!localId) {
                newText =
                    {
                        text: '', user: userId, isDeleted: false, x: x, y: y, size: size, styles: [], editCount: 0, type: 'text', cursor: null, cursorElems: [],
                        width: width, height: height, editLock: editLock, justified: justified, textNodes: [], dist: [0], serverId: serverId, id: 0
                    };
                localId = _this.boardElems.length;
                _this.boardElems[localId] = newText;
                newText.id = localId;
            }
            else {
                newText = _this.getText(localId);
            }
            if (editLock == _this.userId) {
                remLock = false;
                if (_this.currTextEdit == -1) {
                    _this.currTextEdit = localId;
                    _this.currTextSel = localId;
                    _this.cursorStart = newText.text.length;
                    _this.cursorEnd = newText.text.length;
                    _this.gettingLock = -1;
                    _this.isWriting = true;
                    _this.changeTextSelect(localId, true);
                    _this.setMode(1);
                }
                else if (_this.currTextEdit != localId) {
                    _this.releaseText(localId);
                }
            }
            else if (editLock != 0) {
                remLock = true;
            }
            var newView = {
                x: newText.x, y: newText.y, width: newText.width, height: newText.height, isEditing: false, remLock: remLock, getLock: false, textNodes: [],
                cursor: null, cursorElems: [], id: localId, type: 'text', size: newText.size
            };
            var newElemList = _this.viewState.boardElements.push(newView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            return localId;
        };
        this.stopLockText = function (id) {
            _this.gettingLock = -1;
            _this.currTextEdit = -1;
            _this.currTextSel = -1;
            _this.isWriting = false;
            var tbox = _this.getText(id);
            tbox.editLock = 0;
            tbox.cursor = null;
            tbox.cursorElems = [];
            var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: false, isEditing: false, cursor: null, cursorElems: [] });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextGetLock = function (id) {
            _this.gettingLock = id;
            var tbox = _this.getText(id);
            tbox.editLock = _this.userId;
            _this.cursorStart = tbox.text.length;
            _this.cursorEnd = tbox.text.length;
            _this.isWriting = true;
            _this.changeTextSelect(id, true);
            var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: true });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.changeTextSelect = function (id, setIdeal) {
            var tbox = _this.getText(id);
            if (setIdeal) {
                if (_this.startLeft) {
                    _this.textIdealX = _this.findXPos(tbox, _this.cursorEnd);
                }
                else {
                    _this.textIdealX = _this.findXPos(tbox, _this.cursorStart);
                }
            }
            _this.findCursorElems(tbox, _this.cursorStart, _this.cursorEnd);
            var newTextViewCurr = Object.assign({}, _this.getViewElement(id), { cursor: tbox.cursor, cursorElems: tbox.cursorElems });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextViewCurr);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextEdit = function (id) {
            _this.currTextEdit = id;
            _this.currTextSel = id;
            var tbox = _this.getText(id);
            tbox.editLock = _this.userId;
            _this.cursorStart = tbox.text.length;
            _this.cursorEnd = tbox.text.length;
            _this.gettingLock = -1;
            _this.isWriting = true;
            _this.changeTextSelect(id, true);
            var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: false, isEditing: true });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { mode: 1, boardElements: newElemList }));
        };
        this.setTextLock = function (id, userId) {
            var tbox = _this.getText(id);
            tbox.editLock = userId;
            if (userId != _this.userId) {
                var newTextView = Object.assign({}, _this.getViewElement(id), { remLock: true });
                var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
                var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
                _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            }
        };
        this.setTextUnLock = function (id) {
            console.log('Should be releasing......');
            var tbox = _this.getText(id);
            tbox.editLock = 0;
            var newTextView = Object.assign({}, _this.getViewElement(id), { remLock: false });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextJustified = function (id, state) {
            var textBox = _this.getText(id);
            textBox.justified = state;
            textBox.textNodes = _this.calculateTextLines(textBox);
            if (_this.currTextSel == id) {
                _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: textBox.textNodes, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextArea = function (id, width, height) {
            var textBox = _this.getText(id);
            textBox.height = height;
            if (textBox.width != width) {
                textBox.width = width;
                textBox.textNodes = _this.calculateTextLines(textBox);
            }
            if (_this.currTextSel == id) {
                _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: textBox.textNodes, width: textBox.width, height: textBox.height, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.moveTextbox = function (id, isRelative, x, y) {
            var textBox = _this.getText(id);
            var changeX;
            var changeY;
            if (isRelative) {
                changeX = x;
                changeY = y;
            }
            else {
                changeX = x - textBox.x;
                changeY = y - textBox.y;
            }
            textBox.x += changeX;
            textBox.y += changeY;
            for (var i = 0; i < textBox.textNodes.length; i++) {
                var node = textBox.textNodes[i];
                node.x += changeX;
                node.y += changeY;
            }
            if (_this.currTextSel == id) {
                _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: textBox.textNodes, x: textBox.x, y: textBox.y, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.updateText = function (id, newText) {
            newText.textNodes = _this.calculateTextLines(newText);
            if (_this.currTextSel == id) {
                _this.findCursorElems(newText, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: newText.textNodes, width: newText.width, height: newText.height, cursor: newText.cursor, cursorElems: newText.cursorElems
            });
            var viewIndex = _this.viewState.boardElements.findIndex(function (elem) { return elem.id === id; });
            var newElemList = _this.viewState.boardElements.set(viewIndex, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setMode = function (newMode) {
            _this.updateView(Object.assign({}, _this.viewState, { mode: newMode }));
        };
        this.setColour = function (newColour) {
            _this.updateView(Object.assign({}, _this.viewState, { colour: newColour }));
        };
        this.setIsItalic = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isItalic: newState }));
        };
        this.setIsOline = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isOLine: newState }));
        };
        this.setIsUline = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isULine: newState }));
        };
        this.setIsTline = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isTLine: newState }));
        };
        this.setIsBold = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isBold: newState }));
        };
        this.setJustified = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isJustified: newState }));
        };
        this.startMove = function () {
            _this.updateView(Object.assign({}, _this.viewState, { itemMoving: true }));
        };
        this.endMove = function () {
            _this.currTextResize = -1;
            _this.currTextMove = -1;
            _this.currCurveMove = -1;
            _this.updateView(Object.assign({}, _this.viewState, { itemMoving: false }));
        };
        this.setViewBox = function (newView) {
            _this.updateView(Object.assign({}, _this.viewState, { viewBox: newView }));
        };
        this.newEdit = function (textBox) {
            textBox.editCount++;
            if (textBox.editCount > 5) {
                textBox.editCount = 0;
                clearTimeout(_this.editTimer);
                _this.textEdited(textBox);
            }
            else {
                var self = _this;
                clearTimeout(_this.editTimer);
                _this.editTimer = setTimeout(function (tBox) {
                    tBox.editCount = 0;
                    self.textEdited(tBox);
                    clearTimeout(this.editTimer);
                }, 6000, textBox);
            }
            return textBox;
        };
        this.drawCurve = function (points, size, colour, scaleF, panX, panY) {
            var reducedPoints;
            var curves;
            if (points.length > 1) {
                reducedPoints = SmoothCurve(points);
                reducedPoints = DeCluster(reducedPoints, 10);
                for (var i = 0; i < reducedPoints.length; i++) {
                    reducedPoints[i].x = reducedPoints[i].x * scaleF + panX;
                    reducedPoints[i].y = reducedPoints[i].y * scaleF + panY;
                }
                curves = FitCurve(reducedPoints, reducedPoints.length, 5);
            }
            else {
                curves = [];
                curves[0] = { x: points[0].x * scaleF + panX, y: points[0].y * scaleF + panY };
            }
            var localId = _this.addCurve(curves, _this.userId, colour, size);
            _this.sendCurve(localId, curves, colour, size);
        };
        this.isCurrentStyle = function (style) {
            if (style.colour == _this.viewState.colour && style.decoration == _this.getDecoration() && style.weight == _this.getWeight() && style.style == _this.getStyle()) {
                return true;
            }
            else {
                return false;
            }
        };
        this.textEdited = function (textbox) {
            var buffer;
            var editNum;
            if (_this.textOutBuffer[textbox.id]) {
                buffer = _this.textOutBuffer[textbox.id];
                editNum = buffer.editCount;
                buffer.editCount++;
            }
            else {
                buffer = {
                    id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, lastSent: 0,
                    height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified, styles: []
                };
                buffer.styles = textbox.styles.slice();
                editNum = 0;
            }
            buffer.editBuffer[editNum] = { num_nodes: textbox.styles.length, nodes: [] };
            for (var i = 0; i < textbox.styles.length; i++) {
                buffer.editBuffer[editNum].nodes.push({ num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                    weight: textbox.styles[i].weight, decoration: textbox.styles[i].decoration, style: textbox.styles[i].style,
                    start: textbox.styles[i].start, end: textbox.styles[i].end, editId: editNum
                });
            }
            _this.textOutBuffer[textbox.id] = buffer;
            if (textbox.serverId) {
                var msg = { serverId: textbox.serverId, localId: editNum, bufferId: textbox.id, num_nodes: textbox.styles.length };
                _this.socket.emit('EDIT-TEXT', msg);
            }
            else {
                var msg = {
                    localId: textbox.id, x: _this.textOutBuffer[textbox.id].x, y: _this.textOutBuffer[textbox.id].y, size: _this.textOutBuffer[textbox.id].size,
                    width: _this.textOutBuffer[textbox.id].width, height: _this.textOutBuffer[textbox.id].height, justified: _this.textOutBuffer[textbox.id].justified
                };
                _this.socket.emit('TEXTBOX', msg);
            }
        };
        this.resizeText = function (id, width, height) {
            var textBox = _this.getText(id);
            _this.setTextArea(id, width, height);
            if (textBox.serverId) {
                var msg = { serverId: textBox.serverId, width: width, height: height };
                _this.socket.emit('RESIZE-TEXT', msg);
            }
            else {
            }
        };
        this.findXPos = function (textbox, loc) {
            if (textbox.textNodes.length == 0) {
                return 0;
            }
            var i = 1;
            while (i < textbox.textNodes.length && textbox.textNodes[i].start <= loc) {
                i++;
            }
            var line = textbox.textNodes[i - 1];
            if (line.styles.length == 0) {
                return 0;
            }
            i = 1;
            while (i < line.styles.length && line.styles[i].locStart + line.start <= loc) {
                i++;
            }
            var style = line.styles[i - 1];
            if (line.start + style.locStart == loc) {
                return style.startPos;
            }
            else {
                var currMes = textbox.dist[loc] - textbox.dist[line.start + style.locStart];
                return currMes + style.startPos;
            }
        };
        this.findTextPos = function (textbox, x, y) {
            var whitElem = document.getElementById("whiteBoard-output");
            var elemRect = whitElem.getBoundingClientRect();
            var xFind = 0;
            if (y < textbox.y) {
                return 0;
            }
            else {
                var lineNum = Math.floor(((y - textbox.y) / (1.5 * textbox.size)) + 0.15);
                if (lineNum >= textbox.textNodes.length) {
                    return textbox.text.length;
                }
                if (!textbox.textNodes[lineNum]) {
                    console.log('Line is: ' + lineNum);
                }
                if (x > textbox.x) {
                    if (x > textbox.x + textbox.width) {
                        return textbox.textNodes[lineNum].end;
                    }
                    else {
                        xFind = x - textbox.x;
                    }
                }
                else {
                    return textbox.textNodes[lineNum].start;
                }
                var line = textbox.textNodes[lineNum];
                if (line.styles.length == 0) {
                    return line.start;
                }
                var i = 0;
                while (i < line.styles.length && xFind > line.styles[i].startPos) {
                    i++;
                }
                var curr = i - 1;
                var style = line.styles[i - 1];
                i = style.text.length - 1;
                var currMes = textbox.dist[line.start + style.locStart + style.text.length - 1] - textbox.dist[line.start + style.locStart];
                while (i > 0 && style.startPos + currMes > xFind) {
                    i--;
                    currMes = textbox.dist[line.start + style.locStart + i] - textbox.dist[line.start + style.locStart];
                }
                var selPoint;
                if (i < style.text.length - 1) {
                    if (xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind) {
                        selPoint = line.start + style.locStart + i + 1;
                    }
                    else {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                else if (curr + 1 < line.styles.length) {
                    if (xFind - (style.startPos + currMes) > line.styles[curr + 1].startPos - xFind) {
                        selPoint = line.start + line.styles[curr + 1].locStart;
                    }
                    else {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                else {
                    if (xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind) {
                        selPoint = line.start + style.locStart + i + 1;
                    }
                    else {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                return selPoint;
            }
        };
        this.findCursorElems = function (textbox, cursorStart, cursorEnd) {
            textbox.cursorElems = [];
            if (textbox.textNodes.length == 0) {
                textbox.cursor = { x: textbox.x, y: textbox.y, height: 1.5 * textbox.size };
            }
            for (var i = 0; i < textbox.textNodes.length; i++) {
                var line = textbox.textNodes[i];
                var selStart = null;
                var selEnd = null;
                var startFound = false;
                var endFound = false;
                if (cursorStart >= line.start && cursorStart <= line.end) {
                    if (cursorStart == line.end && !line.endCursor) {
                        selStart = textbox.width;
                    }
                    else {
                        for (var j = 0; j < line.styles.length && !startFound; j++) {
                            var style = line.styles[j];
                            selStart = 0;
                            selStart += style.dx;
                            if (cursorStart <= line.start + style.locStart + style.text.length) {
                                startFound = true;
                                selStart += style.startPos + textbox.dist[cursorStart] - textbox.dist[line.start + style.locStart];
                            }
                        }
                    }
                }
                else if (cursorStart < line.start && cursorEnd > line.start) {
                    selStart = 0;
                }
                if (cursorEnd > line.start && cursorEnd <= line.end) {
                    if (cursorEnd == line.end && !line.endCursor) {
                        selEnd = textbox.width;
                    }
                    else {
                        for (var j = 0; j < line.styles.length && !endFound; j++) {
                            var style = line.styles[j];
                            selEnd = 0;
                            selEnd += style.dx;
                            if (cursorEnd <= line.start + style.locStart + style.text.length) {
                                endFound = true;
                                selEnd += style.startPos + textbox.dist[cursorEnd] - textbox.dist[line.start + style.locStart];
                            }
                        }
                    }
                }
                else if (cursorEnd >= line.end && cursorStart <= line.end) {
                    selEnd = textbox.width;
                }
                if (cursorEnd >= line.start && cursorEnd <= line.end && (_this.startLeft || cursorStart == cursorEnd) && line.start != line.end) {
                    if (cursorEnd != line.end || line.endCursor) {
                        textbox.cursor = { x: textbox.x + selEnd, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                    }
                }
                else if (cursorStart >= line.start && cursorStart <= line.end && (!_this.startLeft || cursorStart == cursorEnd)) {
                    if (cursorStart != line.end || line.endCursor) {
                        textbox.cursor = { x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                    }
                }
                if (selStart != null && selEnd != null && cursorStart != cursorEnd) {
                    textbox.cursorElems.push({ x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, width: selEnd - selStart, height: 1.5 * textbox.size });
                }
            }
        };
        this.calculateLengths = function (textbox, start, end, prevEnd) {
            var whitElem = document.getElementById("whiteBoard-output");
            var tMount;
            var startPoint;
            var styleNode;
            var change = 0;
            var style = 0;
            var oldDist = textbox.dist.slice();
            while (style - 1 < textbox.styles.length && textbox.styles[style].end <= start - 2) {
                style++;
            }
            if (start > 1) {
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                var charLength1;
                var charLength2;
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 2)));
                tMount.appendChild(styleNode);
                charLength1 = styleNode.getComputedTextLength();
                if (textbox.styles[style].end <= start - 1) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 1)));
                tMount.appendChild(styleNode);
                charLength2 = styleNode.getComputedTextLength();
                startPoint = textbox.dist[start - 1] + tMount.getComputedTextLength() - charLength1 - charLength2;
                whitElem.removeChild(tMount);
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 1)));
                tMount.appendChild(styleNode);
                if (textbox.styles[style].end <= start) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
                tMount.appendChild(styleNode);
                textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
            }
            else if (start > 0) {
                startPoint = 0;
                if (textbox.styles[style].end <= start - 1) {
                    style++;
                }
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 1)));
                tMount.appendChild(styleNode);
                if (textbox.styles[style].end <= start) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
                tMount.appendChild(styleNode);
                textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
            }
            else {
                startPoint = 0;
                style = 0;
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
                tMount.appendChild(styleNode);
                textbox.dist[1] = startPoint + tMount.getComputedTextLength();
            }
            for (var i = start + 1; i < end; i++) {
                if (textbox.styles[style].end <= i) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(i)));
                tMount.appendChild(styleNode);
                textbox.dist[i + 1] = startPoint + tMount.getComputedTextLength();
            }
            if (end < textbox.text.length) {
                if (textbox.styles[style].end <= end) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(end)));
                tMount.appendChild(styleNode);
                change = startPoint + tMount.getComputedTextLength() - oldDist[prevEnd + 1];
                for (var i = end; i < textbox.text.length; i++) {
                    textbox.dist[i + 1] = oldDist[i + 1 + prevEnd - end] + change;
                }
            }
            whitElem.removeChild(tMount);
        };
        this.calculateTextLines = function (textbox) {
            var i;
            var childText = [];
            var currPos = 0;
            var prevPos = 0;
            var txtStart = 0;
            var isWhiteSpace = true;
            var dy = textbox.size;
            var ddy = 1.5 * textbox.size;
            var nodeCounter;
            var computedTextLength;
            var wordC;
            var spaceC;
            var line;
            var wordsT = [];
            var spacesT = [];
            var startSpace = true;
            var currY = textbox.y;
            var lineCount = 0;
            if (!textbox.text.length) {
                return [];
            }
            for (i = 0; i < textbox.text.length; i++) {
                if (isWhiteSpace) {
                    if (!textbox.text.charAt(i).match(/\s/)) {
                        if (i > 0) {
                            spacesT.push(textbox.text.substring(txtStart, i));
                            txtStart = i;
                            isWhiteSpace = false;
                        }
                        else {
                            startSpace = false;
                            isWhiteSpace = false;
                        }
                    }
                }
                else {
                    if (textbox.text.charAt(i).match(/\s/)) {
                        wordsT.push(textbox.text.substring(txtStart, i));
                        txtStart = i;
                        isWhiteSpace = true;
                    }
                }
            }
            if (isWhiteSpace) {
                spacesT.push(textbox.text.substring(txtStart, i));
            }
            else {
                wordsT.push(textbox.text.substring(txtStart, i));
            }
            wordC = 0;
            spaceC = 0;
            nodeCounter = 0;
            var nLineTrig;
            while (wordC < wordsT.length || spaceC < spacesT.length) {
                var lineComplete = false;
                var word;
                currY += dy;
                var currLength = 0;
                var tspanEl = {
                    styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                    justified: textbox.justified, lineNum: lineCount, text: ''
                };
                var progPos = true;
                nLineTrig = false;
                if (startSpace) {
                    var fLine = spacesT[spaceC].indexOf('\n');
                    if (fLine != -1) {
                        if (spacesT[spaceC].length > 1) {
                            if (fLine == 0) {
                                nLineTrig = true;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                            }
                            else {
                                progPos = false;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                            }
                        }
                        else {
                            nLineTrig = true;
                            startSpace = !startSpace;
                        }
                    }
                    if (spaceC >= spacesT.length) {
                        console.error('ERROR: Space array out of bounds');
                        return [];
                    }
                    word = spacesT[spaceC];
                    spaceC++;
                }
                else {
                    if (wordC >= wordsT.length) {
                        console.error('ERROR: Word array out of bounds');
                        return [];
                    }
                    word = wordsT[wordC];
                    wordC++;
                }
                if (nLineTrig) {
                    word = '';
                    lineComplete = true;
                    tspanEl.justified = false;
                    tspanEl.end = currPos;
                    currPos++;
                    prevPos = currPos;
                }
                computedTextLength = textbox.dist[currPos + word.length] - textbox.dist[currPos];
                if (computedTextLength > textbox.width) {
                    lineComplete = true;
                    fDash = word.indexOf('-');
                    if (fDash != -1 && computedTextLength > textbox.width) {
                        var newStr = word.substring(fDash + 1, word.length);
                        wordsT.splice(wordC, 0, newStr);
                        word = word.substring(0, fDash + 1);
                    }
                    i = word.length;
                    while (computedTextLength > textbox.width && i > 0) {
                        computedTextLength = textbox.dist[currPos + word.substring(0, i).length] - textbox.dist[currPos];
                        i--;
                    }
                    if (computedTextLength <= textbox.width) {
                        if (startSpace) {
                            if (i + 2 < word.length) {
                                spacesT.splice(spaceC, 0, word.substring(i + 2, word.length));
                            }
                            else {
                                startSpace = !startSpace;
                            }
                            word = word.substring(0, i + 1);
                            currPos += word.length;
                            tspanEl.end = currPos;
                            prevPos = currPos + 1;
                        }
                        else {
                            wordsT.splice(wordC, 0, word.substring(i + 1, word.length));
                            word = word.substring(0, i + 1);
                            currPos += word.length;
                            tspanEl.end = currPos;
                            tspanEl.endCursor = false;
                            prevPos = currPos;
                        }
                    }
                    else {
                        console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                    }
                }
                else {
                    currPos += word.length;
                    if (!nLineTrig && progPos) {
                        startSpace = !startSpace;
                    }
                }
                line = word;
                currLength = computedTextLength;
                while (!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length)) {
                    if (startSpace) {
                        var fLine = spacesT[spaceC].indexOf('\n');
                        if (fLine != -1) {
                            if (spacesT[spaceC].length > 1) {
                                if (fLine == 0) {
                                    nLineTrig = true;
                                    spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                    spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                                }
                                else {
                                    progPos = false;
                                    spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                    spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                                }
                            }
                            else {
                                nLineTrig = true;
                                startSpace = !startSpace;
                            }
                        }
                        word = spacesT[spaceC];
                    }
                    else {
                        word = wordsT[wordC];
                    }
                    if (nLineTrig) {
                        word = '';
                        lineComplete = true;
                        tspanEl.justified = false;
                        tspanEl.end = currPos;
                        currPos++;
                        prevPos = currPos;
                    }
                    computedTextLength = currLength + textbox.dist[currPos + word.length] - textbox.dist[currPos];
                    if (computedTextLength > textbox.width) {
                        lineComplete = true;
                        if (startSpace) {
                            if (word.length > 1) {
                                i = word.length - 1;
                                while (computedTextLength > textbox.width && i > 0) {
                                    computedTextLength = currLength + textbox.dist[currPos + i] - textbox.dist[currPos];
                                    i--;
                                }
                                if (computedTextLength <= textbox.width) {
                                    if (i + 2 < word.length) {
                                        var newStr = word.substring(i + 2, word.length);
                                        spacesT.splice(spaceC, 0, newStr);
                                        line += word.substring(0, i + 1);
                                        currPos += word.substring(0, i + 1).length;
                                        tspanEl.end = currPos;
                                        currPos++;
                                        prevPos = currPos;
                                        spaceC++;
                                    }
                                    else {
                                        line += word.substring(0, i + 1);
                                        currPos += word.substring(0, i + 1).length;
                                        tspanEl.end = currPos;
                                        currPos++;
                                        prevPos = currPos;
                                        startSpace = !startSpace;
                                        spaceC++;
                                    }
                                    currLength = computedTextLength;
                                }
                                else {
                                    computedTextLength = currLength + textbox.dist[currPos + word.length - 1] - textbox.dist[currPos];
                                    tspanEl.end = currPos;
                                    prevPos = currPos + 1;
                                    spacesT[spaceC] = spacesT[spaceC].substring(1, spacesT[spaceC].length);
                                }
                            }
                            else {
                                computedTextLength = currLength;
                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                                startSpace = !startSpace;
                                spaceC++;
                            }
                        }
                        else {
                            var fDash = word.indexOf('-');
                            if (fDash != -1) {
                                computedTextLength = currLength + textbox.dist[currPos + fDash + 1] - textbox.dist[currPos];
                                if (computedTextLength <= textbox.width) {
                                    var newStr = word.substring(fDash + 1, word.length);
                                    wordsT.splice(wordC, 0, newStr);
                                    wordC++;
                                    line += word.substring(0, fDash + 1);
                                    currPos += word.substring(0, fDash + 1).length;
                                    tspanEl.end = currPos;
                                    tspanEl.endCursor = false;
                                    prevPos = currPos;
                                    currLength = computedTextLength;
                                }
                                else {
                                    computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];
                                    line = line.substring(0, line.length - 1);
                                    tspanEl.end = currPos;
                                    currPos++;
                                    prevPos = currPos;
                                }
                            }
                            else {
                                computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];
                                line = line.substring(0, line.length - 1);
                                tspanEl.end = currPos - 1;
                                prevPos = currPos;
                            }
                        }
                    }
                    else {
                        line += word;
                        currPos += word.length;
                        if (nLineTrig) {
                            spaceC++;
                        }
                        else {
                            if (startSpace) {
                                spaceC++;
                            }
                            else {
                                wordC++;
                            }
                            if (progPos) {
                                startSpace = !startSpace;
                            }
                        }
                        currLength = computedTextLength;
                    }
                }
                tspanEl.end = tspanEl.start + line.length;
                tspanEl.text = line;
                dy = ddy;
                nodeCounter = 0;
                if (wordC == wordsT.length && spaceC == spacesT.length) {
                    tspanEl.justified = false;
                }
                var reqAdjustment = textbox.width - computedTextLength;
                var numSpaces = tspanEl.text.length - tspanEl.text.replace(/\s/g, "").length;
                var extraSpace = reqAdjustment / numSpaces;
                var currStart = 0;
                var currLoc = 0;
                for (var j = 0; j < textbox.styles.length; j++) {
                    if (textbox.styles[j].start < tspanEl.end && textbox.styles[j].end > tspanEl.start) {
                        var startPoint = (textbox.styles[j].start < tspanEl.start) ? 0 : (textbox.styles[j].start - tspanEl.start);
                        var endPoint = (textbox.styles[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (textbox.styles[j].end - tspanEl.start);
                        var styleText = tspanEl.text.slice(startPoint, endPoint);
                        var newStyle;
                        word = '';
                        for (i = 0; i < styleText.length; i++) {
                            if (styleText.charAt(i).match(/\s/)) {
                                if (word.length > 0) {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: word, colour: textbox.styles[j].colour, dx: 0, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += textbox.dist[tspanEl.start + currLoc + word.length] - textbox.dist[tspanEl.start + currLoc];
                                    currLoc += word.length;
                                    word = '';
                                    tspanEl.styles.push(newStyle);
                                    nodeCounter++;
                                }
                                if (tspanEl.justified) {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: styleText.charAt(i), colour: textbox.styles[j].colour, dx: extraSpace, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += extraSpace + textbox.dist[tspanEl.start + currLoc + 1] - textbox.dist[tspanEl.start + currLoc];
                                }
                                else {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: styleText.charAt(i), colour: textbox.styles[j].colour, dx: 0, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += textbox.dist[tspanEl.start + currLoc + 1] - textbox.dist[tspanEl.start + currLoc];
                                }
                                currLoc += 1;
                                tspanEl.styles.push(newStyle);
                                nodeCounter++;
                            }
                            else {
                                word += styleText.charAt(i);
                                if (i == styleText.length - 1) {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: word, colour: textbox.styles[j].colour, dx: 0, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += textbox.dist[tspanEl.start + currLoc + word.length] - textbox.dist[tspanEl.start + currLoc];
                                    currLoc += word.length;
                                    tspanEl.styles.push(newStyle);
                                    nodeCounter++;
                                }
                            }
                        }
                    }
                }
                childText.push(tspanEl);
                lineCount++;
            }
            if (nLineTrig) {
                tspanEl = {
                    styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                    justified: false, lineNum: lineCount, text: ''
                };
                lineCount++;
                childText.push(tspanEl);
            }
            if (lineCount * 1.5 * textbox.size > textbox.height) {
                _this.resizeText(textbox.id, textbox.width, lineCount * 1.5 * textbox.size);
            }
            return childText;
        };
        this.sendCurve = function (localId, curves, colour, size) {
            var self = _this;
            _this.curveOutBuffer[localId] = { serverId: 0, localId: localId, colour: colour, curveSet: curves, size: size };
            _this.curveOutTimeouts[localId] = setInterval(function () {
                var msg = { localId: localId, colour: colour, num_points: curves.length, size: size };
                self.socket.emit('CURVE', msg);
            }, 60000);
            var msg = { localId: localId, colour: colour, num_points: curves.length, size: size };
            _this.socket.emit('CURVE', msg);
        };
        this.completeEdit = function (textId, userId, editId) {
            var textItem;
            var fullText = '';
            var localId = _this.textDict[textId];
            var editData = _this.textInBuffer[textId].editBuffer[userId][editId];
            textItem = _this.getText(localId);
            textItem.styles = [];
            for (var i = 0; i < editData.nodes.length; i++) {
                textItem.styles[editData.nodes[i].num] = editData.nodes[i];
            }
            for (var i = 0; i < textItem.styles.length; i++) {
                fullText += textItem.styles[i].text;
            }
            textItem.text = fullText;
            _this.calculateLengths(textItem, 0, fullText.length, 0);
            _this.updateText(localId, textItem);
        };
        this.createCurveText = function (curve) {
            var param = "M" + curve[0].x + "," + curve[0].y;
            param = param + " C" + curve[1].x + "," + curve[1].y;
            param = param + " " + curve[2].x + "," + curve[2].y;
            param = param + " " + curve[3].x + "," + curve[3].y;
            for (var i = 4; i + 2 < curve.length; i += 3) {
                param = param + " C" + curve[i + 0].x + "," + curve[i + 0].y;
                param = param + " " + curve[i + 1].x + "," + curve[i + 1].y;
                param = param + " " + curve[i + 2].x + "," + curve[i + 2].y;
            }
            return param;
        };
        this.releaseText = function (id) {
            var textbox = _this.getText(id);
            _this.stopLockText(id);
            var msg = { serverId: textbox.serverId };
            _this.socket.emit('RELEASE-TEXT', msg);
        };
        this.enterText = function (newText) {
        };
        this.changeTextStyle = function (newStyle) {
        };
        this.setSocket = function (socket) {
            var self = _this;
            _this.socket = socket;
            _this.socket.on('JOIN', function (data) {
            });
            _this.socket.on('CURVE', function (data) {
                console.log('Recieved curve ID:' + data.serverId);
                if (!self.curveDict[data.serverId] && !self.curveInBuffer[data.serverId]) {
                    self.curveInBuffer[data.serverId] = {
                        serverId: data.serverId, user: data.userId, size: data.size, num_points: data.num_points, num_recieved: 0,
                        curveSet: new Array, colour: data.colour
                    };
                    clearInterval(self.curveInTimeouts[data.serverId]);
                    self.curveInTimeouts[data.serverId] = setInterval(function (id) {
                        for (var j = 0; j < self.curveInBuffer[id].num_points; j++) {
                            if (!self.curveInBuffer[id].curveSet[j]) {
                                console.log('Sending Missing message.');
                                var msg = { serverId: id, seq_num: j };
                                self.socket.emit('MISSING-CURVE', msg);
                            }
                        }
                    }, 30000, data.serverId);
                }
            });
            _this.socket.on('POINT', function (data) {
                var buffer = self.curveInBuffer[data.serverId];
                if (buffer && buffer.num_recieved != buffer.num_points) {
                    if (!buffer.curveSet[data.num]) {
                        buffer.curveSet[data.num] = { x: data.x, y: data.y };
                        buffer.num_recieved++;
                    }
                    if (buffer.num_recieved == buffer.num_points) {
                        clearInterval(self.curveInTimeouts[data.serverId]);
                        self.addCurve(buffer.curveSet, buffer.user, buffer.colour, buffer.size, data.serverId);
                    }
                }
                else {
                    clearInterval(self.curveInTimeouts[data.serverId]);
                    self.socket.emit('UNKNOWN-CURVE', data.serverId);
                }
            });
            _this.socket.on('IGNORE-CURVE', function (curveId) {
                clearInterval(self.curveInTimeouts[curveId]);
            });
            _this.socket.on('CURVEID', function (data) {
                self.curveOutBuffer[data.localId].serverId = data.serverId;
                clearInterval(self.curveOutTimeouts[data.localId]);
                for (var i = 0; i < self.curveOutBuffer[data.localId].curveSet.length; i++) {
                    var curve = self.curveOutBuffer[data.localId].curveSet[i];
                    var msg = { serverId: data.serverId, num: i, x: curve.x, y: curve.y };
                    self.socket.emit('POINT', msg);
                }
                self.boardElems[data.localId].serverId = data.serverId;
                self.curveDict[data.serverId] = data.localId;
            });
            _this.socket.on('MISSED-CURVE', function (data) {
                var curve;
                for (var i = 0; i < self.curveOutBuffer.length; i++) {
                    if (self.curveOutBuffer[i].serverId == data.serverId) {
                        curve = self.curveOutBuffer[i].curveSet[data.num];
                    }
                }
                var msg = { serverId: data.serverId, num: data.num, x: curve.x, y: curve.y };
                self.socket.emit('POINT', msg);
            });
            _this.socket.on('DROPPED-CURVE', function (serverId) {
            });
            _this.socket.on('MOVE-CURVE', function (data) {
                var localId = self.curveDict[data.serverId];
                self.moveCurve(localId, data.x, data.y);
            });
            _this.socket.on('DELETE-CURVE', function (serverId) {
                var localId = self.curveDict[serverId];
                self.deleteElement(localId);
            });
            _this.socket.on('TEXTBOX', function (data) {
                if (!self.textInBuffer[data.serverId]) {
                    self.textInBuffer[data.serverId] = {
                        x: data.x, y: data.y, width: data.width, height: data.height, user: data.userId,
                        editLock: data.editLock, styles: [], size: data.size, justified: data.justified, editBuffer: []
                    };
                    var localId = self.addTextbox(data.x, data.y, data.width, data.height, data.size, data.justified, data.userId, data.editLock, data.serverId);
                    self.textDict[data.serverId] = localId;
                }
            });
            _this.socket.on('STYLENODE', function (data) {
                if (!self.textInBuffer[data.serverId]) {
                    console.log('STYLENODE: Unkown text, ID: ' + data.serverId);
                    console.log(data);
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    if (self.textInBuffer[data.serverId].editBuffer[data.userId]) {
                        if (self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId]) {
                            var buffer = self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId];
                            buffer.nodes.push(data);
                            if (buffer.nodes.length == buffer.num_nodes) {
                                self.completeEdit(data.serverId, data.userId, data.editId);
                            }
                        }
                        else {
                            console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.serverId);
                            self.socket.emit('UNKNOWN-EDIT', data.editId);
                        }
                    }
                    else {
                        console.log('WOAH BUDDY! User ID: ' + data.userId);
                    }
                }
            });
            _this.socket.on('TEXTID', function (data) {
                self.textDict[data.serverId] = data.localId;
                self.boardElems[data.localId].serverId = data.serverId;
            });
            _this.socket.on('LOCK-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (!localId) {
                }
                else {
                    self.setTextLock(localId, data.userId);
                }
            });
            _this.socket.on('LOCKID-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (!localId) {
                }
                else {
                    if (self.gettingLock != -1 && self.boardElems[self.gettingLock].serverId == data.serverId) {
                        self.setTextEdit(localId);
                    }
                    else {
                        var msg = { serverId: data.serverId };
                        self.socket.emit('RELEASE-TEXT', msg);
                    }
                }
            });
            _this.socket.on('EDITID-TEXT', function (data) {
                var buffer = self.textOutBuffer;
                if (data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent) {
                    buffer[data.bufferId].lastSent = data.localId;
                    for (var i = 0; i < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i++) {
                        buffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.editId;
                        var node = buffer[data.bufferId].editBuffer[data.localId].nodes[i];
                        var msg = {
                            editId: node.editId, num: node.num, start: node.start, end: node.end, text: node.text, weight: node.weight, style: node.style,
                            decoration: node.decoration, colour: node.colour
                        };
                        self.socket.emit('STYLENODE', msg);
                    }
                }
            });
            _this.socket.on('FAILED-TEXT', function (data) {
            });
            _this.socket.on('REFUSED-TEXT', function (data) {
            });
            _this.socket.on('RELEASE-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (!localId) {
                    console.log('Unknown text for release....');
                }
                else {
                    self.setTextUnLock(localId);
                }
            });
            _this.socket.on('EDIT-TEXT', function (data) {
                if (!self.textInBuffer[data.serverId]) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    if (!self.textInBuffer[data.serverId].editBuffer[data.userId]) {
                        self.textInBuffer[data.serverId].editBuffer[data.userId] = [];
                    }
                    self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId] = { num_nodes: data.num_nodes, nodes: [] };
                }
            });
            _this.socket.on('MOVE-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (!localId) {
                }
                else {
                    self.moveTextbox(localId, false, data.x, data.y);
                }
            });
            _this.socket.on('JUSTIFY-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (!localId) {
                }
                else {
                    self.setTextJustified(data.serverId, data.newState);
                }
            });
            _this.socket.on('RESIZE-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (!localId) {
                }
                else {
                    self.setTextArea(localId, data.width, data.height);
                }
            });
            _this.socket.on('DELETE-TEXT', function (serverId) {
                var localId = self.textDict[serverId];
                if (!localId) {
                }
                else {
                    self.deleteElement(localId);
                }
            });
            _this.socket.on('IGNORE-TEXT', function (serverId) {
            });
            _this.socket.on('DROPPED-TEXT', function (data) {
            });
            _this.socket.on('MISSED-TEXT', function (data) {
            });
            _this.socket.on('ERROR', function (message) {
                console.log('SERVER: ' + message);
            });
        };
        this.colourChange = function (newColour) {
            _this.setColour(newColour);
        };
        this.modeChange = function (newMode) {
            var whitElem = document.getElementById("whiteBoard-input");
            var context = whitElem.getContext('2d');
            context.clearRect(0, 0, whitElem.width, whitElem.height);
            _this.isWriting = false;
            if (_this.currTextEdit > -1) {
                var textBox = _this.getText(_this.currTextEdit);
                var lineCount = textBox.textNodes.length;
                if (lineCount == 0) {
                    lineCount = 1;
                }
                if (lineCount * 1.5 * textBox.size < textBox.height) {
                    _this.resizeText(_this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                }
                _this.releaseText(_this.currTextEdit);
            }
            else if (_this.gettingLock > -1) {
                _this.releaseText(_this.gettingLock);
            }
            _this.setMode(newMode);
        };
        this.boldChange = function (newState) {
            _this.setIsBold(newState);
        };
        this.italicChange = function (newState) {
            _this.setIsItalic(newState);
        };
        this.underlineChange = function (newState) {
            if (newState) {
                _this.setIsOline(false);
                _this.setIsTline(false);
            }
            _this.setIsUline(newState);
        };
        this.overlineChange = function (newState) {
            if (newState) {
                _this.setIsUline(false);
                _this.setIsTline(false);
            }
            _this.setIsOline(newState);
        };
        this.throughlineChange = function (newState) {
            if (newState) {
                _this.setIsOline(false);
                _this.setIsUline(false);
            }
            _this.setIsTline(newState);
        };
        this.justifiedChange = function (newState) {
            if (_this.currTextEdit != -1) {
                _this.setTextJustified(_this.currTextEdit, !_this.viewState.isJustified);
                _this.changeTextSelect(_this.currTextEdit, true);
                var textBox = _this.getText(_this.currTextEdit);
                if (textBox.serverId) {
                    var msg = { serverId: textBox.serverId, newState: !_this.viewState.isJustified };
                    _this.socket.emit('JUSTIFY-TEXT', msg);
                }
                else {
                }
            }
            _this.setJustified(newState);
        };
        this.curveMouseClick = function (id) {
            if (_this.viewState.mode == 2) {
                var curve = _this.boardElems[id];
                if (_this.isHost || _this.userId == curve.user) {
                    if (curve.serverId) {
                        _this.socket.emit('DELETE-CURVE', curve.serverId);
                    }
                    else {
                    }
                    _this.deleteElement(id);
                }
            }
        };
        this.curveMouseMove = function (id) {
            if (_this.viewState.mode == 2 && _this.lMousePress) {
                var curve = _this.boardElems[id];
                if (_this.isHost || _this.userId == curve.user) {
                    if (curve.serverId) {
                        _this.socket.emit('DELETE-CURVE', curve.serverId);
                    }
                    else {
                    }
                    _this.deleteElement(id);
                }
            }
        };
        this.curveMouseDown = function (id, e) {
            if (_this.viewState.mode == 3) {
                _this.currCurveMove = id;
                _this.startMove();
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
            }
        };
        this.textMouseClick = function (id) {
            if (_this.viewState.mode == 2) {
                var textBox = _this.boardElems[id];
                if (_this.isHost || _this.userId == textBox.user) {
                    if (textBox.serverId) {
                        _this.socket.emit('DELETE-TEXT', textBox.serverId);
                    }
                    else {
                    }
                    _this.deleteElement(id);
                }
            }
        };
        this.textMouseDblClick = function (id) {
            var textBox = _this.boardElems[id];
            if (_this.gettingLock != -1 && _this.gettingLock != id) {
                _this.releaseText(_this.gettingLock);
            }
            if (_this.currTextEdit != -1) {
                if (_this.currTextEdit != id) {
                    _this.releaseText(_this.currTextEdit);
                    var tbox = _this.getText(_this.currTextEdit);
                    var lineCount = tbox.textNodes.length;
                    if (lineCount == 0) {
                        lineCount = 1;
                    }
                    if (lineCount * 1.5 * tbox.size < tbox.height) {
                        _this.resizeText(_this.currTextEdit, tbox.width, lineCount * 1.5 * tbox.size);
                    }
                }
            }
            else {
                if (_this.isHost || _this.userId == textBox.user) {
                    _this.setTextGetLock(id);
                    if (textBox.serverId) {
                        var msg = { serverId: textBox.serverId };
                        _this.socket.emit('LOCK-TEXT', msg);
                    }
                    else {
                    }
                }
            }
        };
        this.textMouseMoveDown = function (id, e) {
            _this.currTextMove = id;
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
            _this.startMove();
        };
        this.textMouseResizeDown = function (id, vert, horz, e) {
            _this.currTextResize = id;
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
            _this.vertResize = vert;
            _this.horzResize = horz;
            _this.startMove();
        };
        this.textMouseMove = function (id) {
            if (_this.viewState.mode == 2 && _this.lMousePress) {
                var textBox = _this.boardElems[id];
                if (_this.isHost || _this.userId == textBox.user) {
                    if (textBox.serverId) {
                        _this.socket.emit('DELETE-TEXT', textBox.serverId);
                    }
                    else {
                    }
                    _this.deleteElement(id);
                }
            }
        };
        this.mouseUp = function (e) {
            if (_this.lMousePress && !_this.wMousePress) {
                if (_this.viewState.mode == 0) {
                    var whitElem = document.getElementById("whiteBoard-input");
                    var context = whitElem.getContext('2d');
                    context.clearRect(0, 0, whitElem.width, whitElem.height);
                    if (_this.isPoint) {
                        var elemRect = whitElem.getBoundingClientRect();
                        var offsetY = elemRect.top - document.body.scrollTop;
                        var offsetX = elemRect.left - document.body.scrollLeft;
                    }
                    _this.drawCurve(_this.pointList, _this.scaleF, _this.viewState.colour, _this.scaleF, _this.panX, _this.panY);
                }
                else if (_this.viewState.mode == 1) {
                    if (!_this.isWriting) {
                        var rectLeft;
                        var rectTop;
                        var rectWidth;
                        var rectHeight;
                        var whitElem = document.getElementById("whiteBoard-input");
                        var context = whitElem.getContext('2d');
                        var elemRect = whitElem.getBoundingClientRect();
                        var offsetY = elemRect.top - document.body.scrollTop;
                        var offsetX = elemRect.left - document.body.scrollLeft;
                        var newPoint = { x: 0, y: 0 };
                        context.clearRect(0, 0, whitElem.width, whitElem.height);
                        newPoint.x = Math.round(e.clientX - offsetX);
                        newPoint.y = Math.round(e.clientY - offsetY);
                        if (newPoint.x > _this.downPoint.x) {
                            rectLeft = _this.downPoint.x;
                            rectWidth = newPoint.x - _this.downPoint.x;
                        }
                        else {
                            rectLeft = newPoint.x;
                            rectWidth = _this.downPoint.x - newPoint.x;
                        }
                        if (newPoint.y > _this.downPoint.y) {
                            rectTop = _this.downPoint.y;
                            rectHeight = newPoint.y - _this.downPoint.y;
                        }
                        else {
                            rectTop = newPoint.y;
                            rectHeight = _this.downPoint.y - newPoint.y;
                        }
                        if (rectWidth > 10 && rectHeight > 10) {
                            var x = rectLeft * _this.scaleF + _this.panX;
                            var y = rectTop * _this.scaleF + _this.panY;
                            var width = rectWidth * _this.scaleF;
                            var height = rectHeight * _this.scaleF;
                            _this.isWriting = true;
                            _this.cursorStart = 0;
                            _this.cursorEnd = 0;
                            var localId = _this.addTextbox(x, y, width, height, _this.scaleF * 20, _this.viewState.isJustified, _this.userId, _this.userId);
                            _this.setTextEdit(localId);
                        }
                    }
                    else if (_this.rMousePress) {
                        _this.isWriting = false;
                        if (_this.currTextEdit > -1) {
                            var textBox = _this.getText(_this.currTextEdit);
                            var lineCount = textBox.textNodes.length;
                            if (lineCount == 0) {
                                lineCount = 1;
                            }
                            if (lineCount * 1.5 * textBox.size < textBox.height) {
                                _this.resizeText(_this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                            }
                            _this.releaseText(_this.currTextEdit);
                        }
                        else if (_this.gettingLock > -1) {
                            _this.releaseText(_this.gettingLock);
                        }
                        context.clearRect(0, 0, whitElem.width, whitElem.height);
                    }
                }
            }
            if (_this.curveMoved) {
                var serverId = _this.boardElems[_this.currCurveMove].serverId;
                var changeX = _this.curveChangeX;
                var changeY = _this.curveChangeY;
                _this.curveMoved = false;
                if (serverId) {
                    var msg = { serverId: serverId, x: changeX, y: changeY };
                    _this.socket.emit('MOVE-CURVE', msg);
                }
                else {
                }
            }
            else if (_this.textMoved) {
                _this.textMoved = false;
                var tbox = _this.getText(_this.currTextMove);
                var serverId = tbox.serverId;
                var newX = tbox.x;
                var newY = tbox.y;
                if (serverId) {
                    var msg_1 = { serverId: serverId, x: newX, y: newY };
                    _this.socket.emit('MOVE-TEXT', msg_1);
                }
                else {
                }
            }
            else if (_this.textResized) {
                _this.textResized = false;
                var tbox = _this.getText(_this.currTextResize);
                var serverId = tbox.serverId;
                var newWidth = tbox.width;
                var newHeight = tbox.height;
                if (serverId) {
                    var msg_2 = { serverId: serverId, width: newWidth, height: newHeight };
                    _this.socket.emit('RESIZE-TEXT', msg_2);
                }
                else {
                }
            }
            _this.curveChangeX = 0;
            _this.curveChangeY = 0;
            _this.lMousePress = false;
            _this.wMousePress = false;
            _this.rMousePress = false;
            _this.pointList = [];
            _this.moving = false;
            _this.endMove();
        };
        this.touchUp = function () {
            _this.touchPress = false;
        };
        this.mouseDown = function (e) {
            if (!_this.lMousePress && !_this.wMousePress && !_this.rMousePress) {
                _this.lMousePress = e.buttons & 1 ? true : false;
                _this.rMousePress = e.buttons & 2 ? true : false;
                _this.wMousePress = e.buttons & 4 ? true : false;
                _this.isPoint = true;
                var whitElem = document.getElementById("whiteBoard-input");
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY = elemRect.top - document.body.scrollTop;
                var offsetX = elemRect.left - document.body.scrollLeft;
                whitElem.width = whitElem.clientWidth;
                whitElem.height = whitElem.clientHeight;
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
                var newPoint = { x: 0, y: 0 };
                _this.pointList = [];
                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);
                _this.pointList[_this.pointList.length] = newPoint;
                _this.downPoint = { x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY) };
                if (e.buttons == 1 && !_this.viewState.itemMoving) {
                    if (_this.currTextEdit > -1) {
                        var textBox = _this.getText(_this.currTextEdit);
                        _this.cursorStart = _this.findTextPos(textBox, (e.clientX - offsetX) * _this.scaleF + _this.panX, (e.clientY - offsetY) * _this.scaleF + _this.panY);
                        _this.cursorEnd = _this.cursorStart;
                        _this.textDown = _this.cursorStart;
                        _this.changeTextSelect(_this.currTextEdit, true);
                    }
                }
            }
        };
        this.touchDown = function () {
            _this.touchPress = true;
        };
        this.mouseMove = function (e) {
            if (_this.wMousePress) {
                var whitElem = document.getElementById("whiteBoard-input");
                var newPanX = _this.panX + (_this.prevX - e.clientX) * _this.scaleF;
                var newPanY = _this.panY + (_this.prevY - e.clientY) * _this.scaleF;
                var vBoxW = whitElem.clientWidth * _this.scaleF;
                var vBoxH = whitElem.clientHeight * _this.scaleF;
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
                if (newPanX < 0) {
                    newPanX = 0;
                }
                if (newPanY < 0) {
                    newPanY = 0;
                }
                _this.panX = newPanX;
                _this.panY = newPanY;
                var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;
                _this.setViewBox(newVBox);
            }
            else if (_this.lMousePress) {
                var whitElem = document.getElementById("whiteBoard-input");
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY = elemRect.top - document.body.scrollTop;
                var offsetX = elemRect.left - document.body.scrollLeft;
                var context = whitElem.getContext('2d');
                var newPoint = { x: 0, y: 0 };
                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);
                if (_this.viewState.mode == 0) {
                    if (_this.pointList.length) {
                        if (Math.round(_this.pointList[_this.pointList.length - 1].x - newPoint.x) < _this.scaleF || Math.round(_this.pointList[_this.pointList.length - 1].y - newPoint.y)) {
                            _this.isPoint = false;
                            context.beginPath();
                            context.strokeStyle = _this.viewState.colour;
                            context.moveTo(_this.pointList[_this.pointList.length - 1].x, _this.pointList[_this.pointList.length - 1].y);
                            context.lineTo(newPoint.x, newPoint.y);
                            context.stroke();
                            _this.pointList[_this.pointList.length] = newPoint;
                        }
                    }
                    else {
                        _this.pointList[_this.pointList.length] = newPoint;
                    }
                }
                else if (_this.viewState.mode == 1 && !_this.rMousePress) {
                    if (_this.currTextResize != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        var tbox = _this.getText(_this.currTextResize);
                        var newWidth = _this.horzResize ? tbox.width + changeX : tbox.width;
                        var newHeight = _this.vertResize ? tbox.height + changeY : tbox.height;
                        _this.resizeText(_this.currTextResize, newWidth, newHeight);
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.textResized = true;
                    }
                    else if (_this.currTextMove != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        _this.moveTextbox(_this.currTextMove, true, changeX, changeY);
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.textMoved = true;
                    }
                    else if (_this.currTextSel != -1) {
                        var textBox = _this.getText(_this.currTextEdit);
                        var newLoc = _this.findTextPos(textBox, (e.clientX - offsetX) * _this.scaleF + _this.panX, (e.clientY - offsetY) * _this.scaleF + _this.panY);
                        if (_this.textDown < newLoc) {
                            _this.cursorStart = _this.textDown;
                            _this.cursorEnd = newLoc;
                            _this.startLeft = true;
                        }
                        else {
                            _this.cursorStart = newLoc;
                            _this.cursorEnd = _this.textDown;
                            _this.startLeft = false;
                        }
                        _this.changeTextSelect(_this.currTextSel, true);
                    }
                    else {
                        var rectLeft;
                        var rectTop;
                        var rectWidth;
                        var rectHeight;
                        if (newPoint.x > _this.downPoint.x) {
                            rectLeft = _this.downPoint.x;
                            rectWidth = newPoint.x - _this.downPoint.x;
                        }
                        else {
                            rectLeft = newPoint.x;
                            rectWidth = _this.downPoint.x - newPoint.x;
                        }
                        if (newPoint.y > _this.downPoint.y) {
                            rectTop = _this.downPoint.y;
                            rectHeight = newPoint.y - _this.downPoint.y;
                        }
                        else {
                            rectTop = newPoint.y;
                            rectHeight = _this.downPoint.y - newPoint.y;
                        }
                        context.clearRect(0, 0, whitElem.width, whitElem.height);
                        if (rectWidth > 0 && rectHeight > 0) {
                            context.beginPath();
                            context.strokeStyle = 'black';
                            context.setLineDash([5]);
                            context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
                            context.stroke();
                        }
                    }
                }
                else if (_this.viewState.mode == 3) {
                    if (_this.currCurveMove != -1) {
                        _this.moveCurve(_this.currCurveMove, (e.clientX - _this.prevX) * _this.scaleF, (e.clientY - _this.prevY) * _this.scaleF);
                        _this.curveChangeX += (e.clientX - _this.prevX) * _this.scaleF;
                        _this.curveChangeY += (e.clientY - _this.prevY) * _this.scaleF;
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.curveMoved = true;
                    }
                    else if (_this.currTextMove != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        _this.moveTextbox(_this.currTextMove, true, changeX, changeY);
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.textMoved = true;
                    }
                }
            }
        };
        this.touchMove = function (e) {
            if (_this.touchPress) {
            }
        };
        this.windowResize = function (e) {
            var whitElem = document.getElementById("whiteBoard-input");
            var whitCont = document.getElementById("whiteboard-container");
            whitElem.style.width = whitCont.clientWidth + "px";
            whitElem.style.height = whitCont.clientHeight + "px";
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            var vBoxW = whitElem.clientWidth * _this.scaleF;
            var vBoxH = whitElem.clientHeight * _this.scaleF;
            var newPanX = _this.panX;
            var newPanY = _this.panY;
            var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;
            _this.setViewBox(newVBox);
        };
        this.mouseWheel = function (e) {
            var whitElem = document.getElementById("whiteBoard-input");
            var newPanX;
            var newPanY;
            var newScale;
            _this.scaleNum = _this.scaleNum - e.deltaY / 2;
            if (_this.scaleNum < -5) {
                _this.scaleNum = -5;
            }
            if (_this.scaleNum > 5) {
                _this.scaleNum = 5;
            }
            newScale = Math.pow(0.8, _this.scaleNum);
            var vBoxW = whitElem.clientWidth * newScale;
            var vBoxH = whitElem.clientHeight * newScale;
            if (e.deltaY < 0) {
                newPanX = _this.panX + (e.clientX - whitElem.offsetLeft) * _this.scaleF - vBoxW / 2;
                newPanY = _this.panY + (e.clientY - whitElem.offsetTop) * _this.scaleF - vBoxH / 2;
            }
            else {
                newPanX = _this.panX + 0.5 * whitElem.clientWidth * (_this.scaleF - newScale);
                newPanY = _this.panY + 0.5 * whitElem.clientHeight * (_this.scaleF - newScale);
            }
            _this.scaleF = newScale;
            if (newPanX < 0) {
                newPanX = 0;
            }
            if (newPanY < 0) {
                newPanY = 0;
            }
            _this.panX = newPanX;
            _this.panY = newPanY;
            var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;
            _this.setViewBox(newVBox);
        };
        this.keyDown = function (e) {
            if (_this.isWriting) {
                var inputChar = e.key;
            }
        };
        this.keyUp = function (e) {
        };
        this.keyPress = function (e) {
            if (_this.isWriting) {
                e.preventDefault();
                e.stopPropagation();
                var inputChar = e.key;
                var textItem;
                var i;
                var line;
                var style;
                switch (inputChar) {
                    case 'ArrowLeft':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart = _this.cursorStart;
                        var newEnd = _this.cursorEnd;
                        if (_this.cursorStart == _this.cursorEnd || !_this.startLeft) {
                            if (_this.cursorStart > 0) {
                                if (e.ctrlKey) {
                                    i = _this.cursorStart > 0 ? _this.cursorStart - 1 : 0;
                                    while (i > 0 && !textItem.text.charAt(i - 1).match(/\s/)) {
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
                                i = _this.cursorEnd > 0 ? _this.cursorEnd - 1 : 0;
                                while (i > 0 && !textItem.text.charAt(i - 1).match(/\s/)) {
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
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = false;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newStart > newEnd) {
                                _this.startLeft = false;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            _this.cursorStart = _this.cursorStart == _this.cursorEnd || !_this.startLeft ? newStart : newEnd;
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, true);
                        break;
                    case 'ArrowRight':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart = _this.cursorStart;
                        var newEnd = _this.cursorEnd;
                        if (_this.cursorStart == _this.cursorEnd || _this.startLeft) {
                            if (_this.cursorEnd < textItem.text.length) {
                                if (e.ctrlKey) {
                                    i = _this.cursorEnd + 1;
                                    while (i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/))) {
                                        i++;
                                    }
                                    newEnd = i;
                                }
                                else {
                                    if (newEnd < textItem.text.length) {
                                        newEnd++;
                                    }
                                }
                            }
                        }
                        else {
                            if (e.ctrlKey) {
                                i = _this.cursorStart < textItem.text.length ? _this.cursorStart + 1 : textItem.text.length;
                                while (i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/))) {
                                    i++;
                                }
                                newStart = i;
                            }
                            else {
                                if (newStart < textItem.text.length) {
                                    newStart++;
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = true;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newStart > newEnd) {
                                _this.startLeft = true;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            _this.cursorStart = _this.cursorStart == _this.cursorEnd || _this.startLeft ? newEnd : newStart;
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, true);
                        break;
                    case 'ArrowUp':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart;
                        var newEnd;
                        if (e.ctrlKey) {
                            if (_this.startLeft && _this.cursorStart != _this.cursorEnd) {
                                i = _this.cursorEnd - 1;
                                while (i > 0 && !textItem.text.charAt(i - 1).match('\n')) {
                                    i--;
                                }
                                if (i < 0) {
                                    i = 0;
                                }
                                newStart = _this.cursorStart;
                                newEnd = i;
                            }
                            else {
                                i = _this.cursorStart - 1;
                                while (i > 0 && !textItem.text.charAt(i - 1).match('\n')) {
                                    i--;
                                }
                                if (i < 0) {
                                    i = 0;
                                }
                                newStart = i;
                                newEnd = _this.cursorEnd;
                            }
                        }
                        else {
                            if (_this.startLeft && _this.cursorStart != _this.cursorEnd) {
                                newStart = _this.cursorStart;
                                if (_this.cursorEnd <= textItem.textNodes[0].end) {
                                    newEnd = _this.cursorEnd;
                                }
                                else {
                                    i = 1;
                                    while (i < textItem.textNodes.length && _this.cursorEnd > textItem.textNodes[i].end) {
                                        i++;
                                    }
                                    line = textItem.textNodes[i - 1];
                                    i = 0;
                                    while (i < line.styles.length && _this.textIdealX >= line.styles[i].startPos) {
                                        i++;
                                    }
                                    var curr = i - 1;
                                    style = line.styles[i - 1];
                                    var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                                    i = style.text.length - 1;
                                    while (i > 0 && style.startPos + currMes > _this.textIdealX) {
                                        i--;
                                        currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                                    }
                                    if (i < style.text.length - 1) {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newEnd = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newEnd = line.start + style.locStart + i;
                                        }
                                    }
                                    else if (curr + 1 < line.styles.length) {
                                        if (_this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - _this.textIdealX) {
                                            newEnd = line.start + line.styles[curr + 1].locStart;
                                        }
                                        else {
                                            newEnd = line.start + style.locStart + i;
                                        }
                                    }
                                    else {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newEnd = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newEnd = line.start + style.locStart + i;
                                        }
                                    }
                                }
                            }
                            else {
                                newEnd = _this.cursorEnd;
                                if (_this.cursorStart <= textItem.textNodes[0].end) {
                                    newStart = _this.cursorStart;
                                }
                                else {
                                    i = 1;
                                    while (i < textItem.textNodes.length && _this.cursorStart > textItem.textNodes[i].end) {
                                        i++;
                                    }
                                    line = textItem.textNodes[i - 1];
                                    i = 0;
                                    while (i < line.styles.length && _this.textIdealX >= line.styles[i].startPos) {
                                        i++;
                                    }
                                    var curr = i - 1;
                                    style = line.styles[i - 1];
                                    var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                                    i = style.text.length - 1;
                                    while (i > 0 && style.startPos + currMes > _this.textIdealX) {
                                        i--;
                                        currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                                    }
                                    if (i < style.text.length - 1) {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newStart = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newStart = line.start + style.locStart + i;
                                        }
                                    }
                                    else if (curr + 1 < line.styles.length) {
                                        if (_this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - _this.textIdealX) {
                                            newStart = line.start + line.styles[curr + 1].locStart;
                                        }
                                        else {
                                            newStart = line.start + style.locStart + i;
                                        }
                                    }
                                    else {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newStart = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newStart = line.start + style.locStart + i;
                                        }
                                    }
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = false;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newEnd < newStart) {
                                _this.startLeft = false;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            if (_this.startLeft && _this.cursorStart != _this.cursorEnd) {
                                _this.cursorStart = newEnd;
                            }
                            else {
                                _this.cursorStart = newStart;
                            }
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, false);
                        break;
                    case 'ArrowDown':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart;
                        var newEnd;
                        if (e.ctrlKey) {
                            if (_this.startLeft || _this.cursorStart == _this.cursorEnd) {
                                i = _this.cursorEnd + 1;
                                while (i < textItem.text.length && !textItem.text.charAt(i).match('\n')) {
                                    i++;
                                }
                                newStart = _this.cursorStart;
                                newEnd = i;
                            }
                            else {
                                i = _this.cursorStart + 1;
                                while (i < textItem.text.length && !textItem.text.charAt(i).match('\n')) {
                                    i++;
                                }
                                newStart = i;
                                newEnd = _this.cursorEnd;
                            }
                        }
                        else {
                            if (_this.startLeft || _this.cursorStart == _this.cursorEnd) {
                                newStart = _this.cursorStart;
                                if (_this.cursorEnd >= textItem.textNodes[textItem.textNodes.length - 1].start) {
                                    newEnd = _this.cursorEnd;
                                }
                                else {
                                    i = 0;
                                    while (i < textItem.textNodes.length - 1 && _this.cursorEnd > textItem.textNodes[i].end) {
                                        i++;
                                    }
                                    line = textItem.textNodes[i + 1];
                                    i = 0;
                                    while (i < line.styles.length && _this.textIdealX >= line.styles[i].startPos) {
                                        i++;
                                    }
                                    var curr = i - 1;
                                    style = line.styles[i - 1];
                                    var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                                    i = style.text.length - 1;
                                    while (i > 0 && style.startPos + currMes > _this.textIdealX) {
                                        i--;
                                        currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                                    }
                                    if (i < style.text.length - 1) {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newEnd = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newEnd = line.start + style.locStart + i;
                                        }
                                    }
                                    else if (curr + 1 < line.styles.length) {
                                        if (_this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - _this.textIdealX) {
                                            newEnd = line.start + line.styles[curr + 1].locStart;
                                        }
                                        else {
                                            newEnd = line.start + style.locStart + i;
                                        }
                                    }
                                    else {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newEnd = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newEnd = line.start + style.locStart + i;
                                        }
                                    }
                                }
                            }
                            else {
                                newEnd = _this.cursorEnd;
                                if (_this.cursorStart >= textItem.textNodes[textItem.textNodes.length - 1].start) {
                                    newStart = _this.cursorStart;
                                }
                                else {
                                    i = 0;
                                    while (i < textItem.textNodes.length - 1 && _this.cursorStart > textItem.textNodes[i].end) {
                                        i++;
                                    }
                                    line = textItem.textNodes[i + 1];
                                    i = 0;
                                    while (i < line.styles.length && _this.textIdealX >= line.styles[i].startPos) {
                                        i++;
                                    }
                                    var curr = i - 1;
                                    style = line.styles[i - 1];
                                    var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                                    i = style.text.length - 1;
                                    while (i > 0 && style.startPos + currMes > _this.textIdealX) {
                                        i--;
                                        currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                                    }
                                    if (i < style.text.length - 1) {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newStart = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newStart = line.start + style.locStart + i;
                                        }
                                    }
                                    else if (curr + 1 < line.styles.length) {
                                        if (_this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - _this.textIdealX) {
                                            newStart = line.start + line.styles[curr + 1].locStart;
                                        }
                                        else {
                                            newStart = line.start + style.locStart + i;
                                        }
                                    }
                                    else {
                                        if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                                            newStart = line.start + style.locStart + i + 1;
                                        }
                                        else {
                                            newStart = line.start + style.locStart + i;
                                        }
                                    }
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = true;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newEnd < newStart) {
                                _this.startLeft = true;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            if (_this.startLeft || _this.cursorStart == _this.cursorEnd) {
                                _this.cursorStart = newEnd;
                            }
                            else {
                                _this.cursorStart = newStart;
                            }
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, false);
                        break;
                    case 'Backspace':
                        textItem = _this.getText(_this.currTextEdit);
                        if (_this.cursorEnd > 0) {
                            if (e.ctrlKey) {
                                if (_this.cursorStart > 0) {
                                }
                            }
                            else {
                                if (_this.cursorStart == _this.cursorEnd) {
                                    _this.cursorStart--;
                                }
                                var prevEnd = _this.cursorEnd;
                                var startText = textItem.text.slice(0, _this.cursorStart);
                                var endText = textItem.text.slice(_this.cursorEnd, textItem.text.length);
                                var fullText = startText + endText;
                                var styles = [];
                                for (i = 0; i < textItem.styles.length; i++) {
                                    var sty = textItem.styles[i];
                                    if (sty.start >= _this.cursorStart) {
                                        if (sty.start >= _this.cursorEnd) {
                                            if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                                                && styles[styles.length - 1].decoration == sty.decoration
                                                && styles[styles.length - 1].weight == sty.weight
                                                && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= 200) {
                                                styles[styles.length - 1].end += sty.end - sty.start;
                                                styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                                            }
                                            else {
                                                sty.start -= _this.cursorEnd - _this.cursorStart;
                                                sty.end -= _this.cursorEnd - _this.cursorStart;
                                                sty.text = fullText.slice(sty.start, sty.end);
                                                styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                                            }
                                        }
                                        else {
                                            if (sty.end > _this.cursorEnd) {
                                                if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                                                    && styles[styles.length - 1].decoration == sty.decoration
                                                    && styles[styles.length - 1].weight == sty.weight
                                                    && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - _this.cursorEnd <= 200) {
                                                    styles[styles.length - 1].end += sty.end - _this.cursorEnd;
                                                    styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                                                }
                                                else {
                                                    sty.end += _this.cursorStart - _this.cursorEnd;
                                                    sty.start = _this.cursorStart;
                                                    sty.text = fullText.slice(sty.start, sty.end);
                                                    styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        if (sty.end > _this.cursorStart) {
                                            if (sty.end > _this.cursorEnd) {
                                                sty.end -= _this.cursorEnd - _this.cursorStart;
                                                sty.text = fullText.slice(sty.start, sty.end);
                                                styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                                            }
                                            else {
                                                sty.end = _this.cursorStart;
                                                sty.text = fullText.slice(sty.start, sty.end);
                                                styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                                            }
                                        }
                                        else {
                                            sty.text = fullText.slice(sty.start, sty.end);
                                            styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                                        }
                                    }
                                }
                                textItem.styles = styles;
                                textItem.text = fullText;
                            }
                            _this.cursorEnd = _this.cursorStart;
                            textItem = _this.newEdit(textItem);
                            if (_this.cursorEnd > 0) {
                                _this.calculateLengths(textItem, _this.cursorEnd - 1, _this.cursorEnd, prevEnd);
                            }
                            else if (textItem.text.length > 0) {
                                _this.calculateLengths(textItem, _this.cursorEnd, _this.cursorEnd + 1, prevEnd + 1);
                            }
                            textItem.textNodes = _this.calculateTextLines(textItem);
                        }
                        _this.updateText(_this.currTextEdit, textItem);
                        break;
                    case 'Enter':
                        inputChar = '\n';
                    default:
                        textItem = _this.getText(_this.currTextEdit);
                        if (e.ctrlKey) {
                        }
                        else {
                            var isNew = true;
                            var extend = -1;
                            var prevEnd = _this.cursorEnd;
                            var textStart = textItem.text.slice(0, _this.cursorStart);
                            var textEnd = textItem.text.slice(_this.cursorEnd, textItem.text.length);
                            var styles = [];
                            for (var i = 0; i < textItem.styles.length; i++) {
                                var sty = textItem.styles[i];
                                styles[i] = { start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text };
                            }
                            textItem.text = textStart + inputChar + textEnd;
                            for (var i = 0; i < styles.length; i++) {
                                if (styles[i].end > _this.cursorStart) {
                                    if (styles[i].start >= _this.cursorEnd) {
                                        if (styles[i].start == _this.cursorEnd && _this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + 1) <= 200) {
                                            isNew = false;
                                            styles[i].start += (_this.cursorStart - _this.cursorEnd);
                                        }
                                        else {
                                            styles[i].start += (_this.cursorStart - _this.cursorEnd) + 1;
                                        }
                                        styles[i].end += (_this.cursorStart - _this.cursorEnd) + 1;
                                    }
                                    else if (styles[i].start >= _this.cursorStart) {
                                        if (styles[i].end > _this.cursorEnd) {
                                            styles[i].start = _this.cursorStart + 1;
                                            styles[i].end += (_this.cursorStart - _this.cursorEnd) + 1;
                                            if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + 1) <= 200) {
                                                isNew = false;
                                                styles[i].start--;
                                            }
                                        }
                                        else {
                                            if (_this.isCurrentStyle(styles[i]) && isNew) {
                                                isNew = false;
                                                styles[i].start = _this.cursorStart;
                                                styles[i].end = _this.cursorStart + 1;
                                            }
                                            else {
                                                styles.splice(i, 1);
                                                i--;
                                            }
                                        }
                                    }
                                    else {
                                        if (styles[i].end >= _this.cursorEnd) {
                                            if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - (_this.cursorEnd - _this.cursorStart) - styles[i].start + 1) <= 200) {
                                                isNew = false;
                                                styles[i].end += (_this.cursorStart - _this.cursorEnd) + 1;
                                            }
                                            else {
                                                var newSplit = {
                                                    start: _this.cursorStart + 1, end: styles[i].end - (_this.cursorEnd - _this.cursorStart) + 1, decoration: styles[i].decoration,
                                                    weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour
                                                };
                                                styles[i].end = _this.cursorStart;
                                                styles.splice(i + 1, 0, newSplit);
                                                i++;
                                            }
                                        }
                                        else {
                                            if (_this.isCurrentStyle(styles[i]) && isNew && (_this.cursorStart - styles[i].start + 1) <= 200) {
                                                isNew = false;
                                                styles[i].end = _this.cursorStart + 1;
                                            }
                                            else {
                                                styles[i].end = _this.cursorStart;
                                            }
                                        }
                                    }
                                }
                                else if (styles[i].end == _this.cursorStart) {
                                    if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + 1) <= 200) {
                                        isNew = false;
                                        styles[i].end = _this.cursorStart + 1;
                                    }
                                }
                                styles[i].text = textItem.text.slice(styles[i].start, styles[i].end);
                            }
                            if (isNew) {
                                i = 0;
                                while (i < styles.length && styles[i].end < _this.cursorStart) {
                                    i++;
                                }
                                var newStyle = {
                                    start: _this.cursorStart, end: _this.cursorStart + 1, decoration: _this.getDecoration(),
                                    weight: _this.getWeight(), style: _this.getStyle(), colour: _this.viewState.colour,
                                    text: textItem.text.slice(_this.cursorStart, _this.cursorStart + 1)
                                };
                                styles.splice(i + 1, 0, newStyle);
                            }
                            _this.cursorStart++;
                            _this.cursorEnd = _this.cursorStart;
                            textItem.styles = styles;
                            textItem = _this.newEdit(textItem);
                            _this.calculateLengths(textItem, _this.cursorEnd - 1, _this.cursorEnd, prevEnd);
                            _this.updateText(_this.currTextEdit, textItem);
                        }
                        break;
                }
            }
        };
        this.isHost = isHost;
        this.userId = userId;
        var dispatcher = {
            curveMouseDown: this.curveMouseDown,
            curveMouseClick: this.curveMouseClick,
            curveMouseMove: this.curveMouseMove,
            textMouseClick: this.textMouseClick,
            textMouseDblClick: this.textMouseDblClick,
            textMouseMove: this.textMouseMove,
            textMouseMoveDown: this.textMouseMoveDown,
            textMouseResizeDown: this.textMouseResizeDown,
            colourChange: this.colourChange,
            modeChange: this.modeChange,
            boldChange: this.boldChange,
            italicChange: this.italicChange,
            underlineChange: this.underlineChange,
            overlineChange: this.overlineChange,
            throughlineChange: this.throughlineChange,
            justifiedChange: this.justifiedChange,
            mouseDown: this.mouseDown,
            mouseWheel: this.mouseWheel,
            mouseMove: this.mouseMove,
            mouseUp: this.mouseUp
        };
        this.viewState = {
            viewBox: '0 0 0 0',
            mode: 0,
            colour: 'black',
            isBold: false,
            isItalic: false,
            isOLine: false,
            isULine: false,
            isTLine: false,
            isJustified: true,
            itemMoving: false,
            boardElements: Immutable.List(),
            dispatcher: dispatcher
        };
    }
    return WhiteBoardController;
}());
