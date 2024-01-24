import { Router } from 'express'
import { cartModel } from '../DAOs/mongodb/models/cart.models.js'
import { productsModel } from '../DAOs/mongodb/models/products.models.js'

const router = Router()

// Obtiene todos los productos del carrito
router.get('/', async (req, res) => {
    try{
        const carts = await cartModel.find()
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
        exect()
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
    }catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Agrega un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const product = await productsModel.findById(pid)
        if (product) {
            const result = await cartModel.updateOne({ _id: cid }, { $push: { products: product._id } })
            res.status(201).json({ status: 'success', message: result })
        }else {
            res.send({data:[], message: 'Product not found'})
        }
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Actualiza la cantidad de un producto
router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { qty } = req.body
        const result = await cartModel.updateOne({ _id: cid, }, { $set: { 'products.$.quantity': qty }})
        res.json({ message: result })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Elimina un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const result = await cartModel.deleteOne({ _id: cid }, { $pull: { products: { product: pid }}})
        res.json({ message: result })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

export default router



