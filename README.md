# Unbreakable.js

Unbreakable is a [JavaScript Promise][js_promises] library that implements the
[JavaScript 2015 (ES6) Promises API][es6_promises] and conforms to the
[Promises/A+ specification][promises_aplus]. It differentiates itself from other
promise implementations by fully-encapsulating the state of promise objects.

The other promise implementations I looked at allow you to do something like
this:

```javascript
var promise = new Promise(function(resolve, reject) {
  // ...
});

promise._state = 'resolved';
promise._resolveValue = 'foo';

promise.then(function(value) {
  console.log(value); // foo
});
```

While I realize most everyone knows better than to do this, I wanted to create
a promise implementation that makes it impossible for anyone to improperly
mess with the state of a promise object. Thus, an Unbreakable promise's state is
inaccessible to the outside world and can only be modified via the callbacks
provided to its constructor argument as allowed by the promises spec.

[js_promises]: https://www.promisejs.org/
[es6_promises]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[promises_aplus]: https://promisesaplus.com/

## Usage

### Installation

```bash
npm install --save unbreakable
```

### Loading

If you're working on an ES6 project, you can import the ES6 source file
directly:

```javascript
import Promise from 'unbreakable/lib/Unbreakable';
```

If you're working on a non-ES6 project, you can load Unbreakable as a
transpiled [UMD module][umd] from the `dist/` directory.

[umd]: https://github.com/umdjs/umd

### API

Refer to [MDN's Guide to the ES6 Promise API][es6_promises], as this is the API
that Unbreakable implements.

## Development

If you wish to contribute to the development of Unbreakable, here are the things
to know.

### Running Tests

Unbreakable's tests are written with [tape][tape].

```bash
npm test
```

[tape]: https://github.com/substack/tape

### Running the Promises/A+ Spec

```bash
npm run spec
```

### Building Tests for the Browser

```bash
npm run build_tests
```

Then open `browser-tests.html` in your browser.

### Building Distribution File

```bash
npm run build
```

## License

MIT
