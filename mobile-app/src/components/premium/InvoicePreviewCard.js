import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const InvoicePreviewCard = ({
  invoice,
  onPress,
  onStatusChange,
  showActions = true,
  compact = false,
  style = null,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#7DB87A';
      case 'sent':
        return '#3E60D8';
      case 'overdue':
        return '#D75A5A';
      case 'draft':
        return '#C9B89A';
      default:
        return '#7487C1';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return 'checkmark-circle';
      case 'sent':
        return 'send';
      case 'overdue':
        return 'warning';
      case 'draft':
        return 'document';
      default:
        return 'document-text';
    }
  };

  const getUrgencyLevel = (daysUntilDue) => {
    if (daysUntilDue < 0) return { level: 'overdue', color: '#D75A5A' };
    if (daysUntilDue <= 3) return { level: 'urgent', color: '#E8B25D' };
    if (daysUntilDue <= 7) return { level: 'due-soon', color: '#566FE0' };
    return { level: 'normal', color: '#7DB87A' };
  };

  const statusColor = getStatusColor(invoice.status);
  const statusIcon = getStatusIcon(invoice.status);
  const urgency = getUrgencyLevel(invoice.daysUntilDue);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);
  };

  const formatDueDate = (daysUntilDue) => {
    if (daysUntilDue < 0) {
      return `${Math.abs(daysUntilDue)} days overdue`;
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysUntilDue} days`;
    }
  };

  const renderInvoiceHeader = () => (
    <LinearGradient
      colors={[statusColor, `${statusColor}CC`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.invoiceHeader}
    >
      <View style={styles.invoiceNumber}>
        <Text style={styles.invoiceNumberText}>
          INV-{invoice.invoiceNumber}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Ionicons
          name={statusIcon}
          size={16}
          color="#FFFFFF"
          style={styles.statusIcon}
        />
        <Text style={styles.statusText}>{invoice.status}</Text>
      </View>
    </LinearGradient>
  );

  const renderInvoiceBody = () => (
    <View style={styles.invoiceBody}>
      {/* Amount and due date */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>{formatCurrency(invoice.totalAmount)}</Text>

        <View style={styles.dueDateSection}>
          <Ionicons
            name="time"
            size={14}
            color={urgency.color}
            style={styles.dueDateIcon}
          />
          <Text style={[styles.dueDateText, { color: urgency.color }]}>
            {formatDueDate(invoice.daysUntilDue)}
          </Text>
        </View>
      </View>

      {/* Client and project info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Client:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {invoice.client?.name || 'Unknown Client'}
          </Text>
        </View>

        {invoice.project && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Project:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {invoice.project.name}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items:</Text>
          <Text style={styles.infoValue}>{invoice.items?.length || 0}</Text>
        </View>
      </View>

      {/* Line items preview */}
      {!compact && invoice.items && invoice.items.length > 0 && (
        <View style={styles.itemsPreview}>
          <Text style={styles.itemsTitle}>Recent Items</Text>
          {invoice.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemDescription} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={styles.itemAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
          {invoice.items.length > 2 && (
            <Text style={styles.moreItemsText}>
              +{invoice.items.length - 2} more items
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderInvoiceFooter = () => (
    <View style={styles.invoiceFooter}>
      {/* Payment status */}
      <View style={styles.paymentStatus}>
        <View
          style={[
            styles.paymentIndicator,
            { backgroundColor: urgency.color },
          ]}
        />
        <Text style={styles.paymentStatusText}>
          {invoice.paymentStatus || 'Pending'}
        </Text>
      </View>

      {/* Issue date */}
      <Text style={styles.issueDate}>
        Issued: {new Date(invoice.issueDate).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionButtons}>
        {invoice.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => onStatusChange?.(invoice, 'sent')}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
        )}

        {invoice.status === 'sent' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.markPaidButton]}
            onPress={() => onStatusChange?.(invoice, 'paid')}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mark Paid</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onPress?.(invoice)}
        >
          <Ionicons name="eye" size={16} color="#3E60D8" />
          <Text style={[styles.actionButtonText, styles.viewButtonText]}>
            View
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(invoice)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FBF7EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardGradient}
      >
        {renderInvoiceHeader()}
        {renderInvoiceBody()}
        {renderInvoiceFooter()}
        {renderActions()}
      </LinearGradient>

      {/* Left blue gradient band */}
      <LinearGradient
        colors={[statusColor, `${statusColor}66`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.leftBand}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1B2540',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  cardGradient: {
    flex: 1,
  },
  leftBand: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  invoiceNumber: {
    flex: 1,
  },
  invoiceNumberText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'InterDisplay-Bold',
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  invoiceBody: {
    padding: 16,
    marginLeft: 6, // Account for left band
  },
  amountSection: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'InterDisplay-Bold',
    color: '#1B2540',
    marginBottom: 8,
  },
  dueDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateIcon: {
    marginRight: 6,
  },
  dueDateText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#1B2540',
    textAlign: 'right',
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#1B2540',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemDescription: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#566FE0',
    marginRight: 12,
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#1B2540',
  },
  moreItemsText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#7487C1',
    fontStyle: 'italic',
    marginTop: 4,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    marginLeft: 6,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#1B2540',
  },
  issueDate: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: '#C9B89A',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    marginLeft: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sendButton: {
    backgroundColor: '#3E60D8',
  },
  markPaidButton: {
    backgroundColor: '#7DB87A',
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3E60D8',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  viewButtonText: {
    color: '#3E60D8',
  },
});

export default InvoicePreviewCard;