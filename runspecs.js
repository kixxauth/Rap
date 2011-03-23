var jasmine
  , verbose = true
  , colored = true
  ;

try {
    jasmine = require('jasmine-node/lib/jasmine')
} catch (e) {
    console.log('missing dependency');
    process.stderr.write(e +'\n');
    process.exit(1);
}

for(var key in jasmine) {
  if (jasmine.hasOwnProperty(key)) {
    global[key] = jasmine[key];
  }
}

process.argv.forEach(function(arg){
  switch(arg) {
  case '--no-color': colored = false; break;
  case '--silent':   verbose = false; break;
  }
});

jasmine.executeSpecsInFolder(__dirname + '/spec', function(runner, log){
  if (runner.results().failedCount == 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, verbose, colored);

