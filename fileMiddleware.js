import formidable from 'formidable';

const uploadDir = 'files';

export default (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  const form = formidable.IncomingForm({
    uploadDir,
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
        path,
      };
    }

    req.body = document;
    return next();
  });
};
