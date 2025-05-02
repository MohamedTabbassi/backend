const mongoose = require('mongoose');

const ServiceCategories = {
  REMORQUAGE: 'REMORQUAGE',
  MECANIQUE: 'MECANIQUE',
  PIECE_AUTO: 'PIECE_AUTO',
  LOCATION_VOITURE: 'LOCATION_VOITURE'
};

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  category: {
    type: String,
    enum: Object.values(ServiceCategories),
    required: [true, 'Please specify a category']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Fields for specific service types
  // For REMORQUAGE
  vehicleType: String,
  distance: Number,
  urgency: String,
  
  // For PIECE_AUTO
  brand: String,
  model: String,
  year: Number,
  partNumber: String,
  
  // For MECANIQUE
  repairType: String,
  estimatedTime: String,
  toolsRequired: String,
  
  // For LOCATION_VOITURE
  carBrand: String,
  carModel: String,
  fuelType: String,
  transmission: String,
  rentalDuration: String
}, {
  discriminatorKey: 'category',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a virtual for bookings
serviceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'serviceId',
  justOne: false
});

const Service = mongoose.model('Service', serviceSchema);

// Create discriminators for specific service types
const Remorquage = Service.discriminator(
  ServiceCategories.REMORQUAGE,
  new mongoose.Schema({
    vehicleType: {
      type: String,
      required: [true, 'Please provide vehicle type']
    },
    distance: {
      type: Number
    },
    urgency: {
      type: String
    }
  })
);

const PieceAuto = Service.discriminator(
  ServiceCategories.PIECE_AUTO,
  new mongoose.Schema({
    brand: {
      type: String,
      required: [true, 'Please provide brand']
    },
    model: {
      type: String,
      required: [true, 'Please provide model']
    },
    year: {
      type: Number
    },
    partNumber: {
      type: String
    }
  })
);

const Mecanique = Service.discriminator(
  ServiceCategories.MECANIQUE,
  new mongoose.Schema({
    repairType: {
      type: String,
      required: [true, 'Please provide repair type']
    },
    estimatedTime: {
      type: String
    },
    toolsRequired: {
      type: String
    }
  })
);

const LocationVoiture = Service.discriminator(
  ServiceCategories.LOCATION_VOITURE,
  new mongoose.Schema({
    carBrand: {
      type: String,
      required: [true, 'Please provide car brand']
    },
    carModel: {
      type: String,
      required: [true, 'Please provide car model']
    },
    year: {
      type: Number
    },
    fuelType: {
      type: String
    },
    transmission: {
      type: String
    },
    rentalDuration: {
      type: String
    }
  })
);

module.exports = {
  Service,
  Remorquage,
  PieceAuto,
  Mecanique,
  LocationVoiture,
  ServiceCategories
};