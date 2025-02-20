const mongoose = require('mongoose');

const miniaturePrecisionSchema = new mongoose.Schema({
    partNumber: { type: String, required: true },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    longDescription: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    specifications: {
        category: { type: String },
        manufacturer: { type: String },
        weightKg: { type: Number },
        enclosure: { type: String },
        precisionClass: { type: String },
        flanges: { type: String },
        ballMaterial: { type: String },
        raceMaterial: { type: String },
        racewayStyle: { type: String },
        numberOfBearings: { type: Number },
        contactAngle: { type: String },
        preload: { type: String },
        cageMaterial: { type: String },
        rollingElement: { type: String },
        mountingArrangement: { type: String },
        flushGround: { type: String },
        inchMetric: { type: String },
        bore: { type: String },
        outsideDiameter: { type: String },
        innerRaceWidth: { type: String },
        outerRaceWidth: { type: String },
        harmonizedTariffCode: { type: String },
        manufacturerUrl: { type: String }
    }
}, { timestamps: true });

const MiniaturePrecision = mongoose.model("MiniaturePrecisionBearing", miniaturePrecisionSchema);

module.exports = { MiniaturePrecision };