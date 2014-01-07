// jasmine-intercept.js
// david kaye (@dfkaye)
// 30 Oct 2103
//
// Provides an `intercept()` method for the Jasmine BDD test framework, in order to 
// capture *expected* failures and report them as passed to the jasmine reporter, mainly 
// as a shield for continuous integration environments.

(function() {

  /*
   * EXPORT JAZZ
   */
  if (typeof global != "undefined") {
    global.intercept = intercept;
  }
  
  if (typeof window != "undefined") {
    window.intercept = intercept;
  }

  /*
   * GLOBAL INTERCEPT GRABS IT OFF THE JAZZ ENVIRONMENT
   */
  function intercept(fn) {
    return jasmine.getEnv().intercept(fn);
  };
  
  /*
   * Main api method defined on the jazz environment in imitation of the jasmine lib src.
   *
   * intercept takes a function param, sets up interception of jasmine's addResult and 
   * and addExpectationResult methods, and populates passing and failing arrays with the 
   * generated results messages.
   *
   * returns a results object containing to the passing and failing message arrays.
   */   
  jasmine.getEnv().constructor.prototype.intercept = function intercept(fn) {

    if (typeof fn != 'function') {
      throw new Error('intercept() param expected to be a function but was ' + typeof fn);
    }
    
    /*
     * set up vars for each iteration first
     */
    var currentSpec = jasmine.getEnv().currentSpec;
    var passing = [];
    var failing = [];
    var result = /* jasmine 2.x.x. */ currentSpec.result || 
                 /* jasmine 1.x.x. */ currentSpec.results_;
    
    // overwrite result api (temporarily)..
    /* jasmine 1.x.x. */
    var addResult = result.addResult;
    result.addResult = function (results) {
      if (results.trace) {
        failing.push(results.message);
      } else {
        passing.push(results.message);
        addResult.call(result, results);
      }
    }
    
    /* jasmine 2.x.x. */
    var addExpectationResult = currentSpec.addExpectationResult;
    currentSpec.addExpectationResult = function (passed, data) {
      if (!passed) {
        failing.push(data.message);
      } else {
        passing.push(data.message);
        addExpectationResult.call(passed, data);
      }          
    };
    
    fn();
    
    // restore result api
    result.addResult = addResult;
    currentSpec.addExpectationResult = addExpectationResult;
    
    return {
      failing: failing,
      passing: passing
    }
  }
}());