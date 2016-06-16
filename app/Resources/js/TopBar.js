var TopBar = React.createClass({displayName: 'TopBar',
render: function()
{
    var menuSec = React.createElement('button', {className: 'menu-icon', type: 'button', 'data-open': 'offCanvasLeft'}, 'Menu');
    var leftArea = React.createElement('div', {className: 'top-bar-left'}, menuSec, React.createElement('span', {className: 'title-bar-title'}, 'KnowledgeXchange'));

    var searchSec = React.createElement('ul', {className: 'menu'}, React.createElement('li', null, React.createElement('input', {type: 'search'})), React.createElement('li', null, React.createElement('button', {className: 'button', type: 'button'}, 'Search')));
    var rightArea = React.createElement('div', {className: 'top-bar-right'}, searchSec);

    return React.createElement('div', {id: 'topbar-content'}, leftArea, rightArea);
}
});
