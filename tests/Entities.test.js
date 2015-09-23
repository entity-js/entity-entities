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

require('entity-core');
require('entity-database');
require('entity-sanitizers');
require('entity-validators');

var async = require('async'),
    test = require('unit.js'),
    loader = require('nsloader'),
    Database = loader('Entity/Database'),
    Validators = loader('Entity/Validators'),
    Sanitizers = loader('Entity/Sanitizers'),
    Entities = loader('Entity/Entities'),
    Schema = loader('Entity/Entities/Schema'),
    Entity = loader('Entity/Entities/Entity'),
    ECantFindEntity = loader(
      'Entity/Entities/Errors/ECantFindEntity'
    );

var database, validators, sanitizers;

function createSchema(entities, done) {
  'use strict';

  var schema = new Schema(entities);
  schema.machineName = 'test';
  schema
    .addField(
      'title',
      'Title',
      'A title of this entity.',
      'String',
      {
        'default': ''
      }
    )
    .addFieldSanitization('title', 'trim')
    .addField(
      'description',
      'Description',
      'A description of this entity',
      'String'
    )
    .addField('subentity', 'Sub', 'A sub entity.', 'Entity')
    .addFieldValidation('subentity', 'entity', {
      type: 'test'
    })
    .save(function (err) {
      if (err) {
        return done(err);
      }

      return done(null, schema);
    });
}

describe('entity/Entities', function () {

  'use strict';

  beforeEach(function () {

    database = new Database();
    database.connect('test', {
      name: 'test',
      host: '0.0.0.0'
    }, true);

    validators = new Validators();
    sanitizers = new Sanitizers();

  });

  afterEach(function (done) {

    var queue = [];

    queue.push(function (next) {
      database.collection('schemas', 'test').drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      database.collection('entity-test', 'test').drop(function () {
        next();
      });
    });

    async.series(queue, function (err) {
      if (err) {
        return done(err);
      }

      database.disconnect('test');
      done();
    });

  });

  describe('Entities.schemas()', function () {

    it('shouldReturnAnEmptyArray', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        entities.schemas(function (err, schemas) {

          if (err) {
            return next(err);
          }

          test.array(
            schemas
          ).hasLength(0);

          next();

        });

      });

      async.series(queue, done);

    });

    it('ShouldReturnAnArrayWithSchemaName', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.schemas(function (err, schemas) {

          if (err) {
            return next(err);
          }

          test.array(
            schemas
          ).hasLength(1).is([{
            machineName: 'test',
            title: '',
            description: ''
          }]);

          next();

        });

      });

      async.series(queue, done);

    });

  });

  describe('Entities.schema()', function () {

    it('shouldThrowAnErrorIfTheSchemaIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          });

      entities.schema('test', function (err, schema) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      });

    });

    it('shouldReturnTheSchema', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.schema('test', function (err, schema) {

          test.value(
            err
          ).isNull();

          test.object(schema)
            .isInstanceOf(Schema)
            .hasKey('machineName', 'test');

          next();

        });

      });

      async.series(queue, done);

    });

  });

  describe('Entities.exists()', function () {

    it('shouldThrowAnErrorIfTheSchemaIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          });

      entities.exists('test', 'test', function (err, exists) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      });

    });

    it('shouldReturnFalseIfEntityDoesntExist', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.exists('test', 'test', function (err, exists) {

          test.value(
            err
          ).isNull();

          test.bool(
            exists
          ).isNotTrue();

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldReturnTrueIfEntityExists', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          schema,
          queue = [];

      queue.push(function (next) {

        createSchema(entities, function (err, s) {
          if (err) {
            return next(err);
          }

          schema = s;
          next();
        });

      });

      queue.push(function (next) {

        var entity = new Entity(entities, schema);
        entity.machineName = 'test';
        entity.save(next);

      });

      queue.push(function (next) {

        entities.exists('test', 'test', function (err, exists) {

          test.value(
            err
          ).isNull();

          test.bool(
            exists
          ).isTrue();

          next();

        });

      });

      async.series(queue, done);

    });

  });

  describe('Entities.count()', function () {

    it('shouldThrowAnErrorIfTheSchemaIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          });

      entities.count('test', function (err, count) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      });

    });

    it('shouldReturnZeroIfNoEntities', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.count('test', function (err, count) {

          test.value(
            err
          ).isNull();

          test.number(
            count
          ).is(0);

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldReturnTrueIfEntityExists', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          schema,
          queue = [];

      queue.push(function (next) {

        createSchema(entities, function (err, s) {
          if (err) {
            return next(err);
          }

          schema = s;
          next();
        });

      });

      queue.push(function (next) {

        var entity = new Entity(entities, schema);
        entity.machineName = 'test';
        entity.save(next);

      });

      queue.push(function (next) {

        entities.count('test', function (err, count) {

          test.value(
            err
          ).isNull();

          test.number(
            count
          ).is(1);

          next();

        });

      });

      async.series(queue, done);

    });

  });

  describe('Entities.create()', function () {

    it('shouldThrowAnErrorIfTheSchemaIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          });

      entities.create(function (err, entity) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      }, 'test');

    });

    it('shouldCreateTheEntity', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          test.value(
            err
          ).isNull();

          test.object(
            entity
          ).isInstanceOf(Entity);

          test.string(
            entity.type()
          ).is('test');

          next();

        }, 'test');

      });

      async.series(queue, done);

    });

  });

  describe('Entities.load()', function () {

    it('shouldThrowAnErrorIfTheSchemaIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          });

      entities.load('test', 'test', function (err, entity) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      }, 'test');

    });

    it('shouldThrowAnErrorIfTheEntityIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.load('test', 'test', function (err, entity) {

          test.object(
            err
          ).isInstanceOf(ECantFindEntity);

          test.value(
            entity
          ).isNull();

          done();

        });

      });

      async.series(queue, done);

    });

    it('shouldCreateTheEntityIfForced', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.load('test', 'test', function (err, entity) {

          test.value(
            err
          ).isNull();

          test.object(
            entity
          ).isInstanceOf(Entity);

          test.bool(
            entity.isNew
          ).isTrue();

          done();

        }, true);

      });

      async.series(queue, done);

    });

    it('shouldLoadTheEntity', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.load('test', 'test', function (err, entity) {

          if (err) {
            return next(err);
          }

          test.value(
            err
          ).isNull();

          test.object(
            entity
          ).isInstanceOf(Entity);

          test.bool(
            entity.isNew
          ).isNotTrue();

          test.string(
            entity.machineName
          ).is('test');

          next();

        });

      });

      async.series(queue, done);

    });

  });

  describe('Entities.find()', function () {

    it('shouldThrowAnErrorIfTheSchemaIsUndefined', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          });

      entities.find('test', {}, function (err, entities) {

        test.object(
          err
        ).isInstanceOf(ECantFindEntity);

        done();

      }, 'test');

    });

    it('shouldReturnEmptyArrayIfNoMatches', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.find('test', {}, function (err, entities) {

          test.value(
            err
          ).isNull();

          test.array(
            entities
          ).hasLength(0);

          done();

        });

      });

      async.series(queue, done);

    });

    it('shouldFindMultipleEntities', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test2';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test3';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'unknown4';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.find('test', {
          machineName: /test/
        }, function (err, entities) {

          if (err) {
            return next(err);
          }

          test.array(
            entities
          ).hasLength(3);

          test.object(entities[0])
            .isInstanceOf(Entity)
            .hasKey('machineName', 'test');

          test.object(entities[1])
            .isInstanceOf(Entity)
            .hasKey('machineName', 'test2');

          test.object(entities[2])
            .isInstanceOf(Entity)
            .hasKey('machineName', 'test3');

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldOrderResults', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test2';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test3';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'unknown4';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.find('test', {
          '$query': {
            machineName: /test/
          },
          '$orderby': {
            machineName: -1
          }
        }, function (err, entities) {

          if (err) {
            return next(err);
          }

          test.array(
            entities
          ).hasLength(3);

          test.object(entities[0])
            .hasKey('machineName', 'test3');

          test.object(entities[1])
            .hasKey('machineName', 'test2');

          test.object(entities[2])
            .hasKey('machineName', 'test');

          next();

        });

      });

      async.series(queue, done);

    });

    it('shouldLimitResults', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test2';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test3';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'unknown4';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.find('test', {
          // Nothing.
        }, function (err, entities, page, count, perPage, pages) {

          if (err) {
            return next(err);
          }

          test.array(
            entities
          ).hasLength(2);

          test.object(
            entities[0]
          ).hasKey('machineName', 'test');

          test.object(
            entities[1]
          ).hasKey('machineName', 'test2');

          test.number(
            page
          ).is(1);

          test.number(
            count
          ).is(4);

          test.number(
            perPage
          ).is(2);

          test.number(
            pages
          ).is(2);

          next();

        }, 2);

      });

      async.series(queue, done);

    });

    it('shouldPageResults', function (done) {

      var entities = new Entities({
            database: database,
            validators: validators,
            sanitizers: sanitizers
          }),
          queue = [];

      queue.push(function (next) {

        createSchema(entities, next);

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test2';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'test3';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.create(function (err, entity) {

          if (err) {
            return next(err);
          }

          entity.machineName = 'unknown4';
          entity.save(next);

        }, 'test');

      });

      queue.push(function (next) {

        entities.find('test', {
          // Nothing.
        }, function (err, entities, page, count, perPage, pages) {

          if (err) {
            return next(err);
          }

          test.array(
            entities
          ).hasLength(2);

          test.object(
            entities[0]
          ).hasKey('machineName', 'test3');

          test.object(
            entities[1]
          ).hasKey('machineName', 'unknown4');

          test.number(
            page
          ).is(2);

          test.number(
            count
          ).is(4);

          test.number(
            perPage
          ).is(2);

          test.number(
            pages
          ).is(2);

          next();

        }, 2, 2);

      });

      async.series(queue, done);

    });

  });

});
