import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard, Platform, ScrollView, Share } from "react-native";
import { WebView } from "react-native-webview";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const HOME = "https://www.google.com";
type Tab = { id: number; title: string; url: string };
import ENGINE_CATALOG from "./search-engines.json";
const SEARCH_ENGINES = ENGINE_CATALOG.engines.map(engine => ({id:engine.id,label:engine.name,url:engine.template}));
function toUrl(value: string) {
  const q = value.trim();
  if (!q) return HOME;
  if (/^https?:\/\//i.test(q)) return q;
  if (/^[\w-]+\.[\w.-]+(?::\d+)?(?:\/.*)?$/.test(q) && !q.includes(" ")) return "https://" + q;
  return "https://www.google.com/search?q=" + encodeURIComponent(q);
}
export default function Home() {
  const [dark, setDark] = useState(true);
  const [input, setInput] = useState(HOME);
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, title: "New tab", url: HOME }]);
  const [active, setActive] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState<"none" | "menu" | "bookmarks" | "history" | "engines" | "settings" | "globalai" | "tabs" | "find" | "downloads">("none");
  const [aiQuery, setAiQuery] = useState("");
  const [aiEndpoint, setAiEndpoint] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMode, setAiMode] = useState<"all" | "search" | "models" | "tools">("all");
  const [bookmarks, setBookmarks] = useState<Tab[]>([]);
  const [history, setHistory] = useState<Tab[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [searchProvider, setSearchProvider] = useState<string>("google0");
  const [downloadsHelp, setDownloadsHelp] = useState("");
  const [privateMode, setPrivateMode] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [desktopSite, setDesktopSite] = useState(false);
  const [readerMode, setReaderMode] = useState(false);
  const [lastClosedTab, setLastClosedTab] = useState<Tab | null>(null);
  const [findText, setFindText] = useState("");
  const [findCount, setFindCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [downloads, setDownloads] = useState<{url:string;date:number}[]>([]);
  const [updateStatus, setUpdateStatus] = useState("Checking for updates…");
  const [updateUrl, setUpdateUrl] = useState("https://github.com/mb2638512-a11y/Orbit_brower/releases");
  useEffect(() => {
    let alive = true;
    const platform = Platform.OS === "android" ? "android" : Platform.OS === "ios" ? "ios-simulator" : null;
    const tag = platform ? `orbit-browser-${platform}-latest` : null;
    const releaseUrl = tag ? `https://github.com/mb2638512-a11y/Orbit_brower/releases/tag/${tag}` : "https://github.com/mb2638512-a11y/Orbit_brower/releases";
    setUpdateUrl(releaseUrl);
    if (Platform.OS === "ios") {
      setUpdateStatus("iPhone auto-updates are not available yet: only a Simulator build exists. A signed App Store/TestFlight build is still required.");
      return () => { alive = false; };
    }
    fetch(tag ? `https://api.github.com/repos/mb2638512-a11y/Orbit_brower/releases/tags/${tag}` : "https://api.github.com/repos/mb2638512-a11y/Orbit_brower/releases?per_page=10")
      .then(async response => { if (!response.ok) throw new Error("Release check unavailable"); return response.json(); })
      .then(data => {
        const releases = Array.isArray(data) ? data : [data];
        const release = releases.find(item => item && item.assets && item.assets.length > 0);
        if (!alive) return;
        if (release) { setUpdateUrl(release.html_url || releaseUrl); setUpdateStatus("Latest platform build is published. Open releases to check the available download."); }
        else setUpdateStatus("No published installer found yet for this platform.");
      })
      .catch(() => { if (alive) setUpdateStatus("Could not check updates right now. You can open the releases page manually."); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { AsyncStorage.getItem("orbit.theme.v1").then(value=>{if(value==="light")setDark(false);else if(value==="dark")setDark(true)}).catch(()=>{}); }, []);
  useEffect(() => { AsyncStorage.setItem("orbit.theme.v1", dark ? "dark" : "light").catch(()=>{}); }, [dark]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const values = await AsyncStorage.multiGet(["orbit.bookmarks.v1","orbit.history.v1","orbit.searchProvider.v1","orbit.globalai.endpoint.v1","orbit.downloads.v1","orbit.desktopSite.v1","orbit.readerMode.v1"]);
        if (!alive) return;
        const stored = Object.fromEntries(values);
        if (stored["orbit.bookmarks.v1"]) setBookmarks(JSON.parse(stored["orbit.bookmarks.v1"]));
        if (stored["orbit.history.v1"]) setHistory(JSON.parse(stored["orbit.history.v1"]));
        if (stored["orbit.searchProvider.v1"] && SEARCH_ENGINES.some(e=>e.id===stored["orbit.searchProvider.v1"])) setSearchProvider(stored["orbit.searchProvider.v1"]!);
        if (stored["orbit.globalai.endpoint.v1"]) setAiEndpoint(stored["orbit.globalai.endpoint.v1"]!);
        if (stored["orbit.downloads.v1"]) setDownloads(JSON.parse(stored["orbit.downloads.v1"]));
        if (stored["orbit.desktopSite.v1"]) setDesktopSite(stored["orbit.desktopSite.v1"] === "true");
        if (stored["orbit.readerMode.v1"]) setReaderMode(stored["orbit.readerMode.v1"] === "true");
      } catch { /* storage may be unavailable on a device; browser remains usable */ }
      finally { if (alive) setStorageReady(true); }
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.bookmarks.v1", JSON.stringify(bookmarks)).catch(()=>{}); }, [bookmarks,storageReady]);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.history.v1", JSON.stringify(history.slice(0,100))).catch(()=>{}); }, [history,storageReady]);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.searchProvider.v1", searchProvider).catch(()=>{}); }, [searchProvider,storageReady]);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.globalai.endpoint.v1", aiEndpoint.trim()).catch(()=>{}); }, [aiEndpoint,storageReady]);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.downloads.v1", JSON.stringify(downloads.slice(0,50))).catch(()=>{}); }, [downloads,storageReady]);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.desktopSite.v1", String(desktopSite)).catch(()=>{}); }, [desktopSite,storageReady]);
  useEffect(() => { if (storageReady) AsyncStorage.setItem("orbit.readerMode.v1", String(readerMode)).catch(()=>{}); }, [readerMode,storageReady]);
  const web = useRef<WebView>(null);
  const current = tabs.find(t => t.id === active) || tabs[0];
  const bg = dark ? "#0b1020" : "#f4f6fb";
  const panel = dark ? "#151d31" : "#ffffff";
  const fg = dark ? "#f5f7ff" : "#10182b";
  const muted = dark ? "#9aa8c7" : "#667085";
  const updateCurrent = (patch: Partial<Tab>) => setTabs(old => old.map(t => t.id === active ? { ...t, ...patch } : t));
  const go = (raw = input, providerId = searchProvider) => {
    const trimmed = raw.trim();
    const selectedEngine = SEARCH_ENGINES.find(e=>e.id===providerId) || SEARCH_ENGINES[0];
    const url = trimmed && !/^https?:\/\//i.test(trimmed) && !/^[\w-]+\.[\w.-]+(?::\d+)?(?:\/.*)?$/.test(trimmed) && !trimmed.includes("://") ? selectedEngine.url + encodeURIComponent(trimmed) : toUrl(raw);
    updateCurrent({ url, title: url });
    setInput(url);
    setHistory(old => privateMode ? old : [{ id: Date.now(), title: url, url }, ...old.filter(h => h.url !== url)].slice(0, 100));
    setShowPanel("none");
    Keyboard.dismiss();
  };
  const runGlobalSearch = async () => {
    const q = aiQuery.trim(); if (!q) { setAiResult("Enter a topic to search."); return; }
    if (!/^https?:\/\//i.test(aiEndpoint.trim())) { setAiResult("Set your Global AI backend URL below (for example https://your-server.example). No server is configured yet."); return; }
    setAiBusy(true); setAiResult("Searching…");
    try { const response = await fetch(aiEndpoint.trim().replace(/\/$/, "") + "/api/search?q=" + encodeURIComponent(q)); const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Search unavailable"); const rows = (data.results || []).slice(0,8); setAiResult(rows.length ? rows.map((r:any,i:number)=>`${i+1}. ${r.title}\n${r.url}\n${r.content || ""}`).join("\n\n") : "No results found."); }
    catch (e:any) { setAiResult("Global search failed: " + (e?.message || "Check backend URL and connection.")); }
    finally { setAiBusy(false); }
  };
  const researchGlobalAI = async () => {
    const q = aiQuery.trim(); if (!q) { setAiResult("Enter a research question first."); return; }
    if (!/^https?:\/\//i.test(aiEndpoint.trim())) { setAiResult("Set your Global AI backend URL first."); return; }
    setAiBusy(true); setAiResult("Researching the web and checking sources…");
    try { const response = await fetch(aiEndpoint.trim().replace(/\/$/, "") + "/api/ai/research", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:q}]})}); const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Research unavailable"); const sources = (data.sources || []).map((r:any,i:number)=>`[${i+1}] ${r.title}\n${r.url}`).join("\n\n"); setAiResult((data.answer || "No answer returned.") + (sources ? "\n\nSources:\n" + sources : "")); }
    catch (e:any) { setAiResult("Research failed: " + (e?.message || "Check backend configuration.")); }
    finally { setAiBusy(false); }
  };
  const askGlobalAI = async () => {
    const q = aiQuery.trim(); if (!q) { setAiResult("Enter a question first."); return; }
    if (!/^https?:\/\//i.test(aiEndpoint.trim())) { setAiResult("Set your Global AI backend URL below (for example https://your-server.example). No server is configured yet."); return; }
    setAiBusy(true); setAiResult("Thinking…");
    try { const response = await fetch(aiEndpoint.trim().replace(/\/$/, "") + "/api/ai/chat", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:q}]})}); const data = await response.json(); if (!response.ok) throw new Error(data.detail || "AI unavailable"); setAiResult(data.answer || "No answer returned."); }
    catch (e:any) { setAiResult("Global AI unavailable: " + (e?.message || "Check backend configuration.")); }
    finally { setAiBusy(false); }
  };
  const newTab = () => {
    if (tabs.length >= 20) { setShowPanel("settings"); return; }
    const id = Date.now();
    setTabs(old => [...old, { id, title: "New tab", url: HOME }]);
    setActive(id); setInput(HOME); setShowPanel("none");
  };
  const closeTab = (id: number) => {
    setLastClosedTab(tabs.find(t => t.id === id) || null);
    if (tabs.length === 1) { setLastClosedTab(tabs[0]); setTabs([{ id: Date.now(), title: "New tab", url: HOME }]); setInput(HOME); return; }
    setLastClosedTab(tabs.find(t => t.id === id) || null);
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (active === id) { const next = remaining[remaining.length - 1]; setActive(next.id); setInput(next.url); }
  };
  const shareCurrent = async () => { try { await Share.share({message: `${current.title || current.url}\n${current.url}`, url: current.url}); } catch {} };
  const changeZoom = (delta: number) => { const next = Math.max(50, Math.min(200, zoomLevel + delta)); setZoomLevel(next); web.current?.injectJavaScript(`(function(){document.documentElement.style.zoom="${next}%";document.body.style.zoom="${next}%";return true})();true;`); };
  const findInPage = (text = findText) => { const q = text.trim(); if (!q) { setFindCount(0); return; } web.current?.injectJavaScript(`(function(){var q=${JSON.stringify(q)};var body=document.body;if(!body){window.ReactNativeWebView.postMessage(JSON.stringify({type:"find",count:0}));return true;}var walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT);var n,c=0;while(n=walker.nextNode()){if(n.parentElement&&!/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/.test(n.parentElement.tagName)&&n.nodeValue.toLowerCase().includes(q.toLowerCase()))c+=n.nodeValue.toLowerCase().split(q.toLowerCase()).length-1;}window.find(q);window.ReactNativeWebView.postMessage(JSON.stringify({type:"find",count:c}));return true;})(); true;`); };
  const addBookmark = () => {
    if (!bookmarks.some(b => b.url === current.url)) setBookmarks(old => [{ ...current }, ...old]);
    setShowPanel("bookmarks");
  };
  const navButton = (label: string, action: () => void, icon: string, disabled = false) => <Pressable accessibilityRole="button" disabled={disabled} onPress={action} style={[s.nav,{backgroundColor:panel,opacity:disabled?0.38:1}]}><Text style={[s.navIcon,{color:fg}]}>{icon}</Text><Text style={[s.navLabel,{color:fg}]}>{label}</Text></Pressable>;
  return <SafeAreaView style={[s.safe,{backgroundColor:bg}]}>
    <View style={s.top}>
      <View style={s.brandRow}><Pressable accessibilityRole="button" accessibilityLabel="Open Orbit navigation" onPress={()=>setShowPanel(showPanel==="menu"?"none":"menu")} style={[s.square,{backgroundColor:panel}]}><Text style={{color:fg,fontSize:18}}>☰</Text></Pressable>
        <View style={s.globeLogo}><View style={s.globeLatitude}/><View style={s.globeMeridian}/><View style={s.globeHorizon}/><View style={s.globeStar}/></View>
        <View><Text style={[s.brand,{color:fg}]}>ORBIT</Text><Text style={[s.sub,{color:muted}]}>YOUR WORLD, OPEN</Text></View>
        <View style={{flex:1}}/>
        <Pressable accessibilityRole="button" accessibilityLabel="Toggle incognito mode" onPress={()=>setPrivateMode(v=>!v)} style={[s.square,{backgroundColor:privateMode?"#6558f5":panel}]}><Text style={{color:privateMode?"#ffffff":fg,fontSize:17}}>◉</Text></Pressable><Pressable accessibilityLabel="New tab" onPress={newTab} style={[s.square,{backgroundColor:panel}]}><Text style={{color:fg,fontSize:21}}>＋</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Toggle light or dark theme" onPress={()=>setDark(!dark)} style={[s.square,{backgroundColor:panel}]}><Text style={{color:fg,fontSize:18}}>{dark?"☼":"☾"}</Text></Pressable>
      </View>
      <View style={[s.address,{backgroundColor:panel,borderColor:dark?"#29344e":"#e0e5ef"}]}>
        <Pressable accessibilityRole="button" accessibilityLabel={"Search engine: " + (SEARCH_ENGINES.find(e=>e.id===searchProvider)?.label || "Google")} onPress={()=>setShowPanel(showPanel==="engines"?"none":"engines")} style={[s.enginePicker,{backgroundColor:bg,borderColor:dark?"#29344e":"#e0e5ef"}]}><Text style={{fontSize:11,color:fg,fontWeight:"800"}}>{(SEARCH_ENGINES.find(e=>e.id===searchProvider)?.label || "Google").replace(" Search","")}</Text><Text style={{fontSize:10,color:muted}}>⌄</Text></Pressable>
        <TextInput accessibilityLabel="Address and web search" value={input} onChangeText={setInput} onSubmitEditing={()=>go()} returnKeyType="go" autoCapitalize="none" autoCorrect={false} placeholder="Search Google or enter address" placeholderTextColor={muted} style={[s.input,{color:fg}]}/>
        <Pressable accessibilityRole="button" accessibilityLabel="Go to website or search" onPress={()=>go()} style={s.go}><Text style={{color:"white",fontWeight:"700"}}>GO</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow}>
        <Pressable style={s.toolChip} onPress={()=>setShowPanel(showPanel==="globalai"?"none":"globalai")}><Text style={[s.quick,{color:"#a78bfa"}]}>✦ AI Hub</Text></Pressable>
        <Pressable style={s.toolChip} onPress={addBookmark}><Text style={[s.quick,{color:fg}]}>☆ Save</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>setShowPanel("history")}><Text style={[s.quick,{color:fg}]}>◷ History</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>setShowPanel("find")}><Text style={[s.quick,{color:fg}]}>⌕ Find</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>Linking.openURL("https://translate.google.com/translate?sl=auto&tl=en&u="+encodeURIComponent(current.url)).catch(()=>{})}><Text style={[s.quick,{color:fg}]}>文 Translate</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>{const id=Date.now();if(tabs.length<20){setTabs(old=>[...old,{...current,id}]);setActive(id);setInput(current.url);}else setShowPanel("tabs");}}><Text style={[s.quick,{color:fg}]}>▣ Duplicate</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>changeZoom(-10)}><Text style={[s.quick,{color:fg}]}>− Zoom</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>changeZoom(10)}><Text style={[s.quick,{color:fg}]}>＋ Zoom {zoomLevel}%</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>setShowPanel("downloads")}><Text style={[s.quick,{color:fg}]}>↓ Downloads</Text></Pressable>
        <Pressable style={s.toolChip} onPress={shareCurrent}><Text style={[s.quick,{color:fg}]}>↗ Share</Text></Pressable>
        <Pressable style={s.toolChip} onPress={()=>setShowPanel("settings")}><Text style={[s.quick,{color:"#a78bfa"}]}>⚙ Settings</Text></Pressable>
      </ScrollView>
    </View>
    {showPanel!=="none" ? <View style={[s.panel,showPanel==="menu"?s.drawerPanel:s.fullPage,{backgroundColor:panel,borderColor:dark?"#29344e":"#e0e5ef"}]}>
      <View style={s.panelHeader}><Text style={[s.panelTitle,{color:fg}]}>{showPanel==="bookmarks"?"Bookmarks":showPanel==="history"?"History":showPanel==="engines"?"Available engines":showPanel==="globalai"?"Global AI":showPanel==="bookmarks"?"Bookmarks":showPanel==="history"?"History":showPanel==="tabs"?"Tabs":showPanel==="find"?"Find in page":showPanel==="downloads"?"Downloads":"Browser settings"}</Text><Pressable onPress={()=>setShowPanel("none")}><Text style={{color:muted,fontSize:20}}>×</Text></Pressable></View>
      {showPanel==="bookmarks" ? <Pressable style={[s.item,{backgroundColor:bg}]} onPress={()=>setBookmarks(old=>old.filter(x=>x.url!==current.url))}><Text style={[s.itemTitle,{color:fg}]}>Remove current page from bookmarks</Text></Pressable> : null}
      {showPanel==="history" && history.length>0 ? <Pressable style={[s.item,{backgroundColor:bg}]} onPress={()=>setHistory([])}><Text style={[s.itemTitle,{color:fg}]}>Clear all history</Text></Pressable> : null}
      {showPanel==="tabs" && tabs.length>1 ? <Pressable style={[s.item,{backgroundColor:bg}]} onPress={()=>{setTabs([current]);setActive(current.id);setInput(current.url);}}><Text style={[s.itemTitle,{color:fg}]}>Close all other tabs</Text><Text style={[s.note,{color:muted}]}>Keep the current tab open</Text></Pressable> : null}
      {showPanel==="find" ? <View><Text style={[s.note,{color:muted}]}>Find text on the current page</Text><View style={[s.address,{backgroundColor:bg,borderColor:dark?"#29344e":"#e0e5ef",marginTop:12}]}><TextInput value={findText} onChangeText={setFindText} onSubmitEditing={()=>findInPage()} placeholder="Find in page" placeholderTextColor={muted} style={[s.input,{color:fg}]} returnKeyType="search"/><Pressable onPress={()=>findInPage()} style={s.go}><Text style={{color:"white",fontWeight:"700"}}>Find</Text></Pressable></View><Text style={[s.note,{color:muted,marginTop:8}]}>{findText.trim()?`Matches found: ${findCount}. Use Next match to move through the page.`:"Enter a word or phrase"}</Text><Pressable style={s.item} onPress={()=>{web.current?.injectJavaScript("window.find("+JSON.stringify(findText)+",false,false,true); true;");}}><Text style={[s.itemTitle,{color:fg}]}>Next match</Text></Pressable></View> : showPanel==="downloads" ? <View><Text style={[s.note,{color:muted}]}>Downloads opened by Orbit are tracked here when the WebView exposes a download URL. The actual file handling depends on Android/iOS permissions and platform support.</Text>{downloads.length===0?<Text style={[s.note,{color:muted,marginTop:12}]}>No downloads recorded in this session.</Text>:downloads.map((d,i)=><Pressable key={d.url+i} style={s.item} onPress={()=>Linking.openURL(d.url)}><Text numberOfLines={2} style={[s.itemTitle,{color:fg}]}>{d.url}</Text><Text style={[s.note,{color:muted}]}>{new Date(d.date).toLocaleString()}</Text></Pressable>)}</View> : showPanel==="tabs" ? <View style={s.aiModes}>{tabs.map(t=><View key={t.id} style={[s.item,{backgroundColor:t.id===active?"#6558f522":bg}]}><View style={{flexDirection:"row",alignItems:"center",gap:8}}><Pressable style={{flex:1}} onPress={()=>{setActive(t.id);setInput(t.url);setShowPanel("none")}}><Text numberOfLines={1} style={[s.itemTitle,{color:fg}]}>{t.title==="New tab"?"New tab":t.title.replace("https://","").replace("http://","").slice(0,36)}</Text><Text numberOfLines={1} style={[s.note,{color:muted}]}>{t.url}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Close tab" onPress={()=>closeTab(t.id)} style={{paddingHorizontal:10,paddingVertical:7,borderRadius:8,backgroundColor:"#ef444422"}}><Text style={{color:"#ef4444",fontWeight:"800"}}>×</Text></Pressable></View></View>)}</View> : showPanel==="menu" ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.menuList}>{[{icon:"⌂",label:"Home",detail:"Open your start page",action:()=>{setShowPanel("none");go(HOME)}},{icon:"☆",label:"Bookmarks",detail:"Your saved pages",action:()=>setShowPanel("bookmarks")},{icon:"◷",label:"History",detail:"Recently visited pages",action:()=>setShowPanel("history")},{icon:"↓",label:"Downloads",detail:"Downloaded links",action:()=>setShowPanel("downloads")},{icon:"⌕",label:"Find in page",detail:"Search this website",action:()=>setShowPanel("find")},{icon:"▤",label:"Reader mode",detail:readerMode?"On":"Off",action:()=>{setReaderMode(v=>!v);setShowPanel("none")}},{icon:"↶",label:"Reopen closed tab",detail:lastClosedTab?"Restore your last closed tab":"No recently closed tab",action:()=>{if(lastClosedTab){const restored={...lastClosedTab,id:Date.now()};setTabs(old=>old.length<20?[...old,restored]:old);setActive(restored.id);setInput(restored.url);setShowPanel("none");}}},{icon:"▣",label:"Duplicate current tab",detail:"Open a copy in a new tab",action:()=>{if(tabs.length<20){const id=Date.now();setTabs(old=>[...old,{...current,id}]);setActive(id);setInput(current.url);setShowPanel("none");}}},{icon:"⌫",label:"Clear download list",detail:"Remove download entries",action:()=>{setDownloads([]);setShowPanel("downloads");}},{icon:"↗",label:"Share current page",detail:"Send this link to another app",action:()=>{setShowPanel("none");shareCurrent()}},{icon:"▣",label:"Desktop site",detail:desktopSite?"On":"Off",action:()=>{setDesktopSite(v=>!v);setShowPanel("none")}},{icon:"⌕",label:"Search providers",detail:"Choose your default search engine",action:()=>setShowPanel("engines")},{icon:"✦",label:"Global AI",detail:"Search, chat and research",action:()=>setShowPanel("globalai")},{icon:"⚙",label:"Settings",detail:"Appearance, privacy and browser options",action:()=>setShowPanel("settings")}].map(item=><Pressable key={item.label} onPress={item.action} style={[s.menuItem,{backgroundColor:bg,borderColor:dark?"#29344e":"#e0e5ef"}]}><View style={[s.menuIcon,{backgroundColor:dark?"#6558f522":"#6558f510"}]}><Text style={{color:"#a78bfa",fontSize:19,fontWeight:"700"}}>{item.icon}</Text></View><View style={{flex:1}}><Text style={[s.itemTitle,{color:fg}]}>{item.label}</Text><Text style={[s.note,{color:muted,marginTop:2}]}>{item.detail}</Text></View><Text style={{color:muted,fontSize:22}}>›</Text></Pressable>)}</ScrollView> : showPanel==="globalai" ? <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[s.note,{color:muted}]}>One hub for multi-engine search, AI model routing, and browser tools. Live provider access requires configured integrations; this panel does not claim 80+ providers are already connected.</Text>
        <View style={s.aiModes}>
          {([{id:"all",label:"All-in-one"},{id:"search",label:"Search"},{id:"models",label:"AI models"},{id:"tools",label:"Browser tools"}] as const).map(m=><Pressable key={m.id} onPress={()=>setAiMode(m.id)} style={[s.aiMode,{backgroundColor:aiMode===m.id?"#6558f5":bg}]}><Text style={{color:aiMode===m.id?"white":fg,fontSize:11,fontWeight:"700"}}>{m.label}</Text></Pressable>)}
        </View>
        <View style={[s.address,{backgroundColor:bg,borderColor:dark?"#29344e":"#e0e5ef",marginTop:12}]}><TextInput value={aiQuery} onChangeText={setAiQuery} onSubmitEditing={runGlobalSearch} placeholder="Ask Global AI or search the web…" placeholderTextColor={muted} style={[s.input,{color:fg}]} returnKeyType="search"/></View><Text style={[s.note,{color:muted,marginTop:10}]}>Global AI backend URL (set up your server first)</Text><View style={[s.address,{backgroundColor:bg,borderColor:dark?"#29344e":"#e0e5ef",marginTop:6}]}><TextInput value={aiEndpoint} onChangeText={setAiEndpoint} autoCapitalize="none" autoCorrect={false} placeholder="https://your-global-ai-server" placeholderTextColor={muted} style={[s.input,{color:fg}]} keyboardType="url"/></View><View style={s.aiModes}><Pressable accessibilityRole="button" onPress={runGlobalSearch} style={[s.aiMode,{backgroundColor:"#6558f5"}]}><Text style={{color:"white",fontWeight:"700"}}>{aiBusy?"Please wait…":"Search via Global AI"}</Text></Pressable><Pressable accessibilityRole="button" onPress={askGlobalAI} style={[s.aiMode,{backgroundColor:bg}]}><Text style={{color:fg,fontWeight:"700"}}>Ask AI</Text></Pressable><Pressable accessibilityRole="button" onPress={researchGlobalAI} style={[s.aiMode,{backgroundColor:bg}]}><Text style={{color:fg,fontWeight:"700"}}>Research + Sources</Text></Pressable></View>{aiResult ? <View style={s.item}><Text selectable style={[s.note,{color:fg}]}>{aiResult}</Text></View> : null}
        {aiMode==="all" || aiMode==="search" ? <View style={s.item}><Text style={[s.itemTitle,{color:fg}]}>Quick search</Text><View style={s.aiModes}>{SEARCH_ENGINES.slice(0,12).map(engine=><Pressable key={engine.id} accessibilityRole="button" onPress={()=>{setSearchProvider(engine.id);const q=aiQuery.trim()||input;go(q,engine.id);}} style={[s.aiMode,{backgroundColor:searchProvider===engine.id?"#6558f5":bg}]}><Text style={{color:searchProvider===engine.id?"white":fg,fontSize:11,fontWeight:"700"}}>{engine.label}</Text></Pressable>)}</View><Text style={[s.itemTitle,{color:fg,marginTop:12}]}>Multi-engine search</Text><Text style={[s.note,{color:muted}]}>Search providers can be routed through a self-hosted SearXNG gateway, which supports many upstream engines. Live engine availability depends on server configuration and upstream limits.</Text><Pressable onPress={()=>{const q=aiQuery.trim()||input;go("https://www.google.com/search?q="+encodeURIComponent(q));}}><Text style={[s.quick,{color:"#a78bfa",marginTop:8}]}>Search the web ↗</Text></Pressable><Pressable onPress={()=>Linking.openURL("https://github.com/searxng/searxng")}><Text style={[s.quick,{color:fg,marginTop:8}]}>SearXNG integration project ↗</Text></Pressable></View>:null}
        {aiMode==="all" || aiMode==="models" ? <View style={s.item}><Text style={[s.itemTitle,{color:fg}]}>AI model router</Text><Text style={[s.note,{color:muted}]}>Planned: choose an available model by task through configured provider APIs. No model API keys or model provider is connected by this UI yet.</Text><Pressable onPress={()=>Linking.openURL("https://models.dev/")}><Text style={[s.quick,{color:"#a78bfa",marginTop:8}]}>Explore model catalog ↗</Text></Pressable></View>:null}
        {aiMode==="all" || aiMode==="tools" ? <View style={s.item}><Text style={[s.itemTitle,{color:fg}]}>Browser automation tools</Text><Text style={[s.note,{color:muted}]}>Planned: page reading, summarization, controlled navigation, and Playwright-based testing. Sensitive actions should require user approval.</Text><Pressable onPress={()=>Linking.openURL("https://playwright.dev/")}><Text style={[s.quick,{color:"#a78bfa",marginTop:8}]}>Playwright documentation ↗</Text></Pressable></View>:null}
        <View style={s.item}><Text style={[s.itemTitle,{color:fg}]}>Privacy & safety</Text><Text style={[s.note,{color:muted}]}>Do not enter passwords, payment details, or private data into an untrusted AI provider. Provider requests will need clear privacy controls before live AI connections are enabled.</Text></View>
        <View style={s.item}><Text style={[s.itemTitle,{color:fg}]}>Connection status</Text><Text style={[s.note,{color:muted}]}>Prototype hub • web search shortcut works • model routing and browser automation still need backend integration and testing.</Text></View>
      </ScrollView> : showPanel==="settings" ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:28}}><View style={[s.item,{paddingTop:8}]}><Text style={[s.itemTitle,{color:fg,fontSize:16}]}>Orbit Browser</Text><Text style={[s.note,{color:muted,marginTop:4}]}>Privacy, appearance and browsing preferences</Text></View>
        <Text style={[s.note,{color:muted}]}>{updateStatus}</Text>
        <Text style={[s.note,{color:muted,marginTop:10}]}>Up to 20 tabs per session. Bookmarks and history are saved on this device.</Text>
        <Pressable style={s.item} onPress={()=>{setDesktopSite(v=>!v);setTimeout(()=>web.current?.reload(),100)}}><Text style={[s.itemTitle,{color:fg}]}>Desktop site: {desktopSite?"On":"Off"}</Text><Text style={[s.note,{color:muted}]}>Reload pages with a desktop browser user agent where supported.</Text></Pressable>
        <Pressable style={s.item} onPress={()=>{setReaderMode(v=>!v);web.current?.injectJavaScript(`(function(){var id="orbit-reader-style";var old=document.getElementById(id);if(old){old.remove();}else{var s=document.createElement("style");s.id=id;s.textContent="body{max-width:760px!important;margin:24px auto!important;padding:24px!important;font-size:19px!important;line-height:1.8!important;background:#fff!important;color:#222!important}img,video,iframe{max-width:100%!important;height:auto!important}";document.head.appendChild(s)}return true})();true;`)}}><Text style={[s.itemTitle,{color:fg}]}>Reader mode: {readerMode?"On":"Off"}</Text><Text style={[s.note,{color:muted}]}>Applies a readable text layout where page scripts allow it; not a full article extraction reader.</Text></Pressable>
        <Pressable style={s.item} onPress={()=>setShowPanel("downloads")}><Text style={[s.itemTitle,{color:fg}]}>Downloads</Text><Text style={[s.note,{color:muted}]}>View download links detected in this session.</Text></Pressable>
        <Pressable style={s.item} onPress={()=>Linking.openURL(updateUrl)}><Text style={[s.itemTitle,{color:fg}]}>Open platform downloads ↗</Text><Text style={[s.note,{color:muted}]}>Orbit checks GitHub releases when the app starts. Installation may still require your OS or app store approval.</Text></Pressable>
        <Pressable style={s.item} onPress={()=>{setUpdateStatus("Checking for updates…"); Linking.openURL("https://github.com/mb2638512-a11y/Orbit_brower/actions")}}><Text style={[s.itemTitle,{color:fg}]}>Build status and updates</Text></Pressable>
      </ScrollView> : showPanel==="engines" ? <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"><Text style={[s.note,{color:muted,marginBottom:8}]}>Choose from {SEARCH_ENGINES.length} search providers. Orbit opens the provider results page; availability and login requirements vary.</Text><View style={s.aiModes}>{SEARCH_ENGINES.map(p=><Pressable key={p.id} onPress={()=>{setSearchProvider(p.id);const q=input.trim();const looksLikeAddress=q.includes(".")&&!q.includes(" ");if(q&&!q.includes("://")&&!looksLikeAddress){go(q,p.id)}else{go(p.url.replace(/\{query\}/g,""),p.id)}}} style={[s.aiMode,{backgroundColor:searchProvider===p.id?"#6558f5":bg}]}><Text style={{color:searchProvider===p.id?"white":fg,fontSize:11,fontWeight:"700"}}>{p.label}{searchProvider===p.id?" ✓":""}</Text></Pressable>)}</View></ScrollView> : showPanel==="bookmarks" || showPanel==="history" ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:24}}>{(showPanel==="bookmarks"?bookmarks:history).length===0 ? <Text style={[s.note,{color:muted}]}>Nothing saved yet.</Text> : (showPanel==="bookmarks"?bookmarks:history).map((item,i)=><Pressable key={item.url+i} onPress={()=>go(item.url)} style={[s.item,{borderBottomColor:dark?"#29344e":"#e0e5ef"}]}><Text numberOfLines={1} style={[s.itemTitle,{color:fg}]}>{item.title||item.url}</Text><Text numberOfLines={2} style={[s.note,{color:muted}]}>{item.url}</Text></Pressable>)}</ScrollView> : <>
        <Pressable style={s.item} onPress={()=>setDark(v=>!v)}><Text style={[s.itemTitle,{color:fg}]}>Appearance: {dark?"Dark":"Light"}</Text><Text style={[s.note,{color:muted}]}>Switch between a dark and light browser theme</Text></Pressable>
        <View style={s.item}><Text style={[s.itemTitle,{color:fg}]}>Default search provider</Text><Text style={[s.note,{color:muted}]}>Used when you type words instead of a website address</Text><View style={s.aiModes}>{SEARCH_ENGINES.map(p=><Pressable key={p.id} onPress={()=>setSearchProvider(p.id)} style={[s.aiMode,{backgroundColor:searchProvider===p.id?"#6558f5":bg}]}><Text style={{color:searchProvider===p.id?"white":fg,fontSize:11,fontWeight:"700"}}>{p.label}{searchProvider===p.id?" ✓":""}</Text></Pressable>)}</View></View>
        <Pressable style={s.item} onPress={()=>setPrivateMode(v=>!v)}><Text style={[s.itemTitle,{color:fg}]}>Private mode: {privateMode?"On":"Off"}</Text><Text style={[s.note,{color:muted}]}>Stops Orbit's in-memory history list from recording new visits. Websites and OS-level logging may still retain data.</Text></Pressable>
        <Pressable style={s.item} onPress={()=>setShowPanel("settings")}><Text style={[s.itemTitle,{color:fg}]}>Updates & downloads</Text><Text style={[s.note,{color:muted}]}>{updateStatus}</Text></Pressable>
        <Pressable style={s.item} onPress={()=>{setHistory([]);setShowPanel("history");}}><Text style={[s.itemTitle,{color:fg}]}>Clear Orbit history</Text><Text style={[s.note,{color:muted}]}>Removes saved Orbit visit history from this device</Text></Pressable>
        <Pressable style={s.item} onPress={()=>{setBookmarks([]);setHistory([]);web.current?.clearCache(true);setDownloadsHelp("Orbit bookmarks, history, and cached WebView files were cleared where supported.");}}><Text style={[s.itemTitle,{color:fg}]}>Clear browsing data</Text><Text style={[s.note,{color:muted}]}>Clears saved bookmarks, history and WebView cache. It does not erase website/server logs or downloaded files.</Text></Pressable>
        {downloadsHelp ? <Text style={[s.note,{color:muted}]}>{downloadsHelp}</Text> : null}
        <Pressable style={s.item} onPress={()=>{const id=Date.now();setTabs([{id,title:"New tab",url:HOME}]);setActive(id);setInput(HOME);setShowPanel("none");}}><Text style={[s.itemTitle,{color:fg}]}>Reset tabs</Text><Text style={[s.note,{color:muted}]}>Close current tabs and start fresh</Text></Pressable>
      </>}
    </View> : <View style={s.webWrap}><WebView key={active} ref={web} incognito={privateMode} cacheEnabled={!privateMode} source={{uri:current.url}} onFileDownload={event=>{const url=event.nativeEvent.downloadUrl;if(url){setDownloads(old=>[{url,date:Date.now()},...old].slice(0,50));Linking.openURL(url).catch(()=>{});}}} onMessage={event=>{try{const data=JSON.parse(event.nativeEvent.data);if(data.type==="find")setFindCount(Number(data.count)||0)}catch{}}} onNavigationStateChange={e=>{setCanGoBack(e.canGoBack);setCanGoForward(e.canGoForward);updateCurrent({url:e.url,title:e.title||e.url});setInput(e.url)}} onLoadStart={()=>setLoading(true)} onLoadEnd={()=>{setLoading(false);web.current?.injectJavaScript(`(function(){document.documentElement.style.zoom="${zoomLevel}%";document.body.style.zoom="${zoomLevel}%";return true})();true;`)}} userAgent={desktopSite ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" : undefined} javaScriptEnabled domStorageEnabled sharedCookiesEnabled startInLoadingState style={{flex:1,backgroundColor:bg}} /></View>}
    <View style={[s.bottom,{backgroundColor:panel,borderColor:dark?"#29344e":"#e0e5ef"}]}>
      {navButton("Back",()=>web.current?.goBack(),"‹",!canGoBack)}
      {navButton("Forward",()=>web.current?.goForward(),"›",!canGoForward)}
      {navButton("Home",()=>go(HOME),"⌂")}
      {navButton(loading?"Loading":"Reload",()=>web.current?.reload(),loading?"◌":"↻")}
      {navButton("Saved",()=>setShowPanel(showPanel==="bookmarks"?"none":"bookmarks"),"☆")}
      {navButton("Tabs",()=>setShowPanel(showPanel==="tabs"?"none":"tabs"),String(tabs.length))}
    </View>
    <Text style={[s.footer,{color:muted}]}>Hold a tab to close it • {tabs.length} tab{tabs.length===1?"":"s"} • {privateMode?"Private mode":"Standard mode"}</Text>
  </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1},top:{paddingHorizontal:14,paddingTop:6,paddingBottom:8,gap:10},
 brandRow:{flexDirection:"row",alignItems:"center",gap:10},globeLogo:{width:40,height:40,borderRadius:14,backgroundColor:"#102b4b",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#59c9ed",overflow:"hidden"},globeLatitude:{position:"absolute",width:27,height:12,borderWidth:1.5,borderColor:"#8be3ff",borderRadius:20},globeMeridian:{position:"absolute",width:14,height:28,borderWidth:1.5,borderColor:"#8be3ff",borderRadius:20},globeHorizon:{position:"absolute",width:31,height:2,backgroundColor:"#f5d58b",top:21,transform:[{rotate:"-18deg"}]},globeStar:{position:"absolute",width:5,height:5,borderRadius:3,backgroundColor:"#ffe8a8",top:7,right:7},brand:{fontSize:17,fontWeight:"900",letterSpacing:2},sub:{fontSize:8,letterSpacing:1.2,marginTop:2},square:{width:38,height:38,borderRadius:12,alignItems:"center",justifyContent:"center"},
 tabs:{gap:7,paddingVertical:1},engineChips:{gap:7,paddingVertical:2},engineChip:{borderWidth:1,borderRadius:10,paddingHorizontal:11,paddingVertical:8},tab:{minHeight:34,borderWidth:1,borderRadius:11,paddingHorizontal:10,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
 address:{height:49,borderWidth:1,borderRadius:15,paddingLeft:5,paddingRight:5,flexDirection:"row",alignItems:"center",gap:6},enginePicker:{minHeight:36,borderWidth:1,borderRadius:10,paddingHorizontal:8,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:4},input:{flex:1,minWidth:0,fontSize:13,height:"100%"},go:{backgroundColor:"#6558f5",paddingHorizontal:14,paddingVertical:10,borderRadius:11},
 quickRow:{flexDirection:"row",alignItems:"center",gap:7,paddingRight:6},toolChip:{paddingHorizontal:10,paddingVertical:8,borderRadius:10,backgroundColor:"#64748b18",borderWidth:1,borderColor:"#64748b30"},engine:{fontSize:10,flex:1},quick:{fontSize:11,fontWeight:"700"}, aiModes:{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:12}, aiMode:{paddingHorizontal:10,paddingVertical:9,borderRadius:10},
 webWrap:{flex:1,overflow:"hidden"},bottom:{minHeight:60,borderTopWidth:1,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingHorizontal:1,paddingBottom:2},nav:{alignItems:"center",justifyContent:"center",minWidth:48,paddingHorizontal:2,paddingVertical:4,borderRadius:10},navIcon:{fontSize:23,lineHeight:26},navLabel:{fontSize:9,fontWeight:"600"},
 panel:{flex:1,position:"absolute",top:0,bottom:0,zIndex:20,elevation:18,marginHorizontal:0,marginBottom:0,borderWidth:1,borderRadius:0,paddingHorizontal:16,paddingTop:10,paddingBottom:16},drawerPanel:{left:0,width:340,maxWidth:"90%"},fullPage:{left:0,right:0,width:"100%",maxWidth:"100%"},panelHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12,minHeight:38},panelTitle:{fontSize:20,fontWeight:"800",letterSpacing:-0.4},menuList:{paddingBottom:24,gap:8},menuItem:{minHeight:68,paddingHorizontal:12,paddingVertical:10,borderWidth:1,borderRadius:14,flexDirection:"row",alignItems:"center",gap:12},menuIcon:{width:42,height:42,borderRadius:13,alignItems:"center",justifyContent:"center"},note:{fontSize:13,lineHeight:19},item:{paddingVertical:14,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:"#64748b44"},itemTitle:{fontSize:15,fontWeight:"700"},footer:{textAlign:"center",fontSize:9,paddingVertical:3}
});
