interface DisplayElement {
    id: number;
    type: string;
    size: number;
}

interface CurveElement extends DisplayElement {
    param?: string;
    point?: Point;
    colour: string;
}

interface TextElement extends DisplayElement {
    x: number;
    y: number;
    width: number;
    height: number;
    isEditing: boolean;
    remLock: boolean;
    getLock: boolean;
    textNodes: Array<TextNode>;
    cursorElems: Array<Selection>;
    cursor: CursorElement;
}

interface WhiteBoardViewState
{
    mode: number;
    colour: string;
    isBold: boolean;
    isItalic: boolean;
    isULine: boolean;
    isOLine: boolean;
    isTLine: boolean;
    isJustified: boolean;
    viewBox: string;
    itemMoving: boolean;
    boardElements: Immutable.List<DisplayElement>;
    dispatcher: WhiteBoardDispatcher;
}


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

    var tspanElems = this.props.textNodes.map(function (textElem : TextNode)
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
            key: textElem.lineNum, x: textElem.x, y: textElem.y, xmlSpace: 'preserve'}, styleNodeElems
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

    if(this.props.cursor)
    {
        hightLightBoxes.push(React.createElement('line',
        {
            x1: this.props.cursor.x, y1: this.props.cursor.y,
            x2: this.props.cursor.x, y2: this.props.cursor.y + this.props.cursor.height,
            stroke: 'black', strokeWidth: 1, className: 'blinking', key: 'cursor'
        }));
    }

    if(this.props.cursorElems)
    {
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
    }
    if(this.props.isEditing)
    {
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
            className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size,
            onClick: this.props.mouseClick, onMouseMove: this.props.mouseMove
        }, tspanElems);
    }
    else
    {
        displayElement = React.createElement('text',
        {
            className: 'noselect', x: this.props.x, y: this.props.y, fontSize: this.props.size, pointerEvents: 'none'
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
render: function()
{
    var displayElements = [];
    var state : WhiteBoardViewState = this.props.state as WhiteBoardViewState;
    var dispatcher : WhiteBoardDispatcher = state.dispatcher as WhiteBoardDispatcher;

    state.boardElements.forEach((element) =>
    {

        if(element.type == 'text')
        {
            var tElement : TextElement = element as TextElement;
            displayElements.push(React.createElement(SVGText,
            {
                key: tElement.id, colour: tElement.colour, size: tElement.size, x: tElement.x, y: tElement.y, width: tElement.width, height: tElement.height,
                mode: state.mode, isMoving: state.itemMoving, isEditing: tElement.isEditing, cursor: tElement.cursor,
                cursorElems: tElement.cursorElems, textNodes: tElement.textNodes, remEdit: tElement.remLock, getLock: tElement.getLock,
                mouseClick:  (function(id) { return () =>  {  dispatcher.textMouseClick(id);   }; })(element.id),
                doubleClick: (function(id) { return () =>  {  dispatcher.textMouseDblClick(id);    }; })(element.id),
                mouseMove:   (function(id) { return () =>  {  dispatcher.textMouseMove(id);    }; })(element.id),
                mouseMoveDown:   (function(id) { return (e: MouseEvent) => { dispatcher.textMouseMoveDown(id, e); }; })(element.id),
                mouseResizeDown: (function(id) { return (e: MouseEvent, vert: boolean, horz: boolean) => { dispatcher.textMouseResizeDown(id, vert, horz, e); }; })(element.id)
            }));
        }
        else if(element.type == 'circle')
        {
            var cElement : CurveElement = element as CurveElement;
            displayElements.push(React.createElement(SVGBezier,
            {
                key: cElement.id, x: cElement.point.x, y: cElement.point.y, colour: cElement.colour, size: cElement.size, mode: state.mode, type: 'circle',
                isMoving: state.itemMoving,
                mouseMove:   (function(id) { return () => { dispatcher.curveMouseMove(id);  }; })(element.id),
                mouseClick:  (function(id) { return () =>  { dispatcher.curveMouseClick(id);  }; })(element.id),
                mouseDown:   (function(id) { return (e: MouseEvent) => { dispatcher.curveMouseDown(id, e); }; })(element.id)
            }));
        }
        else if(element.type == 'path')
        {
            var cElement : CurveElement = element as CurveElement;
            displayElements.push(React.createElement(SVGBezier,
            {
                key: cElement.id, param: cElement.param, colour: cElement.colour, size: cElement.size, mode: state.mode, type: 'path',
                isMoving: state.itemMoving,
                mouseMove:   (function(id) { return function() { dispatcher.curveMouseMove(id);  }; })(element.id),
                mouseClick:  (function(id) { return function()  { dispatcher.curveMouseClick(id);  }; })(element.id),
                mouseDown:   (function(id) { return function(e: MouseEvent) { dispatcher.curveMouseDown(id, e); }; })(element.id)
            }));
        }
    });

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
render: function()
{
    var state : WhiteBoardViewState = this.props.state as WhiteBoardViewState;
    var dispatcher : WhiteBoardDispatcher = state.dispatcher as WhiteBoardDispatcher;

    var blackButt  = React.createElement('button', {className: 'button colour-button', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.colourChange('black')});
    var blueButt   = React.createElement('button', {className: 'button colour-button', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.colourChange('blue')});
    var redButt    = React.createElement('button', {className: 'button colour-button', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.colourChange('red')});
    var greenButt  = React.createElement('button', {className: 'button colour-button', id: 'green-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.colourChange('green')});
    var drawButt   = React.createElement('button', {className: 'button mode-button', id: 'draw-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.modeChange(0)}, 'D');
    var textButt   = React.createElement('button', {className: 'button mode-button', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.modeChange(1)}, 'T');
    var eraseButt = React.createElement('button', {className: 'button mode-button', id: 'erase-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.modeChange(2)}, 'E');
    var selectButt = React.createElement('button', {className: 'button mode-button', id: 'select-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.modeChange(3)}, 'S');
    var boldButt;
    var italButt;
    var ulineButt;
    var tlineButt;
    var olineButt;
    var justButt;

    if(state.colour == 'black')
    {
        blackButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'black-button'});
    }
    else if(state.colour == 'blue')
    {
        blueButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'blue-button'});
    }
    else if(state.colour == 'red')
    {
        redButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'red-button'});
    }
    else if(state.colour == 'green')
    {
        greenButt = React.createElement('button', {className: 'button colour-button pressed-colour', id: 'green-button'});
    }

    if(state.mode == 0)
    {
        drawButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'draw-button'}, 'D');
    }
    else if(state.mode == 1)
    {
        textButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'text-button'}, 'T');
    }
    else if(state.mode == 2)
    {
        eraseButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'erase-button'}, 'E');
    }
    else if(state.mode == 3)
    {
        selectButt = React.createElement('button', {className: 'button mode-button pressed-mode', id: 'select-button'}, 'S');
    }

    if(state.isBold)
    {
        boldButt = React.createElement('button',
        {
            className: 'button style-button pressed-style', id: 'bold-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.boldChange(false)
        }, 'B');
    }
    else
    {
        boldButt = React.createElement('button',
        {
            className: 'button style-button', id: 'bold-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.boldChange(true)
        }, 'B');
    }

    if(state.isItalic)
    {
        italButt = React.createElement('button',
        {
            className: 'button style-button pressed-style', id: 'italic-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.italicChange(false)
        }, 'I');
    }
    else
    {
        italButt = React.createElement('button',
        {
            className: 'button style-button', id: 'italic-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.italicChange(true)
        }, 'I');
    }

    if(state.isULine)
    {
        ulineButt = React.createElement('button',
        {
            className: 'button style-button pressed-style', id: 'uline-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.underlineChange(false)
        }, 'U');
    }
    else
    {
        ulineButt = React.createElement('button',
        {
            className: 'button style-button', id: 'uline-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.underlineChange(true)
        }, 'U');
    }
    if(state.isTLine)
    {
        tlineButt = React.createElement('button',
        {
            className: 'button style-button pressed-style', id: 'tline-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.throughlineChange(false)
        }, 'T');
    }
    else
    {
        tlineButt = React.createElement('button',
        {
            className: 'button style-button', id: 'tline-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.throughlineChange(true)
        }, 'T');
    }
    if(state.isOLine)
    {
        olineButt = React.createElement('button',
        {
            className: 'button style-button pressed-style', id: 'oline-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.overlineChange(false)
        }, 'O');
    }
    else
    {
        olineButt = React.createElement('button',
        {
            className: 'button style-button', id: 'oline-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.overlineChange(true)
        }, 'O');
    }

    if(state.isJustified)
    {
        justButt = React.createElement('button',
        {
            className: 'button style-button pressed-style', id: 'justify-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.justifiedChange(false)
        }, 'J');
    }
    else
    {
        justButt = React.createElement('button',
        {
            className: 'button style-button', id: 'justify-button',
            onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher.justifiedChange(true)
        }, 'J');
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
var WhiteBoardView = React.createClass({displayName: 'Whiteboard',
getInitialState: function()
{
    return {
        viewBox: '0 0 0 0',
        mode: 0,
        colour: 'black',
        isBold: false,
        isItalic: false,
        isULine: false,
        isOLine: false,
        isTLine: false,
        isJustified: true,
        boardElements: Immutable.List<DisplayElement>(),
        dispatcher: {
            curveMouseDown: (id: number, e: MouseEvent) => {},
            curveMouseClick: (id: number) => {},
            curveMouseMove: (id: number) => {},
            textMouseClick: (id: number) => {},
            textMouseDblClick: (id: number) => {},
            textMouseMove: (id: number) => {},
            textMouseMoveDown: (id: number, e: MouseEvent) => {},
            textMouseResizeDown: (id: number, vert: boolean, horz: boolean, e: MouseEvent) => {},
            colourChange: (newColour: string) => {},
            modeChange: (newMode: number) => {},
            boldChange: (newState: boolean) => {},
            italicChange: (newState: boolean) => {},
            underlineChange:  (newState: boolean) => {},
            overlineChange:  (newState: boolean) => {},
            throughlineChange:  (newState: boolean) => {},
            justifiedChange: (newState: boolean) => {},
            mouseDown: (e: MouseEvent) => {},
            mouseWheel: (e: MouseEvent) => {},
            mouseMove: (e: MouseEvent) => {},
            mouseUp: (e: MouseEvent) => {}},
            itemMoving: false
    } as WhiteBoardViewState;
},
storeUpdate: function(newState: WhiteBoardViewState)
{
    this.setState(newState);
},
render: function()
{
    var state = this.state as WhiteBoardViewState;
    var dispatcher = state.dispatcher as WhiteBoardDispatcher;

    var inElem = React.createElement('canvas', {className: 'inputSpace', id: 'whiteBoard-input'});

    document.body.addEventListener('mouseup', this.mouseUp, false);
    //document.body.addEventListener('touchcancel', this.touchUp, false);

    var outElem = React.createElement(SVGComponent,
    {
        className: "renderSpace", id: "whiteBoard-output", state: state
    });

    var whitElem = React.createElement('div',
    {
        className: "large-11 small-10 columns", id: "whiteboard-container", onMouseDown: dispatcher.mouseDown,
        onMouseMove: dispatcher.mouseMove, onMouseUp: dispatcher.mouseUp, onMouseLeave: dispatcher.mouseUp, onWheel: dispatcher.mouseWheel
    }, inElem, outElem);

    var contElem = React.createElement(ControlComponent,
    {
        className: "controlPanel", id: "whiteboard-controller", state: state
    });

    return  (React.createElement("div", {className: "expanded row", id: "whiteboard-row"}, whitElem, contElem));
}});
