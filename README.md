## lazycopy
This is a utility package that does only one thing: copy files in **glob** patterns to destination
and retain the relative directory structure.

It's called **lazycopy** because I never want to write another set of functions to copy files, and I don't want to use
**gulp** or **grunt** (or any other task runner) for automating my front-end builds :)

## Installation
`npm install lazycopy`

## Usage
```
const lazy = require('lazycopy');
```

## API
**copy(sources)**

Copies an array of sources to their destination, but does so asynchronously. Returns a `Promise` that will be
resolved when the copy operations have completed. *Rejects* promise if an error occurs while copying.

If the required folders do no exist in the **destination** path, they will be automatically created.

### Arguments
**sources** - An `Array` of objects containing the following properties:
- `src` - **required** - [Glob](https://github.com/isaacs/node-glob) pattern for file selection
- `dest` - **required** - Output folder where files will be copied to
- `cwd` - *optional* - Root where **lazycopy** will look for files to copy

Example:

```
// Copy files async (Promise-based)
lazy.copy([{
    src: './someFolder/**/**', // Give me all the files under "someFolder"
    dest: './destination',
    cwd: __dirname // (Optionally set CWD for scanning for files)
}]).then(() => {
    console.info('Done!');
}).catch((error) => {
    console.info('Something blew up.');
    console.error(error);
});
```

**copySync(sources)**
Performs a *synchronous* copy of files.

Example:

```
// Copy files synchronously
lazy.copySync([{
    src: './someFolder/**/**', // Give me all the files under "someFolder"
    dest: './destination',
    cwd: __dirname // (Optionally set CWD for scanning for files)
}]);
```