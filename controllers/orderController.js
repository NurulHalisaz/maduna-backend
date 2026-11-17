const Order = require('../models/orderModel');
const Product = require('../models/productModel');

exports.createOrder = (req,res)=>{

    const {
        user_id,
        quantity,
        total_price,
        items
    } = req.body;

    Order.create(
        user_id,
        quantity,
        total_price,

        (err,result)=>{

            if(err){

                return res.status(500).json({
                    message:"Gagal membuat pesanan"
                });

            }

            const orderId =
            result.insertId;

            let selesai = 0;

            items.forEach(item=>{

                Order.createOrderItem(

                    orderId,
                    item.product_id,
                    item.quantity,

                    (err)=>{

                        if(err){

                            return res.status(500).json({
                                message:"Gagal menyimpan detail pesanan"
                            });

                        }

                        Product.updateStock(

                            item.product_id,
                            item.quantity,

                            ()=>{

                                selesai++;

                                if(
                                    selesai ===
                                    items.length
                                ){

                                    res.status(201).json({
                                        message:"Checkout berhasil!"
                                    });

                                }

                            }

                        );

                    }

                );

            });

        }

    );

};

exports.getOrderHistory = (req, res) => {

    const userId = req.params.userId;

    Order.getHistory(
        userId,
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "Gagal mengambil riwayat"
                });

            }

            res.json(results);

        }
    );

};