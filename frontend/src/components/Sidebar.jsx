import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaCogs, 
  FaBoxes, 
  FaBus, 
  FaUsers, 
  FaRoute, 
  FaChartBar,
  FaShippingFast,
  FaUserCog
} from 'react-icons/fa';
import { RoleBasedAccess } from './RoleBasedAccess';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const location = useLocation();

  // Define menu items with role requirements
  const menuItems = [
    { 
      path: '/', 
      icon: <FaHome />, 
      text: 'Dashboard',
      module: 'reports',
      action: 'view'
    },
    { 
      path: '/garage', 
      icon: <FaCogs />, 
      text: 'Garage',
      module: 'garage',
      action: 'view'
    },
    { 
      path: '/inventory', 
      icon: <FaBoxes />, 
      text: 'Inventory',
      module: 'inventory',
      action: 'view'
    },
    { 
      path: '/assets', 
      icon: <FaBus />, 
      text: 'Assets',
      module: 'assets',
      action: 'view'
    },
    { 
      path: '/personnel', 
      icon: <FaUsers />, 
      text: 'Personnel',
      module: 'personnel',
      action: 'view'
    },
    // Transport Operations - Temporarily disabled for future updates
    // { 
    //   path: '/transport', 
    //   icon: <FaShippingFast />, 
    //   text: 'Transport Operations',
    //   module: 'transport',
    //   action: 'view'
    // },
    { 
      path: '/users', 
      icon: <FaUserCog />, 
      text: 'User Management',
      module: 'users',
      action: 'view'
    }
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h3>Trinity Management</h3>
        {user && (
          <div className="user-info">
            <small>{user.terminal?.toUpperCase()} Terminal</small>
            <small>{user.role?.replace('_', ' ').toUpperCase()}</small>
          </div>
        )}
      </div>
      <div className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <RoleBasedAccess 
              key={item.path} 
              user={user} 
              module={item.module} 
              action={item.action}
            >
              <li>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-text">{item.text}</span>
                </Link>
              </li>
            </RoleBasedAccess>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;