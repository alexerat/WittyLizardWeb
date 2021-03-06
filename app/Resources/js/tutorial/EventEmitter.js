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
