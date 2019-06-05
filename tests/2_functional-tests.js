/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Thread = require('../models/Thread.js')


chai.use(chaiHttp);

suite('Functional Tests', () =>{  
  
  suite('API ROUTING FOR /api/threads/:board', () =>{
    
    suite('POST', () =>{
      test('POST thread', (done)=>{
        chai.request(server)
        .post('/api/threads/teste')
        .send({text: 'teste', delete_password: '1234'})
        .end( (err, res) =>{
          assert.isNull(err)
          assert.equal(res.status, 200)
          Thread.findOne({}, {}, {sort:'-created_on'}, (err, thread)=>{
            assert.isNull(err)
            assert.isNotNull(thread)
            assert.property(thread, '_id')
            assert.property(thread, 'board')
            assert.equal(thread.board, 'teste')
            assert.property(thread, 'created_on')
            assert.property(thread, 'bumped_on')
            assert.property(thread, 'text')
            assert.equal(thread.text, 'teste')
            assert.property(thread, 'reported')
            assert.property(thread, 'delete_password')
            assert.equal(thread.delete_password, '1234')
            assert.property(thread, 'replies')
            assert.isArray(thread.replies)
            done()
          })
          
        })
        
      })
    });
    
    suite('GET', () =>{
      test('GET thread', (done) =>{ 
        chai.request(server)
        .get('/api/threads/teste')
        .end((err, res)=>{
          assert.isNull(err)
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          
          assert.property(res.body[0], '_id')
          assert.property(res.body[0], 'board')
          assert.equal(res.body[0].board, 'teste')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'bumped_on')
          assert.property(res.body[0], 'text')
          assert.equal(res.body[0].text, 'teste')
          assert.property(res.body[0], 'replies')
          assert.isArray(res.body[0].replies)
          done()
        })
        
      })
    });
    
    
    suite('PUT', () =>{
      test('Report it', (done)=>{
        Thread.findOne({},{},{sort: '-created_on'}, (err, thread)=>{
          chai.request(server)
            .put('/api/threads/teste')
            .send({thread_id: thread._id})
            .end((err, res) =>{
              assert.isNull(err)
              assert.equal(res.status, 200)
              assert.equal(res.text, 'success')
              done()
            })
        })
      })
    });
    
    suite('DELETE', () =>{
      test('Delete it', (done)=>{
        Thread.findOne({},{},{sort: '-created_on'}, (err, thread)=>{
          chai.request(server)
            .delete('/api/threads/teste')
            .send({thread_id: thread._id, delete_password: '1234'})
            .end((err, res) =>{
              assert.isNull(err)
              assert.equal(res.status, 200)
              assert.equal(res.text, 'success')
              done()
            })
        })
      })
    });
    
    
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', () =>{
    let threadId
    suiteSetup(done=>{
      const thread = new Thread({board: 'teste', text: 'teste', delete_password: '1234'})
      thread.save((err, thread)=>{
        threadId = thread._id
        done()
      })
    })
    suite('POST', () =>{
      test('Reply on it', done=>{
        chai.request(server)
        .post('/api/replies/teste')
        .send({text: 'teste', thread_id: threadId, delete_password: '1234'})
        .end((err, res)=>{
          assert.isNull(err)
          assert.equal(res.status, 200)
          Thread.findById(threadId, (err, thread)=>{
            assert.isNull(err)
            assert.isNotNull(thread)
            assert.isArray(thread.replies)
            assert.isAtLeast(thread.replies.length, 1)
            assert.equal(thread.replies[0].text, 'teste')
            assert.equal(thread.replies[0].delete_password, '1234')
            done()
          })
          
        })
      })
    });
    let replyId
    suite('GET', () =>{
      test('GET thread', (done) =>{ 
        chai.request(server)
        .get('/api/replies/teste')
        .query({thread_id: threadId.toString()})
        .end((err, res)=>{
          assert.isNull(err)
          assert.equal(res.status, 200)
          assert.isObject(res.body)
          assert.property(res.body, '_id')
          assert.property(res.body, 'board')
          assert.equal(res.body.board, 'teste')
          assert.property(res.body, 'created_on')
          assert.property(res.body, 'bumped_on')
          assert.property(res.body, 'text')
          assert.equal(res.body.text, 'teste')
          assert.property(res.body, 'replies')
          assert.isArray(res.body.replies)
          replyId = res.body.replies[0]._id.toString()
          done()
        })
        
      })
    });
    
    suite('PUT', () =>{
      test('report it', done=>{
        chai.request(server)
        .put('/api/replies/teste')
        .send({thread_id: threadId.toString(), reply_id: replyId})
        .end((err, res)=>{
          assert.isNull(err)
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          done()
        })
        
      })
    });
    
    suite('DELETE', () =>{
      test('#', done =>{
        chai.request(server)
        .delete('/api/replies/teste')
        .send({thread_id: threadId.toString(), reply_id: replyId, delete_password: '1234'})
        .end((err, res)=>{
          assert.isNull(err)
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          done()
        })
      })
    });
    
  });

});
