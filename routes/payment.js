const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Organization = require('../models/Organization');
const User = require('../models/User');
const CheckoutSession = require('../models/CheckoutSession');

router.post('/checkout', async (req, res) => {
  const { userId, orgId, priceId } = req.body;

  const user = await User.findById(userId);
  const org = await Organization.findById(orgId);
  if (!user || !org) return res.status(400).json({ error: "Invalid user or organization" });

  if (user.role !== 'admin') return res.status(403).json({ error: "Only admins can pay." });

  if (org.stripeSubscriptionId) {
    const sub = await stripe.subscriptions.retrieve(org.stripeSubscriptionId);
    if (sub && sub.status === 'active') {
      return res.status(400).json({ error: "Subscription already active." });
    }
  }

  const existing = await CheckoutSession.findOne({ orgId, status: 'pending' });
  if (existing) return res.status(400).json({ error: "A session is already in progress." });

  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email });
    customerId = customer.id;
    org.stripeCustomerId = customerId;
    await org.save();
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.BASE_URL}/success.html`,
    cancel_url: `${process.env.BASE_URL}/cancel.html`,
  });

  await CheckoutSession.create({ sessionId: session.id, orgId, status: 'pending' });

  res.json({ url: session.url });
});

module.exports = router;
