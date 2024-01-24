import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const cartCollection = 'cart'
const cartSchema = new mongoose.Schema({
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'product',
        default: []
    }]
})

cartSchema.pre('find', () => {
    this.populate('products')
})

cartSchema.pre('findById', () => {
    this.populate('products')
})

export const cartModel = mongoose.model(cartCollection, cartSchema)