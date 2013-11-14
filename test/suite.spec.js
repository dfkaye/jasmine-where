// suite.spec.js

if (typeof require == 'function') {
  require('../jasmine-where');
  require('jasmine-intercept');
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
        where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        ***/});
       }).not.toThrow();
    });
    
    it('should pass with correct data and expectation', function () {
      where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        ***/
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
          where(function(){/***
          ***/});
         }).toThrow();
      });
      
      it('should throw when function has only one row in data-table', function () {
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c 
          ***/});
         }).toThrow();
      });

      it('should throw with duplicate labels', function () {
        expect(function () {
          where(function(){/***
            a | a
            0 | 1
            ***/
          });
        }).toThrow();
      });
       
      it('should throw when function has un-separated items in data-table', function () {
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c
            6  
          ***/});
         }).toThrow();
      });
      
      it('should throw when missing last value', function () {
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c
            1  |  2  |
          ***/});
        }).toThrow();
      });
       
      it('should throw when missing first value', function () {
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c
               |  1  | 2
          ***/});
        }).toThrow();
      });
       
      it('should throw when missing inner value', function () {
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c
            1  |     | 2
          ***/});
        }).toThrow();
      });
      
      it('should throw when missing separator in data-table', function () {
        expect(function () {
          where(function(){/*** 
            a  |  b  |  c
            6     4  |  0
          ***/});
         }).toThrow();
      });

    });
    
    
    /***
     * Use these tests to intercept result messages set by jasmine, particularly on specs
     * that fail.
     ***/

    describe('jasmine-intercept for expected failing specs', function () {
           
      it('should return messages for incorrect expectation', function () {
      
         var messages = intercept(function() {
           where(function(){/*** 
              a  |  b  |  c
              1  |  1  |  1
              1  |  2  |  2
              4  |  2  |  4
              4  |  8  |  7
            ***/
            expect(Math.max(a, b)).toBe(Number(c));
          });
        
        });
        
        expect(messages.failing.length).toBe(1);
        expect(messages.passing.length).toBe(3);
        expect(messages.failing[0]).toBe("Expected 8 to be 7.");
      });

      
      it('should return messages for incorrect values', function () {
      
        var values;
        
        var messages = intercept(function() {
          values = where(function(){/*** 
              a  |  b  |  c
              1  |  1  |  1
              1  |  2  |  x
              3  |  2  |  3
              5  |  3  |  5.01
            ***/
            expect(Math.max(a, b)).toMatch(c);
          });
        });

        expect(messages.failing.length).toBe(2);
        expect(messages.passing.length).toBe(2);
        expect(messages.failing[0]).toBe("Expected 2 to match '" + values[2][2] + "'.");
        expect(messages.failing[1]).toBe("Expected 5 to match '5.01'.");
      });
    });
    
    
    describe('asynchronous tests', function () {
    
      it('should throw when missing separator in data-table', function (done) {
      
        setTimeout(function () {
        
          expect(function () {
            where(function(){/*** 
              a  |  b  |  c
              6     4  |  0
            ***/});
           }).toThrow();
           
           done();
           
        }, 500);
        
      });
      
      it('should work with intercept', function (done) {

        setTimeout(function () {
        
          var messages = intercept(function(){
          
            where(function(){/*** 
                a  |  b  |  c
                1  |  1  |  1
                1  |  2  |  2
                4  |  2  |  4
                4  |  8  |  7
              ***/
              expect(Math.max(a, b)).toBe(Number(c));
            });
          });
          
          expect(messages.failing.length).toBe(1);
          expect(messages.passing.length).toBe(3);
          expect(messages.failing[0]).toBe("Expected 8 to be 7.");
          
          done();
          
        }, 500);
      });
      
    });
    
    /***
     * Use these tests to see displayed stack traces and results messages for failed specs.
     ***/
    // describe('non-intercepted failing tests', function () {

      // it("should print '0 rows in table' message in stack trace and spec", function () {
        // var values = where(function(){/***
          // ***/
        // });
      // });
      
    // });
    
  });
  
});
