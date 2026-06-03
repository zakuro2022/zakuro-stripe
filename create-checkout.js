const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, description, customerEmail, customerName, orderDetails } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'sek',
                    product_data: {
                        name: description || 'Zakuro Judo Gi Poseidon',
                        description: orderDetails || '',
                    },
                    unit_amount: amount, // i öre
                },
                quantity: 1,
            }],
            mode: 'payment',
            customer_email: customerEmail,
            metadata: {
                customerName: customerName || '',
                orderDetails: orderDetails || '',
            },
            success_url: `${req.headers.origin || 'https://zakuro.se'}/tack.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin || 'https://zakuro.se'}/avbruten.html`,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: err.message });
    }
};
