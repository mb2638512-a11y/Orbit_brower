const input=document.getElementById("url"), frame=document.getElementById("frame"), welcome=document.getElementById("welcome");
let historyList=[],index=-1;
function resolve(q){q=q.trim();if(!q)return "https://www.google.com";if(/^https?:\/\//i.test(q))return q;if(/^[\w-]+\.[\w.-]+(?::\d+)?(?:\/.*)?$/.test(q)&&!q.includes(" "))return "https://"+q;return "https://www.google.com/search?q="+encodeURIComponent(q)}
function go(q,push=true){const u=resolve(q);frame.src=u;frame.style.display="block";welcome.style.display="none";input.value=u;if(push){historyList=historyList.slice(0,index+1);historyList.push(u);index=historyList.length-1}}
document.getElementById("search").addEventListener("submit",e=>{e.preventDefault();go(input.value)});
document.getElementById("back").onclick=()=>{if(index>0){index--;go(historyList[index],false)}};
document.getElementById("forward").onclick=()=>{if(index<historyList.length-1){index++;go(historyList[index],false)}};
document.getElementById("home").onclick=()=>{frame.style.display="none";welcome.style.display="block";input.value=""};
document.getElementById("reload").onclick=()=>{try{frame.contentWindow.location.reload()}catch{frame.src=frame.src}};

// Update entry point: open Orbit release downloads so users can select the build for their OS.
document.getElementById("updates").addEventListener("click",()=>{ window.open("https://github.com/mb2638512-a11y/Orbit_brower/releases","_blank","noopener,noreferrer"); });

// Global AI prototype hub: search shortcut plus transparent status for integrations still requiring backend setup.
const aiPanel=document.getElementById("aiPanel");
document.getElementById("globalai").addEventListener("click",()=>{aiPanel.style.display=aiPanel.style.display==="none"?"block":"none";});
document.getElementById("aiSearch").addEventListener("submit",e=>{e.preventDefault();const q=document.getElementById("aiQuery").value.trim();if(q)go("https://www.google.com/search?q="+encodeURIComponent(q));});
document.getElementById("aiSearchTab").addEventListener("click",()=>document.getElementById("aiStatus").textContent="Search shortcut is available. A self-hosted SearXNG gateway can aggregate many upstream engines once deployed and configured.");
document.getElementById("aiModels").addEventListener("click",()=>{document.getElementById("aiStatus").textContent="AI model routing is planned; connect model provider APIs and secure server-side credentials before enabling it.";window.open("https://models.dev/","_blank","noopener,noreferrer");});
document.getElementById("aiTools").addEventListener("click",()=>{document.getElementById("aiStatus").textContent="Browser automation is planned; connect and test controlled tools. Sensitive actions should require user approval.";window.open("https://playwright.dev/","_blank","noopener,noreferrer");});

// Quick search shortcuts and keyboard navigation.
const quickSearch=(base)=>{const q=input.value.trim();go(base+encodeURIComponent(q));};
document.getElementById("quickGoogle").addEventListener("click",()=>quickSearch("https://www.google.com/search?q="));
document.getElementById("quickBing").addEventListener("click",()=>quickSearch("https://www.bing.com/search?q="));
document.getElementById("quickDuck").addEventListener("click",()=>quickSearch("https://duckduckgo.com/?q="));
document.getElementById("quickWiki").addEventListener("click",()=>quickSearch("https://en.wikipedia.org/wiki/Special:Search?search="));
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="l"){e.preventDefault();input.focus();input.select();}});
