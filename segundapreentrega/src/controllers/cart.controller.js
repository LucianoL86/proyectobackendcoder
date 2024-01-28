import { Router } from 'express'
import { cartModel } from '../DAOs/mongodb/models/cart.models.js'
import { productsModel } from '../DAOs/mongodb/models/products.models.js'

const router = Router()

// Obtiene todos los productos del carrito
router.get('/', async (req, res) => {
    try {
        const cart = await cartModel.find()
        res.render('cart', {
            cart: cart[0]._id.toString(),
            products: cart.products,
            style: 'cart.css'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})

// Obtiene un producto del carrito
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const cart = await cartModel.findById(cid).lean()

        res.render('cart', {
            cart: cart._id.toString(),
            products: cart.products,
            style: 'cart.css'
        })

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
        res.status(500).json({ status: 'error', error: 'Internal error' });
    }
})


// Elimina un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const isCartValid = await cartModel.findById(cid)
        const isProductValid = await productsModel.findById(pid)
        let hasChanged = false

        if (!isCartValid || !isProductValid) {
            res.status(404).json({
                status: 'error',
                error: 'Cart or product not found'
            });
        }

        const productIndex = isCartValid.products.findIndex(p => p.product.equals(pid))

        if (productIndex === -1) {
            res.status(404).json({
                status: 'error',
                error: 'Product not found in cart'
            });
        } else {
            isCartValid.products[productIndex].quantity--
            if (isCartValid.products[productIndex].quantity === 0) {
                isCartValid.products.splice(productIndex, 1)
            }
            hasChanged = true
        }

        if (hasChanged) {
            const result = await cartModel.findByIdAndUpdate(cid, {
                products: isCartValid.products
            })
            res.json({
                status: 'success',
                message: isCartValid,
                result
            })
        }



    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'error',
            error: 'Internal error'
        });
    }
})

export default router


