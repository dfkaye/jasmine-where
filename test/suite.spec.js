// suite.spec.js

if (typeof require == 'function') {
  require('../jasmine-where');
}

describe('jasmine-where', function () {
    
  describe('where-fn', function () {
  
    it('should be on jasmine env', function() {
      expect(typeof jasmine.getEnv().where).toBe('function');
    });
    
    it('should be global', function() {
      expect(typeof where).toBe('function');
    });
      
    it('should accept one argument', function () {
      expect(where.length).toBe(1);
    });
    
    it('should accept only a function', function () {
      expect(function () {
        where(!function(){});
       }).toThrow();
    });
    
    
    
    it('should not throw if missing expectation', function () {
      expect(function () {
        where(function(){/* 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        */});
       }).not.toThrow();
    });
    
    it('should pass with correct data and expectation', function () {
      where(function(){/* 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        */
        expect(Math.max(a, b)).toBe(Number(c));
      });
    });


    describe('a malformed data table', function () {

      it('should throw when function has no data-table comment', function () {
        expect(function () {
          where(function(){});
         }).toThrow();
      });
      
      it('should throw when function has no data-table rows', function () {
        expect(function () {
          where(function(){/*
          */});
         }).toThrow();
      });
      
      it('should throw when function has only one row in data-table', function () {
        expect(function () {
          where(function(){/* 
            a  |  b  |  c 
          */});
         }).toThrow();
      });

      it('should throw with duplicate labels', function () {
        expect(function () {
          where(function(){/*
            a | a
            0 | 1
            */
          });
        }).toThrow();
      });
       
      it('should throw when function has un-separated items in data-table', function () {
        expect(function () {
          where(function(){/* 
            a  |  b  |  c
            6  
          */});
         }).toThrow();
      });
      
      it('should throw when missing last value', function () {
        expect(function () {
          where(function(){/* 
            a  |  b  |  c
            1  |  2  |
          */});
        }).toThrow();
      });
       
      it('should throw when missing first value', function () {
        expect(function () {
          where(function(){/* 
            a  |  b  |  c
               |  1  | 2
          */});
        }).toThrow();
      });
       
      it('should throw when missing inner value', function () {
        expect(function () {
          where(function(){/* 
            a  |  b  |  c
            1  |     | 2
          */});
        }).toThrow();
      });
      
      it('should throw when missing separator in data-table', function () {
        expect(function () {
          where(function(){/* 
            a  |  b  |  c
            6     4  |  0
          */});
         }).toThrow();
      });

    });
    
    
    /*
     * Use these tests to intercept result messages set by jasmine, particularly on specs
     * that fail.
     */

    describe('intercepting expected failing specs', function () {

      /*
       * set up vars for each iteration first
       */
      var intercept = (function() {
        
        var currentSpec;
        var result;
        
        var passMessages;
        var failMessages;

        var addResult;
        var addExpectationResult;
        var clear;
        
        function intercept() {
        
          /* 
           *  Set up an interceptor for add-results methods.
           *  Call restore() to un-set these before expect() calls after the where clause.
           */
           
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
          
          
          intercept.clear = clear;
          intercept.failMessages = failMessages;
          intercept.passMessages = passMessages;

        }

        return intercept;
        
      }());
      
      beforeEach(function() {

        intercept();

      });
      
      // TODO EXTRACT TESTS FOR THE RETURN VALUES MATRIX POST-WHERE ASSERTIONS
      
      it('should return messages for incorrect data', function () {
      
        var values = where(function(){/* 
            a  |  b  |  c
            1  |  1  |  1
            1  |  2  |  x
            3  |  2  |  3
            5  |  3  |  5.01
          */
          // within-where
          expect(Math.max(a, b)).toMatch(c);
        });
        
        intercept.clear(); // would be nice if spies could do this w/a callback or onAfter

        expect(intercept.failMessages.length).toBe(2);
        expect(intercept.passMessages.length).toBe(2);
        expect(intercept.failMessages[0]).toBe("Expected 2 to match '" + values[2][2] + "'.");
        expect(intercept.failMessages[1]).toBe("Expected 5 to match '5.01'.");
      });

      
      it('should return messages for incorrect expectation', function () {
      
        where(function(){/* 
            a  |  b  |  c
            1  |  1  |  1
            1  |  2  |  2
            4  |  2  |  4
            4  |  8  |  7
          */
          expect(Math.max(a, b)).toBe(Number(c));
        });
        
        intercept.clear();
        
        expect(intercept.failMessages.length).toBe(1);
        expect(intercept.passMessages.length).toBe(3);
        expect(intercept.failMessages[0]).toBe("Expected 8 to be 7.");
      });
    
    });
    
    
    /*
     * Use these tests to see displayed stack traces and results messages for failed specs.
     */
    // describe('non-intercepted failing tests', function () {

      // it("should print '0 rows in table' message in stack trace and spec", function () {
        // var values = where(function(){/*
          // */
        // });
      // });
      
    // });
    
  });
  
});
