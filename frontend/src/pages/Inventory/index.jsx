import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { inventoryAPI, suppliersAPI, purchaseOrdersAPI } from '../../services/api';
import './Inventory.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);

  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showEditItemForm, setShowEditItemForm] = useState(false);
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showStockMovementForm, setShowStockMovementForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    quantity: '',
    unit: 'pieces',
    minQuantity: '',
    reorderPoint: '',
    unitCost: '',
    supplier: ''
  });

  const [newPurchaseOrder, setNewPurchaseOrder] = useState({
    supplier: '',
    itemName: '',
    quantity: '',
    unitCost: '',
    expectedDelivery: '',
    isNewItem: false
  });

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    phone: '',
    email: ''
  });

  const [newStockMovement, setNewStockMovement] = useState({
    itemName: '',
    type: 'out', // Only 'out' - items being used/consumed
    quantity: '',
    reason: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [inventoryResponse, statsResponse, suppliersResponse, purchaseOrdersResponse] = await Promise.all([
          inventoryAPI.getAll(),
          inventoryAPI.getStats(),
          suppliersAPI.getAll(),
          purchaseOrdersAPI.getAll()
        ]);
        
        setInventory(inventoryResponse.data || []);
        setStats(statsResponse.data || {});
        setSuppliers(suppliersResponse.data || []);
        setPurchaseOrders(purchaseOrdersResponse.data || []);
      } catch (err) {
        console.error('Error fetching inventory data:', err);
        setError(err.message || 'Failed to fetch inventory data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh purchase orders
  const refreshPurchaseOrders = async () => {
    try {
      const response = await purchaseOrdersAPI.getAll();
      setPurchaseOrders(response.data || []);
    } catch (err) {
      console.error('Error refreshing purchase orders:', err);
    }
  };

  // Refresh data after adding/editing
  const refreshData = async () => {
    try {
      const [inventoryResponse, statsResponse] = await Promise.all([
        inventoryAPI.getAll(),
        inventoryAPI.getStats()
      ]);
      
      setInventory(inventoryResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (err) {
      console.error('Error refreshing inventory data:', err);
    }
  };

  // Dashboard Statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity).length;
  const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending').length;
  
  // Financial Statistics
  const totalSpentOnPurchases = purchaseOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalSpentOnReceivedOrders = purchaseOrders
    .filter(order => order.status === 'received')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrdersValue = purchaseOrders
    .filter(order => order.status === 'pending')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Monthly spending (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpending = purchaseOrders
    .filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    switch(formType) {
      case 'item':
        setNewItem({ ...newItem, [name]: value });
        break;
      case 'purchaseOrder':
        setNewPurchaseOrder({ ...newPurchaseOrder, [name]: value });
        break;
      case 'supplier':
        setNewSupplier({ ...newSupplier, [name]: value });
        break;
      case 'stockMovement':
        setNewStockMovement({ ...newStockMovement, [name]: value });
        break;
      default:
        break;
    }
  };

  const handleNestedInputChange = (e, formType) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    
    switch(formType) {
      case 'supplier':
        setNewItem({
          ...newItem,
          supplier: {
            ...newItem.supplier,
            [child]: value
          }
        });
        break;
      default:
        break;
    }
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    
    try {
             const inventoryData = {
         ...newItem,
         quantity: parseInt(newItem.quantity) || 0,
         minQuantity: parseInt(newItem.minQuantity) || 0,
         unitCost: parseFloat(newItem.unitCost) || 0,
         supplier: {
           name: newItem.supplier
         },
         lastUpdated: new Date().toISOString().split('T')[0]
       };
      
      await inventoryAPI.create(inventoryData);
      
      // Refresh the data
      await refreshData();
      
      // Reset form
      setNewItem({
        name: '',
        sku: '',
        category: '',
        description: '',
        quantity: '',
        unit: 'pieces',
        minQuantity: '',
        reorderPoint: '',
        unitCost: '',
        supplier: ''
      });
      
      setShowAddItemForm(false);
    } catch (err) {
      console.error('Error creating inventory item:', err);
      alert(err.message || 'Failed to create inventory item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minQuantity: item.minQuantity.toString(),
      unitCost: item.unitCost.toString(),
      supplier: item.supplier?.name || item.supplier || ''
    });
    setShowEditItemForm(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
             const updatedItem = {
         ...editingItem,
         ...newItem,
         quantity: parseInt(newItem.quantity) || 0,
         minQuantity: parseInt(newItem.minQuantity) || 0,
         unitCost: parseFloat(newItem.unitCost) || 0,
         supplier: {
           name: newItem.supplier
         },
         lastUpdated: new Date().toISOString().split('T')[0]
       };
      
      // Call the backend API to update the item
      await inventoryAPI.update(editingItem._id, updatedItem);
      
      // Refresh the data to get the updated item from backend
      await refreshData();
      
      setNewItem({
        name: '',
        category: '',
        quantity: '',
        minQuantity: '',
        unitCost: '',
        supplier: ''
      });
      setEditingItem(null);
      setShowEditItemForm(false);
    } catch (err) {
      console.error('Error updating inventory item:', err);
      alert(err.message || 'Failed to update inventory item');
    }
  };

  const handleSubmitPurchaseOrder = async (e) => {
    e.preventDefault();
    try {
      // Find the selected item to get its ID
      const selectedItem = inventory.find(item => item.name === newPurchaseOrder.itemName);
      
      if (!selectedItem) {
        alert('Please select a valid item');
        return;
      }

      const purchaseOrderData = {
        supplier: newPurchaseOrder.supplier,
        items: [{
          itemId: selectedItem._id,
          itemName: selectedItem.name,
          quantity: parseInt(newPurchaseOrder.quantity),
          unitCost: parseFloat(newPurchaseOrder.unitCost)
        }],
        expectedDelivery: newPurchaseOrder.expectedDelivery
      };

      // Create purchase order using API
      await purchaseOrdersAPI.create(purchaseOrderData);
      
      // Refresh purchase orders list
      await refreshPurchaseOrders();
      
      setNewPurchaseOrder({
        supplier: '',
        itemName: '',
        quantity: '',
        unitCost: '',
        expectedDelivery: '',
        isNewItem: false
      });
      setShowPurchaseOrderForm(false);
    } catch (err) {
      console.error('Error creating purchase order:', err);
      alert(err.message || 'Failed to create purchase order');
    }
  };

  const handleSubmitSupplier = async (e) => {
    e.preventDefault();
    try {
      await suppliersAPI.create(newSupplier);
      setNewSupplier({
        name: '',
        contact: '',
        phone: '',
        email: ''
      });
      setShowSupplierForm(false);
      // Refresh suppliers list
      const suppliersResponse = await suppliersAPI.getAll();
      setSuppliers(suppliersResponse.data || []);
    } catch (err) {
      console.error('Error creating supplier:', err);
      alert(err.message || 'Failed to create supplier');
    }
  };

  const handleSubmitStockMovement = (e) => {
    e.preventDefault();
    const newMovement = {
      id: Date.now(),
      ...newStockMovement,
      quantity: parseInt(newStockMovement.quantity) || 0,
      date: new Date().toISOString().split('T')[0],
      user: 'Admin' // In real app, this would be the logged-in user
    };

    // Update inventory quantity (only reducing for usage)
    setInventory(inventory.map(item => {
      if (item.name === newStockMovement.itemName) {
        const newQuantity = Math.max(0, item.quantity - newMovement.quantity);
        return { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] };
      }
      return item;
    }));

    setStockMovements([...stockMovements, newMovement]);
    setNewStockMovement({
      itemName: '',
      type: 'out', // Only 'out' - items being used/consumed
      quantity: '',
      reason: ''
    });
    setShowStockMovementForm(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.delete(itemId);
        await refreshData();
      } catch (err) {
        console.error('Error deleting inventory item:', err);
        alert(err.message || 'Failed to delete inventory item');
      }
    }
  };

  const handleMarkOrderReceived = async (orderId) => {
    try {
      // Update purchase order status to received
      await purchaseOrdersAPI.update(orderId, { status: 'received' });
      
      // Refresh both purchase orders and inventory
      await Promise.all([
        refreshPurchaseOrders(),
        refreshData()
      ]);
      
      alert('Purchase order marked as received and inventory updated!');
    } catch (err) {
      console.error('Error marking order as received:', err);
      alert(err.message || 'Failed to mark order as received');
    }
  };

  const handleItemSelection = (itemName) => {
    const selectedItem = inventory.find(item => item.name === itemName);
    if (selectedItem) {
      setNewPurchaseOrder({
        ...newPurchaseOrder,
        itemName: selectedItem.name,
        unitCost: selectedItem.unitCost,
        supplier: selectedItem.supplier,
        isNewItem: false
      });
    } else {
      setNewPurchaseOrder({
        ...newPurchaseOrder,
        itemName: '',
        unitCost: '',
        supplier: '',
        isNewItem: true
      });
    }
  };

  // Spending Analysis Functions
  const getTopSpendingCategory = () => {
    const categorySpending = {};
    purchaseOrders.forEach(order => {
      order.items.forEach(item => {
        const category = inventory.find(inv => inv._id === item.inventoryItem)?.category || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + (item.quantity * item.unitCost);
      });
    });
    
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    return topCategory ? { category: topCategory[0], amount: topCategory[1] } : null;
  };

  const getTopSupplier = () => {
    const supplierSpending = {};
    purchaseOrders.forEach(order => {
      supplierSpending[order.supplier] = (supplierSpending[order.supplier] || 0) + (order.totalAmount || 0);
    });
    
    const topSupplier = Object.entries(supplierSpending)
      .sort(([,a], [,b]) => b - a)[0];
    
    return topSupplier ? { supplier: topSupplier[0], amount: topSupplier[1] } : null;
  };

  const getAverageOrderValue = () => {
    if (purchaseOrders.length === 0) return 0;
    const totalValue = purchaseOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    return Math.round(totalValue / purchaseOrders.length);
  };

  // Filtered Purchase Orders
  const filteredPurchaseOrders = purchaseOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.items.some(item => (item.itemName || item.inventoryItem?.name)?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSupplier = supplierFilter === 'all' || order.supplier === supplierFilter;
    
    let matchesDate = true;
    if (dateFilter === 'this-month') {
      const orderDate = new Date(order.orderDate);
      matchesDate = orderDate.getMonth() === new Date().getMonth() && 
                   orderDate.getFullYear() === new Date().getFullYear();
    } else if (dateFilter === 'last-3-months') {
      const orderDate = new Date(order.orderDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      matchesDate = orderDate >= threeMonthsAgo;
    }
    
    return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
  });

  const getStockStatus = (item) => {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minQuantity) return 'low-stock';
    return 'in-stock';
  };

  const lowStockItemsList = inventory.filter(item => item.quantity <= item.minQuantity && item.quantity > 0);
  const outOfStockItemsList = inventory.filter(item => item.quantity === 0);

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      
      {/* Mini Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{totalItems}</h3>
          <p>Total Items</p>
        </div>
        <div className="stat-card">
          <h3>RWF {totalInventoryValue.toLocaleString()}</h3>
          <p>Current Value</p>
        </div>
        <div className="stat-card">
          <h3>RWF {totalSpentOnReceivedOrders.toLocaleString()}</h3>
          <p>Total Spent</p>
        </div>
        <div className="stat-card">
          <h3>RWF {monthlySpending.toLocaleString()}</h3>
          <p>This Month</p>
        </div>
      </div>

      

      {(lowStockItemsList.length > 0 || outOfStockItemsList.length > 0) && (
        <div className="alert warning">
          <strong>Stock Alerts:</strong> 
          {lowStockItemsList.length > 0 && ` ${lowStockItemsList.length} low stock items`}
          {outOfStockItemsList.length > 0 && ` ${outOfStockItemsList.length} out of stock items`}
        </div>
      )}

      {pendingOrders > 0 && (
        <div className="alert info">
          <strong>Purchase Orders:</strong> {pendingOrders} pending order(s) awaiting delivery
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => setShowAddItemForm(true)} className="action-btn">
          Add Item
        </button>
        <button onClick={() => setShowPurchaseOrderForm(true)} className="action-btn">
          Create Purchase Order
        </button>
        <button onClick={() => setShowSupplierForm(true)} className="action-btn">
          Add Supplier
        </button>
        <button onClick={() => setShowStockMovementForm(true)} className="action-btn">
          Record Stock Usage
        </button>
      </div>

            {/* Inventory List */}
      <div className="inventory-list">
        <h3>Inventory Items</h3>
        <div className="table-container">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading inventory items...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={refreshData} className="retry-btn">Retry</button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Cost</th>
                    <th>Total Value</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                              {inventory.map((item) => (
                  <tr key={item._id} className={`stock-${getStockStatus(item)}`}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>RWF {item.unitCost?.toLocaleString() || '0'}</td>
                    <td>RWF {item.totalValue?.toLocaleString() || '0'}</td>
                    <td>{item.supplier?.name || 'N/A'}</td>
                   <td>
                     <span className={`status ${getStockStatus(item)}`}>
                       {getStockStatus(item) === 'out-of-stock' && 'Out of Stock'}
                       {getStockStatus(item) === 'low-stock' && 'Low Stock'}
                       {getStockStatus(item) === 'in-stock' && 'In Stock'}
                     </span>
                   </td>
                   <td>
                     <div className="action-controls">
                       <button 
                         onClick={() => handleEditItem(item)}
                         className="edit-btn"
                         title="Edit Item"
                       >
                         Edit
                       </button>
                       <button 
                         onClick={() => handleDeleteItem(item._id)}
                         className="delete-btn"
                         title="Delete Item"
                       >
                         Delete
                       </button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
            </>
          )}
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="purchase-orders-list">
        <div className="section-header">
          <h3>Purchase Orders</h3>
          
          {/* Search and Filter Controls */}
          <div className="search-filter-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search items or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
              </select>
              
              <select 
                value={supplierFilter} 
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Suppliers</option>
                                 {suppliers.map(supplier => (
                   <option key={supplier._id} value={supplier.name}>{supplier.name}</option>
                 ))}
              </select>
              
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="this-month">This Month</option>
                <option value="last-3-months">Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Spending Analysis Dashboard */}
        <div className="spending-dashboard">
          <div className="spending-stat-card">
            <h4>Top Category</h4>
            <div className="spending-value">
              {getTopSpendingCategory()?.category || 'N/A'}
            </div>
            <div className="spending-amount">
              RWF {getTopSpendingCategory()?.amount.toLocaleString() || '0'}
            </div>
          </div>
          
          <div className="spending-stat-card">
            <h4>Top Supplier</h4>
            <div className="spending-value">
              {getTopSupplier()?.supplier || 'N/A'}
            </div>
            <div className="spending-amount">
              RWF {getTopSupplier()?.amount.toLocaleString() || '0'}
            </div>
          </div>
          
          <div className="spending-stat-card">
            <h4>Average Order</h4>
            <div className="spending-value">
              RWF {getAverageOrderValue().toLocaleString()}
            </div>
            <div className="spending-subtitle">
              per order
            </div>
          </div>
          
          <div className="spending-stat-card">
            <h4>Orders Found</h4>
            <div className="spending-value">
              {filteredPurchaseOrders.length}
            </div>
            <div className="spending-subtitle">
              of {purchaseOrders.length} total
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total Cost</th>
                <th>Order Date</th>
                <th>Expected Delivery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchaseOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.supplier}</td>
                                     <td>
                     {order.items.map(item => `${item.itemName || item.inventoryItem?.name || 'Unknown Item'} (${item.quantity})`).join(', ')}
                   </td>
                  <td>RWF {order.totalAmount?.toLocaleString() || '0'}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleMarkOrderReceived(order._id)} 
                        className="status-btn"
                      >
                        Mark Received
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPurchaseOrders.length === 0 && (
            <div className="no-results">
              <p>No purchase orders found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stock Usage */}
      <div className="stock-movements-list">
        <h3>Stock Usage</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Quantity Used</th>
                <th>Reason</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements.map((movement) => (
                <tr key={movement.id}>
                  <td>{movement.date}</td>
                  <td>{movement.itemName}</td>
                  <td>{movement.quantity}</td>
                  <td>{movement.reason}</td>
                  <td>{movement.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suppliers */}
      <div className="suppliers-list">
        <h3>Suppliers</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier._id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

             {/* Add Item Form Modal */}
       {showAddItemForm && (
         <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header">
               <h3>Add Inventory Item</h3>
               <button onClick={() => setShowAddItemForm(false)} className="close-btn">
                 &times;
               </button>
             </div>
             <form onSubmit={handleSubmitItem} className="modal-form">
               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="itemName">Item Name *</label>
                   <input
                     type="text"
                     id="itemName"
                     name="name"
                     value={newItem.name}
                     onChange={(e) => handleInputChange(e, 'item')}
                     required
                     placeholder="Enter item name"
                   />
                 </div>
                 <div className="form-group">
                   <label htmlFor="sku">SKU *</label>
                   <input
                     type="text"
                     id="sku"
                     name="sku"
                     value={newItem.sku}
                     onChange={(e) => handleInputChange(e, 'item')}
                     required
                     placeholder="Enter SKU code"
                     style={{ textTransform: 'uppercase' }}
                   />
                 </div>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="category">Category *</label>
                   <select
                     id="category"
                     name="category"
                     value={newItem.category}
                     onChange={(e) => handleInputChange(e, 'item')}
                     required
                   >
                     <option value="">Select Category</option>
                     <option value="Lubricants">Lubricants</option>
                     <option value="Brake System">Brake System</option>
                     <option value="Filters">Filters</option>
                     <option value="Electrical">Electrical</option>
                     <option value="Tires">Tires</option>
                     <option value="Tools">Tools</option>
                     <option value="Safety Equipment">Safety Equipment</option>
                     <option value="Consumables">Consumables</option>
                     <option value="Spare Parts">Spare Parts</option>
                     <option value="Other">Other</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label htmlFor="unit">Unit *</label>
                   <select
                     id="unit"
                     name="unit"
                     value={newItem.unit}
                     onChange={(e) => handleInputChange(e, 'item')}
                     required
                   >
                     <option value="pieces">Pieces</option>
                     <option value="liters">Liters</option>
                     <option value="sets">Sets</option>
                     <option value="pairs">Pairs</option>
                     <option value="boxes">Boxes</option>
                     <option value="meters">Meters</option>
                     <option value="kg">Kilograms</option>
                     <option value="other">Other</option>
                   </select>
                 </div>
               </div>

               <div className="form-group">
                 <label htmlFor="description">Description</label>
                 <textarea
                   id="description"
                   name="description"
                   value={newItem.description}
                   onChange={(e) => handleInputChange(e, 'item')}
                   placeholder="Enter item description"
                   rows="3"
                 />
               </div>

               <div className="form-group">
                 <label htmlFor="supplier">Supplier *</label>
                 <select
                   id="supplier"
                   name="supplier"
                   value={newItem.supplier}
                   onChange={(e) => handleInputChange(e, 'item')}
                   required
                 >
                   <option value="">Select Supplier</option>
                   {suppliers.map(supplier => (
                     <option key={supplier._id} value={supplier.name}>
                       {supplier.name}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="quantity">Initial Quantity *</label>
                                        <input
                       type="number"
                       id="quantity"
                       name="quantity"
                       value={newItem.quantity}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       required
                       placeholder="0"
                     />
                 </div>
                 <div className="form-group">
                   <label htmlFor="minQuantity">Minimum Quantity *</label>
                                        <input
                       type="number"
                       id="minQuantity"
                       name="minQuantity"
                       value={newItem.minQuantity}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       required
                       placeholder="0"
                     />
                 </div>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="reorderPoint">Reorder Point</label>
                                        <input
                       type="number"
                       id="reorderPoint"
                       name="reorderPoint"
                       value={newItem.reorderPoint}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       placeholder="0"
                     />
                 </div>
                 <div className="form-group">
                   <label htmlFor="unitCost">Unit Cost (RWF) *</label>
                                        <input
                       type="number"
                       id="unitCost"
                       name="unitCost"
                       value={newItem.unitCost}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       required
                       placeholder="0"
                     />
                 </div>
               </div>


               
               <div className="form-actions">
                 <button type="button" onClick={() => setShowAddItemForm(false)} className="cancel-btn">
                   Cancel
                 </button>
                 <button type="submit" className="submit-btn">
                   Add Item
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Edit Item Form Modal */}
       {showEditItemForm && (
         <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header">
               <h3>Edit Inventory Item</h3>
               <button onClick={() => setShowEditItemForm(false)} className="close-btn">
                 &times;
               </button>
             </div>
             <form onSubmit={handleUpdateItem} className="modal-form">
               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="editItemName">Item Name:</label>
                   <input
                     type="text"
                     id="editItemName"
                     name="name"
                     value={newItem.name}
                     onChange={(e) => handleInputChange(e, 'item')}
                     required
                   />
                 </div>
                 <div className="form-group">
                   <label htmlFor="editCategory">Category:</label>
                   <select
                     id="editCategory"
                     name="category"
                     value={newItem.category}
                     onChange={(e) => handleInputChange(e, 'item')}
                     required
                   >
                     <option value="">Select Category</option>
                     <option value="Lubricants">Lubricants</option>
                     <option value="Brake System">Brake System</option>
                     <option value="Filters">Filters</option>
                     <option value="Electrical">Electrical</option>
                     <option value="Tires">Tires</option>
                     <option value="Tools">Tools</option>
                     <option value="Other">Other</option>
                   </select>
                 </div>
               </div>

               <div className="form-group">
                 <label htmlFor="editSupplier">Supplier:</label>
                 <select
                   id="editSupplier"
                   name="supplier"
                   value={newItem.supplier}
                   onChange={(e) => handleInputChange(e, 'item')}
                   required
                 >
                   <option value="">Select Supplier</option>
                   {suppliers.map(supplier => (
                     <option key={supplier._id} value={supplier.name}>
                       {supplier.name}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="editQuantity">Current Quantity:</label>
                                        <input
                       type="number"
                       id="editQuantity"
                       name="quantity"
                       value={newItem.quantity}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       required
                     />
                 </div>
                 <div className="form-group">
                   <label htmlFor="editMinQuantity">Minimum Quantity:</label>
                                        <input
                       type="number"
                       id="editMinQuantity"
                       name="minQuantity"
                       value={newItem.minQuantity}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       required
                     />
                 </div>
               </div>

               <div className="form-group">
                 <label htmlFor="editUnitCost">Unit Cost (RWF):</label>
                                      <input
                       type="number"
                       id="editUnitCost"
                       name="unitCost"
                       value={newItem.unitCost}
                       onChange={(e) => handleInputChange(e, 'item')}
                       min="0"
                       step="any"
                       required
                     />
               </div>
               
               <div className="form-actions">
                 <button type="button" onClick={() => setShowEditItemForm(false)} className="cancel-btn">
                   Cancel
                 </button>
                 <button type="submit" className="submit-btn">
                   Update Item
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

      {/* Add Supplier Form Modal */}
      {showSupplierForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Supplier</h3>
              <button onClick={() => setShowSupplierForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitSupplier} className="modal-form">
              <div className="form-group">
                <label htmlFor="supplierName">Supplier Name:</label>
                <input
                  type="text"
                  id="supplierName"
                  name="name"
                  value={newSupplier.name}
                  onChange={(e) => handleInputChange(e, 'supplier')}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact">Contact Person:</label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={newSupplier.contact}
                    onChange={(e) => handleInputChange(e, 'supplier')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newSupplier.phone}
                    onChange={(e) => handleInputChange(e, 'supplier')}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newSupplier.email}
                  onChange={(e) => handleInputChange(e, 'supplier')}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowSupplierForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Form Modal */}
      {showStockMovementForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record Stock Usage</h3>
              <button onClick={() => setShowStockMovementForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitStockMovement} className="modal-form">
              <div className="form-group">
                <label htmlFor="movementItem">Item:</label>
                <select
                  id="movementItem"
                  name="itemName"
                  value={newStockMovement.itemName}
                  onChange={(e) => handleInputChange(e, 'stockMovement')}
                  required
                >
                                     <option value="">Select Item</option>
                   {inventory.map(item => (
                     <option key={item._id} value={item.name}>
                       {item.name} (Current: {item.quantity})
                     </option>
                   ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="movementQuantity">Quantity:</label>
                  <input
                    type="number"
                    id="movementQuantity"
                    name="quantity"
                    value={newStockMovement.quantity}
                    onChange={(e) => handleInputChange(e, 'stockMovement')}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="movementReason">Reason:</label>
                  <input
                    type="text"
                    id="movementReason"
                    name="reason"
                    value={newStockMovement.reason}
                    onChange={(e) => handleInputChange(e, 'stockMovement')}
                    placeholder="e.g., Work Order, Manual Usage, Loss, etc."
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowStockMovementForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Record Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Order Form Modal */}
      {showPurchaseOrderForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Purchase Order</h3>
              <button onClick={() => setShowPurchaseOrderForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitPurchaseOrder} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="poSupplier">Supplier:</label>
                  <select
                    id="poSupplier"
                    name="supplier"
                    value={newPurchaseOrder.supplier}
                    onChange={(e) => handleInputChange(e, 'purchaseOrder')}
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                                 <div className="form-group">
                   <label htmlFor="poItemName">Item Name:</label>
                   <select
                     id="poItemName"
                     name="itemName"
                     value={newPurchaseOrder.itemName}
                     onChange={(e) => handleItemSelection(e.target.value)}
                     required
                   >
                                           <option value="">Select Item</option>
                      {inventory.map(item => (
                        <option key={item._id} value={item.name}>
                          {item.name} (Current: {item.quantity})
                        </option>
                      ))}
                      <option value="new">+ Add New Item</option>
                   </select>
                 </div>
              </div>

                             {newPurchaseOrder.isNewItem && (
                 <div className="alert info">
                   <strong>New Item:</strong> Please add this item to inventory first, then create the purchase order.
                   <button 
                     type="button" 
                     onClick={() => setShowAddItemForm(true)}
                     className="action-btn"
                     style={{ marginLeft: '10px' }}
                   >
                     Add New Item
                   </button>
                 </div>
               )}

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="poQuantity">Quantity:</label>
                   <input
                     type="number"
                     id="poQuantity"
                     name="quantity"
                     value={newPurchaseOrder.quantity}
                     onChange={(e) => handleInputChange(e, 'purchaseOrder')}
                     min="1"
                     required
                   />
                 </div>
                 <div className="form-group">
                   <label htmlFor="poUnitCost">Unit Cost (RWF):</label>
                   <input
                     type="number"
                     id="poUnitCost"
                     name="unitCost"
                     value={newPurchaseOrder.unitCost}
                     onChange={(e) => handleInputChange(e, 'purchaseOrder')}
                     min="0"
                     required
                     disabled={!newPurchaseOrder.isNewItem}
                   />
                 </div>
               </div>

              <div className="form-group">
                <label htmlFor="poExpectedDelivery">Expected Delivery Date:</label>
                <input
                  type="date"
                  id="poExpectedDelivery"
                  name="expectedDelivery"
                  value={newPurchaseOrder.expectedDelivery}
                  onChange={(e) => handleInputChange(e, 'purchaseOrder')}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowPurchaseOrderForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

