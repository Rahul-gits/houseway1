const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { body, param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { uploadMultiple, deleteFile, getFileUrl } = require('../middleware/upload');
const Client = require('../models/Client');
const Project = require('../models/Project');
const TimelineEvent = require('../models/TimelineEvent');

// Middleware to check client access
const checkClientAccess = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if user has access to this client
    const hasAccess = req.user.role === 'owner' ||
                     req.user.role === 'employee' ||
                     (req.user.role === 'client' && client._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this client'
      });
    }

    req.client = client;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Middleware to check project access
const checkProjectAccess = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const hasAccess = project.teamMembers.some(member =>
      member.user.toString() === req.user.id
    ) || project.createdBy.toString() === req.user.id || req.user.role === 'owner';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// POST /api/uploads/client/:clientId
// Upload files for a specific client
router.post('/client/:clientId', [
  auth,
  uploadMultiple('files', 10),
  param('clientId').isMongoId().withMessage('Invalid client ID'),
  body('category').optional().isIn(['profile', 'document', 'media', 'contract', 'other']).withMessage('Invalid category'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters')
], checkClientAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { category = 'document', description, tags = [] } = req.body;

    // Create file objects
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: getFileUrl(req, file.filename),
      category,
      description: description || '',
      tags,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      isActive: true
    }));

    // Add files to client's media gallery
    req.client.mediaGallery.push(...uploadedFiles);

    // Update client's lastActivity
    req.client.lastActivity = new Date();
    await req.client.save();

    res.status(201).json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        totalFiles: req.client.mediaGallery.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/uploads/project/:projectId
// Upload files for a specific project
router.post('/project/:projectId', [
  auth,
  uploadMultiple('files', 10),
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  body('category').optional().isIn(['plan', 'progress', 'completion', 'document', 'media', 'other']).withMessage('Invalid category'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters')
], checkProjectAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { category = 'document', description, tags = [] } = req.body;

    // Create file objects
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: getFileUrl(req, file.filename),
      category,
      description: description || '',
      tags,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      isActive: true
    }));

    // Add files to project's media gallery
    if (!req.project.mediaGallery) {
      req.project.mediaGallery = [];
    }
    req.project.mediaGallery.push(...uploadedFiles);

    // Update project's lastActivity
    req.project.lastActivity = new Date();
    await req.project.save();

    res.status(201).json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        totalFiles: req.project.mediaGallery.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/uploads/client/:clientId
// Get all files for a client with pagination and filtering
router.get('/client/:clientId', [
  auth,
  param('clientId').isMongoId().withMessage('Invalid client ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['profile', 'document', 'media', 'contract', 'other']).withMessage('Invalid category'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters')
], checkClientAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filter files
    let files = req.client.mediaGallery.filter(file => file.isActive);

    if (req.query.category) {
      files = files.filter(file => file.category === req.query.category);
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      files = files.filter(file =>
        searchRegex.test(file.originalName) ||
        searchRegex.test(file.description) ||
        file.tags.some(tag => searchRegex.test(tag))
      );
    }

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Pagination
    const total = files.length;
    const paginatedFiles = files.slice(skip, skip + limit);

    // Populate uploader information
    const uploaderIds = [...new Set(paginatedFiles.map(file => file.uploadedBy))];
    const uploaders = await User.find({ _id: { $in: uploaderIds } })
      .select('firstName lastName email avatar');

    const filesWithUploaders = paginatedFiles.map(file => ({
      ...file.toObject(),
      uploader: uploaders.find(user => user._id.toString() === file.uploadedBy.toString())
    }));

    res.json({
      success: true,
      data: {
        files: filesWithUploaders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/uploads/project/:projectId
// Get all files for a project with pagination and filtering
router.get('/project/:projectId', [
  auth,
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['plan', 'progress', 'completion', 'document', 'media', 'other']).withMessage('Invalid category'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters')
], checkProjectAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filter files
    let files = (req.project.mediaGallery || []).filter(file => file.isActive);

    if (req.query.category) {
      files = files.filter(file => file.category === req.query.category);
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      files = files.filter(file =>
        searchRegex.test(file.originalName) ||
        searchRegex.test(file.description) ||
        file.tags.some(tag => searchRegex.test(tag))
      );
    }

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Pagination
    const total = files.length;
    const paginatedFiles = files.slice(skip, skip + limit);

    // Populate uploader information
    const uploaderIds = [...new Set(paginatedFiles.map(file => file.uploadedBy))];
    const uploaders = await User.find({ _id: { $in: uploaderIds } })
      .select('firstName lastName email avatar');

    const filesWithUploaders = paginatedFiles.map(file => ({
      ...file.toObject(),
      uploader: uploaders.find(user => user._id.toString() === file.uploadedBy.toString())
    }));

    res.json({
      success: true,
      data: {
        files: filesWithUploaders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/uploads/client/:clientId/:fileId
// Delete a specific file from client gallery
router.delete('/client/:clientId/:fileId', [
  auth,
  param('clientId').isMongoId().withMessage('Invalid client ID'),
  param('fileId').isMongoId().withMessage('Invalid file ID')
], checkClientAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const fileIndex = req.client.mediaGallery.findIndex(
      file => file._id.toString() === req.params.fileId && file.isActive
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = req.client.mediaGallery[fileIndex];

    // Check if user can delete this file
    const canDelete = file.uploadedBy.toString() === req.user.id ||
                     req.user.role === 'owner' ||
                     req.user.role === 'employee';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this file'
      });
    }

    // Soft delete (mark as inactive)
    req.client.mediaGallery[fileIndex].isActive = false;
    req.client.mediaGallery[fileIndex].deletedAt = new Date();
    req.client.mediaGallery[fileIndex].deletedBy = req.user.id;

    // Optionally delete from filesystem
    const filePath = path.join('uploads/clients', file.filename);
    deleteFile(filePath);

    await req.client.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/uploads/project/:projectId/:fileId
// Delete a specific file from project gallery
router.delete('/project/:projectId/:fileId', [
  auth,
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  param('fileId').isMongoId().withMessage('Invalid file ID')
], checkProjectAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    if (!req.project.mediaGallery) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileIndex = req.project.mediaGallery.findIndex(
      file => file._id.toString() === req.params.fileId && file.isActive
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const file = req.project.mediaGallery[fileIndex];

    // Check if user can delete this file
    const canDelete = file.uploadedBy.toString() === req.user.id ||
                     req.user.role === 'owner' ||
                     req.project.createdBy.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this file'
      });
    }

    // Soft delete (mark as inactive)
    req.project.mediaGallery[fileIndex].isActive = false;
    req.project.mediaGallery[fileIndex].deletedAt = new Date();
    req.project.mediaGallery[fileIndex].deletedBy = req.user.id;

    // Optionally delete from filesystem
    const filePath = path.join('uploads/projects', file.filename);
    deleteFile(filePath);

    await req.project.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/uploads/client/:clientId/:fileId
// Update file metadata (description, tags, category)
router.put('/client/:clientId/:fileId', [
  auth,
  param('clientId').isMongoId().withMessage('Invalid client ID'),
  param('fileId').isMongoId().withMessage('Invalid file ID'),
  body('category').optional().isIn(['profile', 'document', 'media', 'contract', 'other']).withMessage('Invalid category'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters')
], checkClientAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const fileIndex = req.client.mediaGallery.findIndex(
      file => file._id.toString() === req.params.fileId && file.isActive
    );

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Update file metadata
    const file = req.client.mediaGallery[fileIndex];

    if (req.body.category !== undefined) {
      file.category = req.body.category;
    }

    if (req.body.description !== undefined) {
      file.description = req.body.description;
    }

    if (req.body.tags !== undefined) {
      file.tags = req.body.tags;
    }

    file.updatedAt = new Date();
    file.updatedBy = req.user.id;

    await req.client.save();

    res.json({
      success: true,
      message: 'File metadata updated successfully',
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/uploads/temp
// Upload temporary files (for preview before attaching to entities)
router.post('/temp', [
  auth,
  uploadMultiple('files', 5)
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: getFileUrl(req, file.filename),
      uploadedAt: new Date(),
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    res.status(201).json({
      success: true,
      message: `${req.files.length} file(s) uploaded temporarily`,
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/uploads/temp/:filename
// Delete temporary file
router.delete('/temp/:filename', [
  auth,
  param('filename').trim().isLength({ min: 1 }).withMessage('Filename is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const filePath = path.join('uploads/temp', req.params.filename);
    const deleted = deleteFile(filePath);

    if (deleted) {
      res.json({
        success: true,
        message: 'Temporary file deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/uploads/stats
// Get upload statistics for dashboard
router.get('/stats', [
  auth,
  query('type').optional().isIn(['client', 'project', 'timeline']).withMessage('Invalid type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const stats = {
      totalStorage: 0,
      totalFiles: 0,
      filesByType: {},
      filesByCategory: {}
    };

    // Calculate based on user role and access
    if (req.user.role === 'owner' || req.user.role === 'employee') {
      // Get all clients the user has access to
      const clients = await Client.find({
        isActive: true
      }).select('mediaGallery');

      clients.forEach(client => {
        client.mediaGallery.forEach(file => {
          if (file.isActive) {
            stats.totalStorage += file.size;
            stats.totalFiles += 1;

            const type = file.mimeType.split('/')[0] || 'other';
            stats.filesByType[type] = (stats.filesByType[type] || 0) + 1;
            stats.filesByCategory[file.category] = (stats.filesByCategory[file.category] || 0) + 1;
          }
        });
      });

      // Get all projects the user has access to
      const projects = await Project.find({
        isActive: true,
        $or: [
          { createdBy: req.user.id },
          { 'teamMembers.user': req.user.id }
        ]
      }).select('mediaGallery');

      projects.forEach(project => {
        if (project.mediaGallery) {
          project.mediaGallery.forEach(file => {
            if (file.isActive) {
              stats.totalStorage += file.size;
              stats.totalFiles += 1;

              const type = file.mimeType.split('/')[0] || 'other';
              stats.filesByType[type] = (stats.filesByType[type] || 0) + 1;
              stats.filesByCategory[file.category] = (stats.filesByCategory[file.category] || 0) + 1;
            }
          });
        }
      });
    } else if (req.user.role === 'client') {
      // Get only client's own files
      const client = await Client.findById(req.user.id).select('mediaGallery');

      if (client) {
        client.mediaGallery.forEach(file => {
          if (file.isActive) {
            stats.totalStorage += file.size;
            stats.totalFiles += 1;

            const type = file.mimeType.split('/')[0] || 'other';
            stats.filesByType[type] = (stats.filesByType[type] || 0) + 1;
            stats.filesByCategory[file.category] = (stats.filesByCategory[file.category] || 0) + 1;
          }
        });
      }
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;