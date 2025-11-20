const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  secondaryPhone: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },

  // Client-Specific Information
  clientType: {
    type: String,
    enum: ['residential', 'commercial', 'mixed'],
    default: 'residential'
  },
  preferredStyle: {
    type: String,
    enum: ['modern', 'traditional', 'contemporary', 'minimalist', 'industrial', 'scandinavian', 'transitional'],
    default: 'modern'
  },
  budgetRange: {
    type: String,
    enum: ['under-50k', '50k-100k', '100k-200k', '200k-500k', 'over-500k'],
    default: '100k-200k'
  },
  propertyType: {
    type: String,
    enum: ['single-family', 'condo', 'townhouse', 'apartment', 'office', 'retail', 'mixed-use'],
    default: 'single-family'
  },

  // Status and Activity
  status: {
    type: String,
    enum: ['active', 'inactive', 'at-risk', 'pending'],
    default: 'active'
  },
  riskScore: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  clientSince: {
    type: Date,
    default: Date.now
  },

  // Communication Preferences
  communicationPreferences: {
    preferredMethod: {
      type: String,
      enum: ['email', 'phone', 'text', 'in-person'],
      default: 'email'
    },
    preferredContactTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'any'],
      default: 'any'
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    }
  },

  // Financial Information
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total spent cannot be negative']
  },
  averageProjectValue: {
    type: Number,
    default: 0,
    min: [0, 'Average project value cannot be negative']
  },
  paymentTerms: {
    type: String,
    enum: ['net-15', 'net-30', 'net-45', 'net-60', 'due-on-receipt', '50-upfront'],
    default: 'net-30'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'Credit limit cannot be negative']
  },

  // Address Information
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'USA'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  billingAddress: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'USA'
    }
  },

  // Notes and History
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Internal notes cannot exceed 2000 characters']
  },
  clientHistory: [{
    event: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['status_change', 'contact', 'meeting', 'payment', 'project_update', 'note'],
      default: 'note'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],

  // Relationships
  projects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  assignedEmployee: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  invoices: [{
    type: Schema.Types.ObjectId,
    ref: 'Invoice'
  }],
  timelineEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'TimelineEvent'
  }],

  // Tags and Metadata
  tags: [{
    type: String,
    trim: true
  }],
  customFields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select'],
      required: true
    },
    value: Schema.Types.Mixed,
    options: [String] // For select field types
  }],
  source: {
    type: String,
    enum: ['referral', 'website', 'social-media', 'advertisement', 'cold-call', 'walk-in', 'other'],
    default: 'other'
  },
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'Client' // For referral tracking
  },

  // Performance Metrics
  satisfactionRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  responseTime: {
    type: Number, // Average response time in hours
    default: 24
  },
  projectCompletionRate: {
    type: Number, // Percentage
    min: [0, 'Completion rate cannot be negative'],
    max: [100, 'Completion rate cannot exceed 100'],
    default: 0
  },

  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

clientSchema.virtual('activeProjects', {
  ref: 'Project',
  localField: 'projects',
  foreignField: '_id',
  match: { status: 'in-progress' }
});

clientSchema.virtual('totalInvoices', {
  ref: 'Invoice',
  localField: 'invoices',
  foreignField: '_id'
});

clientSchema.virtual('recentTimelineEvents', {
  ref: 'TimelineEvent',
  localField: 'timelineEvents',
  foreignField: '_id',
  options: { sort: { createdAt: -1 }, limit: 5 }
});

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ assignedEmployee: 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ lastActivity: -1 });
clientSchema.index({ 'address.city': 1, 'address.state': 1 });
clientSchema.index({ tags: 1 });
clientSchema.index({ clientType: 1, budgetRange: 1 });

// Pre-save middleware
clientSchema.pre('save', function(next) {
  // Update lastActivity when modified
  if (this.isModified() && !this.isNew) {
    this.lastActivity = new Date();
  }

  // Calculate average project value when projects change
  if (this.isModified('projects') || this.isModified('totalSpent')) {
    const projectCount = this.projects ? this.projects.length : 0;
    this.averageProjectValue = projectCount > 0 ? this.totalSpent / projectCount : 0;
  }

  next();
});

// Pre-remove middleware
clientSchema.pre('remove', async function(next) {
  try {
    // Remove references from projects
    await mongoose.model('Project').updateMany(
      { client: this._id },
      { $unset: { client: 1 } }
    );

    // Remove references from invoices
    await mongoose.model('Invoice').updateMany(
      { client: this._id },
      { $unset: { client: 1 } }
    );

    // Remove references from timeline events
    await mongoose.model('TimelineEvent').updateMany(
      { client: this._id },
      { $unset: { client: 1 } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

// Static methods
clientSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isActive: true })
    .populate('assignedEmployee', 'firstName lastName email')
    .sort({ lastActivity: -1 });
};

clientSchema.statics.findByEmployee = function(employeeId) {
  return this.find({ assignedEmployee: employeeId, isActive: true })
    .populate('assignedEmployee', 'firstName lastName email')
    .sort({ lastActivity: -1 });
};

clientSchema.statics.getActiveClients = function() {
  return this.find({
    status: 'active',
    isActive: true
  })
    .populate('assignedEmployee', 'firstName lastName email')
    .sort({ lastActivity: -1 });
};

clientSchema.statics.getAtRiskClients = function() {
  return this.find({
    status: 'at-risk',
    isActive: true
  })
    .populate('assignedEmployee', 'firstName lastName email')
    .sort({ lastActivity: 1 });
};

clientSchema.statics.searchClients = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { tags: searchRegex }
        ]
      }
    ]
  })
    .populate('assignedEmployee', 'firstName lastName email')
    .sort({ lastActivity: -1 });
};

// Instance methods
clientSchema.methods.addHistory = function(event, type, userId) {
  this.clientHistory.push({
    event,
    type,
    createdBy: userId
  });
  this.lastActivity = new Date();
  return this.save();
};

clientSchema.methods.updateStatus = function(newStatus, userId) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.lastActivity = new Date();

  return this.addHistory(
    `Status changed from ${oldStatus} to ${newStatus}`,
    'status_change',
    userId
  );
};

clientSchema.methods.getRecentProjects = function(limit = 5) {
  return mongoose.model('Project')
    .find({ client: this._id })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('assignedEmployees', 'firstName lastName');
};

clientSchema.methods.calculateProjectMetrics = async function() {
  const projects = await mongoose.model('Project').find({ client: this._id });
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    projectCompletionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
  };
};

// Validation
clientSchema.pre('validate', function(next) {
  // Ensure billing address defaults to main address if not provided
  if (!this.billingAddress.street && this.address.street) {
    this.billingAddress = { ...this.address };
  }

  next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;