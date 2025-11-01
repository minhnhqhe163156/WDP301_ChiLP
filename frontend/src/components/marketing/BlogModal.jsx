import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const BlogModal = ({ show, onHide, onSubmit, editingItem, activeTab, data, setBlogs, setShowBlogModal, toast, marketingApi }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    featured_image: null,
    status: 'draft'
  });
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (show && editingItem) {
      setFormData({
        title: editingItem.title || '',
        content: editingItem.content || '',
        category: editingItem.category || '',
        tags: editingItem.tags?.join(', ') || '',
        featured_image: null,
        status: editingItem.status || 'draft'
      });
      setPreview(editingItem.featured_image || '');
    } else {
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: '',
        featured_image: null,
        status: 'draft'
      });
      setPreview('');
    }
  }, [show, editingItem]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, featured_image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('status', formData.status || 'published');
    if (formData.featured_image) {
      formDataToSend.append('featured_image', formData.featured_image);
    }
    onSubmit(formDataToSend);
  };

  const handleAddClick = () => {
    setEditingItem(null); // Reset editingItem
    setShowBlogModal(true);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{editingItem ? 'Edit' : 'Add New'} Blog</Modal.Title>
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
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Featured Image</Form.Label>
            <Form.Control
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
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="primary">
            {editingItem ? 'Update' : 'Create'} Blog
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BlogModal;