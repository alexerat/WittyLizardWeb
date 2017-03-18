/** Free Curve Whiteboard Component.
*
* This allows the user to free draw curves that will be smoothed and rendered to SVG Beziers.
*
*/
namespace FreeCurveView
{
    /**
     * The name of the mode associated with this component.
     */
    export const MODENAME = 'FREECURVE';

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        param?: string;
        point?: Point;
        colour: string;
        size: number;
        type: string;
    }

    /**
     * A description of the view state for the pallete of this component.
     * This will be passed from the pallete controller to the view.
     */
    interface PalleteViewState extends BoardPalleteViewState {
        colour: string;
        size: number;
    }

    const enum PalleteChangeType {
        COLOUR,
        SIZE
    }

    const PalleteColour = {
        BLACK: 'black',
        BLUE: 'blue',
        RED: 'red',
        GREEN: 'green'
    };

    const PalleteSize = {
        XSMALL: 2.0,
        SMALL: 5.0,
        MEDIUM: 10.0,
        LARGE: 20.0
    };

    /**
     * A description of components within the view of an element.
     * This is used to identify the source of user input from the element view.
     */
    const enum ViewComponents {
        View,
        Interaction
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    // VIEW                                                                                                                                                   //
    //                                                                                                                                                        //
    //                                                                                                                                                        //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * A function that will draw to the canvas to give imidiet user feedback whilst the user provides input to create a new element.
     *
     * @param {DrawData} input The current user input to potentially use to create element.
     * @param {CanvasRenderingContext2D} context The canvas context to be drawn to.
     */
    export const DrawHandle = (input: DrawData, context: CanvasRenderingContext2D) => {

        let palleteState = input.palleteState as PalleteViewState;
        let i = 0;

        context.beginPath();
        context.moveTo(input.pointList[i].x, input.pointList[i].y);
        context.arc(input.pointList[i].x, input.pointList[i].y, palleteState.size / 2, 0, 2 * Math.PI);
        context.fillStyle = palleteState.colour;
        context.fill();

        context.beginPath();
        context.strokeStyle = palleteState.colour;
        context.lineWidth = palleteState.size;
        context.moveTo(input.pointList[i].x, input.pointList[i].y);

        if(input.pointList.length > 2)
        {
            for(i = 1; i < input.pointList.length - 2; i++)
            {
                let xc = (input.pointList[i].x + input.pointList[i + 1].x) / 2;
                let yc = (input.pointList[i].y + input.pointList[i + 1].y) / 2;
                context.quadraticCurveTo(input.pointList[i].x, input.pointList[i].y, xc, yc);
            }
            // curve through the last two points
            context.quadraticCurveTo(input.pointList[i].x, input.pointList[i].y, input.pointList[i + 1].x,input.pointList[i + 1].y);
            context.stroke();

            context.beginPath();
            context.moveTo(input.pointList[i + 1].x, input.pointList[i + 1].y);
            context.arc(input.pointList[i + 1].x, input.pointList[i + 1].y, palleteState.size / 2, 0, 2 * Math.PI);
            context.fillStyle = palleteState.colour;
            context.fill();
        }
        else
        {
            context.lineTo(input.pointList[1].x, input.pointList[1].y);
            context.stroke();
        }
    };

    /** Free Curve Whiteboard Element View.
    *
    * This is the class that will be used to render the element. It must return an SVG tag (which may have embedded tags).
    */
    export class ElementView extends React.Component<any, {}>
    {
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
            let viewScale = this.props.viewScale;
            let eraseSize = this.props.eraseSize;

            let items = [];

            if(state.type == 'circle')
            {
                if(state.isSelected)
                {
                    items.push(React.createElement('circle',
                    {
                        key: 'display', cx: state.point.x, cy: state.point.y, r: state.size / 2, fill: state.colour, stroke: state.colour,
                        className: 'blinking'
                    }));
                }
                else
                {
                    items.push(React.createElement('circle',
                    {
                        key: 'display', cx: state.point.x, cy: state.point.y, r: state.size / 2, fill: state.colour, stroke: state.colour
                    }));
                }

                if(!state.isMoving)
                {
                    if(mode == BoardModes.SELECT)
                    {
                        items.push(React.createElement('circle',
                        {
                            key: 'interaction', cx: state.point.x, cy: state.point.y, r: state.size / 2 + (2.5 * viewScale), fill: state.colour, opacity: 0,
                            cursor: 'move',
                            onMouseOver: (e: React.MouseEvent) => { dispatcher.mouseOver(e, ViewComponents.Interaction, null); },
                            onMouseOut: (e: React.MouseEvent) => { dispatcher.mouseOut(e, ViewComponents.Interaction, null); },
                            onMouseDown: (e: React.MouseEvent) => { dispatcher.mouseDown(e, ViewComponents.Interaction, null); },
                            onMouseMove: (e: React.MouseEvent) => { dispatcher.mouseMove(e, ViewComponents.Interaction, null); },
                            onClick: (e: React.MouseEvent) =>
                            {
                                if(e.detail == 2)
                                {
                                    dispatcher.doubleClick(e, ViewComponents.Interaction, null);
                                }
                                else
                                {
                                    dispatcher.mouseClick(e, ViewComponents.Interaction, null);
                                }
                            }
                        }));
                    }
                    else if(mode == BoardModes.ERASE)
                    {
                        items.push(React.createElement('circle',
                        {
                            key: 'interaction', cx: state.point.x, cy: state.point.y, r: state.size / 2 + (eraseSize * viewScale), fill: state.colour, opacity: 0,
                            onMouseOver: (e: React.MouseEvent) => { dispatcher.mouseOver(e, ViewComponents.Interaction, null); },
                            onMouseOut: (e: React.MouseEvent) => { dispatcher.mouseOut(e, ViewComponents.Interaction, null); },
                            onMouseMove: (e: React.MouseEvent) => { dispatcher.mouseMove(e, ViewComponents.Interaction, null); },
                            onClick: (e: React.MouseEvent) =>
                            {
                                if(e.detail == 2)
                                {
                                    dispatcher.doubleClick(e, ViewComponents.Interaction, null);
                                }
                                else
                                {
                                    dispatcher.mouseClick(e, ViewComponents.Interaction, null);
                                }
                            }
                        }));
                    }
                }

                return React.createElement('g', { transform: 'translate(' + state.x + ',' + state.y + ')' }, items);
            }
            else if(state.type == 'path')
            {
                if(state.isSelected)
                {
                    items.push(React.createElement('path',
                    {
                        key: 'display', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size, strokeLinecap: 'round',
                        className: 'blinking'
                    }));
                }
                else
                {
                    items.push(React.createElement('path',
                    {
                        key: 'display', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size, strokeLinecap: 'round'
                    }));
                }

                if(!state.isMoving)
                {
                    if(mode == BoardModes.SELECT)
                    {
                        items.push(React.createElement('path',
                        {
                            key: 'interaction', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size + (5 * viewScale),
                            strokeLinecap: 'round', opacity: 0, cursor: 'move', pointerEvents: 'stroke',
                            onMouseOver: (e: React.MouseEvent) => { dispatcher.mouseOver(e, ViewComponents.Interaction, null); },
                            onMouseOut: (e: React.MouseEvent) => { dispatcher.mouseOut(e, ViewComponents.Interaction, null); },
                            onMouseDown: (e: React.MouseEvent) => { dispatcher.mouseDown(e, ViewComponents.Interaction, null); },
                            onMouseMove: (e: React.MouseEvent) => { dispatcher.mouseMove(e, ViewComponents.Interaction, null); },
                            onClick: (e: React.MouseEvent) =>
                            {
                                if(e.detail == 2)
                                {
                                    dispatcher.doubleClick(e, ViewComponents.Interaction, null);
                                }
                                else
                                {
                                    dispatcher.mouseClick(e, ViewComponents.Interaction, null);
                                }
                            }
                        }));
                    }
                    else if(mode == BoardModes.ERASE)
                    {
                        items.push(React.createElement('path',
                        {
                            key: 'interaction', d: state.param, fill: 'none', stroke: state.colour, strokeWidth: state.size + (eraseSize * viewScale),
                            strokeLinecap: 'round', opacity: 0, pointerEvents: 'stroke',
                            onMouseOver: (e: React.MouseEvent) => { dispatcher.mouseOver(e, ViewComponents.Interaction, null); },
                            onMouseOut: (e: React.MouseEvent) => { dispatcher.mouseOut(e, ViewComponents.Interaction, null); },
                            onMouseMove: (e: React.MouseEvent) => { dispatcher.mouseMove(e, ViewComponents.Interaction, null); },
                            onClick: (e: React.MouseEvent) =>
                            {
                                if(e.detail == 2)
                                {
                                    dispatcher.doubleClick(e, ViewComponents.Interaction, null);
                                }
                                else
                                {
                                    dispatcher.mouseClick(e, ViewComponents.Interaction, null);
                                }
                            }
                        }));
                    }
                }

                return React.createElement('g', { transform: 'translate(' + state.x + ',' + state.y + ')' }, items);
            }
            else if(state.type == 'empty')
            {
                return null;
            }
            else
            {
                console.error('ERROR: Unrecognized type for SVGBezier.');

                return null;
            }
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
                    className: 'button mode-button pressed-mode', id: 'draw-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'D');
            }
            else
            {
                return React.createElement('button',
                {
                    className: 'button mode-button', id: 'draw-button', onKeyUp: function(e) { e.preventDefault(); },
                    onClick: () => { this.props.dispatcher(MODENAME) }
                }, 'D');
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

            if(state.colour == PalleteColour.BLACK)
            {
                blackButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'black-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == PalleteColour.BLUE)
            {
                blueButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'blue-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == PalleteColour.RED)
            {
                redButt = React.createElement('button',
                {
                    className: 'button colour-button pressed-colour', id: 'red-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                });
            }
            else if(state.colour == PalleteColour.GREEN)
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

            return React.createElement('div', null, colourCont, sizeCont);
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
registerComponentView(FreeCurveView.MODENAME, FreeCurveView.ElementView, FreeCurveView.PalleteView, FreeCurveView.ModeView, FreeCurveView.DrawHandle);
