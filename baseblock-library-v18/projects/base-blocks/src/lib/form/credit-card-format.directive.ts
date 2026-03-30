import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { CreditCard } from './credit-card';

@Directive({
  selector: '[ccNumber]'
})

export class CreditCardFormatDirective {

  public target;
  private cards: Array<any>;
  public cardLength:any;

  constructor(private el: ElementRef) {
    this.target = this.el.nativeElement;
    this.cards = CreditCard.cards();
    
  }
  
  @Output() changeType: EventEmitter<any> = new EventEmitter<any>();
  @Output() setCardLength: EventEmitter<any> = new EventEmitter<any>();
  
  @HostListener('keypress', ['$event']) onKeypress(e:any) {
    if (CreditCard.restrictNumeric(e)) {
      if (CreditCard.isCardNumber(e.which, this.target)) {
        this.formatCardNumber(e);
      }
    } else {
      e.preventDefault();
      return false;
    }

  }
  @HostListener('keydown', ['$event']) onKeydown(e:any) {
    this.formatBackCardNumber(e);
  }
  @HostListener('keyup', ['$event']) onKeyup(e:any) {
    this.setCardType(e);
  }
  @HostListener('paste', ['$event']) onPaste(e:any) {
    this.reFormatCardNumber(e);
  }
  @HostListener('change', ['$event']) onChange(e:any) {
    this.reFormatCardNumber(e);
  }
  @HostListener('input', ['$event']) onInput(e:any) {
    this.reFormatCardNumber(e);
    this.setCardType(e);
  }

  private formatCardNumber(e:any) {
    let card,
        digit:any,
        length,
        re,
        upperLength,
        value:any;

    digit = String.fromCharCode(e.which);
    if (!/^\d+$/.test(digit)) {
      return;
    }

    value = this.target.value;

    card = CreditCard.cardFromNumber(value + digit);

    length = (value.replace(/\D/g, '') + digit).length;

    upperLength = 16;

    if (card) {
      upperLength = card.length[card.length.length - 1];
    }
    
    this.cardLength = upperLength;

    if (length >= upperLength) {
      return;
    }

    if ((this.target.selectionStart != null) && this.target.selectionStart !== value.length) {
      // return;
    }

    if (card && card.type === 'amex') {
      re = /^(\d{4}|\d{4}\s\d{6})$/;
    } else {
      re = /(?:^|\s)(\d{4})$/;
    }

    if (re.test(value)) {
      e.preventDefault();
      setTimeout(() => {
        this.target.value = `${value} ${digit}`;
      });
    } else if (re.test(value + digit)) {
      e.preventDefault();
      setTimeout(() => {
        this.target.value = `${value}${digit} `;
      });
    }
  }

  private formatBackCardNumber(e:any) {
    let value = this.target.value;

    if (e.which !== 8) {
      return;
    }

    if ((this.target.selectionStart != null) && this.target.selectionStart !== value.length) {
      // return;
    }

    if (/\d\s$/.test(value)) {
      e.preventDefault();
      setTimeout(() => {
        this.target.value = value.replace(/\d\s$/, '');
      });
    } else if (/\s\d?$/.test(value)) {
      e.preventDefault();
      setTimeout(() => {
        this.target.value = value.replace(/\d$/, '');
      });
    }
}

  private setCardType(e:any) {
    let card,
        val      = this.target.value,
        cardType = CreditCard.cardType(val) || 'unknown';

    if (!this.target.classList.contains(cardType)) {

      for (let i = 0, len = this.cards.length; i < len; i++) {
        card = this.cards[i];
        this.target.classList.remove(card.type);
      }

      this.target.classList.remove('unknown');
      this.target.classList.add(cardType);
      this.changeType.emit(cardType);
      this.setCardLength.emit(this.cardLength);
      
      this.target.classList.toggle('identified', cardType !== 'unknown');
    }
  }

  private reFormatCardNumber(e:any) {
    setTimeout(() => {
      let value = CreditCard.replaceFullWidthChars(this.target.value);
      value = CreditCard.formatCardNumber(value);
      this.target.selectionStart = this.target.selectionEnd = CreditCard.safeVal(value, this.target);
    });
  }

}
