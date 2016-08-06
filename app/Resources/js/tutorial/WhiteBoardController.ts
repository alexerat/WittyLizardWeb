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


/***************************************************************************************************************************************************************
 *
 *
 *
 * IINTERFACE DECLARATIONS
 *
 *
 *
 **************************************************************************************************************************************************************/
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
    elementMouseOver: (id: number, e: MouseEvent) => void;
    elementMouseOut: (id: number, e: MouseEvent) => void;
    curveMouseDown: (id: number, e: MouseEvent) => void;
    curveMouseClick: (id: number) => void;
    curveMouseMove: (id: number) => void;
    textMouseClick: (id: number) => void;
    textMouseDblClick: (id: number) => void;
    textMouseMove: (id: number) => void;
    textMouseMoveDown: (id: number, e: MouseEvent) => void;
    textMouseResizeDown: (id: number, vert: boolean, horz: boolean, e: MouseEvent) => void;
    fileMouseClick: (id: number) => void;
    fileMouseMove: (id: number) => void;
    fileMouseMoveDown: (id: number, e: MouseEvent) => void;
    fileMouseResizeDown: (id: number, vert: boolean, horz: boolean, e: MouseEvent) => void;
    fileRotateClick: (id: number) => void;
    highlightTagClick: (id: number) => void;
    clearAlert: (id: number) => void;
    colourChange: (newColour: string) => void;
    modeChange: (newMode: number) => void;
    sizeChange: (newSize: number) => void;
    boldChange: (newState: boolean) => void;
    italicChange: (newState: boolean) => void;
    underlineChange:  (newState: boolean) => void;
    overlineChange:  (newState: boolean) => void;
    throughlineChange:  (newState: boolean) => void;
    justifiedChange: (newState: boolean) => void;
    mouseDown: (e: MouseEvent) => void;
    mouseWheel: (e: MouseEvent) => void;
    mouseMove: (e: MouseEvent) => void;
    mouseUp: (e: MouseEvent) => void;
    contextCopy: (e: MouseEvent) => void;
    contextCut: (e: MouseEvent) => void;
    contextPaste: (e: MouseEvent) => void;
    onCopy: (e: ClipboardEvent) => void;
    onPaste: (e: ClipboardEvent) => void;
    onCut: (e: ClipboardEvent) => void;
    dragOver: (e: DragEvent) => void;
    drop: (e: DragEvent) => void;
}

/***************************************************************************************************************************************************************
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
    view;
    viewState: WhiteBoardViewState;

    isHost: boolean = false;
    userId: number  = 0;
    socket: Socket  = null;

    lMousePress: boolean = false;
    wMousePress: boolean = false;
    rMousePress: boolean = false;
    touchPress:  boolean = false;
    moving:      boolean = false;
    mouseX:      number;
    mouseY:      number;

    scaleF:   number = 1;
    panX:     number = 0;
    panY:     number = 0;
    scaleNum: number = 0;

    pointList:    Array<Point> = [];
    isPoint:      boolean      = true;
    prevX:        number       = 0;
    prevY:        number       = 0;
    curveChangeX: number       = 0;
    curveChangeY: number       = 0;
    downPoint:    Point;

    currTextEdit:   number  = -1;
    currTextSel:    number  = -1;
    currTextMove:   number  = -1;
    currTextResize: number  = -1;
    currCurveMove:  number  = -1;
    currFileMove:   number  = -1;
    currFileResize: number  = -1;
    vertResize:     boolean = false;
    horzResize:     boolean = false;
    cursorStart:    number  = 0;
    cursorEnd:      number  = 0;
    startLeft:      boolean = false;
    textDown:       number  = 0;
    textIdealX:     number  = 0;
    gettingLock:    number  = -1;
    curveMoved:     boolean = false;
    textMoved:      boolean = false;
    fileMoved:      boolean = false;
    textResized:    boolean = false;
    fileResized:    boolean = false;
    isWriting:      boolean = false;
    editTimer:      number;
    userHighlight:  number  = -1;
    currentHover:   number  = -1;
    currSelect:     Array<number> = [];

    fileUploads: Array<File>       = [];
    fileReaders: Array<FileReader> = [];

    textDict:    Array<number>       = [];
    curveDict:   Array<number>       = [];
    uploadDict:  Array<number>       = [];
    hilightDict: Array<number>       = [];
    boardElems:  Array<BoardElement> = [];
    infoElems:   Array<InfoMessage>  = [];

    curveOutBuffer: Array<CurveOutBufferElement> = [];
    curveInBuffer:  Array<CurveInBufferElement>  = [];
    curveInTimeouts                              = [];
    curveOutTimeouts                             = [];
    textOutBuffer:  Array<TextOutBufferElement>  = [];
    textInBuffer:   Array<TextInBufferElement>   = [];

    constructor(isHost: boolean, userId: number)
    {
        this.isHost = isHost;
        this.userId = userId;

        var dispatcher: WhiteBoardDispatcher = {
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
            boardElements: Immutable.OrderedMap<number, DisplayElement>(),
            infoElements:  Immutable.List<InfoElement>(),
            alertElements: Immutable.List<AlertElement>(),
            dispatcher: dispatcher
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

    newAlert = (type: string, message: string) : void =>
    {
        let newMsg : AlertElement = { type: type, message: message };
        let newElemList = this.viewState.alertElements.push(newMsg);

        this.updateView(Object.assign({}, this.viewState, { alertElements: newElemList}));
    }

    removeAlert = () : void =>
    {
        let newElemList = this.viewState.alertElements.shift();

        this.updateView(Object.assign({}, this.viewState, { alertElements: newElemList}));
    }

    deleteElement = (id: number) : void =>
    {
        let element = this.getBoardElement(id);
        element.isDeleted = true;

        let newElemList = this.viewState.boardElements.filter(elem => elem.id !== id);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    restoreElement = (id: number) : void =>
    {
        let element = this.getBoardElement(id);
        element.isDeleted = false;

        if(element.type === 'text')
        {
            // TODO
        }
        else if(element.type === 'curve')
        {
            // TODO
        }
    }

    addCurve = (curveSet: Array<Point>, userId: number, colour: string, size: number, updateTime: Date, serverId?: number) : number =>
    {
        let newCurve: Curve =
        {
            type: 'curve', id: -1, user: userId, isDeleted: false, colour: colour, size: size, curveSet: curveSet, serverId: serverId, opBuffer: [],
            x: curveSet[0].x, y: curveSet[0].y, hoverTimer: null, infoElement: null, updateTime: updateTime
        };

        let localId = this.boardElems.length;
        this.boardElems[localId] = newCurve;
        newCurve.id = localId;

        if(serverId)
        {
            this.curveDict[serverId] = localId;
        }

        let newCurveView : CurveElement;

        if(curveSet.length > 1)
        {
            var pathText = this.createCurveText(curveSet);
            newCurveView = {
                type: 'path', id: localId, size: newCurve.size, colour: newCurve.colour, param: pathText, updateTime: updateTime, selected: false
            };
        }
        else
        {
            newCurveView = {
                type: 'circle', id: localId, size: newCurve.size, colour: newCurve.colour, point: curveSet[0], updateTime: updateTime, selected: false
            };
        }

        let newElemList = this.viewState.boardElements.set(newCurveView.id, newCurveView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

        return localId;
    }

    moveCurve = (id: number, changeX: number, changeY: number, updateTime: Date) : void =>
    {
        let curve = this.getCurve(id);

        curve.x += changeX;
        curve.y += changeY;

        for(var i = 0; i < curve.curveSet.length; i++)
        {
            curve.curveSet[i].x += changeX;
            curve.curveSet[i].y += changeY;
        }

        let newCurveView : CurveElement;

        if(curve.curveSet.length > 1)
        {
            let pathText = this.createCurveText(curve.curveSet);

            newCurveView = Object.assign({}, this.getViewElement(id), { param: pathText, updateTime: updateTime });
        }
        else
        {
            newCurveView = Object.assign({}, this.getViewElement(id), { point: curve.curveSet, updateTime: updateTime });
        }

        let newElemList = this.viewState.boardElements.set(id, newCurveView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    addTextbox = (x: number, y: number, width: number, height: number, size: number, justified: boolean, userId: number, editLock: number, updateTime: Date, serverId?: number) : number =>
    {
        let localId: number;
        let remLock: boolean;

        if(serverId)
        {
            localId = this.textDict[serverId];
        }

        let newText : WhiteBoardText;

        if(localId == null || localId == undefined)
        {
            newText =
            {
                text: '', user: userId, isDeleted: false, x: x, y: y, size: size, styles: [], editCount: 0, type: 'text', cursor: null, cursorElems: [],
                width: width, height: height, editLock: editLock, justified: justified, textNodes: [], dist: [0], serverId: serverId, id: 0, waiting: false,
                opBuffer: [], hoverTimer: null, infoElement: null, updateTime: updateTime
            };

            localId = this.boardElems.length;
            this.boardElems[localId] = newText;
            newText.id = localId;
        }
        else
        {
            // TODO: This is a conflict?
            newText = this.getText(localId);
        }

        if(editLock == this.userId)
        {
            remLock = false;
            if(this.currTextEdit == -1)
            {
                this.currTextEdit = localId;
                this.currTextSel = localId;

                this.cursorStart = newText.text.length;
                this.cursorEnd = newText.text.length;
                this.gettingLock = -1;
                this.isWriting = true;

                this.changeTextSelect(localId, true);
                this.setMode(1);
            }
            else if(this.currTextEdit != localId)
            {
                this.releaseText(localId);
            }
        }
        else if(editLock != 0)
        {
            remLock = true;
        }

        let newView : TextElement = {
            x: newText.x, y: newText.y, width: newText.width, height: newText.height, isEditing: false, remLock: remLock, getLock: false, textNodes: [],
            cursor: null, cursorElems: [], id: localId, type: 'text', size: newText.size, waiting: false, updateTime: updateTime, selected: false
        };

        let newElemList = this.viewState.boardElements.set(localId, newView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

        return localId;
    }

    stopLockText = (id: number) : void =>
    {
        this.gettingLock = -1;
        this.currTextEdit = -1;
        this.currTextSel = -1;
        this.isWriting = false;

        let tbox = this.getText(id);
        tbox.editLock = 0;
        tbox.cursor = null;
        tbox.cursorElems = [];

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: false, isEditing: false, cursor: null, cursorElems: []});
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setTextGetLock = (id: number) : void =>
    {
        this.gettingLock = id;

        let tbox = this.getText(id);

        tbox.editLock = this.userId;
        this.cursorStart = tbox.text.length;
        this.cursorEnd = tbox.text.length;
        this.isWriting = true;

        this.changeTextSelect(id, true);

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: true});
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    changeTextSelect = (id: number, setIdeal: boolean) : void =>
    {
        let tbox = this.getText(id);

        if(setIdeal)
        {
            if(this.startLeft)
            {
                this.textIdealX = this.findXPos(tbox, this.cursorEnd);
            }
            else
            {
                this.textIdealX = this.findXPos(tbox, this.cursorStart);
            }
        }

        this.findCursorElems(tbox, this.cursorStart, this.cursorEnd);

        if(tbox.styles.length > 0)
        {
            let i = 0;

            while(i < tbox.styles.length && tbox.styles[i].start > this.cursorStart || tbox.styles[i].end < this.cursorStart)
            {
                i++;
            }

            let isBold = tbox.styles[i].weight == 'bold';
            let isItalic = tbox.styles[i].style == 'italic';
            let isOLine = tbox.styles[i].decoration == 'overline';
            let isULine = tbox.styles[i].decoration == 'underline';
            let isTLine = tbox.styles[i].decoration == 'line-through';

            this.updateView(Object.assign({}, this.viewState, { colour: tbox.styles[i].colour, isBold: isBold, isItalic: isItalic, isOLine: isOLine, isULine: isULine, isTLine: isTLine }));
        }

        let newTextViewCurr : TextElement = Object.assign({}, this.getViewElement(id), {cursor: tbox.cursor, cursorElems: tbox.cursorElems});

        let newElemList = this.viewState.boardElements.set(id, newTextViewCurr);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setTextEdit = (id: number) : void =>
    {
        this.currTextEdit = id;
        this.currTextSel  = id;

        let tbox = this.getText(id);

        tbox.editLock = this.userId;
        this.cursorStart = tbox.text.length;
        this.cursorEnd = tbox.text.length;
        this.gettingLock = -1;
        this.isWriting = true;

        this.changeTextSelect(id, true);

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {getLock: false, isEditing: true});
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        this.updateView(Object.assign({}, this.viewState, {mode: 1, boardElements: newElemList}));
    }

    setTextLock = (id: number, userId: number) : void =>
    {
        let tbox = this.getText(id);
        tbox.editLock = userId;

        if(userId != this.userId)
        {
            let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {remLock: true});
            let newElemList = this.viewState.boardElements.set(id, newTextView);
            this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
        }
    }

    setTextUnLock = (id: number) : void =>
    {
        let tbox = this.getText(id);
        tbox.editLock = 0;

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), { remLock: false });
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setTextJustified = (id: number, state: boolean) : void =>
    {
        let textBox = this.getText(id);

        textBox.justified = state;
        textBox.textNodes = this.calculateTextLines(textBox);

        if(this.currTextSel == id)
        {
            if(this.startLeft)
            {
                this.textIdealX = this.findXPos(textBox, this.cursorEnd);
            }
            else
            {
                this.textIdealX = this.findXPos(textBox, this.cursorStart);
            }

            this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        }

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: textBox.textNodes, cursor: textBox.cursor, cursorElems: textBox.cursorElems
        });
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList }));

        this.sendTextJustified(id);
    }

    setTextArea = (id: number, width: number, height: number) : void =>
    {
        let textBox = this.getText(id);

        textBox.height = height;

        if(textBox.width != width)
        {
            textBox.width = width;
            textBox.textNodes = this.calculateTextLines(textBox);
        }

        if(this.currTextSel == id)
        {
            this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        }

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: textBox.textNodes, width: textBox.width, height: textBox.height, cursor: textBox.cursor, cursorElems: textBox.cursorElems
        });
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    moveTextbox = (id: number, isRelative: boolean, x: number, y: number, updateTime: Date) : void =>
    {
        let textBox = this.getText(id);
        let changeX;
        let changeY;

        if(isRelative)
        {
            changeX = x;
            changeY = y;
        }
        else
        {
            changeX = x - textBox.x;
            changeY = y - textBox.y;
        }

        textBox.x += changeX;
        textBox.y += changeY

        for(let i = 0; i < textBox.textNodes.length; i++)
        {
            var node = textBox.textNodes[i];
            node.x += changeX;
            node.y += changeY;
        }

        if(this.currTextSel == id)
        {
            this.findCursorElems(textBox, this.cursorStart, this.cursorEnd);
        }

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            textNodes: textBox.textNodes, x: textBox.x, y: textBox.y, cursor: textBox.cursor, cursorElems: textBox.cursorElems, updateTime: updateTime
        });
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    startTextWait = (id: number) : void =>
    {
        let textItem: WhiteBoardText = this.getText(id);

        textItem.waiting = true;

        let newTextView : TextElement = Object.assign({}, this.getViewElement(id), {
            waiting: true
        });
        let newElemList = this.viewState.boardElements.set(id, newTextView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    updateText = (newText: WhiteBoardText) : void =>
    {
        newText.textNodes = this.calculateTextLines(newText);

        if(this.currTextSel == newText.id)
        {
            this.findCursorElems(newText, this.cursorStart, this.cursorEnd);
        }

        newText.waiting = false;

        var newTextView : TextElement = Object.assign({}, this.getViewElement(newText.id), {
            textNodes: newText.textNodes, width: newText.width, height: newText.height, cursor: newText.cursor, cursorElems: newText.cursorElems, waiting: false
        });
        var newElemList = this.viewState.boardElements.set(newText.id, newTextView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setMode = (newMode: number) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { mode: newMode}));
    }

    setSize = (newSize: number) : void =>
    {
        let baseSize = this.viewState.baseSize;

        if(newSize == 0)
        {
            baseSize = 0.5;
        }
        else if(newSize == 1)
        {
            baseSize = 1.0;
        }
        else if(newSize == 2)
        {
            baseSize = 2.0;
        }
        else
        {
            throw 'ERROR: Not a valid base size.';
        }

        this.updateView(Object.assign({}, this.viewState, { sizeMode: newSize, baseSize: baseSize }));
    }

    setColour = (newColour: string) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { colour: newColour}));
    }

    setIsItalic = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isItalic: newState}));
    }

    setIsOline = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isOLine: newState}));
    }

    setIsUline = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isULine: newState}));
    }

    setIsTline = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isTLine: newState}));
    }

    setIsBold = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isBold: newState}));
    }

    setJustified = (newState: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { isJustified: newState}));
    }

    addHighlight = (x: number, y: number, width: number, height: number, userId: number, colour: number) : number =>
    {
        let d = new Date();
        d.setDate(d.getDate() + 50);

        let newHighlight: Highlight =
        {
            type: 'highlight', id: -1, user: userId, isDeleted: false, serverId: -1, x: x, y: y, width: width, height: height, colour: colour,
            opBuffer: [], hoverTimer: null, infoElement: null, updateTime: d
        };

        let localId = this.boardElems.length;
        this.boardElems[localId] = newHighlight;
        newHighlight.id = localId;

        let newHighlightView : HighlightElement =
        {
            id: localId, x: x, y: y, width: width, height: height, type: 'highlight', colour: colour, updateTime: d, selected: false
        };

        let newElemList = this.viewState.boardElements.set(localId, newHighlightView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

        return localId;
    }

    addFile = (x: number, y: number, width: number, height: number, userId: number, isImage: boolean, fDesc: string, fType: string, extension: string, rotation: number, url: string = '', updateTime: Date, serverId?: number) : number =>
    {
        let newUpload: Upload =
        {
            type: 'file', id: -1, user: userId, isDeleted: false, serverId: serverId, x: x, y: y, width: width, height: height, isImage: isImage, fType: fType,
            rotation: rotation, opBuffer: [], hoverTimer: null, infoElement: null, updateTime: updateTime
        };

        let localId = this.boardElems.length;
        this.boardElems[localId] = newUpload;
        newUpload.id = localId;

        let isLoading = url == '' ? true : false;
        let isUploader = userId == this.userId || userId == 0 ? true : false;

        let newUploadView : UploadElement =
        {
            id: localId, x: x, y: y, width: width, height: height, isImage: isImage, extension: extension, rotation: rotation,
            URL: url, isLoading: isLoading, isUploader: isUploader, percentUp: 0, type: 'file', updateTime: updateTime, selected: false
        };

        let newElemList = this.viewState.boardElements.set(localId, newUploadView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));

        return localId;
    }

    updateProgress = (id: number, percent: number) : void =>
    {
        var newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
            percentUp: percent
        });

        var newElemList = this.viewState.boardElements.set(id, newFileView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setUploadComplete = (id: number, fileURL: string) : void =>
    {
        let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
            percentUp: 100, isLoading: false, URL: fileURL
        });

        let newElemList = this.viewState.boardElements.set(id, newFileView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    moveUpload = (id: number, isRelative: boolean, x: number, y: number, updateTime: Date) : void =>
    {
        let file = this.getUpload(id);
        let changeX;
        let changeY;


        if(isRelative)
        {
            changeX = x;
            changeY = y;
        }
        else
        {
            changeX = x - file.x;
            changeY = y - file.y;
        }

        file.x += changeX;
        file.y += changeY

        let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
            x: file.x, y: file.y, updateTime: updateTime
        });

        let newElemList = this.viewState.boardElements.set(id, newFileView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    rotateUpload = (id: number) : void =>
    {
        let file = this.getUpload(id);

        file.rotation += 90;

        if(file.rotation >= 360)
        {
            file.rotation = 0;
        }

        let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
            rotation: file.rotation
        });

        let newElemList = this.viewState.boardElements.set(id, newFileView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setUploadArea = (id: number, width: number, height: number, updateTime: Date) : void =>
    {
        let file = this.getUpload(id);

        file.height = height;
        file.width = width;

        let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
            width: file.width, height: file.height, updateTime: updateTime
        });

        let newElemList = this.viewState.boardElements.set(id, newFileView);
        newElemList = newElemList.sort(this.compareUpdateTime) as Immutable.OrderedMap<number, DisplayElement>;
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    setUploadRotation = (id: number, rotation: number) : void =>
    {
        let file = this.getUpload(id);

        file.rotation = rotation;

        let newFileView : UploadElement = Object.assign({}, this.getViewElement(id), {
            rotation: file.rotation
        });

        let newElemList = this.viewState.boardElements.set(id, newFileView);
        this.updateView(Object.assign({}, this.viewState, { boardElements: newElemList}));
    }

    startMove = () : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { itemMoving: true}));
    }

    endMove = () : void =>
    {
        this.currTextMove = -1;
        this.currCurveMove = -1;
        this.currFileMove = -1;
        this.updateView(Object.assign({}, this.viewState, { itemMoving: false }));
    }

    startResize = (horz: boolean, vert: boolean) : void =>
    {
        this.updateView(Object.assign({}, this.viewState, { itemResizing: true, resizeHorz: horz, resizeVert: vert }));
    }

    endResize = () : void =>
    {
        this.currFileResize = -1;
        this.currTextResize = -1;
        this.updateView(Object.assign({}, this.viewState, { itemResizing: false }));
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
        this.updateView(Object.assign({}, this.viewState, { viewBox: newVBox, viewX: panX, viewY: panY, viewWidth: vBoxW, viewHeight: vBoxH, viewScale: scaleF }));
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
    getStyle = () : string =>
    {
        return this.viewState.isItalic ? 'italic' : 'normal';
    }

    getWeight = () : string =>
    {
        return this.viewState.isBold ? 'bold' : 'normal';
    }

    getDecoration = () : string =>
    {
        if(this.viewState.isOLine)
        {
            return 'overline'
        }
        else if(this.viewState.isTLine)
        {
            return 'line-through'
        }
        else if(this.viewState.isULine)
        {
            return 'underline'
        }
        else
        {
            return 'none'
        }
    }

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

    getCurve = (id: number) : Curve =>
    {
        if(this.getBoardElement(id).type == 'curve')
        {
            return this.getBoardElement(id) as Curve;
        }
        else
        {
            console.log('Type was: ' + this.getBoardElement(id).type);
            throw 'Element is not of curve type';
        }
    }

    getText = (id: number) : WhiteBoardText =>
    {
        if(this.getBoardElement(id).type == 'text')
        {
            return this.getBoardElement(id) as WhiteBoardText;
        }
        else
        {
            console.log('Type was: ' + this.getBoardElement(id).type);
            throw 'Element is not of text type';
        }
    }

    getHighlight = (id: number) : Highlight =>
    {
        if(this.getBoardElement(id).type == 'highlight')
        {
            return this.getBoardElement(id) as Highlight;
        }
        else
        {
            console.log('Type was: ' + this.getBoardElement(id).type);
            throw 'Element is not of highlight type';
        }
    }

    getUpload = (id: number) : Upload =>
    {
        if(this.getBoardElement(id).type == 'file')
        {
            return this.getBoardElement(id) as Upload;
        }
        else
        {
            console.log('Type was: ' + this.getBoardElement(id).type);
            throw 'Element is not of upload type';
        }
    }

    getViewElement = (id: number) : DisplayElement =>
    {
        return this.viewState.boardElements.get(id);
    }

    getInfoMessage = (id: number) : InfoMessage =>
    {
        return this.infoElems[id];
    }

    addHoverInfo = (id: number) : void =>
    {
        // TODO: Only display over whiteboard, and adjust width and height
        let elem = this.getBoardElement(id);
        let infoId = this.addInfoMessage(this.mouseX, this.mouseY, 200, 200, 'Test Message', 'User ID: ' + elem.user);

        elem.infoElement = infoId;
    }

    removeHoverInfo = (id: number) : void =>
    {
        let elem = this.getBoardElement(id);
        elem.infoElement = null;
        this.removeInfoMessage(elem.infoElement);
    }

    newEdit = (textBox: WhiteBoardText) : WhiteBoardText =>
    {
        textBox.editCount++;

        if(textBox.editCount > 5)
        {
            // Notify of changes and clear that pesky timeout
            textBox.editCount = 0;
            clearTimeout(this.editTimer);
            this.textEdited(textBox);
        }
        else
        {
            // Set timeout
            var self = this;
            clearTimeout(this.editTimer);
            this.editTimer = setTimeout(function(tBox)
            {
                tBox.editCount = 0;
                self.textEdited(tBox);
                clearTimeout(this.editTimer);

            }, 6000, textBox);
        }

        return textBox;
    }

    drawCurve = (points: Array<Point>, size: number, colour: string, scaleF: number, panX: number, panY: number) : void =>
    {
        var reducedPoints : Array<Point>;
        var curves : Array<Point>;

        if(points.length > 1)
        {
            reducedPoints = SmoothCurve(points);
            reducedPoints = DeCluster(reducedPoints, 10);

            for(var i = 0; i < reducedPoints.length; i++)
            {
                reducedPoints[i].x = reducedPoints[i].x * scaleF + panX;
                reducedPoints[i].y = reducedPoints[i].y * scaleF + panY;
            }

            curves = FitCurve(reducedPoints, reducedPoints.length, 5);
        }
        else
        {
            curves = [];
            curves[0] = { x: points[0].x * scaleF + panX, y: points[0].y * scaleF + panY };
        }

        var localId = this.addCurve(curves, this.userId, colour, size, new Date());
        this.sendCurve(localId, curves, colour, size);
    }

    sendCurve = (localId: number, curves: Array<Point>, colour: string, size: number) : void =>
    {
        var self = this;

        this.curveOutBuffer[localId] = {serverId: 0, localId: localId, colour: colour, curveSet: curves, size: size};

        this.curveOutTimeouts[localId] = setInterval(function()
        {
            let msg: UserNewCurveMessage = { localId: localId, colour: colour, num_points: curves.length, size: size, x: curves[0].x, y: curves[0].y };
            self.socket.emit('CURVE', msg);
        }, 60000);

        let msg: UserNewCurveMessage = { localId: localId, colour: colour, num_points: curves.length, size: size, x: curves[0].x, y: curves[0].y };
        this.socket.emit('CURVE', msg);
    }

    sendCurveMove = (id: number) : void =>
    {
        let curve : Curve = this.getCurve(id);

        if(curve.serverId)
        {
            let msg: UserMoveElementMessage = {serverId: curve.serverId, x: curve.x, y: curve.y};
            this.socket.emit('MOVE-CURVE', msg);
        }
        else
        {
            let msg: UserMoveElementMessage = { serverId: null, x: curve.x, y: curve.y };
            let newOp : OperationBufferElement = { type: 'MOVE-CURVE', message: msg };
            curve.opBuffer.push(newOp);
        }
    }

    deleteCurve = (id: number) : void =>
    {
        let curve = this.getCurve(id);

        if(curve.serverId)
        {
            this.socket.emit('DELETE-CURVE', curve.serverId);
        }
        else
        {
            let newOp : OperationBufferElement = { type: 'DELETE-CURVE', message: null };
            curve.opBuffer.push(newOp);
        }
        this.deleteElement(id);
    }

    placeHighlight = (mouseX: number, mouseY: number, scaleF: number, panX: number, panY: number, rectWidth: number, rectHeight: number) : void =>
    {
        let x = scaleF * mouseX + panX;
        let y = scaleF * mouseY + panY;
        let width = rectWidth * scaleF;
        let height = rectHeight * scaleF;

        let localId = this.addHighlight(x, y, width, height, this.userId, 0xffff00);

        this.userHighlight = localId;

        this.sendHighlight(x, y, width, height);
    }

    sendHighlight = (posX: number, posY: number, width: number, height: number) : void =>
    {
        let hMsg: UserHighLightMessage = { x: posX, y: posY, width: width, height: height} ;
        this.socket.emit('HIGHLIGHT', hMsg);
    }

    clearHighlight = () : void =>
    {
        if(this.userHighlight != -1)
        {
            this.deleteElement(this.userHighlight);
            this.userHighlight = -1;

            this.socket.emit('CLEAR-HIGHLIGHT', null);
        }
    }

    placeLocalFile = (mouseX: number, mouseY: number, scaleF: number, panX: number, panY: number, file: File) : void =>
    {
        let x = scaleF * mouseX + panX;
        let y = scaleF * mouseY + panY;
        let width = 200 * scaleF;
        let height = 200 * scaleF;
        let isImage = false;
        let fType = file.name.split('.').pop();

        let mType = file.type;
        let size = file.size;

        console.log('File type is: ' + file.type);

        if(mType.match(/octet-stream/))
        {
            this.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
        }
        else
        {
            isImage = mType.split('/')[0] == 'image' ? true : false;

            if(!isImage)
            {
                width = 150 * scaleF;
            }

            if(size < 10485760)
            {
                let localId = this.addFile(x, y, width, height, this.userId, isImage, file.name, file.type, fType, 0, undefined, new Date());

                this.sendLocalFile(x, y, width, height, file, localId);
            }
            else
            {
                this.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
            }
        }
    }

    sendLocalFile = (posX: number, posY: number, width: number, height: number, file: File, localId: number) : void =>
    {
        let newReader = new FileReader();

        let self = this;
        newReader.onload = function(e)
        {
            let serverId: number = self.getBoardElement(localId).serverId;
            let newDataMsg: UserUploadDataMessage = { serverId: serverId, piece: e.target.result };
            self.socket.emit('FILE-DATA', newDataMsg);
        };

        this.fileUploads[localId] = file;
        this.fileReaders[localId] = newReader;

        let fExtension = file.name.split('.').pop();

        let fileMsg: UserStartUploadMessage = { localId: localId, x: posX, y: posY, width: width, height: height, fileSize: file.size, fileName: file.name, fileType: file.type, extension: fExtension };
        this.socket.emit('FILE-START', fileMsg);
    }

    sendFileData = (serverId: number, place: number, percent: number, attempt: number = 0) : void =>
    {

        let localId = this.uploadDict[serverId];
        if(localId == null || localId == undefined)
        {
            if(attempt < 5)
            {
                setTimeout(this.sendFileData.bind(this), 1000, serverId, place, percent, ++attempt);
            }
            else
            {
                this.socket.emit('STOP-FILE', serverId);
            }
        }
        else
        {
            this.updateProgress(localId, percent);
            let file = this.fileUploads[localId];
            let reader = this.fileReaders[localId];
            let nplace = place * 65536;
            let newFile = file.slice(nplace, nplace + Math.min(65536, (file.size - nplace)));

            console.log('Sending File piece: ' + (place + 1) + ' out of ' + (Math.floor(file.size / 65536) + 1));
            reader.readAsArrayBuffer(newFile);
        }
    }

    placeRemoteFile = (mouseX: number, mouseY: number, scaleF: number, panX: number, panY: number, url: string) : void =>
    {
        console.log('Remote File Placed');
        let x = scaleF * mouseX + panX;
        let y = scaleF * mouseY + panY;
        let width = 200 * scaleF;
        let height = 200 * scaleF;

        let loc = document.createElement("a");
        loc.href = url;

        let path = loc.pathname;
        let fType = path.split('.').pop();
        let fDesc = '';

        let isImage = false;
        let self = this;

        var request = new XMLHttpRequest();
        request.onreadystatechange = function ()
        {
            if (request.readyState === 4)
            {
                let type = request.getResponseHeader('Content-Type');
                let size = parseInt(request.getResponseHeader('Content-Length'));

                if(size > 10485760)
                {
                    self.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
                }
                else
                {
                    if(type.match(/octete-stream/))
                    {
                        self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
                    }
                    else
                    {
                        if(type.match(/image/))
                        {
                            isImage = true;
                        }

                        let localId = self.addFile(x, y, width, height, self.userId, isImage, fDesc, fType, fType, 0, undefined, new Date());
                        self.sendRemoteFile(x, y, width, height, url, localId);
                    }
                }
            }
        };

        request.open('HEAD', url, true);
        request.send(null);
    }

    sendRemoteFile = (posX: number, posY: number, width: number, height: number, url: string, localId: number) : void =>
    {
        console.log('Sending Remote File.');
        let msg: UserRemoteFileMessage = { localId: localId, fileURL: url, x: posX, y: posY, width: width, height: height, fileDesc: '' };
        this.socket.emit('REMOTE-FILE', msg);
    }

    resizeFile = (id: number, width: number, height: number) : void =>
    {
        let file = this.getUpload(id);

        this.setUploadArea(id, width, height, new Date());
    }

    sendFileMove = (id: number) : void =>
    {
        let file = this.getUpload(this.currFileMove);

        if(file.serverId)
        {
            let msg: UserMoveElementMessage = { serverId: file.serverId, x: file.x, y: file.y };
            this.socket.emit('MOVE-FILE', msg);
        }
        else
        {
            let msg: UserMoveElementMessage = { serverId: null, x: file.x, y: file.y };
            let newOp : OperationBufferElement = { type: 'MOVE-FILE', message: msg };
            file.opBuffer.push(newOp);
        }
    }

    sendFileResize = (id: number) : void =>
    {
        let file = this.getUpload(this.currFileResize);

        if(file.serverId)
        {
            let msg: UserResizeFileMessage = {serverId: file.serverId, width: file.width, height: file.height};
            this.socket.emit('RESIZE-FILE', msg);
        }
        else
        {
            let msg: UserResizeFileMessage = { serverId: null, width: file.width, height: file.height };
            let newOp : OperationBufferElement = { type: 'RESIZE-FILE', message: msg };
            file.opBuffer.push(newOp);
        }
    }

    sendFileRotate = (id: number) : void =>
    {
        let file : Upload = this.getUpload(id);

        if(file.serverId)
        {
            let msg : UserRotateFileMessage = { serverId: file.serverId, rotation: file.rotation };
            this.socket.emit('ROTATE-FILE', msg);
        }
        else
        {
            let msg: UserRotateFileMessage = { serverId: null, rotation: file.rotation };
            let newOp : OperationBufferElement = { type: 'ROTATE-FILE', message: msg };
            file.opBuffer.push(newOp);
        }
    }

    deleteFile = (id: number) : void =>
    {
        let fileBox = this.getUpload(id);

        if(fileBox.serverId)
        {
            this.socket.emit('DELETE-FILE', fileBox.serverId);
        }
        else
        {
            let newOp : OperationBufferElement = { type: 'DELETE-FILE', message: null };
            fileBox.opBuffer.push(newOp);
        }
        this.deleteElement(id);
    }

    releaseText = (id: number) : void =>
    {
        let textBox = this.getText(id);

        this.stopLockText(id);
        if(textBox.serverId)
        {
            let msg : UserReleaseTextMessage = { serverId: textBox.serverId };
            this.socket.emit('RELEASE-TEXT', msg);
        }
        else
        {
            let msg: UserReleaseTextMessage = { serverId: null };
            let newOp : OperationBufferElement = { type: 'RELEASE-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    sendTextJustified = (id: number) : void =>
    {
        let textBox = this.getText(id);

        if(textBox.serverId)
        {
            let msg: UserJustifyTextMessage = { serverId: textBox.serverId, newState: !this.viewState.isJustified };
            this.socket.emit('JUSTIFY-TEXT', msg);
        }
        else
        {
            let msg: UserJustifyTextMessage = { serverId: null, newState: !this.viewState.isJustified };
            let newOp : OperationBufferElement = { type: 'JUSTIFY-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    textEdited = (textbox: WhiteBoardText) : void =>
    {
        var buffer : TextOutBufferElement;
        var editNum: number;

        // This is a new textbox.
        if(this.textOutBuffer[textbox.id])
        {
            buffer = this.textOutBuffer[textbox.id];
            editNum = buffer.editCount;
            buffer.editCount++;
        }
        else
        {
            buffer = {
                id: textbox.id, x: textbox.x, y: textbox.y, size: textbox.size, width: textbox.width, lastSent: 0,
                height: textbox.height, editCount: 1, editBuffer: [], justified: textbox.justified, styles: []
            };
            buffer.styles = textbox.styles.slice();
            editNum = 0;
        }


        buffer.editBuffer[editNum] = {num_nodes: textbox.styles.length, nodes: []};

        for(var i = 0; i < textbox.styles.length; i++)
        {
            buffer.editBuffer[editNum].nodes.push(
            {   num: i, text: textbox.styles[i].text, colour: textbox.styles[i].colour,
                weight: textbox.styles[i].weight, decoration:  textbox.styles[i].decoration, style: textbox.styles[i].style,
                start: textbox.styles[i].start, end: textbox.styles[i].end, editId: editNum
            });
        }

        this.textOutBuffer[textbox.id] = buffer;
        if(textbox.serverId)
        {
            let msg: UserEditTextMessage = {serverId: textbox.serverId, localId: editNum, bufferId: textbox.id, num_nodes: textbox.styles.length};
            this.socket.emit('EDIT-TEXT', msg);
        }
        else
        {
            // TODO: Not Sure about this!!!!
            let msg: UserNewTextMessage = {
                localId: textbox.id, x: this.textOutBuffer[textbox.id].x, y: this.textOutBuffer[textbox.id].y, size: this.textOutBuffer[textbox.id].size,
                width: this.textOutBuffer[textbox.id].width, height: this.textOutBuffer[textbox.id].height, justified: this.textOutBuffer[textbox.id].justified
            };
            this.socket.emit('TEXTBOX', msg);
        }
    }

    resizeText = (id: number, width: number, height: number) : void =>
    {
        let textBox = this.getText(id);

        this.setTextArea(id, width, height);
    }

    sendTextMove = (id: number) : void =>
    {
        let tbox = this.getText(this.currTextMove);

        if(tbox.serverId)
        {
            let msg: UserMoveElementMessage = { serverId: tbox.serverId, x: tbox.x, y: tbox.y };
            this.socket.emit('MOVE-TEXT', msg);
        }
        else
        {
            let msg: UserMoveElementMessage = { serverId: null, x: tbox.x, y: tbox.y };
            let newOp : OperationBufferElement = { type: 'MOVE-TEXT', message: msg };
            tbox.opBuffer.push(newOp);
        }
    }

    sendTextResize = (id: number) : void =>
    {
        let textBox = this.getText(id);

        if(textBox.serverId)
        {
            let msg: UserResizeTextMessage = { serverId: textBox.serverId, width: textBox.width, height: textBox.height };
            this.socket.emit('RESIZE-TEXT', msg);
        }
        else
        {
            let msg: UserResizeTextMessage = { serverId: null, width: textBox.width, height: textBox.height };
            let newOp : OperationBufferElement = { type: 'RESIZE-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    deleteText = (id: number) : void =>
    {
        let textBox : WhiteBoardText = this.getText(id);

        if(textBox.serverId)
        {
            this.socket.emit('DELETE-TEXT', textBox.serverId);
        }
        else
        {
            let newOp : OperationBufferElement = { type: 'DELETE-TEXT', message: null };
            textBox.opBuffer.push(newOp);
        }
        this.deleteElement(id);
    }

    lockText = (id: number) : void =>
    {
        let textBox : WhiteBoardText = this.getText(id);

        this.setTextGetLock(id);

        if(textBox.serverId)
        {
            let msg: UserLockTextMessage = { serverId:  textBox.serverId };
            this.socket.emit('LOCK-TEXT', msg);
        }
        else
        {
            let msg: UserLockTextMessage = { serverId: null };
            let newOp : OperationBufferElement = { type: 'LOCK-TEXT', message: msg };
            textBox.opBuffer.push(newOp);
        }
    }

    isCurrentStyle = (style : Style) : boolean =>
    {
        if(style.colour == this.viewState.colour && style.decoration == this.getDecoration() && style.weight == this.getWeight() && style.style == this.getStyle())
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    findXPos = (textbox: WhiteBoardText, loc: number) : number =>
    {
        if(textbox.textNodes.length == 0)
        {
            return 0;
        }

        var i = 1;
        while(i < textbox.textNodes.length && textbox.textNodes[i].start <= loc)
        {
            i++
        }

        var line = textbox.textNodes[i - 1];

        if(line.styles.length == 0)
        {
            return 0;
        }

        i = 1;
        while(i < line.styles.length && line.styles[i].locStart + line.start <= loc)
        {
            i++
        }

        var style = line.styles[i - 1];

        if(line.start + style.locStart == loc)
        {
            return style.startPos;
        }
        else
        {
            var currMes = textbox.dist[loc] - textbox.dist[line.start + style.locStart];

            return currMes + style.startPos;
        }
    }

    findTextPos = (textbox: WhiteBoardText, x: number, y: number) : number =>
    {
        var whitElem  = document.getElementById("whiteBoard-output");
        var elemRect = whitElem.getBoundingClientRect();
        var xFind = 0;

        if(y < textbox.y)
        {
            return 0;
        }
        else
        {
            var lineNum = Math.floor(((y - textbox.y) / (1.5 * textbox.size)) + 0.15);

            if(lineNum >= textbox.textNodes.length)
            {
                return textbox.text.length;
            }

            if(!textbox.textNodes[lineNum])
            {
                console.log('Line is: ' + lineNum);
            }

            if(x > textbox.x)
            {
                if(x > textbox.x + textbox.width)
                {
                    return textbox.textNodes[lineNum].end;
                }
                else
                {
                    xFind = x - textbox.x;
                }
            }
            else
            {
                return textbox.textNodes[lineNum].start;
            }

            var line = textbox.textNodes[lineNum];

            if(line.styles.length == 0)
            {
                return line.start;
            }


            var i = 0;
            while(i < line.styles.length && xFind > line.styles[i].startPos)
            {
                i++;
            }

            var curr = i - 1;
            var style = line.styles[i - 1];


            i = style.text.length - 1;

            var currMes = textbox.dist[line.start + style.locStart + style.text.length - 1] - textbox.dist[line.start + style.locStart];

            while(i > 0 && style.startPos + currMes > xFind)
            {
                i--;
                currMes = textbox.dist[line.start + style.locStart + i] - textbox.dist[line.start + style.locStart];
            }

            // i and currMes is now the position to the right of the search point.
            // We just need to check if left or right is closer then reurn said point.
            var selPoint;

            if(i < style.text.length - 1)
            {
                if(xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind)
                {
                    selPoint = line.start + style.locStart + i + 1;
                }
                else
                {
                    selPoint = line.start + style.locStart + i;
                }
            }
            else if(curr + 1 < line.styles.length)
            {

                if(xFind - (style.startPos + currMes) > line.styles[curr + 1].startPos - xFind)
                {
                    selPoint = line.start + line.styles[curr + 1].locStart;
                }
                else
                {
                    selPoint = line.start + style.locStart + i;
                }
            }
            else
            {
                if(xFind - (style.startPos + currMes) > (style.startPos + textbox.dist[line.start + style.locStart + i + 1] - textbox.dist[line.start + style.locStart]) - xFind)
                {
                    selPoint = line.start + style.locStart + i + 1;
                }
                else
                {
                    selPoint = line.start + style.locStart + i;
                }
            }

            return selPoint;
        }
    }

    findCursorElems = (textbox: WhiteBoardText, cursorStart: number, cursorEnd: number) : void =>
    {
        textbox.cursorElems = [];

        if(textbox.textNodes.length == 0)
        {
            textbox.cursor = { x: textbox.x, y: textbox.y, height: 1.5 * textbox.size };
        }

        for(var i = 0; i < textbox.textNodes.length; i++)
        {
            var line: TextNode = textbox.textNodes[i];
            var selStart: number = null;
            var selEnd: number = null;
            var startFound: boolean = false;
            var endFound: boolean = false;

            if(cursorStart >= line.start && cursorStart <= line.end)
            {
                if(cursorStart == line.end && !line.endCursor)
                {
                    selStart = textbox.width;
                }
                else
                {
                    for(var j = 0; j < line.styles.length && !startFound; j++)
                    {
                        var style: StyleNode = line.styles[j];

                        selStart = 0;
                        selStart += style.dx;

                        if(cursorStart <= line.start + style.locStart + style.text.length)
                        {
                            startFound = true;
                            selStart += style.startPos + textbox.dist[cursorStart] - textbox.dist[line.start + style.locStart];
                        }
                    }
                }
            }
            else if(cursorStart < line.start && cursorEnd > line.start)
            {
                selStart = 0;
            }

            if(cursorEnd > line.start && cursorEnd <= line.end)
            {
                if(cursorEnd == line.end && !line.endCursor)
                {
                    selEnd = textbox.width;
                }
                else
                {
                    for(var j = 0; j < line.styles.length && !endFound; j++)
                    {
                        var style: StyleNode = line.styles[j];

                        selEnd = 0;
                        selEnd += style.dx;

                        if(cursorEnd <= line.start + style.locStart + style.text.length)
                        {
                            endFound = true;
                            selEnd += style.startPos + textbox.dist[cursorEnd] - textbox.dist[line.start + style.locStart];
                        }
                    }
                }
            }
            else if(cursorEnd >= line.end  && cursorStart <= line.end)
            {
                selEnd = textbox.width;
            }

            if(cursorEnd >= line.start && cursorEnd <= line.end && (this.startLeft || cursorStart == cursorEnd) && line.start != line.end)
            {
                if(cursorEnd != line.end || line.endCursor)
                {
                    textbox.cursor = { x: textbox.x + selEnd, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                }
            }
            else if(cursorStart >= line.start && cursorStart <= line.end && (!this.startLeft || cursorStart == cursorEnd))
            {
                if(cursorStart != line.end || line.endCursor)
                {
                    textbox.cursor = { x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, height: 1.5 * textbox.size };
                }
            }

            if(selStart != null && selEnd != null && cursorStart != cursorEnd)
            {
                textbox.cursorElems.push({ x: textbox.x + selStart, y: textbox.y + 1.5 * textbox.size * line.lineNum, width: selEnd - selStart, height: 1.5 * textbox.size });
            }
        }
    }

    calculateLengths = (textbox: WhiteBoardText, start: number, end: number, prevEnd: number) : void =>
    {
        var whitElem  = document.getElementById("whiteBoard-output");
        var tMount: SVGTextElement;
        var startPoint: number;
        var styleNode: SVGTSpanElement;
        var change: number = 0;
        var style: number = 0;
        var oldDist: Array<number> = textbox.dist.slice();

        while(style - 1 < textbox.styles.length && textbox.styles[style].end <= start - 2)
        {
            style++;
        }

        if(start > 1)
        {
            // Calculate the start point taking into account the kerning.
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

            if(textbox.styles[style].end <= start - 1)
            {
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

            // Calculate the start dist from start point with it's combined length of the previous character
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

            if(textbox.styles[style].end <= start)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
            tMount.appendChild(styleNode);

            textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
        }
        else if(start > 0)
        {
            startPoint = 0;
            if(textbox.styles[style].end <= start - 1)
            {
                style++;
            }

            // Calculate the start dist from start point with it's combined length of the previous character
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

            if(textbox.styles[style].end <= start)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(start)));
            tMount.appendChild(styleNode);

            textbox.dist[start + 1] = startPoint + tMount.getComputedTextLength();
        }
        else
        {
            startPoint = 0;
            style = 0;

            // Just use the very first character, no extra calculation required.
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


        for(var i = start + 1; i < end; i++)
        {
            if(textbox.styles[style].end <= i)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(i)));
            tMount.appendChild(styleNode);

            textbox.dist[i + 1] = startPoint + tMount.getComputedTextLength();
        }


        if(end < textbox.text.length)
        {
            if(textbox.styles[style].end <= end)
            {
                style++;
            }

            styleNode = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            styleNode.setAttributeNS(null, "font-style", textbox.styles[style].style);
            styleNode.setAttributeNS(null, "font-weight", textbox.styles[style].weight);
            styleNode.appendChild(document.createTextNode(textbox.text.charAt(end)));
            tMount.appendChild(styleNode);

            change = startPoint + tMount.getComputedTextLength() - oldDist[prevEnd + 1];

            for(var i = end; i < textbox.text.length; i++)
            {
                textbox.dist[i + 1] = oldDist[i + 1 + prevEnd - end] + change;
            }
        }
        whitElem.removeChild(tMount);
    }

    calculateTextLines = (textbox: WhiteBoardText) : Array<TextNode> =>
    {
        var i: number;
        var childText = [];
        var currPos: number = 0;
        var prevPos: number = 0;
        var txtStart: number = 0;
        var isWhiteSpace = true;
        var dy: number = textbox.size;
        var ddy: number = 1.5 * textbox.size;
        var nodeCounter: number;
        var computedTextLength: number;
        var wordC: number;
        var spaceC: number;
        var line: string;
        var wordsT: Array<string> = [];
        var spacesT: Array<string> = [];
        var startSpace: boolean = true;
        var currY: number = textbox.y;
        var lineCount: number = 0;

        if(!textbox.text.length)
        {
            return [];
        }

        for(i = 0; i < textbox.text.length; i++)
        {
            if(isWhiteSpace)
            {
                if(!textbox.text.charAt(i).match(/\s/))
                {
                    if(i > 0)
                    {
                        spacesT.push(textbox.text.substring(txtStart, i));
                        txtStart = i;
                        isWhiteSpace = false;
                    }
                    else
                    {
                        startSpace = false;
                        isWhiteSpace = false;
                    }
                }
            }
            else
            {
                if(textbox.text.charAt(i).match(/\s/))
                {
                    wordsT.push(textbox.text.substring(txtStart, i));
                    txtStart = i;
                    isWhiteSpace = true;
                }
            }
        }

        if(isWhiteSpace)
        {
            spacesT.push(textbox.text.substring(txtStart, i));
        }
        else
        {
            wordsT.push(textbox.text.substring(txtStart, i));
        }

        wordC = 0;
        spaceC = 0;
        nodeCounter = 0;

        var nLineTrig: boolean;

        while(wordC < wordsT.length || spaceC < spacesT.length)
        {
            var lineComplete: boolean = false;
            var word: string;

            currY += dy;
            var currLength = 0;
            var tspanEl : TextNode = {
                styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                justified: textbox.justified, lineNum: lineCount, text: ''
            };
            var progPos = true;

            nLineTrig = false;

            if(startSpace)
            {
                var fLine = spacesT[spaceC].indexOf('\n');
                if(fLine != -1)
                {
                    if(spacesT[spaceC].length > 1)
                    {
                        if(fLine == 0)
                        {
                            nLineTrig = true;
                            spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                            spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                        }
                        else
                        {
                            progPos = false;
                            spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                            spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                        }
                    }
                    else
                    {
                        nLineTrig = true;
                        startSpace = !startSpace;
                    }
                }

                if(spaceC >= spacesT.length)
                {
                    console.error('ERROR: Space array out of bounds');
                    return [];
                }

                word = spacesT[spaceC];
                spaceC++;
            }
            else
            {
                if(wordC >= wordsT.length)
                {
                    console.error('ERROR: Word array out of bounds');
                    return [];
                }
                word = wordsT[wordC];
                wordC++;
            }

            if(nLineTrig)
            {
                word = '';
                lineComplete = true;
                tspanEl.justified = false;
                tspanEl.end = currPos;
                currPos++;
                prevPos = currPos;
            }

            computedTextLength = textbox.dist[currPos + word.length] - textbox.dist[currPos];

            if(computedTextLength > textbox.width)
            {
                // Find a place that splits it to fit, check for dashes
                lineComplete = true;

                fDash = word.indexOf('-');

                if(fDash != -1 && computedTextLength > textbox.width)
                {
                    // Split the string at dash, use the bit before the dash
                    var newStr = word.substring(fDash + 1, word.length);
                    // Insert the new string into the words array after current position
                    wordsT.splice(wordC, 0, newStr);
                    word = word.substring(0, fDash + 1);
                }

                // Work backwards to find the overflow split
                i = word.length;
                while(computedTextLength > textbox.width && i > 0)
                {
                    computedTextLength = textbox.dist[currPos + word.substring(0, i).length] - textbox.dist[currPos];
                    i--;
                }

                // Add to buffer
                if(computedTextLength <= textbox.width)
                {
                    // Insert the new string into the words array after current position
                    if(startSpace)
                    {
                        if(i + 2 < word.length)
                        {
                            spacesT.splice(spaceC, 0, word.substring(i + 2, word.length));
                        }
                        else
                        {
                            startSpace = !startSpace;
                        }
                        word = word.substring(0, i + 1);
                        currPos += word.length;
                        tspanEl.end = currPos;
                        prevPos = currPos + 1;
                    }
                    else
                    {
                        wordsT.splice(wordC, 0, word.substring(i + 1, word.length));
                        word = word.substring(0, i + 1);
                        currPos += word.length;
                        tspanEl.end = currPos;
                        tspanEl.endCursor = false;
                        prevPos = currPos;
                    }
                }
                else
                {
                    console.error('TEXTBOX TOO SMALL FOR FIRST LETTERS.');
                }
            }
            else
            {
                currPos += word.length;

                if(!nLineTrig && progPos)
                {
                    startSpace = !startSpace;
                }
            }

            line = word;
            currLength = computedTextLength;

            while(!lineComplete && (wordC < wordsT.length || spaceC < spacesT.length))
            {
                // Loop to finish line
                if(startSpace)
                {
                    var fLine = spacesT[spaceC].indexOf('\n');
                    if(fLine != -1)
                    {
                        if(spacesT[spaceC].length > 1)
                        {
                            if(fLine == 0)
                            {
                                nLineTrig = true;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(1, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, 1);
                            }
                            else
                            {
                                progPos = false;
                                spacesT.splice(spaceC + 1, 0, spacesT[spaceC].substring(fLine, spacesT[spaceC].length));
                                spacesT[spaceC] = spacesT[spaceC].substring(0, fLine);
                            }
                        }
                        else
                        {
                            nLineTrig = true;
                            startSpace = !startSpace;
                        }
                    }

                    word = spacesT[spaceC];
                }
                else
                {
                    word = wordsT[wordC];
                }

                if(nLineTrig)
                {
                    word = '';
                    lineComplete = true;
                    tspanEl.justified = false;
                    tspanEl.end = currPos;
                    currPos++;
                    prevPos = currPos;
                }

                computedTextLength = currLength + textbox.dist[currPos + word.length] - textbox.dist[currPos];

                if(computedTextLength > textbox.width)
                {
                    lineComplete = true;

                    if(startSpace)
                    {
                        if(word.length > 1)
                        {
                            // Split the space add other to stack
                            i = word.length - 1;
                            while(computedTextLength > textbox.width && i > 0)
                            {
                                computedTextLength = currLength + textbox.dist[currPos + i] - textbox.dist[currPos];
                                i--;
                            }

                            if(computedTextLength <= textbox.width)
                            {
                                if(i + 2 < word.length)
                                {
                                    var newStr = word.substring(i + 2, word.length);
                                    // Insert the new string into the words array after current position
                                    spacesT.splice(spaceC, 0, newStr);

                                    line += word.substring(0, i + 1);
                                    currPos += word.substring(0, i + 1).length;
                                    tspanEl.end = currPos;
                                    currPos++;
                                    prevPos = currPos;
                                    spaceC++;
                                }
                                else
                                {
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
                            else
                            {
                                computedTextLength = currLength + textbox.dist[currPos + word.length - 1] - textbox.dist[currPos];
                                tspanEl.end = currPos;
                                prevPos = currPos + 1;
                                spacesT[spaceC] = spacesT[spaceC].substring(1, spacesT[spaceC].length);
                            }
                        }
                        else
                        {
                            computedTextLength = currLength;
                            tspanEl.end = currPos;
                            currPos++;
                            prevPos = currPos;
                            startSpace = !startSpace;
                            spaceC++;
                        }
                    }
                    else
                    {
                        // Check for dashes, if there is split check, if good add word and put other in stack
                        var fDash = word.indexOf('-');

                        if(fDash != -1)
                        {
                            computedTextLength = currLength + textbox.dist[currPos + fDash + 1] - textbox.dist[currPos];
                            //computedTextLength = currLength + this.calculateWordWidth(word.substring(0, fDash + 1), currPos, sizeCheck, textbox.styles);

                            // Check and if fits, split away
                            if(computedTextLength <= textbox.width)
                            {
                                var newStr = word.substring(fDash + 1, word.length);
                                // Insert the new string into the words array after current position
                                wordsT.splice(wordC, 0, newStr);
                                wordC++;

                                line += word.substring(0, fDash + 1);

                                currPos += word.substring(0, fDash + 1).length;
                                tspanEl.end = currPos;
                                tspanEl.endCursor = false;
                                prevPos = currPos;

                                currLength = computedTextLength;
                            }
                            else
                            {
                                computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];

                                line = line.substring(0, line.length - 1);

                                tspanEl.end = currPos;
                                currPos++;
                                prevPos = currPos;
                            }
                        }
                        else
                        {
                            computedTextLength = currLength - textbox.dist[currPos] + textbox.dist[currPos - 1];

                            line = line.substring(0, line.length - 1);
                            tspanEl.end = currPos - 1;
                            prevPos = currPos;
                        }
                    }
                }
                else
                {
                    line += word;
                    currPos += word.length;

                    if(nLineTrig)
                    {
                        spaceC++;
                    }
                    else
                    {
                        if(startSpace)
                        {
                            spaceC++;
                        }
                        else
                        {
                            wordC++;
                        }

                        if(progPos)
                        {
                            startSpace = !startSpace;
                        }
                    }
                    currLength = computedTextLength;
                }
            }

            tspanEl.end = tspanEl.start + line.length;

            // Once the line is complete / out of stuff split into styles
            tspanEl.text = line;
            dy = ddy;
            nodeCounter = 0;

            if(wordC == wordsT.length && spaceC == spacesT.length)
            {
                tspanEl.justified = false;
            }

            var reqAdjustment = textbox.width - computedTextLength;
            var numSpaces = tspanEl.text.length - tspanEl.text.replace(/\s/g, "").length;
            var extraSpace = reqAdjustment / numSpaces;
            var currStart = 0;
            var currLoc = 0;

            for(var j = 0; j < textbox.styles.length; j++)
            {
                if(textbox.styles[j].start < tspanEl.end && textbox.styles[j].end > tspanEl.start)
                {
                    var startPoint = (textbox.styles[j].start < tspanEl.start) ? 0 : (textbox.styles[j].start - tspanEl.start);
                    var endPoint = (textbox.styles[j].end > tspanEl.end) ? (tspanEl.end - tspanEl.start) : (textbox.styles[j].end - tspanEl.start);
                    var styleText = tspanEl.text.slice(startPoint, endPoint);
                    var newStyle: StyleNode;
                    word = '';

                    for(i = 0; i < styleText.length; i++)
                    {
                        if(styleText.charAt(i).match(/\s/))
                        {
                            if(word.length > 0)
                            {
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


                            if(tspanEl.justified)
                            {
                                newStyle =
                                {
                                    key: nodeCounter, text: styleText.charAt(i), colour: textbox.styles[j].colour, dx: extraSpace, locStart: currLoc,
                                    decoration: textbox.styles[j].decoration, weight: textbox.styles[j].weight, style: textbox.styles[j].style, startPos: currStart
                                };


                                currStart += extraSpace + textbox.dist[tspanEl.start + currLoc + 1] - textbox.dist[tspanEl.start + currLoc];
                            }
                            else
                            {
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
                        else
                        {
                            word += styleText.charAt(i);

                            if(i == styleText.length - 1)
                            {
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

        if(nLineTrig)
        {
            tspanEl = {
                styles: [], x: textbox.x, y: currY, dx: 0, dy: dy, start: prevPos, end: prevPos, endCursor: true,
                justified: false, lineNum: lineCount, text: ''
            };

            lineCount++;
            childText.push(tspanEl);
        }

        if(lineCount * 1.5 * textbox.size > textbox.height)
        {
            this.resizeText(textbox.id, textbox.width, lineCount * 1.5 * textbox.size);
            this.sendTextResize(textbox.id);
        }

        return childText;
    }

    findXHelper = (textItem: WhiteBoardText, isUp: boolean, relative: number) : number =>
    {
        let i: number;
        let line: TextNode;

        if(isUp)
        {
            i = 1;
            while(i < textItem.textNodes.length && relative > textItem.textNodes[i].end)
            {
                i++;
            }
            line = textItem.textNodes[i - 1];
        }
        else
        {
            i = 0;
            while(i < textItem.textNodes.length - 1 && relative > textItem.textNodes[i].end)
            {
                i++;
            }
            line = textItem.textNodes[i + 1];
        }

        i = 0;
        while(i < line.styles.length && this.textIdealX >= line.styles[i].startPos)
        {
            i++;
        }
        let curr = i - 1;
        let style: StyleNode = line.styles[i - 1];


        let currMes = textItem.dist[line.start + style.locStart + style.text.length - 1] - textItem.dist[line.start + style.locStart];
        i = style.text.length - 1;
        while(i > 0 && style.startPos + currMes > this.textIdealX)
        {
            i--;
            currMes = textItem.dist[line.start + style.locStart + i] - textItem.dist[line.start + style.locStart];
        }

        // i and currMes is now the position to the right of the search point.
        // We just need to check if left or right is closer then reurn said point.
        if(i < style.text.length - 1)
        {
            if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
            {
                return line.start + style.locStart + i + 1;
            }
            else
            {
                return line.start + style.locStart + i;
            }
        }
        else if(curr + 1 < line.styles.length)
        {

            if(this.textIdealX - (style.startPos + currMes) > line.styles[curr + 1].startPos - this.textIdealX)
            {
                return line.start + line.styles[curr + 1].locStart;
            }
            else
            {
                return line.start + style.locStart + i;
            }
        }
        else
        {
            if(this.textIdealX - (style.startPos + currMes) > (style.startPos + textItem.dist[line.start + style.locStart + i + 1] - textItem.dist[line.start + style.locStart]) - this.textIdealX)
            {
                return line.start + style.locStart + i + 1;
            }
            else
            {
                return line.start + style.locStart + i;
            }
        }
    }

    insertText = (textItem: WhiteBoardText, start: number, end: number, text: string) : void =>
    {
        let isNew = true;
        let textStart = textItem.text.slice(0, start);
        let textEnd = textItem.text.slice(end, textItem.text.length);
        let styles = [];

        let fullText = textStart + textEnd;

        this.startTextWait(this.currTextEdit);

        for(i = 0; i < textItem.styles.length; i++)
        {
            let sty = textItem.styles[i];

            if(sty.start >= start)
            {
                if(sty.start >= end)
                {
                    // Completely after selection
                    if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                        && styles[styles.length - 1].decoration == sty.decoration
                        && styles[styles.length - 1].weight == sty.weight
                        && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - sty.start <= 200)
                    {
                        // If this is the same as the previous style and are length compatible then combine
                        styles[styles.length - 1].end += sty.end - sty.start;
                        styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                    }
                    else
                    {
                        sty.start -= end - start;
                        sty.end -= end - start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                    }
                }
                else
                {
                    if(sty.end > end)
                    {
                        // End stradle
                        if(styles.length > 0 && styles[styles.length - 1].colour == sty.colour
                            && styles[styles.length - 1].decoration == sty.decoration
                            && styles[styles.length - 1].weight == sty.weight
                            && styles[styles.length - 1].end - styles[styles.length - 1].start + sty.end - end <= 200)
                        {
                            // If this is the same as the previous style and are length compatible then combine
                            styles[styles.length - 1].end += sty.end - end;
                            styles[styles.length - 1].text = fullText.slice(styles[styles.length - 1].start, styles[styles.length - 1].end);
                        }
                        else
                        {
                            sty.end +=  start - end;
                            sty.start = start;
                            sty.text = fullText.slice(sty.start, sty.end);
                            styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                        }

                    }

                    // Otherwise we don't push it as it is removed by the selection.
                }
            }
            else
            {
                if(sty.end > start)
                {
                    if(sty.end > end)
                    {
                        // Selection within style
                        sty.end -= end - start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                    }
                    else
                    {
                        // Start stradle
                        sty.end = start;
                        sty.text = fullText.slice(sty.start, sty.end);
                        styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                    }
                }
                else
                {
                    // Completely before selection
                    sty.text = fullText.slice(sty.start, sty.end);
                    styles.push({start: sty.start, end: sty.end, colour: sty.colour, decoration: sty.decoration, style: sty.style, weight: sty.weight, text: sty.text});
                }
            }
        }

        textItem.text = textStart + text + textEnd;

        for(var i = 0; text.length > 0 && i < styles.length; i++)
        {
            if(styles[i].end > start)
            {
                if(styles[i].start >= start)
                {
                    // This style is all after the selected text.
                    if(styles[i].start == start && this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200)
                    {
                        isNew = false;
                        styles[i].start = start;
                    }
                    else
                    {
                        styles[i].start += text.length;
                    }

                    styles[i].end += text.length;
                }
                else if(styles[i].end >= start)
                {
                    // The cursor selection is completely within the style.
                    if(this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200)
                    {
                        isNew = false;
                        styles[i].end += text.length;
                    }
                    else
                    {
                        // Split this style ready for the new style.
                        var newSplit =
                        {
                            start: start + text.length, end: styles[i].end + text.length, decoration: styles[i].decoration,
                            weight: styles[i].weight, style: styles[i].style, colour: styles[i].colour
                        };

                        styles[i].end = start;
                        styles.splice(i + 1, 0, newSplit);
                        i++;
                    }
                }
            }
            else if(styles[i].end == start)
            {
                if(this.isCurrentStyle(styles[i]) && isNew && (styles[i].end - styles[i].start + text.length) <= 200)
                {
                    isNew = false;
                    styles[i].end = start + text.length;
                }
            }

            styles[i].text = textItem.text.slice(styles[i].start, styles[i].end);
        }

        if(isNew && text.length > 0)
        {
            i = 0;

            while(i < styles.length && styles[i].end <= start)
            {
                i++
            }

            var newStyle =
            {
                start: start, end: start + text.length, decoration: this.getDecoration(),
                weight: this.getWeight(), style: this.getStyle(), colour: this.viewState.colour,
                text: textItem.text.slice(start, start + text.length)
            };

            styles.splice(i, 0, newStyle);
        }

        textItem.styles = styles;

        textItem = this.newEdit(textItem);

        if(text.length == 0)
        {
            if(start > 0)
            {
                this.calculateLengths(textItem, start - 1, start, end);
            }
            else if(textItem.text.length > 0)
            {
                this.calculateLengths(textItem, start, end, end + 1);
            }
        }
        else
        {
            this.calculateLengths(textItem, start, start + text.length, end);
        }

        this.updateText(textItem);
    }

    completeEdit = (textId: number, userId: number, editId: number) : void =>
    {
        var textItem: WhiteBoardText;
        var fullText = '';
        var localId = this.textDict[textId];
        var editData = this.textInBuffer[textId].editBuffer[userId][editId];

        textItem = this.getText(localId);
        textItem.styles = [];

        for(var i = 0; i < editData.nodes.length; i++)
        {
            textItem.styles[editData.nodes[i].num] = editData.nodes[i];
        }

        for(var i = 0; i < textItem.styles.length; i++)
        {
            fullText += textItem.styles[i].text;
        }

        textItem.text = fullText;

        this.startTextWait(localId);
        this.calculateLengths(textItem, 0, fullText.length, 0);
        this.updateText(textItem);
    }

    createCurveText = (curve: Array<Point>) : string =>
    {
        var param =     "M" + curve[0].x + "," + curve[0].y;
        param = param +" C" + curve[1].x + "," + curve[1].y;
        param = param + " " + curve[2].x + "," + curve[2].y;
        param = param + " " + curve[3].x + "," + curve[3].y;

        for(var i = 4; i + 2 < curve.length; i += 3)
        {
            param = param +" C" + curve[i + 0].x + "," + curve[i + 0].y;
            param = param + " " + curve[i + 1].x + "," + curve[i + 1].y;
            param = param + " " + curve[i + 2].x + "," + curve[i + 2].y;
        }

        return param;
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

    compareUpdateTime = (elem1: DisplayElement, elem2: DisplayElement) : number =>
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

        this.socket.on('CURVE', function(data: ServerNewCurveMessage)
        {
            console.log('Recieved curve ID:' + data.serverId);
            if(!self.curveDict[data.serverId] && !self.curveInBuffer[data.serverId])
            {
                // Set up the buffers to recieve data.
                self.curveInBuffer[data.serverId] = {
                    serverId: data.serverId, user: data.userId, size: data.size, num_points: data.num_points, num_recieved: 0,
                    curveSet: new Array, colour: data.colour, updateTime: data.editTime
                };

                clearInterval(self.curveInTimeouts[data.serverId]);
                self.curveInTimeouts[data.serverId] = setInterval((id) =>
                {
                    for(var j = 0; j < self.curveInBuffer[id].num_points; j++)
                    {
                        if(!self.curveInBuffer[id].curveSet[j])
                        {
                            console.log('Sending Missing message.');
                            var msg : UserMissingCurveMessage = {serverId: id, seq_num: j};
                            self.socket.emit('MISSING-CURVE', msg);
                        }
                    }
                }, 30000, data.serverId);
            }
        });
        this.socket.on('POINT', function(data: ServerNewPointMessage)
        {
            var buffer = self.curveInBuffer[data.serverId];
            // Make sure we know about this curve.
            if(buffer && buffer.num_recieved != buffer.num_points)
            {
                if(!buffer.curveSet[data.num])
                {
                    buffer.curveSet[data.num] = {x: data.x, y: data.y};
                    buffer.num_recieved++;
                }

                if(buffer.num_recieved == buffer.num_points)
                {
                    clearInterval(self.curveInTimeouts[data.serverId]);

                    self.addCurve(buffer.curveSet, buffer.user, buffer.colour, buffer.size, buffer.updateTime, data.serverId);

                    self.curveInBuffer[data.serverId] = null;
                }
            }
            else
            {
                clearInterval(self.curveInTimeouts[data.serverId]);

                // Request curve data.
                self.socket.emit('UNKNOWN-CURVE', data.serverId);
            }
        });
        this.socket.on('IGNORE-CURVE', function(curveId: number)
        {
            clearInterval(self.curveInTimeouts[curveId]);
        });
        this.socket.on('CURVEID', function(data: ServerCurveIdMessage)
        {
            self.curveOutBuffer[data.localId].serverId = data.serverId;

            clearInterval(self.curveOutTimeouts[data.localId]);

            let curveItem = self.getCurve(data.localId);

            curveItem.serverId = data.serverId;
            self.curveDict[data.serverId] = data.localId

            // Send the points for this curve.
            for(let i = 0; i < self.curveOutBuffer[data.localId].curveSet.length; i++)
            {
                let curve = self.curveOutBuffer[data.localId].curveSet[i];
                let msg : UserNewPointMessage = {serverId: data.serverId, num: i, x: curve.x, y: curve.y};
                self.socket.emit('POINT', msg);
            }
        });
        this.socket.on('CURVE-COMPLETE', function(serverId: number)
        {
            let curve: Curve = self.getCurve(self.curveDict[serverId]);

            while(curve.opBuffer.length > 0)
            {
                let op = curve.opBuffer.shift();

                if(op.message == null)
                {
                    self.socket.emit(op.type, serverId);
                }
                else
                {
                    let msg = {};

                    Object.assign(msg, op.message, { serverId: serverId });
                    self.socket.emit(op.type, msg);
                }
            }
        });
        this.socket.on('MISSED-CURVE', function(data: ServerMissedPointMessage)
        {
            // The server has not recieced this point, find it and send it.
            let curve;

            for(let i = 0; i < self.curveOutBuffer.length; i++)
            {
                if(self.curveOutBuffer[i].serverId == data.serverId)
                {
                    curve  = self.curveOutBuffer[i].curveSet[data.num];
                }
            }
            let msg : UserNewPointMessage = {serverId: data.serverId, num: data.num, x: curve.x, y: curve.y};
            self.socket.emit('POINT', msg);
        });
        this.socket.on('DROPPED-CURVE', function(serverId: number)
        {
            clearInterval(self.curveInTimeouts[serverId]);
            self.curveInBuffer[serverId] = null;
        });
        this.socket.on('MOVE-CURVE', function(data: ServerMoveElementMessage)
        {
            let localId = self.curveDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-CURVE', data.serverId);
            }
            else
            {
                let curve: Curve =  self.getCurve(localId);
                self.moveCurve(localId, data.x - curve.x, data.y - curve.y, data.editTime);
            }
        });
        this.socket.on('DELETE-CURVE', function(serverId: number)
        {
            let localId = self.curveDict[serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-CURVE', serverId);
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('TEXTBOX', function(data: ServerNewTextboxMessage)
        {
            // Set up the buffers to recieve data.
            if(!self.textInBuffer[data.serverId])
            {
                self.textInBuffer[data.serverId] = {
                    x: data.x, y: data.y, width: data.width, height: data.height, user: data.userId,
                    editLock: data.editLock, styles: [], size: data.size, justified: data.justified, editBuffer: []
                };

                let localId = self.addTextbox(data.x, data.y, data.width, data.height, data.size, data.justified, data.userId, data.editLock, data.editTime, data.serverId);
                self.textDict[data.serverId] = localId;
            }
        });
        this.socket.on('STYLENODE', function(data: ServerStyleNodeMessage)
        {
            if(!self.textInBuffer[data.serverId])
            {
                console.log('STYLENODE: Unkown text, ID: ' + data.serverId);
                console.log(data);
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                if(self.textInBuffer[data.serverId].editBuffer[data.userId])
                {
                    if(self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId])
                    {
                        let buffer = self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId];
                        buffer.nodes.push(data);
                        if(buffer.nodes.length == buffer.num_nodes)
                        {
                            self.completeEdit(data.serverId, data.userId, data.editId);
                        }
                    }
                    else
                    {
                        console.log('STYLENODE: Unkown edit, ID: ' + data.editId + ' text ID: ' + data.serverId);
                        self.socket.emit('UNKNOWN-EDIT', data.editId);
                    }
                }
                else
                {
                    // TODO:
                    console.log('WOAH BUDDY! User ID: ' + data.userId);
                }
            }
        });
        this.socket.on('TEXTID', function(data: ServerTextIdMessage)
        {
            // TODO: Send latest edit. Just use completeEdit

            let textBox: WhiteBoardText = self.getText(data.localId);

            textBox.serverId = data.serverId;
            self.textDict[data.serverId] = data.localId;

            while(textBox.opBuffer.length > 0)
            {
                let op = textBox.opBuffer.shift();

                if(op.message == null)
                {
                    self.socket.emit(op.type, data.serverId);
                }
                else
                {
                    let msg = {};

                    Object.assign(msg, op.message, { serverId: data.serverId });
                    self.socket.emit(op.type, msg);
                }
            }
        });
        this.socket.on('LOCK-TEXT', function(data: ServerLockTextMessage)
        {
            let localId = self.textDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                self.setTextLock(localId, data.userId);
            }
        });
        this.socket.on('LOCKID-TEXT', function(data: ServerLockIdMessage)
        {
            let localId = self.textDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                if(self.gettingLock != -1 && self.getText(self.gettingLock).serverId == data.serverId)
                {
                    self.setTextEdit(localId);
                }
                else
                {
                    let msg: UserReleaseTextMessage = {serverId: data.serverId};
                    self.socket.emit('RELEASE-TEXT', msg);
                }
            }
        });
        this.socket.on('EDITID-TEXT', function(data: ServerEditIdMessage)
        {
            let buffer = self.textOutBuffer;

            if(data.localId > buffer[data.bufferId].lastSent || !buffer[data.bufferId].lastSent)
            {
                buffer[data.bufferId].lastSent = data.localId;
                for(let i = 0; i < buffer[data.bufferId].editBuffer[data.localId].nodes.length; i++)
                {
                    buffer[data.bufferId].editBuffer[data.localId].nodes[i].editId = data.editId;
                    let node = buffer[data.bufferId].editBuffer[data.localId].nodes[i];

                    let msg: UserStyleNodeMessage = {
                        editId: node.editId, num: node.num, start: node.start, end: node.end, text: node.text, weight: node.weight, style: node.style,
                        decoration: node.decoration, colour: node.colour
                    };
                    self.socket.emit('STYLENODE', msg);
                }
            }

        });
        this.socket.on('FAILED-TEXT', function(data)
        {
            // TODO:
        });
        this.socket.on('REFUSED-TEXT', function(data)
        {
            // TODO:
        });
        this.socket.on('RELEASE-TEXT', function(data: ServerReleaseTextMessage)
        {
            let localId = self.textDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                self.setTextUnLock(localId);
            }
        });
        this.socket.on('EDIT-TEXT', function(data: ServerEditTextMessage)
        {
            if(!self.textInBuffer[data.serverId])
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                if(!self.textInBuffer[data.serverId].editBuffer[data.userId])
                {
                    self.textInBuffer[data.serverId].editBuffer[data.userId] = [];
                }

                self.textInBuffer[data.serverId].editBuffer[data.userId][data.editId] = {num_nodes: data.num_nodes, nodes: []};
            }

        });
        this.socket.on('MOVE-TEXT', function(data: ServerMoveElementMessage)
        {
            let localId = self.textDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                self.moveTextbox(localId, false, data.x, data.y, data.editTime);
            }
        });
        this.socket.on('JUSTIFY-TEXT', function(data: ServerJustifyTextMessage)
        {
            let localId = self.textDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                self.setTextJustified(data.serverId, data.newState);
            }
        });
        this.socket.on('RESIZE-TEXT', function(data: ServerResizeTextMessage)
        {
            let localId = self.textDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', data.serverId);
            }
            else
            {
                self.setTextArea(localId, data.width, data.height);
            }
        });
        this.socket.on('DELETE-TEXT', function(serverId: number)
        {
            let localId = self.textDict[serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-TEXT', serverId);
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('IGNORE-TEXT', function(serverId: number)
        {
            //clearInterval(self.textInTimeouts[serverId]);
        });
        this.socket.on('DROPPED-TEXT', function(data)
        {
            // TODO: We need to stop trying to get it.
        });
        this.socket.on('MISSED-TEXT', function(data: ServerMissedTextMessage)
        {
            // TODO:
        });
        this.socket.on('HIGHLIGHT', function(data: ServerHighLightMessage)
        {
            if(self.hilightDict[data.userId])
            {
                self.deleteElement(self.hilightDict[data.userId]);
                self.hilightDict[data.userId] = null;
            }

            let localId = self.addHighlight(data.x, data.y, data.width, data.height, data.userId, data.colour);
            self.hilightDict[data.userId] = localId;
        });
        this.socket.on('CLEAR-HIGHLIGHT', function(userId: number)
        {
            if(self.hilightDict[userId])
            {
                self.deleteElement(self.hilightDict[userId]);
                self.hilightDict[userId] = null;
            }
        });
        this.socket.on('FILE-START', function(data: ServerNewUploadMessage)
        {
            console.log('Recieved File Start.');
            console.log('File type is: ' + data.fileType);

            let isImage = data.fileType.split('/')[0] == 'image' ? true : false;

            let localId;

            if(data.url)
            {
                console.log('Adding completed file.');
                localId = self.addFile(data.x, data.y, data.width, data.height, data.userId, isImage, data.fileDesc, data.fileType, data.extension, data.rotation, data.url, data.editTime, data.serverId);
            }
            else
            {
                localId = self.addFile(data.x, data.y, data.width, data.height, data.userId, isImage, data.fileDesc, data.fileType, data.extension, data.rotation, undefined, data.editTime, data.serverId);
            }

            console.log('Logging file in dictionary, ServerID: ' + data.serverId + ' LocalID: ' + localId);
            self.uploadDict[data.serverId] = localId;
        });
        this.socket.on('FILEID', function(data: ServerUploadIdMessage)
        {
            console.log('FILEID Received.');
            let file: Upload = self.getUpload(data.localId);

            self.uploadDict[data.serverId] = data.localId;
            file.serverId = data.serverId;

            while(file.opBuffer.length > 0)
            {
                let op = file.opBuffer.shift();

                if(op.message == null)
                {
                    self.socket.emit(op.type, data.serverId);
                }
                else
                {
                    let msg = {};

                    Object.assign(msg, op.message, { serverId: data.serverId });
                    self.socket.emit(op.type, msg);
                }
            }
        });
        this.socket.on('FILE-DATA', function(data: ServerUploadDataMessage)
        {
            console.log('Received Request for more file data.');
            self.sendFileData(data.serverId, data.place, data.percent);
        });
        this.socket.on('FILE-DONE', function(data: ServerUploadEndMessage)
        {
            console.log('Received File Done.');
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.setUploadComplete(localId, data.fileURL);
            }
        });
        this.socket.on('MOVE-FILE', function(data: ServerMoveElementMessage)
        {
            console.log('Recieved move file. ServerID: ' + data.serverId);
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.moveUpload(localId, false, data.x, data.y, data.editTime);
            }

        });
        this.socket.on('RESIZE-FILE', function(data: ServerResizeFileMessage)
        {
            console.log('Recieved resize file.');
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.setUploadArea(localId, data.width, data.height, data.editTime);
            }
        });
        this.socket.on('ROTATE-FILE', function(data: ServerRotateFileMessage)
        {
            console.log('Recieved rotate file.');
            let localId = self.uploadDict[data.serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', data.serverId);
            }
            else
            {
                self.setUploadRotation(localId, data.rotation);
            }
        });
        this.socket.on('DELETE-FILE', function(serverId: number)
        {
            var localId = self.uploadDict[serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', serverId);
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('ABANDON-FILE', function(serverId: number)
        {
            var localId = self.uploadDict[serverId];

            if(localId == null || localId == undefined)
            {
                self.socket.emit('UNKNOWN-FILE', serverId);
            }
            else
            {
                self.deleteElement(localId);
            }
        });
        this.socket.on('FILE-OVERSIZE', function(localId: number)
        {
            self.deleteElement(localId);
            self.newAlert('FILE TOO LARGE', 'The file type you attempted to add is too large.');
        });
        this.socket.on('FILE-BADTYPE', function(localId: number)
        {
            self.deleteElement(localId);
            self.newAlert('BAD FILETYPE', 'The file type you attempted to add is not allowed.');
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
    modeChange = (newMode: number) : void =>
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var context  = whitElem.getContext('2d');
        context.clearRect(0, 0, whitElem.width, whitElem.height);
        this.isWriting = false;

        this.clearHighlight();

        if(this.currTextEdit > -1)
        {
            var textBox = this.getText(this.currTextEdit);
            var lineCount = textBox.textNodes.length;

            if(lineCount == 0)
            {
                lineCount = 1;
            }

            if(lineCount * 1.5 * textBox.size < textBox.height)
            {
                this.resizeText(this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                this.sendTextResize(this.currTextEdit);
            }

            this.releaseText(this.currTextEdit);
        }
        else if(this.gettingLock > -1)
        {
            this.releaseText(this.gettingLock);
        }

        this.setMode(newMode);
    }

    sizeChange = (newSize: number) : void =>
    {
        this.setSize(newSize);
    }

    styleChange = () : void =>
    {
        if(this.currTextEdit != -1 && this.cursorStart != this.cursorEnd)
        {
            let textItem: WhiteBoardText = this.getText(this.currTextEdit);

            let text = textItem.text.substring(this.cursorStart, this.cursorEnd);

            this.insertText(textItem, this.cursorStart, this.cursorEnd, text);
        }
    }

    colourChange = (newColour: string) : void =>
    {
        this.setColour(newColour);
        this.styleChange();
    }

    boldChange = (newState: boolean) : void =>
    {
        this.setIsBold(newState);
        this.styleChange();
    }

    italicChange = (newState: boolean) : void =>
    {
        this.setIsItalic(newState);
        this.styleChange();
    }

    underlineChange = (newState: boolean) : void =>
    {
        if(newState)
        {
            this.setIsOline(false);
            this.setIsTline(false);
        }

        this.setIsUline(newState);
        this.styleChange();
    }

    overlineChange = (newState: boolean) : void =>
    {
        if(newState)
        {
            this.setIsUline(false);
            this.setIsTline(false);
        }

        this.setIsOline(newState);
        this.styleChange();
    }

    throughlineChange = (newState: boolean) : void =>
    {
        if(newState)
        {
            this.setIsOline(false);
            this.setIsUline(false);
        }

        this.setIsTline(newState);
        this.styleChange();
    }

    justifiedChange = (newState: boolean) : void =>
    {
        this.setJustified(newState);

        if(this.currTextEdit != -1)
        {
            this.setTextJustified(this.currTextEdit, !this.viewState.isJustified);
        }
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
            clearTimeout(elem.hoverTimer);
        }
    }

    elementMouseOut = (id: number, e: MouseEvent) : void =>
    {
        let elem = this.getBoardElement(id);

        if(this.currentHover == id)
        {
            clearTimeout(elem.hoverTimer);
            this.currentHover = -1;
        }
    }

    curveMouseClick = (id: number) : void =>
    {
        if(this.viewState.mode == 2)
        {
            var curve = this.getCurve(id);

            if(this.isHost || this.userId == curve.user)
            {
                this.deleteCurve(id);
            }
        }
    }

    curveMouseMove = (id: number) : void =>
    {
        if(this.viewState.mode == 2 && this.lMousePress)
        {
            var curve = this.getCurve(id);

            if(this.isHost || this.userId == curve.user)
            {
                this.deleteCurve(id);
            }
        }
    }

    curveMouseDown = (id: number, e: MouseEvent) : void =>
    {
        if(this.viewState.mode == 3)
        {
            this.currCurveMove = id;
            this.startMove();

            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    textMouseClick = (id: number) : void =>
    {
        if(this.viewState.mode == 2)
        {
            var textBox = this.getText(id);

            if(this.isHost || this.userId == textBox.user)
            {
                this.deleteText(id);
            }
        }
    }

    textMouseDblClick = (id: number) : void =>
    {
        let textBox = this.getText(id);

        if(this.gettingLock != -1 && this.gettingLock != id)
        {
            this.releaseText(this.gettingLock);
        }

        if(this.currTextEdit != -1)
        {
            if(this.currTextEdit != id)
            {
                this.releaseText(this.currTextEdit);
                var tbox = this.getText(this.currTextEdit);
                var lineCount = tbox.textNodes.length;

                if(lineCount == 0)
                {
                    lineCount = 1;
                }

                if(lineCount * 1.5 * tbox.size < tbox.height)
                {
                    this.resizeText(this.currTextEdit, tbox.width, lineCount * 1.5 * tbox.size);
                    this.sendTextResize(this.currTextEdit);
                }
            }
        }
        else
        {
            if(this.isHost || this.userId == textBox.user)
            {
                this.lockText(id);
            }
        }
    }

    textMouseMoveDown = (id: number, e: MouseEvent) : void =>
    {
        this.currTextMove = id;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.startMove();
    }

    textMouseResizeDown = (id: number, vert: boolean, horz: boolean, e: MouseEvent) : void =>
    {
        this.currTextResize = id;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.vertResize = vert;
        this.horzResize = horz;
        this.startResize(horz, vert);
    }

    textMouseMove = (id: number) : void =>
    {
        if(this.viewState.mode == 2 && this.lMousePress)
        {
            var textBox = this.getText(id);

            if(this.isHost || this.userId == textBox.user)
            {
                this.deleteText(id);
            }
        }
    }

    fileMouseClick = (id: number) : void =>
    {
        if(this.viewState.mode == 2)
        {
            let fileBox = this.getUpload(id);

            if(this.isHost || this.userId == fileBox.user)
            {
                this.deleteFile(id);
            }
        }
    }

    clearAlert = () : void =>
    {
        this.removeAlert();
    }

    highlightTagClick = (id: number) : void =>
    {
        console.log('Highligh tag click processed.');
        let whitElem  = document.getElementById('whiteBoard-input') as HTMLCanvasElement;
        let whitCont  = document.getElementById('whiteboard-container');
        let clientWidth = whitCont.clientWidth;
        let clientHeight = whitCont.clientHeight;

        let highlight = this.getHighlight(id);

        let xCentre = highlight.x + highlight.width / 2;
        let yCentre = highlight.y + highlight.height / 2;

        let xChange = xCentre - (this.panX + clientWidth * this.scaleF * 0.5);
        let yChange = yCentre - (this.panY + clientHeight * this.scaleF * 0.5);

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

    fileMouseMoveDown = (id: number, e: MouseEvent) : void =>
    {
        this.currFileMove = id;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.startMove();
    }

    fileMouseResizeDown = (id: number, vert: boolean, horz: boolean, e: MouseEvent) : void =>
    {
        this.currFileResize = id;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        this.vertResize = vert;
        this.horzResize = horz;
        this.startResize(horz, vert);
    }

    fileRotateClick = (id: number) : void =>
    {
        let file : Upload = this.getUpload(id);

        if(this.isHost || this.userId == file.user)
        {
            this.rotateUpload(id);
            this.sendFileRotate(id);
        }
    }

    fileMouseMove = (id: number) : void =>
    {
        if(this.viewState.mode == 2 && this.lMousePress)
        {
            let fileBox = this.getUpload(id);

            if(this.isHost || this.userId == fileBox.user)
            {
                this.deleteFile(id);
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

        if(this.isWriting && this.cursorStart != this.cursorEnd)
        {
            let textItem = this.getText(this.currTextEdit);

            e.clipboardData.setData('text/plain', textItem.text.substring(this.cursorStart, this.cursorEnd));
        }
    }

    onPaste = (e: ClipboardEvent) : void =>
    {
        console.log('PASTE EVENT');

        if(this.isWriting)
        {
            let textItem = this.getText(this.currTextEdit);
            let data = e.clipboardData.getData('text/plain');

            this.insertText(textItem, this.cursorStart, this.cursorEnd, data);

            this.cursorStart = this.cursorStart + data.length;
            this.cursorEnd = this.cursorStart;

            this.changeTextSelect(this.currTextEdit, true);
        }
    }

    onCut = (e: ClipboardEvent) : void =>
    {
        console.log('CUT EVENT');
    }

    dragOver = (e: DragEvent) : void =>
    {
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

    }

    /***********************************************************************************************************************************************************
     *
     *
     *
     * DOCUMENT LISTENER METHODS
     *
     *
     *
     **********************************************************************************************************************************************************/
    mouseUp = (e: MouseEvent) : void =>
    {
        if(this.lMousePress && !this.wMousePress)
        {
            if(this.viewState.mode == 0)
            {
                var whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
                var context = whitElem.getContext('2d');

                context.clearRect(0, 0, whitElem.width, whitElem.height);

                if(this.isPoint)
                {
                    var elemRect = whitElem.getBoundingClientRect();
                    var offsetY  = elemRect.top - document.body.scrollTop;
                    var offsetX  = elemRect.left - document.body.scrollLeft;
                }

                this.drawCurve(this.pointList, this.scaleF * this.viewState.baseSize, this.viewState.colour, this.scaleF, this.panX, this.panY);
            }
            else if(this.viewState.mode == 1)
            {
                if(!this.isWriting)
                {
                    let rectLeft;
                    let rectTop;
                    let rectWidth;
                    let rectHeight;
                    let whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
                    let context  = whitElem.getContext('2d');
                    let elemRect = whitElem.getBoundingClientRect();
                    let offsetY  = elemRect.top - document.body.scrollTop;
                    let offsetX  = elemRect.left - document.body.scrollLeft;
                    let newPoint: Point = {x: 0, y: 0};

                    context.clearRect(0, 0, whitElem.width, whitElem.height);

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

                    if(rectWidth > 10 && rectHeight > 10)
                    {
                        let x = rectLeft * this.scaleF + this.panX;
                        let y = rectTop * this.scaleF + this.panY;
                        let width = rectWidth * this.scaleF;
                        let height = rectHeight * this.scaleF;

                        this.isWriting = true;
                        this.cursorStart = 0;
                        this.cursorEnd = 0;

                        let localId = this.addTextbox(x, y, width, height, this.scaleF * this.viewState.baseSize * 20, this.viewState.isJustified, this.userId, this.userId, new Date());
                        this.setTextEdit(localId);
                    }
                }
                else if(this.rMousePress)
                {
                    this.isWriting = false;

                    if(this.currTextEdit > -1)
                    {
                        let textBox = this.getText(this.currTextEdit);
                        let lineCount = textBox.textNodes.length;

                        if(lineCount == 0)
                        {
                            lineCount = 1;
                        }

                        if(lineCount * 1.5 * textBox.size < textBox.height)
                        {
                            this.resizeText(this.currTextEdit, textBox.width, lineCount * 1.5 * textBox.size);
                            this.sendTextResize(this.currTextEdit);
                        }

                        this.releaseText(this.currTextEdit);
                    }
                    else if(this.gettingLock > -1)
                    {
                        this.releaseText(this.gettingLock);
                    }

                    context.clearRect(0, 0, whitElem.width, whitElem.height);
                }
            }
            else if(this.viewState.mode == 4)
            {
                let rectLeft;
                let rectTop;
                let rectWidth;
                let rectHeight;
                let whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
                let context  = whitElem.getContext('2d');
                let elemRect = whitElem.getBoundingClientRect();
                let offsetY  = elemRect.top - document.body.scrollTop;
                let offsetX  = elemRect.left - document.body.scrollLeft;
                let newPoint: Point = {x: 0, y: 0};

                context.clearRect(0, 0, whitElem.width, whitElem.height);

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

                if(rectWidth > 10 && rectHeight > 10)
                {
                    this.placeHighlight(rectLeft, rectTop, this.scaleF, this.panX, this.panY, rectWidth, rectHeight);
                }
            }
        }

        if(this.curveMoved)
        {
            this.curveMoved = false;
            this.sendCurveMove(this.currCurveMove);
        }
        else if(this.textMoved)
        {
            this.textMoved = false;
            this.sendTextMove(this.currTextMove);
        }
        else if(this.textResized)
        {
            this.textResized = false;
            this.sendTextResize(this.currTextEdit);
        }
        else if(this.fileMoved)
        {
            this.fileMoved = false;
            this.sendFileMove(this.currFileMove);
        }
        else if(this.fileResized)
        {
            this.fileResized = false;
            this.sendFileResize(this.currFileResize);
        }

        this.curveChangeX = 0;
        this.curveChangeY = 0;
        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.pointList = [];
        this.moving = false;
        this.endMove();
        this.endResize();
    }

    touchUp = () : void =>
    {
        this.touchPress = false;
    }

    mouseDown = (e: MouseEvent) : void =>
    {
        if(!this.lMousePress && !this.wMousePress && !this.rMousePress)
        {
            this.clearHighlight();

            this.lMousePress = e.buttons & 1 ? true : false;
            this.rMousePress = e.buttons & 2 ? true : false;
            this.wMousePress = e.buttons & 4 ? true : false;
            this.isPoint = true;
            var whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            var elemRect = whitElem.getBoundingClientRect();
            var offsetY  = elemRect.top - document.body.scrollTop;
            var offsetX  = elemRect.left - document.body.scrollLeft;
            whitElem.width = whitElem.clientWidth;
            whitElem.height = whitElem.clientHeight;
            this.prevX = e.clientX;
            this.prevY = e.clientY;

            var newPoint: Point = {x: 0, y: 0};
            this.pointList = [];
            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);
            this.pointList[this.pointList.length] = newPoint;

            this.downPoint = {x: Math.round(e.clientX - offsetX), y: Math.round(e.clientY - offsetY)};

            if(e.buttons == 1 && !this.viewState.itemMoving && !this.viewState.itemResizing)
            {
                if(this.currTextEdit > -1)
                {
                    var textBox = this.getText(this.currTextEdit);

                    this.cursorStart = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);
                    this.cursorEnd = this.cursorStart;
                    this.textDown = this.cursorStart;
                    this.changeTextSelect(this.currTextEdit, true);
                }
            }
        }

        this.currSelect = [];

        if(this.currentHover != -1)
        {
            let elem = this.getBoardElement(this.currentHover);

            if(elem.infoElement)
            {
                this.removeHoverInfo(this.currentHover);
            }
        }
    }

    touchDown = () : void =>
    {
        this.touchPress = true;
    }

    mouseMove = (e: MouseEvent) : void =>
    {
        if(this.currentHover != -1)
        {
            let elem = this.getBoardElement(this.currentHover);

            if(elem.infoElement)
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

            // Mode 0 is draw mode, mode 1 is text mode., mode 2 is delete, mode 3 is select and mode 4 is highlight
            if(this.viewState.mode == 0)
            {
                if(this.pointList.length)
                {
                    if(Math.round(this.pointList[this.pointList.length - 1].x - newPoint.x) < this.scaleF || Math.round(this.pointList[this.pointList.length - 1].y - newPoint.y))
                    {
                        this.isPoint = false;

                        context.beginPath();
                        context.strokeStyle = this.viewState.colour;
                        context.lineWidth = this.viewState.baseSize;
                        context.moveTo(this.pointList[this.pointList.length - 1].x, this.pointList[this.pointList.length - 1].y);
                        context.lineTo(newPoint.x, newPoint.y);
                        context.stroke();

                        this.pointList[this.pointList.length] = newPoint;
                    }
                }
                else
                {
                    this.pointList[this.pointList.length] = newPoint;
                }
            }
            else if(this.viewState.mode == 1 && !this.rMousePress)
            {
                if(this.currTextResize != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;
                    var tbox = this.getText(this.currTextResize);

                    var newWidth  = this.horzResize ? tbox.width  + changeX : tbox.width;
                    var newHeight = this.vertResize ? tbox.height + changeY : tbox.height;

                    this.resizeText(this.currTextResize, newWidth, newHeight);

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.textResized = true;
                }
                else if(this.currTextMove != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;

                    this.moveTextbox(this.currTextMove, true, changeX, changeY, new Date());
                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.textMoved = true;
                }
                else if(this.currTextSel != -1)
                {
                    var textBox = this.getText(this.currTextEdit);
                    var newLoc = this.findTextPos(textBox, (e.clientX - offsetX) * this.scaleF + this.panX, (e.clientY - offsetY) * this.scaleF + this.panY);

                    if(this.textDown < newLoc)
                    {
                        this.cursorStart = this.textDown;
                        this.cursorEnd = newLoc;
                        this.startLeft = true;
                    }
                    else
                    {
                        this.cursorStart = newLoc;
                        this.cursorEnd = this.textDown;
                        this.startLeft = false;
                    }

                    this.changeTextSelect(this.currTextSel, true);
                }
                else
                {
                    var rectLeft;
                    var rectTop;
                    var rectWidth;
                    var rectHeight;

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
                }
            }
            else if(this.viewState.mode == 2 && !this.rMousePress)
            {
                // TODO: Group selects
                
            }
            else if(this.viewState.mode == 3)
            {
                if(this.currCurveMove != -1)
                {
                    this.moveCurve(this.currCurveMove, (e.clientX - this.prevX) * this.scaleF, (e.clientY - this.prevY) * this.scaleF, new Date());

                    this.curveChangeX += (e.clientX - this.prevX) * this.scaleF;
                    this.curveChangeY += (e.clientY - this.prevY) * this.scaleF;

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;

                    this.curveMoved = true;
                }
                else if(this.currTextMove != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;

                    this.moveTextbox(this.currTextMove, true, changeX, changeY, new Date());

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.textMoved = true;
                }
                else if(this.currFileMove != -1)
                {
                    var changeX = (e.clientX - this.prevX) * this.scaleF;
                    var changeY = (e.clientY - this.prevY) * this.scaleF;

                    this.moveUpload(this.currFileMove, true, changeX, changeY, new Date());

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.fileMoved = true;
                }
                else if(this.currFileResize != -1)
                {
                    let changeX = (e.clientX - this.prevX) * this.scaleF;
                    let changeY = (e.clientY - this.prevY) * this.scaleF;
                    let file = this.getUpload(this.currFileResize);

                    let newWidth  = this.horzResize ? file.width  + changeX : file.width;
                    let newHeight = this.vertResize ? file.height + changeY : file.height;

                    this.resizeFile(this.currFileResize, newWidth, newHeight);

                    this.prevX = e.clientX;
                    this.prevY = e.clientY;
                    this.fileResized = true;
                }
            }
            else if(this.viewState.mode == 4 && !this.rMousePress)
            {
                var rectLeft;
                var rectTop;
                var rectWidth;
                var rectHeight;

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
                    context.globalAlpha = 0.4;
                    context.fillStyle = 'yellow';
                    context.fillRect(rectLeft, rectTop, rectWidth, rectHeight);
                    context.stroke();
                    context.globalAlpha = 1.0;
                }
            }
        }

        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    touchMove = (e: TouchEvent) : void =>
    {
        if(this.touchPress)
        {

        }
    }

    windowResize = (e: DocumentEvent) : void =>
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var whitCont = document.getElementById("whiteboard-container");

        whitElem.style.width = whitCont.clientWidth + "px";
        whitElem.style.height = whitCont.clientHeight + "px";
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;

        this.setViewBox(this.panX, this.panY, this.scaleF);
    }

    mouseWheel = (e: WheelEvent) : void =>
    {
        let whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var elemRect = whitElem.getBoundingClientRect();
        var offsetY  = elemRect.top - document.body.scrollTop;
        var offsetX  = elemRect.left - document.body.scrollLeft;
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

    keyDown = (e: KeyboardEvent) : void =>
    {
        if (e.keyCode === 8)
        {
            if(this.isWriting)
            {
                e.preventDefault();
                let textItem = this.getText(this.currTextEdit);

                if(this.cursorEnd > 0)
                {
                    if(e.ctrlKey)
                    {
                        if(this.cursorStart > 0)
                        {
                            // TODO: Move to start of previous word
                        }
                    }
                    else
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.cursorStart--;
                        }

                        let start = this.cursorStart;
                        let end = this.cursorEnd;
                        this.cursorEnd = this.cursorStart;

                        this.insertText(textItem, start, end, '');
                    }
                }
            }
        }
    }

    keyUp = (e: KeyboardEvent) : void =>
    {

    }

    keyPress = (e: KeyboardEvent) : void =>
    {
        if(this.isWriting)
        {
            e.preventDefault();
            e.stopPropagation();
            var inputChar = e.key;
            var textItem: WhiteBoardText;
            var i: number;
            var line: TextNode;
            var style: StyleNode;


            switch(inputChar)
            {

            case 'ArrowLeft':
                textItem = this.getText(this.currTextEdit);

                var newStart = this.cursorStart;
                var newEnd = this.cursorEnd;

                if(this.cursorStart == this.cursorEnd || !this.startLeft)
                {
                    if(this.cursorStart > 0)
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorStart > 0 ? this.cursorStart - 1 : 0;
                            while(i > 0 && !textItem.text.charAt(i - 1).match(/\s/))
                            {
                                i--;
                            }

                            newStart = i;
                        }
                        else
                        {
                            if(newStart > 0)
                            {
                                newStart--;
                            }
                        }
                    }
                }
                else
                {
                    if(e.ctrlKey)
                    {
                        i = this.cursorEnd > 0 ? this.cursorEnd - 1 : 0;
                        while(i > 0 && !textItem.text.charAt(i - 1).match(/\s/))
                        {
                            i--;
                        }

                        newEnd = i;
                    }
                    else
                    {
                        if(newEnd > 0)
                        {
                            newEnd--;
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = false;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newStart > newEnd)
                    {
                        this.startLeft = false;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    this.cursorStart = this.cursorStart == this.cursorEnd || !this.startLeft ? newStart : newEnd;
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, true);
                break;
            case 'ArrowRight':
                textItem = this.getText(this.currTextEdit);

                var newStart = this.cursorStart;
                var newEnd = this.cursorEnd;

                if(this.cursorStart == this.cursorEnd || this.startLeft)
                {
                    if(this.cursorEnd < textItem.text.length)
                    {
                        if(e.ctrlKey)
                        {
                            i = this.cursorEnd + 1;
                            while(i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/)))
                            {
                                i++;
                            }

                            newEnd = i;
                        }
                        else
                        {
                            if(newEnd < textItem.text.length)
                            {
                                newEnd++;
                            }
                        }
                    }
                }
                else
                {
                    if(e.ctrlKey)
                    {
                        i = this.cursorStart < textItem.text.length ? this.cursorStart + 1 : textItem.text.length;
                        while(i < textItem.text.length && !(textItem.text.charAt(i - 1).match(/\s/) && textItem.text.charAt(i).match(/[^\s]/)))
                        {
                            i++;
                        }

                        newStart = i;
                    }
                    else
                    {
                        if(newStart < textItem.text.length)
                        {
                            newStart++;
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = true;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newStart > newEnd)
                    {
                        this.startLeft = true;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    this.cursorStart = this.cursorStart == this.cursorEnd || this.startLeft ? newEnd : newStart;
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, true);
                break;
            case 'ArrowUp':
                textItem = this.getText(this.currTextEdit);

                var newStart: number;
                var newEnd: number;

                if(e.ctrlKey)
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        i = this.cursorEnd - 1;
                        while(i > 0 && !textItem.text.charAt(i - 1).match('\n'))
                        {
                            i--;
                        }

                        if(i < 0)
                        {
                            i = 0;
                        }

                        newStart = this.cursorStart;
                        newEnd = i;
                    }
                    else
                    {
                        i = this.cursorStart - 1;
                        while(i > 0 && !textItem.text.charAt(i - 1).match('\n'))
                        {
                            i--;
                        }

                        if(i < 0)
                        {
                            i = 0;
                        }

                        newStart = i;
                        newEnd = this.cursorEnd;
                    }
                }
                else
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        newStart = this.cursorStart;
                        // If the cursor is on the first line do nothng
                        if(this.cursorEnd <= textItem.textNodes[0].end)
                        {
                            newEnd = this.cursorEnd;
                        }
                        else
                        {
                            newEnd = this.findXHelper(textItem, true, this.cursorEnd);
                        }
                    }
                    else
                    {
                        newEnd = this.cursorEnd;

                        if(this.cursorStart <= textItem.textNodes[0].end)
                        {
                            newStart = this.cursorStart;
                        }
                        else
                        {
                            newStart = this.findXHelper(textItem, true, this.cursorStart);
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = false;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newEnd < newStart)
                    {
                        this.startLeft = false;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    if(this.startLeft && this.cursorStart != this.cursorEnd)
                    {
                        this.cursorStart = newEnd;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                    }
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, false);
                break;
            case 'ArrowDown':
                textItem = this.getText(this.currTextEdit);

                var newStart: number;
                var newEnd: number;

                if(e.ctrlKey)
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        i = this.cursorEnd + 1;
                        while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                        {
                            i++;
                        }

                        newStart = this.cursorStart;
                        newEnd = i;
                    }
                    else
                    {
                        i = this.cursorStart + 1;
                        while(i < textItem.text.length && !textItem.text.charAt(i).match('\n'))
                        {
                            i++;
                        }

                        newStart = i;
                        newEnd = this.cursorEnd;
                    }
                }
                else
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        newStart = this.cursorStart;
                        // If the cursor is on the last line do nothng
                        if(this.cursorEnd >= textItem.textNodes[textItem.textNodes.length - 1].start)
                        {
                            newEnd = this.cursorEnd;
                        }
                        else
                        {
                            newEnd = this.findXHelper(textItem, false, this.cursorEnd);
                        }
                    }
                    else
                    {
                        newEnd = this.cursorEnd;

                        if(this.cursorStart >= textItem.textNodes[textItem.textNodes.length - 1].start)
                        {
                            newStart = this.cursorStart;
                        }
                        else
                        {
                            newStart = this.findXHelper(textItem, false, this.cursorStart);
                        }
                    }
                }

                if(e.shiftKey)
                {
                    if(this.cursorStart == this.cursorEnd)
                    {
                        this.startLeft = true;
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                    else if(newEnd < newStart)
                    {
                        this.startLeft = true;
                        this.cursorStart = newEnd;
                        this.cursorEnd = newStart;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                        this.cursorEnd = newEnd;
                    }
                }
                else
                {
                    if(this.startLeft || this.cursorStart == this.cursorEnd)
                    {
                        this.cursorStart = newEnd;
                    }
                    else
                    {
                        this.cursorStart = newStart;
                    }
                    this.cursorEnd = this.cursorStart;
                }

                this.changeTextSelect(this.currTextEdit, false);
                break;
            case 'Backspace':
                textItem = this.getText(this.currTextEdit);

                if(this.cursorEnd > 0)
                {
                    if(e.ctrlKey)
                    {
                        if(this.cursorStart > 0)
                        {
                            // TODO: Move to start of previous word
                        }
                    }
                    else
                    {
                        if(this.cursorStart == this.cursorEnd)
                        {
                            this.cursorStart--;
                        }

                        let start = this.cursorStart;
                        let end = this.cursorEnd;
                        this.cursorEnd = this.cursorStart;

                        this.insertText(textItem, start, end, '');
                    }
                }
                break;
            case 'Enter':
                inputChar = '\n';
            default:
                textItem = this.getText(this.currTextEdit);

                if(e.ctrlKey)
                {
                    // TODO: Ctrl combos
                    if(inputChar == 'a' || inputChar == 'A')
                    {

                    }
                    else if(inputChar == 'j')
                    {

                    }
                    else if(inputChar == 'b')
                    {

                    }
                    else if(inputChar == 'i')
                    {

                    }
                }
                else
                {
                    let start = this.cursorStart;
                    let end = this.cursorEnd;
                    this.cursorStart++;
                    this.cursorEnd = this.cursorStart;

                    this.insertText(textItem, start, end, inputChar);
                }
                break;
            }
        }
    }
}
