(this.webpackJsonpozinc=this.webpackJsonpozinc||[]).push([[0],{37:function(e,t,a){e.exports=a(51)},42:function(e,t,a){},43:function(e,t,a){},51:function(e,t,a){"use strict";a.r(t);var n=a(19),r=a(20),s=a(29),c=a(22),o=a(21),i=a(27),l=a(0),u=a.n(l),m=a(23),p=a.n(m),h=(a(42),a(43),a(32)),d=function(e){function t(){return Object(n.a)(this,t),Object(s.a)(this,Object(c.a)(t).apply(this,arguments))}return Object(i.a)(t,e),Object(r.a)(t,[{key:"render",value:function(){var e=this;if(this.props.results){var t=Object.keys(this.props.results["Oils Composition:"]),a=t.map((function(t){return e.props.results["Oils Composition:"][t]})),n=this.props.results["Target name:"],r=this.props.results["Distance from target:"],s=Object.keys(this.props.results["Target components:"]),c=s.map((function(t){return e.props.results["Target components:"][t]})),o=JSON.parse(this.props.results["VOC Concentrations:"]);return u.a.createElement("div",{className:"App"},u.a.createElement("p",null,"Distanza dal target: ".concat(r)),u.a.createElement(h.a,{responsive:"sm",bordered:"true"},u.a.createElement("thead",null,u.a.createElement("tr",null,u.a.createElement("th",null,"\\"),t.map((function(e){return u.a.createElement("th",{key:e},e)})),u.a.createElement("th",{className:"target-name"},n))),u.a.createElement("tbody",null,u.a.createElement("tr",null,u.a.createElement("td",null,"%"),a.map((function(e,a){return u.a.createElement("td",{key:"".concat(t[a],"%")},e)})),u.a.createElement("td",{className:"target-name"},"100%")),s.map((function(e,a){return u.a.createElement("tr",{key:"".concat(e).concat(a)}," ",u.a.createElement("td",{key:e},e),Array.from(o,(function(e){return e[a]})).map((function(e,a){return u.a.createElement("td",{key:"".concat(t[a]," x ").concat(e)},e)})),u.a.createElement("td",{className:"target-name",key:"".concat(n," x ").concat(e)},c[a]))})))))}return u.a.createElement("div",{className:"App"})}}]),t}(u.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(44);var f=a(18),g=a(36),E=a(30),v=function(e){function t(e){var a;return Object(n.a)(this,t),(a=Object(s.a)(this,Object(c.a)(t).call(this,e))).state={target:null,result:null},a.onOilsListClick=a.onOilsListClick.bind(Object(o.a)(a)),a}return Object(i.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){var e=this;fetch("/getMinizincResults").then((function(e){return e.json()})).then((function(t){e.setState({target:t["Target name:"],result:t})}),(function(e){console.log(e)}))}},{key:"onOilsListClick",value:function(e){var t=this;fetch("/changeTarget",{method:"PUT",headers:{"Content-type":"application/json; charset=UTF-8"},body:JSON.stringify({previousTarget:this.state.target,nextTarget:e.target.text})}).then((function(e){return e.json()})).then((function(e){t.setState({target:e["Target name:"],result:e})}))}},{key:"render",value:function(){var e=this;return this.state.result?u.a.createElement("div",null,u.a.createElement(f.a,{className:"bg-olive",expand:"lg",sticky:"top"},u.a.createElement(f.a.Brand,{href:""},"OZinc"),u.a.createElement(f.a.Toggle,{"aria-controls":"basic-navbar-nav"}),u.a.createElement(f.a.Collapse,{id:"basic-navbar-nav"},u.a.createElement(g.a,{className:"mr-auto"},u.a.createElement(E.a,{title:"Target",id:"basic-nav-dropdown"},Object.keys(this.state.result["Oils Composition:"]).map((function(t,a){return u.a.createElement(E.a.Item,{key:"navdropdown"+t,onClick:e.onOilsListClick},t)})),u.a.createElement(E.a.Item,{key:"navdropdown_target",style:{color:"#708238"},onClick:this.onOilsListClick},this.state.result["Target name:"]))))),u.a.createElement(d,{results:this.state.result})):u.a.createElement("div",{className:"App"})}}]),t}(u.a.Component);p.a.render(u.a.createElement(v,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[37,1,2]]]);
//# sourceMappingURL=main.e1be9d15.chunk.js.map