/// <reference path="./WhiteBoardView.ts"/>

/***************************************************************************************************************************************************************
 *
 *
 *
 * POLYFILLS
 *
 *
 *
 **************************************************************************************************************************************************************/
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

interface Window {
    KeyboardEvent;
    identifyKey;
}

(function(global) {
  var nativeKeyboardEvent = ('KeyboardEvent' in global);
  if (!nativeKeyboardEvent)
    global.KeyboardEvent = function KeyboardEvent() { throw TypeError('Illegal constructor'); };

  global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD      = 0x00; // Default or unknown location
  global.KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 0x01; // e.g. Left Alt key
  global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 0x02; // e.g. Right Alt key
  global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 0x03; // e.g. Numpad 0 or +

  var STANDARD = window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      LEFT = window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
      RIGHT = window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
      NUMPAD = window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;

  //--------------------------------------------------------------------
  //
  // Utilities
  //
  //--------------------------------------------------------------------

  function contains(s, ss) { return String(s).indexOf(ss) !== -1; }

  var os = (function() {
    if (contains(navigator.platform, 'Win')) { return 'win'; }
    if (contains(navigator.platform, 'Mac')) { return 'mac'; }
    if (contains(navigator.platform, 'CrOS')) { return 'cros'; }
    if (contains(navigator.platform, 'Linux')) { return 'linux'; }
    if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) { return 'ios'; }
    return '';
  } ());

  var browser = (function() {
    if (contains(navigator.userAgent, 'Chrome/')) { return 'chrome'; }
    if (contains(navigator.vendor, 'Apple')) { return 'safari'; }
    if (contains(navigator.userAgent, 'MSIE')) { return 'ie'; }
    if (contains(navigator.userAgent, 'Gecko/')) { return 'moz'; }
    if (contains(navigator.userAgent, 'Opera/')) { return 'opera'; }
    return '';
  } ());

  var browser_os = browser + '-' + os;

  function mergeIf(baseTable, select, table) {
    if (browser_os === select || browser === select || os === select) {
      Object.keys(table).forEach(function(keyCode) {
        baseTable[keyCode] = table[keyCode];
      });
    }
  }

  function remap(o, key) {
    var r = {};
    Object.keys(o).forEach(function(k) {
      var item = o[k];
      if (key in item) {
        r[item[key]] = item;
      }
    });
    return r;
  }

  function invert(o) {
    var r = {};
    Object.keys(o).forEach(function(k) {
      r[o[k]] = k;
    });
    return r;
  }

  //--------------------------------------------------------------------
  //
  // Generic Mappings
  //
  //--------------------------------------------------------------------

  // "keyInfo" is a dictionary:
  //   code: string - name from UI Events KeyboardEvent code Values
  //     https://w3c.github.io/uievents-code/
  //   location (optional): number - one of the DOM_KEY_LOCATION values
  //   keyCap (optional): string - keyboard label in en-US locale
  // USB code Usage ID from page 0x07 unless otherwise noted (Informative)

  // Map of keyCode to keyInfo
  var keyCodeToInfoTable = {
    // 0x01 - VK_LBUTTON
    // 0x02 - VK_RBUTTON
    0x03: { code: 'Cancel' }, // [USB: 0x9b] char \x0018 ??? (Not in D3E)
    // 0x04 - VK_MBUTTON
    // 0x05 - VK_XBUTTON1
    // 0x06 - VK_XBUTTON2
    0x06: { code: 'Help' }, // [USB: 0x75] ???
    // 0x07 - undefined
    0x08: { code: 'Backspace' }, // [USB: 0x2a] Labelled Delete on Macintosh keyboards.
    0x09: { code: 'Tab' }, // [USB: 0x2b]
    // 0x0A-0x0B - reserved
    0X0C: { code: 'Clear' }, // [USB: 0x9c] NumPad Center (Not in D3E)
    0X0D: { code: 'Enter' }, // [USB: 0x28]
    // 0x0E-0x0F - undefined

    0x10: { code: 'Shift' },
    0x11: { code: 'Control' },
    0x12: { code: 'Alt' },
    0x13: { code: 'Pause' }, // [USB: 0x48]
    0x14: { code: 'CapsLock' }, // [USB: 0x39]
    0x15: { code: 'KanaMode' }, // [USB: 0x88]
    0x16: { code: 'Lang1' }, // [USB: 0x90]
    // 0x17: VK_JUNJA
    // 0x18: VK_FINAL
    0x19: { code: 'Lang2' }, // [USB: 0x91]
    // 0x1A - undefined
    0x1B: { code: 'Escape' }, // [USB: 0x29]
    0x1C: { code: 'Convert' }, // [USB: 0x8a]
    0x1D: { code: 'NonConvert' }, // [USB: 0x8b]
    0x1E: { code: 'Accept' }, // [USB: ????]
    0x1F: { code: 'ModeChange' }, // [USB: ????]

    0x20: { code: 'Space' }, // [USB: 0x2c]
    0x21: { code: 'PageUp' }, // [USB: 0x4b]
    0x22: { code: 'PageDown' }, // [USB: 0x4e]
    0x23: { code: 'End' }, // [USB: 0x4d]
    0x24: { code: 'Home' }, // [USB: 0x4a]
    0x25: { code: 'ArrowLeft' }, // [USB: 0x50]
    0x26: { code: 'ArrowUp' }, // [USB: 0x52]
    0x27: { code: 'ArrowRight' }, // [USB: 0x4f]
    0x28: { code: 'ArrowDown' }, // [USB: 0x51]
    0x29: { code: 'Select' }, // (Not in D3E)
    0x2A: { code: 'Print' }, // (Not in D3E)
    0x2B: { code: 'Execute' }, // [USB: 0x74] (Not in D3E)
    0x2C: { code: 'PrintScreen' }, // [USB: 0x46]
    0x2D: { code: 'Insert' }, // [USB: 0x49]
    0x2E: { code: 'Delete' }, // [USB: 0x4c]
    0x2F: { code: 'Help' }, // [USB: 0x75] ???

    0x30: { code: 'Digit0', keyCap: '0' }, // [USB: 0x27] 0)
    0x31: { code: 'Digit1', keyCap: '1' }, // [USB: 0x1e] 1!
    0x32: { code: 'Digit2', keyCap: '2' }, // [USB: 0x1f] 2@
    0x33: { code: 'Digit3', keyCap: '3' }, // [USB: 0x20] 3#
    0x34: { code: 'Digit4', keyCap: '4' }, // [USB: 0x21] 4$
    0x35: { code: 'Digit5', keyCap: '5' }, // [USB: 0x22] 5%
    0x36: { code: 'Digit6', keyCap: '6' }, // [USB: 0x23] 6^
    0x37: { code: 'Digit7', keyCap: '7' }, // [USB: 0x24] 7&
    0x38: { code: 'Digit8', keyCap: '8' }, // [USB: 0x25] 8*
    0x39: { code: 'Digit9', keyCap: '9' }, // [USB: 0x26] 9(
    // 0x3A-0x40 - undefined

    0x41: { code: 'KeyA', keyCap: 'a' }, // [USB: 0x04]
    0x42: { code: 'KeyB', keyCap: 'b' }, // [USB: 0x05]
    0x43: { code: 'KeyC', keyCap: 'c' }, // [USB: 0x06]
    0x44: { code: 'KeyD', keyCap: 'd' }, // [USB: 0x07]
    0x45: { code: 'KeyE', keyCap: 'e' }, // [USB: 0x08]
    0x46: { code: 'KeyF', keyCap: 'f' }, // [USB: 0x09]
    0x47: { code: 'KeyG', keyCap: 'g' }, // [USB: 0x0a]
    0x48: { code: 'KeyH', keyCap: 'h' }, // [USB: 0x0b]
    0x49: { code: 'KeyI', keyCap: 'i' }, // [USB: 0x0c]
    0x4A: { code: 'KeyJ', keyCap: 'j' }, // [USB: 0x0d]
    0x4B: { code: 'KeyK', keyCap: 'k' }, // [USB: 0x0e]
    0x4C: { code: 'KeyL', keyCap: 'l' }, // [USB: 0x0f]
    0x4D: { code: 'KeyM', keyCap: 'm' }, // [USB: 0x10]
    0x4E: { code: 'KeyN', keyCap: 'n' }, // [USB: 0x11]
    0x4F: { code: 'KeyO', keyCap: 'o' }, // [USB: 0x12]

    0x50: { code: 'KeyP', keyCap: 'p' }, // [USB: 0x13]
    0x51: { code: 'KeyQ', keyCap: 'q' }, // [USB: 0x14]
    0x52: { code: 'KeyR', keyCap: 'r' }, // [USB: 0x15]
    0x53: { code: 'KeyS', keyCap: 's' }, // [USB: 0x16]
    0x54: { code: 'KeyT', keyCap: 't' }, // [USB: 0x17]
    0x55: { code: 'KeyU', keyCap: 'u' }, // [USB: 0x18]
    0x56: { code: 'KeyV', keyCap: 'v' }, // [USB: 0x19]
    0x57: { code: 'KeyW', keyCap: 'w' }, // [USB: 0x1a]
    0x58: { code: 'KeyX', keyCap: 'x' }, // [USB: 0x1b]
    0x59: { code: 'KeyY', keyCap: 'y' }, // [USB: 0x1c]
    0x5A: { code: 'KeyZ', keyCap: 'z' }, // [USB: 0x1d]
    0x5B: { code: 'MetaLeft', location: LEFT }, // [USB: 0xe3]
    0x5C: { code: 'MetaRight', location: RIGHT }, // [USB: 0xe7]
    0x5D: { code: 'ContextMenu' }, // [USB: 0x65] Context Menu
    // 0x5E - reserved
    0x5F: { code: 'Standby' }, // [USB: 0x82] Sleep

    0x60: { code: 'Numpad0', keyCap: '0', location: NUMPAD }, // [USB: 0x62]
    0x61: { code: 'Numpad1', keyCap: '1', location: NUMPAD }, // [USB: 0x59]
    0x62: { code: 'Numpad2', keyCap: '2', location: NUMPAD }, // [USB: 0x5a]
    0x63: { code: 'Numpad3', keyCap: '3', location: NUMPAD }, // [USB: 0x5b]
    0x64: { code: 'Numpad4', keyCap: '4', location: NUMPAD }, // [USB: 0x5c]
    0x65: { code: 'Numpad5', keyCap: '5', location: NUMPAD }, // [USB: 0x5d]
    0x66: { code: 'Numpad6', keyCap: '6', location: NUMPAD }, // [USB: 0x5e]
    0x67: { code: 'Numpad7', keyCap: '7', location: NUMPAD }, // [USB: 0x5f]
    0x68: { code: 'Numpad8', keyCap: '8', location: NUMPAD }, // [USB: 0x60]
    0x69: { code: 'Numpad9', keyCap: '9', location: NUMPAD }, // [USB: 0x61]
    0x6A: { code: 'NumpadMultiply', keyCap: '*', location: NUMPAD }, // [USB: 0x55]
    0x6B: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
    0x6C: { code: 'NumpadComma', keyCap: ',', location: NUMPAD }, // [USB: 0x85]
    0x6D: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD }, // [USB: 0x56]
    0x6E: { code: 'NumpadDecimal', keyCap: '.', location: NUMPAD }, // [USB: 0x63]
    0x6F: { code: 'NumpadDivide', keyCap: '/', location: NUMPAD }, // [USB: 0x54]

    0x70: { code: 'F1' }, // [USB: 0x3a]
    0x71: { code: 'F2' }, // [USB: 0x3b]
    0x72: { code: 'F3' }, // [USB: 0x3c]
    0x73: { code: 'F4' }, // [USB: 0x3d]
    0x74: { code: 'F5' }, // [USB: 0x3e]
    0x75: { code: 'F6' }, // [USB: 0x3f]
    0x76: { code: 'F7' }, // [USB: 0x40]
    0x77: { code: 'F8' }, // [USB: 0x41]
    0x78: { code: 'F9' }, // [USB: 0x42]
    0x79: { code: 'F10' }, // [USB: 0x43]
    0x7A: { code: 'F11' }, // [USB: 0x44]
    0x7B: { code: 'F12' }, // [USB: 0x45]
    0x7C: { code: 'F13' }, // [USB: 0x68]
    0x7D: { code: 'F14' }, // [USB: 0x69]
    0x7E: { code: 'F15' }, // [USB: 0x6a]
    0x7F: { code: 'F16' }, // [USB: 0x6b]

    0x80: { code: 'F17' }, // [USB: 0x6c]
    0x81: { code: 'F18' }, // [USB: 0x6d]
    0x82: { code: 'F19' }, // [USB: 0x6e]
    0x83: { code: 'F20' }, // [USB: 0x6f]
    0x84: { code: 'F21' }, // [USB: 0x70]
    0x85: { code: 'F22' }, // [USB: 0x71]
    0x86: { code: 'F23' }, // [USB: 0x72]
    0x87: { code: 'F24' }, // [USB: 0x73]
    // 0x88-0x8F - unassigned

    0x90: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0x91: { code: 'ScrollLock' }, // [USB: 0x47]
    // 0x92-0x96 - OEM specific
    // 0x97-0x9F - unassigned

    // NOTE: 0xA0-0xA5 usually mapped to 0x10-0x12 in browsers
    0xA0: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
    0xA1: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0xA2: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
    0xA3: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0xA4: { code: 'AltLeft', location: LEFT }, // [USB: 0xe2]
    0xA5: { code: 'AltRight', location: RIGHT }, // [USB: 0xe6]

    0xA6: { code: 'BrowserBack' }, // [USB: 0x0c/0x0224]
    0xA7: { code: 'BrowserForward' }, // [USB: 0x0c/0x0225]
    0xA8: { code: 'BrowserRefresh' }, // [USB: 0x0c/0x0227]
    0xA9: { code: 'BrowserStop' }, // [USB: 0x0c/0x0226]
    0xAA: { code: 'BrowserSearch' }, // [USB: 0x0c/0x0221]
    0xAB: { code: 'BrowserFavorites' }, // [USB: 0x0c/0x0228]
    0xAC: { code: 'BrowserHome' }, // [USB: 0x0c/0x0222]
    0xAD: { code: 'AudioVolumeMute' }, // [USB: 0x7f]
    0xAE: { code: 'AudioVolumeDown' }, // [USB: 0x81]
    0xAF: { code: 'AudioVolumeUp' }, // [USB: 0x80]

    0xB0: { code: 'MediaTrackNext' }, // [USB: 0x0c/0x00b5]
    0xB1: { code: 'MediaTrackPrevious' }, // [USB: 0x0c/0x00b6]
    0xB2: { code: 'MediaStop' }, // [USB: 0x0c/0x00b7]
    0xB3: { code: 'MediaPlayPause' }, // [USB: 0x0c/0x00cd]
    0xB4: { code: 'LaunchMail' }, // [USB: 0x0c/0x018a]
    0xB5: { code: 'MediaSelect' },
    0xB6: { code: 'LaunchApp1' },
    0xB7: { code: 'LaunchApp2' },
    // 0xB8-0xB9 - reserved
    0xBA: { code: 'Semicolon',  keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
    0xBB: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0xBC: { code: 'Comma', keyCap: ',' }, // [USB: 0x36] ,<
    0xBD: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
    0xBE: { code: 'Period', keyCap: '.' }, // [USB: 0x37] .>
    0xBF: { code: 'Slash', keyCap: '/' }, // [USB: 0x38] /? (US Standard 101)

    0xC0: { code: 'Backquote', keyCap: '`' }, // [USB: 0x35] `~ (US Standard 101)
    // 0xC1-0xCF - reserved

    // 0xD0-0xD7 - reserved
    // 0xD8-0xDA - unassigned
    0xDB: { code: 'BracketLeft', keyCap: '[' }, // [USB: 0x2f] [{ (US Standard 101)
    0xDC: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
    0xDD: { code: 'BracketRight', keyCap: ']' }, // [USB: 0x30] ]} (US Standard 101)
    0xDE: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
    // 0xDF - miscellaneous/varies

    // 0xE0 - reserved
    // 0xE1 - OEM specific
    0xE2: { code: 'IntlBackslash',  keyCap: '\\' }, // [USB: 0x64] \| (UK Standard 102)
    // 0xE3-0xE4 - OEM specific
    0xE5: { code: 'Process' }, // (Not in D3E)
    // 0xE6 - OEM specific
    // 0xE7 - VK_PACKET
    // 0xE8 - unassigned
    // 0xE9-0xEF - OEM specific

    // 0xF0-0xF5 - OEM specific
    0xF6: { code: 'Attn' }, // [USB: 0x9a] (Not in D3E)
    0xF7: { code: 'CrSel' }, // [USB: 0xa3] (Not in D3E)
    0xF8: { code: 'ExSel' }, // [USB: 0xa4] (Not in D3E)
    0xF9: { code: 'EraseEof' }, // (Not in D3E)
    0xFA: { code: 'Play' }, // (Not in D3E)
    0xFB: { code: 'ZoomToggle' }, // (Not in D3E)
    // 0xFC - VK_NONAME - reserved
    // 0xFD - VK_PA1
    0xFE: { code: 'Clear' } // [USB: 0x9c] (Not in D3E)
  };

  //--------------------------------------------------------------------
  //
  // Browser/OS Specific Mappings
  //
  //--------------------------------------------------------------------

  mergeIf(keyCodeToInfoTable,
          'moz', {
            0x3B: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
            0x3D: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
            0x6B: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
            0x6D: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
            0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
            0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD } // [USB: 0x56]
          });

  mergeIf(keyCodeToInfoTable,
          'moz-mac', {
            0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
            0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
          });

  mergeIf(keyCodeToInfoTable,
          'moz-win', {
            0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
          });

  mergeIf(keyCodeToInfoTable,
          'chrome-mac', {
            0x5D: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
          });

  // Windows via Bootcamp (!)
  if (0) {
    mergeIf(keyCodeToInfoTable,
            'chrome-win', {
              0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
              0xDE: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
              0xDF: { code: 'Backquote', keyCap: '`' } // [USB: 0x35] `~ (US Standard 101)
            });

    mergeIf(keyCodeToInfoTable,
            'ie', {
              0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
              0xDE: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
              0xDF: { code: 'Backquote', keyCap: '`' } // [USB: 0x35] `~ (US Standard 101)
            });
  }

  mergeIf(keyCodeToInfoTable,
          'safari', {
            0x03: { code: 'Enter' }, // [USB: 0x28] old Safari
            0x19: { code: 'Tab' } // [USB: 0x2b] old Safari for Shift+Tab
          });

  mergeIf(keyCodeToInfoTable,
          'ios', {
            0x0A: { code: 'Enter', location: STANDARD } // [USB: 0x28]
          });

  mergeIf(keyCodeToInfoTable,
          'safari-mac', {
            0x5B: { code: 'MetaLeft', location: LEFT }, // [USB: 0xe3]
            0x5D: { code: 'MetaRight', location: RIGHT }, // [USB: 0xe7]
            0xE5: { code: 'KeyQ', keyCap: 'Q' } // [USB: 0x14] On alternate presses, Ctrl+Q sends this
          });

  //--------------------------------------------------------------------
  //
  // Identifier Mappings
  //
  //--------------------------------------------------------------------

  // Cases where newer-ish browsers send keyIdentifier which can be
  // used to disambiguate keys.

  // keyIdentifierTable[keyIdentifier] -> keyInfo

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
    // These only generate keyup events
    keyIdentifierTable['U+0010'] = { code: 'Function' };

    keyIdentifierTable['U+001C'] = { code: 'ArrowLeft' };
    keyIdentifierTable['U+001D'] = { code: 'ArrowRight' };
    keyIdentifierTable['U+001E'] = { code: 'ArrowUp' };
    keyIdentifierTable['U+001F'] = { code: 'ArrowDown' };

    keyIdentifierTable['U+0001'] = { code: 'Home' }; // [USB: 0x4a] Fn + ArrowLeft
    keyIdentifierTable['U+0004'] = { code: 'End' }; // [USB: 0x4d] Fn + ArrowRight
    keyIdentifierTable['U+000B'] = { code: 'PageUp' }; // [USB: 0x4b] Fn + ArrowUp
    keyIdentifierTable['U+000C'] = { code: 'PageDown' }; // [USB: 0x4e] Fn + ArrowDown
  }

  //--------------------------------------------------------------------
  //
  // Location Mappings
  //
  //--------------------------------------------------------------------

  // Cases where newer-ish browsers send location/keyLocation which
  // can be used to disambiguate keys.

  // locationTable[location][keyCode] -> keyInfo
  var locationTable = [];
  locationTable[LEFT] = {
    0x10: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
    0x11: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
    0x12: { code: 'AltLeft', location: LEFT } // [USB: 0xe2]
  };
  locationTable[RIGHT] = {
    0x10: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0x11: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0x12: { code: 'AltRight', location: RIGHT } // [USB: 0xe6]
  };
  locationTable[NUMPAD] = {
    0x0D: { code: 'NumpadEnter', location: NUMPAD } // [USB: 0x58]
  };

  mergeIf(locationTable[NUMPAD], 'moz', {
    0x6D: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0x6B: { code: 'NumpadAdd', location: NUMPAD } // [USB: 0x57]
  });
  mergeIf(locationTable[LEFT], 'moz-mac', {
    0xE0: { code: 'MetaLeft', location: LEFT } // [USB: 0xe3]
  });
  mergeIf(locationTable[RIGHT], 'moz-mac', {
    0xE0: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
  });
  mergeIf(locationTable[RIGHT], 'moz-win', {
    0x5B: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
  });


  mergeIf(locationTable[RIGHT], 'mac', {
    0x5D: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
  });

  mergeIf(locationTable[NUMPAD], 'chrome-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD } // [USB: 0x53]
  });

  mergeIf(locationTable[NUMPAD], 'safari-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xBB: { code: 'NumpadAdd', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0xBE: { code: 'NumpadDecimal', location: NUMPAD }, // [USB: 0x63]
    0xBF: { code: 'NumpadDivide', location: NUMPAD } // [USB: 0x54]
  });


  //--------------------------------------------------------------------
  //
  // Key Values
  //
  //--------------------------------------------------------------------

  // Mapping from `code` values to `key` values. Values defined at:
  // https://w3c.github.io/uievents-key/
  // Entries are only provided when `key` differs from `code`. If
  // printable, `shiftKey` has the shifted printable character. This
  // assumes US Standard 101 layout

  var codeToKeyTable = {
    // Modifier Keys
    ShiftLeft: { key: 'Shift' },
    ShiftRight: { key: 'Shift' },
    ControlLeft: { key: 'Control' },
    ControlRight: { key: 'Control' },
    AltLeft: { key: 'Alt' },
    AltRight: { key: 'Alt' },
    MetaLeft: { key: 'Meta' },
    MetaRight: { key: 'Meta' },

    // Whitespace Keys
    NumpadEnter: { key: 'Enter' },
    Space: { key: ' ' },

    // Printable Keys
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

  // Corrections for 'key' names in older browsers (e.g. FF36-)
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.key#Key_values
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

  //--------------------------------------------------------------------
  //
  // Exported Functions
  //
  //--------------------------------------------------------------------


  var codeTable = remap(keyCodeToInfoTable, 'code');

  try {
    var nativeLocation = nativeKeyboardEvent && ('location' in new KeyboardEvent(''));
  } catch (_) {}

  function keyInfoForEvent(event) {
    var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;
    var keyInfo = (function(){
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

    // TODO: Track these down and move to general tables
    if (0) {
      // TODO: Map these for newerish browsers?
      // TODO: iOS only?
      // TODO: Override with more common keyIdentifier name?
      switch (event.keyIdentifier) {
      case 'U+0010': keyInfo = { code: 'Function' }; break;
      case 'U+001C': keyInfo = { code: 'ArrowLeft' }; break;
      case 'U+001D': keyInfo = { code: 'ArrowRight' }; break;
      case 'U+001E': keyInfo = { code: 'ArrowUp' }; break;
      case 'U+001F': keyInfo = { code: 'ArrowDown' }; break;
      }
    }

    if (!keyInfo)
      return null;

    var key = (function() {
      var entry = codeToKeyTable[keyInfo.code];
      if (!entry) return keyInfo.code;
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
    if (!codeTable.hasOwnProperty(code)) return 'Undefined';
    if (locale && String(locale).toLowerCase() !== 'en-us') throw Error('Unsupported locale');
    var keyInfo = codeTable[code];
    return keyInfo.keyCap || keyInfo.code || 'Undefined';
  }

  if ('KeyboardEvent' in global && 'defineProperty' in Object) {
    (function() {
      function define(o, p, v) {
        if (p in o) return;
        Object.defineProperty(o, p, v);
      }

      define(KeyboardEvent.prototype, 'code', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return keyInfo ? keyInfo.code : '';
      }});

      // Fix for nonstandard `key` values (FF36-)
      if ('key' in KeyboardEvent.prototype) {
        var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
        Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function() {
          var key = desc.get.call(this);
          return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
        }});
      }

      define(KeyboardEvent.prototype, 'key', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
      }});

      define(KeyboardEvent.prototype, 'location', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
      }});

      define(KeyboardEvent.prototype, 'locale', { get: function() {
        return '';
      }});
    }());
  }

  if (!('queryKeyCap' in global.KeyboardEvent))
    global.KeyboardEvent.queryKeyCap = queryKeyCap;

  // Helper for IE8-
  global.identifyKey = function(event) {
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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
//
// INTERFACE DECLARATIONS
//
//
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
declare var io : {
 connect(url: string): Socket;
}
interface Socket {
 on(event: string, callback: (data: any) => void );
 emit(event: string, data: any);
}
interface ObjectConstructor {
 assign(target: any, ...sources: any[]): any;
}
interface WhiteBoardDispatcher
{
    elementMouseOver: (id: number, e: MouseEvent, component?: number, subId?: number) => void;
    elementMouseOut: (id: number, e: MouseEvent, component?: number, subId?: number) => void;
    elementMouseDown: (id: number, e: MouseEvent, component?: number, subId?: number) => void;
    elementMouseMove: (id: number, e: MouseEvent, component?: number, subId?: number) => void;
    elementMouseUp: (id: number, e: MouseEvent, component?: number, subId?: number) => void;
    elementMouseClick: (id: number, e: MouseEvent, component?: number, subId?: number) => void;
    elementMouseDoubleClick: (id: number, e: MouseEvent, component?: number, subId?: number) => void;

    elementTouchStart: (id: number, e: TouchEvent, component?: number, subId?: number) => void;
    elementTouchMove: (id: number, e: TouchEvent, component?: number, subId?: number) => void;
    elementTouchEnd: (id: number, e: TouchEvent, component?: number, subId?: number) => void;
    elementTouchCancel: (id: number, e: TouchEvent, component?: number, subId?: number) => void;

    elementDragOver: (id: number, e: DragEvent, component?: number, subId?: number) => void;
    elementDrop: (id: number, e: DragEvent, component?: number, subId?: number) => void;

    palleteChange: (change: BoardPalleteChange) => void;
    changeEraseSize: (newSize: number) => void;

    clearAlert: (id: number) => void;
    modeChange: (newMode: string) => void;

    mouseWheel: (e: MouseEvent) => void;
    mouseDown: (e: MouseEvent) => void;
    mouseMove: (e: MouseEvent) => void;
    mouseUp: (e: MouseEvent) => void;

    touchStart: (e: TouchEvent) => void;
    touchMove: (e: TouchEvent) => void;
    touchEnd: (e: TouchEvent) => void;
    touchCancel: (e: TouchEvent) => void;

    contextCopy: (e: MouseEvent) => void;
    contextCut: (e: MouseEvent) => void;
    contextPaste: (e: MouseEvent) => void;
    onCopy: (e: ClipboardEvent) => void;
    onPaste: (e: ClipboardEvent) => void;
    onCut: (e: ClipboardEvent) => void;

    dragOver: (e: DragEvent) => void;
    drop: (e: DragEvent) => void;
}

interface Operation
{
    undo: () => ElementUndoRedoReturn;
    redo: () => ElementUndoRedoReturn;
}
interface WhiteBoardOperation
{
    ids: Array<number>;
    undos: Array<() => ElementUndoRedoReturn>;
    redos: Array<() => ElementUndoRedoReturn>;
}

const BoardModes = {
    SELECT: 'SELECT',
    ERASE: 'ERASE'
}

const enum WorkerMessageTypes {
    START,
    SETSOCKET,
    UPDATEVIEW,
    SETVBOX,
    AUDIOSTREAM,
    VIDEOSTREAM,
    NEWVIEWCENTRE,
    NEWELEMENT,
    ELEMENTVIEW,
    ELEMENTDELETE,
    NEWALERT,
    REMOVEALERT,
    NEWINFO,
    REMOVEINFO
}

abstract class BoardElement {
    serverId: number;
    readonly id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    user: number;
    updateTime: Date;
    isDeleted: boolean;
    type: string;
    opBuffer: Array<UserMessage>;
    hoverTimer: number;
    infoElement: number;
    operationStack: Array<Operation>;
    operationPos: number;
    isSelected: boolean;
    isComplete: boolean;
    isEditing: boolean;

    currentViewState: ComponentViewState;

    // Callback Functions for Internal Element Induced Updates
    sendServerMsg: (msg: UserMessage) => void;
    createAlert: (header: string, message: string) => void;
    createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) => void;
    updateBoardView: (newView: ComponentViewState) => void;
    getAudioStream: () => void;
    getVideoStream: () => void;

    constructor(type: string, id: number, x: number, y: number, width: number, height: number,
        callbacks: ElementCallbacks, serverId?: number, updateTime?: Date)
    {
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

        if(updateTime)
        {
            this.updateTime = updateTime;
        }
        else
        {
            this.updateTime = new Date();
        }
    }

    /** Update the view state of this object.
     *
     * This creates a new view state object with the paramaters supplied in the JSON object, all other parameters are set from the previous state.
     *
     * @param {JSON Object} updatedParams - The parameters to be updated and their new values supplied as { x: newX, etc... }
     *
     * @return {ComponentViewState} The new view state
     */
    protected updateView(updatedParams: Object)
    {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    }

    /**   Get the current view state for this element.
     *
     *    @return {ComponentViewState} The view state of this element given it's current internal state
     */
    public getCurrentViewState()
    {
        return this.currentViewState;
    }

    /** Remove undo redo to preserve integrity
     *
     *
     *
     */
    protected remoteEdit()
    {
        this.operationPos = 0;
        this.operationStack = [];
    }

    protected getDefaultInputReturn()
    {
        let retVal: ElementInputReturn =
        {
            newView: this.currentViewState, undoOp: null, redoOp: null, serverMessages: [], palleteChanges: [], isSelected: this.isSelected,
            newViewCentre: null, infoMessage: null, alertMessage: null
        };

        return retVal;
    }

    protected checkForServerId(messages: Array<UserMessage>)
    {
        if(!this.serverId)
        {
            for(let i = 0; i < messages.length; i++)
            {
                console.log('No serverId, adding message to buffer.');
                this.opBuffer.push(messages[i]);
            }

            return [];
        }
        else
        {
            return messages;
        }
    }

    /**   Undo the last internal state edit
     *
     *    @return {ElementUndoRedoReturn} An object containing: the new view state, messages to be sent to the comm server,
     *    required changes to the pallete state
     */
    public handleUndo()
    {
        let retVal: ElementUndoRedoReturn = null;

        // Undo item operation at current stack position
        if(this.operationPos > 0)
        {
            retVal = this.operationStack[--this.operationPos].undo();
        }

        return retVal;
    }

    /**   Redo the last undone internal state edit
     *
     *    @return {ElementUndoRedoReturn} An object containing: the new view state, messages to be sent to the comm server
     *    required changes to the pallete state
     */
    public handleRedo()
    {
        let retVal: ElementUndoRedoReturn = null;

        // Redo operation at current stack position
        if(this.operationPos < this.operationStack.length)
        {
            retVal = this.operationStack[this.operationPos++].redo();
        }

        return retVal;
    }

    abstract setServerId(id: number): Array<UserMessage>;
    abstract getNewMsg(): UserNewElementPayload;

    abstract erase(): ElementUndoRedoReturn;
    abstract restore(): ElementUndoRedoReturn;
    abstract handleErase(): ElementInputReturn;

    abstract handleMouseDown(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputStartReturn;
    abstract handleMouseMove(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleMouseUp(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleMouseClick(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleDoubleClick(e: MouseEvent, localX: number, localY: number, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleTouchStart(e: TouchEvent, localTouches: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputStartReturn;
    abstract handleTouchMove(e: TouchEvent, touchChange: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleTouchEnd(e: TouchEvent, localTouches: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;
    abstract handleTouchCancel(e: TouchEvent, localTouches: Array<Point>, palleteState: BoardPallete, component?: number, subId?: number):
        ElementInputReturn;

    abstract handleBoardMouseDown(e: MouseEvent, x: number, y: number, palleteState: BoardPallete): ElementInputStartReturn;
    abstract handleBoardMouseMove(e: MouseEvent, changeX: number, changeY: number, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardMouseUp(e: MouseEvent, x: number, y: number, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardTouchStart(e: TouchEvent, touches: Array<Point>, palleteState: BoardPallete): ElementInputStartReturn;
    abstract handleBoardTouchMove(e: TouchEvent, toucheChange: Array<Point>, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardTouchEnd(e: TouchEvent, touches: Array<Point>, palleteState: BoardPallete): ElementInputReturn;
    abstract handleBoardTouchCancel(e: TouchEvent, touches: Array<Point>, palleteState: BoardPallete): ElementInputReturn;
    abstract handleKeyPress(e: KeyboardEvent, input: string, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCopy(e: ClipboardEvent, palleteState: BoardPallete): void;
    abstract handlePaste(e: ClipboardEvent, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCut(e: ClipboardEvent, palleteState: BoardPallete): ElementInputReturn;
    abstract handleCustomContext(item: number, palleteState: BoardPallete): ElementInputReturn;

    abstract handleServerMessage(message): ElementMessageReturn;

    abstract handleDeselect(): ComponentViewState;
    abstract handleSelect(): ComponentViewState;

    abstract handleHover(): HoverMessage;

    abstract handlePalleteChange(changes: BoardPalleteChange): ElementPalleteReturn;

    abstract audioStream(stream: MediaStream): void;
    abstract videoStream(stream: MediaStream): void;

    abstract startMove(): ComponentViewState;
    abstract handleMove(changeX: number, changeY: number): ComponentViewState;
    abstract endMove(): ElementMoveReturn;
}

abstract class BoardPallete {

    currentViewState: BoardPalleteViewState;

    abstract getCurrentViewState() : BoardPalleteViewState;

    /** Update the view state of this object.
     *
     * This creates a new view state object with the paramaters supplied in the JSON object, all other parameters are set from the previous state.
     *
     * @param {JSON Object} updatedParams - The parameters to be updated and their new values supplied as { x: newX, etc... }
     *
     * @return {ComponentViewState} The new view state
     */
    protected updateView(updatedParams: Object)
    {
        this.currentViewState = Object.assign({}, this.currentViewState, updatedParams);
        return this.currentViewState;
    }

    abstract handleChange(changeMsg: BoardPalleteChange) : BoardPalleteViewState;

    abstract getCursor() : ElementCursor;
}

interface BoardComponent {
    componentName: string;
    pallete: BoardPallete;
    Element;
    ElementView;
    PalleteView;
    ModeView
    DrawHandle: (data: DrawData, context: CanvasRenderingContext2D) => void;
}

let components: Immutable.Map<string, BoardComponent> = Immutable.Map<string, BoardComponent>();

let registerComponent = (componentName: string, Element, ElementView, Pallete, PalleteView, ModeView, DrawHandle) =>
{
    let pallete = null;
    if(Pallete)
    {
        pallete = new Pallete();
    }

    let newComp: BoardComponent =
    {
        componentName: componentName, Element: Element, ElementView: ElementView, pallete: pallete, PalleteView: PalleteView,
        ModeView: ModeView, DrawHandle: DrawHandle
    };
    components = components.set(componentName, newComp);
}

/**************************************************************************************************************************************************************
 *
 *
 *
 * START OF CLASS
 *
 *
 *
 **************************************************************************************************************************************************************/
class WhiteBoardController
{
    view: {storeUpdate: (WhiteBoardViewState) => void};
    viewState: WhiteBoardViewState;

    isHost: boolean = false;
    userId: number  = 0;
    socket: Socket  = null;

    lMousePress: boolean = false;
    wMousePress: boolean = false;
    rMousePress: boolean = false;
    touchPress:  boolean = false;
    moving:      boolean = false;

    scaleF:   number = 1;
    panX:     number = 0;
    panY:     number = 0;
    scaleNum: number = 0;

    pointList:    Array<Point> = [];
    isPoint:      boolean      = true;
    prevX:        number       = 0;
    prevY:        number       = 0;
    prevTouch:    TouchList;

    downPoint:    Point;
    groupStartX:  number       = 0;
    groupStartY:  number       = 0;

    mouseDownHandled:   boolean = false;
    touchStartHandled:  boolean = false;

    currentHover:   number  = -1;
    blockAlert:     boolean = false;
    selectDrag:     boolean = false;
    selectLeft:     number;
    selectTop:      number;
    selectWidth:    number;
    selectHeight:   number;
    currSelect:     Array<number> = [];
    groupMoving:    boolean = false;
    groupMoved:     boolean = false;

    operationStack: Array<WhiteBoardOperation> = [];
    operationPos:   number = 0;

    fileUploads: Array<File>       = [];
    fileReaders: Array<FileReader> = [];

    elementDict:  Array<number>       = [];
    boardElems:   Array<BoardElement> = [];
    infoElems:    Array<InfoMessage>  = [];
    cursor:       string;
    cursorURL:    Array<string>;
    cursorOffset: Point;



    textOutBuffer:    Array<TextOutBufferElement>  = [];
    textInBuffer:     Array<TextInBufferElement>   = [];

    constructor(isHost: boolean, userId: number)
    {
        this.isHost = isHost;
        this.userId = userId;

        let dispatcher: WhiteBoardDispatcher = {
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
            boardElements: Immutable.OrderedMap<number, ComponentViewState>(),
            infoElements:  Immutable.List<InfoElement>(),
            alertElements: Immutable.List<AlertElement>(),

            cursor: 'auto',
            cursorURL: [],
            cursorOffset: { x: 0, y: 0 },

            dispatcher: dispatcher,
            components: components
        };
    }

    setView = (view) =>
    {
        var whitElem  = document.getElementById('whiteBoard-input') as HTMLCanvasElement;
        var whitCont  = document.getElementById('whiteboard-container');

        whitElem.style.width = whitCont.clientWidth + 'px';
        whitElem.style.height = whitCont.clientHeight + 'px';
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;
        window.addEventListener('resize', this.windowResize);
        window.addEventListener('beforeunload', this.windowUnload);
        document.addEventListener('keypress', this.keyPress);
        document.addEventListener('keydown', this.keyDown);

        var newVBox = '0 0 ' + whitElem.width + ' ' + whitElem.height;

        this.viewState.viewBox = newVBox;
        this.viewState.viewWidth = whitElem.width;
        this.viewState.viewHeight = whitElem.height;
        this.viewState.viewScale = 1;

        this.view = view;
        view.setState(this.viewState);
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * STATE MODIFIERS (INTERNAL)
     *
     *
     *
     **********************************************************************************************************************************************************/
    updateView = (viewState: WhiteBoardViewState) : void =>
    {
        this.viewState = viewState;
        this.view.storeUpdate(this.viewState);
    }

    setElementView = (id: number, newView: ComponentViewState) : void =>
    {
        if(newView == null)
        {
            console.log("Issue tracked here.");
        }
        let newElemList = this.viewState.boardElements.set(id, newView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    getAudioStream = () : MediaStream =>
    {
        return null;
    }

    getVideoStream = () : MediaStream =>
    {
        return null;
    }

    newAlert = (type: string, message: string) : void =>
    {
        let newMsg : AlertElement = { type: type, message: message };
        let newElemList = this.viewState.alertElements.push(newMsg);

        this.updateView(Object.assign({}, this.viewState, { alertElements: newElemList}));
    }

    removeAlert = () : void =>
    {
        let newElemList = this.viewState.alertElements.shift();

        this.updateView(Object.assign({}, this.viewState, { alertElements: newElemList }));
    }

    deleteElement = (id: number) : void =>
    {
        let newElemList = this.viewState.boardElements.filter(element => element.id !== id);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList }));
    }

    setMode = (newMode: string) : void =>
    {
        let palleteView: BoardPalleteViewState = {};
        let cursor: ElementCursor = { cursor: 'auto', url: [], offset: { x: 0, y: 0 } };

        if(newMode != BoardModes.SELECT && newMode != BoardModes.ERASE)
        {
            palleteView = components.get(newMode).pallete.getCurrentViewState();
            cursor = components.get(newMode).pallete.getCursor();
        }

        this.cursor = cursor.cursor;
        this.cursorURL = cursor.url;
        this.cursorOffset = cursor.offset;

        this.updateView(Object.assign({}, this.viewState,
        {
            mode: newMode, palleteState: palleteView, cursor: this.cursor, cursorURL: this.cursorURL, cursorOffset: this.cursorOffset
        }));
    }

    sendMessage = (id: number, type: string, message: UserMessage) : void =>
    {
        let serverId = this.getBoardElement(id).serverId;
        let msg: UserMessageContainer = { id: serverId, type: type, payload: message };
        console.log('Sending message: ' + JSON.stringify(msg));
        this.socket.emit('MSG-COMPONENT', msg);
    }

    selectGroup = (ids: Array<number>) : void =>
    {
        for(let i = 0; i < this.currSelect.length; i++)
        {
            let elem = this.getBoardElement(this.currSelect[i]);

            if(elem.isDeleted)
            {
                console.log('Deselect is probably the issue.');
            }

            let newView = elem.handleDeselect();

            this.setElementView(elem.id, newView);
        }

        for(let i = 0; i < ids.length; i++)
        {
            let elem = this.getBoardElement(ids[i]);
            if(!elem.isDeleted)
            {
                let newView = elem.handleSelect();
                this.currSelect.push(elem.id);
                this.setElementView(elem.id, newView);
            }
        }
    }

    handleElementOperation = (id: number, undoOp: () => ElementUndoRedoReturn, redoOp: () => ElementUndoRedoReturn) : void =>
    {
        if(undoOp && redoOp)
        {
            this.newOperation(id, undoOp, redoOp);
        }
        else if(undoOp || redoOp)
        {
            console.error('Element provided either undo or redo operation. It must specify neither or both.');
        }
    }

    handleElementMessages = (id: number, type: string, messages: Array<UserMessage>) : void =>
    {
        for(let i = 0; i < messages.length; i++)
        {
            this.sendMessage(id, type, messages[i]);
        }
    }

    handleMouseElementSelect = (e: MouseEvent, elem: BoardElement, isSelected: boolean, cursor?: ElementCursor) : void =>
    {
        if(isSelected)
        {
            let alreadySelected = false;

            for(let i = 0; i < this.currSelect.length; i++)
            {
                if(this.currSelect[i] == elem.id)
                {
                    alreadySelected = true;
                }
            }

            if(!alreadySelected)
            {
                if(e.ctrlKey)
                {
                    this.currSelect.push(elem.id);
                }
                else
                {
                    for(let i = 0; i < this.currSelect.length; i++)
                    {
                        if(this.currSelect[i] != elem.id)
                        {
                            let selElem = this.getBoardElement(this.currSelect[i]);
                            let selElemView = selElem.handleDeselect();
                            this.setElementView(selElem.id, selElemView);
                        }
                    }
                    this.currSelect = [];
                    this.currSelect.push(elem.id);
                }
            }

            if(this.currSelect.length == 1 && cursor)
            {
                if(this.cursor != cursor.cursor || this.cursorURL != cursor.url)
                {
                    this.cursor = cursor.cursor;
                    this.cursorURL = cursor.url;
                    this.cursorOffset = cursor.offset;

                    this.updateView(Object.assign({}, this.viewState, { cursor: this.cursor, cursorURL: this.cursorURL, cursorOffset: this.cursorOffset }));
                }
            }
        }
        else
        {
            if(this.currSelect.length == 1 && this.currSelect[0] == elem.id)
            {
                this.cursor = 'auto';
                this.cursorURL = [];
                this.cursorOffset = { x: 0, y: 0 };

                this.updateView(Object.assign({}, this.viewState, { cursor: this.cursor, cursorURL: this.cursorURL, cursorOffset: this.cursorOffset }));
                this.currSelect = [];
            }
            else
            {
                for(let i = 0; i < this.currSelect.length; i++)
                {
                    if(this.currSelect[i] == elem.id)
                    {
                        this.currSelect.splice(i, 1);
                    }
                }
            }
        }
    }

    handleTouchElementSelect = (e: TouchEvent, elem: BoardElement, isSelected: boolean, cursor?: ElementCursor) : void =>
    {
        if(isSelected)
        {
            if(e.ctrlKey)
            {
                let alreadySelected = false;
                for(let i = 0; i < this.currSelect.length; i++)
                {
                    if(this.currSelect[i] == elem.id)
                    {
                        alreadySelected = true;
                    }
                }

                if(!alreadySelected)
                {
                    this.currSelect.push(elem.id);
                }
            }
            else
            {
                for(let i = 0; i < this.currSelect.length; i++)
                {
                    if(this.currSelect[i] != elem.id)
                    {
                        let selElem = this.getBoardElement(this.currSelect[i]);
                        let selElemView = selElem.handleDeselect();
                        this.setElementView(selElem.id, selElemView);
                    }
                }

                this.currSelect = [];
                this.currSelect.push(elem.id);
            }

            if(this.currSelect.length == 1 && cursor)
            {
                this.cursor = cursor.cursor;
                this.cursorURL = cursor.url;
                this.cursorOffset = cursor.offset;

                this.updateView(Object.assign({}, this.viewState, { cursor: this.cursor, cursorURL: this.cursorURL, cursorOffset: this.cursorOffset }));
            }
        }
        else
        {
            for(let i = 0; i < this.currSelect.length; i++)
            {
                if(this.currSelect[i] == elem.id)
                {
                    this.currSelect.splice(i, 1);
                }
            }
        }
    }

    handleElementPalleteChanges = (elem: BoardElement, changes: Array<BoardPalleteChange>): void =>
    {
        for(let j = 0; j < changes.length; j++)
        {
            let change = changes[j];
            components.get(elem.type).pallete.handleChange(change);

            for(let i = 0; i < this.currSelect.length; i++)
            {
                let selElem = this.getBoardElement(this.currSelect[i]);
                if(selElem.id != elem.id && selElem.type == elem.type)
                {
                    let retVal = selElem.handlePalleteChange(change);

                    this.handleElementMessages(selElem.id, selElem.type, retVal.serverMessages);
                    this.handleElementOperation(selElem.id, retVal.undoOp, retVal.redoOp);
                    this.setElementView(selElem.id, retVal.newView);
                }
            }
        }
    }

    handleElementNewViewCentre = (x: number, y: number): void =>
    {
        let whitElem  = document.getElementById('whiteBoard-input') as HTMLCanvasElement;
        let whitCont  = document.getElementById('whiteboard-container');
        let clientWidth = whitCont.clientWidth;
        let clientHeight = whitCont.clientHeight;

        let xChange = x - (this.panX + clientWidth * this.scaleF * 0.5);
        let yChange = y - (this.panY + clientHeight * this.scaleF * 0.5);

        let newPanX = this.panX + xChange;
        let newPanY = this.panY + yChange;

        if(newPanX < 0)
        {
            newPanX = 0;
        }
        if(newPanY < 0)
        {
            newPanY = 0;
        }

        this.setViewBox(newPanX, newPanY, this.scaleF);
    }

    handleRemoteEdit = (id: number) : void =>
    {
        // Remove all operations related to this item from operation buffer
        for(let i = 0; i < this.operationStack.length; i++)
        {
            if(this.operationStack[i].ids.indexOf(id) != -1)
            {
                // Replace operation with one that will just select the item (better user interation that removing or doing nothing)
                let newOp: WhiteBoardOperation =
                {
                    ids: this.operationStack[i].ids,
                    undos: [((elemIds) =>
                    {
                        return () => { this.selectGroup(elemIds); return null; };
                    })(this.operationStack[i].ids)],
                    redos: [((elemIds) =>
                    {
                        return () => { this.selectGroup(elemIds); return null; };
                    })(this.operationStack[i].ids)]
                };

                this.operationStack.splice(i, 1, newOp);
            }
        }
    }

    handleInfoMessage = (data: InfoMessageData) : void =>
    {
        /* TODO: */
    }

    handleAlertMessage = (msg: AlertMessageData) : void =>
    {
        if(msg)
        {
            this.newAlert(msg.header, msg.message);
        }
    }

    startMove = (startX: number, startY: number) : void =>
    {
        this.groupStartX = startX;
        this.groupStartY = startY;
        this.groupMoving = true;
        this.cursor = 'move';
        this.updateView(Object.assign({}, this.viewState, { cursor: this.cursor }));
        for(let i = 0; i < this.currSelect.length; i++)
        {
            let elem = this.getBoardElement(this.currSelect[i]);
            let retVal = elem.startMove();
        }
    }

    moveGroup = (x: number, y: number, editTime: Date) : void =>
    {
        // Loop over currently selected items, determine type and use appropriate method
        for(let i = 0; i < this.currSelect.length; i++)
        {
            let elem = this.getBoardElement(this.currSelect[i]);

            let elemView = elem.handleMove(x, y);
            this.setElementView(elem.id, elemView);
        }
    }

    endMove = (endX: number, endY: number) : void =>
    {
        this.groupMoving = false;
        this.cursor = 'auto';
        this.updateView(Object.assign({}, this.viewState, { cursor: this.cursor }));

        let undoOpList = [];
        let redoOpList = [];

        for(let i = 0; i < this.currSelect.length; i++)
        {
            let elem = this.getBoardElement(this.currSelect[i]);
            let retVal = elem.endMove();

            let undoOp = ((element, changeX, changeY) =>
            {
                return () =>
                {
                    element.handleMove(-changeX, -changeY);
                    let ret = element.endMove();
                    this.handleElementMessages(element.id, element.type, ret.serverMessages);
                    this.setElementView(element.id, ret.newView);
                };
            })(elem, endX - this.groupStartX, endY - this.groupStartY);
            let redoOp = ((element, changeX, changeY) =>
            {
                return () =>
                {
                    element.handleMove(changeX, changeY);
                    let ret = element.endMove();
                    this.handleElementMessages(element.id, element.type, ret.serverMessages);
                    this.setElementView(element.id, ret.newView);
                };
            })(elem, endX - this.groupStartX, endY - this.groupStartY);

            this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
            this.setElementView(elem.id, retVal.newView);

            undoOpList.push(undoOp);
            redoOpList.push(redoOp);
        }

        // Remove redo operations ahead of current position
        this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);

        // Add new operation to the stack
        let newOp: WhiteBoardOperation = { ids: this.currSelect.slice(), undos: undoOpList, redos: redoOpList };
        this.operationStack[this.operationPos++] = newOp;
    }

    selectElement = (id: number) : void =>
    {
        let elem = this.getBoardElement(id);

        if(!elem.isDeleted)
        {
            let newElemView = elem.handleSelect();
            this.setElementView(id, newElemView);
        }
    }

    deselectElement = (id: number) : void =>
    {
        let elem = this.getBoardElement(id);
        let newElemView = elem.handleDeselect();
        this.setElementView(elem.id, newElemView);
    }

    addInfoMessage = (x: number, y: number, width: number, height: number, header: string, message: string) : number =>
    {
        let newInfo: InfoMessage =
        {
            id: -1, x: x, y: y, width: width, height: height, header: header, message: message
        };

        let localId = this.infoElems.length;
        this.infoElems[localId] = newInfo;
        newInfo.id = localId;

        let newInfoView : InfoElement =
        {
            x: x, y: y, width: width, height: height, header: header, message: message
        };

        let newInfoList = this.viewState.infoElements.push(newInfoView);
        this.updateView(Object.assign({}, this.viewState, { infoElements: newInfoList}));

        return localId;
    }

    removeInfoMessage = (id: number) : void =>
    {
        let newInfoList = this.viewState.infoElements.delete(id);
        this.updateView(Object.assign({}, this.viewState, { infoElements: newInfoList}));
    }

    setViewBox = (panX: number, panY: number, scaleF: number) : void =>
    {
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let vBoxW = whitElem.clientWidth * scaleF;
        let vBoxH = whitElem.clientHeight * scaleF;

        this.scaleF = scaleF;
        this.panX = panX;
        this.panY = panY;

        let newVBox = '' + panX + ' ' + panY + ' ' + vBoxW + ' ' + vBoxH;

        // console.log('Updating Viewbox to: ' + newView);
        this.updateView(Object.assign({}, this.viewState,
            {
                viewBox: newVBox, viewX: panX, viewY: panY, viewWidth: vBoxW, viewHeight: vBoxH, viewScale: scaleF
            }));
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * INTERNAL FUNCTIONS
     *
     *
     *
     **********************************************************************************************************************************************************/
    getBoardElement = (id: number) : BoardElement =>
    {
        if(this.boardElems[id])
        {
            return this.boardElems[id];
        }
        else
        {
            throw 'Element does not exist';
        }
    }

    getInfoMessage = (id: number) : InfoMessage =>
    {
        return this.infoElems[id];
    }

    undo = () : void =>
    {
        console.log('Undo, stack length. ' + this.operationStack.length);
        // Undo operation at current stack position
        if(this.operationPos > 0)
        {
            let operation = this.operationStack[--this.operationPos];

            for(let i = 0; i < operation.undos.length; i++)
            {
                let retVal: ElementUndoRedoReturn = operation.undos[i]();
                if(retVal)
                {
                    let elem = this.getBoardElement(retVal.id);


                    this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    this.setElementView(retVal.id, retVal.newView);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    if(retVal.wasDelete)
                    {
                        this.deleteElement(elem.id);
                    }
                }
            }
        }
    }

    redo = () : void =>
    {
        // Redo operation at current stack position
        if(this.operationPos < this.operationStack.length)
        {
            let operation =  this.operationStack[this.operationPos++];
            for(let i = 0; i < operation.redos.length; i++)
            {
                let retVal: ElementUndoRedoReturn = operation.redos[i]();

                if(retVal)
                {
                    let elem = this.getBoardElement(retVal.id);
                    this.handleElementMessages(retVal.id, elem.type, retVal.serverMessages);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    this.setElementView(retVal.id, retVal.newView);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    if(retVal.wasDelete)
                    {
                        this.deleteElement(elem.id);
                    }
                }
            }
        }
    }

    newOperation = (itemId:  number, undoOp: () => ElementUndoRedoReturn, redoOp: () => ElementUndoRedoReturn) : void =>
    {
        // Remove redo operations ahead of current position
        this.operationStack.splice(this.operationPos, this.operationStack.length - this.operationPos);

        // Add new operation to the stack
        let newOp: WhiteBoardOperation = { ids: [itemId], undos: [undoOp], redos: [redoOp] };
        this.operationStack[this.operationPos++] = newOp;
    }

    undoItemEdit = (id: number) : void =>
    {
        let elem = this.getBoardElement(id);

        // Undo item operation at current stack position
        if(!elem.isDeleted && elem.operationPos > 0)
        {
            elem.operationStack[--elem.operationPos].undo();
        }
    }

    redoItemEdit = (id: number) : void =>
    {
        let elem = this.getBoardElement(id);

        // Redo operation at current stack position
        if(!elem.isDeleted && elem.operationPos < elem.operationStack.length)
        {
            elem.operationStack[elem.operationPos++].redo();
        }
    }

    addHoverInfo = (id: number) : void =>
    {
        /* TODO: Only display over whiteboard, and adjust width and height */
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let elem = this.getBoardElement(id);
        let infoId = this.addInfoMessage(this.prevX - offsetX + 20, this.prevY - offsetY, 200, 200, 'Test Message', 'User ID: ' + elem.user);

        elem.infoElement = infoId;
    }

    removeHoverInfo = (id: number) : void =>
    {
        let elem = this.getBoardElement(id);
        elem.infoElement = -1;
        this.currentHover = -1;
        this.removeInfoMessage(elem.infoElement);
    }

    infoMessageTimeout = (id: number, self) : void =>
    {
        if(this.lMousePress || this.rMousePress || this.wMousePress)
        {
            // Reset timeout as a mouse button is pressed
            let elem = this.getBoardElement(id);

            clearTimeout(elem.hoverTimer);
            elem.hoverTimer = setTimeout(this.infoMessageTimeout, 2000, id);
        }
        else
        {
            this.addHoverInfo(id);
        }
    }

    compareUpdateTime = (elem1: ComponentViewState, elem2: ComponentViewState) : number =>
    {
        if(elem1.updateTime.getTime() > elem2.updateTime.getTime())
        {
            return 1;
        }
        else if(elem1.updateTime.getTime() < elem2.updateTime.getTime())
        {
            return -1;
        }
        else
        {
            return 0;
        }
    }

    sendNewElement = (msg: UserNewElementMessage) : void =>
    {
        this.socket.emit('NEW-ELEMENT', msg);
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * SOCKET CODE
     *
     *
     *
     **********************************************************************************************************************************************************/
    setSocket = (socket: Socket) : void =>
    {
        var self = this;
        this.socket = socket;

        this.socket.on('JOIN', function(data: ServerBoardJoinMessage)
        {

        });

        this.socket.on('NEW-ELEMENT', function(data: ServerMessageContainer)
        {
            if(self.elementDict[data.serverId] == undefined || self.elementDict[data.serverId] == null)
            {
                let localId = self.boardElems.length;
                let callbacks: ElementCallbacks =
                {
                    sendServerMsg: ((id: number, type: string) =>
                    { return (msg: UserMessage) => { self.sendMessage(id, type, msg) }; })(localId, data.type),
                    createAlert: (header: string, message: string) => {},
                    createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) =>
                    { return self.addInfoMessage(x, y, width, height, header, message); },
                    removeInfo: (id: number) => { self.removeInfoMessage(id); },
                    updateBoardView: ((id: number) =>
                    { return (newView: ComponentViewState) => { self.setElementView(id, newView); }; })(localId),
                    getAudioStream: () => { return self.getAudioStream(); },
                    getVideoStream: () => { return self.getVideoStream(); }
                }
                let creationArg: CreationData = { id: localId, userId: data.userId, callbacks: callbacks, serverMsg: data.payload, serverId: data.serverId };
                self.boardElems[localId] = components.get(data.type).Element.createElement(creationArg);
                self.elementDict[data.serverId] = localId;

                self.setElementView(self.boardElems[localId].id, self.boardElems[localId].getCurrentViewState());
            }
        });

        this.socket.on('ELEMENT-ID', function(data: ServerIdMessage)
        {
            self.elementDict[data.serverId] = data.localId;
            let elem = self.boardElems[data.localId];
            let retVal = elem.setServerId(data.serverId);

            self.handleElementMessages(elem.id, elem.type, retVal);
        });

        this.socket.on('MSG-COMPONENT', function(data: ServerMessageContainer)
        {
            if(self.elementDict[data.serverId] != undefined && self.elementDict[data.serverId] != null)
            {
                let elem = self.getBoardElement(self.elementDict[data.serverId])
                if(elem.type == data.type)
                {
                    let retVal = elem.handleServerMessage(data.payload);

                    if(retVal.wasEdit)
                    {
                        self.handleRemoteEdit(elem.id);
                    }

                    self.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    self.setElementView(elem.id, retVal.newView);
                    self.handleInfoMessage(retVal.infoMessage);
                    self.handleAlertMessage(retVal.alertMessage);

                    if(retVal.wasDelete)
                    {
                        self.deleteElement(elem.id);

                        // Remove from current selection
                        if(self.currSelect.indexOf(elem.id))
                        {
                            self.currSelect.splice(self.currSelect.indexOf(elem.id), 1);
                        }

                        if(self.currentHover == elem.id)
                        {
                            clearTimeout(elem.hoverTimer);
                            self.removeHoverInfo(self.currentHover);
                        }

                        for(let i = 0; i < self.operationStack.length; i++)
                        {
                            if(self.operationStack[i].ids.indexOf(elem.id) != -1)
                            {
                                console.log('Element in this set.');
                                if(self.operationStack[i].ids.length == 1)
                                {
                                    if(i <= self.operationPos)
                                    {
                                        self.operationPos--;
                                    }
                                    // Decrement i to account fot the removal of this item.
                                    self.operationStack.splice(i--, 1);
                                }
                                else
                                {
                                    console.log('This should work.');
                                    // Remove the deleted item from the selection.
                                    self.operationStack[i].ids.splice(self.operationStack[i].ids.indexOf(elem.id), 1);

                                    // Replace operation with one that will just select the remaining items.
                                    let newOp: WhiteBoardOperation =
                                    {
                                        ids: self.operationStack[i].ids,
                                        undos: [((elemIds) =>
                                        {
                                            return () => { self.selectGroup(elemIds); return null; };
                                        })(self.operationStack[i].ids.slice())],
                                        redos: [((elemIds) =>
                                        {
                                            return () => { self.selectGroup(elemIds); return null; };
                                        })(self.operationStack[i].ids.slice())]
                                    };

                                    self.operationStack.splice(i, 1, newOp);
                                }
                            }
                        }
                    }
                }
                else
                {
                    console.error('Received bad element message.');
                }
            }
            else if(data.type && data.serverId)
            {
                let msg: UserUnknownElement = { type: data.type, id: data.serverId };
                console.log('Unknown element. ID: ' + data.serverId);
                self.socket.emit('UNKNOWN-ELEMENT', msg);
            }
        });
        this.socket.on('ERROR', function(message: string)
        {
            console.log('SERVER: ' + message);
            self.newAlert('SERVER ERROR', 'A server error has occured, some data in this session may be lost.');
        });
    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * DISPATCHER METHODS
     *
     *
     *
     **********************************************************************************************************************************************************/
    modeChange = (newMode: string) : void =>
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var context  = whitElem.getContext('2d');
        context.clearRect(0, 0, whitElem.width, whitElem.height);

        for(let i = 0; i < this.currSelect.length; i++)
        {
            let elem = this.getBoardElement(this.currSelect[i]);

            let retVal = elem.handleDeselect();
            this.setElementView(elem.id, retVal);
        }

        this.currSelect = [];
        this.setMode(newMode);
    }

    changeEraseSize = (newSize: number) : void =>
    {
        let newView = Object.assign({}, this.viewState, { eraseSize: newSize });
        this.updateView(newView);
    }

    elementMouseOver = (id: number, e: MouseEvent) : void =>
    {
        let elem = this.getBoardElement(id);
        if(this.currentHover == -1)
        {
            this.currentHover = id;
            elem.hoverTimer = setTimeout(this.infoMessageTimeout, 2000, id);
        }
        else
        {
            let prevElem = this.getBoardElement(this.currentHover);
            clearTimeout(prevElem.hoverTimer);
        }
    }

    elementMouseOut = (id: number, e: MouseEvent) : void =>
    {
        let elem = this.getBoardElement(id);

        if(this.currentHover == id)
        {
            clearTimeout(elem.hoverTimer);
            this.removeHoverInfo(this.currentHover);
        }
    }

    elementMouseDown = (id: number, e: MouseEvent, componenet?: number, subId?: number) : void =>
    {
        e.preventDefault();
        let elem = this.getBoardElement(id);
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
        let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

        if(this.currentHover == id)
        {
            clearTimeout(elem.hoverTimer);
            this.removeHoverInfo(this.currentHover);
        }

        if(this.viewState.mode == BoardModes.SELECT)
        {
            if(this.currSelect.length > 1 && elem.isSelected)
            {
                this.startMove(xPos, yPos);
            }
            else
            {
                let retVal = elem.handleMouseDown(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);

                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(id, elem.type, retVal.serverMessages);
                this.handleMouseElementSelect(e, elem, retVal.isSelected, retVal.cursor);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(id, retVal.newView);
            }
            this.mouseDownHandled = true;
        }

        this.prevX = e.clientX;
        this.prevY = e.clientY;

    }

    elementMouseMove = (id: number, e: MouseEvent, componenet?: number, subId?: number) : void =>
    {
        let elem = this.getBoardElement(id);
        if(this.viewState.mode == BoardModes.ERASE)
        {
            if(this.lMousePress)
            {
                if(this.isHost || this.userId == elem.user)
                {
                    let retVal = elem.handleErase();
                    this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                    this.deleteElement(id);

                    if(this.currentHover == id)
                    {
                        clearTimeout(elem.hoverTimer);
                        this.removeHoverInfo(this.currentHover);
                    }
                }
            }
        }
        else if(this.viewState.mode == BoardModes.SELECT && !this.groupMoving)
        {
            let changeX = (e.clientX - this.prevX) * this.scaleF;
            let changeY = (e.clientY - this.prevY) * this.scaleF;
            let retVal = elem.handleMouseMove(e, changeX, changeY, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleMouseElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);

            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    elementMouseUp = (id: number, e: MouseEvent, componenet?: number, subId?: number) : void =>
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
            let elem = this.getBoardElement(id);
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
            let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

            let retVal = elem.handleMouseUp(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleMouseElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
        }
    }

    elementMouseClick = (id: number, e: MouseEvent, componenet?: number, subId?: number) : void =>
    {
        let elem = this.getBoardElement(id);

        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
        let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

        if(this.viewState.mode == BoardModes.ERASE)
        {
            if(this.isHost || this.userId == elem.user)
            {
                let retVal = elem.handleErase();

                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.deleteElement(id);

                if(this.currentHover == id)
                {
                    clearTimeout(elem.hoverTimer);
                    this.removeHoverInfo(this.currentHover);
                }
            }
        }
        else if(this.viewState.mode == BoardModes.SELECT && this.currSelect.length < 2)
        {
            let retVal = elem.handleMouseClick(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleMouseElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
        }
    }

    elementMouseDoubleClick = (id: number, e: MouseEvent, componenet?: number, subId?: number) : void =>
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
            let elem = this.getBoardElement(id);
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
            let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

            let retVal = elem.handleDoubleClick(e, xPos - elem.x, yPos - elem.y, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleMouseElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
            e.stopPropagation();
        }
    }

    elementTouchStart = (id: number, e: TouchEvent, componenet?: number, subId?: number) : void =>
    {
        let elem = this.getBoardElement(id);
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let localTouches: Array<BoardTouch>;

        for(let i = 0; i < e.touches.length; i++)
        {
            let touch = e.touches.item(i);

            let xPos = (touch.clientX - offsetX) * this.scaleF + this.panX;
            let yPos = (touch.clientY - offsetY) * this.scaleF + this.panY;

            localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
        }

        if(this.currSelect.length > 1 && elem.isSelected)
        {
            /* TODO: */
            //this.startMove();
            //this.touchStartHandled = true;
        }
        else
        {
            let retVal = elem.handleTouchStart(e, localTouches, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleTouchElementSelect(e, elem, retVal.isSelected, retVal.cursor);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
            this.touchStartHandled = true;
        }

        this.prevTouch = e.touches;
    }

    elementTouchMove = (id: number, e: TouchEvent, componenet?: number, subId?: number) : void =>
    {
        let touchMoves: Array<BoardTouch>;

        if(this.viewState.mode == BoardModes.ERASE)
        {
            var elem = this.getBoardElement(id);

            if(this.isHost || this.userId == elem.user)
            {
                let retVal = elem.handleErase();

                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
                this.deleteElement(id);
            }
        }
        else if(this.viewState.mode == BoardModes.SELECT && !this.groupMoving)
        {
            for(let i = 0; i < e.touches.length; i++)
            {
                let touch = e.touches.item(i);

                for(let j = 0; j < this.prevTouch.length; j++)
                {
                    if(this.prevTouch[j].identifier == touch.identifier)
                    {
                        let xChange = (touch.clientX - this.prevTouch[j].clientX) * this.scaleF;
                        let yChange = (touch.clientY - this.prevTouch[j].clientY) * this.scaleF;

                        let touchChange: BoardTouch = { x: xChange, y: yChange, identifer: touch.identifier };

                        touchMoves.push(touchChange);
                    }
                }
            }

            let retVal = elem.handleTouchMove(e, touchMoves, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleTouchElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);

            this.prevTouch = e.touches;
        }
    }

    elementTouchEnd = (id: number, e: TouchEvent, componenet?: number, subId?: number) : void =>
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
            let elem = this.getBoardElement(id);
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let localTouches: Array<BoardTouch>;

            for(let i = 0; i < e.touches.length; i++)
            {
                let touch = e.touches.item(i);

                let xPos = (touch.clientX - offsetX) * this.scaleF + this.panX;
                let yPos = (touch.clientY - offsetY) * this.scaleF + this.panY;

                localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
            }

            let retVal = elem.handleTouchEnd(e, localTouches, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleTouchElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
        }
    }

    elementTouchCancel = (id: number, e: TouchEvent, componenet?: number, subId?: number) : void =>
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
            let elem = this.getBoardElement(id);
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let localTouches: Array<BoardTouch>;

            for(let i = 0; i < e.touches.length; i++)
            {
                let touch = e.touches.item(i);

                let xPos = (touch.clientX - offsetX) * this.scaleF + this.panX;
                let yPos = (touch.clientY - offsetY) * this.scaleF + this.panY;

                localTouches.push({ x: xPos, y: yPos, identifer: touch.identifier });
            }

            let retVal = elem.handleTouchCancel(e, localTouches, components.get(elem.type).pallete, componenet, subId);

            this.handleElementOperation(id, retVal.undoOp, retVal.redoOp);
            this.handleElementMessages(id, elem.type, retVal.serverMessages);
            this.handleTouchElementSelect(e, elem, retVal.isSelected);
            this.handleElementPalleteChanges(elem, retVal.palleteChanges);
            if(retVal.newViewCentre)
            {
                this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
            }
            this.handleInfoMessage(retVal.infoMessage);
            this.handleAlertMessage(retVal.alertMessage);
            this.setElementView(id, retVal.newView);
        }
    }

    elementDragOver = (id: number, e: DragEvent, componenet?: number, subId?: number) : void =>
    {
        /* TODO: */

        e.stopPropagation();
    }

    elementDrop = (id: number, e: DragEvent, componenet?: number, subId?: number) : void =>
    {
        /* TODO: */

        e.stopPropagation();
    }

    mouseDown = (e: MouseEvent) : void =>
    {
        e.preventDefault();
        if(!this.lMousePress && !this.wMousePress && !this.rMousePress)
        {
            this.lMousePress = e.buttons & 1 ? true : false;
            this.rMousePress = e.buttons & 2 ? true : false;
            this.wMousePress = e.buttons & 4 ? true : false;
            this.isPoint = true;
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            this.prevX = e.clientX;
            this.prevY = e.clientY;

            let newPoint: Point = {x: 0, y: 0};
            this.pointList = [];
            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);
            this.pointList[this.pointList.length] = newPoint;

            this.downPoint = {x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY)};

            if(this.viewState.alertElements.size == 0)
            {
                this.blockAlert = true;
                this.updateView(Object.assign({}, this.viewState, { blockAlert: true }));
            }
        }

        if(this.mouseDownHandled)
        {
            this.mouseDownHandled = false;
        }
        else
        {
            if(this.currSelect.length > 0)
            {
                // Deselect currently selected items
                for(let i = 0; i < this.currSelect.length; i++)
                {
                    this.deselectElement(this.currSelect[i]);
                }
                this.currSelect = [];
            }
            else
            {
                if(this.lMousePress && this.viewState.mode == BoardModes.SELECT)
                {
                    this.selectDrag = true;
                }
            }
            if(this.currentHover != -1)
            {
                let elem = this.getBoardElement(this.currentHover);
                if(elem.infoElement != -1)
                {
                    this.removeHoverInfo(this.currentHover);
                }
                clearTimeout(elem.hoverTimer);
            }
        }
    }

    mouseMove = (e: MouseEvent) : void =>
    {
        if(this.currentHover != -1)
        {
            let elem = this.getBoardElement(this.currentHover);
            if(elem.infoElement != -1)
            {
                this.removeHoverInfo(this.currentHover);
            }
            else
            {
                clearTimeout(elem.hoverTimer);
                elem.hoverTimer = setTimeout(this.infoMessageTimeout, 2000, this.currentHover);
            }
        }

        if(this.wMousePress)
        {
            var whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;

            var newPanX = this.panX + (this.prevX - e.clientX) * this.scaleF;
            var newPanY = this.panY + (this.prevY - e.clientY) * this.scaleF;

            this.prevX = e.clientX;
            this.prevY = e.clientY;

            if(newPanX < 0)
            {
                newPanX = 0;
            }
            if(newPanY < 0)
            {
                newPanY = 0;
            }

            this.setViewBox(newPanX, newPanY, this.scaleF);
        }
        else if(this.lMousePress)
        {
            var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY  = elemRect.top - document.body.scrollTop;
            var offsetX  = elemRect.left - document.body.scrollLeft;
            var context  = whitElem.getContext('2d');
            var newPoint: Point = {x: 0, y: 0};

            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);

            this.pointList.push(newPoint);

            if(this.viewState.mode == BoardModes.SELECT)
            {
                if(this.groupMoving)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;

                    this.moveGroup(changeX, changeY, new Date());

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.groupMoved = true;
                }
                else if(this.selectDrag)
                {
                    let rectLeft;
                    let rectTop;
                    let rectWidth;
                    let rectHeight;

                    if(newPoint.x > this.downPoint.x)
                    {
                        rectLeft = this.downPoint.x;
                        rectWidth = newPoint.x - this.downPoint.x;
                    }
                    else
                    {
                        rectLeft = newPoint.x;
                        rectWidth = this.downPoint.x - newPoint.x;
                    }

                    if(newPoint.y > this.downPoint.y)
                    {
                        rectTop = this.downPoint.y;
                        rectHeight = newPoint.y - this.downPoint.y;
                    }
                    else
                    {
                        rectTop = newPoint.y;
                        rectHeight = this.downPoint.y - newPoint.y;
                    }

                    context.clearRect(0, 0, whitElem.width, whitElem.height);

                    if(rectWidth > 0 && rectHeight > 0)
                    {
                        context.beginPath();
                        context.strokeStyle = 'black';
                        context.setLineDash([5]);
                        context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
                        context.stroke();
                    }

                    this.selectLeft = this.panX + rectLeft * this.scaleF;
                    this.selectTop = this.panY + rectTop * this.scaleF;
                    this.selectWidth = rectWidth * this.scaleF;
                    this.selectHeight = rectHeight * this.scaleF;
                }
                else if(this.currSelect.length == 1)
                {
                    let elem = this.getBoardElement(this.currSelect[0]);

                    let changeX = (e.clientX - this.prevX) * this.scaleF;
                    let changeY = (e.clientY - this.prevY) * this.scaleF;

                    let retVal = elem.handleBoardMouseMove(e, changeX, changeY, components.get(elem.type).pallete);

                    this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    this.handleMouseElementSelect(e, elem, retVal.isSelected);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(elem.id, retVal.newView);
                }
            }
            else if(!this.rMousePress && this.viewState.mode != BoardModes.ERASE)
            {
                if(this.currSelect.length == 0)
                {
                    context.clearRect(0, 0, whitElem.width, whitElem.height);
                    let data: DrawData =
                    {
                        palleteState: components.get(this.viewState.mode).pallete, pointList: this.pointList
                    };
                    components.get(this.viewState.mode).DrawHandle(data, context);
                }
                else if(this.currSelect.length == 1)
                {
                    let elem = this.getBoardElement(this.currSelect[0]);

                    let changeX = (e.clientX - this.prevX) * this.scaleF;
                    let changeY = (e.clientY - this.prevY) * this.scaleF;

                    let retVal = elem.handleBoardMouseMove(e, changeX, changeY, components.get(elem.type).pallete);

                    this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                    this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                    this.handleMouseElementSelect(e, elem, retVal.isSelected);
                    this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                    if(retVal.newViewCentre)
                    {
                        this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                    }
                    this.handleInfoMessage(retVal.infoMessage);
                    this.handleAlertMessage(retVal.alertMessage);
                    this.setElementView(elem.id, retVal.newView);
                }
            }
        }

        this.prevX = e.clientX;
        this.prevY = e.clientY;
    }

    mouseUp = (e: MouseEvent) : void =>
    {
        if(this.lMousePress && !this.wMousePress)
        {
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let context = whitElem.getContext('2d');
            let rectLeft;
            let rectTop;
            let rectWidth;
            let rectHeight;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;
            let newPoint: Point = {x: 0, y: 0};

            context.clearRect(0, 0, whitElem.width, whitElem.height);

            if(this.currSelect.length == 0)
            {
                newPoint.x = Math.round(e.clientX - offsetX);
                newPoint.y = Math.round(e.clientY - offsetY);


                if(newPoint.x > this.downPoint.x)
                {
                    rectLeft = this.downPoint.x;
                    rectWidth = newPoint.x - this.downPoint.x;
                }
                else
                {
                    rectLeft = newPoint.x;
                    rectWidth = this.downPoint.x - newPoint.x;
                }

                if(newPoint.y > this.downPoint.y)
                {
                    rectTop = this.downPoint.y;
                    rectHeight = newPoint.y - this.downPoint.y;
                }
                else
                {
                    rectTop = newPoint.y;
                    rectHeight = this.downPoint.y - newPoint.y;
                }

                let x = rectLeft * this.scaleF + this.panX;
                let y = rectTop * this.scaleF + this.panY;
                let width = rectWidth * this.scaleF;
                let height = rectHeight * this.scaleF;

                if(this.viewState.mode == BoardModes.SELECT)
                {
                    if(this.selectDrag)
                    {
                        context.clearRect(0, 0, whitElem.width, whitElem.height);

                        // Cycle through board elements and select those within the rectangle
                        this.boardElems.forEach((elem: BoardElement) =>
                        {
                            if(!elem.isDeleted && elem.isComplete && elem.x >= this.selectLeft && elem.y >= this.selectTop)
                            {
                                if(this.selectLeft + this.selectWidth >= elem.x + elem.width && this.selectTop + this.selectHeight >= elem.y + elem.height)
                                {
                                    this.currSelect.push(elem.id);
                                    this.selectElement(elem.id);
                                }
                            }
                        });
                    }
                }
                else if(this.viewState.mode != BoardModes.ERASE)
                {
                    let self = this;
                    let localId = this.boardElems.push(null) - 1;
                    let callbacks: ElementCallbacks =
                    {
                        sendServerMsg: ((id: number, type: string) =>
                        { return (msg: UserMessage) => { self.sendMessage(id, type, msg) }; })(localId, self.viewState.mode),
                        createAlert: (header: string, message: string) => {},
                        createInfo: (x: number, y: number, width: number, height: number, header: string, message: string) =>
                        { return self.addInfoMessage(x, y, width, height, header, message); },
                        removeInfo: (id: number) => { self.removeInfoMessage(id); },
                        updateBoardView: ((id: number) =>
                        { return (newView: ComponentViewState) => { self.setElementView(id, newView); }; })(localId),
                        getAudioStream: () => { return self.getAudioStream(); },
                        getVideoStream: () => { return self.getVideoStream(); }
                    }

                    let data: CreationData =
                    {
                        id: localId, userId: this.userId, callbacks: callbacks, x: x, y: y, width: width, height: height,
                        pointList: this.pointList, scaleF: this.scaleF, panX: this.panX, panY: this.panY,
                        palleteState: components.get(this.viewState.mode).pallete
                    };
                    let newElem: BoardElement = components.get(this.viewState.mode).Element.createElement(data);

                    if(newElem)
                    {
                        let undoOp = ((elem) => { return elem.erase.bind(elem); })(newElem);
                        let redoOp = ((elem) => { return elem.restore.bind(elem); })(newElem);
                        this.boardElems[localId] = newElem;

                        let viewState = newElem.getCurrentViewState();
                        this.setElementView(localId, viewState);

                        let payload: UserNewElementPayload = newElem.getNewMsg();
                        let msg: UserNewElementMessage = { type: newElem.type, payload: payload };

                        this.handleElementOperation(localId, undoOp, redoOp);
                        this.sendNewElement(msg);
                    }
                    else
                    {
                        // Failed to create element, remove place holder.
                        this.boardElems.splice(localId, 1);
                    }
                }
            }
            else if(this.currSelect.length == 1)
            {
                let elem = this.getBoardElement(this.currSelect[0]);

                let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
                let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

                let retVal = elem.handleBoardMouseUp(e, xPos, yPos, components.get(elem.type).pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                this.handleMouseElementSelect(e, elem, retVal.isSelected);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }

            if(this.groupMoved)
            {
                let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
                let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

                this.groupMoved = false;
                this.endMove(xPos, yPos);
            }
        }

        if(this.blockAlert)
        {
            this.blockAlert = false;
            this.updateView(Object.assign({}, this.viewState, { blockAlert: false }));
        }

        this.selectDrag = false;
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.pointList = [];
    }

    touchStart = () : void =>
    {
        this.touchPress = true;
        /* TODO: */
    }

    touchMove = (e: TouchEvent) : void =>
    {
        /* TODO: */
        if(this.touchPress)
        {

        }
    }

    touchEnd = () : void =>
    {
        /* TODO: */
        this.touchPress = false;
    }

    touchCancel = () : void =>
    {
        /* TODO: */
    }

    keyDown = (e: KeyboardEvent) : void =>
    {
        if (e.keyCode === 8)
        {
            if(this.currSelect.length == 1)
            {
                e.preventDefault();

                let elem = this.getBoardElement(this.currSelect[0]);

                let retVal = elem.handleKeyPress(e, 'Backspace', components.get(elem.type).pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }
        }
    }

    keyPress = (e: KeyboardEvent) : void =>
    {
        let inputChar = e.key;
        if(e.ctrlKey)
        {
            if(inputChar == 'z')
            {
                // If there is exactly one item selected treat it as being edited.
                if(this.currSelect.length == 1 && this.getBoardElement(this.currSelect[0]).isEditing)
                {
                    this.undoItemEdit(this.currSelect[0]);
                }
                else
                {
                    this.undo();
                }
            }
            else if(inputChar == 'y')
            {
                // If there is exactly one item selected treat it as being edited.
                if(this.currSelect.length == 1 && this.getBoardElement(this.currSelect[0]).isEditing)
                {
                    this.redoItemEdit(this.currSelect[0]);
                }
                else
                {
                    this.redo();
                }
            }
        }
        else
        {
            if(this.currSelect.length == 1)
            {
                e.preventDefault();

                let elem = this.getBoardElement(this.currSelect[0]);

                let retVal = elem.handleKeyPress(e, 'Backspace', components.get(elem.type).pallete);

                this.handleElementOperation(elem.id, retVal.undoOp, retVal.redoOp);
                this.handleElementMessages(elem.id, elem.type, retVal.serverMessages);
                this.handleElementPalleteChanges(elem, retVal.palleteChanges);
                if(retVal.newViewCentre)
                {
                    this.handleElementNewViewCentre(retVal.newViewCentre.x, retVal.newViewCentre.y);
                }
                this.handleInfoMessage(retVal.infoMessage);
                this.handleAlertMessage(retVal.alertMessage);
                this.setElementView(elem.id, retVal.newView);
            }
        }
    }

    contextCopy = (e: MouseEvent) : void =>
    {
        document.execCommand("copy");
    }

    contextCut = (e: MouseEvent) : void =>
    {
        document.execCommand("cut");
    }

    contextPaste = (e: MouseEvent) : void =>
    {
        document.execCommand("paste");
    }

    onCopy = (e: ClipboardEvent) : void =>
    {
        console.log('COPY EVENT');
        /* TODO: */
    }

    onPaste = (e: ClipboardEvent) : void =>
    {
        console.log('PASTE EVENT');
        /* TODO: */
    }

    onCut = (e: ClipboardEvent) : void =>
    {
        console.log('CUT EVENT');
        /* TODO: */
    }

    dragOver = (e: DragEvent) : void =>
    {
        /* TODO: Pass to elements as necessary. */
        e.preventDefault();
    }

    drop = (e: DragEvent) : void =>
    {

        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY  = elemRect.top - document.body.scrollTop;
        var offsetX  = elemRect.left - document.body.scrollLeft;

        var x = Math.round(e.clientX - offsetX);
        var y = Math.round(e.clientY - offsetY);

        e.preventDefault();

        /* TODO: Reimplement
        if(e.dataTransfer.files.length  > 0)
        {
            if(e.dataTransfer.files.length == 1)
            {
                var file: File = e.dataTransfer.files[0];
                this.placeLocalFile(x, y, this.scaleF, this.panX, this.panY, file);
            }
        }
        else
        {
            var url: string = e.dataTransfer.getData('text/plain');
            this.placeRemoteFile(x, y, this.scaleF, this.panX, this.panY, url);
        }
        */
    }

    palleteChange = (change: BoardPalleteChange) : void =>
    {
        let retVal: BoardPalleteViewState = components.get(this.viewState.mode).pallete.handleChange(change);
        let cursor: ElementCursor = components.get(this.viewState.mode).pallete.getCursor();

        this.cursor = cursor.cursor;
        this.cursorURL = cursor.url;
        this.cursorOffset = cursor.offset;

        let newView = Object.assign({}, this.viewState,
        {
            palleteState: retVal, cursor: this.cursor, cursorURL: this.cursorURL, cursorOffset: this.cursorOffset
        });

        this.updateView(newView);

        if(this.currSelect.length == 1)
        {
            let elem = this.getBoardElement(this.currSelect[0]);

            if(elem.type == this.viewState.mode)
            {
                elem.handlePalleteChange(change);
            }
        }
    }

    windowResize = (e: DocumentEvent) : void =>
    {
        let whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let whitCont = document.getElementById("whiteboard-container");

        whitElem.style.width = whitCont.clientWidth + "px";
        whitElem.style.height = whitCont.clientHeight + "px";
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;

        this.setViewBox(this.panX, this.panY, this.scaleF);
    }

    windowUnload = (e: DocumentEvent) : void =>
    {
        this.socket.emit('LEAVE', null);
    }

    mouseWheel = (e: WheelEvent) : void =>
    {
        let whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;
        let newPanX = this.panX;
        let newPanY = this.panY;
        let newScale;
        let move = true;
        let prevScale = this.scaleNum;

        this.scaleNum = this.scaleNum - e.deltaY / 2;

        if(this.scaleNum < -5)
        {
            if(prevScale == -5)
            {
                move = false;
            }

            this.scaleNum = -5;
        }
        if(this.scaleNum > 5)
        {
            if(prevScale == 5)
            {
                move = false;
            }

            this.scaleNum = 5;
        }

        let prevPoint =

        newScale = Math.pow(0.8, this.scaleNum);

        let vBoxW = whitElem.clientWidth * newScale;
        let vBoxH = whitElem.clientHeight * newScale;

        if(move)
        {
            if(e.deltaY < 0)
            {
                // Zoom in behaviour.
                newPanX = this.panX + (this.scaleF - newScale) * (e.clientX - offsetX);
                newPanY = this.panY + (this.scaleF - newScale) * (e.clientY - offsetY);
            }
            else
            {
                // Zoom out behaviour.
                /* TODO: Fix. */
                newPanX = this.panX - (this.scaleF - newScale) * (e.clientX - offsetX);
                newPanY = this.panY - (this.scaleF - newScale) * (e.clientY - offsetY);
            }

            if(newPanX < 0)
            {
                newPanX = 0;
            }
            if(newPanY < 0)
            {
                newPanY = 0;
            }
        }

        this.setViewBox(newPanX, newPanY, newScale);
    }



    clearAlert = () : void =>
    {
        this.removeAlert();
    }
}
