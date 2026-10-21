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
