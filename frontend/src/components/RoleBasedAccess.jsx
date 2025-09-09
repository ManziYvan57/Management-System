import React from 'react';

// Role-based access control component
const RoleBasedAccess = ({ user, module, action = 'view', children, fallback = null }) => {
  // If no user, don't render anything
  if (!user) {
    return fallback;
  }

  // Super admin or admin can access everything
  if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'Admin') {
    return children;
  }

  // Check if user has permission for the module and action
  const hasPermission = user.permissions && 
    user.permissions[module] && 
    user.permissions[module][action];

  // HR role: read-only, no access to Users
  if (user.role === 'hr' || user.role === 'HR') {
    if (module === 'users') return fallback;
    if (action !== 'view' && action !== 'export') return fallback;
    return children;
  }

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

  // Admin can access all terminals
  if (user.role === 'admin') {
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
