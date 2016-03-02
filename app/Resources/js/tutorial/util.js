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
