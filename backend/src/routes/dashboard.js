const express = require('express');
const router = express.Router();
const { authenticate, authorize, isOwner } = require('../middleware/auth');
const MaterialRequest = require('../models/MaterialRequest');
const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const PurchaseOrder = require('../models/PurchaseOrder');
const Client = require('../models/Client');
const TimelineEvent = require('../models/TimelineEvent');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get general dashboard stats (Owner only)
 * @access  Private (Owner only)
 */
router.get('/stats', authenticate, isOwner, async (req, res) => {
  try {
    // Get counts for various entities
    const [
      totalProjects,
      totalMaterialRequests,
      totalQuotations,
      totalPurchaseOrders,
      pendingMaterialRequests,
      pendingQuotations,
      approvedQuotations
    ] = await Promise.all([
      Project.countDocuments(),
      MaterialRequest.countDocuments(),
      Quotation.countDocuments(),
      PurchaseOrder.countDocuments(),
      MaterialRequest.countDocuments({ status: 'pending' }),
      Quotation.countDocuments({ status: 'submitted' }),
      Quotation.countDocuments({ status: 'approved' })
    ]);

    res.json({
      success: true,
      data: {
        projects: totalProjects,
        materialRequests: totalMaterialRequests,
        quotations: totalQuotations,
        purchaseOrders: totalPurchaseOrders,
        pendingMaterialRequests,
        pendingQuotations,
        approvedQuotations
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/vendor-stats
 * @desc    Get vendor-specific dashboard stats
 * @access  Private (Vendor only)
 */
router.get('/vendor-stats', authenticate, authorize('vendor'), async (req, res) => {
  try {
    // Get vendor-specific counts
    const [
      totalRequests,
      pendingQuotations,
      approvedQuotations,
      quotations
    ] = await Promise.all([
      MaterialRequest.countDocuments({ 'assignedVendors.vendor': req.user._id, status: 'approved' }),
      Quotation.countDocuments({ vendor: req.user._id, status: 'pending' }),
      Quotation.countDocuments({ vendor: req.user._id, status: 'approved' }),
      Quotation.find({ vendor: req.user._id, status: 'approved' }).select('totalAmount')
    ]);

    // Calculate total revenue from approved quotations
    const totalRevenue = quotations.reduce((sum, quotation) => sum + (quotation.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingQuotations,
        approvedQuotations,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Vendor dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor dashboard stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/client-stats
 * @desc    Get client-specific dashboard stats
 * @access  Private (Client only)
 */
router.get('/client-stats', authenticate, authorize('client'), async (req, res) => {
  try {
    // Get client projects
    const projects = await Project.find({ client: req.user._id });
    const projectIds = projects.map(project => project._id);

    // Get counts for client's projects
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalMaterialRequests,
      pendingMaterialRequests
    ] = await Promise.all([
      Project.countDocuments({ client: req.user._id }),
      Project.countDocuments({ client: req.user._id, status: { $in: ['planning', 'in-progress'] } }),
      Project.countDocuments({ client: req.user._id, status: 'completed' }),
      MaterialRequest.countDocuments({ project: { $in: projectIds } }),
      MaterialRequest.countDocuments({ project: { $in: projectIds }, status: 'pending' })
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalMaterialRequests,
        pendingMaterialRequests
      }
    });
  } catch (error) {
    console.error('Client dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get client dashboard stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/employee-stats
 * @desc    Get employee-specific dashboard stats
 * @access  Private (Employee only)
 */
router.get('/employee-stats', authenticate, authorize('employee'), async (req, res) => {
  try {
    // Get employee projects
    const projects = await Project.find({ assignedEmployees: req.user._id });
    const projectIds = projects.map(project => project._id);

    // Get counts for employee's projects
    const [
      assignedProjects,
      activeProjects,
      pendingMaterialRequests,
      pendingQuotations
    ] = await Promise.all([
      Project.countDocuments({ assignedEmployees: req.user._id }),
      Project.countDocuments({ assignedEmployees: req.user._id, status: { $in: ['planning', 'in-progress'] } }),
      MaterialRequest.countDocuments({ project: { $in: projectIds }, status: 'pending' }),
      Quotation.countDocuments({ 'materialRequest.project': { $in: projectIds }, status: 'submitted' })
    ]);

    res.json({
      success: true,
      data: {
        assignedProjects,
        activeProjects,
        pendingMaterialRequests,
        pendingQuotations
      }
    });
  } catch (error) {
    console.error('Employee dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get employee dashboard stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/owner-stats
 * @desc    Get owner-specific dashboard stats
 * @access  Private (Owner only)
 */
router.get('/owner-stats', authenticate, isOwner, async (req, res) => {
  try {
    // Get counts for all entities
    const [
      totalProjects,
      activeProjects,
      totalClients,
      totalEmployees,
      totalVendors,
      pendingMaterialRequests,
      pendingQuotations,
      pendingPurchaseOrders
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['planning', 'in-progress'] } }),
      Project.distinct('client').then(clients => clients.length),
      Project.distinct('assignedEmployees').then(employees => employees.length),
      MaterialRequest.distinct('assignedVendors.vendor').then(vendors => vendors.length),
      MaterialRequest.countDocuments({ status: 'pending' }),
      Quotation.countDocuments({ status: 'submitted' }),
      PurchaseOrder.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalClients,
        totalEmployees,
        totalVendors,
        pendingMaterialRequests,
        pendingQuotations,
        pendingPurchaseOrders
      }
    });
  } catch (error) {
    console.error('Owner dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get owner dashboard stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent activity across the system
 * @access  Private (Role-based)
 */
router.get('/recent-activity', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    let activities = [];

    // Different activity queries based on user role
    if (req.user.role === 'owner') {
      // Owner can see all recent activities
      const [projects, materialRequests, quotations] = await Promise.all([
        Project.find({}, 'title status createdAt')
          .sort({ createdAt: -1 })
          .limit(limit),
        MaterialRequest.find({}, 'title status createdAt')
          .populate('project', 'title')
          .sort({ createdAt: -1 })
          .limit(limit),
        Quotation.find({}, 'title status createdAt')
          .populate('materialRequest', 'title')
          .sort({ createdAt: -1 })
          .limit(limit)
      ]);

      activities = [
        ...projects.map(p => ({
          type: 'project',
          title: p.title,
          status: p.status,
          createdAt: p.createdAt,
          message: `Project ${p.title} was created`
        })),
        ...materialRequests.map(mr => ({
          type: 'materialRequest',
          title: mr.title,
          status: mr.status,
          createdAt: mr.createdAt,
          message: `Material request for ${mr.project?.title || 'project'} was created`
        })),
        ...quotations.map(q => ({
          type: 'quotation',
          title: q.title,
          status: q.status,
          createdAt: q.createdAt,
          message: `Quotation for ${q.materialRequest?.title || 'material request'} was submitted`
        }))
      ];
    } else if (req.user.role === 'vendor') {
      // Vendor can see their quotations and assigned material requests
      const [materialRequests, quotations] = await Promise.all([
        MaterialRequest.find({ 'assignedVendors.vendor': req.user._id })
          .populate('project', 'title')
          .sort({ createdAt: -1 })
          .limit(limit),
        Quotation.find({ vendor: req.user._id })
          .populate('materialRequest', 'title')
          .sort({ createdAt: -1 })
          .limit(limit)
      ]);

      activities = [
        ...materialRequests.map(mr => ({
          type: 'materialRequest',
          title: mr.title,
          status: mr.status,
          createdAt: mr.createdAt,
          message: `You were assigned to material request for ${mr.project?.title || 'project'}`
        })),
        ...quotations.map(q => ({
          type: 'quotation',
          title: q.title,
          status: q.status,
          createdAt: q.createdAt,
          message: `Your quotation for ${q.materialRequest?.title || 'material request'} was ${q.status}`
        }))
      ];
    } else if (req.user.role === 'client') {
      // Client can see their projects and material requests
      const projects = await Project.find({ client: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit);

      const projectIds = projects.map(p => p._id);
      const materialRequests = await MaterialRequest.find({ project: { $in: projectIds } })
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(limit);

      activities = [
        ...projects.map(p => ({
          type: 'project',
          title: p.title,
          status: p.status,
          createdAt: p.createdAt,
          message: `Your project ${p.title} was created`
        })),
        ...materialRequests.map(mr => ({
          type: 'materialRequest',
          title: mr.title,
          status: mr.status,
          createdAt: mr.createdAt,
          message: `Material request for ${mr.project?.title || 'your project'} was created`
        }))
      ];
    } else if (req.user.role === 'employee') {
      // Employee can see assigned projects and related material requests
      const projects = await Project.find({ assignedEmployees: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit);

      const projectIds = projects.map(p => p._id);
      const materialRequests = await MaterialRequest.find({ project: { $in: projectIds } })
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(limit);

      activities = [
        ...projects.map(p => ({
          type: 'project',
          title: p.title,
          status: p.status,
          createdAt: p.createdAt,
          message: `You were assigned to project ${p.title}`
        })),
        ...materialRequests.map(mr => ({
          type: 'materialRequest',
          title: mr.title,
          status: mr.status,
          createdAt: mr.createdAt,
          message: `Material request for ${mr.project?.title || 'assigned project'} was created`
        }))
      ];
    }

    // Sort all activities by date and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    activities = activities.slice(0, parseInt(limit));

    // Format activities with proper time field
    const formattedActivities = activities.map(activity => ({
      ...activity,
      time: getTimeAgo(activity.createdAt)
    }));

    res.json({
      success: true,
      data: { activities: formattedActivities }
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent activity',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/client-management
 * @desc    Get comprehensive client management dashboard metrics
 * @access  Private (Owner & Employee)
 */
router.get('/client-management', authenticate, authorize(['owner', 'employee']), async (req, res) => {
  try {
    const { days = 30, clientId } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Build filters
    const clientFilter = clientId ? { _id: clientId } : { isActive: true };
    const projectFilter = clientId ? { client: clientId, isActive: true } : { isActive: true };
    const timelineFilter = {
      isActive: true,
      createdAt: { $gte: startDate },
      ...(clientId && { client: clientId })
    };
    const invoiceFilter = {
      isActive: true,
      createdAt: { $gte: startDate },
      ...(clientId && { client: clientId })
    };

    // Get base metrics
    const [
      totalClients,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTimelineEvents,
      totalInvoices,
      recentClients,
      overdueProjects
    ] = await Promise.all([
      Client.countDocuments(clientFilter),
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: { $in: ['planning', 'in-progress'] } }),
      Project.countDocuments({ ...projectFilter, status: 'completed' }),
      TimelineEvent.countDocuments(timelineFilter),
      Invoice.countDocuments(invoiceFilter),
      Client.find(clientFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('firstName lastName companyName email createdAt status riskLevel'),
      Project.find({
        ...projectFilter,
        status: { $in: ['planning', 'in-progress'] },
        deadline: { $lt: new Date() }
      })
        .populate('client', 'firstName lastName companyName')
        .select('title deadline status client')
        .limit(5)
    ]);

    // Get client status distribution
    const clientsByStatus = await Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get client risk assessment distribution
    const clientsByRisk = await Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: '$riskAssessment.riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get project status distribution
    const projectsByStatus = await Project.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get timeline events by type
    const timelineEventsByType = await TimelineEvent.aggregate([
      { $match: timelineFilter },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get invoice summary
    const invoiceSummary = await Invoice.aggregate([
      { $match: invoiceFilter },
      {
        $group: {
          _id: null,
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
          }
        }
      },
      {
        $project: {
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
          }
        }
      }
    ]);

    // Get top performing clients by project value
    const topClients = await Client.aggregate([
      { $match: clientFilter },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'client',
          as: 'projects'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          companyName: 1,
          email: 1,
          projectCount: { $size: '$projects' },
          totalProjectValue: {
            $sum: '$projects.budget.total'
          },
          activeProjects: {
            $size: {
              $filter: {
                input: '$projects',
                cond: { $in: ['$$this.status', ['planning', 'in-progress']] }
              }
            }
          }
        }
      },
      { $sort: { totalProjectValue: -1 } },
      { $limit: 10 }
    ]);

    // Get communication metrics
    const communicationMetrics = await Client.aggregate([
      { $match: clientFilter },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          emailEnabled: {
            $sum: { $cond: ['$communicationPreferences.email', 1, 0] }
          },
          smsEnabled: {
            $sum: { $cond: ['$communicationPreferences.sms', 1, 0] }
          },
          phoneEnabled: {
            $sum: { $cond: ['$communicationPreferences.phone', 1, 0] }
          },
          averageResponseTime: { $avg: '$communicationMetrics.averageResponseTime' }
        }
      }
    ]);

    const summary = invoiceSummary[0] || {
      totalAmount: 0,
      paidAmount: 0,
      outstandingAmount: 0,
      invoicesByStatus: {}
    };

    const commMetrics = communicationMetrics[0] || {
      totalClients: 0,
      emailEnabled: 0,
      smsEnabled: 0,
      phoneEnabled: 0,
      averageResponseTime: 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalClients,
          totalProjects,
          activeProjects,
          completedProjects,
          totalTimelineEvents,
          totalInvoices
        },
        clientMetrics: {
          clientsByStatus: formatDistribution(clientsByStatus),
          clientsByRisk: formatDistribution(clientsByRisk),
          recentClients,
          topClients
        },
        projectMetrics: {
          projectsByStatus: formatDistribution(projectsByStatus),
          overdueProjects
        },
        engagementMetrics: {
          timelineEventsByType: formatDistribution(timelineEventsByType),
          totalTimelineEvents
        },
        financialMetrics: {
          ...summary,
          currency: 'USD'
        },
        communicationMetrics: {
          ...commMetrics,
          emailEnabledPercentage: commMetrics.totalClients > 0
            ? (commMetrics.emailEnabled / commMetrics.totalClients * 100).toFixed(1)
            : 0,
          smsEnabledPercentage: commMetrics.totalClients > 0
            ? (commMetrics.smsEnabled / commMetrics.totalClients * 100).toFixed(1)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Client management dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get client management dashboard metrics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/client-trends
 * @desc    Get client acquisition and retention trends
 * @access  Private (Owner & Employee)
 */
router.get('/client-trends', authenticate, authorize(['owner', 'employee']), async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const monthsBack = parseInt(months);

    // Get monthly client acquisition data
    const acquisitionTrends = await Client.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: {
            $gte: new Date(Date.now() - monthsBack * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newClients: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get client retention data
    const retentionData = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'client',
          as: 'projects'
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          companyName: 1,
          createdAt: 1,
          lastActivity: 1,
          projectCount: { $size: '$projects' },
          hasActiveProjects: {
            $gt: [{
              $size: {
                $filter: {
                  input: '$projects',
                  cond: { $in: ['$$this.status', ['planning', 'in-progress']] }
                }
              }
            }, 0]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: ['$hasActiveProjects', 1, 0] }
          },
          newClientsThisMonth: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          averageProjectsPerClient: { $avg: '$projectCount' }
        }
      }
    ]);

    // Get client type distribution
    const clientTypes = await Client.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$clientType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get client source distribution
    const clientSources = await Client.aggregate([
      { $match: { isActive: true, 'howDidYouFindUs.source': { $ne: null } } },
      {
        $group: {
          _id: '$howDidYouFindUs.source',
          count: { $sum: 1 }
        }
      }
    ]);

    const retention = retentionData[0] || {
      totalClients: 0,
      activeClients: 0,
      newClientsThisMonth: 0,
      averageProjectsPerClient: 0
    };

    res.json({
      success: true,
      data: {
        acquisitionTrends: formatMonthlyTrends(acquisitionTrends, monthsBack),
        retention: {
          ...retention,
          retentionRate: retention.totalClients > 0
            ? (retention.activeClients / retention.totalClients * 100).toFixed(1)
            : 0,
          churnRate: retention.totalClients > 0
            ? ((retention.totalClients - retention.activeClients) / retention.totalClients * 100).toFixed(1)
            : 0
        },
        clientTypes: formatDistribution(clientTypes),
        clientSources: formatDistribution(clientSources)
      }
    });
  } catch (error) {
    console.error('Client trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get client trends',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/dashboard/performance-metrics
 * @desc    Get employee performance metrics for client management
 * @access  Private (Owner & Employee)
 */
router.get('/performance-metrics', authenticate, authorize(['owner', 'employee']), async (req, res) => {
  try {
    const { employeeId, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Build filter for specific employee or all employees
    const employeeFilter = employeeId ? { _id: employeeId, role: 'employee' } : { role: 'employee' };

    // Get employees with their client management metrics
    const employees = await User.find(employeeFilter)
      .select('firstName lastName email employeeDetails')
      .lean();

    // Enhance employee data with performance metrics
    const employeesWithMetrics = await Promise.all(
      employees.map(async (employee) => {
        const [assignedProjects, completedProjects, timelineEvents, clientSatisfaction] = await Promise.all([
          Project.countDocuments({
            'teamMembers.user': employee._id,
            'teamMembers.role': 'project_manager',
            isActive: true
          }),
          Project.countDocuments({
            'teamMembers.user': employee._id,
            'teamMembers.role': 'project_manager',
            status: 'completed',
            completedAt: { $gte: startDate }
          }),
          TimelineEvent.countDocuments({
            createdBy: employee._id,
            createdAt: { $gte: startDate }
          }),
          // Average client rating (placeholder - would need actual ratings data)
          Promise.resolve(4.2) // Placeholder value
        ]);

        return {
          ...employee,
          metrics: {
            assignedProjects,
            completedProjects,
            timelineEvents,
            clientSatisfaction,
            projectCompletionRate: assignedProjects > 0
              ? (completedProjects / assignedProjects * 100).toFixed(1)
              : 0
          }
        };
      })
    );

    // Get overall team performance
    const teamStats = await Project.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$teamMembers' },
      { $match: { 'teamMembers.role': 'project_manager' } },
      {
        $group: {
          _id: '$teamMembers.user',
          projectCount: { $sum: 1 },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $project: {
          employeeName: {
            $concat: ['$employee.firstName', ' ', '$employee.lastName']
          },
          projectCount: 1,
          completedProjects: 1,
          completionRate: {
            $cond: [
              { $gt: ['$projectCount', 0] },
              { $multiply: [{ $divide: ['$completedProjects', '$projectCount'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        employees: employeesWithMetrics,
        teamRankings: teamStats,
        period: `Last ${days} days`
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
});

// Helper function to format distribution data
const formatDistribution = (data) => {
  return data.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

// Helper function to format monthly trends
const formatMonthlyTrends = (data, monthsBack) => {
  const result = [];
  const currentDate = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const found = data.find(item => item._id.year === year && item._id.month === month);
    result.push({
      month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      year,
      month,
      newClients: found ? found.newClients : 0
    });
  }

  return result;
};

// Helper function to format time ago
const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hrs ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

module.exports = router;