/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = globalThis, e$2 = t$1.ShadowRoot && (void 0 === t$1.ShadyCSS || t$1.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$3 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$2 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$4.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$4.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$3("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$3 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$3(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$2) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$1.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$2 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i2 = t2;
  switch (s2) {
    case Boolean:
      i2 = null !== t2;
      break;
    case Number:
      i2 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t2);
      } catch (t3) {
        i2 = null;
      }
  }
  return i2;
} }, f$1 = (t2, s2) => !i$2(t2, s2), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ??= Symbol("metadata"), a$1.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ??= []).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b$1) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i2 = Symbol(), h2 = this.getPropertyDescriptor(t2, i2, s2);
      void 0 !== h2 && e$1(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i2) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2?.call(this);
      r2?.call(this, s3), this.requestUpdate(t2, h2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$2(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$3(t3)];
      for (const i2 of s2) this.createProperty(i2, t3[i2]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i2] of s2) this.elementProperties.set(t3, i2);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i2 = this._$Eu(t3, s2);
      void 0 !== i2 && this._$Eh.set(i2, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i2 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i2.unshift(c$2(s3));
    } else void 0 !== s2 && i2.push(c$2(s2));
    return i2;
  }
  static _$Eu(t2, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t2) => t2(this));
  }
  addController(t2) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t2), void 0 !== this.renderRoot && this.isConnected && t2.hostConnected?.();
  }
  removeController(t2) {
    this._$EO?.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t2.set(i2, this[i2]), delete this[i2]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t2) => t2.hostConnected?.());
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t2) => t2.hostDisconnected?.());
  }
  attributeChangedCallback(t2, s2, i2) {
    this._$AK(t2, i2);
  }
  _$ET(t2, s2) {
    const i2 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== i2.converter?.toAttribute ? i2.converter : u$1).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== t3.converter?.fromAttribute ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? this._$Ej?.get(e2) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i2, e2 = false, h2) {
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e2 && (h2 = this[t2]), i2 ??= r2.getPropertyOptions(t2), !((i2.hasChanged ?? f$1)(h2, s2) || i2.useDefault && i2.reflect && h2 === this._$Ej?.get(t2) && !this.hasAttribute(r2._$Eu(t2, i2)))) return;
      this.C(t2, s2, i2);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, r2) {
    i2 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i2] of t3) {
        const { wrapped: t4 } = i2, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i2, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), this._$EO?.forEach((t3) => t3.hostUpdate?.()), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    this._$EO?.forEach((t3) => t3.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq &&= this._$Eq.forEach((t3) => this._$ET(t3, this[t3])), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1?.({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = globalThis, i$1 = (t2) => t2, s$1 = t.trustedTypes, e = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$1 = "?" + o$2, r$2 = `<${n$1}>`, l = document, c = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof t2?.[Symbol.iterator], f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 }), b = x(1), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i2) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e ? e.createHTML(i2) : i2;
}
const N = (t2, i2) => {
  const s2 = t2.length - 1, e2 = [];
  let n3, l2 = 2 === i2 ? "<svg>" : 3 === i2 ? "<math>" : "", c2 = v;
  for (let i3 = 0; i3 < s2; i3++) {
    const s3 = t2[i3];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s3.length && (c2.lastIndex = f2, u2 = c2.exec(s3), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i3 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$2 + x2) : s3 + o$2 + (-2 === d2 ? i3 : x2);
  }
  return [V(t2, l2 + (t2[s2] || "<?>") + (2 === i2 ? "</svg>" : 3 === i2 ? "</math>" : "")), e2];
};
class S {
  constructor({ strings: t2, _$litType$: i2 }, e2) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i2);
    if (this.el = S.createElement(f2, e2), P.currentNode = this.el.content, 2 === i2 || 3 === i2) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i3 = v2[a2++], s2 = r2.getAttribute(t3).split(o$2), e3 = /([.?@])?(.*)/.exec(i3);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$2) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$2), i3 = t3.length - 1;
          if (i3 > 0) {
            r2.textContent = s$1 ? s$1.emptyScript : "";
            for (let s2 = 0; s2 < i3; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i3], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$1) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$2, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$2.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i2) {
    const s2 = l.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i2, s2 = t2, e2) {
  if (i2 === E) return i2;
  let h2 = void 0 !== e2 ? s2._$Co?.[e2] : s2._$Cl;
  const o2 = a(i2) ? void 0 : i2._$litDirective$;
  return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ??= [])[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i2 = M(t2, h2._$AS(t2, i2.values), h2, e2)), i2;
}
class R {
  constructor(t2, i2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = (t2?.creationScope ?? l).importNode(i2, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i3;
        2 === r2.type ? i3 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i3 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i3 = new Z(h2, this, t2)), this._$AV.push(i3), r2 = s2[++n3];
      }
      o2 !== r2?.index && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e2;
  }
  p(t2) {
    let i2 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i2), i2 += s2.strings.length - 2) : s2._$AI(t2[i2])), i2++;
  }
}
class k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t2, i2, s2, e2) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i2, this._$AM = s2, this.options = e2, this._$Cv = e2?.isConnected ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i2 = this._$AM;
    return void 0 !== i2 && 11 === t2?.nodeType && (t2 = i2.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i2 = this) {
    t2 = M(this, t2, i2), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    const { values: i2, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = S.createElement(V(s2.h, s2.h[0]), this.options)), s2);
    if (this._$AH?._$AD === e2) this._$AH.p(i2);
    else {
      const t3 = new R(e2, this), s3 = t3.u(this.options);
      t3.p(i2), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i2 = C.get(t2.strings);
    return void 0 === i2 && C.set(t2.strings, i2 = new S(t2)), i2;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i2 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i2.length ? i2.push(s2 = new k(this.O(c()), this.O(c()), this, this.options)) : s2 = i2[e2], s2._$AI(h2), e2++;
    e2 < i2.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i2.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, s2) {
    for (this._$AP?.(false, true, s2); t2 !== this._$AB; ) {
      const s3 = i$1(t2).nextSibling;
      i$1(t2).remove(), t2 = s3;
    }
  }
  setConnected(t2) {
    void 0 === this._$AM && (this._$Cv = t2, this._$AP?.(t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i2, s2, e2, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i2, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = A;
  }
  _$AI(t2, i2 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i2, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i2, n3), r2 === E && (r2 = this._$AH[n3]), o2 ||= !a(r2) || r2 !== this._$AH[n3], r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i2, s2, e2, h2) {
    super(t2, i2, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i2 = this) {
    if ((t2 = M(this, t2, i2, 0) ?? A) === E) return;
    const s2 = this._$AH, e2 = t2 === A && s2 !== A || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== A && (s2 === A || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i2, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i2, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t.litHtmlPolyfillSupport;
B?.(S, k), (t.litHtmlVersions ??= []).push("3.3.3");
const D = (t2, i2, s2) => {
  const e2 = s2?.renderBefore ?? i2;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = s2?.renderBefore ?? null;
    e2._$litPart$ = h2 = new k(i2.insertBefore(c(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t2 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t2.firstChild, t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
}
i._$litElement$ = true, i["finalized"] = true, s.litElementHydrateSupport?.({ LitElement: i });
const o$1 = s.litElementPolyfillSupport;
o$1?.({ LitElement: i });
(s.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i2 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i2);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i2, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
const DEFAULTS = {
  mode: "list",
  count: 3,
  refresh: 30,
  minRefresh: 20,
  show_header: true,
  flipClockSecs: 10,
  flipRelSecs: 5
};
const DEFAULT_TRAM_LINES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const BASE = "https://www.zditm.szczecin.pl/api/v1";
class StopNotFoundError extends Error {
  constructor(stop) {
    super(`Nie znaleziono przystanku ${stop}`);
    this.name = "StopNotFoundError";
  }
}
class RateLimitError extends Error {
  constructor(retryAfterMs) {
    super("Przekroczono limit zapytań — spróbuj za chwilę");
    this.retryAfterMs = retryAfterMs;
    this.name = "RateLimitError";
  }
}
class ZditmApi {
  constructor(opts = {}) {
    this.opts = opts;
    this.displayCache = /* @__PURE__ */ new Map();
    this.inflight = /* @__PURE__ */ new Map();
    this.backoffUntil = 0;
  }
  get fetchFn() {
    return this.opts.fetchFn ?? fetch.bind(globalThis);
  }
  get now() {
    return this.opts.now ?? Date.now;
  }
  get base() {
    return this.opts.baseUrl ?? BASE;
  }
  async fetchDisplay(stop, ttlMs = 15e3) {
    const t2 = this.now();
    const cached = this.displayCache.get(stop);
    if (cached && t2 - cached.ts < ttlMs) return cached.data;
    if (t2 < this.backoffUntil && cached) return cached.data;
    const existing = this.inflight.get(stop);
    if (existing) return existing;
    const p2 = this.doFetchDisplay(stop, cached?.data).finally(() => this.inflight.delete(stop));
    this.inflight.set(stop, p2);
    return p2;
  }
  async doFetchDisplay(stop, stale) {
    const res = await this.fetchFn(`${this.base}/displays/${stop}`);
    if (res.status === 404) throw new StopNotFoundError(stop);
    if (res.status === 429) {
      const retry = Number(res.headers.get("Retry-After") ?? "30");
      this.backoffUntil = this.now() + retry * 1e3;
      if (stale) return stale;
      throw new RateLimitError(retry * 1e3);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.clone().json();
    this.displayCache.set(stop, { data, ts: this.now() });
    return data;
  }
  async fetchStops() {
    if (this.stopsCache) return this.stopsCache;
    if (this.stopsInflight) return this.stopsInflight;
    this.stopsInflight = (async () => {
      const res = await this.fetchFn(`${this.base}/stops`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.clone().json();
      this.stopsCache = body.data;
      return body.data;
    })().finally(() => {
      this.stopsInflight = void 0;
    });
    return this.stopsInflight;
  }
  async fetchLines() {
    if (this.linesCache) return this.linesCache;
    if (this.linesInflight) return this.linesInflight;
    this.linesInflight = (async () => {
      const res = await this.fetchFn(`${this.base}/lines`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.clone().json();
      this.linesCache = body.data;
      return body.data;
    })().finally(() => {
      this.linesInflight = void 0;
    });
    return this.linesInflight;
  }
  async searchStops(query, limit = 25) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await this.fetchStops();
    return all.filter((s2) => s2.name.toLowerCase().includes(q)).slice(0, limit);
  }
}
const zditmApi = new ZditmApi();
function categorize(lineNumber, info, tramLines) {
  if (info) {
    if (info.vehicle_type === "tram") return "tram";
    if (info.type === "night") return "night";
    if (info.subtype === "fast") return "fast";
    if (info.subtype === "replacement") return "replacement";
    return "bus";
  }
  const s2 = String(lineNumber);
  if (tramLines.map(String).includes(s2)) return "tram";
  if (/^[A-Za-z]/.test(s2)) return "fast";
  if (/^5\d{2}$/.test(s2)) return "night";
  if (/^8\d{2}$/.test(s2)) return "replacement";
  return "bus";
}
function filterDepartures(departures, filter) {
  const lines = filter.lines?.map(String);
  const dirs = filter.directions?.map((d2) => d2.toLowerCase());
  return departures.filter((d2) => {
    if (lines && lines.length && !lines.includes(String(d2.line_number))) return false;
    if (dirs && dirs.length && !dirs.some((dir) => d2.direction.toLowerCase().includes(dir))) return false;
    return true;
  });
}
function selectDepartures(departures, mode, count) {
  const limit = mode === "compact" ? 3 : Math.max(1, count);
  return departures.slice(0, limit);
}
function isLive(dep) {
  return dep.time_real !== null;
}
function pad2(n3) {
  return n3 < 10 ? "0" + n3 : String(n3);
}
function departureClock(dep, now) {
  if (dep.time_real !== null) {
    const d2 = new Date(now.getTime() + dep.time_real * 6e4);
    return `${pad2(d2.getHours())}:${pad2(d2.getMinutes())}`;
  }
  if (dep.time_scheduled) return dep.time_scheduled;
  return "—";
}
function departureRelative(dep, now) {
  if (dep.time_real !== null) {
    return dep.time_real === 0 ? "teraz" : `za ${dep.time_real} min`;
  }
  if (dep.time_scheduled) {
    const m2 = /^(\d{1,2}):(\d{2})$/.exec(dep.time_scheduled.trim());
    if (!m2) return dep.time_scheduled;
    const target = new Date(now);
    target.setHours(Number(m2[1]), Number(m2[2]), 0, 0);
    if (target.getTime() < now.getTime() - 6e4) target.setDate(target.getDate() + 1);
    const diff = Math.round((target.getTime() - now.getTime()) / 6e4);
    return diff <= 0 ? "teraz" : `za ${diff} min`;
  }
  return "—";
}
var __defProp$1 = Object.defineProperty;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$1(target, key, result);
  return result;
};
const _ZditmDeparturesCard = class _ZditmDeparturesCard extends i {
  constructor() {
    super(...arguments);
    this.stale = false;
    this.phase = "clock";
  }
  static getConfigElement() {
    return document.createElement("zditm-departures-card-editor");
  }
  static getStubConfig() {
    return { stop: "", mode: "list", count: 3 };
  }
  setConfig(config) {
    if (!config.stop) throw new Error("Podaj numer przystanku (stop).");
    this.config = config;
    this.restart();
  }
  getCardSize() {
    return this.config?.mode === "compact" ? 2 : 1 + (this.config?.count ?? DEFAULTS.count);
  }
  connectedCallback() {
    super.connectedCallback();
    this.restart();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.stop();
  }
  restart() {
    this.stop();
    if (!this.config?.stop) return;
    void this.loadLines();
    const seconds = Math.max(DEFAULTS.minRefresh, this.config.refresh ?? DEFAULTS.refresh);
    void this.poll();
    this.timer = window.setInterval(() => void this.poll(), seconds * 1e3);
    this.startFlip();
  }
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = void 0;
    }
    this.stopFlip();
  }
  async loadLines() {
    if (this.lineIndex) return;
    try {
      const lines = await zditmApi.fetchLines();
      this.lineIndex = new Map(lines.map((l2) => [String(l2.number), l2]));
    } catch {
    }
  }
  startFlip() {
    this.stopFlip();
    this.phase = "clock";
    const tick = () => {
      const secs = this.phase === "clock" ? this.config.flip_clock_secs ?? DEFAULTS.flipClockSecs : this.config.flip_rel_secs ?? DEFAULTS.flipRelSecs;
      this.flipTimer = window.setTimeout(() => {
        this.phase = this.phase === "clock" ? "relative" : "clock";
        tick();
      }, Math.max(1, secs) * 1e3);
    };
    tick();
  }
  stopFlip() {
    if (this.flipTimer) {
      clearTimeout(this.flipTimer);
      this.flipTimer = void 0;
    }
  }
  async poll() {
    try {
      const ttl = Math.max(DEFAULTS.minRefresh, this.config.refresh ?? DEFAULTS.refresh) * 1e3;
      this.data = await zditmApi.fetchDisplay(this.config.stop, ttl);
      this.error = void 0;
      this.stale = false;
    } catch (e2) {
      if (this.data) {
        this.stale = true;
      } else {
        this.error = e2 instanceof Error ? e2.message : "Błąd pobierania danych";
      }
    }
  }
  timeText(d2, now) {
    return this.phase === "clock" ? departureClock(d2, now) : departureRelative(d2, now);
  }
  render() {
    if (this.error) return b`<ha-card><div class="msg error">${this.error}</div></ha-card>`;
    if (!this.data) return b`<ha-card><div class="msg">Ładowanie…</div></ha-card>`;
    const cfg = this.config;
    const tramLines = (cfg.tram_lines ?? DEFAULT_TRAM_LINES).map(String);
    const filtered = filterDepartures(this.data.departures, { lines: cfg.lines, directions: cfg.directions });
    const mode = cfg.mode ?? DEFAULTS.mode;
    const shown = selectDepartures(filtered, mode, cfg.count ?? DEFAULTS.count);
    const title = cfg.title ?? this.data.stop_name;
    const showHeader = cfg.show_header ?? DEFAULTS.show_header;
    const now = /* @__PURE__ */ new Date();
    return b`
      <ha-card>
        ${showHeader ? b`<div class="head">
          <span class="stop">${title}</span>
          ${this.stale ? b`<span class="stale" title="Dane nieaktualne">⚠ nieaktualne</span>` : A}
        </div>` : A}
        ${this.data.message ? b`<div class="banner">${this.data.message}</div>` : A}
        ${shown.length === 0 ? b`<div class="msg">${cfg.lines?.length ? "Brak odjazdów dla wybranych linii" : "Brak odjazdów"}</div>` : mode === "compact" ? this.renderCompact(shown, tramLines, now) : this.renderList(shown, tramLines, now)}
      </ha-card>`;
  }
  badge(line, tramLines) {
    const cat = categorize(line, this.lineIndex?.get(String(line)), tramLines);
    return b`<span class="badge ${cat}">${line}</span>`;
  }
  renderList(deps, tramLines, now) {
    return b`<div class="list">
      ${deps.map((d2) => {
      const live = isLive(d2);
      return b`<div class="row">
          ${this.badge(d2.line_number, tramLines)}
          <span class="dir">${d2.direction}</span>
          <span class="when ${live ? "live" : "sched"}">${live ? b`<span class="dot"></span>` : A}${this.timeText(d2, now)}</span>
        </div>`;
    })}
    </div>`;
  }
  renderCompact(deps, tramLines, now) {
    const [first, ...rest] = deps;
    const live = isLive(first);
    return b`<div class="compact">
      <div class="chead">${this.badge(first.line_number, tramLines)}<span class="dir">${first.direction}</span></div>
      <div class="big ${live ? "live" : "sched"}">${live ? b`<span class="dot"></span>` : A}${this.timeText(first, now)}</div>
      ${rest.length ? b`<div class="sub">potem: ${rest.map((d2) => b`<strong>${this.timeText(d2, now)}</strong>`)}</div>` : A}
    </div>`;
  }
};
_ZditmDeparturesCard.styles = i$3`
    ha-card { padding: 12px 16px; }
    .head { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .head .stop { font-weight:600; font-size:1.05rem; }
    .stale { margin-left:auto; font-size:.72rem; color: var(--warning-color, #e0a030); }
    .banner { font-size:.8rem; background: var(--secondary-background-color); border-radius:6px; padding:6px 8px; margin-bottom:8px; }
    .msg { padding:8px 0; color: var(--secondary-text-color); }
    .msg.error { color: var(--error-color, #db4437); }
    .row { display:flex; align-items:center; gap:12px; padding:7px 0; border-top:1px solid var(--divider-color); }
    .row:first-child { border-top:none; }
    .badge { min-width:34px; padding:2px 8px; border-radius:7px; color:#fff; font-weight:700; text-align:center; font-size:.9rem; }
    .badge.tram { background:#2e7d32; }
    .badge.bus { background:#1565c0; }
    .badge.fast { background:#c62828; }
    .badge.night { background:#37474f; }
    .badge.replacement { background:#f9a825; color:#1b1b1b; }
    .dir { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .when { font-weight:600; text-align:right; white-space:nowrap; }
    .when.live { color: var(--success-color, #43a047); }
    .when.sched { color: var(--secondary-text-color); }
    .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background: currentColor; margin-right:5px; animation:pulse 1.4s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    .compact .chead { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
    .compact .big { font-size:2.2rem; font-weight:700; line-height:1; }
    .compact .sub { margin-top:8px; font-size:.85rem; color: var(--secondary-text-color); display:flex; gap:14px; }
  `;
let ZditmDeparturesCard = _ZditmDeparturesCard;
__decorateClass$1([
  n2({ attribute: false })
], ZditmDeparturesCard.prototype, "hass");
__decorateClass$1([
  r()
], ZditmDeparturesCard.prototype, "config");
__decorateClass$1([
  r()
], ZditmDeparturesCard.prototype, "data");
__decorateClass$1([
  r()
], ZditmDeparturesCard.prototype, "error");
__decorateClass$1([
  r()
], ZditmDeparturesCard.prototype, "stale");
__decorateClass$1([
  r()
], ZditmDeparturesCard.prototype, "phase");
__decorateClass$1([
  r()
], ZditmDeparturesCard.prototype, "lineIndex");
var __defProp = Object.defineProperty;
var __decorateClass = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp(target, key, result);
  return result;
};
const _ZditmDeparturesCardEditor = class _ZditmDeparturesCardEditor extends i {
  constructor() {
    super(...arguments);
    this.query = "";
    this.results = [];
  }
  setConfig(config) {
    this.config = { ...config };
    if (config.stop) void this.loadPreview(config.stop);
  }
  emit(patch) {
    this.config = { ...this.config, ...patch };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
  async onSearch(e2) {
    this.query = e2.target.value;
    this.results = await zditmApi.searchStops(this.query);
  }
  async pickStop(stop) {
    this.emit({ stop: stop.number, title: void 0 });
    this.results = [];
    this.query = stop.name;
    await this.loadPreview(stop.number);
  }
  async loadPreview(stop) {
    try {
      this.preview = await zditmApi.fetchDisplay(stop);
    } catch {
      this.preview = void 0;
    }
  }
  linesValue() {
    return (this.config.lines ?? []).join(", ");
  }
  onLines(e2) {
    const raw = e2.target.value;
    const lines = raw.split(",").map((s2) => s2.trim()).filter(Boolean);
    this.emit({ lines: lines.length ? lines : void 0 });
  }
  onDirections(e2) {
    const raw = e2.target.value;
    const dirs = raw.split(",").map((s2) => s2.trim()).filter(Boolean);
    this.emit({ directions: dirs.length ? dirs : void 0 });
  }
  render() {
    if (!this.config) return b``;
    const directions = this.preview ? [...new Set(this.preview.departures.map((d2) => `${d2.line_number} → ${d2.direction}`))].slice(0, 5) : [];
    return b`
      <div class="form">
        <label>Przystanek *</label>
        <input class="ctrl" .value=${this.query} placeholder="Szukaj po nazwie…"
               @input=${(e2) => void this.onSearch(e2)} />
        ${this.results.length ? b`<div class="results">
          ${this.results.map((s2) => b`
            <div class="res" @click=${() => void this.pickStop(s2)}>
              <span class="nr">${s2.number}</span>${s2.name}
            </div>`)}
        </div>` : A}

        ${this.config.stop ? b`<div class="preview">
          <div class="ptitle">Słupek ${this.config.stop} obsługuje:</div>
          ${directions.length ? directions.map((d2) => b`<div class="pl">${d2}</div>`) : b`<div class="pl muted">brak danych podglądu</div>`}
        </div>` : A}

        <label>Linie (po przecinku; puste = wszystkie)</label>
        <input class="ctrl" .value=${this.linesValue()} placeholder="np. 75, 521"
               @change=${(e2) => this.onLines(e2)} />

        <label>Kierunek (opcjonalnie; fragment nazwy)</label>
        <input class="ctrl" .value=${(this.config.directions ?? []).join(", ")} placeholder="np. Zawadzkiego"
               @change=${(e2) => this.onDirections(e2)} />

        <label>Tryb</label>
        <select class="ctrl" @change=${(e2) => this.emit({ mode: e2.target.value })}>
          <option value="list" ?selected=${(this.config.mode ?? "list") === "list"}>Lista odjazdów</option>
          <option value="compact" ?selected=${this.config.mode === "compact"}>Najbliższy duży + kolejne</option>
        </select>

        <label>Liczba odjazdów (tryb lista)</label>
        <input class="ctrl" type="number" min="1" .value=${String(this.config.count ?? 3)}
               @change=${(e2) => {
      const n3 = Number(e2.target.value);
      this.emit({ count: Number.isFinite(n3) && n3 > 0 ? n3 : void 0 });
    }} />
      </div>`;
  }
};
_ZditmDeparturesCardEditor.styles = i$3`
    .form { display:flex; flex-direction:column; gap:4px; }
    label { font-size:.78rem; color: var(--secondary-text-color); margin-top:8px; }
    .ctrl { padding:8px 10px; border-radius:6px; border:1px solid var(--divider-color);
            background: var(--card-background-color); color: var(--primary-text-color); }
    .results { border:1px solid var(--divider-color); border-radius:6px; max-height:180px; overflow:auto; }
    .res { padding:7px 10px; cursor:pointer; }
    .res:hover { background: var(--secondary-background-color); }
    .nr { display:inline-block; background: var(--secondary-background-color); border-radius:4px;
          padding:1px 6px; margin-right:6px; font-size:.75rem; }
    .preview { margin-top:8px; padding:8px 10px; border-radius:6px; background: var(--secondary-background-color); }
    .ptitle { font-size:.72rem; text-transform:uppercase; color: var(--secondary-text-color); margin-bottom:4px; }
    .pl { font-size:.85rem; padding:2px 0; }
    .pl.muted { color: var(--secondary-text-color); }
  `;
let ZditmDeparturesCardEditor = _ZditmDeparturesCardEditor;
__decorateClass([
  r()
], ZditmDeparturesCardEditor.prototype, "config");
__decorateClass([
  r()
], ZditmDeparturesCardEditor.prototype, "query");
__decorateClass([
  r()
], ZditmDeparturesCardEditor.prototype, "results");
__decorateClass([
  r()
], ZditmDeparturesCardEditor.prototype, "preview");
customElements.define("zditm-departures-card", ZditmDeparturesCard);
customElements.define("zditm-departures-card-editor", ZditmDeparturesCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "zditm-departures-card",
  name: "ZDiTM Departures",
  description: "Tablica odjazdów ZDiTM Szczecin dla wybranego przystanku.",
  preview: true,
  documentationURL: "https://github.com/GreatAnubis/zditm-departures-card"
});
console.info("%c ZDITM-DEPARTURES-CARD %c 0.1.3 ", "background:#1565c0;color:#fff", "background:#333;color:#fff");
