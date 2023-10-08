import {Component, Input, OnInit} from '@angular/core';
import {Product} from '../../coreModule/model/product.model'
import {CartItem} from '../../coreModule/model/cartItem.model';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {CartItemsService} from '../../coreModule/cart-item-service/cart-items.service';
import {TaxService} from '../../coreModule/tax-service/tax.service';
import { MessageService } from '../../coreModule/messages-service/message.service';







@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})



export class ProductComponent implements OnInit {

  @Input() product: Product = {};
  cartItems: CartItem[] = [];
  // @ts-ignore
  productForm: FormGroup;
  unite : string = "€"

  constructor(private fb: FormBuilder,
              private cartItemsService: CartItemsService,
              public taxService: TaxService , private messageService: MessageService) {
  }

  ngOnInit() {
    this.cartItems = this.cartItemsService.getCartItems();
    this.productForm = this.fb.group({
      quantity: [1, [Validators.required, this.quantityValidator(this.product, this.cartItems)]]
    });
    // subscribe to cart Items subject in order to get updated to selected product actions
    this.cartItemsService.getValue().subscribe(cartItems => {
      this.cartItems = cartItems;
    });
  }

  /**
   * Custom function Validator to check the available left quantity and return validation error when
   * the quantity of the product commanded (including what is already added to Cart) is superior to the
   * available quantity in stock
   * @param product product selected
   * @param cardItems cart items already selected
   */
  quantityValidator(product: Product, cardItems: CartItem[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      let selectedCardItem = cardItems.find(item => item.product === product);
      let selectedQuantity = selectedCardItem ? selectedCardItem.quantity: 0;
      if (product.quantity !== undefined && value + selectedQuantity > product.quantity) {
        return {'quantityExceedsMax': true};
      }
      return null;
    };
  }

  /**
   * Customise error message depending on the validation error
   */
  getQuantityErrorMessage(): string {
    // @ts-ignore
    const quantityControl = this.productForm.get('quantity');
    if (quantityControl !== null) {
      if (quantityControl.hasError('required')) {
        return 'La quantité est requise';
      } else if (quantityControl.hasError('quantityExceedsMax')) {
        return 'La quantité saisie dépasse la quantité disponible';
      } else {
        return '';
      }
    }
    return '';
  }

  /**
   * update cartItems with the added product
   * @param product added Product
   * @param quantity quantity of the added product
   */
  addToCart(product: Product, quantity: number): void {
           
    let cartItem = this.cartItems.find((item) => item.product.id === product.id);

    if (cartItem) {
      if(cartItem.quantity && product.quantity && (product.quantity >= cartItem.quantity + quantity) ){
      cartItem.quantity = cartItem.quantity + quantity;
      this.messageService.add('Amount in cart changed for: ' + cartItem.product.productName);
      this.cartItemsService.emitValue(this.cartItems);
      }
      else {
        this.messageService.addError('Quantity not available: ' + product.productName);
    
      }
    } else {
      cartItem = new CartItem();
      cartItem.product = product;
      cartItem.quantity = quantity;
      cartItem.priceWithTax = Number(this.taxService.getPriceWithTax(product));
      this.cartItems.push(cartItem);
      this.messageService.add('Added to cart: ' + cartItem.product.productName);
      this.cartItemsService.emitValue(this.cartItems);
    }
    // Use the service for inter Module communication

  
  
}
}
