import React, { Component } from 'react';
/* eslint-disable */
class Payment extends Component {

  componentDidMount() {
    if ('PaymentRequest' in window) {
      this.request = this.initPaymentRequest();
    } else {
      console.log('Not support PaymentRequest');
    }
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
      total: {label: 'Donation', amount: {currency: 'USD', value: '55.00'}},
      displayItems: [
        {
          label: 'Original donation amount',
          amount: {currency: 'USD', value: '65.00'},
        },
        {
          label: 'Friends and family discount',
          amount: {currency: 'USD', value: '-10.00'},
        },
      ],
    };

    return new PaymentRequest(supportedInstruments, details);
  }

  sendPaymentToServer(instrumentResponse) {
    window.setTimeout(() => {
      instrumentResponse.complete('success')
        .then(() => {
          console.log('complete');
          console.log(instrumentResponse);
        })
        .catch((err) => {
          console.log(err);
        });
    }, 2000)
  }

  onClick(event) {
    console.log(this.request);
    this.showPaymentRequest();
    /*
    if (this.request.canMakePayment) {
      this.request.canMakePayment().then(result => {
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
    this.request.show().then((instrumentResponse) => {
      this.sendPaymentToServer(instrumentResponse);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render() {
    if ('PaymentRequest' in window) {
      return (
        <button onClick={(e) => {this.onClick(e)}}>
          Buy
        </button>
      );
    } else {
      return (
        <p>Broswer not support PaymentRequest!</p>
      );
    }
  }

}

export default Payment;
