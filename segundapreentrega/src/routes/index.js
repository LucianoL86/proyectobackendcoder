import productsController from '../controllers/products.controller.js'
import chatController from '../controllers/chat.controller.js'
import cartController from '../controllers/cart.controller.js'

const router = app => {
    app.use('/products', productsController)
    app.use('/chat', chatController)
    app.use('/cart', cartController)
}


export default router