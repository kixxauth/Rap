beforeEach(function () {
    this.addMatchers({
        toHaveMethod: function (name) {
            return typeof this.actual[name] === 'function';
        }
    });

    this.wrap = require('../lib/rap').wrap;
});

function MockResponse() {
}

MockResponse.prototype.statusCode = 200;
MockResponse.prototype.end = function () {};
MockResponse.prototype.setHeader = function () {};
MockResponse.prototype.setStatusCode = function () {};

describe('rap::WrappedResponse', function () {
    it('should always be chainable', function () {
        var mock = new MockResponse();
        var response = this.wrap(mock);

        expect(response).toHaveMethod('ohNo');
        expect(response.ohNo(function () {})).toBe(response);

        expect(response).toHaveMethod('emitError');
        expect(response.emitError()).toBe(response);

        expect(response).toHaveMethod('setStatusCode');
        expect(response.setStatusCode()).toBe(response);

        expect(response).toHaveMethod('end');
        expect(response.end()).toBe(response);

        // hasError() is not chainable
        expect(response).toHaveMethod('hasError');
        expect(response.hasError()).toBe(false);
    });

    it('can be handed an error and should emit an error event', function () {
        var mock = new MockResponse();
        var response = this.wrap(mock);
        var err = new Error('foo');
        var spy = createSpy();

        response.ohNo(spy);

        response.emitError(err);
        expect(spy).not.toHaveBeenCalled();

        waitsFor(function () {
            return response.hasError();
        }, 100);

        runs(function () {
            expect(spy).toHaveBeenCalledWith(err);
            expect(spy.callCount).toBe(1);
        });
    });

    it('is a proxy for the .end() method', function () {
        var mock = new MockResponse();
        spyOn(mock, 'end');
        var response = this.wrap(mock);

        response.end('foo');

        expect(mock.end).toHaveBeenCalledWith('foo');
    });

    it('is a proxy for the .setHeader() method', function () {
        var mock = new MockResponse();
        spyOn(mock, 'setHeader');
        var response = this.wrap(mock);

        response.setHeader('Content-Type', 'text/plain');

        expect(mock.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
    });

    it('has a setter for .statusCode', function () {
        var mock = new MockResponse();
        var response = this.wrap(mock);

        expect(response.statusCode).toBe(200);
        expect(mock.statusCode).toBe(200);

        response.setStatusCode(300);

        expect(response.statusCode).toBe(300);
        expect(mock.statusCode).toBe(300);
    });

    it('proxies the .statusCode property', function () {
        var mock = new MockResponse();
        var response = this.wrap(mock);
        var statusCode;

        spyOn(mock, 'end').andCallFake(function () {
            statusCode = this.statusCode;
        });

        expect(mock.statusCode).toBe(200);
        response.statusCode = 300;
        expect(mock.statusCode).toBe(200);
        response.end();
        expect(mock.statusCode).toBe(300);
        expect(statusCode).toBe(300);
    });
});

describe('rap.WrappedResponse.ohNo()', function () {
    it('should only accept a function as the single parameter', function () {
        var mock = new MockResponse();
        var response = this.wrap(mock);
        var expected_err = new Error('addListener only takes instances of Function');

        function test_invalid() {
            response.ohNo();
        }

        expect(test_invalid).toThrow(expected_err);
    });
});
