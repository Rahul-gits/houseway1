import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import premium components
import FoldedPanel from '../../components/premium/FoldedPanel';
import InvoicePreviewCard from '../../components/premium/InvoicePreviewCard';
import GradientButton from '../../components/premium/GradientButton';

// Import theme
import { colors, typography, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const CreateInvoiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId, projectId } = route.params || {};

  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    projectName: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    paymentTerms: 'Net 30',
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      }
    ],
    taxRate: 8.5,
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountValue: 0,
    notes: '',
  });

  const [expandedSections, setExpandedSections] = useState({
    client: true,
    lineItems: true,
    taxes: false,
    discount: false,
    payment: false,
    attachments: false,
    notes: false,
  });

  const mockClients = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'Emily Rodriguez' },
  ];

  const mockProjects = [
    { id: '1', name: 'Kitchen Renovation' },
    { id: '2', name: 'Master Bathroom' },
    { id: '3', name: 'Living Room Design' },
  ];

  const paymentTermsOptions = [
    'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', '50% Upfront'
  ];

  useEffect(() => {
    // Auto-populate client and project if provided
    if (clientId) {
      const client = mockClients.find(c => c.id === clientId);
      if (client) {
        setInvoiceData(prev => ({ ...prev, clientName: client.name }));
      }
    }

    if (projectId) {
      const project = mockProjects.find(p => p.id === projectId);
      if (project) {
        setInvoiceData(prev => ({ ...prev, projectName: project.name }));
      }
    }
  }, [clientId, projectId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const discountAmount = invoiceData.discountType === 'percentage'
      ? subtotal * (invoiceData.discountValue / 100)
      : invoiceData.discountValue;
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
    };
  };

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeLineItem = (itemId) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    }
  };

  const updateLineItem = (itemId, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }

          // Auto-calculate rate when amount changes
          if (field === 'amount' && updatedItem.quantity > 0) {
            updatedItem.rate = updatedItem.amount / updatedItem.quantity;
          }

          return updatedItem;
        }
        return item;
      })
    }));
  };

  const handleSaveDraft = () => {
    if (!invoiceData.clientName.trim()) {
      Alert.alert('Missing Information', 'Please select a client');
      return;
    }

    // Save draft logic here
    console.log('Saving draft:', invoiceData);
    Alert.alert('Draft Saved', 'Your invoice has been saved as a draft');
    navigation.goBack();
  };

  const handleSaveAndSend = () => {
    if (!invoiceData.clientName.trim()) {
      Alert.alert('Missing Information', 'Please select a client');
      return;
    }

    if (!invoiceData.items.some(item => item.description.trim() && item.amount > 0)) {
      Alert.alert('Missing Items', 'Please add at least one line item with description and amount');
      return;
    }

    // Save and send logic here
    console.log('Saving and sending invoice:', invoiceData);
    Alert.alert(
      'Invoice Created',
      'Your invoice has been created and sent to the client',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const { subtotal, taxAmount, discountAmount, totalAmount } = calculateTotals();

  const renderClientInfo = () => (
    <FoldedPanel
      title="Client & Project Information"
      icon={<Ionicons name="person" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.client}
      onExpand={() => toggleSection('client')}
      variant="default"
    >
      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Invoice Number:</Text>
          <Text style={styles.invoiceNumber}>{invoiceData.invoiceNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Client:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => {
              // In real app, this would open a client selector
              Alert.alert('Client Selector', 'Client selection would open here');
            }}
          >
            <Text style={styles.selectorText}>
              {invoiceData.clientName || 'Select Client'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7487C1" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Project:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => {
              // In real app, this would open a project selector
              Alert.alert('Project Selector', 'Project selection would open here');
            }}
          >
            <Text style={styles.selectorText}>
              {invoiceData.projectName || 'Select Project'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7487C1" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Issue Date:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => {
              // In real app, this would open a date picker
              Alert.alert('Date Picker', 'Date selection would open here');
            }}
          >
            <Text style={styles.selectorText}>{invoiceData.issueDate}</Text>
            <Ionicons name="calendar" size={16} color="#7487C1" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Due Date:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => {
              // In real app, this would open a date picker
              Alert.alert('Date Picker', 'Due date selection would open here');
            }}
          >
            <Text style={styles.selectorText}>{invoiceData.dueDate}</Text>
            <Ionicons name="calendar" size={16} color="#7487C1" />
          </TouchableOpacity>
        </View>
      </View>
    </FoldedPanel>
  );

  const renderLineItems = () => (
    <FoldedPanel
      title="Line Items"
      icon={<Ionicons name="list" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.lineItems}
      onExpand={() => toggleSection('lineItems')}
      variant="primary"
    >
      <View style={styles.lineItemsContainer}>
        {invoiceData.items.map((item, index) => (
          <View key={item.id} style={styles.lineItem}>
            <View style={styles.lineItemHeader}>
              <Text style={styles.lineItemTitle}>Item {index + 1}</Text>
              {invoiceData.items.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeLineItem(item.id)}
                >
                  <Ionicons name="remove-circle" size={20} color="#D75A5A" />
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.descriptionInput}
              placeholder="Description"
              placeholderTextColor={colors.text.muted}
              value={item.description}
              onChangeText={(value) => updateLineItem(item.id, 'description', value)}
            />

            <View style={styles.itemRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="1"
                  placeholderTextColor={colors.text.muted}
                  value={item.quantity.toString()}
                  onChangeText={(value) => updateLineItem(item.id, 'quantity', parseFloat(value) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Rate</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.muted}
                  value={item.rate.toString()}
                  onChangeText={(value) => updateLineItem(item.id, 'rate', parseFloat(value) || 0)}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={[styles.numberInput, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.muted}
                  value={item.amount.toString()}
                  onChangeText={(value) => updateLineItem(item.id, 'amount', parseFloat(value) || 0)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addItemButton}
          onPress={addLineItem}
        >
          <Ionicons name="add" size={20} color="#3E60D8" />
          <Text style={styles.addItemText}>Add Line Item</Text>
        </TouchableOpacity>
      </View>
    </FoldedPanel>
  );

  const renderTaxes = () => (
    <FoldedPanel
      title="Taxes"
      icon={<Ionicons name="receipt" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.taxes}
      onExpand={() => toggleSection('taxes')}
      variant="secondary"
    >
      <View style={styles.taxesContainer}>
        <View style={styles.taxRow}>
          <Text style={styles.taxLabel}>Tax Rate (%)</Text>
          <TextInput
            style={styles.taxInput}
            placeholder="8.5"
            placeholderTextColor={colors.text.muted}
            value={invoiceData.taxRate.toString()}
            onChangeText={(value) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(value) || 0 }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.taxSummary}>
          <Text style={styles.taxSummaryLabel}>Tax Amount:</Text>
          <Text style={styles.taxSummaryValue}>${taxAmount.toFixed(2)}</Text>
        </View>
      </View>
    </FoldedPanel>
  );

  const renderDiscount = () => (
    <FoldedPanel
      title="Discount"
      icon={<Ionicons: name="pricetag" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.discount}
      onExpand={() => toggleSection('discount')}
      variant="secondary"
    >
      <View style={styles.discountContainer}>
        <View style={styles.discountTypeRow}>
          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              invoiceData.discountType === 'percentage' && styles.discountTypeActive
            ]}
            onPress={() => setInvoiceData(prev => ({ ...prev, discountType: 'percentage' }))}
          >
            <Text style={[
              styles.discountTypeText,
              invoiceData.discountType === 'percentage' && styles.discountTypeTextActive
            ]}>
              Percentage
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              invoiceData.discountType === 'fixed' && styles.discountTypeActive
            ]}
            onPress={() => setInvoiceData(prev => ({ ...prev, discountType: 'fixed' }))}
          >
            <Text style={[
              styles.discountTypeText,
              invoiceData.discountType === 'fixed' && styles.discountTypeTextActive
            ]}>
              Fixed Amount
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.discountValueRow}>
          <Text style={styles.discountLabel}>
            Discount ({invoiceData.discountType === 'percentage' ? '%' : '$'}):
          </Text>
          <TextInput
            style={styles.discountInput}
            placeholder="0"
            placeholderTextColor={colors.text.muted}
            value={invoiceData.discountValue.toString()}
            onChangeText={(value) => setInvoiceData(prev => ({ ...prev, discountValue: parseFloat(value) || 0 }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.discountSummary}>
          <Text style={styles.discountSummaryLabel}>Discount Amount:</Text>
          <Text style={styles.discountSummaryValue}>-${discountAmount.toFixed(2)}</Text>
        </View>
      </View>
    </FoldedPanel>
  );

  const renderPaymentTerms = () => (
    <FoldedPanel
      title="Payment Terms"
      icon={<Ionicons name="card" size={20} color="#3E60D8" />}
      initiallyExpanded={expandedSections.payment}
      onExpand={() => toggleSection('payment')}
      variant="default"
    >
      <View style={styles.paymentContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paymentTermsScroll}
        >
          {paymentTermsOptions.map((term) => (
            <TouchableOpacity
              key={term}
              style={[
                styles.paymentTermButton,
                invoiceData.paymentTerms === term && styles.paymentTermActive
              ]}
              onPress={() => setInvoiceData(prev => ({ ...prev, paymentTerms: term }))}
            >
              <Text
                style={[
                  styles.paymentTermText,
                  invoiceData.paymentTerms === term && styles.paymentTermTextActive
                ]}
              >
                {term}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </FoldedPanel>
  );

  const renderLivePreview = () => (
    <View style={styles.previewSection}>
      <Text style={styles.previewTitle}>Live Preview</Text>
      <InvoicePreviewCard
        invoice={{
          invoiceNumber: invoiceData.invoiceNumber,
          client: { name: invoiceData.clientName || 'Sample Client' },
          project: { name: invoiceData.projectName || 'Sample Project' },
          status: 'draft',
          totalAmount: totalAmount,
          issueDate: invoiceData.issueDate,
          dueDate: invoiceData.dueDate,
          daysUntilDue: 30,
          items: invoiceData.items.filter(item => item.description.trim()),
          paymentStatus: 'Pending',
        }}
        onPress={() => console.log('Preview pressed')}
        showActions={false}
      />
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.draftButton}
        onPress={handleSaveDraft}
      >
        <Text style={styles.draftButtonText}>Save Draft</Text>
      </TouchableOpacity>

      <GradientButton
        title={`Save & Send ($${totalAmount.toFixed(2)})`}
        gradientColors={['#3E60D8', '#566FE0']}
        onPress={handleSaveAndSend}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FBF7EE', '#F8F1E6', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Invoice</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderClientInfo()}
          {renderLineItems()}
          {renderTaxes()}
          {renderDiscount()}
          {renderPaymentTerms()}
          {renderLivePreview()}
          {renderActionButtons()}

          <View style={styles.spacer} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.beige[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.display,
    color: colors.text.primary,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxxxl,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  invoiceNumber: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    fontWeight: '700',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.glass,
    borderWidth: shapes.glass.borderWidth,
    borderColor: shapes.glass.borderColor,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectorText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  lineItemsContainer: {
    gap: spacing.md,
  },
  lineItem: {
    backgroundColor: colors.background.accent,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  lineItemTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    fontWeight: '600',
  },
  removeButton: {
    padding: spacing.xs,
  },
  descriptionInput: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  numberInput: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    textAlign: 'center',
  },
  amountInput: {
    backgroundColor: colors.beige[100],
    borderColor: colors.blue[200],
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.blue[500],
    backgroundColor: 'rgba(62, 96, 216, 0.05)',
    gap: spacing.sm,
  },
  addItemText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.blue[500],
    fontWeight: '600',
  },
  taxesContainer: {
    gap: spacing.md,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxLabel: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  taxInput: {
    width: 80,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    textAlign: 'center',
  },
  taxSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.lg,
  },
  taxSummaryLabel: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  taxSummaryValue: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    fontWeight: '700',
  },
  discountContainer: {
    gap: spacing.md,
  },
  discountTypeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  discountTypeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.beige[200],
    alignItems: 'center',
  },
  discountTypeActive: {
    backgroundColor: colors.blue[500],
  },
  discountTypeText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  discountTypeTextActive: {
    color: colors.text.white,
  },
  discountValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountLabel: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  discountInput: {
    width: 100,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    textAlign: 'center',
  },
  discountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.lg,
  },
  discountSummaryLabel: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  discountSummaryValue: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.heading,
    color: colors.danger[500],
    fontWeight: '700',
  },
  paymentContainer: {
    gap: spacing.md,
  },
  paymentTermsScroll: {
    gap: spacing.sm,
  },
  paymentTermButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.beige[200],
  },
  paymentTermActive: {
    backgroundColor: colors.blue[500],
  },
  paymentTermText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  paymentTermTextActive: {
    color: colors.text.white,
  },
  previewSection: {
    marginVertical: spacing.xl,
  },
  previewTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  draftButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.beige[300],
    alignItems: 'center',
  },
  draftButtonText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  spacer: {
    height: spacing.xxxxxl,
  },
});

export default CreateInvoiceScreen;