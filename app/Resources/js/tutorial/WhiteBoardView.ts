interface AlertElement {
    type: string;
    message: string;
}

interface InfoElement {
    x: number;
    y: number;
    width: number;
    height: number;
    header: string;
    message: string;
}

interface WhiteBoardViewState
{
    mode: string;
    blockAlert: boolean;
    baseSize: number;
    viewBox: string;
    viewX: number;
    viewY: number;
    viewWidth: number;
    viewHeight: number;
    viewScale: number;
    eraseSize: number;
    itemMoving: boolean;
    itemResizing: boolean;
    resizeVert: boolean;
    resizeHorz: boolean;
    cursor: string;
    cursorURL: Array<string>;
    cursorOffset: Point;
    components: Immutable.Map<string, BoardComponent>;
    palleteState: BoardPalleteViewState;
    boardElements: Immutable.OrderedMap<number, ComponentViewState>;
    alertElements: Immutable.List<AlertElement>;
    infoElements: Immutable.List<InfoElement>;
    dispatcher: WhiteBoardDispatcher;
}

const EraseSize = {
    SMALL: 1,
    MEDIUM: 5,
    LARGE: 10
}

/*
 *
 *
 *
 *
 *
 */
var SVGSpinner = React.createClass({displayName: 'SVGSpinner',
render: function()
{
    let background = React.createElement('circle',
    {
        key: 'background', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.2 * this.props.size, fill: 'none', stroke: '#333333'
    });

    let bar = React.createElement('circle',
    {
        key: 'bar', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.15 * this.props.size,
        fill: 'none', stroke: '#FF9F1E',
        style: { transformOrigin: this.props.x + 'px ' + this.props.y + 'px' }
    });

    let highlight = React.createElement('circle',
    {
        key: 'highlight', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.15 * this.props.size,
        fill: 'none', stroke: '#FFFFFF', strokeOpacity: 0.3, className: 'spinner', strokeDasharray: this.props.size * 2 * Math.PI / 4,
        style: { transformOrigin: this.props.x + 'px ' + this.props.y + 'px' }
    });

    return React.createElement('g', null, background, bar, highlight);
}
});

/*
 *
 *
 *
 *
 *
 */
var SVGProgress = React.createClass({displayName: 'SVGProgress',
render: function()
{
    let background = React.createElement('circle',
    {
        key: 'background', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.2 * this.props.size, fill: 'none', stroke: '#333333'
    });

    let bar = React.createElement('circle',
    {
        key: 'bar', cx: this.props.x, cy: this.props.y, r: this.props.size, strokeWidth: 0.15 * this.props.size, strokeDasharray: this.props.size * 2 * Math.PI,
        strokeDashoffset: (this.props.value / this.props.max + 1) * this.props.size * 2 * Math.PI, fill: 'none', stroke: '#FF9F1E', className: 'spinner',
        style: { transformOrigin: this.props.x + 'px ' + this.props.y + 'px' }
    });

    let text = React.createElement('text',
    {
        key: 'text', className: 'noselect', x: this.props.x - this.props.size * 0.5, y: this.props.y + this.props.size * 0.15, fontSize: this.props.size * 0.5,
        fill: '#FF9F1E'
    }, ('00' + Math.round(this.props.value)).substr(-2) + '%');

    return React.createElement('g', null, text, background, bar);
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
    let displayElements = [];
    let highlights = [];
    let state : WhiteBoardViewState = this.props.state as WhiteBoardViewState;
    let dispatcher : WhiteBoardDispatcher = state.dispatcher as WhiteBoardDispatcher;

    let cursorType: string;

    if(state.cursorURL.length > 0)
    {
        cursorType = 'url(' + state.cursorURL[0] + ') ' + state.cursorOffset.x + ' ' + state.cursorOffset.y;

        for(let i = 1; i < state.cursorURL.length; i++)
        {
            cursorType += ',url(' + state.cursorURL[i] + ') ' + state.cursorOffset.x + ' ' + state.cursorOffset.y;
        }

        cursorType += ',auto';
    }
    else
    {
        cursorType = state.cursor;
    }

    state.boardElements.forEach((element) =>
    {
        let dispater: ComponentDispatcher =
        {
            mouseOver:   (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseOver(id, e, component, subComp); }; })(element.id),
            mouseOut:   (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseOut(id, e, component, subComp); }; })(element.id),
            mouseDown:   (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseDown(id, e, component, subComp); }; })(element.id),
            mouseMove:   (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseMove(id, e, component, subComp); }; })(element.id),
            mouseUp:   (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseUp(id, e, component, subComp); }; })(element.id),
            mouseClick:  (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseClick(id, e, component, subComp); }; })(element.id),
            doubleClick: (function(id) { return (e: MouseEvent, component?: number, subComp?: number) =>
                { dispatcher.elementMouseDoubleClick(id, e, component, subComp); }; })(element.id),

            touchStart: (function(id) { return (e: TouchEvent, component?: number, subComp?: number) =>
                { dispatcher.elementTouchStart(id, e, component, subComp); }; })(element.id),
            touchMove: (function(id) { return (e: TouchEvent, component?: number, subComp?: number) =>
                { dispatcher.elementTouchMove(id, e, component, subComp); }; })(element.id),
            touchEnd: (function(id) { return (e: TouchEvent, component?: number, subComp?: number) =>
                { dispatcher.elementTouchEnd(id, e, component, subComp); }; })(element.id),
            touchCancel: (function(id) { return (e: TouchEvent, component?: number, subComp?: number) =>
                { dispatcher.elementTouchCancel(id, e, component, subComp); }; })(element.id),

            dragOver: (function(id) { return (e: DragEvent, component?: number, subComp?: number) =>
                { dispatcher.elementDragOver(id, e, component, subComp); }; })(element.id),
            drop: (function(id) { return (e: DragEvent, component?: number, subComp?: number) =>
                { dispatcher.elementDrop(id, e, component, subComp); }; })(element.id),
        };

        displayElements.push(React.createElement(state.components.get(element.mode).ElementView,
        {
            key: element.id, mode: state.mode, state: element, dispatcher: dispater, viewScale: state.viewScale, eraseSize: state.eraseSize
        }));
    });

    return React.createElement('svg',
    {
        key: 'whiteBoard-output', className: 'svgcomponent', id: 'whiteBoard-output', viewBox: state.viewBox, cursor: cursorType
    }, displayElements);
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
    let state : WhiteBoardViewState = this.props.state as WhiteBoardViewState;
    let dispatcher : WhiteBoardDispatcher = this.props.dispatcher as WhiteBoardDispatcher;

    let modeButtons = [];

    state.components.forEach((component) =>
    {
        modeButtons.push(React.createElement(component.ModeView, { key: state.mode, mode: state.mode, dispatcher: dispatcher.modeChange }));
    });

    let pallete = null;
    let eraseButt = React.createElement('button',
    {
        className: 'button mode-button', id: 'erase-button', onKeyUp: function(e) { e.preventDefault(); },
        onClick: () => dispatcher.modeChange(BoardModes.ERASE)
    }, 'E');
    let selectButt = React.createElement('button',
    {
        className: 'button mode-button', id: 'select-button', onKeyUp: function(e) { e.preventDefault(); },
        onClick: () => dispatcher.modeChange(BoardModes.SELECT)
    }, 'S');

    if(state.mode == BoardModes.ERASE)
    {
        eraseButt = React.createElement('button',
        {
            className: 'button mode-button pressed-mode', id: 'erase-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
        }, 'E');

        let smallButt = React.createElement('button',
        {
            className: 'button mode-button', id: 'small-button', onKeyUp: function(e) { e.preventDefault(); },
            onClick: () => dispatcher.changeEraseSize(EraseSize.SMALL)
        }, 'S');
        let medButt   = React.createElement('button',
        {
            className: 'button mode-button', id: 'medium-button', onKeyUp: function(e) { e.preventDefault(); },
            onClick: () => dispatcher.changeEraseSize(EraseSize.MEDIUM)
        }, 'M');
        let largeButt = React.createElement('button',
        {
            className: 'button mode-button', id: 'large-button', onKeyUp: function(e) { e.preventDefault(); },
            onClick: () => dispatcher.changeEraseSize(EraseSize.LARGE)
        }, 'L');

        if(state.eraseSize == EraseSize.SMALL)
        {
            smallButt = React.createElement('button',
            {
                className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
            }, 'S');
        }
        else if(state.eraseSize == EraseSize.MEDIUM)
        {
            medButt = React.createElement('button',
            {
                className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
            }, 'M');
        }
        else if(state.eraseSize == EraseSize.LARGE)
        {
            largeButt = React.createElement('button',
            {
                className: 'button mode-button pressed-mode', id: 'large-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
            }, 'L');
        }

        let sizeCont = React.createElement('div',
        {
            className: 'whiteboard-controlgroup', id: 'whiteboard-sizegroup'
        }, smallButt, medButt, largeButt);

        pallete = React.createElement('div', null, sizeCont);
    }
    else if(state.mode == BoardModes.SELECT)
    {
        selectButt = React.createElement('button',
        {
            className: 'button mode-button pressed-mode', id: 'select-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
        }, 'S');
    }
    else if(state.mode != '')
    {
        pallete = React.createElement(state.components.get(state.mode).PalleteView, { state: state.palleteState, dispatcher: dispatcher.palleteChange });
    }

    let modeCont = React.createElement('div', {className: 'whiteboard-controlgroup', id: 'whiteboard-modegroup'}, selectButt, eraseButt, modeButtons);
    return React.createElement('div', {className: 'large-1 small-2 columns', id: 'whiteboard-controler'}, modeCont, pallete);
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
        components: Immutable.Map<string, BoardComponent>(),
        mode: '',
        palleteState: {},
        cursor: 'auto',
        cursorURL: [],
        cursorOffset: {x: 0, y: 0},
        baseSize: 1,
        eraseSize: 1.0,
        viewX: 0,
        viewY: 0,
        viewWidth: 0,
        viewHeight: 0,
        viewScale: 1,
        itemMoving: false,
        itemResizing: false,
        resizeVert: false,
        resizeHorz: false,
        blockAlert: false,
        boardElements: Immutable.OrderedMap<number, ComponentViewState>(),
        infoElements: Immutable.List<InfoElement>(),
        alertElements: Immutable.List<AlertElement>(),
        dispatcher:
        {
            palleteChange:           (change: BoardPalleteChange) => {},
            changeEraseSize:         (newSize: number)            => {},
            elementMouseOver:        (id: number, e: MouseEvent)  => {},
            elementMouseOut:         (id: number, e: MouseEvent)  => {},
            elementMouseDown:        (id: number, e: MouseEvent)  => {},
            elementMouseMove:        (id: number, e: MouseEvent)  => {},
            elementMouseUp:          (id: number, e: MouseEvent)  => {},
            elementMouseClick:       (id: number, e: MouseEvent)  => {},
            elementMouseDoubleClick: (id: number, e: MouseEvent)  => {},
            elementTouchStart:       (id: number, e: TouchEvent)  => {},
            elementTouchMove:        (id: number, e: TouchEvent)  => {},
            elementTouchEnd:         (id: number, e: TouchEvent)  => {},
            elementTouchCancel:      (id: number, e: TouchEvent)  => {},
            elementDragOver:         (id: number, e: DragEvent)   => {},
            elementDrop:             (id: number, e: DragEvent)   => {},
            clearAlert:              (id: number)                 => {},
            modeChange:              (newMode: string)            => {},
            onCopy:                  (e: ClipboardEvent)          => {},
            onCut:                   (e: ClipboardEvent)          => {},
            onPaste:                 (e: ClipboardEvent)          => {},
            contextCopy:             (e: MouseEvent)              => {},
            contextCut:              (e: MouseEvent)              => {},
            contextPaste:            (e: MouseEvent)              => {},
            mouseDown:               (e: MouseEvent)              => {},
            mouseWheel:              (e: MouseEvent)              => {},
            mouseMove:               (e: MouseEvent)              => {},
            mouseUp:                 (e: MouseEvent)              => {},
            touchStart:              (e: TouchEvent)              => {},
            touchMove:               (e: TouchEvent)              => {},
            touchEnd:                (e: TouchEvent)              => {},
            touchCancel:             (e: TouchEvent)              => {},
            dragOver:                (e: DragEvent)               => {},
            drop:                    (e: DragEvent)               => {}
        }

    } as WhiteBoardViewState;
},
storeUpdate: function(newState: WhiteBoardViewState)
{
    this.setState(newState);
},
render: function()
{
    let state: WhiteBoardViewState = this.state as WhiteBoardViewState;
    let dispatcher: WhiteBoardDispatcher = state.dispatcher as WhiteBoardDispatcher;
    let inElem = React.createElement('canvas', {className: 'inputSpace', id: 'whiteBoard-input'});

    document.body.addEventListener('mouseup', this.mouseUp, false);
    //document.body.addEventListener('touchcancel', this.touchUp, false);

    let outElem = React.createElement(SVGComponent,
    {
        className: "renderSpace", id: "whiteBoard-output", key: 'output', state: state
    });

    let whitElem = React.createElement('div',
    {
        className: "large-11 small-10 columns", id: "whiteboard-container", key: 'whiteboard', onMouseDown: dispatcher.mouseDown, onDrop: dispatcher.drop,
        onDragOver: dispatcher.dragOver, onMouseMove: dispatcher.mouseMove, onMouseUp: dispatcher.mouseUp, onMouseLeave: dispatcher.mouseUp,
        onWheel: dispatcher.mouseWheel, onCopy: dispatcher.onCopy, onPaste: dispatcher.onPaste, onCut: dispatcher.onCut, contextMenu: 'whiteboard-context'
    }, outElem, inElem);

    let contElem = React.createElement(ControlComponent,
    {
        className: "controlPanel", id: "whiteboard-controller", key: 'controlPanel',
        state: { mode: state.mode, components: state.components, palleteState: state.palleteState, eraseSize: state.eraseSize },
        dispatcher: { modeChange: dispatcher.modeChange, palleteChange: dispatcher.palleteChange, changeEraseSize: dispatcher.changeEraseSize }
    });

    let contextMenu = React.createElement('menu',
        { type: 'context', id: 'whiteboard-context', key: 'context' },
        React.createElement('menuitem', { label: 'Copy',  onClick: dispatcher.contextCopy }),
        React.createElement('menuitem', { label: 'Cut',   onClick: dispatcher.contextCut }),
        React.createElement('menuitem', { label: 'Paste', onClick: dispatcher.contextPaste }));


    let infoElems = [];

    for(let i = 0; i < state.infoElements.size; i++)
    {
        let info : InfoElement = state.infoElements.get(i) as InfoElement;

        let elemStyle = { position: 'absolute', zIndex: 10, left: info.x, top: info.y, width: info.width, height: info.height };

        let infoElem = React.createElement('div', { key: i, className: 'callout secondary', style: elemStyle },
            React.createElement('h5', null, info.header), React.createElement('p', null, info.message));

        infoElems.push(infoElem);
    }

    if(state.alertElements.size > 0 && !state.blockAlert)
    {
        let alertMsg : AlertElement = state.alertElements.first();

        let alertElem = React.createElement('div', { className: 'alert callout alert-message', onClick: dispatcher.clearAlert },
            React.createElement('h5', null, alertMsg.type), React.createElement('p', null, alertMsg.message));

        return  (React.createElement("div", {className: "expanded row", id: "whiteboard-row"}, whitElem, contElem, alertElem, infoElems, contextMenu));
    }
    else
    {
        return  (React.createElement("div", {className: "expanded row", id: "whiteboard-row"}, whitElem, contElem, infoElems, contextMenu));
    }
}});
