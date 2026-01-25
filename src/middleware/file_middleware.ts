import multer from 'multer';
import path from 'path';

// Define where and how to save the images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        // Create a unique filename: timestamp + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

export default upload;

