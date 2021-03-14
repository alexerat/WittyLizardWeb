import { BoardModes } from "../WhiteBoardCrossTypes";
import {SVGSpinner, SVGProgress } from "../WhiteBoardView";

declare function registerComponentView(componentName: string, ElementView, PalleteView, ModeView, DrawHandle);

/** Upload Whiteboard Component.
*
* This allows the user to place images, videos and files in the whiteboard space.
*
*/
namespace UploadView
{
    /**
     * The name of the mode associated with this component.
     */
    export const MODENAME = 'UPLOAD';

    const ViewTypes = {
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        AUDIO: 'AUDIO',
        FILE: 'FILE',
        IFRAME: 'IFRAME',
        LINK: 'LINK'
    };

    const BUCKETURL = 'https://wittylizard-168912.appspot.com/UserUploads';

    /**
     * A description of the view state for elements in this component.
     * This will be passed from the element controller to the view.
     */
    interface ViewState extends ComponentViewState {
        rotation: number;
        extension: string;
        URL: string;
        isLoading: boolean;
        isUploader: boolean;
        percentUp: number;
        viewType: string;
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
        View,
        Resize,
        Interaction,
        Rotate
     }

     const enum ResizeComponents {
        Corner,
        Right,
        Bottom
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

    /** Upload Whiteboard Element View.
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

            let loadBar = null;
            let waitSpin = null;
            let borderBoxes = [];
            let displayElement;

            let actWidth = state.rotation == 90 || state.rotation == 270 ? state.height : state.width;
            let actHeight = state.rotation == 90 || state.rotation == 270 ? state.width : state.height;

            let self = this;

            if(state.isSelected)
            {
                borderBoxes.push(React.createElement('rect',
                {
                    key: 'selected', x: state.x, y: state.y, width: state.width, height: state.height,
                    fill: 'none', stroke: 'black', strokeWidth: 2, strokeDasharray: '5,5', className: 'blinking'
                }));
            }

            if(state.mode == BoardModes.SELECT && !state.isMoving && !state.isResizing)
            {
                if(state.isLoading)
                {
                    waitSpin = React.createElement(SVGSpinner,
                    {
                        x: state.x, y: state.y, size: state.width / 2
                    });

                    if(state.isUploader || state.percentUp != 0)
                    {
                        loadBar = React.createElement(SVGProgress,
                        {
                            x: state.x, y: state.y, max: 100, value: state.percentUp, size: state.width / 2.0
                        });
                    }
                }
                else
                {
                    if(state.viewType == ViewTypes.IMAGE)
                    {
                        displayElement = React.createElement('image',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, xlinkHref: state.URL,
                            pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        });
                    }
                    else if(state.viewType == ViewTypes.VIDEO)
                    {
                        let video = React.createElement('video', { src: state.URL });
                        displayElement = React.createElement('foreignObject',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        }, video);
                    }
                    else if(state.viewType == ViewTypes.AUDIO)
                    {
                        let audio = React.createElement('audio', { src: state.URL });
                        displayElement = React.createElement('foreignObject',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        }, audio);
                    }
                    else if(state.viewType == ViewTypes.IFRAME)
                    {
                        let iFrame = React.createElement('iframe', { src: state.URL, frameborder: 0 });
                        displayElement = React.createElement('foreignObject',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')'
                        }, iFrame);
                    }
                    else if(state.viewType == ViewTypes.FILE)
                    {
                        displayElement = React.createElement('image',
                        {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/file_image.svg',
                            pointerEvents: 'none', cursor: 'move', className: 'noselect', preserveAspectRatio: 'none'
                        });
                    }
                    else if(state.viewType == ViewTypes.LINK)
                    {
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('rect',
                        {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/link_image.svg',
                            cursor: 'pointer', pointerEvents: 'fill',
                            onClick: (e: React.MouseEvent<SVGElement>) => { window.open(state.URL); }
                        });
                    }
                }

                borderBoxes.push(React.createElement('rect',
                {
                    key: 'moveFull', x: state.x, y: state.y,
                    width: state.width, height: state.height, opacity: 0, cursor: 'move', pointerEvents: 'all',
                    onMouseDown: (e: React.MouseEvent<SVGElement>) => { dispatcher.mouseDown(e, ViewComponents.Interaction); }
                }));

                borderBoxes.push(React.createElement('line',
                {
                    key: 'resizeBottom', x1: state.x, y1: state.y + state.height, x2: state.x + state.width - 1, y2: state.y + state.height,
                    fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ns-resize', pointerEvents: 'stroke',
                    onMouseDown: (e: React.MouseEvent<SVGElement>) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Bottom); }
                }));

                borderBoxes.push(React.createElement('line',
                {
                    key: 'resizeRight', x1: state.x + state.width, y1: state.y, x2: state.x + state.width, y2: state.y + state.height - 1,
                    fill: 'none', strokeWidth: 2, opacity: 0, cursor: 'ew-resize', pointerEvents: 'stroke',
                    onMouseDown: (e: React.MouseEvent<SVGElement>) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Right); }
                }));

                borderBoxes.push(React.createElement('rect',
                {
                    key: 'resizeCorner', x: state.x + state.width - 1, y: state.y + state.height - 1,
                    width: 2, height: 2, opacity: 0, cursor: 'nwse-resize', pointerEvents: 'fill',
                    onMouseDown: (e: React.MouseEvent<SVGElement>) => { dispatcher.mouseDown(e, ViewComponents.Resize, ResizeComponents.Corner); }
                }));

                borderBoxes.push(React.createElement('rect',
                {
                    key: 'rotateCorner', x: state.x - 1, y: state.y - 1, width: 2, height: 2, opacity: 0, cursor: 'grab', pointerEvents: 'fill',
                    onClick: function(e: React.MouseEvent<SVGElement>) { dispatcher.mouseClick(e, ViewComponents.Rotate); }
                }));
            }
            else if(state.mode == BoardModes.ERASE)
            {
                if(state.isLoading)
                {
                    waitSpin = React.createElement(SVGSpinner,
                    {
                        x: state.x, y: state.y, size: state.width / 2
                    });

                    if(state.isUploader)
                    {
                        loadBar = React.createElement(SVGProgress,
                        {
                            x: state.x, y: state.y, max: 100, value: state.percentUp, size: state.width / 2
                        });
                    }
                }
                else
                {
                    if(state.viewType == ViewTypes.IMAGE)
                    {
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('image',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, xlinkHref: state.URL, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onClick: dispatcher.mouseClick, onMouseMove: dispatcher.mouseMove, onMouseDown: function(e) { e.preventDefault() }
                        });
                    }
                    else if(state.viewType == ViewTypes.VIDEO)
                    {

                    }
                    else if(state.viewType == ViewTypes.AUDIO)
                    {

                    }
                    else if(state.viewType == ViewTypes.IFRAME)
                    {
                        let iFrame = React.createElement('iframe', { src: state.URL, frameborder: 0 });
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('foreignObject',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onClick: dispatcher.mouseClick, onMouseMove: dispatcher.mouseMove, onMouseDown: function(e) { e.preventDefault() }
                        }, iFrame);
                    }
                    else if(state.viewType == ViewTypes.FILE)
                    {
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('image',
                        {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/file_image.svg', preserveAspectRatio: 'none',
                            onClick: dispatcher.mouseClick, onMouseMove: dispatcher.mouseMove, onMouseDown: function(e) { e.preventDefault() }
                        });
                    }
                    else if(state.viewType == ViewTypes.LINK)
                    {
                    }
                }
            }
            else
            {
                if(state.isLoading)
                {
                    waitSpin = React.createElement(SVGSpinner,
                    {
                        x: state.x, y: state.y, size: state.width / 2
                    });

                    if(state.isUploader)
                    {
                        loadBar = React.createElement(SVGProgress,
                        {
                            x: state.x, y: state.y, max: 100, value: state.percentUp, size: state.width / 2
                        });
                    }
                }
                else
                {
                    if(state.viewType == ViewTypes.IMAGE)
                    {
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('image',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, xlinkHref: state.URL, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onMouseDown: function(e) { e.preventDefault() }
                        });
                    }
                    else if(state.viewType == ViewTypes.VIDEO)
                    {

                    }
                    else if(state.viewType == ViewTypes.AUDIO)
                    {

                    }
                    else if(state.viewType == ViewTypes.IFRAME)
                    {
                        let iFrame = React.createElement('iframe', { src: state.URL, frameborder: 0 });
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('foreignObject',
                        {
                            x: state.x, y: state.y, width: actWidth, height: actHeight, preserveAspectRatio: 'none',
                            transform: 'rotate(' + state.rotation + ' ' + (state.x + actWidth / 2.0) + ' ' + (state.y + actHeight / 2.0) + ')',
                            onMouseDown: function(e) { e.preventDefault() }
                        }, iFrame);
                    }
                    else if(state.viewType == ViewTypes.FILE)
                    {
                        displayElement = React.createElement<React.SVGAttributes<SVGElement>, SVGElement>('image',
                        {
                            x: state.x, y: state.y, width: state.width, height: state.height,
                            xlinkHref: BUCKETURL + '/file_image.svg', preserveAspectRatio: 'none',
                            onMouseDown: function(e) { e.preventDefault() }
                        });
                    }
                    else if(state.viewType == ViewTypes.LINK)
                    {
                    }
                }
            }

            let text = null;

            if(state.viewType == ViewTypes.FILE)
            {
                text = React.createElement('text',
                {
                    key: 'text', className: 'noselect', x: state.x, y: state.y + state.height * 0.6, fontSize: state.width * 0.4,
                    fill: '#000000'
                }, '.' + state.extension);
            }

            return React.createElement('g', { }, displayElement, borderBoxes, waitSpin, loadBar, text);
        }
    }

    /** Upload Whiteboard Mode View.
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
                return React.createElement<React.HTMLAttributes<HTMLElement>, HTMLElement>('button',
                {
                    className: 'button mode-button pressed-mode', id: 'file-button', onKeyUp: function(e) { e.preventDefault(); }, onClick: () => {}
                }, 'F');
            }
            else
            {
                return React.createElement<React.HTMLAttributes<HTMLElement>, HTMLElement>('button',
                {
                    className: 'button mode-button', id: 'file-button', onKeyUp: function(e) { e.preventDefault(); },
                    onClick: () => this.props.dispatcher(MODENAME)
                }, 'F');
            }
        }
    }

    /** Upload Whiteboard Pallete View.
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
            return null;
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
registerComponentView(UploadView.MODENAME, UploadView.ElementView, UploadView.PalleteView, UploadView.ModeView, UploadView.DrawHandle);
