const mysql2 = require('../mysql');




exports.getOrders = async (req, res, next) => {
    console.log("req", req.body.productImage)
    try {
        const query = `SELECT orders.orderId, 
                                 orders.quantity, 
                                 products.productId, 
                                 products.name, 
                                 products.productImage,
                                 products.price from orders
                                 INNER JOIN products
                                 ON products.productId = orders.productId;
         ;`
        const result = await mysql2.execute(query)
            const response = {
                orders: result.map(orders => {
                    return {
                        orderId: orders.orderId,
                        quantity: orders.quantity,
                        product: {
                            productId: orders.productId,
                            name: orders.name,
                            productImage: orders.productImage,
                            price: orders.price
                        }
                    }
                })
            }
            res.status(200).send(response)
    } catch (error) {
            res.status(500).send({error:error})
    }
}


exports.postOrders = async (req, res, next) => {


    try {
        const queryProduct = 'SELECT * FROM products WHERE productId = ?';
        const resultProduct = await mysql2.execute(queryProduct, [req.body.productId]);

        if (resultProduct.length == 0) {
            return res.status(404).send({ message: 'Produto não encontrado'});
        }

        const queryOrder  = 'INSERT INTO orders (productId, quantity) VALUES (?,?)';
        const resultOrder = await mysql2.execute(queryOrder, [req.body.productId, req.body.quantity]);

        const response = {
            message: 'Pedido inserido com sucesso',
            createdOrder: {
                orderId: resultOrder.insertId,
                productId: req.body.productId,
                quantity: req.body.quantity,
                request: {
                    type: 'GET',
                    description: 'Retorna todos os pedidos',
                    url: process.env.URL_API + 'orders'
                }
            }
        }
        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};
exports.getOrderDetail = async (req, res, next) => {
    try {
        const query = `SELECT * FROM orders WHERE orderId = ?`
        const result = await mysql2.execute(query, [req.params.orderId])
        console.log(result);
        if(result.length == 0){
            return res.status(404).send({ message: "No order found with this ID"})
        }   

        const response = {
            pedido: {
                orderId: result[0].orderId,
                productId: result[0].productId,
                quantity: result[0].quantity,
                request: {
                    tipo: 'GET',
                    descricao: 'Return all orders',
                    url: 'http://localhost:3000/orders'
                }
            }
        }
        return res.status(200).send(response);
          } catch (error) {
            return res.status(500).send({error:error})
    }
}

exports.deleteOrder = async (req, res, next) => {
    try {
        const query = 'DELETE FROM orders WHERE orderId = ?'
        const result = await mysql2.execute(query, [req.params.orderId])
        const response = {
            mensagem: `order removed successfully`,
            request:{
                tipo: `DELETE`,
                descricao: `Deleting an order`,
                url: `http://localhost:3000/orders`,
                body: {
                    id_produto: `Number`,
                    quantidade: `Number`
                }
            }
        }
        return res.status(202).send(response)
    } catch (error) {
        return res.status(500).send({error:error})
    }
}


