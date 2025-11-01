import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const PromotionModal = ({ show, onHide, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    discount_rate: '',
    start_date: '',
    end_date: '',
    target_audience: ''
  });

  useEffect(() => {
    if (show && editingItem) {
      setFormData({
        name: editingItem.name || '',
        discount_rate: editingItem.discount_rate || '',
        start_date: editingItem.start_date ? editingItem.start_date.slice(0,10) : '',
        end_date: editingItem.end_date ? editingItem.end_date.slice(0,10) : '',
        target_audience: editingItem.target_audience || ''
      });
    } else {
      setFormData({
        name: '',
        discount_rate: '',
        start_date: '',
        end_date: '',
        target_audience: ''
      });
    }
  }, [show, editingItem]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editingItem ? 'Edit' : 'Add New'} Promotion</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Discount Rate (%)</Form.Label>
            <Form.Control
              name="discount_rate"
              type="number"
              value={formData.discount_rate}
              onChange={handleChange}
              required
              min={0}
              max={100}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Target Audience</Form.Label>
            <Form.Control
              name="target_audience"
              type="text"
              value={formData.target_audience}
              onChange={handleChange}
            />
          </Form.Group>
          <Button type="submit" variant="primary">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PromotionModal;