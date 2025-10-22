const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["shortAnswer", "paragraph", "multipleChoice", "checkbox", "dropdown"],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  options: [String],
  required: {
    type: Boolean,
    default: false,
  },
})

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [questionSchema],
})

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  steps: [stepSchema],
  createdBy: {
    type: String,
    default: "anonymous",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Form", formSchema)
