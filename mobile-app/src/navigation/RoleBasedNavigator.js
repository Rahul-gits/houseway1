import React from 'react';
import { useAuth } from '../context/AuthContext';

// Import role-specific navigators
import OwnerNavigator from './OwnerNavigator';
import ClientManagementNavigator from './ClientManagementNavigator'; // New Client Management Navigator
import VendorNavigator from './VendorNavigator';
import ClientNavigator from './ClientNavigator';
import GuestNavigator from './GuestNavigator';

const RoleBasedNavigator = () => {
  const { user } = useAuth();

  if (!user) {
    return <GuestNavigator />;
  }

  switch (user.role) {
    case 'owner':
      return <OwnerNavigator />;
    case 'employee':
      return <EmployeeNavigator />;
    case 'vendor':
      return <VendorNavigator />;
    case 'client':
      return <ClientNavigator />;
    case 'guest':
    default:
      return <GuestNavigator />;
  }
};

export default RoleBasedNavigator;
