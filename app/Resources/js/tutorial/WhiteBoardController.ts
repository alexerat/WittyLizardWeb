/// <reference path="./WhiteBoardView.ts"/>

declare var io : {
    connect(url: string): Socket;
}
interface Socket {
    on(event: string, callback: (data: any) => void );
    emit(event: string, data: any);
}
interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

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

interface WhiteBoardDispatcher
{
    curveMouseDown: (id: number, e: MouseEvent) => void;
    curveMouseClick: (id: number) => void;
    curveMouseMove: (id: number) => void;
    textMouseClick: (id: number) => void;
    textMouseDblClick: (id: number) => void;
    textMouseMove: (id: number) => void;
    textMouseMoveDown: (id: number, e: MouseEvent) => void;
    textMouseResizeDown: (id: number, vert: boolean, horz: boolean, e: MouseEvent) => void;
    colourChange: (newColour: string) => void;
    modeChange: (newMode: number) => void;
    boldChange: (newState: boolean) => void;
    italicChange: (newState: boolean) => void;
    underlineChange:  (newState: boolean) => void;
    overlineChange:  (newState: boolean) => void;
    throughlineChange:  (newState: boolean) => void;
    justifiedChange: (newState: boolean) => void;
    mouseDown: (e: MouseEvent) => void;
    mouseWheel: (e: MouseEvent) => void;
    mouseMove: (e: MouseEvent) => void;
    mouseUp: (e: MouseEvent) => void;
}

/***************************************************************************************************************************************************************
 *
 *
 *
 * START OF CLASS
 *
 *
 *
 **************************************************************************************************************************************************************/
class WhiteBoardController
{
    view;
    viewState: WhiteBoardViewState;

    isHost: boolean = false;
    userId: number = 0;
    socket: Socket = null;

    lMousePress: boolean = false;
    wMousePress: boolean = false;
    rMousePress: boolean = false;
    touchPress: boolean = false;
    moving: boolean = false;

    scaleF: number = 1;
    panX: number = 0;
    panY: number = 0;
    scaleNum: number = 0;

    pointList: Array<Point> = [];
    isPoint: boolean = true;
    prevX: number = 0;
    prevY: number = 0;
    downPoint: Point;
    curveChangeX: number = 0;
    curveChangeY: number = 0;

    currTextEdit: number = -1;
    currTextSel: number = -1;
    currTextMove: number = -1;
    currTextResize: number = -1;
    currCurveMove: number = -1;
    vertResize: boolean = false;
    horzResize: boolean = false;
    cursorStart: number = 0;
    cursorEnd: number = 0;
    startLeft: boolean = false;
    textDown: number = 0;
    textIdealX: number = 0;
    gettingLock: number = -1;
    curveMoved: boolean = false;
    textMoved: boolean = false;
    textResized: boolean = false;
    isWriting: boolean = false;
    editTimer: number;

    textDict: Array<number> = [];
    curveDict: Array<number>  = [];
    boardElems: Array<BoardElement> = [];

    curveOutBuffer: Array<CurveOutBufferElement> = [];
    curveInBuffer: Array<CurveInBufferElement> = [];
    curveInTimeouts = [];
    curveOutTimeouts = [];
    textOutBuffer: Array<TextOutBufferElement> = [];
    textInBuffer: Array<TextInBufferElement> = [];

    constructor(isHost: boolean, userId: number)
    {
        this.isHost = isHost;
        this.userId = userId;

        var dispatcher: WhiteBoardDispatcher = {
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
            boardElements: Immutable.List<DisplayElement>(),
            dispatcher: dispatcher
        };
    }

    setView = (view) =>
    {
        var whitElem  = document.getElementById('whiteBoard-input') as HTMLCanvasElement;
        var whitCont  = document.getElementById('whiteboard-container');

        whitElem.style.width = whitCont.clientWidth + 'px';
        whitElem.style.height = whitCont.clientHeight + 'px';
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;
        window.addEventListener('resize', this.windowResize);
        document.addEventListener('keypress', this.keyPress);
        //document.addEventListener('keydown', function (e) { if (e.keyCode == 8 && e.target == document.body) { e.preventDefault(); }});

        var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;

        this.viewState.viewBox = newVBox;

        this.view = view;
        view.setState(this.viewState);
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * STATE MODIFIERS (INTERNAL)
     *
     *
     *
     **********************************************************************************************************************************************************/
    updateView = (viewState: WhiteBoardViewState) : void =>
    {
        this.viewState = viewState;
        this.view.storeUpdate(this.viewState);
    }

    getStyle = () : string =>
    {
        return this.viewState.isItalic ? 'italic' : 'normal';
    }

    getWeight = () : string =>
    {
        return this.viewState.isBold ? 'bold' : 'normal';
    }

    getDecoration = () : string =>
    {
        if(this.viewState.isOLine)
        {
            return 'overline'
        }
        else if(this.viewState.isTLine)
        {
            return 'line-through'
        }
        else if(this.viewState.isULine)
        {
            return 'underline'
        }
        else
        {
            return 'none'
        }
    }

    getCurve = (id: number) : Curve =>
    {
        if(this.boardElems[id].type == 'curve')
        {
            return this.boardElems[id] as Curve;
        }
        else
        {
            throw 'Element is not of curve type';
        }
    }

    getText = (id: number) : WhiteBoardText =>
    {
        if(this.boardElems[id].type == 'text')
        {
            return this.boardElems[id] as WhiteBoardText;
        }
        else
        {
            console.log('Type was: ' + this.boardElems[id].type);
            throw 'Element is not of text type';
        }
    }

    getViewElement = (id: number) : DisplayElement =>
    {
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        return this.viewState.boardElements.get(viewIndex);
    }

    deleteElement = (id: number) : void =>
    {
        this.boardElems[id].isDeleted = true;

        var newElemList = this.viewState.boardElements.filter(elem => elem.id !== id);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    restoreElement = (id: number) : void =>
    {
        this.boardElems[id].isDeleted = false;

        if(this.boardElems[id].type === 'text')
        {
            // TODO
        }
        else if(this.boardElems[id].type === 'curve')
        {
            // TODO
        }
    }

    addCurve = (curveSet: Array<Point>, userId: number, colour: string, size: number, serverId?: number) : number =>
    {
        var newCurve: Curve =
        {
            type: 'curve', id: -1, user: userId, isDeleted: false, colour: colour, size: size, curveSet: curveSet, serverId: serverId
        };

        var localId = this.boardElems.length;
        this.boardElems[localId] = newCurve;
        newCurve.id = localId;

        if(serverId)
        {
            this.curveDict[serverId] = localId;
        }


        var newCurveView : CurveElement;

        if(curveSet.length > 1)
        {
            var pathText = this.createCurveText(curveSet);
            newCurveView = {type: 'path', id: localId, size: newCurve.size, colour: newCurve.colour, param: pathText };
        }
        else
        {
            newCurveView = { type: 'circle', id: localId, size: newCurve.size, colour: newCurve.colour, point: curveSet[0] };
        }

        var newElemList = this.viewState.boardElements.push(newCurveView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

        return localId;
    }

    moveCurve = (id: number, changeX: number, changeY: number) : void =>
    {
        var curve = this.getCurve(id);

        for(var i = 0; i < curve.curveSet.length; i++)
        {
            curve.curveSet[i].x += changeX;
            curve.curveSet[i].y += changeY;
        }

        var newCurveView : CurveElement;

        if(curve.curveSet.length > 1)
        {
            var pathText = this.createCurveText(curve.curveSet);

            newCurveView = Object.assign({}, this.getViewElement(id), {param: pathText});
        }
        else
        {
            newCurveView = Object.assign({}, this.getViewElement(id), {point: curve.curveSet});
        }

        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newCurveView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    addTextbox = (x: number, y: number, width: number, height: number, size: number, justified: boolean, userId: number, editLock: number, serverId?: number) : number =>
    {
        var localId: number;
        var remLock: boolean;

        if(serverId)
        {
            localId = this.textDict[serverId];
        }

        var newText : WhiteBoardText;

        if(!localId)
        {
            newText =
            {
                text: '', user: userId, isDeleted: false, x: x, y: y, size: size, styles: [], editCount: 0, type: 'text', cursor: null, cursorElems: [],
                width: width, height: height, editLock: editLock, justified: justified, textNodes: [], dist: [0], serverId: serverId, id: 0
            };

            localId = this.boardElems.length;
            this.boardElems[localId] = newText;
            newText.id = localId;


        }
        else
        {
            // TODO
            newText = this.getText(localId);
        }

        if(editLock == this.userId)
        {
            remLock = false;
            if(this.currTextEdit == -1)
            {
                this.currTextEdit = localId;
                this.currTextSel = localId;

                this.cursorStart = newText.text.length;
                this.cursorEnd = newText.text.length;
                this.gettingLock = -1;
                this.isWriting = true;

                this.changeTextSelect(localId, true);
                this.setMode(1);
            }
            else if(this.currTextEdit != localId)
            {
                this.releaseText(localId);
            }
        }
        else if(editLock != 0)
        {
            remLock = true;
        }

        var newView : TextElement = {
            x: newText.x, y: newText.y, width: newText.width, height: newText.height, isEditing: false, remLock: remLock, getLock: false, textNodes: [],
            cursor: null, cursorElems: [], id: localId, type: 'text', size: newText.size
        };

        var newElemList = this.viewState.boardElements.push(newView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

        return localId;
    }

    stopLockText = (id: number) : void =>
    {
        this.gettingLock = -1;
        this.currTextEdit = -1;
        this.currTextSel = -1;
        this.isWriting = false;

        var tbox = this.getText(id);
        tbox.editLock = 0;
        tbox.cursor = null;
        tbox.cursorElems = [];

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: false, isEditing: false, cursor: null, cursorElems: []});
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setTextGetLock = (id: number) : void =>
    {
        this.gettingLock = id;

        var tbox = this.getText(id);

        tbox.editLock = this.userId;
        this.cursorStart = tbox.text.length;
        this.cursorEnd = tbox.text.length;
        this.isWriting = true;

        this.changeTextSelect(id, true);

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: true});
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    changeTextSelect = (id: number, setIdeal: boolean) : void =>
    {
        var tbox = this.getText(id);

        if(setIdeal)
        {
            if(this.startLeft)
            {
                this.textIdealX = this.findXPos(tbox, this.cursorEnd);
            }
            else
            {
                this.textIdealX = this.findXPos(tbox, this.cursorStart);
            }
        }

        this.findCursorElems(tbox, this.cursorStart, this.cursorEnd);

        var newTextViewCurr : TextElement = Object.assign({}, this.getViewElement(id), {cursor: tbox.cursor, cursorElems: tbox.cursorElems});

        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextViewCurr);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setTextEdit = (id: number) : void =>
    {
        this.currTextEdit = id;
        this.currTextSel  = id;

        var tbox = this.getText(id);

        tbox.editLock = this.userId;
        this.cursorStart = tbox.text.length;
        this.cursorEnd = tbox.text.length;
        this.gettingLock = -1;
        this.isWriting = true;

        this.changeTextSelect(id, true);

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: false, isEditing: true});
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, {mode: 1, boardElements: newElemList}));
    }

    setTextLock = (id: number, userId: number) : void =>
    {
        var tbox = this.getText(id);
        tbox.editLock = userId;

        if(userId != this.userId)
        {
            var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {remLock: true});
            var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
            var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }
    }

    setTextUnLock = (id: number) : void =>
    {
        console.log('Should be releasing......');
        var tbox = this.getText(id);
        tbox.editLock = 0;

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), { remLock: false });
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setTextJustified = (id: number, state: boolean) : void =>
    {
        var textBox = this.getText(id);

        textBox.justified = state;
        textBox.textNodes = this.calculateTextLines(textBox);

        if(this.currTextSel == id)
        {
            this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        }

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: textBox.textNodes, cursor: textBox.cursor, cursorElems: textBox.cursorElems
        });
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList }));
    }

    setTextArea = (id: number, width: number, height: number) : void =>
    {
        var textBox = this.getText(id);

        textBox.height = height;

        if(textBox.width != width)
        {
            textBox.width = width;
            textBox.textNodes = this.calculateTextLines(textBox);
        }

        if(this.currTextSel == id)
        {
            this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        }

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: textBox.textNodes, width: textBox.width, height: textBox.height, cursor: textBox.cursor, cursorElems: textBox.cursorElems
        });
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    moveTextbox = (id: number, isRelative: boolean, x: number, y: number) : void =>
    {
        var textBox = this.getText(id);
        var changeX;
        var changeY;


        if(isRelative)
        {
            changeX = x;
            changeY = y;
        }
        else
        {
            changeX = x - textBox.x;
            changeY = y - textBox.y;
        }


        textBox.x += changeX;
        textBox.y += changeY


        for(var i = 0; i < textBox.textNodes.length; i++)
        {
            var node = textBox.textNodes[i];
            node.x += changeX;
            node.y += changeY;
        }

        //textBox.textNodes = this.calculateTextLines(textBox);

        if(this.currTextSel == id)
        {
            this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        }

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: textBox.textNodes, x: textBox.x, y: textBox.y, cursor: textBox.cursor, cursorElems: textBox.cursorElems
        });
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    updateText = (id: number, newText: WhiteBoardText) : void =>
    {
        newText.textNodes = this.calculateTextLines(newText);

        if(this.currTextSel == id)
        {
            this.findCursorElems(newText, this.cursorStart, this.cursorEnd);
        }

        var newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: newText.textNodes, width: newText.width, height: newText.height, cursor: newText.cursor, cursorElems: newText.cursorElems
        });
        var viewIndex = this.viewState.boardElements.findIndex(elem => elem.id === id);
        var newElemList = this.viewState.boardElements.set(viewIndex, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setMode = (newMode: number) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { mode: newMode}));
    }

    setColour = (newColour: string) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { colour: newColour}));
    }

    setIsItalic = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isItalic: newState}));
    }

    setIsOline = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isOLine: newState}));
    }

    setIsUline = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isULine: newState}));
    }

    setIsTline = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isTLine: newState}));
    }

    setIsBold = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isBold: newState}));
    }

    setJustified = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isJustified: newState}));
    }


    startMove = () : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { itemMoving: true}));
    }

    endMove = () : void =>
    {
        this.currTextResize = -1;
        this.currTextMove = -1;
        this.currCurveMove = -1;
        this.updateView(Object.assign({}, this.viewState, { itemMoving: false }));
    }

    setViewBox = (newView: string) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { viewBox: newView}));
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * INTERNAL FUNCTIONS
     *
     *
     *
     **********************************************************************************************************************************************************/
    newEdit = (textBox: WhiteBoardText) : WhiteBoardText =>
    {
        textBox.editCount++;

        if(textBox.editCount > 5)
        {
            // Notify of changes and clear that pesky timeout
            textBox.editCount = 0;
            clearTimeout(this.editTimer);
            this.textEdited(textBox);
        }
        else
        {
            // Set timeout
            var self = this;
            clearTimeout(this.editTimer);
            this.editTimer = setTimeout(function(tBox)
            {
                tBox.editCount = 0;
                self.textEdited(tBox);
                clearTimeout(this.editTimer);

            }, 6000, textBox);
        }

        return textBox;
    }

    drawCurve = (points: Array<Point>, size: number, colour: string, scaleF: number, panX: number, panY: number) : void =>
    {
        var reducedPoints : Array<Point>;
        var curves : Array<Point>;

        if(points.length > 1)
        {
            reducedPoints = SmoothCurve(points);
            reducedPoints = DeCluster(reducedPoints, 10);

            for(var i = 0; i < reducedPoints.length; i++)
            {
                reducedPoints[i].x = reducedPoints[i].x * scaleF + panX;
                reducedPoints[i].y = reducedPoints[i].y * scaleF + panY;
            }

            curves = FitCurve(reducedPoints, reducedPoints.length, 5);
        }
        else
        {
            curves = [];
            curves[0] = { x: points[0].x * scaleF + panX, y: points[0].y * scaleF + panY };
        }

        var localId = this.addCurve(curves, this.userId, colour, size);
        this.sendCurve(localId, curves, colour, size);
    }

    isCurrentStyle = (style : Style) : boolean =>
    {
        if(style.colour == this.viewState.colour && style.decoration == this.getDecoration() && style.weight == this.getWeight() && style.style == this.getStyle())
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    textEdited = (textbox: WhiteBoardText) : void =>
    {
        var buffer : TextOutBufferElement;
        var editNum: number;

        // This is a new textbox.
        if(this.textOutBuffer[textbox.id])
        {
            buffer = this.textOutBuffer[textbox.id];
            editNum = buffer.editCount;
            buffer.editCount++;
        }
        else
        {
            buffer = {
                id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, lastSent: 0,
                height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified, styles: []
            };
            buffer.styles = textbox.styles.slice();
            editNum = 0;
        }


        buffer.editBuffer[editNum] = {num_nodes: textbox.styles.length, nodes: []};

        for(var i = 0; i < textbox.styles.length; i++)
        {
            buffer.editBuffer[editNum].nodes.push(
            {   num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                weight: textbox.styles[i].weight, decoration:  textbox.styles[i].decoration, style: textbox.styles[i].style,
                start: textbox.styles[i].start, end: textbox.styles[i].end, editId: editNum
            });
        }

        this.textOutBuffer[textbox.id] = buffer;
        if(textbox.serverId)
        {
            let msg: UserEditTextMessage = {serverId: textbox.serverId, localId: editNum, bufferId: textbox.id, num_nodes: textbox.styles.length};
            this.socket.emit('EDIT-TEXT', msg);
        }
        else
        {
            let msg: UserNewTextMessage = {
                localId: textbox.id, x: this.textOutBuffer[textbox.id].x, y: this.textOutBuffer[textbox.id].y, size: this.textOutBuffer[textbox.id].size,
                width: this.textOutBuffer[textbox.id].width, height: this.textOutBuffer[textbox.id].height, justified: this.textOutBuffer[textbox.id].justified
            };
            this.socket.emit('TEXTBOX', msg);
        }
    }

    resizeText = (id: number, width: number, height: number) : void =>
    {
        var textBox = this.getText(id);

        this.setTextArea(id, width, height);

        if(textBox.serverId)
        {
            var msg: UserResizeTextMessage = {serverId: textBox.serverId, width: width, height: height}
            this.socket.emit('RESIZE-TEXT', msg);
        }
        else
        {
            // TODO: No server ID yet
        }
    }

    findXPos = (textbox: WhiteBoardText, loc: number) : number =>
    {
        if(textbox.textNodes.length == 0)
        {
            return 0;
        }

        var i = 1;
        while(i < textbox.textNodes.length && textbox.textNodes[i].start <= loc)
        {
            i++
        }

        var line = textbox.textNodes[i - 1];

        if(line.styles.length == 0)
        {
            return 0;
        }

        i = 1;
        while(i < line.styles.length && line.styles[i].locStart + line.start <= loc)
        {
            i++
        }

        var style = line.styles[i - 1];

        if(line.start + style.locStart == loc)
        {
            return style.startPos;
        }
        else
        {
            var currMes = textbox.dist[loc] - textbox.dist[line.start + style.locStart];

            return currMes + style.startPos;
        }
    }

    findTextPos = (textbox: WhiteBoardText, x: number, y: number) : number =>
    {
        var whitElem  = document.getElementById("whiteBoard-output");
        var elemRect = whitElem.getBoundingClientRect();
        var xFind = 0;

        if(y < textbox.y)
        {
            return 0;
        }
        else
        {
            var lineNum = Math.floor(((y - textbox.y) / (1.5 * textbox.size)) + 0.15);

            if(lineNum >= textbox.textNodes.length)
            {
                return textbox.text.length;
            }

            if(!textbox.textNodes[lineNum])
            {
                console.log('Line is: ' + lineNum);
            }

            if(x > textbox.x)
            {
                if(x > textbox.x + textbox.width)
                {
                    return textbox.textNodes[lineNum].end;
                }
                else
                {
                    xFind = x - textbox.x;
                }
            }
            else
            {
                return textbox.textNodes[lineNum].start;
            }

            var line = textbox.textNodes[lineNum];

            if(line.styles.length == 0)
            {
                return line.start;
            }


            var i = 0;
            while(i < line.styles.length && xFind > line.styles[i].startPos)
            {
                i++;
            }

            var curr = i - 1;
            var style = line.styles[i - 1];


            i = style.text.length - 1;

            var currMes = textbox.dist[line.start + style.locStart + style.text.length - 1] - textbox.dist[line.start + style.locStart];

            while(i > 0 && style.startPos + currMes > xFind)
            {
                i--;
                currMes = textbox.dist[line.start + style.locStart + i] - textbox.dist[line.start + style.locStart];
            }

            // i and currMes is now the position to the right of the search point.
            // We just need to check if left or right is closer then reurn said point.
            var selPoint;

            if(i < style.text.length - 1)
            {
                if(xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind)
                {
                    selPoint = line.start + style.locStart + i + 1;
                }
                else
                {
                    selPoint = line.start + style.locStart + i;
                }
            }
            else if(curr + 1 < line.styles.length)
            {

                if(xFind - (style.startPos + currMes) > line.styles[curr + 1].startPos - xFind)
                {
                    selPoint = line.start + line.styles[curr + 1].locStart;
                }
                else
                {
                    selPoint = line.start + style.locStart + i;
                }
            }
            else
            {
                if(xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind)
                {
                    selPoint = line.start + style.locStart + i + 1;
                }
                else
                {
                    selPoint = line.start + style.locStart + i;
                }
            }

            return selPoint;
        }
    }

    findCursorElems = (textbox: WhiteBoardText, cursorStart: number, cursorEnd: number) : void =>
    {
        textbox.cursorElems = [];

        if(textbox.textNodes.length == 0)
        {
            textbox.cursor = { x: textbox.x, y: textbox.y, height: 1.5 * textbox.size };
        }

        for(var i = 0; i < textbox.textNodes.length; i++)
        {
            var line: TextNode = textbox.textNodes[i];
            var selStart: number = null;
            var selEnd: number = null;
            var startFound: boolean = false;
            var endFound: boolean = false;

            if(cursorStart >= line.start && cursorStart <= line.end)
            {
                if(cursorStart == line.end && !line.endCursor)
                {
                    selStart = textbox.width;
                }
                else
                {
                    for(var j = 0; j < line.styles.length && !startFound; j++)
                    {
                        var style: StyleNode = line.styles[j];

                        selStart = 0;
                        selStart += style.dx;

                        if(cursorStart <= line.start + style.locStart + style.text.length)
                        {
                            startFound = true;
                            selStart += style.startPos + textbox.dist[cursorStart] - textbox.dist[line.start + style.locStart];
                        }
                    }
                }
            }
            else if(cursorStart < line.start && cursorEnd > line.start)
            {
                selStart = 0;
            }

            if(cursorEnd > line.start && cursorEnd <= line.end)
            {
                if(cursorEnd == line.end && !line.endCursor)
                {
                    selEnd = textbox.width;
                }
                else
                {
                    for(var j = 0; j < line.styles.length && !endFound; j++)
                    {
                        var style: StyleNode = line.styles[j];

                        selEnd = 0;
                        selEnd += style.dx;

                        if(cursorEnd <= line.start + style.locStart + style.text.length)
                        {
                            endFound = true;
                            selEnd += style.startPos + textbox.dist[cursorEnd] - textbox.dist[line.start + style.locStart];
                        }
                    }
                }
            }
            else if(cursorEnd >= line.end  && cursorStart <= line.end)
            {
                selEnd = textbox.width;
            }

            if(cursorEnd >= line.start && cursorEnd <= line.end && (this.startLeft || cursorStart == cursorEnd) && line.start != line.end)
            {
                if(cursorEnd != line.end || line.endCursor)
                {
                    textbox.cursor = { x: textbox.x + selEnd, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                }
            }
            else if(cursorStart >= line.start && cursorStart <= line.end && (!this.startLeft || cursorStart == cursorEnd))
            {
                if(cursorStart != line.end || line.endCursor)
                {
                    textbox.cursor = { x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                }
            }

            if(selStart != null && selEnd != null && cursorStart != cursorEnd)
            {
                textbox.cursorElems.push({ x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, width: selEnd - selStart, height: 1.5 * textbox.size });
            }
        }
    }

    calculateLengths = (textbox: WhiteBoardText, start: number, end: number, prevEnd: number) : void =>
    {
        var whitElem  = document.getElementById("whiteBoard-output");
        var tMount: SVGTextElement;
        var startPoint: number;
        var styleNode: SVGTSpanElement;
        var change: number = 0;
        var style: number = 0;
        var oldDist: Array<number> = textbox.dist.slice();

        while(style - 1 < textbox.styles.length && textbox.styles[style].end <= start - 2)
        {
            style++;
        }

        if(start > 1)
        {
            // Calculate the start point taking into account the kerning.
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

            if(textbox.styles[style].end <= start - 1)
            {
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

            // Calculate the start dist from start point with it's combined length of the previous character
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

            if(textbox.styles[style].end <= start)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
            tMount.appendChild(styleNode);

            textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
        }
        else if(start > 0)
        {
            startPoint = 0;
            if(textbox.styles[style].end <= start - 1)
            {
                style++;
            }

            // Calculate the start dist from start point with it's combined length of the previous character
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

            if(textbox.styles[style].end <= start)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
            tMount.appendChild(styleNode);

            textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
        }
        else
        {
            startPoint = 0;
            style = 0;

            // Just use the very first character, no extra calculation required.
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


        for(var i = start + 1; i < end; i++)
        {
            if(textbox.styles[style].end <= i)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(i)));
            tMount.appendChild(styleNode);

            textbox.dist[i + 1] = startPoint + tMount.getComputedTextLength();
        }


        if(end < textbox.text.length)
        {
            if(textbox.styles[style].end <= end)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(end)));
            tMount.appendChild(styleNode);

            change = startPoint + tMount.getComputedTextLength() - oldDist[prevEnd + 1];

            for(var i = end; i < textbox.text.length; i++)
            {
                textbox.dist[i + 1] = oldDist[i + 1 + prevEnd - end] + change;
            }
        }
        whitElem.removeChild(tMount);
    }

    calculateTextLines = (textbox: WhiteBoardText) : Array<TextNode> =>
    {
        var i: number;
        var childText = [];
        var currPos: number = 0;
        var prevPos: number = 0;
        var txtStart: number = 0;
        var isWhiteSpace = true;
        var dy: number = textbox.size;
        var ddy: number = 1.5 * textbox.size;
        var nodeCounter: number;
        var computedTextLength: number;
        var wordC: number;
        var spaceC: number;
        var line: string;
        var wordsT: Array<string> = [];
        var spacesT: Array<string> = [];
        var startSpace: boolean = true;
        var currY: number = textbox.y;
        var lineCount: number = 0;

        if(!textbox.text.length)
        {
            return [];
        }

        for(i = 0; i < textbox.text.length; i++)
        {
            if(isWhiteSpace)
            {
                if(!textbox.text.charAt(i).match(/\s/))
                {
                    if(i > 0)
                    {
                        spacesT.push(textbox.text.substring(txtStart, i));
                        txtStart = i;
                        isWhiteSpace = false;
                    }
                    else
                    {
                        startSpace = false;
                        isWhiteSpace = false;
                    }
                }
            }
            else
            {
                if(textbox.text.charAt(i).match(/\s/))
                {
                    wordsT.push(textbox.text.substring(txtStart, i));
                    txtStart = i;
                    isWhiteSpace = true;
                }
            }
        }

        if(isWhiteSpace)
        {
            spacesT.push(textbox.text.substring(txtStart, i));
        }
        else
        {
            wordsT.push(textbox.text.substring(txtStart, i));
        }

        wordC = 0;
        spaceC = 0;
        nodeCounter = 0;

        var nLineTrig: boolean;

        while(wordC < wordsT.length || spaceC < spacesT.length)
        {
            var lineComplete: boolean = false;
            var word: string;

            currY += dy;
            var currLength = 0;
            var tspanEl : TextNode = {
                styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                justified: textbox.justified, lineNum: lineCount, text: ''
            };
            var progPos = true;

            nLineTrig = false;

            if(startSpace)
            {
                var fLine = spacesT[spaceC].indexOf('\n');
                if(fLine != -1)
                {
                    if(spacesT[spaceC].length > 1)
                    {
                        if(fLine == 0)
                        {
                            nLineTrig = true;
                            spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                            spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                        }
                        else
                        {
                            progPos = false;
                            spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                            spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                        }
                    }
                    else
                    {
                        nLineTrig = true;
                        startSpace = !startSpace;
                    }
                }

                if(spaceC >= spacesT.length)
                {
                    console.error('ERROR: Space array out of bounds');
                    return [];
                }

                word = spacesT[spaceC];
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
                wordC++;
            }

            if(nLineTrig)
            {
                word = '';
                lineComplete = true;
                tspanEl.justified = false;
                tspanEl.end = currPos;
                currPos++;
                prevPos = currPos;
            }

            computedTextLength = textbox.dist[currPos + word.length] - textbox.dist[currPos];

            if(computedTextLength > textbox.width)
            {
                // Find a place that splits it to fit, check for dashes
                lineComplete = true;

                fDash = word.indexOf('-');

                if(fDash != -1 && computedTextLength > textbox.width)
                {
                    // Split the string at dash, use the bit before the dash
                    var newStr = word.substring(fDash + 1, word.length);
                    // Insert the new string into the words array after current position
                    wordsT.splice(wordC, 0, newStr);
                    word = word.substring(0, fDash + 1);
                }

                // Work backwards to find the overflow split
                i = word.length;
                while(computedTextLength > textbox.width && i > 0)
                {
                    computedTextLength = textbox.dist[currPos + word.substring(0, i).length] - textbox.dist[currPos];
                    i--;
                }

                // Add to buffer
                if(computedTextLength <= textbox.width)
                {
                    // Insert the new string into the words array after current position
                    if(startSpace)
                    {
                        if(i + 2 < word.length)
                        {
                            spacesT.splice(spaceC, 0, word.substring(i + 2, word.length));
                        }
                        else
                        {
                            startSpace = !startSpace;
                        }
                        word = word.substring(0, i + 1);
                        currPos += word.length;
                        tspanEl.end = currPos;
                        prevPos = currPos + 1;
                    }
                    else
                    {
                        wordsT.splice(wordC, 0, word.substring(i + 1, word.length));
                        word = word.substring(0, i + 1);
                        currPos += word.length;
                        tspanEl.end = currPos;
                        tspanEl.endCursor = false;
                        prevPos = currPos;
                    }
                }
                else
                {
                    console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                }
            }
            else
            {
                currPos += word.length;

                if(!nLineTrig && progPos)
                {
                    startSpace = !startSpace;
                }
            }

            line = word;
            currLength = computedTextLength;

            while(!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length))
            {
                // Loop to finish line
                if(startSpace)
                {
                    var fLine = spacesT[spaceC].indexOf('\n');
                    if(fLine != -1)
                    {
                        if(spacesT[spaceC].length > 1)
                        {
                            if(fLine == 0)
                            {
                                nLineTrig = true;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                            }
                            else
                            {
                                progPos = false;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                            }
                        }
                        else
                        {
                            nLineTrig = true;
                            startSpace = !startSpace;
                        }
                    }

                    word = spacesT[spaceC];
                }
                else
                {
                    word = wordsT[wordC];
                }

                if(nLineTrig)
                {
                    word = '';
                    lineComplete = true;
                    tspanEl.justified = false;
                    tspanEl.end = currPos;
                    currPos++;
                    prevPos = currPos;
                }

                computedTextLength = currLength + textbox.dist[currPos + word.length] - textbox.dist[currPos];

                if(computedTextLength > textbox.width)
                {
                    lineComplete = true;

                    if(startSpace)
                    {
                        if(word.length > 1)
                        {
                            // Split the space add other to stack
                            i = word.length - 1;
                            while(computedTextLength > textbox.width && i > 0)
                            {
                                computedTextLength = currLength + textbox.dist[currPos + i] - textbox.dist[currPos];
                                i--;
                            }

                            if(computedTextLength <= textbox.width)
                            {
                                if(i + 2 < word.length)
                                {
                                    var newStr = word.substring(i + 2, word.length);
                                    // Insert the new string into the words array after current position
                                    spacesT.splice(spaceC, 0, newStr);

                                    line += word.substring(0, i + 1);
                                    currPos += word.substring(0, i + 1).length;
                                    tspanEl.end = currPos;
                                    currPos++;
                                    prevPos = currPos;
                                    spaceC++;
                                }
                                else
                                {
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
                            else
                            {
                                computedTextLength = currLength + textbox.dist[currPos + word.length - 1] - textbox.dist[currPos];
                                tspanEl.end = currPos;
                                prevPos = currPos + 1;
                                spacesT[spaceC] = spacesT[spaceC].substring(1, spacesT[spaceC].length);
                            }
                        }
                        else
                        {
                            computedTextLength = currLength;
                            tspanEl.end = currPos;
                            currPos++;
                            prevPos = currPos;
                            startSpace = !startSpace;
                            spaceC++;
                        }
                    }
                    else
                    {
                        // Check for dashes, if there is split check, if good add word and put other in stack
                        var fDash = word.indexOf('-');

                        if(fDash != -1)
                        {
                            computedTextLength = currLength + textbox.dist[currPos + fDash + 1] - textbox.dist[currPos];
                            //computedTextLength = currLength + this.calculateWordWidth(word.substring(0, fDash + 1), currPos, sizeCheck, textbox.styles);

                            // Check and if fits, split away
                            if(computedTextLength <= textbox.width)
                            {
                                var newStr = word.substring(fDash + 1, word.length);
                                // Insert the new string into the words array after current position
                                wordsT.splice(wordC, 0, newStr);
                                wordC++;

                                line += word.substring(0, fDash + 1);

                                currPos += word.substring(0, fDash + 1).length;
                                tspanEl.end = currPos;
                                tspanEl.endCursor = false;
                                prevPos = currPos;

                                currLength = computedTextLength;
                            }
                            else
                            {
                                computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];

                                line = line.substring(0, line.length - 1);

                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                            }
                        }
                        else
                        {
                            computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];

                            line = line.substring(0, line.length - 1);
                            tspanEl.end = currPos - 1;
                            prevPos = currPos;
                        }
                    }
                }
                else
                {
                    line += word;
                    currPos += word.length;

                    if(nLineTrig)
                    {
                        spaceC++;
                    }
                    else
                    {
                        if(startSpace)
                        {
                            spaceC++;
                        }
                        else
                        {
                            wordC++;
                        }

                        if(progPos)
                        {
                            startSpace = !startSpace;
                        }
                    }


                    currLength = computedTextLength;
                }
            }


            tspanEl.end = tspanEl.start + line.length;

            // Once the line is complete / out of stuff split into styles
            tspanEl.text = line;
            dy = ddy;
            nodeCounter = 0;

            if(wordC == wordsT.length && spaceC == spacesT.length)
            {
                tspanEl.justified = false;
            }

            var reqAdjustment = textbox.width - computedTextLength;
            var numSpaces = tspanEl.text.length - tspanEl.text.replace(/\s/g, "").length;
            var extraSpace = reqAdjustment / numSpaces;
            var currStart = 0;
            var currLoc = 0;

            for(var j = 0; j < textbox.styles.length; j++)
            {
                if(textbox.styles[j].start < tspanEl.end && textbox.styles[j].end > tspanEl.start)
                {
                    var startPoint = (textbox.styles[j].start < tspanEl.start) ? 0 : (textbox.styles[j].start - tspanEl.start);
                    var endPoint = (textbox.styles[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (textbox.styles[j].end - tspanEl.start);
                    var styleText = tspanEl.text.slice(startPoint, endPoint);
                    var newStyle: StyleNode;
                    word = '';

                    for(i = 0; i < styleText.length; i++)
                    {
                        if(styleText.charAt(i).match(/\s/))
                        {
                            if(word.length > 0)
                            {
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


                            if(tspanEl.justified)
                            {
                                newStyle =
                                {
                                    key: nodeCounter, text: styleText.charAt(i), colour: textbox.styles[j].colour, dx: extraSpace, locStart: currLoc,
                                    decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                };


                                currStart += extraSpace + textbox.dist[tspanEl.start + currLoc + 1] - textbox.dist[tspanEl.start + currLoc];
                            }
                            else
                            {
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
                        else
                        {
                            word += styleText.charAt(i);

                            if(i == styleText.length - 1)
                            {
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

        if(nLineTrig)
        {
            tspanEl = {
                styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                justified: false, lineNum: lineCount, text: ''
            };

            lineCount++;
            childText.push(tspanEl);
        }

        if(lineCount * 1.5 * textbox.size > textbox.height)
        {
            this.resizeText(textbox.id, textbox.width, lineCount * 1.5 * textbox.size);
        }

        return childText;
    }

    sendCurve = (localId: number, curves: Array<Point>, colour: string, size: number) : void =>
    {
        var self = this;

        this.curveOutBuffer[localId] = {serverId: 0, localId: localId, colour: colour, curveSet: curves, size: size};

        this.curveOutTimeouts[localId] = setInterval(function()
        {
            let msg: UserNewCurveMessage = {localId: localId, colour: colour, num_points: curves.length, size: size};
            self.socket.emit('CURVE', msg);
        }, 60000);

        let msg: UserNewCurveMessage = {localId: localId, colour: colour, num_points: curves.length, size: size};
        this.socket.emit('CURVE', msg);
    }

    completeEdit = (textId: number, userId: number, editId: number) : void =>
    {
        var textItem: WhiteBoardText;
        var fullText = '';
        var localId = this.textDict[textId];
        var editData = this.textInBuffer[textId].editBuffer[userId][editId];

        textItem = this.getText(localId);
        textItem.styles = [];

        for(var i = 0; i < editData.nodes.length; i++)
        {
            textItem.styles[editData.nodes[i].num] = editData.nodes[i];
        }

        for(var i = 0; i < textItem.styles.length; i++)
        {
            fullText += textItem.styles[i].text;
        }

        textItem.text = fullText;

        this.calculateLengths(textItem, 0, fullText.length, 0);
        this.updateText(localId, textItem);
    }

    createCurveText = (curve: Array<Point>) : string =>
    {
        var param =     "M" + curve[0].x + "," + curve[0].y;
        param = param +" C" + curve[1].x + "," + curve[1].y;
        param = param + " " + curve[2].x + "," + curve[2].y;
        param = param + " " + curve[3].x + "," + curve[3].y;

        for(var i = 4; i + 2 < curve.length; i += 3)
        {
            param = param +" C" + curve[i + 0].x + "," + curve[i + 0].y;
            param = param + " " + curve[i + 1].x + "," + curve[i + 1].y;
            param = param + " " + curve[i + 2].x + "," + curve[i + 2].y;
        }

        return param;
    }

    releaseText = (id: number) : void =>
    {
        var textbox = this.getText(id);

        this.stopLockText(id);
        var msg : UserReleaseTextMessage = {serverId: textbox.serverId};
        this.socket.emit('RELEASE-TEXT', msg);
    }

    enterText = (newText: string) : void =>
    {
        // TODO
    }

    changeTextStyle = (newStyle: TextStyle) : void =>
    {
        // TODO
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * SOCKET CODE
     *
     *
     *
     **********************************************************************************************************************************************************/
    setSocket = (socket: Socket) : void =>
    {
        var self = this;
        this.socket = socket;

        this.socket.on('JOIN', function(data: ServerBoardJoinMessage)
        {

        });

        this.socket.on('CURVE', function(data: ServerNewCurveMessage)
        {
            console.log('Recieved curve ID:' + data.serverId);
            if(!self.curveDict[data.serverId] && !self.curveInBuffer[data.serverId])
            {
                // Set up the buffers to recieve data.
                self.curveInBuffer[data.serverId] = {
                    serverId: data.serverId, user: data.userId, size: data.size, num_points: data.num_points, num_recieved: 0,
                    curveSet: new Array, colour: data.colour
                };

                clearInterval(self.curveInTimeouts[data.serverId]);
                self.curveInTimeouts[data.serverId] = setInterval((id) =>
                {
                    for(var j = 0; j < self.curveInBuffer[id].num_points; j++)
                    {
                        if(!self.curveInBuffer[id].curveSet[j])
                        {
                            console.log('Sending Missing message.');
                            var msg : UserMissingCurveMessage = {serverId: id, seq_num: j};
                            self.socket.emit('MISSING-CURVE', msg);
                        }
                    }
                }, 30000, data.serverId);
            }
        });
        this.socket.on('POINT', function(data: ServerNewPointMessage)
        {
            var buffer = self.curveInBuffer[data.serverId];
            // Make sure we know about this curve.
            if(buffer && buffer.num_recieved != buffer.num_points)
            {
                if(!buffer.curveSet[data.num])
                {
                    buffer.curveSet[data.num] = {x: data.x, y: data.y};
                    buffer.num_recieved++;
                }

                if(buffer.num_recieved == buffer.num_points)
                {
                    clearInterval(self.curveInTimeouts[data.serverId]);

                    self.addCurve(buffer.curveSet, buffer.user, buffer.colour, buffer.size, data.serverId);
                }
            }
            else
            {
                clearInterval(self.curveInTimeouts[data.serverId]);

                // Request curve data.
                self.socket.emit('UNKNOWN-CURVE', data.serverId);
            }
        });
        this.socket.on('IGNORE-CURVE', function(curveId: number)
        {
            clearInterval(self.curveInTimeouts[curveId]);
        });
        this.socket.on('CURVEID', function(data: ServerCurveIdMessage)
        {
            self.curveOutBuffer[data.localId].serverId = data.serverId;

            clearInterval(self.curveOutTimeouts[data.localId]);

            // Send the points for this curve.
            for(var i = 0; i < self.curveOutBuffer[data.localId].curveSet.length; i++)
            {
                var curve = self.curveOutBuffer[data.localId].curveSet[i];
                var msg : UserNewPointMessage = {serverId: data.serverId, num: i, x: curve.x, y: curve.y};
                self.socket.emit('POINT', msg);
            }


            self.boardElems[data.localId].serverId = data.serverId;
            self.curveDict[data.serverId] = data.localId
        });
        this.socket.on('MISSED-CURVE', function(data: ServerMissedPointMessage)
        {
            // The server has not recieced this point, find it and send it.
            var curve;

            for(var i = 0; i < self.curveOutBuffer.length; i++)
            {
                if(self.curveOutBuffer[i].serverId == data.serverId)
                {
                    curve  = self.curveOutBuffer[i].curveSet[data.num];
                }
            }
            var msg : UserNewPointMessage = {serverId: data.serverId, num: data.num, x: curve.x, y: curve.y};
            self.socket.emit('POINT', msg);
        });
        this.socket.on('DROPPED-CURVE', function(serverId: number)
        {
            // TODO: We need to stop trying to get it.
        });
        this.socket.on('MOVE-CURVE', function(data: ServerMoveElementMessage)
        {
            var localId = self.curveDict[data.serverId];

            self.moveCurve(localId, data.x, data.y);
        });
        this.socket.on('DELETE-CURVE', function(serverId: number)
        {
            var localId = self.curveDict[serverId];

            self.deleteElement(localId);
        });
        this.socket.on('TEXTBOX', function(data: ServerNewTextboxMessage)
        {
            // Set up the buffers to recieve data.
            if(!self.textInBuffer[data.serverId])
            {
                self.textInBuffer[data.serverId] = {
                    x: data.x, y: data.y, width: data.width, height: data.height, user: data.userId,
                    editLock: data.editLock, styles: [], size: data.size, justified: data.justified, editBuffer: []
                };

                var localId = self.addTextbox(data.x, data.y, data.width, data.height, data.size, data.justified, data.userId, data.editLock, data.serverId);
                self.textDict[data.serverId] = localId;
            }
        });
        this.socket.on('STYLENODE', function(data: ServerStyleNodeMessage)
        {
            if(!self.textInBuffer[data.serverId])
            {
                console.log('STYLENODE: Unkown text, ID: ' + data.serverId);
                console.log(data);
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                if(self.textInBuffer[data.serverId].editBuffer[data.userId])
                {
                    if(self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId])
                    {
                        var buffer = self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId];
                        buffer.nodes.push(data);
                        if(buffer.nodes.length == buffer.num_nodes)
                        {
                            self.completeEdit(data.serverId, data.userId, data.editId);
                        }
                    }
                    else
                    {
                        console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.serverId);
                        self.socket.emit('UNKNOWN-EDIT', data.editId);
                    }
                }
                else
                {
                    // TODO:
                    console.log('WOAH BUDDY! User ID: ' + data.userId);
                }
            }
        });
        this.socket.on('TEXTID', function(data: ServerTextIdMessage)
        {
            // TODO: set server ID, then send latest edit. Just use completeEdit
            self.textDict[data.serverId] = data.localId;
            self.boardElems[data.localId].serverId = data.serverId;
        });
        this.socket.on('LOCK-TEXT', function(data: ServerLockTextMessage)
        {
            var localId = self.textDict[data.serverId];

            if(!localId)
            {
                // TODO: Unkown text
            }
            else
            {
                self.setTextLock(localId, data.userId);
            }
        });
        this.socket.on('LOCKID-TEXT', function(data: ServerLockIdMessage)
        {
            var localId = self.textDict[data.serverId];

            if(!localId)
            {
                // TODO: Unkown text
            }
            else
            {
                if(self.gettingLock != -1 && self.boardElems[self.gettingLock].serverId == data.serverId)
                {
                    self.setTextEdit(localId);
                }
                else
                {
                    var msg: UserReleaseTextMessage = {serverId: data.serverId};
                    self.socket.emit('RELEASE-TEXT', msg);
                }
            }
        });
        this.socket.on('EDITID-TEXT', function(data: ServerEditIdMessage)
        {
            var buffer = self.textOutBuffer;
            // TODO: this may need a lock

            if(data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent)
            {
                buffer[data.bufferId].lastSent = data.localId;
                for(var i = 0; i < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i++)
                {
                    buffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.editId;
                    var node = buffer[data.bufferId].editBuffer[data.localId].nodes[i];

                    var msg: UserStyleNodeMessage = {
                        editId: node.editId, num: node.num, start: node.start, end: node.end, text: node.text, weight: node.weight, style: node.style,
                        decoration: node.decoration, colour: node.colour
                    };
                    self.socket.emit('STYLENODE', msg);
                }
            }

        });
        this.socket.on('FAILED-TEXT', function(data)
        {
            // TODO:
        });
        this.socket.on('REFUSED-TEXT', function(data)
        {
            // TODO:
        });
        this.socket.on('RELEASE-TEXT', function(data: ServerReleaseTextMessage)
        {
            var localId = self.textDict[data.serverId];

            if(!localId)
            {
                console.log('Unknown text for release....');
                // TODO: Unkown text
            }
            else
            {
                self.setTextUnLock(localId);
            }
        });
        this.socket.on('EDIT-TEXT', function(data: ServerEditTextMessage)
        {
            if(!self.textInBuffer[data.serverId])
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                if(!self.textInBuffer[data.serverId].editBuffer[data.userId])
                {
                    self.textInBuffer[data.serverId].editBuffer[data.userId] = [];
                }

                self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId] = {num_nodes: data.num_nodes, nodes: []};
            }

        });
        this.socket.on('MOVE-TEXT', function(data: ServerMoveElementMessage)
        {
            var localId = self.textDict[data.serverId];

            if(!localId)
            {
                // TODO: Unkown text
            }
            else
            {
                self.moveTextbox(localId, false, data.x, data.y);
            }
        });
        this.socket.on('JUSTIFY-TEXT', function(data: ServerJustifyTextMessage)
        {
            var localId = self.textDict[data.serverId];

            if(!localId)
            {
                // TODO: Unkown text
            }
            else
            {
                self.setTextJustified(data.serverId, data.newState);
            }
        });
        this.socket.on('RESIZE-TEXT', function(data: ServerResizeTextMessage)
        {
            var localId = self.textDict[data.serverId];

            if(!localId)
            {
                // TODO: Unkown text
            }
            else
            {
                self.setTextArea(localId, data.width, data.height);
            }
        });
        this.socket.on('DELETE-TEXT', function(serverId: number)
        {
            var localId = self.textDict[serverId];

            if(!localId)
            {
                // TODO: Unkown text
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('IGNORE-TEXT', function(serverId: number)
        {
            //clearInterval(self.textInTimeouts[serverId]);
        });
        this.socket.on('DROPPED-TEXT', function(data)
        {
            // TODO: We need to stop trying to get it.
        });
        this.socket.on('MISSED-TEXT', function(data: ServerMissedTextMessage)
        {
            // TODO:
        });
        this.socket.on('ERROR', function(message: string)
        {
            // TODO: Server error.
            console.log('SERVER: ' + message);
        });
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * DISPATCHER METHODS
     *
     *
     *
     **********************************************************************************************************************************************************/
    colourChange = (newColour: string) : void =>
    {
        this.setColour(newColour);
    }

    modeChange = (newMode: number) : void =>
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var context  = whitElem.getContext('2d');
        context.clearRect(0, 0, whitElem.width, whitElem.height);
        this.isWriting = false;

        if(this.currTextEdit > -1)
        {
            var textBox = this.getText(this.currTextEdit);
            var lineCount = textBox.textNodes.length;

            if(lineCount == 0)
            {
                lineCount = 1;
            }

            if(lineCount * 1.5 * textBox.size < textBox.height)
            {
                this.resizeText(this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
            }

            this.releaseText(this.currTextEdit);
        }
        else if(this.gettingLock > -1)
        {
            this.releaseText(this.gettingLock);
        }

        this.setMode(newMode);
    }

    boldChange = (newState: boolean) : void =>
    {
        this.setIsBold(newState);
    }

    italicChange = (newState: boolean) : void =>
    {
        this.setIsItalic(newState);
    }

    underlineChange = (newState: boolean) : void =>
    {
        if(newState)
        {
            this.setIsOline(false);
            this.setIsTline(false);
        }

        this.setIsUline(newState);
    }

    overlineChange = (newState: boolean) : void =>
    {
        if(newState)
        {
            this.setIsUline(false);
            this.setIsTline(false);
        }

        this.setIsOline(newState);
    }

    throughlineChange = (newState: boolean) : void =>
    {
        if(newState)
        {
            this.setIsOline(false);
            this.setIsUline(false);
        }

        this.setIsTline(newState);
    }

    justifiedChange = (newState: boolean) : void =>
    {
        if(this.currTextEdit != -1)
        {
            this.setTextJustified(this.currTextEdit, !this.viewState.isJustified);
            this.changeTextSelect(this.currTextEdit, true);


            var textBox = this.getText(this.currTextEdit);

            if(textBox.serverId)
            {
                var msg: UserJustifyTextMessage = {serverId: textBox.serverId, newState: !this.viewState.isJustified};
                this.socket.emit('JUSTIFY-TEXT', msg);
            }
            else
            {
                // TODO: Catch for no server ID
            }


        }

        this.setJustified(newState);

    }

    curveMouseClick = (id: number) : void =>
    {
        if(this.viewState.mode == 2)
        {
            var curve = this.boardElems[id];

            if(this.isHost || this.userId == curve.user)
            {
                if(curve.serverId)
                {
                    this.socket.emit('DELETE-CURVE', curve.serverId);
                }
                else
                {
                    // TODO: No server ID
                }
                this.deleteElement(id);
            }
        }
    }

    curveMouseMove = (id: number) : void =>
    {
        if(this.viewState.mode == 2 && this.lMousePress)
        {
            var curve = this.boardElems[id];

            if(this.isHost || this.userId == curve.user)
            {
                if(curve.serverId)
                {
                    this.socket.emit('DELETE-CURVE', curve.serverId);
                }
                else
                {
                    // TODO: No server ID
                }
                this.deleteElement(id);
            }
        }
    }

    curveMouseDown = (id: number, e: MouseEvent) : void =>
    {
        if(this.viewState.mode == 3)
        {
            this.currCurveMove = id;
            this.startMove();

            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    textMouseClick = (id: number) : void =>
    {
        if(this.viewState.mode == 2)
        {
            var textBox = this.boardElems[id];

            if(this.isHost || this.userId == textBox.user)
            {
                if(textBox.serverId)
                {
                    this.socket.emit('DELETE-TEXT', textBox.serverId);
                }
                else
                {
                    // TODO: No server ID
                }
                this.deleteElement(id);
            }
        }
    }

    textMouseDblClick = (id: number) : void =>
    {
        var textBox = this.boardElems[id];

        if(this.gettingLock != -1 && this.gettingLock != id)
        {
            this.releaseText(this.gettingLock);
        }

        if(this.currTextEdit != -1)
        {
            if(this.currTextEdit != id)
            {
                this.releaseText(this.currTextEdit);
                var tbox = this.getText(this.currTextEdit);
                var lineCount = tbox.textNodes.length;

                if(lineCount == 0)
                {
                    lineCount = 1;
                }

                if(lineCount * 1.5 * tbox.size < tbox.height)
                {
                    this.resizeText(this.currTextEdit, tbox.width, lineCount * 1.5 * tbox.size);
                }
            }
        }
        else
        {
            if(this.isHost || this.userId == textBox.user)
            {
                this.setTextGetLock(id);

                if(textBox.serverId)
                {
                    var msg: UserLockTextMessage = {serverId:  textBox.serverId};
                    this.socket.emit('LOCK-TEXT', msg);
                }
                else
                {
                    // TODO: No server ID
                }
            }
        }
    }

    textMouseMoveDown = (id: number, e: MouseEvent) : void =>
    {
        this.currTextMove = id;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.startMove();
    }

    textMouseResizeDown = (id: number, vert: boolean, horz: boolean, e: MouseEvent) : void =>
    {
        this.currTextResize = id;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.vertResize = vert;
        this.horzResize = horz;
        this.startMove();
    }

    textMouseMove = (id: number) : void =>
    {
        if(this.viewState.mode == 2 && this.lMousePress)
        {
            var textBox = this.boardElems[id];

            if(this.isHost || this.userId == textBox.user)
            {
                if(textBox.serverId)
                {
                    this.socket.emit('DELETE-TEXT', textBox.serverId);
                }
                else
                {
                    // TODO: No server ID
                }

                this.deleteElement(id);
            }
        }
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * DOCUMENT LISTENER METHODS
     *
     *
     *
     **********************************************************************************************************************************************************/
    mouseUp = (e: MouseEvent) : void =>
    {
        if(this.lMousePress && !this.wMousePress)
        {
            if(this.viewState.mode == 0)
            {
                var whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
                var context = whitElem.getContext('2d');

                context.clearRect(0, 0, whitElem.width, whitElem.height);

                if(this.isPoint)
                {
                    var elemRect = whitElem.getBoundingClientRect();
                    var offsetY  = elemRect.top - document.body.scrollTop;
                    var offsetX  = elemRect.left - document.body.scrollLeft;
                }

                this.drawCurve(this.pointList, this.scaleF, this.viewState.colour, this.scaleF, this.panX, this.panY);
            }
            else if(this.viewState.mode == 1)
            {
                if(!this.isWriting)
                {
                    var rectLeft;
                    var rectTop;
                    var rectWidth;
                    var rectHeight;
                    var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
                    var context  = whitElem.getContext('2d');
                    var elemRect = whitElem.getBoundingClientRect();
                    var offsetY  = elemRect.top - document.body.scrollTop;
                    var offsetX  = elemRect.left - document.body.scrollLeft;
                    var newPoint: Point = {x: 0, y: 0};

                    context.clearRect(0, 0, whitElem.width, whitElem.height);

                    newPoint.x = Math.round(e.clientX - offsetX);
                    newPoint.y = Math.round(e.clientY - offsetY);


                    if(newPoint.x > this.downPoint.x)
                    {
                        rectLeft = this.downPoint.x;
                        rectWidth = newPoint.x - this.downPoint.x;
                    }
                    else
                    {
                        rectLeft = newPoint.x;
                        rectWidth = this.downPoint.x - newPoint.x;
                    }

                    if(newPoint.y > this.downPoint.y)
                    {
                        rectTop = this.downPoint.y;
                        rectHeight = newPoint.y - this.downPoint.y;
                    }
                    else
                    {
                        rectTop = newPoint.y;
                        rectHeight = this.downPoint.y - newPoint.y;
                    }

                    if(rectWidth > 10 && rectHeight > 10)
                    {
                        var x = rectLeft * this.scaleF + this.panX;
                        var y = rectTop * this.scaleF + this.panY;
                        var width = rectWidth * this.scaleF;
                        var height = rectHeight * this.scaleF;

                        this.isWriting = true;
                        this.cursorStart = 0;
                        this.cursorEnd = 0;

                        var localId = this.addTextbox(x, y, width, height, this.scaleF * 20, this.viewState.isJustified, this.userId, this.userId);
                        this.setTextEdit(localId);
                    }
                }
                else if(this.rMousePress)
                {
                    this.isWriting = false;

                    if(this.currTextEdit > -1)
                    {
                        var textBox = this.getText(this.currTextEdit);
                        var lineCount = textBox.textNodes.length;

                        if(lineCount == 0)
                        {
                            lineCount = 1;
                        }

                        if(lineCount * 1.5 * textBox.size < textBox.height)
                        {
                            this.resizeText(this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                        }

                        this.releaseText(this.currTextEdit);
                    }
                    else if(this.gettingLock > -1)
                    {
                        this.releaseText(this.gettingLock);
                    }

                    context.clearRect(0, 0, whitElem.width, whitElem.height);
                }
            }
        }

        if(this.curveMoved)
        {
            var serverId = this.boardElems[this.currCurveMove].serverId;
            var changeX = this.curveChangeX;
            var changeY = this.curveChangeY;

            this.curveMoved = false;

            if(serverId)
            {
                var msg: UserMoveElementMessage = {serverId: serverId, x: changeX, y: changeY};
                this.socket.emit('MOVE-CURVE', msg);
            }
            else
            {
                // TODO: Watch out for no server ID
            }
        }
        else if(this.textMoved)
        {
            this.textMoved = false;

            var tbox = this.getText(this.currTextMove);
            var serverId = tbox.serverId;
            var newX     = tbox.x;
            var newY     = tbox.y;

            if(serverId)
            {
                let msg: UserMoveElementMessage = {serverId: serverId, x: newX, y: newY};
                this.socket.emit('MOVE-TEXT', msg);
            }
            else
            {
                // TODO: Watch out for no server ID
            }
        }
        else if(this.textResized)
        {
            this.textResized = false;

            var tbox = this.getText(this.currTextResize);
            var serverId  = tbox.serverId;
            var newWidth  = tbox.width;
            var newHeight = tbox.height;

            if(serverId)
            {
                let msg: UserResizeTextMessage = {serverId: serverId, width: newWidth, height: newHeight};
                this.socket.emit('RESIZE-TEXT', msg);
            }
            else
            {
                // TODO: No server ID yet
            }
        }

        this.curveChangeX = 0;
        this.curveChangeY = 0;
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.pointList = [];
        this.moving = false;
        this.endMove();
    }

    touchUp = () : void =>
    {
        this.touchPress = false;
    }

    mouseDown = (e: MouseEvent) : void =>
    {
        if(!this.lMousePress && !this.wMousePress && !this.rMousePress)
        {
            this.lMousePress = e.buttons & 1 ? true : false;
            this.rMousePress = e.buttons & 2 ? true : false;
            this.wMousePress = e.buttons & 4 ? true : false;
            this.isPoint = true;
            var whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY  = elemRect.top - document.body.scrollTop;
            var offsetX  = elemRect.left - document.body.scrollLeft;
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            this.prevX = e.clientX;
            this.prevY = e.clientY;

            var newPoint: Point = {x: 0, y: 0};
            this.pointList = [];
            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);
            this.pointList[this.pointList.length] = newPoint;

            this.downPoint = {x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY)};

            if(e.buttons == 1 && !this.viewState.itemMoving)
            {
                if(this.currTextEdit > -1)
                {
                    var textBox = this.getText(this.currTextEdit);

                    this.cursorStart = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);
                    this.cursorEnd = this.cursorStart;
                    this.textDown = this.cursorStart;
                    this.changeTextSelect(this.currTextEdit, true);
                }
            }
        }
    }

    touchDown = () : void =>
    {
        this.touchPress = true;
    }

    mouseMove = (e: MouseEvent) : void =>
    {
        if(this.wMousePress)
        {
            var whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;

            var newPanX = this.panX + (this.prevX - e.clientX) * this.scaleF;
            var newPanY = this.panY + (this.prevY - e.clientY) * this.scaleF;
            var vBoxW = whitElem.clientWidth * this.scaleF;
            var vBoxH = whitElem.clientHeight * this.scaleF;

            this.prevX = e.clientX;
            this.prevY = e.clientY;

            if(newPanX < 0)
            {
                newPanX = 0;
            }
            if(newPanY < 0)
            {
                newPanY = 0;
            }
            this.panX = newPanX;
            this.panY = newPanY;
            var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;

            this.setViewBox(newVBox);
        }
        else if(this.lMousePress)
        {
            var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY  = elemRect.top - document.body.scrollTop;
            var offsetX  = elemRect.left - document.body.scrollLeft;
            var context  = whitElem.getContext('2d');
            var newPoint: Point = {x: 0, y: 0};

            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);

            // Mode 0 is draw mode, mode 1 is text mode.
            if(this.viewState.mode == 0)
            {
                if(this.pointList.length)
                {
                    if(Math.round(this.pointList[this.pointList.length - 1].x - newPoint.x) < this.scaleF || Math.round(this.pointList[this.pointList.length - 1].y - newPoint.y))
                    {
                        this.isPoint = false;

                        context.beginPath();
                        context.strokeStyle = this.viewState.colour;
                        context.moveTo(this.pointList[this.pointList.length - 1].x, this.pointList[this.pointList.length - 1].y);
                        context.lineTo(newPoint.x, newPoint.y);
                        context.stroke();

                        this.pointList[this.pointList.length] = newPoint;
                    }
                }
                else
                {
                    this.pointList[this.pointList.length] = newPoint;
                }
            }
            else if(this.viewState.mode == 1 && !this.rMousePress)
            {
                if(this.currTextResize != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;
                    var tbox = this.getText(this.currTextResize);

                    var newWidth  = this.horzResize ? tbox.width  + changeX : tbox.width;
                    var newHeight = this.vertResize ? tbox.height + changeY : tbox.height;

                    this.resizeText(this.currTextResize, newWidth, newHeight);

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.textResized = true;
                }
                else if(this.currTextMove != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;

                    this.moveTextbox(this.currTextMove, true, changeX, changeY);
                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.textMoved = true;
                }
                else if(this.currTextSel != -1)
                {
                    var textBox = this.getText(this.currTextEdit);
                    var newLoc = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);

                    if(this.textDown < newLoc)
                    {
                        this.cursorStart = this.textDown;
                        this.cursorEnd = newLoc;
                        this.startLeft = true;
                    }
                    else
                    {
                        this.cursorStart = newLoc;
                        this.cursorEnd = this.textDown;
                        this.startLeft = false;
                    }

                    this.changeTextSelect(this.currTextSel, true);
                }
                else
                {
                    var rectLeft;
                    var rectTop;
                    var rectWidth;
                    var rectHeight;

                    if(newPoint.x > this.downPoint.x)
                    {
                        rectLeft = this.downPoint.x;
                        rectWidth = newPoint.x - this.downPoint.x;
                    }
                    else
                    {
                        rectLeft = newPoint.x;
                        rectWidth = this.downPoint.x - newPoint.x;
                    }

                    if(newPoint.y > this.downPoint.y)
                    {
                        rectTop = this.downPoint.y;
                        rectHeight = newPoint.y - this.downPoint.y;
                    }
                    else
                    {
                        rectTop = newPoint.y;
                        rectHeight = this.downPoint.y - newPoint.y;
                    }

                    context.clearRect(0, 0, whitElem.width, whitElem.height);

                    if(rectWidth > 0 && rectHeight > 0)
                    {
                        context.beginPath();
                        context.strokeStyle = 'black';
                        context.setLineDash([5]);
                        context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
                        context.stroke();
                    }
                }
            }
            else if(this.viewState.mode == 3)
            {

                if(this.currCurveMove != -1)
                {
                    this.moveCurve(this.currCurveMove, (e.clientX - this.prevX) * this.scaleF, (e.clientY - this.prevY) * this.scaleF);

                    this.curveChangeX += (e.clientX - this.prevX) * this.scaleF;
                    this.curveChangeY += (e.clientY - this.prevY) * this.scaleF;

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;

                    this.curveMoved = true;
                }
                else if(this.currTextMove != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;

                    this.moveTextbox(this.currTextMove, true, changeX, changeY);

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.textMoved = true;
                }
            }
        }
    }

    touchMove = (e: TouchEvent) : void =>
    {
        if(this.touchPress)
        {

        }
    }

    windowResize = (e: DocumentEvent) : void =>
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var whitCont = document.getElementById("whiteboard-container");

        whitElem.style.width = whitCont.clientWidth + "px";
        whitElem.style.height = whitCont.clientHeight + "px";
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;

        var vBoxW = whitElem.clientWidth * this.scaleF;
        var vBoxH = whitElem.clientHeight * this.scaleF;
        var newPanX = this.panX;
        var newPanY = this.panY;

        var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;

        this.setViewBox(newVBox);
    }

    mouseWheel = (e: WheelEvent) : void =>
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var newPanX;
        var newPanY;
        var newScale;

        this.scaleNum = this.scaleNum - e.deltaY / 2;

        if(this.scaleNum < -5)
        {
            this.scaleNum = -5;
        }
        if(this.scaleNum > 5)
        {
            this.scaleNum = 5;
        }

        newScale = Math.pow(0.8, this.scaleNum);
        var vBoxW = whitElem.clientWidth * newScale;
        var vBoxH = whitElem.clientHeight * newScale;

        if(e.deltaY < 0)
        {
            // Zoom in behaviour.
            newPanX = this.panX + (e.clientX - whitElem.offsetLeft) * this.scaleF - vBoxW / 2;
            newPanY = this.panY + (e.clientY - whitElem.offsetTop) * this.scaleF - vBoxH / 2;
        }
        else
        {
            // Zoom out behaviour.
            newPanX = this.panX + 0.5 * whitElem.clientWidth * (this.scaleF - newScale);
            newPanY = this.panY + 0.5 * whitElem.clientHeight * (this.scaleF - newScale);
        }

        this.scaleF = newScale;

        if(newPanX < 0)
        {
            newPanX = 0;
        }
        if(newPanY < 0)
        {
            newPanY = 0;
        }

        this.panX = newPanX;
        this.panY = newPanY;
        var newVBox = '' + newPanX + ' ' + newPanY + ' ' + vBoxW + ' ' + vBoxH;

        this.setViewBox(newVBox);
    }

    keyDown = (e: KeyboardEvent) : void =>
    {
        if(this.isWriting)
        {
            var inputChar = e.key;
        }
    }

    keyUp = (e: KeyboardEvent) : void =>
    {

    }

    keyPress = (e: KeyboardEvent) : void =>
    {
        if(this.isWriting)
        {
            e.preventDefault();
            e.stopPropagation();
            var inputChar = e.key;
            var textItem: WhiteBoardText;
            var i: number;
            var line: TextNode;
            var style: StyleNode;


            switch(inputChar)
            {

            case 'ArrowLeft':
                textItem = this.getText(this.currTextEdit);

                var newStart = this.cursorStart;
                var newEnd = this.cursorEnd;

                if(this.cursorStart == this.cursorEnd || !this.startLeft)
                {
                    if(this.cursorStart > 0)
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
                            while(i > 0 && !textItem.text.charAt(i - 1).match(/\s/))
                            {
                                i--;
                            }

                            newStart = i;
                        }
                        else
                        {
                            if(newStart > 0)
                            {
                                newStart--;
                            }
                        }
                    }
                }
                else
                {
                    if(e.ctrlKey)
                    {
                        i = this.cursorEnd > 0 ? this.cursorEnd - 1 : 0;
                        while(i > 0 && !textItem.text.charAt(i - 1).match(/\s/))
                        {
                            i--;
                        }

                        newEnd = i;
                    }
                    else
                    {
                        if(newEnd > 0)
                        {
                            newEnd--;
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = false;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newStart > newEnd)
                    {
                        this.startLeft = false;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, true);
                break;
            case 'ArrowRight':
                textItem = this.getText(this.currTextEdit);

                var newStart = this.cursorStart;
                var newEnd = this.cursorEnd;

                if(this.cursorStart == this.cursorEnd || this.startLeft)
                {
                    if(this.cursorEnd < textItem.text.length)
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorEnd + 1;
                            while(i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/)))
                            {
                                i++;
                            }

                            newEnd = i;
                        }
                        else
                        {
                            if(newEnd < textItem.text.length)
                            {
                                newEnd++;
                            }
                        }
                    }
                }
                else
                {
                    if(e.ctrlKey)
                    {
                        i = this.cursorStart < textItem.text.length ? this.cursorStart + 1 : textItem.text.length;
                        while(i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/)))
                        {
                            i++;
                        }

                        newStart = i;
                    }
                    else
                    {
                        if(newStart < textItem.text.length)
                        {
                            newStart++;
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = true;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newStart > newEnd)
                    {
                        this.startLeft = true;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, true);
                break;
            case 'ArrowUp':
                textItem = this.getText(this.currTextEdit);

                var newStart: number;
                var newEnd: number;

                if(e.ctrlKey)
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        i = this.cursorEnd - 1;
                        while(i > 0 && !textItem.text.charAt(i - 1).match('\n'))
                        {
                            i--;
                        }

                        if(i < 0)
                        {
                            i = 0;
                        }

                        newStart = this.cursorStart;
                        newEnd = i;
                    }
                    else
                    {
                        i = this.cursorStart - 1;
                        while(i > 0 && !textItem.text.charAt(i - 1).match('\n'))
                        {
                            i--;
                        }

                        if(i < 0)
                        {
                            i = 0;
                        }

                        newStart = i;
                        newEnd = this.cursorEnd;
                    }
                }
                else
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        newStart = this.cursorStart;
                        // If the cursor is on the first line do nothng
                        if(this.cursorEnd <= textItem.textNodes[0].end)
                        {
                            newEnd = this.cursorEnd;
                        }
                        else
                        {
                            i = 1;
                            while(i < textItem.textNodes.length && this.cursorEnd > textItem.textNodes[i].end)
                            {
                                i++;
                            }
                            line = textItem.textNodes[i - 1];

                            i = 0;
                            while(i < line.styles.length && this.textIdealX >= line.styles[i].startPos)
                            {
                                i++;
                            }
                            var curr = i - 1;
                            style = line.styles[i - 1];


                            var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                            i = style.text.length - 1;
                            while(i > 0 && style.startPos + currMes > this.textIdealX)
                            {
                                i--;
                                currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                            }

                            // i and currMes is now the position to the right of the search point.
                            // We just need to check if left or right is closer then reurn said point.
                            if(i < style.text.length - 1)
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newEnd = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newEnd = line.start + style.locStart + i;
                                }
                            }
                            else if(curr + 1 < line.styles.length)
                            {

                                if(this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - this.textIdealX)
                                {
                                    newEnd = line.start + line.styles[curr + 1].locStart;
                                }
                                else
                                {
                                    newEnd = line.start + style.locStart + i;
                                }
                            }
                            else
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newEnd = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newEnd = line.start + style.locStart + i;
                                }
                            }
                        }
                    }
                    else
                    {
                        newEnd = this.cursorEnd;

                        if(this.cursorStart <= textItem.textNodes[0].end)
                        {
                            newStart = this.cursorStart;
                        }
                        else
                        {
                            i = 1;
                            while(i < textItem.textNodes.length && this.cursorStart > textItem.textNodes[i].end)
                            {
                                i++;
                            }
                            line = textItem.textNodes[i - 1];

                            i = 0;
                            while(i < line.styles.length && this.textIdealX >= line.styles[i].startPos)
                            {
                                i++;
                            }
                            var curr = i - 1;
                            style = line.styles[i - 1];


                            var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                            i = style.text.length - 1;
                            while(i > 0 && style.startPos + currMes > this.textIdealX)
                            {
                                i--;
                                currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                            }

                            // i and currMes is now the position to the right of the search point.
                            // We just need to check if left or right is closer then reurn said point.
                            if(i < style.text.length - 1)
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newStart = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newStart = line.start + style.locStart + i;
                                }
                            }
                            else if(curr + 1 < line.styles.length)
                            {

                                if(this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - this.textIdealX)
                                {
                                    newStart = line.start + line.styles[curr + 1].locStart;
                                }
                                else
                                {
                                    newStart = line.start + style.locStart + i;
                                }
                            }
                            else
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newStart = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newStart = line.start + style.locStart + i;
                                }
                            }
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = false;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newEnd < newStart)
                    {
                        this.startLeft = false;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        this.cursorStart = newEnd;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                    }
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, false);
                break;
            case 'ArrowDown':
                textItem = this.getText(this.currTextEdit);

                var newStart: number;
                var newEnd: number;

                if(e.ctrlKey)
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        i = this.cursorEnd + 1;
                        while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                        {
                            i++;
                        }

                        newStart = this.cursorStart;
                        newEnd = i;
                    }
                    else
                    {
                        i = this.cursorStart + 1;
                        while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                        {
                            i++;
                        }

                        newStart = i;
                        newEnd = this.cursorEnd;
                    }
                }
                else
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        newStart = this.cursorStart;
                        // If the cursor is on the last line do nothng
                        if(this.cursorEnd >= textItem.textNodes[textItem.textNodes.length - 1].start)
                        {
                            newEnd = this.cursorEnd;
                        }
                        else
                        {
                            i = 0;
                            while(i < textItem.textNodes.length - 1 && this.cursorEnd > textItem.textNodes[i].end)
                            {
                                i++;
                            }
                            line = textItem.textNodes[i + 1];

                            i = 0;
                            while(i < line.styles.length && this.textIdealX >= line.styles[i].startPos)
                            {
                                i++;
                            }
                            var curr = i - 1;
                            style = line.styles[i - 1];


                            var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                            i = style.text.length - 1;
                            while(i > 0 && style.startPos + currMes > this.textIdealX)
                            {
                                i--;
                                currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                            }

                            // i and currMes is now the position to the right of the search point.
                            // We just need to check if left or right is closer then reurn said point.
                            if(i < style.text.length - 1)
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newEnd = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newEnd = line.start + style.locStart + i;
                                }
                            }
                            else if(curr + 1 < line.styles.length)
                            {

                                if(this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - this.textIdealX)
                                {
                                    newEnd = line.start + line.styles[curr + 1].locStart;
                                }
                                else
                                {
                                    newEnd = line.start + style.locStart + i;
                                }
                            }
                            else
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newEnd = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newEnd = line.start + style.locStart + i;
                                }
                            }
                        }
                    }
                    else
                    {
                        newEnd = this.cursorEnd;

                        if(this.cursorStart >= textItem.textNodes[textItem.textNodes.length - 1].start)
                        {
                            newStart = this.cursorStart;
                        }
                        else
                        {
                            i = 0;
                            while(i < textItem.textNodes.length - 1 && this.cursorStart > textItem.textNodes[i].end)
                            {
                                i++;
                            }
                            line = textItem.textNodes[i + 1];

                            i = 0;
                            while(i < line.styles.length && this.textIdealX >= line.styles[i].startPos)
                            {
                                i++;
                            }
                            var curr = i - 1;
                            style = line.styles[i - 1];


                            var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
                            i = style.text.length - 1;
                            while(i > 0 && style.startPos + currMes > this.textIdealX)
                            {
                                i--;
                                currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
                            }

                            // i and currMes is now the position to the right of the search point.
                            // We just need to check if left or right is closer then reurn said point.
                            if(i < style.text.length - 1)
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newStart = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newStart = line.start + style.locStart + i;
                                }
                            }
                            else if(curr + 1 < line.styles.length)
                            {

                                if(this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - this.textIdealX)
                                {
                                    newStart = line.start + line.styles[curr + 1].locStart;
                                }
                                else
                                {
                                    newStart = line.start + style.locStart + i;
                                }
                            }
                            else
                            {
                                if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
                                {
                                    newStart = line.start + style.locStart + i + 1;
                                }
                                else
                                {
                                    newStart = line.start + style.locStart + i;
                                }
                            }
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = true;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newEnd < newStart)
                    {
                        this.startLeft = true;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        this.cursorStart = newEnd;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                    }
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, false);
                break;
            case 'Backspace':
                textItem = this.getText(this.currTextEdit);

                if(this.cursorEnd > 0)
                {
                    if(e.ctrlKey)
                    {
                        if(this.cursorStart > 0)
                        {
                            // TODO: Move to start of previous word
                        }
                    }
                    else
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.cursorStart--;
                        }

                        var prevEnd = this.cursorEnd;
                        var startText = textItem.text.slice(0, this.cursorStart);
                        var endText = textItem.text.slice(this.cursorEnd, textItem.text.length);

                        var fullText = startText + endText;

                        var styles = [];

                        for(i = 0; i < textItem.styles.length; i++)
                        {
                            var sty = textItem.styles[i];

                            if(sty.start >= this.cursorStart)
                            {
                                if(sty.start >= this.cursorEnd)
                                {
                                    // Completely after selection
                                    if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                                        && styles[styles.length - 1].decoration == sty.decoration
                                        && styles[styles.length - 1].weight == sty.weight
                                        && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= 200)
                                    {
                                        // If this is the same as the previous style and are length compatible then combine
                                        styles[styles.length - 1].end += sty.end - sty.start;
                                        styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                                    }
                                    else
                                    {
                                        sty.start -= this.cursorEnd - this.cursorStart;
                                        sty.end -= this.cursorEnd - this.cursorStart;
                                        sty.text = fullText.slice(sty.start, sty.end);
                                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                                    }
                                }
                                else
                                {
                                    if(sty.end > this.cursorEnd)
                                    {
                                        // End stradle
                                        if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                                            && styles[styles.length - 1].decoration == sty.decoration
                                            && styles[styles.length - 1].weight == sty.weight
                                            && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - this.cursorEnd <= 200)
                                        {
                                            // If this is the same as the previous style and are length compatible then combine
                                            styles[styles.length - 1].end += sty.end - this.cursorEnd;
                                            styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                                        }
                                        else
                                        {
                                            sty.end +=  this.cursorStart - this.cursorEnd;
                                            sty.start = this.cursorStart;
                                            sty.text = fullText.slice(sty.start, sty.end);
                                            styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                                        }

                                    }

                                    // Otherwise we don't push it as it is removed by the selection.
                                }
                            }
                            else
                            {
                                if(sty.end > this.cursorStart)
                                {
                                    if(sty.end > this.cursorEnd)
                                    {
                                        // Selection within style
                                        sty.end -= this.cursorEnd - this.cursorStart;
                                        sty.text = fullText.slice(sty.start, sty.end);
                                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                                    }
                                    else
                                    {
                                        // Start stradle
                                        sty.end = this.cursorStart;
                                        sty.text = fullText.slice(sty.start, sty.end);
                                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                                    }
                                }
                                else
                                {
                                    // Completely before selection
                                    sty.text = fullText.slice(sty.start, sty.end);
                                    styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                                }
                            }
                        }

                        textItem.styles = styles;
                        textItem.text = fullText;
                    }

                    this.cursorEnd = this.cursorStart;

                    textItem = this.newEdit(textItem);
                    if(this.cursorEnd > 0)
                    {
                        this.calculateLengths(textItem, this.cursorEnd - 1, this.cursorEnd, prevEnd);
                    }
                    else if(textItem.text.length > 0)
                    {
                        this.calculateLengths(textItem, this.cursorEnd, this.cursorEnd + 1, prevEnd + 1);
                    }
                    textItem.textNodes = this.calculateTextLines(textItem);
                }

                this.updateText(this.currTextEdit, textItem);
                break;
            case 'Enter':
                inputChar = '\n';
            default:
                textItem = this.getText(this.currTextEdit);

                if(e.ctrlKey)
                {
                    // TODO: Ctrl combos
                }
                else
                {
                    var isNew = true;
                    var extend = -1;
                    var prevEnd = this.cursorEnd;
                    var textStart = textItem.text.slice(0, this.cursorStart);
                    var textEnd = textItem.text.slice(this.cursorEnd, textItem.text.length);
                    var styles = [];

                    for(var i = 0; i < textItem.styles.length; i++)
                    {
                        var sty = textItem.styles[i];
                        styles[i] = {start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text};
                    }

                    textItem.text = textStart + inputChar + textEnd;

                    for(var i = 0; i < styles.length; i++)
                    {
                        if(styles[i].end > this.cursorStart)
                        {
                            if(styles[i].start >= this.cursorEnd)
                            {
                                // This style is all after the selected text.
                                if(styles[i].start == this.cursorEnd && this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + 1) <= 200)
                                {
                                    isNew = false;
                                    styles[i].start += (this.cursorStart - this.cursorEnd);
                                }
                                else
                                {
                                    styles[i].start += (this.cursorStart - this.cursorEnd) + 1;
                                }

                                styles[i].end += (this.cursorStart - this.cursorEnd) + 1;
                            }
                            else if(styles[i].start >= this.cursorStart)
                            {
                                // The style starts after the cursor
                                if(styles[i].end > this.cursorEnd)
                                {
                                    // The style stradles the right side of the selection.
                                    styles[i].start = this.cursorStart + 1;
                                    styles[i].end += (this.cursorStart - this.cursorEnd) + 1;
                                    if(this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + 1) <= 200)
                                    {
                                        isNew = false;
                                        styles[i].start--;
                                    }
                                }
                                else
                                {
                                    // The syle is completely within the cursor selection.
                                    if(this.isCurrentStyle(styles[i]) && isNew)
                                    {
                                        isNew = false;
                                        styles[i].start = this.cursorStart;
                                        styles[i].end = this.cursorStart + 1;
                                    }
                                    else
                                    {
                                        // Remove this style.
                                        styles.splice(i, 1);
                                        i--;
                                    }
                                }
                            }
                            else
                            {
                                // The style starts before the cursor.
                                if(styles[i].end >= this.cursorEnd)
                                {
                                    // The cursor selection is completely within the style.
                                    if(this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - (this.cursorEnd - this.cursorStart) - styles[i].start + 1) <= 200)
                                    {
                                        isNew = false;
                                        styles[i].end += (this.cursorStart - this.cursorEnd) + 1;
                                    }
                                    else
                                    {
                                        // Split this style ready for the new style.
                                        var newSplit =
                                        {
                                            start: this.cursorStart + 1, end: styles[i].end - (this.cursorEnd - this.cursorStart) + 1, decoration: styles[i].decoration,
                                            weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour
                                        };

                                        styles[i].end = this.cursorStart;
                                        styles.splice(i + 1, 0, newSplit);
                                        i++;
                                    }
                                }
                                else
                                {
                                    // The style stradles the left hand side of the selection.
                                    if(this.isCurrentStyle(styles[i]) && isNew && (this.cursorStart - styles[i].start + 1) <= 200)
                                    {
                                        isNew = false;
                                        styles[i].end = this.cursorStart + 1;
                                    }
                                    else
                                    {
                                        styles[i].end = this.cursorStart;
                                    }
                                }
                            }
                        }
                        else if(styles[i].end == this.cursorStart)
                        {
                            if(this.isCurrentStyle(styles[i]) && isNew  && (styles[i].end - styles[i].start + 1) <= 200)
                            {
                                isNew = false;
                                styles[i].end = this.cursorStart + 1;
                            }
                        }

                        styles[i].text = textItem.text.slice(styles[i].start, styles[i].end);
                    }

                    if(isNew)
                    {
                        i = 0;

                        while(i < styles.length && styles[i].end < this.cursorStart)
                        {
                            i++
                        }

                        var newStyle =
                        {
                            start: this.cursorStart, end: this.cursorStart + 1, decoration: this.getDecoration(),
                            weight: this.getWeight(), style: this.getStyle(), colour: this.viewState.colour,
                            text: textItem.text.slice(this.cursorStart, this.cursorStart + 1)
                        };

                        styles.splice(i + 1, 0, newStyle);
                    }


                    this.cursorStart++;
                    this.cursorEnd = this.cursorStart;

                    textItem.styles = styles;

                    textItem = this.newEdit(textItem);
                    this.calculateLengths(textItem, this.cursorEnd - 1, this.cursorEnd, prevEnd);

                    this.updateText(this.currTextEdit, textItem);
                }
                break;
            }
        }
    }
}
