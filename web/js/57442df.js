/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once)
{
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event)
{
    if (!this._events || !this._events[event]) return [];

    for (var i = 0, l = this._events[event].length, ee = []; i < l; i++)
    {
        ee.push(this._events[event][i].fn);
    }

    return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5)
{
    if (!this._events || !this._events[event]) return false;

    var listeners = this._events[event], length = listeners.length, len = arguments.length, ee = listeners[0], args, i, j;

    if (1 === length)
    {
        if (ee.once) this.removeListener(event, ee.fn, true);

        switch (len)
        {
            case 1: return ee.fn.call(ee.context), true;
            case 2: return ee.fn.call(ee.context, a1), true;
            case 3: return ee.fn.call(ee.context, a1, a2), true;
            case 4: return ee.fn.call(ee.context, a1, a2, a3), true;
            case 5: return ee.fn.call(ee.context, a1, a2, a3, a4), true;
            case 6: return ee.fn.call(ee.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++)
        {
            args[i - 1] = arguments[i];
        }

        ee.fn.apply(ee.context, args);
    }
    else
    {
        for (i = 0; i < length; i++)
        {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

            switch (len)
            {
                case 1: listeners[i].fn.call(listeners[i].context); break;
                case 2: listeners[i].fn.call(listeners[i].context, a1); break;
                case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
                default:
                    if (!args)
                    {
                        for (j = 1, args = new Array(len -1); j < len; j++)
                        {
                            args[j - 1] = arguments[j];
                        }
                    }
                    listeners[i].fn.apply(listeners[i].context, args);
            }
        }
    }

    return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context)
{
    if (!this._events) this._events = {};

    if (!this._events[event]) this._events[event] = [];

    this._events[event].push(new EE( fn, context || this ));

    return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context)
{
    if (!this._events) this._events = {};

    if (!this._events[event]) this._events[event] = [];

    this._events[event].push(new EE(fn, context || this, true ));

    return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once)
{
    if (!this._events || !this._events[event]) return this;

    var listeners = this._events[event], events = [];

    if (fn) for (var i = 0, length = listeners.length; i < length; i++)
    {
        if (listeners[i].fn !== fn && listeners[i].once !== once)
        {
            events.push(listeners[i]);
        }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length)
    {
        this._events[event] = events;
    }
    else
    {
        this._events[event] = null;
    }

    return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event)
{
    if (!this._events) return this;

    if (event)
    {
        this._events[event] = null;
    }
    else
    {
        this._events = {};
    }

    return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners()
{
    return this;
};

var defaultConfig = {'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]};
var dataCount = 1;
var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate || window.msRTCIceCandidate;

var util =
{

    noop: function() {},

    // Logging logic
    logLevel: 0,
    setLogLevel: function(level)
    {
        var debugLevel = parseInt(level, 10);
        if (!isNaN(parseInt(level, 10)))
        {
            util.logLevel = debugLevel;
        }
        else
        {
            // If they are using truthy/falsy values for debug
            util.logLevel = level ? 3 : 0;
        }

        util.log = util.warn = util.error = util.noop;
        if (util.logLevel > 0)
        {
            util.error = util._printWith('ERROR');
        }
        if (util.logLevel > 1)
        {
            util.warn = util._printWith('WARNING');
        }
        if (util.logLevel > 2)
        {
            util.log = util._print;
        }
    },
    setLogFunction: function(fn)
    {
        if (fn.constructor !== Function)
        {
            util.warn('The log function you passed in is not a function. Defaulting to regular logs.');
        }
        else
        {
            util._print = fn;
        }
    },

    _printWith: function(prefix)
    {
        return function()
        {
            var copy = Array.prototype.slice.call(arguments);
            copy.unshift(prefix);
            util._print.apply(util, copy);
        };
    },

    _print: function ()
    {
        var err = false;
        var copy = Array.prototype.slice.call(arguments);
        copy.unshift('MediaConnection: ');
        for (var i = 0, l = copy.length; i < l; i++)
        {
            if (copy[i] instanceof Error)
            {
                copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
                err = true;
            }
        }
        err ? console.error.apply(console, copy) : console.log.apply(console, copy);
    },

    // Returns browser-agnostic default config
    defaultConfig: defaultConfig,

    // Returns the current browser.
    browser: (function()
    {
        if (window.mozRTCPeerConnection)
        {
            return 'Firefox';
        }
        else if (window.webkitRTCPeerConnection)
        {
            return 'Chrome';
        }
        else if (window.RTCPeerConnection)
        {
            return 'Supported';
        }
        else
        {
            return 'Unsupported';
        }
    })(),

    // Lists which features are supported
    supports: (function()
    {
        if (typeof RTCPeerConnection === 'undefined')
        {
            return {};
        }

        var audioVideo = true;
        var onnegotiationneeded = !!window.webkitRTCPeerConnection;

        var pc, dc;
        try
        {
            pc = new RTCPeerConnection(defaultConfig);
        }
        catch (e)
        {
            audioVideo = false;
        }

        // FIXME: not really the best check...
        if (audioVideo)
        {
            audioVideo = !!pc.addStream;
        }

        if (pc)
        {
            pc.close();
        }

        var retVal = {};
        retVal.audioVideo = audioVideo;
        retVal.onnegotiationneeded = onnegotiationneeded;

        return retVal;
    }()),

    debug: false,

    inherits: function(ctor, superCtor)
    {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {constructor: {value: ctor, enumerable: false, writable: true, configurable: true}});
    },

    extend: function(dest, source)
    {
        for(var key in source)
        {
            if(source.hasOwnProperty(key))
            {
                dest[key] = source[key];
            }
        }
        return dest;
    },

    log: function ()
    {
        if (util.debug)
        {
            var err = false;
            var copy = Array.prototype.slice.call(arguments);
            copy.unshift('MediaConnection: ');
            for (var i = 0, l = copy.length; i < l; i++)
            {
                if (copy[i] instanceof Error)
                {
                    copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
                    err = true;
                }
            }
            err ? console.error.apply(console, copy) : console.log.apply(console, copy);
        }
    },

    setZeroTimeout: (function(global)
    {
        var timeouts = [];
        var messageName = 'zero-timeout-message';

        // Like setTimeout, but only takes a function argument.	 There's
        // no time argument (always zero) and no arguments (you have to
        // use a closure).
        function setZeroTimeoutPostMessage(fn)
        {
            timeouts.push(fn);
            global.postMessage(messageName, '*');
        }

        function handleMessage(event)
        {
            if (event.source == global && event.data == messageName)
            {
                if (event.stopPropagation)
                {
                    event.stopPropagation();
                }
                if (timeouts.length)
                {
                    timeouts.shift()();
                }
            }
        }

        if (global.addEventListener)
        {
            global.addEventListener('message', handleMessage, true);
        }
        else if (global.attachEvent)
        {
            global.attachEvent('onmessage', handleMessage);
        }

        return setZeroTimeoutPostMessage;
    }(window)),

    isSecure: function()
    {
        return location.protocol === 'https:';
    }
};

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

            var msgPayload = {candidate: evt.candidate, userId: connection.provider.id};
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

            // TODO: Remove label.
            var msgPayload = {sdp: offer, label: connection.label, userId: connection.provider.id, browser: util.browser};
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

            var msgPayload = {sdp: answer, userId: connection.provider.id, browser: util.browser};
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
