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
 * Provides the Entity class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var util = require('util'),
    async = require('async'),
    loader = require('nsloader'),
    BaseEntity = loader('Entity/Entities/BaseEntity'),
    EUnknownSchemaField = loader(
      'Entity/Entities/Errors/EUnknownSchemaField'
    );

/**
 * The entity class.
 *
 * @class {Entity}
 * @extends {BaseEntity}
 * @param {Entities} manager The entity manager.
 * @param {Schema} schema The entity schema object.
 * @param {String} [subtype] A subtype of the entity type.
 */
function Entity (manager, schema, subtype) {
  'use strict';

  Entity.super_.call(this, manager);

  var _subtype = null,
      fieldData = {};

  Object.defineProperties(this, {
    /**
     * Get the entity subtype.
     *
     * @type {String}
     * @private
     */
    _subtype: {
      get: function () {
        return _subtype;
      },
      set: function (value) {
        _subtype = value;
      }
    },
    /**
     * Get the entity subtype.
     *
     * @type {String}
     * @readOnly
     */
    subtype: {
      get: function () {
        return _subtype;
      }
    },
    /**
     * Get the entity schema.
     *
     * @type {Schema}
     * @readOnly
     */
    schema: {
      value: schema
    },
    /**
     * The defined field data.
     *
     * @type {Object}
     * @private
     */
    _fieldData: {
      get: function () {
        return fieldData;
      },
      set: function (value) {
        fieldData = value;
      }
    }
  });

  if (manager && manager.core && manager.core.eventManager) {
    manager.core.eventManager.fire([
      'entity[' + this.type() + '].construct',
      'entity.construct'
    ], null, {
      entity: this
    });
  }
}

util.inherits(Entity, BaseEntity);

/**
 * Get the entity type of this entity.
 *
 * @return {String} The type of entity.
 */
Entity.prototype.type = function () {
  'use strict';

  return this.schema.machineName;
};

/**
 * @override
 */
Entity.prototype.collectionName = function () {
  'use strict';

  return this.schema.entityCollectionName();
};

/**
 * @override
 */
Entity.prototype._docToEntity = function (doc, done) {
  'use strict';

  var me = this;

  function load(field, idx, type, machineName) {
    return function (next) {
      me.manager.load(type, machineName, function (err, entity) {
        if (err) {
          return next(err);
        }

        if (idx === null) {
          me._fieldData[field] = entity;
        } else {
          me._fieldData[field][idx] = entity;
        }

        next();
      });
    };
  }

  function subload(type, field, value) {
    return function (next) {
      var queue = [];

      if (type === 'Entity') {
        queue.push(load(field, null, value.type, value.machineName));
      } else {
        for (var idx in value) {
          queue.push(load(field, idx, value[idx].type, value[idx].machineName));
        }
      }

      async.series(queue, next);
    };
  }

  Entity.super_.prototype._docToEntity.call(this, doc, function (err) {
    if (err) {
      return done(err);
    }

    var queue = [];

    me._suptype = doc.subtype;
    me._fieldData = doc.fieldData || {};

    for (var field in me._fieldData) {
      var fieldData = me.schema.getField(field);
      if (['Entity', 'Entities'].indexOf(fieldData.type) > -1) {
        queue.push(subload(
          fieldData.type,
          field,
          me._fieldData[field]
        ));
      }
    }

    async.series(queue, function (err) {
      done(err ? err : null);
    });
  });
};

/**
 * @override
 */
Entity.prototype._entityToDoc = function (by, done) {
  'use strict';

  var me = this;
  Entity.super_.prototype._entityToDoc.call(this, by, function (err, doc) {
    if (err) {
      return done(err);
    }

    doc.type = me.type();
    doc.subtype = me.subtype;

    doc.fieldData = {};
    for (var field in me._fieldData) {
      var fieldData = me.schema.getField(field);

      if (['Entity', 'Entities'].indexOf(fieldData.type) > -1) {
        if (me._fieldData[field] instanceof Entity) {
          doc.fieldData[field] = {
            type: me._fieldData[field].type(),
            subtype: me._fieldData[field].subtype,
            machineName: me._fieldData[field].machineName
          };
        } else if (me._fieldData[field] instanceof Array) {
          doc.fieldData[field] = [];
          for (var i = 0, len = me._fieldData[field].length; i < len; i++) {
            doc.fieldData[field][i] = {
              type: me._fieldData[field][i].type(),
              subtype: me._fieldData[field][i].subtype,
              machineName: me._fieldData[field][i].machineName
            };
          }
        } else {
          doc.fieldData[field] = {};
          for (var ename in me._fieldData[field]) {
            doc.fieldData[field][ename] = {
              type: me._fieldData[field][ename].type(),
              subtype: me._fieldData[field][ename].subtype,
              machineName: me._fieldData[field][ename].machineName
            };
          }
        }
      } else {
        doc.fieldData[field] = me._fieldData[field];
      }
    }

    done(null, doc);
  });
};

/**
 * Get a field value.
 *
 * @param {String} field The name of the field.
 * @return {Mixed} The fields value.
 * @throws {EUnknownSchemaField} If the field is not defined in the schema.
 */
Entity.prototype.get = function (field) {
  'use strict';

  if (this.schema.hasField(field) === false) {
    throw new EUnknownSchemaField(field);
  }

  if (this._fieldData[field] !== undefined) {
    return this._fieldData[field];
  }

  var config = this.schema.getField(field);
  if (config.options['default'] !== undefined) {
    return config.options['default'];
  }

  return null;
};

/**
 * Sets a field value.
 *
 * @param {String} field The name of the field.
 * @param {Mixed} value The value to set the field.
 * @param {Function} done The done callback.
 *   @param {Error} done.err Any raised errors.
 * @throws {EUnknownSchemaField} If the field is not defined in the schema.
 * @async
 */
Entity.prototype.set = function (field, value, done) {
  'use strict';

  if (this.schema.hasField(field) === false) {
    throw new EUnknownSchemaField(field);
  }

  done = typeof done === 'function' ? done : function () {};

  var me = this;
  this.schema.sanitizeField(field, value, function (err, orig, val) {
    if (err) {
      return done(err);
    }

    me._fieldData[field] = val;
    done(null);
  });
};

/**
 * Exports the Entity class.
 */
module.exports = Entity;
