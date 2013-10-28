jasmine-where
=============

__IN PROGRESS__

Attempt to add where() clause to Jasmine, similar to Cucumber scenario-outline 
or Spock example clauses.


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


versions
--------

Current implementation runs in both jasmine 1.3.1 and jasmine 2.0.0-rc3.

Using jasmine-node which uses jasmine 1.3.1 internally.

    jasmine-node --verbose ./suite.spec.js
    
Using [testemjs](https://github.com/airportyh/testem) to drive tests in multiple 
browsers for jasmine-2.0.0 (see how to 
[hack testem for jasmine 2](https://github.com/dfkaye/testem-jasmine2), as well 
as jasmine-node.

    testem -l jasmine-node

    
output
------

When an expectation fails, the whole data-table is printed to the console, along 
with pass/fail messages for each row.  

A failed expectation will appear in your console as:

     incorrect data
     [a | b | c] : 
     [1 | 1 | 1] (Passed)
     [1 | 2 | x] (Expected 2 to be NaN.)
     [4 | 2 | 4] (Passed)
     [4 | 8 | 8] (Passed)

A passing where() clause has no effect on the usual jasmine output.  The reporter 
messages in browser still less than optimal.

     
TODO
----

+ figure out which clauses do _not_ support this
+ possible alternative APIs/tests (describe -> where -> it, e.g.)
+ better reporter message hooks (html reporter overrides)
+ asynchronous tests (?)
+ more code cleanup
+ better doc
+ NPM
