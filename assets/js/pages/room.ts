/// <reference path="../typings/immutable.d.ts"/>

require('../../css/tutorial/room.css');

import './pageBase'
import '../ReactDeclarations';
import { MediaContainer } from '../tutorial/MediaContainer';
import { PeerHandler } from '../tutorial/PeerHandler';
import { WhiteBoardController }  from '../tutorial/WhiteBoardController';
import { WhiteBoardView } from '../tutorial/WhiteBoardView';

declare var ReactDOM: any;
declare var componentFiles: Array<string>;

declare function io(url: string, reqData: any) : Socket;
interface Socket {
    connected: boolean;

    on(event: string, callback: (data: any) => void );
    emit(event: string, data: any);
}

declare var components: Immutable.Map<string, BoardComponent>;

declare function registerComponentView(componentName: string, ElementView, PalleteView, ModeView, DrawHandle);

let whiteBoardController: WhiteBoardController;
let whiteBoardView;


let mediaSocket;
let boardSocket;
let localStream;
let userData = [];
let medCont;
let whitCont;
let peerHandler;
let localAudio;
let localVideo;

let constraintsToChrome_ = function(c)
{
    if (typeof c !== 'object' || c.mandatory || c.optional)
    {
        return c;
    }
    let cc: any = {};
    Object.keys(c).forEach(function(key)
    {
        if (key === 'require' || key === 'advanced' || key === 'mediaSource')
        {
            return;
        }
        let r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
        if (r.exact !== undefined && typeof r.exact === 'number')
        {
            r.min = r.max = r.exact;
        }
        let oldname_ = function(prefix, name)
        {
            if (prefix)
            {
                return prefix + name.charAt(0).toUpperCase() + name.slice(1);
            }
            return (name === 'deviceId') ? 'sourceId' : name;
        };
        if (r.ideal !== undefined)
        {
            cc.optional = cc.optional || [];
            let oc = {};
            if (typeof r.ideal === 'number')
            {
                oc[oldname_('min', key)] = r.ideal;
                cc.optional.push(oc);
                oc = {};
                oc[oldname_('max', key)] = r.ideal;
                cc.optional.push(oc);
            }
            else
            {
                oc[oldname_('', key)] = r.ideal;
                cc.optional.push(oc);
            }
        }
        if (r.exact !== undefined && typeof r.exact !== 'number')
        {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_('', key)] = r.exact;
        }
        else
        {
            ['min', 'max'].forEach(function(mix)
            {
                if (r[mix] !== undefined)
                {
                    cc.mandatory = cc.mandatory || {};
                    cc.mandatory[oldname_(mix, key)] = r[mix];
                }
            });
        }
    });
    if (c.advanced)
    {
        cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
};

let getUserMedia_ = function(constraints, onSuccess, onError)
{
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints.audio)
    {
        constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints.video)
    {
        constraints.video = constraintsToChrome_(constraints.video);
    }
    // @ts-ignore
    return navigator.webkitGetUserMedia(constraints, onSuccess, onError);
};
navigator.getUserMedia = getUserMedia_;

// Returns the result of getUserMedia as a Promise.
let getUserMediaPromise_ = function(constraints)
{
    return new Promise(function(resolve, reject)
    {
        navigator.getUserMedia(constraints, resolve, reject);
    });
};

if(getVariable('environment') == 'dev' && getVariable('roomToken') == 'TestFun')
{
    // TODO: Circimvent connecting to the server, this is a functionality test.
}

if (!navigator.mediaDevices)
{
    // @ts-ignore
    navigator.mediaDevices =
    {
        getUserMedia: getUserMediaPromise_,
        enumerateDevices: function()
        {
            return new Promise(function(resolve)
            {
                let kinds = {audio: 'audioinput', video: 'videoinput'};
                // @ts-ignore
                return MediaStreamTrack.getSources(function(devices)
                {
                    resolve(devices.map(function(device)
                    {
                        return {label: device.label, kind: kinds[device.kind], deviceId: device.id, groupId: ''};
                    }));
                });
            });
        }
    };
}

if (!navigator.mediaDevices.getUserMedia)
{
    // @ts-ignore
    navigator.mediaDevices.getUserMedia = function(constraints)
    {
        return getUserMediaPromise_(constraints);
    };
}

if (navigator.mediaDevices.getUserMedia)
{
    var p = navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    p.then(function(mediaStream)
    {
        localStream = mediaStream;

        if(getVariable('roomToken') != 'TestFun' || getVariable('environment') != 'dev')
        {
            mediaSocket = io(getVariable('serverToken') + ':700/media', { query: 'sessId=' + getVariable('sessionId') + '&' + "roomId=" + getVariable('roomToken')});
            boardSocket = io(getVariable('serverToken') + ':700/board', { query: 'sessId=' + getVariable('sessionId') + '&' + "roomId=" + getVariable('roomToken')});
        }

        initMedia();
        initBoard();
    });
    p.catch(function(err) { console.log(err.name); });
}
else
{
    console.log("getUserMedia not supported");
}

function initBoard()
{
    if(getVariable('roomToken') == 'TestFun' && getVariable('environment') == 'dev')
    {
        whiteBoardController = new WhiteBoardController(getVariable('isHost') === "TRUE", 0, false, true, getVariable('workerUrlGlobal'), componentFiles, components, true);
        whiteBoardView = ReactDOM.render(React.createElement(WhiteBoardView, {controller: whiteBoardController}), document.getElementById('whiteboard-app'));
        whiteBoardController.setView(whiteBoardView);
        return;
    }

    boardSocket.on('READY', function(userId)
    {
        // TODO: Implement server options.
        whiteBoardController = new WhiteBoardController(getVariable('isHost') === "TRUE", userId, false, true, getVariable('workerUrlGlobal'), componentFiles, components, false);
        whiteBoardView = ReactDOM.render(React.createElement(WhiteBoardView, {controller: whiteBoardController}), document.getElementById('whiteboard-app'));
        whiteBoardController.setView(whiteBoardView);
        console.log('Received ready and emitted join room.');

        boardSocket.on('CONNOK', function()
        {
            whiteBoardController.setSocket(boardSocket);
        });

        boardSocket.emit('JOIN-ROOM', getVariable('roomToken'));
    });
}

function initMedia()
{
    if(getVariable('roomToken') == 'TestFun' && getVariable('environment') == 'dev')
    {
        console.log(getVariable('isHost') === "TRUE");
        medCont = ReactDOM.render(React.createElement(MediaContainer, {isHost: getVariable('isHost') === "TRUE"}), document.getElementById('media-app'));
        medCont.setStream(localStream);
        return;
    }

    mediaSocket.on('READY', function(userId)
    {
        peerHandler = new PeerHandler(<string>getVariable('roomToken'), {}, mediaSocket);
        console.log(getVariable('isHost') === "TRUE");
        medCont = ReactDOM.render(React.createElement(MediaContainer, {isHost: getVariable('isHost') === "TRUE"}), document.getElementById('media-app'));

        medCont.setStream(localStream);
        medCont.setHandler(peerHandler, userId);
    });
}