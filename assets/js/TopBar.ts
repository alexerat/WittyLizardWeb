

export class TopBar extends React.Component<any, {}>
{
    /** React render function
     *
     * @return React.DOMElement
     */
    render()
    {
        let menuSec = React.createElement('button', {className: 'menu-icon', type: 'button', 'data-open': 'offCanvasLeft'}, 'Menu');
        let leftArea = React.createElement('div', {className: 'top-bar-left'}, menuSec, React.createElement('span', {className: 'title-bar-title'}, 'Wittylizard'));

        let searchSec = React.createElement('ul', {className: 'menu'}, React.createElement('li', null, React.createElement('input', {type: 'search'})), React.createElement('li', null, React.createElement('button', {className: 'button', type: 'button'}, 'Search')));
        let rightArea = React.createElement('div', {className: 'top-bar-right'}, searchSec);

        return React.createElement('div', {id: 'topbar-content'}, leftArea, rightArea);
    }
}