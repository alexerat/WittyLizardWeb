/**
 * A peer who can initiate connections with other peers.
 * Take the roomToken and the socket connection.
 */
function PeerHandler(roomToken, options, socket)
{
    //TODO: What is this even?
    if (!(this instanceof PeerHandler))
    {
        return new PeerHandler(roomToken, options, socket);
    }

    // Configurize options. Debug options: 1 Errors, 2 Warnings, 3 log All
    options = util.extend({debug: 3, config: util.defaultConfig}, options);

    this.options = options;
    this.socket = socket;
    this.roomToken = roomToken;
    this.pc = null;
    this.iceRecieved = false;

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

util.inherits(PeerHandler, EventEmitter);

// Initialize the socket event listeners
PeerHandler.prototype._initializeServerConnection = function()
{
    var self = this;

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
        self.connections[userId] = {open: false, peer: remoteId, provider: self, id: userId, options: {}};
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
        var userId = payload.userId;

        if (self.connections[userId].open)
        {
            util.warn('Offer received for existing Connection ID:', userId);
        }
        else
        {
            if (!self.connections[userId])
            {
                // The userID does not exist in this room yet
            }

            self.connections[userId].options.sdp = payload.sdp;

            // Inform callback listeners about the call.
            self.emit('call', userId);

        }
    });

    this.socket.on('ANSWER', function(payload)
    {
        // Forward to negotiator
        Negotiator.handleSDP('ANSWER', self.connections[payload.userId], payload.sdp);
        self.connections[payload.userId].open = true;
    });

    this.socket.on('CANDIDATE', function(payload)
    {
        Negotiator.handleCandidate(self.connections[payload.userId], payload.candidate);
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
};

/** Initialize a connection with the server. */
PeerHandler.prototype._initialize = function()
{
    // TODO: Have a timeout error in case of a no-response
    this.socket.emit('GETID');
};

/**
 * Returns a MediaConnection to the specified peer. See documentation for a complete list of options.
 * Calls are managed externally, so that DOM can be managed independently, returns the call object to be managed.
 * Host will make calls.
 */
PeerHandler.prototype.call = function(userId, stream, options)
{
    if (this.disconnected)
    {
        util.warn('You cannot connect to a new Peer because you called ' + '.disconnect() on this Peer and ended your connection with the ' + 'server. You can create a new Peer to reconnect.');
        this.emitError('disconnected', 'Cannot connect to new Peer after disconnecting from server.');
        return;
    }

    if (!stream)
    {
        util.error('To call a peer, you must provide a stream from your browser\'s `getUserMedia`.');
        return;
    }

    if (this.connections[userId])
    {
        // The userID does not exist in this room yet
    }

    options = options || {};
    options._stream = stream;

    this.connections[userId].options = options;
    this.connections[userId].localStream = stream;
    this.connections[userId].metadata = options.metadata;
	this.connections[userId].pc = Negotiator.startConnection(this.connections[userId], {_stream: stream, originator: true});

};

PeerHandler.prototype._delayedAbort = function(type, message)
{
    var self = this;
    util.setZeroTimeout(function()
    {
        self._abort(type, message);
    });
};


PeerHandler.prototype.answer = function(userId, stream)
{
    // TODO: This is probably the wrong check.
	if (this.connections[userId].localStream)
	{
		util.warn('Local stream already exists on this MediaConnection. Are you answering a call twice?');
		return;
	}

	this.connections[userId].localStream = stream;
    this.connections[userId].options._stream = stream;
	this.connections[userId].pc = Negotiator.startConnection(this.connections[userId], this.connections[userId].options);
	this.connections[userId].open = true;
};

// Called if the RTCPeerConnection fails or closes, passes event to listeners.
PeerHandler.prototype.close = function(userId)
{
	if (!this.connections[userId].open)
	{
		return;
	}
	this.connections[userId].open = false;
	Negotiator.cleanup(this.connections[userId]);

    // Event emitter, exposed callback for user.
	this.emit('close')
};

PeerHandler.prototype.addStream = function(userId, remoteStream)
{
	util.log('Receiving stream', remoteStream);

	this.connections[userId].remoteStream = remoteStream;

    // Event emitter, exposed callback for user.
	this.emit('stream', userId, remoteStream);
};

/**
 * Destroys the Peer and emits an error message.
 * The Peer is not destroyed if it's in a disconnected state, in which case
 * it retains its disconnected state and its existing connections.
 */
PeerHandler.prototype._abort = function(type, message)
{
    util.error('Aborting!');

    this.destroy();
    this.emitError(type, message);
};

/** Emits a typed error message. */
PeerHandler.prototype.emitError = function(type, err)
{
    util.error('Error:', err);
    if (typeof err === 'string')
    {
        err = new Error(err);
    }
    err.type = type;
    this.emit('error', err);
};

/**
 * Destroys the Peer: closes all active connections as well as the connection to the server.
 * Warning: The peer can no longer create or accept connections after being destroyed.
 */
PeerHandler.prototype.destroy = function()
{
    if (!this.destroyed)
    {
        this._cleanup();
        this.disconnect();
        this.destroyed = true;
    }
};

/** Disconnects every connection on this peer. */
PeerHandler.prototype._cleanup = function()
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
};

/** Closes connection to this peer. */
PeerHandler.prototype._cleanupPeer = function(userId)
{
    var connection = this.connections[userId];

    connection.open = false;
	Negotiator.cleanup(connection);
};

/**
 * Disconnects the Peer's connection to the PeerServer. Does not close any active connections.
 * Warning: The peer can no longer create or accept connections after being disconnected. It also cannot reconnect to the server.
 */
PeerHandler.prototype.disconnect = function()
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
};

/** Attempts to reconnect with the same ID. */
PeerHandler.prototype.reconnect = function()
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
};
