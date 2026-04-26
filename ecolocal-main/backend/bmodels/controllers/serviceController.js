const Service = require("../models/Service");

/* ➕ ADD SERVICE (ADMIN ONLY) */
exports.addService = async (req, res) => {
  try {
    // 🔒 Admin check - handled by middleware but defensive check here
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      serviceName,
      description,
      basePrice,
      category,
      providerName
    } = req.body;

    // ✅ Required field validation
    if (
      !serviceName ||
      !description ||
      !basePrice ||
      !category ||
      !providerName
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled (Service Name, Description, Base Price, Category, Provider Name)" });
    }

    const service = new Service({
      ...req.body,
      user: req.user._id
    });

    await service.save();

    res.status(201).json({
      success: true,
      service
    });
  } catch (error) {
    console.error("ADD SERVICE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 📦 GET ALL SERVICES (WITH PAGINATION + SEARCH + FILTERS) */
exports.getServices = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔍 Search by service name / provider
    const keyword = req.query.keyword
      ? {
          $or: [
            { serviceName: { $regex: req.query.keyword, $options: "i" } },
            { providerName: { $regex: req.query.keyword, $options: "i" } }
          ]
        }
      : {};

    // 📂 Category filter
    const category = req.query.category
      ? { category: req.query.category }
      : {};

    // 💰 Price filter
    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceFilter.basePrice = {};
      if (req.query.minPrice) priceFilter.basePrice.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.basePrice.$lte = Number(req.query.maxPrice);
    }

    // 🟢 Status filter
    const status = req.query.status
      ? { status: req.query.status }
      : {};

    // 🔗 Merge filters
    const filter = {
      ...keyword,
      ...category,
      ...priceFilter,
      ...status
    };

    const total = await Service.countDocuments(filter);

    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 🔍 GET SINGLE SERVICE */
exports.getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ✏️ UPDATE SERVICE (ADMIN ONLY) */
exports.updateService = async (req, res) => {
  try {
    // 🔒 Admin check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ❌ DELETE SERVICE (ADMIN ONLY) */
exports.deleteService = async (req, res) => {
  try {
    // 🔒 Admin check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    await service.deleteOne();

    res.json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};