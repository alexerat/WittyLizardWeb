/// <reference path="../typings/whiteboard.d.ts"/>
import { EventEmitter } from "./EventEmitter";
import { Negotiator } from "./Negotiator";
import { util } from "./util";

/**
 * A peer who can initiate connections with other peers.
 * Take the roomToken and the socket connection.
 */
export class PeerHandler extends EventEmitter
{
    id: number;
    options: any;
    socket: Socket;
    roomToken: string;
    connections: Array<any>;
    users: Array<any>;
    tracks:Array<any>;
    destroyed: boolean;
    disconnected: boolean;
    open: boolean;

    constructor(roomToken: string, options: any, socket: Socket)
    {
        super();
        // Configurize options. Debug options: 1 Errors, 2 Warnings, 3 log All
        options = util.extend({debug: 3, config: util.defaultConfig}, options);

        this.options = options;
        this.socket = socket;
        this.roomToken = roomToken;

        EventEmitter.call(this);

        // TODO: Always use SSL
        // Set whether we use SSL to same as current host
        if (options.secure === undefined)
        {
            options.secure = util.isSecure();
        }

        util.setLogLevel(options.debug);

        // Sanity checks
        // Ensure WebRTC supported
        // TODO: Add plugin support as per MultiRTC
        if (!util.supports.audioVideo)
        {
            this._delayedAbort('browser-incompatible', 'The current browser does not support WebRTC');
            return;
        }

        // States.
        this.destroyed = false; // Connections have been killed
        this.disconnected = false; // Connection to PeerServer killed but P2P connections still active
        this.open = false; // Sockets and such are not yet open.

        // Connections for this peer.
        this.connections = [];
        this.users = [];
        this.tracks = [];

        // Start the server connection
        this._initializeServerConnection();

        if (this.socket.connected)
        {
            this._initialize();
        }
        else
        {
            // TODO: Connection not open error.
        }
    }

    // Initialize the socket event listeners
    _initializeServerConnection()
    {
        let self = this;

        this.socket.on('USERID', function(userId)
        {
            self.id = userId;
            self.open = true;

            // TODO: Have a timeout error in case of a no-response
            self.socket.emit('JOIN-ROOM', self.roomToken);
        });

        // Called when a user joins the room, Passes out an event to notify listeners.
        this.socket.on('JOIN', function(userId, username, remoteId)
        {
            // Create a new connection.
            // TODO: Check if this is already a connection
            if(!self.connections[userId])
            {
                self.connections[userId] = {open: false, peer: remoteId, provider: self, id: userId, options: {}, _originator: false, _messageQueue: [], _hasRemoteSdp: false, _started: true, remoteTracks: []};
                self.users.push(userId);
            }
            else
            {
                self.connections[userId]._started = true;
            }

            Negotiator.startConnection(self.connections[userId]);

            for(let i = 0; i < self.tracks.length; i++)
            {
                if(self.tracks[i].active)
                {
                    let sender = Negotiator.addTrack(self.connections[userId], self.tracks[i].track, self.tracks[i].stream);
                    self.tracks[i].senders.push({sender: sender, user: userId});
                }
            }

            if (self.connections[userId]._messageQueue.length > 0)
            {
                self._drainMessageQueue(self.connections[userId]);
            }

            self.emit('join', userId, username);
        });

        this.socket.on('LEAVE', function(userID)
        {
            util.log('Received leave message from', userID);
            self.emit('leave', userID);
            self._cleanupPeer(userID);
        });

        this.socket.on('EXPIRE', function(peer)
        {
            self.emitError('peer-unavailable', 'Could not connect to peer ' + peer);
        });

        this.socket.on('OFFER', function(payload)
        {
            if(!self.connections[payload.userId])
            {
                self.connections[payload.userId] = {open: false, peer: null, provider: self, id: payload.userId, options: {}, _originator: false, _messageQueue: [], _hasRemoteSdp: true, _started: false, remoteTracks: []};
            }
            else
            {
                self.connections[payload.userId]._hasRemoteSdp = true;
            }

            console.log('MediaConnection:  Received OFFER from: ' + self.connections[payload.userId].peer)

            // Always process offer before candidates.
            self.connections[payload.userId]._messageQueue.unshift({type: 'OFFER', payload: payload});

            // Inform callback listeners about the call.
            self.emit('call', payload.userId);
        });

        this.socket.on('ANSWER', function(payload)
        {
            if(!self.connections[payload.userId])
            {
                util.log('Received an answer from a peer we did not call.');
            }
            else
            {
                self.connections[payload.userId]._hasRemoteSdp = true;
                // Always process offer before candidates.
                self.connections[payload.userId]._messageQueue.unshift({type: 'ANSWER', payload: payload});
                self._drainMessageQueue(self.connections[payload.userId]);
            }
        });

        this.socket.on('CANDIDATE', function(payload)
        {
            self.connections[payload.userId]._messageQueue.push({type: 'CANDIDATE', payload: payload});
            self._drainMessageQueue(self.connections[payload.userId]);
        });

        this.socket.on('disconnected', function()
        {
            // If we haven't explicitly disconnected, emit error and disconnect.
            if (!self.disconnected)
            {
                self.emitError('network', 'Lost connection to server.');
                self.disconnected = true;
                self.open = false;

                self._cleanup();
                // TODO: Look at how this reconnect is executed, wait, and have a limit.
                self.reconnect();
            }
        });

        this.socket.on('close', function()
        {
            // If we haven't explicitly disconnected, emit error.
            if (!self.disconnected)
            {
                self._abort('socket-closed', 'Underlying socket is already closed.');
            }
        });
    }

    /** Initialize a connection with the server. */
    _initialize()
    {
        // TODO: Have a timeout error in case of a no-response
        this.socket.emit('GETID');
    }

    _processSignalingMessage(message)
    {
        let userId = message.payload.userId;

        if(!this.connections[userId])
        {
            util.error('Attempting to process message for an unknown peer.');
            return;
        }

        if (message.type === 'OFFER')
        {
            if (this.connections[userId].pc.signalingState !== 'stable')
            {
                util.error('remote offer received in unexpected state: ' + this.connections[userId].pc.signalingState);
                return;
            }

            util.log('Processing OFFER.');

            this.connections[userId].sdp = message.payload.sdp;
            Negotiator.handleSDP('OFFER', this.connections[userId]);
            this.connections[userId].open = true;
        }
        else if (message.type === 'ANSWER')
        {
            if(this.connections[userId]._originator)
            {
                if (this.connections[userId].pc.signalingState !== 'have-local-offer')
                {
                    util.error('remote answer received in unexpected state: ' + this.connections[userId].pc.signalingState);
                    return;
                }

                util.log('Processing ANSWER.');

                this.connections[userId].sdp = message.payload.sdp;
                Negotiator.handleSDP('ANSWER', this.connections[message.payload.userId]);
                this.connections[userId].open = true;
            }
            else
            {
                // TODO: ERROR
                util.error('Answer received for a call we did not start.');
            }
        }
        else if (message.type === 'CANDIDATE')
        {
            Negotiator.handleCandidate(this.connections[message.payload.userId], message.payload.candidate);
        }
        else
        {
            util.warn('unexpected message TYPE: ' + message.type + '. Payload: ' + JSON.stringify(message.payload));
        }
    }

    /**
     *
     *
     */
    _drainMessageQueue(connection)
    {
        util.log('Processing message queue.');

        if (!connection._started || !connection._hasRemoteSdp)
        {
            util.log('Not ready to process messages.');
            return;
        }
        for (var i = 0; i < connection._messageQueue.length; i++)
        {
            this._processSignalingMessage(connection._messageQueue[i]);
        }
        connection._messageQueue = [];
    }

    /**
     * Returns a MediaConnection to the specified peer. See documentation for a complete list of options.
     * Calls are managed externally, so that DOM can be managed independently, returns the call object to be managed.
     * Host will make calls.
     */
    call(userId)
    {
        console.log('Calling Peer.');
        if (this.disconnected)
        {
            util.warn('You cannot connect to a new Peer because you called ' + '.disconnect() on this Peer and ended your connection with the ' + 'server. You can create a new Peer to reconnect.');
            this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
            return;
        }

        if (!this.tracks.length)
        {
            // TODO: We need to make sure that the track is active
            util.error('To call a peer, you must provide a stream from your browser\'s `getUserMedia`.');
            return;
        }

        if (!this.connections[userId])
        {
            // TODO:
            // The userID does not exist in this room yet
        }

        this.connections[userId].open = true;
        Negotiator.makeOffer(this.connections[userId]);
    }

    addTrack(track, stream?)
    {
        var trackId = this.tracks.length;
        var newTrackHandle = {id: trackId, senders: [], track: track, active: true, stream: stream};
        this.tracks.push(newTrackHandle);

        for(var i = 0; i < this.users.length; i++)
        {
            var sender = Negotiator.addTrack(this.connections[this.users[i]], track, stream);
            newTrackHandle.senders.push({sender: sender, user: this.users[i]});
        }

        return trackId;
    }

    swapTrack(id, track)
    {
        // TODO: Investigate options requiring no renogotiation or single renogotiation.
        this.removeTrack(id);
        this.addTrack(track);
    }

    removeTrack(id: number)
    {
        var senders = this.tracks[id].senders;
        this.tracks[id].active = false;

        for(var i = 0; i < senders.length; i++)
        {
            Negotiator.removeTrack(this.connections[senders[i].user], senders[i].sender);
        }
    }

    _delayedAbort(type, message)
    {
        var self = this;
        util.setZeroTimeout(function()
        {
            self._abort(type, message);
        });
    }

    answer(userId: number)
    {
        if (!this.connections[userId].open)
        {
            // TODO: Report error
            return;
        }

        this.connections[userId]._originator = false;
        this._drainMessageQueue(this.connections[userId]);
    }

    // Called if the RTCPeerConnection fails or closes, passes event to listeners.
    close(userId: number)
    {
        if (!this.connections[userId].open)
        {
            return;
        }
        this.connections[userId].open = false;
        Negotiator.cleanup(this.connections[userId]);

        // Event emitter, exposed callback for user.
        this.emit('close')
    }

    remoteTrack(userId: number, track)
    {
        util.log('Receiving new track ', track);

        this.connections[userId].remoteTracks.push(track);

        // Event emitter, exposed callback for user.
        this.emit('track', userId, track);
    }

    /**
     * Destroys the Peer and emits an error message.
     * The Peer is not destroyed if it's in a disconnected state, in which case
     * it retains its disconnected state and its existing connections.
     */
    _abort(type, message)
    {
        util.error('Aborting!');

        this.destroy();
        this.emitError(type, message);
    }

    /** Emits a typed error message. */
    emitError(type, err)
    {
        util.error('Error:', err);
        if (typeof err === 'string')
        {
            err = new Error(err);
        }
        err.type = type;
        this.emit('error', err);
    }

    /**
     * Destroys the Peer: closes all active connections as well as the connection to the server.
     * Warning: The peer can no longer create or accept connections after being destroyed.
     */
    destroy()
    {
        if (!this.destroyed)
        {
            this._cleanup();
            this.disconnect();
            this.destroyed = true;
        }
    }

    /** Disconnects every connection on this peer. */
    _cleanup()
    {
        // We should just emit one disconnect and let the server do the rest.
        if (this.connections)
        {
            var peers = Object.keys(this.connections);
            for (var i = 0, ii = peers.length; i < ii; i++)
            {
                this._cleanupPeer(peers[i]);
            }
        }
    }

    /** Closes connection to this peer. */
    _cleanupPeer(userId: string)
    {
        var connection = this.connections[userId];

        connection.open = false;
        Negotiator.cleanup(connection);
    }

    /**
     * Disconnects the Peer's connection to the PeerServer. Does not close any active connections.
     * Warning: The peer can no longer create or accept connections after being disconnected. It also cannot reconnect to the server.
     */
    disconnect()
    {
        var self = this;
        util.setZeroTimeout(function()
        {
            if (!self.disconnected)
            {
                self.disconnected = true;
                self.open = false;
                if (self.socket)
                {
                    self.socket.emit('LEAVE');
                    self.socket.close();
                }
                self.emit('disconnected');
            }
        });
    }

    /** Attempts to reconnect with the same ID. */
    reconnect()
    {
        if (this.disconnected && !this.destroyed)
        {
            util.log('Attempting reconnection to server.');
            this.disconnected = false;
            this._initializeServerConnection();
            this._initialize();
        }
        else if (this.destroyed)
        {
            throw new Error('Cannot reconnect to the server. Peer container has already been destroyed.');
        }
        else if (!this.disconnected && !this.open)
        {
            // Do nothing. We're still connecting the first time.
            util.error('In a hurry? We\'re still trying to make the initial connection!');
        }
        else
        {
            throw new Error('Cannot reconnect because it is not disconnected from the server!');
        }
    }
}
