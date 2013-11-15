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
        
        expect(a + b)).toBe(c)
      })
      
    })

than this:

    it('description', function () {
    
      [[1, 2, 2],
       [4, 3, 4],
       [6, 6, 6]].forEach(function(row, r, rows) {
               
        expect(Number(row[0]) + Number(row[1])).toBe(Number(row[2]))
      })
      
    })

    
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
<a href='//rawgithub.com/dfkaye/jasmine-where/master/test/browser-test.html' 
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
     [1 | 2 | x] (Expected 2 to be 'x'.)


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
          
          // within where
          expect(Math.max(a, b)).toBe(c);
        });
        
        
        // inspect values returned by where()
        expect(values[2][2]).toBe('two');
    });

    
numeric data automatically converted
------------------------------------

Supports `Math.max(a, b)` to avoid typing `Math.max(Number(a), Number(b))`.

Everything can use `toBe()` (strict equality) - no need to rely on `toMatch()`.

However, where `Math` is involved there is usually an octal, signed, comma, or 
precision bug waiting.  All but precision are handled automatically; however, 
you can get precision into your tests by adding another column, as seen in the 
test created to verify numeric conversions work:

    where(function(){/***
    
            a     |    b     |    c     |  p
            
            0     |    1     |    1     |  1
            0.0   |    1.0   |    1     |  1
           -1     |   +1     |    0     |  1
           +1.1   |   -1.2   |   -0.1   |  2
           08     |   08     |   16     |  2
            6     |    4     |   10.0   |  3
            8.030 |   -2.045 |    5.985 |  4
        1,000.67  | 1345     | 2345.67  |  6
        
      ***/
      
      // using precisions for famous 5.985 vs 5.98499999999999999999999999 bugz
      var s = (a + b).toPrecision(p) // toPrecision() returns a string
      expect(+s).toBe(c) // but prefixed '+' uses implicit conversion to number.
    });

    
jasmine-intercept test dependency
---------------------------------

In working this out, I found I needed a way to intercept the results in `where` 
tests that were expected to fail.  I've worked out 
[jasmine-intercept](https://github.com/dfkaye/jasmine-intercept) to handle that. 
It is included in the node_modules directory of this repo (if you're viewing on 
github).
