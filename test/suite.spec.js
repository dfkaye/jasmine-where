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
    
    it('should throw when function has no data-table comment', function () {
      expect(function () {
        where(function(){});
       }).toThrow();
    });

    it('should throw when function has only one row in data-table', function () {
      expect(function () {
        where(function(){/* 
          a  |  b  |  c 
        */});
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
    
    it('should throw when function has unbalanced data-table', function () {
      expect(function () {
        where(function(){/* 
          a  |  b  |  c
          1  |  2  |
        */});
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

    
    describe('should fail (but suppress stack trace) with', function () {
    
      var currentSpec;
      var result;
      
      var passCount;
      var failMessages;

      var addResult;
      var addExpectationResult;
      var onAfter;
      
      
      beforeEach(function() {

        /* 
         *  Set up an interceptor for add-results methods.
         *  Call restore() to un-set these before expect() calls after the where clause.
         */
        currentSpec = jasmine.getEnv().currentSpec;
        
        result = /* jasmine 2.x.x. */ currentSpec.result || 
                 /* jasmine 1.x.x. */ currentSpec.results_;
                     
        passCount = 0;
        failMessages = [];

        /* jasmine 1.x.x. */
        addResult = result.addResult;
        result.addResult = function (results) {
          if (results.trace) {
            failMessages.push(results.message);
          } else {
            passCount += 1;
            addResult.call(result, results);
          }
        }
        
        /* jasmine 2.x.x. */
        addExpectationResult = currentSpec.addExpectationResult;
        currentSpec.addExpectationResult = function (passed, data) {
          if (!passed) {
            failMessages.push(data.message);
          } else {
            passCount += 1;
            addExpectationResult.call(passed, data);
          }          
        };
        
        restore = function() {
          result.addResult = addResult;
          currentSpec.addExpectationResult = addExpectationResult;
        };
        
      });
      

      // TODO EXTRACT TESTS FOR THE RETURN VALUES MATRIX POST-WHERE ASSERTIONS
      
      it('incorrect data', function () {
      
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
        
        restore(); // would be nice if spies could do this w/a callback or onAfter

        expect(failMessages.length).toBe(2);
        expect(passCount).toBe(2);
        expect(failMessages[0]).toBe("Expected 2 to match '" + values[2][2] + "'.");
        expect(failMessages[1]).toBe("Expected 5 to match '5.01'.");
      });

      
      it('incorrect expectation', function () {
      
        where(function(){/* 
            a  |  b  |  c
            1  |  1  |  1
            1  |  2  |  2
            4  |  2  |  4
            4  |  8  |  7
          */
          expect(Math.max(a, b)).toBe(Number(c));
        });
        
        restore();
        
        expect(failMessages.length).toBe(1);
        expect(passCount).toBe(3);
        expect(failMessages[0]).toBe("Expected 8 to be 7.");
      });
    
    });
    
    
    
    /*
     * Use these tests to see displayed stack traces and results messages for failed specs.
     */
    describe('non-intercepted tests', function () {
    
      it('fails with table message', function () {
        where(function(){/*
          left | right
          hand | hand
          */
          expect(left).not.toBe(right);
        });
       });
       
    });
    
  });
  
});
