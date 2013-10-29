jasmine-where
=============

Provide a where() clause for data-table support to Jasmine, similar to 
Cucumber's scenario-outline or Spock example clauses.

Partly inspired by:
+ JP Castro's (@jphpsf)
    [DRYing Up Your JavaScript Jasmine Tests With the Data Provider Pattern]
    (http://blog.jphpsf.com/2012/08/30/drying-up-your-javascript-jasmine-tests)
+ Richard Rodger's [mstring](https://github.com/rjrodger/mstring)


justify
-------

Easier to modify this
    
    it('description', function () {
    
      where(function(){/* 
        a  |  b  |  c
        1  |  2  |  2
        4  |  3  |  4
        6  |  6  |  6
       */
       expect(Math.max(a, b)).toBe(Number(c));
      });
      
    });

than this:

    it('description', function () {
    
      [[1, 2, 2],
       [4, 3, 4],
       [6, 6, 6]].forEach(function(row, r, rows) {
       
        var a = row[0], b = row[1], c = row[2];
        
        expect(Math.max(a, b)).toBe(Number(c));
      });
      
    });

    
details
-------

[24 OCT 2013]

Borrowing from Richard Rodger's [mstring](https://github.com/rjrodger/mstring), 
<code>where()</code> accepts a function and inspects its string value, converts 
the commented data-table into an array of values, uses the labels as variables 
or symbols in a new Function().

Each where() clause works best with only one expectation clause at the moment (still debating 
whether it's worth supporting multiple expects in a single where()). 


jasmine versions supported
--------------------------

Current implementation runs in both jasmine 1.3.1 and jasmine 2.0.0-rc3.

Using jasmine-node which uses jasmine 1.3.1 internally.

    jasmine-node --verbose ./test/suite.spec.js
    
Using [testemjs](https://github.com/airportyh/testem) to drive tests in multiple 
browsers for jasmine-2.0.0 (see how to 
[hack testem for jasmine 2](https://github.com/dfkaye/testem-jasmine2)), as well 
as jasmine-node.  The following command uses a custom launcher for jasmine-node 
in testem:

    testem -l jasmine-node

    
output
------

A passing where() clause has no effect on the usual jasmine output. 

When an expectation fails, the data-table labels plus the row of values for the 
current expectation are added to the *current* failing item. Every failed 
expectation in a where() clause will appear as:

     [a | b | c] : 
     [1 | 2 | x] (Expected 2 to be NaN.)


return values
-------------

You can capture the generated data table, including the labels, as the return 
value of the where clause for post-where assertions:

    it('returns data', function () {
      
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
        
        
        // post-where
        expect(values[2][2]).toBe('X');
        
    });
     
TODO
----
+ tests for returnValues in post-where() assertions
+ tests for comments
+ at least one asynchronous test
+ figure out which clauses do _not_ support this ('it' works best)
+ possible alternative APIs/tests (describe -> where -> it, e.g.)
+ <del>better reporter message hooks (html reporter overrides)</del>
+ <del>more code cleanup</del> (ongoing)
+ <del>better doc</del> (ongoing)
+ NPM publish
