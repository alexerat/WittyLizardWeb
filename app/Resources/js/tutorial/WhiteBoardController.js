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
var ElementMessageTypes = {
    DELETE: 0,
    RESTORE: 1,
    MOVE: 2
};
var WorkerMessageTypes;
(function (WorkerMessageTypes) {
    WorkerMessageTypes[WorkerMessageTypes["UPDATEVIEW"] = 0] = "UPDATEVIEW";
    WorkerMessageTypes[WorkerMessageTypes["SETVBOX"] = 1] = "SETVBOX";
    WorkerMessageTypes[WorkerMessageTypes["AUDIOSTREAM"] = 2] = "AUDIOSTREAM";
    WorkerMessageTypes[WorkerMessageTypes["VIDEOSTREAM"] = 3] = "VIDEOSTREAM";
    WorkerMessageTypes[WorkerMessageTypes["NEWVIEWCENTRE"] = 4] = "NEWVIEWCENTRE";
    WorkerMessageTypes[WorkerMessageTypes["SETSELECT"] = 5] = "SETSELECT";
    WorkerMessageTypes[WorkerMessageTypes["ELEMENTMESSAGE"] = 6] = "ELEMENTMESSAGE";
    WorkerMessageTypes[WorkerMessageTypes["ELEMENTVIEW"] = 7] = "ELEMENTVIEW";
    WorkerMessageTypes[WorkerMessageTypes["ELEMENTDELETE"] = 8] = "ELEMENTDELETE";
    WorkerMessageTypes[WorkerMessageTypes["NEWALERT"] = 9] = "NEWALERT";
    WorkerMessageTypes[WorkerMessageTypes["REMOVEALERT"] = 10] = "REMOVEALERT";
    WorkerMessageTypes[WorkerMessageTypes["NEWINFO"] = 11] = "NEWINFO";
    WorkerMessageTypes[WorkerMessageTypes["REMOVEINFO"] = 12] = "REMOVEINFO";
})(WorkerMessageTypes || (WorkerMessageTypes = {}));
var ControllerMessageTypes;
(function (ControllerMessageTypes) {
    ControllerMessageTypes[ControllerMessageTypes["START"] = 0] = "START";
    ControllerMessageTypes[ControllerMessageTypes["SETOPTIONS"] = 1] = "SETOPTIONS";
    ControllerMessageTypes[ControllerMessageTypes["REGISTER"] = 2] = "REGISTER";
    ControllerMessageTypes[ControllerMessageTypes["MODECHANGE"] = 3] = "MODECHANGE";
    ControllerMessageTypes[ControllerMessageTypes["AUDIOSTREAM"] = 4] = "AUDIOSTREAM";
    ControllerMessageTypes[ControllerMessageTypes["VIDEOSTREAM"] = 5] = "VIDEOSTREAM";
    ControllerMessageTypes[ControllerMessageTypes["NEWELEMENT"] = 6] = "NEWELEMENT";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTID"] = 7] = "ELEMENTID";
    ControllerMessageTypes[ControllerMessageTypes["BATCHMOVE"] = 8] = "BATCHMOVE";
    ControllerMessageTypes[ControllerMessageTypes["BATCHDELETE"] = 9] = "BATCHDELETE";
    ControllerMessageTypes[ControllerMessageTypes["BATCHRESTORE"] = 10] = "BATCHRESTORE";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMESSAGE"] = 11] = "ELEMENTMESSAGE";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEOVER"] = 12] = "ELEMENTMOUSEOVER";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEOUT"] = 13] = "ELEMENTMOUSEOUT";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEDOWN"] = 14] = "ELEMENTMOUSEDOWN";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTERASE"] = 15] = "ELEMENTERASE";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEMOVE"] = 16] = "ELEMENTMOUSEMOVE";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEUP"] = 17] = "ELEMENTMOUSEUP";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSECLICK"] = 18] = "ELEMENTMOUSECLICK";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTMOUSEDBLCLICK"] = 19] = "ELEMENTMOUSEDBLCLICK";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHSTART"] = 20] = "ELEMENTTOUCHSTART";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHMOVE"] = 21] = "ELEMENTTOUCHMOVE";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHEND"] = 22] = "ELEMENTTOUCHEND";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTTOUCHCANCEL"] = 23] = "ELEMENTTOUCHCANCEL";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTDRAG"] = 24] = "ELEMENTDRAG";
    ControllerMessageTypes[ControllerMessageTypes["ELEMENTDROP"] = 25] = "ELEMENTDROP";
    ControllerMessageTypes[ControllerMessageTypes["MOUSEDOWN"] = 26] = "MOUSEDOWN";
    ControllerMessageTypes[ControllerMessageTypes["MOUSEMOVE"] = 27] = "MOUSEMOVE";
    ControllerMessageTypes[ControllerMessageTypes["MOUSEUP"] = 28] = "MOUSEUP";
    ControllerMessageTypes[ControllerMessageTypes["TOUCHSTART"] = 29] = "TOUCHSTART";
    ControllerMessageTypes[ControllerMessageTypes["TOUCHMOVE"] = 30] = "TOUCHMOVE";
    ControllerMessageTypes[ControllerMessageTypes["TOUCHEND"] = 31] = "TOUCHEND";
    ControllerMessageTypes[ControllerMessageTypes["TOUCHCANCEL"] = 32] = "TOUCHCANCEL";
    ControllerMessageTypes[ControllerMessageTypes["KEYBOARDINPUT"] = 33] = "KEYBOARDINPUT";
    ControllerMessageTypes[ControllerMessageTypes["UNDO"] = 34] = "UNDO";
    ControllerMessageTypes[ControllerMessageTypes["REDO"] = 35] = "REDO";
    ControllerMessageTypes[ControllerMessageTypes["PALLETECHANGE"] = 36] = "PALLETECHANGE";
    ControllerMessageTypes[ControllerMessageTypes["LEAVE"] = 37] = "LEAVE";
    ControllerMessageTypes[ControllerMessageTypes["ERROR"] = 38] = "ERROR";
})(ControllerMessageTypes || (ControllerMessageTypes = {}));
var components = Immutable.Map();
var registerComponentView = function (componentName, ElementView, PalleteView, ModeView, DrawHandle) {
    console.log('Registering view for: ' + componentName);
    var newComp = {
        componentName: componentName, ElementView: ElementView, PalleteView: PalleteView, ModeView: ModeView, DrawHandle: DrawHandle
    };
    components = components.set(componentName, newComp);
};
var WhiteBoardController = (function () {
    function WhiteBoardController(isHost, userId, allEdit, userEdit, workerUrl, componentFiles) {
        var _this = this;
        this.isHost = false;
        this.userId = 0;
        this.allowAllEdit = false;
        this.allowUserEdit = true;
        this.socket = null;
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.touchPress = false;
        this.scaleF = 1;
        this.panX = 0;
        this.panY = 0;
        this.scaleNum = 0;
        this.pointList = [];
        this.isPoint = true;
        this.prevX = 0;
        this.prevY = 0;
        this.selectDrag = false;
        this.mouseDownHandled = false;
        this.blockAlert = false;
        this.selectCount = 0;
        this.fileUploads = [];
        this.fileReaders = [];
        this.isHost = isHost;
        this.userId = userId;
        this.allowAllEdit = allEdit;
        this.allowUserEdit = userEdit;
        var dispatcher = {
            elementMouseOver: this.elementMouseOver.bind(this),
            elementMouseOut: this.elementMouseOut.bind(this),
            elementMouseDown: this.elementMouseDown.bind(this),
            elementMouseMove: this.elementMouseMove.bind(this),
            elementMouseUp: this.elementMouseUp.bind(this),
            elementMouseClick: this.elementMouseClick.bind(this),
            elementMouseDoubleClick: this.elementMouseDoubleClick.bind(this),
            elementTouchStart: this.elementTouchStart.bind(this),
            elementTouchMove: this.elementTouchMove.bind(this),
            elementTouchEnd: this.elementTouchEnd.bind(this),
            elementTouchCancel: this.elementTouchCancel.bind(this),
            elementDragOver: this.elementDragOver.bind(this),
            elementDrop: this.elementDrop.bind(this),
            clearAlert: this.clearAlert.bind(this),
            modeChange: this.modeChange.bind(this),
            palleteChange: this.palleteChange.bind(this),
            changeEraseSize: this.changeEraseSize.bind(this),
            mouseWheel: this.mouseWheel.bind(this),
            mouseDown: this.mouseDown.bind(this),
            mouseMove: this.mouseMove.bind(this),
            mouseUp: this.mouseUp.bind(this),
            touchStart: this.touchStart.bind(this),
            touchMove: this.touchMove.bind(this),
            touchEnd: this.touchEnd.bind(this),
            touchCancel: this.touchCancel.bind(this),
            contextCopy: this.contextCopy.bind(this),
            contextCut: this.contextCut.bind(this),
            contextPaste: this.contextPaste.bind(this),
            onCopy: this.onCopy.bind(this),
            onPaste: this.onPaste.bind(this),
            onCut: this.onCut.bind(this),
            dragOver: this.dragOver.bind(this),
            drop: this.drop.bind(this)
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
        var self = this;
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = function (e) {
            self.setSelectCount.bind(_this)(e.data.selectCount);
            if (e.data.viewUpdate != undefined && e.data.viewUpdate != null) {
                self.setViewState.bind(_this)(e.data.viewUpdate);
            }
            if (e.data.newViewBox != undefined && e.data.newViewBox != null) {
                self.setViewBox.bind(_this)(e.data.newViewBox.panX, e.data.newViewBox.panY, e.data.newViewBox.scaleF);
            }
            if (e.data.newViewCentre != undefined && e.data.newViewCentre != null) {
                self.handleElementNewViewCentre.bind(_this)(e.data.newViewCentre.x, e.data.newViewCentre.y);
            }
            if (e.data.elementViews.length > 0) {
                self.setElementViews.bind(_this)(e.data.elementViews);
            }
            if (e.data.deleteElements.length > 0) {
                self.deleteElements.bind(_this)(e.data.deleteElements);
            }
            for (var i_1 = 0; i_1 < e.data.alerts.length; i_1++) {
                self.newAlert.bind(_this)(e.data.alerts[i_1]);
            }
            if (e.data.removeAlert) {
                self.removeAlert.bind(_this)();
            }
            if (e.data.infoMessages.length > 0) {
                self.addInfoMessages.bind(_this)(e.data.infoMessages);
            }
            if (e.data.removeInfos.length > 0) {
                self.removeInfoMessages.bind(_this)(e.data.removeInfos);
            }
            for (var i_2 = 0; i_2 < e.data.elementMessages.length; i_2++) {
                self.handleMessage.bind(_this)(e.data.elementMessages[i_2].type, e.data.elementMessages[i_2].message);
            }
            for (var i_3 = 0; i_3 < e.data.audioRequests.length; i_3++) {
                self.getAudioStream.bind(_this)(e.data.audioRequests[i_3]);
            }
            for (var i_4 = 0; i_4 < e.data.videoRequests.length; i_4++) {
                self.getVideoStream.bind(_this)(e.data.videoRequests[i_4]);
            }
            if (e.data.elementMoves.length > 0) {
                console.log('Sending group move.');
                var message_1 = { header: ElementMessageTypes.MOVE, payload: e.data.elementMoves };
                var messageCont = { id: null, type: 'ANY', payload: message_1 };
                self.handleMessage.bind(_this)('MSG-COMPONENT', messageCont);
            }
            if (e.data.elementDeletes.length > 0) {
                var message_2 = { header: ElementMessageTypes.DELETE, payload: e.data.elementDeletes };
                var messageCont = { id: null, type: 'ANY', payload: message_2 };
                self.handleMessage.bind(_this)('MSG-COMPONENT', messageCont);
            }
            if (e.data.elementRestores.length > 0) {
                var message_3 = { header: ElementMessageTypes.RESTORE, payload: e.data.elementRestores };
                var messageCont = { id: null, type: 'ANY', payload: message_3 };
                self.handleMessage.bind(_this)('MSG-COMPONENT', messageCont);
            }
        };
        var message = { type: 0, componentFiles: componentFiles, allEdit: this.allowAllEdit, userEdit: this.allowUserEdit };
        this.worker.postMessage(message);
    }
    WhiteBoardController.prototype.setSocket = function (socket) {
        this.socket = socket;
        var self = this;
        this.socket.on('JOIN', function (data) {
        });
        this.socket.on('OPTIONS', function (data) {
        });
        this.socket.on('NEW-ELEMENT', function (data) {
            var message = { type: 6, data: data };
            self.worker.postMessage(message);
        });
        this.socket.on('ELEMENT-ID', function (data) {
            var message = { type: 7, data: data };
            self.worker.postMessage(message);
        });
        this.socket.on('MSG-COMPONENT', function (data) {
            if (data.type == 'ANY') {
                if (data.payload.header == ElementMessageTypes.MOVE) {
                    var message = { type: 8, data: data.payload.payload };
                    self.worker.postMessage(message);
                }
                else if (data.payload.header == ElementMessageTypes.DELETE) {
                    var message = { type: 9, data: data.payload.payload };
                    self.worker.postMessage(message);
                }
                else if (data.payload.header == ElementMessageTypes.RESTORE) {
                    var message = { type: 10, data: data.payload.payload };
                    self.worker.postMessage(message);
                }
            }
            else {
                var message = { type: 11, data: data };
                self.worker.postMessage(message);
            }
        });
        this.socket.on('ERROR', function (message) {
            console.log('SERVER: ' + message);
            var errMsg = { type: 38, error: message };
            self.worker.postMessage(errMsg);
        });
    };
    WhiteBoardController.prototype.handleMessage = function (type, message) {
        this.socket.emit(type, message);
    };
    WhiteBoardController.prototype.setRoomOptions = function (allowAllEdit, allowUserEdit) {
        this.allowAllEdit = allowAllEdit;
        this.allowUserEdit = allowUserEdit;
        var message = { type: 1, allowAllEdit: this.allowAllEdit, allowUserEdit: this.allowUserEdit };
        this.worker.postMessage(message);
    };
    WhiteBoardController.prototype.setView = function (view) {
        var whitElem = document.getElementById('whiteBoard-input');
        var whitCont = document.getElementById('whiteboard-container');
        whitElem.style.width = whitCont.clientWidth + 'px';
        whitElem.style.height = whitCont.clientHeight + 'px';
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;
        window.addEventListener('resize', this.windowResize.bind(this));
        window.addEventListener('beforeunload', this.windowUnload.bind(this));
        document.addEventListener('keypress', this.keyPress.bind(this));
        document.addEventListener('keydown', this.keyDown.bind(this));
        var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;
        this.viewState.viewBox = newVBox;
        this.viewState.viewWidth = whitElem.width;
        this.viewState.viewHeight = whitElem.height;
        this.viewState.viewScale = 1;
        this.view = view;
        view.setState(this.viewState);
    };
    WhiteBoardController.prototype.updateView = function (viewState) {
        this.viewState = viewState;
        this.view.storeUpdate(this.viewState);
    };
    WhiteBoardController.prototype.setViewState = function (newParams) {
        this.updateView(Object.assign({}, this.viewState, newParams));
    };
    WhiteBoardController.prototype.setElementViews = function (upadates) {
        var newElemList = this.viewState.boardElements;
        for (var i_5 = 0; i_5 < upadates.length; i_5++) {
            newElemList = newElemList.set(upadates[i_5].id, upadates[i_5].view);
        }
        this.setViewState({ boardElements: newElemList });
    };
    WhiteBoardController.prototype.setSelectCount = function (newCount) {
        this.selectCount = newCount;
    };
    WhiteBoardController.prototype.getAudioStream = function (id) {
        return null;
    };
    WhiteBoardController.prototype.getVideoStream = function (id) {
        return null;
    };
    WhiteBoardController.prototype.newAlert = function (alertView) {
        var newElemList = this.viewState.alertElements.push(alertView);
        this.setViewState({ alertElements: newElemList });
    };
    WhiteBoardController.prototype.removeAlert = function () {
        var newElemList = this.viewState.alertElements.shift();
        this.setViewState({ alertElements: newElemList });
    };
    WhiteBoardController.prototype.deleteElements = function (ids) {
        var newElemList = this.viewState.boardElements;
        var _loop_1 = function(i_6) {
            newElemList = newElemList.filter(function (element) { return element.id !== ids[i_6]; });
        };
        for (var i_6 = 0; i_6 < ids.length; i_6++) {
            _loop_1(i_6);
        }
        this.setViewState({ boardElements: newElemList });
    };
    WhiteBoardController.prototype.handleElementNewViewCentre = function (x, y) {
        var whitElem = document.getElementById('whiteBoard-input');
        var whitCont = document.getElementById('whiteboard-container');
        var clientWidth = whitCont.clientWidth;
        var clientHeight = whitCont.clientHeight;
        var xChange = x - (this.panX + clientWidth * this.scaleF * 0.5);
        var yChange = y - (this.panY + clientHeight * this.scaleF * 0.5);
        var newPanX = this.panX + xChange;
        var newPanY = this.panY + yChange;
        if (newPanX < 0) {
            newPanX = 0;
        }
        if (newPanY < 0) {
            newPanY = 0;
        }
        this.setViewBox(newPanX, newPanY, this.scaleF);
    };
    WhiteBoardController.prototype.addInfoMessages = function (newInfoViews) {
        var newInfoList = this.viewState.infoElements;
        for (var i_7 = 0; i_7 < newInfoViews.length; i_7++) {
            newInfoList = this.viewState.infoElements.push(newInfoViews[i_7]);
        }
        this.setViewState({ infoElements: newInfoList });
    };
    WhiteBoardController.prototype.removeInfoMessages = function (ids) {
        var newInfoList = this.viewState.infoElements;
        for (var i_8 = 0; i_8 < ids.length; i_8++) {
            newInfoList = this.viewState.infoElements.delete(ids[i_8]);
        }
        this.setViewState({ infoElements: newInfoList });
    };
    WhiteBoardController.prototype.setViewBox = function (panX, panY, scaleF) {
        var whitElem = document.getElementById("whiteBoard-input");
        var vBoxW = whitElem.clientWidth * scaleF;
        var vBoxH = whitElem.clientHeight * scaleF;
        this.scaleF = scaleF;
        this.panX = panX;
        this.panY = panY;
        var newVBox = '' + panX + ' ' + panY + ' ' + vBoxW + ' ' + vBoxH;
        this.setViewState({ viewBox: newVBox, viewX: panX, viewY: panY, viewWidth: vBoxW, viewHeight: vBoxH, viewScale: scaleF });
    };
    WhiteBoardController.prototype.compareUpdateTime = function (elem1, elem2) {
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
    WhiteBoardController.prototype.modeChange = function (newMode) {
        var whitElem = document.getElementById("whiteBoard-input");
        var context = whitElem.getContext('2d');
        context.clearRect(0, 0, whitElem.width, whitElem.height);
        var message = { type: 3, newMode: newMode };
        this.worker.postMessage(message);
    };
    WhiteBoardController.prototype.changeEraseSize = function (newSize) {
        this.setViewState({ eraseSize: newSize });
    };
    WhiteBoardController.prototype.elementMouseOver = function (id, e) {
        var eventCopy = {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        };
        var message = { type: 12, id: id, e: eventCopy };
        this.worker.postMessage(message);
    };
    WhiteBoardController.prototype.elementMouseOut = function (id, e) {
        var eventCopy = {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        };
        var message = { type: 13, id: id, e: eventCopy };
        this.worker.postMessage(message);
    };
    WhiteBoardController.prototype.elementMouseDown = function (id, e, componenet, subId) {
        this.mouseDownHandled = true;
        e.preventDefault();
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
        var yPos = (e.clientY - offsetY) * this.scaleF + this.panY;
        var eventCopy = {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        };
        var message = { type: 14, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId };
        this.worker.postMessage(message);
    };
    WhiteBoardController.prototype.elementMouseMove = function (id, e, componenet, subId) {
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        var mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panX;
        if (this.viewState.mode == BoardModes.ERASE) {
            if (this.lMousePress) {
                var message = { type: 15, id: id };
                this.worker.postMessage(message);
            }
        }
        else if (this.viewState.mode == BoardModes.SELECT) {
            if (e.buttons == 0) {
                var eventCopy = {
                    altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                    buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
                };
                var message = {
                    type: 16, id: id, e: eventCopy, mouseX: mouseX, mouseY: mouseY, componenet: componenet, subId: subId
                };
                this.worker.postMessage(message);
                this.prevX = e.clientX;
                this.prevY = e.clientY;
            }
        }
    };
    WhiteBoardController.prototype.elementMouseUp = function (id, e, componenet, subId) {
        if (this.viewState.mode == BoardModes.SELECT) {
            var whitElem_1 = document.getElementById("whiteBoard-input");
            var elemRect_1 = whitElem_1.getBoundingClientRect();
            var offsetY = elemRect_1.top - document.body.scrollTop;
            var offsetX = elemRect_1.left - document.body.scrollLeft;
            var xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
            var yPos = (e.clientY - offsetY) * this.scaleF + this.panY;
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };
            var message = {
                type: 17, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId
            };
            this.worker.postMessage(message);
        }
    };
    WhiteBoardController.prototype.elementMouseClick = function (id, e, componenet, subId) {
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
        var yPos = (e.clientY - offsetY) * this.scaleF + this.panY;
        if (this.viewState.mode == BoardModes.ERASE) {
            var message = { type: 15, id: id };
            this.worker.postMessage(message);
        }
        else if (this.viewState.mode == BoardModes.SELECT) {
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };
            var message = {
                type: 18, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId
            };
            this.worker.postMessage(message);
        }
    };
    WhiteBoardController.prototype.elementMouseDoubleClick = function (id, e, componenet, subId) {
        if (this.viewState.mode == BoardModes.SELECT) {
            var whitElem_2 = document.getElementById("whiteBoard-input");
            var elemRect_2 = whitElem_2.getBoundingClientRect();
            var offsetY = elemRect_2.top - document.body.scrollTop;
            var offsetX = elemRect_2.left - document.body.scrollLeft;
            var xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
            var yPos = (e.clientY - offsetY) * this.scaleF + this.panY;
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };
            var message = {
                type: 19, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId
            };
            this.worker.postMessage(message);
            e.stopPropagation();
        }
    };
    WhiteBoardController.prototype.elementTouchStart = function (id, e, componenet, subId) {
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var localTouches;
        for (var i_9 = 0; i_9 < e.touches.length; i_9++) {
            var touch = e.touches.item(i_9);
            var xPos = (touch.clientX - offsetX) * this.scaleF + this.panX;
            var yPos = (touch.clientY - offsetY) * this.scaleF + this.panY;
            localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
        }
        var message = { type: 20, id: id, e: e, localTouches: localTouches, componenet: componenet, subId: subId };
        this.worker.postMessage(message);
        this.prevTouch = e.touches;
    };
    WhiteBoardController.prototype.elementTouchMove = function (id, e, componenet, subId) {
        var touchMoves;
        if (this.viewState.mode == BoardModes.ERASE) {
            var message = { type: 15, id: id };
            this.worker.postMessage(message);
        }
        else if (this.viewState.mode == BoardModes.SELECT) {
            for (var i_10 = 0; i_10 < e.touches.length; i_10++) {
                var touch = e.touches.item(i_10);
                for (var j_1 = 0; j_1 < this.prevTouch.length; j_1++) {
                    if (this.prevTouch[j_1].identifier == touch.identifier) {
                        var xChange = (touch.clientX - this.prevTouch[j_1].clientX) * this.scaleF;
                        var yChange = (touch.clientY - this.prevTouch[j_1].clientY) * this.scaleF;
                        var touchChange = { x: xChange, y: yChange, identifer: touch.identifier };
                        touchMoves.push(touchChange);
                    }
                }
            }
            var message = { type: 21, id: id, e: e, touchMoves: touchMoves, componenet: componenet, subId: subId };
            this.worker.postMessage(message);
            this.prevTouch = e.touches;
        }
    };
    WhiteBoardController.prototype.elementTouchEnd = function (id, e, componenet, subId) {
        if (this.viewState.mode == BoardModes.SELECT) {
            var whitElem_3 = document.getElementById("whiteBoard-input");
            var elemRect_3 = whitElem_3.getBoundingClientRect();
            var offsetY = elemRect_3.top - document.body.scrollTop;
            var offsetX = elemRect_3.left - document.body.scrollLeft;
            var localTouches = void 0;
            for (var i_11 = 0; i_11 < e.touches.length; i_11++) {
                var touch = e.touches.item(i_11);
                var xPos = (touch.clientX - offsetX) * this.scaleF + this.panX;
                var yPos = (touch.clientY - offsetY) * this.scaleF + this.panY;
                localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
            }
            var message = { type: 22, id: id, e: e, localTouches: localTouches, componenet: componenet, subId: subId };
            this.worker.postMessage(message);
        }
    };
    WhiteBoardController.prototype.elementTouchCancel = function (id, e, componenet, subId) {
        if (this.viewState.mode == BoardModes.SELECT) {
            var whitElem_4 = document.getElementById("whiteBoard-input");
            var elemRect_4 = whitElem_4.getBoundingClientRect();
            var offsetY = elemRect_4.top - document.body.scrollTop;
            var offsetX = elemRect_4.left - document.body.scrollLeft;
            var localTouches = void 0;
            for (var i_12 = 0; i_12 < e.touches.length; i_12++) {
                var touch = e.touches.item(i_12);
                var xPos = (touch.clientX - offsetX) * this.scaleF + this.panX;
                var yPos = (touch.clientY - offsetY) * this.scaleF + this.panY;
                localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
            }
            var message = { type: 23, id: id, e: e, localTouches: localTouches, componenet: componenet, subId: subId };
            this.worker.postMessage(message);
        }
    };
    WhiteBoardController.prototype.elementDragOver = function (id, e, componenet, subId) {
        e.stopPropagation();
    };
    WhiteBoardController.prototype.elementDrop = function (id, e, componenet, subId) {
        e.stopPropagation();
    };
    WhiteBoardController.prototype.mouseDown = function (e) {
        e.preventDefault();
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        var mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;
        if (!this.lMousePress && !this.wMousePress && !this.rMousePress) {
            this.lMousePress = e.buttons & 1 ? true : false;
            this.rMousePress = e.buttons & 2 ? true : false;
            this.wMousePress = e.buttons & 4 ? true : false;
            this.isPoint = true;
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
            var newPoint = { x: 0, y: 0 };
            this.pointList = [];
            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);
            this.pointList[this.pointList.length] = newPoint;
            this.downPoint = { x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY) };
            if (this.viewState.alertElements.size == 0) {
                this.blockAlert = true;
                this.setViewState({ blockAlert: true });
            }
            if (this.viewState.mode == BoardModes.SELECT && !this.mouseDownHandled && e.buttons == 1) {
                this.selectDrag = true;
            }
        }
        if (this.mouseDownHandled) {
            this.mouseDownHandled = false;
        }
        else {
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };
            var message = { type: 26, e: eventCopy, mouseX: mouseX, mouseY: mouseY, mode: this.viewState.mode };
            this.worker.postMessage(message);
        }
    };
    WhiteBoardController.prototype.mouseMove = function (e) {
        var whitElem = document.getElementById("whiteBoard-input");
        var context = whitElem.getContext('2d');
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        var mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;
        if (this.wMousePress) {
            var newPanX = this.panX + (this.prevX - e.clientX) * this.scaleF;
            var newPanY = this.panY + (this.prevY - e.clientY) * this.scaleF;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
            if (newPanX < 0) {
                newPanX = 0;
            }
            if (newPanY < 0) {
                newPanY = 0;
            }
            this.setViewBox(newPanX, newPanY, this.scaleF);
        }
        var eventCopy = {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        };
        if (this.selectDrag) {
            var absX = Math.round(e.clientX - offsetX);
            var absY = Math.round(e.clientY - offsetY);
            var rectLeft = void 0;
            var rectTop = void 0;
            var rectWidth = void 0;
            var rectHeight = void 0;
            if (absX > this.downPoint.x) {
                rectLeft = this.downPoint.x;
                rectWidth = absX - this.downPoint.x;
            }
            else {
                rectLeft = absX;
                rectWidth = this.downPoint.x - absX;
            }
            if (absY > this.downPoint.y) {
                rectTop = this.downPoint.y;
                rectHeight = absY - this.downPoint.y;
            }
            else {
                rectTop = absY;
                rectHeight = this.downPoint.y - absY;
            }
            context.clearRect(0, 0, whitElem.width, whitElem.height);
            context.setLineDash([5]);
            context.strokeStyle = 'black';
            context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
        }
        var message = { type: 27, e: eventCopy, mouseX: mouseX, mouseY: mouseY, mode: this.viewState.mode };
        this.worker.postMessage(message);
        if (e.buttons == 1 && this.viewState.mode != BoardModes.SELECT && this.viewState.mode != BoardModes.ERASE) {
            var newPoint = { x: 0, y: 0 };
            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);
            this.pointList.push(newPoint);
            if (this.selectCount == 0) {
                context.clearRect(0, 0, whitElem.width, whitElem.height);
                var data = {
                    palleteState: this.viewState.palleteState, pointList: this.pointList
                };
                components.get(this.viewState.mode).DrawHandle(data, context);
            }
        }
        this.prevX = e.clientX;
        this.prevY = e.clientY;
    };
    WhiteBoardController.prototype.mouseUp = function (e) {
        if (this.lMousePress && !this.wMousePress) {
            var whitElem_5 = document.getElementById("whiteBoard-input");
            var context = whitElem_5.getContext('2d');
            var elemRect_5 = whitElem_5.getBoundingClientRect();
            var offsetY = elemRect_5.top - document.body.scrollTop;
            var offsetX = elemRect_5.left - document.body.scrollLeft;
            var mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
            var mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;
            var downX = this.downPoint.x * this.scaleF + this.panX;
            var downY = this.downPoint.y * this.scaleF + this.panY;
            context.clearRect(0, 0, whitElem_5.width, whitElem_5.height);
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };
            var message = {
                type: 28, e: eventCopy, mouseX: mouseX, mouseY: mouseY, downX: downX, downY: downY,
                mode: this.viewState.mode, scaleF: this.scaleF, panX: this.panX, panY: this.panY, pointList: this.pointList
            };
            this.worker.postMessage(message);
        }
        if (this.blockAlert) {
            this.blockAlert = false;
            this.setViewState({ blockAlert: false });
        }
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.pointList = [];
        this.selectDrag = false;
    };
    WhiteBoardController.prototype.touchStart = function (e) {
        this.touchPress = true;
    };
    WhiteBoardController.prototype.touchMove = function (e) {
        if (this.touchPress) {
        }
    };
    WhiteBoardController.prototype.touchEnd = function (e) {
        this.touchPress = false;
    };
    WhiteBoardController.prototype.touchCancel = function (e) {
    };
    WhiteBoardController.prototype.keyDown = function (e) {
        if (e.keyCode === 8) {
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                keyCode: e.keyCode, charCode: e.charCode
            };
            var message = { type: 33, e: eventCopy, inputChar: 'Backspace', mode: this.viewState.mode };
            this.worker.postMessage(message);
            e.preventDefault();
        }
        else if (e.keyCode === 46) {
            var eventCopy = {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                keyCode: e.keyCode, charCode: e.charCode
            };
            var message = { type: 33, e: eventCopy, inputChar: 'Del', mode: this.viewState.mode };
            this.worker.postMessage(message);
            e.preventDefault();
        }
    };
    WhiteBoardController.prototype.keyPress = function (e) {
        var inputChar = e.key;
        e.preventDefault();
        var eventCopy = {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            keyCode: e.keyCode, charCode: e.charCode
        };
        if (e.ctrlKey) {
            if (inputChar == 'z') {
                var message = { type: 34 };
                this.worker.postMessage(message);
            }
            else if (inputChar == 'y') {
                var message = { type: 35 };
                this.worker.postMessage(message);
            }
        }
        else {
            var message = { type: 33, e: eventCopy, inputChar: inputChar, mode: this.viewState.mode };
            this.worker.postMessage(message);
        }
    };
    WhiteBoardController.prototype.contextCopy = function (e) {
        document.execCommand("copy");
    };
    WhiteBoardController.prototype.contextCut = function (e) {
        document.execCommand("cut");
    };
    WhiteBoardController.prototype.contextPaste = function (e) {
        document.execCommand("paste");
    };
    WhiteBoardController.prototype.onCopy = function (e) {
        console.log('COPY EVENT');
    };
    WhiteBoardController.prototype.onPaste = function (e) {
        console.log('PASTE EVENT');
    };
    WhiteBoardController.prototype.onCut = function (e) {
        console.log('CUT EVENT');
    };
    WhiteBoardController.prototype.dragOver = function (e) {
        e.preventDefault();
    };
    WhiteBoardController.prototype.drop = function (e) {
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var x = Math.round(e.clientX - offsetX);
        var y = Math.round(e.clientY - offsetY);
        e.preventDefault();
    };
    WhiteBoardController.prototype.palleteChange = function (change) {
        var message = { type: 36, change: change, mode: this.viewState.mode };
        this.worker.postMessage(message);
    };
    WhiteBoardController.prototype.windowResize = function (e) {
        var whitElem = document.getElementById("whiteBoard-input");
        var whitCont = document.getElementById("whiteboard-container");
        whitElem.style.width = whitCont.clientWidth + "px";
        whitElem.style.height = whitCont.clientHeight + "px";
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;
        this.setViewBox(this.panX, this.panY, this.scaleF);
    };
    WhiteBoardController.prototype.windowUnload = function (e) {
        this.socket.emit('LEAVE', null);
    };
    WhiteBoardController.prototype.mouseWheel = function (e) {
        var whitElem = document.getElementById("whiteBoard-input");
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY = elemRect.top - document.body.scrollTop;
        var offsetX = elemRect.left - document.body.scrollLeft;
        var newPanX = this.panX;
        var newPanY = this.panY;
        var newScale;
        var move = true;
        var prevScale = this.scaleNum;
        this.scaleNum = this.scaleNum - e.deltaY / 2;
        if (this.scaleNum < -5) {
            if (prevScale == -5) {
                move = false;
            }
            this.scaleNum = -5;
        }
        if (this.scaleNum > 5) {
            if (prevScale == 5) {
                move = false;
            }
            this.scaleNum = 5;
        }
        var prevPoint = newScale = Math.pow(0.8, this.scaleNum);
        var vBoxW = whitElem.clientWidth * newScale;
        var vBoxH = whitElem.clientHeight * newScale;
        if (move) {
            if (e.deltaY < 0) {
                newPanX = this.panX + (this.scaleF - newScale) * (e.clientX - offsetX);
                newPanY = this.panY + (this.scaleF - newScale) * (e.clientY - offsetY);
            }
            else {
                newPanX = this.panX - (this.scaleF - newScale) * (e.clientX - offsetX);
                newPanY = this.panY - (this.scaleF - newScale) * (e.clientY - offsetY);
            }
            if (newPanX < 0) {
                newPanX = 0;
            }
            if (newPanY < 0) {
                newPanY = 0;
            }
        }
        this.setViewBox(newPanX, newPanY, newScale);
    };
    WhiteBoardController.prototype.clearAlert = function () {
        this.removeAlert();
    };
    return WhiteBoardController;
}());
