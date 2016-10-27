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
    mouseClick: (e: MouseEvent) => void;

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

const ElementMessageTypes = {
    DELETE: 0,
    RESTORE: 1,
    MOVE: 2
};

const enum WorkerMessageTypes {
    UPDATEVIEW,
    SETVBOX,
    AUDIOSTREAM,
    VIDEOSTREAM,
    NEWVIEWCENTRE,
    SETSELECT,
    ELEMENTMESSAGE,
    ELEMENTVIEW,
    ELEMENTDELETE,
    NEWALERT,
    REMOVEALERT,
    NEWINFO,
    REMOVEINFO
}

const enum ControllerMessageTypes {
    START,
    SETOPTIONS,
    REGISTER,
    MODECHANGE,
    AUDIOSTREAM,
    VIDEOSTREAM,
    NEWELEMENT,
    ELEMENTID,
    BATCHMOVE,
    BATCHDELETE,
    BATCHRESTORE,
    ELEMENTMESSAGE,
    ELEMENTMOUSEOVER,
    ELEMENTMOUSEOUT,
    ELEMENTMOUSEDOWN,
    ELEMENTERASE,
    ELEMENTMOUSEMOVE,
    ELEMENTMOUSEUP,
    ELEMENTMOUSECLICK,
    ELEMENTMOUSEDBLCLICK,
    ELEMENTTOUCHSTART,
    ELEMENTTOUCHMOVE,
    ELEMENTTOUCHEND,
    ELEMENTTOUCHCANCEL,
    ELEMENTDRAG,
    ELEMENTDROP,
    MOUSEDOWN,
    MOUSEMOVE,
    MOUSEUP,
    MOUSECLICK,
    TOUCHSTART,
    TOUCHMOVE,
    TOUCHEND,
    TOUCHCANCEL,
    KEYBOARDINPUT,
    UNDO,
    REDO,
    PALLETECHANGE,
    LEAVE,
    ERROR
}

interface BoardComponent {
    componentName: string;
    ElementView;
    PalleteView;
    ModeView
    DrawHandle: (data: DrawData, context: CanvasRenderingContext2D) => void;
}

let components: Immutable.Map<string, BoardComponent> = Immutable.Map<string, BoardComponent>();

let registerComponentView = (componentName: string, ElementView, PalleteView, ModeView, DrawHandle) =>
{
    console.log('Registering view for: ' + componentName);
    let newComp: BoardComponent =
    {
        componentName: componentName, ElementView: ElementView, PalleteView: PalleteView, ModeView: ModeView, DrawHandle: DrawHandle
    };
    components = components.set(componentName, newComp);

    console.log('View Regisered.');
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
    allowAllEdit: boolean = false;
    allowUserEdit: boolean = true;
    socket: Socket  = null;
    worker;

    lMousePress: boolean = false;
    wMousePress: boolean = false;
    rMousePress: boolean = false;
    touchPress:  boolean = false;

    scaleF:   number = 1;
    panX:     number = 0;
    panY:     number = 0;
    scaleNum: number = 0;

    pointList:        Array<Point> = [];
    isPoint:          boolean      = true;
    prevX:            number       = 0;
    prevY:            number       = 0;
    prevTouch:        TouchList;
    selectDrag:       boolean      = false;
    mouseDownHandled: boolean      = false;

    downPoint:    Point;
    blockAlert:   boolean = false;

    selectCount:  number = 0;

    fileUploads: Array<File>       = [];
    fileReaders: Array<FileReader> = [];

    cursor:       string;
    cursorURL:    Array<string>;
    cursorOffset: Point;

    constructor(isHost: boolean, userId: number, allEdit: boolean, userEdit: boolean, workerUrl: string, componentFiles: Array<string>)
    {
        this.isHost = isHost;
        this.userId = userId;
        this.allowAllEdit = allEdit;
        this.allowUserEdit = userEdit;

        let dispatcher: WhiteBoardDispatcher = {
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
            mouseClick: this.mouseClick.bind(this),

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
            boardElements: Immutable.OrderedMap<number, ComponentViewState>(),
            infoElements:  Immutable.List<InfoElement>(),
            alertElements: Immutable.List<AlertElement>(),

            cursor: 'auto',
            cursorURL: [],
            cursorOffset: { x: 0, y: 0 },

            dispatcher: dispatcher,
            components: components
        };

        let self = this;
        this.worker = new Worker(workerUrl);

        this.worker.onmessage = (e) =>
        {
            self.setSelectCount.bind(this)(e.data.selectCount);

            if(e.data.viewUpdate != undefined && e.data.viewUpdate != null)
            {
                self.setViewState.bind(this)(e.data.viewUpdate);
            }
            if(e.data.newViewBox != undefined && e.data.newViewBox != null)
            {
                self.setViewBox.bind(this)(e.data.newViewBox.panX, e.data.newViewBox.panY, e.data.newViewBox.scaleF);
            }
            if(e.data.newViewCentre != undefined && e.data.newViewCentre != null)
            {
                self.handleElementNewViewCentre.bind(this)(e.data.newViewCentre.x, e.data.newViewCentre.y);
            }
            if(e.data.elementViews.length > 0)
            {
                self.setElementViews.bind(this)(e.data.elementViews);
            }
            if(e.data.deleteElements.length > 0)
            {
                self.deleteElements.bind(this)(e.data.deleteElements);
            }
            for(let i = 0; i < e.data.alerts.length; i++)
            {
                self.newAlert.bind(this)(e.data.alerts[i]);
            }
            if(e.data.removeAlert)
            {
                self.removeAlert.bind(this)();
            }
            if(e.data.infoMessages.length > 0)
            {
                self.addInfoMessages.bind(this)(e.data.infoMessages);
            }
            if(e.data.removeInfos.length > 0)
            {
                self.removeInfoMessages.bind(this)(e.data.removeInfos);
            }

            for(let i = 0; i < e.data.elementMessages.length; i++)
            {
                self.handleMessage.bind(this)(e.data.elementMessages[i].type, e.data.elementMessages[i].message);
            }
            for(let i = 0; i < e.data.audioRequests.length; i++)
            {
                self.getAudioStream.bind(this)(e.data.audioRequests[i]);
            }
            for(let i = 0; i < e.data.videoRequests.length; i++)
            {
                self.getVideoStream.bind(this)(e.data.videoRequests[i]);
            }

            if(e.data.elementMoves.length > 0)
            {
                console.log('Sending group move.');
                let message: UserMessage = { header: ElementMessageTypes.MOVE, payload: e.data.elementMoves };
                let messageCont: UserMessageContainer = { id: null, type: 'ANY', payload: message };

                self.handleMessage.bind(this)('MSG-COMPONENT', messageCont);
            }
            if(e.data.elementDeletes.length > 0)
            {
                let message: UserMessage = { header: ElementMessageTypes.DELETE, payload: e.data.elementDeletes };
                let messageCont: UserMessageContainer = { id: null, type: 'ANY', payload: message };

                self.handleMessage.bind(this)('MSG-COMPONENT', messageCont);
            }
            if(e.data.elementRestores.length > 0)
            {
                let message: UserMessage = { header: ElementMessageTypes.RESTORE, payload: e.data.elementRestores };
                let messageCont: UserMessageContainer = { id: null, type: 'ANY', payload: message };

                self.handleMessage.bind(this)('MSG-COMPONENT', messageCont);
            }

        };

        let message = { type: ControllerMessageTypes.START, componentFiles: componentFiles, allEdit: this.allowAllEdit, userEdit: this.allowUserEdit };
        this.worker.postMessage(message);
    }

    setSocket(socket)
    {
        this.socket = socket;

        let self = this;

        this.socket.on('JOIN', function(data: ServerBoardJoinMessage)
        {

        });

        this.socket.on('OPTIONS', function(data: ServerOptionsMessage)
        {
            /* TODO: Implement room options */
        });

        this.socket.on('NEW-ELEMENT', function(data: ServerMessageContainer)
        {
            let message = { type: ControllerMessageTypes.NEWELEMENT, data: data };
            self.worker.postMessage(message);
        });

        this.socket.on('ELEMENT-ID', function(data: ServerIdMessage)
        {
            let message = { type: ControllerMessageTypes.ELEMENTID, data: data };
            self.worker.postMessage(message);
        });

        this.socket.on('MSG-COMPONENT', function(data: ServerMessageContainer)
        {
            if(data.type == 'ANY')
            {
                if(data.payload.header == ElementMessageTypes.MOVE)
                {
                    let message = { type: ControllerMessageTypes.BATCHMOVE, data: data.payload.payload };
                    self.worker.postMessage(message);
                }
                else if(data.payload.header == ElementMessageTypes.DELETE)
                {
                    let message = { type: ControllerMessageTypes.BATCHDELETE, data: data.payload.payload };
                    self.worker.postMessage(message);
                }
                else if(data.payload.header == ElementMessageTypes.RESTORE)
                {
                    let message = { type: ControllerMessageTypes.BATCHRESTORE, data: data.payload.payload };
                    self.worker.postMessage(message);
                }
            }
            else
            {
                let message = { type: ControllerMessageTypes.ELEMENTMESSAGE, data: data };
                self.worker.postMessage(message);
            }
        });

        this.socket.on('ERROR', function(message: string)
        {
            console.log('SERVER: ' + message);

            let errMsg = { type: ControllerMessageTypes.ERROR, error: message };
            self.worker.postMessage(errMsg);
        });
    }

    handleMessage(type: string, message: UserMessageContainer)
    {
        this.socket.emit(type, message);
    }

    setRoomOptions(allowAllEdit: boolean, allowUserEdit: boolean)
    {
        this.allowAllEdit = allowAllEdit;
        this.allowUserEdit = allowUserEdit;

        let message = { type: ControllerMessageTypes.SETOPTIONS, allowAllEdit: this.allowAllEdit, allowUserEdit: this.allowUserEdit };
        this.worker.postMessage(message);
    }

    setView(view)
    {
        var whitElem  = document.getElementById('whiteBoard-input') as HTMLCanvasElement;
        var whitCont  = document.getElementById('whiteboard-container');

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
    updateView(viewState: WhiteBoardViewState)
    {
        this.viewState = viewState;
        this.view.storeUpdate(this.viewState);
    }

    setViewState(newParams: Object)
    {
        this.updateView(Object.assign({}, this.viewState, newParams));
    }

    setElementViews(upadates: Array<{id: number, view: ComponentViewState}>)
    {
        let newElemList = this.viewState.boardElements;

        for(let i = 0; i < upadates.length; i++)
        {
            newElemList = newElemList.set(upadates[i].id, upadates[i].view);
        }

        this.setViewState({ boardElements: newElemList });
    }

    setSelectCount(newCount: number)
    {
        this.selectCount = newCount;
    }

    getAudioStream(id: number)
    {
        /* TODO */
        return null;
    }

    getVideoStream(id: number)
    {
        /* TODO */
        return null;
    }

    newAlert(alertView: AlertElement)
    {
        let newElemList = this.viewState.alertElements.push(alertView);
        this.setViewState({ alertElements: newElemList });
    }

    removeAlert()
    {
        let newElemList = this.viewState.alertElements.shift();
        this.setViewState({ alertElements: newElemList });
    }

    deleteElements(ids: Array<number>)
    {
        let newElemList = this.viewState.boardElements;

        for(let i = 0; i < ids.length; i++)
        {
            newElemList = newElemList.filter(element => element.id !== ids[i]);
        }

        this.setViewState({ boardElements: newElemList });
    }

    handleElementNewViewCentre(x: number, y: number)
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

    addInfoMessages(newInfoViews)
    {
        let newInfoList = this.viewState.infoElements;

        for(let i = 0; i < newInfoViews.length; i++)
        {
            newInfoList = this.viewState.infoElements.push(newInfoViews[i]);
        }

        this.setViewState({ infoElements: newInfoList });
    }

    removeInfoMessages(ids: Array<number>)
    {
        let newInfoList = this.viewState.infoElements;

        for(let i = 0; i < ids.length; i++)
        {
            newInfoList = this.viewState.infoElements.delete(ids[i]);
        }

        this.setViewState({ infoElements: newInfoList });
    }

    setViewBox(panX: number, panY: number, scaleF: number)
    {
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let vBoxW = whitElem.clientWidth * scaleF;
        let vBoxH = whitElem.clientHeight * scaleF;

        this.scaleF = scaleF;
        this.panX = panX;
        this.panY = panY;

        let newVBox = '' + panX + ' ' + panY + ' ' + vBoxW + ' ' + vBoxH;

        // console.log('Updating Viewbox to: ' + newView);
        this.setViewState({ viewBox: newVBox, viewX: panX, viewY: panY, viewWidth: vBoxW, viewHeight: vBoxH, viewScale: scaleF });
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
    compareUpdateTime(elem1: ComponentViewState, elem2: ComponentViewState)
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
     * DISPATCHER METHODS
     *
     *
     *
     **********************************************************************************************************************************************************/
    modeChange(newMode: string)
    {
        var whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        var context  = whitElem.getContext('2d');
        context.clearRect(0, 0, whitElem.width, whitElem.height);

        let message = { type: ControllerMessageTypes.MODECHANGE, newMode: newMode };

        this.worker.postMessage(message);
    }

    changeEraseSize(newSize: number)
    {
        this.setViewState({ eraseSize: newSize });
    }

    elementMouseOver(id: number, e: MouseEvent)
    {
        let eventCopy =
        {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        }

        let message = { type: ControllerMessageTypes.ELEMENTMOUSEOVER, id: id, e: eventCopy };
        this.worker.postMessage(message);
    }

    elementMouseOut(id: number, e: MouseEvent)
    {
        let eventCopy =
        {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        }

        let message = { type: ControllerMessageTypes.ELEMENTMOUSEOUT, id: id, e: eventCopy };
        this.worker.postMessage(message);
    }

    elementMouseDown(id: number, e: MouseEvent, componenet?: number, subId?: number)
    {
        this.mouseDownHandled = true;

        e.preventDefault();
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
        let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

        let eventCopy =
        {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        }

        let message = { type: ControllerMessageTypes.ELEMENTMOUSEDOWN, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId };
        this.worker.postMessage(message);
    }

    elementMouseMove(id: number, e: MouseEvent, componenet?: number, subId?: number)
    {
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        let mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panX;

        if(this.viewState.mode == BoardModes.ERASE)
        {
            if(this.lMousePress)
            {
                let message = { type: ControllerMessageTypes.ELEMENTERASE, id: id };
                this.worker.postMessage(message);
            }
        }
        else if(this.viewState.mode == BoardModes.SELECT)
        {
            if(e.buttons == 0)
            {
                let eventCopy =
                {
                    altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                    buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
                };

                let message =
                {
                    type: ControllerMessageTypes.ELEMENTMOUSEMOVE, id: id, e: eventCopy, mouseX: mouseX, mouseY: mouseY, componenet: componenet, subId: subId
                };
                this.worker.postMessage(message);

                this.prevX = e.clientX;
                this.prevY = e.clientY;
            }
        }
    }

    elementMouseUp(id: number, e: MouseEvent, componenet?: number, subId?: number)
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
            let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };

            let message =
            {
                type: ControllerMessageTypes.ELEMENTMOUSEUP, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId
            };
            this.worker.postMessage(message);
        }
    }

    elementMouseClick(id: number, e: MouseEvent, componenet?: number, subId?: number)
    {
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
        let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

        if(this.viewState.mode == BoardModes.ERASE)
        {
            let message = { type: ControllerMessageTypes.ELEMENTERASE, id: id };
            this.worker.postMessage(message);
        }
        else if(this.viewState.mode == BoardModes.SELECT)
        {
            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };

            let message =
            {
                type: ControllerMessageTypes.ELEMENTMOUSECLICK, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId
            };
            this.worker.postMessage(message);
        }
    }

    elementMouseDoubleClick(id: number, e: MouseEvent, componenet?: number, subId?: number)
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let xPos = (e.clientX - offsetX) * this.scaleF + this.panX;
            let yPos = (e.clientY - offsetY) * this.scaleF + this.panY;

            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };

            let message =
            {
                type: ControllerMessageTypes.ELEMENTMOUSEDBLCLICK, id: id, e: eventCopy, mouseX: xPos, mouseY: yPos, componenet: componenet, subId: subId
            };
            this.worker.postMessage(message);
            e.stopPropagation();
        }
    }

    elementTouchStart(id: number, e: TouchEvent, componenet?: number, subId?: number)
    {
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

        let message = { type: ControllerMessageTypes.ELEMENTTOUCHSTART, id: id, e: e, localTouches: localTouches, componenet: componenet, subId: subId };
        this.worker.postMessage(message);

        this.prevTouch = e.touches;
    }

    elementTouchMove(id: number, e: TouchEvent, componenet?: number, subId?: number)
    {
        let touchMoves: Array<BoardTouch>;

        if(this.viewState.mode == BoardModes.ERASE)
        {
            let message = { type: ControllerMessageTypes.ELEMENTERASE, id: id };
            this.worker.postMessage(message);
        }
        else if(this.viewState.mode == BoardModes.SELECT)
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

            let message = { type: ControllerMessageTypes.ELEMENTTOUCHMOVE, id: id, e: e, touchMoves: touchMoves, componenet: componenet, subId: subId };
            this.worker.postMessage(message);

            this.prevTouch = e.touches;
        }
    }

    elementTouchEnd(id: number, e: TouchEvent, componenet?: number, subId?: number)
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
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

            let message = { type: ControllerMessageTypes.ELEMENTTOUCHEND, id: id, e: e, localTouches: localTouches, componenet: componenet, subId: subId };
            this.worker.postMessage(message);
        }
    }

    elementTouchCancel(id: number, e: TouchEvent, componenet?: number, subId?: number)
    {
        if(this.viewState.mode == BoardModes.SELECT)
        {
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

            let message = { type: ControllerMessageTypes.ELEMENTTOUCHCANCEL, id: id, e: e, localTouches: localTouches, componenet: componenet, subId: subId };
            this.worker.postMessage(message);
        }
    }

    elementDragOver(id: number, e: DragEvent, componenet?: number, subId?: number)
    {
        /* TODO: */

        e.stopPropagation();
    }

    elementDrop(id: number, e: DragEvent, componenet?: number, subId?: number)
    {
        /* TODO: */

        e.stopPropagation();
    }

    mouseDown(e: MouseEvent)
    {
        e.preventDefault();

        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        let mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;

        if(!this.lMousePress && !this.wMousePress && !this.rMousePress)
        {
            this.lMousePress = e.buttons & 1 ? true : false;
            this.rMousePress = e.buttons & 2 ? true : false;
            this.wMousePress = e.buttons & 4 ? true : false;
            this.isPoint = true;

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
                this.setViewState({ blockAlert: true });
            }

            if(this.viewState.mode == BoardModes.SELECT && !this.mouseDownHandled && e.buttons == 1)
            {
                this.selectDrag = true;
            }
        }

        if(this.mouseDownHandled)
        {
            this.mouseDownHandled = false;
        }
        else
        {
            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };

            let message = { type: ControllerMessageTypes.MOUSEDOWN, e: eventCopy, mouseX: mouseX, mouseY: mouseY, mode: this.viewState.mode };
            this.worker.postMessage(message);
        }
    }

    mouseMove(e: MouseEvent)
    {
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let context = whitElem.getContext('2d');
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        let mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;

        if(this.wMousePress)
        {
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

        let eventCopy =
        {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        };

        if(this.selectDrag)
        {
            let rectLeft;
            let rectTop;
            let rectWidth;
            let rectHeight;

            let absX = Math.round(e.clientX - offsetX);
            let absY = Math.round(e.clientY - offsetY);

            if(absX > this.downPoint.x)
            {
                rectLeft = this.downPoint.x;
                rectWidth = absX - this.downPoint.x;
            }
            else
            {
                rectLeft = absX;
                rectWidth = this.downPoint.x - absX;
            }

            if(absY > this.downPoint.y)
            {
                rectTop = this.downPoint.y;
                rectHeight = absY - this.downPoint.y;
            }
            else
            {
                rectTop = absY;
                rectHeight = this.downPoint.y - absY;
            }

            context.clearRect(0, 0, whitElem.width, whitElem.height);

            context.setLineDash([5]);
            context.strokeStyle = 'black';
            context.strokeRect(rectLeft, rectTop, rectWidth, rectHeight);
        }

        let message = { type: ControllerMessageTypes.MOUSEMOVE, e: eventCopy, mouseX: mouseX, mouseY: mouseY, mode: this.viewState.mode };
        this.worker.postMessage(message);

        if(e.buttons == 1 && this.viewState.mode != BoardModes.SELECT && this.viewState.mode != BoardModes.ERASE)
        {
            let newPoint: Point = {x: 0, y: 0};

            newPoint.x = Math.round(e.clientX - offsetX);
            newPoint.y = Math.round(e.clientY - offsetY);

            let rectLeft;
            let rectTop;
            let rectWidth;
            let rectHeight;

            let absX = Math.round(e.clientX - offsetX);
            let absY = Math.round(e.clientY - offsetY);

            if(absX > this.downPoint.x)
            {
                rectLeft = this.downPoint.x;
                rectWidth = absX - this.downPoint.x;
            }
            else
            {
                rectLeft = absX;
                rectWidth = this.downPoint.x - absX;
            }

            if(absY > this.downPoint.y)
            {
                rectTop = this.downPoint.y;
                rectHeight = absY - this.downPoint.y;
            }
            else
            {
                rectTop = absY;
                rectHeight = this.downPoint.y - absY;
            }

            this.pointList.push(newPoint);

            if(this.selectCount == 0)
            {
                context.clearRect(0, 0, whitElem.width, whitElem.height);
                let data: DrawData =
                {
                    palleteState: this.viewState.palleteState, pointList: this.pointList, x: rectLeft, y: rectTop, width: rectWidth, height: rectHeight
                };
                components.get(this.viewState.mode).DrawHandle(data, context);
            }
        }

        this.prevX = e.clientX;
        this.prevY = e.clientY;
    }

    mouseUp(e: MouseEvent)
    {
        if(this.lMousePress && !this.wMousePress)
        {
            let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
            let context = whitElem.getContext('2d');
            let elemRect = whitElem.getBoundingClientRect();
            let offsetY  = elemRect.top - document.body.scrollTop;
            let offsetX  = elemRect.left - document.body.scrollLeft;

            let mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
            let mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;

            let downX = this.downPoint.x * this.scaleF + this.panX;
            let downY = this.downPoint.y * this.scaleF + this.panY;

            context.clearRect(0, 0, whitElem.width, whitElem.height);

            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
            };

            let message =
            {
                type: ControllerMessageTypes.MOUSEUP, e: eventCopy, mouseX: mouseX, mouseY: mouseY, downX: downX, downY: downY,
                mode: this.viewState.mode , scaleF: this.scaleF, panX: this.panX, panY: this.panY, pointList: this.pointList
            };

            this.worker.postMessage(message);
        }

        if(this.blockAlert)
        {
            this.blockAlert = false;
            this.setViewState({ blockAlert: false });
        }

        this.lMousePress = false;
        this.wMousePress = false;
        this.rMousePress = false;
        this.pointList = [];
        this.selectDrag = false;
    }

    mouseClick(e: MouseEvent)
    {
        let whitElem  = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let elemRect = whitElem.getBoundingClientRect();
        let offsetY  = elemRect.top - document.body.scrollTop;
        let offsetX  = elemRect.left - document.body.scrollLeft;

        let mouseX = Math.round(e.clientX - offsetX) * this.scaleF + this.panX;
        let mouseY = Math.round(e.clientY - offsetY) * this.scaleF + this.panY;

        let eventCopy =
        {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            buttons: e.buttons, clientX: e.clientX, clientY: e.clientY
        };

        let message =
        {
            type: ControllerMessageTypes.MOUSECLICK, e: eventCopy, mouseX: mouseX, mouseY: mouseY, mode: this.viewState.mode
        };

        this.worker.postMessage(message);
    }

    touchStart(e: TouchEvent)
    {
        this.touchPress = true;
        /* TODO: */
    }

    touchMove(e: TouchEvent)
    {
        /* TODO: */
        if(this.touchPress)
        {

        }
    }

    touchEnd(e: TouchEvent)
    {
        /* TODO: */
        this.touchPress = false;
    }

    touchCancel(e: TouchEvent)
    {
        /* TODO: */
    }

    keyDown(e: KeyboardEvent)
    {
        if (e.keyCode === 8)
        {
            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                keyCode: e.keyCode, charCode: e.charCode
            };

            let message = { type: ControllerMessageTypes.KEYBOARDINPUT, e: eventCopy, inputChar: 'Backspace', mode: this.viewState.mode };
            this.worker.postMessage(message);
            e.preventDefault();
        }
        else if(e.keyCode === 46)
        {
            let eventCopy =
            {
                altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
                keyCode: e.keyCode, charCode: e.charCode
            };

            let message = { type: ControllerMessageTypes.KEYBOARDINPUT, e: eventCopy, inputChar: 'Del', mode: this.viewState.mode };
            this.worker.postMessage(message);
            e.preventDefault();
        }
    }

    keyPress(e: KeyboardEvent)
    {
        let inputChar = e.key;
        e.preventDefault();

        let eventCopy =
        {
            altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, detail: e.detail,
            keyCode: e.keyCode, charCode: e.charCode
        };

        if(e.ctrlKey)
        {
            if(inputChar == 'z')
            {
                let message = { type: ControllerMessageTypes.UNDO };
                this.worker.postMessage(message);
            }
            else if(inputChar == 'y')
            {
                let message = { type: ControllerMessageTypes.REDO };
                this.worker.postMessage(message);
            }
        }
        else
        {
            let message = { type: ControllerMessageTypes.KEYBOARDINPUT, e: eventCopy, inputChar: inputChar, mode: this.viewState.mode };
            this.worker.postMessage(message);
        }
    }

    contextCopy(e: MouseEvent)
    {
        document.execCommand("copy");
    }

    contextCut(e: MouseEvent)
    {
        document.execCommand("cut");
    }

    contextPaste(e: MouseEvent)
    {
        document.execCommand("paste");
    }

    onCopy(e: ClipboardEvent)
    {
        console.log('COPY EVENT');
        /* TODO: */
    }

    onPaste(e: ClipboardEvent)
    {
        console.log('PASTE EVENT');
        /* TODO: */
    }

    onCut(e: ClipboardEvent)
    {
        console.log('CUT EVENT');
        /* TODO: */
    }

    dragOver(e: DragEvent)
    {
        /* TODO: Pass to elements as necessary. */
        e.preventDefault();
    }

    drop(e: DragEvent)
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

    palleteChange(change: BoardPalleteChange)
    {
        let message = { type: ControllerMessageTypes.PALLETECHANGE, change: change, mode: this.viewState.mode };
        this.worker.postMessage(message);
    }

    windowResize(e: DocumentEvent)
    {
        let whitElem = document.getElementById("whiteBoard-input") as HTMLCanvasElement;
        let whitCont = document.getElementById("whiteboard-container");

        whitElem.style.width = whitCont.clientWidth + "px";
        whitElem.style.height = whitCont.clientHeight + "px";
        whitElem.width = whitElem.clientWidth;
        whitElem.height = whitElem.clientHeight;

        this.setViewBox(this.panX, this.panY, this.scaleF);
    }

    windowUnload(e: DocumentEvent)
    {
        this.socket.emit('LEAVE', null);
    }

    mouseWheel(e: WheelEvent)
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

    clearAlert()
    {
        this.removeAlert();
    }
}
