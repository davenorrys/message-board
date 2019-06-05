/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const Thread = require('../models/Thread.js')

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post((req, res)=>{
    const {board} = req.params
    const thread = new Thread({board, ...req.body})
    thread.save((err, thread) =>{
      if (err) res.send(err.message)
      else res.redirect(`/b/${board}/`)
    })
  })
  .get((req, res)=>{
    const {board} = req.params
    console.log(board)
    Thread.find({board}, "-reported -delete_password", {limit: 10, sort: '-bumped_on'}, (err, threads) =>{
      if (err) res.send(err.message)
      else res.json(threads.map(i=>{
        i.replies = i.replies.filter((v,i)=>i<3).map(i=>{
          i.delete_password = undefined
          return i
        })        
        return i.toJSON()
      }))
    })
  })
  .put((req, res)=>{
    Thread.findById(req.body.thread_id || req.body.report_id, (err, thread) =>{
      if (err) res.send(err.message)
      else if (thread) {
        thread.reported = true
        thread.save((err, thread) =>{
          if (err) res.send(err.message)
          else res.send('success')
        })
      }
      else res.send('thread not found')
    })
  })
  
  .delete((req, res) =>{
    Thread.findOneAndRemove({_id: req.body.thread_id, delete_password: req.body.delete_password}, (err, thread) =>{
      if (err) res.send(err.message)
      else if (thread){
        res.send('success')
      }
      else res.send('incorrect password')
    })
  })
    
  app.route('/api/replies/:board')
  .post((req, res) =>{
    const {board} = req.params
    Thread.findById(req.body.thread_id, (err, thread) =>{
      if (err) res.send(err.message)
      else if (thread) {
        thread.replies.unshift({text:req.body.text, delete_password: req.body.delete_password})
        thread.bumped_on = Date.now()
        thread.save((err, thread) =>{
          if (err) res.send(err.message)
          else res.redirect(`/b/${board}/${thread._id}`)
        })
      }
      else res.send('thread not found')
    })
  })
  
  .get((req, res) =>{
    Thread.findById(req.query.thread_id, "-reported -delete_password", (err, thread) =>{
      if (err) res.send(err.message)
      else if (thread){
        thread.replies = thread.replies.map(i=>{
          i.delete_password = undefined
          return i
        })
        res.json(thread.toJSON())
      }
      else res.send('thread not found')
    })
  })
  
  .put((req, res) =>{
    Thread.findById(req.body.thread_id || req.body.report_id, (err, thread) =>{
      if (err) res.send(err.message)
      else if (thread) {
        thread.replies = thread.replies.map(i=>{
          if (i._id == req.body.reply_id){
            i.reported = true
          }
          return i
        })
        thread.save((err, thread) =>{
          if (err) res.send(err.message)
          else res.send('success')
        })
      }
      else res.send('thread not found')
    })
  })
  
  .delete((req, res) =>{
    Thread.findById(req.body.thread_id, (err, thread)=>{
      if (err) res.send(err.message)
      else if (thread){
        let result = false
        thread.replies = thread.replies.map(i=>{
          if (i._id == req.body.reply_id && i.delete_password == req.body.delete_password ){
            i.text = '[deleted]'
            result = true
          }
          return i          
        })
        if (result){
          thread.save((err, thread) =>{
            if (err) res.send(err.message)
            else res.send('success')
          })
        }
        else res.send('incorrect password')
        
      }
      else res.send('thread not found')
    })
  })
};
