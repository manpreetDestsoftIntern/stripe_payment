require('dotenv').config();
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

router.post('/add_pm', async (req, res) => {
  const email = "manu@gmail.com";
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      success_url: 'https://yourdomain.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourdomain.com/cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    res.status(500).json({ error: "Failed to create Checkout Session." });
  }
});

module.exports = router;
