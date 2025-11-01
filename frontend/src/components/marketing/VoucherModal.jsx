import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';


const VoucherModal = ({ show, onHide, onSubmit, editingItem }) => {
  const [formData, setFormData] = useState({
    voucher_code: '',
    discount_value: '',
    start_date: '',
    end_date: '',
    minimum_purchase: '',
    maximum_discount: '',
    usage_limit: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        voucher_code: editingItem.voucher_code || '',
        discount_value: editingItem.discount_value || '',
        start_date: editingItem.start_date ? new Date(editingItem.start_date).toISOString().split('T')[0] : '',
        end_date: editingItem.end_date ? new Date(editingItem.end_date).toISOString().split('T')[0] : '',
        minimum_purchase: editingItem.minimum_purchase || '',
        maximum_discount: editingItem.maximum_discount || '',
        usage_limit: editingItem.usage_limit || ''
      });
    } else {
      setFormData({
        voucher_code: '',
        discount_value: '',
        start_date: '',
        end_date: '',
        minimum_purchase: '',
        maximum_discount: '',
        usage_limit: ''
      });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Validate giống backend
    const codeRegex = /^[A-Z0-9_-]{4,20}$/;
    if (!formData.voucher_code || !codeRegex.test(formData.voucher_code)) {
      setError('Mã voucher phải 4-20 ký tự, chỉ gồm chữ hoa, số, gạch ngang/gạch dưới, không ký tự đặc biệt.');
      return;
    }
    const discountValue = Number(formData.discount_value);
    if (!discountValue || discountValue <= 0) {
      setError('Giá trị giảm phải là số dương.');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      setError('Phải có ngày bắt đầu và ngày kết thúc.');
      return;
    }
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (isNaN(start) || isNaN(end)) {
      setError('Ngày không hợp lệ.');
      return;
    }
    if (end <= start) {
      setError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }
    if (end <= new Date()) {
      setError('Ngày kết thúc phải sau thời điểm hiện tại.');
      return;
    }
    const minPurchase = Number(formData.minimum_purchase);
    if (isNaN(minPurchase) || minPurchase < 0) {
      setError('Giá trị đơn tối thiểu phải >= 0.');
      return;
    }
    
    const usageLimit = Number(formData.usage_limit);
    if (!usageLimit || usageLimit <= 0 || !Number.isInteger(usageLimit)) {
      setError('Số lượt sử dụng phải >=0');
      return;
    }
    // Nếu hợp lệ, gửi dữ liệu
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingItem ? 'Edit Voucher' : 'Create New Voucher'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          <Form.Group className="mb-3">
            <Form.Label>Voucher Code</Form.Label>
            <Form.Control
              type="text"
              name="voucher_code"
              value={formData.voucher_code}
              onChange={handleChange}
              placeholder="Enter voucher code"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Discount Value (%)</Form.Label>
            <Form.Control
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              placeholder="Enter discount percentage"
              min="0"
              max="100"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Minimum Purchase Amount</Form.Label>
            <Form.Control
              type="number"
              name="minimum_purchase"
              value={formData.minimum_purchase}
              onChange={handleChange}
              placeholder="Enter minimum purchase amount"
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Maximum Discount Amount</Form.Label>
            <Form.Control
              type="number"
              name="maximum_discount"
              value={formData.maximum_discount}
              onChange={handleChange}
              placeholder="Enter maximum discount amount"
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Usage Limit</Form.Label>
            <Form.Control
              type="number"
              name="usage_limit"
              value={formData.usage_limit}
              onChange={handleChange}
              placeholder="Enter usage limit"
              min="1"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingItem ? 'Update' : 'Create'} Voucher
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default VoucherModal; 