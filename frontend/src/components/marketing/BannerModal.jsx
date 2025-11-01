import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const BannerModal = ({ show, onHide, onSubmit, editingItem, blogs = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    blog_id: ''
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (show && editingItem) {
      setFormData({
        title: editingItem.title || '',
        image: null,
        blog_id: editingItem.blog_id?._id || editingItem.blog_id || ''
      });
      setPreview(editingItem.image_url || '');
    } else if (show) {
      setFormData({
        title: '',
        image: null,
        blog_id: ''
      });
      setPreview('');
    }
  }, [show, editingItem]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
    if (formData.blog_id) {
      formDataToSend.append('blog_id', formData.blog_id);
    }
    onSubmit(formDataToSend);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editingItem ? 'Edit Banner' : 'Add New Banner'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Banner Image</Form.Label>
            <Form.Control
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!editingItem}
            />
          </Form.Group>

          {preview && (
            <div className="mb-3">
              <img 
                src={preview} 
                alt="Preview" 
                style={{ maxWidth: '100%', height: '200px', objectFit: 'cover' }}
              />
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Blog (Optional)</Form.Label>
            <Form.Select
              value={formData.blog_id}
              onChange={e => setFormData({...formData, blog_id: e.target.value})}
            >
              <option value="">-- No Blog --</option>
              {blogs.map(blog => (
                <option key={blog._id} value={blog._id}>
                  {blog.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BannerModal;