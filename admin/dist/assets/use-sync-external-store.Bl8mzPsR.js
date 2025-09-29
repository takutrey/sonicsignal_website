import{b as z}from"./react.Vd7RI-l6.js";var x={exports:{}},R={};/**
 * @license React
 * use-sync-external-store-with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var q;function I(){if(q)return R;q=1;var n=z();function d(o,a){return o===a&&(o!==0||1/o===1/a)||o!==o&&a!==a}var m=typeof Object.is=="function"?Object.is:d,h=n.useSyncExternalStore,E=n.useRef,p=n.useEffect,y=n.useMemo,b=n.useDebugValue;return R.useSyncExternalStoreWithSelector=function(o,a,l,e,r){var t=E(null);if(t.current===null){var i={hasValue:!1,value:null};t.current=i}else i=t.current;t=y(function(){function f(c){if(!_){if(_=!0,v=c,c=e(c),r!==void 0&&i.hasValue){var s=i.value;if(r(s,c))return S=s}return S=c}if(s=S,m(v,c))return s;var W=e(c);return r!==void 0&&r(s,W)?(v=c,s):(v=c,S=W)}var _=!1,v,S,j=l===void 0?null:l;return[function(){return f(a())},j===null?void 0:function(){return f(j())}]},[a,l,e,r]);var u=h(o,t[0],t[1]);return p(function(){i.hasValue=!0,i.value=u},[u]),b(u),u},R}var U;function M(){return U||(U=1,x.exports=I()),x.exports}var $=M(),w={exports:{}},V={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var D;function g(){if(D)return V;D=1;var n=z();function d(e,r){return e===r&&(e!==0||1/e===1/r)||e!==e&&r!==r}var m=typeof Object.is=="function"?Object.is:d,h=n.useState,E=n.useEffect,p=n.useLayoutEffect,y=n.useDebugValue;function b(e,r){var t=r(),i=h({inst:{value:t,getSnapshot:r}}),u=i[0].inst,f=i[1];return p(function(){u.value=t,u.getSnapshot=r,o(u)&&f({inst:u})},[e,t,r]),E(function(){return o(u)&&f({inst:u}),e(function(){o(u)&&f({inst:u})})},[e]),y(t),t}function o(e){var r=e.getSnapshot;e=e.value;try{var t=r();return!m(e,t)}catch{return!0}}function a(e,r){return r()}var l=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?a:b;return V.useSyncExternalStore=n.useSyncExternalStore!==void 0?n.useSyncExternalStore:l,V}var O;function G(){return O||(O=1,w.exports=g()),w.exports}var k=G();export{k as s,$ as w};
