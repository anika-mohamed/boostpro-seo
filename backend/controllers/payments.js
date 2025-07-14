const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const User = require("../models/User")

// @desc    Create subscription
// @route   POST /api/payments/subscribe
// @access  Private
exports.createSubscription = async (req, res, next) => {
  try {
    const { priceId, paymentMethodId } = req.body

    if (!priceId) {
      return res.status(400).json({
        success: false,
        message: "Price ID is required",
      })
    }

    let customer

    // Check if user already has a Stripe customer ID
    if (req.user.subscription.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.subscription.stripeCustomerId)
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id.toString(),
        },
      })

      // Update user with customer ID
      req.user.subscription.stripeCustomerId = customer.id
      await req.user.save()
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      })

      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    })

    res.status(200).json({
      success: true,
      message: "Subscription created successfully",
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      },
    })
  } catch (error) {
    console.error("Stripe subscription error:", error)
    next(error)
  }
}

// @desc    Cancel subscription
// @route   POST /api/payments/cancel
// @access  Private
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.body

    if (!subscriptionId && !req.user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found",
      })
    }

    const subId = subscriptionId || req.user.subscription.stripeSubscriptionId

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    })

    // Update user subscription
    req.user.subscription.cancelAtPeriodEnd = true
    await req.user.save()

    res.status(200).json({
      success: true,
      message: "Subscription will be cancelled at the end of the current period",
      data: {
        cancelAt: new Date(subscription.current_period_end * 1000),
      },
    })
  } catch (error) {
    console.error("Stripe cancellation error:", error)
    next(error)
  }
}

// @desc    Get subscription status
// @route   GET /api/payments/status
// @access  Private
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = req.user

    let subscriptionData = {
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
    }

    // If user has Stripe subscription, get latest data
    if (user.subscription.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId)
        subscriptionData = {
          ...subscriptionData,
          stripeStatus: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        }
      } catch (error) {
        console.error("Error fetching Stripe subscription:", error)
      }
    }

    res.status(200).json({
      success: true,
      data: subscriptionData,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Handle Stripe webhooks
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"]
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case "subscription.created":
    case "subscription.updated":
      await handleSubscriptionUpdate(event.data.object)
      break
    case "subscription.deleted":
      await handleSubscriptionCancellation(event.data.object)
      break
    case "invoice.payment_succeeded":
      await handlePaymentSuccess(event.data.object)
      break
    case "invoice.payment_failed":
      await handlePaymentFailure(event.data.object)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}

// Helper functions for webhook handling
async function handleSubscriptionUpdate(subscription) {
  try {
    const user = await User.findOne({
      "subscription.stripeCustomerId": subscription.customer,
    })

    if (user) {
      user.subscription.stripeSubscriptionId = subscription.id
      user.subscription.status = subscription.status === "active" ? "active" : "inactive"
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000)
      user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end

      // Determine plan based on price
      const priceId = subscription.items.data[0].price.id
      if (priceId === process.env.STRIPE_PRICE_ID_BASIC) {
        user.subscription.plan = "registered"
        user.role = "paid"
      } else if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
        user.subscription.plan = "pro"
        user.role = "paid"
      }

      await user.save()
    }
  } catch (error) {
    console.error("Error handling subscription update:", error)
  }
}

async function handleSubscriptionCancellation(subscription) {
  try {
    const user = await User.findOne({
      "subscription.stripeSubscriptionId": subscription.id,
    })

    if (user) {
      user.subscription.status = "cancelled"
      user.subscription.plan = "free"
      user.role = "registered"
      await user.save()
    }
  } catch (error) {
    console.error("Error handling subscription cancellation:", error)
  }
}

async function handlePaymentSuccess(invoice) {
  try {
    const user = await User.findOne({
      "subscription.stripeCustomerId": invoice.customer,
    })

    if (user && user.subscription.status !== "active") {
      user.subscription.status = "active"
      await user.save()
    }
  } catch (error) {
    console.error("Error handling payment success:", error)
  }
}

async function handlePaymentFailure(invoice) {
  try {
    const user = await User.findOne({
      "subscription.stripeCustomerId": invoice.customer,
    })

    if (user) {
      user.subscription.status = "past_due"
      await user.save()
    }
  } catch (error) {
    console.error("Error handling payment failure:", error)
  }
}
