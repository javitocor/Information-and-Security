'use strict';

var mongoose = require('mongoose');

var Board = require('../models/board.js');
var Thread = require('../models/thread.js');
var Reply = require('../models/reply.js');

module.exports = function (app) {

  app.route('/api/threads/:board')
    .get(async function (req, res) {
      try {
        await Board.findOne({ board_name: req.params.board })
          .populate({
            path: 'threads',
            select: '-reported -password',
            options: {
              sort: {bumped_on: -1},
              limit: 10,
            },
            populate:{
              path: 'replies',
              model: 'Reply',
              select: '-threads -_id',
              options: { sort: { created_on: -1 }, limit: 3 }
            }
          })
          .select('threads')
          .exec(function(err, docs){
            if(err) return res.send("Couldn't get the data");
            if(!docs){
              res.send('No items available')
            } else {              
              res.json(docs.threads)
            }
          })
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    })
    .post(async function (req, res) {
      try {
        let board;
        await Board.findOne({ board_name: req.params.board }, function (err, doc) {
          if (err)
            return res.send("Couldn't post new thread");
          if (doc) {
            board = doc;
          } else {
            board = new Board({
              _id: new mongoose.Types.ObjectId(),
              board_name: req.params.board
            })
          }
          let newThread = new Thread({
            _id: new mongoose.Types.ObjectId(),
            text: req.body.text,
            password: req.body.delete_password,
            board: board._id
          });

          board.threads.push(newThread._id);

          await newThread.save(function (err) {
            if (err) return res.send("Couldn't post new thread");
            await board.save(function (err) {
              if (err) return res.send("Couldn't post new thread");
              res.redirect(`/b/${board.board_name}?_id=${newThread._id}`);
            })
          })
        });
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    })
    .delete(async function (req, res) {
      try {
        const {thread_id, delete_password} = req.body;
        await Thread.findOneAndRemove({_id: thread_id, password: delete_password}, function(err, thread){
          if(err) res.send('Incorrect data')
          Board.findOneAndUpdate({ board_name: req.params.board },
            { $pull: { threads: thread._id } },(err, doc) => {})
          res.json("Delete success")
        })
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    })
    .put(function(req, res) {
    
      Thread.findByIdAndUpdate(
        req.body.report_id,
        { $set: { reported: true } },
        function(err, doc) {
          if(err || !doc)
            return res.send("Couldn't report the thread.");
          
          return res.send('Report successful.');
        });
    })
  app.route('/api/replies/:board')
    .get(async function (req, res) {
      try {
        const { thread_id } = req.query
        if(!thread_id) return res.send('No thread ID')
        await Thread.findById(thread_id)
          .populate({
            path: 'replies',
            select: '-_id'
          })
          .select('replies')
          .exec(function(err, threads){
            if(err) return res.send('No matches found')
            if(!threads){
              res.send('No matches found')
            } else {
              send.json(threads[0])
            }
          })
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    })
    .post(async function (req, res) {
      try {
        const { text, delete_password, thread_id } = req.body;
        await Board.findOne({ board_name: req.params.board })
        .populate({
          path: 'threads',
          match: { _id: thread_id }
        })
        .select('threads')
        .exec(function(err, board) {
          if(err || !board || board.threads.length == 0) {
            return res.send("Couldn't reply to the thread.");
          } else {
            let newreply = new Reply({
              _id: new mongoose.Types.ObjectId(),
              text: text,
              password: delete_password,
            })

            board.threads[0].bumped_on = new Date();
            newreply.threads.push(thread_id);
            board.threads[0].replies.push(newreply);

            await newreply.save(function (err){
              if(err) return res.send("Couldn't reply to the thread.");
              await board.threads[0].save(function(err) {
                if(err) return res.send("Couldn't reply to the thread.");
                res.redirect(`/b/${req.params.board}/${req.body.thread_id}`);
              })
            })
          }
        })
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    })
    .delete(async function (req, res) {
      try {
        const {thread_id, reply_id, delete_password} = req.body;
        await Reply.findOneAndUpdate({_id: reply_id}, {$pull: {text: 'deleted'}}, (err,doc)=>{

        } )
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    })
    .put(function(req, res) {
    
      Reply.findByIdAndUpdate(
        req.body.reply_id,
        { $set: { reported: true } },
        function(err, doc) {
          if(err || !doc)
            return res.send("Couldn't report the reply.");
          
          return res.send('Report successful.');
        });
    })

};
