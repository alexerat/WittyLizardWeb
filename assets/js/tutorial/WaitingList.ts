"use strict";

var WaitingUser = React.createClass({displayName: 'WaitingUser',
    render: function()
    {
        return (React.createElement('p', {className: "waitingUser"}, this.props.username));
    }
});

var WaitingList = React.createClass({displayName: 'WaitingList',
loadUserListFromServer: function()
{
    var roomToken = window.location.href.split("/").pop();
    var xhttp;
    if (window.XMLHttpRequest)
    {
        xhttp = new XMLHttpRequest();
    }
    else
    {
        // code for IE6, IE5
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange = function()
    {
        if (xhttp.readyState == 4 && xhttp.status == 200)
        {
            this.setState({data: JSON.parse(xhttp.responseText)});
        }
    }.bind(this);

    xhttp.open("POST", roomToken + "/getwaitlist", true);
    xhttp.send();
},
getInitialState: function()
{
    return {data: []};
},
componentDidMount: function()
{
    this.loadUserListFromServer();
    setInterval(this.loadUserListFromServer, 5000);
},
render: function render()
{
    var waitingNodes = this.state.data.map(function (user)
    {
        return React.createElement(WaitingUser, { username: user.username, key: user.id });
    });
    return React.createElement("div", { className: "waitingList" }, waitingNodes);
}});

ReactDOM.render(React.createElement(WaitingList, null), document.getElementById('react-app'));
