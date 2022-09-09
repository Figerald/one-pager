import { Directive, HostListener } from "@angular/core";

@Directive({
    selector: '[oneDecimalNumber]'
})
export class OneDecimalNumberDirective {
    private numb: string = '';
    private regex: RegExp = new RegExp(/^\d*\.?\d{0,1}$/g);
    private specialKeys: Array<string> = ['Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
    private numbersArray: Array<string> = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
    public constructor() {
    }

    @HostListener('keydown', ['$event']) public onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }

        if (this.numbersArray.indexOf(event.key) !== -1) {
            if (this.numb.includes('.') && event.key === '.') return;
            if (this.numb.slice(this.numb.indexOf('.')).length < 3) {
                this.numb = `${this.numb}${event.key}`;
            }
        }

        if (event.key === 'Backspace') {
            this.numb = this.numb.substring(0, this.numb.length - 1);
        }

        if (this.numb && !String(this.numb).match(this.regex)) {
            this.numb = this.numb.slice(0, -1);
            event.preventDefault();
        }
    }
}
