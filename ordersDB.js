const mongoose = require('mongoose');

// mongoose.connect(`mongodb+srv://raheem:raheem123@cluster0.jyupv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);

const ordersSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderList: [
        {
            name: { type: String, required: true },
            count: { type: Number, required: true },
        }
    ],
    totalCost: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Orders", ordersSchema);
