import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicleService';
import { toast } from 'react-toastify';

const AdminVehicleMediaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const load = () => {
    setLoading(true);
    vehicleService.getOne(id)
      .then(data => setVehicle(data))
      .catch(() => toast.error('Error loading vehicle'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length + (vehicle.images?.length || 0) > 10) {
      toast.error('Maximum of 10 images per vehicle');
      return;
    }

    setUploadingImages(true);
    try {
      const updated = await vehicleService.uploadImages(id, files);
      setVehicle(updated);
      toast.success('Images uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Error uploading images');
    } finally {
      setUploadingImages(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      setVideoDuration(videoEl.duration);
      if (videoEl.duration > 12) {
        toast.warn('Video is longer than 10 seconds. Consider trimming it before upload — Supabase Storage does not auto-trim videos (unlike the earlier Cloudinary setup).');
      }
    };
    videoEl.src = URL.createObjectURL(file);
  };

  const handleVideoUpload = async () => {
    const file = videoInputRef.current?.files[0];
    if (!file) {
      toast.error('Please choose a video file first');
      return;
    }

    setUploadingVideo(true);
    try {
      const updated = await vehicleService.uploadVideo(id, file);
      setVehicle(updated);
      toast.success('Video uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Error uploading video');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
      setVideoDuration(null);
    }
  };

  const handleDeleteImage = async (imagePath) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const updated = await vehicleService.deleteImage(id, imagePath);
      setVehicle(updated);
      toast.success('Image deleted');
    } catch (err) {
      toast.error(err.message || 'Error deleting image');
    }
  };

  if (loading) return <div className="spinner" />;
  if (!vehicle) return <p>Vehicle not found.</p>;

  return (
    <div>
      <div style={styles.header}>
        <h1>Media: {vehicle.year} {vehicle.make} {vehicle.model}</h1>
        <Link to="/admin/vehicles" className="btn btn-secondary">← Back to Vehicles</Link>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Images ({vehicle.images?.length || 0} / 10)</h3>

        <div className="grid grid-4" style={{ marginBottom: '16px' }}>
          {(vehicle.images || []).map((img) => (
            <div key={img.path} style={styles.imageBox}>
              <img src={img.url} alt="Vehicle" style={styles.image} />
              <button style={styles.removeBtn} onClick={() => handleDeleteImage(img.path)}>✕</button>
            </div>
          ))}
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          ref={imageInputRef}
          onChange={handleImageUpload}
          disabled={uploadingImages || (vehicle.images?.length || 0) >= 10}
        />
        {uploadingImages && <p style={{ marginTop: '8px' }}>Uploading images...</p>}
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
          Upload up to 10 high-resolution images. Recommended: 1200x800px or larger.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Video Showcase (10 seconds)</h3>

        {vehicle.video?.url ? (
          <video src={vehicle.video.url} controls style={{ maxWidth: '400px', borderRadius: '8px', marginBottom: '16px' }} />
        ) : (
          <p style={{ color: '#6B7280', marginBottom: '16px' }}>No video uploaded yet.</p>
        )}

        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={handleVideoSelect}
        />
        {videoDuration && (
          <p style={{ marginTop: '8px' }}>Selected video duration: {videoDuration.toFixed(1)}s</p>
        )}
        <button
          className="btn btn-primary"
          style={{ marginTop: '12px' }}
          onClick={handleVideoUpload}
          disabled={uploadingVideo}
        >
          {uploadingVideo ? 'Uploading...' : vehicle.video?.url ? 'Replace Video' : 'Upload Video'}
        </button>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>
          Please trim clips to ~10 seconds before uploading. Max file size 50MB.
        </p>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/admin/vehicles')}>Done</button>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  imageBox: { position: 'relative', height: '120px', borderRadius: '8px', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  removeBtn: {
    position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.9)',
    color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer'
  }
};

export default AdminVehicleMediaPage;
