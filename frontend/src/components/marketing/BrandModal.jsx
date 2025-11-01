import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const BrandModal = ({ show, onHide, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    logo: ''
  });

  useEffect(() => {
    if (show && editingItem) {
      setFormData({
        name: editingItem.name || '',
        logo: editingItem.logo || ''
      });
    } else if (show) {
      setFormData({ name: '', logo: '' });
    }
  }, [show, editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingItem ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên thương hiệu</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên thương hiệu"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Logo (URL)</Form.Label>
            <Form.Control
              type="text"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="Dán link logo"
              required
            />
          </Form.Group>

          {formData.logo && (
            <div className="mb-3 text-center">
              <img src={formData.logo} alt="Logo preview" style={{ maxWidth: '100%', height: '100px', objectFit: 'contain' }} />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BrandModal; 