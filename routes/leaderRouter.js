const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Leaders = require('../models/leaders');
const leaderRouter = express.Router();
var authenticate = require('../authenticate');

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
    .get((req, res, next) => {
        Leaders.find({})
            .then((leaders) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leaders);
            }, err => next(err))
            .catch(err => next(err))
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Leaders.create(req.body)
            .then((leader) => {
                console.log('Dish created', leader);
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statuscode = 403;
        res.end('put operations not supported on /leaders');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        console.log('Removing all leaders');
        Leaders.deleteMany({})
            .then((resp) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, err => next(err))
            .catch(err => next(err))
    })


leaderRouter.route('/:id')
    .get((req, res, next) => {
        Leaders.findById(req.params.id)
            .then((leader) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, err => next(err))
            .catch(err => next(err))
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Leaders.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
            .then((leader) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, err => next(err))
            .catch(err => next(err))
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Leaders.findByIdAndDelete(req.params.id)
            .then((leader) => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            }, err => next(err))
            .catch(err => next(err))
    });


module.exports = leaderRouter;

