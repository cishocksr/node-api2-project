const express = require('express');
const Posts = require('../data/db');

const router = express.Router();

//get post
router.get('/', (req, res) => {
  Posts.find()
    .then(posts => res.status(200).json(posts))
    .catch(err =>
      res.status(500).json({
        success: false,
        error: 'The posts information could not be retrieved'
      })
    );
});

//get post by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  Posts.findById(id)
    .then(post => {
      console.log(post);
      if (post.length > 0) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          success: false,
          message: 'The post with the specified ID does not exist.'
        });
      }
    })
    .catch(err =>
      res.status(500).json({
        success: false,
        error: 'The posts information could not be retrieved'
      })
    );
});

//get post comments
router.get('/:id/comments', (req, res) => {
  const { id } = req.params;

  db.findPostComments(id)
    .then(comments => {
      console.log(comments);
      if (comments.length > 0) {
        res.status(200).json(comments);
      } else {
        res.status(404).json({
          message: 'The post with the specified ID does not exist.'
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        error: 'The comments information could not be retrieved.'
      });
    });
});

//make a new post
router.post('/', (req, res) => {
  if (!(req.body.title || req.body.contents)) {
    res
      .status(400)
      .json({ errorMessage: 'Please provide title and contents for the post' });
  } else {
    Posts.insert(req.body)
      .then(postID => {
        Posts.findById(postID.id).then(post =>
          res.status(201).json({ success: true, post })
        );
      })
      .catch(err => {
        res.status(500).json({
          success: false,
          error: 'There was an error while saving the post to the database'
        });
      });
  }
});

//post new comment
router.post('/:id/comment', (req, res) => {
  const comment = {
    text: req.body.text,
    postId: req.params.id
  };

  if (!req.body.text) {
    return res.status(400).json({
      errorMessage: 'Please provide text for the comment.'
    });
  }
  db.findById(req.params.id).then(post => {
    if (post.length > 0) {
      console.log(post);
      Post.insertComment(comment)
        .then(obj => {
          Post.findCommentById(obj.id).then(com => res.status(201).json(com));
        })
        .catch(err => {
          res.status(500).json({
            error: 'There was an error while saving the comment to the database'
          });
        });
    } else {
      res.status(404).json({
        message: 'The post with the specified ID does not exist.'
      });
    }
  });
});

//update a post
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const body = req.body;

  if (!(body.title || body.contents)) {
    return res.status(400).json({
      errorMessage: 'Please provide title and contents for post.'
    });
  } else {
    Posts.findById(id)
      .then(post => {
        if (post.length > 0) {
          Posts.update(id, update)
            .then(() => {
              res.json({ message: 'Post updated' });
            }) //prosmise
            .catch(err => {
              res
                .status(400)
                .json({ errorMessage: 'Post could not be modified' });
            });
        } else {
          res.status(404).json({
            message: 'The post with the specified ID does not exist  '
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          error: 'The post could not be modified'
        });
      });
  }
});

// delete post
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  Posts.findById(id).then(post => {
    if (post.length > 0) {
      Posts.remove(id)
        .then(deletePost => {
          res.status(204).end();
        })
        .catch(err => {
          res
            .status(500)
            .json({ errorMessge: 'The user could not be removed' });
        });
    } else {
      res.status(404).json({
        errorMessge: 'The post with the specified ID does not exist.'
      });
    }
  });
});

module.exports = router;
