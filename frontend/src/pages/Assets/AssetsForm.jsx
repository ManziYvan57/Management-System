import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import './Assets.css';

const AssetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    assignedTo: '',
    purchaseDate: '',
    warrantyExpiration: '',
    status: ''
  });

  useEffect(() => {
    const assets = JSON.parse(localStorage.getItem('assets') || '[]');
    if (isEditing && assets) {
      const assetToEdit = assets.find(asset => asset.id === Number(id));
      if (assetToEdit) {
        setFormData(assetToEdit);
      }
    }
  }, [id, isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let assets = JSON.parse(localStorage.getItem('assets') || '[]');

    if (isEditing) {
      // Update existing asset
      assets = assets.map(asset =>
        asset.id === Number(id) ? { ...formData, id: Number(id) } : asset
      );
    } else {
      // Add new asset
      const newAsset = { ...formData, id: Date.now() };
      assets = [...assets, newAsset];
    }
    localStorage.setItem('assets', JSON.stringify(assets));
    navigate('/assets');
  };

  return (
    <Layout title={isEditing ? 'Edit IT Asset' : 'Add New IT Asset'}>
      <div className="asset-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asset Name / Tag:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Asset Type:</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Assigned To:</label>
            <input
              type="text"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="Enter name or leave blank if unassigned"
            />
          </div>

          <div className="form-group">
            <label>Purchase Date:</label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Warranty Expiration Date:</label>
            <input
              type="date"
              value={formData.warrantyExpiration}
              onChange={(e) => setFormData({ ...formData, warrantyExpiration: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Status:</label>
            <input
              type="text"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/assets')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {isEditing ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AssetForm;
