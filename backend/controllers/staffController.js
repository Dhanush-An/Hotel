const Staff = require('../models/Staff');
const User = require('../models/User');

const normalizeRole = (role) => (role || '').toLowerCase().replace(/[\s-]/g, '');

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const data = req.body;
    const staff = await Staff.create(data);

    // Also create login record in User model
    if (data.email && data.password) {
      await User.create({
        name: data.name,
        email: data.email,
        mobile: data.phone,
        password: data.password,
        photo: data.photo,
        role: normalizeRole(data.role),
      });
    }

    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const oldStaff = await Staff.findById(req.params.id);
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });

    // Update login record in User model
    if (staff && staff.email) {
      let user = await User.findOne({ email: oldStaff.email || staff.email });
      
      if (!user) {
        // Create user if not exists
        user = new User({
          name: staff.name,
          email: staff.email,
          mobile: staff.phone,
          password: req.body.password || '123456', // Default if none
          role: normalizeRole(staff.role)
        });
      } else {
        // Update existing user
        user.name = staff.name;
        user.email = staff.email;
        user.mobile = staff.phone;
        user.photo = staff.photo;
        user.role = normalizeRole(staff.role);
        if (req.body.password) {
          user.password = req.body.password; // Trigger pre-save hook
        }
      }
      
      await user.save();
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (staff) {
      // Also delete the login record
      await User.findOneAndDelete({ email: staff.email });
      await Staff.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStaff, createStaff, updateStaff, deleteStaff };
