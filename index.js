/**
 * Supermitter - A compile-on-the-fly event emitter
 *
 * @constructor
 */
function Supermitter() {
    this._events    = {};
    this._eventKeys = [];
    this._counter   = 0;
}

module.exports = Supermitter;
var proto = Supermitter.prototype;

/**
 * on - Listen to an event
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Supermitter}
 */
proto.on = function on(event, fn) {
    if (!this._events[event]) {
        this._events[event] = [];
    }
    this._events[event].push(this._assign(fn));
    this.recompile();

    return this;
};

/**
 * recompile - Re-compiles the emit function
 *
 * @param {String} event
 * @return {Supermitter}
 */
proto.recompile = function recompile() {
    /* jshint evil:true */
    var events = null; // Array
    var out    = null; // Array
    var method = null; // String
    var key    = null; // String

    // Generate emit()
    out = [
        '(function (event, data) {',
        '  event = \'\' + event;',
        '  switch (event) {'
    ];

    this._eventKeys = [];
    for (key in this._events) {
        this._eventKeys.push(key);

        out.push('  case "' + key + '":');

        for (var j = 0, jl = this._events[key].length; j < jl; j += 1) {
            method = this._events[key][j];
            out.push('    this.' + method + '(data);');
        }

        out.push('    return true;');
    }

    out.push('  }', '  return false;', '})');
    out = out.join('\n');

    this.emit = eval(out);

    events = out = method = key = null;

    return this;
};

/**
 * _assign - Assign a unique name to a function
 *
 * @param {Function} fn
 * @return {String}
 */
proto._assign = function assign(fn) {
    var method = '__fn' + this._counter;

    this[method] = fn;
    this._counter += 1;

    return method;
};

/**
 * emit - To be replaced with generated function
 *
 * @param {String} event
 * @param {Mixed} data
 * @return {Boolean}
 */
proto.emit = function emit() {
    return false;
};
