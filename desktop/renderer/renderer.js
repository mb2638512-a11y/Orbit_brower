const input=document.getElementById("url"), frame=document.getElementById("frame"), welcome=document.getElementById("welcome");
let historyList=[],index=-1;
const loadList=(key)=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return []}};
let bookmarks=loadList("orbit.bookmarks.v1"),visits=loadList("orbit.history.v1");
function persist(){try{localStorage.setItem("orbit.bookmarks.v1",JSON.stringify(bookmarks));localStorage.setItem("orbit.history.v1",JSON.stringify(visits.slice(0,100)))}catch{}}
function showList(kind){const panel=document.getElementById("listPanel"),items=document.getElementById("listItems");panel.style.display="block";document.getElementById("listTitle").textContent=kind==="bookmarks"?"Bookmarks":"Recent history";items.replaceChildren();const list=kind==="bookmarks"?bookmarks:visits;if(!list.length){items.textContent=kind==="bookmarks"?"No bookmarks saved yet.":"No recent visits saved.";return}list.slice(0,30).forEach(item=>{const b=document.createElement("button");b.textContent=item.title||item.url;b.style.cssText="display:block;width:100%;text-align:left;margin-top:6px;background:#202b43;overflow:hidden;text-overflow:ellipsis";b.addEventListener("click",()=>{panel.style.display="none";go(item.url)});items.appendChild(b)})}
function resolve(q){q=q.trim();if(!q)return "https://www.google.com";if(/^https?:\/\//i.test(q))return q;if(/^[\w-]+\.[\w.-]+(?::\d+)?(?:\/.*)?$/.test(q)&&!q.includes(" "))return "https://"+q;return "https://www.google.com/search?q="+encodeURIComponent(q)}
function go(q,push=true){const u=resolve(q);frame.src=u;frame.style.display="block";welcome.style.display="none";input.value=u;if(push){historyList=historyList.slice(0,index+1);historyList.push(u);index=historyList.length-1;visits=[{url:u,title:u,visitedAt:Date.now()},...visits.filter(v=>v.url!==u)].slice(0,100);persist()}}
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

// Persistent saved pages and privacy controls. These clear Orbit local records, not remote server logs.
document.getElementById("bookmark").addEventListener("click",()=>{const u=input.value.trim();if(!u)return;const url=resolve(u);if(!bookmarks.some(b=>b.url===url)){bookmarks=[{url,title:url,savedAt:Date.now()},...bookmarks];persist()}showList("bookmarks")});
document.getElementById("showBookmarks").addEventListener("click",()=>showList("bookmarks"));
document.getElementById("showHistory").addEventListener("click",()=>showList("history"));
document.getElementById("privacy").addEventListener("click",()=>{if(!confirm("Clear Orbit saved bookmarks, history and current browsing session? This cannot remove website/server logs or downloaded files."))return;bookmarks=[];visits=[];historyList=[];index=-1;persist();try{frame.src="about:blank"}catch{};frame.style.display="none";welcome.style.display="block";document.getElementById("listPanel").style.display="none";input.value=""});
