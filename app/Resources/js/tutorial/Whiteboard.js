/*
 *
 *
 *
 *
 *
 */
var SVGBezier = React.createClass({displayName: 'SVGBezier',
render: function()
{
    var items = [];
    var self = this;

    if(this.props.type == 'circle')
    {
        if(this.props.mode == 2)
        {
            items.push(React.createElement('circle',
            {
                key: 'delete', cx: this.props.x, cy: this.props.y, r: this.props.size * 3, fill: this.props.colour,
                onClick: self.props.mouseClick, opacity: 0
            }));
        }
        else if(this.props.mode == 3 && !this.props.isMoving)
        {
            items.push(React.createElement('circle',
            {
                key: 'move', cx: this.props.x, cy: this.props.y, r: this.props.size * 3, fill: this.props.colour,
                onMouseDown: self.props.mouseDown, opacity: 0, cursor: 'move'
            }));
        }

        items.push(React.createElement('circle',
        {
            key: 'display', cx: this.props.x, cy: this.props.y, r: this.props.size, fill: this.props.colour, stroke: this.props.colour,
            onMouseMove: self.props.mouseMove
        }));

        return React.createElement('g', null, items);
    }
    else if(this.props.type == 'path')
    {
        if(this.props.mode == 2)
        {
            items.push(React.createElement('path',
            {
                key: 'delete', d: this.props.param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size * 3, strokeLinecap: 'round',
                onClick: this.props.mouseClick, opacity: 0, pointerEvents: 'stroke'
            }));
        }
        else if(this.props.mode == 3 && !this.props.isMoving)
        {
            items.push(React.createElement('path',
            {
                key: 'move', d: this.props.param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size * 3, strokeLinecap: 'round',
                onMouseDown: this.props.mouseDown, opacity: 0, cursor: 'move', pointerEvents: 'stroke'
            }));
        }

        items.push(React.createElement('path',
        {
            key: 'display', d: this.props.param, fill: 'none', stroke: this.props.colour, strokeWidth: this.props.size, strokeLinecap: 'round',
            onMouseMove: this.props.mouseMove
        }));

        return React.createElement('g', null, items);
    }
    else
    {
        console.error('ERROR: Unrecognized type for SVGBezier.');
    }
}
});


/*
 *
 *
 *
 *
 *
 */
var SVGText = React.createClass({displayName: 'SVGText',
render: function()
{
    var hightLightBoxes = [];
    var borderBoxes = [];
    var selCount = 0;
    var self = this;

    var tspanElems = this.props.textNodes.map(function (textElem)
    {
        var styleNodeElems = textElem.styles.map(function (node)
        {
            if(node.text.match(/\s/))
            {
                return React.createElement('tspan', {key: node.key, dx: node.dx}, node.text);
            }
            else
            {
                return React.createElement('tspan', {key: node.key, fill: node.colour, dx: node.dx, fontWeight: node.weight, fontStyle: node.style, textDecoration: node.decoration}, node.text);
            }
        });


        return React.createElement('tspan',
        {
            key: textElem.id, x: textElem.x, y: textElem.y, xmlSpace: 'preserve'}, styleNodeElems
        );
    });


    if(this.props.mode == 3 && !this.props.isMoving && !this.props.remEdit)
    {
        borderBoxes.push(React.createElement('rect',
        {
            key: 'move', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
            fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
            onMouseDown: this.props.mouseMoveDown
        }));

        borderBoxes.push(React.createElement('rect',
        {
            key: 'selBox', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height, fill: 'none', opacity: 0, pointerEvents: 'fill',
            onClick: function(e) { if(e.detail == 2) { self.props.doubleClick(); } }
        }));
    }

    if(this.props.isEditing)
    {
        hightLightBoxes.push(React.createElement('line',
        {
            x1: this.props.cursor.x, y1: this.props.cursor.y,
            x2: this.props.cursor.x, y2: this.props.cursor.y + this.props.cursor.height,
            stroke: 'black', strokeWidth: 1, className: 'blinking', key: 'cursor'
        }));

        for(var i = 0; i < this.props.cursorElems.length; i++)
        {
            var selElem = this.props.cursorElems[i];
            selCount++;
            hightLightBoxes.push(React.createElement('rect',
            {
                x: selElem.x, y: selElem.y, width: selElem.width, height: selElem.height,
                fill: '#0066ff', stroke: 'none', fillOpacity: 0.3, key: selCount
            }));
        }

        borderBoxes.push(React.createElement('rect',
        {
            key: 'locEdit', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
            fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
        }));

        if(!this.props.isMoving)
        {
            borderBoxes.push(React.createElement('line',
            {
                key: 'moveTop', x1: this.props.x, y1: this.props.y, x2: this.props.x + this.props.width - this.props.size * 0.25, y2: this.props.y,
                fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                onMouseDown: this.props.mouseMoveDown
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'moveLeft', x1: this.props.x, y1: this.props.y, x2: this.props.x, y2: this.props.y + this.props.height - this.props.size * 0.25,
                fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                onMouseDown: this.props.mouseMoveDown
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'resizeBottom', x1: this.props.x, y1: this.props.y + this.props.height, x2: this.props.x + this.props.width - this.props.size * 0.25, y2: this.props.y + this.props.height,
                fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, true, false); }
            }));

            borderBoxes.push(React.createElement('line',
            {
                key: 'resizeRight', x1: this.props.x + this.props.width, y1: this.props.y, x2: this.props.x + this.props.width, y2: this.props.y + this.props.height - this.props.size * 0.25,
                fill: 'none', strokeWidth: this.props.size * 0.5, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, false, true); }
            }));

            borderBoxes.push(React.createElement('rect',
            {
                key: 'resizeCorner', x: this.props.x + this.props.width - this.props.size * 0.25, y: this.props.y  + this.props.height - this.props.size * 0.25,
                width: this.props.size * 0.5, height: this.props.size * 0.5, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                onMouseDown: function(e) { self.props.mouseResizeDown(e, true, true); }
            }));
        }
    }
    else if(this.props.getLock)
    {
        borderBoxes.push(React.createElement('rect',
        {
            key: 'getEdit', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height, fill: 'none', stroke: 'red', strokeWidth: 2
        }));
    }
    else if(this.props.remEdit)
    {
        borderBoxes.push(React.createElement('rect',
        {
            key: 'remEdit', x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height,
            fill: 'none', stroke: 'red', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
        }));
    }

    var displayElement;

    if(this.props.isEditing)
    {
        displayElement = React.createElement('text',
        {
            className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size
        }, tspanElems);
    }
    else if(this.props.mode == 3 && !this.props.isMoving)
    {

        displayElement = React.createElement('text',
        {
            className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size
        }, tspanElems);
    }
    else if(this.props.mode == 2)
    {
        displayElement = React.createElement('text',
        {
            className: 'noselect', cursor: 'normal', x: this.props.x, y: this.props.y, fontSize: this.props.size,
            onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove
        }, tspanElems);
    }
    else
    {
        displayElement = React.createElement('text',
        {
            className: 'noselect', cursor: 'normal', x: this.props.x, y: this.props.y, fontSize: this.props.size, pointerEvents: 'none'
        }, tspanElems);
    }

    return React.createElement('g', null, hightLightBoxes, displayElement, borderBoxes);
}
});


/*
 *
 *
 *
 *
 *
 */
var SVGComponent = React.createClass({displayName: 'SVGComponent',
getInitialState: function()
{
    this.moveStateLoc = [];
    this.moveStateRem = [];
    return null;
},
render: function()
{
    var displayElements = [];
    var self = this;

    for(var i = 0; i < this.props.displayElements.length; i++)
    {
        var element = this.props.displayElements[i];

        if(!element.isDeleted)
        {
            if(element.type == 'text')
            {
                displayElements.push(React.createElement(SVGText,
                {
                    key: i, colour: element.colour, size: element.size, x: element.x, y: element.y, width: element.width, height: element.height,
                    mode: this.props.mode, isMoving: this.props.isMoving, isEditing: element.isEditing, cursor: element.cursor,
                    cursorElems: element.cursorElems, textNodes: element.data, remEdit: element.remEdit, getLock: element.getLock,
                    mouseClick:  (function(id) { return function()  {  self.props.textClickCall(id);   }; })(i),
                    doubleClick: (function(id) { return function()  {  self.props.textDblClick(id);    }; })(i),
                    mouseMove:   (function(id) { return function()  {  self.props.textMoveCall(id);    }; })(i),
                    mouseMoveDown:   (function(id) { return function(e) { self.props.textMouseMoveDown(id, e); }; })(i),
                    mouseResizeDown: (function(id) { return function(e, vert, horz) { self.props.textMouseResizeDown(id, vert, horz, e); }; })(i)
                }));
            }
            else if(element.type == 'circle')
            {
                displayElements.push(React.createElement(SVGBezier,
                {
                    key: i, x: element.point.x, y: element.point.y, colour: element.colour, size: element.size, mode: this.props.mode, type: 'circle',
                    isMoving: this.props.isMoving,
                    mouseMove:   (function(id) { return function() { self.props.curveMoveCall(id);  }; })(i),
                    mouseClick:  (function(id) { return function()  { self.props.curveClickCall(id);  }; })(i),
                    mouseDown:   (function(id) { return function(e) { self.props.curveMouseDown(id, e); }; })(i)
                }));
            }
            else if(element.type == 'path')
            {
                displayElements.push(React.createElement(SVGBezier,
                {
                    key: i, param: element.param, colour: element.colour, size: element.size, mode: this.props.mode, type: 'path',
                    isMoving: this.props.isMoving,
                    mouseMove:   (function(id) { return function() { self.props.curveMoveCall(id);  }; })(i),
                    mouseClick:  (function(id) { return function()  { self.props.curveClickCall(id);  }; })(i),
                    mouseDown:   (function(id) { return function(e) { self.props.curveMouseDown(id, e); }; })(i)
                }));
            }
        }
    }

    return React.createElement('svg', { className: 'svgcomponent', id: 'whiteBoard-output', viewBox: this.props.viewBox}, displayElements);
}
});


/*
 *
 *
 *
 *
 *
 */
var ControlComponent = React.createClass({displayName: 'ControlComponent',
getInitialState: function()
{
    // TODO: Do not change state values if callback is not in props
    this.colourCallback = function(colour) {};
    return {colour: 'black', bold: false, italic: false, uline: false, tline: false, oline: false};
},
onBlack: function()
{
    this.setState({colour: 'black'});
    this.colourCallback('black');
},
onBlue: function()
{
    this.setState({colour: 'blue'});
    this.colourCallback('blue');
},
onRed: function()
{
    this.setState({colour: 'red'});
    this.colourCallback('red');
},
onGreen: function()
{
    this.setState({colour: 'green'});
    this.colourCallback('green');
},
onDrawMode: function()
{
    this.props.modeCallback(0);
},
onTextMode: function()
{
    this.props.modeCallback(1);
},
onEraseMode: function()
{
    this.props.modeCallback(2);
},
onSelectMode: function()
{
    this.props.modeCallback(3);
},
onToggleBold: function()
{
    // NOTE: setState is an Async callback, we can only assume current value, not value after setState.
    if(!this.state.bold)
    {
        this.props.weightCallback('bold');
    }
    else
    {
        this.props.weightCallback('normal');
    }
    this.setState({bold: !this.state.bold});
},
onToggleItalic: function()
{
    // NOTE: setState is an Async callback, we can only assume current value, not value after setState.
    if(!this.state.italic)
    {
        this.props.styleCallback('italic');
    }
    else
    {
        this.props.styleCallback('normal');
    }
    this.setState({italic: !this.state.italic});
},
onToggleULine: function()
{
    var retVal = 'none';

    if(!this.state.uline)
    {
        retVal = 'underline';
    }

    this.props.decorationCallback(retVal);
    this.setState({uline: !this.state.uline, tline: false, oline: false});
},
onToggleTLine: function()
{
    var retVal = 'none';

    if(!this.state.tline)
    {
        retVal = 'line-through';
    }

    this.props.decorationCallback(retVal);
    this.setState({tline: !this.state.tline, uline: false, oline: false});
},
onToggleOLine: function()
{
    var retVal = 'none';

    if(!this.state.oline)
    {
        retVal = 'overline';
    }

    this.props.decorationCallback(retVal);
    this.setState({oline: !this.state.oline, uline: false, tline: false});
},
onToggleJustify: function()
{
    this.props.justifiedCallback();
},
render: function()
{
    var blackButt  = React.createElement('button', {className: 'button colour-button', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onBlack});
    var blueButt   = React.createElement('button', {className: 'button colour-button', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onBlue});
    var redButt    = React.createElement('button', {className: 'button colour-button', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onRed});
    var greenButt  = React.createElement('button', {className: 'button colour-button', id: 'green-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onGreen});
    var drawButt   = React.createElement('button', {className: 'button mode-button', id: 'draw-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onDrawMode}, 'D');
    var textButt   = React.createElement('button', {className: 'button mode-button', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onTextMode}, 'T');
    var eraseButt = React.createElement('button', {className: 'button mode-button', id: 'erase-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onEraseMode}, 'E');
    var selectButt = React.createElement('button', {className: 'button mode-button', id: 'select-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onSelectMode}, 'S');
    var boldButt;
    var italButt;
    var ulineButt;
    var tlineButt;
    var olineButt;
    var justButt;

    this.colourCallback = this.props.colourCallback;

    if(this.state.colour == 'black')
    {
        blackButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'black-button'});
    }
    else if(this.state.colour == 'blue')
    {
        blueButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'blue-button'});
    }
    else if(this.state.colour == 'red')
    {
        redButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'red-button'});
    }
    else if(this.state.colour == 'green')
    {
        greenButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'green-button'});
    }

    if(this.props.mode == 0)
    {
        drawButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'draw-button'}, 'D');
    }
    else if(this.props.mode == 1)
    {
        textButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'text-button'}, 'T');
    }
    else if(this.props.mode == 2)
    {
        eraseButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'erase-button'}, 'E');
    }
    else if(this.props.mode == 3)
    {
        selectButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'select-button'}, 'S');
    }

    if(this.state.bold)
    {
        boldButt = React.createElement('button', {className: 'button style-button pressed-style', id: 'bold-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleBold}, 'B');
    }
    else
    {
        boldButt = React.createElement('button', {className: 'button style-button', id: 'bold-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleBold}, 'B');
    }

    if(this.state.italic)
    {
        italButt = React.createElement('button', {className: 'button style-button pressed-style', id: 'italic-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleItalic}, 'I');
    }
    else
    {
        italButt = React.createElement('button', {className: 'button style-button', id: 'italic-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleItalic}, 'I');
    }

    if(this.state.uline)
    {
        ulineButt = React.createElement('button', {className: 'button style-button pressed-style', id: 'uline-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleULine}, 'U');
    }
    else
    {
        ulineButt = React.createElement('button', {className: 'button style-button', id: 'uline-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleULine}, 'U');
    }
    if(this.state.tline)
    {
        tlineButt = React.createElement('button', {className: 'button style-button pressed-style', id: 'tline-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleTLine}, 'T');
    }
    else
    {
        tlineButt = React.createElement('button', {className: 'button style-button', id: 'tline-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleTLine}, 'T');
    }
    if(this.state.oline)
    {
        olineButt = React.createElement('button', {className: 'button style-button pressed-style', id: 'oline-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleOLine}, 'O');
    }
    else
    {
        olineButt = React.createElement('button', {className: 'button style-button', id: 'oline-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleOLine}, 'O');
    }

    if(this.props.justified)
    {
        justButt = React.createElement('button', {className: 'button style-button pressed-style', id: 'justify-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleJustify}, 'J');
    }
    else
    {
        justButt = React.createElement('button', {className: 'button style-button', id: 'justify-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: this.onToggleJustify}, 'J');
    }

    var colourCont = React.createElement('div', {className: 'whiteboard-controlgroup', id: 'whiteboard-colourgroup'}, blackButt, blueButt, redButt, greenButt);
    var modeCont = React.createElement('div', {className: 'whiteboard-controlgroup', id: 'whiteboard-modegroup'}, drawButt, textButt, eraseButt, selectButt);
    var styleCont = React.createElement('div', {className: 'whiteboard-controlgroup', id: 'whiteboard-stylegroup'}, boldButt, italButt, ulineButt, tlineButt, olineButt, justButt);

    return React.createElement('div', {className: 'large-1 small-2 columns', id: 'whiteboard-controler'}, colourCont, modeCont, styleCont);
}});


/*
 *
 *
 *
 *
 *
 */
var Whiteboard = React.createClass({displayName: 'Whiteboard',
getInitialState: function()
{
    this.isHost = false;
    this.userId = 0;

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
    this.downPoint = {};
    this.curveChangeX = 0;
    this.curveChangeY = 0;

    this.textDecoration = 'none';
    this.textStyle = 'normal';
    this.textWeight = 'normal';
    this.colour = 'black';
    this.baseSize = 1;

    this.currTextEdit = -1;
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
    this.textParam = {};

    this.textDict   = [];
    this.curveDict  = [];
    this.boardElems = [];
    this.curveOutBuffer = [];
    this.curveInBuffer = [];
    this.curveInTimeouts = [];
    this.curveOutTimeouts = [];
    this.textOutBuffer = [];
    this.textInBuffer = [];

    return {data: [], viewBox: null, mode: 0, justified: true, currTextMove: -1, currCurveMove: -1, currResize: -1, displayElements: []};
},
completeEdit: function(textId, userId, editId)
{
    var textItem;
    var fullText = '';
    var localId = this.textDict[textId];
    var editData = this.textInBuffer[textId].editBuffer[userId][editId];

    textItem = this.boardElems[localId];
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
    this.calculateLengths(textItem, 0, fullText.length);
    textItem.textNodes = this.calculateTextLines(textItem);

    var newList = this.state.displayElements.slice();
    newList[localId].data = textItem.textNodes;
    this.setState({displayElements: newList});
},
createCurveText: function(curve)
{
    var param =     "M" + curve[0].x + "," + curve[0].y;
    param = param +" C" + curve[1].x + "," + curve[1].y;
    param = param + " " + curve[2].x + "," + curve[2].y;
    param = param + " " + curve[3].x + "," + curve[3].y;

    for(i = 4; i + 2 < curve.length; i += 3)
    {
        param = param +" C" + curve[i + 0].x + "," + curve[i + 0].y;
        param = param + " " + curve[i + 1].x + "," + curve[i + 1].y;
        param = param + " " + curve[i + 2].x + "," + curve[i + 2].y;
    }

    return param;
},
setSocket: function(socket)
{
    var self = this;
    this.socket = socket;

    this.currTextEdit = -1;

    this.socket.on('CURVE', function(data)
    {
        if(!self.curveDict[data.serverId] && !self.curveInBuffer[data.serverId])
        {
            // Set up the buffers to recieve data.
            self.curveInBuffer[data.serverId] = data;
            self.curveInBuffer[data.serverId].points = [];
            self.curveInBuffer[data.serverId].num_recieved = 0;

            clearInterval(self.curveInTimeouts[data.serverId]);
            self.curveInTimeouts[data.serverId] = setInterval(function()
            {
                for(var j = 0; j < self.curveInBuffer[data.serverId].num_points; j++)
                {
                    if(!self.curveInBuffer[data.serverId].points[j])
                    {
                        console.log('Sending Missing message.');
                        self.socket.emit('MISSING-CURVE', {id: data.serverId, seq_num: j});
                    }
                }
            }, 30000);
        }
    });
    this.socket.on('POINT', function(data)
    {
        // Make sure we know about this curve.
        if(self.curveInBuffer[data.id] && self.curveInBuffer[data.id].num_recieved != self.curveInBuffer[data.id].num_points)
        {
            if(!self.curveInBuffer[data.id].points[data.num])
            {
                self.curveInBuffer[data.id].points[data.num] = {x: data.x, y: data.y};
                self.curveInBuffer[data.id].num_recieved++;
            }

            if(self.curveInBuffer[data.id].num_recieved == self.curveInBuffer[data.id].num_points)
            {
                clearInterval(self.curveInTimeouts[data.id]);

                var newCurve =
                {
                    user: self.curveInBuffer[data.id].userId, isDeleted: false, colour: self.curveInBuffer[data.id].colour,
                    size: self.curveInBuffer[data.id].size, curveSet: self.curveInBuffer[data.id].points, serverId: data.id
                };

                var localId = self.boardElems.length;
                self.boardElems[localId] = newCurve;
                newCurve.id = localId;
                self.curveDict[data.id] = localId;

                var newList = self.state.displayElements.slice();
                if(self.curveInBuffer[data.id].points.length > 1)
                {
                    var pathText = self.createCurveText(self.curveInBuffer[data.id].points);
                    newList[localId] = {type: 'path', id: localId, size: newCurve.size, colour: newCurve.colour, isDeleted: false, param: pathText };
                }
                else
                {
                    newList[localId] = { type: 'circle', id: localId, size: newCurve.size, colour: newCurve.colour, isDeleted: false, point: self.curveInBuffer[data.id].points[0] };
                }
                self.setState({displayElements: newList});
            }
        }
        else
        {
            clearInterval(self.curveInTimeouts[data.id]);

            // Request curve data.
            self.socket.emit('UNKNOWN-CURVE', data.id);
        }
    });
    this.socket.on('IGNORE-CURVE', function(curveId)
    {
        clearInterval(self.curveInTimeouts[curveId]);
    });
    this.socket.on('CURVEID', function(data)
    {
        self.curveOutBuffer[data.localId].serverId = data.serverId;

        clearInterval(self.curveOutTimeouts[data.localId]);

        // Send the points for this curve.
        for(var i = 0; i < self.curveOutBuffer[data.localId].curveSet.length; i++)
        {
            var curve = self.curveOutBuffer[data.localId].curveSet[i];
            self.socket.emit('POINT', {id: data.serverId, num: i, x: curve.x, y: curve.y});
        }


        self.boardElems[data.localId].serverId = data.serverId;
        self.curveDict[data.serverId] = data.localId
    });
    this.socket.on('MISSED-CURVE', function(data)
    {
        // The server has not recieced this point, find it and send it.
        var curve;

        for(var i = 0; i < self.curveOutBuffer.length; i++)
        {
            if(self.curveOutBuffer[i].serverId == data.curve)
            {
                curve  = self.curveOutBuffer[i].curveSet[data.point];
            }
        }

        self.socket.emit('POINT', {id: data.curve, num: data.point, x: curve.x, y: curve.y});
    });
    this.socket.on('DROPPED-CURVE', function(data)
    {
        // TODO: We need to stop trying to get it.
    });
    this.socket.on('MOVE-CURVE', function(data)
    {
        var localId = self.curveDict[data.id];
        var curve = self.boardElems[localId];

        for(var i = 0; i < curve.curveSet.length; i++)
        {
            curve.curveSet[i].x += data.changeX;
            curve.curveSet[i].y += data.changeY;
        }

        var newList = self.state.displayElements.slice();
        if(self.curveInBuffer[data.id].points.length > 1)
        {
            var pathText = self.createCurveText(self.curveInBuffer[data.id].points);
            newList[localId].param = pathText;
        }
        else
        {
            newList[localId].point = self.curveInBuffer[data.id].points;
        }
        self.setState({displayElements: newList});
    });
    this.socket.on('DELETE-CURVE', function(curveId)
    {
        var localId = self.curveDict[curveId];
        self.boardElems[localId].isDeleted;

        var newList = self.state.displayElements.slice();
        newList[localId].isDeleted = true;
        self.setState({displayElements: newList});
    });
    this.socket.on('TEXTBOX', function(data)
    {
        // Set up the buffers to recieve data.
        if(self.textInBuffer[data.serverId])
        {
            data.editBuffer = self.textInBuffer[data.serverId].editBuffer;
        }
        else
        {
            self.textInBuffer[data.serverId] = data;
            self.textInBuffer[data.serverId].styles = [];
            data.editBuffer = [];
        }

        var localId = self.textDict[data.serverId];

        if(!localId)
        {
            localId = self.boardElems.length;
            self.textDict[data.serverId] = localId;
            self.boardElems[localId] = {};
            self.boardElems[localId].id = localId;
            self.boardElems[localId].serverId = data.serverId;
            self.boardElems[localId].styles = [];
            self.boardElems[localId].textNodes = [];
            self.boardElems[localId].text = '';
            self.boardElems[localId].dist = [0];
            self.boardElems[localId].user = data.userId;
            self.boardElems[localId].isDeleted = false;
            self.boardElems[localId].x = data.posX;
            self.boardElems[localId].y = data.posY;
            self.boardElems[localId].size = data.size;
            self.boardElems[localId].editCount = 0;
            self.boardElems[localId].width = data.width;
            self.boardElems[localId].height = data.height;
            self.boardElems[localId].editLock = data.editLock;
            self.boardElems[localId].justified = data.justified;
        }

        var newList = self.state.displayElements.slice();
        if(!newList[localId])
        {
            newList[localId] = {};
            newList[localId].id = localId;
            if(data.editLock != 0)
            {
                if(data.editLock == self.userId)
                {
                    self.currTextEdit = localId;
                    self.cursorStart = 0;
                    self.cursorEnd = 0;
                    newList[localId].remEdit = false;
                    newList[localId].isEditing = true;

                    self.findCursorElems(self.boardElems[localId], self.cursorStart, self.cursorEnd);

                    newList[localId].cursor = self.boardElems[localId].cursor;
                    newList[localId].cursorElems = self.boardElems[localId].cursorElems;
                }
                else
                {
                    newList[localId].remEdit = true;
                    newList[localId].isEditing = false;
                }
            }
            newList[localId].width = data.width;
            newList[localId].height = data.height;
            newList[localId].x = data.posX;
            newList[localId].y = data.posY;
            newList[localId].size = data.size;
            newList[localId].isDeleted = false;
            newList[localId].type = 'text';
            newList[localId].data = [];
            self.setState({displayElements: newList, justified: self.boardElems[localId].justified});
        }
    });
    this.socket.on('STYLENODE', function(data)
    {
        if(!self.textInBuffer[data.textId])
        {
            console.log('STYLENODE: Unkown text, ID: ' + data.textId);
            console.log(data);
            self.socket.emit('UNKNOWN-TEXT', data.textId);
        }
        else
        {
            if(self.textInBuffer[data.textId].editBuffer[data.userId])
            {
                if(self.textInBuffer[data.textId].editBuffer[data.userId][data.editId])
                {
                    var buffer = self.textInBuffer[data.textId].editBuffer[data.userId][data.editId];

                    buffer.nodes.push(data);
                    if(buffer.nodes.length == buffer.num_nodes)
                    {
                        self.completeEdit(data.textId, data.userId, data.editId);
                    }
                }
                else
                {
                    console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.textId);
                    self.socket.emit('UNKNOWN-EDIT', {id: data.textId, userId: data.userId, editId: data.editId});
                }
            }
            else
            {
                // TODO:
                console.log('WOAH BUDDY! User ID: ' + data.userId);
            }
        }
    });
    this.socket.on('TEXTID', function(data)
    {
        // TODO: set server ID, then send latest edit. Just use completeEdit
        self.textDict[data.serverId] = data.localId;
        self.boardElems[data.localId].serverId = data.serverId;
    });
    this.socket.on('LOCK-TEXT', function(data)
    {
        var localId = self.textDict[data.id];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            self.boardElems[localId].editLock = data.userId;

            var newList = self.state.displayElements.slice();
            newList[localId].remEdit = true;
            self.setState({displayElements: newList});
        }
    });
    this.socket.on('LOCKID-TEXT', function(data)
    {
        var localId = self.textDict[data.id];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            if(self.gettingLock != -1 && self.boardElems[self.gettingLock].serverId == data.id)
            {
                self.boardElems[localId].editLock = data.userId;
                self.cursorStart = self.boardElems[localId].text.length;
                self.cursorEnd = self.boardElems[localId].text.length;
                self.currTextEdit = self.gettingLock;
                self.gettingLock = -1;
                self.isWriting = true;

                self.textIdealX = self.findXPos(self.boardElems[localId], self.cursorStart);
                self.findCursorElems(self.boardElems[localId], self.cursorStart, self.cursorEnd);

                var newList = self.state.displayElements.slice();
                newList[localId].getLock = false;
                newList[localId].isEditing = true;
                newList[localId].cursor = self.boardElems[localId].cursor;
                newList[localId].cursorElems = self.boardElems[localId].cursorElems;
                self.setState({ displayElements: newList, mode: 1, justified: self.boardElems[localId].justified });
            }
            else
            {
                self.socket.emit('RELEASE-TEXT', {id: data.id});
            }
        }
    });
    this.socket.on('EDITID-TEXT', function(data)
    {
        var buffer = self.textOutBuffer;
        // TODO: this may need a lock

        if(data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent)
        {
            buffer[data.bufferId].lastSent = data.localId;
            for(var i = 0; i < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i++)
            {
                buffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.id;
                self.socket.emit('STYLENODE', buffer[data.bufferId].editBuffer[data.localId].nodes[i]);
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
    this.socket.on('RELEASE-TEXT', function(data)
    {
        var localId = self.textDict[data.id];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            self.boardElems[localId].editLock = 0;

            var newList = self.state.displayElements.slice();
            newList[localId].remEdit = false;
            self.setState({displayElements: newList});
        }
    });
    this.socket.on('EDIT-TEXT', function(data)
    {
        if(!self.textInBuffer[data.id])
        {
            self.socket.emit('UNKNOWN-TEXT', data.id);
        }
        else
        {
            if(!self.textInBuffer[data.id].editBuffer[data.userId])
            {
                self.textInBuffer[data.id].editBuffer[data.userId] = [];
            }

            self.textInBuffer[data.id].editBuffer[data.userId][data.editId] = {num_nodes: data.nodes, nodes: []};
        }

    });
    this.socket.on('MOVE-TEXT', function(data)
    {
        var localId = self.textDict[data.id];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            var textBox = self.boardElems[localId];

            var changeX = data.newX - textBox.x;
            var changeY = data.newY - textBox.y;

            textBox.x = data.newX;
            textBox.y = data.newY;


            for(var i = 0; i < textBox.textNodes.length; i++)
            {
                var node = textBox.textNodes[i];
                node.x += changeX;
                node.y += changeY;
            }

            textBox.textNodes = self.calculateTextLines(textBox);

            if(self.state.currTextEdit == localId)
            {
                self.findCursorElems(self.boardElems[localId], self.cursorStart, self.cursorEnd);
            }

            var newList = self.state.displayElements.slice();
            newList[localId].x += changeX;
            newList[localId].y += changeY;
            newList[localId].data = textBox.textNodes;
            newList[localId].cursor = self.boardElems[localId].cursor;
            newList[localId].cursorElems = self.boardElems[localId].cursorElems;
            self.setState({displayElements: newList});
        }
    });
    this.socket.on('JUSTIFY-TEXT', function(data)
    {
        var localId = self.textDict[data.id];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            var textBox = self.boardElems[localId];

            textBox.justified = data.state;
            textBox.textNodes = self.calculateTextLines(textBox);

            if(self.state.currTextEdit == localId)
            {
                self.findCursorElems(textBox, self.cursorStart, self.cursorEnd);
            }

            var newList = self.state.displayElements.slice();
            newList[localId].data = textBox.textNodes;
            newList[localId].cursor = textBox.cursor;
            newList[localId].cursorElems = textBox.cursorElems;
            self.setState({displayElements: newList});
        }
    });
    this.socket.on('RESIZE-TEXT', function(data)
    {
        var localId = self.textDict[data.id];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            var textBox = self.boardElems[localId];

            textBox.height = data.height;

            if(textBox.width != data.width)
            {
                textBox.width = data.width;
                textBox.textNodes = self.calculateTextLines(textBox);
            }

            if(self.state.currTextEdit == localId)
            {
                self.findCursorElems(textBox, self.cursorStart, self.cursorEnd);
            }

            var newList = self.state.displayElements.slice();
            newList[localId].data = textBox.textNodes;
            newList[localId].width = textBox.width;
            newList[localId].height = textBox.height;
            newList[localId].cursor = textBox.cursor;
            newList[localId].cursorElems = textBox.cursorElems;
            self.setState({displayElements: newList});
        }
    });
    this.socket.on('DELETE-TEXT', function(textId)
    {
        var localId = self.textDict[textId];

        if(!localId)
        {
            // TODO: Unkown text
        }
        else
        {
            var textBox = self.boardElems[localId];

            textBox.isDeleted = true;

            var newList = self.state.displayElements.slice();
            newList[localId].isDeleted = true;
            self.setState({displayElements: newList});
        }
    });
    this.socket.on('IGNORE-TEXT', function(curveId)
    {
        clearInterval(self.curveInTimeouts[curveId]);
    });
    this.socket.on('DROPPED-TEXT', function(data)
    {
        // TODO: We need to stop trying to get it.
    });
    this.socket.on('MISSED-TEXT', function(data)
    {
        // TODO:
    });
    this.socket.on('ERROR', function(data)
    {
        // TODO: Server error.
        console.log('SERVER: ' + data);
    });
},
releaseText: function(id)
{
    this.socket.emit('RELEASE-TEXT', {id: this.boardElems[id].serverId});
},
colourChange: function(newColour)
{
    this.colour = newColour;
},
modeChange: function(newMode)
{
    var whitElem = document.getElementById("whiteBoard-input");
    var context  = whitElem.getContext('2d');
    context.clearRect(0, 0, whitElem.width, whitElem.height);
    this.isWriting = false;

    if(this.currTextEdit > -1)
    {
        var textBox = this.boardElems[this.currTextEdit];

        textBox.isEditing = false;
        this.isWriting = false;

        var lineCount = textBox.textNodes.length;

        if(lineCount == 0)
        {
            lineCount = 1;
        }

        if(lineCount * 1.5 * textBox.size < textBox.height)
        {
            this.resizeText(this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
        }

        var newList = this.state.displayElements.slice();
        newList[this.currTextEdit].isEditing = false;
        this.setState({displayElements: newList, currTextMove: -1, currCurveMove: -1, currResize: -1, mode: newMode});

        this.releaseText(this.currTextEdit);
        this.currTextEdit = -1;
    }
    else if(this.gettingLock > -1)
    {
        var textBox = this.boardElems[this.gettingLock];

        textBox.getLock = false;
        this.isWriting = false;

        var newList = this.state.displayElements.slice();
        newList[this.gettingLock].getLock = false;
        this.setState({displayElements: newList, currTextMove: -1, currCurveMove: -1, currResize: -1, mode: newMode});

        this.releaseText(this.gettingLock);
        this.gettingLock = -1;
    }
    else
    {
        this.setState({currTextMove: -1, currCurveMove: -1, currResize: -1, mode: newMode});
    }
},
weightChange: function(newWeight)
{
    this.textWeight = newWeight;
},
styleChange: function(newStyle)
{
    this.textStyle = newStyle;
},
decorationChange: function(newDecor)
{
    this.textDecoration = newDecor;
},
justifiedChange: function()
{
    if(this.currTextEdit != -1)
    {
        var textBox = this.boardElems[this.currTextEdit];

        textBox.justified = !this.state.justified;
        textBox.textNodes = this.calculateTextLines(textBox);


        this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        this.textIdealX = this.findXPos(textBox, this.startLeft ? this.cursorEnd : this.cursorStart);

        if(textBox.serverId)
        {
            this.socket.emit('JUSTIFY-TEXT', {id: textBox.serverId, state: !this.state.justified});
        }
        else
        {
            // TODO: Catch for no server ID
        }

        var newList = this.state.displayElements.slice();
        newList[this.currTextEdit].data = textBox.textNodes;
        newList[this.currTextEdit].cursor = textBox.cursor;
        newList[this.currTextEdit].cursorElems = textBox.cursorElems;
        this.setState({displayElements: newList, justified: !this.state.justified});
    }
    else
    {
        this.setState({justified: !this.state.justified});
    }
},
curveMouseClick: function(id)
{
    if(this.state.mode == 2)
    {
        var curve = this.boardElems[id];

        if(this.isHost || this.userId == curve.user)
        {
            curve.isDeleted = true;
            this.socket.emit('DELETE-CURVE', curve.serverId);

            var newList = this.state.displayElements.slice();
            newList[id].isDeleted = true;
            this.setState({displayElements: newList});
        }
    }
},
curveMouseMove: function(id)
{
    if(this.state.mode == 2 && this.lMousePress)
    {
        var curve = this.boardElems[id];

        if(this.isHost || this.userId == curve.user)
        {
            curve.isDeleted = true;
            this.socket.emit('DELETE-CURVE', curve.serverId);

            var newList = this.state.displayElements.slice();
            newList[id].isDeleted = true;
            this.setState({displayElements: newList});
        }
    }
},
curveMouseDown: function(id, e)
{
    if(this.state.mode == 3)
    {
        this.setState({currCurveMove: id});
        this.prevX = e.clientX;
        this.prevY = e.clientY;
    }
},
textMouseClick: function(id)
{
    if(this.state.mode == 2)
    {
        var textBox = this.boardElems[id];

        if(this.isHost || this.userId == textBox.user)
        {
            textBox.isDeleted = true;
            this.socket.emit('DELETE-TEXT', textBox.serverId);

            var newList = this.state.displayElements.slice();
            newList[id].isDeleted = true;
            this.setState({displayElements: newList});
        }
    }
},
textMouseDblClick: function(id)
{
    var textBox = this.boardElems[id];
    var newList = this.state.displayElements.slice();

    if(this.gettingLock != -1 && this.gettingLock != id)
    {
        this.boardElems[this.gettingLock].getLock = false;
        newList[this.gettingLock].getLock = false;
    }

    if(this.currTextEdit != -1)
    {
        if(this.currTextEdit != id)
        {
            this.boardElems[this.currTextEdit].isEditing = false;

            var lineCount = this.boardElems[this.currTextEdit].textNodes.length;

            if(lineCount == 0)
            {
                lineCount = 1;
            }

            if(lineCount * 1.5 * this.boardElems[this.currTextEdit].size < this.boardElems[this.currTextEdit].height)
            {
                this.boardElems[this.currTextEdit].height = lineCount * 1.5 * this.boardElems[this.currTextEdit].size;

                this.socket.emit('RESIZE-TEXT',
                {
                    id: this.boardElems[this.currTextEdit].serverId, width: this.boardElems[this.currTextEdit].width,
                    height: this.boardElems[this.currTextEdit].height
                });

                newList[this.currTextEdit].isEditing = false;
                newList[this.currTextEdit].height = this.boardElems[this.currTextEdit].height;
            }
        }
    }
    else
    {
        if(this.isHost || this.userId == textBox.user)
        {
            this.gettingLock = id;
            textBox.getLock = true;
            this.socket.emit('LOCK-TEXT', {id: textBox.serverId});
            newList[id].getLock = true;
        }
    }

    this.setState({displayElements: newList});
},
textMouseMoveDown: function(id, e)
{
    this.setState({currTextMove: id});
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.moving = true;
},
textMouseResizeDown: function(id, vert, horz, e)
{
    this.setState({currResize: id});
    this.prevX = e.clientX;
    this.prevY = e.clientY;
    this.vertResize = vert;
    this.horzResize = horz;
    this.moving = true;
},
textMouseMove: function(id)
{
    if(this.state.mode == 2 && this.lMousePress)
    {
        var textBox = this.boardElems[id];

        if(this.isHost || this.userId == textBox.user)
        {
            textBox.isDeleted = true;
            if(textBox.serverId)
            {
                this.socket.emit('DELETE-TEXT', textBox.serverId);
            }
            else
            {
                // TODO: No server ID
            }

            var newList = this.state.displayElements.slice();
            newList[id].isDeleted = true;
            this.setState({displayElements: newList});
        }
    }
},
resizeText: function(id, width, height)
{
    var textBox = this.boardElems[id];

    textBox.height = height;

    if(textBox.width != width)
    {
        textBox.width = width;
        textBox.textNodes = self.calculateTextLines(textBox);
    }

    if(textBox.serverId)
    {
        this.socket.emit('RESIZE-TEXT', {id: textBox.serverId, width: width, height: height});
    }
    else
    {
        // TODO: No server ID yet
    }

    var newList = this.state.displayElements.slice();
    newList[id].width = width;
    newList[id].height = height;
    newList[id].data = textBox.textNodes;
    this.setState({displayElements: newList});
},
drawCurve: function(points, size, colour, scaleF, panX, panY)
{
    var reducedPoints;
    var curves;

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

    var newCurve = { user: this.userId, isDeleted: false, colour: colour, size: size, curveSet: curves};

    var localId = this.boardElems.length;
    this.boardElems[localId] = newCurve;
    newCurve.id = localId;

    var newList = this.state.displayElements.slice();
    if(curves.length > 1)
    {
        var pathText = this.createCurveText(curves);
        newList[localId] = {type: 'path', id: localId, size: newCurve.size, colour: newCurve.colour, isDeleted: false, param: pathText };
    }
    else
    {
        newList[localId] = { type: 'circle', id: localId, size: newCurve.size, colour: newCurve.colour, isDeleted: false, point: curves[0] };
    }
    this.setState({displayElements: newList});

    var self = this;

    this.curveOutBuffer[localId] = {id: localId, colour: colour, curveSet: curves, size: size};

    this.curveOutTimeouts[localId] = setInterval(function()
    {
        self.socket.emit('CURVE', {id: localId, colour: colour, num_points: curves.length, size: size});
    }, 60000);

    this.socket.emit('CURVE', {id: localId, colour: colour, num_points: curves.length, size: size});
},
newTextBox: function(x, y, width, height, size)
{
    this.isWriting = true;
    this.cursorStart = 0;
    this.cursorEnd = 0;

    var newText =
    {
        text: '', user: this.userId, isDeleted: false, x: x, y: y, size: size, styles: [], editCount: 0,
        width: width, height: height, editLock: 0, justified: this.state.justified, textNodes: [], dist: [0]
    };

    var localId = this.boardElems.length;
    this.boardElems[localId] = newText;
    this.currTextEdit = localId;
    newText.id = localId;

    this.findCursorElems(newText, this.cursorStart, this.cursorEnd);

    var newList = this.state.displayElements.slice();
    newList[localId] = {};
    newList[localId].id = localId;
    newList[localId].remEdit = false;
    newList[localId].isEditing = true;
    newList[localId].width = width;
    newList[localId].height = height;
    newList[localId].x = x;
    newList[localId].y = y;
    newList[localId].size = size;
    newList[localId].isDeleted = false;
    newList[localId].type = 'text';
    newList[localId].data = [];
    newList[localId].cursor = newText.cursor;
    newList[localId].cursorElems = newText.cursorElems;
    this.setState({displayElements: newList});
},
mouseUp: function(e)
{
    if(this.lMousePress && !this.wMousePress)
    {
        if(this.state.mode == 0)
        {
            var whitElem  = document.getElementById("whiteBoard-input");
            var context = whitElem.getContext('2d');

            context.clearRect(0, 0, whitElem.width, whitElem.height);

            if(this.isPoint)
            {
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY  = elemRect.top - document.body.scrollTop;
                var offsetX  = elemRect.left - document.body.scrollLeft;
            }

            this.drawCurve(this.pointList, this.scaleF, this.colour, this.scaleF, this.panX, this.panY);
        }
        else if(this.state.mode == 1)
        {
            if(!this.isWriting)
            {
                var rectLeft;
                var rectTop;
                var rectWidth;
                var rectHeight;
                var whitElem = document.getElementById("whiteBoard-input");
                var context  = whitElem.getContext('2d');
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY  = elemRect.top - document.body.scrollTop;
                var offsetX  = elemRect.left - document.body.scrollLeft;
                var newPoint = {};

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

                this.textParam.x = rectLeft;
                this.textParam.y = rectTop;
                this.textParam.width = rectWidth;
                this.textParam.height = rectHeight;

                if(rectWidth > 10 && rectHeight > 10)
                {
                    var x = this.textParam.x * this.scaleF + this.panX;
                    var y = this.textParam.y * this.scaleF + this.panY;
                    var width = this.textParam.width * this.scaleF;
                    var height = this.textParam.height * this.scaleF;
                    this.newTextBox(x, y, width, height, this.scaleF * 20);
                }
            }
            else if(this.rMousePress)
            {
                this.isWriting = false;

                if(this.currTextEdit > -1)
                {
                    var textBox = this.boardElems[this.currTextEdit];

                    textBox.isEditing = false;
                    this.isWriting = false;

                    var lineCount = textBox.textNodes.length;

                    if(lineCount == 0)
                    {
                        lineCount = 1;
                    }

                    if(lineCount * 1.5 * textBox.size < textBox.height)
                    {
                        this.resizeText(this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                    }

                    var newList = this.state.displayElements.slice();
                    newList[this.currTextEdit].isEditing = false;
                    this.setState({displayElements: newList, currTextMove: -1, currCurveMove: -1, currResize: -1});
                    this.releaseText(this.currTextEdit);
                    this.currTextEdit = -1;
                }
                else if(this.gettingLock > -1)
                {
                    var textBox = this.boardElems[this.gettingLock];

                    this.isWriting = false;

                    var newList = this.state.displayElements.slice();
                    newList[this.gettingLock].getLock = false;
                    this.setState({displayElements: newList, currTextMove: -1, currCurveMove: -1, currResize: -1});
                    this.releaseText(this.gettingLock);
                    this.gettingLock = -1;
                }

                context.clearRect(0, 0, whitElem.width, whitElem.height);
            }
        }
    }

    if(this.curveMoved)
    {
        var serverId = this.boardElems[this.state.currCurveMove].serverId;
        var changeX = this.curveChangeX;
        var changeY = this.curveChangeY;

        this.curveMoved = false;

        if(serverId)
        {
            this.socket.emit('MOVE-CURVE', {id: serverId, changeX: changeX, changeY: changeY});
        }
        else
        {
            // TODO: Watch out for no server ID
        }
    }
    else if(this.textMoved)
    {
        this.textMoved = false;

        var serverId = this.boardElems[this.state.currTextMove].serverId;
        var newX     = this.boardElems[this.state.currTextMove].x;
        var newY     = this.boardElems[this.state.currTextMove].y;

        if(serverId)
        {
            this.socket.emit('MOVE-TEXT', {id: serverId, newX: newX, newY: newY});
        }
        else
        {
            // TODO: Watch out for no server ID
        }
    }
    else if(this.textResized)
    {
        this.textResized = false;

        var serverId  = this.boardElems[this.state.currResize].serverId;
        var newWidth  = this.boardElems[this.state.currResize].width;
        var newHeight = this.boardElems[this.state.currResize].height;

        if(serverId)
        {
            this.socket.emit('RESIZE-TEXT', {id: serverId, width: newWidth, height: newHeight});
        }
        else
        {
            // TODO: No server ID yet
        }
    }


    this.setState({currTextMove: -1, currCurveMove: -1, currResize: -1});

    this.curveChangeX = 0;
    this.curveChangeY = 0;
    this.lMousePress = false;
    this.wMousePress = false;
    this.rMousePress = false;
    this.pointList = [];
    this.moving = false;
},
touchUp: function()
{
    this.touchPress = false;
},
mouseDown: function(e)
{
    if(!this.lMousePress && !this.wMousePress && !this.rMousePress)
    {
        this.lMousePress = e.buttons & 1;
        this.rMousePress = e.buttons & 2;
        this.wMousePress = e.buttons & 4;
        this.isPoint = true;
        var whitElem  = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY  = elemRect.top - document.body.scrollTop;
        var offsetX  = elemRect.left - document.body.scrollLeft;
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;
        this.prevX = e.clientX;
        this.prevY = e.clientY;

        var newPoint = {};
        this.pointList = [];
        newPoint.x = Math.round(e.clientX - offsetX);
        newPoint.y = Math.round(e.clientY - offsetY);
        this.pointList[this.pointList.length] = newPoint;

        this.downPoint = {x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY)};

        if(e.buttons == 1 && !this.moving)
        {
            if(this.currTextEdit > -1)
            {
                var textBox = this.boardElems[this.currTextEdit];

                this.cursorStart = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);
                this.cursorEnd = this.cursorStart;
                this.textDown = this.cursorStart;
                this.textIdealX = this.findXPos(textBox, this.cursorStart);

                this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);

                var newList = this.state.displayElements.slice();
                newList[this.currTextEdit].cursor = textBox.cursor;
                newList[this.currTextEdit].cursorElems = textBox.cursorElems;
                this.setState({displayElements: newList});
            }
        }
    }
},
touchDown: function()
{
    this.touchPress = true;
},
mouseMove: function(e)
{
    if(this.wMousePress)
    {
        var whitElem  = document.getElementById("whiteboard-container");

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

        this.setState({viewBox: newVBox});
    }
    else if(this.lMousePress)
    {
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY  = elemRect.top - document.body.scrollTop;
        var offsetX  = elemRect.left - document.body.scrollLeft;
        var context  = whitElem.getContext('2d');
        var newPoint = {};

        newPoint.x = Math.round(e.clientX - offsetX);
        newPoint.y = Math.round(e.clientY - offsetY);

        // Mode 0 is draw mode, mode 1 is text mode.
        if(this.state.mode == 0)
        {
            if(this.pointList.length)
            {
                if(Math.round(this.pointList[this.pointList.length - 1].x - newPoint.x) < this.scaleF || Math.round(this.pointList[this.pointList.length - 1].y - newPoint.y))
                {
                    this.isPoint = false;

                    context.beginPath();
                    context.strokeStyle = this.colour;
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
        else if(this.state.mode == 1 && !this.rMousePress)
        {
            if(this.state.currResize != -1)
            {
                // TODO Textbox resize
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;

                if(this.horzResize)
                {
                    this.boardElems[this.state.currResize].width += changeX;
                }
                if(this.vertResize)
                {
                    this.boardElems[this.state.currResize].height += changeY;
                }

                this.boardElems[this.state.currResize].textNodes = this.calculateTextLines(this.boardElems[this.state.currResize]);
                this.findCursorElems(this.boardElems[this.state.currResize], this.cursorStart, this.cursorEnd);

                var newList = this.state.displayElements.slice();
                newList[this.state.currResize].width = this.boardElems[this.state.currResize].width;
                newList[this.state.currResize].height = this.boardElems[this.state.currResize].height;
                newList[this.state.currResize].data = this.boardElems[this.state.currResize].textNodes;
                newList[this.state.currResize].cursor = this.boardElems[this.state.currResize].cursor;
                newList[this.state.currResize].cursorElems = this.boardElems[this.state.currResize].cursorElems;
                this.setState({displayElements: newList});

                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textResized = true;
            }
            else if(this.state.currTextMove != -1)
            {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;

                this.boardElems[this.state.currTextMove].x += changeX;
                this.boardElems[this.state.currTextMove].y += changeY;

                for(var i = 0; i < this.boardElems[this.state.currTextMove].textNodes.length; i++)
                {
                    var node = this.boardElems[this.state.currTextMove].textNodes[i];
                    node.x += changeX;
                    node.y += changeY;
                }

                this.findCursorElems(this.boardElems[this.state.currTextMove], this.cursorStart, this.cursorEnd);

                var newList = this.state.displayElements.slice();
                newList[this.state.currTextMove].x += changeX;
                newList[this.state.currTextMove].y += changeY;
                newList[this.state.currTextMove].data = this.boardElems[this.state.currTextMove].textNodes;
                newList[this.state.currTextMove].cursor = this.boardElems[this.state.currTextMove].cursor;
                newList[this.state.currTextMove].cursorElems = this.boardElems[this.state.currTextMove].cursorElems;
                this.setState({displayElements: newList});

                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textMoved = true;
            }
            else if(this.currTextEdit != -1)
            {
                var textBox = this.boardElems[this.currTextEdit];
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

                this.textIdealX = this.findXPos(textBox, newLoc);

                this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);

                var newList = this.state.displayElements.slice();
                newList[this.currTextEdit].cursor = textBox.cursor;
                newList[this.currTextEdit].cursorElems = textBox.cursorElems;
                this.setState({displayElements: newList});
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
        else if(this.state.mode == 3)
        {

            if(this.state.currCurveMove != -1)
            {
                for(var i = 0; i < this.boardElems[this.state.currCurveMove].curveSet.length; i++)
                {
                    this.boardElems[this.state.currCurveMove].curveSet[i].x += (e.clientX - this.prevX) * this.scaleF;
                    this.boardElems[this.state.currCurveMove].curveSet[i].y += (e.clientY - this.prevY) * this.scaleF;
                }

                this.curveChangeX += (e.clientX - this.prevX) * this.scaleF;
                this.curveChangeY += (e.clientY - this.prevY) * this.scaleF;

                var newList = this.state.displayElements.slice();
                if(this.boardElems[this.state.currCurveMove].curveSet.length > 1)
                {
                    var pathText = this.createCurveText(this.boardElems[this.state.currCurveMove].curveSet);
                    newList[this.state.currCurveMove].param = pathText;
                }
                else
                {
                    newList[this.state.currCurveMove].point = this.boardElems[this.state.currCurveMove].curveSet;
                }
                this.setState({displayElements: newList});
                this.prevX = e.clientX;
                this.prevY = e.clientY;

                this.curveMoved = true;
            }
            else if(this.state.currTextMove != -1)
            {
                var changeX = (e.clientX - this.prevX) * this.scaleF;
                var changeY = (e.clientY - this.prevY) * this.scaleF;

                this.boardElems[this.state.currTextMove].x += changeX;
                this.boardElems[this.state.currTextMove].y += changeY;

                for(var i = 0; i < this.boardElems[this.state.currTextMove].textNodes.length; i++)
                {
                    var node = this.boardElems[this.state.currTextMove].textNodes[i];
                    node.x += changeX;
                    node.y += changeY;
                }

                var newList = this.state.displayElements.slice();
                newList[this.state.currTextMove].x += changeX;
                newList[this.state.currTextMove].y += changeY;
                newList[this.state.currTextMove].data = this.boardElems[this.state.currTextMove].textNodes;
                this.setState({displayElements: newList});

                this.prevX = e.clientX;
                this.prevY = e.clientY;
                this.textMoved = true;
            }
        }
    }
},
touchMove: function(e)
{
    if(this.state.touchPress)
    {
    }
},
windowResize: function(e)
{
    var whitElem = document.getElementById("whiteBoard-input");
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

    this.setState({viewBox: newVBox});
},
mouseWheel: function(e)
{
    var whitElem = document.getElementById("whiteboard-container");
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

    this.setState({viewBox: newVBox});
},
keyDown: function(e)
{
    if(this.isWriting)
    {
        var inputChar = e.key;
    }
},
keyUp: function(e)
{

},
isCurrentStyle: function(style)
{
    if(style.colour == this.colour && style.decoration == this.textDecoration && style.weight == this.textWeight && style.style == this.textStyle)
    {
        return true;
    }
    else
    {
        return false;
    }
},
textEdited: function(textbox)
{
    var buffer;
    var editNum;

    // This is a new textbox.
    if(this.textOutBuffer[textbox.id])
    {
        buffer = this.textOutBuffer[textbox.id];
        editNum = buffer.editCount;
        buffer.editCount++;
    }
    else
    {
        buffer = {id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified};
        buffer.styles = textbox.styles.slice();
        editNum = 0;
    }


    buffer.editBuffer[editNum] = {};
    buffer.editBuffer[editNum].nodes = [];

    for(i = 0; i < textbox.styles.length; i++)
    {
        buffer.editBuffer[editNum].nodes.push(
        {   num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
            weight: textbox.styles[i].weight, decoration:  textbox.styles[i].decoration, style: textbox.styles[i].style,
            start: textbox.styles[i].start, end: textbox.styles[i].end
        });
    }

    this.textOutBuffer[textbox.id] = buffer;
    if(textbox.serverId)
    {
        this.socket.emit('EDIT-TEXT',
        {
            id: textbox.serverId, localId: editNum, bufferId: textbox.id, nodes: textbox.styles.length
        });
    }
    else
    {
        this.socket.emit('TEXTBOX',
        {
            id: textbox.id, posX: this.textOutBuffer[textbox.id].x, posY: this.textOutBuffer[textbox.id].y, size: this.textOutBuffer[textbox.id].size,
            width: this.textOutBuffer[textbox.id].width, height: this.textOutBuffer[textbox.id].height, justified: this.textOutBuffer[textbox.id].justified
        });
    }
},
newEdit: function(textBox)
{
    textBox.editCount++;

    if(textBox.editCount > 5)
    {
        // Notify of changes and clear that pesky timeout
        textBox.editCount = 0;
        clearTimeout(textBox.editTimer);
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
},
findXPos: function(textbox, loc)
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

    line = textbox.textNodes[i - 1];

    if(line.styles.length == 0)
    {
        return 0;
    }

    i = 1;
    while(i < line.styles.length && line.styles[i].locStart + line.start <= loc)
    {
        i++
    }

    style = line.styles[i - 1];

    if(line.start + style.locStart == loc)
    {
        return style.startPos;
    }
    else
    {
        var currMes = textbox.dist[loc] - textbox.dist[line.start + style.locStart];

        return currMes + style.startPos;
    }
},
findTextPos: function(textbox, x, y)
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

        currMes = textbox.dist[line.start + style.locStart + style.text.length - 1] - textbox.dist[line.start + style.locStart];

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
},
findCursorElems: function(textbox, cursorStart, cursorEnd)
{
    textbox.cursorElems = [];

    if(textbox.textNodes.length == 0)
    {
        textbox.cursor = { x: textbox.x, y: textbox.y, height: 1.5 * textbox.size };
    }

    for(var i = 0; i < textbox.textNodes.length; i++)
    {
        var line = textbox.textNodes[i];
        var selStart = null;
        var selEnd = null;
        var startFound = false;
        var endFound = false;

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
                    var style = line.styles[j];

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
                    var style = line.styles[j];

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
},
calculateLengths: function(textbox, start, end, prevEnd)
{
    var whitElem  = document.getElementById("whiteBoard-output");
    var tMount;
    var startPoint;
    var styleNode;
    var change = 0;
    var style = 0;
    var oldDist = textbox.dist.slice();

    while(style - 1 < textbox.styles.length && textbox.styles[style].end <= start - 2)
    {
        style++;
    }

    if(start > 1)
    {
        // Calculate the start point taking into account the kerning.
        tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tMount.setAttributeNS(null, "opacity", 0);
        tMount.setAttributeNS(null, "x", textbox.x);
        tMount.setAttributeNS(null, "font-size", textbox.size);
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
        tMount.setAttributeNS(null, "opacity", 0);
        tMount.setAttributeNS(null, "x", textbox.x);
        tMount.setAttributeNS(null, "font-size", textbox.size);
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
        tMount.setAttributeNS(null, "opacity", 0);
        tMount.setAttributeNS(null, "x", textbox.x);
        tMount.setAttributeNS(null, "font-size", textbox.size);
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
        tMount.setAttributeNS(null, "opacity", 0);
        tMount.setAttributeNS(null, "x", textbox.x);
        tMount.setAttributeNS(null, "font-size", textbox.size);
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
},
calculateTextLines: function(textbox)
{
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

    if(!textbox.text.length)
    {
        textbox.lines = [];
        return [];
    }

    for(var i = 0; i < textbox.text.length; i++)
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

    var nLineTrig;

    while(wordC < wordsT.length || spaceC < spacesT.length)
    {
        var lineComplete = false;
        var word;

        var currLength = 0;
        var tspanEl = {};
        var progPos = true;

        currY += dy;
        additionalWordSpacing = 0;
        nLineTrig = false;

        tspanEl.styles = [];
        tspanEl.spacing = 0;
        tspanEl.x = textbox.x;
        tspanEl.y = currY;
        tspanEl.dy = dy;
        tspanEl.id = lineCount;
        tspanEl.start = prevPos;
        tspanEl.endCursor = true;
        tspanEl.justified = textbox.justified;
        tspanEl.lineNum = lineCount;

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
            var i = word.length;
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
                        var i = word.length - 1;
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

        if(!tspanEl.end)
        {
            tspanEl.end = tspanEl.start + line.length;
        }

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
                var newStyle;
                var word = '';

                for(var i = 0; i < styleText.length; i++)
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
        tspanEl = {};
        tspanEl.styles = [];
        tspanEl.spacing = 0;
        tspanEl.x = textbox.x;
        tspanEl.y = currY;
        tspanEl.dy = dy;
        tspanEl.id = lineCount;
        tspanEl.start = prevPos;
        tspanEl.end = prevPos;
        tspanEl.endCursor = true;
        tspanEl.justified = false;
        tspanEl.lineNum = lineCount;
        lineCount++;
        childText.push(tspanEl);
    }

    if(lineCount * 1.5 * textbox.size > textbox.height)
    {
        this.resizeText(textbox.id, textbox.width, lineCount * 1.5 * textbox.size);
    }

    return childText;
},
keyPress: function(e)
{
    if(this.isWriting)
    {
        e.preventDefault();
        e.stopPropagation();
        var inputChar = e.key;
        var textItem;


        switch(inputChar)
        {

        case 'ArrowLeft':
            textItem = this.boardElems[this.currTextEdit];

            var newStart = this.cursorStart;
            var newEnd = this.cursorEnd;

            if(this.cursorStart == this.cursorEnd || !this.startLeft)
            {
                if(this.cursorStart > 0)
                {
                    if(e.ctrlKey)
                    {
                        var i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
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
                    var i = this.cursorEnd > 0 ? this.cursorEnd - 1 : 0;
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
                    this.textIdealX = this.findXPos(textItem, this.cursorStart);
                }
                else if(newStart > newEnd)
                {
                    this.startLeft = false;
                    this.cursorStart = newEnd;
                    this.cursorEnd = newStart;
                    this.textIdealX = this.findXPos(textItem, this.cursorStart);
                }
                else
                {
                    this.cursorStart = newStart;
                    this.cursorEnd = newEnd;
                    if(this.startLeft)
                    {
                        this.textIdealX = this.findXPos(textItem, this.cursorEnd);
                    }
                    else
                    {
                        this.textIdealX = this.findXPos(textItem, this.cursorStart);
                    }
                }
            }
            else
            {
                if(this.cursorStart == this.cursorEnd || !this.startLeft)
                {
                    this.cursorStart = newStart;
                    this.textIdealX = this.findXPos(textItem, newStart);
                }
                else
                {
                    this.cursorStart = newEnd;
                    this.textIdealX = this.findXPos(textItem, newEnd);
                }
                this.cursorEnd = this.cursorStart;
            }

            this.findCursorElems(textItem, this.cursorStart, this.cursorEnd);

            var newList = this.state.displayElements.slice();
            newList[this.currTextEdit].cursor = textItem.cursor;
            newList[this.currTextEdit].cursorElems = textItem.cursorElems;
            this.setState({displayElements: newList});
            break;
        case 'ArrowRight':
            textItem = this.boardElems[this.currTextEdit];

            var newStart = this.cursorStart;
            var newEnd = this.cursorEnd;

            if(this.cursorStart == this.cursorEnd || this.startLeft)
            {
                if(this.cursorEnd < textItem.text.length)
                {
                    if(e.ctrlKey)
                    {
                        var i = this.cursorEnd + 1;
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
                    var i = this.cursorStart < textItem.text.length ? this.cursorStart + 1 : textItem.text.length;
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
                    this.textIdealX = this.findXPos(textItem, this.cursorEnd);
                }
                else if(newStart > newEnd)
                {
                    this.startLeft = true;
                    this.cursorStart = newEnd;
                    this.cursorEnd = newStart;
                    this.textIdealX = this.findXPos(textItem, this.cursorEnd);
                }
                else
                {
                    this.cursorStart = newStart;
                    this.cursorEnd = newEnd;
                    if(this.startLeft)
                    {
                        this.textIdealX = this.findXPos(textItem, this.cursorEnd);
                    }
                    else
                    {
                        this.textIdealX = this.findXPos(textItem, this.cursorStart);
                    }
                }
            }
            else
            {
                if(this.cursorStart == this.cursorEnd || this.startLeft)
                {
                    this.cursorStart = newEnd;
                    this.textIdealX = this.findXPos(textItem, newEnd);
                }
                else
                {

                    this.cursorStart = newStart;
                    this.textIdealX = this.findXPos(textItem, newStart);
                }
                this.cursorEnd = this.cursorStart;
            }

            this.findCursorElems(textItem, this.cursorStart, this.cursorEnd);

            var newList = this.state.displayElements.slice();
            newList[this.currTextEdit].cursor = textItem.cursor;
            newList[this.currTextEdit].cursorElems = textItem.cursorElems;
            this.setState({displayElements: newList});
            break;
        case 'ArrowUp':
            textItem = this.boardElems[this.currTextEdit];

            var newStart;
            var newEnd;

            if(e.ctrlKey)
            {
                if(this.startLeft && this.cursorStart != this.cursorEnd)
                {
                    var i = this.cursorEnd - 1;
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
                    var i = this.cursorStart - 1;
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
                        var i = 1;
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
                        var i = 1;
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

            this.findCursorElems(textItem, this.cursorStart, this.cursorEnd);

            var newList = this.state.displayElements.slice();
            newList[this.currTextEdit].cursor = textItem.cursor;
            newList[this.currTextEdit].cursorElems = textItem.cursorElems;
            this.setState({displayElements: newList});
            break;
        case 'ArrowDown':
            textItem = this.boardElems[this.currTextEdit];

            var newStart;
            var newEnd;

            if(e.ctrlKey)
            {
                if(this.startLeft || this.cursorStart == this.cursorEnd)
                {
                    var i = this.cursorEnd + 1;
                    while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                    {
                        i++;
                    }

                    newStart = this.cursorStart;
                    newEnd = i;
                }
                else
                {
                    var i = this.cursorStart + 1;
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
                        var i = 0;
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
                        var i = 0;
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

            this.findCursorElems(textItem, this.cursorStart, this.cursorEnd);

            var newList = this.state.displayElements.slice();
            newList[this.currTextEdit].cursor = textItem.cursor;
            newList[this.currTextEdit].cursorElems = textItem.cursorElems;
            this.setState({displayElements: newList});
            break;
        case 'Backspace':
            textItem = this.boardElems[this.currTextEdit];

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
                    var endText = textItem.text.slice(this.cursorEnd, this.boardElems[this.currTextEdit].text.length);

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

            this.findCursorElems(textItem, this.cursorStart, this.cursorEnd);

            var newList = this.state.displayElements.slice();
            newList[this.currTextEdit].cursor = textItem.cursor;
            newList[this.currTextEdit].cursorElems = textItem.cursorElems;
            newList[this.currTextEdit].data = textItem.textNodes;
            this.setState({displayElements: newList});
            break;
        case 'Enter':
            inputChar = '\n';
        default:
            textItem = this.boardElems[this.currTextEdit];

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
                        start: this.cursorStart, end: this.cursorStart + 1, decoration: this.textDecoration,
                        weight: this.textWeight, style: this.textStyle, colour: this.colour,
                        text: textItem.text.slice(this.cursorStart, this.cursorStart + 1)
                    };

                    styles.splice(i + 1, 0, newStyle);
                }


                this.cursorStart++;
                this.cursorEnd = this.cursorStart;

                textItem.styles = styles;

                textItem = this.newEdit(textItem);
                this.calculateLengths(textItem, this.cursorEnd - 1, this.cursorEnd, prevEnd);
                textItem.textNodes = this.calculateTextLines(textItem);

                this.findCursorElems(textItem, this.cursorStart, this.cursorEnd);

                var newList = this.state.displayElements.slice();
                newList[this.currTextEdit].cursor = textItem.cursor;
                newList[this.currTextEdit].cursorElems = textItem.cursorElems;
                newList[this.currTextEdit].data = textItem.textNodes;
                this.setState({displayElements: newList});
            }
            break;
        }
    }
},
componentDidMount: function()
{
    var whitElem  = document.getElementById('whiteBoard-input');
    var whitCont  = document.getElementById('whiteboard-container');

    whitElem.style.width = whitCont.clientWidth + 'px';
    whitElem.style.height = whitCont.clientHeight + 'px';
    whitElem.width = whitElem.clientWidth;
    whitElem.height = whitElem.clientHeight;
    window.addEventListener('resize', this.windowResize);
    document.addEventListener('keypress', this.keyPress);
    //document.addEventListener('keydown', function (e) { if (e.keyCode == 8 && e.target == document.body) { e.preventDefault(); }});

    var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;

    this.setState({viewBox: newVBox});
},
render: function render()
{
    this.isHost = this.props.isHost;
    this.userId = this.props.userId;

    var inElem = React.createElement('canvas', {className: 'inputSpace', id: 'whiteBoard-input'});

    document.body.addEventListener('mouseup', this.mouseUp, false);
    //document.body.addEventListener('touchcancel', this.touchUp, false);

    var isMoving = false;

    if(this.state.currTextMove != -1)
    {
        isMoving = true;
    }
    else if(this.state.currCurveMove != -1)
    {
        isMoving = true;
    }
    else if(this.state.currResize != -1)
    {
        isMoving = true;
    }

    var outElem = React.createElement(SVGComponent,
    {
        className: "renderSpace", id: "whiteBoard-output", curveClickCall: this.curveMouseClick, curveMoveCall: this.curveMouseMove,
        textClickCall: this.textMouseClick, textMoveCall: this.textMouseMove, textDblClick: this.textMouseDblClick, textResize: this.resizeText,
        curveMouseDown: this.curveMouseDown, textMouseMoveDown: this.textMouseMoveDown, textMouseResizeDown: this.textMouseResizeDown,
        viewBox: this.state.viewBox, mode: this.state.mode, isMoving: isMoving, displayElements: this.state.displayElements
    });

    var whitElem = React.createElement('div',
    {
        className: "large-11 small-10 columns", id: "whiteboard-container", onMouseDown: this.mouseDown,
        onMouseMove: this.mouseMove, onMouseLeave: this.mouseUp, onWheel: this.mouseWheel
    }, inElem, outElem);

    var contElem = React.createElement(ControlComponent,
    {
        className: "controlPanel", id: "whiteboard-controller", mode: this.state.mode, colour: this.colour, colourCallback: this.colourChange,
        modeCallback: this.modeChange, weightCallback: this.weightChange, styleCallback: this.styleChange, decorationCallback: this.decorationChange,
        justifiedCallback: this.justifiedChange, justified: this.state.justified
    });

    return  (React.createElement("div", {className: "expanded row", id: "whiteboard-row"}, whitElem, contElem));
}});
