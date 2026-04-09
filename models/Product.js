const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  prix: Number,
  stock: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  mouvements: {
    type: [
      {
      mouvementType: String,
      quantity: Number,
      stockAvant: Number,
      stockApres: Number,
      date: {
        type: Date,
        default: Date.now,
      },
      userId: String,
      note: String,
    }
  ],
  default: []
}
});

module.exports = mongoose.model("Product", productSchema);