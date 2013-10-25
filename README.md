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
Current impl runs in both jasmine 1.3.1 and jasmine 2.0.0-rc3.

Using testemjs to drive tests in multiple browsers for jasmine-2.0.0 and 
jasmine-node which uses jasmine 1.3.1 internally.

Entire data-table with pass/fail messages is printed to the console only if an 
expectation fails.  Reporter messages in browser still less than optimal.


TODO
----

+ figure out which clauses do _not_ support this
+ asynchronous tests
+ more code cleanup
+ better doc
+ NPM
