// ✅ FULL RESTORED server.js with booking, applications, uploads, updates
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your_secret_key';

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://localhost:27017/userAuth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  phone: String,
  skills: String,
  profilePicture: { type: String, default: '' }
});

const User = mongoose.model('User', UserSchema);

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  serviceName: String,
  serviceTime: String,
  paymentAmount: Number,
  status: { type: String, default: 'Pending' }
});

const Booking = mongoose.model('Booking', BookingSchema);

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  jobTitle: String,
  jobAddress: String,
  jobTime: String,
  notes: String,
  appliedAt: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model('JobApplication', ApplicationSchema);

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/register', async (req, res) => {
  const { name, email, password, location, phone, skills } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, location, phone, skills });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid Token' });
  }
});

app.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imagePath = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(decoded.id, { profilePicture: imagePath }, { new: true }).select('-password');
    res.json({ message: 'Profile picture updated', profilePicture: imagePath });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const imagePath = `/uploads/${req.file.filename}`;
    user.profilePicture = imagePath;
    await user.save();
    res.json({ message: 'Profile picture updated successfully', profilePicture: imagePath });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.skills !== undefined) user.skills = req.body.skills;
    if (req.body.location !== undefined) user.location = req.body.location;

    await user.save();
    res.json({ message: "Profile updated successfully!", user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/book', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const { serviceName, serviceTime, paymentAmount } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const booking = new Booking({
      userId: user._id,
      userName: user.name,
      serviceName,
      serviceTime,
      paymentAmount
    });

    await booking.save();
    res.status(201).json({ message: 'Service booked successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');

    const usersWithBookings = await Promise.all(
      users.map(async (user) => {
        const bookings = await Booking.find({ userId: user._id });
        return {
          ...user._doc,
          bookings
        };
      })
    );

    res.json(usersWithBookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/my-bookings', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const bookings = await Booking.find({ userId: decoded.id });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/my-applications', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const applications = await JobApplication.find({ userId: decoded.id });
    res.json(applications);
  } catch (err) {
    console.error("Error loading applications:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/apply-job', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const { jobTitle, jobAddress, jobTime, notes } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newApplication = new JobApplication({
      userId: user._id,
      userName: user.name,
      jobTitle,
      jobAddress,
      jobTime,
      notes
    });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (err) {
    console.error("Error saving application:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
