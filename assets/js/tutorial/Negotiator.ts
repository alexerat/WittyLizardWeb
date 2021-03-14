import { util } from "./util";

let sdp: RTCSessionDescription;

/**
 * Manages all negotiations between Peers.
 */
export class Negotiator
{
    /** Returns a PeerConnection object set up correctly for media. */
    static startConnection(connection)
    {
        console.log('Negotiator starting connection.....');
        var pc = this._getPeerConnection(connection);
        connection.pc = pc;
    }

    static addTrack(connection, track, stream)
    {
        if(connection.pc)
        {
            var sender = connection.pc.addTrack(track, stream);
            console.log(sender);

            if(connection.open)
            {
                this.makeOffer(connection);
            }

            return sender;
        }
        else
        {
            // TODO: Error
        }
    }

    static removeTrack(connection, sender)
    {
        if(connection.pc)
        {
            console.log(sender);
            connection.pc.removeTrack(sender);

            if(connection.open)
            {
                this.makeOffer(connection);
            }
        }
        else
        {
            // TODO: Error
        }
    }

    static _getPeerConnection(connection)
    {
        var pc = connection.pc;

        if (!pc || pc.signalingState !== 'stable')
        {
            pc = this._startPeerConnection(connection);
        }

        return pc;
    }

    /** Start a PC. */
    static _startPeerConnection(connection)
    {
        util.log('Creating RTCPeerConnection. With config: ' + JSON.stringify(connection.provider.options.config));

        var optional = {};

        // TODO: Investigate this.
        // Interop required for chrome.
        var pc = new RTCPeerConnection(connection.provider.options.config);
        connection.pc = pc;
        this._setupListeners(connection);

        return pc;
    }

    // Return false if the candidate should be dropped, true if not.
    static _filterIceCandidate(candidateObj)
    {
        var candidateStr = candidateObj.candidate;

        // Always eat TCP candidates. Not needed in this context.
        if (candidateStr.indexOf('tcp') !== -1)
        {
            return false;
        }

        // TODO: optionally filter relay candidates

        return true;
    }

    /** Set up various WebRTC listeners. This handles the p2p signalling through signalling server. */
    static _setupListeners(connection)
    {
        // ICE CANDIDATES.
        util.log('Listening for ICE candidates.');

        connection.pc.onicecandidate = function(evt)
        {
            if (evt.candidate && this._filterIceCandidate(evt.candidate))
            {
                util.log('Sent our ICE candidates to: ', connection.peer);

                var msgPayload = {candidate: evt.candidate, userId: connection.provider.id};
                var msg = {remoteId: connection.peer, type: 'CANDIDATE', payload: msgPayload};
                connection.provider.socket.emit('RTC-Message', msg);
            }
        };

        connection.pc.oniceconnectionstatechange = function(evt)
        {
            switch (connection.pc.iceConnectionState)
            {
                case 'checking':
                    util.log('iceConnectionState is checking');
                    break;
                case 'completed':
                    util.log('iceConnectionState is completed');
                    break;
                case 'disconnected':
                    util.log('iceConnectionState is disconnected, closing connections to ' + connection.peer);
                    // TODO: This closes all connections, we shouldn't do that.
                    break;
                case 'failed':
                    util.log('iceConnectionState is failed, closing connections to ' + connection.peer);
                    // TODO: This closes all connections, we shouldn't do that.
                    connection.provider.close(connection.id);
                    break;
                case 'completed':
                    connection.pc.onicecandidate = util.noop;
                    break;
            }
        };

        // Fallback for older Chrome versions.
        connection.pc.onicechange = connection.pc.oniceconnectionstatechange;

        // MEDIACONNECTION.
        util.log('Listening for remote tracks.');
        connection.pc.ontrack = function(evt)
        {
            // TODO: Handle this better.
            util.log('Received a new remote track.');
            console.log('Track Object: ' + evt.track);

            connection.provider.remoteTrack(connection.id, evt.track);
        };
    }

    static cleanup(connection)
    {
        util.log('Cleaning up PeerConnection to ' + connection.peer);

        if (!!connection.pc && (connection.pc.readyState !== 'closed' || connection.pc.signalingState !== 'closed'))
        {
            connection.pc.close();
            connection.pc = null;
        }
    }

    static makeOffer(connection)
    {
        var p = connection.pc.createOffer(connection.options.constraints);

        connection._originator = true;

        p.then(function(offer)
        {
            util.log('Created offer.');

            connection._hasRemoteSdp = false;

            var p2 = connection.pc.setLocalDescription(offer);
            p2.then(function()
            {
                util.log('Set localDescription: offer', 'for:', connection.peer);

                // TODO: Remove label.
                var msgPayload = {sdp: offer, label: connection.label, userId: connection.provider.id, browser: util.browser};
                var msg = {type: 'OFFER', remoteId: connection.peer, payload: msgPayload};
                connection.provider.socket.emit('RTC-Message', msg);

            });
            p2.catch(function(err)
            {
                connection.provider.emitError('webrtc', err);
                util.log('Failed to setLocalDescription, ', err);
            });
        });
        p.catch(function(err)
        {
            connection.provider.emitError('webrtc', err);
            util.log('Failed to createOffer, ', err);
        });
    }

    static _makeAnswer(connection)
    {
        var p = connection.pc.createAnswer();

        p.then(function(answer)
        {
            util.log('Created answer.');

            var p2 = connection.pc.setLocalDescription(answer);

            p2.then(function()
            {
                util.log('Set localDescription: ANSWER', 'for:', connection.peer);

                var msgPayload = {sdp: answer, userId: connection.provider.id, browser: util.browser};
                var msg = {type: 'ANSWER', remoteId: connection.peer, payload: msgPayload};
                connection.provider.socket.emit('RTC-Message', msg);

            });
            p2.catch(function(err)
            {
                connection.provider.emitError('webrtc', err);
                util.log('Failed to setLocalDescription, ', err);
            });

        });
        p.catch(function(err)
        {
            connection.provider.emitError('webrtc', err);
            util.log('Failed to create answer, ', err);
        });
    }

    /** Handle an SDP. */
    static handleSDP(type, connection)
    {
        sdp = new RTCSessionDescription(connection.sdp);

        util.log('Setting remote description', connection.sdp);
        var p = connection.pc.setRemoteDescription(sdp);

        p.then(function()
        {
            util.log('Set remoteDescription:', type, 'for:', connection.peer);

            if (type === 'OFFER')
            {
                this._makeAnswer(connection);
            }
        });
        p.catch(function(err)
        {
            connection.provider.emitError('webrtc', err);
            util.log('Failed to setRemoteDescription, ', err);
        });
    }

    /** Handle a candidate. */
    static handleCandidate(connection, ice)
    {
        var candidateStr = ice.candidate;
        var sdpMLineIndex = ice.sdpMLineIndex;
        var candidate = new RTCIceCandidate({sdpMLineIndex: sdpMLineIndex, candidate: candidateStr});

        var p = connection.pc.addIceCandidate(candidate);
        p.then(function()
        {
            util.log('Received ICE candidates from: ', connection.peer);
        });
        p.catch(function()
        {
            util.log('Failed to add ICE candidate for: ', connection.peer);
        });
    }
}
