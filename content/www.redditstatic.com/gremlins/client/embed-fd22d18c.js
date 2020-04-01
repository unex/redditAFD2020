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

    const customEvent = (name, detail) => (new CustomEvent(name, {
        composed: true,
        bubbles: true,
        detail,
    }));

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
            this.img = new Image();
            // TODO handle error here
            this.img.onload = () => {
                this.redrawCanvas();
            };
            this.img.onerror = () => {
                this.img = null;
                this.redrawCanvas();
            };
        }
        firstUpdated() {
            if (!this.img)
                return;
            this.img.src = this.avatar;
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
            this.ctx.restore();
        }
        render() {
            return litElement.html `${this.canvas}`;
        }
    };
    __decorate([
        litElement.property({ type: String })
    ], GremlinAvatarmeter.prototype, "avatar", void 0);
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

}(__gremlis_deps, __gremlis_deps));
