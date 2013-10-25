// suite.spec.js

if (typeof require == 'function') {
  require('./jasmine-where');
}

describe('jasmine-where', function () {
   
  describe('version', function () {
  
    it('should find jasmine version', function () {
      var version = jasmine.version /* 2.0.0 */ || jasmine.version_.major /* 1.3.1 */;
      expect(version).toBeDefined();
    });
    
  });
  
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

    describe('should fail with', function () {
      it('incorrect data', function () {
        where(function(){/* 
            a  |  b  |  c
            1  |  1  |  1
            1  |  2  |  x
            4  |  2  |  4
            4  |  8  |  8
          */
          expect(Math.max(a, b)).toBe(Number(c));
        });
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
      });
    });
    
  });
  
});
