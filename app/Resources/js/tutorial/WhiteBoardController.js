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
        this.curveChangeX = 0;
        this.curveChangeY = 0;
        this.currTextEdit = -1;
        this.currTextSel = -1;
        this.currTextMove = -1;
        this.currTextResize = -1;
        this.currCurveMove = -1;
        this.currFileMove = -1;
        this.currFileResize = -1;
        this.vertResize = false;
        this.horzResize = false;
        this.cursorStart = 0;
        this.cursorEnd = 0;
        this.startLeft = false;
        this.textDown = 0;
        this.textIdealX = 0;
        this.gettingLock = -1;
        this.curveMoved = false;
        this.textMoved = false;
        this.fileMoved = false;
        this.textResized = false;
        this.fileResized = false;
        this.isWriting = false;
        this.userHighlight = -1;
        this.currentHover = -1;
        this.currSelect = [];
        this.fileUploads = [];
        this.fileReaders = [];
        this.textDict = [];
        this.curveDict = [];
        this.uploadDict = [];
        this.hilightDict = [];
        this.boardElems = [];
        this.infoElems = [];
        this.curveOutBuffer = [];
        this.curveInBuffer = [];
        this.curveInTimeouts = [];
        this.curveOutTimeouts = [];
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
            var element = _this.getBoardElement(id);
            element.isDeleted = true;
            var newElemList = _this.viewState.boardElements.filter(function (elem) { return elem.id !== id; });
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.restoreElement = function (id) {
            var element = _this.getBoardElement(id);
            element.isDeleted = false;
            if (element.type === 'text') {
            }
            else if (element.type === 'curve') {
            }
        };
        this.addCurve = function (curveSet, userId, colour, size, updateTime, serverId) {
            var newCurve = {
                type: 'curve', id: -1, user: userId, isDeleted: false, colour: colour, size: size, curveSet: curveSet, serverId: serverId, opBuffer: [],
                x: curveSet[0].x, y: curveSet[0].y, hoverTimer: null, infoElement: null, updateTime: updateTime
            };
            var localId = _this.boardElems.length;
            _this.boardElems[localId] = newCurve;
            newCurve.id = localId;
            if (serverId) {
                _this.curveDict[serverId] = localId;
            }
            var newCurveView;
            if (curveSet.length > 1) {
                var pathText = _this.createCurveText(curveSet);
                newCurveView = {
                    type: 'path', id: localId, size: newCurve.size, colour: newCurve.colour, param: pathText, updateTime: updateTime, selected: false
                };
            }
            else {
                newCurveView = {
                    type: 'circle', id: localId, size: newCurve.size, colour: newCurve.colour, point: curveSet[0], updateTime: updateTime, selected: false
                };
            }
            var newElemList = _this.viewState.boardElements.set(newCurveView.id, newCurveView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            return localId;
        };
        this.moveCurve = function (id, changeX, changeY, updateTime) {
            var curve = _this.getCurve(id);
            curve.x += changeX;
            curve.y += changeY;
            for (var i = 0; i < curve.curveSet.length; i++) {
                curve.curveSet[i].x += changeX;
                curve.curveSet[i].y += changeY;
            }
            var newCurveView;
            if (curve.curveSet.length > 1) {
                var pathText = _this.createCurveText(curve.curveSet);
                newCurveView = Object.assign({}, _this.getViewElement(id), { param: pathText, updateTime: updateTime });
            }
            else {
                newCurveView = Object.assign({}, _this.getViewElement(id), { point: curve.curveSet, updateTime: updateTime });
            }
            var newElemList = _this.viewState.boardElements.set(id, newCurveView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.addTextbox = function (x, y, width, height, size, justified, userId, editLock, updateTime, serverId) {
            var localId;
            var remLock;
            if (serverId) {
                localId = _this.textDict[serverId];
            }
            var newText;
            if (localId == null || localId == undefined) {
                newText =
                    {
                        text: '', user: userId, isDeleted: false, x: x, y: y, size: size, styles: [], editCount: 0, type: 'text', cursor: null, cursorElems: [],
                        width: width, height: height, editLock: editLock, justified: justified, textNodes: [], dist: [0], serverId: serverId, id: 0, waiting: false,
                        opBuffer: [], hoverTimer: null, infoElement: null, updateTime: updateTime
                    };
                localId = _this.boardElems.length;
                _this.boardElems[localId] = newText;
                newText.id = localId;
            }
            else {
                newText = _this.getText(localId);
            }
            if (editLock == _this.userId) {
                remLock = false;
                if (_this.currTextEdit == -1) {
                    _this.currTextEdit = localId;
                    _this.currTextSel = localId;
                    _this.cursorStart = newText.text.length;
                    _this.cursorEnd = newText.text.length;
                    _this.gettingLock = -1;
                    _this.isWriting = true;
                    _this.changeTextSelect(localId, true);
                    _this.setMode(1);
                }
                else if (_this.currTextEdit != localId) {
                    _this.releaseText(localId);
                }
            }
            else if (editLock != 0) {
                remLock = true;
            }
            var newView = {
                x: newText.x, y: newText.y, width: newText.width, height: newText.height, isEditing: false, remLock: remLock, getLock: false, textNodes: [],
                cursor: null, cursorElems: [], id: localId, type: 'text', size: newText.size, waiting: false, updateTime: updateTime, selected: false
            };
            var newElemList = _this.viewState.boardElements.set(localId, newView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            return localId;
        };
        this.stopLockText = function (id) {
            _this.gettingLock = -1;
            _this.currTextEdit = -1;
            _this.currTextSel = -1;
            _this.isWriting = false;
            var tbox = _this.getText(id);
            tbox.editLock = 0;
            tbox.cursor = null;
            tbox.cursorElems = [];
            var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: false, isEditing: false, cursor: null, cursorElems: [] });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextGetLock = function (id) {
            _this.gettingLock = id;
            var tbox = _this.getText(id);
            tbox.editLock = _this.userId;
            _this.cursorStart = tbox.text.length;
            _this.cursorEnd = tbox.text.length;
            _this.isWriting = true;
            _this.changeTextSelect(id, true);
            var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: true });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.changeTextSelect = function (id, setIdeal) {
            var tbox = _this.getText(id);
            if (setIdeal) {
                if (_this.startLeft) {
                    _this.textIdealX = _this.findXPos(tbox, _this.cursorEnd);
                }
                else {
                    _this.textIdealX = _this.findXPos(tbox, _this.cursorStart);
                }
            }
            _this.findCursorElems(tbox, _this.cursorStart, _this.cursorEnd);
            if (tbox.styles.length > 0) {
                var i = 0;
                while (i < tbox.styles.length && tbox.styles[i].start > _this.cursorStart || tbox.styles[i].end < _this.cursorStart) {
                    i++;
                }
                var isBold = tbox.styles[i].weight == 'bold';
                var isItalic = tbox.styles[i].style == 'italic';
                var isOLine = tbox.styles[i].decoration == 'overline';
                var isULine = tbox.styles[i].decoration == 'underline';
                var isTLine = tbox.styles[i].decoration == 'line-through';
                _this.updateView(Object.assign({}, _this.viewState, { colour: tbox.styles[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine }));
            }
            var newTextViewCurr = Object.assign({}, _this.getViewElement(id), { cursor: tbox.cursor, cursorElems: tbox.cursorElems });
            var newElemList = _this.viewState.boardElements.set(id, newTextViewCurr);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextEdit = function (id) {
            _this.currTextEdit = id;
            _this.currTextSel = id;
            var tbox = _this.getText(id);
            tbox.editLock = _this.userId;
            _this.cursorStart = tbox.text.length;
            _this.cursorEnd = tbox.text.length;
            _this.gettingLock = -1;
            _this.isWriting = true;
            _this.changeTextSelect(id, true);
            var newTextView = Object.assign({}, _this.getViewElement(id), { getLock: false, isEditing: true });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { mode: 1, boardElements: newElemList }));
        };
        this.setTextLock = function (id, userId) {
            var tbox = _this.getText(id);
            tbox.editLock = userId;
            if (userId != _this.userId) {
                var newTextView = Object.assign({}, _this.getViewElement(id), { remLock: true });
                var newElemList = _this.viewState.boardElements.set(id, newTextView);
                _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            }
        };
        this.setTextUnLock = function (id) {
            var tbox = _this.getText(id);
            tbox.editLock = 0;
            var newTextView = Object.assign({}, _this.getViewElement(id), { remLock: false });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setTextJustified = function (id, state) {
            var textBox = _this.getText(id);
            textBox.justified = state;
            textBox.textNodes = _this.calculateTextLines(textBox);
            if (_this.currTextSel == id) {
                if (_this.startLeft) {
                    _this.textIdealX = _this.findXPos(textBox, _this.cursorEnd);
                }
                else {
                    _this.textIdealX = _this.findXPos(textBox, _this.cursorStart);
                }
                _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: textBox.textNodes, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            _this.sendTextJustified(id);
        };
        this.setTextArea = function (id, width, height) {
            var textBox = _this.getText(id);
            textBox.height = height;
            if (textBox.width != width) {
                textBox.width = width;
                textBox.textNodes = _this.calculateTextLines(textBox);
            }
            if (_this.currTextSel == id) {
                _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: textBox.textNodes, width: textBox.width, height: textBox.height, cursor: textBox.cursor, cursorElems: textBox.cursorElems
            });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.moveTextbox = function (id, isRelative, x, y, updateTime) {
            var textBox = _this.getText(id);
            var changeX;
            var changeY;
            if (isRelative) {
                changeX = x;
                changeY = y;
            }
            else {
                changeX = x - textBox.x;
                changeY = y - textBox.y;
            }
            textBox.x += changeX;
            textBox.y += changeY;
            for (var i = 0; i < textBox.textNodes.length; i++) {
                var node = textBox.textNodes[i];
                node.x += changeX;
                node.y += changeY;
            }
            if (_this.currTextSel == id) {
                _this.findCursorElems(textBox, _this.cursorStart, _this.cursorEnd);
            }
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                textNodes: textBox.textNodes, x: textBox.x, y: textBox.y, cursor: textBox.cursor, cursorElems: textBox.cursorElems, updateTime: updateTime
            });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.startTextWait = function (id) {
            var textItem = _this.getText(id);
            textItem.waiting = true;
            var newTextView = Object.assign({}, _this.getViewElement(id), {
                waiting: true
            });
            var newElemList = _this.viewState.boardElements.set(id, newTextView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.updateText = function (newText) {
            newText.textNodes = _this.calculateTextLines(newText);
            if (_this.currTextSel == newText.id) {
                _this.findCursorElems(newText, _this.cursorStart, _this.cursorEnd);
            }
            newText.waiting = false;
            var newTextView = Object.assign({}, _this.getViewElement(newText.id), {
                textNodes: newText.textNodes, width: newText.width, height: newText.height, cursor: newText.cursor, cursorElems: newText.cursorElems, waiting: false
            });
            var newElemList = _this.viewState.boardElements.set(newText.id, newTextView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setMode = function (newMode) {
            _this.updateView(Object.assign({}, _this.viewState, { mode: newMode }));
        };
        this.setSize = function (newSize) {
            var baseSize = _this.viewState.baseSize;
            if (newSize == 0) {
                baseSize = 0.5;
            }
            else if (newSize == 1) {
                baseSize = 1.0;
            }
            else if (newSize == 2) {
                baseSize = 2.0;
            }
            else {
                throw 'ERROR: Not a valid base size.';
            }
            _this.updateView(Object.assign({}, _this.viewState, { sizeMode: newSize, baseSize: baseSize }));
        };
        this.setColour = function (newColour) {
            _this.updateView(Object.assign({}, _this.viewState, { colour: newColour }));
        };
        this.setIsItalic = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isItalic: newState }));
        };
        this.setIsOline = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isOLine: newState }));
        };
        this.setIsUline = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isULine: newState }));
        };
        this.setIsTline = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isTLine: newState }));
        };
        this.setIsBold = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isBold: newState }));
        };
        this.setJustified = function (newState) {
            _this.updateView(Object.assign({}, _this.viewState, { isJustified: newState }));
        };
        this.addHighlight = function (x, y, width, height, userId, colour) {
            var d = new Date();
            d.setDate(d.getDate() + 50);
            var newHighlight = {
                type: 'highlight', id: -1, user: userId, isDeleted: false, serverId: -1, x: x, y: y, width: width, height: height, colour: colour,
                opBuffer: [], hoverTimer: null, infoElement: null, updateTime: d
            };
            var localId = _this.boardElems.length;
            _this.boardElems[localId] = newHighlight;
            newHighlight.id = localId;
            var newHighlightView = {
                id: localId, x: x, y: y, width: width, height: height, type: 'highlight', colour: colour, updateTime: d, selected: false
            };
            var newElemList = _this.viewState.boardElements.set(localId, newHighlightView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            return localId;
        };
        this.addFile = function (x, y, width, height, userId, isImage, fDesc, fType, extension, rotation, url, updateTime, serverId) {
            if (url === void 0) { url = ''; }
            var newUpload = {
                type: 'file', id: -1, user: userId, isDeleted: false, serverId: serverId, x: x, y: y, width: width, height: height, isImage: isImage, fType: fType,
                rotation: rotation, opBuffer: [], hoverTimer: null, infoElement: null, updateTime: updateTime
            };
            var localId = _this.boardElems.length;
            _this.boardElems[localId] = newUpload;
            newUpload.id = localId;
            var isLoading = url == '' ? true : false;
            var isUploader = userId == _this.userId || userId == 0 ? true : false;
            var newUploadView = {
                id: localId, x: x, y: y, width: width, height: height, isImage: isImage, extension: extension, rotation: rotation,
                URL: url, isLoading: isLoading, isUploader: isUploader, percentUp: 0, type: 'file', updateTime: updateTime, selected: false
            };
            var newElemList = _this.viewState.boardElements.set(localId, newUploadView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
            return localId;
        };
        this.updateProgress = function (id, percent) {
            var newFileView = Object.assign({}, _this.getViewElement(id), {
                percentUp: percent
            });
            var newElemList = _this.viewState.boardElements.set(id, newFileView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setUploadComplete = function (id, fileURL) {
            var newFileView = Object.assign({}, _this.getViewElement(id), {
                percentUp: 100, isLoading: false, URL: fileURL
            });
            var newElemList = _this.viewState.boardElements.set(id, newFileView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.moveUpload = function (id, isRelative, x, y, updateTime) {
            var file = _this.getUpload(id);
            var changeX;
            var changeY;
            if (isRelative) {
                changeX = x;
                changeY = y;
            }
            else {
                changeX = x - file.x;
                changeY = y - file.y;
            }
            file.x += changeX;
            file.y += changeY;
            var newFileView = Object.assign({}, _this.getViewElement(id), {
                x: file.x, y: file.y, updateTime: updateTime
            });
            var newElemList = _this.viewState.boardElements.set(id, newFileView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.rotateUpload = function (id) {
            var file = _this.getUpload(id);
            file.rotation += 90;
            if (file.rotation >= 360) {
                file.rotation = 0;
            }
            var newFileView = Object.assign({}, _this.getViewElement(id), {
                rotation: file.rotation
            });
            var newElemList = _this.viewState.boardElements.set(id, newFileView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setUploadArea = function (id, width, height, updateTime) {
            var file = _this.getUpload(id);
            file.height = height;
            file.width = width;
            var newFileView = Object.assign({}, _this.getViewElement(id), {
                width: file.width, height: file.height, updateTime: updateTime
            });
            var newElemList = _this.viewState.boardElements.set(id, newFileView);
            newElemList = newElemList.sort(_this.compareUpdateTime);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.setUploadRotation = function (id, rotation) {
            var file = _this.getUpload(id);
            file.rotation = rotation;
            var newFileView = Object.assign({}, _this.getViewElement(id), {
                rotation: file.rotation
            });
            var newElemList = _this.viewState.boardElements.set(id, newFileView);
            _this.updateView(Object.assign({}, _this.viewState, { boardElements: newElemList }));
        };
        this.startMove = function () {
            _this.updateView(Object.assign({}, _this.viewState, { itemMoving: true }));
        };
        this.endMove = function () {
            _this.currTextMove = -1;
            _this.currCurveMove = -1;
            _this.currFileMove = -1;
            _this.updateView(Object.assign({}, _this.viewState, { itemMoving: false }));
        };
        this.startResize = function (horz, vert) {
            _this.updateView(Object.assign({}, _this.viewState, { itemResizing: true, resizeHorz: horz, resizeVert: vert }));
        };
        this.endResize = function () {
            _this.currFileResize = -1;
            _this.currTextResize = -1;
            _this.updateView(Object.assign({}, _this.viewState, { itemResizing: false }));
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
            _this.updateView(Object.assign({}, _this.viewState, { viewBox: newVBox, viewX: panX, viewY: panY, viewWidth: vBoxW, viewHeight: vBoxH, viewScale: scaleF }));
        };
        this.getStyle = function () {
            return _this.viewState.isItalic ? 'italic' : 'normal';
        };
        this.getWeight = function () {
            return _this.viewState.isBold ? 'bold' : 'normal';
        };
        this.getDecoration = function () {
            if (_this.viewState.isOLine) {
                return 'overline';
            }
            else if (_this.viewState.isTLine) {
                return 'line-through';
            }
            else if (_this.viewState.isULine) {
                return 'underline';
            }
            else {
                return 'none';
            }
        };
        this.getBoardElement = function (id) {
            if (_this.boardElems[id]) {
                return _this.boardElems[id];
            }
            else {
                throw 'Element does not exist';
            }
        };
        this.getCurve = function (id) {
            if (_this.getBoardElement(id).type == 'curve') {
                return _this.getBoardElement(id);
            }
            else {
                console.log('Type was: ' + _this.getBoardElement(id).type);
                throw 'Element is not of curve type';
            }
        };
        this.getText = function (id) {
            if (_this.getBoardElement(id).type == 'text') {
                return _this.getBoardElement(id);
            }
            else {
                console.log('Type was: ' + _this.getBoardElement(id).type);
                throw 'Element is not of text type';
            }
        };
        this.getHighlight = function (id) {
            if (_this.getBoardElement(id).type == 'highlight') {
                return _this.getBoardElement(id);
            }
            else {
                console.log('Type was: ' + _this.getBoardElement(id).type);
                throw 'Element is not of highlight type';
            }
        };
        this.getUpload = function (id) {
            if (_this.getBoardElement(id).type == 'file') {
                return _this.getBoardElement(id);
            }
            else {
                console.log('Type was: ' + _this.getBoardElement(id).type);
                throw 'Element is not of upload type';
            }
        };
        this.getViewElement = function (id) {
            return _this.viewState.boardElements.get(id);
        };
        this.getInfoMessage = function (id) {
            return _this.infoElems[id];
        };
        this.addHoverInfo = function (id) {
            var elem = _this.getBoardElement(id);
            var infoId = _this.addInfoMessage(_this.mouseX, _this.mouseY, 200, 200, 'Test Message', 'User ID: ' + elem.user);
            elem.infoElement = infoId;
        };
        this.removeHoverInfo = function (id) {
            var elem = _this.getBoardElement(id);
            elem.infoElement = null;
            _this.removeInfoMessage(elem.infoElement);
        };
        this.newEdit = function (textBox) {
            textBox.editCount++;
            if (textBox.editCount > 5) {
                textBox.editCount = 0;
                clearTimeout(_this.editTimer);
                _this.textEdited(textBox);
            }
            else {
                var self = _this;
                clearTimeout(_this.editTimer);
                _this.editTimer = setTimeout(function (tBox) {
                    tBox.editCount = 0;
                    self.textEdited(tBox);
                    clearTimeout(this.editTimer);
                }, 6000, textBox);
            }
            return textBox;
        };
        this.drawCurve = function (points, size, colour, scaleF, panX, panY) {
            var reducedPoints;
            var curves;
            if (points.length > 1) {
                reducedPoints = SmoothCurve(points);
                reducedPoints = DeCluster(reducedPoints, 10);
                for (var i = 0; i < reducedPoints.length; i++) {
                    reducedPoints[i].x = reducedPoints[i].x * scaleF + panX;
                    reducedPoints[i].y = reducedPoints[i].y * scaleF + panY;
                }
                curves = FitCurve(reducedPoints, reducedPoints.length, 5);
            }
            else {
                curves = [];
                curves[0] = { x: points[0].x * scaleF + panX, y: points[0].y * scaleF + panY };
            }
            var localId = _this.addCurve(curves, _this.userId, colour, size, new Date());
            _this.sendCurve(localId, curves, colour, size);
        };
        this.sendCurve = function (localId, curves, colour, size) {
            var self = _this;
            _this.curveOutBuffer[localId] = { serverId: 0, localId: localId, colour: colour, curveSet: curves, size: size };
            _this.curveOutTimeouts[localId] = setInterval(function () {
                var msg = { localId: localId, colour: colour, num_points: curves.length, size: size, x: curves[0].x, y: curves[0].y };
                self.socket.emit('CURVE', msg);
            }, 60000);
            var msg = { localId: localId, colour: colour, num_points: curves.length, size: size, x: curves[0].x, y: curves[0].y };
            _this.socket.emit('CURVE', msg);
        };
        this.sendCurveMove = function (id) {
            var curve = _this.getCurve(id);
            if (curve.serverId) {
                var msg = { serverId: curve.serverId, x: curve.x, y: curve.y };
                _this.socket.emit('MOVE-CURVE', msg);
            }
            else {
                var msg = { serverId: null, x: curve.x, y: curve.y };
                var newOp = { type: 'MOVE-CURVE', message: msg };
                curve.opBuffer.push(newOp);
            }
        };
        this.deleteCurve = function (id) {
            var curve = _this.getCurve(id);
            if (curve.serverId) {
                _this.socket.emit('DELETE-CURVE', curve.serverId);
            }
            else {
                var newOp = { type: 'DELETE-CURVE', message: null };
                curve.opBuffer.push(newOp);
            }
            _this.deleteElement(id);
        };
        this.placeHighlight = function (mouseX, mouseY, scaleF, panX, panY, rectWidth, rectHeight) {
            var x = scaleF * mouseX + panX;
            var y = scaleF * mouseY + panY;
            var width = rectWidth * scaleF;
            var height = rectHeight * scaleF;
            var localId = _this.addHighlight(x, y, width, height, _this.userId, 0xffff00);
            _this.userHighlight = localId;
            _this.sendHighlight(x, y, width, height);
        };
        this.sendHighlight = function (posX, posY, width, height) {
            var hMsg = { x: posX, y: posY, width: width, height: height };
            _this.socket.emit('HIGHLIGHT', hMsg);
        };
        this.clearHighlight = function () {
            if (_this.userHighlight != -1) {
                _this.deleteElement(_this.userHighlight);
                _this.userHighlight = -1;
                _this.socket.emit('CLEAR-HIGHLIGHT', null);
            }
        };
        this.placeLocalFile = function (mouseX, mouseY, scaleF, panX, panY, file) {
            var x = scaleF * mouseX + panX;
            var y = scaleF * mouseY + panY;
            var width = 200 * scaleF;
            var height = 200 * scaleF;
            var isImage = false;
            var fType = file.name.split('.').pop();
            var mType = file.type;
            var size = file.size;
            console.log('File type is: ' + file.type);
            if (mType.match(/octet-stream/)) {
                _this.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
            }
            else {
                isImage = mType.split('/')[0] == 'image' ? true : false;
                if (!isImage) {
                    width = 150 * scaleF;
                }
                if (size < 10485760) {
                    var localId = _this.addFile(x, y, width, height, _this.userId, isImage, file.name, file.type, fType, 0, undefined, new Date());
                    _this.sendLocalFile(x, y, width, height, file, localId);
                }
                else {
                    _this.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
                }
            }
        };
        this.sendLocalFile = function (posX, posY, width, height, file, localId) {
            var newReader = new FileReader();
            var self = _this;
            newReader.onload = function (e) {
                var serverId = self.getBoardElement(localId).serverId;
                var newDataMsg = { serverId: serverId, piece: e.target.result };
                self.socket.emit('FILE-DATA', newDataMsg);
            };
            _this.fileUploads[localId] = file;
            _this.fileReaders[localId] = newReader;
            var fExtension = file.name.split('.').pop();
            var fileMsg = { localId: localId, x: posX, y: posY, width: width, height: height, fileSize: file.size, fileName: file.name, fileType: file.type, extension: fExtension };
            _this.socket.emit('FILE-START', fileMsg);
        };
        this.sendFileData = function (serverId, place, percent, attempt) {
            if (attempt === void 0) { attempt = 0; }
            var localId = _this.uploadDict[serverId];
            if (localId == null || localId == undefined) {
                if (attempt < 5) {
                    setTimeout(_this.sendFileData.bind(_this), 1000, serverId, place, percent, ++attempt);
                }
                else {
                    _this.socket.emit('STOP-FILE', serverId);
                }
            }
            else {
                _this.updateProgress(localId, percent);
                var file = _this.fileUploads[localId];
                var reader = _this.fileReaders[localId];
                var nplace = place * 65536;
                var newFile = file.slice(nplace, nplace + Math.min(65536, (file.size - nplace)));
                console.log('Sending File piece: ' + (place + 1) + ' out of ' + (Math.floor(file.size / 65536) + 1));
                reader.readAsArrayBuffer(newFile);
            }
        };
        this.placeRemoteFile = function (mouseX, mouseY, scaleF, panX, panY, url) {
            console.log('Remote File Placed');
            var x = scaleF * mouseX + panX;
            var y = scaleF * mouseY + panY;
            var width = 200 * scaleF;
            var height = 200 * scaleF;
            var loc = document.createElement("a");
            loc.href = url;
            var path = loc.pathname;
            var fType = path.split('.').pop();
            var fDesc = '';
            var isImage = false;
            var self = _this;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    var type = request.getResponseHeader('Content-Type');
                    var size = parseInt(request.getResponseHeader('Content-Length'));
                    if (size > 10485760) {
                        self.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
                    }
                    else {
                        if (type.match(/octete-stream/)) {
                            self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
                        }
                        else {
                            if (type.match(/image/)) {
                                isImage = true;
                            }
                            var localId = self.addFile(x, y, width, height, self.userId, isImage, fDesc, fType, fType, 0, undefined, new Date());
                            self.sendRemoteFile(x, y, width, height, url, localId);
                        }
                    }
                }
            };
            request.open('HEAD', url, true);
            request.send(null);
        };
        this.sendRemoteFile = function (posX, posY, width, height, url, localId) {
            console.log('Sending Remote File.');
            var msg = { localId: localId, fileURL: url, x: posX, y: posY, width: width, height: height, fileDesc: '' };
            _this.socket.emit('REMOTE-FILE', msg);
        };
        this.resizeFile = function (id, width, height) {
            var file = _this.getUpload(id);
            _this.setUploadArea(id, width, height, new Date());
        };
        this.sendFileMove = function (id) {
            var file = _this.getUpload(_this.currFileMove);
            if (file.serverId) {
                var msg = { serverId: file.serverId, x: file.x, y: file.y };
                _this.socket.emit('MOVE-FILE', msg);
            }
            else {
                var msg = { serverId: null, x: file.x, y: file.y };
                var newOp = { type: 'MOVE-FILE', message: msg };
                file.opBuffer.push(newOp);
            }
        };
        this.sendFileResize = function (id) {
            var file = _this.getUpload(_this.currFileResize);
            if (file.serverId) {
                var msg = { serverId: file.serverId, width: file.width, height: file.height };
                _this.socket.emit('RESIZE-FILE', msg);
            }
            else {
                var msg = { serverId: null, width: file.width, height: file.height };
                var newOp = { type: 'RESIZE-FILE', message: msg };
                file.opBuffer.push(newOp);
            }
        };
        this.sendFileRotate = function (id) {
            var file = _this.getUpload(id);
            if (file.serverId) {
                var msg = { serverId: file.serverId, rotation: file.rotation };
                _this.socket.emit('ROTATE-FILE', msg);
            }
            else {
                var msg = { serverId: null, rotation: file.rotation };
                var newOp = { type: 'ROTATE-FILE', message: msg };
                file.opBuffer.push(newOp);
            }
        };
        this.deleteFile = function (id) {
            var fileBox = _this.getUpload(id);
            if (fileBox.serverId) {
                _this.socket.emit('DELETE-FILE', fileBox.serverId);
            }
            else {
                var newOp = { type: 'DELETE-FILE', message: null };
                fileBox.opBuffer.push(newOp);
            }
            _this.deleteElement(id);
        };
        this.releaseText = function (id) {
            var textBox = _this.getText(id);
            _this.stopLockText(id);
            if (textBox.serverId) {
                var msg = { serverId: textBox.serverId };
                _this.socket.emit('RELEASE-TEXT', msg);
            }
            else {
                var msg = { serverId: null };
                var newOp = { type: 'RELEASE-TEXT', message: msg };
                textBox.opBuffer.push(newOp);
            }
        };
        this.sendTextJustified = function (id) {
            var textBox = _this.getText(id);
            if (textBox.serverId) {
                var msg = { serverId: textBox.serverId, newState: !_this.viewState.isJustified };
                _this.socket.emit('JUSTIFY-TEXT', msg);
            }
            else {
                var msg = { serverId: null, newState: !_this.viewState.isJustified };
                var newOp = { type: 'JUSTIFY-TEXT', message: msg };
                textBox.opBuffer.push(newOp);
            }
        };
        this.textEdited = function (textbox) {
            var buffer;
            var editNum;
            if (_this.textOutBuffer[textbox.id]) {
                buffer = _this.textOutBuffer[textbox.id];
                editNum = buffer.editCount;
                buffer.editCount++;
            }
            else {
                buffer = {
                    id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, lastSent: 0,
                    height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified, styles: []
                };
                buffer.styles = textbox.styles.slice();
                editNum = 0;
            }
            buffer.editBuffer[editNum] = { num_nodes: textbox.styles.length, nodes: [] };
            for (var i = 0; i < textbox.styles.length; i++) {
                buffer.editBuffer[editNum].nodes.push({ num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                    weight: textbox.styles[i].weight, decoration: textbox.styles[i].decoration, style: textbox.styles[i].style,
                    start: textbox.styles[i].start, end: textbox.styles[i].end, editId: editNum
                });
            }
            _this.textOutBuffer[textbox.id] = buffer;
            if (textbox.serverId) {
                var msg = { serverId: textbox.serverId, localId: editNum, bufferId: textbox.id, num_nodes: textbox.styles.length };
                _this.socket.emit('EDIT-TEXT', msg);
            }
            else {
                var msg = {
                    localId: textbox.id, x: _this.textOutBuffer[textbox.id].x, y: _this.textOutBuffer[textbox.id].y, size: _this.textOutBuffer[textbox.id].size,
                    width: _this.textOutBuffer[textbox.id].width, height: _this.textOutBuffer[textbox.id].height, justified: _this.textOutBuffer[textbox.id].justified
                };
                _this.socket.emit('TEXTBOX', msg);
            }
        };
        this.resizeText = function (id, width, height) {
            var textBox = _this.getText(id);
            _this.setTextArea(id, width, height);
        };
        this.sendTextMove = function (id) {
            var tbox = _this.getText(_this.currTextMove);
            if (tbox.serverId) {
                var msg = { serverId: tbox.serverId, x: tbox.x, y: tbox.y };
                _this.socket.emit('MOVE-TEXT', msg);
            }
            else {
                var msg = { serverId: null, x: tbox.x, y: tbox.y };
                var newOp = { type: 'MOVE-TEXT', message: msg };
                tbox.opBuffer.push(newOp);
            }
        };
        this.sendTextResize = function (id) {
            var textBox = _this.getText(id);
            if (textBox.serverId) {
                var msg = { serverId: textBox.serverId, width: textBox.width, height: textBox.height };
                _this.socket.emit('RESIZE-TEXT', msg);
            }
            else {
                var msg = { serverId: null, width: textBox.width, height: textBox.height };
                var newOp = { type: 'RESIZE-TEXT', message: msg };
                textBox.opBuffer.push(newOp);
            }
        };
        this.deleteText = function (id) {
            var textBox = _this.getText(id);
            if (textBox.serverId) {
                _this.socket.emit('DELETE-TEXT', textBox.serverId);
            }
            else {
                var newOp = { type: 'DELETE-TEXT', message: null };
                textBox.opBuffer.push(newOp);
            }
            _this.deleteElement(id);
        };
        this.lockText = function (id) {
            var textBox = _this.getText(id);
            _this.setTextGetLock(id);
            if (textBox.serverId) {
                var msg = { serverId: textBox.serverId };
                _this.socket.emit('LOCK-TEXT', msg);
            }
            else {
                var msg = { serverId: null };
                var newOp = { type: 'LOCK-TEXT', message: msg };
                textBox.opBuffer.push(newOp);
            }
        };
        this.isCurrentStyle = function (style) {
            if (style.colour == _this.viewState.colour && style.decoration == _this.getDecoration() && style.weight == _this.getWeight() && style.style == _this.getStyle()) {
                return true;
            }
            else {
                return false;
            }
        };
        this.findXPos = function (textbox, loc) {
            if (textbox.textNodes.length == 0) {
                return 0;
            }
            var i = 1;
            while (i < textbox.textNodes.length && textbox.textNodes[i].start <= loc) {
                i++;
            }
            var line = textbox.textNodes[i - 1];
            if (line.styles.length == 0) {
                return 0;
            }
            i = 1;
            while (i < line.styles.length && line.styles[i].locStart + line.start <= loc) {
                i++;
            }
            var style = line.styles[i - 1];
            if (line.start + style.locStart == loc) {
                return style.startPos;
            }
            else {
                var currMes = textbox.dist[loc] - textbox.dist[line.start + style.locStart];
                return currMes + style.startPos;
            }
        };
        this.findTextPos = function (textbox, x, y) {
            var whitElem = document.getElementById("whiteBoard-output");
            var elemRect = whitElem.getBoundingClientRect();
            var xFind = 0;
            if (y < textbox.y) {
                return 0;
            }
            else {
                var lineNum = Math.floor(((y - textbox.y) / (1.5 * textbox.size)) + 0.15);
                if (lineNum >= textbox.textNodes.length) {
                    return textbox.text.length;
                }
                if (!textbox.textNodes[lineNum]) {
                    console.log('Line is: ' + lineNum);
                }
                if (x > textbox.x) {
                    if (x > textbox.x + textbox.width) {
                        return textbox.textNodes[lineNum].end;
                    }
                    else {
                        xFind = x - textbox.x;
                    }
                }
                else {
                    return textbox.textNodes[lineNum].start;
                }
                var line = textbox.textNodes[lineNum];
                if (line.styles.length == 0) {
                    return line.start;
                }
                var i = 0;
                while (i < line.styles.length && xFind > line.styles[i].startPos) {
                    i++;
                }
                var curr = i - 1;
                var style = line.styles[i - 1];
                i = style.text.length - 1;
                var currMes = textbox.dist[line.start + style.locStart + style.text.length - 1] - textbox.dist[line.start + style.locStart];
                while (i > 0 && style.startPos + currMes > xFind) {
                    i--;
                    currMes = textbox.dist[line.start + style.locStart + i] - textbox.dist[line.start + style.locStart];
                }
                var selPoint;
                if (i < style.text.length - 1) {
                    if (xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind) {
                        selPoint = line.start + style.locStart + i + 1;
                    }
                    else {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                else if (curr + 1 < line.styles.length) {
                    if (xFind - (style.startPos + currMes) > line.styles[curr + 1].startPos - xFind) {
                        selPoint = line.start + line.styles[curr + 1].locStart;
                    }
                    else {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                else {
                    if (xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind) {
                        selPoint = line.start + style.locStart + i + 1;
                    }
                    else {
                        selPoint = line.start + style.locStart + i;
                    }
                }
                return selPoint;
            }
        };
        this.findCursorElems = function (textbox, cursorStart, cursorEnd) {
            textbox.cursorElems = [];
            if (textbox.textNodes.length == 0) {
                textbox.cursor = { x: textbox.x, y: textbox.y, height: 1.5 * textbox.size };
            }
            for (var i = 0; i < textbox.textNodes.length; i++) {
                var line = textbox.textNodes[i];
                var selStart = null;
                var selEnd = null;
                var startFound = false;
                var endFound = false;
                if (cursorStart >= line.start && cursorStart <= line.end) {
                    if (cursorStart == line.end && !line.endCursor) {
                        selStart = textbox.width;
                    }
                    else {
                        for (var j = 0; j < line.styles.length && !startFound; j++) {
                            var style = line.styles[j];
                            selStart = 0;
                            selStart += style.dx;
                            if (cursorStart <= line.start + style.locStart + style.text.length) {
                                startFound = true;
                                selStart += style.startPos + textbox.dist[cursorStart] - textbox.dist[line.start + style.locStart];
                            }
                        }
                    }
                }
                else if (cursorStart < line.start && cursorEnd > line.start) {
                    selStart = 0;
                }
                if (cursorEnd > line.start && cursorEnd <= line.end) {
                    if (cursorEnd == line.end && !line.endCursor) {
                        selEnd = textbox.width;
                    }
                    else {
                        for (var j = 0; j < line.styles.length && !endFound; j++) {
                            var style = line.styles[j];
                            selEnd = 0;
                            selEnd += style.dx;
                            if (cursorEnd <= line.start + style.locStart + style.text.length) {
                                endFound = true;
                                selEnd += style.startPos + textbox.dist[cursorEnd] - textbox.dist[line.start + style.locStart];
                            }
                        }
                    }
                }
                else if (cursorEnd >= line.end && cursorStart <= line.end) {
                    selEnd = textbox.width;
                }
                if (cursorEnd >= line.start && cursorEnd <= line.end && (_this.startLeft || cursorStart == cursorEnd) && line.start != line.end) {
                    if (cursorEnd != line.end || line.endCursor) {
                        textbox.cursor = { x: textbox.x + selEnd, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                    }
                }
                else if (cursorStart >= line.start && cursorStart <= line.end && (!_this.startLeft || cursorStart == cursorEnd)) {
                    if (cursorStart != line.end || line.endCursor) {
                        textbox.cursor = { x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                    }
                }
                if (selStart != null && selEnd != null && cursorStart != cursorEnd) {
                    textbox.cursorElems.push({ x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, width: selEnd - selStart, height: 1.5 * textbox.size });
                }
            }
        };
        this.calculateLengths = function (textbox, start, end, prevEnd) {
            var whitElem = document.getElementById("whiteBoard-output");
            var tMount;
            var startPoint;
            var styleNode;
            var change = 0;
            var style = 0;
            var oldDist = textbox.dist.slice();
            while (style - 1 < textbox.styles.length && textbox.styles[style].end <= start - 2) {
                style++;
            }
            if (start > 1) {
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                var charLength1;
                var charLength2;
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 2)));
                tMount.appendChild(styleNode);
                charLength1 = styleNode.getComputedTextLength();
                if (textbox.styles[style].end <= start - 1) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 1)));
                tMount.appendChild(styleNode);
                charLength2 = styleNode.getComputedTextLength();
                startPoint = textbox.dist[start - 1] + tMount.getComputedTextLength() - charLength1 - charLength2;
                whitElem.removeChild(tMount);
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 1)));
                tMount.appendChild(styleNode);
                if (textbox.styles[style].end <= start) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
                tMount.appendChild(styleNode);
                textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
            }
            else if (start > 0) {
                startPoint = 0;
                if (textbox.styles[style].end <= start - 1) {
                    style++;
                }
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start - 1)));
                tMount.appendChild(styleNode);
                if (textbox.styles[style].end <= start) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
                tMount.appendChild(styleNode);
                textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
            }
            else {
                startPoint = 0;
                style = 0;
                tMount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tMount.setAttributeNS(null, "opacity", '0');
                tMount.setAttributeNS(null, "x", '' + textbox.x);
                tMount.setAttributeNS(null, "font-size", '' + textbox.size);
                tMount.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'space', 'preserve');
                whitElem.appendChild(tMount);
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
                tMount.appendChild(styleNode);
                textbox.dist[1] = startPoint + tMount.getComputedTextLength();
            }
            for (var i = start + 1; i < end; i++) {
                if (textbox.styles[style].end <= i) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(i)));
                tMount.appendChild(styleNode);
                textbox.dist[i + 1] = startPoint + tMount.getComputedTextLength();
            }
            if (end < textbox.text.length) {
                if (textbox.styles[style].end <= end) {
                    style++;
                }
                styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
                styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
                styleNode.appendChild(document.createTextNode(textbox.text.charAt(end)));
                tMount.appendChild(styleNode);
                change = startPoint + tMount.getComputedTextLength() - oldDist[prevEnd + 1];
                for (var i = end; i < textbox.text.length; i++) {
                    textbox.dist[i + 1] = oldDist[i + 1 + prevEnd - end] + change;
                }
            }
            whitElem.removeChild(tMount);
        };
        this.calculateTextLines = function (textbox) {
            var i;
            var childText = [];
            var currPos = 0;
            var prevPos = 0;
            var txtStart = 0;
            var isWhiteSpace = true;
            var dy = textbox.size;
            var ddy = 1.5 * textbox.size;
            var nodeCounter;
            var computedTextLength;
            var wordC;
            var spaceC;
            var line;
            var wordsT = [];
            var spacesT = [];
            var startSpace = true;
            var currY = textbox.y;
            var lineCount = 0;
            if (!textbox.text.length) {
                return [];
            }
            for (i = 0; i < textbox.text.length; i++) {
                if (isWhiteSpace) {
                    if (!textbox.text.charAt(i).match(/\s/)) {
                        if (i > 0) {
                            spacesT.push(textbox.text.substring(txtStart, i));
                            txtStart = i;
                            isWhiteSpace = false;
                        }
                        else {
                            startSpace = false;
                            isWhiteSpace = false;
                        }
                    }
                }
                else {
                    if (textbox.text.charAt(i).match(/\s/)) {
                        wordsT.push(textbox.text.substring(txtStart, i));
                        txtStart = i;
                        isWhiteSpace = true;
                    }
                }
            }
            if (isWhiteSpace) {
                spacesT.push(textbox.text.substring(txtStart, i));
            }
            else {
                wordsT.push(textbox.text.substring(txtStart, i));
            }
            wordC = 0;
            spaceC = 0;
            nodeCounter = 0;
            var nLineTrig;
            while (wordC < wordsT.length || spaceC < spacesT.length) {
                var lineComplete = false;
                var word;
                currY += dy;
                var currLength = 0;
                var tspanEl = {
                    styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                    justified: textbox.justified, lineNum: lineCount, text: ''
                };
                var progPos = true;
                nLineTrig = false;
                if (startSpace) {
                    var fLine = spacesT[spaceC].indexOf('\n');
                    if (fLine != -1) {
                        if (spacesT[spaceC].length > 1) {
                            if (fLine == 0) {
                                nLineTrig = true;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                            }
                            else {
                                progPos = false;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                            }
                        }
                        else {
                            nLineTrig = true;
                            startSpace = !startSpace;
                        }
                    }
                    if (spaceC >= spacesT.length) {
                        console.error('ERROR: Space array out of bounds');
                        return [];
                    }
                    word = spacesT[spaceC];
                    spaceC++;
                }
                else {
                    if (wordC >= wordsT.length) {
                        console.error('ERROR: Word array out of bounds');
                        return [];
                    }
                    word = wordsT[wordC];
                    wordC++;
                }
                if (nLineTrig) {
                    word = '';
                    lineComplete = true;
                    tspanEl.justified = false;
                    tspanEl.end = currPos;
                    currPos++;
                    prevPos = currPos;
                }
                computedTextLength = textbox.dist[currPos + word.length] - textbox.dist[currPos];
                if (computedTextLength > textbox.width) {
                    lineComplete = true;
                    fDash = word.indexOf('-');
                    if (fDash != -1 && computedTextLength > textbox.width) {
                        var newStr = word.substring(fDash + 1, word.length);
                        wordsT.splice(wordC, 0, newStr);
                        word = word.substring(0, fDash + 1);
                    }
                    i = word.length;
                    while (computedTextLength > textbox.width && i > 0) {
                        computedTextLength = textbox.dist[currPos + word.substring(0, i).length] - textbox.dist[currPos];
                        i--;
                    }
                    if (computedTextLength <= textbox.width) {
                        if (startSpace) {
                            if (i + 2 < word.length) {
                                spacesT.splice(spaceC, 0, word.substring(i + 2, word.length));
                            }
                            else {
                                startSpace = !startSpace;
                            }
                            word = word.substring(0, i + 1);
                            currPos += word.length;
                            tspanEl.end = currPos;
                            prevPos = currPos + 1;
                        }
                        else {
                            wordsT.splice(wordC, 0, word.substring(i + 1, word.length));
                            word = word.substring(0, i + 1);
                            currPos += word.length;
                            tspanEl.end = currPos;
                            tspanEl.endCursor = false;
                            prevPos = currPos;
                        }
                    }
                    else {
                        console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                    }
                }
                else {
                    currPos += word.length;
                    if (!nLineTrig && progPos) {
                        startSpace = !startSpace;
                    }
                }
                line = word;
                currLength = computedTextLength;
                while (!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length)) {
                    if (startSpace) {
                        var fLine = spacesT[spaceC].indexOf('\n');
                        if (fLine != -1) {
                            if (spacesT[spaceC].length > 1) {
                                if (fLine == 0) {
                                    nLineTrig = true;
                                    spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                    spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                                }
                                else {
                                    progPos = false;
                                    spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                    spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                                }
                            }
                            else {
                                nLineTrig = true;
                                startSpace = !startSpace;
                            }
                        }
                        word = spacesT[spaceC];
                    }
                    else {
                        word = wordsT[wordC];
                    }
                    if (nLineTrig) {
                        word = '';
                        lineComplete = true;
                        tspanEl.justified = false;
                        tspanEl.end = currPos;
                        currPos++;
                        prevPos = currPos;
                    }
                    computedTextLength = currLength + textbox.dist[currPos + word.length] - textbox.dist[currPos];
                    if (computedTextLength > textbox.width) {
                        lineComplete = true;
                        if (startSpace) {
                            if (word.length > 1) {
                                i = word.length - 1;
                                while (computedTextLength > textbox.width && i > 0) {
                                    computedTextLength = currLength + textbox.dist[currPos + i] - textbox.dist[currPos];
                                    i--;
                                }
                                if (computedTextLength <= textbox.width) {
                                    if (i + 2 < word.length) {
                                        var newStr = word.substring(i + 2, word.length);
                                        spacesT.splice(spaceC, 0, newStr);
                                        line += word.substring(0, i + 1);
                                        currPos += word.substring(0, i + 1).length;
                                        tspanEl.end = currPos;
                                        currPos++;
                                        prevPos = currPos;
                                        spaceC++;
                                    }
                                    else {
                                        line += word.substring(0, i + 1);
                                        currPos += word.substring(0, i + 1).length;
                                        tspanEl.end = currPos;
                                        currPos++;
                                        prevPos = currPos;
                                        startSpace = !startSpace;
                                        spaceC++;
                                    }
                                    currLength = computedTextLength;
                                }
                                else {
                                    computedTextLength = currLength + textbox.dist[currPos + word.length - 1] - textbox.dist[currPos];
                                    tspanEl.end = currPos;
                                    prevPos = currPos + 1;
                                    spacesT[spaceC] = spacesT[spaceC].substring(1, spacesT[spaceC].length);
                                }
                            }
                            else {
                                computedTextLength = currLength;
                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                                startSpace = !startSpace;
                                spaceC++;
                            }
                        }
                        else {
                            var fDash = word.indexOf('-');
                            if (fDash != -1) {
                                computedTextLength = currLength + textbox.dist[currPos + fDash + 1] - textbox.dist[currPos];
                                if (computedTextLength <= textbox.width) {
                                    var newStr = word.substring(fDash + 1, word.length);
                                    wordsT.splice(wordC, 0, newStr);
                                    wordC++;
                                    line += word.substring(0, fDash + 1);
                                    currPos += word.substring(0, fDash + 1).length;
                                    tspanEl.end = currPos;
                                    tspanEl.endCursor = false;
                                    prevPos = currPos;
                                    currLength = computedTextLength;
                                }
                                else {
                                    computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];
                                    line = line.substring(0, line.length - 1);
                                    tspanEl.end = currPos;
                                    currPos++;
                                    prevPos = currPos;
                                }
                            }
                            else {
                                computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];
                                line = line.substring(0, line.length - 1);
                                tspanEl.end = currPos - 1;
                                prevPos = currPos;
                            }
                        }
                    }
                    else {
                        line += word;
                        currPos += word.length;
                        if (nLineTrig) {
                            spaceC++;
                        }
                        else {
                            if (startSpace) {
                                spaceC++;
                            }
                            else {
                                wordC++;
                            }
                            if (progPos) {
                                startSpace = !startSpace;
                            }
                        }
                        currLength = computedTextLength;
                    }
                }
                tspanEl.end = tspanEl.start + line.length;
                tspanEl.text = line;
                dy = ddy;
                nodeCounter = 0;
                if (wordC == wordsT.length && spaceC == spacesT.length) {
                    tspanEl.justified = false;
                }
                var reqAdjustment = textbox.width - computedTextLength;
                var numSpaces = tspanEl.text.length - tspanEl.text.replace(/\s/g, "").length;
                var extraSpace = reqAdjustment / numSpaces;
                var currStart = 0;
                var currLoc = 0;
                for (var j = 0; j < textbox.styles.length; j++) {
                    if (textbox.styles[j].start < tspanEl.end && textbox.styles[j].end > tspanEl.start) {
                        var startPoint = (textbox.styles[j].start < tspanEl.start) ? 0 : (textbox.styles[j].start - tspanEl.start);
                        var endPoint = (textbox.styles[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (textbox.styles[j].end - tspanEl.start);
                        var styleText = tspanEl.text.slice(startPoint, endPoint);
                        var newStyle;
                        word = '';
                        for (i = 0; i < styleText.length; i++) {
                            if (styleText.charAt(i).match(/\s/)) {
                                if (word.length > 0) {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: word, colour: textbox.styles[j].colour, dx: 0, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += textbox.dist[tspanEl.start + currLoc + word.length] - textbox.dist[tspanEl.start + currLoc];
                                    currLoc += word.length;
                                    word = '';
                                    tspanEl.styles.push(newStyle);
                                    nodeCounter++;
                                }
                                if (tspanEl.justified) {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: styleText.charAt(i), colour: textbox.styles[j].colour, dx: extraSpace, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += extraSpace + textbox.dist[tspanEl.start + currLoc + 1] - textbox.dist[tspanEl.start + currLoc];
                                }
                                else {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: styleText.charAt(i), colour: textbox.styles[j].colour, dx: 0, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += textbox.dist[tspanEl.start + currLoc + 1] - textbox.dist[tspanEl.start + currLoc];
                                }
                                currLoc += 1;
                                tspanEl.styles.push(newStyle);
                                nodeCounter++;
                            }
                            else {
                                word += styleText.charAt(i);
                                if (i == styleText.length - 1) {
                                    newStyle =
                                        {
                                            key: nodeCounter, text: word, colour: textbox.styles[j].colour, dx: 0, locStart: currLoc,
                                            decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                        };
                                    currStart += textbox.dist[tspanEl.start + currLoc + word.length] - textbox.dist[tspanEl.start + currLoc];
                                    currLoc += word.length;
                                    tspanEl.styles.push(newStyle);
                                    nodeCounter++;
                                }
                            }
                        }
                    }
                }
                childText.push(tspanEl);
                lineCount++;
            }
            if (nLineTrig) {
                tspanEl = {
                    styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                    justified: false, lineNum: lineCount, text: ''
                };
                lineCount++;
                childText.push(tspanEl);
            }
            if (lineCount * 1.5 * textbox.size > textbox.height) {
                _this.resizeText(textbox.id, textbox.width, lineCount * 1.5 * textbox.size);
                _this.sendTextResize(textbox.id);
            }
            return childText;
        };
        this.findXHelper = function (textItem, isUp, relative) {
            var i;
            var line;
            if (isUp) {
                i = 1;
                while (i < textItem.textNodes.length && relative > textItem.textNodes[i].end) {
                    i++;
                }
                line = textItem.textNodes[i - 1];
            }
            else {
                i = 0;
                while (i < textItem.textNodes.length - 1 && relative > textItem.textNodes[i].end) {
                    i++;
                }
                line = textItem.textNodes[i + 1];
            }
            i = 0;
            while (i < line.styles.length && _this.textIdealX >= line.styles[i].startPos) {
                i++;
            }
            var curr = i - 1;
            var style = line.styles[i - 1];
            var currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
            i = style.text.length - 1;
            while (i > 0 && style.startPos + currMes > _this.textIdealX) {
                i--;
                currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
            }
            if (i < style.text.length - 1) {
                if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                    return line.start + style.locStart + i + 1;
                }
                else {
                    return line.start + style.locStart + i;
                }
            }
            else if (curr + 1 < line.styles.length) {
                if (_this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - _this.textIdealX) {
                    return line.start + line.styles[curr + 1].locStart;
                }
                else {
                    return line.start + style.locStart + i;
                }
            }
            else {
                if (_this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - _this.textIdealX) {
                    return line.start + style.locStart + i + 1;
                }
                else {
                    return line.start + style.locStart + i;
                }
            }
        };
        this.insertText = function (textItem, start, end, text) {
            var isNew = true;
            var textStart = textItem.text.slice(0, start);
            var textEnd = textItem.text.slice(end, textItem.text.length);
            var styles = [];
            var fullText = textStart + textEnd;
            _this.startTextWait(_this.currTextEdit);
            for (i = 0; i < textItem.styles.length; i++) {
                var sty = textItem.styles[i];
                if (sty.start >= start) {
                    if (sty.start >= end) {
                        if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                            && styles[styles.length - 1].decoration == sty.decoration
                            && styles[styles.length - 1].weight == sty.weight
                            && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= 200) {
                            styles[styles.length - 1].end += sty.end - sty.start;
                            styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                        }
                        else {
                            sty.start -= end - start;
                            sty.end -= end - start;
                            sty.text = fullText.slice(sty.start, sty.end);
                            styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                        }
                    }
                    else {
                        if (sty.end > end) {
                            if (styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                                && styles[styles.length - 1].decoration == sty.decoration
                                && styles[styles.length - 1].weight == sty.weight
                                && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - end <= 200) {
                                styles[styles.length - 1].end += sty.end - end;
                                styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                            }
                            else {
                                sty.end += start - end;
                                sty.start = start;
                                sty.text = fullText.slice(sty.start, sty.end);
                                styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                            }
                        }
                    }
                }
                else {
                    if (sty.end > start) {
                        if (sty.end > end) {
                            sty.end -= end - start;
                            sty.text = fullText.slice(sty.start, sty.end);
                            styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                        }
                        else {
                            sty.end = start;
                            sty.text = fullText.slice(sty.start, sty.end);
                            styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                        }
                    }
                    else {
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({ start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text });
                    }
                }
            }
            textItem.text = textStart + text + textEnd;
            for (var i = 0; text.length > 0 && i < styles.length; i++) {
                if (styles[i].end > start) {
                    if (styles[i].start >= start) {
                        if (styles[i].start == start && _this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200) {
                            isNew = false;
                            styles[i].start = start;
                        }
                        else {
                            styles[i].start += text.length;
                        }
                        styles[i].end += text.length;
                    }
                    else if (styles[i].end >= start) {
                        if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200) {
                            isNew = false;
                            styles[i].end += text.length;
                        }
                        else {
                            var newSplit = {
                                start: start + text.length, end: styles[i].end + text.length, decoration: styles[i].decoration,
                                weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour
                            };
                            styles[i].end = start;
                            styles.splice(i + 1, 0, newSplit);
                            i++;
                        }
                    }
                }
                else if (styles[i].end == start) {
                    if (_this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200) {
                        isNew = false;
                        styles[i].end = start + text.length;
                    }
                }
                styles[i].text = textItem.text.slice(styles[i].start, styles[i].end);
            }
            if (isNew && text.length > 0) {
                i = 0;
                while (i < styles.length && styles[i].end <= start) {
                    i++;
                }
                var newStyle = {
                    start: start, end: start + text.length, decoration: _this.getDecoration(),
                    weight: _this.getWeight(), style: _this.getStyle(), colour: _this.viewState.colour,
                    text: textItem.text.slice(start, start + text.length)
                };
                styles.splice(i, 0, newStyle);
            }
            textItem.styles = styles;
            textItem = _this.newEdit(textItem);
            if (text.length == 0) {
                if (start > 0) {
                    _this.calculateLengths(textItem, start - 1, start, end);
                }
                else if (textItem.text.length > 0) {
                    _this.calculateLengths(textItem, start, end, end + 1);
                }
            }
            else {
                _this.calculateLengths(textItem, start, start + text.length, end);
            }
            _this.updateText(textItem);
        };
        this.completeEdit = function (textId, userId, editId) {
            var textItem;
            var fullText = '';
            var localId = _this.textDict[textId];
            var editData = _this.textInBuffer[textId].editBuffer[userId][editId];
            textItem = _this.getText(localId);
            textItem.styles = [];
            for (var i = 0; i < editData.nodes.length; i++) {
                textItem.styles[editData.nodes[i].num] = editData.nodes[i];
            }
            for (var i = 0; i < textItem.styles.length; i++) {
                fullText += textItem.styles[i].text;
            }
            textItem.text = fullText;
            _this.startTextWait(localId);
            _this.calculateLengths(textItem, 0, fullText.length, 0);
            _this.updateText(textItem);
        };
        this.createCurveText = function (curve) {
            var param = "M" + curve[0].x + "," + curve[0].y;
            param = param + " C" + curve[1].x + "," + curve[1].y;
            param = param + " " + curve[2].x + "," + curve[2].y;
            param = param + " " + curve[3].x + "," + curve[3].y;
            for (var i = 4; i + 2 < curve.length; i += 3) {
                param = param + " C" + curve[i + 0].x + "," + curve[i + 0].y;
                param = param + " " + curve[i + 1].x + "," + curve[i + 1].y;
                param = param + " " + curve[i + 2].x + "," + curve[i + 2].y;
            }
            return param;
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
        this.setSocket = function (socket) {
            var self = _this;
            _this.socket = socket;
            _this.socket.on('JOIN', function (data) {
            });
            _this.socket.on('CURVE', function (data) {
                console.log('Recieved curve ID:' + data.serverId);
                if (!self.curveDict[data.serverId] && !self.curveInBuffer[data.serverId]) {
                    self.curveInBuffer[data.serverId] = {
                        serverId: data.serverId, user: data.userId, size: data.size, num_points: data.num_points, num_recieved: 0,
                        curveSet: new Array, colour: data.colour, updateTime: data.editTime
                    };
                    clearInterval(self.curveInTimeouts[data.serverId]);
                    self.curveInTimeouts[data.serverId] = setInterval(function (id) {
                        for (var j = 0; j < self.curveInBuffer[id].num_points; j++) {
                            if (!self.curveInBuffer[id].curveSet[j]) {
                                console.log('Sending Missing message.');
                                var msg = { serverId: id, seq_num: j };
                                self.socket.emit('MISSING-CURVE', msg);
                            }
                        }
                    }, 30000, data.serverId);
                }
            });
            _this.socket.on('POINT', function (data) {
                var buffer = self.curveInBuffer[data.serverId];
                if (buffer && buffer.num_recieved != buffer.num_points) {
                    if (!buffer.curveSet[data.num]) {
                        buffer.curveSet[data.num] = { x: data.x, y: data.y };
                        buffer.num_recieved++;
                    }
                    if (buffer.num_recieved == buffer.num_points) {
                        clearInterval(self.curveInTimeouts[data.serverId]);
                        self.addCurve(buffer.curveSet, buffer.user, buffer.colour, buffer.size, buffer.updateTime, data.serverId);
                        self.curveInBuffer[data.serverId] = null;
                    }
                }
                else {
                    clearInterval(self.curveInTimeouts[data.serverId]);
                    self.socket.emit('UNKNOWN-CURVE', data.serverId);
                }
            });
            _this.socket.on('IGNORE-CURVE', function (curveId) {
                clearInterval(self.curveInTimeouts[curveId]);
            });
            _this.socket.on('CURVEID', function (data) {
                self.curveOutBuffer[data.localId].serverId = data.serverId;
                clearInterval(self.curveOutTimeouts[data.localId]);
                var curveItem = self.getCurve(data.localId);
                curveItem.serverId = data.serverId;
                self.curveDict[data.serverId] = data.localId;
                for (var i = 0; i < self.curveOutBuffer[data.localId].curveSet.length; i++) {
                    var curve = self.curveOutBuffer[data.localId].curveSet[i];
                    var msg = { serverId: data.serverId, num: i, x: curve.x, y: curve.y };
                    self.socket.emit('POINT', msg);
                }
            });
            _this.socket.on('CURVE-COMPLETE', function (serverId) {
                var curve = self.getCurve(self.curveDict[serverId]);
                while (curve.opBuffer.length > 0) {
                    var op = curve.opBuffer.shift();
                    if (op.message == null) {
                        self.socket.emit(op.type, serverId);
                    }
                    else {
                        var msg = {};
                        Object.assign(msg, op.message, { serverId: serverId });
                        self.socket.emit(op.type, msg);
                    }
                }
            });
            _this.socket.on('MISSED-CURVE', function (data) {
                var curve;
                for (var i = 0; i < self.curveOutBuffer.length; i++) {
                    if (self.curveOutBuffer[i].serverId == data.serverId) {
                        curve = self.curveOutBuffer[i].curveSet[data.num];
                    }
                }
                var msg = { serverId: data.serverId, num: data.num, x: curve.x, y: curve.y };
                self.socket.emit('POINT', msg);
            });
            _this.socket.on('DROPPED-CURVE', function (serverId) {
                clearInterval(self.curveInTimeouts[serverId]);
                self.curveInBuffer[serverId] = null;
            });
            _this.socket.on('MOVE-CURVE', function (data) {
                var localId = self.curveDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-CURVE', data.serverId);
                }
                else {
                    var curve = self.getCurve(localId);
                    self.moveCurve(localId, data.x - curve.x, data.y - curve.y, data.editTime);
                }
            });
            _this.socket.on('DELETE-CURVE', function (serverId) {
                var localId = self.curveDict[serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-CURVE', serverId);
                }
                else {
                    self.deleteElement(localId);
                }
            });
            _this.socket.on('TEXTBOX', function (data) {
                if (!self.textInBuffer[data.serverId]) {
                    self.textInBuffer[data.serverId] = {
                        x: data.x, y: data.y, width: data.width, height: data.height, user: data.userId,
                        editLock: data.editLock, styles: [], size: data.size, justified: data.justified, editBuffer: []
                    };
                    var localId = self.addTextbox(data.x, data.y, data.width, data.height, data.size, data.justified, data.userId, data.editLock, data.editTime, data.serverId);
                    self.textDict[data.serverId] = localId;
                }
            });
            _this.socket.on('STYLENODE', function (data) {
                if (!self.textInBuffer[data.serverId]) {
                    console.log('STYLENODE: Unkown text, ID: ' + data.serverId);
                    console.log(data);
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    if (self.textInBuffer[data.serverId].editBuffer[data.userId]) {
                        if (self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId]) {
                            var buffer = self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId];
                            buffer.nodes.push(data);
                            if (buffer.nodes.length == buffer.num_nodes) {
                                self.completeEdit(data.serverId, data.userId, data.editId);
                            }
                        }
                        else {
                            console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.serverId);
                            self.socket.emit('UNKNOWN-EDIT', data.editId);
                        }
                    }
                    else {
                        console.log('WOAH BUDDY! User ID: ' + data.userId);
                    }
                }
            });
            _this.socket.on('TEXTID', function (data) {
                var textBox = self.getText(data.localId);
                textBox.serverId = data.serverId;
                self.textDict[data.serverId] = data.localId;
                while (textBox.opBuffer.length > 0) {
                    var op = textBox.opBuffer.shift();
                    if (op.message == null) {
                        self.socket.emit(op.type, data.serverId);
                    }
                    else {
                        var msg = {};
                        Object.assign(msg, op.message, { serverId: data.serverId });
                        self.socket.emit(op.type, msg);
                    }
                }
            });
            _this.socket.on('LOCK-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    self.setTextLock(localId, data.userId);
                }
            });
            _this.socket.on('LOCKID-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    if (self.gettingLock != -1 && self.getText(self.gettingLock).serverId == data.serverId) {
                        self.setTextEdit(localId);
                    }
                    else {
                        var msg = { serverId: data.serverId };
                        self.socket.emit('RELEASE-TEXT', msg);
                    }
                }
            });
            _this.socket.on('EDITID-TEXT', function (data) {
                var buffer = self.textOutBuffer;
                if (data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent) {
                    buffer[data.bufferId].lastSent = data.localId;
                    for (var i = 0; i < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i++) {
                        buffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.editId;
                        var node = buffer[data.bufferId].editBuffer[data.localId].nodes[i];
                        var msg = {
                            editId: node.editId, num: node.num, start: node.start, end: node.end, text: node.text, weight: node.weight, style: node.style,
                            decoration: node.decoration, colour: node.colour
                        };
                        self.socket.emit('STYLENODE', msg);
                    }
                }
            });
            _this.socket.on('FAILED-TEXT', function (data) {
            });
            _this.socket.on('REFUSED-TEXT', function (data) {
            });
            _this.socket.on('RELEASE-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    self.setTextUnLock(localId);
                }
            });
            _this.socket.on('EDIT-TEXT', function (data) {
                if (!self.textInBuffer[data.serverId]) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    if (!self.textInBuffer[data.serverId].editBuffer[data.userId]) {
                        self.textInBuffer[data.serverId].editBuffer[data.userId] = [];
                    }
                    self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId] = { num_nodes: data.num_nodes, nodes: [] };
                }
            });
            _this.socket.on('MOVE-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    self.moveTextbox(localId, false, data.x, data.y, data.editTime);
                }
            });
            _this.socket.on('JUSTIFY-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    self.setTextJustified(data.serverId, data.newState);
                }
            });
            _this.socket.on('RESIZE-TEXT', function (data) {
                var localId = self.textDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', data.serverId);
                }
                else {
                    self.setTextArea(localId, data.width, data.height);
                }
            });
            _this.socket.on('DELETE-TEXT', function (serverId) {
                var localId = self.textDict[serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-TEXT', serverId);
                }
                else {
                    self.deleteElement(localId);
                }
            });
            _this.socket.on('IGNORE-TEXT', function (serverId) {
            });
            _this.socket.on('DROPPED-TEXT', function (data) {
            });
            _this.socket.on('MISSED-TEXT', function (data) {
            });
            _this.socket.on('HIGHLIGHT', function (data) {
                if (self.hilightDict[data.userId]) {
                    self.deleteElement(self.hilightDict[data.userId]);
                    self.hilightDict[data.userId] = null;
                }
                var localId = self.addHighlight(data.x, data.y, data.width, data.height, data.userId, data.colour);
                self.hilightDict[data.userId] = localId;
            });
            _this.socket.on('CLEAR-HIGHLIGHT', function (userId) {
                if (self.hilightDict[userId]) {
                    self.deleteElement(self.hilightDict[userId]);
                    self.hilightDict[userId] = null;
                }
            });
            _this.socket.on('FILE-START', function (data) {
                console.log('Recieved File Start.');
                console.log('File type is: ' + data.fileType);
                var isImage = data.fileType.split('/')[0] == 'image' ? true : false;
                var localId;
                if (data.url) {
                    console.log('Adding completed file.');
                    localId = self.addFile(data.x, data.y, data.width, data.height, data.userId, isImage, data.fileDesc, data.fileType, data.extension, data.rotation, data.url, data.editTime, data.serverId);
                }
                else {
                    localId = self.addFile(data.x, data.y, data.width, data.height, data.userId, isImage, data.fileDesc, data.fileType, data.extension, data.rotation, undefined, data.editTime, data.serverId);
                }
                console.log('Logging file in dictionary, ServerID: ' + data.serverId + ' LocalID: ' + localId);
                self.uploadDict[data.serverId] = localId;
            });
            _this.socket.on('FILEID', function (data) {
                console.log('FILEID Received.');
                var file = self.getUpload(data.localId);
                self.uploadDict[data.serverId] = data.localId;
                file.serverId = data.serverId;
                while (file.opBuffer.length > 0) {
                    var op = file.opBuffer.shift();
                    if (op.message == null) {
                        self.socket.emit(op.type, data.serverId);
                    }
                    else {
                        var msg = {};
                        Object.assign(msg, op.message, { serverId: data.serverId });
                        self.socket.emit(op.type, msg);
                    }
                }
            });
            _this.socket.on('FILE-DATA', function (data) {
                console.log('Received Request for more file data.');
                self.sendFileData(data.serverId, data.place, data.percent);
            });
            _this.socket.on('FILE-DONE', function (data) {
                console.log('Received File Done.');
                var localId = self.uploadDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-FILE', data.serverId);
                }
                else {
                    self.setUploadComplete(localId, data.fileURL);
                }
            });
            _this.socket.on('MOVE-FILE', function (data) {
                console.log('Recieved move file. ServerID: ' + data.serverId);
                var localId = self.uploadDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-FILE', data.serverId);
                }
                else {
                    self.moveUpload(localId, false, data.x, data.y, data.editTime);
                }
            });
            _this.socket.on('RESIZE-FILE', function (data) {
                console.log('Recieved resize file.');
                var localId = self.uploadDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-FILE', data.serverId);
                }
                else {
                    self.setUploadArea(localId, data.width, data.height, data.editTime);
                }
            });
            _this.socket.on('ROTATE-FILE', function (data) {
                console.log('Recieved rotate file.');
                var localId = self.uploadDict[data.serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-FILE', data.serverId);
                }
                else {
                    self.setUploadRotation(localId, data.rotation);
                }
            });
            _this.socket.on('DELETE-FILE', function (serverId) {
                var localId = self.uploadDict[serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-FILE', serverId);
                }
                else {
                    self.deleteElement(localId);
                }
            });
            _this.socket.on('ABANDON-FILE', function (serverId) {
                var localId = self.uploadDict[serverId];
                if (localId == null || localId == undefined) {
                    self.socket.emit('UNKNOWN-FILE', serverId);
                }
                else {
                    self.deleteElement(localId);
                }
            });
            _this.socket.on('FILE-OVERSIZE', function (localId) {
                self.deleteElement(localId);
                self.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
            });
            _this.socket.on('FILE-BADTYPE', function (localId) {
                self.deleteElement(localId);
                self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
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
            _this.isWriting = false;
            _this.clearHighlight();
            if (_this.currTextEdit > -1) {
                var textBox = _this.getText(_this.currTextEdit);
                var lineCount = textBox.textNodes.length;
                if (lineCount == 0) {
                    lineCount = 1;
                }
                if (lineCount * 1.5 * textBox.size < textBox.height) {
                    _this.resizeText(_this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                    _this.sendTextResize(_this.currTextEdit);
                }
                _this.releaseText(_this.currTextEdit);
            }
            else if (_this.gettingLock > -1) {
                _this.releaseText(_this.gettingLock);
            }
            _this.setMode(newMode);
        };
        this.sizeChange = function (newSize) {
            _this.setSize(newSize);
        };
        this.styleChange = function () {
            if (_this.currTextEdit != -1 && _this.cursorStart != _this.cursorEnd) {
                var textItem = _this.getText(_this.currTextEdit);
                var text = textItem.text.substring(_this.cursorStart, _this.cursorEnd);
                _this.insertText(textItem, _this.cursorStart, _this.cursorEnd, text);
            }
        };
        this.colourChange = function (newColour) {
            _this.setColour(newColour);
            _this.styleChange();
        };
        this.boldChange = function (newState) {
            _this.setIsBold(newState);
            _this.styleChange();
        };
        this.italicChange = function (newState) {
            _this.setIsItalic(newState);
            _this.styleChange();
        };
        this.underlineChange = function (newState) {
            if (newState) {
                _this.setIsOline(false);
                _this.setIsTline(false);
            }
            _this.setIsUline(newState);
            _this.styleChange();
        };
        this.overlineChange = function (newState) {
            if (newState) {
                _this.setIsUline(false);
                _this.setIsTline(false);
            }
            _this.setIsOline(newState);
            _this.styleChange();
        };
        this.throughlineChange = function (newState) {
            if (newState) {
                _this.setIsOline(false);
                _this.setIsUline(false);
            }
            _this.setIsTline(newState);
            _this.styleChange();
        };
        this.justifiedChange = function (newState) {
            _this.setJustified(newState);
            if (_this.currTextEdit != -1) {
                _this.setTextJustified(_this.currTextEdit, !_this.viewState.isJustified);
            }
        };
        this.elementMouseOver = function (id, e) {
            var elem = _this.getBoardElement(id);
            if (_this.currentHover == -1) {
                _this.currentHover = id;
                elem.hoverTimer = setTimeout(_this.infoMessageTimeout, 2000, id);
            }
            else {
                var prevElem = _this.getBoardElement(_this.currentHover);
                clearTimeout(elem.hoverTimer);
            }
        };
        this.elementMouseOut = function (id, e) {
            var elem = _this.getBoardElement(id);
            if (_this.currentHover == id) {
                clearTimeout(elem.hoverTimer);
                _this.currentHover = -1;
            }
        };
        this.curveMouseClick = function (id) {
            if (_this.viewState.mode == 2) {
                var curve = _this.getCurve(id);
                if (_this.isHost || _this.userId == curve.user) {
                    _this.deleteCurve(id);
                }
            }
        };
        this.curveMouseMove = function (id) {
            if (_this.viewState.mode == 2 && _this.lMousePress) {
                var curve = _this.getCurve(id);
                if (_this.isHost || _this.userId == curve.user) {
                    _this.deleteCurve(id);
                }
            }
        };
        this.curveMouseDown = function (id, e) {
            if (_this.viewState.mode == 3) {
                _this.currCurveMove = id;
                _this.startMove();
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
            }
        };
        this.textMouseClick = function (id) {
            if (_this.viewState.mode == 2) {
                var textBox = _this.getText(id);
                if (_this.isHost || _this.userId == textBox.user) {
                    _this.deleteText(id);
                }
            }
        };
        this.textMouseDblClick = function (id) {
            var textBox = _this.getText(id);
            if (_this.gettingLock != -1 && _this.gettingLock != id) {
                _this.releaseText(_this.gettingLock);
            }
            if (_this.currTextEdit != -1) {
                if (_this.currTextEdit != id) {
                    _this.releaseText(_this.currTextEdit);
                    var tbox = _this.getText(_this.currTextEdit);
                    var lineCount = tbox.textNodes.length;
                    if (lineCount == 0) {
                        lineCount = 1;
                    }
                    if (lineCount * 1.5 * tbox.size < tbox.height) {
                        _this.resizeText(_this.currTextEdit, tbox.width, lineCount * 1.5 * tbox.size);
                        _this.sendTextResize(_this.currTextEdit);
                    }
                }
            }
            else {
                if (_this.isHost || _this.userId == textBox.user) {
                    _this.lockText(id);
                }
            }
        };
        this.textMouseMoveDown = function (id, e) {
            _this.currTextMove = id;
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
            _this.startMove();
        };
        this.textMouseResizeDown = function (id, vert, horz, e) {
            _this.currTextResize = id;
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
            _this.vertResize = vert;
            _this.horzResize = horz;
            _this.startResize(horz, vert);
        };
        this.textMouseMove = function (id) {
            if (_this.viewState.mode == 2 && _this.lMousePress) {
                var textBox = _this.getText(id);
                if (_this.isHost || _this.userId == textBox.user) {
                    _this.deleteText(id);
                }
            }
        };
        this.fileMouseClick = function (id) {
            if (_this.viewState.mode == 2) {
                var fileBox = _this.getUpload(id);
                if (_this.isHost || _this.userId == fileBox.user) {
                    _this.deleteFile(id);
                }
            }
        };
        this.clearAlert = function () {
            _this.removeAlert();
        };
        this.highlightTagClick = function (id) {
            console.log('Highligh tag click processed.');
            var whitElem = document.getElementById('whiteBoard-input');
            var whitCont = document.getElementById('whiteboard-container');
            var clientWidth = whitCont.clientWidth;
            var clientHeight = whitCont.clientHeight;
            var highlight = _this.getHighlight(id);
            var xCentre = highlight.x + highlight.width / 2;
            var yCentre = highlight.y + highlight.height / 2;
            var xChange = xCentre - (_this.panX + clientWidth * _this.scaleF * 0.5);
            var yChange = yCentre - (_this.panY + clientHeight * _this.scaleF * 0.5);
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
        this.fileMouseMoveDown = function (id, e) {
            _this.currFileMove = id;
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
            _this.startMove();
        };
        this.fileMouseResizeDown = function (id, vert, horz, e) {
            _this.currFileResize = id;
            _this.prevX = e.clientX;
            _this.prevY = e.clientY;
            _this.vertResize = vert;
            _this.horzResize = horz;
            _this.startResize(horz, vert);
        };
        this.fileRotateClick = function (id) {
            var file = _this.getUpload(id);
            if (_this.isHost || _this.userId == file.user) {
                _this.rotateUpload(id);
                _this.sendFileRotate(id);
            }
        };
        this.fileMouseMove = function (id) {
            if (_this.viewState.mode == 2 && _this.lMousePress) {
                var fileBox = _this.getUpload(id);
                if (_this.isHost || _this.userId == fileBox.user) {
                    _this.deleteFile(id);
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
            if (_this.isWriting && _this.cursorStart != _this.cursorEnd) {
                var textItem = _this.getText(_this.currTextEdit);
                e.clipboardData.setData('text/plain', textItem.text.substring(_this.cursorStart, _this.cursorEnd));
            }
        };
        this.onPaste = function (e) {
            console.log('PASTE EVENT');
            if (_this.isWriting) {
                var textItem = _this.getText(_this.currTextEdit);
                var data = e.clipboardData.getData('text/plain');
                _this.insertText(textItem, _this.cursorStart, _this.cursorEnd, data);
                _this.cursorStart = _this.cursorStart + data.length;
                _this.cursorEnd = _this.cursorStart;
                _this.changeTextSelect(_this.currTextEdit, true);
            }
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
            if (e.dataTransfer.files.length > 0) {
                if (e.dataTransfer.files.length == 1) {
                    var file = e.dataTransfer.files[0];
                    _this.placeLocalFile(x, y, _this.scaleF, _this.panX, _this.panY, file);
                }
            }
            else {
                var url = e.dataTransfer.getData('text/plain');
                _this.placeRemoteFile(x, y, _this.scaleF, _this.panX, _this.panY, url);
            }
        };
        this.mouseUp = function (e) {
            if (_this.lMousePress && !_this.wMousePress) {
                if (_this.viewState.mode == 0) {
                    var whitElem = document.getElementById("whiteBoard-input");
                    var context = whitElem.getContext('2d');
                    context.clearRect(0, 0, whitElem.width, whitElem.height);
                    if (_this.isPoint) {
                        var elemRect = whitElem.getBoundingClientRect();
                        var offsetY = elemRect.top - document.body.scrollTop;
                        var offsetX = elemRect.left - document.body.scrollLeft;
                    }
                    _this.drawCurve(_this.pointList, _this.scaleF * _this.viewState.baseSize, _this.viewState.colour, _this.scaleF, _this.panX, _this.panY);
                }
                else if (_this.viewState.mode == 1) {
                    if (!_this.isWriting) {
                        var rectLeft = void 0;
                        var rectTop = void 0;
                        var rectWidth = void 0;
                        var rectHeight = void 0;
                        var whitElem_1 = document.getElementById("whiteBoard-input");
                        var context_1 = whitElem_1.getContext('2d');
                        var elemRect_1 = whitElem_1.getBoundingClientRect();
                        var offsetY_1 = elemRect_1.top - document.body.scrollTop;
                        var offsetX_1 = elemRect_1.left - document.body.scrollLeft;
                        var newPoint = { x: 0, y: 0 };
                        context_1.clearRect(0, 0, whitElem_1.width, whitElem_1.height);
                        newPoint.x = Math.round(e.clientX - offsetX_1);
                        newPoint.y = Math.round(e.clientY - offsetY_1);
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
                        if (rectWidth > 10 && rectHeight > 10) {
                            var x = rectLeft * _this.scaleF + _this.panX;
                            var y = rectTop * _this.scaleF + _this.panY;
                            var width = rectWidth * _this.scaleF;
                            var height = rectHeight * _this.scaleF;
                            _this.isWriting = true;
                            _this.cursorStart = 0;
                            _this.cursorEnd = 0;
                            var localId = _this.addTextbox(x, y, width, height, _this.scaleF * _this.viewState.baseSize * 20, _this.viewState.isJustified, _this.userId, _this.userId, new Date());
                            _this.setTextEdit(localId);
                        }
                    }
                    else if (_this.rMousePress) {
                        _this.isWriting = false;
                        if (_this.currTextEdit > -1) {
                            var textBox = _this.getText(_this.currTextEdit);
                            var lineCount = textBox.textNodes.length;
                            if (lineCount == 0) {
                                lineCount = 1;
                            }
                            if (lineCount * 1.5 * textBox.size < textBox.height) {
                                _this.resizeText(_this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                                _this.sendTextResize(_this.currTextEdit);
                            }
                            _this.releaseText(_this.currTextEdit);
                        }
                        else if (_this.gettingLock > -1) {
                            _this.releaseText(_this.gettingLock);
                        }
                        context.clearRect(0, 0, whitElem.width, whitElem.height);
                    }
                }
                else if (_this.viewState.mode == 4) {
                    var rectLeft = void 0;
                    var rectTop = void 0;
                    var rectWidth = void 0;
                    var rectHeight = void 0;
                    var whitElem_2 = document.getElementById("whiteBoard-input");
                    var context_2 = whitElem_2.getContext('2d');
                    var elemRect_2 = whitElem_2.getBoundingClientRect();
                    var offsetY_2 = elemRect_2.top - document.body.scrollTop;
                    var offsetX_2 = elemRect_2.left - document.body.scrollLeft;
                    var newPoint = { x: 0, y: 0 };
                    context_2.clearRect(0, 0, whitElem_2.width, whitElem_2.height);
                    newPoint.x = Math.round(e.clientX - offsetX_2);
                    newPoint.y = Math.round(e.clientY - offsetY_2);
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
                    if (rectWidth > 10 && rectHeight > 10) {
                        _this.placeHighlight(rectLeft, rectTop, _this.scaleF, _this.panX, _this.panY, rectWidth, rectHeight);
                    }
                }
            }
            if (_this.curveMoved) {
                _this.curveMoved = false;
                _this.sendCurveMove(_this.currCurveMove);
            }
            else if (_this.textMoved) {
                _this.textMoved = false;
                _this.sendTextMove(_this.currTextMove);
            }
            else if (_this.textResized) {
                _this.textResized = false;
                _this.sendTextResize(_this.currTextEdit);
            }
            else if (_this.fileMoved) {
                _this.fileMoved = false;
                _this.sendFileMove(_this.currFileMove);
            }
            else if (_this.fileResized) {
                _this.fileResized = false;
                _this.sendFileResize(_this.currFileResize);
            }
            _this.curveChangeX = 0;
            _this.curveChangeY = 0;
            _this.lMousePress = false;
            _this.wMousePress = false;
            _this.rMousePress = false;
            _this.pointList = [];
            _this.moving = false;
            _this.endMove();
            _this.endResize();
        };
        this.touchUp = function () {
            _this.touchPress = false;
        };
        this.mouseDown = function (e) {
            if (!_this.lMousePress && !_this.wMousePress && !_this.rMousePress) {
                _this.clearHighlight();
                _this.lMousePress = e.buttons & 1 ? true : false;
                _this.rMousePress = e.buttons & 2 ? true : false;
                _this.wMousePress = e.buttons & 4 ? true : false;
                _this.isPoint = true;
                var whitElem = document.getElementById("whiteBoard-input");
                var elemRect = whitElem.getBoundingClientRect();
                var offsetY = elemRect.top - document.body.scrollTop;
                var offsetX = elemRect.left - document.body.scrollLeft;
                whitElem.width = whitElem.clientWidth;
                whitElem.height = whitElem.clientHeight;
                _this.prevX = e.clientX;
                _this.prevY = e.clientY;
                var newPoint = { x: 0, y: 0 };
                _this.pointList = [];
                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);
                _this.pointList[_this.pointList.length] = newPoint;
                _this.downPoint = { x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY) };
                if (e.buttons == 1 && !_this.viewState.itemMoving && !_this.viewState.itemResizing) {
                    if (_this.currTextEdit > -1) {
                        var textBox = _this.getText(_this.currTextEdit);
                        _this.cursorStart = _this.findTextPos(textBox, (e.clientX - offsetX) * _this.scaleF + _this.panX, (e.clientY - offsetY) * _this.scaleF + _this.panY);
                        _this.cursorEnd = _this.cursorStart;
                        _this.textDown = _this.cursorStart;
                        _this.changeTextSelect(_this.currTextEdit, true);
                    }
                }
            }
            _this.currSelect = [];
            if (_this.currentHover != -1) {
                var elem = _this.getBoardElement(_this.currentHover);
                if (elem.infoElement) {
                    _this.removeHoverInfo(_this.currentHover);
                }
            }
        };
        this.touchDown = function () {
            _this.touchPress = true;
        };
        this.mouseMove = function (e) {
            if (_this.currentHover != -1) {
                var elem = _this.getBoardElement(_this.currentHover);
                if (elem.infoElement) {
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
                if (_this.viewState.mode == 0) {
                    if (_this.pointList.length) {
                        if (Math.round(_this.pointList[_this.pointList.length - 1].x - newPoint.x) < _this.scaleF || Math.round(_this.pointList[_this.pointList.length - 1].y - newPoint.y)) {
                            _this.isPoint = false;
                            context.beginPath();
                            context.strokeStyle = _this.viewState.colour;
                            context.lineWidth = _this.viewState.baseSize;
                            context.moveTo(_this.pointList[_this.pointList.length - 1].x, _this.pointList[_this.pointList.length - 1].y);
                            context.lineTo(newPoint.x, newPoint.y);
                            context.stroke();
                            _this.pointList[_this.pointList.length] = newPoint;
                        }
                    }
                    else {
                        _this.pointList[_this.pointList.length] = newPoint;
                    }
                }
                else if (_this.viewState.mode == 1 && !_this.rMousePress) {
                    if (_this.currTextResize != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        var tbox = _this.getText(_this.currTextResize);
                        var newWidth = _this.horzResize ? tbox.width + changeX : tbox.width;
                        var newHeight = _this.vertResize ? tbox.height + changeY : tbox.height;
                        _this.resizeText(_this.currTextResize, newWidth, newHeight);
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.textResized = true;
                    }
                    else if (_this.currTextMove != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        _this.moveTextbox(_this.currTextMove, true, changeX, changeY, new Date());
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.textMoved = true;
                    }
                    else if (_this.currTextSel != -1) {
                        var textBox = _this.getText(_this.currTextEdit);
                        var newLoc = _this.findTextPos(textBox, (e.clientX - offsetX) * _this.scaleF + _this.panX, (e.clientY - offsetY) * _this.scaleF + _this.panY);
                        if (_this.textDown < newLoc) {
                            _this.cursorStart = _this.textDown;
                            _this.cursorEnd = newLoc;
                            _this.startLeft = true;
                        }
                        else {
                            _this.cursorStart = newLoc;
                            _this.cursorEnd = _this.textDown;
                            _this.startLeft = false;
                        }
                        _this.changeTextSelect(_this.currTextSel, true);
                    }
                    else {
                        var rectLeft;
                        var rectTop;
                        var rectWidth;
                        var rectHeight;
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
                    }
                }
                else if (_this.viewState.mode == 2 && !_this.rMousePress) {
                }
                else if (_this.viewState.mode == 3) {
                    if (_this.currCurveMove != -1) {
                        _this.moveCurve(_this.currCurveMove, (e.clientX - _this.prevX) * _this.scaleF, (e.clientY - _this.prevY) * _this.scaleF, new Date());
                        _this.curveChangeX += (e.clientX - _this.prevX) * _this.scaleF;
                        _this.curveChangeY += (e.clientY - _this.prevY) * _this.scaleF;
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.curveMoved = true;
                    }
                    else if (_this.currTextMove != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        _this.moveTextbox(_this.currTextMove, true, changeX, changeY, new Date());
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.textMoved = true;
                    }
                    else if (_this.currFileMove != -1) {
                        var changeX = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY = (e.clientY - _this.prevY) * _this.scaleF;
                        _this.moveUpload(_this.currFileMove, true, changeX, changeY, new Date());
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.fileMoved = true;
                    }
                    else if (_this.currFileResize != -1) {
                        var changeX_1 = (e.clientX - _this.prevX) * _this.scaleF;
                        var changeY_1 = (e.clientY - _this.prevY) * _this.scaleF;
                        var file = _this.getUpload(_this.currFileResize);
                        var newWidth_1 = _this.horzResize ? file.width + changeX_1 : file.width;
                        var newHeight_1 = _this.vertResize ? file.height + changeY_1 : file.height;
                        _this.resizeFile(_this.currFileResize, newWidth_1, newHeight_1);
                        _this.prevX = e.clientX;
                        _this.prevY = e.clientY;
                        _this.fileResized = true;
                    }
                }
                else if (_this.viewState.mode == 4 && !_this.rMousePress) {
                    var rectLeft;
                    var rectTop;
                    var rectWidth;
                    var rectHeight;
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
                        context.globalAlpha = 0.4;
                        context.fillStyle = 'yellow';
                        context.fillRect(rectLeft, rectTop, rectWidth, rectHeight);
                        context.stroke();
                        context.globalAlpha = 1.0;
                    }
                }
            }
            _this.mouseX = e.clientX;
            _this.mouseY = e.clientY;
        };
        this.touchMove = function (e) {
            if (_this.touchPress) {
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
        this.keyDown = function (e) {
            if (e.keyCode === 8) {
                if (_this.isWriting) {
                    e.preventDefault();
                    var textItem = _this.getText(_this.currTextEdit);
                    if (_this.cursorEnd > 0) {
                        if (e.ctrlKey) {
                            if (_this.cursorStart > 0) {
                            }
                        }
                        else {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.cursorStart--;
                            }
                            var start = _this.cursorStart;
                            var end = _this.cursorEnd;
                            _this.cursorEnd = _this.cursorStart;
                            _this.insertText(textItem, start, end, '');
                        }
                    }
                }
            }
        };
        this.keyUp = function (e) {
        };
        this.keyPress = function (e) {
            if (_this.isWriting) {
                e.preventDefault();
                e.stopPropagation();
                var inputChar = e.key;
                var textItem;
                var i;
                var line;
                var style;
                switch (inputChar) {
                    case 'ArrowLeft':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart = _this.cursorStart;
                        var newEnd = _this.cursorEnd;
                        if (_this.cursorStart == _this.cursorEnd || !_this.startLeft) {
                            if (_this.cursorStart > 0) {
                                if (e.ctrlKey) {
                                    i = _this.cursorStart > 0 ? _this.cursorStart - 1 : 0;
                                    while (i > 0 && !textItem.text.charAt(i - 1).match(/\s/)) {
                                        i--;
                                    }
                                    newStart = i;
                                }
                                else {
                                    if (newStart > 0) {
                                        newStart--;
                                    }
                                }
                            }
                        }
                        else {
                            if (e.ctrlKey) {
                                i = _this.cursorEnd > 0 ? _this.cursorEnd - 1 : 0;
                                while (i > 0 && !textItem.text.charAt(i - 1).match(/\s/)) {
                                    i--;
                                }
                                newEnd = i;
                            }
                            else {
                                if (newEnd > 0) {
                                    newEnd--;
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = false;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newStart > newEnd) {
                                _this.startLeft = false;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            _this.cursorStart = _this.cursorStart == _this.cursorEnd || !_this.startLeft ? newStart : newEnd;
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, true);
                        break;
                    case 'ArrowRight':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart = _this.cursorStart;
                        var newEnd = _this.cursorEnd;
                        if (_this.cursorStart == _this.cursorEnd || _this.startLeft) {
                            if (_this.cursorEnd < textItem.text.length) {
                                if (e.ctrlKey) {
                                    i = _this.cursorEnd + 1;
                                    while (i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/))) {
                                        i++;
                                    }
                                    newEnd = i;
                                }
                                else {
                                    if (newEnd < textItem.text.length) {
                                        newEnd++;
                                    }
                                }
                            }
                        }
                        else {
                            if (e.ctrlKey) {
                                i = _this.cursorStart < textItem.text.length ? _this.cursorStart + 1 : textItem.text.length;
                                while (i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/))) {
                                    i++;
                                }
                                newStart = i;
                            }
                            else {
                                if (newStart < textItem.text.length) {
                                    newStart++;
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = true;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newStart > newEnd) {
                                _this.startLeft = true;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            _this.cursorStart = _this.cursorStart == _this.cursorEnd || _this.startLeft ? newEnd : newStart;
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, true);
                        break;
                    case 'ArrowUp':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart;
                        var newEnd;
                        if (e.ctrlKey) {
                            if (_this.startLeft && _this.cursorStart != _this.cursorEnd) {
                                i = _this.cursorEnd - 1;
                                while (i > 0 && !textItem.text.charAt(i - 1).match('\n')) {
                                    i--;
                                }
                                if (i < 0) {
                                    i = 0;
                                }
                                newStart = _this.cursorStart;
                                newEnd = i;
                            }
                            else {
                                i = _this.cursorStart - 1;
                                while (i > 0 && !textItem.text.charAt(i - 1).match('\n')) {
                                    i--;
                                }
                                if (i < 0) {
                                    i = 0;
                                }
                                newStart = i;
                                newEnd = _this.cursorEnd;
                            }
                        }
                        else {
                            if (_this.startLeft && _this.cursorStart != _this.cursorEnd) {
                                newStart = _this.cursorStart;
                                if (_this.cursorEnd <= textItem.textNodes[0].end) {
                                    newEnd = _this.cursorEnd;
                                }
                                else {
                                    newEnd = _this.findXHelper(textItem, true, _this.cursorEnd);
                                }
                            }
                            else {
                                newEnd = _this.cursorEnd;
                                if (_this.cursorStart <= textItem.textNodes[0].end) {
                                    newStart = _this.cursorStart;
                                }
                                else {
                                    newStart = _this.findXHelper(textItem, true, _this.cursorStart);
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = false;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newEnd < newStart) {
                                _this.startLeft = false;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            if (_this.startLeft && _this.cursorStart != _this.cursorEnd) {
                                _this.cursorStart = newEnd;
                            }
                            else {
                                _this.cursorStart = newStart;
                            }
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, false);
                        break;
                    case 'ArrowDown':
                        textItem = _this.getText(_this.currTextEdit);
                        var newStart;
                        var newEnd;
                        if (e.ctrlKey) {
                            if (_this.startLeft || _this.cursorStart == _this.cursorEnd) {
                                i = _this.cursorEnd + 1;
                                while (i < textItem.text.length && !textItem.text.charAt(i).match('\n')) {
                                    i++;
                                }
                                newStart = _this.cursorStart;
                                newEnd = i;
                            }
                            else {
                                i = _this.cursorStart + 1;
                                while (i < textItem.text.length && !textItem.text.charAt(i).match('\n')) {
                                    i++;
                                }
                                newStart = i;
                                newEnd = _this.cursorEnd;
                            }
                        }
                        else {
                            if (_this.startLeft || _this.cursorStart == _this.cursorEnd) {
                                newStart = _this.cursorStart;
                                if (_this.cursorEnd >= textItem.textNodes[textItem.textNodes.length - 1].start) {
                                    newEnd = _this.cursorEnd;
                                }
                                else {
                                    newEnd = _this.findXHelper(textItem, false, _this.cursorEnd);
                                }
                            }
                            else {
                                newEnd = _this.cursorEnd;
                                if (_this.cursorStart >= textItem.textNodes[textItem.textNodes.length - 1].start) {
                                    newStart = _this.cursorStart;
                                }
                                else {
                                    newStart = _this.findXHelper(textItem, false, _this.cursorStart);
                                }
                            }
                        }
                        if (e.shiftKey) {
                            if (_this.cursorStart == _this.cursorEnd) {
                                _this.startLeft = true;
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                            else if (newEnd < newStart) {
                                _this.startLeft = true;
                                _this.cursorStart = newEnd;
                                _this.cursorEnd = newStart;
                            }
                            else {
                                _this.cursorStart = newStart;
                                _this.cursorEnd = newEnd;
                            }
                        }
                        else {
                            if (_this.startLeft || _this.cursorStart == _this.cursorEnd) {
                                _this.cursorStart = newEnd;
                            }
                            else {
                                _this.cursorStart = newStart;
                            }
                            _this.cursorEnd = _this.cursorStart;
                        }
                        _this.changeTextSelect(_this.currTextEdit, false);
                        break;
                    case 'Backspace':
                        textItem = _this.getText(_this.currTextEdit);
                        if (_this.cursorEnd > 0) {
                            if (e.ctrlKey) {
                                if (_this.cursorStart > 0) {
                                }
                            }
                            else {
                                if (_this.cursorStart == _this.cursorEnd) {
                                    _this.cursorStart--;
                                }
                                var start = _this.cursorStart;
                                var end = _this.cursorEnd;
                                _this.cursorEnd = _this.cursorStart;
                                _this.insertText(textItem, start, end, '');
                            }
                        }
                        break;
                    case 'Enter':
                        inputChar = '\n';
                    default:
                        textItem = _this.getText(_this.currTextEdit);
                        if (e.ctrlKey) {
                            if (inputChar == 'a' || inputChar == 'A') {
                            }
                            else if (inputChar == 'j') {
                            }
                            else if (inputChar == 'b') {
                            }
                            else if (inputChar == 'i') {
                            }
                        }
                        else {
                            var start = _this.cursorStart;
                            var end = _this.cursorEnd;
                            _this.cursorStart++;
                            _this.cursorEnd = _this.cursorStart;
                            _this.insertText(textItem, start, end, inputChar);
                        }
                        break;
                }
            }
        };
        this.isHost = isHost;
        this.userId = userId;
        var dispatcher = {
            elementMouseOver: this.elementMouseOver,
            elementMouseOut: this.elementMouseOut,
            curveMouseDown: this.curveMouseDown,
            curveMouseClick: this.curveMouseClick,
            curveMouseMove: this.curveMouseMove,
            textMouseClick: this.textMouseClick,
            textMouseDblClick: this.textMouseDblClick,
            textMouseMove: this.textMouseMove,
            textMouseMoveDown: this.textMouseMoveDown,
            textMouseResizeDown: this.textMouseResizeDown,
            fileMouseClick: this.fileMouseClick,
            fileMouseMove: this.fileMouseMove,
            fileMouseMoveDown: this.fileMouseMoveDown,
            fileMouseResizeDown: this.fileMouseResizeDown,
            fileRotateClick: this.fileRotateClick,
            highlightTagClick: this.highlightTagClick,
            clearAlert: this.clearAlert,
            colourChange: this.colourChange,
            modeChange: this.modeChange,
            sizeChange: this.sizeChange,
            boldChange: this.boldChange,
            italicChange: this.italicChange,
            underlineChange: this.underlineChange,
            overlineChange: this.overlineChange,
            throughlineChange: this.throughlineChange,
            justifiedChange: this.justifiedChange,
            mouseDown: this.mouseDown,
            mouseWheel: this.mouseWheel,
            mouseMove: this.mouseMove,
            mouseUp: this.mouseUp,
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
            mode: 0,
            sizeMode: 1,
            baseSize: 1.0,
            colour: 'black',
            isBold: false,
            isItalic: false,
            isOLine: false,
            isULine: false,
            isTLine: false,
            isJustified: true,
            itemMoving: false,
            itemResizing: false,
            resizeHorz: false,
            resizeVert: false,
            boardElements: Immutable.OrderedMap(),
            infoElements: Immutable.List(),
            alertElements: Immutable.List(),
            dispatcher: dispatcher
        };
    }
    return WhiteBoardController;
}());
