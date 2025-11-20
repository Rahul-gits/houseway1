const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  // Invoice Information
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  purchaseOrderNumber: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['standard', 'deposit', 'progress', 'final', 'credit', 'recurring'],
    default: 'standard'
  },

  // Dates
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  startDate: {
    type: Date // For period-based invoices
  },
  endDate: {
    type: Date // For period-based invoices
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'failed'],
    default: 'pending'
  },

  // Relationships
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Currency and Financial Details
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'JPY', 'CNY'],
    default: 'USD'
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balanceAmount: {
    type: Number,
    required: true,
    min: [0, 'Balance amount cannot be negative']
  },

  // Line Items
  items: [{
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unit: {
      type: String,
      trim: true,
      default: 'each'
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'Rate cannot be negative']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Item discount cannot be negative']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'Tax rate cannot be negative']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    category: {
      type: String,
      enum: ['labor', 'materials', 'equipment', 'permits', 'consulting', 'design', 'other'],
      default: 'other'
    },
    projectPhase: {
      type: String,
      enum: ['planning', 'design', 'demolition', 'construction', 'finishing', 'inspection', 'delivery', 'other'],
      default: 'other'
    },
    jobCode: String,
    notes: String
  }],

  // Tax Information
  taxes: [{
    name: {
      type: String,
      required: true
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'Tax rate cannot be negative']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Tax amount cannot be negative']
    },
    type: {
      type: String,
      enum: ['sales', 'service', 'vat', 'other'],
      default: 'sales'
    }
  }],

  // Discount Information
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      default: 0,
      min: [0, 'Discount value cannot be negative']
    },
    reason: {
      type: String,
      trim: true
    },
    appliesTo: {
      type: String,
      enum: ['subtotal', 'total', 'specific'],
      default: 'subtotal'
    }
  },

  // Payment Terms
  paymentTerms: {
    type: String,
    enum: ['net-15', 'net-30', 'net-45', 'net-60', 'due-on-receipt', '50-upfront', 'custom'],
    default: 'net-30'
  },
  customPaymentTerms: {
    type: String,
    trim: true
  },
  lateFees: {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    rate: {
      type: Number,
      default: 1.5,
      min: [0, 'Late fee rate cannot be negative']
    },
    gracePeriod: {
      type: Number,
      default: 0,
      min: [0, 'Grace period cannot be negative']
    }
  },

  // Recurring Invoice Settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annually', 'annually']
    },
    interval: {
      type: Number,
      default: 1
    },
    dayOfMonth: Number, // For monthly payments
    dayOfWeek: Number, // For weekly payments
    endDate: Date,
    maxOccurrences: Number,
    nextDueDate: Date
  },

  // Payment Information
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    date: {
      type: Date,
      required: true
    },
    method: {
      type: String,
      enum: ['cash', 'check', 'credit-card', 'bank-transfer', 'paypal', 'stripe', 'other'],
      required: true
    },
    reference: String,
    notes: String,
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['cash', 'check', 'credit-card', 'bank-transfer', 'paypal', 'stripe', 'other']
    },
    details: Schema.Types.Mixed,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],

  // Billing Information
  billingAddress: {
    name: {
      type: String,
      trim: true
    },
    company: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    },
    email: String,
    phone: String
  },
  shippingAddress: {
    sameAsBilling: {
      type: Boolean,
      default: true
    },
    name: String,
    company: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  // Notes and Terms
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  terms: {
    type: String,
    trim: true
  },
  footer: {
    type: String,
    trim: true
  },

  // Attachments
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'change-order', 'receipt', 'work-order', 'other'],
      required: true
    },
    file: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: true
    },
    description: String,
    date: Date
  }],

  // Email and Notifications
  email: {
    sent: {
      type: Boolean,
      default: false
    },
    sentDate: Date,
    recipientEmails: [String],
    template: String,
    subject: String,
    opened: {
      type: Boolean,
      default: false
    },
    openedDate: Date
  },
  reminders: [{
    date: Date,
    sent: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['due-date', 'overdue', 'payment-thank-you'],
      required: true
    }
  }],

  // PDF Generation
  pdf: {
    generated: {
      type: Boolean,
      default: false
    },
    generatedDate: Date,
    filePath: String,
    fileName: String,
    size: Number // File size in bytes
  },

  // Work Order Integration
  linkedWorkOrders: [{
    type: Schema.Types.ObjectId,
    ref: 'WorkOrder'
  }],
  changeOrders: [{
    type: Schema.Types.ObjectId,
    ref: 'ChangeOrder'
  }],

  // Client Portal Access
  clientPortal: {
    enabled: {
      type: Boolean,
      default: true
    },
    accessToken: String,
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewed: Date,
    paymentLink: String,
    paymentLinkExpiry: Date
  },

  // Tags and Classification
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['regular', 'deposit', 'progress', 'final', 'change-order', 'maintenance', 'other'],
    default: 'regular'
  },

  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: Date,
  voidReason: String,
  approvedAt: Date,
  sentAt: Date,
  paidAt: Date,
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Audit Trail
  history: [{
    action: {
      type: String,
      enum: ['created', 'modified', 'sent', 'viewed', 'paid', 'voided', 'archived'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: String,
    changes: Schema.Types.Mixed
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
invoiceSchema.virtual('daysUntilDue').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

invoiceSchema.virtual('isOverdue').get(function() {
  return this.daysUntilDue < 0 && this.status !== 'paid';
});

invoiceSchema.virtual('paymentStatusDisplay').get(function() {
  if (this.balanceAmount <= 0) return 'Paid';
  if (this.isOverdue) return 'Overdue';
  if (this.paidAmount > 0 && this.balanceAmount > 0) return 'Partial';
  return this.paymentStatus;
});

invoiceSchema.virtual('taxRate').get(function() {
  return this.subtotal > 0 ? (this.taxAmount / this.subtotal) * 100 : 0;
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ client: 1, issueDate: -1 });
invoiceSchema.index({ project: 1, issueDate: -1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ paymentStatus: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ createdBy: 1, issueDate: -1 });
invoiceSchema.index({ 'email.sent': 1 });
invoiceSchema.index({ isRecurring: 1 });
invoiceSchema.index({ tags: 1 });
invoiceSchema.index({ createdAt: -1 });

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Calculate totals if not provided
  if (this.isModified('items') || this.isModified('taxes') || this.isModified('discount')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

    const taxTotal = this.taxes.reduce((sum, tax) => sum + tax.amount, 0);
    const discountTotal = this.discount.type === 'percentage'
      ? (this.subtotal * this.discount.value) / 100
      : this.discount.value;

    this.taxAmount = taxTotal;
    this.discountAmount = discountTotal;
    this.totalAmount = Math.max(0, this.subtotal + taxTotal - discountTotal);
    this.balanceAmount = this.totalAmount - this.paidAmount;
  }

  // Update paid amount if payments changed
  if (this.isModified('payments')) {
    this.paidAmount = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    this.balanceAmount = this.totalAmount - this.paidAmount;

    // Update payment status
    if (this.balanceAmount <= 0) {
      this.paymentStatus = 'paid';
      this.status = 'paid';
      this.paidAt = new Date();
    } else if (this.paidAmount > 0 && this.balanceAmount > 0) {
      this.paymentStatus = 'partial';
      this.status = 'partial';
    } else if (this.isOverdue) {
      this.paymentStatus = 'overdue';
    } else {
      this.paymentStatus = 'pending';
    }
  }

  // Set next due date for recurring invoices
  if (this.isRecurring && this.isModified('recurringPattern')) {
    this.calculateNextDueDate();
  }

  next();
});

// Instance methods
invoiceSchema.methods.calculateNextDueDate = function() {
  if (!this.isRecurring || !this.recurringPattern.frequency) return;

  const currentDate = new Date(this.dueDate);
  const { frequency, interval = 1 } = this.recurringPattern;

  switch (frequency) {
    case 'daily':
      currentDate.setDate(currentDate.getDate() + interval);
      break;
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + (7 * interval));
      break;
    case 'bi-weekly':
      currentDate.setDate(currentDate.getDate() + (14 * interval));
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + interval);
      break;
    case 'quarterly':
      currentDate.setMonth(currentDate.getMonth() + (3 * interval));
      break;
    case 'semi-annually':
      currentDate.setMonth(currentDate.getMonth() + (6 * interval));
      break;
    case 'annually':
      currentDate.setFullYear(currentDate.getFullYear() + interval);
      break;
  }

  this.recurringPattern.nextDueDate = currentDate;
};

invoiceSchema.methods.addPayment = function(amount, method, reference, notes, userId) {
  this.payments.push({
    amount,
    method,
    reference,
    notes,
    recordedBy: userId,
    date: new Date()
  });

  return this.save();
};

invoiceSchema.methods.sendEmail = function(recipients, subject, template, userId) {
  this.email = {
    sent: true,
    sentDate: new Date(),
    recipientEmails: Array.isArray(recipients) ? recipients : [recipients],
    template,
    subject,
    opened: false
  };

  this.status = 'sent';
  this.sentAt = new Date();
  this.sentBy = userId;

  return this.save();
};

invoiceSchema.methods.addView = function() {
  this.clientPortal.viewCount += 1;
  this.clientPortal.lastViewed = new Date();
  return this.save();
};

invoiceSchema.methods.generatePdf = function(filePath, userId) {
  this.pdf = {
    generated: true,
    generatedDate: new Date(),
    filePath,
    fileName: `${this.invoiceNumber}.pdf`
  };

  return this.save();
};

invoiceSchema.methods.addHistory = function(action, userId, details, changes) {
  this.history.push({
    action,
    user: userId,
    details,
    changes
  });

  return this.save();
};

// Static methods
invoiceSchema.statics.generateInvoiceNumber = async function(prefix = 'INV') {
  const year = new Date().getFullYear();
  const latestInvoice = await this.findOne({
    invoiceNumber: new RegExp(`^${prefix}-${year}`)
  }).sort({ invoiceNumber: -1 });

  let nextNumber = 1;
  if (latestInvoice) {
    const parts = latestInvoice.invoiceNumber.split('-');
    const lastNumber = parseInt(parts[1]) || 0;
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(3, '0')}`;
};

invoiceSchema.statics.getOverdueInvoices = function(clientId = null) {
  const query = {
    status: { $in: ['sent', 'partial'] },
    dueDate: { $lt: new Date() },
    isActive: true
  };

  if (clientId) {
    query.client = clientId;
  }

  return this.find(query)
    .populate('client', 'firstName lastName email')
    .sort({ dueDate: 1 });
};

invoiceSchema.statics.getDashboardStats = async function(clientId = null) {
  const matchStage = clientId ? { client: mongoose.Types.ObjectId(clientId) } : {};

  const stats = await this.aggregate([
    { $match: { ...matchStage, isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        paidAmount: { $sum: '$paidAmount' }
      }
    }
  ]);

  const result = {
    total: 0,
    draft: { count: 0, amount: 0 },
    sent: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
    totalRevenue: 0,
    outstandingRevenue: 0
  };

  stats.forEach(stat => {
    result[stat._id] = {
      count: stat.count,
      amount: stat.totalAmount
    };
    result.total += stat.count;
    result.totalRevenue += stat.paidAmount;
    result.outstandingRevenue += (stat.totalAmount - stat.paidAmount);
  });

  return result;
};

invoiceSchema.statics.searchInvoices = function(query, clientId) {
  const searchRegex = new RegExp(query, 'i');
  const searchQuery = {
    isActive: true,
    $and: [
      clientId ? { client: mongoose.Types.ObjectId(clientId) } : {},
      {
        $or: [
          { invoiceNumber: searchRegex },
          { notes: searchRegex },
          { tags: searchRegex },
          { 'billingAddress.name': searchRegex },
          { 'billingAddress.email': searchRegex }
        ]
      }
    ]
  };

  return this.find(searchQuery)
    .populate('client', 'firstName lastName email')
    .populate('project', 'name')
    .sort({ createdAt: -1 });
};

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;