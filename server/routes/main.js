import express from 'express';
import Post from '../models/Post.js';
const router = express.Router();

// GET --> HOME
router.get('/', async (req, res) => {
  try {
    const perPage = 10;
    const page = req.query.page || 1; // page-1 by default

    const data = await Post.aggregate([{ $sort: { createdAt: 1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', {
      title: "Divya's Blog",
      description: "This blog is powered using NodeJS, Express & MongoDB.",
      currentRoute: '/',
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

// GET --> Post: id
router.get('/post/:id', async (req, res) => {
  try {
    const slug = req.params.id;
    const data = await Post.findById({ _id: slug });

    res.render('post', {
      title: data.title,
      description: "This blog is powered using NodeJS, Express & MongoDB.",
      currentRoute: '/post',
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

// POST --> searchTerm
router.post('/search', async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
      ]
    }).lean();

    const uniqueResults = Array.from(
      new Map(data.map(post => [post._id.toString(), post])).values()
    );

    res.render('search', {
      title: "Search",
      description: "This blog is powered using NodeJS, Express & MongoDB.",
      currentRoute: '/search',
      data: uniqueResults,
    });
  } catch (error) {
    console.log(error);
  }
});

// GET --> About
router.get('/about', (req, res) => {
  res.render('about', {
    currentRoute: '/about',
  });
});

// GET --> Contact
router.get('/contact', (req, res) => {
  res.render('contact', {
    currentRoute: '/contact',
  });
});
export default router;
