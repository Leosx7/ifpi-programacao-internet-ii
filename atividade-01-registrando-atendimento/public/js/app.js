import { listPatients, getPatient, listEncounters, createEncounter } from "./api.js";
import { subscribe, getState, setPatients, setSearchTerm, setOnlyActive, setError } from "./state.js";
import { renderPatientList, renderCounter, renderLoading, renderError } from "./render.js";
const searchInput=document.querySelector("#search-input"), onlyActiveInput=document.querySelector("#only-active-input"), patientListElement=document.querySelector("#patient-list"), resultCounterElement=document.querySelector("#result-counter"), listView=document.querySelector("#list-view"), detailView=document.querySelector("#detail-view");
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const fmt=s=>{const [d,t]=s.split("T"); const [y,m,day]=d.split("-"); return `${day}/${m}/${y} ${t}`};
function renderApp(state){ if(state.errorMessage){renderError(state.errorMessage,patientListElement);resultCounterElement.textContent="";return} if(state.isLoading){renderLoading(patientListElement);resultCounterElement.textContent="";return} renderPatientList(state.visiblePatients,state.searchTerm,patientListElement); renderCounter(state.visiblePatients.length,state.patients.length,resultCounterElement); }
searchInput.addEventListener("input",e=>setSearchTerm(e.target.value));
onlyActiveInput.addEventListener("change",e=>setOnlyActive(e.target.checked));
subscribe(renderApp);
patientListElement.addEventListener("click",e=>{const card=e.target.closest("[data-patient-id]"); if(card) openPatient(Number(card.dataset.patientId));});
patientListElement.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-patient-id]")) openPatient(Number(e.target.dataset.patientId));});
async function openPatient(id){
  listView.hidden=true; detailView.hidden=false;
  detailView.innerHTML='<div class="empty-state"><strong>Carregando…</strong><p>Buscando o prontuário.</p></div>';
  try{const [p,enc]=await Promise.all([getPatient(id),listEncounters(id)]); renderDetail(p,enc);}
  catch(err){detailView.innerHTML=`<div class="empty-state"><strong>Não foi possível abrir</strong><p>${esc(err.message)}</p><button id="back-button" class="btn btn-outline-secondary">Voltar</button></div>`; document.querySelector("#back-button").onclick=back;}
}
function back(){detailView.hidden=true; listView.hidden=false;}
function renderDetail(p,enc){
  detailView.innerHTML=`<div class="patient-detail"><header class="patient-detail__header"><div><button id="back-button" class="btn btn-sm btn-outline-secondary mb-3">← Voltar</button><h2>${esc(p.name)}</h2><p class="text-secondary mb-0">CNS ${esc(p.nationalId)}</p></div></header><section class="encounter-list-wrap"><h3 class="h5">Atendimentos</h3><ul class="encounter-list">${enc.length?enc.map(e=>`<li class="encounter-item"><div class="encounter-item__date">${fmt(e.startedAt)}</div><p class="encounter-item__complaint">${esc(e.chiefComplaint)}</p><p class="encounter-item__notes">${e.notes?esc(e.notes):"Sem observações."}</p></li>`).join(""):'<li class="empty-state">Nenhum atendimento registrado.</li>'}</ul></section><form id="encounter-form" class="encounter-form"><h3 class="h5">Novo atendimento</h3><div class="mb-3"><label class="form-label" for="started-at">Início</label><input class="form-control" id="started-at" name="startedAt" type="datetime-local" required></div><div class="mb-3"><label class="form-label" for="chief-complaint">Queixa principal</label><textarea class="form-control" id="chief-complaint" name="chiefComplaint" required></textarea></div><div class="mb-3"><label class="form-label" for="notes">Conduta / observações</label><textarea class="form-control" id="notes" name="notes"></textarea></div><p id="form-error" class="text-danger" aria-live="polite"></p><button class="btn btn-success" type="submit">Registrar atendimento</button></form></div>`;
  document.querySelector("#back-button").onclick=back;
  document.querySelector("#encounter-form").onsubmit=async ev=>{ev.preventDefault(); const fd=new FormData(ev.currentTarget), error=document.querySelector("#form-error"); error.textContent=""; try{await createEncounter(p.id,{startedAt:fd.get("startedAt"),chiefComplaint:fd.get("chiefComplaint"),notes:fd.get("notes")}); const fresh=await listEncounters(p.id); renderDetail(p,fresh);}catch(e){error.textContent=e.message;}};
}
async function start(){renderApp(getState()); try{setPatients(await listPatients())}catch(e){setError(e.message)}} start();
