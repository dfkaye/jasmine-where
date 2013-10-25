// jasmine-where.js

/*
//http://blog.jphpsf.com/2012/08/30/drying-up-your-javascript-jasmine-tests

function using(name, values, func){
  for (var i = 0, count = values.length; i < count; i++) {
    if (Object.prototype.toString.call(values[i]) !== '[object Array]') {
        values[i] = [values[i]];
    }
    func.apply(this, values[i]);
    jasmine.currentEnv_.currentSpec.description += ' (with "' + name + '" using ' + 
                                                    values[i].join(', ') + ')';
  }
}
*/


(function () {

  /**
   * EXPORT JAZZ
   */  
  if (typeof window == "undefined" && typeof global == "object") {
    global.where = where;
  } else if (typeof window != "undefined") {
    window.where = where;
  }
  
  
  /**
   * CONSTANTS
   */
  var SEP = '|';
  var PAD = ' ' + SEP + ' ';
  
  
  /**
   * GLOBAL WHERE GRABS IT OFF THE JAZZ ENVIRONMENT
   */
  function where(fn) {
    return jasmine.getEnv().where(fn);
  };
  
  
  ////////////////////////////////////////////////////////////////////////////////////////
  // where() - defined on the jazz environment in imitation of the jasmine lib src.
  //
  // accepts only a function with a commented data-table and an expectation.
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
  // parses the function into data array, passing each array row into a new Function() 
  // that contains the original function body's expectation statements.
  //
  // entire data-table with pass/fail messages is printed to the console only if an 
  // expectation fails.
  ////////////////////////////////////////////////////////////////////////////////////////
  jasmine.getEnv().constructor.prototype.where = function (fn) {
        
    var parseResult = parseFn(fn);
    var values = parseResult.table;
    var fnBody = parseResult.body;
    var labels = values[0];
    
    /**
     * labels array is toString'd so they became param symbols in the new Function
     * fnBody is what's left of the original function, mainly the expectation.
     */
    var fnTest = new Function(labels.toString(), fnBody);

    var currentSpec = jasmine.getEnv().currentSpec;
    var result = currentSpec.result || currentSpec.results_;
    var description = result.description + '\n [' + labels.join(PAD) + '] : ';
    var failedCount = 0;
    
    var item, message;
        
    for (var i = 1; i < values.length; ++i) {
    
      message = 'Passed';
      
      fnTest.apply(currentSpec, values[i]);

      // collect any failed expectation
      if (result.failedExpectations && result.failedExpectations.length) {
      
        // jasmine 2.x.x.
        if (failedCount < result.failedExpectations.length) {
        
          failedCount += 1;
          message = result.failedExpectations[failedCount - 1].message;
        }
        
      } else if (result.items_) {
      
        // jasmine 1.x.x.
        item = result.items_[result.items_.length - 1];
        
        if (item && !item.passed_) {
          failedCount += 1;
          message = item.message;
        }
      }
      
      description += '\n [' + values[i].join(PAD) + '] (' + message + ')';
    }    

    // print only if there were failed expectations, if we can
    if (failedCount) {
      result.description = description;
      typeof console == 'undefined' || console.log(result.description);
    }
  };
  
  
  /**
   * parseFn takes a function and extracts the data table labels and values.
   * returns a result object with {body} the function as a string and {table} data array.
   */
  function parseFn(fn) {
  
    if (typeof fn != 'function') {
      throw new Error('where(param) expected param should be a function');
    }
    
    var fs = fn.toString();
    var table = fs.match(/\/\*[^\*]+\*\//);
    var body = fs.replace(table, '').replace(/\s*function[^\(]*[\(][^\)]*[\)][^\{]*{/,'')
                 .replace(/[\}]$/, '');
    var data = table[0].replace(/[\/\*]*[\r]*[\*\/]*/g, '').split('\n');
    var rows = [];
    
    var row, size;
        
    for (var i = 0; i < data.length; i++) {
    
      row = data[i].replace(/\b[\s*]/,'').replace(/(\s)*\b/, '');
      
      if (row.match(/\S+/)) {
      
        row = row.replace(/\s+/g, '');
        
        if (row.charAt(row.length - 1) == SEP) {
          throw new Error('where() data table has unbalanced row: ' + row);
        }
        
        row = row.split(SEP);
        rows.push(row);

        if (typeof size != 'number') {
          size = row.length;
        }

        if (size !== row.length) {
          throw new Error('where() data table has unbalanced rows; expected ' + size + 
                          ' but was ' + row.length);
        }
      }
    }
    
    if (rows.length < 2) {
      throw new Error('where() data table should contain at least 2 rows but has ' + 
                      rows.length);
    }
    
    return { body: body, table: rows };
  }
}());
