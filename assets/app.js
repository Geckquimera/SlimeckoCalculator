// ---------- Pestañas ----------
var tabs=[].slice.call(document.querySelectorAll('[role=tab]'));
tabs.forEach(function(t,i){t.addEventListener('click',function(){
 tabs.forEach(function(x,j){x.setAttribute('aria-selected',i===j);document.getElementById('p'+j).hidden=i!==j});
})});
function fmt(n){if(!isFinite(n))return'Error';return String(parseFloat(n.toPrecision(12)))}

// ---------- Calculadora básica ----------
var expr='';
var cKeys=['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','( )','='];
var cPad=document.getElementById('c-pad');
cKeys.forEach(function(k){
 var b=document.createElement('button');b.type='button';b.textContent=k;
 b.className='k'+('C⌫%÷×−+'.indexOf(k)>-1&&k.length===1?' o':'')+(k==='='?' eq':'');
 b.addEventListener('click',function(){cPress(k)});cPad.appendChild(b);
});
function cShow(res){document.getElementById('c-out').textContent=res!==undefined?res:(expr||'0')}
function cPress(k){
 var hist=document.getElementById('c-hist');
 if(k==='C'){expr='';hist.textContent='';cShow();return}
 if(k==='⌫'){expr=expr.slice(0,-1);cShow();return}
 if(k==='( )'){var o=(expr.match(/\(/g)||[]).length,c=(expr.match(/\)/g)||[]).length;
  k=(o>c&&/[\d)%]$/.test(expr))?')':'(';}
 if(k==='='){
  try{
   var s=expr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-').replace(/(\d+(\.\d+)?)%/g,'($1/100)');
   if(!/^[0-9+\-*\/.()\s]+$/.test(s))throw 0;
   var r=Function('"use strict";return ('+s+')')();
   hist.textContent=expr+' =';expr=isFinite(r)?fmt(r):'';cShow(isFinite(r)?expr:'Error');
  }catch(e){hist.textContent=expr;expr='';cShow('Error')}
  return}
 expr+=k;cShow();
}

// ---------- Conversor ----------
var U={
 'Longitud':{'metros (m)':1,'kilómetros (km)':1000,'centímetros (cm)':.01,'milímetros (mm)':.001,'millas (mi)':1609.344,'yardas (yd)':.9144,'pies (ft)':.3048,'pulgadas (in)':.0254},
 'Peso':{'kilogramos (kg)':1,'gramos (g)':.001,'libras (lb)':.45359237,'onzas (oz)':.0283495231,'toneladas (t)':1000},
 'Volumen':{'litros (L)':1,'mililitros (mL)':.001,'galones US (gal)':3.785411784,'tazas (cup)':.2365882365},
 'Área':{'metros² (m²)':1,'kilómetros² (km²)':1e6,'hectáreas (ha)':1e4,'pies² (ft²)':.09290304,'acres':4046.8564224},
 'Temperatura':{'Celsius (°C)':0,'Fahrenheit (°F)':0,'Kelvin (K)':0}
};
var vCat=document.getElementById('v-cat'),vFrom=document.getElementById('v-from'),vTo=document.getElementById('v-to'),vIn=document.getElementById('v-in'),vOut=document.getElementById('v-out');
Object.keys(U).forEach(function(c){vCat.add(new Option(c,c))});
function fill(sel,names,idx){sel.innerHTML='';names.forEach(function(n){sel.add(new Option(n,n))});sel.selectedIndex=idx}
function vCats(){var n=Object.keys(U[vCat.value]);fill(vFrom,n,0);fill(vTo,n,1);vCalc()}
function toC(v,u){return u.indexOf('°F')>-1?(v-32)*5/9:u.indexOf('(K)')>-1?v-273.15:v}
function fromC(c,u){return u.indexOf('°F')>-1?c*9/5+32:u.indexOf('(K)')>-1?c+273.15:c}
function vCalc(){
 var v=parseFloat(vIn.value);
 if(isNaN(v)){vOut.textContent='Escribe una cantidad';return}
 var a=vFrom.value,b=vTo.value,r;
 if(vCat.value==='Temperatura')r=fromC(toC(v,a),b);
 else r=v*U[vCat.value][a]/U[vCat.value][b];
 var m=b.match(/\(([^)]+)\)/);vOut.textContent=fmt(r)+' '+(m?m[1]:b);
}
[vFrom,vTo,vIn].forEach(function(e){e.addEventListener('input',vCalc)});
vCat.addEventListener('change',vCats);vCats();

// ---------- Calculadora científica ----------
var deg=true,sIn=document.getElementById('s-in'),sOut=document.getElementById('s-out'),sRes=document.getElementById('s-res');
var sKeys=['sin(','cos(','tan(','log(','ln(','sqrt(','^','π','e','abs(','(',')','%','÷','×','7','8','9','−','+','4','5','6','.','C','1','2','3','0','⌫'];
var sPad=document.getElementById('s-pad');
sKeys.forEach(function(k){
 var b=document.createElement('button');b.type='button';b.textContent=k;b.className='k'+(/^[a-z]/.test(k)&&k!=='e'?' o':'');
 b.style.fontSize=k.length>2?'.85rem':'';
 b.addEventListener('click',function(){
  if(k==='C'){sIn.value='';sOut.textContent='';sRes.textContent=''}
  else if(k==='⌫')sIn.value=sIn.value.slice(0,-1);
  else sIn.value+=k;
  sIn.focus();
 });sPad.appendChild(b);
});
document.getElementById('s-mode').addEventListener('click',function(){deg=!deg;this.textContent=deg?'Grados':'Radianes'});
function sCalc(){
 var s=sIn.value.replace(/π/g,'pi').replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-').replace(/\^/g,'**').replace(/(\d+(\.\d+)?)%/g,'($1/100)');
 var ids=s.match(/[a-z]+/gi)||[];
 var rad=function(x){return deg?x*Math.PI/180:x};
 var sc={sin:function(x){return Math.sin(rad(x))},cos:function(x){return Math.cos(rad(x))},tan:function(x){return Math.tan(rad(x))},log:Math.log10,ln:Math.log,sqrt:Math.sqrt,abs:Math.abs,pi:Math.PI,e:Math.E};
 try{
  if(!s.trim())return;
  if(!/^[0-9a-z+\-*\/.,()\s]+$/i.test(s)||ids.some(function(i){return!(i in sc)}))throw 0;
  var names=Object.keys(sc);
  var r=Function.apply(null,names.concat('"use strict";return ('+s+')')).apply(null,names.map(function(n){return sc[n]}));
  if(typeof r!=='number'||!isFinite(r))throw 0;
  sRes.textContent=sIn.value+' =';sOut.textContent=fmt(Math.abs(r)<1e-12?0:r);
 }catch(e){sRes.textContent=sIn.value;sOut.textContent='Error'}
}
document.getElementById('s-go').addEventListener('click',sCalc);
sIn.addEventListener('keydown',function(e){if(e.key==='Enter')sCalc()});

// ---------- Tu talla ----------
var ZW=[['XS','US 0-2',83,65,90],['S','US 4-6',87,69,94],['M','US 8-10',93,75,100],['L','US 12-14',100,82,107],['XL','US 16',107,90,114],['XXL','US 18',114,98,121]];
var ZM=[['XS','',86,71,89],['S','',94,79,96],['M','',102,87,103],['L','',110,95,110],['XL','',118,103,117],['XXL','',126,111,124]];
var G={
 mujer:{t:ZW,b:'Busto',p:[['top','Top o blusa'],['vestido','Vestido'],['falda','Falda'],['short','Short'],['pantalon','Pantalón']]},
 hombre:{t:ZM,b:'Pecho',p:[['top','Playera o camisa'],['pantalon','Pantalón'],['short','Short']]}
};
var ZN={top:['busto'],vestido:['busto','cintura','cadera'],falda:['cintura','cadera'],short:['cintura','cadera'],pantalon:['cintura','cadera']};
var ZI={busto:2,cintura:3,cadera:4};
function zGen(){
 var g=G[document.getElementById('z-gen').value],sel=document.getElementById('z-pren');
 sel.innerHTML='';g.p.forEach(function(o){sel.add(new Option(o[1],o[0]))});
 document.querySelector('label[for=z-busto]').textContent=g.b+' (en la parte más ancha del pecho)';
 zUpdate();
}
function zUpdate(){
 var g=G[document.getElementById('z-gen').value],Z=g.t;
 var need=ZN[document.getElementById('z-pren').value],k=parseFloat(document.getElementById('z-un').value);
 ['busto','cintura','cadera'].forEach(function(m){document.getElementById('z-w-'+m).hidden=need.indexOf(m)<0});
 var res=document.getElementById('z-res'),falta=[],det=[],max=-1;
 need.forEach(function(m){
  var v=parseFloat(document.getElementById('z-'+m).value)*k,nom=m==='busto'?g.b.toLowerCase():m;
  if(isNaN(v)||v<=0){falta.push(nom);return}
  var i=0;while(i<Z.length&&v>Z[i][ZI[m]])i++;
  det.push(nom.charAt(0).toUpperCase()+nom.slice(1)+': '+(i<Z.length?Z[i][0]:'más de XXL'));
  if(i>max)max=i;
 });
 if(falta.length){res.textContent='Falta tu medida de '+falta.join(', ')+'.';return}
 if(max>=Z.length){res.textContent='Tus medidas pasan la talla XXL de esta tabla. Busca tallas extendidas o consulta la tabla de la marca.';return}
 var eq=Z[max][1]?' <small style="font-size:1rem;color:var(--mute)">('+Z[max][1]+')</small>':'';
 var txt='<div class="big" style="margin:0">'+Z[max][0]+eq+'</div><div>'+det.join(' · ')+'</div>';
 if(need.length>1&&det.some(function(d){return d.slice(-Z[max][0].length-1)!==' '+Z[max][0]}))txt+='<div class="hint">Tus medidas caen en tallas distintas. Te recomendamos la más grande para que no te apriete; puedes ajustar la otra zona.</div>';
 res.innerHTML=txt;
}
document.getElementById('z-gen').addEventListener('input',zGen);
['z-pren','z-un','z-busto','z-cintura','z-cadera'].forEach(function(id){document.getElementById(id).addEventListener('input',zUpdate)});
zGen();

// ---------- Herramientas extra (motor genérico) ----------
var T=[];
function tool(g,id,n,f,r,o){o=o||{};T.push({g:g,id:id,n:n,f:f,r:r,note:o.note||'',live:o.live})}
var n2=function(x){return x.toLocaleString('es-MX',{maximumFractionDigits:2})},
$=function(x){return'$'+x.toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})},
D=function(s){return new Date(s+'T00:00:00')},dd=function(a,b){return Math.round((b-a)/864e5)},
vac=function(y){return y<1?0:y<=5?12+2*(y-1):20+2*Math.ceil((y-5)/5)},
rnd=function(n){return crypto.getRandomValues(new Uint32Array(1))[0]%n},
today=function(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var DW='Dinero y trabajo',CO='Construcción',SA='Salud',FE='Fechas',TX='Texto y utilidades',CV='Conversores';

// Dinero y trabajo
tool(DW,'aguinaldo','Aguinaldo',[['sd','Salario diario',''],['dias','Días de aguinaldo',15],['trab','Días trabajados en el año',365]],function(v){
 var d=v.dias*v.trab/365;return[['Días de salario',n2(d)],['Aguinaldo (bruto)',$(v.sd*d)]]},{note:'El mínimo legal es de 15 días. El monto es bruto: puede tener retención de ISR.'});
tool(DW,'vacaciones','Vacaciones y prima vacacional',[['sd','Salario diario',''],['y','Años cumplidos de antigüedad (1 o más)',1]],function(v){
 if(v.y<1)return'Las vacaciones se generan al cumplir el primer año.';var d=vac(Math.floor(v.y)),p=d*v.sd;
 return[['Días de vacaciones',d],['Pago de vacaciones',$(p)],['Prima vacacional (25%)',$(p*.25)],['Total',$(p*1.25)]]},{note:'Usa la tabla vigente desde la reforma de vacaciones de 2023. El 25% es el mínimo de ley.'});
tool(DW,'finiquito','Finiquito y liquidación',[['sd','Salario diario',''],['ing','Fecha de ingreso','hoy','d'],['sal','Fecha de salida','hoy','d'],['pend','Días de salario sin pagar',0],['tipo','Tipo de salida','','s',[['r','Renuncia o fin de contrato'],['d','Despido injustificado']]],['min','Salario mínimo diario vigente (opcional, para la prima de antigüedad)','','n',0,1]],function(v){
 var a=D(v.ing),b=D(v.sal);if(!(b>a))return'La fecha de salida debe ser posterior a la de ingreso.';
 var yrs=(dd(a,b)+1)/365,y=Math.floor(yrs),ini=new Date(b.getFullYear(),0,1);if(a>ini)ini=a;
 var ag=v.sd*15*(dd(ini,b)+1)/365,an=new Date(a.getFullYear()+y,a.getMonth(),a.getDate()),
 vp=v.sd*vac(y+1)*(dd(an,b)+1)/365,pr=vp*.25,sp=v.pend*v.sd,tot=ag+vp+pr+sp;
 var R=[['Antigüedad',n2(yrs)+' años'],['Salarios pendientes',$(sp)],['Aguinaldo proporcional',$(ag)],['Vacaciones proporcionales',$(vp)],['Prima vacacional (25%)',$(pr)],['Finiquito',$(tot)]];
 if(v.tipo==='d'){var t3=v.sd*90,t20=v.sd*20*yrs;R.push(['3 meses de salario',$(t3)],['20 días por año',$(t20)]);tot+=t3+t20}
 if(v.min>0&&(v.tipo==='d'||y>=15)){var pa=Math.min(v.sd,2*v.min)*12*yrs;R.push(['Prima de antigüedad',$(pa)]);tot+=pa}
 if(v.tipo==='d')R.push(['Total con liquidación',$(tot)]);return R},{note:'Estimación con salario diario simple; en una liquidación la ley usa el salario integrado. Consulta a Profedet o a un abogado laboral antes de firmar.'});
tool(DW,'credito','Pago mensual de un crédito',[['m','Monto del préstamo',''],['t','Tasa de interés anual (%)',''],['n','Plazo en meses','']],function(v){
 var i=v.t/1200,p=i?v.m*i/(1-Math.pow(1+i,-v.n)):v.m/v.n;return[['Pago mensual',$(p)],['Total a pagar',$(p*v.n)],['Intereses',$(p*v.n-v.m)]]},{note:'Tasa fija, sin comisiones ni seguros. Tu banco puede cobrar distinto.'});
tool(DW,'iva','Calculadora de IVA',[['m','Monto',''],['t','Tasa de IVA (%)',16],['q','Qué quieres hacer','','s',[['a','Agregar IVA al precio'],['q','Quitar el IVA (el precio ya lo incluye)']]]],function(v){
 var b=v.q==='a'?v.m:v.m/(1+v.t/100),i=b*v.t/100;return[['Subtotal',$(b)],['IVA',$(i)],['Total',$(b+i)]]},{note:'En la franja fronteriza puede aplicar una tasa distinta: cámbiala si es tu caso.'});
tool(DW,'porcentajes','Porcentajes y descuentos',[['modo','Operación','','s',[['p','Calcular el B % de A'],['d','Precio A con B % de descuento'],['q','A es qué % de B']]],['a','Cantidad A',''],['b','Cantidad B','']],function(v){
 if(v.modo==='p')return[[n2(v.b)+'% de '+n2(v.a),n2(v.a*v.b/100)]];
 if(v.modo==='d')return[['Precio final',$(v.a*(1-v.b/100))],['Ahorras',$(v.a*v.b/100)]];
 return[['Porcentaje',n2(v.a/v.b*100)+' %']]});
tool(DW,'propina','Propina y dividir la cuenta',[['c','Cuenta',''],['p','Propina (%)',10],['n','Personas',2]],function(v){
 var pr=v.c*v.p/100,t=v.c+pr;return[['Propina',$(pr)],['Total',$(t)],['Por persona',$(t/v.n)]]});

// Construcción
tool(CO,'piso','Piso o azulejo',[['l','Largo del cuarto (m)',''],['a','Ancho del cuarto (m)',''],['pl','Largo de la pieza (cm)',60],['pa','Ancho de la pieza (cm)',60],['d','Desperdicio (%)',10]],function(v){
 var A=v.l*v.a,T2=A*(1+v.d/100);return[['Área',n2(A)+' m²'],['Área con desperdicio',n2(T2)+' m²'],['Piezas necesarias',Math.ceil(T2/(v.pl*v.pa/1e4))]]});
tool(CO,'block','Blocks por muro',[['l','Largo del muro (m)',''],['h','Alto del muro (m)',''],['v','Puertas y ventanas (m²)',0],['bl','Largo del block (cm)',40],['bh','Alto del block (cm)',20],['d','Desperdicio (%)',5]],function(v){
 var A=v.l*v.h-v.v;return[['Área neta',n2(A)+' m²'],['Blocks necesarios',Math.ceil(A/(v.bl*v.bh/1e4)*(1+v.d/100))]]},{note:'Mide el block con la junta incluida.'});
tool(CO,'pintura','Pintura por m²',[['a','Área a pintar (m²)',''],['m','Manos',2],['r','Rendimiento (m² por litro y por mano)',10]],function(v){
 var L=v.a*v.m/v.r;return[['Litros',n2(L)],['Cubetas de 19 L',n2(L/19)+' (compra '+Math.ceil(L/19)+')']]},{note:'El rendimiento viene en la etiqueta de cada pintura.'});
tool(CO,'concreto','Concreto en m³',[['l','Largo (m)',''],['a','Ancho (m)',''],['e','Espesor (cm)',10],['d','Desperdicio (%)',5]],function(v){
 var m=v.l*v.a*v.e/100,t=m*(1+v.d/100);return[['Volumen',n2(m)+' m³'],['Con desperdicio',n2(t)+' m³'],['Cemento aprox. (bultos de 50 kg)',Math.ceil(t*7)]]},{note:'El cemento es una referencia de unos 7 bultos por m³ para un concreto común. Confirma la dosificación con tu residente.'});
tool(CO,'varilla','Varilla en losa o firme',[['l','Largo (m)',''],['a','Ancho (m)',''],['s','Separación (cm)',20],['v','Largo de la varilla (m)',12],['d','Desperdicio (%)',10]],function(v){
 var ml=(Math.floor(v.l*100/v.s)+1)*v.a+(Math.floor(v.a*100/v.s)+1)*v.l;return[['Metros lineales',n2(ml)+' m'],['Varillas necesarias',Math.ceil(ml*(1+v.d/100)/v.v)]]},{note:'Parrilla en dos direcciones. No incluye traslapes ni dobleces.'});

// Salud
tool(SA,'imc','IMC (índice de masa corporal)',[['p','Peso (kg)',''],['e','Estatura (cm)','']],function(v){
 var i=v.p/Math.pow(v.e/100,2),c=i<18.5?'Bajo peso':i<25?'Peso normal':i<30?'Sobrepeso':'Obesidad';return[['IMC',n2(i)],['Categoría (OMS)',c]]},{note:'Es una referencia para adultos y no mide grasa ni músculo. Consulta a tu médico.'});
tool(SA,'calorias','Calorías diarias de mantenimiento',[['s','Sexo','','s',[['h','Hombre'],['m','Mujer']]],['ed','Edad (años)',''],['p','Peso (kg)',''],['e','Estatura (cm)',''],['a','Actividad','','s',[['1.2','Poca actividad'],['1.375','Ligera (1 a 3 días por semana)'],['1.55','Moderada (3 a 5 días)'],['1.725','Alta (6 a 7 días)']]]],function(v){
 var t=10*v.p+6.25*v.e-5*v.ed+(v.s==='h'?5:-161);return[['Metabolismo basal',n2(t)+' kcal'],['Calorías para mantener tu peso',n2(t*parseFloat(v.a))+' kcal']]},{note:'Estimación general (fórmula Mifflin-St Jeor). Un nutriólogo puede darte un plan para tu caso.'});
tool(SA,'agua','Agua al día',[['p','Peso (kg)','']],function(v){return[['Referencia diaria',n2(v.p*35/1000)+' litros']]},{note:'Referencia general de unos 35 ml por kg. Cambia con el calor, el ejercicio y tu salud.'});

// Fechas
tool(FE,'entrefechas','Días entre dos fechas',[['a','Fecha inicial','hoy','d'],['b','Fecha final','hoy','d']],function(v){
 var d=Math.abs(dd(D(v.a),D(v.b)));return[['Días',d],['Semanas',n2(d/7)],['Meses aprox.',n2(d/30.44)]]});
tool(FE,'edad','Calculadora de edad',[['nac','Fecha de nacimiento','','d']],function(v){
 var b=D(v.nac),n=new Date();n.setHours(0,0,0,0);if(!(b<=n))return'Escribe una fecha pasada.';
 var y=n.getFullYear()-b.getFullYear(),m=n.getMonth()-b.getMonth(),d=n.getDate()-b.getDate();
 if(d<0){m--;d+=new Date(n.getFullYear(),n.getMonth(),0).getDate()}if(m<0){y--;m+=12}
 var x=new Date(n.getFullYear(),b.getMonth(),b.getDate());if(x<n)x.setFullYear(n.getFullYear()+1);
 return[['Edad',y+' años, '+m+' meses, '+d+' días'],['Días vividos',n2(dd(b,n))],['Próximo cumpleaños en',dd(n,x)+' días']]});
tool(FE,'cuenta','Cuenta regresiva',[['f','Fecha del evento','hoy','d']],function(v){
 var ms=D(v.f)-new Date();if(ms<=0)return'Esa fecha ya llegó.';var s=Math.floor(ms/1e3);
 return[['Días',Math.floor(s/86400)],['Horas',Math.floor(s%86400/3600)],['Minutos',Math.floor(s%3600/60)],['Segundos',s%60]]},{live:1});

// Texto y utilidades
tool(TX,'contador','Contador de palabras y caracteres',[['t','Escribe o pega tu texto','','a']],function(v){
 var t=v.t;return[['Palabras',(t.trim().match(/\S+/g)||[]).length],['Caracteres',t.length],['Sin espacios',t.replace(/\s/g,'').length],['Líneas',t?t.split('\n').length:0]]});
tool(TX,'mayusculas','Mayúsculas y minúsculas',[['t','Texto','','a'],['m','Formato','','s',[['u','MAYÚSCULAS'],['l','minúsculas'],['t','Tipo Título'],['s','Tipo oración']]]],function(v){
 var t=v.t,l=t.toLowerCase(),R=v.m==='u'?t.toUpperCase():v.m==='l'?l:v.m==='t'?l.replace(/(^|\s)\S/g,function(c){return c.toUpperCase()}):l.replace(/(^\s*|[.!?]\s+)(\S)/g,function(m,a,b){return a+b.toUpperCase()});
 return[['Resultado',R]]});
tool(TX,'clave','Generador de contraseñas',[['n','Longitud',16],['k','Caracteres','','s',[['a','Letras, números y símbolos'],['b','Solo letras y números']]],['go','Generar otra','','b']],function(v){
 var c='abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'+(v.k==='a'?'!@#$%&*?+-=':''),n=Math.min(Math.max(v.n,6),64),s='';
 for(var i=0;i<n;i++)s+=c.charAt(rnd(c.length));return[['Contraseña',s]]},{note:'Se genera en tu dispositivo y no se guarda ni se envía a ningún lado.'});
tool(TX,'qr','Generador de código QR',[['t','Texto o enlace','','t']],function(v,out){
 out.innerHTML='';if(!v.t)return null;if(typeof QRCode==='undefined')return'No se pudo cargar el generador de QR. Revisa tu conexión.';
 new QRCode(out,{text:v.t,width:220,height:220});return null},{note:'Mantén presionada la imagen para guardarla.'});
tool(TX,'sorteo','Sorteo de nombres',[['t','Un nombre por línea','','a'],['n','Cuántos ganadores',1],['go','Sortear','','b']],function(v){
 if(!v.btn)return'Escribe los nombres y toca Sortear.';var L=v.t.split('\n').map(function(x){return x.trim()}).filter(Boolean),W=[];
 if(!L.length)return'Escribe al menos un nombre.';for(var k=Math.min(v.n,L.length);k>0;k--)W.push(L.splice(rnd(L.length),1)[0]);
 return W.map(function(w,i){return[(i+1)+'.',w]})});

// Más conversores
tool(CV,'divisas','Divisas (con tu tipo de cambio)',[['m','Monto',''],['tc','Tipo de cambio (pesos por 1 unidad extranjera)',''],['d','Convertir','','s',[['e','De moneda extranjera a pesos'],['p','De pesos a moneda extranjera']]]],function(v){
 return[['Resultado',n2(v.d==='e'?v.m*v.tc:v.m/v.tc)]]},{note:'Escribe el tipo de cambio del día de tu banco o casa de cambio. Esta herramienta no lo consulta en vivo.'});
var ING=[['Harina de trigo',120],['Azúcar',200],['Azúcar glass',120],['Mantequilla',225],['Arroz',185],['Avena',90],['Miel',340],['Leche o agua',240]];
tool(CV,'cocina','Cocina: tazas y gramos',[['i','Ingrediente','','s',ING.map(function(x,i){return[i,x[0]]})],['c','Cantidad',''],['d','Convertir','','s',[['g','Tazas a gramos'],['t','Gramos a tazas']]]],function(v){
 var g=ING[v.i][1];return[['Resultado',v.d==='g'?n2(v.c*g)+' g':n2(v.c/g)+' tazas']]},{note:'Aproximado: cambia según cómo llenes la taza.'});
var RO=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
function toR(n){var s='';RO.forEach(function(r){while(n>=r[0]){s+=r[1];n-=r[0]}});return s}
tool(CV,'romanos','Números romanos',[['t','Número o número romano','','t']],function(v){
 var s=v.t.trim().toUpperCase();if(!s)return null;
 if(/^\d+$/.test(s)){var n=+s;return n>=1&&n<=3999?[['Romano',toR(n)]]:'Escribe un número del 1 al 3999.'}
 var V={I:1,V:5,X:10,L:50,C:100,D:500,M:1000},t=0;for(var i=0;i<s.length;i++){var a=V[s[i]],b=V[s[i+1]]||0;if(!a)return'Número romano no válido.';t+=a<b?-a:a}
 return toR(t)===s?[['Número',t]]:'Número romano no válido.'});
var ZS=[['Ciudad Juárez','America/Ciudad_Juarez'],['Ciudad de México','America/Mexico_City'],['Tijuana','America/Tijuana'],['Nueva York','America/New_York'],['Los Ángeles','America/Los_Angeles'],['Bogotá','America/Bogota'],['Buenos Aires','America/Argentina/Buenos_Aires'],['Madrid','Europe/Madrid'],['Londres','Europe/London'],['Tokio','Asia/Tokyo'],['UTC','UTC']];
tool(CV,'zonas','Hora en el mundo',[],function(){return ZS.map(function(z){return[z[0],new Intl.DateTimeFormat('es-MX',{timeZone:z[1],weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date())]})},{live:1});

// ---------- Motor: navegación y render ----------
var gp=document.getElementById('p4'),cur=null;
function run(e){
 var t=cur;if(!t)return;var out=document.getElementById('g-out'),v={btn:!!(e&&e.target&&e.target.tagName==='BUTTON')},bad=false,r;
 t.f.forEach(function(f){if(f[3]==='b')return;var el=document.getElementById('g-'+f[0]),ty=f[3]||'n';
  v[f[0]]=ty==='n'?parseFloat(el.value):el.value;if(ty==='n'&&isNaN(v[f[0]])&&!f[5])bad=true});
 try{r=bad?'Llena los campos con números.':t.r(v,out)}catch(x){r='Revisa los datos.'}
 if(r===null)return;if(typeof r==='string'){out.textContent=r;return}
 out.innerHTML=r.map(function(o){return'<div class="o"><span>'+esc(o[0])+'</span><b>'+esc(o[1])+'</b></div>'}).join('');
}
function render(t){
 cur=t;var h='<h2>'+t.n+'</h2>';
 t.f.forEach(function(f){var id='g-'+f[0],ty=f[3]||'n',dv=f[2]==='hoy'?today():f[2];
  if(ty==='b'){h+='<button type="button" class="k eq" id="'+id+'" style="width:100%;margin-top:12px">'+f[1]+'</button>';return}
  h+='<label for="'+id+'">'+f[1]+'</label>';
  if(ty==='s')h+='<select id="'+id+'">'+f[4].map(function(o){return'<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')+'</select>';
  else if(ty==='a')h+='<textarea id="'+id+'" rows="5">'+dv+'</textarea>';
  else h+='<input id="'+id+'" type="'+{n:'number',d:'date',t:'text'}[ty]+'"'+(ty==='n'?' inputmode="decimal" step="any"':'')+' value="'+dv+'">';
 });
 h+='<div id="g-out" aria-live="polite" style="margin-top:14px"></div>'+(t.note?'<p class="hint">'+t.note+'</p>':'');
 gp.innerHTML=h;gp.oninput=gp.onclick=run;run();
}
var nav=document.getElementById('nav'),FX=[['Calculadoras','p0','Calculadora'],['Calculadoras','p2','Calculadora científica'],[CV,'p1','Conversor de unidades'],['Ropa','p3','Tu talla de ropa']];
['Calculadoras',CV,'Ropa',DW,CO,SA,FE,TX].forEach(function(g){
 var og=document.createElement('optgroup');og.label=g;
 FX.concat(T.map(function(t){return[t.g,t.id,t.n]})).forEach(function(x){if(x[0]===g)og.appendChild(new Option(x[2],x[1]))});nav.appendChild(og);
});
nav.addEventListener('change',function(){
 var id=nav.value;for(var i=0;i<5;i++)document.getElementById('p'+i).hidden=true;
 if(/^p[0-3]$/.test(id))document.getElementById(id).hidden=false;
 else{gp.hidden=false;render(T.filter(function(t){return t.id===id})[0])}
});
setInterval(function(){if(cur&&cur.live&&!gp.hidden)run()},1000);

(function(){var id=document.body.getAttribute('data-tool');if(!id)return;
 for(var i=0;i<5;i++)document.getElementById('p'+i).hidden=true;
 if(/^p[0-3]$/.test(id))document.getElementById(id).hidden=false;
 else{gp.hidden=false;render(T.filter(function(t){return t.id===id})[0])}})();
