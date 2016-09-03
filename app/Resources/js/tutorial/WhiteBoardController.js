if (typeof Object.assign != 'function') {
    (function () {
        Object.assign = function (target) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var output = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source !== undefined && source !== null) {
                    for (var nextKey in source) {
                        if (source.hasOwnProperty(nextKey)) {
                            output[nextKey] = source[nextKey];
                        }
                    }
                }
            }
            return output;
        };
    })();
}
(function (global) {
    var nativeKeyboardEvent = ('KeyboardEvent' in global);
    if (!nativeKeyboardEvent)
        global.KeyboardEvent = function KeyboardEvent() { throw TypeError('Illegal constructor'); };
    global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD = 0x00;
    global.KeyboardEvent.DOM_KEY_LOCATION_LEFT = 0x01;
    global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT = 0x02;
    global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD = 0x03;
    var STANDARD = window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD, LEFT = window.KeyboardEvent.DOM_KEY_LOCATION_LEFT, RIGHT = window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT, NUMPAD = window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;
    function contains(s, ss) { return String(s).indexOf(ss) !== -1; }
    var os = (function () {
        if (contains(navigator.platform, 'Win')) {
            return 'win';
        }
        if (contains(navigator.platform, 'Mac')) {
            return 'mac';
        }
        if (contains(navigator.platform, 'CrOS')) {
            return 'cros';
        }
        if (contains(navigator.platform, 'Linux')) {
            return 'linux';
        }
        if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) {
            return 'ios';
        }
        return '';
    }());
    var browser = (function () {
        if (contains(navigator.userAgent, 'Chrome/')) {
            return 'chrome';
        }
        if (contains(navigator.vendor, 'Apple')) {
            return 'safari';
        }
        if (contains(navigator.userAgent, 'MSIE')) {
            return 'ie';
        }
        if (contains(navigator.userAgent, 'Gecko/')) {
            return 'moz';
        }
        if (contains(navigator.userAgent, 'Opera/')) {
            return 'opera';
        }
        return '';
    }());
    var browser_os = browser + '-' + os;
    function mergeIf(baseTable, select, table) {
        if (browser_os === select || browser === select || os === select) {
            Object.keys(table).forEach(function (keyCode) {
                baseTable[keyCode] = table[keyCode];
            });
        }
    }
    function remap(o, key) {
        var r = {};
        Object.keys(o).forEach(function (k) {
            var item = o[k];
            if (key in item) {
                r[item[key]] = item;
            }
        });
        return r;
    }
    function invert(o) {
        var r = {};
        Object.keys(o).forEach(function (k) {
            r[o[k]] = k;
        });
        return r;
    }
    var keyCodeToInfoTable = {
        0x03: { code: 'Cancel' },
        0x06: { code: 'Help' },
        0x08: { code: 'Backspace' },
        0x09: { code: 'Tab' },
        0X0C: { code: 'Clear' },
        0X0D: { code: 'Enter' },
        0x10: { code: 'Shift' },
        0x11: { code: 'Control' },
        0x12: { code: 'Alt' },
        0x13: { code: 'Pause' },
        0x14: { code: 'CapsLock' },
        0x15: { code: 'KanaMode' },
        0x16: { code: 'Lang1' },
        0x19: { code: 'Lang2' },
        0x1B: { code: 'Escape' },
        0x1C: { code: 'Convert' },
        0x1D: { code: 'NonConvert' },
        0x1E: { code: 'Accept' },
        0x1F: { code: 'ModeChange' },
        0x20: { code: 'Space' },
        0x21: { code: 'PageUp' },
        0x22: { code: 'PageDown' },
        0x23: { code: 'End' },
        0x24: { code: 'Home' },
        0x25: { code: 'ArrowLeft' },
        0x26: { code: 'ArrowUp' },
        0x27: { code: 'ArrowRight' },
        0x28: { code: 'ArrowDown' },
        0x29: { code: 'Select' },
        0x2A: { code: 'Print' },
        0x2B: { code: 'Execute' },
        0x2C: { code: 'PrintScreen' },
        0x2D: { code: 'Insert' },
        0x2E: { code: 'Delete' },
        0x2F: { code: 'Help' },
        0x30: { code: 'Digit0', keyCap: '0' },
        0x31: { code: 'Digit1', keyCap: '1' },
        0x32: { code: 'Digit2', keyCap: '2' },
        0x33: { code: 'Digit3', keyCap: '3' },
        0x34: { code: 'Digit4', keyCap: '4' },
        0x35: { code: 'Digit5', keyCap: '5' },
        0x36: { code: 'Digit6', keyCap: '6' },
        0x37: { code: 'Digit7', keyCap: '7' },
        0x38: { code: 'Digit8', keyCap: '8' },
        0x39: { code: 'Digit9', keyCap: '9' },
        0x41: { code: 'KeyA', keyCap: 'a' },
        0x42: { code: 'KeyB', keyCap: 'b' },
        0x43: { code: 'KeyC', keyCap: 'c' },
        0x44: { code: 'KeyD', keyCap: 'd' },
        0x45: { code: 'KeyE', keyCap: 'e' },
        0x46: { code: 'KeyF', keyCap: 'f' },
        0x47: { code: 'KeyG', keyCap: 'g' },
        0x48: { code: 'KeyH', keyCap: 'h' },
        0x49: { code: 'KeyI', keyCap: 'i' },
        0x4A: { code: 'KeyJ', keyCap: 'j' },
        0x4B: { code: 'KeyK', keyCap: 'k' },
        0x4C: { code: 'KeyL', keyCap: 'l' },
        0x4D: { code: 'KeyM', keyCap: 'm' },
        0x4E: { code: 'KeyN', keyCap: 'n' },
        0x4F: { code: 'KeyO', keyCap: 'o' },
        0x50: { code: 'KeyP', keyCap: 'p' },
        0x51: { code: 'KeyQ', keyCap: 'q' },
        0x52: { code: 'KeyR', keyCap: 'r' },
        0x53: { code: 'KeyS', keyCap: 's' },
        0x54: { code: 'KeyT', keyCap: 't' },
        0x55: { code: 'KeyU', keyCap: 'u' },
        0x56: { code: 'KeyV', keyCap: 'v' },
        0x57: { code: 'KeyW', keyCap: 'w' },
        0x58: { code: 'KeyX', keyCap: 'x' },
        0x59: { code: 'KeyY', keyCap: 'y' },
        0x5A: { code: 'KeyZ', keyCap: 'z' },
        0x5B: { code: 'MetaLeft', location: LEFT },
        0x5C: { code: 'MetaRight', location: RIGHT },
        0x5D: { code: 'ContextMenu' },
        0x5F: { code: 'Standby' },
        0x60: { code: 'Numpad0', keyCap: '0', location: NUMPAD },
        0x61: { code: 'Numpad1', keyCap: '1', location: NUMPAD },
        0x62: { code: 'Numpad2', keyCap: '2', location: NUMPAD },
        0x63: { code: 'Numpad3', keyCap: '3', location: NUMPAD },
        0x64: { code: 'Numpad4', keyCap: '4', location: NUMPAD },
        0x65: { code: 'Numpad5', keyCap: '5', location: NUMPAD },
        0x66: { code: 'Numpad6', keyCap: '6', location: NUMPAD },
        0x67: { code: 'Numpad7', keyCap: '7', location: NUMPAD },
        0x68: { code: 'Numpad8', keyCap: '8', location: NUMPAD },
        0x69: { code: 'Numpad9', keyCap: '9', location: NUMPAD },
        0x6A: { code: 'NumpadMultiply', keyCap: '*', location: NUMPAD },
        0x6B: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD },
        0x6C: { code: 'NumpadComma', keyCap: ',', location: NUMPAD },
        0x6D: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD },
        0x6E: { code: 'NumpadDecimal', keyCap: '.', location: NUMPAD },
        0x6F: { code: 'NumpadDivide', keyCap: '/', location: NUMPAD },
        0x70: { code: 'F1' },
        0x71: { code: 'F2' },
        0x72: { code: 'F3' },
        0x73: { code: 'F4' },
        0x74: { code: 'F5' },
        0x75: { code: 'F6' },
        0x76: { code: 'F7' },
        0x77: { code: 'F8' },
        0x78: { code: 'F9' },
        0x79: { code: 'F10' },
        0x7A: { code: 'F11' },
        0x7B: { code: 'F12' },
        0x7C: { code: 'F13' },
        0x7D: { code: 'F14' },
        0x7E: { code: 'F15' },
        0x7F: { code: 'F16' },
        0x80: { code: 'F17' },
        0x81: { code: 'F18' },
        0x82: { code: 'F19' },
        0x83: { code: 'F20' },
        0x84: { code: 'F21' },
        0x85: { code: 'F22' },
        0x86: { code: 'F23' },
        0x87: { code: 'F24' },
        0x90: { code: 'NumLock', location: NUMPAD },
        0x91: { code: 'ScrollLock' },
        0xA0: { code: 'ShiftLeft', location: LEFT },
        0xA1: { code: 'ShiftRight', location: RIGHT },
        0xA2: { code: 'ControlLeft', location: LEFT },
        0xA3: { code: 'ControlRight', location: RIGHT },
        0xA4: { code: 'AltLeft', location: LEFT },
        0xA5: { code: 'AltRight', location: RIGHT },
        0xA6: { code: 'BrowserBack' },
        0xA7: { code: 'BrowserForward' },
        0xA8: { code: 'BrowserRefresh' },
        0xA9: { code: 'BrowserStop' },
        0xAA: { code: 'BrowserSearch' },
        0xAB: { code: 'BrowserFavorites' },
        0xAC: { code: 'BrowserHome' },
        0xAD: { code: 'AudioVolumeMute' },
        0xAE: { code: 'AudioVolumeDown' },
        0xAF: { code: 'AudioVolumeUp' },
        0xB0: { code: 'MediaTrackNext' },
        0xB1: { code: 'MediaTrackPrevious' },
        0xB2: { code: 'MediaStop' },
        0xB3: { code: 'MediaPlayPause' },
        0xB4: { code: 'LaunchMail' },
        0xB5: { code: 'MediaSelect' },
        0xB6: { code: 'LaunchApp1' },
        0xB7: { code: 'LaunchApp2' },
        0xBA: { code: 'Semicolon', keyCap: ';' },
        0xBB: { code: 'Equal', keyCap: '=' },
        0xBC: { code: 'Comma', keyCap: ',' },
        0xBD: { code: 'Minus', keyCap: '-' },
        0xBE: { code: 'Period', keyCap: '.' },
        0xBF: { code: 'Slash', keyCap: '/' },
        0xC0: { code: 'Backquote', keyCap: '`' },
        0xDB: { code: 'BracketLeft', keyCap: '[' },
        0xDC: { code: 'Backslash', keyCap: '\\' },
        0xDD: { code: 'BracketRight', keyCap: ']' },
        0xDE: { code: 'Quote', keyCap: '\'' },
        0xE2: { code: 'IntlBackslash', keyCap: '\\' },
        0xE5: { code: 'Process' },
        0xF6: { code: 'Attn' },
        0xF7: { code: 'CrSel' },
        0xF8: { code: 'ExSel' },
        0xF9: { code: 'EraseEof' },
        0xFA: { code: 'Play' },
        0xFB: { code: 'ZoomToggle' },
        0xFE: { code: 'Clear' }
    };
    mergeIf(keyCodeToInfoTable, 'moz', {
        0x3B: { code: 'Semicolon', keyCap: ';' },
        0x3D: { code: 'Equal', keyCap: '=' },
        0x6B: { code: 'Equal', keyCap: '=' },
        0x6D: { code: 'Minus', keyCap: '-' },
        0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD },
        0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD }
    });
    mergeIf(keyCodeToInfoTable, 'moz-mac', {
        0x0C: { code: 'NumLock', location: NUMPAD },
        0xAD: { code: 'Minus', keyCap: '-' }
    });
    mergeIf(keyCodeToInfoTable, 'moz-win', {
        0xAD: { code: 'Minus', keyCap: '-' }
    });
    mergeIf(keyCodeToInfoTable, 'chrome-mac', {
        0x5D: { code: 'MetaRight', location: RIGHT }
    });
    if (0) {
        mergeIf(keyCodeToInfoTable, 'chrome-win', {
            0xC0: { code: 'Quote', keyCap: '\'' },
            0xDE: { code: 'Backslash', keyCap: '\\' },
            0xDF: { code: 'Backquote', keyCap: '`' }
        });
        mergeIf(keyCodeToInfoTable, 'ie', {
            0xC0: { code: 'Quote', keyCap: '\'' },
            0xDE: { code: 'Backslash', keyCap: '\\' },
            0xDF: { code: 'Backquote', keyCap: '`' }
        });
    }
    mergeIf(keyCodeToInfoTable, 'safari', {
        0x03: { code: 'Enter' },
        0x19: { code: 'Tab' }
    });
    mergeIf(keyCodeToInfoTable, 'ios', {
        0x0A: { code: 'Enter', location: STANDARD }
    });
    mergeIf(keyCodeToInfoTable, 'safari-mac', {
        0x5B: { code: 'MetaLeft', location: LEFT },
        0x5D: { code: 'MetaRight', location: RIGHT },
        0xE5: { code: 'KeyQ', keyCap: 'Q' }
    });
    var keyIdentifierTable = {};
    if ('cros' === os) {
        keyIdentifierTable['U+00A0'] = { code: 'ShiftLeft', location: LEFT };
        keyIdentifierTable['U+00A1'] = { code: 'ShiftRight', location: RIGHT };
        keyIdentifierTable['U+00A2'] = { code: 'ControlLeft', location: LEFT };
        keyIdentifierTable['U+00A3'] = { code: 'ControlRight', location: RIGHT };
        keyIdentifierTable['U+00A4'] = { code: 'AltLeft', location: LEFT };
        keyIdentifierTable['U+00A5'] = { code: 'AltRight', location: RIGHT };
    }
    if ('chrome-mac' === browser_os) {
        keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
    }
    if ('safari-mac' === browser_os) {
        keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
    }
    if ('ios' === os) {
        keyIdentifierTable['U+0010'] = { code: 'Function' };
        keyIdentifierTable['U+001C'] = { code: 'ArrowLeft' };
        keyIdentifierTable['U+001D'] = { code: 'ArrowRight' };
        keyIdentifierTable['U+001E'] = { code: 'ArrowUp' };
        keyIdentifierTable['U+001F'] = { code: 'ArrowDown' };
        keyIdentifierTable['U+0001'] = { code: 'Home' };
        keyIdentifierTable['U+0004'] = { code: 'End' };
        keyIdentifierTable['U+000B'] = { code: 'PageUp' };
        keyIdentifierTable['U+000C'] = { code: 'PageDown' };
    }
    var locationTable = [];
    locationTable[LEFT] = {
        0x10: { code: 'ShiftLeft', location: LEFT },
        0x11: { code: 'ControlLeft', location: LEFT },
        0x12: { code: 'AltLeft', location: LEFT }
    };
    locationTable[RIGHT] = {
        0x10: { code: 'ShiftRight', location: RIGHT },
        0x11: { code: 'ControlRight', location: RIGHT },
        0x12: { code: 'AltRight', location: RIGHT }
    };
    locationTable[NUMPAD] = {
        0x0D: { code: 'NumpadEnter', location: NUMPAD }
    };
    mergeIf(locationTable[NUMPAD], 'moz', {
        0x6D: { code: 'NumpadSubtract', location: NUMPAD },
        0x6B: { code: 'NumpadAdd', location: NUMPAD }
    });
    mergeIf(locationTable[LEFT], 'moz-mac', {
        0xE0: { code: 'MetaLeft', location: LEFT }
    });
    mergeIf(locationTable[RIGHT], 'moz-mac', {
        0xE0: { code: 'MetaRight', location: RIGHT }
    });
    mergeIf(locationTable[RIGHT], 'moz-win', {
        0x5B: { code: 'MetaRight', location: RIGHT }
    });
    mergeIf(locationTable[RIGHT], 'mac', {
        0x5D: { code: 'MetaRight', location: RIGHT }
    });
    mergeIf(locationTable[NUMPAD], 'chrome-mac', {
        0x0C: { code: 'NumLock', location: NUMPAD }
    });
    mergeIf(locationTable[NUMPAD], 'safari-mac', {
        0x0C: { code: 'NumLock', location: NUMPAD },
        0xBB: { code: 'NumpadAdd', location: NUMPAD },
        0xBD: { code: 'NumpadSubtract', location: NUMPAD },
        0xBE: { code: 'NumpadDecimal', location: NUMPAD },
        0xBF: { code: 'NumpadDivide', location: NUMPAD }
    });
    var codeToKeyTable = {
        ShiftLeft: { key: 'Shift' },
        ShiftRight: { key: 'Shift' },
        ControlLeft: { key: 'Control' },
        ControlRight: { key: 'Control' },
        AltLeft: { key: 'Alt' },
        AltRight: { key: 'Alt' },
        MetaLeft: { key: 'Meta' },
        MetaRight: { key: 'Meta' },
        NumpadEnter: { key: 'Enter' },
        Space: { key: ' ' },
        Digit0: { key: '0', shiftKey: ')' },
        Digit1: { key: '1', shiftKey: '!' },
        Digit2: { key: '2', shiftKey: '@' },
        Digit3: { key: '3', shiftKey: '#' },
        Digit4: { key: '4', shiftKey: '$' },
        Digit5: { key: '5', shiftKey: '%' },
        Digit6: { key: '6', shiftKey: '^' },
        Digit7: { key: '7', shiftKey: '&' },
        Digit8: { key: '8', shiftKey: '*' },
        Digit9: { key: '9', shiftKey: '(' },
        KeyA: { key: 'a', shiftKey: 'A' },
        KeyB: { key: 'b', shiftKey: 'B' },
        KeyC: { key: 'c', shiftKey: 'C' },
        KeyD: { key: 'd', shiftKey: 'D' },
        KeyE: { key: 'e', shiftKey: 'E' },
        KeyF: { key: 'f', shiftKey: 'F' },
        KeyG: { key: 'g', shiftKey: 'G' },
        KeyH: { key: 'h', shiftKey: 'H' },
        KeyI: { key: 'i', shiftKey: 'I' },
        KeyJ: { key: 'j', shiftKey: 'J' },
        KeyK: { key: 'k', shiftKey: 'K' },
        KeyL: { key: 'l', shiftKey: 'L' },
        KeyM: { key: 'm', shiftKey: 'M' },
        KeyN: { key: 'n', shiftKey: 'N' },
        KeyO: { key: 'o', shiftKey: 'O' },
        KeyP: { key: 'p', shiftKey: 'P' },
        KeyQ: { key: 'q', shiftKey: 'Q' },
        KeyR: { key: 'r', shiftKey: 'R' },
        KeyS: { key: 's', shiftKey: 'S' },
        KeyT: { key: 't', shiftKey: 'T' },
        KeyU: { key: 'u', shiftKey: 'U' },
        KeyV: { key: 'v', shiftKey: 'V' },
        KeyW: { key: 'w', shiftKey: 'W' },
        KeyX: { key: 'x', shiftKey: 'X' },
        KeyY: { key: 'y', shiftKey: 'Y' },
        KeyZ: { key: 'z', shiftKey: 'Z' },
        Numpad0: { key: '0' },
        Numpad1: { key: '1' },
        Numpad2: { key: '2' },
        Numpad3: { key: '3' },
        Numpad4: { key: '4' },
        Numpad5: { key: '5' },
        Numpad6: { key: '6' },
        Numpad7: { key: '7' },
        Numpad8: { key: '8' },
        Numpad9: { key: '9' },
        NumpadMultiply: { key: '*' },
        NumpadAdd: { key: '+' },
        NumpadComma: { key: ',' },
        NumpadSubtract: { key: '-' },
        NumpadDecimal: { key: '.' },
        NumpadDivide: { key: '/' },
        Semicolon: { key: ';', shiftKey: ':' },
        Equal: { key: '=', shiftKey: '+' },
        Comma: { key: ',', shiftKey: '<' },
        Minus: { key: '-', shiftKey: '_' },
        Period: { key: '.', shiftKey: '>' },
        Slash: { key: '/', shiftKey: '?' },
        Backquote: { key: '`', shiftKey: '~' },
        BracketLeft: { key: '[', shiftKey: '{' },
        Backslash: { key: '\\', shiftKey: '|' },
        BracketRight: { key: ']', shiftKey: '}' },
        Quote: { key: '\'', shiftKey: '"' },
        IntlBackslash: { key: '\\', shiftKey: '|' }
    };
    mergeIf(codeToKeyTable, 'mac', {
        MetaLeft: { key: 'Meta' },
        MetaRight: { key: 'Meta' }
    });
    var keyFixTable = {
        Esc: 'Escape',
        Nonconvert: 'NonConvert',
        Left: 'ArrowLeft',
        Up: 'ArrowUp',
        Right: 'ArrowRight',
        Down: 'ArrowDown',
        Del: 'Delete',
        Menu: 'ContextMenu',
        MediaNextTrack: 'MediaTrackNext',
        MediaPreviousTrack: 'MediaTrackPrevious',
        SelectMedia: 'MediaSelect',
        HalfWidth: 'Hankaku',
        FullWidth: 'Zenkaku',
        RomanCharacters: 'Romaji',
        Crsel: 'CrSel',
        Exsel: 'ExSel',
        Zoom: 'ZoomToggle'
    };
    var codeTable = remap(keyCodeToInfoTable, 'code');
    try {
        var nativeLocation = nativeKeyboardEvent && ('location' in new KeyboardEvent(''));
    }
    catch (_) { }
    function keyInfoForEvent(event) {
        var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;
        var keyInfo = (function () {
            if (nativeLocation || 'keyLocation' in event) {
                var location = nativeLocation ? event.location : event.keyLocation;
                if (location && keyCode in locationTable[location]) {
                    return locationTable[location][keyCode];
                }
            }
            if ('keyIdentifier' in event && event.keyIdentifier in keyIdentifierTable) {
                return keyIdentifierTable[event.keyIdentifier];
            }
            if (keyCode in keyCodeToInfoTable) {
                return keyCodeToInfoTable[keyCode];
            }
            return null;
        }());
        if (0) {
            switch (event.keyIdentifier) {
                case 'U+0010':
                    keyInfo = { code: 'Function' };
                    break;
                case 'U+001C':
                    keyInfo = { code: 'ArrowLeft' };
                    break;
                case 'U+001D':
                    keyInfo = { code: 'ArrowRight' };
                    break;
                case 'U+001E':
                    keyInfo = { code: 'ArrowUp' };
                    break;
                case 'U+001F':
                    keyInfo = { code: 'ArrowDown' };
                    break;
            }
        }
        if (!keyInfo)
            return null;
        var key = (function () {
            var entry = codeToKeyTable[keyInfo.code];
            if (!entry)
                return keyInfo.code;
            return (event.shiftKey && 'shiftKey' in entry) ? entry.shiftKey : entry.key;
        }());
        return {
            code: keyInfo.code,
            key: key,
            location: keyInfo.location,
            keyCap: keyInfo.keyCap
        };
    }
    function queryKeyCap(code, locale) {
        code = String(code);
        if (!codeTable.hasOwnProperty(code))
            return 'Undefined';
        if (locale && String(locale).toLowerCase() !== 'en-us')
            throw Error('Unsupported locale');
        var keyInfo = codeTable[code];
        return keyInfo.keyCap || keyInfo.code || 'Undefined';
    }
    if ('KeyboardEvent' in global && 'defineProperty' in Object) {
        (function () {
            function define(o, p, v) {
                if (p in o)
                    return;
                Object.defineProperty(o, p, v);
            }
            define(KeyboardEvent.prototype, 'code', { get: function () {
                    var keyInfo = keyInfoForEvent(this);
                    return keyInfo ? keyInfo.code : '';
                } });
            if ('key' in KeyboardEvent.prototype) {
                var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
                Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function () {
                        var key = desc.get.call(this);
                        return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
                    } });
            }
            define(KeyboardEvent.prototype, 'key', { get: function () {
                    var keyInfo = keyInfoForEvent(this);
                    return (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
                } });
            define(KeyboardEvent.prototype, 'location', { get: function () {
                    var keyInfo = keyInfoForEvent(this);
                    return (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
                } });
            define(KeyboardEvent.prototype, 'locale', { get: function () {
                    return '';
                } });
        }());
    }
    if (!('queryKeyCap' in global.KeyboardEvent))
        global.KeyboardEvent.queryKeyCap = queryKeyCap;
    global.identifyKey = function (event) {
        if ('code' in event)
            return;
        var keyInfo = keyInfoForEvent(event);
        event.code = keyInfo ? keyInfo.code : '';
        event.key = (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
        event.location = ('location' in event) ? event.location :
            ('keyLocation' in event) ? event.keyLocation :
                (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
        event.locale = '';
    };
}(self));
var BoardModes = {
    SELECT: 'SELECT',
    ERASE: 'ERASE'
};
var WorkerMessageTypes;
(function (WorkerMessageTypes) {
    WorkerMessageTypes[WorkerMessageTypes["START"] = 0] = "START";
    WorkerMessageTypes[WorkerMessageTypes["SETSOCKET"] = 1] = "SETSOCKET";
    WorkerMessageTypes[WorkerMessageTypes["UPDATEVIEW"] = 2] = "UPDATEVIEW";
    WorkerMessageTypes[WorkerMessageTypes["SETVBOX"] = 3] = "SETVBOX";
    WorkerMessageTypes[WorkerMessageTypes["AUDIOSTREAM"] = 4] = "AUDIOSTREAM";
    WorkerMessageTypes[WorkerMessageTypes["VIDEOSTREAM"] = 5] = "VIDEOSTREAM";
    WorkerMessageTypes[WorkerMessageTypes["NEWVIEWCENTRE"] = 6] = "NEWVIEWCENTRE";
    WorkerMessageTypes[WorkerMessageTypes["NEWELEMENT"] = 7] = "NEWELEMENT";
    WorkerMessageTypes[WorkerMessageTypes["ELEMENTVIEW"] = 8] = "ELEMENTVIEW";
    WorkerMessageTypes[WorkerMessageTypes["ELEMENTDELETE"] = 9] = "ELEMENTDELETE";
    WorkerMessageTypes[WorkerMessageTypes["NEWALERT"] = 10] = "NEWALERT";
    WorkerMessageTypes[WorkerMessageTypes["REMOVEALERT"] = 11] = "REMOVEALERT";
    WorkerMessageTypes[WorkerMessageTypes["NEWINFO"] = 12] = "NEWINFO";
    WorkerMessageTypes[WorkerMessageTypes["REMOVEINFO"] = 13] = "REMOVEINFO";
})(WorkerMessageTypes || (WorkerMessageTypes = {}));
var BoardElement = (function () {
    function BoardElement(type, id, x, y, width, height, callbacks, serverId, updateTime) {
        this.id = id;
        this.type = type;
        this.sendServerMsg = callbacks.sendServerMsg;
        this.createAlert = callbacks.createAlert;
        this.createInfo = callbacks.createInfo;
        this.updateBoardView = callbacks.updateBoardView;
        this.getAudioStream = callbacks.getAudioStream;
        this.getVideoStream = callbacks.getVideoStream;
        this.serverId = serverId;
        this.opBuffer = [];
        this.infoElement = -1;
        this.isEditing = false;
        this.isSelected = false;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (updateTime) {
            this.updateTime = updateTime;
        }
        else {
            this.updateTime = new Date();
        }
    }
    BoardElement.prototype.updateView = function (updatedParams) {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    };
    BoardElement.prototype.getCurrentViewState = function () {
        return this.currentViewState;
    };
    BoardElement.prototype.remoteEdit = function () {
        this.operationPos = 0;
        this.operationStack = [];
    };
    BoardElement.prototype.getDefaultInputReturn = function () {
        var retVal = {
            newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: this.isSelected,
            newViewCentre: null, infoMessage: null, alertMessage: null
        };
        return retVal;
    };
    BoardElement.prototype.checkForServerId = function (messages) {
        if (!this.serverId) {
            for (var i_1 = 0; i_1 < messages.length; i_1++) {
                console.log('No serverId, adding message to buffer.');
                this.opBuffer.push(messages[i_1]);
            }
            return [];
        }
        else {
            return messages;
        }
    };
    BoardElement.prototype.handleUndo = function () {
        var retVal = null;
        if (this.operationPos > 0) {
            retVal = this.operationStack[--this.operationPos].undo();
        }
        return retVal;
    };
    BoardElement.prototype.handleRedo = function () {
        var retVal = null;
        if (this.operationPos < this.operationStack.length) {
            retVal = this.operationStack[this.operationPos++].redo();
        }
        return retVal;
    };
    return BoardElement;
}());
var BoardPallete = (function () {
    function BoardPallete() {
    }
    BoardPallete.prototype.updateView = function (updatedParams) {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    };
    return BoardPallete;
}());
var components = Immutable.Map();
var registerComponent = function (componentName, Element, ElementView, Pallete, PalleteView, ModeView, DrawHandle) {
    var pallete = null;
    if (Pallete) {
        pallete = new Pallete();
    }
    var newComp = {
        componentName: componentName, Element: Element, ElementView: ElementView, pallete: pallete, PalleteView: PalleteView,
        ModeView: ModeView, DrawHandle: DrawHandle
    };
    components = components.set(componentName, newComp);
};
var WhiteBoardController = (function () {
    function WhiteBoardController(isHost, userId) {
        var _this = this;
        this.isHost = false;
        this.userId = 0;
        this.socket = null;
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.touchPress = false;
        this.moving = false;
        this.scaleF = 1;
        this.panX = 0;
        this.panY = 0;
        this.scaleNum = 0;
        this.pointList = [];
        this.isPoint = true;
        this.prevX = 0;
        this.prevY = 0;
        this.groupStartX = 0;
        this.groupStartY = 0;
        this.mouseDownHandled = false;
        this.touchStartHandled = false;
        this.currentHover = -1;
        this.blockAlert = false;
        this.selectDrag = false;
        this.currSelect = [];
        this.groupMoving = false;
        this.groupMoved = false;
        this.operationStack = [];
        this.operationPos = 0;
        this.fileUploads = [];
        this.fileReaders = [];
        this.elementDict = [];
        this.boardElems = [];
        this.infoElems = [];
        this.textOutBuffer = [];
        this.textInBuffer = [];
        this.setView = function (view) {
            var whitElem = document.getElementById('whiteBoard-input');
            var whitCont = document.getElementById('whiteboard-container');
            whitElem.style.width = whitCont.clientWidth + 'px';
            whitElem.style.height = whitCont.clientHeight + 'px';
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            window.addEventListener('resize', _this.windowResize);
            window.addEventListener('beforeunload', _this.windowUnload);
            document.addEventListener('keypress', _this.keyPress);
            document.addEventListener('keydown', _this.keyDown);
            var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;
            _this.viewState.viewBox = newVBox;
            _this.viewState.viewWidth = whitElem.width;
            _this.viewState.viewHeight = whitElem.height;
            _this.viewState.viewScale = 1;
            _this.view = view;
            view.setState(_this.viewState);
        };
        this.updateView = function (viewState) {
            _this.viewState = viewState;
            _this.view.storeUpdate(_this.viewState);
        };
        this.setElementView = function (id, newView) {
            if (newView == null) {
                console.log("Issue tracked here.");
            }
            var newElemList = _this.viewState.boardElements.set(id, newView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.getAudioStream = function () {
            return null;
        };
        this.getVideoStream = function () {
            return null;
        };
        this.newAlert = function (type, message) {
            var newMsg = { type: type, message: message };
            var newElemList = _this.viewState.alertElements.push(newMsg);
            _this.updateView(Object.assign({}, _this.viewState, { alertElements: newElemList }));
        };
        this.removeAlert = function () {
            var newElemList = _this.viewState.alertElements.shift();
            _this.updateView(Object.assign({}, _this.viewState, { alertElements: newElemList }));
        };
        this.deleteElement = function (id) {
            var newElemList = _this.viewState.boardElements.filter(function (element) { return element.id !== id; });
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setMode = function (newMode) {
            var palleteView = {};
            var cursor = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };
            if (newMode != BoardModes.SELECT && newMode != BoardModes.ERASE) {
                palleteView = components.get(newMode).pallete.getCurrentViewState();
                cursor = components.get(newMode).pallete.getCursor();
            }
            _this.cursor = cursor.cursor;
            _this.cursorURL = cursor.url;
            _this.cursorOffset = cursor.offset;
            _this.updateView(Object.assign({}, _this.viewState, {
                mode: newMode, palleteState: palleteView, cursor: _this.cursor, cursorURL: _this.cursorURL, cursorOffset: _this.cursorOffset
            }));
        };
        this.sendMessage = function (id, type, message) {
            var serverId = _this.getBoardElement(id).serverId;
            var msg = { id: serverId, type: type, payload: message };
            console.log('Sending message: ' + JSON.stringify(msg));
            _this.socket.emit('MSG-COMPONENT', msg);
        };
        this.selectGroup = function (ids) {
            for (var i_2 = 0; i_2 < _this.currSelect.length; i_2++) {
                var elem = _this.getBoardElement(_this.currSelect[i_2]);
                if (elem.isDeleted) {
                    console.log('Deselect is probably the issue.');
                }
                var newView = elem.handleDeselect();
                _this.setElementView(elem.id, newView);
            }
            for (var i_3 = 0; i_3 < ids.length; i_3++) {
                var elem = _this.getBoardElement(ids[i_3]);
                if (!elem.isDeleted) {
                    var newView = elem.handleSelect();
                    _this.currSelect.push(elem.id);
                    _this.setElementView(elem.id, newView);
                }
            }
        };
        this.handleElementOperation = function (id, undoOp, redoOp) {
            if (undoOp && redoOp) {
                _this.newOperation(id, undoOp, redoOp);
            }
            else if (undoOp || redoOp) {
                console.error('Element provided either undo or redo operation. It must specify neither or both.');
            }
        };
        this.handleElementMessages = function (id, type, messages) {
            for (var i_4 = 0; i_4 < messages.length; i_4++) {
                _this.sendMessage(id, type, messages[i_4]);
            }
        };
        this.handleMouseElementSelect = function (e, elem, isSelected, cursor) {
            if (isSelected) {
                var alreadySelected = false;
                for (var i_5 = 0; i_5 < _this.currSelect.length; i_5++) {
                    if (_this.currSelect[i_5] == elem.id) {
                        alreadySelected = true;
                    }
                }
                if (!alreadySelected) {
                    if (e.ctrlKey) {
                        _this.currSelect.push(elem.id);
                    }
                    else {
                        for (var i_6 = 0; i_6 < _this.currSelect.length; i_6++) {
                            if (_this.currSelect[i_6] != elem.id) {
                                var selElem = _this.getBoardElement(_this.currSelect[i_6]);
                                var selElemView = selElem.handleDeselect();
                                _this.setElementView(selElem.id, selElemView);
                            }
                        }
                        _this.currSelect = [];
                        _this.currSelect.push(elem.id);
                    }
                }
                if (_this.currSelect.length == 1 && cursor) {
                    if (_this.cursor != cursor.cursor || _this.cursorURL != cursor.url) {
                        _this.cursor = cursor.cursor;
                        _this.cursorURL = cursor.url;
                        _this.cursorOffset = cursor.offset;
                        _this.updateView(Object.assign({}, _this.viewState, { cursor: _this.cursor, cursorURL: _this.cursorURL, cursorOffset: _this.cursorOffset }));
                    }
                }
            }
            else {
                if (_this.currSelect.length == 1 && _this.currSelect[0] == elem.id) {
                    _this.cursor = 'auto';
                    _this.cursorURL = [];
                    _this.cursorOffset = { x: 0, y: 0 };
                    _this.updateView(Object.assign({}, _this.viewState, { cursor: _this.cursor, cursorURL: _this.cursorURL, cursorOffset: _this.cursorOffset }));
                    _this.currSelect = [];
                }
                else {
                    for (var i_7 = 0; i_7 < _this.currSelect.length; i_7++) {
                        if (_this.currSelect[i_7] == elem.id) {
                            _this.currSelect.splice(i_7, 1);
                        }
                    }
                }
            }
        };
        this.handleTouchElementSelect = function (e, elem, isSelected, cursor) {
            if (isSelected) {
                if (e.ctrlKey) {
                    var alreadySelected = false;
                    for (var i_8 = 0; i_8 < _this.currSelect.length; i_8++) {
                        if (_this.currSelect[i_8] == elem.id) {
                            alreadySelected = true;
                        }
                    }
                    if (!alreadySelected) {
                        _this.currSelect.push(elem.id);
                    }
                }
                else {
                    for (var i_9 = 0; i_9 < _this.currSelect.length; i_9++) {
                        if (_this.currSelect[i_9] != elem.id) {
                            var selElem = _this.getBoardElement(_this.currSelect[i_9]);
                            var selElemView = selElem.handleDeselect();
                            _this.setElementView(selElem.id, selElemView);
                        }
                    }
                    _this.currSelect = [];
                    _this.currSelect.push(elem.id);
                }
                if (_this.currSelect.length == 1 && cursor) {
                    _this.cursor = cursor.cursor;
                    _this.cursorURL = cursor.url;
                    _this.cursorOffset = cursor.offset;
                    _this.updateView(Object.assign({}, _this.viewState, { cursor: _this.cursor, cursorURL: _this.cursorURL, cursorOffset: _this.cursorOffset }));
                }
            }
            else {
                for (var i_10 = 0; i_10 < _this.currSelect.length; i_10++) {
                    if (_this.currSelect[i_10] == elem.id) {
                        _this.currSelect.splice(i_10, 1);
                    }
                }
            }
        };
        this.handleElementPalleteChanges = function (elem, changes) {
            for (var j_1 = 0; j_1 < changes.length; j_1++) {
                var change_1 = changes[j_1];
                components.get(elem.type).pallete.handleChange(change_1);
                for (var i_11 = 0; i_11 < _this.currSelect.length; i_11++) {
                    var selElem = _this.getBoardElement(_this.currSelect[i_11]);
                    if (selElem.id != elem.id && selElem.type == elem.type) {
                        var retVal = selElem.handlePalleteChange(change_1);
                        _this.handleElementMessages(selElem.id, selElem.type, retVal.serverMessages);
                        _this.handleElementOperation(selElem.id, retVal.undoOp, retVal.redoOp);
                        _this.setElementView(selElem.id, retVal.newView);
                    }
                }
            }
        };
        this.handleElementNewViewCentre = function (x, y) {
            var whitElem = document.getElementById('whiteBoard-input');
            var whitCont = document.getElementById('whiteboard-container');
            var clientWidth = whitCont.clientWidth;
            var clientHeight = whitCont.clientHeight;
            var xChange = x - (_this.panX + clientWidth * _this.scaleF * 0.5);
            var yChange = y - (_this.panY + clientHeight * _this.scaleF * 0.5);
            var newPanX = _this.panX + xChange;
            var newPanY = _this.panY + yChange;
            if (newPanX < 0) {
                newPanX = 0;
            }
            if (newPanY < 0) {
                newPanY = 0;
            }
            _this.setViewBox(newPanX, newPanY, _this.scaleF);
        };
        this.handleRemoteEdit = function (id) {
            for (var i_12 = 0; i_12 < _this.operationStack.length; i_12++) {
                if (_this.operationStack[i_12].ids.indexOf(id) != -1) {
                    var newOp = {
                        ids: _this.operationStack[i_12].ids,
                        undos: [(function (elemIds) {
                                return function () { _this.selectGroup(elemIds); return null; };
                            })(_this.operationStack[i_12].ids)],
                        redos: [(function (elemIds) {
                                return function () { _this.selectGroup(elemIds); return null; };
                            })(_this.operationStack[i_12].ids)]
                    };
                    _this.operationStack.splice(i_12, 1, newOp);
                }
            }
        };
        this.handleInfoMessage = function (data) {
        };
        this.handleAlertMessage = function (msg) {
            if (msg) {
                _this.newAlert(msg.header, msg.message);
            }
        };
        this.startMove = function (startX, startY) {
            _this.groupStartX = startX;
            _this.groupStartY = startY;
            _this.groupMoving = true;
            _this.cursor = 'move';
            _this.updateView(Object.assign({}, _this.viewState, { cursor: _this.cursor }));
            for (var i_13 = 0; i_13 < _this.currSelect.length; i_13++) {
                var elem = _this.getBoardElement(_this.currSelect[i_13]);
                var retVal = elem.startMove();
            }
        };
        this.moveGroup = function (x, y, editTime) {
            for (var i_14 = 0; i_14 < _this.currSelect.length; i_14++) {
                var elem = _this.getBoardElement(_this.currSelect[i_14]);
                var elemView = elem.handleMove(x, y);
                _this.setElementView(elem.id, elemView);
            }
        };
        this.endMove = function (endX, endY) {
            _this.groupMoving = false;
            _this.cursor = 'auto';
            _this.updateView(Object.assign({}, _this.viewState, { cursor: _this.cursor }));
            var undoOpList = [];
            var redoOpList = [];
            for (var i_15 = 0; i_15 < _this.currSelect.length; i_15++) {
                var elem = _this.getBoardElement(_this.currSelect[i_15]);
                var retVal = elem.endMove();
                var undoOp = (function (element, changeX, changeY) {
                    return function () {
                        element.handleMove(-changeX, -changeY);
                        var ret = element.endMove();
                        _this.handleElementMessages(element.id, element.type, ret.serverMessages);
                        _this.setElementView(element.id, ret.newView);
                    };
                })(elem, endX - _this.groupStartX, endY - _this.groupStartY);
                var redoOp = (function (element, changeX, changeY) {
                    return function () {
                        element.handleMove(changeX, changeY);
                        var ret = element.endMove();
                        _this.handleElementMessages(element.id, element.type, ret.serverMessages);
                        _this.setElementView(element.id, ret.newView);
                    };
                })(elem, endX - _this.groupStartX, endY - _this.groupStartY);
                _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                _this.setElementView(elem.id, retVal.newView);
                undoOpList.push(undoOp);
                redoOpList.push(redoOp);
            }
            _this.operationStack.splice(_this.operationPos, _this.operationStack.length - _this.operationPos);
            var newOp = { ids: _this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
            _this.operationStack[_this.operationPos++] = newOp;
        };
        this.selectElement = function (id) {
            var elem = _this.getBoardElement(id);
            if (!elem.isDeleted) {
                var newElemView = elem.handleSelect();
                _this.setElementView(id, newElemView);
            }
        };
        this.deselectElement = function (id) {
            var elem = _this.getBoardElement(id);
            var newElemView = elem.handleDeselect();
            _this.setElementView(elem.id, newElemView);
        };
        this.addInfoMessage = function (x, y, width, height, header, message) {
            var newInfo = {
                id: -1, x: x, y: y, width: width, height: height, header: header, message: message
            };
            var localId = _this.infoElems.length;
            _this.infoElems[localId] = newInfo;
            newInfo.id = localId;
            var newInfoView = {
                x: x, y: y, width: width, height: height, header: header, message: message
            };
            var newInfoList = _this.viewState.infoElements.push(newInfoView);
            _this.updateView(Object.assign({}, _this.viewState, { infoElements: newInfoList }));
            return localId;
        };
        this.removeInfoMessage = function (id) {
            var newInfoList = _this.viewState.infoElements.delete(id);
            _this.updateView(Object.assign({}, _this.viewState, { infoElements: newInfoList }));
        };
        this.setViewBox = function (panX, panY, scaleF) {
            var whitElem = document.getElementById("whiteBoard-input");
            var vBoxW = whitElem.clientWidth * scaleF;
            var vBoxH = whitElem.clientHeight * scaleF;
            _this.scaleF = scaleF;
            _this.panX = panX;
            _this.panY = panY;
            var newVBox = '' + panX + ' ' + panY + ' ' + vBoxW + ' ' + vBoxH;
            _this.updateView(Object.assign({}, _this.viewState, {
                viewBox: newVBox, viewX: panX, viewY: panY, viewWidth: vBoxW, viewHeight: vBoxH, viewScale: scaleF
            }));
        };
        this.getBoardElement = function (id) {
            if (_this.boardElems[id]) {
                return _this.boardElems[id];
            }
            else {
                throw 'Element does not exist';
            }
        };
        this.getInfoMessage = function (id) {
            return _this.infoElems[id];
        };
        this.undo = function () {
            console.log('Undo, stack length. ' + _this.operationStack.length);
            if (_this.operationPos > 0) {
                var operation = _this.operationStack[--_this.operationPos];
                for (var i_16 = 0; i_16 < operation.undos.length; i_16++) {
                    var retVal = operation.undos[i_16]();
                    if (retVal) {
                        var elem = _this.getBoardElement(retVal.id);
                        _this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                        _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        _this.setElementView(retVal.id, retVal.newView);
                        if (retVal.newViewCentre) {
                            _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        if (retVal.wasDelete) {
                            _this.deleteElement(elem.id);
                        }
                    }
                }
            }
        };
        this.redo = function () {
            if (_this.operationPos < _this.operationStack.length) {
                var operation = _this.operationStack[_this.operationPos++];
                for (var i_17 = 0; i_17 < operation.redos.length; i_17++) {
                    var retVal = operation.redos[i_17]();
                    if (retVal) {
                        var elem = _this.getBoardElement(retVal.id);
                        _this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                        _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        _this.setElementView(retVal.id, retVal.newView);
                        if (retVal.newViewCentre) {
                            _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        if (retVal.wasDelete) {
                            _this.deleteElement(elem.id);
                        }
                    }
                }
            }
        };
        this.newOperation = function (itemId, undoOp, redoOp) {
            _this.operationStack.splice(_this.operationPos, _this.operationStack.length - _this.operationPos);
            var newOp = { ids: [itemId], undos: [undoOp], redos: [redoOp] };
            _this.operationStack[_this.operationPos++] = newOp;
        };
        this.undoItemEdit = function (id) {
            var elem = _this.getBoardElement(id);
            if (!elem.isDeleted && elem.operationPos > 0) {
                elem.operationStack[--elem.operationPos].undo();
            }
        };
        this.redoItemEdit = function (id) {
            var elem = _this.getBoardElement(id);
            if (!elem.isDeleted && elem.operationPos < elem.operationStack.length) {
                elem.operationStack[elem.operationPos++].redo();
            }
        };
        this.addHoverInfo = function (id) {
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY = elemRect.top - document.body.scrollTop;
            var offsetX = elemRect.left - document.body.scrollLeft;
            var elem = _this.getBoardElement(id);
            var infoId = _this.addInfoMessage(_this.prevX - offsetX + 20, _this.prevY - offsetY, 200, 200, 'Test Message', 'User ID: ' + elem.user);
            elem.infoElement = infoId;
        };
        this.removeHoverInfo = function (id) {
            var elem = _this.getBoardElement(id);
            elem.infoElement = -1;
            _this.currentHover = -1;
            _this.removeInfoMessage(elem.infoElement);
        };
        this.infoMessageTimeout = function (id, self) {
            if (_this.lMousePress || _this.rMousePress || _this.wMousePress) {
                var elem = _this.getBoardElement(id);
                clearTimeout(elem.hoverTimer);
                elem.hoverTimer = setTimeout(_this.infoMessageTimeout, 2000, id);
            }
            else {
                _this.addHoverInfo(id);
            }
        };
        this.compareUpdateTime = function (elem1, elem2) {
            if (elem1.updateTime.getTime() > elem2.updateTime.getTime()) {
                return 1;
            }
            else if (elem1.updateTime.getTime() < elem2.updateTime.getTime()) {
                return -1;
            }
            else {
                return 0;
            }
        };
        this.sendNewElement = function (msg) {
            _this.socket.emit('NEW-ELEMENT', msg);
        };
        this.setSocket = function (socket) {
            var self = _this;
            _this.socket = socket;
            _this.socket.on('JOIN', function (data) {
            });
            _this.socket.on('NEW-ELEMENT', function (data) {
                if (self.elementDict[data.serverId] == undefined || self.elementDict[data.serverId] == null) {
                    var localId = self.boardElems.length;
                    var callbacks = {
                        sendServerMsg: (function (id, type) { return function (msg) { self.sendMessage(id, type, msg); }; })(localId, data.type),
                        createAlert: function (header, message) { },
                        createInfo: function (x, y, width, height, header, message) { return self.addInfoMessage(x, y, width, height, header, message); },
                        removeInfo: function (id) { self.removeInfoMessage(id); },
                        updateBoardView: (function (id) { return function (newView) { self.setElementView(id, newView); }; })(localId),
                        getAudioStream: function () { return self.getAudioStream(); },
                        getVideoStream: function () { return self.getVideoStream(); }
                    };
                    var creationArg = { id: localId, userId: data.userId, callbacks: callbacks, serverMsg: data.payload, serverId: data.serverId };
                    self.boardElems[localId] = components.get(data.type).Element.createElement(creationArg);
                    self.elementDict[data.serverId] = localId;
                    self.setElementView(self.boardElems[localId].id, self.boardElems[localId].getCurrentViewState());
                }
            });
            _this.socket.on('ELEMENT-ID', function (data) {
                self.elementDict[data.serverId] = data.localId;
                var elem = self.boardElems[data.localId];
                var retVal = elem.setServerId(data.serverId);
                self.handleElementMessages(elem.id, elem.type, retVal);
            });
            _this.socket.on('MSG-COMPONENT', function (data) {
                if (self.elementDict[data.serverId] != undefined && self.elementDict[data.serverId] != null) {
                    var elem = self.getBoardElement(self.elementDict[data.serverId]);
                    if (elem.type == data.type) {
                        var retVal = elem.handleServerMessage(data.payload);
                        if (retVal.wasEdit) {
                            self.handleRemoteEdit(elem.id);
                        }
                        self.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        self.setElementView(elem.id, retVal.newView);
                        self.handleInfoMessage(retVal.infoMessage);
                        self.handleAlertMessage(retVal.alertMessage);
                        if (retVal.wasDelete) {
                            self.deleteElement(elem.id);
                            if (self.currSelect.indexOf(elem.id)) {
                                self.currSelect.splice(self.currSelect.indexOf(elem.id), 1);
                            }
                            if (self.currentHover == elem.id) {
                                clearTimeout(elem.hoverTimer);
                                self.removeHoverInfo(self.currentHover);
                            }
                            for (var i_18 = 0; i_18 < self.operationStack.length; i_18++) {
                                if (self.operationStack[i_18].ids.indexOf(elem.id) != -1) {
                                    console.log('Element in this set.');
                                    if (self.operationStack[i_18].ids.length == 1) {
                                        if (i_18 <= self.operationPos) {
                                            self.operationPos--;
                                        }
                                        self.operationStack.splice(i_18--, 1);
                                    }
                                    else {
                                        console.log('This should work.');
                                        self.operationStack[i_18].ids.splice(self.operationStack[i_18].ids.indexOf(elem.id), 1);
                                        var newOp = {
                                            ids: self.operationStack[i_18].ids,
                                            undos: [(function (elemIds) {
                                                    return function () { self.selectGroup(elemIds); return null; };
                                                })(self.operationStack[i_18].ids.slice())],
                                            redos: [(function (elemIds) {
                                                    return function () { self.selectGroup(elemIds); return null; };
                                                })(self.operationStack[i_18].ids.slice())]
                                        };
                                        self.operationStack.splice(i_18, 1, newOp);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        console.error('Received bad element message.');
                    }
                }
                else if (data.type && data.serverId) {
                    var msg = { type: data.type, id: data.serverId };
                    console.log('Unknown element. ID: ' + data.serverId);
                    self.socket.emit('UNKNOWN-ELEMENT', msg);
                }
            });
            _this.socket.on('ERROR', function (message) {
                console.log('SERVER: ' + message);
                self.newAlert('SERVER ERROR', 'A server error has occured, some data in this session may be lost.');
            });
        };
        this.modeChange = function (newMode) {
            var whitElem = document.getElementById("whiteBoard-input");
            var context = whitElem.getContext('2d');
            context.clearRect(0, 0, whitElem.width, whitElem.height);
            for (var i_19 = 0; i_19 < _this.currSelect.length; i_19++) {
                var elem = _this.getBoardElement(_this.currSelect[i_19]);
                var retVal = elem.handleDeselect();
                _this.setElementView(elem.id, retVal);
            }
            _this.currSelect = [];
            _this.setMode(newMode);
        };
        this.changeEraseSize = function (newSize) {
            var newView = Object.assign({}, _this.viewState, { eraseSize: newSize });
            _this.updateView(newView);
        };
        this.elementMouseOver = function (id, e) {
            var elem = _this.getBoardElement(id);
            if (_this.currentHover == -1) {
                _this.currentHover = id;
                elem.hoverTimer = setTimeout(_this.infoMessageTimeout, 2000, id);
            }
            else {
                var prevElem = _this.getBoardElement(_this.currentHover);
                clearTimeout(prevElem.hoverTimer);
            }
        };
        this.elementMouseOut = function (id, e) {
            var elem = _this.getBoardElement(id);
            if (_this.currentHover == id) {
                clearTimeout(elem.hoverTimer);
                _this.removeHoverInfo(_this.currentHover);
            }
        };
        this.elementMouseDown = function (id, e, componenet, subId) {
            e.preventDefault();
            var elem = _this.getBoardElement(id);
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY = elemRect.top - document.body.scrollTop;
            var offsetX = elemRect.left - document.body.scrollLeft;
            var xPos = (e.clientX - offsetX) * _this.scaleF + _this.panX;
            var yPos = (e.clientY - offsetY) * _this.scaleF + _this.panY;
            if (_this.currentHover == id) {
                clearTimeout(elem.hoverTimer);
                _this.removeHoverInfo(_this.currentHover);
            }
            if (_this.viewState.mode == BoardModes.SELECT) {
                if (_this.currSelect.length > 1 && elem.isSelected) {
                    _this.startMove(xPos, yPos);
                }
                else {
                    var retVal = elem.handleMouseDown(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);
                    _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                    _this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                    _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    _this.handleInfoMessage(retVal.infoMessage);
                    _this.handleAlertMessage(retVal.alertMessage);
                    _this.setElementView(id, retVal.newView);
                }
                _this.mouseDownHandled = true;
            }
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
        };
        this.elementMouseMove = function (id, e, componenet, subId) {
            var elem = _this.getBoardElement(id);
            if (_this.viewState.mode == BoardModes.ERASE) {
                if (_this.lMousePress) {
                    if (_this.isHost || _this.userId == elem.user) {
                        var retVal = elem.handleErase();
                        _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                        _this.deleteElement(id);
                        if (_this.currentHover == id) {
                            clearTimeout(elem.hoverTimer);
                            _this.removeHoverInfo(_this.currentHover);
                        }
                    }
                }
            }
            else if (_this.viewState.mode == BoardModes.SELECT && !_this.groupMoving) {
                var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                var retVal = elem.handleMouseMove(e, changeX, changeY, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
            }
        };
        this.elementMouseUp = function (id, e, componenet, subId) {
            if (_this.viewState.mode == BoardModes.SELECT) {
                var elem = _this.getBoardElement(id);
                var whitElem_1 = document.getElementById("whiteBoard-input");
                var elemRect_1 = whitElem_1.getBoundingClientRect();
                var offsetY = elemRect_1.top - document.body.scrollTop;
                var offsetX = elemRect_1.left - document.body.scrollLeft;
                var xPos = (e.clientX - offsetX) * _this.scaleF + _this.panX;
                var yPos = (e.clientY - offsetY) * _this.scaleF + _this.panY;
                var retVal = elem.handleMouseUp(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
            }
        };
        this.elementMouseClick = function (id, e, componenet, subId) {
            var elem = _this.getBoardElement(id);
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY = elemRect.top - document.body.scrollTop;
            var offsetX = elemRect.left - document.body.scrollLeft;
            var xPos = (e.clientX - offsetX) * _this.scaleF + _this.panX;
            var yPos = (e.clientY - offsetY) * _this.scaleF + _this.panY;
            if (_this.viewState.mode == BoardModes.ERASE) {
                if (_this.isHost || _this.userId == elem.user) {
                    var retVal = elem.handleErase();
                    _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    _this.deleteElement(id);
                    if (_this.currentHover == id) {
                        clearTimeout(elem.hoverTimer);
                        _this.removeHoverInfo(_this.currentHover);
                    }
                }
            }
            else if (_this.viewState.mode == BoardModes.SELECT && _this.currSelect.length < 2) {
                var retVal = elem.handleMouseClick(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
            }
        };
        this.elementMouseDoubleClick = function (id, e, componenet, subId) {
            if (_this.viewState.mode == BoardModes.SELECT) {
                var elem = _this.getBoardElement(id);
                var whitElem_2 = document.getElementById("whiteBoard-input");
                var elemRect_2 = whitElem_2.getBoundingClientRect();
                var offsetY = elemRect_2.top - document.body.scrollTop;
                var offsetX = elemRect_2.left - document.body.scrollLeft;
                var xPos = (e.clientX - offsetX) * _this.scaleF + _this.panX;
                var yPos = (e.clientY - offsetY) * _this.scaleF + _this.panY;
                var retVal = elem.handleDoubleClick(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
                e.stopPropagation();
            }
        };
        this.elementTouchStart = function (id, e, componenet, subId) {
            var elem = _this.getBoardElement(id);
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY = elemRect.top - document.body.scrollTop;
            var offsetX = elemRect.left - document.body.scrollLeft;
            var localTouches;
            for (var i_20 = 0; i_20 < e.touches.length; i_20++) {
                var touch = e.touches.item(i_20);
                var xPos = (touch.clientX - offsetX) * _this.scaleF + _this.panX;
                var yPos = (touch.clientY - offsetY) * _this.scaleF + _this.panY;
                localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
            }
            if (_this.currSelect.length > 1 && elem.isSelected) {
            }
            else {
                var retVal = elem.handleTouchStart(e, localTouches, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleTouchElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
                _this.touchStartHandled = true;
            }
            _this.prevTouch = e.touches;
        };
        this.elementTouchMove = function (id, e, componenet, subId) {
            var touchMoves;
            if (_this.viewState.mode == BoardModes.ERASE) {
                var elem = _this.getBoardElement(id);
                if (_this.isHost || _this.userId == elem.user) {
                    var retVal = elem.handleErase();
                    _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    _this.deleteElement(id);
                }
            }
            else if (_this.viewState.mode == BoardModes.SELECT && !_this.groupMoving) {
                for (var i_21 = 0; i_21 < e.touches.length; i_21++) {
                    var touch = e.touches.item(i_21);
                    for (var j_2 = 0; j_2 < _this.prevTouch.length; j_2++) {
                        if (_this.prevTouch[j_2].identifier == touch.identifier) {
                            var xChange = (touch.clientX - _this.prevTouch[j_2].clientX) * _this.scaleF;
                            var yChange = (touch.clientY - _this.prevTouch[j_2].clientY) * _this.scaleF;
                            var touchChange = { x: xChange, y: yChange, identifer: touch.identifier };
                            touchMoves.push(touchChange);
                        }
                    }
                }
                var retVal = elem.handleTouchMove(e, touchMoves, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleTouchElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
                _this.prevTouch = e.touches;
            }
        };
        this.elementTouchEnd = function (id, e, componenet, subId) {
            if (_this.viewState.mode == BoardModes.SELECT) {
                var elem = _this.getBoardElement(id);
                var whitElem_3 = document.getElementById("whiteBoard-input");
                var elemRect_3 = whitElem_3.getBoundingClientRect();
                var offsetY = elemRect_3.top - document.body.scrollTop;
                var offsetX = elemRect_3.left - document.body.scrollLeft;
                var localTouches = void 0;
                for (var i_22 = 0; i_22 < e.touches.length; i_22++) {
                    var touch = e.touches.item(i_22);
                    var xPos = (touch.clientX - offsetX) * _this.scaleF + _this.panX;
                    var yPos = (touch.clientY - offsetY) * _this.scaleF + _this.panY;
                    localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
                }
                var retVal = elem.handleTouchEnd(e, localTouches, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleTouchElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
            }
        };
        this.elementTouchCancel = function (id, e, componenet, subId) {
            if (_this.viewState.mode == BoardModes.SELECT) {
                var elem = _this.getBoardElement(id);
                var whitElem_4 = document.getElementById("whiteBoard-input");
                var elemRect_4 = whitElem_4.getBoundingClientRect();
                var offsetY = elemRect_4.top - document.body.scrollTop;
                var offsetX = elemRect_4.left - document.body.scrollLeft;
                var localTouches = void 0;
                for (var i_23 = 0; i_23 < e.touches.length; i_23++) {
                    var touch = e.touches.item(i_23);
                    var xPos = (touch.clientX - offsetX) * _this.scaleF + _this.panX;
                    var yPos = (touch.clientY - offsetY) * _this.scaleF + _this.panY;
                    localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
                }
                var retVal = elem.handleTouchCancel(e, localTouches, components.get(elem.type).pallete, componenet, subId);
                _this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                _this.handleElementMessages(id, elem.type, retVal.serverMessages);
                _this.handleTouchElementSelect(e, elem, retVal.isSelected);
                _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if (retVal.newViewCentre) {
                    _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                _this.handleInfoMessage(retVal.infoMessage);
                _this.handleAlertMessage(retVal.alertMessage);
                _this.setElementView(id, retVal.newView);
            }
        };
        this.elementDragOver = function (id, e, componenet, subId) {
            e.stopPropagation();
        };
        this.elementDrop = function (id, e, componenet, subId) {
            e.stopPropagation();
        };
        this.mouseDown = function (e) {
            e.preventDefault();
            if (!_this.lMousePress && !_this.wMousePress && !_this.rMousePress) {
                _this.lMousePress = e.buttons & 1 ? true : false;
                _this.rMousePress = e.buttons & 2 ? true : false;
                _this.wMousePress = e.buttons & 4 ? true : false;
                _this.isPoint = true;
                var whitElem_5 = document.getElementById("whiteBoard-input");
                var elemRect_5 = whitElem_5.getBoundingClientRect();
                var offsetY = elemRect_5.top - document.body.scrollTop;
                var offsetX = elemRect_5.left - document.body.scrollLeft;
                whitElem_5.width = whitElem_5.clientWidth;
                whitElem_5.height = whitElem_5.clientHeight;
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
                var newPoint = { x: 0, y: 0 };
                _this.pointList = [];
                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);
                _this.pointList[_this.pointList.length] = newPoint;
                _this.downPoint = { x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY) };
                if (_this.viewState.alertElements.size == 0) {
                    _this.blockAlert = true;
                    _this.updateView(Object.assign({}, _this.viewState, { blockAlert: true }));
                }
            }
            if (_this.mouseDownHandled) {
                _this.mouseDownHandled = false;
            }
            else {
                if (_this.currSelect.length > 0) {
                    for (var i_24 = 0; i_24 < _this.currSelect.length; i_24++) {
                        _this.deselectElement(_this.currSelect[i_24]);
                    }
                    _this.currSelect = [];
                }
                else {
                    if (_this.lMousePress && _this.viewState.mode == BoardModes.SELECT) {
                        _this.selectDrag = true;
                    }
                }
                if (_this.currentHover != -1) {
                    var elem = _this.getBoardElement(_this.currentHover);
                    if (elem.infoElement != -1) {
                        _this.removeHoverInfo(_this.currentHover);
                    }
                    clearTimeout(elem.hoverTimer);
                }
            }
        };
        this.mouseMove = function (e) {
            if (_this.currentHover != -1) {
                var elem = _this.getBoardElement(_this.currentHover);
                if (elem.infoElement != -1) {
                    _this.removeHoverInfo(_this.currentHover);
                }
                else {
                    clearTimeout(elem.hoverTimer);
                    elem.hoverTimer = setTimeout(_this.infoMessageTimeout, 2000, _this.currentHover);
                }
            }
            if (_this.wMousePress) {
                var whitElem = document.getElementById("whiteBoard-input");
                var newPanX = _this.panX + (_this.prevX - e.clientX) * _this.scaleF;
                var newPanY = _this.panY + (_this.prevY - e.clientY) * _this.scaleF;
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
                if (newPanX < 0) {
                    newPanX = 0;
                }
                if (newPanY < 0) {
                    newPanY = 0;
                }
                _this.setViewBox(newPanX, newPanY, _this.scaleF);
            }
            else if (_this.lMousePress) {
                var whitElem = document.getElementById("whiteBoard-input");
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY = elemRect.top - document.body.scrollTop;
                var offsetX = elemRect.left - document.body.scrollLeft;
                var context = whitElem.getContext('2d');
                var newPoint = { x: 0, y: 0 };
                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);
                _this.pointList.push(newPoint);
                if (_this.viewState.mode == BoardModes.SELECT) {
                    if (_this.groupMoving) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        _this.moveGroup(changeX, changeY, new Date());
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.groupMoved = true;
                    }
                    else if (_this.selectDrag) {
                        var rectLeft = void 0;
                        var rectTop = void 0;
                        var rectWidth = void 0;
                        var rectHeight = void 0;
                        if (newPoint.x > _this.downPoint.x) {
                            rectLeft = _this.downPoint.x;
                            rectWidth = newPoint.x - _this.downPoint.x;
                        }
                        else {
                            rectLeft = newPoint.x;
                            rectWidth = _this.downPoint.x - newPoint.x;
                        }
                        if (newPoint.y > _this.downPoint.y) {
                            rectTop = _this.downPoint.y;
                            rectHeight = newPoint.y - _this.downPoint.y;
                        }
                        else {
                            rectTop = newPoint.y;
                            rectHeight = _this.downPoint.y - newPoint.y;
                        }
                        context.clearRect(0, 0, whitElem.width, whitElem.height);
                        if (rectWidth > 0 && rectHeight > 0) {
                            context.beginPath();
                            context.strokeStyle = 'black';
                            context.setLineDash([5]);
                            context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
                            context.stroke();
                        }
                        _this.selectLeft = _this.panX + rectLeft * _this.scaleF;
                        _this.selectTop = _this.panY + rectTop * _this.scaleF;
                        _this.selectWidth = rectWidth * _this.scaleF;
                        _this.selectHeight = rectHeight * _this.scaleF;
                    }
                    else if (_this.currSelect.length == 1) {
                        var elem = _this.getBoardElement(_this.currSelect[0]);
                        var changeX_1 = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY_1 = (e.clientY - _this.prevY) * _this.scaleF;
                        var retVal = elem.handleBoardMouseMove(e, changeX_1, changeY_1, components.get(elem.type).pallete);
                        _this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                        _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        if (retVal.newViewCentre) {
                            _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        _this.handleInfoMessage(retVal.infoMessage);
                        _this.handleAlertMessage(retVal.alertMessage);
                        _this.setElementView(elem.id, retVal.newView);
                    }
                }
                else if (!_this.rMousePress && _this.viewState.mode != BoardModes.ERASE) {
                    if (_this.currSelect.length == 0) {
                        context.clearRect(0, 0, whitElem.width, whitElem.height);
                        var data = {
                            palleteState: components.get(_this.viewState.mode).pallete, pointList: _this.pointList
                        };
                        components.get(_this.viewState.mode).DrawHandle(data, context);
                    }
                    else if (_this.currSelect.length == 1) {
                        var elem = _this.getBoardElement(_this.currSelect[0]);
                        var changeX_2 = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY_2 = (e.clientY - _this.prevY) * _this.scaleF;
                        var retVal = elem.handleBoardMouseMove(e, changeX_2, changeY_2, components.get(elem.type).pallete);
                        _this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                        _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                        _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                        _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                        if (retVal.newViewCentre) {
                            _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                        }
                        _this.handleInfoMessage(retVal.infoMessage);
                        _this.handleAlertMessage(retVal.alertMessage);
                        _this.setElementView(elem.id, retVal.newView);
                    }
                }
            }
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
        };
        this.mouseUp = function (e) {
            if (_this.lMousePress && !_this.wMousePress) {
                var whitElem_6 = document.getElementById("whiteBoard-input");
                var context = whitElem_6.getContext('2d');
                var rectLeft = void 0;
                var rectTop = void 0;
                var rectWidth = void 0;
                var rectHeight = void 0;
                var elemRect_6 = whitElem_6.getBoundingClientRect();
                var offsetY = elemRect_6.top - document.body.scrollTop;
                var offsetX = elemRect_6.left - document.body.scrollLeft;
                var newPoint = { x: 0, y: 0 };
                context.clearRect(0, 0, whitElem_6.width, whitElem_6.height);
                if (_this.currSelect.length == 0) {
                    newPoint.x = Math.round(e.clientX - offsetX);
                    newPoint.y = Math.round(e.clientY - offsetY);
                    if (newPoint.x > _this.downPoint.x) {
                        rectLeft = _this.downPoint.x;
                        rectWidth = newPoint.x - _this.downPoint.x;
                    }
                    else {
                        rectLeft = newPoint.x;
                        rectWidth = _this.downPoint.x - newPoint.x;
                    }
                    if (newPoint.y > _this.downPoint.y) {
                        rectTop = _this.downPoint.y;
                        rectHeight = newPoint.y - _this.downPoint.y;
                    }
                    else {
                        rectTop = newPoint.y;
                        rectHeight = _this.downPoint.y - newPoint.y;
                    }
                    var x = rectLeft * _this.scaleF + _this.panX;
                    var y = rectTop * _this.scaleF + _this.panY;
                    var width = rectWidth * _this.scaleF;
                    var height = rectHeight * _this.scaleF;
                    if (_this.viewState.mode == BoardModes.SELECT) {
                        if (_this.selectDrag) {
                            context.clearRect(0, 0, whitElem_6.width, whitElem_6.height);
                            _this.boardElems.forEach(function (elem) {
                                if (!elem.isDeleted && elem.isComplete && elem.x >= _this.selectLeft && elem.y >= _this.selectTop) {
                                    if (_this.selectLeft + _this.selectWidth >= elem.x + elem.width && _this.selectTop + _this.selectHeight >= elem.y + elem.height) {
                                        _this.currSelect.push(elem.id);
                                        _this.selectElement(elem.id);
                                    }
                                }
                            });
                        }
                    }
                    else if (_this.viewState.mode != BoardModes.ERASE) {
                        var self_1 = _this;
                        var localId = _this.boardElems.push(null) - 1;
                        var callbacks = {
                            sendServerMsg: (function (id, type) { return function (msg) { self_1.sendMessage(id, type, msg); }; })(localId, self_1.viewState.mode),
                            createAlert: function (header, message) { },
                            createInfo: function (x, y, width, height, header, message) { return self_1.addInfoMessage(x, y, width, height, header, message); },
                            removeInfo: function (id) { self_1.removeInfoMessage(id); },
                            updateBoardView: (function (id) { return function (newView) { self_1.setElementView(id, newView); }; })(localId),
                            getAudioStream: function () { return self_1.getAudioStream(); },
                            getVideoStream: function () { return self_1.getVideoStream(); }
                        };
                        var data = {
                            id: localId, userId: _this.userId, callbacks: callbacks, x: x, y: y, width: width, height: height,
                            pointList: _this.pointList, scaleF: _this.scaleF, panX: _this.panX, panY: _this.panY,
                            palleteState: components.get(_this.viewState.mode).pallete
                        };
                        var newElem = components.get(_this.viewState.mode).Element.createElement(data);
                        if (newElem) {
                            var undoOp = (function (elem) { return elem.erase.bind(elem); })(newElem);
                            var redoOp = (function (elem) { return elem.restore.bind(elem); })(newElem);
                            _this.boardElems[localId] = newElem;
                            var viewState = newElem.getCurrentViewState();
                            _this.setElementView(localId, viewState);
                            var payload = newElem.getNewMsg();
                            var msg = { type: newElem.type, payload: payload };
                            _this.handleElementOperation(localId, undoOp, redoOp);
                            _this.sendNewElement(msg);
                        }
                        else {
                            _this.boardElems.splice(localId, 1);
                        }
                    }
                }
                else if (_this.currSelect.length == 1) {
                    var elem = _this.getBoardElement(_this.currSelect[0]);
                    var xPos = (e.clientX - offsetX) * _this.scaleF + _this.panX;
                    var yPos = (e.clientY - offsetY) * _this.scaleF + _this.panY;
                    var retVal = elem.handleBoardMouseUp(e, xPos, yPos, components.get(elem.type).pallete);
                    _this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                    _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    _this.handleMouseElementSelect(e, elem, retVal.isSelected);
                    _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    _this.handleInfoMessage(retVal.infoMessage);
                    _this.handleAlertMessage(retVal.alertMessage);
                    _this.setElementView(elem.id, retVal.newView);
                }
                if (_this.groupMoved) {
                    var xPos = (e.clientX - offsetX) * _this.scaleF + _this.panX;
                    var yPos = (e.clientY - offsetY) * _this.scaleF + _this.panY;
                    _this.groupMoved = false;
                    _this.endMove(xPos, yPos);
                }
            }
            if (_this.blockAlert) {
                _this.blockAlert = false;
                _this.updateView(Object.assign({}, _this.viewState, { blockAlert: false }));
            }
            _this.selectDrag = false;
            _this.lMousePress = false;
            _this.wMousePress = false;
            _this.rMousePress = false;
            _this.pointList = [];
        };
        this.touchStart = function () {
            _this.touchPress = true;
        };
        this.touchMove = function (e) {
            if (_this.touchPress) {
            }
        };
        this.touchEnd = function () {
            _this.touchPress = false;
        };
        this.touchCancel = function () {
        };
        this.keyDown = function (e) {
            if (e.keyCode === 8) {
                if (_this.currSelect.length == 1) {
                    e.preventDefault();
                    var elem = _this.getBoardElement(_this.currSelect[0]);
                    var retVal = elem.handleKeyPress(e, 'Backspace', components.get(elem.type).pallete);
                    _this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                    _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    _this.handleInfoMessage(retVal.infoMessage);
                    _this.handleAlertMessage(retVal.alertMessage);
                    _this.setElementView(elem.id, retVal.newView);
                }
            }
        };
        this.keyPress = function (e) {
            var inputChar = e.key;
            if (e.ctrlKey) {
                if (inputChar == 'z') {
                    if (_this.currSelect.length == 1 && _this.getBoardElement(_this.currSelect[0]).isEditing) {
                        _this.undoItemEdit(_this.currSelect[0]);
                    }
                    else {
                        _this.undo();
                    }
                }
                else if (inputChar == 'y') {
                    if (_this.currSelect.length == 1 && _this.getBoardElement(_this.currSelect[0]).isEditing) {
                        _this.redoItemEdit(_this.currSelect[0]);
                    }
                    else {
                        _this.redo();
                    }
                }
            }
            else {
                if (_this.currSelect.length == 1) {
                    e.preventDefault();
                    var elem = _this.getBoardElement(_this.currSelect[0]);
                    var retVal = elem.handleKeyPress(e, 'Backspace', components.get(elem.type).pallete);
                    _this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                    _this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    _this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if (retVal.newViewCentre) {
                        _this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    _this.handleInfoMessage(retVal.infoMessage);
                    _this.handleAlertMessage(retVal.alertMessage);
                    _this.setElementView(elem.id, retVal.newView);
                }
            }
        };
        this.contextCopy = function (e) {
            document.execCommand("copy");
        };
        this.contextCut = function (e) {
            document.execCommand("cut");
        };
        this.contextPaste = function (e) {
            document.execCommand("paste");
        };
        this.onCopy = function (e) {
            console.log('COPY EVENT');
        };
        this.onPaste = function (e) {
            console.log('PASTE EVENT');
        };
        this.onCut = function (e) {
            console.log('CUT EVENT');
        };
        this.dragOver = function (e) {
            e.preventDefault();
        };
        this.drop = function (e) {
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY = elemRect.top - document.body.scrollTop;
            var offsetX = elemRect.left - document.body.scrollLeft;
            var x = Math.round(e.clientX - offsetX);
            var y = Math.round(e.clientY - offsetY);
            e.preventDefault();
        };
        this.palleteChange = function (change) {
            var retVal = components.get(_this.viewState.mode).pallete.handleChange(change);
            var cursor = components.get(_this.viewState.mode).pallete.getCursor();
            _this.cursor = cursor.cursor;
            _this.cursorURL = cursor.url;
            _this.cursorOffset = cursor.offset;
            var newView = Object.assign({}, _this.viewState, {
                palleteState: retVal, cursor: _this.cursor, cursorURL: _this.cursorURL, cursorOffset: _this.cursorOffset
            });
            _this.updateView(newView);
            if (_this.currSelect.length == 1) {
                var elem = _this.getBoardElement(_this.currSelect[0]);
                if (elem.type == _this.viewState.mode) {
                    elem.handlePalleteChange(change);
                }
            }
        };
        this.windowResize = function (e) {
            var whitElem = document.getElementById("whiteBoard-input");
            var whitCont = document.getElementById("whiteboard-container");
            whitElem.style.width = whitCont.clientWidth + "px";
            whitElem.style.height = whitCont.clientHeight + "px";
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            _this.setViewBox(_this.panX, _this.panY, _this.scaleF);
        };
        this.windowUnload = function (e) {
            _this.socket.emit('LEAVE', null);
        };
        this.mouseWheel = function (e) {
            var whitElem = document.getElementById("whiteBoard-input");
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY = elemRect.top - document.body.scrollTop;
            var offsetX = elemRect.left - document.body.scrollLeft;
            var newPanX = _this.panX;
            var newPanY = _this.panY;
            var newScale;
            var move = true;
            var prevScale = _this.scaleNum;
            _this.scaleNum = _this.scaleNum - e.deltaY / 2;
            if (_this.scaleNum < -5) {
                if (prevScale == -5) {
                    move = false;
                }
                _this.scaleNum = -5;
            }
            if (_this.scaleNum > 5) {
                if (prevScale == 5) {
                    move = false;
                }
                _this.scaleNum = 5;
            }
            var prevPoint = newScale = Math.pow(0.8, _this.scaleNum);
            var vBoxW = whitElem.clientWidth * newScale;
            var vBoxH = whitElem.clientHeight * newScale;
            if (move) {
                if (e.deltaY < 0) {
                    newPanX = _this.panX + (_this.scaleF - newScale) * (e.clientX - offsetX);
                    newPanY = _this.panY + (_this.scaleF - newScale) * (e.clientY - offsetY);
                }
                else {
                    newPanX = _this.panX - (_this.scaleF - newScale) * (e.clientX - offsetX);
                    newPanY = _this.panY - (_this.scaleF - newScale) * (e.clientY - offsetY);
                }
                if (newPanX < 0) {
                    newPanX = 0;
                }
                if (newPanY < 0) {
                    newPanY = 0;
                }
            }
            _this.setViewBox(newPanX, newPanY, newScale);
        };
        this.clearAlert = function () {
            _this.removeAlert();
        };
        this.isHost = isHost;
        this.userId = userId;
        var dispatcher = {
            elementMouseOver: this.elementMouseOver,
            elementMouseOut: this.elementMouseOut,
            elementMouseDown: this.elementMouseDown,
            elementMouseMove: this.elementMouseMove,
            elementMouseUp: this.elementMouseUp,
            elementMouseClick: this.elementMouseClick,
            elementMouseDoubleClick: this.elementMouseDoubleClick,
            elementTouchStart: this.elementTouchStart,
            elementTouchMove: this.elementTouchMove,
            elementTouchEnd: this.elementTouchEnd,
            elementTouchCancel: this.elementTouchCancel,
            elementDragOver: this.elementDragOver,
            elementDrop: this.elementDrop,
            clearAlert: this.clearAlert,
            modeChange: this.modeChange,
            palleteChange: this.palleteChange,
            changeEraseSize: this.changeEraseSize,
            mouseWheel: this.mouseWheel,
            mouseDown: this.mouseDown,
            mouseMove: this.mouseMove,
            mouseUp: this.mouseUp,
            touchStart: this.touchStart,
            touchMove: this.touchMove,
            touchEnd: this.touchEnd,
            touchCancel: this.touchCancel,
            contextCopy: this.contextCopy,
            contextCut: this.contextCut,
            contextPaste: this.contextPaste,
            onCopy: this.onCopy,
            onPaste: this.onPaste,
            onCut: this.onCut,
            dragOver: this.dragOver,
            drop: this.drop
        };
        this.viewState = {
            viewBox: '0 0 0 0',
            viewX: 0,
            viewY: 0,
            viewWidth: 0,
            viewHeight: 0,
            viewScale: 1,
            mode: BoardModes.SELECT,
            baseSize: 1.0,
            eraseSize: 1.0,
            blockAlert: false,
            itemMoving: false,
            itemResizing: false,
            resizeHorz: false,
            resizeVert: false,
            palleteState: {},
            boardElements: Immutable.OrderedMap(),
            infoElements: Immutable.List(),
            alertElements: Immutable.List(),
            cursor: 'auto',
            cursorURL: [],
            cursorOffset: { x: 0, y: 0 },
            dispatcher: dispatcher,
            components: components
        };
    }
    return WhiteBoardController;
}());
