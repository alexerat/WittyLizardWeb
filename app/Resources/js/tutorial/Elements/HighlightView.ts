/** Highlight Whiteboard Component.
*
* This allows the user to highlight areas for other users to see.
*
*/
namespace HighlightView
{
    /**
     * The name of the mode associated with this component.
     */
    export const MODENAME = 'HIGHLIGHT';

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        colour: number;
    }

    /**
     * A description of the view state for the pallete of this component.
     * This will be passed from the pallete controller to the view.
     */
    interface PalleteViewState extends BoardPalleteViewState {
    }

    const enum PalleteChangeType {
    }

    /**
     * A description of components within the view of an element.
     * This is used to identify the source of user input from the element view.
     */
    const enum ViewComponents {
        Highlight,
        Marker
    };

    let pad = function(s, size)
    {
        while (s.length < size) s = "0" + s;
        return s;
    }

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

        if(input.width > 0 && input.height > 0)
        {
            context.beginPath();
            context.globalAlpha = 0.4;
            context.fillStyle = 'yellow';
            context.fillRect(input.x, input.y, input.width, input.height);
            context.globalAlpha = 1.0;
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
            let viewX = this.props.viewX;
            let viewY = this.props.viewY;
            let viewWidth = this.props.viewWidth;
            let viewHeight = this.props.viewHeight;

            let item = null;

            if(state.x + state.width / 2 < viewX + viewWidth && state.x + state.width / 2 > viewX)
            {
                // Within x bounds.
                if(state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY)
                {
                    // Within view
                    item = React.createElement('rect',
                    {
                        key: 'highlight', x: state.x, y: state.y, width: state.width, height: state.height,
                        fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, opacity: 0.4, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Highlight); }
                    });
                }
                else if(state.y + state.height / 2 >= viewY + viewHeight)
                {
                    // Top Middle
                    let points = [
                        state.x + state.width / 2, viewY + viewHeight,
                        state.x + state.width / 2 + 20 * viewScale, viewY + viewHeight - 20 * viewScale,
                        state.x + state.width / 2 + 20 * viewScale, viewY + viewHeight - 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + viewHeight - 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + viewHeight - 20 * viewScale
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
                else
                {
                    // Bottom Middle
                    let points = [
                        state.x + state.width / 2, viewY,
                        state.x + state.width / 2 + 20 * viewScale, viewY + 20 * viewScale,
                        state.x + state.width / 2 + 20 * viewScale, viewY + 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + 70 * viewScale,
                        state.x + state.width / 2 - 20 * viewScale, viewY + 20 * viewScale
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
            }
            else if(state.x + state.width / 2 >= viewX + viewWidth)
            {
                // To the right of view
                if(state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY)
                {
                    // Right Middle
                    let points = [
                        viewX + viewWidth, state.y + state.height / 2,
                        viewX + viewWidth - 20 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + viewWidth - 70 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + viewWidth - 70 * viewScale, state.y + state.height / 2 + 20 * viewScale,
                        viewX + viewWidth - 20 * viewScale, state.y + state.height / 2 + 20 * viewScale
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
                else if(state.y + state.height / 2 >= viewY + viewHeight)
                {
                    // Right Top
                    let points = [
                        viewX + viewWidth, viewY + viewHeight,
                        viewX + viewWidth,  viewY + viewHeight - 14 * viewScale,
                        viewX + viewWidth - 35 * viewScale, viewY + viewHeight - 49 * viewScale,
                        viewX + viewWidth - 49 * viewScale, viewY + viewHeight - 35 * viewScale,
                        viewX + viewWidth - 14 * viewScale, viewY + viewHeight
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
                else
                {
                    // Right Bottom
                    let points = [
                        viewX + viewWidth, viewY,
                        viewX + viewWidth,  viewY + 14 * viewScale,
                        viewX + viewWidth - 35 * viewScale, viewY + 49 * viewScale,
                        viewX + viewWidth - 49 * viewScale, viewY + 35 * viewScale,
                        viewX + viewWidth - 14 * viewScale, viewY
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
            }
            else
            {
                // To the left of view
                if(state.y + state.height / 2 < viewY + viewHeight && state.y + state.height / 2 > viewY)
                {
                    // Left Middle
                    let points = [
                        viewX, state.y + state.height / 2,
                        viewX + 20 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + 70 * viewScale, state.y + state.height / 2 - 20 * viewScale,
                        viewX + 70 * viewScale, state.y + state.height / 2 + 20 * viewScale,
                        viewX + 20 * viewScale, state.y + state.height / 2 + 20 * viewScale
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
                else if(state.y + state.height / 2 >= viewY + viewHeight)
                {
                    // Left Top
                    let points = [
                        viewX, viewY + viewHeight,
                        viewX, viewY + viewHeight - 14 * viewScale,
                        viewX + 35 * viewScale, viewY + viewHeight - 49 * viewScale,
                        viewX + 49 * viewScale, viewY + viewHeight - 35 * viewScale,
                        viewX + 14 * viewScale, viewY + viewHeight
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
                else
                {
                    // Left Bottom
                    let points = [
                        viewX, viewY,
                        viewX, viewY + 14 * viewScale,
                        viewX + 35 * viewScale, viewY + 49 * viewScale,
                        viewX + 49 * viewScale, viewY + 35 * viewScale,
                        viewX + 14 * viewScale, viewY
                    ];

                    item = React.createElement('polygon',
                    {
                        key: 'marker', points: points, fill: '#' + pad(state.colour.toString(16), 6), strokeWidth: 0, pointerEvents: 'fill',
                        onMouseClick: (e) => { dispatcher.mouseClick(e, ViewComponents.Marker); }
                    });
                }
            }

            return item;
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
                    className: 'button mode-button pressed-mode', id: 'highlight-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'H');
            }
            else
            {
                return React.createElement('button',
                {
                    className: 'button mode-button', id: 'highlight-button', onKeyUp: function(e) { e.preventDefault(); },
                    onClick: () => { this.props.dispatcher(MODENAME) }
                }, 'H');
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

            return React.createElement('div', null);
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
registerComponentView(HighlightView.MODENAME, HighlightView.ElementView, HighlightView.PalleteView, HighlightView.ModeView, HighlightView.DrawHandle);
