import { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiFileText } from 'react-icons/fi';
import API from '../utils/api';
import { toast } from 'react-toastify';
import './BookingModal.css';

const BookingModal = ({ service, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    city: service?.city || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post('/bookings', {
        service: service._id,
        ...formData
      });
      toast.success(data.message || 'Booking created successfully!');
      onSuccess?.(data.booking);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose} id="booking-modal">
      <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Service</h3>
          <button className="modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="modal-service-info">
          <h4>{service?.title}</h4>
          <p className="modal-price">
            PKR {service?.price?.toLocaleString()}
            {service?.priceType === 'hourly' ? '/hr' : ' (fixed)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">
              <FiCalendar size={16} /> Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              required
              className="form-input"
              id="booking-date"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiClock size={16} /> Preferred Time
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="form-input"
              id="booking-time"
            >
              <option value="">Select a time</option>
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="01:00 PM">01:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
              <option value="07:00 PM">07:00 PM</option>
              <option value="08:00 PM">08:00 PM</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiMapPin size={16} /> Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              required
              className="form-input"
              id="booking-address"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiMapPin size={16} /> City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="form-input"
              id="booking-city"
            >
              <option value="">Select city</option>
              <option value="Abbottabad">Abbottabad</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Lahore">Lahore</option>
              <option value="Karachi">Karachi</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Multan">Multan</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FiFileText size={16} /> Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions..."
              rows={3}
              className="form-input form-textarea"
              id="booking-notes"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Booking...' : `Confirm Booking — PKR ${service?.price?.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
