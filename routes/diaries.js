const express = require('express');
const router = express.Router();
const { ensureAuth } = require("../middleware/auth")

const Diary = require('../models/Diary');
const e = require('express');

//@desc     show add page
//@route    GET /diaries/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('diaries/add')
});

//@desc     Process add form
//@route    POST /diaries
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Diary.create(req.body)
    res.redirect('/dashboard')
  } catch (error) {
    console.error(error)
    res.render('error/500')
  }

});

//@desc     show all diaries
//@route    GET /diaries
router.get('/', ensureAuth, async (req, res) => {
  try {
    const diaries = await Diary.find({ status: 'public' })
      .populate('user')
      .sort({createAt: 'desc'})
      .lean()

    res.render('diaries/index', {
      diaries
    })

  } catch (error) {
    console.error(error)
    res.render('error/500')
  }
});

//@desc     show single diary
//@route    GET /diaries/Lid
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id)
      .populate('user')
      .lean()

    if (!diary) {
      return res.render('error/404')
    }

    res.render('diaries/show', {
      diary
    })

  } catch (error) {
    console.error(error)
    res.render('error/404')
  }
});

//@desc     show edit diary page
//@route    GET /diaries/add
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const diary = await Diary.findOne({
      _id: req.params.id
    }).lean()
  
    if (!diary) {
      return res.render('error/404')
    }
  
    if (diary.user != req.user.id) {
      res.redirect('/diaries') 
    } else {
      res.render('diaries/edit', {
        diary,
      })
    }
  } catch (error) {
    console.error(error)
    res.render('error/500')
  }
});

//@desc     update diary
//@route    PUT /diaries/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let diary = await Diary.findById(req.params.id).lean()

    if (!diary) {
      return res.render('error/404')
    }

    if (diary.user != req.user.id) {
      res.redirect('/diaries') 
    } else {
      diary = await Diary.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })
      res.redirect('/dashboard')
    }

  } catch (error) {
    console.error(error)
    res.render('error/500')
  }
});

//@desc     delete diary
//@route    DELETE /diaries/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Diary.remove({ _id: req.params.id })
    res.redirect('/dashboard')
  } catch (error) {
    console.error(error)
    res.render('error/500')
  }
});

//@desc     Show an user diaries collection
//@route    GET /diaries/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const diaries = await Diary.find({ 
      status: 'public',
      user: req.params.userId 
    })
      .populate('user')
      .lean()

    res.render('diaries/index', {
      diaries
    })

  } catch (error) {
    console.error(error)
    res.render('error/500')
  }
});


module.exports = router;