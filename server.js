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
  image2: {
    type: String,
    required: true,
  },
  image3: {
    type: String,
    required: true,
  },
  image4: {
    type: String,
    required: true,
  },
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
]);

app.use(express.json());

app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ error: 'File upload error' });
    } else if (err) {
      // An unknown error occurred when uploading
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const { name, price, type, description } = req.body;
      const images = [
        req.files['image1'][0].buffer.toString('base64'),
        req.files['image2'][0].buffer.toString('base64'),
        req.files['image3'][0].buffer.toString('base64'),
        req.files['image4'][0].buffer.toString('base64'),
      ];

      const newProduct = new Product({ name, price, images, type, description });
      const savedProduct = await newProduct.save();

      res.json(savedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
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

    // 確保回傳的商品資訊包含 imageUrl
    const productWithImageUrl = {
      _id: product._id,
      name: product.name,
      price: product.price,
      type: product.type,
      description: product.description,
      imageUrl: `data:image/jpeg;base64,${product.image}`, // 使用商品圖片的 base64 字串
    };

    res.json(productWithImageUrl);
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
