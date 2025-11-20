import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Export and reporting utilities for client management data
 */

class ExportManager {
  constructor() {
    this.supportedFormats = ['csv', 'json', 'pdf'];
  }

  // Export clients data
  async exportClients(clients, format = 'csv', filters = {}) {
    try {
      let data;

      switch (format.toLowerCase()) {
        case 'csv':
          data = this.generateClientsCSV(clients);
          break;
        case 'json':
          data = this.generateClientsJSON(clients);
          break;
        case 'pdf':
          data = await this.generateClientsPDF(clients);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return this.saveExportFile(data, `clients-export-${Date.now()}.${format}`);
    } catch (error) {
      console.error('Error exporting clients:', error);
      throw error;
    }
  }

  // Generate CSV for clients
  generateClientsCSV(clients) {
    const headers = [
      'Client ID', 'First Name', 'Last Name', 'Company', 'Email', 'Phone',
      'Status', 'Risk Level', 'Join Date', 'Total Projects', 'Active Projects',
      'Total Revenue', 'Last Activity', 'Communication Preferences'
    ].join(',');

    const rows = clients.map(client => [
      client._id,
      `"${client.firstName || ''}"`,
      `"${client.lastName || ''}"`,
      `"${client.companyName || ''}"`,
      `"${client.email || ''}"`,
      `"${client.phone || ''}"`,
      client.status || '',
      client.riskAssessment?.riskLevel || '',
      client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '',
      client.projects?.length || 0,
      client.projects?.filter(p => ['planning', 'in-progress'].includes(p.status)).length || 0,
      client.financialInfo?.totalRevenue || 0,
      client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : '',
      client.communicationPreferences?.email ? 'Email' : '',
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  // Generate JSON for clients
  generateClientsJSON(clients) {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalClients: clients.length,
      clients: clients.map(client => ({
        id: client._id,
        personalInfo: {
          firstName: client.firstName,
          lastName: client.lastName,
          companyName: client.companyName,
          email: client.email,
          phone: client.phone,
        },
        status: client.status,
        riskAssessment: client.riskAssessment,
        joinDate: client.createdAt,
        projects: {
          total: client.projects?.length || 0,
          active: client.projects?.filter(p => ['planning', 'in-progress'].includes(p.status)).length || 0,
        },
        financialInfo: client.financialInfo,
        communication: client.communicationPreferences,
        lastActivity: client.lastActivity,
        tags: client.tags,
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Export projects data
  async exportProjects(projects, format = 'csv', filters = {}) {
    try {
      let data;

      switch (format.toLowerCase()) {
        case 'csv':
          data = this.generateProjectsCSV(projects);
          break;
        case 'json':
          data = this.generateProjectsJSON(projects);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return this.saveExportFile(data, `projects-export-${Date.now()}.${format}`);
    } catch (error) {
      console.error('Error exporting projects:', error);
      throw error;
    }
  }

  // Generate CSV for projects
  generateProjectsCSV(projects) {
    const headers = [
      'Project ID', 'Title', 'Client', 'Status', 'Start Date', 'Deadline',
      'Budget', 'Progress', 'Team Size', 'Timeline Events', 'Created By',
      'Created Date'
    ].join(',');

    const rows = projects.map(project => [
      project._id,
      `"${project.title || ''}"`,
      `"${project.client?.companyName || project.client?.firstName + ' ' + project.client?.lastName || ''}"`,
      project.status || '',
      project.startDate ? new Date(project.startDate).toLocaleDateString() : '',
      project.deadline ? new Date(project.deadline).toLocaleDateString() : '',
      project.budget?.total || 0,
      project.clientFlow?.metrics?.progress || 0,
      project.teamMembers?.length || 0,
      project.timelineEvents?.length || 0,
      `"${project.createdBy?.firstName + ' ' + project.createdBy?.lastName || ''}"`,
      project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '',
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  // Generate JSON for projects
  generateProjectsJSON(projects) {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalProjects: projects.length,
      projects: projects.map(project => ({
        id: project._id,
        title: project.title,
        client: project.client,
        status: project.status,
        dates: {
          start: project.startDate,
          deadline: project.deadline,
          completedAt: project.completedAt,
        },
        budget: project.budget,
        progress: project.clientFlow?.metrics?.progress,
        teamSize: project.teamMembers?.length || 0,
        timeline: {
          totalEvents: project.timelineEvents?.length || 0,
        },
        createdBy: project.createdBy,
        createdAt: project.createdAt,
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Export invoices data
  async exportInvoices(invoices, format = 'csv', filters = {}) {
    try {
      let data;

      switch (format.toLowerCase()) {
        case 'csv':
          data = this.generateInvoicesCSV(invoices);
          break;
        case 'json':
          data = this.generateInvoicesJSON(invoices);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      return this.saveExportFile(data, `invoices-export-${Date.now()}.${format}`);
    } catch (error) {
      console.error('Error exporting invoices:', error);
      throw error;
    }
  }

  // Generate CSV for invoices
  generateInvoicesCSV(invoices) {
    const headers = [
      'Invoice Number', 'Client', 'Project', 'Issue Date', 'Due Date',
      'Status', 'Total Amount', 'Paid Amount', 'Outstanding', 'Currency',
      'Payment Terms', 'Created Date'
    ].join(',');

    const rows = invoices.map(invoice => {
      const paidAmount = invoice.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      const outstanding = invoice.totalAmount - paidAmount;

      return [
        invoice.invoiceNumber,
        `"${invoice.client?.companyName || invoice.client?.firstName + ' ' + invoice.client?.lastName || ''}"`,
        `"${invoice.project?.title || ''}"`,
        invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '',
        invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '',
        invoice.status || '',
        invoice.totalAmount || 0,
        paidAmount,
        outstanding,
        invoice.currency || 'USD',
        invoice.paymentTerms || '',
        invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '',
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  // Generate JSON for invoices
  generateInvoicesJSON(invoices) {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalInvoices: invoices.length,
      summary: {
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        paidAmount: invoices.reduce((sum, inv) =>
          sum + (inv.payments?.reduce((paymentSum, payment) => paymentSum + payment.amount, 0) || 0), 0
        ),
        outstandingAmount: invoices.reduce((sum, inv) => {
          const paid = inv.payments?.reduce((paymentSum, payment) => paymentSum + payment.amount, 0) || 0;
          return sum + (inv.totalAmount - paid);
        }, 0),
      },
      invoices: invoices.map(invoice => ({
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.client,
        project: invoice.project,
        dates: {
          issue: invoice.issueDate,
          due: invoice.dueDate,
          paid: invoice.paidDate,
        },
        status: invoice.status,
        amounts: {
          subtotal: invoice.subtotal,
          taxAmount: invoice.taxAmount,
          discountAmount: invoice.discountAmount,
          total: invoice.totalAmount,
        },
        payments: invoice.payments,
        currency: invoice.currency,
        paymentTerms: invoice.paymentTerms,
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Generate dashboard report
  async generateDashboardReport(metrics, period = 'monthly') {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        period,
        summary: {
          totalClients: metrics.overview?.totalClients || 0,
          activeProjects: metrics.overview?.activeProjects || 0,
          totalRevenue: metrics.financialMetrics?.totalAmount || 0,
          outstandingRevenue: metrics.financialMetrics?.outstandingAmount || 0,
        },
        clientMetrics: metrics.clientMetrics || {},
        projectMetrics: metrics.projectMetrics || {},
        engagementMetrics: metrics.engagementMetrics || {},
        communicationMetrics: metrics.communicationMetrics || {},
      };

      const data = JSON.stringify(report, null, 2);
      return this.saveExportFile(data, `dashboard-report-${Date.now()}.json`);
    } catch (error) {
      console.error('Error generating dashboard report:', error);
      throw error;
    }
  }

  // Save export file to device
  async saveExportFile(data, filename) {
    try {
      // Create directory if it doesn't exist
      const directory = `${FileSystem.documentDirectory}exports/`;
      const dirInfo = await FileSystem.getInfoAsync(directory);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const fileUri = `${directory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });

      return {
        success: true,
        fileUri,
        filename,
        size: data.length,
      };
    } catch (error) {
      console.error('Error saving export file:', error);
      throw error;
    }
  }

  // Share exported file
  async shareExportFile(fileUri, filename) {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we can use the Share API
        const result = await Share.share({
          url: fileUri,
          title: `Export: ${filename}`,
          message: `Exported data from Client Management app`,
        });

        return { success: true, result };
      } else {
        // For Android, we might need different handling
        return {
          success: true,
          fileUri,
          message: 'File saved to device storage'
        };
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  }

  // Get export history
  async getExportHistory() {
    try {
      const directory = `${FileSystem.documentDirectory}exports/`;
      const files = await FileSystem.readDirectoryAsync(directory);

      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const fileUri = `${directory}${filename}`;
          const info = await FileSystem.getInfoAsync(fileUri);
          return {
            filename,
            fileUri,
            size: info.size,
            created: info.modificationTime,
          };
        })
      );

      return fileDetails.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Error getting export history:', error);
      return [];
    }
  }

  // Delete export file
  async deleteExportFile(filename) {
    try {
      const fileUri = `${FileSystem.documentDirectory}exports/${filename}`;
      await FileSystem.deleteAsync(fileUri);
      return { success: true };
    } catch (error) {
      console.error('Error deleting export file:', error);
      throw error;
    }
  }

  // Schedule automatic exports
  async scheduleAutoExport(type, frequency = 'weekly', email = null) {
    try {
      const schedule = {
        type,
        frequency,
        email,
        enabled: true,
        lastRun: null,
        nextRun: this.calculateNextRun(frequency),
      };

      // Save schedule to storage
      const existingSchedules = await this.getAutoExportSchedules();
      existingSchedules.push(schedule);
      await AsyncStorage.setItem('@auto_export_schedules', JSON.stringify(existingSchedules));

      return { success: true, schedule };
    } catch (error) {
      console.error('Error scheduling auto export:', error);
      throw error;
    }
  }

  // Get auto export schedules
  async getAutoExportSchedules() {
    try {
      const schedules = await AsyncStorage.getItem('@auto_export_schedules');
      return schedules ? JSON.parse(schedules) : [];
    } catch (error) {
      console.error('Error getting auto export schedules:', error);
      return [];
    }
  }

  // Calculate next run time
  calculateNextRun(frequency) {
    const now = new Date();
    const next = new Date(now);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        next.setDate(next.getDate() + 7);
    }

    return next.toISOString();
  }
}

// Create singleton instance
const exportManager = new ExportManager();

export default exportManager;