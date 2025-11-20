const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timelineEventSchema = new Schema({
  // Event Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['meeting', 'milestone', 'update', 'issue', 'note', 'media', 'invoice', 'design', 'construction', 'inspection', 'delivery', 'other'],
    default: 'update'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    min: [0, 'Duration cannot be negative']
  },

  // Relationships
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client reference is required']
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by reference is required']
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Visibility Settings
  isPublic: {
    type: Boolean,
    default: true
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  audience: {
    type: [String],
    enum: ['client', 'team', 'management', 'contractors', 'all'],
    default: ['all']
  },

  // Media and Attachments
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  images: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'File'
  }],

  // Location Information (for meetings, site visits, etc.)
  location: {
    name: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    type: {
      type: String,
      enum: ['client-site', 'office', 'warehouse', 'virtual', 'other'],
      default: 'client-site'
    },
    meetingLink: {
      type: String,
      trim: true
    }
  },

  // Status and Progress
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'completed'
  },
  completionPercentage: {
    type: Number,
    min: [0, 'Completion percentage cannot be less than 0'],
    max: [100, 'Completion percentage cannot exceed 100'],
    default: 100
  },

  // Meeting Specific Fields
  meetingDetails: {
    agenda: [String],
    attendees: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String, // For external attendees
      email: String,
      role: String,
      status: {
        type: String,
        enum: ['invited', 'accepted', 'declined', 'tentative'],
        default: 'invited'
      }
    }],
    notes: String,
    actionItems: [{
      description: {
        type: String,
        required: true
      },
      assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
      },
      completedDate: Date
    }],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  },

  // Milestone Specific Fields
  milestoneDetails: {
    milestoneNumber: Number,
    dependencies: [{
      type: Schema.Types.ObjectId,
      ref: 'TimelineEvent'
    }],
    deliverables: [String],
    acceptanceCriteria: [String],
    actualCompletionDate: Date,
    variance: {
      type: Number, // Days variance from planned date
      default: 0
    }
  },

  // Issue Specific Fields
  issueDetails: {
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    category: {
      type: String,
      enum: ['design', 'materials', 'labor', 'permit', 'budget', 'timeline', 'quality', 'safety', 'other'],
      required: true
    },
    resolution: {
      description: String,
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: Date,
      resolutionMethod: {
        type: String,
        enum: ['fixed', 'workaround', 'accepted', 'deferred']
      },
      cost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
      }
    },
    impact: {
      type: String,
      enum: ['none', 'minimal', 'moderate', 'significant', 'critical'],
      default: 'minimal'
    },
    preventiveAction: String
  },

  // Tags and Classification
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['planning', 'design', 'permit', 'demolition', 'construction', 'finishing', 'inspection', 'delivery', 'payment', 'communication', 'documentation', 'other'],
    default: 'communication'
  },

  // Notifications
  notifications: {
    notifyClient: {
      type: Boolean,
      default: true
    },
    notifyEmployee: {
      type: Boolean,
      default: true
    },
    notificationMethods: [{
      type: String,
      enum: ['email', 'sms', 'push', 'in-app']
    }],
    customMessage: String,
    scheduledNotification: Date
  },

  // Weather Information (for outdoor events)
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    precipitation: Number
  },

  // Financial Impact
  financialImpact: {
    budgetImpact: {
      type: Number,
      default: 0
    },
    costCode: String,
    billable: {
      type: Boolean,
      default: false
    },
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice'
    }
  },

  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: Date,
  parentEvent: {
    type: Schema.Types.ObjectId,
    ref: 'TimelineEvent'
  },
  subEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'TimelineEvent'
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    interval: Number,
    endDate: Date,
    occurrences: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
timelineEventSchema.virtual('isRecent').get(function() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.timestamp > oneWeekAgo;
});

timelineEventSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.timestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours === 0 ? 'Just now' : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return this.timestamp.toLocaleDateString();
  }
});

// Indexes
timelineEventSchema.index({ client: 1, timestamp: -1 });
timelineEventSchema.index({ project: 1, timestamp: -1 });
timelineEventSchema.index({ createdBy: 1, timestamp: -1 });
timelineEventSchema.index({ eventType: 1, timestamp: -1 });
timelineEventSchema.index({ status: 1, timestamp: -1 });
timelineEventSchema.index({ priority: 1, timestamp: -1 });
timelineEventSchema.index({ tags: 1 });
timelineEventSchema.index({ 'issueDetails.severity': 1 });
timelineEventSchema.index({ isPublic: 1, isInternal: 1 });
timelineEventSchema.index({ timestamp: -1 });
timelineEventSchema.index({ createdAt: -1 });

// Pre-save middleware
timelineEventSchema.pre('save', function(next) {
  // Auto-set status based on event type and completion
  if (this.eventType === 'milestone' && this.completionPercentage === 100 && !this.status) {
    this.status = 'completed';
  }

  // Set actual completion date for milestones
  if (this.eventType === 'milestone' && this.status === 'completed' && !this.milestoneDetails.actualCompletionDate) {
    this.milestoneDetails.actualCompletionDate = new Date();
  }

  // Calculate variance for milestones
  if (this.eventType === 'milestone' && this.milestoneDetails.actualCompletionDate) {
    const plannedDate = this.timestamp;
    const actualDate = this.milestoneDetails.actualCompletionDate;
    this.milestoneDetails.variance = Math.ceil((actualDate - plannedDate) / (1000 * 60 * 60 * 24));
  }

  next();
});

// Static methods
timelineEventSchema.statics.findByClient = function(clientId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    eventType,
    isPublic = true,
    startDate,
    endDate
  } = options;

  const query = {
    client: clientId,
    isActive: true,
    isPublic
  };

  if (eventType) query.eventType = eventType;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .populate('attachments')
    .populate('images')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

timelineEventSchema.statics.findByProject = function(projectId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    eventType,
    isPublic = true
  } = options;

  const query = {
    project: projectId,
    isActive: true,
    isPublic
  };

  if (eventType) query.eventType = eventType;

  return this.find(query)
    .populate('createdBy', 'firstName lastName email')
    .populate('client', 'firstName lastName email')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

timelineEventSchema.statics.findIssues = function(clientId, severity) {
  const query = {
    eventType: 'issue',
    isActive: true,
    client: clientId
  };

  if (severity) {
    query['issueDetails.severity'] = severity;
  }

  return this.find(query)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ 'issueDetails.severity': -1, timestamp: -1 });
};

timelineEventSchema.statics.getUpcomingEvents = function(userId, days = 7) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return this.find({
    assignedTo: userId,
    status: 'scheduled',
    timestamp: { $gte: new Date(), $lte: futureDate },
    isActive: true
  })
    .populate('client', 'firstName lastName')
    .populate('project', 'name')
    .sort({ timestamp: 1 });
};

timelineEventSchema.statics.searchEvents = function(query, clientId) {
  const searchRegex = new RegExp(query, 'i');
  const searchQuery = {
    $and: [
      { isActive: true },
      clientId ? { client: clientId } : {},
      {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex },
          { 'location.name': searchRegex }
        ]
      }
    ]
  };

  return this.find(searchQuery)
    .populate('createdBy', 'firstName lastName email')
    .populate('client', 'firstName lastName email')
    .populate('project', 'name')
    .sort({ timestamp: -1 });
};

// Instance methods
timelineEventSchema.methods.addAttachment = function(fileId) {
  this.attachments.push(fileId);
  return this.save();
};

timelineEventSchema.methods.removeAttachment = function(fileId) {
  this.attachments = this.attachments.filter(id => id.toString() !== fileId.toString());
  return this.save();
};

timelineEventSchema.methods.addAttendee = function(userId, name, email, role) {
  if (!this.meetingDetails) {
    this.meetingDetails = {};
  }

  const attendee = { user: userId, name, email, role, status: 'invited' };
  this.meetingDetails.attendees.push(attendee);
  return this.save();
};

timelineEventSchema.methods.updateAttendeeStatus = function(userId, status) {
  if (!this.meetingDetails || !this.meetingDetails.attendees) return Promise.resolve(this);

  const attendee = this.meetingDetails.attendees.find(a =>
    a.user && a.user.toString() === userId.toString()
  );

  if (attendee) {
    attendee.status = status;
    return this.save();
  }

  return Promise.resolve(this);
};

timelineEventSchema.methods.resolveIssue = function(resolution, resolvedBy, resolutionMethod, cost) {
  if (this.eventType !== 'issue') return Promise.resolve(this);

  this.status = 'completed';
  this.issueDetails.resolution = {
    description: resolution,
    resolvedBy,
    resolvedAt: new Date(),
    resolutionMethod,
    cost: cost || 0
  };

  return this.save();
};

timelineEventSchema.methods.getActionItems = function() {
  return this.meetingDetails ? this.meetingDetails.actionItems || [] : [];
};

timelineEventSchema.methods.updateActionItem = function(itemId, updates) {
  if (!this.meetingDetails || !this.meetingDetails.actionItems) return Promise.resolve(this);

  const item = this.meetingDetails.actionItems.id(itemId);
  if (item) {
    Object.assign(item, updates);
    if (updates.status === 'completed' && !item.completedDate) {
      item.completedDate = new Date();
    }
  }

  return this.save();
};

// Validation
timelineEventSchema.pre('validate', function(next) {
  // Validate meeting-specific fields
  if (this.eventType === 'meeting' && !this.meetingDetails) {
    this.meetingDetails = {};
  }

  // Validate issue-specific fields
  if (this.eventType === 'issue' && !this.issueDetails) {
    this.issueDetails = {};
  }

  // Validate milestone-specific fields
  if (this.eventType === 'milestone' && !this.milestoneDetails) {
    this.milestoneDetails = {};
  }

  next();
});

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);

module.exports = TimelineEvent;