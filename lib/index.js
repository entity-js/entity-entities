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
 * Provides the entity manager component.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

var async = require('async'),
    loader = require('nsloader'),
    Schema = loader('Entity/Entities/Schema'),
    Entity = loader('Entity/Entities/Entity'),
    ECantFindEntity = loader(
      'Entity/Entities/Errors/ECantFindEntity'
    );

/**
 * The entity manager class.
 *
 * @class
 * @param {EntityCore} core The entity core object.
 */
function Entities(core) {
  'use strict';

  Object.defineProperties(this, {
    /**
     * The owning core object.
     *
     * @var {EntityCore} core
     * @memberof Entities
     * @readonly
     * @instance
     */
    core: {
      value: core
    },
    /**
     * Get the trash collection.
     *
     * @var {MongoDB#Collection} schemasCollection
     * @memberof Entities
     * @readonly
     * @instance
     */
    schemasCollection: {
      get: function () {
        return core.database.collection('schemas');
      }
    },
    /**
     * Get the trash collection.
     *
     * @var {MongoDB#Collection} trashCollection
     * @memberof Entities
     * @readonly
     * @instance
     */
    trashCollection: {
      get: function () {
        return core.database.collection('trash');
      }
    }
  });

  if (core.validators && core.validators.registered('entity') === false) {
    core.validators.register(
      'entity',
      loader('Entity/Entities/Validators/Entity')
    );

    core.validators.register(
      'entities',
      loader('Entity/Entities/Validators/Entities')
    );
  }

  if (core.sanitizers && core.sanitizers.registered('entity') === false) {
    core.sanitizers.register(
      'entity',
      loader('Entity/Entities/Sanitizers/Entity')
    );

    core.sanitizers.register(
      'entities',
      loader('Entity/Entities/Sanitizers/Entities')
    );
  }
}

/**
 * The available entity field types.
 *
 * @type {Object}
 * @static
 */
Entities.fieldTypes = {
  'Mixed': {
    title: 'Mixed',
    description: 'A field containing mixed data.',
    icon: 'mixed',
    type: null
  },
  'String': {
    title: 'String',
    description: 'A field containing a string.',
    icon: 'text',
    type: String
  },
  'Number': {
    title: 'Number',
    description: 'A field containing a number.',
    icon: 'number',
    type: Number
  },
  'Boolean': {
    title: 'Boolean',
    description: 'A field containing a yes/no option.',
    icon: 'boolean',
    type: Boolean
  },
  'Date': {
    title: 'Date',
    description: 'A field containing a date.',
    icon: 'date',
    type: Date
  },
  'Array': {
    title: 'Array',
    description: 'A field containing an array of data.',
    icon: 'array',
    type: Array
  },
  'Object': {
    title: 'Object',
    description: 'A field containing an object of data.',
    icon: 'object',
    type: Object
  },
  'Entity': {
    title: 'Entity',
    description: 'A field containing a reference to an entity.',
    icon: 'entity',
    type: Entity
  },
  'Entities': {
    title: 'Entities',
    description: 'An array or object of entities.',
    icon: 'entities',
    type: null
  }
};

/**
 * Get an array of registered schema details.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Array} done.schemas An array of found schemas.
 * @param {String} done.schemas[].machineName The machine name.
 * @param {String} done.schemas[].title The title.
 * @param {String} done.schemas[].description The description.
 */
Entities.prototype.schemas = function (done) {
  'use strict';

  this.schemasCollection.find({}, function (err, docs) {
    if (err) {
      return done(err);
    }

    var schemas = [];
    docs.forEach(function (item) {
      schemas.push({
        machineName: item.machineName,
        title: item.title || '',
        description: item.description || ''
      });
    });

    done(null, schemas);
  });
};

/**
 * Attempt to get a schema.
 *
 * @param {String} name The name of the schema.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Schema} done.schema The found schema.
 */
Entities.prototype.schema = function (name, done) {
  'use strict';

  var schema = new Schema(this);
  schema.machineName = name;
  schema.load(function (err) {
    if (err) {
      return done(err);
    }

    done(null, schema.isNew ? null : schema);
  });
};

/**
 * Determine if the schema and entity machine name already exists.
 *
 * @param {String} type The schema type.
 * @param {String} machineName The entity machine name.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Boolean} done.exists True if the entity and schema exists.
 */
Entities.prototype.exists = function (type, machineName, done) {
  'use strict';

  var me = this,
      queue = [],
      schema;

  queue.push(function (next) {
    me.schema(type, function (err, s) {
      if (err) {
        return next(err);
      }

      schema = s;
      next();
    });
  });

  async.series(queue, function (err) {
    if (err) {
      return done(err);
    }

    schema.entityCollection.count({
      machineName: machineName
    }, function (err, count) {
      done(err ? err : null, count > 0);
    });
  });
};

/**
 * Count the number of entities of a schema type.
 *
 * @param {String} type The schema type.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Integer} done.count The number of found entities.
 */
Entities.prototype.count = function (type, done) {
  'use strict';

  var me = this,
      queue = [],
      schema;

  queue.push(function (next) {
    me.schema(type, function (err, s) {
      if (err) {
        return next(err);
      }

      schema = s;
      next();
    });
  });

  async.series(queue, function (err) {
    if (err) {
      return done(err);
    }

    schema.entityCollection.count(function (err, count) {
      done(err ? err : null, count);
    });
  });
};

/**
 * Should create a new Entity of type.
 *
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Entity} done.entity The created entity.
 * @param {String} type The entity type to create.
 * @param {String} [subtype] The entity subtype.
 */
Entities.prototype.create = function (done, type, subtype) {
  'use strict';

  var me = this;
  this.schema(type, function (err, schema) {
    if (err) {
      return done(err);
    }

    done(null, new Entity(me, schema, subtype));
  });
};

/**
 * Loads an entity from the database.
 *
 * @param {String} type The entity type.
 * @param {String} machineName The entity machine name.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Entity} done.entity The loaded entity.
 * @param {Boolean} [force=false] If true this will return a created entity if
 *   the entity doesnt exist in the database rather than null.
 */
Entities.prototype.load = function (type, machineName, done, force) {
  'use strict';

  var me = this,
      queue = [],
      schema = null,
      entity = null;

  queue.push(function (next) {
    me.schema(type, function (err, s) {
      if (err) {
        return next(err);
      }

      schema = s;
      next();
    });
  });

  queue.push(function (next) {
    if (!schema) {
      return next(new Error());
    }

    entity = new Entity(me, schema);
    entity.machineName = machineName;
    entity.load(function (err) {
      if (err && err instanceof ECantFindEntity === false) {
        entity = null;
        return next(err);
      }

      if (err && err instanceof ECantFindEntity && force !== true) {
        entity = null;
        return next(err);
      }

      next();
    });
  });

  async.series(queue, function (err) {
    done(err ? err : null, entity);
  });
};

/**
 * Find some entities based on some conditions.
 *
 * @param {String} type The entity type.
 * @param {Object} conditions The find conditions to pass to MongoDB.
 * @param {Function} done The done callback.
 * @param {Error} done.err Any raised errors.
 * @param {Array} done.entities An array of found entities.
 * @param {Integer} done.page The page being returned.
 * @param {Integer} done.total The total number of entities.
 * @param {Integer} done.per The number of entities per page.
 * @param {Integer} done.pages The number of pages available.
 * @param {Integer} [per=25] The number of items per page, if 0 all items
 *   will be returned.
 * @param {Integer} [page=1] The page to return.
 */
Entities.prototype.find = function (type, conditions, done, per, page) {
  'use strict';

  per = Math.max(per || 25, 0);
  page = Math.max(page || 1, 1);

  var me = this,
      queue = [],
      queue2 = [],
      count,
      skip = per * (page - 1),
      pages,
      entities = [],
      schema = null,
      orderBy = conditions.$orderby || {};

  conditions = conditions.$query || conditions;

  function setupEntity(doc) {
    return function (next) {
      entities.push(new Entity(me, schema));
      entities[entities.length - 1]._setDoc(doc, next);
    };
  }

  queue.push(function (next) {
    me.schema(type, function (err, s) {
      if (err) {
        return next(err);
      }

      schema = s;
      next();
    });
  });

  queue.push(function (next) {
    schema.entityCollection.count(conditions, function (err, c) {
      if (err) {
        return next(err);
      }

      count = c;
      pages = Math.ceil(count / per);
      next();
    });
  });

  queue.push(function (next) {
    schema.entityCollection.find(conditions)
      .sort(orderBy)
      .limit(per)
      .skip(skip)
      .forEach(function (err, doc) {
        if (err) {
          return next(err);
        }

        if (!doc) {
          return next();
        }

        queue2.push(setupEntity(doc));
      });
  });

  queue.push(function (next) {
    async.series(queue2, next);
  });

  async.series(queue, function (err) {
    done(err ? err : null, entities, page, count, per, pages);
  });
};

/**
 * Exports the Entities class.
 */
module.exports = Entities;
