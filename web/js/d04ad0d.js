var TopBar = React.createClass({displayName: 'SiteBar',
render: function()
{
    var menuDrop =  React.createElement('ul', {className: 'dropdown menu'}, React.createElement('li', null, React.createElement('a', {href: '#'}, 'MenuA')));
    var menuSec = React.createElement('ul', {className: 'dropdown menu', id: 'menuArea', 'data-dropdown-menu': true}, React.createElement('li', null, React.createElement('a', {href: '#'}, 'Menu'), menuDrop), React.createElement('li', null, React.createElement('a', {href: '#'}, 'Menu2')));
    var titleArea = React.createElement('div', {className: 'top-bar-left', id: 'titleArea'}, menuSec);

    return React.createElement('nav', {className: 'top-bar', id: 'topbar', role: 'navigation', 'data-topbar': true },  React.createElement('div', {className: 'top-bar-left'}, titleArea));
}
});
