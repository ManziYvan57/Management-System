import React from 'react';

// Role-based access control component
const RoleBasedAccess = ({ user, module, action = 'view', children, fallback = null }) => {
  // If no user, don't render anything
  if (!user) {
    return fallback;
  }

  // Super admin can access everything
  if (user.role === 'super_admin') {
    return children;
  }

  // Check if user has permission for the module and action
  const hasPermission = user.permissions && 
    user.permissions[module] && 
    user.permissions[module][action];

  if (hasPermission) {
    return children;
  }

  return fallback;
};

// Terminal-based access control component
const TerminalBasedAccess = ({ user, allowedTerminals = [], children, fallback = null }) => {
  // If no user, don't render anything
  if (!user) {
    return fallback;
  }

  // Super admin can access all terminals
  if (user.role === 'super_admin') {
    return children;
  }

  // Check if user's terminal is in allowed terminals
  const hasTerminalAccess = allowedTerminals.includes(user.terminal);

  if (hasTerminalAccess) {
    return children;
  }

  return fallback;
};

// Combined role and terminal access
const AccessControl = ({ user, module, action = 'view', allowedTerminals = [], children, fallback = null }) => {
  return (
    <RoleBasedAccess user={user} module={module} action={action} fallback={fallback}>
      <TerminalBasedAccess user={user} allowedTerminals={allowedTerminals} fallback={fallback}>
        {children}
      </TerminalBasedAccess>
    </RoleBasedAccess>
  );
};

export { RoleBasedAccess, TerminalBasedAccess, AccessControl };
