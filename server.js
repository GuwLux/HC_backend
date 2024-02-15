const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

mongoose.connect('mongodb+srv://scsc13579113:Qaz13579113@hcweb.mwb3cmu.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image1: {
    type: String,
    required: true,
  },
  image2: String, // 將 image2~4 欄位設為非必填
  image3: String,
  image4: String,
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Product = mongoose.model('Product', productSchema);

// Middleware to parse JSON requests
app.use(express.json());

// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define routes
app.post('/api/products', upload.fields([
  { name: 'imageFile1', maxCount: 1 },
  { name: 'imageFile2', maxCount: 1 },
  { name: 'imageFile3', maxCount: 1 },
  { name: 'imageFile4', maxCount: 1 },
]), async (req, res) => {
  try {
    const { name, price, type, description } = req.body;
    const imageBuffer1 = req.files['imageFile1'][0].buffer.toString('base64');
    const imageBuffer2 = req.files['imageFile2'] ? req.files['imageFile2'][0].buffer.toString('base64') : null;
    const imageBuffer3 = req.files['imageFile3'] ? req.files['imageFile3'][0].buffer.toString('base64') : null;
    const imageBuffer4 = req.files['imageFile4'] ? req.files['imageFile4'][0].buffer.toString('base64') : null;

    const newProduct = new Product({ name, price, image1: imageBuffer1, image2: imageBuffer2, image3: imageBuffer3, image4: imageBuffer4, type, description });
    const savedProduct = await newProduct.save();

    res.json(savedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 確保回傳的商品資訊包含所有圖片的 imageUrl
    const productWithImages = {
      _id: product._id,
      name: product.name,
      price: product.price,
      type: product.type,
      description: product.description,
      // 如果圖片欄位存在，則將其轉換為 base64 字串
      image1: product.image1 ? `data:image/jpeg;base64,${product.image1}` : null,
      image2: product.image2 ? `data:image/jpeg;base64,${product.image2}` : null,
      image3: product.image3 ? `data:image/jpeg;base64,${product.image3}` : null,
      image4: product.image4 ? `data:image/jpeg;base64,${product.image4}` : null,
    };

    res.json(productWithImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/test", (req, res) => {
  res.json({
    message: "test work!!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
