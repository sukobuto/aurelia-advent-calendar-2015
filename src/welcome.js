import {inject} from 'aurelia-framework';
import {Account} from 'services'

@inject(Account)
export class Welcome {
	heading = 'Welcome to the Aurelia Navigation App!';
	firstName = 'John';
	lastName = 'Doe';
	previousValue = this.fullName;

	constructor(account) {
		this.firstName = account.firstName;
		this.lastName = account.lastName;
	}

	//Getters can't be directly observed, so they must be dirty checked.
	//However, if you tell Aurelia the dependencies, it no longer needs to dirty check the property.
	//To optimize by declaring the properties that this getter is computed from, uncomment the line below
	//as well as the corresponding import above.
	//@computedFrom('firstName', 'lastName')
	get fullName() {
		return `${this.firstName} ${this.lastName}`;
	}

	submit() {
		this.previousValue = this.fullName;
		alert(`Welcome, ${this.fullName}!`);
	}

	canDeactivate() {
		if (this.fullName !== this.previousValue) {
			return confirm('Are you sure you want to leave?');
		}
	}
}

export class UpperValueConverter {
	toView(value) {
		return value && value.toUpperCase();
	}
}
