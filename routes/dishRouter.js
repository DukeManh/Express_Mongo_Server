const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const { populate } = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());


dishRouter.route('/')
    .get((req, res, next) => {
        console.log('populating');
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish created', dish);
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statuscode = 403;
        res.end('put operations not supported on /dishes');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        console.log('Removing all dishes');
        Dishes.deleteMany({})
            .then((resp) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, err => next(err))
            .catch(err => next(err))
    })


dishRouter.route('/:id')
    .get((req, res, next) => {
        Dishes.findById(req.params.id)
            .populate('comment.author')
            .then((dish) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
            .then((dish) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err))
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndDelete(req.params.id)
            .then((dish) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, err => next(err))
            .catch(err => next(err))
    });

dishRouter.route('/:id/comments')
    .get((req, res, next) => {
        Dishes.findById(req.params.id)
            .populate('comment.author')
            .then((dish) => {
                if (dish != null) {
                    res.StatusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comment);
                }
                else {
                    err = new Error('Dish ' + req.params.id + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.id)
            .then((dish) => {
                if (dish != null) {
                    req.body.author = req.user._id;
                    dish.comment.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comment.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, err => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.id + ' not found');
                    err.status = 404;
                    return next(err);
                }
            })
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statuscode = 403;
        res.end('put operations not supported on /dishes');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findById(req.params.id)
            .then((dish) => {
                if (dish != null) {
                    for (let i = (dish.comment.length - 1); i >= 0; i--) {
                        dish.comment.id(dish.comment[i]._id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comment.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, err = next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.id + ' not found');
                    err.status = 404;
                    return next(err);
                }
            })
    });

dishRouter.route('/:dishId/comments/:commentId')
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comment.author')
            .then((dish) => {
                if (dish != null && dish.comment.id(req.params.commentId) != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comment.id(req.params.commentId));
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId
            + '/comments/' + req.params.commentId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comment.id(req.params.commentId) != null) {
                    if (dish.comment.id(req.params.commentId).author === req.user.id) {
                        if (req.body.rating) {
                            dish.comment.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.comment) {
                            dish.comment.id(req.params.commentId).comment = req.body.comment;
                        }
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comment.author')
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish);
                                    })
                            }, (err) => next(err));
                    }
                    else {
                        err = new Error('You are not authorized to change this comment');
                        err.statusCode = 403;
                        next(err);
                    }
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null && dish.comment.id(req.params.commentId) != null) {
                    if (dish.comment.id(req.params.commentId).author === req.user.id) {
                        dish.comment.id(req.params.commentId).remove();
                        dish.save()
                            .then((dish) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dish);
                            }, (err) => next(err));
                    }
                    else {
                        err = new Error('You are not authorized to delete this comment');
                        err.statusCode = 403;
                        next(err);
                    }
                }
                else if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = dishRouter;