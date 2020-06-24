var mongoose = require("mongoose");

var expensesSchema = new mongoose.Schema({
	title: String,
	price :String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

module.exports = mongoose.model("Expenses", expensesSchema);

