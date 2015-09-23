/**
 *  ____            __        __
 * /\  _`\         /\ \__  __/\ \__
 * \ \ \L\_\    ___\ \ ,_\/\_\ \ ,_\  __  __
 *  \ \  _\L  /' _ `\ \ \/\/\ \ \ \/ /\ \/\ \
 *   \ \ \L\ \/\ \/\ \ \ \_\ \ \ \ \_\ \ \_\ \
 *    \ \____/\ \_\ \_\ \__\\ \_\ \__\\/`____ \
 *     \/___/  \/_/\/_/\/__/ \/_/\/__/ `/___/> \
 *                                        /\___/
 *                                        \/__/
 *
 * Entity Plugins
 */

var path = require('path'),
    fs = require('fs'),
    loader = require('nsloader');

// Allow access to the Entity index file.
loader.register('Entity/Entities', function () {
  'use strict';

  return path.resolve(path.join(__dirname, 'lib', 'index.js'));
});

// Allow access to anything after 'Entity'.
loader.register('Entity/Entities/*', function (ns) {
  'use strict';

  var filename = path.join(
    __dirname, 'lib', ns.substring('Entity/Entities/'.length)
  );

  if (fs.existsSync(filename + '.js')) {
    return filename + '.js';
  } else if (fs.existsSync(path.join(filename, 'index.js'))) {
    return path.join(filename, 'index.js');
  }

  return false;
});

/**
 * Export the middleware function.
 *
 * @param {EntityCore} core The Entity core object.
 */
module.exports = function (core) {
  'use strict';

  var Entities = loader('Entity/Entities');
  Object.defineProperty(core, 'entities', {
    value: new Entities(core)
  });
};
