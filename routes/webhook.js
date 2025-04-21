require('dotenv').config();
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const CheckoutSession = require('../models/CheckoutSession');
const bodyParser = require('body-parser');
const User = require('../models/User');

router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customer = await stripe.customers.retrieve(session.customer);
    const org = await User.findOne({ stripeCustomerId: session.customer });
    if (!org) return res.status(404).end();

    org.stripeSubscriptionId = session.subscription;
    await org.save();

    await CheckoutSession.findOneAndUpdate({ sessionId: session.id }, { status: 'completed' });

    await Payment.create({
      orgId: org._id,
      userId: customer.metadata?.userId || null,
      status: 'active',
      stripeInvoiceId: session.invoice,
      amount: session.amount_total || 0
    });
  }

  res.json({ received: true });
});

module.exports = router;
