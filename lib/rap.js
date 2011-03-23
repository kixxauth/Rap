var util   = require('util')
  , events = require('events')
  , proto
  ;

function WrappedResponse(response_object) {
    events.EventEmitter.call(this);

    var self = this;

    this.wrapped_response = response_object;
    this.statusCode = response_object.statusCode;

    this.on('error', function (err) {
        self.last_error = err;
    });
}

util.inherits(WrappedResponse, events.EventEmitter);
proto = WrappedResponse.prototype;

proto.toString = function () {
    return '< rap::WrappedResponse object >';
};

proto.apply_to = function (name, args) {
    this.wrapped_response.statusCode = this.statusCode;
    this.wrapped_response[name].apply(this.wrapped_response, args);
};

proto.ohNo = function (callback) {
    this.on('error', callback);
    return this;
};

proto.emitError = function (err) {
    var self = this;
    process.nextTick(function () {
        self.emit('error', err);
    });
    return this;
};

proto.hasError = function () {
    return !!this.last_error;
};

proto.setStatusCode = function (status_code) {
    this.statusCode = status_code;
    this.wrapped_response.statusCode = status_code;
    return this;
};

proto.setHeader = function () {
    this.apply_to('setHeader', arguments);
    return this;
};

proto.end = function () {
    this.apply_to('end', arguments);
    return this;
};

exports.WrappedResponse;

exports.wrap = function (response_object) {
    return new WrappedResponse(response_object);
};

