const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
var authenticate = require('../authenticate');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
    .get((req, res, next) => {
        Promotions.find({})
            .then((promotions) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotions);
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Promotions.create(req.body)
            .then((promotion) => {
                console.log('Dish created', promotion);
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statuscode = 403;
        res.end('put operations not supported on /promotions');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        console.log('Removing all promotions');
        Promotions.deleteMany({})
            .then((resp) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, err => next(err))
            .catch(err => next(err))
    })


promotionRouter.route('/:id')
    .get((req, res, next) => {
        Promotions.findById(req.params.id)
            .then((promotion) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Promotions.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
            .then((promotion) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, err => next(err))
            .catch(err => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Promotions.findByIdAndDelete(req.params.id)
            .then((promotion) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            }, err => next(err))
            .catch(err => next(err))
    });


module.exports = promotionRouter;
