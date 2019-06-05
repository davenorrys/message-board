const {Schema, model} = require('mongoose')

const replySchema = new Schema({
  created_on: {
    type: Date,
    default: Date.now
  },
  text: String,
  delete_password: String,
  reported: {
    type: Boolean,
    default: false
  }
})
const threadSchema = new Schema({
  board: String,
  text: String,
  created_on: {
    type: Date,
    default: Date.now
  },
  bumped_on: {
    type: Date,
    default: Date.now
  },
  reported: {
    type: Boolean,
    default: false
  },
  delete_password: String,
  replies: {
    type: [replySchema],
    default: []
  }
})
const Thread = model('Thread', threadSchema)

module.exports = Thread