/** Whiteboard Text Component.
*
* This allows the user to write text and have it rendered as SVG text.
*
*/
namespace WhiteBoardTextView {
    /**
     * The name of the mode associated with this component.
     */
    export let MODENAME = 'TEXT';

    interface CursorElement extends Point {
        height: number;
    }

    interface CursorSelection extends CursorElement {
        width: number;
    }

    interface GlyphData {
        isLigature: boolean;
        isMark: boolean;
        codePoints: Array<number>;
        path: string;
        stringPositions: Array<number>;
        colour: string;
        uline: boolean;
        oline: boolean;
        tline: boolean;
        startAdvance: number;
        xAdvance: number;
        yAdvance: number;
        xOffset: number;
        yOffset: number;
        isSpace: boolean;
        isHyphen: boolean;
    }
    interface Section {
        startPos: number;
        startGlyph: number;
        stringStart: number;
        glyphs: Array<GlyphData>;
    }
    interface TextNode {
        lineNum: number;
        x: number;
        y: number;
        dx: number;
        dy: number;
        start: number;
        end: number;
        spaceRemoved: boolean;
        justified: boolean;
        sections: Array<Section>;
        endStringPos: number;
    }

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        editLock: number;
        text: string;
        justified: boolean;
        textNodes: Array<TextNode>;
        cursor: CursorElement;
        cursorElems: Array<CursorSelection>;
        dist: Array<number>;
        size: number;
    }

    /**
     * A description of the view state for the pallete of this component.
     * This will be passed from the pallete controller to the view.
     */
    interface PalleteViewState extends BoardPalleteViewState {
        size: number;
        colour: string;
        isBold: boolean;
        isItalic: boolean;
        isULine: boolean;
        isOLine: boolean;
        isTLine: boolean;
        isJustified: boolean;
    }

    /**
     * The set of possible types of pallete changes.
     * Used in interfacing between component view and state.
     */
    const enum PalleteChangeType {
        COLOUR,
        SIZE,
        BOLD,
        ITALIC,
        UNDERLINE,
        THROUGHLINE,
        OVERLINE,
        JUSTIFIED
    }

    const PalleteColour = {
        BLACK: 'black',
        BLUE: 'blue',
        RED: 'red',
        GREEN: 'green'
    }

    const PalleteSize = {
        XSMALL: 2.0,
        SMALL: 5.0,
        MEDIUM: 10.0,
        LARGE: 20.0
    }

    /**
     * A description of components within the view of an element.
     * This is used to identify the source of user input from the element view.
     */
    const enum ViewComponents {
        View,
        Resize,
        Interaction,
        TextArea
    }

    const enum ResizeComponents {
        Corner,
        Right,
        Bottom
    }

    /**
     * A function that will draw to the canvas to give imidiet user feedback whilst the user provides input to create a new element.
     *
     * @param {DrawData} input The current user input to potentially use to create element.
     * @param {CanvasRenderingContext2D} context The canvas context to be drawn to.
     */
    export const DrawHandle = (input: DrawData, context: CanvasRenderingContext2D) =>
    {
        if(input.width > 0 && input.height > 0)
        {
            context.beginPath();
            context.strokeStyle = 'black';
            context.setLineDash([5]);
            context.strokeRect(input.x, input.y, input.width, input.height);
            context.stroke();
        }
    };

    /** Whiteboard Element View.
    *
    * This is the class that will be used to render the element. It must return an SVG tag (which may have embedded tags).
    */
    export class ElementView extends React.Component<any, {}>
    {
        propTypes = {};

        props: ComponentProp;

        /** React function to determine if component should update.
         *
         * @param {React.Prop} nextProps - The new set of props.
         * @param {React.Prop} nextState - The new element state.
         *
         * @return boolean - Whether to update this component.
         */
        shouldComponentUpdate(nextProps, nextState)
        {
            return this.props.state !== nextProps.state || this.props.mode !== nextProps.mode;
        }

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            let state = this.props.state as ViewState;
            let dispatcher = this.props.dispatcher;
            let mode = this.props.mode;

            let hightLightBoxes = [];
            let borderBoxes = [];
            let selCount = 0;
            let displayElement;
            let self = this;

            let lineElems = state.textNodes.map(function (textElem : TextNode)
            {
                let sections = [];

                for(let j = 0; j < textElem.sections.length; j++)
                {
                    let sectionData: Section = textElem.sections[j];
                    let glyphs = [];

                    for(let i = 0; i < sectionData.glyphs.length; i++)
                    {
                        let glyph = sectionData.glyphs[i];

                        let glyphArgs = {
                            key: i, d: glyph.path, stroke: 'none', fill: glyph.colour,
                            transform: 'translate(' + glyph.startAdvance + ',' + 0 + ')' + 'scale(1, -1)'
                        }

                        glyphs.push(React.createElement('path', glyphArgs));

                        if(glyph.uline)
                        {
                            glyphs.push(React.createElement('line',
                            {
                                x1: glyph.startAdvance, y1: 300,
                                x2: glyph.startAdvance + glyph.xAdvance, y2: 300,
                                stroke: glyph.colour, strokeWidth: 150, key: 'underline' + i
                            }));
                        }

                        if(glyph.oline)
                        {
                            glyphs.push(React.createElement('line',
                            {
                                x1: glyph.startAdvance, y1: -1300,
                                x2: glyph.startAdvance + glyph.xAdvance, y2: -1300,
                                stroke: glyph.colour, strokeWidth: 150, key: 'overline' + i
                            }));
                        }

                        if(glyph.tline)
                        {
                            glyphs.push(React.createElement('line',
                            {
                                x1: glyph.startAdvance, y1: -500,
                                x2: glyph.startAdvance + glyph.xAdvance, y2: -500,
                                stroke: glyph.colour, strokeWidth: 150, key: 'throughline' + i
                            }));
                        }
                    }

                    let newElem = React.createElement('g',
                    {
                        key: textElem.lineNum, transform: 'scale(' + state.size / 1000 + ',' + state.size / 1000 + ')' +
                        'translate(' + sectionData.startPos + ', 0)'
                    }, glyphs);

                    sections.push(newElem);
                }


                return React.createElement('g',
                {
                    key: textElem.lineNum, transform: 'translate(' + 0 + ',' + (textElem.lineNum + 1) * (2 * state.size) + ')'
                }, sections);
            });

            if(mode == BoardModes.SELECT && !state.isMoving && !state.isResizing && !state.remLock)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'move', x: 0, y: 0, width: state.width, height: state.height,
                    fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                    onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                }));
            }

            if(state.cursor != null)
            {
                hightLightBoxes.push(React.createElement('line',
                {
                    x1: state.cursor.x, y1: state.cursor.y,
                    x2: state.cursor.x, y2: state.cursor.y + state.cursor.height,
                    stroke: 'black', strokeWidth: 1, className: 'blinking', key: 'cursor'
                }));
            }

            if(state.cursorElems)
            {
                for(var i = 0; i < state.cursorElems.length; i++)
                {
                    var selElem = state.cursorElems[i];
                    selCount++;
                    hightLightBoxes.push(React.createElement('rect',
                    {
                        x: selElem.x, y: selElem.y, width: selElem.width, height: selElem.height,
                        fill: '#0066ff', stroke: 'none', fillOpacity: 0.3, key: selCount
                    }));
                }
            }
            if(state.isEditing)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'locEdit', x: 0, y: 0, width: state.width, height: state.height,
                    fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));

                if(!state.isMoving && !state.isResizing)
                {
                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'moveTop', x1: 0, y1: 0, x2: 0 + state.width - state.size * 0.25, y2: 0,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                    }));

                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'moveLeft', x1: 0, y1: 0, x2: 0, y2: 0 + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                    }));

                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'resizeBottom', x1: 0, y1: 0 + state.height,
                        x2: 0 + state.width - state.size * 0.25, y2: 0 + state.height,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Bottom); }
                    }));

                    borderBoxes.push(React.createElement('line',
                    {
                        key: 'resizeRight', x1: 0 + state.width, y1: 0,
                        x2: 0 + state.width, y2: 0 + state.height - state.size * 0.25,
                        fill: 'none', strokeWidth: state.size * 0.5, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Right); }
                    }));

                    borderBoxes.push(React.createElement('rect',
                    {
                        key: 'resizeCorner', x: 0 + state.width - state.size * 0.25,
                        y: 0  + state.height - state.size * 0.25,
                        width: state.size * 0.5, height: state.size * 0.5, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                        onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Corner); }
                    }));
                }
            }
            else if(state.getLock)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'getEdit', x: 0, y: 0, width: state.width, height: state.height, fill: 'none',
                    stroke: 'red', strokeWidth: 2
                }));
            }
            else if(state.remLock)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'remEdit', x: 0, y: 0, width: state.width, height: state.height,
                    fill: 'none', stroke: 'red', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
            }

            borderBoxes.push(React.createElement('rect',
            {
                key: 'selBox', x: 0, y: 0, width: state.width, height: state.height, fill: 'none',
                opacity: 0, pointerEvents: 'fill',
                onMouseDown: (e) => { dispatcher.mouseDown(e, ViewComponents.TextArea ); },
                onClick: (e) => { if(e.detail == 2) { dispatcher.doubleClick(e); } }
            }));

            return React.createElement('g', { transform: 'translate(' + state.x + ',' + state.y + ')' }, hightLightBoxes, lineElems, borderBoxes);
        }
    }

    /** Whiteboard Mode View.
    *
    * This is the class that will be used to render the mode selection button for this component. Must return a button.
    *
    */
    export class ModeView extends React.Component<any, {}>
    {
        props: ModeProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            if(this.props.mode == MODENAME)
            {
                return React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'T');
            }
            else
            {
                return React.createElement('button',
                {
                    className: 'button mode-button', id: 'text-button', onKeyUp: function(e) { e.preventDefault(); },
                    onClick: () => { this.props.dispatcher(MODENAME) }
                }, 'T');
            }
        }
    }

    /** Whiteboard Pallete View.
    *
    * This is the class that will be used to render the pallete for this component.
    * This will be displayed when the mode for this component is selected.
    *
    */
    export class PalleteView extends React.Component<any, {}>
    {
        props: PalleteProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            let state = this.props.state as PalleteViewState;
            let dispatcher = this.props.dispatcher;

            let boldButt;
            let italButt;
            let ulineButt;
            let tlineButt;
            let olineButt;
            let justButt;

            let blackButt = React.createElement('button',
            {
                className: 'button colour-button', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.COLOUR, data: PalleteColour.BLACK })
            });
            let blueButt  = React.createElement('button',
            {
                className: 'button colour-button', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.COLOUR, data: PalleteColour.BLUE })
            });
            let redButt   = React.createElement('button',
            {
                className: 'button colour-button', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.COLOUR, data: PalleteColour.RED })
            });
            let greenButt = React.createElement('button',
            {
                className: 'button colour-button', id: 'green-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.COLOUR, data: PalleteColour.GREEN })
            });

            let smallButt = React.createElement('button',
            {
                className: 'button mode-button', id: 'small-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.SIZE, data: PalleteSize.SMALL })
            }, 'S');
            let medButt   = React.createElement('button',
            {
                className: 'button mode-button', id: 'medium-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.SIZE, data: PalleteSize.MEDIUM })
            }, 'M');
            let largeButt = React.createElement('button',
            {
                className: 'button mode-button', id: 'large-button', onKeyUp: function(e) { e.preventDefault(); },
                onClick: () => dispatcher({ type: PalleteChangeType.SIZE, data: PalleteSize.LARGE })
            }, 'L');

            if(state.colour == 'black')
            {
                blackButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == 'blue')
            {
                blueButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == 'red')
            {
                redButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == 'green')
            {
                greenButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'green-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }

            if(state.size == PalleteSize.SMALL)
            {
                smallButt = React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'small-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'S');
            }
            else if(state.size == PalleteSize.MEDIUM)
            {
                medButt = React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'medium-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'M');
            }
            else if(state.size == PalleteSize.LARGE)
            {
                largeButt = React.createElement('button',
                {
                    className: 'button mode-button pressed-mode', id: 'large-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'L');
            }

            let colourCont = React.createElement('div',
            {
                className: 'whiteboard-controlgroup', id: 'whiteboard-colourgroup'
            }, blackButt, blueButt, redButt, greenButt);

            let sizeCont = React.createElement('div',
            {
                className: 'whiteboard-controlgroup', id: 'whiteboard-sizegroup'
            }, smallButt, medButt, largeButt);


            if(state.isBold)
            {
                boldButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'bold-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.BOLD, data: false })
                }, 'B');
            }
            else
            {
                boldButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'bold-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.BOLD, data: true })
                }, 'B');
            }

            if(state.isItalic)
            {
                italButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'italic-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.ITALIC, data: false })
                }, 'I');
            }
            else
            {
                italButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'italic-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.ITALIC, data: true })
                }, 'I');
            }

            if(state.isULine)
            {
                ulineButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'uline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.UNDERLINE, data: false })
                }, 'U');
            }
            else
            {
                ulineButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'uline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.UNDERLINE, data: true })
                }, 'U');
            }
            if(state.isTLine)
            {
                tlineButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'tline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.THROUGHLINE, data: false })
                }, 'T');
            }
            else
            {
                tlineButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'tline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.THROUGHLINE, data: true })
                }, 'T');
            }
            if(state.isOLine)
            {
                olineButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'oline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.OVERLINE, data: false })
                }, 'O');
            }
            else
            {
                olineButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'oline-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.OVERLINE, data: true })
                }, 'O');
            }

            if(state.isJustified)
            {
                justButt = React.createElement('button',
                {
                    className: 'button style-button pressed-style', id: 'justify-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.JUSTIFIED, data: false })
                }, 'J');
            }
            else
            {
                justButt = React.createElement('button',
                {
                    className: 'button style-button', id: 'justify-button',
                    onKeyUp: function(e) { e.preventDefault(); }, onClick: () => dispatcher({ type: PalleteChangeType.JUSTIFIED, data: true })
                }, 'J');
            }

            let styleCont = React.createElement('div',
            {
                className: 'whiteboard-controlgroup', id: 'whiteboard-stylegroup'
            }, boldButt, italButt, ulineButt, tlineButt, olineButt, justButt);

            return React.createElement('div', null, colourCont, sizeCont, styleCont);
        }
    }

    /** Custom Context View.
    *
    * This is the class that will be used to render the additional context menu items for this component.
    * This will be displayed when the mode for this component is selected.
    *
    * Note: Copy, Cut and Paste have standard event handlers in dispatcher. If other context items are desired they must use the custom context event.
    */
    export class CustomContextView extends React.Component<any, {}>
    {
        propTypes = {};

        props: PalleteProp;

        /** React render function
         *
         * @return React.DOMElement
         */
        render()
        {
            let state = this.props.state as PalleteViewState;
            let dispatcher = this.props.dispatcher;

            return null;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                                                            //
// REGISTER COMPONENT                                                                                                                                         //
//                                                                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
registerComponentView(WhiteBoardTextView.MODENAME, WhiteBoardTextView.ElementView, WhiteBoardTextView.PalleteView,
    WhiteBoardTextView.ModeView, WhiteBoardTextView.DrawHandle);
