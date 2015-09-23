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
 * Entity Core
 */

/**
 * The entities sanitizer rule.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var async = require('async'),
    loader = require('nsloader'),
    Entity = loader('Entity/Entities/Entity'),
    EUnexpectedFieldValue = loader(
      'Entity/Entities/Errors/EUnexpectedFieldValue'
    );

/**
 * Entities sanitizer.
 *
 * @param {Mixed} orig The original value.
 * @param {Mixed} value The value to santiize.
 * @param {Object} options The options passed to the sanitizer.
 * @param {Function} next The next callback.
 * @param {Error} next.err Any raised errors.
 * @throws {EInvalidValue} Thrown if the value is not a string.
 */
module.exports = function sanitizeEntities (orig, value, options, next) {
  'use strict';

  if (value instanceof Array === false && typeof value !== 'object') {
    return next(new EUnexpectedFieldValue());
  }

  var me = this,
      queue = [],
      entities = value instanceof Array ? [] : {};

  function loadEntity(idx, item) {
    return function (nxt) {
      if (item instanceof Entity) {
        (entities instanceof Array) ?
          entities.push(item) :
          entities[idx] = item;

        return nxt();
      }

      me.core.entityManager.load(
        item.type,
        item.machineName,
        function (err, entity) {
          if (err) {
            return nxt(err);
          }

          (entities instanceof Array) ?
            entities.push(entity) :
            entities[idx] = entity;

          nxt();
        }
      );
    };
  }

  for (var idx in value) {
    queue.push(loadEntity(idx, value[idx]));
  }

  async.series(queue, function (err) {
    if (err) {
      return next(err);
    }

    next(null, entities);
  });
};
