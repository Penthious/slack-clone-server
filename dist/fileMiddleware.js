'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _formidable = require('formidable');

var _formidable2 = _interopRequireDefault(_formidable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const uploadDir = 'files';

exports.default = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  const form = _formidable2.default.IncomingForm({
    uploadDir
  });

  return form.parse(req, (error, { operations }, files) => {
    if (error) {
      console.log(error);
    }

    const document = JSON.parse(operations);

    if (Object.keys(files).length) {
      const { file: { type, path } } = files;
      document.variables.file = {
        type,
        path
      };
    }

    req.body = document;
    return next();
  });
};