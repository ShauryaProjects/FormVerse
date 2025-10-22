const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  responses: {
    type: Object,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Submission", submissionSchema)
