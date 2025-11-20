const express = require('express');
const router = express.Router();
const TimelineEvent = require('../models/TimelineEvent');
const Project = require('../models/Project');
const Client = require('../models/Client');
const User = require('../models/User');
const multer = require('multer');
const { body, param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/timeline/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'timeline-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

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

// GET /api/timeline/project/:projectId
// Get all timeline events for a project with filtering and pagination
router.get('/project/:projectId', [
  auth,
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('eventType').optional().isIn(['meeting', 'milestone', 'task', 'issue', 'note', 'photo', 'video', 'document', 'call', 'email', 'other']).withMessage('Invalid event type'),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
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

    // Build filter
    const filter = { project: req.params.projectId };

    if (req.query.eventType) {
      filter.eventType = req.query.eventType;
    }

    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.eventDate = {};
      if (req.query.startDate) {
        filter.eventDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.eventDate.$lte = new Date(req.query.endDate);
      }
    }

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
        { 'meetingDetails.attendees.name': searchRegex },
        { tags: searchRegex }
      ];
    }

    // Execute query with pagination
    const [timelineEvents, total] = await Promise.all([
      TimelineEvent.find(filter)
        .populate('createdBy', 'firstName lastName email avatar')
        .populate('attachments.uploadedBy', 'firstName lastName')
        .populate('meetingDetails.attendees.user', 'firstName lastName email')
        .populate('issueDetails.assignedTo', 'firstName lastName email')
        .sort({ eventDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TimelineEvent.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        timelineEvents,
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

// GET /api/timeline/:id
// Get a specific timeline event
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid timeline event ID')
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

    const timelineEvent = await TimelineEvent.findById(req.params.id)
      .populate('project', 'title client')
      .populate('client', 'firstName lastName companyName email')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('attachments.uploadedBy', 'firstName lastName')
      .populate('meetingDetails.attendees.user', 'firstName lastName email')
      .populate('issueDetails.assignedTo', 'firstName lastName email')
      .populate('notifications.recipients.user', 'firstName lastName email');

    if (!timelineEvent) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    // Check access permissions
    const hasAccess = timelineEvent.createdBy._id.toString() === req.user.id ||
                     timelineEvent.project.createdBy.toString() === req.user.id ||
                     req.user.role === 'owner' ||
                     (timelineEvent.project && timelineEvent.project.teamMembers.some(member =>
                       member.user.toString() === req.user.id));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this timeline event'
      });
    }

    res.json({
      success: true,
      data: timelineEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/timeline/project/:projectId
// Create a new timeline event
router.post('/project/:projectId', [
  auth,
  upload.array('attachments', 10),
  param('projectId').isMongoId().withMessage('Invalid project ID'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('eventType').isIn(['meeting', 'milestone', 'task', 'issue', 'note', 'photo', 'video', 'document', 'call', 'email', 'other']).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Invalid event date'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('location.address').optional().trim().isLength({ max: 200 }).withMessage('Location address must not exceed 200 characters'),
  body('location.coordinates.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.coordinates.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters'),
  body('isVisibleToClient').optional().isBoolean().withMessage('isVisibleToClient must be boolean'),
  body('notifications.sendEmail').optional().isBoolean().withMessage('sendEmail must be boolean'),
  body('notifications.sendPush').optional().isBoolean().withMessage('sendPush must be boolean'),
  body('notifications.recipients').optional().isArray().withMessage('Recipients must be an array'),
  body('notifications.recipients.*.user').optional().isMongoId().withMessage('Invalid recipient user ID'),
  body('notifications.recipients.*.type').optional().isIn(['to', 'cc', 'bcc']).withMessage('Invalid recipient type')
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

    const {
      title,
      description,
      eventType,
      eventDate,
      severity,
      location,
      tags,
      isVisibleToClient = false,
      notifications = {}
    } = req.body;

    // Create timeline event
    const timelineEvent = new TimelineEvent({
      project: req.params.projectId,
      client: req.project.client,
      title,
      description,
      eventType,
      eventDate: new Date(eventDate),
      severity: severity || 'medium',
      location: location || {},
      tags: tags || [],
      isVisibleToClient,
      createdBy: req.user.id,
      attachments: [],
      notifications: {
        sendEmail: notifications.sendEmail || false,
        sendPush: notifications.sendPush || false,
        recipients: notifications.recipients || []
      }
    });

    // Add meeting details if provided
    if (req.body.meetingDetails) {
      timelineEvent.meetingDetails = {
        ...req.body.meetingDetails,
        attendees: req.body.meetingDetails.attendees || []
      };
    }

    // Add issue details if provided
    if (req.body.issueDetails) {
      timelineEvent.issueDetails = {
        ...req.body.issueDetails,
        assignedTo: req.body.issueDetails.assignedTo || null,
        dueDate: req.body.issueDetails.dueDate ? new Date(req.body.issueDetails.dueDate) : null
      };
    }

    // Process file attachments
    if (req.files && req.files.length > 0) {
      timelineEvent.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/timeline/${file.filename}`,
        uploadedBy: req.user.id
      }));
    }

    await timelineEvent.save();

    // Update project's lastActivity
    req.project.lastActivity = new Date();
    await req.project.save();

    // Send notifications if requested
    if (notifications.sendEmail && timelineEvent.notifications.recipients.length > 0) {
      // TODO: Implement email notification service
      console.log('Email notifications would be sent to:', timelineEvent.notifications.recipients);
    }

    // Populate populated fields for response
    await timelineEvent.populate([
      { path: 'createdBy', select: 'firstName lastName email avatar' },
      { path: 'attachments.uploadedBy', select: 'firstName lastName' },
      { path: 'meetingDetails.attendees.user', select: 'firstName lastName email' },
      { path: 'issueDetails.assignedTo', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Timeline event created successfully',
      data: timelineEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/timeline/:id
// Update a timeline event
router.put('/:id', [
  auth,
  upload.array('attachments', 10),
  param('id').isMongoId().withMessage('Invalid timeline event ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('eventType').optional().isIn(['meeting', 'milestone', 'task', 'issue', 'note', 'photo', 'video', 'document', 'call', 'email', 'other']).withMessage('Invalid event type'),
  body('eventDate').optional().isISO8601().withMessage('Invalid event date'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isVisibleToClient').optional().isBoolean().withMessage('isVisibleToClient must be boolean')
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

    const timelineEvent = await TimelineEvent.findById(req.params.id);

    if (!timelineEvent) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    // Check if user can edit this event
    const canEdit = timelineEvent.createdBy.toString() === req.user.id ||
                   req.user.role === 'owner' ||
                   req.user.role === 'employee';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to edit this timeline event'
      });
    }

    // Update fields
    const updates = [
      'title', 'description', 'eventType', 'eventDate', 'severity',
      'location', 'tags', 'isVisibleToClient'
    ];

    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        timelineEvent[field] = field === 'eventDate' ? new Date(req.body[field]) : req.body[field];
      }
    });

    // Update meeting details if provided
    if (req.body.meetingDetails) {
      timelineEvent.meetingDetails = {
        ...timelineEvent.meetingDetails,
        ...req.body.meetingDetails
      };
    }

    // Update issue details if provided
    if (req.body.issueDetails) {
      timelineEvent.issueDetails = {
        ...timelineEvent.issueDetails,
        ...req.body.issueDetails,
        dueDate: req.body.issueDetails.dueDate ? new Date(req.body.issueDetails.dueDate) : timelineEvent.issueDetails.dueDate
      };
    }

    // Add new attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/timeline/${file.filename}`,
        uploadedBy: req.user.id
      }));

      timelineEvent.attachments.push(...newAttachments);
    }

    timelineEvent.updatedAt = new Date();
    await timelineEvent.save();

    // Update project's lastActivity
    const project = await Project.findById(timelineEvent.project);
    if (project) {
      project.lastActivity = new Date();
      await project.save();
    }

    await timelineEvent.populate([
      { path: 'createdBy', select: 'firstName lastName email avatar' },
      { path: 'attachments.uploadedBy', select: 'firstName lastName' },
      { path: 'meetingDetails.attendees.user', select: 'firstName lastName email' },
      { path: 'issueDetails.assignedTo', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Timeline event updated successfully',
      data: timelineEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/timeline/:id
// Delete a timeline event
router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid timeline event ID')
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

    const timelineEvent = await TimelineEvent.findById(req.params.id);

    if (!timelineEvent) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    // Check if user can delete this event
    const canDelete = timelineEvent.createdBy.toString() === req.user.id ||
                     req.user.role === 'owner';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this timeline event'
      });
    }

    // Soft delete by marking as inactive
    timelineEvent.isActive = false;
    timelineEvent.updatedAt = new Date();
    await timelineEvent.save();

    res.json({
      success: true,
      message: 'Timeline event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/timeline/:eventId/attachment/:attachmentId
// Remove a specific attachment from a timeline event
router.delete('/:eventId/attachment/:attachmentId', [
  auth,
  param('eventId').isMongoId().withMessage('Invalid timeline event ID'),
  param('attachmentId').isMongoId().withMessage('Invalid attachment ID')
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

    const timelineEvent = await TimelineEvent.findById(req.params.eventId);

    if (!timelineEvent) {
      return res.status(404).json({
        success: false,
        message: 'Timeline event not found'
      });
    }

    // Check permissions
    const canEdit = timelineEvent.createdBy.toString() === req.user.id ||
                   req.user.role === 'owner' ||
                   req.user.role === 'employee';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to edit this timeline event'
      });
    }

    // Remove attachment
    const attachmentIndex = timelineEvent.attachments.findIndex(
      att => att._id.toString() === req.params.attachmentId
    );

    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    timelineEvent.attachments.splice(attachmentIndex, 1);
    timelineEvent.updatedAt = new Date();
    await timelineEvent.save();

    res.json({
      success: true,
      message: 'Attachment removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/timeline/dashboard/summary
// Get timeline summary for dashboard
router.get('/dashboard/summary', [
  auth,
  query('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365')
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

    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build match stage
    const matchStage = {
      isActive: true,
      createdAt: { $gte: startDate }
    };

    // If specific project is requested, check access
    if (req.query.projectId) {
      const project = await Project.findById(req.query.projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const hasAccess = project.teamMembers.some(member =>
        member.user.toString() === req.user.id
      ) || project.createdBy.toString() === req.user.id || req.user.role === 'owner';

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }

      matchStage.project = req.query.projectId;
    } else {
      // Get all projects the user has access to
      const userProjects = await Project.find({
        $or: [
          { createdBy: req.user.id },
          { 'teamMembers.user': req.user.id }
        ]
      }).select('_id');

      matchStage.project = { $in: userProjects.map(p => p._id) };
    }

    // Aggregation pipeline for summary
    const summary = await TimelineEvent.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          eventsByType: {
            $push: {
              type: '$eventType',
              count: 1
            }
          },
          eventsBySeverity: {
            $push: {
              severity: '$severity',
              count: 1
            }
          },
          recentEvents: {
            $push: {
              title: '$title',
              eventType: '$eventType',
              eventDate: '$eventDate',
              createdAt: '$createdAt'
            }
          }
        }
      },
      {
        $project: {
          totalEvents: 1,
          eventsByType: {
            $arrayToObject: {
              $map: {
                input: { $groupBy: '$eventsByType', key: 'type' },
                as: 'type',
                in: { k: '$$type._id', v: { $sum: '$$type.count' } }
              }
            }
          },
          eventsBySeverity: {
            $arrayToObject: {
              $map: {
                input: { $groupBy: '$eventsBySeverity', key: 'severity' },
                as: 'severity',
                in: { k: '$$severity._id', v: { $sum: '$$severity.count' } }
              }
            }
          },
          recentEvents: {
            $slice: [
              { $sortArray: { input: '$recentEvents', sortBy: { createdAt: -1 } } },
              5
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: summary[0] || {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        recentEvents: []
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

module.exports = router;