 var SideBar = React.createClass({displayName: 'SideBar',
 render: function()
 {
     var closeButt = React.createElement('button', {className: 'close-button', ariaLabel: 'Close menu', type: 'button', 'data-close': true}, React.createElement('span', {ariaHidden: 'true'}, &times;));

     return React.createElement('div', null, closeButt);
 }
 });
