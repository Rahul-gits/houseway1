import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// Using a custom picker solution for better cross-platform compatibility
import { useAuth } from '../../../context/AuthContext';
import { projectsAPI, usersAPI } from '../../../utils/api';

const CreateProjectScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectType: 'residential',
    designStyle: 'modern',
    priority: 'medium',
    client: '',
    budget: {
      estimated: '',
      currency: 'USD',
    },
    timeline: {
      startDate: '',
      expectedEndDate: '',
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
    specifications: {
      area: '',
      areaUnit: 'sqft',
      floors: '',
      bedrooms: '',
      bathrooms: '',
      parking: '',
    },
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await usersAPI.getUsers({ role: 'client', limit: 100 });
      if (response.success) {
        setClients(response.data.users || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Project title is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Project description is required');
      return false;
    }
    if (!formData.client) {
      Alert.alert('Validation Error', 'Please select a client');
      return false;
    }
    if (!formData.budget.estimated || isNaN(formData.budget.estimated)) {
      Alert.alert('Validation Error', 'Please enter a valid budget amount');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const projectData = {
        ...formData,
        budget: {
          ...formData.budget,
          estimated: parseFloat(formData.budget.estimated),
          actual: 0,
        },
        specifications: {
          ...formData.specifications,
          area: formData.specifications.area ? parseInt(formData.specifications.area) : 0,
          floors: formData.specifications.floors ? parseInt(formData.specifications.floors) : 1,
          bedrooms: formData.specifications.bedrooms ? parseInt(formData.specifications.bedrooms) : 0,
          bathrooms: formData.specifications.bathrooms ? parseInt(formData.specifications.bathrooms) : 0,
          parking: formData.specifications.parking ? parseInt(formData.specifications.parking) : 0,
        },
        timeline: {
          ...formData.timeline,
          startDate: formData.timeline.startDate ? new Date(formData.timeline.startDate) : new Date(),
          expectedEndDate: formData.timeline.expectedEndDate ? new Date(formData.timeline.expectedEndDate) : null,
        },
        status: 'planning',
        progress: {
          percentage: 0,
          milestones: [],
        },
        assignedEmployees: [user._id],
        createdBy: user._id,
      };

      const response = await projectsAPI.createProject(projectData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Project created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const FormSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={{...styles.input, ...(multiline && styles.multilineInput)}}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const PickerField = ({ label, selectedValue, onValueChange, items }) => {
    const [showPicker, setShowPicker] = useState(false);

    const selectedItem = items.find(item => item.value === selectedValue);

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={{...styles.pickerButtonText, ...(!selectedItem && styles.placeholderText)}}>
            {selectedItem ? selectedItem.label : 'Select an option'}
          </Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.pickerModal}>
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerOptions}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={{
                      ...styles.pickerOption,
                      ...(selectedValue === item.value && styles.selectedOption)
                    }}
                    onPress={() => {
                      onValueChange(item.value);
                      setShowPicker(false);
                    }}
                  >
                    <Text style={{
                      ...styles.pickerOptionText,
                      ...(selectedValue === item.value && styles.selectedOptionText)
                    }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Project</Text>
          <Text style={styles.headerSubtitle}>Fill in the project details</Text>
        </View>

        <FormSection title="Basic Information">
          <InputField
            label="Project Title *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Enter project title"
          />

          <InputField
            label="Description *"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe the project"
            multiline={true}
          />

          <PickerField
            label="Project Type"
            selectedValue={formData.projectType}
            onValueChange={(value) => handleInputChange('projectType', value)}
            items={[
              { label: 'Residential', value: 'residential' },
              { label: 'Commercial', value: 'commercial' },
              { label: 'Renovation', value: 'renovation' },
              { label: 'Interior Design', value: 'interior' },
            ]}
          />

          <PickerField
            label="Design Style"
            selectedValue={formData.designStyle}
            onValueChange={(value) => handleInputChange('designStyle', value)}
            items={[
              { label: 'Modern', value: 'modern' },
              { label: 'Contemporary', value: 'contemporary' },
              { label: 'Traditional', value: 'traditional' },
              { label: 'Minimalist', value: 'minimalist' },
              { label: 'Industrial', value: 'industrial' },
              { label: 'Rustic', value: 'rustic' },
            ]}
          />

          <PickerField
            label="Priority"
            selectedValue={formData.priority}
            onValueChange={(value) => handleInputChange('priority', value)}
            items={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]}
          />

          <PickerField
            label="Client *"
            selectedValue={formData.client}
            onValueChange={(value) => handleInputChange('client', value)}
            items={[
              { label: 'Select a client', value: '' },
              ...clients.map(client => ({
                label: `${client.firstName} ${client.lastName}`,
                value: client._id,
              })),
            ]}
          />
        </FormSection>

        <FormSection title="Budget & Timeline">
          <InputField
            label="Estimated Budget *"
            value={formData.budget.estimated}
            onChangeText={(value) => handleInputChange('estimated', value, 'budget')}
            placeholder="Enter budget amount"
            keyboardType="numeric"
          />

          <InputField
            label="Start Date"
            value={formData.timeline.startDate}
            onChangeText={(value) => handleInputChange('startDate', value, 'timeline')}
            placeholder="YYYY-MM-DD"
          />

          <InputField
            label="Expected End Date"
            value={formData.timeline.expectedEndDate}
            onChangeText={(value) => handleInputChange('expectedEndDate', value, 'timeline')}
            placeholder="YYYY-MM-DD"
          />
        </FormSection>

        <FormSection title="Location">
          <InputField
            label="Address"
            value={formData.location.address}
            onChangeText={(value) => handleInputChange('address', value, 'location')}
            placeholder="Street address"
          />

          <InputField
            label="City"
            value={formData.location.city}
            onChangeText={(value) => handleInputChange('city', value, 'location')}
            placeholder="City"
          />

          <InputField
            label="State"
            value={formData.location.state}
            onChangeText={(value) => handleInputChange('state', value, 'location')}
            placeholder="State"
          />

          <InputField
            label="ZIP Code"
            value={formData.location.zipCode}
            onChangeText={(value) => handleInputChange('zipCode', value, 'location')}
            placeholder="ZIP Code"
            keyboardType="numeric"
          />
        </FormSection>

        <FormSection title="Specifications">
          <InputField
            label="Total Area (sq ft)"
            value={formData.specifications.area}
            onChangeText={(value) => handleInputChange('area', value, 'specifications')}
            placeholder="Total area"
            keyboardType="numeric"
          />

          <InputField
            label="Number of Floors"
            value={formData.specifications.floors}
            onChangeText={(value) => handleInputChange('floors', value, 'specifications')}
            placeholder="Number of floors"
            keyboardType="numeric"
          />

          <InputField
            label="Bedrooms"
            value={formData.specifications.bedrooms}
            onChangeText={(value) => handleInputChange('bedrooms', value, 'specifications')}
            placeholder="Number of bedrooms"
            keyboardType="numeric"
          />

          <InputField
            label="Bathrooms"
            value={formData.specifications.bathrooms}
            onChangeText={(value) => handleInputChange('bathrooms', value, 'specifications')}
            placeholder="Number of bathrooms"
            keyboardType="numeric"
          />

          <InputField
            label="Parking Spaces"
            value={formData.specifications.parking}
            onChangeText={(value) => handleInputChange('parking', value, 'specifications')}
            placeholder="Number of parking spaces"
            keyboardType="numeric"
          />
        </FormSection>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{...styles.submitButton, ...(isLoading && styles.disabledButton)}}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Create Project</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  pickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerClose: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  pickerOptions: {
    maxHeight: 300,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default CreateProjectScreen;
