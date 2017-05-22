import React, { Component } from 'react';

/* eslint-disable */
class Payment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stripeLoaded: false,
      paymentError: null,
      paymentComplete: false,
      token: null,
      details: null,
      usePaymentRequest: true,
      errorMsg: ''
    };
  }

  componentDidMount() {
    if ('PaymentRequest' in window) {
      this.paymentRequest = this.initPaymentRequest();
    } else {
      this.setState({ usePaymentRequest : false });
    }

    // Put your publishable key here
    Stripe.setPublishableKey('pk_test_xxx');
    this.setState({ stripeLoaded: true });
  }

  initPaymentRequest() {
    let networks = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay', 'visa', 'mir'];
    let types = ['debit', 'credit', 'prepaid'];

    let supportedInstruments = [{
      supportedMethods: networks,
    }, {
      supportedMethods: ['basic-card'],
      data: {supportedNetworks: networks, supportedTypes: types},
    }];

    let details = {
      total: { label: 'Donation', amount: { currency: 'USD', value: '1.00' } },
      displayItems: [
        {
          label: 'Original donation amount',
          amount: {currency: 'USD', value: '11.00'},
        },
        {
          label: 'Friends and family discount',
          amount: {currency: 'USD', value: '-10.00'},
        },
      ],
    };

    this.setState({ details: details });

    return new PaymentRequest(supportedInstruments, details);
  }

  onSubmit(event) {
    event.preventDefault();

    this.setState({ submitDisabled: true, paymentError: null });

    Stripe.createToken(event.target, (status, response) => {
      this.sendPaymentToServer(status, response);
    });
  }

  onClick(event) {
    this.showPaymentRequest();
    /*
    if (this.paymentRequest.canMakePayment) {
      this.paymentRequest.canMakePayment().then(result => {
        if (result) {
          this.showPaymentRequest();
        } else {
          console.log('can not make payment');
        }
      })
      .catch(error => {
        console.log(error);
      })
    }
    */
  }

  showPaymentRequest() {
    this.paymentRequest.show().then((instrumentResponse) => {
      console.log(instrumentResponse);
      this.paymentResponse = instrumentResponse;
      this.createStripeToken(instrumentResponse);
    })
    .catch((err) => {
      console.log(err);
      this.setState({ usePaymentRequest: false });
    });
  }

  createStripeToken(instrumentResponse) {
    const paymentDetails = instrumentResponse.details;
    // Tokenize with Stripe.js
    Stripe.card.createToken({
      number: paymentDetails.cardNumber,
      cvc: paymentDetails.cardSecurityCode,
      exp_month: paymentDetails.expiryMonth,
      exp_year: paymentDetails.expiryYear,
      address_zip: paymentDetails.billingAddress.postalCode,
      address_line1: paymentDetails.billingAddress.addressLine[0],
      address_line2: paymentDetails.billingAddress.addressLine[1],
      address_city: paymentDetails.billingAddress.city,
      address_state: paymentDetails.billingAddress.region,
      address_country: paymentDetails.billingAddress.country,
      name: paymentDetails.cardholderName
    }, (status, response) => {
      this.sendPaymentToServer(status, response);
    });
  }

  sendPaymentToServer(status, response) {
    if (response.error) {
      this.setState({ paymentError: response.error.message, submitDisabled: false });
      return;
    }

    const details = this.state.details;

    const paymentData = {
      token: response.id,
      currency: details.total.amount.currency,
      amount: Math.round(parseInt(details.total.amount.value) * 100),
      description: details.total.label
    }

    this.setState({ submitDisabled: false, token: response.id });

    console.log(paymentData);

    fetch('https://stripe-node-server.herokuapp.com/pay', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    }).then((data) => {
      this.refs.paymentForm.reset();
      if (this.state.usePaymentRequest) {
        this.paymentResponse.complete('success')
        .then(() => {
          this.setState({ paymentComplete: true });
        })
        .catch((error) => {
          this.setState({ paymentComplete: false });
          this.setState({ paymentError: error });
        });
      } else {
        this.setState({ paymentComplete: true });
      }
      console.log(data);
    }).catch((error) => {
      this.refs.paymentForm.reset();
      this.setState({ paymentComplete: false });
      this.setState({ paymentError: error });      
    });
  }

  render() {
    const usePaymentRequest = this.state.usePaymentRequest;
    const paymentComplete = this.state.paymentComplete;
    const paymentError = this.state.paymentError;

    if (usePaymentRequest) {
      return (
        <div>
          <span>{ paymentError }</span><br />
          <button onClick={(e) => {this.onClick(e)}}>
            Pay with Payment Request API
          </button>
          { 
            (paymentComplete) ? <p>Payment complete !</p> : null
          }
        </div>
      );
    } else {
      return (
        <div>
          <form ref='paymentForm' onSubmit={(e) => {this.onSubmit(e)}}>
            <span>{ paymentError }</span><br />
            <input type='text' data-stripe='number' placeholder='credit card number' /><br />
            <input type='text' data-stripe='exp-month' placeholder='expiration month' /><br />
            <input type='text' data-stripe='exp-year' placeholder='expiration year' /><br />
            <input type='text' data-stripe='cvc' placeholder='cvc' /><br />
            <input disabled={this.state.submitDisabled} type='submit' value='Purchase' />
          </form>
          { 
            (paymentComplete) ? <p>Payment complete !</p> : null
          }
        </div>

      );
    }
  }

}

export default Payment;
