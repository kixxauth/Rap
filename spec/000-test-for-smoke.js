describe('testing for smoke...', function () {
    it('should not be smoking', function () {
        var timer = (function () {
            var done = false;
            setTimeout(function () { done = true; }, 500);
            return function () { return done; };
        }());

        expect(timer()).toBe(false);
        waitsFor(timer, 600);
        runs(function () {
            expect(timer()).toBe(true);
        });
    });
});
