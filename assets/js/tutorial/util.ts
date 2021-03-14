interface Window
{
    mozRTCPeerConnection: RTCPeerConnection;
    webkitRTCPeerConnection: RTCPeerConnection;
    msRTCPeerConnection: RTCPeerConnection;

    RTCSessionDescription: RTCSessionDescription;
    mozRTCSessionDescription: RTCSessionDescription;
    webkitRTCSessionDescription: RTCSessionDescription;
    msRTCSessionDescription: RTCSessionDescription;

    RTCIceCandidate: RTCIceCandidate;
    mozRTCIceCandidate: RTCIceCandidate;
    webkitRTCIceCandidate: RTCIceCandidate;
    msRTCIceCandidate: RTCIceCandidate;

    MediaStream: MediaStream;
    webkitMediaStream: MediaStream;

    attachEvent: (msg: string, handle: (e) => void) => void;
}


var defaultConfig = {'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }]};
var dataCount: number = 1;

// @ts-ignore
var RTCPeerConnection: RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
// @ts-ignore
var RTCSessionDescription: RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
// @ts-ignore
var RTCIceCandidate: RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate || window.msRTCIceCandidate;
// @ts-ignore
var MediaStream: MediaStream = window.MediaStream || window.webkitMediaStream;


interface utilType
{

    debug: boolean;
    logLevel: number;

    noop: (...args: any[]) => void;
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;

    setLogLevel: (level: string) => void;
    setLogFunction: (fn: (...args: any[]) => void) => void;

    _printWith: (prefix: string) => (...args : any[]) => void
    _print: (...args : any[]) => void;

    defaultConfig: any;
    browser: string;
    supports: any;

    isSecure: () => boolean;
    
    setZeroTimeout: (fn: () => void) => void;    
    extend: (dest: Object, source: Object) => Object;
}

export const util: utilType =
{

    noop: (...args: any[]) => {},

    // Logging logic
    warn: null,
    logLevel: 0,
    error: null,
    setLogLevel: (level) =>
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

    _printWith: (prefix) =>
    {
        return (...args : any[]) =>
        {
            var copy = args.slice();
            copy.unshift(prefix);
            util._print.apply(util, copy);
        };
    },

    _print: (...args : any[]) =>
    {
        var err = false;
        var copy = args.slice();
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
    browser: (() =>
    {
        // @ts-ignore
        if (window.mozRTCPeerConnection)
        {
            return 'Firefox';
        }
        // @ts-ignore
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
        // @ts-ignore
        var onnegotiationneeded = !!window.webkitRTCPeerConnection;

        var pc, dc;
        try
        {
            // @ts-ignore
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

        var retVal = { audioVideo: audioVideo, onnegotiationneeded: onnegotiationneeded };

        return retVal;
    }()),

    debug: false,

    extend: (dest, source) =>
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

    log: (...args : any[]) =>
    {
        if (util.debug)
        {
            var err = false;
            var copy = args.slice();
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
        // @ts-ignore
        else if (global.attachEvent)
        {
            // @ts-ignore
            global.attachEvent('onmessage', handleMessage);
        }

        return setZeroTimeoutPostMessage;
    }(window)),

    isSecure: () =>
    {
        return location.protocol === 'https:';
    }
};
