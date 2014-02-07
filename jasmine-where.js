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
//    it('should pass with correct data and expectation', function () {
//      where(function(){/***
//         a | b | c
//         1 | 2 | 2
//         4 | 3 | 4
//         6 | 6 | 6
//        ***/
//        expect(Math.max(a, b)).toBe(c);
//      });
//    });
//
//  Tables may also contain left and right borders:
//
//    it('should pass with left and right table borders', function () {
//      where(function(){/***
//        | a | b | c |
//        | 1 | 2 | 2 |
//        | 4 | 3 | 4 |
//        | 6 | 6 | 6 |
//        ***/
//        expect(Math.max(a, b)).toBe(c);
//      });
//    });
//
//  Numeric data is automatically coerced to Number type.
//
(function () {
  /*
   * EXPORT JAZZ
   */
  if (typeof global != "undefined") {
    global.where = where;
  }
  if (typeof window != "undefined") {
    window.where = where;
  }

  /*
   * CONSTANTS
   */
  var SEP = '|';
  var PAD = ' ' + SEP + ' ';
  var MESSAGE = 'Passed';
    
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
  function where(fn) {

    if (typeof fn != 'function') {
      throw new Error('where(param) expected param should be a function');
    }
    
    var fnBody = fn.toString().replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                              .replace(/[\}]$/, '');
    var values = parseFnBody(fnBody);
    var labels = values[0];
    
    /**
     * {labels} array is toString'd so the values became param symbols in the new Function.
     * {fnBody} is what's left of the original function, mainly the expectation.
     */
    var fnTest = new Function(labels.toString(), fnBody);
    var failedCount = 0;
    var trace = '\n [' + labels.join(PAD) + '] : ';
    
    /*
     * 1.x.x - jasmine.getEnv().currentSpec
     * 2.x.x - .currentSpec is no longer exposed (leaking state) so use a shim for it with 
     *          the v2 .result property
     */

    var currentSpec = jasmine.getEnv().currentSpec || { result : {} };
    var result = /* jasmine 2.x.x. */ currentSpec.result || 
                 /* jasmine 1.x.x. */ currentSpec.results_;

    var item, message;
        
    for (var i = 1; i < values.length; ++i) {
    
      message = MESSAGE;
      
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
          item.message = trace + '\n [' + values[i].join(PAD) + '] (' + message + ')';
        }
        
      } else if (result.items_) {
      
        /*
         * jasmine 1.x.x.
         */
        
        item = result.items_[result.items_.length - 1];
        
        if (item && !item.passed_) {
          failedCount += 1;
          message = item.message;
          item.message = trace + '\n [' + values[i].join(PAD) + '] (' + message + ')';
        }
      }
      
    }    
    
    // use these in further assertions 
    return values;
  };
      
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

        // empty column
        if (row.match(/[\|][\|]/g)) {
          throw new Error('where() data table has unbalanced columns: ' + row);
        }
        
        row = balanceRowData(row);
        
        // visiting label row
        if (typeof size != 'number') {
          shouldNotHaveDuplicateLabels(row);
          size = row.length;
        }

        // data row length
        if (size !== row.length) {
          throw new Error('where-data table has unbalanced row; expected ' + size + 
                          ' columns but has ' + row.length + ': [' + row.join(', ') + 
                          ']');
        }

        convertNumerics(row);

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
  
  
  
  function balanceRowData(row) {
  
    var cells = row.split(SEP);
    var left  = cells[0] === '';    //left border
    var right = cells[cells.length - 1] === '';    //right border
    
    if (left != right) {
      throw new Error('where-data table borders are not balanced: ' + row);
    }
    
    if (left) {
      cells.shift();
    }

    if (right) {
      cells.pop();
    }
      
    return cells;
  }
  
  
  /*
   * @private 
   * @method shouldNotHaveDuplicateLabels() checks that row of data contains no duplicated 
   *  data values - mainly used for checking column headers (a,b,c vs. a,b,b).
   * @param row array of values.
   */
  function shouldNotHaveDuplicateLabels(row) {
    for (var label, visited = {}, j = 0; j < row.length; j += 1) {
    
      label = row[j];

      if (visited[label]) {
        throw new Error('where-data table contains duplicate label \'' + label +
                        '\' in [' + row.join(', ') + ']');
      }
      
      visited[label] = 1;
    }
  }
  
  /*
   * @private 
   * @method convertNumerics() replaces row data with numbers if value is numeric, or a 
   *  'quoted' numeric string.
   * @param row array of values.
   */
  function convertNumerics(row) {
    for (var t, i = 0; i < row.length; i += 1) {
    
      t = parseFloat(row[i].replace(/\'|\"|\,/g,''));
      
      isNaN(t) || (row[i] = t);
    }
  }
 
}());