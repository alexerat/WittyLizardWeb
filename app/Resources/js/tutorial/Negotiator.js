/**
 * Manages all negotiations between Peers.
 */
var Negotiator = {};

/** Returns a PeerConnection object set up correctly for media. */
Negotiator.startConnection = function(connection, options)
{
    var pc = Negotiator._getPeerConnection(connection, options);
    connection.pc = pc;

    if (options._stream)
    {
        // Add the stream.
        pc.addStream(options._stream);
    }

    // What do we need to do now?
    if (options.originator)
    {
        // TODO: Investigate this. Pretty sure it's a chrome interop.
        if (!util.supports.onnegotiationneeded)
        {
            Negotiator._makeOffer(connection);
        }
    }
    else
    {
        Negotiator.handleSDP('OFFER', connection, options.sdp);
    }

    return pc;
}

Negotiator._getPeerConnection = function(connection, options)
{
    var pc = connection.pc;

    if (!pc || pc.signalingState !== 'stable')
    {
        pc = Negotiator._startPeerConnection(connection);
    }

    return pc;
}

/** Start a PC. */
Negotiator._startPeerConnection = function(connection)
{
    util.log('Creating RTCPeerConnection.');

    var optional = {};

    // TODO: Investigate this.
    // Interop required for chrome.
    optional = {optional: [{DtlsSrtpKeyAgreement: true}]};

    var pc = new RTCPeerConnection(connection.provider.options.config, optional);
    Negotiator._setupListeners(connection, pc);

    return pc;
}

/** Set up various WebRTC listeners. This handles the p2p signalling through signalling server. */
Negotiator._setupListeners = function(connection, pc)
{
    // ICE CANDIDATES.
    util.log('Listening for ICE candidates.');

    pc.onicecandidate = function(evt)
    {
        if (evt.candidate && !connection.iceRecieved)
        {
            connection.iceRecieved = true;

            util.log('Received ICE candidates for: ', connection.peer);

            var msgPayload = {candidate: evt.candidate, userId: connection.id};
            var msg = {remoteId: connection.peer, type: 'CANDIDATE', payload: msgPayload};
            connection.provider.socket.emit('RTC-Message', msg);
        }
    };

    pc.oniceconnectionstatechange = function()
    {
        switch (pc.iceConnectionState)
        {
            case 'disconnected':
            case 'failed':
                util.log('iceConnectionState is disconnected, closing connections to ' + connection.peer);
                // TODO: This closes all connections, we shouldn't do that.
                connection.provider.close(connection.id);
                break;
            case 'completed':
                pc.onicecandidate = util.noop;
                break;
        }
    };

    // Fallback for older Chrome impls.
    pc.onicechange = pc.oniceconnectionstatechange;

    // ONNEGOTIATIONNEEDED (Chrome)
    /*
    util.log('Listening for `negotiationneeded`');
    pc.onnegotiationneeded = function()
    {
        util.log('`negotiationneeded` triggered');
        if (pc.signalingState == 'stable')
        {
            connection.pc = pc;
            Negotiator._makeOffer(connection);
        }
        else
        {
            util.log('onnegotiationneeded triggered when not stable. Is another connection being established?');
        }
    };
    */

    // MEDIACONNECTION.
    util.log('Listening for remote stream');
    pc.onaddstream = function(evt)
    {
        util.log('Received remote stream');
        var stream = evt.stream;

        connection.provider.addStream(connection.id, stream);
    };
}

Negotiator.cleanup = function(connection)
{
    util.log('Cleaning up PeerConnection to ' + connection.peer);

    var pc = connection.pc;

    if (!!pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed'))
    {
        pc.close();
        connection.pc = null;
    }
}

Negotiator._makeOffer = function(connection)
{
    var pc = connection.pc;

    pc.createOffer(function(offer)
    {
        util.log('Created offer.');

        pc.setLocalDescription(offer, function()
        {
            util.log('Set localDescription: offer', 'for:', connection.peer);

            var msgPayload = {sdp: offer, label: connection.label, userId: connection.id, browser: util.browser};
            var msg = {type: 'OFFER', remoteId: connection.peer, payload: msgPayload};
            connection.provider.socket.emit('RTC-Message', msg);

        }, function(err)
        {
            connection.provider.emitError('webrtc', err);
            util.log('Failed to setLocalDescription, ', err);
        });
    }, function(err)
    {
        connection.provider.emitError('webrtc', err);
        util.log('Failed to createOffer, ', err);
    }, connection.options.constraints);
}

Negotiator._makeAnswer = function(connection)
{
    var pc = connection.pc;

    pc.createAnswer(function(answer)
    {
        util.log('Created answer.');

        pc.setLocalDescription(answer, function()
        {
            util.log('Set localDescription: ANSWER', 'for:', connection.peer);

            var msgPayload = {sdp: answer, userId: connection.id, browser: util.browser};
            var msg = {type: 'ANSWER', remoteId: connection.peer, payload: msgPayload};
            connection.provider.socket.emit('RTC-Message', msg);

        }, function(err)
        {
            connection.provider.emitError('webrtc', err);
            util.log('Failed to setLocalDescription, ', err);
        });

    }, function(err)
    {
        connection.provider.emitError('webrtc', err);
        util.log('Failed to create answer, ', err);
    });
}

/** Handle an SDP. */
Negotiator.handleSDP = function(type, connection, sdp)
{
    sdp = new RTCSessionDescription(sdp);
    var pc = connection.pc;

    util.log('Setting remote description', sdp);
    pc.setRemoteDescription(sdp, function()
    {
        util.log('Set remoteDescription:', type, 'for:', connection.peer);

        if (type === 'OFFER')
        {
            Negotiator._makeAnswer(connection);
        }
    }, function(err)
    {
        connection.provider.emitError('webrtc', err);
        util.log('Failed to setRemoteDescription, ', err);
    });
}

/** Handle a candidate. */
Negotiator.handleCandidate = function(connection, ice)
{
    var candidate = ice.candidate;
    var sdpMLineIndex = ice.sdpMLineIndex;
    connection.pc.addIceCandidate(new RTCIceCandidate({sdpMLineIndex: sdpMLineIndex, candidate: candidate}));
    util.log('Added ICE candidate for:', connection.peer);
}
