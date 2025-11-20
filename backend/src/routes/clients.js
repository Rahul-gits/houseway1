const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');
const TimelineEvent = require('../models/TimelineEvent');
const Invoice = require('../models/Invoice');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Middleware to check if user has permission to manage clients
const canManageClients = (req, res, next) => {
  if (req.user.role === 'owner' ||
      (req.user.role === 'employee' && req.user.employeeDetails?.permissions?.canManageClients)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'Insufficient permissions to manage clients'
  });
};

// Get all clients with advanced filtering
router.get('/', auth, canManageClients, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags,
      assignedEmployee,
      clientType,
      riskScore,
      dateRange,
      ...filters
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Status filtering
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { tags: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex }
      ];
    }

    // Tags filtering
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Employee assignment filtering
    if (assignedEmployee) {
      query.assignedEmployee = assignedEmployee;
    }

    // Client type filtering
    if (clientType) {
      query.clientType = clientType;
    }

    // Risk score filtering
    if (riskScore) {
      query.riskScore = riskScore;
    }

    // Date range filtering
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate) {
        query.createdAt = { $gte: new Date(startDate) };
      }
      if (endDate) {
        query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
      }
    }

    // Apply additional filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && !['page', 'limit', 'status', 'search', 'sortBy', 'sortOrder', 'tags', 'assignedEmployee', 'clientType', 'riskScore', 'dateRange'].includes(key)) {
        query[key] = filters[key];
      }
    });

    // Sorting
    const sortOptions = {};
    const allowedSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'lastActivity', 'totalSpent', 'clientSince'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const clients = await Client.find(query)
      .populate('assignedEmployee', 'firstName lastName email phone')
      .populate('projects', 'name status')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Client.countDocuments(query);

    // Get dashboard summary stats
    const summary = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' }
        }
      }
    ]);

    const stats = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      summary: summary.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalSpent: stat.totalSpent
        };
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: clients,
      stats
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients',
      message: error.message
    });
  }
});

// Get client by ID with detailed information
router.get('/:id', auth, canManageClients, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedEmployee', 'firstName lastName email phone')
      .populate('projects', 'name status progress timeline.startDate timeline.expectedEndDate')
      .populate('timelineEvents', 'title eventType timestamp createdBy')
      .populate('invoices', 'invoiceNumber status totalAmount dueDate');

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Get recent timeline events (limit 10)
    const recentEvents = await TimelineEvent.find({
      client: req.params.id,
      isActive: true
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ timestamp: -1 })
      .limit(10);

    // Get client projects summary
    const projectsSummary = await Project.aggregate([
      { $match: { client: client._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget.estimated' }
        }
      }
    ]);

    // Get invoice summary
    const invoiceSummary = await Invoice.aggregate([
      { $match: { client: client._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        recentEvents,
        projectsSummary: projectsSummary.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalBudget: stat.totalBudget
          };
          return acc;
        }, {}),
        invoiceSummary: invoiceSummary.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount,
            totalPaid: stat.totalPaid
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client',
      message: error.message
    });
  }
});

// Create new client
router.post('/', auth, canManageClients, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      secondaryPhone,
      profileImage,
      clientType,
      preferredStyle,
      budgetRange,
      propertyType,
      assignedEmployee,
      tags,
      notes,
      ...otherFields
    } = req.body;

    // Check if email already exists
    const existingClient = await Client.findOne({ email: email.toLowerCase(), isActive: true });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Create client
    const client = new Client({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      secondaryPhone,
      profileImage,
      clientType,
      preferredStyle,
      budgetRange,
      propertyType,
      assignedEmployee,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(tag => tag.trim()) : [],
      internalNotes: notes,
      createdBy: req.user._id,
      lastActivity: new Date(),
      ...otherFields
    });

    await client.save();

    // Add to client history
    await client.addHistory('Client created', 'registration', req.user._id);

    // Update employee client count if assigned
    if (assignedEmployee) {
      await require('../models/User').findByIdAndUpdate(
        assignedEmployee,
        { $inc: { 'employeeDetails.clientCount': 1 } }
      );
    }

    // Populate references
    await client.populate('assignedEmployee', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: client,
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create client',
      message: error.message
    });
  }
});

// Update client
router.put('/:id', auth, canManageClients, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      secondaryPhone,
      profileImage,
      status,
      clientType,
      preferredStyle,
      budgetRange,
      propertyType,
      riskScore,
      assignedEmployee,
      tags,
      notes,
      ...otherFields
    } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Track old assigned employee for client count update
    const oldAssignedEmployee = client.assignedEmployee;

    // Update client
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v' && req.body[key] !== undefined) {
        client[key] = req.body[key];
      }
    });

    // Handle email change - check for duplicates
    if (email && email !== client.email) {
      const emailExists = await Client.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id },
        isActive: true
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
      client.email = email.toLowerCase();
    }

    // Handle tags
    if (tags) {
      client.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }

    // Handle status change
    const oldStatus = client.status;
    if (status && status !== oldStatus) {
      await client.updateStatus(status, req.user._id);
    }

    // Update last activity
    client.lastActivity = new Date();
    client.updatedBy = req.user._id;

    await client.save();

    // Update employee client counts
    if (oldAssignedEmployee && oldAssignedEmployee.toString() !== (assignedEmployee || '').toString()) {
      await require('../models/User').findByIdAndUpdate(
        oldAssignedEmployee,
        { $inc: { 'employeeDetails.clientCount': -1 } }
      );
    }

    if (assignedEmployee && assignedEmployee.toString() !== (oldAssignedEmployee || '').toString()) {
      await require('../models/User').findByIdAndUpdate(
        assignedEmployee,
        { $inc: { 'employeeDetails.clientCount': 1 } }
      );
    }

    // Populate references
    await client.populate('assignedEmployee', 'firstName lastName email');

    res.json({
      success: true,
      data: client,
      message: 'Client updated successfully'
    });

  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update client',
      message: error.message
    });
  }
});

// Delete (archive) client
router.delete('/:id', auth, canManageClients, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Archive client instead of hard delete
    client.isActive = false;
    client.archivedAt = new Date();
    client.voidReason = req.body.reason || 'Deleted by user';
    client.updatedBy = req.user._id;

    await client.save();

    // Update employee client count
    if (client.assignedEmployee) {
      await require('../models/User').findByIdAndUpdate(
        client.assignedEmployee,
        { $inc: { 'employeeDetails.clientCount': -1 } }
      );
    }

    // Add to client history
    await client.addHistory('Client archived', 'archival', req.user._id);

    res.json({
      success: true,
      message: 'Client archived successfully'
    });

  } catch (error) {
    console.error('Error archiving client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive client',
      message: error.message
    });
  }
});

// Get client projects
router.get('/:id/projects', auth, canManageClients, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const { page = 1, limit = 10, status } = req.query;

    const query = { client: req.params.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
      .populate('assignedEmployees', 'firstName lastName')
      .populate('assignedVendors', 'firstName lastName companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client projects',
      message: error.message
    });
  }
});

// Get client timeline events
router.get('/:id/timeline', auth, canManageClients, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    const { page = 1, limit = 20, eventType, isPublic = true, startDate, endDate } = req.query;

    const query = {
      client: req.params.id,
      isActive: true,
      isPublic: isPublic === 'true'
    };

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await TimelineEvent.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TimelineEvent.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching client timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client timeline',
      message: error.message
    });
  }
});

// Add internal note to client
router.post('/:id/notes', auth, canManageClients, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required'
      });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Add note to internal notes
    const currentDate = new Date().toISOString();
    const separator = '\n\n---\n';
    client.internalNotes = (client.internalNotes || '') +
      `${currentDate} - ${req.user.firstName} ${req.user.lastName}:\n${content}${separator}`;

    client.lastActivity = new Date();
    client.updatedBy = req.user._id;

    await client.save();

    // Add to client history
    await client.addHistory('Internal note added', 'note', req.user._id);

    res.json({
      success: true,
      message: 'Internal note added successfully'
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add note',
      message: error.message
    });
  }
});

// Get dashboard summary statistics
router.get('/summary', auth, canManageClients, async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Client statistics
    const clientStats = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // New clients in timeframe
    const newClients = await Client.countDocuments({
      isActive: true,
      clientSince: { $gte: startDate }
    });

    // At-risk clients
    const atRiskClients = await Client.countDocuments({
      isActive: true,
      status: 'at-risk'
    });

    // Financial summary
    const financialSummary = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: 'total',
          totalSpent: { $sum: '$totalSpent' },
          averageProjectValue: { $avg: '$averageProjectValue' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Project summary for clients
    const projectSummary = await Project.aggregate([
      {
        $match: {
          client: { $in: await Client.find({ isActive: true }).distinct('_id') },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Timeline events summary
    const timelineSummary = await TimelineEvent.aggregate([
      {
        $match: {
          client: { $in: await Client.find({ isActive: true }).distinct('_id') },
          isActive: true,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      timeframe,
      totalClients: clientStats.reduce((sum, stat) => sum + stat.count, 0),
      newClients,
      atRiskClients,
      clientStatusBreakdown: clientStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      financial: financialSummary[0] || { totalSpent: 0, averageProjectValue: 0, count: 0 },
      projects: projectSummary.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      timelineEvents: timelineSummary.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      dateRange: {
        startDate,
        endDate
      }
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
      message: error.message
    });
  }
});

// Export client data (CSV format)
router.get('/:id/export', auth, canManageClients, async (req, req) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('projects', 'name status budget')
      .populate('invoices', 'invoiceNumber status totalAmount');

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    // Prepare CSV data
    const csvData = {
      client: {
        id: client._id,
        name: `${client.firstName} ${client.lastName}`,
        email: client.email,
        phone: client.phone,
        status: client.status,
        clientSince: client.clientSince,
        totalSpent: client.totalSpent,
        clientType: client.clientType,
        propertyType: client.propertyType
      },
      projects: client.projects.map(project => ({
        name: project.name,
        status: project.status,
        estimatedBudget: project.budget?.estimated,
        actualBudget: project.budget?.actual,
        startDate: project.timeline?.startDate,
        expectedEndDate: project.timeline?.expectedEndDate,
        actualEndDate: project.timeline?.actualEndDate,
        progress: project.progress?.percentage
      })),
      invoices: client.invoices.map(invoice => ({
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        amount: invoice.totalAmount,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paidAmount: invoice.paidAmount
      }))
    };

    res.json({
      success: true,
      data: csvData,
      message: 'Client data exported successfully'
    });

  } catch (error) {
    console.error('Error exporting client data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export client data',
      message: error.message
    });
  }
});

module.exports = router;