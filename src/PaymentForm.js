import React, { Component } from 'react';

class PaymentForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stripeLoaded: false,
      paymentError: null,
      paymentComplete: false,
      token: null
    };
  }

  componentDidMount() {
    if (!PaymentForm.getStripeToken) {
      // Put your publishable key here
      Stripe.setPublishableKey('pk_test_xxxx'); // eslint-disable-line
      this.setState({ stripeLoaded: true });
    }
  }

  onSubmit(event) {
    var self = this;
    event.preventDefault();
    this.setState({ submitDisabled: true, paymentError: null });

    Stripe.createToken(event.target, function(status, response) { // eslint-disable-line
      if (response.error) {
        self.setState({ paymentError: response.error.message, submitDisabled: false });
      }
      else {
        self.setState({ paymentComplete: true, submitDisabled: false, token: response.id });
        // make request to server here!
        console.log(response.id);
      }
    });
  }

  render() {
    if (!this.state.stripeLoaded) {
      return <div>Stripe is not lodaded.</div>;
    } else {
      return (
        <form onSubmit={this.onSubmit.bind(this)} >
          <span>{ this.state.paymentError }</span><br />
          <input type='text' data-stripe='number' placeholder='credit card number' /><br />
          <input type='text' data-stripe='exp-month' placeholder='expiration month' /><br />
          <input type='text' data-stripe='exp-year' placeholder='expiration year' /><br />
          <input type='text' data-stripe='cvc' placeholder='cvc' /><br />
          <input disabled={this.state.submitDisabled} type='submit' value='Purchase' />
        </form>
      );
    }
  }

}

export default PaymentForm;
