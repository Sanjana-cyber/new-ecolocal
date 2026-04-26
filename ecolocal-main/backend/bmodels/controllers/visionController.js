const axios = require('axios');
const Product = require('../models/Product');

/**
 * @desc    Search products using Google Vision API labels
 * @route   POST /api/vision-search
 * @access  Public (or Private if you prefer)
 */
const visionSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const apiKey = process.env.VISION_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Vision API Key missing in server configuration' });
    }

    // 1. Convert buffer to base64
    const imageBase64 = req.file.buffer.toString('base64');

    // 2. Prepare request for Google Vision API
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const visionRequest = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
        }
      ]
    };

    // 3. Call Google Vision API
    const response = await axios.post(visionUrl, visionRequest);
    const labels = response.data.responses[0]?.labelAnnotations || [];
    
    if (labels.length === 0) {
      return res.json({ success: true, products: [], labels: [], message: 'No labels detected' });
    }

    const detectedDescriptions = labels.map(l => l.description.toLowerCase());
    console.log('Detected labels:', detectedDescriptions);

    // 4. Search MongoDB for products matching these labels
    // We'll search in name, category, and description using regex
    const searchQuery = {
      $or: detectedDescriptions.flatMap(label => [
        { name: { $regex: label, $options: 'i' } },
        { category: { $regex: label, $options: 'i' } },
        { description: { $regex: label, $options: 'i' } }
      ])
    };

    const matchedProducts = await Product.find(searchQuery).limit(20);

    res.json({
      success: true,
      labels: detectedDescriptions,
      products: matchedProducts,
      count: matchedProducts.length
    });

  } catch (error) {
    console.error('Vision Search Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Internal server error during visual search' });
  }
};

module.exports = { visionSearch };
