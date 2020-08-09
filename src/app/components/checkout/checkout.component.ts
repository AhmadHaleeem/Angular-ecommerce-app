import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { ShopFormService } from '../../services/shop-form.service';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGorup: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private shopFormService: ShopFormService) {}

  ngOnInit(): void {
    this.checkoutFormGorup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);
    
    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log(data);
        this.creditCardMonths = data;
      }
    )

    // populate credit card years
    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log('-------------------');
        console.log(data);
        this.creditCardYears = data;
      }
    )

    // populate countries
    this.shopFormService.getCountries().subscribe(
      data => this.countries = data
    );
  }

  copyShippingAddressToBillingAddress(event) {
    if (event.target.checked) {
      this.checkoutFormGorup.controls.billingAddress.setValue(this.checkoutFormGorup.controls.shippingAddress.value);
    } else {
      this.checkoutFormGorup.controls.billingAddress.reset();
    }
  }

  onSubmit() {
    console.log('handling the submit button');
    console.log(this.checkoutFormGorup.get('customer').value.firstName);
    console.log('shipping address country is ' + this.checkoutFormGorup.get('shippingAddress').value.country.name);
    console.log('shipping address state is ' + this.checkoutFormGorup.get('shippingAddress').value.state.name);
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGorup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear) ;
    
    // if the current year equals the selected year, then start with the currrent month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGorup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);
    
    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        formGroup.get('state').setValue(data[0]);
      }
    );
  }
}
