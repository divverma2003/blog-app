 import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import brcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

const adminLayout = '../views/layouts/admin.ejs';
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({messge: 'Unauthorized'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        return res.status(401).json({messge: 'Unauthorized'});

    }
}

// GET -> Admin Login Page
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Login",
      description: "This blog is powered using NodeJS, Express & MongoDB.",
      currentRoute: '/admin',
    };

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// GET -> Admin: Create a new post
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "This blog is powered using NodeJS, Express & MongoDB.",
      currentRoute: '/add-post',
    };

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong.");
  }
});

// POST -> Admin: Create a new post
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });

    await newPost.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);

    const locals = {
      title: 'Add Post',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/add-post',
      postMessage: 'Aw, something went wrong! Unable to publish post!',
      postStatus: 'error',
    };

    res.render('admin/add-post', { locals, layout: adminLayout });
  }
});

// GET -> Admin: Update a post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const data = await Post.findOne({ _id: req.params.id });

    const locals = {
      title: 'Edit Post',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/edit-post',
    };

    res.render('admin/edit-post', { data, locals, layout: adminLayout });
  } catch (error) {
    console.error(error);
  }
});

// PUT -> Admin: Update a post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const data = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    const locals = {
      title: 'Edit Post',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/edit-post',
      postMessage: 'Post Updated Successfully!',
      postStatus: 'success',
    };

    res.render('admin/edit-post', { data, locals, layout: adminLayout });
  } catch (error) {
    console.error(error);

    const locals = {
      title: 'Edit Post',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/edit-post',
      postMessage: 'Aw, something went wrong! Unable to update post!',
      postStatus: 'error',
    };

    res.render('admin/edit-post', { locals, layout: adminLayout });
  }
});

// DELETE -> Admin: Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });

    const data = await Post.find();
    const locals = {
      title: 'Delete Post',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/dashboard',
      postMessage: 'Post Deleted Successfully!',
      postStatus: 'success',
    };

    res.render('admin/dashboard', { data, locals, layout: adminLayout });
  } catch (error) {
    console.error(error);

    const locals = {
      title: 'Edit Post',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/edit-post',
      postMessage: 'Aw, something went wrong! Unable to update post!',
      postStatus: 'error',
    };

    res.render('admin/edit-post', { locals, layout: adminLayout });
  }
});

// GET -> Admin Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "This blog is powered using NodeJS, Express & MongoDB.",
      currentRoute: '/dashboard',
    };

    const data = await Post.find();
    res.render('admin/dashboard', { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong.");
  }
});

// POST -> Admin Login Check
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await brcrypt.compare(password, user.password))) {
      const locals = {
        title: 'Login',
        description: 'This blog is powered using NodeJS, Express & MongoDB.',
        currentRoute: '/admin',
        loginMessage: 'Invalid credentials :(',
        loginStatus: 'error',
      };
      return res.render('admin/index', { locals, layout: adminLayout });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/dashboard');
  } catch (error) {
    const locals = {
      title: 'Login',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/admin',
      loginMessage: error.message || "Something went wrong!",
      loginStatus: 'error',
    };
    return res.render('admin/index', { locals, layout: adminLayout });
  }
});

// POST -> Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await brcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    const locals = {
      title: 'Register',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/register',
      registerMessage: 'Yay! User registered successfully!',
      registerStatus: 'success',
    };
    return res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    let message = 'Internal server error.';
    if (error.code === 11000) {
      message = 'Username already exists. Get more creative! ^.^';
    }

    const locals = {
      title: 'Register',
      description: 'This blog is powered using NodeJS, Express & MongoDB.',
      currentRoute: '/register',
      registerMessage: message,
      registerStatus: 'error',
    };

    return res.render('admin/index', { locals, layout: adminLayout });
  }
});

// GET -> Admin Logout
router.get('/logout', async (req, res) => {
  try {
    res.clearCookie('token');

    const perPage = 10;
    const page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
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
      logoutMessage: 'You have been logged out successfully. See you soon!',
      logoutStatus: 'success',
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;