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
    EUnknownFieldType = loader(
      'Entity/Entities/Errors/EUnknownFieldType'
    ),
    ESchemaFieldDefined = loader(
      'Entity/Entities/Errors/ESchemaFieldDefined'
    ),
    EUnknownSchemaField = loader(
      'Entity/Entities/Errors/EUnknownSchemaField'
    ),
    EUnknownSanitizer = loader(
      'Entity/Sanitizers/Errors/EUnknownSanitizer'
    ),
    EUnknownValidator = loader(
      'Entity/Validators/Errors/EUnknownValidator'
    );

var database, entities;

describe('entity/Entities/Schema', function () {

  'use strict';

  beforeEach(function (done) {

    database = new Database();
    database.connect('test', {
      name: 'test',
      host: '0.0.0.0'
    }, true);

    entities = new Entities({
      database: database,
      validators: new Validators(),
      sanitizers: new Sanitizers()
    });

    done();

  });

  afterEach(function (done) {

    database.collection('schemas', 'test').drop(function () {
      database.disconnect('test');
      done();
    });

  });

  describe('Schema.addField', function () {

    it('shouldThrowAnErrorIfTheFieldTypeIsUnknown', function () {

      var schema = new Schema(entities);

      test.error(function () {
        schema.addField(
          'test',
          'Test',
          'A test field.',
          'test',
          {}
        );
      }).isInstanceOf(EUnknownFieldType);

    });

    it('shouldAddField', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      test.object(
        schema._fields
      ).hasKey('test');

      test.object(schema._fields.test)
        .hasKey('type', 'String')
        .hasKey('title', 'Test')
        .hasKey('description', 'A test field.');

    });

    it('shouldThrowAnErrorIfTheFieldIsAlreadyDefined', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      test.error(function () {
        schema.addField(
          'test',
          'Test',
          'A test field.',
          'String',
          {}
        );
      }).isInstanceOf(ESchemaFieldDefined);

    });

  });

  describe('Schema.hasField()', function () {

    it('shouldReturnFalseIfNoFields', function () {

      var schema = new Schema(entities);

      test.bool(
        schema.hasField('test')
      ).isNotTrue();

    });

    it('shouldReturnTrueIfHasField', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      test.bool(
        schema.hasField('test')
      ).isTrue();

    });

  });

  describe('Schema.getField()', function () {

    it('shouldThrowAnErrorIfTheFieldDoesntExist', function () {

      var schema = new Schema(entities);

      test.error(function () {
        schema.getField('test');
      }).isInstanceOf(EUnknownSchemaField);

    });

    it('shouldReturnTheFieldConfig', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      test.object(schema.getField('test'))
        .hasKey('type', 'String')
        .hasKey('title', 'Test')
        .hasKey('description', 'A test field.');

    });

    it('shouldAlterTheFieldConfig', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      schema.getField('test').title = 'Hello';

      test.string(
        schema._fields.test.title
      ).is('Hello');

    });

  });

  describe('Schema.delField()', function () {

    it('shouldThrowAnErrorIfTheFieldDoesntExist', function () {

      var schema = new Schema(entities);

      test.error(function () {
        schema.delField('test');
      }).isInstanceOf(EUnknownSchemaField);

    });

    it('shouldDeleteTheField', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      schema.delField('test');

      test.value(
        schema._fields.test
      ).isUndefined();

    });

  });

  describe('Schema.fields', function () {

    it('shouldReturnAnEmptyArray', function () {

      var schema = new Schema(entities);

      test.array(
        schema.fields
      ).hasLength(0);

    });

    it('shouldReturnAnArrayOfNames', function () {

      var schema = new Schema(entities);

      schema.addField(
        'test',
        'Test',
        'A test field.',
        'String',
        {}
      );

      test.value(
        schema.fields
      ).hasLength(1).is(['test']);

    });

  });

  describe('Schema.addFieldSanitization()', function () {

    it('shouldThrowAnErrorIfTheFieldDoesntExist', function () {

      var schema = new Schema(entities);

      test.error(function () {
        schema.addFieldSanitization('test', 'test', {});
      }).isInstanceOf(EUnknownSchemaField);

    });

    it('shouldThrowAnErrorIfTheRuleDoesntExist', function () {

      var schema = new Schema(entities);

      schema.addField('test', 'Test', 'A test field.', 'String');

      test.error(function () {
        schema.addFieldSanitization('test', 'test');
      }).isInstanceOf(EUnknownSanitizer);

    });

    it('shouldAddTheRule', function (done) {

      var schema = new Schema(entities);

      schema
        .addField('test', 'Test', 'A test field.', 'String')
        .addFieldSanitization('test', 'trim');

      test.array(
        schema._fields.test.sanitizers
      ).hasLength(1);

      test.object(
        schema._fields.test.sanitizers[0]
      ).hasKey('rule', 'trim');

      done();

    });

  });

  describe('Schema.addFieldValidation()', function () {

    it('shouldThrowAnErrorIfTheFieldDoesntExist', function () {

      var schema = new Schema(entities);

      test.error(function () {
        schema.addFieldValidation('test', 'test', {});
      }).isInstanceOf(EUnknownSchemaField);

    });

    it('shouldThrowAnErrorIfTheRuleDoesntExist', function () {

      var schema = new Schema(entities);

      schema.addField('test', 'Test', 'A test field.', 'String');

      test.error(function () {
        schema.addFieldValidation('test', 'test');
      }).isInstanceOf(EUnknownValidator);

    });

    it('shouldAddTheRule', function (done) {

      var schema = new Schema(entities);

      schema
        .addField('test', 'Test', 'A test field.', 'String')
        .addFieldValidation('test', 'machine-name');

      test.array(
        schema._fields.test.validators
      ).hasLength(1);

      test.object(
        schema._fields.test.validators[0]
      ).hasKey('rule', 'machine-name');

      done();

    });

  });

  describe('Schema.sanitizeField()', function () {

    it('shouldThrowAnErrorIfTheFieldDoesntExist', function (done) {

      var schema = new Schema(entities);

      schema.sanitizeField('test', 'test value', function (err, value) {

        test.object(
          err
        ).isInstanceOf(EUnknownSchemaField);

        done();

      });

    });

    it('shouldSanitizeTheGivenValue', function (done) {

      var schema = new Schema(entities);

      schema
        .addField('test', 'Test', 'A test field.', 'String')
        .addFieldSanitization('test', 'trim');

      schema.sanitizeField('test', ' test value ', function (err, orig, value) {

        test.value(
          err
        ).isNull();

        test.string(
          orig
        ).is(' test value ');

        test.string(
          value
        ).is('test value');

        done();

      });

    });

  });

  describe('Schema.validateField()', function () {

    it('shouldThrowAnErrorIfTheFieldDoesntExist', function (done) {

      var schema = new Schema(entities);

      schema.validateField('test', 'test value', function (err, value) {

        test.object(
          err
        ).isInstanceOf(EUnknownSchemaField);

        done();

      });

    });

    it('shouldValidateTheGivenValue', function (done) {

      var schema = new Schema(entities);


      schema
        .addField('test', 'Test', 'A test field.', 'String')
        .addFieldSanitization('test', 'trim');

      schema.sanitizeField('test', ' test value ', function (err, orig, value) {

        test.value(
          err
        ).isNull();

        test.string(
          orig
        ).is(' test value ');

        test.string(
          value
        ).is('test value');

        done();

      });

    });

  });

  describe('Schema.save()', function () {

    it('shouldSave', function (done) {

      var schema = new Schema(entities),
          queue = [];

      schema.machineName = 'test';
      schema
        .addField('test', 'Test', 'A test field.', 'String')
        .addFieldSanitization('test', 'trim')
        .addFieldValidation('test', 'machine-name');

      queue.push(function (next) {

        schema.save(next);

      });

      queue.push(function (next) {

        schema.collection.find(function (err, docs) {

          if (err) {
            return next(err);
          }

          test.array(
            docs
          ).hasLength(1);

          test.object(
            docs[0]
          ).hasKey('machineName', 'test');

          next();

        });

      });

      queue.push(function (next) {

        schema = new Schema(entities);
        schema.machineName = 'test';
        schema.load(next);

      });

      queue.push(function (next) {

        test.string(
          schema.machineName
        ).is('test');

        test.object(
          schema.getField('test')
        ).is({
          type: 'String',
          title: 'Test',
          description: 'A test field.',
          options: {},
          validators: [{
            rule: 'machine-name',
            options: {},
            weight: 0
          }],
          sanitizers: [{
            rule: 'trim',
            options: {},
            weight: 0
          }]
        });

        next();

      });

      async.series(queue, done);

    });

  });

});

