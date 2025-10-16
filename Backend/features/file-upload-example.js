// Add to package.json dependencies:
// "multer": "^1.4.5-lts.1",
// "cloudinary": "^1.41.0"

// New route: routes/upload.js
const express = require('express');
const multer = require('multer');
const router = express.Router();

// Upload student photos
const upload = multer({ dest: 'uploads/' });

router.post('/student-photo/:id', upload.single('photo'), async (req, res) => {
  try {
    // Save photo path to database
    await db.execute(
      'UPDATE students SET photo_url = ? WHERE id = ?',
      [req.file.path, req.params.id]
    );
    
    res.json({
      status: 'success',
      message: 'Photo uploaded successfully',
      photo_url: req.file.path
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Photo upload failed'
    });
  }
});

module.exports = router;