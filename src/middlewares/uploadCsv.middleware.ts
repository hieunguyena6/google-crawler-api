import multer from 'multer';
import fs from 'fs';
const { v4: uuidv4 } = require('uuid');

const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes('csv')) {
    cb(null, true);
  } else {
    cb('Please upload only csv file.', false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdir('./uploads/csv', err => {
      cb(null, './uploads/csv');
    });
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});
export default multer({ storage: storage, fileFilter: csvFilter });
