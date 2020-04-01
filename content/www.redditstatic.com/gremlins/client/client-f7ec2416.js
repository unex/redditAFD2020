(function (litElement, client) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    /**
     * A toast-style notification.
     *
     * Will display a toast-style notification that disappears after a few seconds.
     * This element can be appended anywhere into the DOM tree – if its parent does
     * not implement a `toast` slot, it will find the root application node (which
     * does) and move itself into that slot.
     */
    const VISIBLE_TIME = 3 * 1000;
    const FADE_TIME = .3 * 1000;
    let GremlinNotification = class GremlinNotification extends litElement.LitElement {
        constructor() {
            super(...arguments);
            this.fading = false;
            this.permanent = false;
            this.ariaLabel = '';
            this.timer = 0;
            this.autoSlotted = false;
        }
        static get styles() {
            return litElement.css `
      :host {
        display: block;
        margin: 5px;
        padding: 10px;
        border-radius: 8px;
        transition: opacity .3s;
        background-color: var(--color-text);
        color: var(--color-background);
        box-shadow: 0 1px 3px rgba(0,0,0,.4);
        opacity: 1;
      }

      :host([fading]) {
        opacity: 0;
      }
    `;
        }
        connectedCallback() {
            if (!this.autoSlotted && (!this.assignedSlot || this.assignedSlot.name !== 'toast')) {
                const app = document.querySelector('gremlin-app');
                if (app) {
                    this.slot = 'toast';
                    this.autoSlotted = true;
                    app.appendChild(this);
                    return;
                }
            }
            super.connectedCallback();
            if (this.permanent)
                return;
            this.timer = window.setTimeout(() => {
                if (!this.timer)
                    return;
                this.fading = true;
                this.timer = window.setTimeout(() => {
                    var _a;
                    (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this);
                }, FADE_TIME);
            }, VISIBLE_TIME);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = 0;
            }
        }
        firstUpdated() {
            const text = this.innerText;
            this.ariaLabel = `Notification: ${text}`;
        }
        render() {
            return litElement.html `<slot></slot>`;
        }
    };
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinNotification.prototype, "fading", void 0);
    __decorate([
        litElement.property({ type: Boolean })
    ], GremlinNotification.prototype, "permanent", void 0);
    __decorate([
        litElement.property({ type: String, reflect: true, attribute: 'aria-label' })
    ], GremlinNotification.prototype, "ariaLabel", void 0);
    GremlinNotification = __decorate([
        litElement.customElement('gremlin-notification')
    ], GremlinNotification);

    const customEvent = (name, detail) => (new CustomEvent(name, {
        composed: true,
        bubbles: true,
        detail,
    }));

    /**
     * A wrapper around a form element.
     */
    function getContentType(res) {
        const contentType = res.headers.get('content-type');
        return contentType === null || contentType === void 0 ? void 0 : contentType.split(';')[0];
    }
    let GremlinForm = class GremlinForm extends client.WithAsyncDispatch(client.WithEventHooks(litElement.LitElement)) {
        constructor() {
            super(...arguments);
            this.action = '';
            this.next = '';
            this._disabled = false;
            // not super happy with this, but it'll get the job done
            this.registeredGremlinActions = new Set();
            this.registeredGremlinInputs = new Set();
        }
        get disabled() {
            return this._disabled;
        }
        set disabled(value) {
            if (value === this._disabled)
                return;
            this._disabled = value;
            // Update own disabled attribute as well as those of all gremlin-action
            // buttons in sub-tree
            if (value) {
                this.setAttribute('disabled', '');
                for (let action of this.registeredGremlinActions) {
                    action.setAttribute('aria-disabled', 'true');
                }
            }
            else {
                this.removeAttribute('disabled');
                for (let action of this.registeredGremlinActions) {
                    action.removeAttribute('aria-disabled');
                }
            }
        }
        static get styles() {
            return litElement.css `
      :host {
        display: block;
      }
    `;
        }
        render() {
            return litElement.html `<slot></slot>`;
        }
        handleRegisterAction(e) {
            const originalTarget = e.composedPath()[0] || e.target;
            if (!(originalTarget instanceof HTMLElement) || originalTarget.nodeName !== 'GREMLIN-ACTION')
                return;
            this.registeredGremlinActions.add(originalTarget);
        }
        handleUnregisterAction(e) {
            const originalTarget = e.composedPath()[0] || e.target;
            if (!(originalTarget instanceof HTMLElement) || originalTarget.nodeName !== 'GREMLIN-ACTION')
                return;
            this.registeredGremlinActions.delete(originalTarget);
        }
        handleRegisterGremlinInput(e) {
            if (!e.target)
                return;
            e.stopPropagation();
            this.registeredGremlinInputs.add(e.target);
            const callback = e.detail.callback;
            if (callback)
                callback(this);
        }
        handleUnregisterGremlinInput(e) {
            if (!e.target)
                return;
            e.stopPropagation();
            this.registeredGremlinInputs.delete(e.target);
            const callback = e.detail.callback;
            if (callback)
                callback(this);
        }
        handleGremlinAction(e) {
            const type = e.detail.type;
            if (type !== 'submit')
                return;
            e.stopPropagation();
            this.submit();
        }
        handleFormSubmit(e) {
            const form = e.target;
            if (!form || !(form instanceof HTMLFormElement))
                return;
            e.preventDefault();
            this.submit();
        }
        handleClick(e) {
            if (e.target instanceof HTMLButtonElement && e.target.type === 'submit') {
                e.preventDefault();
                this.submit();
            }
        }
        async submit(action = this.action, fields) {
            if (this.disabled)
                return;
            this.disabled = true;
            const data = new URLSearchParams();
            // Populate form data with any inputs / textareas present in the light dom
            const elements = this.querySelectorAll('input, textarea, select');
            for (let i = 0; i < elements.length; i++) {
                const child = elements[i];
                if (child instanceof HTMLInputElement ||
                    child instanceof HTMLTextAreaElement ||
                    child instanceof HTMLSelectElement) {
                    // skip disabled elements
                    if (child.disabled)
                        continue;
                    // skip check-able elements if they aren't checked
                    if (child instanceof HTMLInputElement && (child.type === 'checkbox' || child.type === 'radio') && !child.checked) {
                        continue;
                    }
                    data.append(child.name, child.value);
                }
            }
            // If a button press submitted the form, add its value to the form data
            const activeButton = client.getActiveButton();
            if (activeButton) {
                data.append(activeButton.name, activeButton.value);
            }
            // Support for custom elements to register with the form as inputs
            if (this.registeredGremlinInputs.size) {
                for (let input of this.registeredGremlinInputs) {
                    data.append(input.name, input.value);
                }
            }
            if (fields) {
                for (let field of fields) {
                    data.append(field.name, field.value);
                }
            }
            try {
                await this.asyncDispatch('inject-csrf', data);
                const authHeaders = await this.asyncDispatch('get-auth');
                const res = await fetch(action, {
                    body: data,
                    method: 'post',
                    redirect: 'manual',
                    headers: Object.assign({ 'accept': 'gremlin/html' }, authHeaders),
                });
                if (res.redirected && res.url) {
                    location.href = res.url;
                    return;
                }
                const contentType = getContentType(res);
                if (contentType === 'text/html') {
                    // Supports backend sending back an html chunk to stuff directly into
                    // the UI; e.g. the app could send back a "<gremlin-notification>" to
                    // display the result as a toast notification.
                    const text = await res.text();
                    const template = document.createElement('template');
                    template.innerHTML = text;
                    const arr = Array.from(template.content.children);
                    if (arr.length === 1 && arr[0].nodeName.startsWith("GREMLIN-")) {
                        this.appendChild(arr[0]);
                        return;
                    }
                }
                else if (contentType === 'application/json') {
                    // Otherwise, api endpoints should send back a `true` success field,
                    // or a reason field with a string explanation for display.
                    const data = await res.json();
                    if (!data.success) {
                        throw new Error(data.reason);
                    }
                    else if (this.next) {
                        return this.dispatchEvent(customEvent('gremlin-action', { type: 'link', href: this.next }));
                    }
                    else {
                        return data;
                    }
                }
                if (res.status >= 400) {
                    throw new Error(await res.text());
                }
            }
            catch (err) {
                // TODO notification use is temporary, display this inside the form
                const toast = document.createElement('gremlin-notification');
                toast.innerText = err.toString();
                this.appendChild(toast);
            }
            finally {
                this.disabled = false;
            }
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinForm.prototype, "action", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinForm.prototype, "next", void 0);
    __decorate([
        litElement.property({ type: Boolean })
    ], GremlinForm.prototype, "disabled", null);
    __decorate([
        client.eventHook('register-gremlin-action-button')
    ], GremlinForm.prototype, "handleRegisterAction", null);
    __decorate([
        client.eventHook('unregister-gremlin-action-button')
    ], GremlinForm.prototype, "handleUnregisterAction", null);
    __decorate([
        client.eventHook('register-gremlin-form-input')
    ], GremlinForm.prototype, "handleRegisterGremlinInput", null);
    __decorate([
        client.eventHook('unregister-gremlin-form-input')
    ], GremlinForm.prototype, "handleUnregisterGremlinInput", null);
    __decorate([
        client.eventHook('gremlin-action')
    ], GremlinForm.prototype, "handleGremlinAction", null);
    __decorate([
        client.eventHook('submit')
    ], GremlinForm.prototype, "handleFormSubmit", null);
    __decorate([
        client.eventHook('click')
    ], GremlinForm.prototype, "handleClick", null);
    GremlinForm = __decorate([
        litElement.customElement('gremlin-form')
    ], GremlinForm);

    /**
     * Controller container component for rooms.
     */
    const REDIRECT_DELAY = 1000;
    function forceFocus(el) {
        if (el.hasAttribute('tabindex')) {
            el.blur();
            el.focus();
            return;
        }
        el.blur();
        el.setAttribute('tabindex', '0');
        el.focus();
        el.removeAttribute('tabindex');
    }
    let GremlinRoom = class GremlinRoom extends client.WithAsyncDispatch(client.WithEventHooks(litElement.LitElement)) {
        constructor() {
            super(...arguments);
            this.reportingEnabled = false;
            this.reporting = 0;
            this.hideButtons = false;
            this.role = 'group';
            this.originalPromptTitle = '';
        }
        static get styles() {
            return litElement.css `
      :host {
        display: block;
      }

      gremlin-action {
        margin-top: 16px;
      }
    `;
        }
        render() {
            if (this.hideButtons) {
                return litElement.html `<slot></slot>`;
            }
            if (!this.reportingEnabled) {
                return litElement.html `
        <slot></slot>
        <gremlin-action hollow type="enable-reporting">Report</gremlin-action>
      `;
            }
            let reportButton = this.reporting
                ? litElement.html `
          <gremlin-action type="submit">
            Report ${this.reporting} Answer${this.reporting > 1 ? 's' : ''}
          </gremlin-action>
        `
                : litElement.html `
          <gremlin-action type="submit" disabled aria-disabled="true">
            Select answers to report
          </gremlin-action>
        `;
            return litElement.html `
      <slot></slot>
      ${reportButton}
      <gremlin-action hollow compact type="disable-reporting">Cancel</gremlin-action>
    `;
        }
        async connectedCallback() {
            super.connectedCallback();
            this.form = await this.asyncDispatch('register-gremlin-form-input');
        }
        async disconnectedCallback() {
            super.disconnectedCallback();
            this.form = await this.asyncDispatch('unregister-gremlin-form-input');
        }
        enableReporting(e) {
            const type = e.detail.type;
            if (type !== 'enable-reporting')
                return;
            e.stopPropagation();
            this.reportingEnabled = true;
            // Getting hairy, but this is to enable selectively showing the report flag
            const notes = this.querySelectorAll('gremlin-note');
            for (let i = 0; i < notes.length; i++) {
                notes[i].reportable = true;
                notes[i].state = 'none';
                notes[i].role = 'checkbox';
            }
            const titleEl = document.querySelector('gremlin-prompt > h1, gremlin-prompt > h2');
            if (titleEl instanceof HTMLElement) {
                this.originalPromptTitle = titleEl.innerText;
                titleEl.innerText = 'Report notes';
                forceFocus(titleEl);
            }
        }
        disableReporting(e) {
            if (e && e.detail.type !== 'disable-reporting')
                return;
            if (e) {
                e.stopPropagation();
            }
            this.reportingEnabled = false;
            this.reporting = 0;
            const notes = this.querySelectorAll('gremlin-note');
            for (let i = 0; i < notes.length; i++) {
                notes[i].reportable = false;
                notes[i].state = 'none';
                notes[i].role = 'button';
            }
            const titleEl = document.querySelector('gremlin-prompt > h1, gremlin-prompt > h2');
            if (titleEl instanceof HTMLElement) {
                titleEl.innerText = this.originalPromptTitle;
                forceFocus(titleEl);
            }
        }
        handleReport(e) {
            if (!this.form || this.form.disabled)
                return;
            if (!(e.target instanceof HTMLElement))
                return;
            if (e.target.nodeName !== 'GREMLIN-NOTE')
                return;
            const el = e.target;
            el.state = el.state === 'none' ? 'selected' : 'none';
            const notes = this.querySelectorAll('gremlin-note');
            let selected = 0;
            for (let i = 0; i < notes.length; i++) {
                if (notes[i].state === 'selected')
                    selected += 1;
            }
            if (!this.reporting && selected) {
                this.form.disabled = false;
            }
            this.reporting = selected;
        }
        async handleSelect(e) {
            if (!this.form || this.form.disabled)
                return;
            if (this.reportingEnabled) {
                return this.handleReport(e);
            }
            // Hides submit button
            this.hideButtons = true;
            if (!(e.target instanceof HTMLElement))
                return;
            if (e.target.nodeName !== 'GREMLIN-NOTE')
                return;
            const el = e.target;
            el.state = 'waiting';
            const notes = this.querySelectorAll('gremlin-note');
            for (let i = 0; i < notes.length; i++) {
                notes[i].disabled = true;
            }
            // Force them to wait for 2s.  Anticipation!
            const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
            const data = await this.form.submit('/submit_guess', [{ name: 'note_id', value: e.target.id }]);
            if (!data) {
                setTimeout(() => {
                    el.state = 'none';
                    this.hideButtons = false;
                    for (let i = 0; i < notes.length; i++) {
                        notes[i].disabled = false;
                    }
                }, 2000);
                return;
            }
            await minDelay;
            el.state = data.result === 'WIN' ? 'correct' : 'incorrect';
            setTimeout(() => {
                this.dispatchEvent(customEvent('gremlin-action', { type: 'link', href: data.next }));
            }, REDIRECT_DELAY);
        }
        async handleReportSubmit(e) {
            if (!this.form || this.form.disabled)
                return;
            if (e.detail.type !== 'submit')
                return;
            e.stopPropagation();
            if (!this.reporting)
                return;
            if (!this.form)
                return;
            // Hides submit button
            this.hideButtons = true;
            const notes = this.querySelectorAll('gremlin-note');
            const noteIds = [];
            const formFields = [];
            for (let i = 0; i < notes.length; i++) {
                notes[i].disabled = true;
                if (notes[i].state === 'selected') {
                    noteIds.push(notes[i].id);
                }
            }
            if (noteIds.length) {
                formFields.push({
                    name: 'note_ids', value: noteIds.join(','),
                });
            }
            else {
                // TODO Not sure how this would happen.
                return;
            }
            // TODO intermediate UI state
            const data = await this.form.submit('/report_note', formFields);
            if (!data) {
                setTimeout(() => {
                    this.hideButtons = false;
                    const notes = this.querySelectorAll('gremlin-note');
                    for (let i = 0; i < notes.length; i++) {
                        notes[i].disabled = false;
                    }
                }, 2000);
                return;
            }
            else {
                const toast = document.createElement('gremlin-notification');
                toast.innerText = 'Your report has been received.';
                this.appendChild(toast);
            }
            setTimeout(() => {
                this.dispatchEvent(customEvent('gremlin-action', { type: 'link', href: data.next }));
            }, REDIRECT_DELAY);
        }
    };
    __decorate([
        litElement.property({ type: Boolean })
    ], GremlinRoom.prototype, "reportingEnabled", void 0);
    __decorate([
        litElement.property({ type: Number })
    ], GremlinRoom.prototype, "reporting", void 0);
    __decorate([
        litElement.property({ type: Boolean })
    ], GremlinRoom.prototype, "hideButtons", void 0);
    __decorate([
        litElement.property({ type: String, reflect: true })
    ], GremlinRoom.prototype, "role", void 0);
    __decorate([
        client.eventHook('gremlin-action')
    ], GremlinRoom.prototype, "enableReporting", null);
    __decorate([
        client.eventHook('gremlin-action')
    ], GremlinRoom.prototype, "disableReporting", null);
    __decorate([
        client.eventHook('select-note')
    ], GremlinRoom.prototype, "handleSelect", null);
    __decorate([
        client.eventHook('gremlin-action')
    ], GremlinRoom.prototype, "handleReportSubmit", null);
    GremlinRoom = __decorate([
        litElement.customElement('gremlin-room')
    ], GremlinRoom);

    /**
     * A prompt.  The main container UI element.
     */
    let GremlinPrompt = class GremlinPrompt extends litElement.LitElement {
        static get styles() {
            return litElement.css `
      :host {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      ::slotted([slot=header]) {
        text-align: center;
      }

      ::slotted(*) {
        text-align: center;
      }

      ::slotted(h1) {
        font-weight: 600;
        font-size: 24px;
        line-height: 23px;
      }

      ::slotted(h2) {
        font-weight: 500;
        font-size: 20px;
        line-height: 23px;
      }

      ::slotted(small) {
        margin-top: -5px;
        margin-bottom: 10px;
      }
    `;
        }
        render() {
            return litElement.html `
      <slot name="header"></slot>
      <slot></slot>
    `;
        }
    };
    GremlinPrompt = __decorate([
        litElement.customElement('gremlin-prompt')
    ], GremlinPrompt);

    /**
     * An action that the user can perform.  Likely, a button.
     */
    let GremlinAction = class GremlinAction extends client.WithEventHooks(litElement.LitElement) {
        constructor() {
            super(...arguments);
            this.type = 'unknown';
            this.compact = false;
            this.stroked = false;
            this.hollow = false;
            this.smol = false;
            this.role = "button";
            this.tabIndex = 0;
        }
        static get styles() {
            return litElement.css `
      :host {
        display: block;
        margin: 8px 0;
        display: block;
        padding: 15px;
        text-align: center;
        line-height: 18px;
        border-radius: 24px;
        border: 0;
        background-color: var(--color-upvote);
        background-image: var(--gradient-action);
        color: var(--color-light);
        font-weight: 600;
        font-size: 16px;
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;

        --background-hover: linear-gradient( 0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2) ), linear-gradient( 89.59deg, #EC0623 0%, #FF8717 100% );
        --background-active: linear-gradient( 0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ), linear-gradient( 89.59deg, #EC0623 0%, #FF8717 100% );
      }

      @media not all and (hover: hover) {
        :host(:hover) {
          animation: .2s bump;
          background: var(--background-active);
        }
      }

      @media (hover: hover) {
        :host(:hover) {
          background: var(--background-hover);   
        }

        :host(:active) {
          animation: .2s bump;
          background: var(--background-active);
        }
      }

      :host(:focus) {
        box-shadow: 0 0 0 2px var(--color-focus);
      }

      @keyframes bump {
        from { transform: scale(1); }
        33% { transform: scale(1.05); }
        to { transform: scale(1); }
      }

      :host([stroked]) {
        border: 1px solid currentColor;
      }

      :host([compact]) {
        padding: 8px;
      }

      :host([hollow]) {
        background: transparent;
        color: var(--color-title);
        --background-active: transparent;
        --background-hover: rgba(255, 255, 255, 0.5);
      }

      ::slotted(a) {
        color: inherit;
        text-decoration: inherit;
      }

      :host([smol]) {
        margin-left: 50px;
        margin-right: 50px;
        width: auto;
      }

      /* really not happy with the duplication here but it's easier to just do this */
      :host([disabled]) {
        background: var(--color-tone-3);
        color: var(--color-tone-5);
        animation: none;
      }
    `;
        }
        render() {
            return litElement.html `
      <slot></slot>
    `;
        }
        async connectedCallback() {
            super.connectedCallback();
            this.dispatchEvent(customEvent('register-gremlin-action-button'));
        }
        async disconnectedCallback() {
            super.disconnectedCallback();
            this.dispatchEvent(customEvent('unregister-gremlin-action-button'));
        }
        handleClick(e) {
            e.preventDefault();
            e.stopPropagation();
            this.dispatchAction();
        }
        handleKeydown(e) {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.stopPropagation();
                this.dispatchAction();
            }
        }
        dispatchAction() {
            let href = undefined;
            if (this.type === 'link') {
                const anchor = this.children[0];
                if (anchor instanceof HTMLAnchorElement) {
                    href = anchor.href;
                }
            }
            this.dispatchEvent(customEvent('gremlin-action', {
                type: this.type,
                href,
            }));
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinAction.prototype, "type", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinAction.prototype, "compact", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinAction.prototype, "stroked", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinAction.prototype, "hollow", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinAction.prototype, "smol", void 0);
    __decorate([
        litElement.property({ type: String, reflect: true })
    ], GremlinAction.prototype, "role", void 0);
    __decorate([
        litElement.property({ type: Number, reflect: true, attribute: 'tabindex' })
    ], GremlinAction.prototype, "tabIndex", void 0);
    __decorate([
        client.eventHook('click', true)
    ], GremlinAction.prototype, "handleClick", null);
    __decorate([
        client.eventHook('keydown')
    ], GremlinAction.prototype, "handleKeydown", null);
    GremlinAction = __decorate([
        litElement.customElement('gremlin-action')
    ], GremlinAction);

    /**
     * A note.
     */
    const ICON_MAP = {
        '': '',
        'none': 'flag',
        'selected': 'flag-solid',
        'correct': 'checkmark',
        'incorrect': 'xmark',
        // placeholder to reserve space, actual icon is hidden
        'waiting': 'checkmark',
    };
    let noteNumber = 1;
    let GremlinNote = class GremlinNote extends client.WithEventHooks(litElement.LitElement) {
        constructor() {
            super();
            this.id = '';
            this.disabled = false;
            // NOTE for future matt, would be great to have decorators that handled this
            // specific need – to update one or more aria attirbutes based on the state of
            // another property.
            this._reportable = false;
            this._state = '';
            this.role = 'button';
            this.tabIndex = 0;
            this.ariaChecked = false;
            this.ariaPressed = false;
            this.ariaLabel = '';
            this._idLabel = noteNumber++;
            this.state = 'none';
        }
        get reportable() {
            return this._reportable;
        }
        set reportable(value) {
            const oldValue = this._reportable;
            this._reportable = value;
            this._updateAriaLabel();
            this.requestUpdate('reportable', oldValue);
        }
        get state() {
            return this._state;
        }
        set state(value) {
            const oldValue = this._state;
            this._state = value;
            this._updateAriaLabel();
            if (value === 'none') {
                this.ariaChecked = false;
                this.ariaPressed = false;
            }
            else if (value === 'selected') {
                // room should handle changing role, because in 'none' state we don't know what
                // room state is
                this.ariaChecked = true;
                this.ariaPressed = false;
            }
            else {
                // in all other states we know it it should be in "button" mode.
                this.role = 'button';
                this.ariaPressed = true;
                this.ariaChecked = false;
            }
            this.requestUpdate('state', oldValue);
        }
        _updateAriaLabel() {
            const reportable = this._reportable;
            const state = this._state;
            const text = this.innerText;
            if (state === 'correct') {
                this.ariaLabel = 'Correct!';
            }
            else if (state === 'incorrect') {
                this.ariaLabel = 'Incorrect!';
            }
            else if (state === 'waiting') {
                this.ariaLabel = 'One moment.';
            }
            else if (reportable) {
                if (state === 'selected') {
                    this.ariaLabel = `Remove report flag from answer ${this._idLabel}: ${text}`;
                }
                else {
                    this.ariaLabel = `Add report flag to answer ${this._idLabel}: ${text}`;
                }
            }
            else {
                this.ariaLabel = `Identify answer ${this._idLabel}: ${text}`;
            }
        }
        static get styles() {
            return litElement.css `
      :host {
        display: flex;
        margin: 8px 0;
        padding: 15px 18px;
        border: 1px solid var(--color-tone-4);
        border-radius: 30px;
        width: 100%;
        box-sizing: border-box;
        cursor: pointer;
        color: var(--color-light);
        align-items: center;
        transition: background-color .2s;
        position: relative;

        --background-hover: transparent;
        --background-active: transparent;
      }

      :host(:focus) {
        box-shadow: 0 0 0 2px var(--color-focus);
      }

      /* touch, which has no hover, but uses... :hover instead of :active */
      @media not all and (hover: hover) {
        :host(:hover) {
          animation: .2s bump;
          background: var(--background-active);
        }
      }

      /* desktop, which supports hover */
      @media (hover: hover) {
        :host(:hover) {
          background: var(--background-hover);
        }

        :host(:active) {
          animation: .2s bump;
          background: var(--background-active);
        }
      }

      @keyframes bump {
        from { transform: scale(1); }
        33% { transform: scale(1.05); }
        to { transform: scale(1); }
      }

      .main {
        flex: 1 1 100%;
        text-align: left;
        padding-right: 12px;
      }

      g-icon {
        flex: 0 0;
        padding: 20px;
        margin: -20px;
      }

      g-icon[hidden] {
        visibility: hidden;
      }

      :host([state=none]) {
        color: inherit;
      }

      :host([state=none]) g-icon {
        color: var(--color-tone-2);
      }

      :host([disabled]) {
        color: inherit;
        background-color: transparent;
        transition: background-color .2s;
        animation: none;
      }

      :host([state=waiting]) {
        color: var(--color-light);
        background-color: var(--color-primary);
        animation: pulse 0.5s ease-in-out 0s infinite alternate;
      }

      @keyframes pulse { 
        from { transform: scale(0.95); } 
        to { transform: scale(1.03);  }  
      }

      :host([state=incorrect]),
      :host([state=selected]) {
        background-color: var(--color-negative);
        color: var(--color-light);
      }

      :host([state=incorrect]) {
        animation: incorrect .1s ease-in-out 0s 5 alternate none;
      }

      @keyframes incorrect { 
        from { transform: translate(10px,0); } 
        to { transform: translate(-10px,0); transform: scale(1);  }  
      }

      :host([state=selected]) {
        --background-hover: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), #EA0027;
        --background-active: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), #EA0027;
      }

      :host([state=correct]) {
        background-color: var(--color-positive);
        color: var(--color-light);
      }
    `;
        }
        render() {
            const hideIcon = (((this.disabled || !this.reportable) && this.state === 'none') ||
                this.state === 'waiting');
            const iconType = ICON_MAP[this.state];
            return litElement.html `
      <div class="main">
        <slot></slot>
      </div>
      <g-icon
        role="presentation"
        ?hidden=${hideIcon}
        type=${iconType}></g-icon>
    `;
        }
        firstUpdated() {
            this.reportable = false;
        }
        handleClick(e) {
            if (this.disabled)
                return;
            e.stopPropagation();
            this.dispatchEvent(customEvent('select-note'));
        }
        handleKeydown(e) {
            if (this.disabled)
                return;
            if (e.code === 'Enter' || e.code === 'Space') {
                e.stopPropagation();
                this.dispatchEvent(customEvent('select-note'));
            }
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinNote.prototype, "id", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinNote.prototype, "disabled", void 0);
    __decorate([
        litElement.property({ type: Boolean })
    ], GremlinNote.prototype, "reportable", null);
    __decorate([
        litElement.property({ type: String, reflect: true })
    ], GremlinNote.prototype, "state", null);
    __decorate([
        litElement.property({ type: String, reflect: true })
    ], GremlinNote.prototype, "role", void 0);
    __decorate([
        litElement.property({ type: Number, reflect: true, attribute: 'tabindex' })
    ], GremlinNote.prototype, "tabIndex", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true, attribute: 'aria-checked' })
    ], GremlinNote.prototype, "ariaChecked", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true, attribute: 'aria-pressed' })
    ], GremlinNote.prototype, "ariaPressed", void 0);
    __decorate([
        litElement.property({ type: String, reflect: true, attribute: 'aria-label' })
    ], GremlinNote.prototype, "ariaLabel", void 0);
    __decorate([
        client.eventHook('click')
    ], GremlinNote.prototype, "handleClick", null);
    __decorate([
        client.eventHook('keydown')
    ], GremlinNote.prototype, "handleKeydown", null);
    GremlinNote = __decorate([
        litElement.customElement('gremlin-note')
    ], GremlinNote);

    let GremlinVisuallyHidden = class GremlinVisuallyHidden extends litElement.LitElement {
        static get styles() {
            return litElement.css `
      :host {
        display: block;
        font-size: 1px;
        line-height: 1em;
        pointer-events: none;
        border: 0;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: relative; // different - for reading order in macOS VO
        display: inline-block; // new - for reading order in macOS VO
      }
    `;
        }
        render() {
            return litElement.html `<slot></slot>`;
        }
    };
    GremlinVisuallyHidden = __decorate([
        litElement.customElement('g-visuallyhidden')
    ], GremlinVisuallyHidden);

    /**
     * Container for stats elements
     */
    let GremlinStats = class GremlinStats extends litElement.LitElement {
        constructor() {
            super(...arguments);
            this.type = '';
        }
        static get styles() {
            return litElement.css `
      :host {
        display: flex;
        justify-content: center;
        margin-bottom: 8px;
      }

      ::slotted(*) {
        flex: 1 1 33%;
        display: grid;
        grid-template-rows: min-content auto;
        grid-row-gap: 11px;
        font-size: 14px;
      }
    `;
        }
        render() {
            return litElement.html `
      <g-visuallyhidden>
        <h3>Game statistics</h3>
      </g-visuallyhidden>
      <slot></slot>
    `;
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinStats.prototype, "type", void 0);
    GremlinStats = __decorate([
        litElement.customElement('gremlin-stats')
    ], GremlinStats);

    /**
     * Meta text
     */
    let GremlinMeta = class GremlinMeta extends litElement.LitElement {
        static get styles() {
            return litElement.css `
      :host {
        display: block;
        color: var(--color-tone-2);
        font-size: 14px;
        line-height: 16px;
      }
    `;
        }
        render() {
            return litElement.html `
      <slot></slot>
    `;
        }
    };
    GremlinMeta = __decorate([
        litElement.customElement('gremlin-meta')
    ], GremlinMeta);

    /**
     * The avatar ring meter.
     * A progress bar with some specific properties.
     * - draws a clipped image in the center (url to image specified by "avatar" attribute)
     * - will draw an unbroken ring if exactly 0 or 100%
     * - otherwise, will draw a ring split into two segments.  Each segment is guaranteed
     *   to show at a minimum size (to avoid tiny slivers) and small gaps are left between
     *   the two segments
     */
    const SIZE = 86;
    const SCALE = 2;
    const MID = SIZE / 2;
    const TAU = Math.PI * 2;
    const ROTATE = -TAU / 4;
    const MIN_SIZE = TAU / 15;
    const GAP_SIZE = MIN_SIZE / 2;
    var BarMode;
    (function (BarMode) {
        BarMode["Both"] = "both";
        BarMode["Positive"] = "positive";
        BarMode["Negative"] = "negative";
    })(BarMode || (BarMode = {}));
    const JUICE_TIME = 800;
    /* percent  should be in [0, 1] */
    function lerp(percent, start, end) {
        // apply ease out
        const t = percent * (2 - percent);
        if (start < end) {
            return start + ((end - start) * t);
        }
        else if (start > end) {
            // why is my brain not working i know this is too complicated
            return start - ((start - end) * (t));
        }
        else {
            return end;
        }
    }
    let GremlinAvatarmeter = class GremlinAvatarmeter extends litElement.LitElement {
        constructor() {
            super();
            this.avatar = '';
            this.icon = '';
            this.value = 0;
            this.max = 1;
            this.background = '#24A0ED';
            this.mode = BarMode.Both;
            this.secondary = '#24A0ED';
            // Rely on labels below to be descriptive
            this.role = 'presentation';
            this._startTime = 0;
            this._endTime = 0;
            this._currentValue = 0;
            this._startValue = 0;
            this.animationCallback = () => {
                this.redrawCanvas();
                if (this._currentValue === this.value) {
                    return;
                }
                const t = Date.now();
                if (t >= this._endTime) {
                    this._currentValue = this.value;
                }
                else {
                    const p = (t - this._startTime) / JUICE_TIME;
                    const lerpedValue = lerp(p, this._startValue, this.value);
                    const constrained = this.value > this._startValue
                        ? Math.min(this.value, lerpedValue)
                        : Math.max(this.value, lerpedValue);
                    this._currentValue = constrained;
                }
                window.requestAnimationFrame(this.animationCallback);
            };
            this.canvas = document.createElement('canvas');
            this.canvas.width = SIZE * SCALE;
            this.canvas.height = SIZE * SCALE;
            this.canvas.style.width = SIZE + 'px';
            this.canvas.style.height = SIZE + 'px';
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(SCALE, SCALE);
            this.img = null;
        }
        firstUpdated() {
            if (this.avatar) {
                this.img = new Image();
                this.img.onload = () => {
                    this.redrawCanvas();
                };
                this.img.onerror = () => {
                    this.img = null;
                    this.redrawCanvas();
                };
                this.img.src = this.avatar;
            }
            else {
                this.redrawCanvas();
            }
            switch (this.mode) {
                case BarMode.Positive:
                    this._currentValue = 1;
                    this._startValue = 1;
                    break;
                case BarMode.Negative:
                    this._currentValue = 0;
                    this._startValue = 0;
                    break;
                case BarMode.Both:
                default:
                    this._currentValue = this.value;
                    this._startValue = this.value;
            }
            setTimeout(() => {
                this._startTime = Date.now();
                this._endTime = this._startTime + JUICE_TIME;
                this.animationCallback();
            }, 300);
        }
        static get styles() {
            return litElement.css `
      :host {
        display: inline-block;
        position: relative;
      }

      canvas {
        display: block;
        margin: auto;
      }

      g-icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5em;
      }
    `;
        }
        redrawCanvas() {
            const value = this._currentValue;
            this.ctx.save();
            this.ctx.clearRect(0, 0, SIZE, SIZE);
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            this.ctx.translate(MID, MID);
            this.ctx.rotate(ROTATE);
            this.ctx.translate(-MID, -MID);
            // Solid bar
            if (!value || value >= this.max) {
                this.ctx.strokeStyle = !value ? '#01D0A7' : '#FF8418';
                if ((!value && this.mode === BarMode.Negative) ||
                    (value && this.mode === BarMode.Positive)) {
                    this.ctx.globalAlpha = .2;
                }
                this.ctx.beginPath();
                this.ctx.arc(MID, MID, MID - 6, 0, TAU);
                this.ctx.stroke();
                this.ctx.closePath();
                this.ctx.globalAlpha = 1;
            }
            else {
                const aPercent = value / this.max;
                const aPart = Math.min(TAU - MIN_SIZE, Math.max(MIN_SIZE, aPercent * TAU));
                if (this.mode === BarMode.Positive)
                    this.ctx.globalAlpha = .2;
                else
                    this.ctx.globalAlpha = 1;
                this.ctx.strokeStyle = '#FF8418';
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.arc(MID, MID, MID - 6, GAP_SIZE, aPart);
                this.ctx.stroke();
                this.ctx.closePath();
                if (this.mode === BarMode.Negative)
                    this.ctx.globalAlpha = .2;
                else
                    this.ctx.globalAlpha = 1;
                this.ctx.strokeStyle = '#01D0A7';
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.arc(MID, MID, MID - 6, aPart + GAP_SIZE, TAU);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            this.ctx.translate(MID, MID);
            this.ctx.rotate(-ROTATE);
            this.ctx.translate(-MID, -MID);
            // image
            if (this.img) {
                this.ctx.beginPath();
                this.ctx.arc(MID, MID, 24, 0, TAU);
                this.ctx.clip();
                this.ctx.globalAlpha = 1;
                this.ctx.fillStyle = this.background;
                this.ctx.fillRect(MID - 24, MID - 24, 48, 48);
                this.ctx.drawImage(this.img, MID - 24, MID - 24, 48, 48);
                this.ctx.closePath();
            }
            else {
                const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--color-tone-5');
                if (bgColor) {
                    this.ctx.beginPath();
                    this.ctx.arc(MID, MID, 24, 0, TAU);
                    this.ctx.globalAlpha = 1;
                    this.ctx.fillStyle = bgColor;
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
            this.ctx.restore();
        }
        render() {
            return litElement.html `
      ${this.canvas}
      ${this.icon ? litElement.html `<g-icon type=${this.icon}></g-icon>` : ''}
    `;
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "avatar", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "icon", void 0);
    __decorate([
        litElement.property({ type: Number })
    ], GremlinAvatarmeter.prototype, "value", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "max", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "background", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "mode", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "secondary", void 0);
    __decorate([
        litElement.property({ type: String, reflect: true })
    ], GremlinAvatarmeter.prototype, "role", void 0);
    GremlinAvatarmeter = __decorate([
        litElement.customElement('gremlin-avatarmeter')
    ], GremlinAvatarmeter);

    /**
     * Displays a simple number stat in the same style as gremlin-avatarmeter.
     */
    function floorFixed(value) {
        return (Math.floor(value * 10) / 10).toFixed(1);
    }
    // Take a number and return a string with a maximum of 5 characters
    // assumes positive integers
    function shortNumber(value) {
        if (value < 1)
            return '-';
        // 1 - 999 can show as-is
        if (value < 1000)
            return value.toString();
        // 1.0K - 999.9K
        if (value < 1000000)
            return floorFixed(value / 1000) + 'K';
        // 1.0M - 999.9M
        if (value < 1000000000)
            return floorFixed(value / 1000000) + 'M';
        // !
        return '∞';
    }
    let GremlinNumberstat = class GremlinNumberstat extends litElement.LitElement {
        constructor() {
            super(...arguments);
            this.value = 0;
        }
        static get styles() {
            return litElement.css `
      :host {
        display: inline-block;
        height: ${SIZE}px;
        width: ${SIZE}px;
        border-radius: 50%;
        line-height: ${SIZE}px;
        vertical-align: middle;
        text-align: center;
        text-transform: uppercase;
        margin: 0 auto;
        font-size: 14px;
        background-color: var(--color-tone-5);
        font-weight: bold;
      }
    `;
        }
        render() {
            return litElement.html `${shortNumber(this.value)}`;
        }
    };
    __decorate([
        litElement.property({ type: Number })
    ], GremlinNumberstat.prototype, "value", void 0);
    GremlinNumberstat = __decorate([
        litElement.customElement('gremlin-numberstat')
    ], GremlinNumberstat);

    /**
     * The balloon that shows on the results page to promt editing your note.
     */
    let GremlinEditBalloon = class GremlinEditBalloon extends client.WithEventHooks(litElement.LitElement) {
        constructor() {
            super(...arguments);
            this.href = '';
            this.role = 'link';
            this.tabIndex = 0;
        }
        static get styles() {
            return litElement.css `
      :host {
        display: block;
        position: relative;
        padding-bottom: 10px;
        margin-bottom: 8px;

        --color: var(--color-tone-5);
      }

      :host(:focus) {
        --color: var(--color-focus);
        color: var(--color-light);
      }

      .content {
        display: flex;
        background-color: var(--color);
        border-radius: 29px;
        line-height: 19px;
        padding: 5px 10px;
      }

      g-icon {
        flex: 0 0;
        margin-left: 8px;
      }

      .main {
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-style: italic;
      }

      .tail {
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-width: 10px 8px 0;
        border-top-color: var(--color);
        transform: translate(-50%, 0);
      }
    `;
        }
        render() {
            return litElement.html `
      <div class="tail"></div>
      <div class="content">
        <div class="main">"<slot></slot>"</div>
        <g-icon type="pencil"></g-icon>
      </div>
    `;
        }
        handleClick(e) {
            e.stopPropagation();
            this.dispatchEvent(customEvent('gremlin-action', { type: 'link', href: this.href }));
        }
        handleKeydown(e) {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.stopPropagation();
                this.dispatchEvent(customEvent('gremlin-action', { type: 'link', href: this.href }));
            }
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinEditBalloon.prototype, "href", void 0);
    __decorate([
        litElement.property({ type: String, reflect: true })
    ], GremlinEditBalloon.prototype, "role", void 0);
    __decorate([
        litElement.property({ type: Number, reflect: true, attribute: 'tabindex' })
    ], GremlinEditBalloon.prototype, "tabIndex", void 0);
    __decorate([
        client.eventHook('click')
    ], GremlinEditBalloon.prototype, "handleClick", null);
    __decorate([
        client.eventHook('keydown')
    ], GremlinEditBalloon.prototype, "handleKeydown", null);
    GremlinEditBalloon = __decorate([
        litElement.customElement('gremlin-editballoon')
    ], GremlinEditBalloon);

    /**
     * Display for your streak
     */
    let GremlinResult = class GremlinResult extends litElement.LitElement {
        constructor() {
            super(...arguments);
            this.negative = false;
        }
        static get styles() {
            return litElement.css `
      :host {
        display: inline-block;
        padding: 15px;
        position: relative;
        min-width: 180px;
        margin: 20px 0;
        --color: var(--color-gremlin);
        animation: slideup .4s forwards;
      }

      @keyframes slideup {
        from { transform: translateY(20px); }
        to { transform: translateY(0px); }
      }

      :host([negative]) {
        --color: var(--color-negative);
      }

      .bg {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: var(--color);
        opacity: .2;
        border-radius: 4px;
        z-index: -1;
      }

      ::slotted([slot=header]) {
        font-style: italic;
        font-weight: bold;
        font-size: 17px;
        line-height: 22px;
        text-transform: uppercase;
        margin: 0;
      }

      ::slotted([slot=display]) {
        font-style: italic;
        font-weight: bold;
        font-size: 75px;
        line-height: 98px;
        color: var(--color);
        margin-bottom: 5px;
      }
    `;
        }
        render() {
            return litElement.html `
      <div class="bg"></div>
      <slot name="header"></slot>
      <slot name="display"></slot>
      <slot></slot>
    `;
        }
    };
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinResult.prototype, "negative", void 0);
    GremlinResult = __decorate([
        litElement.customElement('gremlin-result')
    ], GremlinResult);

    /**
     * A template for a custom element.
     */
    const PUNCTUATION = new Set(['.', '!', '?']);
    let GremlinNoteComposer = class GremlinNoteComposer extends client.WithEventHooks(litElement.LitElement) {
        constructor() {
            super(...arguments);
            this.min = -Infinity;
            this.max = Infinity;
            this.message = '';
            this.errored = false;
        }
        static get styles() {
            return litElement.css `
      :host {
        display: block;
      }

      span {
        color: var(--color-tone-3);
      }

      :host([errored]) span {
        color: var(--color-negative);
      }
    `;
        }
        render() {
            return litElement.html `
      <slot></slot>
      <span>${this.message}</span>
    `;
        }
        firstUpdated() {
            const parent = this.parentElement;
            if (parent && parent.nodeName === 'GREMLIN-FORM') {
                this.form = parent;
                const textarea = this.querySelector('textarea');
                if (textarea)
                    this.updateDisplay(textarea);
            }
        }
        handleInput(e) {
            if (!(e.target instanceof HTMLTextAreaElement))
                return;
            this.updateDisplay(e.target);
        }
        updateDisplay(textarea) {
            if (!this.form)
                return;
            const charCount = textarea.value.length + 1;
            const lastChar = textarea.value[charCount];
            // compensate for the backend adding punctuation prior to validation in prepare_note
            const count = PUNCTUATION.has(lastChar) ? charCount : charCount + 1;
            this.form.disabled = count < this.min || count > this.max;
            if (count < this.min) {
                this.form.disabled = true;
                this.message = `Enter a note between ${this.min} and ${this.max} letters.`;
                this.errored = false;
            }
            else if (count > this.max) {
                this.form.disabled = true;
                this.message = `Note is too long! Please enter less than ${this.max} letters.`;
                this.errored = true;
            }
            else {
                this.form.disabled = false;
                this.message = '';
            }
        }
    };
    __decorate([
        litElement.property({ type: Number })
    ], GremlinNoteComposer.prototype, "min", void 0);
    __decorate([
        litElement.property({ type: Number })
    ], GremlinNoteComposer.prototype, "max", void 0);
    __decorate([
        litElement.property({ type: String })
    ], GremlinNoteComposer.prototype, "message", void 0);
    __decorate([
        litElement.property({ type: Boolean, reflect: true })
    ], GremlinNoteComposer.prototype, "errored", void 0);
    __decorate([
        client.eventHook('input')
    ], GremlinNoteComposer.prototype, "handleInput", null);
    GremlinNoteComposer = __decorate([
        litElement.customElement('gremlin-notecomposer')
    ], GremlinNoteComposer);

}(__gremlis_deps, __gremlis_deps));
