const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Client = require('../models/Client');
const User = require('../models/User');
const { body, param, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Middleware to check invoice access
const checkInvoiceAccess = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if user has access to this invoice
    const hasAccess = invoice.createdBy.toString() === req.user.id ||
                     req.user.role === 'owner' ||
                     (req.user.role === 'client' && invoice.client.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this invoice'
      });
    }

    req.invoice = invoice;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Middleware to check project access for invoice creation
const checkProjectAccess = async (req, res, next) => {
  try {
    const project = await Project.findById(req.body.project || req.params.projectId);
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

// GET /api/invoices
// Get all invoices with filtering, pagination, and search
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  query('type').optional().isIn(['project', 'retainer', 'milestone', 'expense', 'other']).withMessage('Invalid invoice type'),
  query('clientId').optional().isMongoId().withMessage('Invalid client ID'),
  query('projectId').optional().isMongoId().withMessage('Invalid project ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = { isActive: true };

    if (req.user.role === 'client') {
      filter.client = req.user.id;
    } else if (req.user.role !== 'owner') {
      // For employees, get invoices they created or for projects they're assigned to
      const userProjects = await Project.find({
        'teamMembers.user': req.user.id
      }).select('_id');

      filter.$or = [
        { createdBy: req.user.id },
        { project: { $in: userProjects.map(p => p._id) } }
      ];
    }

    // Apply additional filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.invoiceType = req.query.type;
    }

    if (req.query.clientId) {
      filter.client = req.query.clientId;
    }

    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.issueDate = {};
      if (req.query.startDate) {
        filter.issueDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.issueDate.$lte = new Date(req.query.endDate);
      }
    }

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { invoiceNumber: searchRegex },
        { 'lineItems.description': searchRegex },
        { notes: searchRegex },
        { clientNotes: searchRegex }
      ];
    }

    // Execute query with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('client', 'firstName lastName companyName email')
        .populate('project', 'title')
        .populate('createdBy', 'firstName lastName email')
        .populate('payments.transactionId', 'paymentMethod amount status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        invoices,
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

// GET /api/invoices/:id
// Get a specific invoice
router.get('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid invoice ID')
], checkInvoiceAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName companyName email phone billingAddress')
      .populate('project', 'title description')
      .populate('createdBy', 'firstName lastName email')
      .populate('lineItems.project', 'title')
      .populate('lineItems.task', 'title')
      .populate('payments.transactionId', 'paymentMethod amount status createdAt')
      .populate('history.updatedBy', 'firstName lastName');

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/invoices
// Create a new invoice
router.post('/', [
  auth,
  body('client').isMongoId().withMessage('Invalid client ID'),
  body('project').optional().isMongoId().withMessage('Invalid project ID'),
  body('invoiceType').isIn(['project', 'retainer', 'milestone', 'expense', 'other']).withMessage('Invalid invoice type'),
  body('issueDate').isISO8601().withMessage('Invalid issue date'),
  body('dueDate').isISO8601().withMessage('Invalid due date'),
  body('lineItems').isArray({ min: 1 }).withMessage('Line items must be a non-empty array'),
  body('lineItems.*.description').trim().isLength({ min: 1, max: 500 }).withMessage('Each line item description must be 1-500 characters'),
  body('lineItems.*.quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('lineItems.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('lineItems.*.type').optional().isIn(['service', 'product', 'expense', 'other']).withMessage('Invalid line item type'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('taxAmount').isFloat({ min: 0 }).withMessage('Tax amount must be a positive number'),
  body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a positive number'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  body('clientNotes').optional().trim().isLength({ max: 1000 }).withMessage('Client notes must not exceed 1000 characters'),
  body('paymentTerms').optional().isIn(['net15', 'net30', 'net60', 'dueOnReceipt', 'custom']).withMessage('Invalid payment terms'),
  body('lateFee').optional().isFloat({ min: 0 }).withMessage('Late fee must be a positive number'),
  body('lateFeeType').optional().isIn(['fixed', 'percentage']).withMessage('Invalid late fee type'),
  body('allowOnlinePayment').optional().isBoolean().withMessage('allowOnlinePayment must be boolean'),
  body('sendToClient').optional().isBoolean().withMessage('sendToClient must be boolean')
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
      client,
      project,
      invoiceType,
      issueDate,
      dueDate,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount = 0,
      totalAmount,
      currency = 'USD',
      notes,
      clientNotes,
      paymentTerms = 'net30',
      lateFee = 0,
      lateFeeType = 'fixed',
      allowOnlinePayment = false,
      sendToClient = false,
      recurringSettings
    } = req.body;

    // Generate unique invoice number
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const invoiceCount = await Invoice.countDocuments({
      invoiceNumber: new RegExp(`^INV-${year}-${month}`)
    });
    const invoiceNumber = `INV-${year}-${month}-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      client,
      project: project || null,
      invoiceType,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      lineItems: lineItems.map(item => ({
        ...item,
        task: item.task || null,
        project: item.project || null
      })),
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      currency,
      notes: notes || '',
      clientNotes: clientNotes || '',
      paymentTerms,
      lateFee,
      lateFeeType,
      allowOnlinePayment,
      status: sendToClient ? 'sent' : 'draft',
      clientPortalAccess: allowOnlinePayment,
      createdBy: req.user.id,
      history: [{
        action: sendToClient ? 'sent' : 'created',
        updatedAt: new Date(),
        updatedBy: req.user.id,
        details: sendToClient ? 'Invoice created and sent to client' : 'Invoice created as draft'
      }]
    });

    // Add recurring settings if provided
    if (recurringSettings) {
      invoice.recurring = {
        enabled: recurringSettings.enabled || false,
        frequency: recurringSettings.frequency,
        interval: recurringSettings.interval,
        nextDate: recurringSettings.nextDate ? new Date(recurringSettings.nextDate) : null,
        endDate: recurringSettings.endDate ? new Date(recurringSettings.endDate) : null,
        maxOccurrences: recurringSettings.maxOccurrences || null,
        occurrences: 0
      };
    }

    await invoice.save();

    // Send email to client if requested
    if (sendToClient) {
      // TODO: Implement email service
      console.log('Invoice would be sent to client:', client);
    }

    // Populate fields for response
    await invoice.populate([
      { path: 'client', select: 'firstName lastName companyName email' },
      { path: 'project', select: 'title' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/invoices/:id
// Update an invoice
router.put('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid invoice ID'),
  body('issueDate').optional().isISO8601().withMessage('Invalid issue date'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  body('lineItems').optional().isArray({ min: 1 }).withMessage('Line items must be a non-empty array'),
  body('lineItems.*.description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Each line item description must be 1-500 characters'),
  body('lineItems.*.quantity').optional().isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('lineItems.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('subtotal').optional().isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  body('taxAmount').optional().isFloat({ min: 0 }).withMessage('Tax amount must be a positive number'),
  body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a positive number'),
  body('totalAmount').optional().isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  body('clientNotes').optional().trim().isLength({ max: 1000 }).withMessage('Client notes must not exceed 1000 characters'),
  body('status').optional().isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status')
], checkInvoiceAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const invoice = req.invoice;

    // Check if user can edit this invoice
    const canEdit = invoice.createdBy.toString() === req.user.id ||
                   req.user.role === 'owner' ||
                   req.user.role === 'employee';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to edit this invoice'
      });
    }

    // Don't allow editing paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit paid invoices'
      });
    }

    // Track changes for history
    const oldStatus = invoice.status;
    const updates = [];

    // Update fields
    const editableFields = [
      'issueDate', 'dueDate', 'lineItems', 'subtotal', 'taxAmount',
      'discountAmount', 'totalAmount', 'notes', 'clientNotes', 'status'
    ];

    editableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'status' && req.body[field] !== oldStatus) {
          updates.push({
            action: `status_changed_${req.body[field]}`,
            details: `Status changed from ${oldStatus} to ${req.body[field]}`
          });
        }
        invoice[field] = field.includes('Date') ? new Date(req.body[field]) : req.body[field];
      }
    });

    // Add history entry
    if (updates.length > 0 || Object.keys(req.body).length > 0) {
      invoice.history.push({
        action: 'updated',
        updatedAt: new Date(),
        updatedBy: req.user.id,
        details: updates.length > 0 ? updates[0].details : 'Invoice details updated'
      });
    }

    invoice.updatedAt = new Date();
    await invoice.save();

    // Populate fields for response
    await invoice.populate([
      { path: 'client', select: 'firstName lastName companyName email' },
      { path: 'project', select: 'title' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'history.updatedBy', select: 'firstName lastName' }
    ]);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/invoices/:id
// Delete an invoice (soft delete)
router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid invoice ID')
], checkInvoiceAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const invoice = req.invoice;

    // Check if user can delete this invoice
    const canDelete = invoice.createdBy.toString() === req.user.id ||
                     req.user.role === 'owner';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this invoice'
      });
    }

    // Don't allow deleting paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid invoices'
      });
    }

    // Soft delete
    invoice.isActive = false;
    invoice.updatedAt = new Date();
    invoice.history.push({
      action: 'deleted',
      updatedAt: new Date(),
      updatedBy: req.user.id,
      details: 'Invoice deleted'
    });

    await invoice.save();

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/invoices/:id/payments
// Add a payment to an invoice
router.post('/:id/payments', [
  auth,
  param('id').isMongoId().withMessage('Invalid invoice ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be greater than 0'),
  body('paymentMethod').isIn(['cash', 'check', 'bank_transfer', 'credit_card', 'online', 'other']).withMessage('Invalid payment method'),
  body('paymentDate').isISO8601().withMessage('Invalid payment date'),
  body('transactionId').optional().trim().isLength({ max: 100 }).withMessage('Transaction ID must not exceed 100 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Payment notes must not exceed 500 characters')
], checkInvoiceAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const invoice = req.invoice;

    // Don't allow payments on cancelled invoices
    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add payments to cancelled invoices'
      });
    }

    const { amount, paymentMethod, paymentDate, transactionId, notes } = req.body;

    // Check if payment amount exceeds remaining balance
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingBalance = invoice.totalAmount - totalPaid;

    if (amount > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount exceeds remaining balance'
      });
    }

    // Create payment record
    const payment = {
      amount,
      paymentMethod,
      paymentDate: new Date(paymentDate),
      transactionId: transactionId || null,
      notes: notes || '',
      status: 'completed'
    };

    invoice.payments.push(payment);

    // Update invoice status if fully paid
    const newTotalPaid = totalPaid + amount;
    if (newTotalPaid >= invoice.totalAmount) {
      invoice.status = 'paid';
      invoice.paidDate = new Date();
    }

    // Add to history
    invoice.history.push({
      action: 'payment_received',
      updatedAt: new Date(),
      updatedBy: req.user.id,
      details: `Payment of ${amount} ${invoice.currency} received via ${paymentMethod}`
    });

    invoice.updatedAt = new Date();
    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Payment added successfully',
      data: {
        payment: invoice.payments[invoice.payments.length - 1],
        status: invoice.status,
        totalPaid: newTotalPaid,
        remainingBalance: invoice.totalAmount - newTotalPaid
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

// GET /api/invoices/:id/pdf
// Generate and download invoice PDF
router.get('/:id/pdf', [
  auth,
  param('id').isMongoId().withMessage('Invalid invoice ID')
], checkInvoiceAccess, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'firstName lastName companyName email phone billingAddress')
      .populate('project', 'title')
      .populate('createdBy', 'firstName lastName email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Create PDF document
    const doc = new PDFDocument();
    const filename = `invoice-${invoice.invoiceNumber}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // PDF content
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice details
    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Issue Date: ${invoice.issueDate.toLocaleDateString()}`);
    doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    doc.moveDown();

    // Client details
    doc.text('Bill To:');
    if (invoice.client.companyName) {
      doc.text(invoice.client.companyName);
    } else {
      doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`);
    }
    doc.text(invoice.client.email);
    if (invoice.client.phone) {
      doc.text(invoice.client.phone);
    }
    doc.moveDown();

    // Line items
    doc.text('Items:');
    let yPosition = doc.y;
    doc.text('Description', 50, yPosition);
    doc.text('Qty', 300, yPosition);
    doc.text('Price', 380, yPosition);
    doc.text('Total', 460, yPosition, { align: 'right' });

    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    invoice.lineItems.forEach(item => {
      doc.text(item.description, 50, yPosition);
      doc.text(item.quantity.toString(), 300, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 380, yPosition);
      doc.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 460, yPosition, { align: 'right' });
      yPosition += 20;
    });

    yPosition += 10;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Totals
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 380, yPosition, { align: 'right' });
    yPosition += 20;
    doc.text(`Tax: $${invoice.taxAmount.toFixed(2)}`, 380, yPosition, { align: 'right' });
    yPosition += 20;
    if (invoice.discountAmount > 0) {
      doc.text(`Discount: -$${invoice.discountAmount.toFixed(2)}`, 380, yPosition, { align: 'right' });
      yPosition += 20;
    }
    doc.fontSize(14).text(`Total: $${invoice.totalAmount.toFixed(2)}`, 380, yPosition, { align: 'right' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/invoices/dashboard/summary
// Get invoice summary for dashboard
router.get('/dashboard/summary', [
  auth,
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
    let matchStage = {
      isActive: true,
      createdAt: { $gte: startDate }
    };

    // Filter by user access
    if (req.user.role === 'client') {
      matchStage.client = req.user.id;
    } else if (req.user.role !== 'owner') {
      const userProjects = await Project.find({
        'teamMembers.user': req.user.id
      }).select('_id');

      matchStage.$or = [
        { createdBy: req.user.id },
        { project: { $in: userProjects.map(p => p._id) } }
      ];
    }

    // Aggregation pipeline for summary
    const summary = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: {
            $sum: {
              $reduce: {
                input: '$payments',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.amount'] }
              }
            }
          },
          invoicesByStatus: {
            $push: {
              status: '$status',
              count: 1,
              amount: '$totalAmount'
            }
          },
          overdueInvoices: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'paid'] },
                    { $ne: ['$status', 'cancelled'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalInvoices: 1,
          totalAmount: 1,
          paidAmount: 1,
          outstandingAmount: { $subtract: ['$totalAmount', '$paidAmount'] },
          invoicesByStatus: {
            $arrayToObject: {
              $map: {
                input: { $groupBy: '$invoicesByStatus', key: 'status' },
                as: 'status',
                in: {
                  k: '$$status._id',
                  v: {
                    count: { $sum: '$$status.count' },
                    amount: { $sum: '$$status.amount' }
                  }
                }
              }
            }
          },
          overdueInvoices: 1
        }
      }
    ]);

    const result = summary[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      invoicesByStatus: {},
      overdueInvoices: 0
    };

    res.json({
      success: true,
      data: result
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