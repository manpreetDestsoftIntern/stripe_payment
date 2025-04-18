const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

router.post('/create-checkout-session', async (req, res) => {
  const {  priceId } = req.body;
  const email = "manu@gmail.com";
  try {
    // 1. Create a new user in your application database
    const newUser = new User({ email }); // You might want to add more user fields
    await newUser.save();

    // 2. Create a Stripe customer
    const customer = await stripe.customers.create({
      email: newUser.email,
    });

    // 3. Update the user with the Stripe customer ID
    newUser.stripeCustomerId = customer.id;
    await newUser.save();

    // 4. Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: priceId || "price_1RFAbuRvAb4uboGCSO1L02u4", quantity: 1 }],
      success_url: `${process.env.BASE_URL}/success.html?userId=${newUser._id}`, // Pass user ID on success
      cancel_url: `${process.env.BASE_URL}/cancel.html`,
    });

    res.json({ url: session.url, sessionId: session.id, userId: newUser._id });
  } catch (error) {
    console.error("Error creating user and checkout session:", error);
    res.status(500).json({ error: "Failed to create user and checkout session." });
  }
});


router.get('/payment-details/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'User or Stripe customer ID not found.' });
    }

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    res.json({ customer, paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Failed to fetch payment details.' });
  }
});

module.exports = router;