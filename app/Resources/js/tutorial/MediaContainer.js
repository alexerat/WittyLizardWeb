"use strict";

var UserMedia = React.createClass({displayName: 'UserMedia',
    render: function()
    {
        var streamUrl = window.URL.createObjectURL(this.props.stream);
        var vidElem = React.createElement('video', {className: "userVideo", src: streamUrl, autoPlay: true});
        var usrName = React.createElement('p', {className: "userName"}, this.props.username);
        return  (React.createElement("li", { className: "userContainer"}, vidElem, usrName));
    }
});

var MediaContainer = React.createClass({displayName: 'MediaContainer',
updateList: function(userData)
{

    this.setState({data: userData});

},
getInitialState: function()
{
    return {data: []};
},
componentDidMount: function()
{

},
render: function render()
{
    var mediaNodes = this.state.data.map(function (user)
    {
        return React.createElement(UserMedia, { username: user.username, stream: user.stream, key: user.userId });
    });
    return React.createElement("ul", { className: "small-block-grid-3" }, mediaNodes);
}});
