var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

if (!process.env) process.env = {};
if (!process.argv) process.argv = [];

require.define("path", function (require, module, exports, __dirname, __filename) {
function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/node_modules/underscore/package.json", function (require, module, exports, __dirname, __filename) {
module.exports = {"main":"underscore.js"}
});

require.define("/node_modules/underscore/underscore.js", function (require, module, exports, __dirname, __filename) {
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});

require.define("/node_modules/run.js", function (require, module, exports, __dirname, __filename) {
/*globals module, require, console, exports*/


var scheem = require('scheem.js');

var parser = scheem.parse;

var evalScheem = require('evalScheem').evalScheem;

module.exports = function (str) {
  var par = parser(str);
  //console.log(par);
  return evalScheem(par);
}
});

require.define("/node_modules/scheem.js", function (require, module, exports, __dirname, __filename) {
module.exports = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "quote": parse_quote,
        "expression": parse_expression,
        "validchar": parse_validchar,
        "string": parse_string,
        "atom": parse_atom,
        "_": parse__,
        "ws": parse_ws,
        "comment": parse_comment,
        "NumericLiteral": parse_NumericLiteral,
        "DecimalLiteral": parse_DecimalLiteral,
        "DecimalIntegerLiteral": parse_DecimalIntegerLiteral,
        "DecimalDigits": parse_DecimalDigits,
        "DecimalDigit": parse_DecimalDigit,
        "NonZeroDigit": parse_NonZeroDigit,
        "ExponentPart": parse_ExponentPart,
        "ExponentIndicator": parse_ExponentIndicator,
        "SignedInteger": parse_SignedInteger,
        "HexIntegerLiteral": parse_HexIntegerLiteral,
        "HexDigit": parse_HexDigit
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_expression();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_expression();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, e) { if (e.length === 1) {return  e[0]; } else { e.unshift('begin'); return e;} })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_quote() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 39) {
            result1 = "'";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"'\"");
            }
          }
          if (result1 !== null) {
            result2 = parse__();
            if (result2 !== null) {
              result3 = parse_expression();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, e) {return ["quote", e]})(pos0, result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_expression() {
        var result0, result1, result2, result3, result4, result5, result6;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          result1 = parse_NumericLiteral();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, n) {return n})(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            result1 = parse_atom();
            if (result1 !== null) {
              result2 = parse__();
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, a) {return a})(pos0, result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse__();
            if (result0 !== null) {
              result1 = parse_string();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, s) {return s})(pos0, result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              result0 = parse__();
              if (result0 !== null) {
                result1 = parse_quote();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, q) {return q})(pos0, result0[1]);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                pos1 = pos;
                result0 = parse__();
                if (result0 !== null) {
                  if (input.charCodeAt(pos) === 40) {
                    result1 = "(";
                    pos++;
                  } else {
                    result1 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"(\"");
                    }
                  }
                  if (result1 !== null) {
                    result2 = parse__();
                    if (result2 !== null) {
                      result4 = parse_expression();
                      if (result4 !== null) {
                        result3 = [];
                        while (result4 !== null) {
                          result3.push(result4);
                          result4 = parse_expression();
                        }
                      } else {
                        result3 = null;
                      }
                      if (result3 !== null) {
                        result4 = parse__();
                        if (result4 !== null) {
                          if (input.charCodeAt(pos) === 41) {
                            result5 = ")";
                            pos++;
                          } else {
                            result5 = null;
                            if (reportFailures === 0) {
                              matchFailed("\")\"");
                            }
                          }
                          if (result5 !== null) {
                            result6 = parse__();
                            if (result6 !== null) {
                              result0 = [result0, result1, result2, result3, result4, result5, result6];
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
                if (result0 !== null) {
                  result0 = (function(offset, e) {return e})(pos0, result0[3]);
                }
                if (result0 === null) {
                  pos = pos0;
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_validchar() {
        var result0;
        
        if (/^[0-9a-zA-Z_?!+=<>@#$%^&*\/.\-]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-zA-Z_?!+=<>@#$%^&*\\/.\\-]");
          }
        }
        return result0;
      }
      
      function parse_string() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 34) {
            result1 = "\"";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"\\\"\"");
            }
          }
          if (result1 !== null) {
            result2 = [];
            if (/^[^"\n\r]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[^\"\\n\\r]");
              }
            }
            while (result3 !== null) {
              result2.push(result3);
              if (/^[^"\n\r]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[^\"\\n\\r]");
                }
              }
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 34) {
                result3 = "\"";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"\\\"\"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, s) {return s.join(""); })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_atom() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_validchar();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_validchar();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) {return chars.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse__() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = [];
        result1 = parse_ws();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_ws();
        }
        if (result0 !== null) {
          result2 = parse_comment();
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              result2 = parse_comment();
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_ws();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_ws();
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        if (result0 === null) {
          result0 = [];
          result1 = parse_ws();
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_ws();
          }
        }
        return result0;
      }
      
      function parse_ws() {
        var result0;
        
        if (/^[ \t\r\n]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\r\\n]");
          }
        }
        return result0;
      }
      
      function parse_comment() {
        var result0, result1, result2;
        var pos0;
        
        pos0 = pos;
        if (input.substr(pos, 2) === ";;") {
          result0 = ";;";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";;\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^\n\r]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\n\\r]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^\n\r]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\n\\r]");
              }
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_NumericLiteral() {
        var result0;
        var pos0;
        
        reportFailures++;
        pos0 = pos;
        result0 = parse_HexIntegerLiteral();
        if (result0 === null) {
          result0 = parse_DecimalLiteral();
        }
        if (result0 !== null) {
          result0 = (function(offset, literal) {
              return literal;
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("number");
        }
        return result0;
      }
      
      function parse_DecimalLiteral() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_DecimalIntegerLiteral();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_DecimalDigits();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = parse_ExponentPart();
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, before, after, exponent) {
              return parseFloat(before + "." + after + exponent);
            })(pos0, result0[0], result0[2], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.charCodeAt(pos) === 46) {
            result0 = ".";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result0 !== null) {
            result1 = parse_DecimalDigits();
            if (result1 !== null) {
              result2 = parse_ExponentPart();
              result2 = result2 !== null ? result2 : "";
              if (result2 !== null) {
                result0 = [result0, result1, result2];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, after, exponent) {
                return parseFloat("." + after + exponent);
              })(pos0, result0[1], result0[2]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_DecimalIntegerLiteral();
            if (result0 !== null) {
              result1 = parse_ExponentPart();
              result1 = result1 !== null ? result1 : "";
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, before, exponent) {
                  return parseFloat(before + exponent);
                })(pos0, result0[0], result0[1]);
            }
            if (result0 === null) {
              pos = pos0;
            }
          }
        }
        return result0;
      }
      
      function parse_DecimalIntegerLiteral() {
        var result0, result1;
        var pos0, pos1;
        
        if (input.charCodeAt(pos) === 48) {
          result0 = "0";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"0\"");
          }
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_NonZeroDigit();
          if (result0 !== null) {
            result1 = parse_DecimalDigits();
            result1 = result1 !== null ? result1 : "";
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, digit, digits) { return digit + digits; })(pos0, result0[0], result0[1]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_DecimalDigits() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_DecimalDigit();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_DecimalDigit();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) { return digits.join(""); })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_DecimalDigit() {
        var result0;
        
        if (/^[0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9]");
          }
        }
        return result0;
      }
      
      function parse_NonZeroDigit() {
        var result0;
        
        if (/^[1-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[1-9]");
          }
        }
        return result0;
      }
      
      function parse_ExponentPart() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_ExponentIndicator();
        if (result0 !== null) {
          result1 = parse_SignedInteger();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, indicator, integer) {
              return indicator + integer;
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_ExponentIndicator() {
        var result0;
        
        if (/^[eE]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[eE]");
          }
        }
        return result0;
      }
      
      function parse_SignedInteger() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[\-+]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\-+]");
          }
        }
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_DecimalDigits();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, sign, digits) { return sign + digits; })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_HexIntegerLiteral() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 48) {
          result0 = "0";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"0\"");
          }
        }
        if (result0 !== null) {
          if (/^[xX]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[xX]");
            }
          }
          if (result1 !== null) {
            result3 = parse_HexDigit();
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                result3 = parse_HexDigit();
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, digits) { return parseInt("0x" + digits.join("")); })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_HexDigit() {
        var result0;
        
        if (/^[0-9a-fA-F]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-fA-F]");
          }
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();

});

require.define("/node_modules/evalScheem.js", function (require, module, exports, __dirname, __filename) {
/*globals module, require, console, exports*/

var _ = require('underscore');
var util = require('util');

var debugF;

var initenv;

var lookup = function (env, v) {
  while (env) {
    debugF(env.vars)
    if (env.vars.hasOwnProperty(v) ) {
      return env.vars[v];
    } else {
      env = env.parent;
    }
  }
  throw "no such var " + v;
};

// pair up elements name : value
// {type: pair, name: name}, value
// reverse going down
var pair = function (elms, stack) {
  var i
    , n = elms.length
  ;
  
  if (n % 2 !== 0) {
    throw "pairing impossible with odd length " + n;
  }
  
  for (i = n-2; i >= 0 ; i -= 2) {
    stack.push({type : "pair", name : elms[i] }, elms[i+1]);
  }
};

var lambda = function (cur, lex) {
  if (cur.length > 3) {
    throw "too many arguments for lambda: (lambda _args _body)"
  }
  if (cur.length === 1) {
    return function () {};
  }
  if (cur.length === 2) { // no arguments
    cur[2] = cur[1];
    cur[1] = [];
  }
  return function (args, stack, values, env, self) {
    var newenv, v, a, i, n;
    stack.push({type: 'envChange', env : env});
    stack.push({type: 'fret'});
    values.unshift([]);
    stack.push(cur[2]);
    newenv = {vars : {}, parent : lex};
    v = newenv.vars;
    //add in args
    if (self) {
      v["this"] = self;
    }
    v["arguments"] = args; 
    a = cur[1];
    n = a.length;
    for (i = 0; i < n; i += 1) {
      v[a[i]] = args[i];
    }
    stack.push({type : 'envChange', env : newenv });
  };
};
 
var evalScheem = function (expr) {
  var cur, env, temp, hash
    , stack = [expr]
    , values = [[]]
  ;

  if (this && this.hasOwnProperty('debugS')) {
    debugF = console.log;
  } else {
    debugF = function () {};
  }

  //flag objects
  //var 
  
  //initial environment
  env = initenv();
    
  while (stack.length !== 0) {
    
    debugF(stack)
    
    cur = stack.pop();
    
    
        
    if (typeof cur === 'number') {
      values[0].push( cur );
    } else if (typeof cur === 'string') {
      values[0].push(lookup(env, cur) );
    } else if (_.isArray(cur) ) {
      //every list should finish with unshifting the array back and pushing on the value
      values.unshift([]);
      switch (cur[0]) {
        case 'quote' :
          values.shift(); // not useful
          values[0].push(cur[1]);
        break;
        case 'if' : 
          stack.push({type:'if', then : cur[2], 'el' : cur[3] });
          stack.push(cur[1]);
        break;
        case 'define' : 
          stack.push({type : 'define'});
          pair(cur.slice(1), stack);
        break;
        case 'set!' : 
          stack.push({type: 'set!'});
          pair(cur.slice(1), stack);
        break;
        case '#' : 
          stack.push({type : 'hash'});
          pair(cur.slice(1), stack);
        break;
        case 'lambda' : 
          values.shift();
          values[0].push(lambda(cur, env));
        break;
        case 'begin' :
          stack.push({type: 'begin', last : cur[cur.length-1]});
          stack.push.apply(stack, cur.slice(1, -1).reverse() );
        break;
        case 'let' :
          stack.push({type: 'let', body : cur[cur.length-1]});
          pair(cur.slice(1, -1), stack );
        break;
        default : //functions
          stack.push({type: 'f'});
          stack.push.apply(stack, cur.slice().reverse() ); //why does concat not work here? 
      }
    } else { // flag object
      debugF(cur)
      if (! cur.hasOwnProperty('type') ) {
        throw "bad object" + util.inspect(cur);
      }
      switch (cur.type) {
        case 'f' : 
          //values[0] should have f as the first and the arguments as the rest
          temp = values.shift();
          temp = temp[0]( temp.slice(1), stack, values, env );
          if (typeof temp !== "undefined") {
            //function returned, done
            values[0].push( temp ); //why is temp needed?
          } 
        break;
        case 'fret' :
          // function return values
          temp = values.shift();
          values[0].push( temp );
        break;
        case 'envChange' :  
          env = cur.env;
        break;
        case 'if' : 
          if (values[0][0] === '#t') {
            stack.push(cur.then);
          } else {
            stack.push(cur.el);
          }
          debugF('if', cur, stack)
          values.shift();
        break;
        case 'pair' :
          temp = values[0].pop();
          values[0].push( [cur.name, temp]);
        break;
        case 'define' : 
          temp = values.shift(); //pop off the paired values
          while (temp.length) {
            cur = temp.pop();
            if (env.vars.hasOwnProperty(cur[0])) {
              throw "variable already defined: " + cur[0];
            } else {
              env.vars[cur[0]] = cur[1];
            }
          }
        break;
        case 'set!' : 
        temp = values.shift(); //pop off the paired values
        while (temp.length) {
          cur = temp.pop();
          if (! env.vars.hasOwnProperty(cur[0])) {
            throw "variable not yet  defined: " + cur[0];
          } else {
            env.vars[cur[0]] = cur[1];
          }
        }
        break;
        case 'hash' : 
        temp = values.shift(); //pop off the paired values
        hash = {};
        while (temp.length) {
          cur = temp.pop();
          hash[cur[0]] = cur[1];
        }
        values[0].push(hash);
        break;
        case 'begin' :
          values.shift(); // no value for these lines
          stack.push(cur.last);
        break;
        case 'let' :
          temp = values.shift(); //pop off the paired values
          stack.push({type: 'envChange', env : env });
          stack.push(cur.body);
          // new environment;
          env = {
            vars : {},
            parent : env
          };
          while (temp.length) {
            cur = temp.pop();
            env.vars[cur[0]] = cur[1];
          }
        break;
     }
    }
  }
  
//  r.define('sum', ['begin', ['define', ]'let', 'x', 3, 'y', 5, ['+', 'x', 'y']])
  
  if (this.env) {
    return lookup(env, this.env);
  }
  return values[0][0];
  
};

initenv = function () {
  return {
    vars : {
      '+' :  function (arr) {      
        if (!arr || arr.length === 0) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 0; i < n; i += 1) {
          sum += arr[i];
        }
        return sum;
      },
      '-' : function (arr) {
        if (!arr || arr.length === 0) {
          throw "insufficient arguments -";
        }
        if (arr.length === 1) {
          return -1*arr[0]; // inconsistent behavior.
        }
        var i, sum = arr[0], n = arr.length;
        for (i = 1; i < n; i += 1) {
          sum -= arr[i];
        }
        return sum;        
      },
      '*': function (arr) {
        if (!arr || arr.length === 0) {
          throw "insufficient arguments *";
        }
        var i, n = arr.length, prod = 1;
        for (i = 0; i < n; i += 1) {
          prod *= arr[i];
        }
        return prod;
      },
      '/' : function (arr) {
        if (!arr || arr.length === 0) {
          throw "insufficient arguments /";
        }
        if (arr.length === 1) {
          return 1/arr[0]; // inconsistent behavior.
        }
        
        var i, n = arr.length, prod = arr[0];
        for (i = 1; i < n; i += 1) {
          prod /= arr[i];
        }
        return prod;
      },
      '%' : function (arr) {
        if (!arr || arr.length < 2) {
          throw "insufficient arguments %";
        } else if (arr.length > 2) {
          throw "too many arguments %";
        }
        return arr[0] % arr[1];
      },
      '^' : function (arr) {
        if (!arr || arr.length < 2) {
          throw "insufficient arguments ^";
        } else if (arr.length > 2) {
          throw "too many arguments ^";
        }
        return Math.pow(arr[0], arr[1]);
      }, 
      '.' :  function (arr, s, v, env) { // (. name prop1 'prop2  ) = name[prop1].prop2
        // arr = [hash, dude, prop2] where prop1 evaluates to dude
        var cur, i, n = arr.length, old;
        cur = arr[0];
        for (i = 1; i < n; i += 1) {
          old = cur;
          cur = cur[arr[i]];
        }
        if (_.isFunction(cur)) {
          return function (a, s, v, e) {  //adding this
            return cur(a, s, v, e, old);
          };
        }
        return cur; 
      }, 
      '=' : function (arr) {
        if (!arr || arr.length === 0 || arr.length === 1) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 1; i < n; i += 1) {
          if (arr[i-1] !== arr[i]) {
            return '#f'
          }
        }
        return '#t'; 
      },
      '<' : function (arr) {
        if (!arr || arr.length === 0 || arr.length === 1) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 1; i < n; i += 1) {
          if (arr[i-1] >= arr[i]) {
            return '#f'
          }
        }
        return '#t'; 
      },
      '>' : function (arr) {
        if (!arr || arr.length === 0 || arr.length === 1) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 1; i < n; i += 1) {
          if (arr[i-1] <= arr[i]) {
            return '#f'
          }
        }
        return '#t'; 
      },
      '<=' : function (arr) {
        if (!arr || arr.length === 0 || arr.length === 1) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 1; i < n; i += 1) {
          if (arr[i-1] > arr[i]) {
            return '#f'
          }
        }
        return '#t'; 
      },
      '>=' : function (arr) {
        if (!arr || arr.length === 0 || arr.length === 1) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 1; i < n; i += 1) {
          if (arr[i-1] < arr[i]) {
            return '#f'
          }
        }
        return '#t'; 
      },
      '!=' : function (arr) {
        if (!arr || arr.length === 0 || arr.length === 1) {
          throw "insufficient arguments +";
        }
        var i, sum = 0, n = arr.length;
        for (i = 1; i < n; i += 1) {
          if (arr[i-1] === arr[i]) {
            return '#f'
          }
        }
        return '#t'; 
      },
      //add 1st to list
      'cons' : function (arr) {
        arr[1].unshift(arr[0]);
        return arr[1];
      },
      'cdr' : function (arr) {
        return arr[0][0];
      },
      'car' : function (arr) {
        arr[0].shift();
        return arr[0]; 
      }
       
          
    },
    parent : null
  };
};


module.exports.evalScheem = evalScheem;
});

require.define("util", function (require, module, exports, __dirname, __filename) {
var events = require('events');

exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

});

require.define("events", function (require, module, exports, __dirname, __filename) {
if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

require.define("/runT.js", function (require, module, exports, __dirname, __filename) {
    /*globals module, require, console, exports*/

var _ = require('underscore');

var runT = require('run');

var suites = {
  add: function () {
    return runT.apply(null, arguments);
  },
  arith: function () {
    return runT.apply(null, arguments);
  },
  begin: function () {
    return runT.apply(null, arguments);
  },
  quote: function () {
    return runT.apply({
      debugS: 3
    }, arguments);
  },
  lambda: function () {
    return runT.apply(null, arguments);
  },
  ifel: function () {
    return runT.apply(null, arguments);
  },
  def: function () {
    return runT.apply(null, arguments);
  },
  let: function () {
    return runT.apply(null, arguments);
  },
  inequality: function () {
    return runT.apply(null, arguments);
  },
  recursion: function () {
    return runT.apply(null, arguments);
  },
  equality: function () {
    return runT.apply(null, arguments);
  },
  cons: function () {
    return runT.apply(null, arguments);
  },
  hash: function () {
    return runT.apply(null, arguments);
  }
};

_ = require("underscore");

util = require("util");

suite("add");

test("zero", function () {
  var flag = true;
  try {
    suites.add.apply(null, ['(+)']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments +")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("one", function () {
  var result = suites.add.apply(null, ['(+ 2)']);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  ['(+2)']");
  }
});

test("two", function () {
  var result = suites.add.apply(null, ['(+ 3 4)']);
  var pass = _.isEqual(result, 7);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "7" + "\n     Input:  ['(+34)']");
  }
});

test("three", function () {
  var result = suites.add.apply(null, ['(+ 3 4 5)']);
  var pass = _.isEqual(result, 12);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "12" + "\n     Input:  ['(+345)']");
  }
});

test("four", function () {
  var result = suites.add.apply(null, ['(+ 3 4 5 6)']);
  var pass = _.isEqual(result, 18);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "18" + "\n     Input:  ['(+3456)']");
  }
});

suite("arith");

test("(- 3 4)", function () {
  var result = suites.arith.apply(null, ['(- 3 4)']);
  var pass = _.isEqual(result, -1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "-1" + "\n     Input:  ['(-34)']");
  }
});

test("(* 5 6)", function () {
  var result = suites.arith.apply(null, ['(* 5 6)']);
  var pass = _.isEqual(result, 30);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "30" + "\n     Input:  ['(*56)']");
  }
});

test("(/ 8 4)", function () {
  var result = suites.arith.apply(null, ['(/ 8 4)']);
  var pass = _.isEqual(result, 2);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "2" + "\n     Input:  ['(/84)']");
  }
});

test("(^ 2 3)", function () {
  var result = suites.arith.apply(null, ['(^ 2 3)']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['(^23)']");
  }
});

test("(% 8 4)", function () {
  var result = suites.arith.apply(null, ['(% 8 4)']);
  var pass = _.isEqual(result, 0);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "0" + "\n     Input:  ['(%84)']");
  }
});

test("(% 3 4)", function () {
  var result = suites.arith.apply(null, ['(% 3 4)']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['(%34)']");
  }
});

suite("quote");

test("'(1 2 3)", function () {
  var result = suites.quote.apply(null, ['\'(1 2 3)']);
  var pass = _.isEqual(result, [1, 2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 2, 3 ]" + "\n     Input:  ['\'(123)']");
  }
});

test("'atom", function () {
  var result = suites.quote.apply(null, ['\'atom']);
  var pass = _.isEqual(result, 'atom');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'atom'" + "\n     Input:  ['\'atom']");
  }
});

suite("inequality");

test("(< 2 3)", function () {
  var result = suites.inequality.apply(null, ['(< 2 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<23)']");
  }
});

test("(< 2 3 4)", function () {
  var result = suites.inequality.apply(null, ['(< 2 3 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<234)']");
  }
});

test("(< 2 5 4)", function () {
  var result = suites.inequality.apply(null, ['(< 2 5 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(<254)']");
  }
});

test("(< 2)", function () {
  var flag = true;
  try {
    suites.inequality.apply(null, ['(< 2)']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "insufficient arguments +")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("(> 3 4)", function () {
  var result = suites.inequality.apply(null, ['(> 3 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(>34)']");
  }
});

test("(> 4 3)", function () {
  var result = suites.inequality.apply(null, ['(> 4 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(>43)']");
  }
});

test("(> 4 4)", function () {
  var result = suites.inequality.apply(null, ['(> 4 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(>44)']");
  }
});

test("(>= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(>= 3 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(>=34)']");
  }
});

test("(>= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(>= 4 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(>=43)']");
  }
});

test("(>= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(>= 4 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(>=44)']");
  }
});

test("(<= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(<= 3 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<=34)']");
  }
});

test("(<= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(<= 4 3)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(<=43)']");
  }
});

test("(<= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(<= 4 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(<=44)']");
  }
});

test("(= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(= 3 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(=34)']");
  }
});

test("(= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(= 4 3)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(=43)']");
  }
});

test("(= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(= 4 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(=44)']");
  }
});

test("(!= 3 4)", function () {
  var result = suites.inequality.apply(null, ['(!= 3 4)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(!=34)']");
  }
});

test("(!= 4 3)", function () {
  var result = suites.inequality.apply(null, ['(!= 4 3)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(!=43)']");
  }
});

test("(!= 4 4)", function () {
  var result = suites.inequality.apply(null, ['(!= 4 4)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(!=44)']");
  }
});

suite("equality");

test("(= 1 0)", function () {
  var result = suites.equality.apply(null, ['(= 1 0)']);
  var pass = _.isEqual(result, '#f');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#f'" + "\n     Input:  ['(=10)']");
  }
});

test("(= 1 1)", function () {
  var result = suites.equality.apply(null, ['(= 1 1)']);
  var pass = _.isEqual(result, '#t');
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "'#t'" + "\n     Input:  ['(=11)']");
  }
});

suite("recursion");

test("(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 3)", function () {
  var result = suites.recursion.apply(null, ['(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 3)']);
  var pass = _.isEqual(result, [6]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 6 ]" + "\n     Input:  ['(definefactorial(lambda(n)(if(=n0)1(*n(factorial(-n1))))))(factorial3)']");
  }
});

test("(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5)", function () {
  var result = suites.recursion.apply(null, ['(define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5)']);
  var pass = _.isEqual(result, [120]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 120 ]" + "\n     Input:  ['(definefactorial(lambda(n)(if(=n0)1(*n(factorial(-n1))))))(factorial5)']");
  }
});

suite("cons");

test("(cons 1 '(2 3))", function () {
  var result = suites.cons.apply(null, ['(cons 1 \'(2 3))']);
  var pass = _.isEqual(result, [1, 2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 1, 2, 3 ]" + "\n     Input:  ['(cons1\'(23))']");
  }
});

test("(cdr '(1 2 3))", function () {
  var result = suites.cons.apply(null, ['(cdr \'(1 2 3))']);
  var pass = _.isEqual(result, 1);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "1" + "\n     Input:  ['(cdr\'(123))']");
  }
});

test("(cdr '(5 2 3))", function () {
  var result = suites.cons.apply(null, ['(cdr \'(5 2 3))']);
  var pass = _.isEqual(result, 5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "5" + "\n     Input:  ['(cdr\'(523))']");
  }
});

test("(car '(1 2 3))", function () {
  var result = suites.cons.apply(null, ['(car \'(1 2 3))']);
  var pass = _.isEqual(result, [2, 3]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 2, 3 ]" + "\n     Input:  ['(car\'(123))']");
  }
});

suite("ifel");

test("(define x 3) (let x 2 (* x 4)) x", function () {
  var result = suites.ifel.apply(null, ['(define x 3) (let x 2 (* x 4)) x']);
  var pass = _.isEqual(result, 3);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "3" + "\n     Input:  ['(definex3)(letx2(*x4))x']");
  }
});

test("(define x 3) (let x 2 (* x 4))", function () {
  var result = suites.ifel.apply(null, ['(define x 3) (let x 2 (* x 4))']);
  var pass = _.isEqual(result, 8);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "8" + "\n     Input:  ['(definex3)(letx2(*x4))']");
  }
});

suite("def");

test("(define x 3) (set! x 5) x", function () {
  var result = suites.def.apply(null, ['(define x 3) (set! x 5) x']);
  var pass = _.isEqual(result, 5);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "5" + "\n     Input:  ['(definex3)(set!x5)x']");
  }
});

test("(define x 3) (set! y 5) x", function () {
  var flag = true;
  try {
    suites.def.apply(null, ['(define x 3) (set! y 5) x']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "variable not yet  defined: y")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

test("(define x 3) (define x 5) x", function () {
  var flag = true;
  try {
    suites.def.apply(null, ['(define x 3) (define x 5) x']);
  }
  catch (e) {
    flag = false;
    if (!_.isEqual(e.toString(), "variable already defined: x")) {
      throw new Error("wrong error", e);
    }
  }
  if (flag) {
    throw new Error("failed to throw error");
  }
});

suite("hash");

test("(# x 4 y 6)", function () {
  var result = suites.hash.apply(null, ['(# x 4 y 6)']);
  var pass = _.isEqual(result, {
    y: 6,
    x: 4
  });
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "{ y: 6, x: 4 }" + "\n     Input:  ['(#x4y6)']");
  }
});

test("(. (# x 4 y 6) 'y)", function () {
  var result = suites.hash.apply(null, ['(. (# x 4 y 6) \'y)']);
  var pass = _.isEqual(result, 6);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "6" + "\n     Input:  ['(.(#x4y6)\'y)']");
  }
});

test("(define x (# y 3 z (lambda (n) (+ (. this 'y) n)))) ((. x 'z) 5)", function () {
  var result = suites.hash.apply(null, ['(define x (# y 3 z (lambda (n) (+ (. this \'y) n)))) ((. x \'z) 5)']);
  var pass = _.isEqual(result, [8]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 8 ]" + "\n     Input:  ['(definex(#y3z(lambda(n)(+(.this\'y)n))))((.x\'z)5)']");
  }
});

test("(define x (# y 3 z (lambda (+ (. this 'y) (cdr arguments))))) ((. x 'z) 5)", function () {
  var result = suites.hash.apply(null, ['(define x (# y 3 z (lambda (+ (. this \'y) (cdr arguments))))) ((. x \'z) 5)']);
  var pass = _.isEqual(result, [8]);
  if (!pass) {
    throw new Error(util.inspect(result) + " not equal to " + "[ 8 ]" + "\n     Input:  ['(definex(#y3z(lambda(+(.this\'y)(cdrarguments)))))((.x\'z)5)']");
  }
});
});
require("/runT.js");
