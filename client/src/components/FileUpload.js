import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload, FiX, FiFile, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete, category = 'general', multiple = false, accept = 'image/*,application/pdf' }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate previews for images
    const imagePreviews = selectedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviews(imagePreviews);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (multiple) {
        files.forEach(file => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', files[0]);
      }

      const response = await axios.post(
        `/api/upload/${multiple ? 'multiple' : 'single'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Files uploaded successfully');
      if (onUploadComplete) {
        onUploadComplete(multiple ? response.data.files : response.data.file);
      }
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  return (
    <div className="file-upload">
      <div className="upload-area">
        <input
          type="file"
          id="file-upload-input"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="file-input"
        />
        <label htmlFor="file-upload-input" className="upload-label">
          <FiUpload />
          <span>Click to select files or drag and drop</span>
          <small>Max 10MB per file</small>
        </label>
      </div>

      {files.length > 0 && (
        <div className="file-preview">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              {previews[index] ? (
                <img src={previews[index]} alt="Preview" className="file-preview-image" />
              ) : (
                <div className="file-icon">
                  {file.type.startsWith('image/') ? <FiImage /> : <FiFile />}
                </div>
              )}
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button className="remove-file" onClick={() => removeFile(index)}>
                <FiX />
              </button>
            </div>
          ))}
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

