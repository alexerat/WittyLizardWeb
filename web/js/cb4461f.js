var TopBar = React.createClass({displayName: 'SiteBar',
render: function()
{
    var menuDrop =  React.createElement('ul', {className: 'dropdown menu'}, React.createElement('li', null, React.createElement('a', {href: '#'}, 'MenuA')));
    var menuSec = React.createElement('ul', {className: 'dropdown menu', id: 'menuArea', 'data-dropdown-menu': true}, React.createElement('li', null, React.createElement('a', {href: '#'}, 'Menu'), menuDrop), React.createElement('li', null, React.createElement('a', {href: '#'}, 'Menu2')));
    var titleArea = React.createElement('div', {className: 'top-bar-left', id: 'titleArea'}, menuSec);

    return React.createElement('nav', {className: 'top-bar', id: 'topbar', role: 'navigation', 'data-topbar': true },  React.createElement('div', {className: 'top-bar-left'}, titleArea));
}
});

 var SideBar = React.createClass({displayName: 'SideBar',
 render: function()
 {
     var closeButt = React.createElement('button', {className: 'close-button', ariaLabel: 'Close menu', type: 'button', 'data-close': true}, React.createElement('span', {ariaHidden: 'true'}, &times;));

     return React.createElement('div', null, closeButt);
 }
 });
