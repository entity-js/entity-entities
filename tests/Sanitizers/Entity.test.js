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
    Entity = loader('Entity/Entities/Entity'),
    Schema = loader('Entity/Entities/Schema'),
    Entities = loader('Entity/Entities'),
    EntityRule = loader('Entity/Entities/Sanitizers/Entity'),
    EUnexpectedFieldValue = loader(
      'Entity/Entities/Errors/EUnexpectedFieldValue'
    ),
    EInvalidEntityType = loader(
      'Entity/Entities/Errors/EInvalidEntityType'
    );

var core, schema;

describe('entity/Entities/Sanitizers/Entity', function () {

  'use strict';

  beforeEach(function (done) {

    core = {};
    core.database = new Database();
    core.database.connect('test', {
      name: 'test',
      host: '0.0.0.0'
    }, true);

    core.validators = new Validators(core);
    core.sanitizers = new Sanitizers(core);
    core.sanitizers.register('entity', EntityRule);

    core.entities = new Entities(core);

    schema = new Schema(core.entities);
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
      .save(done);

  });

  afterEach(function (done) {

    var queue = [];

    queue.push(function (next) {
      core.database.collection('schemas', 'test').drop(function () {
        next();
      });
    });

    queue.push(function (next) {
      core.database.collection('entity-test', 'test').drop(function () {
        next();
      });
    });

    async.series(queue, function (err) {
      if (err) {
        return done(err);
      }

      core.database.disconnect('test');
      done();
    });

  });

  it('sanitizerShouldBeAvailable', function () {

    test.bool(
      core.sanitizers.registered('entity')
    ).isTrue();

  });

  it('shouldThrowAnEUnexpectedFieldValue', function (done) {

    var entity = {
          type: 'test'
        };

    core.sanitizers.sanitize(function (err, orig, value) {

      test.object(
        err
      ).isInstanceOf(EUnexpectedFieldValue);

      done();

    }, 'entity', entity, {
      type: 'test'
    });

  });

  it('shouldLoadEntity', function (done) {

    var testEntity,
        queue = [];

    queue.push(function (next) {

      core.entities.create(function (err, entity) {

        if (err) {
          return next(err);
        }

        testEntity = entity;
        testEntity.machineName = 'test-entity';
        testEntity.save(next);

      }, 'test');

    });

    queue.push(function (next) {

      core.sanitizers.sanitize(function (err, orig, value) {

        test.value(
          err
        ).isNull();

        test.object(
          orig
        ).is({
          type: 'test',
          machineName: 'test-entity'
        });

        test.object(value)
          .isInstanceOf(Entity)
          .hasKey('machineName', 'test-entity');

        next();

      }, 'entity', {
        type: 'test',
        machineName: 'test-entity'
      });

    });

    async.series(queue, done);

  });

  it('shouldAcceptTheEntity', function (done) {

    var testEntity,
        queue = [];

    queue.push(function (next) {

      core.entities.create(function (err, entity) {

        if (err) {
          return next(err);
        }

        testEntity = entity;
        testEntity.machineName = 'test-entity';
        testEntity.save(next);

      }, 'test');

    });

    queue.push(function (next) {

      core.sanitizers.sanitize(function (err, orig, value) {

        test.value(
          err
        ).isNull();

        test.object(value)
          .isInstanceOf(Entity)
          .hasKey('machineName', testEntity.machineName);

        done();

      }, 'entity', testEntity);

    });

    async.series(queue, done);

  });

});
