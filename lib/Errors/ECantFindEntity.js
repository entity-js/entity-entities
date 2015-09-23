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
 * Provides the ECantFindEntity error which is used when attempting to load an
 * entity which doesnt exist.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    loader = require('nsloader'),
    EError = loader('Entity/EError');

/**
 * Thrown when loading an entity which doesnt exist.
 *
 * @class {ECantFindEntity}
 * @extends {EError}
 * @param {String} collection The collection name.
 * @param {String} machineName The machine name being used.
 */
function ECantFindEntity (collection, machineName) {
  'use strict';

  ECantFindEntity.super_.call(this);

  /**
   * The collection name of the entity.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'collection', {
    value: collection
  });

  /**
   * The machine name used to attempt to load with.
   *
   * @type {String}
   */
  Object.defineProperty(this, 'machineName', {
    value: machineName
  });
}

util.inherits(ECantFindEntity, EError);

/**
 * Exports the ECantFindEntity class.
 */
module.exports = ECantFindEntity;
