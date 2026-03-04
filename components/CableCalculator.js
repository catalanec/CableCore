import { useState } from "react";

export default function CableCalculator({ onSave }) {

const [points,setPoints]=useState(1);
const [cable,setCable]=useState(95);
const [installation,setInstallation]=useState("superficial");

const [canaleta,setCanaleta]=useState(0);
const [regata,setRegata]=useState(0);
const [corrugado,setCorrugado]=useState(0);

const [rack,setRack]=useState(0);

const [switchEquip,setSwitch]=useState(false);
const [routerEquip,setRouter]=useState(false);
const [configEquip,setConfig]=useState(false);

const [urgency,setUrgency]=useState(1);

function calculate(){

let subtotalPoints=points*cable;
let installCost=0;

if(installation==="superficial"){
installCost+=canaleta*8;
}

if(installation==="techo"){
installCost+=points*12;
}

if(installation==="empotrado_existente"){
installCost+=points*20;
}

if(installation==="empotrado_nuevo"){
installCost+=regata*22;
installCost+=corrugado*4.5;
}

if(installation==="industrial"){
subtotalPoints*=1.2;
}

let equip=0;
if(switchEquip) equip+=60;
if(routerEquip) equip+=60;
if(configEquip) equip+=120;

let subtotal=(subtotalPoints+installCost+rack+equip)*urgency;
let iva=subtotal*0.21;
let total=subtotal+iva;

return {
subtotal:subtotal.toFixed(2),
iva:iva.toFixed(2),
total:total.toFixed(2)
};

}

const result=calculate();

return(

<div style={{
background:"#111827",
padding:"40px",
borderRadius:"12px",
marginTop:"40px"
}}>

<h2 style={{marginBottom:"20px"}}>Calculadora profesional</h2>

<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={e=>setPoints(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
/>

<label>Tipo de cable</label>
<select
onChange={e=>setCable(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
>
<option value="95">Cat6 – 95€</option>
<option value="110">Cat6A – 110€</option>
</select>

<label>Tipo instalación</label>
<select
onChange={e=>setInstallation(e.target.value)}
style={{display:"block",marginBottom:"20px"}}
>

<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado_existente">Empotrado existente</option>
<option value="empotrado_nuevo">Empotrado nuevo</option>
<option value="industrial">Industrial</option>

</select>

{installation==="superficial" && (
<>
<label>Metros canaleta</label>
<input
type="number"
value={canaleta}
onChange={e=>setCanaleta(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
/>
</>
)}

{installation==="empotrado_nuevo" && (
<>
<label>Metros regata</label>
<input
type="number"
value={regata}
onChange={e=>setRegata(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
/>

<label>Metros corrugado</label>
<input
type="number"
value={corrugado}
onChange={e=>setCorrugado(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
/>
</>
)}

<label>Rack</label>
<select
onChange={e=>setRack(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
>
<option value="0">No incluido</option>
<option value="150">Rack 6U – 150€</option>
<option value="220">Rack 9U – 220€</option>
</select>

<h4>Equipos</h4>

<label>
<input type="checkbox" onChange={e=>setSwitch(e.target.checked)}/>
Switch
</label>

<br/>

<label>
<input type="checkbox" onChange={e=>setRouter(e.target.checked)}/>
Router
</label>

<br/>

<label>
<input type="checkbox" onChange={e=>setConfig(e.target.checked)}/>
Configuración red
</label>

<br/><br/>

<label>Urgencia</label>
<select
onChange={e=>setUrgency(Number(e.target.value))}
style={{display:"block",marginBottom:"20px"}}
>
<option value="1">Normal</option>
<option value="1.2">Urgente</option>
<option value="1.4">Muy urgente</option>
</select>

<hr/>

<p>Subtotal: {result.subtotal}€</p>
<p>IVA: {result.iva}€</p>
<h3>Total: {result.total}€</h3>

<button
onClick={()=>onSave(result)}
style={{
marginTop:"20px",
padding:"10px 20px",
background:"#facc15",
border:"none",
borderRadius:"6px"
}}
>
Guardar presupuesto
</button>

</div>

)

}
