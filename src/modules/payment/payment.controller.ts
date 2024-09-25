import { Controller, Post } from '@nestjs/common';
import { Stripe } from 'stripe';
const stripe = new Stripe(
  'sk_test_51PGxBuSBMavAylzXCq9XhksROKu5Yn4a8ACQuta1pQvAG8z0LHQLbbOgagKhT9zAqUd8SVy8O86ovUafjTHlVU9j00E1JtAtLk',
);
const priceId = 'price_1PH3QQSBMavAylzXo90nerjG';
@Controller('payment')
export class PaymentController {
  @Post('making-payment')
  async makePayment() {
    const session = await stripe.checkout.sessions.create({
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/fail',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });
    console.log(session);
    return { id: session.id, url: session.url, session };
  }
}
