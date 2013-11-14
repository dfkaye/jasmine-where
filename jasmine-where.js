// jasmine-where.js
// david kaye (@dfkaye)
// 24 Oct 2103
//
// Provides a `where()` clause for data-table support to the Jasmine BDD test framework 
// (https://github.com/pivotal/jasmine), similar to Cucumber's scenario-outline 
// Examples (https://github.com/cucumber/cucumber/wiki/Scenario-Outlines) or Spock's 
// where: blocks (https://code.google.com/p/spock/wiki/SpockBasics#Where_Blocks).
//
// For example:
//
//    it('description', function () {
//      where(function(){/* 
//          a  |  b  |  c
//          1  |  2  |  2
//          4  |  3  |  4
//          6  |  6  |  6
//        */
//        expect(Math.max(a, b)).toBe(Number(c));
//      });
//    });
//
(function () {

  /*
   * EXPORT JAZZ
   */  
  if (typeof window == "undefined" && typeof global == "object") {
    global.where = where;
  } else if (typeof window != "undefined") {
    window.where = where;
  }
    
  /*
   * CONSTANTS
   */
  var SEP = '|';
  var PAD = ' ' + SEP + ' ';
  
  /*
   * GLOBAL WHERE GRABS IT OFF THE JAZZ ENVIRONMENT
   */
  function where(fn) {
    return jasmine.getEnv().where(fn);
  };
  
  ////////////////////////////////////////////////////////////////////////////////////////
  // main api method defined on the jazz environment in imitation of the jasmine lib src.
  // 
  // where() accepts only a function with a commented data-table and an expectation.
  //
  // parses the function into data array, passing each array row into a new Function() 
  // that contains the original function body's expectation statements.
  //
  // entire data-table with pass/fail messages is passed to the jasmine report only if an 
  // expectation fails.
  //
  // returns the data table values array for further use in other expectations.
  //
  ////////////////////////////////////////////////////////////////////////////////////////
  jasmine.getEnv().constructor.prototype.where = function (fn) {

    if (typeof fn != 'function') {
      throw new Error('where(param) expected param should be a function');
    }
    
    var fnBody = getFnBody(fn);
    var values = parseFnBody(fnBody);
    var labels = values[0];
    
    /**
     * {labels} array is toString'd so the values became param symbols in the new Function.
     * {fnBody} is what's left of the original function, mainly the expectation.
     */
    var fnTest = new Function(labels.toString(), fnBody);

    var currentSpec = jasmine.getEnv().currentSpec;
    var result = /* jasmine 2.x.x. */ currentSpec.result || 
                 /* jasmine 1.x.x. */ currentSpec.results_;
    
    var failedCount = 0;
    var trace = '\n [' + labels.join(PAD) + '] : ';

    var item, message;
        
    for (var i = 1; i < values.length; ++i) {
    
      message = 'Passed';
      
      fnTest.apply(currentSpec, values[i]);

      // TODO - extract method, perhaps...
      
      // collect any failed expectations 
      if (result.failedExpectations && result.failedExpectations.length) {
      
        /*
         * jasmine 2.x.x.
         */
        
        if (failedCount < result.failedExpectations.length) {
          failedCount += 1;
          item = result.failedExpectations[failedCount - 1];
          message = item.message;
          item.message = trace + '\n [' + values[i].join(PAD) + '] (' + message + ')'
        }
        
      } else if (result.items_) {
      
        /*
         * jasmine 1.x.x.
         */
        
        item = result.items_[result.items_.length - 1];
        
        if (item && !item.passed_) {
          failedCount += 1;
          message = item.message;
          item.message = trace + '\n [' + values[i].join(PAD) + '] (' + message + ')'
        }
      }
      
    }    
    
    // use these in further assertions 
    return values;
  };
  
  /**
   * private method
   * getFnBody() takes a function or string and returns the body of the function.
   */
  function getFnBody(fn) {
  
    var fnBody = fn.toString().replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                              .replace(/[\}]$/, '');
                 
    return fnBody;
  }
  
  /**
   * private method
   * parseFn() takes a function or string and extracts the data table labels and values.
   * returns a result object with {body} the function as a string and {table} data array.
   */
  function parseFnBody(fnBody) {
  
    var fs = fnBody.toString();
    var table = fs.match(/\/(\*){3,3}[^\*]+(\*){3,3}\//);
    var data = table[0].replace(/[\/\*]*[\r]*[\*\/]*/g, '').split('\n');
    var rows = [];
    
    var row, size;
        
    for (var i = 0; i < data.length; i++) {
    
      row = data[i].replace(/\b[\s*]/,'').replace(/(\s)*\b/, '');

      if (row.match(/\S+/)) {

        row = row.replace(/\s+/g, '');
        
        // empty right column
        if (row.charAt(0) == SEP || row.charAt(row.length - 1) == SEP || row.match(/\|\|/)) {
            throw new Error('where() data table has unbalanced rows: ' + row);
        }
        
        row = row.split(SEP);

        // first data row (labels)
        if (typeof size != 'number') {
        
          size = row.length;
          
          // no duplicates
          (function (row) {
            var visited = {};
            var label;
            for (var j = 0; j < row.length; ++j) {
              label = row[j];
              if (visited[label]) {
                throw new Error('where() data table contains duplicate label \'' + label +
                                '\' in [' + row.join(', ') + ']');
              }
              visited[label] = 1;
            }
          }(row));
        }

        // data row length
        if (size !== row.length) {
          throw new Error('where() data table has unbalanced rows; expected ' + size + 
                          ' but was ' + row.length);
        }
      
        rows.push(row);        
      }
    }
    
    // num rows
    if (rows.length < 2) {
      throw new Error('where() data table should contain at least 2 rows but has ' + 
                      rows.length);
    }
    
    return rows;
  }
  
}());
