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
  if (typeof window == "undefined" && typeof global == "object") {
    global.intercept = intercept;
  } else if (typeof window != "undefined") {
    window.intercept = intercept;
  }

  /*
   * GLOBAL INTERCEPT GRABS IT OFF THE JAZZ ENVIRONMENT
   */
  function intercept() {
    return jasmine.getEnv().intercept();
  };
  
  /*
   * Main api method defined on the jazz environment in imitation of the jasmine lib src.
   *
   * Set up an interceptor for add-results methods.
   *
   * Call intercept.clear() to un-set these before expect() calls after the intercepted
   * block.
   */   
  jasmine.getEnv().constructor.prototype.intercept = function() {
  
    /*
     * set up vars for each iteration first
     */
    var currentSpec;
    var result;
    var passMessages;
    var failMessages;
    var addResult; /* jasmine 1.x.x. */
    var addExpectationResult; /* jasmine 2.x.x. */
    var clear;
    
    currentSpec = jasmine.getEnv().currentSpec;

    result = /* jasmine 2.x.x. */ currentSpec.result || 
             /* jasmine 1.x.x. */ currentSpec.results_;
                 
    passMessages = [];
    failMessages = [];

    /* jasmine 1.x.x. */
    addResult = result.addResult;
    result.addResult = function (results) {
      if (results.trace) {
        failMessages.push(results.message);
      } else {
        passMessages.push(results.message);
        addResult.call(result, results);
      }
    }
    
    /* jasmine 2.x.x. */
    addExpectationResult = currentSpec.addExpectationResult;
    currentSpec.addExpectationResult = function (passed, data) {
      if (!passed) {
        failMessages.push(data.message);
      } else {
        passMessages.push(data.message);
        addExpectationResult.call(passed, data);
      }          
    };
    
    clear = function() {
      result.addResult = addResult;
      currentSpec.addExpectationResult = addExpectationResult;
    };
    
    /*
     * Each invocation of intercept() resets these
     */
    intercept.clear = clear;
    intercept.failMessages = failMessages;
    intercept.passMessages = passMessages;
  }
}());