(this.webpackJsonpozinc=this.webpackJsonpozinc||[]).push([[0],{107:function(e,t,a){"use strict";a.r(t);var n=a(34),r=a(21),c=a(47),i=a(48),o=a(19),s=a(56),l=a(0),u=a.n(l),m=a(9),p=a.n(m);a(96),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(97);var h=a(44),d=a(80),f=a(54),b=a(59),E=a(27),g=a(41),O=a(42),v=a(78),j=a(33),y=(a(98),a(71)),k=function(e){function t(){return Object(n.a)(this,t),Object(c.a)(this,Object(i.a)(t).apply(this,arguments))}return Object(s.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;if(this.props.results){var t=Object.keys(this.props.results["Oils Composition:"]),a=t.map((function(t){return e.props.results["Oils Composition:"][t]})),n=this.props.results["Target name:"],r=this.props.results["Distance from target:"],c=Object.keys(this.props.results["Target components:"]),i=c.map((function(t){return e.props.results["Target components:"][t]})),o=JSON.parse(this.props.results["VOC Concentrations:"]);return u.a.createElement("div",{className:"App"},u.a.createElement("p",null,"Distanza dal target: ".concat(r)),u.a.createElement(y.a,{responsive:"sm",bordered:"true"},u.a.createElement("thead",null,u.a.createElement("tr",null,u.a.createElement("th",null,"\\"),t.map((function(e){return u.a.createElement("th",{key:e},e)})),u.a.createElement("th",{className:"target-name"},n))),u.a.createElement("tbody",null,u.a.createElement("tr",null,u.a.createElement("td",null,"%"),a.map((function(e,a){return u.a.createElement("td",{key:"".concat(t[a],"%")},e)})),u.a.createElement("td",{className:"target-name"},"100%")),c.map((function(e,a){return u.a.createElement("tr",{key:"".concat(e).concat(a)}," ",u.a.createElement("td",{key:e},e),Array.from(o,(function(e){return e[a]})).map((function(e,a){return u.a.createElement("td",{key:"".concat(t[a]," x ").concat(e)},e)})),u.a.createElement("td",{className:"target-name",key:"".concat(n," x ").concat(e)},i[a]))})))))}return u.a.createElement("div",{className:"App"})}}]),t}(u.a.Component),C=a(12),w=a(61),T=a(60);var x=function(){var e=Object(l.useState)(null),t=Object(w.a)(e,2),a=t[0],n=t[1],r=Object(l.useState)(null),c=Object(w.a)(r,2),i=c[0],o=c[1],s=Object(l.useState)(null),m=Object(w.a)(s,2),p=m[0],h=m[1];return Object(l.useEffect)((function(){return fetch("/data/concentrations").then((function(e){return e.json()})).then((function(e){var t,a,r;(t=e.oils.map((function(e,t){return{name:e,title:e}}))).unshift({name:"concentrazioni",title:"Concentrazioni"}),n(t),r=t.map((function(e){return{columnName:e.name,wordWrapEnabled:!0}})),h(r),a=[],e.concentrations.forEach((function(t,n){var r;a.push((r={concentrazioni:e.voc[n]},Object(C.a)(r,e.oils[0],t[0]),Object(C.a)(r,e.oils[1],t[1]),Object(C.a)(r,e.oils[2],t[2]),Object(C.a)(r,e.oils[3],t[3]),Object(C.a)(r,e.oils[4],t[4]),Object(C.a)(r,e.oils[5],t[5]),Object(C.a)(r,e.oils[6],t[6]),Object(C.a)(r,e.oils[7],t[7]),Object(C.a)(r,e.oils[8],t[8]),Object(C.a)(r,e.oils[9],t[9]),Object(C.a)(r,e.oils[10],t[10]),r))})),o(a)}))}),[]),i&&a?u.a.createElement(T.a,{rows:i,columns:a},u.a.createElement(T.b,{columnExtensions:p}),u.a.createElement(T.c,null)):u.a.createElement("div",null)},L=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(c.a)(this,Object(i.a)(t).call(this,e))).state={target:null,result:null,isLoading:!1,hidden:!1},a.onOilsListClick=a.onOilsListClick.bind(Object(o.a)(a)),a.onButtonClick=a.onButtonClick.bind(Object(o.a)(a)),a}return Object(s.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){var e=this;fetch("/getMinizincResults").then((function(e){return e.json()})).then((function(t){e.setState({target:t["Target name:"],result:t})}),(function(e){console.log(e)}))}},{key:"onOilsListClick",value:function(e){var t=this;fetch("/changeTarget",{method:"PUT",headers:{"Content-type":"application/json; charset=UTF-8"},body:JSON.stringify({previousTarget:this.state.target,nextTarget:e.target.text})}).then((function(e){return e.json()})).then((function(e){t.setState({target:e["Target name:"],result:e})}))}},{key:"onButtonClick",value:function(){var e=this;this.setState({isLoading:!0}),fetch("/getMinizincResults").then((function(e){return e.json()})).then((function(t){e.setState({target:t["Target name:"],result:t,isLoading:!1})}),(function(e){console.log(e)}))}},{key:"render",value:function(){var e=this;if(this.state.result){return u.a.createElement(b.a,null,u.a.createElement(h.a,{className:"bg-olive",expand:"lg",sticky:"top"},u.a.createElement(h.a.Brand,{href:""},"OZinc"),u.a.createElement(h.a.Toggle,{"aria-controls":"basic-navbar-nav"}),u.a.createElement(h.a.Collapse,{id:"basic-navbar-nav"},u.a.createElement(d.a,{className:"mr-auto"},u.a.createElement(g.a,{href:"/"},u.a.createElement(O.a,{as:b.b,to:"/"},"Home")),u.a.createElement(g.a,{href:"/data"},u.a.createElement(O.a,{as:b.b,to:"/data"},"Concentrazioni"))))),u.a.createElement(E.c,null,u.a.createElement(E.a,{path:"/data"},u.a.createElement(x,null)),u.a.createElement(E.a,{path:"/"},u.a.createElement("div",{style:{display:"flex",width:"30%",height:"50px",alignItems:"center",justifyContent:"flex-start"}},u.a.createElement(v.a,{title:"Target",id:"dropdown-variants-primary",variant:"primary",style:{margin:"20px"}},Object.keys(this.state.result["Oils Composition:"]).map((function(t,a){return u.a.createElement(j.a.Item,{eventKey:"navdropdown"+t,onClick:e.onOilsListClick},t)})),u.a.createElement(j.a.Item,{eventKey:"navdropdown_target",style:{color:"#708238"},onClick:this.onOilsListClick},this.state.result["Target name:"])),u.a.createElement(f.a,{variant:"primary",disabled:this.isLoading,onClick:this.onButtonClick,style:{margin:"20px"}},this.isLoading?"Loading\u2026":"Calcola")),u.a.createElement(k,{results:this.state.result}))))}return u.a.createElement("div",{className:"App"})}}]),t}(u.a.Component);p.a.render(u.a.createElement(L,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},91:function(e,t,a){e.exports=a(107)},96:function(e,t,a){},98:function(e,t,a){}},[[91,1,2]]]);
//# sourceMappingURL=main.d8aa5254.chunk.js.map