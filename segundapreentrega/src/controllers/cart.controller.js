import { Router } from 'express'
import { cartModel } from '../DAOs/mongodb/models/cart.models.js'
import { productsModel } from '../DAOs/mongodb/models/products.models.js'

const router = Router()

// Obtiene todos los productos del carrito
router.get('/', async (req, res) => {
    try {
        const carts = await cartModel.find().populate('products').exec()
        res.json({ message: carts })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Obtiene un producto del carrito
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const cart = await cartModel.findById(cid)
        res.json({ message: cart })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Crea un carrito
router.post('/', async (req, res) => {
    try {
        const cart = new cartModel()
        cart.save()
        res.send(cart)
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Agrega un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body
        const qty = Number(quantity)
        const product = await productsModel.findById(pid)

        if (product) {
            const cart = await cartModel.findById(cid)
            const existsProduct = cart.products.find(p => p.product.equals(pid))
            console.log(existsProduct?.quantity)

            if (existsProduct) {
                const newQuantity = existsProduct.quantity + qty;
                const result = await cartModel.updateOne({ _id: cid, 'products.product': pid }, { $set: { 'products.$.quantity': newQuantity } })
                res.status(201).json({ message: result })
            } else {
                const newProduct = {
                    product,
                    quantity: qty,
                };
                const result = await cartModel.updateOne({ _id: cid }, { $push: { products: newProduct } })
                res.status(201).json({ message: result })

            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Actualiza la cantidad de un producto
router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body
        const result = await cartModel.updateOne({ _id: cid }, { $set: { products: { product: pid, quantity } } })
        res.json({ message: result })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Elimina todos los productos del carrito
router.delete('/:cid/products', async (req, res) => {
    try {
        const { cid } = req.params
        const result = await cartModel.delete({ _id: cid })
        res.json({ message: result })
        
    }catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Elimina un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const result = await cartModel.updateOne({ _id: cid }, { $pull: { products: { product: pid } } })
        res.json({ message: result })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

export default router


