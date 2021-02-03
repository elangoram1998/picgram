const multer = require('multer');

const upload = multer({
    fileFilter(req, file, cd) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|mp4)$/)) {
            return cd(new Error('Image format in not valid'));
        }
        cd(undefined, true);
    }
});

module.exports = upload;