 var SideBar = React.createClass({displayName: 'SideBar',
 render: function()
 {
     var closeButt = React.createElement('button', {className: 'close-button', 'aria-label': 'Close menu', type: 'button', 'data-close': true}, React.createElement('span', {'aria-hidden': 'true'}));
     var menuEl = React.createElement('ul', {className: 'vertical menu'}, React.createElement('li', null, React.createElement('a', {href: '#'}, 'Foundation')));

     return React.createElement('div', null, closeButt, menuEl);
 }
 });
