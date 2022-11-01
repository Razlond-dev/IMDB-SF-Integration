import { LightningElement, api } from 'lwc';

export default class CustomCheckboxGroup extends LightningElement {
    _selectedValues = [];
    _options = [];
    @api name;
    @api label;
    @api set options(value) {
        this._options = [...value];
        this.manageSelected();
    }
    get options() {
        return [...this._options];
    }
    @api set value(value) {
        this._selectedValues = [...value];
        this.manageSelected();
    }
    get value() {
        return [...this._selectedValues];
    }
    manageSelected() {
        this._options = this._options.map((element) => ({
            ...element,
            checked: this._selectedValues.includes(element.value)
        }));
    }
    updateSelected() {
        this._selectedValues = [...this.template.querySelectorAll('input')]
            .filter((element) => element.checked)
            .map((element) => element.value);
        this.manageSelected();
        this.dispatchEvent(
            new CustomEvent('change', {
                detail: { selected: [...this._selectedValues] }
            })
        );
    }
}
