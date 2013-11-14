jasmine-where
=============

Provides a `where()` clause for data-table support to the 
[Jasmine BDD test framework](https://github.com/pivotal/jasmine), similar to 
Cucumber's scenario-outline 
[Examples](https://github.com/cucumber/cucumber/wiki/Scenario-Outlines) 
or Spock's 
[where blocks](https://code.google.com/p/spock/wiki/SpockBasics#Where_Blocks).

Partly inspired by:
+ JP Castro's (@jphpsf)
    [DRYing Up Your JavaScript Jasmine Tests With the Data Provider Pattern]
    (http://blog.jphpsf.com/2012/08/30/drying-up-your-javascript-jasmine-tests)
+ Richard Rodger's [mstring](https://github.com/rjrodger/mstring)


install
-------

    npm install jasmine-where
    
    git clone https://github.com/dfkaye/jasmine-where.git
  
__!important__: including or requiring `jasmine-where` adds a `where()` method to 
the **global** namespace:

    require('jasmine-where');
    console.log(global.where && where) // => global.where
    
    <script -- jasmine 1 or 2 scripts first -->
    <script src="../jasmine-where.js"></script>
    
    
justify
-------

Easier to modify this
    
    it('description', function () {
    
      where(function(){/*** 
          a  |  b  |  c
          1  |  2  |  2
          4  |  3  |  4
          6  |  6  |  6
        ***/
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

    
story
-----

Borrowing from Richard Rodger's [mstring](https://github.com/rjrodger/mstring), 
`where()` accepts a function and inspects its string value, converts the triple-
commented data-table into an array of values, uses the labels as variables or 
symbols in a new Function().

Each `where()` clause works best with only one expectation clause at the moment 
(still debating whether it's worth supporting multiple expects in a single 
`where()`). 


jasmine versions supported
--------------------------

Current implementation runs in both jasmine 1.3.1 and jasmine 2.0.0-rc3.


jasmine-node
------------

Using [jasmine-node](https://github.com/mhevery/jasmine-node) which uses 
`jasmine-1.3.1` internally.  Run that with

    jasmine-node --verbose ./test/suite.spec.js

or simply

    npm test

    
rawgithub test page
-------------------

__The *jasmine2* browser test page is viewable on 
<a href='//rawgithub.com/dfkaye/vm-shim/master/test/browser-test.html' 
   target='_new' title='opens in new tab or window'>rawgithub</a>.__

   
testem
------

Using Toby Ho's MAGNIFICENT [testemjs](https://github.com/airportyh/testem) to 
drive tests in multiple browsers for jasmine-2.0.0 (see how to 
[hack testem for jasmine 2](https://github.com/dfkaye/testem-jasmine2)), as well 
as jasmine-node.  The `testem.json` file uses the standalone test page above, 
and also uses a custom launcher for jasmine-node (v 1.3.1).

In addition, the following command uses a custom launcher for `jasmine-node` in 
`testem`:

    testem -l jasmine-node


output
------

A passing `where()` clause has no effect on the usual jasmine output. 

When an expectation fails, the data-table labels plus the row of values for the 
current expectation are added to the *current* failing item. Every failed 
expectation in a `where()` clause will appear as:

     [a | b | c] : 
     [1 | 2 | x] (Expected 2 to be NaN.)


return values
-------------

You can capture the generated data table, including the labels, as the return 
value of the `where` clause for post-where assertions:

    it('returns data', function () {
      
        var values = where(function(){/*** 
            a  |  b  |  c
            1  |  1  |  1
            1  |  2  |  two
            3  |  2  |  3
            5  |  3  |  5.01
          ***/
          
          // within-where
          expect(Math.max(a, b)).toMatch(c);
        });
        
        
        // post-where
        expect(values[2][2]).toBe('two');
    });

    
jasmine-intercept test dependency
---------------------------------

In working this out, I found I needed a way to intercept the results in `where` 
tests that were expected to fail.  I've worked out 
[jasmine-intercept](https://github.com/dfkaye/jasmine-intercept) to handle that. 
It is included in the node_modules directory of this repo (if you're viewing on 
github).
