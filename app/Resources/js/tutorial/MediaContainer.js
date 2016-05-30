"use strict";

var UserMedia = React.createClass({displayName: 'UserMedia',
render: function()
{
    var vidElem = null;
    var audioElem = null;
    var mediaStream = new MediaStream();

    if(this.props.audio && !this.props.isSelf)
    {
        console.log('Added audio track to media stream.');
        console.log(this.props.audio);
        mediaStream.addTrack(this.props.audio);
    }

    if(this.props.video)
    {
        console.log('Added video track to media stream.');
        console.log(this.props.video);
        mediaStream.addTrack(this.props.video);
        console.log(mediaStream);
        console.log(mediaStream.getTracks().length);

        var streamUrl = window.URL.createObjectURL(mediaStream);
        vidElem = React.createElement('video', {className: "userVideo", src: streamUrl, autoPlay: true});

        if(!this.props.isSelf)
        {
            var usrName = React.createElement('p', {className: "userName"}, this.props.username);
            return  React.createElement("div", { className: "large-1 columns userContainer"}, vidElem, usrName);
        }
        else
        {
            console.log('Rendered local user media.');
            return  React.createElement("div", { className: "userContainer"}, vidElem);
        }
    }
    else
    {
        if(!this.props.isSelf)
        {
            var usrName = React.createElement('p', {className: "userName"}, this.props.username);
            var audioUrl = window.URL.createObjectURL(mediaStream);
            audioElem = React.createElement('audio', {className: "userAudio", src: audioUrl, autoPlay: true});
            // TODO: Get profile picture
            return  React.createElement("div", { className: "large-1 columns userContainer"}, audioElem, usrName);
        }
        else
        {
            // TODO: Get profile picture
            return React.createElement("div", { className: "userContainer"});
        }
    }


}
});

var MediaController = React.createClass({displayName: 'MediaController',
render: function()
{
    var localAudio = null;
    var localVideo = null;
    var vidElem = null;

    if(this.props.localStream)
    {
        if(this.props.localStream.getAudioTracks().length > 0)
        {
            localAudio = this.props.localStream.getAudioTracks()[0];
        }
        else
        {
            // TODO: This is an error
        }

        if(this.props.localStream.getVideoTracks().length > 0)
        {
            localVideo = this.props.localStream.getVideoTracks()[0];
        }
    }

    var userMedia =  React.createElement(UserMedia, { audio: localAudio, video: localVideo, isSelf: true });
    var startVid = React.createElement('button', {className: 'button', id: 'start-button', onClick: this.props.toggleVideo}, 'Video');
    var muteSelf = React.createElement('button', {className: 'button', id: 'mute-button'}, 'Mute');

    return React.createElement("div", { className: "large-1 columns" }, userMedia, startVid, muteSelf);
}
});

var MediaContainer = React.createClass({displayName: 'MediaContainer',
getInitialState: function()
{
    this.peerHandler = null;
    this.userId = null;
    this.hasVideo = false;
    this.videoTrack = null;
    this.vidId = null;
    this.audioTrack = null;
    this.tracks = [];
    return {data: [], localStream: null};
},
componentDidMount: function()
{

},
setStream: function(stream)
{
    this.setState({localStream: stream});
},
addTrack: function(track, stream)
{
    return this.peerHandler.addTrack(track, stream);
},
swapTrack: function(id, track)
{

},
removeTrack: function(id)
{

},
setHandler: function(peerHandler, userId)
{
    var self = this;

    this.userId = userId;
    this.peerHandler = peerHandler;
    this.addTrack(this.state.localStream.getAudioTracks()[0], this.state.localStream);

    this.peerHandler.on('error', function(err)
    {
        // TODO:
    });

    this.peerHandler.on('disconnected', function()
    {
        // TODO:
    });

    this.peerHandler.on('close', function()
    {
        // TODO:
    });

    this.peerHandler.on('join', function(userId, username)
    {
        console.log('MediaContainer: Received user join.');

        if(!self.userId)
        {
            // TODO: This is an error
            return;
        }

        if(self.userId < userId)
        {
            self.peerHandler.call(userId);
        }

        var dataNew = self.state.data.slice();

        dataNew.push({userId: userId, username: username, audio: null, video: null});

        self.setState({data: dataNew});
    });

    this.peerHandler.on('leave', function(userId)
    {
        // TODO:
    });

    this.peerHandler.on('call', function(userId)
    {
        self.peerHandler.answer(userId);
    });

    this.peerHandler.on('track', function(userId, remoteTrack)
    {
        var dataNew = self.state.data.slice();

        for(var i = 0; i < dataNew.length; i++)
        {
            if(dataNew[i].userId == userId)
            {
                if(remoteTrack.kind == 'video')
                {
                    dataNew[i].video = remoteTrack;

                    remoteTrack.onended = function()
                    {
                        console.log('Stream ended fired.')
                    };
                }
                else if(remoteTrack.kind == 'audio')
                {
                    dataNew[i].audio = remoteTrack;

                    remoteTrack.onended = function()
                    {
                        console.log('Stream ended fired.')
                    };
                }
                else
                {
                    console.error('MediaContainer: Unknown track received.');
                }
            }
        }

        self.setState({data: dataNew});
    });
},
toggleVideo: function()
{
    if(this.hasVideo)
    {
        this.hasVideo = false;
        var localMedia = this.state.localStream;
        this.peerHandler.removeTrack(this.vidId);
        localMedia.removeTrack(this.videoTrack);
        this.videoTrack.stop();

        this.setState({localStream: localMedia});
    }
    else
    {
        this.hasVideo = true;
        var p = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        var self = this;

        p.then(function(mediaStream)
        {
            self.videoTrack = mediaStream.getVideoTracks()[0];
            var localMedia = self.state.localStream;

            localMedia.addTrack(self.videoTrack, mediaStream);
            self.vidId = self.peerHandler.addTrack(self.videoTrack, mediaStream);

            self.setState({localStream: localMedia});
        });
        p.catch(function(err)
        {
            // TODO: Supply error to user
            console.log(err.name);
        });
    }
},
render: function render()
{
    var vidStreams = [];
    var audioOnly  = [];

    for(var i = 0; i < this.state.data.length; i++)
    {
        if(this.state.data[i].video)
        {
            var node = React.createElement(UserMedia,
            {
                username: this.state.data[i].username, video: this.state.data[i].video, audio: this.state.data[i].audio,
                isSelf: false, key: this.state.data[i].userId
            });
            vidStreams.push(node);
        }
        else
        {
            var node = React.createElement(UserMedia,
            {
                username: this.state.data[i].username, audio: this.state.data[i].audio, isSelf: false, key: this.state.data[i].userId
            });
            audioOnly.push(node);
        }
    }

    var mediaController = React.createElement(MediaController, {isHost: this.props.isHost, localStream: this.state.localStream, toggleVideo: this.toggleVideo});

    if(vidStreams.length == 0)
    {
        var audioNodes = React.createElement("div", { className: "columns large-11" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, audioNodes, mediaController);
    }
    else if(vidStreams.length == 1)
    {
        var audioNodes = React.createElement("div", { className: "columns large-10" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, vidStreams, audioNodes, mediaController);
    }
    else if(vidStreams.length == 2)
    {
        var audioNodes = React.createElement("div", { className: "columns large-9" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, vidStreams, audioNodes, mediaController);
    }
    else if(vidStreams.length == 3)
    {
        var audioNodes = React.createElement("div", { className: "columns large-8" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, vidStreams, audioNodes, mediaController);
    }
    else if(vidStreams.length == 4)
    {
        var audioNodes = React.createElement("div", { className: "columns large-7" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, vidStreams, audioNodes, mediaController);
    }
    else if(vidStreams.length == 5)
    {
        var audioNodes = React.createElement("div", { className: "columns large-6" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, vidStreams, audioNodes, mediaController);
    }
    else if(vidStreams.length >= 6)
    {
        var videoNodes = React.createElement("div", { className: "columns large-6" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, vidStreams));
        var audioNodes = React.createElement("div", { className: "columns large-5" }, React.createElement("div", { className: "row large-up-8 medium-up-6 small-up-4" }, audioOnly));
        return React.createElement("div", { className: "expanded row" }, videoNodes, audioNodes, mediaController);
    }
}
});
