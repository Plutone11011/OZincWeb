(this.webpackJsonpozinc=this.webpackJsonpozinc||[]).push([[0],{145:function(t,e,a){},150:function(t,e,a){"use strict";a.r(e);var n=a(32),o=a(33),s=a(37),c=a(34),i=a(16),l=a(38),r=a(0),m=a.n(r),u=a(31),d=a.n(u);a(85),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));a(86);var h=a(17),p=a(58),f=a(24),g=a(30),E=a(20),b=a(27),v=a(29),y=a(77),C=a(28),O=(a(87),a(71)),k=function(t){function e(){return Object(n.a)(this,e),Object(s.a)(this,Object(c.a)(e).apply(this,arguments))}return Object(l.a)(e,t),Object(o.a)(e,[{key:"render",value:function(){var t=this;if(this.props.results){var e=Object.keys(this.props.results["Oils Composition:"]),a=e.map((function(e){return t.props.results["Oils Composition:"][e]})),n=this.props.results["Target name:"],o=this.props.results["Distance from target:"],s=this.props.results["Total price:"],c=Object.keys(this.props.results["Target difference:"]),i=c.map((function(e){return t.props.results["Target difference:"][e]})),l=JSON.parse(this.props.results["VOC Concentrations:"]);return m.a.createElement("div",{className:"App"},m.a.createElement("p",{style:{marginBottom:"0px"}},"Costo totale: ".concat(s)),m.a.createElement("p",{style:{marginBottom:"0px"}},"Distanza dal target: ".concat(o)),m.a.createElement("small",null,"(Somma di tutte le differenze tra i componenti del target e la composizione percentuale di oli)"),m.a.createElement(O.a,{responsive:"sm",bordered:"true"},m.a.createElement("thead",null,m.a.createElement("tr",null,m.a.createElement("th",null,"\\"),e.map((function(t){return m.a.createElement("th",{key:t},t)})),m.a.createElement("th",{className:"target-name"},n))),m.a.createElement("tbody",null,m.a.createElement("tr",null,m.a.createElement("td",null,"%"),a.map((function(t,a){return m.a.createElement("td",{key:"".concat(e[a],"%")},t)})),m.a.createElement("td",{className:"target-name"},"100%")),c.map((function(t,a){return m.a.createElement("tr",{key:"".concat(t).concat(a)}," ",m.a.createElement("td",{key:t},t),Array.from(l,(function(t){return t[a]})).map((function(t,a){return m.a.createElement("td",{key:"".concat(e[a]," x ").concat(t)},t)})),m.a.createElement("td",{className:"target-name",key:"".concat(n," x ").concat(t)},i[a]))})))))}return m.a.createElement("div",{className:"App"})}}]),e}(m.a.Component),j=a(11),x=a(79),N=a(73),w=a.n(N),D=(a(135),a(74)),F=a.n(D),_=a(42),T=a.n(_),B=a(14),S=a(26),L=(a(145),function(t){function e(t){var a;Object(n.a)(this,e),(a=Object(s.a)(this,Object(c.a)(e).call(this,t))).state={data:null};var o;return a.rows=null,a.concentrations=null,a.columns=null,a.columnsDataField=(o=11,Object(x.a)(Array(o).keys())).map((function(t){return"oil".concat(t)})),a.columnsDataField.push("soglie"),a.columnsDataField.push("sensibilt\xe0"),a.cost_factor=0,a.distance_factor=0,a.max_cost=0,a.max_distance=0,a.onTableChange=a.onTableChange.bind(Object(i.a)(a)),a.onButtonClick=a.onButtonClick.bind(Object(i.a)(a)),a.onNumChange=a.onNumChange.bind(Object(i.a)(a)),a}return Object(l.a)(e,t),Object(o.a)(e,[{key:"componentDidMount",value:function(){var t=this;fetch("/data/concentrations").then((function(t){return t.json()})).then((function(e){console.log(e),t.rows=e.voc,t.rows.unshift("Costi"),t.concentrations=e.concentrations,t.concentrations.unshift(e.costs),t.concentrations.forEach((function(t,a){a>0?(t.push(e.thresholds[a-1]),t.push(e.sensitivity[a-1])):(t.push("/"),t.push("/"))})),t.columns=e.oils,t.columns.push("Soglie"),t.columns.push("Sensibilit\xe0"),t.cost_factor=e.cost_factor,t.distance_factor=e.distance_factor,t.max_cost=e.max_cost,t.max_distance=e.max_distance,t.setState({data:e})}))}},{key:"onTableChange",value:function(t,e){if("cellEdit"===t){var a=this.rows.indexOf(e.cellEdit.rowId),n=this.columnsDataField.indexOf(e.cellEdit.dataField);this.concentrations[a][n]=parseFloat(e.cellEdit.newValue),this.setState({data:{voc:this.rows,oils:this.columns,concentrations:this.concentrations}})}}},{key:"onNumChange",value:function(t,e,a){console.log(t,e,a),"distance"===a.id?this.distance_factor=t:"cost"===a.id?this.cost_factor=t:"max_cost"===a.id?this.max_cost=t:this.max_distance=t}},{key:"onButtonClick",value:function(){console.log(this.concentrations),fetch("/data/changeData",{method:"PUT",headers:{"Content-type":"application/json; charset=UTF-8"},body:JSON.stringify({newCnc:this.concentrations,newFactors:{cost:this.cost_factor,distance:this.distance_factor},maxCost:this.max_cost,maxDist:this.max_distance})}).then((function(t){return t.json()})).then((function(t){}))}},{key:"render",value:function(){var t=this;if(this.state.data){var e=this.state.data.oils.map((function(e,a){return{dataField:t.columnsDataField[a],text:e,validator:function(t,e,a){var n=/^((0(\.\d+)?)|([1-9]\d*(\.\d+)?))$/g.test(t);return n||{valid:!1,message:"Not a decimal number"}}}}));e.unshift({dataField:"voc",text:"/",editable:!1});var a=[];return this.state.data.concentrations.forEach((function(e,n){var o;a.push((o={voc:t.state.data.voc[n]},Object(j.a)(o,t.columnsDataField[0],e[0]),Object(j.a)(o,t.columnsDataField[1],e[1]),Object(j.a)(o,t.columnsDataField[2],e[2]),Object(j.a)(o,t.columnsDataField[3],e[3]),Object(j.a)(o,t.columnsDataField[4],e[4]),Object(j.a)(o,t.columnsDataField[5],e[5]),Object(j.a)(o,t.columnsDataField[6],e[6]),Object(j.a)(o,t.columnsDataField[7],e[7]),Object(j.a)(o,t.columnsDataField[8],e[8]),Object(j.a)(o,t.columnsDataField[9],e[9]),Object(j.a)(o,t.columnsDataField[10],e[10]),Object(j.a)(o,t.columnsDataField[11],e[11]),Object(j.a)(o,t.columnsDataField[12],e[12]),o))})),m.a.createElement("div",null,m.a.createElement(B.a,null,m.a.createElement(f.a,{variant:"primary",onClick:this.onButtonClick,style:{margin:"20px"}},"Save"),m.a.createElement(B.a.Row,null,m.a.createElement(B.a.Group,{as:S.a},m.a.createElement(B.a.Label,{className:"form"},"Importanza fattore distanza"),m.a.createElement(T.a,{className:"form",id:"distance",min:0,max:100,value:this.distance_factor,step:.1,precision:1,onChange:this.onNumChange})),m.a.createElement(B.a.Group,{as:S.a},m.a.createElement(B.a.Label,{className:"form"},"Importanza fattore costo"),m.a.createElement(T.a,{className:"form",id:"cost",min:0,max:100,value:this.cost_factor,step:.1,precision:1,onChange:this.onNumChange}))),m.a.createElement(B.a.Row,null,m.a.createElement(B.a.Group,{as:S.a},m.a.createElement(B.a.Label,{className:"form"},"Costo massimo ammissibile"),m.a.createElement(T.a,{className:"form",id:"max_cost",min:0,value:this.max_cost,step:.1,precision:1,onChange:this.onNumChange})),m.a.createElement(B.a.Group,{as:S.a},m.a.createElement(B.a.Label,{className:"form"},"Distanza massima"),m.a.createElement(T.a,{className:"form",id:"max_dist",min:0,value:this.max_distance,step:.1,precision:1,onChange:this.onNumChange})))),m.a.createElement(w.a,{bootstrap4:!0,data:a,keyField:"voc",columns:e,rowStyle:function(t,e){if(0==e)return{backgroundColor:"#DBF3FA"}},remote:{filter:!1,pagination:!1,sort:!1,cellEdit:!0},onTableChange:this.onTableChange,cellEdit:F()({mode:"click"})}))}return m.a.createElement("div",null)}}]),e}(m.a.Component)),z=function(t){function e(t){var a;return Object(n.a)(this,e),(a=Object(s.a)(this,Object(c.a)(e).call(this,t))).state={target:null,result:null,isLoading:!1,noResult:!1},a.onOilsListClick=a.onOilsListClick.bind(Object(i.a)(a)),a.onButtonClick=a.onButtonClick.bind(Object(i.a)(a)),a}return Object(l.a)(e,t),Object(o.a)(e,[{key:"componentDidMount",value:function(){var t=this;fetch("/getMinizincResults").then((function(t){if(!t.ok)throw new Error("HTTP error, status = "+t.status);return t.json()})).then((function(e){"No results"===e?(console.log(t),t.setState({noResult:!0})):t.setState({target:e["Target name:"],result:e,noResult:!1})})).catch((function(t){console.log(t)}))}},{key:"onOilsListClick",value:function(t){console.log(t.target.text),fetch("/changeTarget",{method:"PUT",headers:{"Content-type":"application/json; charset=UTF-8"},body:JSON.stringify({previousTarget:this.state.target,nextTarget:t.target.text})}).then((function(t){return t.json()})).then((function(t){console.log(t)}))}},{key:"onButtonClick",value:function(){var t=this;this.setState({isLoading:!0}),fetch("/getMinizincResults").then((function(t){if(!t.ok)throw new Error("HTTP error, status = "+t.status);return t.json()})).then((function(e){"No results"===e?t.setState({noResult:!0}):t.setState({target:e["Target name:"],result:e,isLoading:!1,noResult:!1})})).catch((function(t){console.log(t)}))}},{key:"render",value:function(){var t=this;return this.state.result||this.state.noResult?this.state.noResult?(console.log("Noresult"),m.a.createElement(g.a,null,m.a.createElement(h.a,{className:"bg-olive",expand:"lg",sticky:"top"},m.a.createElement(h.a.Brand,{href:""},"OZinc"),m.a.createElement(h.a.Toggle,{"aria-controls":"basic-navbar-nav"}),m.a.createElement(h.a.Collapse,{id:"basic-navbar-nav"},m.a.createElement(p.a,{className:"mr-auto"},m.a.createElement(b.a,{href:"/"},m.a.createElement(v.a,{as:g.b,to:"/"},"Home")),m.a.createElement(b.a,{href:"/data"},m.a.createElement(v.a,{as:g.b,to:"/data"},"Dati"))))),m.a.createElement(E.c,null,m.a.createElement(E.a,{path:"/data"},m.a.createElement(L,null)),m.a.createElement(E.a,{path:"/"},m.a.createElement("div",{style:{display:"flex",width:"30%",height:"50px",alignItems:"center",justifyContent:"flex-start"}},m.a.createElement(f.a,{variant:"primary",disabled:this.isLoading,onClick:this.onButtonClick,style:{margin:"20px"}},"Calcola")),m.a.createElement("p",{style:{textAlign:"center",fontSize:"2.5em"}},"Nessun risultato con questi dati!"))))):(console.log("Result"),m.a.createElement(g.a,null,m.a.createElement(h.a,{className:"bg-olive",expand:"lg",sticky:"top"},m.a.createElement(h.a.Brand,{href:""},"OZinc"),m.a.createElement(h.a.Toggle,{"aria-controls":"basic-navbar-nav"}),m.a.createElement(h.a.Collapse,{id:"basic-navbar-nav"},m.a.createElement(p.a,{className:"mr-auto"},m.a.createElement(b.a,{href:"/"},m.a.createElement(v.a,{as:g.b,to:"/"},"Home")),m.a.createElement(b.a,{href:"/data"},m.a.createElement(v.a,{as:g.b,to:"/data"},"Dati"))))),m.a.createElement(E.c,null,m.a.createElement(E.a,{path:"/data"},m.a.createElement(L,null)),m.a.createElement(E.a,{path:"/"},m.a.createElement("div",{style:{display:"flex",width:"30%",height:"50px",alignItems:"center",justifyContent:"flex-start"}},m.a.createElement(y.a,{title:"Target",id:"dropdown-variants-primary",variant:"primary",style:{margin:"20px"}},Object.keys(this.state.result["Oils Composition:"]).map((function(e,a){return m.a.createElement(C.a.Item,{eventKey:"navdropdown"+e,onClick:t.onOilsListClick},e)})),m.a.createElement(C.a.Item,{eventKey:"navdropdown_target",style:{color:"#708238"},onClick:this.onOilsListClick},this.state.result["Target name:"])),m.a.createElement(f.a,{variant:"primary",disabled:this.isLoading,onClick:this.onButtonClick,style:{margin:"20px"}},"Calcola")),m.a.createElement(k,{results:this.state.result}))))):m.a.createElement("div",{className:"App"})}}]),e}(m.a.Component);d.a.render(m.a.createElement(z,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()}))},80:function(t,e,a){t.exports=a(150)},85:function(t,e,a){},87:function(t,e,a){}},[[80,1,2]]]);
//# sourceMappingURL=main.413bbe6f.chunk.js.map