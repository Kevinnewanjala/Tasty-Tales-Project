import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import NavBar from '../navbar';
import Footer from '../footer';
import "bootstrap/dist/css/bootstrap.min.css";
import '../form.css'; // Import common styles
import { Modal, Button } from 'react-bootstrap'; // Import Modal and Button from react-bootstrap

const API_URL=process.env.REACT_APP_API

const UserProfile = () => {
  const { logout, user, loading } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/user/userinfo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUserInfo(response.data);
        setEmail(response.data.email);
        setUsername(response.data.username);
        setProfilePhoto(response.data.profilePhoto); // Assuming the API returns a profilePhoto URL
      } catch (err) {
        setError(err);
      }
    };

    if (user) {
      fetchUserInfo();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const handleDeleteUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete(`${API_URL}/user/delete_user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        localStorage.removeItem('token');
        navigate('/signup');
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    try {
      const response = await axios.put(`${API_URL}/user/update_user`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setMessage('Profile updated successfully!');
        setProfilePhoto(null); // Reset profile photo input
        setPreviewPhoto(null); // Reset preview photo
      }
    } catch (error) {
      setMessage('Error updating profile.');
      console.error("Error updating profile:", error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading user info: {error.message}</p>;
  if (!userInfo) return <p>Loading user info...</p>;

  return (
    <>
      <NavBar />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: '100vh',
          backgroundImage: 'url(https://images.creativemarket.com/0.1.0/ps/106400/1360/1924/m1/fpnw/wm1/ivphkooyxa5a2riftjbhe9r3zbipqlfc4wvwflk7o0xk0xfqrfb45nywjoukmedn-.jpg?1399222065&s=792b3e1cc37d2bbf9408ae4455aec6c6)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="p-5 rounded shadow"
          style={{
            width: '100%',
            maxWidth: '600px', // Adjusted for user profile card
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Increased transparency
            backdropFilter: 'blur(5px)', // Blur effect for the background
            borderRadius: '10px', // Rounded corners
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' // Subtle shadow for depth
          }}
        >
          <h1 className="text-center mb-4" style={{ color: 'black' }}>My Profile</h1>
          <div className="text-center mb-4">
            <div className="profile-photo">
              {previewPhoto ? (
                <img src={previewPhoto} alt="Profile" className="img-thumbnail" style={{ width: '150px', height: '150px' }} />
              ) : (
                <img src={userInfo.profilePhoto || 'default-profile.png'} alt="Profile" className="img-thumbnail" style={{ width: '150px', height: '150px' }} />
              )}
            </div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="form-control mt-3" />
            <h3>{userInfo.username}</h3>
            <p className="text-muted">{userInfo.email}</p>
          </div>
          <h4 className="mb-3">Update Profile</h4>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Update</button>
          </form>
          {message && <div className="alert alert-info mt-3">{message}</div>}
          <div className="d-flex justify-content-between mt-4">
            <button className="btn btn-warning" onClick={() => setShowLogoutModal(true)}>Logout</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete Account</button>
          </div>
        </div>
      </div>
      <Footer />

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete your account? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserProfile;
